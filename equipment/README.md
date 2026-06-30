# Ausrüstung — `equipment/` (Karibik 1765)

Zentrale Datenquelle für alle **Ausrüstungsgegenstände**. `wikiShips` liest diesen
Ordner aus und speist das Wiki. Manuell erweiterbar — neue Items erscheinen automatisch.

## Aufbau: ein Ordner je Slot-Kategorie, ein Unterordner je Item

```
equipment/<slotKey>/
    slot.json              # { "key": "main_battery", "label": "Hauptbatterie" }
    <item-id>/part.json    # EIN Gegenstand (manuell anlegen/bearbeiten)
```

Bekannte Slot-Kategorien: `hull_material`, `main_battery`, `deck_gun`, `ammunition`.
Neue Kategorie = neuer Ordner mit `slot.json`.

## `part.json` — ein Ausrüstungsgegenstand

| Feld      | Typ    | Pflicht | Bedeutung                                                       |
|-----------|--------|---------|-----------------------------------------------------------------|
| `id`      | string | ja      | Eindeutige ID (= Ordnername, z. B. `18pdr`).                    |
| `slot`    | string | ja      | Slot-Kategorie (`main_battery` …).                             |
| `name`    | string | ja      | Anzeigename.                                                    |
| `class`   | string | ja      | Klassen-Tag `<Schweregrad>-<Stufe>` (z. B. `Schwer-C`).         |
| `summary` | string | nein    | Kurzbeschreibung.                                               |
| `stats`   | object | nein    | Beliebige Werte (generisch angezeigt).                          |

### Klassen-Tags (manuell vergeben)

**Zuerst der Schweregrad, dann die Stufe.**
Schweregrade: **Schwer, Mittelschwer, Standard, Mittelleicht, Leicht**.
Stufen (schwach → stark): **F → E → D → C → B → A → S**.

`class` = `<Schweregrad>-<Stufe>`, z. B. `Leicht-S`, `Schwer-C`, `Standard-F`.

## Welche Items passen an ein Schiff?

In der `ship.json` legt jeder Slot über `allowedClasses` fest, welche **Stufen-Buchstaben**
dort einsetzbar sind. Im Wiki werden je Slot nur Items dieser Stufen als „einsetzbar"
gelistet; `default` markiert das ausgerüstete Standard-Item.

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
2. `part.json` mit `id`, `slot`, `name`, `class` erstellen.
3. Optional `summary` und `stats` ergänzen.
4. Fertig — das Wiki zeigt das Item bei allen Schiffen, deren Slot die Stufe erlaubt.
