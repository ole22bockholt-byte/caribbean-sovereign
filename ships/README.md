# Schiffe — `ships/` (Karibik 1765)

Zentrale Datenquelle für alle Schiffstypen. Ein Ordner pro Schiff (Ordnername frei,
z. B. `fregatte/`).

> **Übersicht & Ablauf zum Anlegen:** siehe [`docs/inhalte-hinzufuegen.md`](../docs/inhalte-hinzufuegen.md).
> **Prüfen:** `npm run validate:content` validiert Schema + Slot-/Item-Referenzen.

| Datei       | Pflicht | Zweck                                          |
|-------------|---------|------------------------------------------------|
| `ship.json` | ja      | Metadaten, Basiswerte und Ausrüstungsslots     |
| Bild        | nein    | Standbild (`image.*`, z. B. `resolute.png`)    |
| Video       | nein    | Vorschauvideo (`preview.*` / `*.mp4`)          |

## Felder der `ship.json`

| Feld          | Typ    | Pflicht | Bedeutung                                         |
|---------------|--------|---------|---------------------------------------------------|
| `name`        | string | ja      | Anzeigename.                                      |
| `class`       | string | nein    | Klassen-Label (Anzeige, z. B. „Fregatte, 5th Rate"). |
| `role`        | string | nein    | Rolle (Anzeige).                                  |
| `summary`     | string | nein    | Kurzbeschreibung.                                 |
| `description` | string | nein    | Ausführliche Beschreibung.                        |
| `baseStats`   | object | nein    | Basiswerte des Rumpfes (nur Zahlen; generisch angezeigt). |
| `slots`       | object | nein    | Ausrüstungsslots (siehe unten).                   |
| `imageFile`   | string | nein    | Abweichender Bilddateiname im Ordner.             |
| `videoFile`   | string | nein    | Abweichender Videodateiname im Ordner.            |

## `slots` — je Slot ein Objekt

Der Schlüssel jedes Slots ist eine **Slot-Kategorie** aus `equipment/` (z. B.
`main_battery`). Ein unbekannter Slot-Key ist ein Fehler.

```json
"slots": {
  "main_battery": {
    "count": 32,
    "default": "18pdr",
    "allowedWeights": ["Mittelschwer", "Schwer"],
    "allowedTiers": ["E", "D", "C", "B"]
  }
}
```

| Feld             | Pflicht | Bedeutung                                                                                   |
|------------------|---------|---------------------------------------------------------------------------------------------|
| `count`          | ja      | Anzahl Plätze dieses Slots (positive Ganzzahl).                                             |
| `default`        | ja      | Item-ID des ab Werk ausgerüsteten Teils (muss in `equipment/<slot>/` existieren).           |
| `allowedWeights` | ja      | Liste erlaubter **Schweregrade** — bestimmt die Passform. Aus: `Schwer`, `Mittelschwer`, `Standard`, `Mittelleicht`, `Leicht`. |
| `allowedTiers`   | nein    | Optionale Begrenzung erlaubter **Stufen** (Progression). Aus: `F`, `E`, `D`, `C`, `B`, `A`, `S`. |

**Passform-Regel:** Ein Item passt in den Slot, wenn sein Schweregrad in `allowedWeights`
liegt (und – falls gesetzt – seine Stufe in `allowedTiers`). Der Schweregrad und die Stufe
stecken im `class`-Tag des Items (`<Schweregrad>-<Stufe>`, siehe
[`equipment/README.md`](../equipment/README.md)). Der Validator stellt sicher, dass das
`default`-Item selbst zu `allowedWeights`/`allowedTiers` passt.

## Neues Schiff anlegen

1. Ordner unter `ships/` anlegen (z. B. `ships/galeone/`).
2. `ship.json` mit mindestens `name` erstellen; optional `baseStats` und `slots` ergänzen.
3. Für jeden Slot einen bekannten Slot-Key, `count`, ein gültiges `default`-Item und
   `allowedWeights` setzen.
4. Optional Bild/Video in den Ordner legen.
5. `npm run validate:content` ausführen — grün heißt: alle Slot- und Item-Referenzen stimmen.
