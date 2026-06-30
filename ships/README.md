# Schiffe — `ships/` (Karibik 1765)

Dieses Verzeichnis ist die **zentrale Datenquelle für alle Schiffstypen** des Spiels.
Die Backend-Funktion `wikiShips` liest diesen Ordner aus und speist damit das **Wiki**
in der App. Diese Datei wird bei jeder Änderung an der Schiffs-Struktur aktualisiert.

## Aufbau: ein Ordner pro Schiff

Jedes Schiff ist ein **eigener Unterordner** unter `ships/`. Der Ordnername ist frei
(z. B. `schaluppe/`, `fregatte/`). Ein Schiff-Ordner enthält:

| Datei            | Pflicht | Zweck                                                        |
|------------------|---------|--------------------------------------------------------------|
| `ship.json`      | ja      | Metadaten, Basiswerte und Ausrüstungsslots des Schiffs       |
| Bild             | nein    | Standbild (`.png/.jpg/.jpeg/.gif/.webp/.avif/.svg`)          |
| Video            | nein    | Vorschauvideo (`.mp4/.webm/.mov/.m4v/.ogv`)                  |

**Asset-Erkennung** (Dateiname egal, Endung zählt): explizites `imageFile`/`videoFile`
in `ship.json` > Konventionsname (`image.*` / `preview.*`) > erste passende Datei.
Da das Repo **privat** ist, liest `wikiShips` Assets per GitHub-API mit Auth und liefert
sie als **Data-URLs** (Base64) aus. ⇒ **Vorschauvideos klein halten** (Ladezeit/Größe).

## Stat-Logik: Basis + Ausrüstung

Schiffe haben **keine festen Stats**. Der effektive Wert ergibt sich aus:

> **effektiver Stat = Schiffs-Basis (`baseStats`) + Summe der Modifikatoren aller eingebauten Ausrüstungsteile**

`baseStats` definiert die Grundwerte des Schiffstyps, `slots` definiert **wie viele**
Ausrüstungsplätze je Typ das Schiff hat. Welche Teile eingebaut sind, wird später pro
Schiff in der Datenbank verwaltet (Migration `0005_ship_equipment.sql`).

## Felder der `ship.json`

| Feld          | Typ     | Pflicht | Bedeutung                                                                 |
|---------------|---------|---------|---------------------------------------------------------------------------|
| `name`        | string  | **ja**  | Anzeigename des Schiffs (z. B. `"Fregatte"`).                              |
| `class`       | string  | nein    | Klassen-Label (z. B. `"Leicht"`, `"Mittel"`).                             |
| `summary`     | string  | nein    | Kurzbeschreibung (eine Zeile, im Wiki als Untertitel).                    |
| `description` | string  | nein    | Ausführliche Beschreibung (Detailseite).                                  |
| `baseStats`   | object  | nein    | Basiswerte des Schiffstyps (siehe unten).                                 |
| `slots`       | object  | nein    | Anzahl Ausrüstungsslots je Typ (siehe unten).                             |
| `imageFile`   | string  | nein    | Erzwingt eine bestimmte Bilddatei im Ordner.                              |
| `videoFile`   | string  | nein    | Erzwingt eine bestimmte Videodatei im Ordner.                             |

### `baseStats` — Grundwerte des Schiffstyps

Auf diese Werte wird die Ausrüstung addiert. Bekannte Schlüssel (mit Labels/Einheiten im Wiki),
frei erweiterbar — unbekannte Schlüssel werden generisch angezeigt:

| Schlüssel  | Bedeutung                          | Einheit   |
|------------|------------------------------------|-----------|
| `hull`     | Rumpf-Punkte (Widerstandskraft)    | Punkte    |
| `cargo`    | Laderaum                           | Einheiten |
| `speed`    | Geschwindigkeit                    | Knoten    |
| `berths`   | Kojenplätze (max. Besatzung)       | Plätze    |
| `minCrew`  | Mindestbesatzung zum Segeln        | Mann      |

### `slots` — Ausrüstungsplätze je Typ

Gibt an, **wie viele** Slots eines Typs das Schiff besitzt. Die vier Typen entsprechen dem
Datenmodell (`equipment_slot_kind`):

| Schlüssel        | Slot-Typ            | Bedeutung                                  |
|------------------|---------------------|--------------------------------------------|
| `hull_material`  | Rumpfmaterial       | i. d. R. 1 — bestimmt Rumpf-/Schutzboni    |
| `main_battery`   | Hauptbatterie       | Anzahl schwerer Geschützplätze             |
| `deck_gun`       | Deckgeschütze       | Anzahl leichter Geschützplätze             |
| `ammunition`     | Munitionstypen      | Anzahl gleichzeitig führbarer Munitionen   |

## Beispiel (`ships/fregatte/ship.json`)

```json
{
  "name": "Fregatte",
  "class": "Mittel",
  "summary": "Vielseitiges Kriegsschiff — die Arbeitspferde jeder Flotte.",
  "description": "Die Fregatte verbindet solide Feuerkraft mit guter Manövrierfähigkeit ...",
  "baseStats": { "hull": 120, "cargo": 80, "speed": 6, "berths": 220, "minCrew": 200 },
  "slots": { "hull_material": 1, "main_battery": 28, "deck_gun": 8, "ammunition": 3 }
}
```

## Neues Schiff anlegen

1. Neuen Ordner unter `ships/` anlegen (z. B. `galeone/`).
2. `ship.json` mit mindestens `name` erstellen, möglichst mit `baseStats` und `slots`.
3. Optional Bild und/oder Vorschauvideo in den Ordner legen.
4. Fertig — das Wiki zeigt das Schiff automatisch über `wikiShips` an.
