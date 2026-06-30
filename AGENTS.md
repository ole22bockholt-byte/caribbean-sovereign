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