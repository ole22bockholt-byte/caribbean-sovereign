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