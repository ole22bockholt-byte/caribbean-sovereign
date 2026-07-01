import { corsHeaders, handleOptions, jsonResponse } from "../_shared/cors.ts";
import { getUser, serviceClient } from "../_shared/supabase.ts";

// Lädt den kompletten Spielzustand für den aktuellen Spieler:
//   - Weltzustand (Datum, Tick)
//   - eigener Akteur (Gold, Einfluss, Fraktion) — oder needsOnboarding=true
//   - alle Häfen inkl. kontrollierender Fraktion, Sicherheit, Fraktionseinfluss
//   - Marktpreise je Hafen (mit Warennamen)
//   - Fraktionen & Waren (Stammdaten)
//   - eigene Schiffe
// Ein Aufruf liefert alles, was das Frontend zum Rendern braucht.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleOptions();
  try {
    const user = await getUser(req);
    if (!user) return jsonResponse({ error: "Unauthorized" }, { status: 401 });

    const supabase = serviceClient();

    // Stammdaten parallel laden
    const [worldRes, factionsRes, goodsRes, portsRes, influenceRes, pricesRes, playerRes] =
      await Promise.all([
        supabase.from("world_state").select("game_date, tick_number, last_tick_at").eq("id", true).single(),
        supabase.from("factions").select("id, code, name, color"),
        supabase.from("goods").select("id, code, name, base_price"),
        supabase.from("ports").select("id, code, name, x, y, status, security, controlling_faction"),
        supabase.from("port_faction_influence").select("port_id, faction_id, influence"),
        supabase.from("market_prices").select("port_id, good_id, price, trend"),
        supabase.from("actors").select("id, display_name, gold, influence, alliance_id").eq("app_user_id", user.id).maybeSingle(),
      ]);

    if (worldRes.error) throw new Error("Welt: " + worldRes.error.message);
    if (factionsRes.error) throw new Error("Fraktionen: " + factionsRes.error.message);
    if (goodsRes.error) throw new Error("Waren: " + goodsRes.error.message);
    if (portsRes.error) throw new Error("Häfen: " + portsRes.error.message);
    if (influenceRes.error) throw new Error("Einfluss: " + influenceRes.error.message);
    if (pricesRes.error) throw new Error("Preise: " + pricesRes.error.message);
    if (playerRes.error) throw new Error("Spieler: " + playerRes.error.message);

    const player = playerRes.data;

    let ships: unknown[] = [];
    let playerFactionCode: string | null = null;
    if (player) {
      const shipsRes = await supabase
        .from("ships")
        .select("id, name, ship_class, location_port, state, firepower, hull, hull_max, crew, crew_max, cargo_capacity")
        .eq("owner_id", player.id);
      if (shipsRes.error) throw new Error("Schiffe: " + shipsRes.error.message);
      ships = shipsRes.data ?? [];

      const metaRes = await supabase
        .from("player_meta")
        .select("faction_code, company_name, home_port")
        .eq("actor_id", player.id)
        .maybeSingle();
      if (!metaRes.error && metaRes.data) {
        playerFactionCode = metaRes.data.faction_code;
      }
    }

    return jsonResponse({
      needsOnboarding: !player,
      world: worldRes.data,
      factions: factionsRes.data ?? [],
      goods: goodsRes.data ?? [],
      ports: portsRes.data ?? [],
      influence: influenceRes.data ?? [],
      prices: pricesRes.data ?? [],
      player: player
        ? {
            id: player.id,
            display_name: player.display_name,
            gold: player.gold,
            influence: player.influence,
            faction_code: playerFactionCode,
            ships,
          }
        : null,
    });
  } catch (error) {
    return jsonResponse({ error: (error as Error).message }, { status: 500, headers: corsHeaders });
  }
});
