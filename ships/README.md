# Schiffe — `ships/` (Karibik 1765)

Zentrale Datenquelle für alle Schiffstypen. `wikiShips` liest diesen Ordner aus und
speist das Wiki. Ein Ordner pro Schiff (Ordnername frei, z. B. `fregatte/`).

| Datei       | Pflicht | Zweck                                          |
|-------------|---------|------------------------------------------------|
| `ship.json` | ja      | Metadaten, Basiswerte und Ausrüstungsslots     |
| Bild        | nein    | Standbild (`image.*`)                          |
| Video       | nein    | Vorschauvideo (`preview.*`)                    |

## Felder der `ship.json`

| Feld          | Typ    | Pflicht | Bedeutung                                         |
|---------------|--------|---------|---------------------------------------------------|
| `name`        | string | ja      | Anzeigename.                                      |
| `class`       | string | nein    | Klassen-Label (Anzeige).                          |
| `role`        | string | nein    | Rolle (Anzeige).                                  |
| `summary`     | string | nein    | Kurzbeschreibung.                                 |
| `description` | string | nein    | Ausführliche Beschreibung.                        |
| `baseStats`   | object | nein    | Basiswerte (generisch angezeigt).                 |
| `slots`       | object | nein    | Ausrüstungsslots (siehe unten).                   |

### `slots` — je Slot ein Objekt

```json
"slots": {
  "main_battery": {
    "count": 32,
    "default": "18pdr",
    "allowedClasses": ["E", "D", "C", "B"]
  }
}
```

| Feld             | Bedeutung                                                                 |
|------------------|---------------------------------------------------------------------------|
| `count`          | Anzahl Plätze dieses Slots.                                               |
| `default`        | Teile-ID des **ausgerüsteten** Standard-Items (aus `equipment/<slot>/`).  |
| `allowedClasses` | Liste der **Stufen-Buchstaben** (F–S), die hier einsetzbar sind.          |

Im Wiki zeigt jeder Slot das ausgerüstete Standard-Item und – aufgeklappt – alle Items
des Katalogs, deren Klassen-Stufe in `allowedClasses` enthalten ist.

Klassen-Tags der Items: siehe `equipment/README.md` (F → E → D → C → B → A → S,
je Schwer/Mittelschwer/Standard/Mittelleicht/Leicht).
