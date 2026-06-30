import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { createClient } from 'npm:@supabase/supabase-js@2.45.0';

// Onboarding: erstellt den Spieler-Akteur (einmalig je App-User), schreibt
// Metadaten (Fraktion, Kompaniename, Starthafen) und baut ein Startschiff (Sloop)
// im gewählten Hafen. Startgold ist variabel über STARTING_GOLD steuerbar.
// Idempotent: existiert bereits ein Akteur für diesen User, wird nichts erneut erstellt.
const STARTING_GOLD = 25000;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const factionCode = body.faction_code;
    const homePortCode = body.home_port_code;
    const companyName = (body.company_name || '').trim() || `${user.full_name || 'Kapitän'}s Kompanie`;

    if (!factionCode || !homePortCode) {
      return Response.json({ error: 'Fraktion und Starthafen sind erforderlich.' }, { status: 400 });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceKey) {
      return Response.json({ error: 'Supabase-Secrets fehlen.' }, { status: 500 });
    }
    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    // Bereits vorhanden? -> kein Doppel-Onboarding.
    const existingRes = await supabase
      .from('actors')
      .select('id')
      .eq('app_user_id', user.id)
      .maybeSingle();
    if (existingRes.error) throw new Error('Spielerprüfung: ' + existingRes.error.message);
    if (existingRes.data) {
      return Response.json({ created: false, already: true, actor_id: existingRes.data.id });
    }

    // Fraktion & Hafen auflösen (Validierung gegen Stammdaten).
    const [facRes, portRes] = await Promise.all([
      supabase.from('factions').select('id, code').eq('code', factionCode).maybeSingle(),
      supabase.from('ports').select('id, code, name').eq('code', homePortCode).maybeSingle(),
    ]);
    if (facRes.error) throw new Error('Fraktion: ' + facRes.error.message);
    if (portRes.error) throw new Error('Hafen: ' + portRes.error.message);
    if (!facRes.data) return Response.json({ error: 'Unbekannte Fraktion.' }, { status: 400 });
    if (!portRes.data) return Response.json({ error: 'Unbekannter Hafen.' }, { status: 400 });

    // Akteur anlegen.
    const actorRes = await supabase
      .from('actors')
      .insert({
        kind: 'player',
        display_name: companyName,
        app_user_id: user.id,
        gold: STARTING_GOLD,
        influence: 0,
      })
      .select('id')
      .single();
    if (actorRes.error) throw new Error('Akteur anlegen: ' + actorRes.error.message);
    const actorId = actorRes.data.id;

    // Metadaten (Fraktion, Hafen) speichern.
    const metaRes = await supabase.from('player_meta').insert({
      actor_id: actorId,
      faction_code: factionCode,
      company_name: companyName,
      home_port: portRes.data.id,
    });
    if (metaRes.error) throw new Error('Metadaten: ' + metaRes.error.message);

    // Startschiff (Sloop) im Starthafen.
    const shipRes = await supabase
      .from('ships')
      .insert({
        name: 'Erste Hoffnung',
        ship_class: 'sloop',
        owner_id: actorId,
        location_port: portRes.data.id,
        state: 'docked',
        firepower: 8,
        hull: 60,
        hull_max: 60,
        crew: 30,
        crew_max: 30,
        cargo_capacity: 120,
      })
      .select('id')
      .single();
    if (shipRes.error) throw new Error('Schiff bauen: ' + shipRes.error.message);

    return Response.json({
      created: true,
      actor_id: actorId,
      ship_id: shipRes.data.id,
      home_port: portRes.data.name,
      gold: STARTING_GOLD,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});