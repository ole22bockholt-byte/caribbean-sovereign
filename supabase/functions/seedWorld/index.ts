import { handleOptions, jsonResponse } from "../_shared/cors.ts";
import { getUser, isAdmin, serviceClient } from "../_shared/supabase.ts";

// Initialisiert die Spielwelt: Fraktionen, Waren, KI-Nationen, Häfen,
// Fraktionseinfluss je Hafen und Startmarktpreise.
// Idempotent: per upsert auf die jeweiligen code-Spalten -> mehrfacher Aufruf ist sicher.
// Nur Admins dürfen die Welt seeden.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleOptions();
  try {
    const user = await getUser(req);
    if (!user) return jsonResponse({ error: "Unauthorized" }, { status: 401 });
    if (!isAdmin(user)) return jsonResponse({ error: "Forbidden" }, { status: 403 });

    const supabase = serviceClient();

    // -------------------------------------------------------------------------
    // 1) FRAKTIONEN
    // -------------------------------------------------------------------------
    const factions = [
      { code: "gb", name: "Großbritannien", color: "#c8102e" },
      { code: "es", name: "Spanien", color: "#f1bf00" },
      { code: "fr", name: "Frankreich", color: "#0055a4" },
      { code: "nl", name: "Niederlande", color: "#ff7900" },
      { code: "pirate", name: "Piraten", color: "#2b2b2b" },
      { code: "neutral", name: "Neutral", color: "#8a8a8a" },
    ];
    const { error: facErr } = await supabase.from("factions").upsert(factions, { onConflict: "code" });
    if (facErr) throw new Error("Fraktionen: " + facErr.message);

    const { data: facRows, error: facReadErr } = await supabase.from("factions").select("id, code");
    if (facReadErr) throw new Error("Fraktionen lesen: " + facReadErr.message);
    const facId: Record<string, string> = Object.fromEntries(facRows!.map((f) => [f.code, f.id]));

    // -------------------------------------------------------------------------
    // 2) WAREN — weight_tons = Gewicht je Einheit in Tonnen (physischer Laderaum).
    // -------------------------------------------------------------------------
    const goods = [
      { code: "rum", name: "Rum", base_price: 40, weight_tons: 1.0 },
      { code: "sugar", name: "Zucker", base_price: 25, weight_tons: 1.0 },
      { code: "tobacco", name: "Tabak", base_price: 35, weight_tons: 0.8 },
      { code: "cotton", name: "Baumwolle", base_price: 30, weight_tons: 0.6 },
      { code: "spices", name: "Gewürze", base_price: 60, weight_tons: 0.3 },
      { code: "powder", name: "Schießpulver", base_price: 80, weight_tons: 1.2 },
      { code: "timber", name: "Bauholz", base_price: 20, weight_tons: 1.5 },
      { code: "coffee", name: "Kaffee", base_price: 45, weight_tons: 0.7 },
    ];
    const { error: goodsErr } = await supabase.from("goods").upsert(goods, { onConflict: "code" });
    if (goodsErr) throw new Error("Waren: " + goodsErr.message);

    const { data: goodRows, error: goodReadErr } = await supabase.from("goods").select("id, code, base_price");
    if (goodReadErr) throw new Error("Waren lesen: " + goodReadErr.message);

    // -------------------------------------------------------------------------
    // 3) KI-NATIONEN (als Akteure) — eine je Großmacht
    // -------------------------------------------------------------------------
    const nations = [
      { name: "Krone Großbritanniens", faction: "gb", gold: 500000 },
      { name: "Spanische Krone", faction: "es", gold: 500000 },
      { name: "Königreich Frankreich", faction: "fr", gold: 450000 },
      { name: "Niederländische Kompanie", faction: "nl", gold: 400000 },
      { name: "Bruderschaft der Küste", faction: "pirate", gold: 200000 },
    ];
    const { data: existingNations, error: exNatErr } = await supabase
      .from("actors")
      .select("display_name")
      .eq("kind", "ai_nation");
    if (exNatErr) throw new Error("Akteure prüfen: " + exNatErr.message);
    const existingNames = new Set((existingNations ?? []).map((a) => a.display_name));
    const missingNations = nations.filter((n) => !existingNames.has(n.name));
    if (missingNations.length > 0) {
      const { error: natErr } = await supabase
        .from("actors")
        .insert(missingNations.map((n) => ({ kind: "ai_nation", display_name: n.name, gold: n.gold })));
      if (natErr) throw new Error("KI-Nationen: " + natErr.message);
    }

    const { data: actorRows, error: actorReadErr } = await supabase
      .from("actors")
      .select("id, display_name")
      .eq("kind", "ai_nation");
    if (actorReadErr) throw new Error("Akteure lesen: " + actorReadErr.message);

    // -------------------------------------------------------------------------
    // 4) HÄFEN — historische Karibik-Häfen um 1765 mit kontrollierender Fraktion
    //    und realistischer Kartenposition (x/y = 0..100, deckungsgleich zu den
    //    Landmassen in src/lib/mapGeography.js). Vgl. Migration 0006_historic_ports.
    // -------------------------------------------------------------------------
    const ports = [
      { code: "port_royal", name: "Port Royal", x: 42, y: 45.5, faction: "gb", status: "fort" },
      { code: "kingston", name: "Kingston", x: 44.5, y: 46.5, faction: "gb", status: "controllable" },
      { code: "havana", name: "Havanna", x: 24, y: 20, faction: "es", status: "fort" },
      { code: "santiago", name: "Santiago de Cuba", x: 47, y: 34.5, faction: "es", status: "controllable" },
      { code: "cartagena", name: "Cartagena", x: 40, y: 82, faction: "es", status: "fort" },
      { code: "tortuga", name: "Tortuga", x: 54.5, y: 32.4, faction: "pirate", status: "controllable" },
      { code: "petit_goave", name: "Petit-Goâve", x: 51.5, y: 45, faction: "fr", status: "controllable" },
      { code: "willemstad", name: "Willemstad", x: 60.5, y: 73.5, faction: "nl", status: "controllable" },
      { code: "nassau", name: "Nassau", x: 60, y: 11, faction: "neutral", status: "neutral_zone" },
      { code: "cap_francais", name: "Cap-Français", x: 53, y: 34.6, faction: "fr", status: "fort" },
      { code: "san_juan", name: "San Juan", x: 77, y: 39.3, faction: "es", status: "fort" },
      { code: "santo_domingo", name: "Santo Domingo", x: 64, y: 45.5, faction: "es", status: "controllable" },
      { code: "bridgetown", name: "Bridgetown", x: 94, y: 63, faction: "gb", status: "controllable" },
      { code: "fort_royal", name: "Fort-Royal", x: 89.5, y: 58, faction: "fr", status: "fort" },
      { code: "basse_terre", name: "Basse-Terre", x: 88, y: 51.5, faction: "fr", status: "controllable" },
      { code: "oranjestad", name: "Oranjestad", x: 86, y: 45.8, faction: "nl", status: "controllable" },
      { code: "portobelo", name: "Portobelo", x: 24, y: 79, faction: "es", status: "fort" },
      { code: "port_of_spain", name: "Port of Spain", x: 88, y: 76, faction: "es", status: "controllable" },
      { code: "campeche", name: "Campeche", x: 9.5, y: 25, faction: "es", status: "controllable" },
    ];
    const { error: portErr } = await supabase.from("ports").upsert(
      ports.map((p) => ({
        code: p.code,
        name: p.name,
        x: p.x,
        y: p.y,
        status: p.status,
        security: p.status === "fort" ? 75 : p.status === "neutral_zone" ? 30 : 55,
        controlling_faction: facId[p.faction],
      })),
      { onConflict: "code" },
    );
    if (portErr) throw new Error("Häfen: " + portErr.message);

    const { data: portRows, error: portReadErr } = await supabase.from("ports").select("id, code");
    if (portReadErr) throw new Error("Häfen lesen: " + portReadErr.message);

    // -------------------------------------------------------------------------
    // 5) FRAKTIONSEINFLUSS je Hafen — kontrollierende Fraktion dominiert.
    // -------------------------------------------------------------------------
    const influenceRows = [];
    for (const p of ports) {
      const portId = portRows!.find((r) => r.code === p.code)!.id;
      influenceRows.push({ port_id: portId, faction_id: facId[p.faction], influence: 70 });
    }
    const { error: infErr } = await supabase
      .from("port_faction_influence")
      .upsert(influenceRows, { onConflict: "port_id,faction_id" });
    if (infErr) throw new Error("Fraktionseinfluss: " + infErr.message);

    // -------------------------------------------------------------------------
    // 6) MARKTPREISE — Startpreis je Hafen/Gut = base_price +/- 15% Streuung.
    // -------------------------------------------------------------------------
    const priceRows = [];
    for (const port of portRows!) {
      for (const good of goodRows!) {
        const variance = 0.85 + Math.random() * 0.3; // 0.85 .. 1.15
        priceRows.push({
          port_id: port.id,
          good_id: good.id,
          price: Math.round(good.base_price * variance),
          trend: 0,
        });
      }
    }
    const { error: priceErr } = await supabase
      .from("market_prices")
      .upsert(priceRows, { onConflict: "port_id,good_id" });
    if (priceErr) throw new Error("Marktpreise: " + priceErr.message);

    return jsonResponse({
      seeded: true,
      counts: {
        factions: factions.length,
        goods: goods.length,
        ai_nations: actorRows!.length,
        ports: portRows!.length,
        port_influence: influenceRows.length,
        market_prices: priceRows.length,
      },
    });
  } catch (error) {
    return jsonResponse({ error: (error as Error).message }, { status: 500 });
  }
});
