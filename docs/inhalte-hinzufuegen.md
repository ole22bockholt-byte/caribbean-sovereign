# Inhalte hinzufügen — Schiffe, Ausrüstung, Personen

Diese Seite ist der zentrale Einstieg für Entwickler:innen, die dem Spiel neue Inhalte
hinzufügen. Alle Inhalte sind **dateibasierte Kataloge** im Repo (ein Ordner je Objekt),
von Hand editierbar und ohne Code-Änderung erweiterbar.

## Überblick

| Katalog          | Ordner         | Was drin ist                                   | Detail-Doku                                   |
|------------------|----------------|------------------------------------------------|-----------------------------------------------|
| **Schiffe**      | `ships/`       | Schiffstypen: Basiswerte + Ausrüstungsslots    | [`ships/README.md`](../ships/README.md)       |
| **Ausrüstung**   | `equipment/`   | Rumpf, Batterie, Decksgeschütze, Munition      | [`equipment/README.md`](../equipment/README.md) |
| **Personen**     | `characters/`  | Kapitäne, Offiziere, Crew                      | [`characters/README.md`](../characters/README.md) |

Grundprinzip überall: **ein Ordner = ein Objekt**, mit einer Pflicht-JSON-Datei und
optionalen Assets (Bild/Video). Ordnernamen sind die IDs.

## Nach jeder Änderung: validieren

```bash
npm run validate:content
```

Der Validator (`scripts/validate-content.mjs`, ohne externe Abhängigkeiten) prüft alle
drei Kataloge auf ein einheitliches Schema und – wichtig – auf **korrekte Querverweise**
(z. B. dass ein Schiffs-Slot ein existierendes Ausrüstungs-Item als `default` nennt und
dessen Schweregrad erlaubt ist). Exit-Code 0 = alles gültig, 1 = Fehler (CI-tauglich).
Warnungen (⚠) sind Hinweise und lassen den Lauf grün.

## Das Ausrüstungs-Schema in einem Satz

Jedes Ausrüstungsteil trägt ein `class`-Tag `"<Schweregrad>-<Stufe>"`:

- **Schweregrad** (`Schwer` · `Mittelschwer` · `Standard` · `Mittelleicht` · `Leicht`) →
  bestimmt die **Passform**; ein Schiffs-Slot erlaubt bestimmte Schweregrade via
  `allowedWeights`.
- **Stufe** (`F → E → D → C → B → A → S`, schwach → stark) → **Stärke/Progression**;
  optional per `allowedTiers` am Slot begrenzbar.

So legt jede Schiffsklasse ihr eigenes „Fitting-Fenster" fest (z. B. Schaluppe nur leichte
Geschütze, Fregatte mittelschwere bis schwere).

## Schnell-Rezepte

### Neues Schiff
```
ships/<id>/ship.json     # Pflicht: name; optional: baseStats, slots (mit allowedWeights)
ships/<id>/image.png     # optional
ships/<id>/preview.mp4   # optional
```

### Neue Ausrüstung
```
equipment/<slot>/<item>/part.json   # Pflicht: id (==Ordner), slot (==Slot-key), name, class
```
Neue Slot-Kategorie = neuer Ordner `equipment/<slot>/slot.json` mit `key` (==Ordnername) + `label`.

### Neue Person
```
characters/<id>/character.json   # Pflicht: name; optional: category, factionCode, skills, …
characters/<id>/image.webp       # optional
```

Details, alle Felder und Beispiele stehen in den drei verlinkten README-Dateien.

## Hinweis zum Wiki

Das In-Game-Wiki lädt Schiffsdaten über die Supabase Edge Function
`supabase/functions/wikiShips/index.ts` aus einem GitHub-Repo. Repo/Branch/Verzeichnis
sind über die Defaults oben in der Function bzw. die Function-Secrets `WIKI_REPO`/
`WIKI_BRANCH`/`WIKI_SHIPS_DIR` konfigurierbar (optionales `GITHUB_TOKEN` für private Repos
oder höhere Rate-Limits). Die Katalogdateien in diesem Repo sind die Quelle; das Wiki ist
die read-only Anzeige davon.
