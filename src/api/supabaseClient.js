import { createClient } from '@supabase/supabase-js';

// Zentraler Supabase-Client des Frontends. Ersetzt den früheren Base44-Client:
// Authentifizierung (Login/Session) und der Aufruf der Backend-Logik laufen jetzt
// direkt über Supabase (Auth + Edge Functions). Die öffentlichen Werte kommen aus
// den Vite-Env-Variablen VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Platzhalter, falls die Env-Variablen fehlen: createClient wirft sonst sofort einen
// Fehler (leere URL/Key). So rendert die App weiterhin den Login-Screen; Auth-/
// Function-Aufrufe schlagen dann kontrolliert fehl, statt die App abstürzen zu lassen.
const FALLBACK_URL = 'https://placeholder.supabase.co';
const FALLBACK_KEY = 'anon-key-missing';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[supabase] VITE_SUPABASE_URL oder VITE_SUPABASE_ANON_KEY fehlen. ' +
      'Lege sie in .env.local (lokal) bzw. als Build-Secrets (GitHub Actions) an.'
  );
}

export const supabase = createClient(supabaseUrl || FALLBACK_URL, supabaseAnonKey || FALLBACK_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Ruft eine Supabase Edge Function auf und liefert deren JSON-Body zurück.
// Wirft einen Fehler mit lesbarer Meldung (auch aus dem JSON-Body der Function),
// damit die UI ihn direkt anzeigen kann.
export async function invokeFunction(name, body = {}) {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) {
    let message = error.message || 'Aufruf fehlgeschlagen.';
    try {
      const ctx = await error.context?.json?.();
      if (ctx?.error) message = ctx.error;
    } catch {
      // Body war kein JSON — Standardmeldung behalten.
    }
    throw new Error(message);
  }
  if (data && data.error) throw new Error(data.error);
  return data;
}
