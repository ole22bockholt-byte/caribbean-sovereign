// Gemeinsame CORS-Header + JSON-Helfer für alle Edge Functions.
// Da das Frontend (GitHub Pages) unter einer anderen Origin läuft als die
// Supabase-Functions, müssen die Antworten CORS-Header tragen und OPTIONS
// (Preflight) beantworten.
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
}

// Standard-Preflight-Antwort.
export function handleOptions(): Response {
  return new Response("ok", { headers: corsHeaders });
}
