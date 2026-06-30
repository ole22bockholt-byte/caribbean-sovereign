import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { createClient } from 'npm:@supabase/supabase-js@2.45.0';

// Welt-Tick: rückt den globalen Weltzustand vor (Marktpreise, Spieldatum, Tick-Zähler).
// Wird per Automation (Scheduled) und/oder manuell durch einen Admin ausgelöst.
// Die eigentliche Logik läuft atomar als SQL-Funktion world_tick() (Migration 0003).
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceKey) {
      return Response.json({ error: 'Supabase-Secrets fehlen.' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const { data, error } = await supabase.rpc('world_tick');
    if (error) throw new Error(error.message);

    const result = Array.isArray(data) ? data[0] : data;
    return Response.json({
      ticked: true,
      game_date: result?.new_date ?? null,
      tick_number: result?.new_tick ?? null,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});