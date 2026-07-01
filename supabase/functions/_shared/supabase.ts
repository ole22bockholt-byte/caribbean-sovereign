import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Supabase injiziert diese Werte automatisch in jede Edge Function.
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Service-Role-Client: umgeht RLS, wird für alle Datenzugriffe der Functions genutzt
// (die Auth passiert vorher explizit über den User-JWT — siehe getUser()).
export function serviceClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}

// Liest den eingeloggten User aus dem Authorization-Header (vom Frontend gesetzt).
// Gibt null zurück, wenn kein gültiger Token vorliegt.
export async function getUser(req: Request) {
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader) return null;
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
  const { data: { user }, error } = await client.auth.getUser();
  if (error) return null;
  return user;
}

// Prüft, ob ein User Admin ist (Rolle liegt in app_metadata, nicht vom User änderbar).
export function isAdmin(user: { app_metadata?: Record<string, unknown> } | null): boolean {
  return !!user && user.app_metadata?.role === "admin";
}
