# Karibik 1765 — App-Dokumentation

> **Stand:** Juli 2026 · **Repo:** Base44-App (Vite + React Frontend, Base44 Functions + Supabase Backend)
>
> Dieses Dokument beschreibt den aktuellen Zustand der App: Architektur, Spielkonzepte, Datenmodell, UI-System und Entwicklungsworkflow. Es ist als Notion-Import vorbereitet (Markdown mit klaren Überschriften und Tabellen).

---

## 1. Was ist Karibik 1765?

**Karibik 1765** ist ein browserbasiertes, nautisches Handels- und Strategiespiel im Setting der Karibik um 1765. Der Spieler führt eine eigene Handelskompanie: Schiffe, Handel zwischen Häfen, Fraktionspolitik und Aufträge. Das Spiel ist ein **persistentes Mehrspieler-Weltsystem** — eine gemeinsame Welt entwickelt sich über die Zeit weiter.

| Eigenschaft | Beschreibung |
|---|---|
| **Sprache** | Gesamte Spiel-UI auf Deutsch |
| **Plattform** | Web-App (React), gehostet auf Base44 |
| **Zugang** | Workspace-Mitglieder mit Base44-Login |
| **Weltmodell** | Geteilte persistente Welt mit Tick-System |

---

## 2. Tech-Stack

| Schicht | Technologie |
|---|---|
| **Frontend** | React 18, Vite 6, Tailwind CSS, shadcn/ui (Radix) |
| **Routing** | React Router v6 |
| **State / Data** | Custom Hooks (`useGameState`), TanStack Query |
| **Backend** | Base44 Functions (Deno/TypeScript) |
| **Datenbank** | Supabase (PostgreSQL) |
| **Auth** | Base44 Auth (Google + E-Mail/Passwort) |
| **Content** | Dateibasierte Kataloge (`ships/`, `equipment/`, `characters/`) |
| **Wiki-Daten** | GitHub-Connector → `wikiShips`-Function |

---

## 3. Architektur-Überblick

```
┌─────────────────────────────────────────────────────────────┐
│  Browser (React)                                            │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Game.jsx    │  │ Hooks        │  │ lib/gameData.js  │  │
│  │ (HUD/Layout)│→ │ useGameState │→ │ transformGameState│  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
│         │                  │                                │
│         ▼                  ▼                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ base44Client.js → /api/functions/*                  │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS (App-Subdomain *.base44.app)
┌──────────────────────────▼──────────────────────────────────┐
│  Base44 Functions (Deno)                                    │
│  gameState · createPlayer · seedWorld · tickWorld ·         │
│  worldState · wikiShips                                     │
└──────────────────────────┬──────────────────────────────────┘
                           │ Service Role Key
┌──────────────────────────▼──────────────────────────────────┐
│  Supabase (PostgreSQL)                                      │
│  world_state · factions · ports · goods · market_prices ·   │
│  actors · ships · stock · player_meta · …                   │
└─────────────────────────────────────────────────────────────┘
```

### Datenfluss (Spielzustand)

1. Frontend ruft `base44.functions.invoke("gameState")` auf (`useGameState`-Hook).
2. Backend lädt parallel: Weltzustand, Fraktionen, Waren, Häfen, Einfluss, Preise, Spieler + Schiffe.
3. Antwort wird clientseitig mit `transformGameState()` in das UI-Modell gewandelt.
4. Alle UI-Komponenten speisen aus diesem Hook — **keine Mock-Daten in produktiven Pfaden**.

---

## 4. Projektstruktur

```
/
├── src/                          # Frontend-Quellcode
│   ├── pages/                    # Routen: Game, Login, Register, …
│   ├── components/game/          # Spielmodule (Karte, Sidebar, Hafen, Wiki, …)
│   ├── hooks/                    # useGameState, useVoyages, useEconomy, …
│   ├── lib/                      # gameData, format, mapGeography, portServices, …
│   └── api/base44Client.js       # Base44 SDK Client
├── base44/
│   ├── functions/                # Backend-Functions (Deno)
│   │   ├── gameState/
│   │   ├── createPlayer/
│   │   ├── seedWorld/            # admin-only
│   │   ├── tickWorld/            # admin-only
│   │   ├── worldState/
│   │   └── wikiShips/
│   └── config.jsonc              # Build/Serve-Konfiguration
├── supabase/migrations/          # DB-Schema (0001–0006)
├── ships/                        # Schiffskatalog (dateibasiert)
├── equipment/                    # Ausrüstungskatalog
├── characters/                   # Personenkatalog
├── docs/                         # Entwickler-Dokumentation
└── AGENTS.md                     # Persistente KI-Anweisung (App-Kern)
```

---

## 5. Routen & Authentifizierung

| Route | Komponente | Zugriff |
|---|---|---|
| `/` | `Game.jsx` | Geschützt (Workspace-Mitglied) |
| `/login` | `Login.jsx` | Öffentlich |
| `/register` | `Register.jsx` | Öffentlich |
| `/forgot-password` | `ForgotPassword.jsx` | Öffentlich |
| `/reset-password` | `ResetPassword.jsx` | Öffentlich |

**Auth-Gate:** Die App ist auf **Base44-Workspace-Mitglieder** beschränkt (`workspace_with_login`). Nicht-Mitglieder sehen nach Login die Seite „Zugriff eingeschränkt" statt einer Redirect-Schleife.

**Wichtig für lokale Entwicklung:** `VITE_BASE44_APP_BASE_URL` muss die **App-Subdomain** (`https://<app-id>.base44.app`) sein — nicht die Plattform-Domain `app.base44.com`, sonst schlagen Backend-Function-Calls fehl.

---

## 6. Spielbildschirm (HUD-Layout)

Die Hauptseite `Game.jsx` ordnet das HUD so an:

```
┌──────────────────────────────────────────────────────────┐
│  StatusBar (voll breit)                                  │
│  Wappen · Kompanie/Ruf · Gold/Einfluss/Crew/Schiffe     │
│  Spieldatum · Weltuhr · Pause                            │
├──────────┬───────────────────────────────────────────────┤
│ Sidebar  │  Hauptbereich                                 │
│          │  ┌─────────────────────────────────────────┐  │
│ Haupt-   │  │ Karte (CaribbeanMap)                    │  │
│ menü     │  │ oder Profil / Wiki / Diplomatie /       │  │
│          │  │ Hafendienste / Schiffsansicht           │  │
│ Kurz-    │  ├─────────────────────────────────────────┤  │
│ über-    │  │ PortDetailPanel (Hafen-Tabs)            │  │
│ sicht    │  ├─────────────────────────────────────────┤  │
│          │  │ BottomPanels (Schiffe, Reisen, …)       │  │
│ Hafen-   │  ├─────────────────────────────────────────┤  │
│ dienste  │  │ QuickActions + WorldUpdateTimer         │  │
└──────────┴──────────────────────────────────────────────┘
```

### Sidebar-Navigation

**Globales Hauptmenü** (standortunabhängig):

| ID | Label | Inhalt |
|---|---|---|
| `uebersicht` | Übersicht | Karte + Hafendetails |
| `schiffe` | Schiffe | Schiffsansicht (`ShipView`) |
| `diplomatie` | Diplomatie | `DiplomatiePanel` |
| `wiki` | Wiki | Schiffstypen-Übersicht + Detailseiten |
| `profil` | Profil | Spieler-/Kontodaten, Abmeldung |

**Hafendienste** (standortabhängig, je nach Hafentyp):

| ID | Label | Verfügbarkeit |
|---|---|---|
| `handel` | Händler | Jeder Hafen |
| `marktplatz` | Marktplatz | Größere Häfen (Fort, Kapitale, Neutral, Piraten) |
| `schiffshaendler` | Schiffshändler | Forts + Fraktions-Haupthäfen |
| `ausruestung` | Ausrüstung | Nur Fraktions-Haupthäfen |
| `auftraege` | Aufträge | Größere Häfen |

Regeln in `src/lib/portServices.js` abgeleitet — keine erfundenen Backend-Daten.

### Fraktions-Haupthäfen

| Fraktion | Code | Haupthafen |
|---|---|---|
| Großbritannien | `gb` | Port Royal |
| Spanien | `es` | Havanna |
| Frankreich | `fr` | Cap-Français |
| Niederlande | `nl` | Willemstad |
| Piraten | `pirate` | Tortuga |
| Neutral | `neutral` | Nassau |

---

## 7. Startbildschirm & Onboarding

### StartScreen

- Loader-Gate vor der App: Spinner während `gameState` lädt.
- Nach vollständigem Laden: „Press any button to start".
- Beliebige Tasten-/Touch-/Klick-Eingabe startet Fade-Out und gibt die App frei.

### Onboarding (neue Spieler)

Wenn `needsOnboarding: true` aus `gameState`:

1. Spieler wählt **Fraktion**, **Starthafen** und **Kompanienamen**.
2. `createPlayer`-Function erstellt:
   - Akteur in `actors` (Gold: 25.000, Einfluss: 0)
   - Metadaten in `player_meta` (Fraktion, Kompanie, Starthafen)
   - Startschiff (Schaluppe) im gewählten Hafen
3. Idempotent: existiert bereits ein Akteur, wird nichts erneut erstellt.

---

## 8. Kern-Spielkonzepte

### Fraktionen

| Code | Name | Flagge |
|---|---|---|
| `gb` | Großbritannien | 🇬🇧 (+ Bild-URL in `FLAG_IMG_BY_CODE`) |
| `es` | Spanien | 🇪🇸 |
| `fr` | Frankreich | 🇫🇷 |
| `nl` | Niederlande | 🇳🇱 |
| `pirate` | Piraten | 🏴‍☠️ |
| `neutral` | Neutral | ⚪ |

### Häfen

- 19 historische Häfen (Stand ~1765), Positionen in `src/lib/mapGeography.js` und DB.
- Eigenschaften: Position (x/y), kontrollierende Fraktion, Sicherheit (0–100), Fraktionseinfluss, lokale Marktpreise.
- Hafentypen: `fort`, `harbor`, `pirate`, `neutral`.

### Markt

- Waren mit Kauf-/Verkaufspreisen und Trend (up/down/flat) je Hafen.
- Preise driften beim Welt-Tick per Mean-Reversion + Rauschen (`world_tick()` SQL-Funktion).
- Verkaufspreis = 90 % des Kaufpreises (clientseitig abgeleitet).

### Spieler / Akteur

- Kompaniename, Gold, Einfluss, Fraktion, eigene Schiffe.
- **Ruf-Rang** (`reputationRank`) wird aus Einfluss abgeleitet (reine Darstellung).

### Schiffe

| Backend-Klasse | UI-Label | Zustände |
|---|---|---|
| `sloop` | Schaluppe | Im Hafen, Unterwegs, Im Gefecht, Versenkt, Gekapert |
| `brig` | Brigg | |
| `frigate` | Fregatte | |
| `galleon` | Galeone | |

Kampfwerte: Feuerkraft, Rumpf, Crew, Laderaum-Kapazität (Tonnen).

> **Hinweis:** Aktuell wird eine Dummy-Fregatte „Resolute" für alle Spieler ergänzt (Platzhalter bis vollständige Backend-Anbindung).

### Welt-Zeit & Spieldatum

- Welt schreitet über **Ticks** voran (`world_state.tick_number`, `game_date`, `last_tick_at`).
- Clientseitig: 1 Spielminute = 1 Echtsekunde (`useWorldTime`-Hook).
- Statusleiste: Weltuhr (24h) + laufendes Spieldatum (Tag/Monat, **Jahr fix und nicht angezeigt**).
- Countdown „Nächstes Welt-Update" (`WorldUpdateTimer`) basiert auf zentraler Intervall-Konstante.

---

## 9. Client-seitige Simulationen (noch nicht im Backend)

Zwei Systeme laufen aktuell **client-seitig mit localStorage-Persistenz**, bis das Backend sie übernimmt:

### Reisen (`useVoyages`)

- Physische Bewegung über die Karte entlang berechneter Seewege (`computeSeaRoute`).
- Schiff bewegt sich in Echtzeit, dockt bei Ankunft am Zielhafen an.
- Fortschritt in `localStorage` (`karibik1765.voyages.v1`).

### Wirtschaft (`useEconomy`)

- Gold-Delta und schiffsgebundene Laderäume (`holds[shipId]`).
- Waren haben Gewicht in Tonnen (`goodsData`), Schiffe haben Kapazität in Tonnen.
- Käufe/Verkäufe/Umladen client-seitig — Ziel: Anbindung an Supabase `stock`-Tabelle.

---

## 10. Backend-Functions

| Function | Zweck | Zugriff |
|---|---|---|
| `gameState` | Kompletter Spielzustand für aktuellen Spieler | Authentifiziert |
| `createPlayer` | Onboarding: Akteur, Meta, Startschiff | Authentifiziert |
| `seedWorld` | Welt initialisieren (Fraktionen, Häfen, Waren, Preise) | Admin |
| `tickWorld` | Welt-Tick ausführen (`world_tick()` RPC) | Admin |
| `worldState` | Nur Weltzustand (Datum, Tick) | Authentifiziert |
| `wikiShips` | Schiffsdaten aus GitHub-Repo laden | Authentifiziert |

**Secrets (Backend):** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`

---

## 11. Datenbankschema (Supabase)

### Migrationen

| Nr. | Datei | Inhalt |
|---|---|---|
| 0001 | `init_schema.sql` | Kernschema: ENUMs, actors, factions, ports, goods, stock, ships, voyages, ledger, world_state, market_prices |
| 0002 | `transfer_engine.sql` | Atomare Transfers: `transfer_goods`, `transfer_gold`, `transfer_ship` + Audit-Log |
| 0003 | `world_tick.sql` | `world_tick()` — Marktpreis-Drift, Datum +1, Tick +1 |
| 0004 | `player_meta.sql` | Onboarding-Metadaten (Fraktion, Kompanie, Starthafen) |
| 0005 | `historic_ports.sql` | 19 historische Häfen mit korrekten Kartenkoordinaten |
| 0006 | `cargo_weight.sql` | Waren-Gewicht in Tonnen, `cargo_capacity` als Tonnen-Kapazität |

### Zentrale Tabellen

| Tabelle | Zweck |
|---|---|
| `world_state` | Singleton: Spieldatum, Tick-Nummer, `last_tick_at` |
| `factions` | Großfraktionen (code, name, color) |
| `ports` | Häfen (Position, Kontrolle, Sicherheit) |
| `port_faction_influence` | Fraktionseinfluss je Hafen |
| `goods` | Warenarten (code, name, base_price, weight_tons) |
| `market_prices` | Lokale Preise + Trend je Hafen/Ware |
| `actors` | Spieler, KI-Nationen, Allianzen (Gold, Einfluss) |
| `ships` | Einzelne Schiffe (Klasse, Zustand, Kampfwerte, Laderaum) |
| `stock` | Physische Bestände (holder_kind + holder_id + good + quantity) |
| `player_meta` | Spieler-Onboarding (Fraktion, Kompanie, Starthafen) |
| `ledger` | Unveränderliches Audit-Log aller Transfers |

### Physisches Objektmodell

- **Schüttgut** (Waren): Bestandszeilen in `stock`, Transfer via `transfer_goods()`.
- **Stückgut** (Schiffe): Einzelne Zeilen in `ships`, Transfer via `transfer_ship()`.
- **Gold**: Transfer via `transfer_gold()` mit Ledger-Eintrag.
- Alle Transfers: atomar, mit Row-Locks, deterministische Lock-Reihenfolge.

---

## 12. UI-Designsystem („Slate & Brass")

Visueller Stil: dunkle Schiefer-/Marine-Flächen mit Messing-Akzenten. Alle Tokens zentral in `src/index.css`.

### Farb-Tokens

| Token | Wert | Verwendung |
|---|---|---|
| `--wood-deep` | `#0b1116` | App-Hintergrund |
| `--wood` | `#131c23` | Panel-Fläche |
| `--wood-light` | `#1b2831` | Erhöhte Fläche |
| `--brass` | `#c8a24c` | Messing-Akzent |
| `--brass-bright` | `#e6c877` | Aktive Titel/Werte |
| `--ink` | `#e7ddc8` | Werte-Text (Pergament) |
| `--ink-dim` | `#93a3ac` | Labels |
| `--pos` | `#5aa06a` | Positiv |
| `--blood` | `#b23a46` | Gefahr/Feind |
| `--sea` | `#0f2732` | Meer (Karte) |
| `--nav` / `--nav-2` | Schiefer-Verlauf | Navigationsleisten |

### Schriften

- **Cinzel** — Display/Überschriften (`font-display`)
- **Cormorant Garamond** / **EB Garamond** — Fließtext (`font-body-game`)

### Wiederverwendbare CSS-Klassen

| Klasse | Zweck |
|---|---|
| `.panel` / `.panel-header` | Standard-Panel mit Kopfleiste |
| `.picture-ground` | Hintergrundfläche hinter Bildern |
| `.nav-ground` | Navigations-Hintergrund (Sidebar, StatusBar) |
| `.nav-line-r/b/t` | Feine Kanten-Trennlinien |
| `.game-tabs` / `.game-tab` | Tab-Leisten (Karte, Hafen) |
| `.data-table` | Kompakte Datentabellen |
| `.level-badge` | Wort-Stufen (Sicherheit, Verfügbarkeit) |
| `.ghost-btn` | Sekundär-Button |
| `.brass-btn` | Messing-Primärbutton |

**Regel:** Neue UI immer Token-Klassen verwenden — keine hartkodierten Farben/Fonts.

---

## 13. Wiki (In-Game)

- Sidebar-Reiter `wiki` → `WikiPanel` mit Schiffstypen-Karten (`ShipCard`).
- Klick öffnet Detailseite (`ShipDetail`) mit Vorschauvideo, PNG, Stats-Raster, Texte.
- Datenquelle: Backend-Function `wikiShips` lädt aus GitHub-Repo (`ships/`-Ordner).
- Jeder Schiffstyp = eigener Ordner mit `ship.json`, `image.png`, `preview.mp4`.
- `stats`-Objekt wird generisch gerendert — neue Werte erscheinen ohne Code-Änderung.

---

## 14. Dateibasierte Inhaltskataloge

| Katalog | Ordner | Schema-Datei |
|---|---|---|
| Schiffe | `ships/<id>/` | `ship.json` (Pflicht: `name`) |
| Ausrüstung | `equipment/<slot>/<item>/` | `part.json` (Pflicht: `id`, `slot`, `name`, `class`) |
| Personen | `characters/<id>/` | `character.json` (Pflicht: `name`) |

**Validierung nach jeder Änderung:**

```bash
npm run validate:content
```

Ausrüstungs-Schema: `class` = `"<Schweregrad>-<Stufe>"` (z. B. `Leicht-C`). Schiffs-Slots gate'n per `allowedWeights` und optional `allowedTiers`.

Details: [`docs/inhalte-hinzufuegen.md`](inhalte-hinzufuegen.md)

---

## 15. Lokale Entwicklung

### Voraussetzungen

```bash
npm install
```

### Frontend gegen gehostetes Backend

`.env.local` im Projektroot:

```
VITE_BASE44_APP_ID=6a43defde92c0d47de02330a
VITE_BASE44_APP_BASE_URL=https://6a43defde92c0d47de02330a.base44.app
```

```bash
npm run dev    # Vite auf Port 5173
```

### Checks

| Befehl | Zweck |
|---|---|
| `npm run lint` | ESLint (enforced) |
| `npm run build` | Production-Build |
| `npm run validate:content` | Content-Schema-Validierung |
| `npm run typecheck` | TypeScript (nicht enforced, pre-existing JSX-Fehler) |

### Publish

Änderungen pushen → Base44 Dashboard → App publishen (`base44 dashboard open`).

---

## 16. Abgeleitete Anzeigewerte (kein Backend-Feld)

| Anzeige | Quelle | Modul |
|---|---|---|
| Ruf-Rang | `player.influence` | `reputationRank` in `format.js` |
| Sicherheits-Stufe | `port.security` | `securityLevel` / `levelFor` |
| Weltuhr | `world.last_tick_at` + Client-Tick | `useWorldTime` |
| Spieldatum | `world.game_date` + Überlauf bei 24:00 | `WorldDate` |
| Welt-Update-Countdown | Konstante | `WorldUpdateTimer` |

Bereiche **ohne** Datenquelle (Reisen-Ziele, Aufträge, Nachrichten) zeigen saubere Leerzustände.

---

## 17. Bekannte Einschränkungen & nächste Schritte

| Bereich | Aktueller Stand | Ziel |
|---|---|---|
| Reisen | Client-Simulation (`useVoyages`) | Backend `voyages`-Tabelle |
| Wirtschaft/Handel | Client + localStorage (`useEconomy`) | Supabase `stock` + `transfer_goods` |
| Dummy-Schiff „Resolute" | Immer sichtbar | Entfernen nach Backend-Anbindung |
| Wiki GitHub-Connector | `REPO` ggf. Platzhalter | Repo-URL konfigurieren |
| Aufträge-Panel | UI vorhanden, keine Backend-Daten | Auftrags-System |
| Diplomatie-Panel | UI vorhanden, keine Backend-Daten | Fraktionsbeziehungen |
| Tick-Intervall | Client-Konstante | Aus Backend `world_state` |

---

## 18. Wichtige Dateien (Quick Reference)

| Datei | Rolle |
|---|---|
| `src/pages/Game.jsx` | Hauptspielseite, Layout-Orchestrierung |
| `src/hooks/useGameState.js` | Zentraler Spielzustand-Hook |
| `src/lib/gameData.js` | Backend → Frontend Transformation |
| `src/lib/portServices.js` | Hafendienst-Verfügbarkeit |
| `src/lib/mapGeography.js` | Hafen-Koordinaten & Landmassen |
| `src/lib/format.js` | Formatierung, Ruf-Rang, Stufen |
| `src/index.css` | Design-Tokens & UI-Klassen |
| `base44/functions/gameState/entry.ts` | Haupt-Backend-Endpoint |
| `base44/functions/createPlayer/entry.ts` | Onboarding |
| `AGENTS.md` | Persistente App-Kern-Beschreibung für KI-Agenten |

---

*Erstellt automatisch aus dem Repository-Stand. Für Änderungen am App-Kern siehe `AGENTS.md`.*
