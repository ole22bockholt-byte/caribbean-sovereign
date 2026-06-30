import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { createClient } from 'npm:@supabase/supabase-js@2.45.0';

// Liest den globalen Weltzustand (Spieldatum + letzter Tick) aus Supabase.
// Dient zugleich als Verbindungstest für die Supabase-Anbindung.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceKey) {
      return Response.json({ error: 'Supabase-Secrets fehlen.' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const { data, error } = await supabase
      .from('world_state')
      .select('game_date, tick_number, last_tick_at')
      .eq('id', true)
      .single();

    if (error) {
      return Response.json({ connected: false, error: error.message }, { status: 200 });
    }

    return Response.json({ connected: true, world: data });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});