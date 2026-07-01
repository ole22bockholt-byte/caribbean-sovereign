# AGENTS.md

## Project Context

This app was originally built on the Base44 platform and has since been **fully
decoupled** from it. It now runs autonomously on **Supabase** (Auth + Postgres +
Edge Functions) with the frontend hosted on **GitHub Pages** via GitHub Actions.
Treat it as user-owned application code, keep changes focused on the user's
request, and preserve existing project conventions. Do not reintroduce Base44
dependencies (`@base44/sdk`, `@base44/vite-plugin`, `media.base44.com`, the
`base44/` directory).

Start with `README.md` for local setup, environment variables, and the
Supabase + GitHub Pages workflow.

## App-Kern: „Karibik 1765" (PERSISTENTE KI-ANWEISUNG)

Diese Beschreibung definiert den dauerhaften Kern der App. Sie ist bei jeder Aufgabe
einzuhalten; neue Features dürfen den Kern erweitern, aber nicht widersprechen.

### Was die App ist
„Karibik 1765" ist ein browserbasiertes, nautisches Handels- und Strategiespiel im
Setting der Karibik um 1765. Der Spieler führt eine eigene Handelskompanie: Schiffe,
Handel zwischen Häfen, Fraktionspolitik und Aufträge. Das Spiel ist ein persistentes
Mehrspieler-Weltsystem — eine gemeinsame Welt entwickelt sich über die Zeit weiter.

### Sprache & Ton
- Die gesamte Spiel-UI ist auf **Deutsch**. Alle sichtbaren Texte, Labels und Meldungen
  auf Deutsch halten.
- Visueller Stil: nautisches „Slate & Brass"-Design — dunkle Schiefer-/Marine-Flächen mit
  Messing-Akzenten (angelehnt an das UI-Referenzbild). Design-Tokens zentral in
  `src/index.css`: Schiefertöne (`--wood-deep`, `--wood`, `--wood-light`), Messing
  (`--brass`, `--brass-bright`), kühles Label-Grau (`--ink-dim`), helles Pergament für Werte
  (`--ink`), Status-Farben (`--pos` positiv, `--blood` Gefahr/Feind), Meer (`--sea`) sowie
  Navigations-Grund (`--nav`, `--nav-2`). Schriften Cinzel / Cormorant Garamond / EB Garamond.
  Neue UI muss zu diesem Stil passen — keine generischen weißen Cards. Immer Token-Klassen
  verwenden (`bg-wood`, `text-brass`, `text-ink-dim`, `text-pos`, `panel`, `font-display` …),
  **keine hartkodierten Farben/Fonts**. Farben nur zentral über die Tokens in `src/index.css`
  ändern.
- **Panels & Flächen (zentrale Klassen in `src/index.css`)**:
  - `.panel` — flache dunkle Schiefer-Fläche mit feiner Kante (`--line`) und dezentem oberen
    Lichtsaum; Standard für alle Fenster/Panels. `.panel-header` als abgesetzte Kopfleiste
    mit feiner Trennlinie darunter.
  - `.picture-ground` — Fläche **hinter Bildern** (z.B. Wiki-Schiffe: `ShipCard`-Thumbnail,
    `ShipDetail`-Hero; Hafen-Bild im `PortDetailPanel`). Nutzt die auswechselbare Textur
    `--tex-pictureground`.
  - Neue Bild-Flächen immer `.picture-ground`, neue Panels immer `.panel` verwenden.
- **Navigationsleisten**: `.nav-ground` (dunkler Schiefer-Verlauf, Hintergrund von linker
  `Sidebar` + voll breiter oberer `StatusBar`) und die feinen Kanten-Trennlinien `.nav-line-r`
  (rechts, Sidebar), `.nav-line-b` (unten, StatusBar) und `.nav-line-t` (oben, Sidebar-Fuß).
  Neue Navigations-Flächen `.nav-ground`, neue Nav-Trennlinien die `.nav-line-*`-Klassen.
- **Wiederverwendbare UI-Bausteine (zentral in `src/index.css`)**: `.game-tabs` / `.game-tab`
  (Tab-Leisten, z.B. Karte und Hafen-Detail; aktive Tabs `.is-active`), `.data-table`
  (kompakte Datentabellen der unteren Panels), `.level-badge` (Wort-Stufen wie Sicherheit
  oder Ressourcen-Verfügbarkeit), `.ghost-btn` (Sekundär-/„Alle anzeigen"-Buttons) und
  `.brass-btn` (Messing-Primärbutton). Neue gleichartige Elemente diese Klassen nutzen,
  statt Stile lokal zu duplizieren.
- **Texturen (weiterhin zentral & auswechselbar)**: Die Bild-Texturen bleiben als CSS-
  Variablen in `src/index.css` erhalten (`--tex-outline`, `--tex-background`,
  `--tex-pictureground`, `--tex-navground`, `--tex-navline`, Breite `--outline-width`).
  Aktiv genutzt wird derzeit `--tex-pictureground` (über `.picture-ground`); die übrigen sind
  für Bild-Flächen/Sonderfälle reserviert. Texturen nur zentral hier tauschen.

### Architektur (Quelle der Wahrheit)
- **Frontend**: React + Tailwind + shadcn/ui. Hauptseite `src/pages/Game.jsx` (Route `/`),
 geschützt über `ProtectedRoute`. Spielmodule liegen in `src/components/game/`.
- **Supabase-Client**: zentral in `src/api/supabaseClient.js` (`@supabase/supabase-js`).
 Er bündelt Auth (Login/Session) und `invokeFunction(name, body)` zum Aufruf der Edge
 Functions. Konfiguration über `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.
- **Auth**: Supabase Auth über `src/lib/AuthContext.jsx` (Session, Login/Logout, Rolle
 aus `app_metadata.role`). Login/Registrierung/Passwort-Reset in `src/pages/`.
- **Spielzustand**: zentral über den Hook `src/hooks/useGameState.js`, der die Edge
 Function `gameState` aufruft und die Antwort mit `transformGameState` (`src/lib/gameData.js`)
 in das Frontend-Modell wandelt. UI-Komponenten immer aus diesem Hook speisen — keine
 Mock-Daten in produktiven Pfaden.
- **Backend**: Supabase Edge Functions in `supabase/functions/` (Deno, Entry `index.ts`).
 Gemeinsame Helfer in `supabase/functions/_shared/` (`cors.ts`, `supabase.ts` mit
 `getUser`/`serviceClient`/`isAdmin`). Bestehende Funktionen: `gameState` (kompletter
 Spielzustand), `createPlayer` (Onboarding), `seedWorld` (Welt initialisieren, admin-only),
 `tickWorld` (Welt-Tick, admin-only), `worldState`, `wikiShips`. Bestehende Funktionen
 wiederverwenden statt duplizieren.
- **Datenbank**: Supabase (Migrationen in `supabase/migrations/`). Zentrale Tabellen:
 `world_state`, `factions`, `goods`, `ports`, `port_faction_influence`, `market_prices`,
 `actors`, `ships`, `player_meta`. Zugriff ausschließlich aus den Edge Functions per
 Service-Role-Key (von Supabase automatisch als `SUPABASE_URL`/`SUPABASE_ANON_KEY`/
 `SUPABASE_SERVICE_ROLE_KEY` injiziert). RLS (Migration `0005`) sperrt Direktzugriffe mit
 dem öffentlichen anon-Key. Auth der Functions über den User-JWT (`getUser`), Admin-Gate
 über `isAdmin` (`app_metadata.role === 'admin'`).

### Kern-Spielkonzepte
- **Fraktionen**: Großbritannien (gb), Spanien (es), Frankreich (fr), Niederlande (nl),
  Piraten (pirate), Neutral (neutral). Jede mit Code, Name, Farbe, Flagge.
- **Fraktions-Flaggen (Bilder)**: In `src/lib/gameData.js` bündelt `FLAG_IMG_BY_CODE`
  auswechselbare Flaggen-**Bild-URLs** je Fraktions-Code; `factionFlagImage(code)` liefert
  die URL (oder `null`). Wo eine Flagge angezeigt wird (z.B. `StatusBar` „Großfraktion“),
  wird das Bild bevorzugt und fällt auf das Emoji aus `FLAG_BY_CODE`/`factionFlag(code)`
  zurück, falls keine Bild-URL hinterlegt ist. Neue/geänderte Flaggen nur zentral in
  `FLAG_IMG_BY_CODE` pflegen.
- **Häfen**: Position (x/y auf der Karte), kontrollierende Fraktion, Sicherheit,
  Fraktionseinfluss, lokale Marktpreise.
- **Markt**: Waren mit Kauf-/Verkaufspreisen und Trend je Hafen.
- **Spieler/Akteur**: Kompaniename, Gold, Einfluss, Fraktion, eigene Schiffe.
- **Schiffe**: Klassen Schaluppe/Brigg/Fregatte/Galeone; Zustände Im Hafen/Unterwegs/
  Im Gefecht/Versenkt/Gekapert; Feuerkraft, Rumpf, Crew.
- **Bildschirm-Layout (HUD)**: `Game.jsx` ordnet an: die voll breite `StatusBar` oben,
  darunter links die `Sidebar`, rechts der Hauptbereich (Karte + `PortDetailPanel` → untere
  `BottomPanels` → Aktionsleiste). Die `StatusBar` zeigt Wappen/Großfraktion, Kompanie mit
  **Ruf** (aus dem Einfluss abgeleiteter Rang), den Ressourcen-Cluster (Gold/Einfluss/Crew/
  Schiffe), Datum + Weltuhr und einen Pause-Schalter. Die `Sidebar` bündelt `Hauptmenü`
  (Reiter) und `Kurzübersicht` (Kennzahlen). `CaribbeanMap` und `PortDetailPanel` nutzen
  `.game-tabs` (Karten- bzw. Hafen-Tabs); `BottomPanels` sind `.data-table`-Tabellen mit
  „Alle anzeigen"-Fußzeilen. Die Aktionsleiste bündelt `QuickActions` und den
  `WorldUpdateTimer`.
- **Abgeleitete Anzeigewerte (reine Darstellung, kein Backend-Feld)**: Ruf-Rang
  (`reputationRank`), Sicherheits-/Ressourcen-Stufen (`levelFor`/`securityLevel` in
  `src/lib/format.js`) und der Welt-Update-Countdown (`WorldUpdateTimer`, zentrale
  Intervall-Konstante) werden aus vorhandenen Live-Daten hergeleitet. **Keine erfundenen
  Backend-Daten** — Bereiche ohne Datenquelle (Reisen-Ziele, Aufträge, Nachrichten) zeigen
  saubere Leerzustände, bis echte Daten über `gameState` vorliegen.
- **Welt-Zeit & Spieldatum**: Die Welt schreitet über Ticks voran (`world_state.tick_number`,
  `game_date`, `last_tick_at`). Aus `last_tick_at` wird clientseitig eine laufende Weltzeit
  abgeleitet (Hook `src/hooks/useWorldTime.js`: 1 Spielminute pro Echtsekunde). Die
  Statusleiste zeigt die Weltuhr im 24h-Format (Stunden:Minuten, `WorldClock`) sowie das
  laufende Spieldatum (`WorldDate`). Erreicht die Weltuhr 24:00, springt das Datum auf den
  nächsten Tag — **Tag und Monat** laufen weiter, das **Jahr bleibt fix und wird nicht
  angezeigt**. Diese Zeitbasis ist Grundlage für spätere Jahreszeiten sowie für
  Schiffsbewegungen, Missionen und Aufträge. Die Aktionsleiste zeigt zusätzlich einen
  Countdown „Nächstes Welt-Update" (`WorldUpdateTimer`), der aktuell auf einer zentralen
  Intervall-Konstante beruht (bis das echte Tick-Intervall aus dem Backend geliefert wird).
- **Onboarding**: Neue Spieler wählen Fraktion, Starthafen und Kompanienamen
  (`needsOnboarding` aus `gameState`, danach `createPlayer`).
- **Profil**: Sidebar-Reiter `profil` zeigt das `ProfilePanel` (`src/components/game/
  ProfilePanel.jsx`) anstelle von Karte/Hafendetails. Es bündelt Spieler-/Kontodaten
  (Name, E-Mail aus `useAuth`, Kompanie, Großfraktion) und die Abmeldung über
  `logout()` aus dem `AuthContext`.
- **Startbildschirm**: `StartScreen` (`src/components/game/StartScreen.jsx`) ist das
  Loader-Gate vor der App. Solange `gameState` lädt, zeigt es einen Ladespinner; erst nach
  vollständigem Laden erscheint „Press any button to start“. Eine beliebige Tasten-/
  Touch-/Klick-Eingabe startet die Fade-Out-Animation und gibt die App frei (`started`-State
  in `Game.jsx`). Der Hintergrund ist ein **auswechselbarer Platzhalter** (Konstante
  `START_BG`, später auch GIF/Video möglich); ein Upload/Auto-Tausch ist bewusst noch nicht
  implementiert.
- **Wiki**: Sidebar-Reiter `wiki` zeigt `WikiPanel` (`src/components/game/wiki/`) anstelle
  von Karte/Hafendetails. Vorerst werden alle **Schiffstypen** als Karten-Übersicht
  (`ShipCard`) gelistet; Klick öffnet die Detailseite (`ShipDetail`, ganze Page pro Schiff).
 Die Daten kommen aus der Edge Function `wikiShips`, die die Schiff-Ordner direkt über
 die **GitHub-API** lädt (zentrale Konfiguration über Function-Secrets `WIKI_REPO`/
 `WIKI_BRANCH`/`WIKI_SHIPS_DIR` bzw. Defaults oben in `supabase/functions/wikiShips/index.ts`;
 optionales `GITHUB_TOKEN` für private Repos/höhere Rate-Limits).
- **Schiff anlegen (pro Schiff ein Ordner)**: Jedes Schiff ist ein **eigener Unterordner**
  unter `SHIPS_DIR` (Standard `ships/`) im Repo. Ein neues Schiff = neuer Ordner mit:
  `ship.json` (Pflicht: `name`; optional `class`, `summary`, `description` und das freie
  `stats`-Objekt mit beliebigen Werten für spätere Spielmechanik), `image.png` (grafische
  Darstellung) und `preview.mp4` (Vorschauvideo, auch `.webm`/`.mov`). `wikiShips` listet
  alle Schiff-Ordner auf, liest je `ship.json` und setzt `imageUrl`/`videoUrl` als
  Raw-GitHub-URLs zusammen.
- **Detailseite**: `ShipDetail` zeigt das **Vorschauvideo als Hintergrund** im Hero-Bereich
  oben (Fallback: PNG, dann Platzhalter), darunter die PNG-Grafik (falls Video läuft), die
  `stats` als Werte-Raster und die Texte. **Erweiterbar**: `stats` wird generisch gerendert —
  neue Werte erscheinen ohne Code-Änderung; das Wiki ist als eigener Bereich angelegt, um
  weitere Kategorien (Waren, Fraktionen …) zu ergänzen.

### Arbeitsregeln für dieses Spiel
- Datenmodell-Änderungen immer als Supabase-Migration in `supabase/migrations/` und
  passend in den Functions abbilden; bestehende Daten nicht brechen.
- Geschäftslogik nicht bei reinen UI-Änderungen anfassen und umgekehrt.
- Admin-Operationen (seed/tick) bleiben admin-only (`user.role === 'admin'`).
- Kleine, fokussierte Komponenten je Spielmodul; deutschsprachige Kommentare beibehalten.

## References

- Supabase JS client: https://supabase.com/docs/reference/javascript
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
- Supabase Auth: https://supabase.com/docs/guides/auth
- GitHub Pages via Actions: https://docs.github.com/pages

## Key Files

- `src/`: frontend application source.
- `src/api/supabaseClient.js`: frontend Supabase client + `invokeFunction()` helper.
- `src/lib/AuthContext.jsx`: Supabase Auth state.
- `src/lib/assets.js`: base-path-aware URL helper for files in `public/`.
- `vite.config.js`: Vite config (React plugin, `@`→`src` alias, `base` path).
- `supabase/functions/`: backend Edge Functions (Deno).
- `supabase/migrations/`: database schema.
- `.github/workflows/deploy.yml`: build & deploy to GitHub Pages.
- `.env.local`: local-only environment values; never commit secrets.

## Working Notes

- Use `npm run dev` (Vite, port 5173) for local development against your Supabase project.
- Backend logic lives in Supabase Edge Functions; deploy with `supabase functions deploy <name>`.
- Database changes go through `supabase/migrations/` (see game rules below) and `supabase db push`.
- Reuse the existing `supabaseClient`/`invokeFunction` and `_shared` function helpers before adding new integration paths.
- Run the relevant checks from `package.json` before finishing code changes.
- File-based content catalogs (`ships/`, `equipment/`, `characters/`) follow a fixed schema documented in [`docs/inhalte-hinzufuegen.md`](docs/inhalte-hinzufuegen.md). After editing any of them, run `npm run validate:content` (schema + cross-reference check). Ship slots gate fit by `allowedWeights` (severity) with optional `allowedTiers` (F–S); the item `class` tag is `<Schweregrad>-<Stufe>`.

## Cursor Cloud specific instructions

This repo is a Vite + React frontend backed by **Supabase** (Auth + Postgres + Edge
Functions). The Supabase backend runs on Supabase's hosted infrastructure; there is no
local backend or database in the VM.

- **Dev server**: `npm run dev` (Vite on port 5173). Configuration comes from `.env.local`,
 which is gitignored and recreated per environment (the update script does not create it).
 Required content (public values only, no secrets):
 ```
 VITE_SUPABASE_URL=https://DEIN-PROJEKT.supabase.co
 VITE_SUPABASE_ANON_KEY=dein-anon-key
 ```
 If these are missing, the Supabase client falls back to a placeholder URL: the app still
 renders the login screen, but all auth/function calls fail. For UI-only checks that is fine;
 for end-to-end testing you need a real Supabase project.
- **Auth gate**: The main route `/` is protected; unauthenticated visitors are redirected to
 the in-app `/login` page (Supabase Auth email/password + optional Google). Reaching the game
 UI (onboarding, map, trading) requires a real Supabase project with the schema applied,
 Edge Functions deployed, and a seeded world — which is **not** available from the VM without
 the user's Supabase credentials. UI/login rendering can be verified locally; full gameplay
 cannot.
- **Checks**: `npm run lint` is the enforced check (passes clean). `npm run build` works.
 `npm run typecheck` (`tsc`) reports **pre-existing** type errors in the JSX auth pages
 (`Register.jsx`, `ResetPassword.jsx`, etc.) because components are untyped `.jsx`; it is not
 an enforced gate — do not treat these as regressions. Edge Functions in `supabase/functions/`
 are Deno/TypeScript and are not covered by the frontend `tsc`/eslint config.
- **Deploy**: pushing to `main` triggers `.github/workflows/deploy.yml` (GitHub Pages). It
 needs the repo secrets `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` and GitHub Pages set
 to the "GitHub Actions" source.