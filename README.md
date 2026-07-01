# Karibik 1765

Browserbasiertes, nautisches Handels- und Strategiespiel (Karibik um 1765).
Frontend: **React + Vite + Tailwind**. Backend: **Supabase** (Auth + Postgres +
Edge Functions). Hosting: **GitHub Pages** über GitHub Actions.

Die App lief früher über die Base44-Plattform. Sie ist jetzt vollständig davon
gelöst und läuft autonom über GitHub + Supabase.

## Architektur

| Bereich        | Vorher (Base44)                        | Jetzt                                   |
| -------------- | -------------------------------------- | --------------------------------------- |
| Auth           | `@base44/sdk` (Base44-Login)           | Supabase Auth (`@supabase/supabase-js`) |
| Backend-Logik  | Base44 Functions (`base44/functions/`) | Supabase Edge Functions (`supabase/functions/`) |
| Datenbank      | Supabase (via Base44-Secrets)          | Supabase (unverändert, `supabase/migrations/`) |
| Datenzugriff   | nur über Functions                     | nur über Functions (RLS sperrt Direktzugriff) |
| Hosting        | Base44-Publish                         | GitHub Pages (`.github/workflows/deploy.yml`) |
| Bilder/Assets  | `media.base44.com`                     | im Repo unter `public/assets/`          |

## Voraussetzungen

- Node.js 20+ (getestet mit 22) und npm
- Ein Supabase-Projekt (kostenloser Tier genügt zum Start)
- Optional für Deploy: aktivierte GitHub Pages im Repository

## Lokale Entwicklung

```bash
npm install
cp .env.example .env.local   # Werte deines Supabase-Projekts eintragen
npm run dev                  # Vite auf http://localhost:5173
```

`.env.local` (öffentliche Werte, kein Secret):

```
VITE_SUPABASE_URL=https://DEIN-PROJEKT.supabase.co
VITE_SUPABASE_ANON_KEY=dein-anon-key
```

Beide Werte stehen im Supabase-Dashboard unter **Project Settings > API**.

## Supabase einrichten (einmalig)

1. **Projekt anlegen** auf [supabase.com](https://supabase.com).
2. **Datenbank-Schema** anwenden — die Migrationen aus `supabase/migrations/` der
   Reihe nach im **SQL-Editor** ausführen (0001 → 0005) oder per CLI:
   ```bash
   npm install -g supabase
   supabase link --project-ref DEIN-PROJECT-REF
   supabase db push
   ```
   Migration `0005_enable_rls.sql` aktiviert Row Level Security: Der öffentliche
   anon-Key kann **nicht** direkt auf die Spieltabellen zugreifen — der gesamte
   Zugriff läuft über die Edge Functions (Service-Role).
3. **Edge Functions deployen**:
   ```bash
   supabase functions deploy gameState createPlayer wikiShips worldState seedWorld tickWorld
   ```
   `SUPABASE_URL`, `SUPABASE_ANON_KEY` und `SUPABASE_SERVICE_ROLE_KEY` werden von
   Supabase automatisch in die Functions injiziert — nichts weiter nötig.
   Optional für das Wiki: `supabase secrets set GITHUB_TOKEN=... WIKI_REPO=owner/repo`
   (nur für private Repos oder höhere GitHub-Rate-Limits).
4. **Auth aktivieren**: unter **Authentication > Providers** E-Mail (und optional
   Google) einschalten. Für den 6-stelligen Code beim Registrieren im
   E-Mail-Template „Confirm signup“ `{{ .Token }}` verwenden; alternativ genügt der
   Bestätigungslink. Redirect-URLs (App-URL + `.../reset-password`) unter
   **Authentication > URL Configuration** eintragen.
5. **Welt initialisieren**: einen User zum Admin machen und `seedWorld` aufrufen.
   Admin-Rolle setzen (SQL-Editor):
   ```sql
   update auth.users
      set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'
    where email = 'deine@mail.example';
   ```
   Danach als dieser User in der App einloggen und `seedWorld` einmalig ausführen
   (z. B. per `supabase.functions.invoke('seedWorld')` in der Browser-Konsole).
6. **Welt-Tick automatisieren** (optional): `supabase/optional_world_tick_cron.sql`
   einmalig im SQL-Editor ausführen (nutzt `pg_cron`, ruft `world_tick()` planmäßig
   auf). Alternativ manuell/geplant die Function `tickWorld` als Admin aufrufen.

## Deploy auf GitHub Pages

1. Im Repository unter **Settings > Pages** als Quelle **GitHub Actions** wählen.
2. Unter **Settings > Secrets and variables > Actions** die Build-Secrets anlegen:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Push auf `main` — der Workflow `.github/workflows/deploy.yml` baut die App und
   veröffentlicht sie. Projekt-Seiten laufen unter `https://<user>.github.io/<repo>/`;
   der Basis-Pfad wird automatisch gesetzt. Für eine eigene Domain `VITE_BASE_PATH`
   im Workflow entfernen/anpassen.

## Checks

```bash
npm run lint       # ESLint (verpflichtend, läuft sauber)
npm run build      # Produktions-Build
npm run typecheck  # tsc (vorbestehende Typwarnungen in .jsx-Auth-Seiten, kein Gate)
```

## Wichtige Dateien

- `src/api/supabaseClient.js` — Supabase-Client + `invokeFunction()`-Helfer.
- `src/lib/AuthContext.jsx` — Auth-Status über Supabase Auth.
- `supabase/functions/` — Backend-Logik (Edge Functions, Deno).
- `supabase/migrations/` — Datenbankschema.
- `.github/workflows/deploy.yml` — Build & Deploy auf GitHub Pages.
