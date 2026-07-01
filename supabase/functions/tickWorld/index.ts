import { handleOptions, jsonResponse } from "../_shared/cors.ts";
import { getUser, isAdmin, serviceClient } from "../_shared/supabase.ts";

// Welt-Tick: rückt den globalen Weltzustand vor (Marktpreise, Spieldatum, Tick-Zähler).
// Wird per Automation (Scheduled, z. B. pg_cron oder GitHub-Actions-Cron) und/oder
// manuell durch einen Admin ausgelöst. Die eigentliche Logik läuft atomar als
// SQL-Funktion world_tick() (Migration 0003).
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleOptions();
  try {
    const user = await getUser(req);
    if (!user) return jsonResponse({ error: "Unauthorized" }, { status: 401 });
    if (!isAdmin(user)) return jsonResponse({ error: "Forbidden" }, { status: 403 });

    const supabase = serviceClient();
    const { data, error } = await supabase.rpc("world_tick");
    if (error) throw new Error(error.message);

    const result = Array.isArray(data) ? data[0] : data;
    return jsonResponse({
      ticked: true,
      game_date: result?.new_date ?? null,
      tick_number: result?.new_tick ?? null,
    });
  } catch (error) {
    return jsonResponse({ error: (error as Error).message }, { status: 500 });
  }
});
