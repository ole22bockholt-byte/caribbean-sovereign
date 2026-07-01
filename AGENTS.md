# AGENTS.md

## Project Context

This is a Base44 app repository. Treat it as user-owned application code, keep changes focused on the user's request, and preserve existing project conventions.

Start with `README.md` for local setup, environment variables, and publish workflow.

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
- Visueller Stil: nautisches „Parchment & Brass" Design (siehe Design-Tokens in
  `src/index.css`: Holz-/Messing-/Pergamenttöne, Schriften Cinzel / Cormorant Garamond /
  EB Garamond). Neue UI muss zu diesem Stil passen — keine generischen weißen Cards.
  Token-Klassen verwenden (`bg-wood`, `text-brass`, `panel`, `font-display` …), keine
  hartkodierten Farben/Fonts.
- **Texturen (zentral in `src/index.css`)**: Drei auswechselbare Bild-Texturen als
  CSS-Variablen — `--tex-outline` (Messing-Rahmen `outline.png`), `--tex-background`
  (dunkle Holzfläche `background.png`), `--tex-pictureground` (Fläche hinter Bildern
  `pictureground.png`). Die `.panel`-Klasse nutzt `--tex-outline` als **breite Outline**
  (`border-image`, Breite über `--outline-width`) und `--tex-background` als Innenfläche.
  Flächen **hinter Bildern** (z.B. Wiki-Schiffe: `ShipCard`-Thumbnail, `ShipDetail`-Hero,
  PNG-Grafik) nutzen die Klasse `.picture-ground` (`--tex-pictureground`). Neue Bild-Flächen
  immer `.picture-ground`, neue Panels immer `.panel` verwenden — Texturen nur zentral in
  `src/index.css` tauschen.
- **Navigationsleisten-Texturen**: Zwei weitere zentrale CSS-Variablen — `--tex-navground`
  (`outliner.png`, Hintergrund von linker `Sidebar` + oberer `StatusBar` via Klasse
  `.nav-ground`) und `--tex-navline` (`outline.png`, Messing-Trennlinien der Navigation).
  Trennlinien über die Kanten-Klassen `.nav-line-r` (rechts, Sidebar), `.nav-line-b` (unten,
  Sidebar-Kopf + StatusBar) und `.nav-line-t` (oben, Sidebar-Fuß) als `border-image`.
  Neue Navigations-Flächen `.nav-ground`, neue Nav-Trennlinien die `.nav-line-*`-Klassen.

### Architektur (Quelle der Wahrheit)
- **Frontend**: React + Tailwind + shadcn/ui. Hauptseite `src/pages/Game.jsx` (Route `/`),
  geschützt über `ProtectedRoute`. Spielmodule liegen in `src/components/game/`.
- **Spielzustand**: zentral über den Hook `src/hooks/useGameState.js`, der die Backend-
  Funktion `gameState` aufruft und die Antwort mit `transformGameState` (`src/lib/gameData.js`)
  in das Frontend-Modell wandelt. UI-Komponenten immer aus diesem Hook speisen — keine
  Mock-Daten in produktiven Pfaden.
- **Backend**: Base44-Functions in `base44/functions/` (Deno). Bestehende Funktionen:
  `gameState` (kompletter Spielzustand), `createPlayer` (Onboarding), `seedWorld`
  (Welt initialisieren, admin-only), `tickWorld` (Welt-Tick, admin-only), `worldState`.
  Bestehende Funktionen wiederverwenden statt duplizieren.
- **Datenbank**: Supabase (Migrationen in `supabase/migrations/`). Zentrale Tabellen:
  `world_state`, `factions`, `goods`, `ports`, `port_faction_influence`, `market_prices`,
  `actors`, `ships`, `player_meta`. Zugriff aus Functions per Service-Role-Key
  (Secrets: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`).

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
- **Welt-Zeit & Spieldatum**: Die Welt schreitet über Ticks voran (`world_state.tick_number`,
  `game_date`, `last_tick_at`). Aus `last_tick_at` wird clientseitig eine laufende Weltzeit
  abgeleitet (Hook `src/hooks/useWorldTime.js`: 1 Spielminute pro Echtsekunde). Die
  Statusleiste zeigt die Weltuhr im 24h-Format (Stunden:Minuten, `WorldClock`) sowie das
  laufende Spieldatum (`WorldDate`). Erreicht die Weltuhr 24:00, springt das Datum auf den
  nächsten Tag — **Tag und Monat** laufen weiter, das **Jahr bleibt fix und wird nicht
  angezeigt**. Diese Zeitbasis ist Grundlage für spätere Jahreszeiten sowie für
  Schiffsbewegungen, Missionen und Aufträge.
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
  Die Daten kommen über den **GitHub-Connector (SHARED)** aus der Backend-Funktion
  `wikiShips` (zentrale Konfiguration `REPO`/`BRANCH`/`SHIPS_DIR` oben in
  `base44/functions/wikiShips/entry.ts`).
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

## Base44 References

- CLI overview: https://docs.base44.com/developers/references/cli/get-started/overview.md
- Agent skills: https://docs.base44.com/developers/backend/overview/skills.md

If your agent supports Agent Skills, install or update Base44 skills before Base44-specific work:

```bash
npx skills add base44/skills
```

## Key Files

- `src/`: frontend application source.
- `src/api/base44Client.js`: frontend Base44 SDK client.
- `vite.config.js`: Vite config and Base44 Vite plugin setup.
- `.env.local`: local-only environment values; never commit secrets.

## Working Notes

- Use `base44 dev` as the default local development command when you need the local Base44 backend. It can run the backend and frontend together.
- When docs or code mention the frontend being started automatically, that usually means the Base44 project config includes `site.serveCommand`, for example `"serveCommand": "npm run dev"` in `base44/config.jsonc`.
- Use `npm run dev` only for frontend-only work against the hosted Base44 backend.
- Prefer the existing Base44 CLI workflow over adding new npm scripts for Base44-specific tasks.
- Reuse the existing SDK client and Vite plugin patterns before adding new Base44 integration paths.
- Run the relevant checks from `package.json` before finishing code changes.

## Cursor Cloud specific instructions

Dependencies are refreshed automatically by the startup update script (`npm install`), which
also creates `.env.local` if it is missing. The following are durable, non-obvious notes for
running/testing this app in the cloud VM.

- **Running the frontend**: `npm run dev` (Vite, http://localhost:5173). Standard scripts live
  in `package.json` (`dev`, `build`, `lint`, `typecheck`, `preview`).
- **Backend proxy is env-gated**: `npm run dev` only reaches the backend when
  `VITE_BASE44_APP_BASE_URL` is set — the Base44 Vite plugin logs `Proxy enabled: /api -> …`.
  Without it you get `Proxy not enabled` and every `/api/*` call 404s against the dev server.
  The startup script writes a non-secret `.env.local` with
  `VITE_BASE44_APP_ID=6a43defde92c0d47de02330a` and
  `VITE_BASE44_APP_BASE_URL=https://app.base44.com` (hosted Base44 backend). Restart the dev
  server after changing `.env.local`.
- **App auth is workspace-restricted**: the hosted app (`6a43defde92c0d47de02330a`) returns
  `auth_required` and the SPA redirects to the Base44 login (`app.base44.com/login`). Reaching
  the actual game (onboarding, `gameState`, etc.) requires logging in with a Base44 account that
  has access to this workspace/app — there is no local anonymous access.
- **Full local backend** (`base44 dev`, runs the Deno functions in `base44/functions/` locally)
  needs the global Base44 CLI (`npm install -g base44@latest`, not a project dep), a Base44
  login, and Supabase secrets (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`);
  functions return HTTP 500 `Supabase-Secrets fehlen.` when those are absent.
- **`npm run typecheck` currently fails** on pre-existing TS errors in `.jsx` pages
  (e.g. `src/pages/Register.jsx`, `src/pages/ResetPassword.jsx`); this is unrelated to
  environment setup. `npm run lint` and `npm run build` pass cleanly.