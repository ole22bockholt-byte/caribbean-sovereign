import { handleOptions, jsonResponse } from "../_shared/cors.ts";
import { getUser, serviceClient } from "../_shared/supabase.ts";

// Liest den globalen Weltzustand (Spieldatum + letzter Tick) aus Supabase.
// Dient zugleich als Verbindungstest für die Supabase-Anbindung.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleOptions();
  try {
    const user = await getUser(req);
    if (!user) return jsonResponse({ error: "Unauthorized" }, { status: 401 });

    const supabase = serviceClient();
    const { data, error } = await supabase
      .from("world_state")
      .select("game_date, tick_number, last_tick_at")
      .eq("id", true)
      .single();

    if (error) {
      return jsonResponse({ connected: false, error: error.message }, { status: 200 });
    }

    return jsonResponse({ connected: true, world: data });
  } catch (error) {
    return jsonResponse({ error: (error as Error).message }, { status: 500 });
  }
});
