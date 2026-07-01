# Personen — `characters/` (Karibik 1765)

Zentrale Datenquelle für **Kapitäne, Offiziere und Crew** (Kommandeurs-/Personallayer).
Ein Ordner pro Person (Ordnername frei, z. B. `horatio_vane/`).

> **Übersicht & Ablauf zum Anlegen:** siehe [`docs/inhalte-hinzufuegen.md`](../docs/inhalte-hinzufuegen.md).
> **Prüfen:** `npm run validate:content` validiert diesen Ordner.

| Datei             | Pflicht | Zweck                                    |
|-------------------|---------|------------------------------------------|
| `character.json`  | ja      | Stammdaten der Person                    |
| Bild              | nein    | Porträt (`image.*`, z. B. `image.webp`)  |

## Felder der `character.json`

| Feld              | Typ    | Pflicht | Bedeutung                                                                 |
|-------------------|--------|---------|---------------------------------------------------------------------------|
| `name`            | string | ja      | Anzeigename.                                                              |
| `category`        | string | nein    | Rollentyp: `admiral`, `captain`, `naval_officer`, `function_officer`, `crew`. |
| `rank`            | string | nein    | Dienstgrad (Anzeige, z. B. „Kapitän").                                    |
| `factionCode`     | string | nein    | Zugehörige Fraktion: `gb`, `es`, `fr`, `nl`, `pirate`, `neutral`.         |
| `experience`      | string | nein    | Erfahrungs-Label (Anzeige, z. B. „Veteran").                              |
| `rarity`          | string | nein    | Seltenheit: `common`, `uncommon`, `rare`, `legendary`.                    |
| `status`          | string | nein    | Verfügbarkeit (Anzeige, z. B. `available`, `busy`, `assigned`, `wounded`).|
| `commandLimit`    | number | nein    | Max. gleichzeitig kommandierte Schiffe (Ganzzahl ≥ 0).                    |
| `assignedShip`    | string | nein    | Aktuell zugewiesenes Schiff (Anzeige).                                    |
| `skills`          | object | nein    | Fähigkeit → Wert (Ganzzahl, üblich 1–5).                                  |
| `uniqueAbilities` | array  | nein    | Liste `{ "name": string, "description": string }`.                        |
| `summary`         | string | nein    | Kurzbeschreibung.                                                         |

`factionCode` wird gegen die feste Fraktionsliste geprüft (Fehler bei unbekanntem Wert).
`category` und `rarity` erzeugen bei ungewöhnlichen Werten nur eine Warnung.

## Beispiel `characters/horatio_vane/character.json`

```json
{
  "name": "Horatio Vane",
  "category": "admiral",
  "rank": "Admiral",
  "factionCode": "gb",
  "rarity": "legendary",
  "status": "available",
  "commandLimit": 5,
  "skills": { "Taktik": 5, "Führung": 5, "Navigation": 4, "Geschütz": 3, "Moral": 5 },
  "uniqueAbilities": [
    { "name": "Linienbrecher", "description": "Durchbricht feindliche Schlachtlinien …" }
  ],
  "summary": "Ein gefürchteter Flottenkommandant …"
}
```

## Neue Person anlegen

1. Ordner unter `characters/` anlegen (z. B. `characters/mary_read/`).
2. `character.json` mit mindestens `name` erstellen; weitere Felder nach Tabelle ergänzen.
3. Optional ein Porträt (`image.*`) in den Ordner legen.
4. `npm run validate:content` ausführen — grün heißt: die Person ist schemakonform.
