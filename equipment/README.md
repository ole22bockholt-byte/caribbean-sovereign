# Ausrüstung — `equipment/` (Karibik 1765)

Zentrale Datenquelle für alle **Ausrüstungsgegenstände**. Manuell erweiterbar — neue
Items erscheinen automatisch in Werkzeugen, die den Katalog auslesen.

> **Übersicht & Ablauf zum Anlegen:** siehe [`docs/inhalte-hinzufuegen.md`](../docs/inhalte-hinzufuegen.md).
> **Prüfen:** `npm run validate:content` validiert diesen Ordner (Schema + Referenzen).

## Aufbau: ein Ordner je Slot-Kategorie, ein Unterordner je Item

```
equipment/<slotKey>/
    slot.json              # { "key": "main_battery", "label": "Hauptbatterie" }
    <item-id>/part.json    # EIN Gegenstand (manuell anlegen/bearbeiten)
```

Bekannte Slot-Kategorien: `hull_material`, `main_battery`, `deck_gun`, `ammunition`.
Neue Kategorie = neuer Ordner mit `slot.json` (dessen `key` == Ordnername).

## `part.json` — ein Ausrüstungsgegenstand

| Feld      | Typ    | Pflicht | Bedeutung                                                       |
|-----------|--------|---------|-----------------------------------------------------------------|
| `id`      | string | ja      | Eindeutige ID — **muss dem Ordnernamen entsprechen** (`18pdr`). |
| `slot`    | string | ja      | Slot-Kategorie — **muss dem `key` des Slots entsprechen**.      |
| `name`    | string | ja      | Anzeigename.                                                    |
| `class`   | string | ja      | Klassen-Tag `<Schweregrad>-<Stufe>` (z. B. `Schwer-C`).         |
| `summary` | string | nein    | Kurzbeschreibung.                                               |
| `stats`   | object | nein    | Beliebige Werte (generisch angezeigt).                          |

### Klassen-Tag: zwei Achsen (`class`)

Das `class`-Tag kodiert **zwei unabhängige Achsen** in der Form `<Schweregrad>-<Stufe>`:

- **Schweregrad** (physische Bauart): `Schwer`, `Mittelschwer`, `Standard`, `Mittelleicht`, `Leicht`.
  → Entscheidet über die **Passform** an einem Schiff (siehe `allowedWeights` unten).
- **Stufe** (Stärke/Progression, schwach → stark): `F → E → D → C → B → A → S`.
  → Rein qualitativ; optional per `allowedTiers` am Schiff begrenzbar.

Beispiel: `Leicht-S`, `Schwer-C`, `Standard-F`.

## Welche Items passen an ein Schiff?

In der `ship.json` legt **jeder Slot** über `allowedWeights` fest, welche **Schweregrade**
dort einsetzbar sind. Nur Items, deren Schweregrad in `allowedWeights` liegt, passen an
diesen Slot. `default` benennt das ab Werk ausgerüstete Item (dessen Schweregrad muss
selbst in `allowedWeights` liegen — das prüft der Validator). Optional begrenzt
`allowedTiers` zusätzlich die erlaubten Stufen. Details: [`ships/README.md`](../ships/README.md).

## Beispiel `equipment/main_battery/18pdr/part.json`

```json
{
  "id": "18pdr",
  "slot": "main_battery",
  "name": "18-Pfünder",
  "class": "Schwer-C",
  "summary": "Schwerere Geschütze, mehr Durchschlag.",
  "stats": { "Schaden": 18, "Reichweite": "Mittel" }
}
```

## Neues Item anlegen

1. Unterordner unter der Slot-Kategorie anlegen (z. B. `main_battery/32pdr/`).
2. `part.json` mit `id` (== Ordnername), `slot` (== Slot-`key`), `name`, `class` erstellen.
3. Optional `summary` und `stats` ergänzen.
4. `npm run validate:content` ausführen — grün heißt: das Item ist sauber verlinkt und
   erscheint bei allen Schiffen, deren Slot seinen Schweregrad erlaubt.
