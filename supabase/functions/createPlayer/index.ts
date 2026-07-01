import { handleOptions, jsonResponse } from "../_shared/cors.ts";
import { getUser, serviceClient } from "../_shared/supabase.ts";

// Onboarding: erstellt den Spieler-Akteur (einmalig je App-User), schreibt
// Metadaten (Fraktion, Kompaniename, Starthafen) und baut ein Startschiff (Sloop)
// im gewählten Hafen. Startgold ist variabel über STARTING_GOLD steuerbar.
// Idempotent: existiert bereits ein Akteur für diesen User, wird nichts erneut erstellt.
const STARTING_GOLD = 25000;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleOptions();
  try {
    const user = await getUser(req);
    if (!user) return jsonResponse({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const factionCode = body.faction_code;
    const homePortCode = body.home_port_code;
    const fullName = user.user_metadata?.full_name || user.email || "Kapitän";
    const companyName = (body.company_name || "").trim() || `${fullName}s Kompanie`;

    if (!factionCode || !homePortCode) {
      return jsonResponse({ error: "Fraktion und Starthafen sind erforderlich." }, { status: 400 });
    }

    const supabase = serviceClient();

    const existingRes = await supabase
      .from("actors")
      .select("id")
      .eq("app_user_id", user.id)
      .maybeSingle();
    if (existingRes.error) throw new Error("Spielerprüfung: " + existingRes.error.message);
    if (existingRes.data) {
      return jsonResponse({ created: false, already: true, actor_id: existingRes.data.id });
    }

    const [facRes, portRes] = await Promise.all([
      supabase.from("factions").select("id, code").eq("code", factionCode).maybeSingle(),
      supabase.from("ports").select("id, code, name").eq("code", homePortCode).maybeSingle(),
    ]);
    if (facRes.error) throw new Error("Fraktion: " + facRes.error.message);
    if (portRes.error) throw new Error("Hafen: " + portRes.error.message);
    if (!facRes.data) return jsonResponse({ error: "Unbekannte Fraktion." }, { status: 400 });
    if (!portRes.data) return jsonResponse({ error: "Unbekannter Hafen." }, { status: 400 });

    const actorRes = await supabase
      .from("actors")
      .insert({
        kind: "player",
        display_name: companyName,
        app_user_id: user.id,
        gold: STARTING_GOLD,
        influence: 0,
      })
      .select("id")
      .single();
    if (actorRes.error) throw new Error("Akteur anlegen: " + actorRes.error.message);
    const actorId = actorRes.data.id;

    const metaRes = await supabase.from("player_meta").insert({
      actor_id: actorId,
      faction_code: factionCode,
      company_name: companyName,
      home_port: portRes.data.id,
    });
    if (metaRes.error) throw new Error("Metadaten: " + metaRes.error.message);

    const shipRes = await supabase
      .from("ships")
      .insert({
        name: "Erste Hoffnung",
        ship_class: "sloop",
        owner_id: actorId,
        location_port: portRes.data.id,
        state: "docked",
        firepower: 8,
        hull: 60,
        hull_max: 60,
        crew: 30,
        crew_max: 30,
        cargo_capacity: 120,
      })
      .select("id")
      .single();
    if (shipRes.error) throw new Error("Schiff bauen: " + shipRes.error.message);

    return jsonResponse({
      created: true,
      actor_id: actorId,
      ship_id: shipRes.data.id,
      home_port: portRes.data.name,
      gold: STARTING_GOLD,
    });
  } catch (error) {
    return jsonResponse({ error: (error as Error).message }, { status: 500 });
  }
});
