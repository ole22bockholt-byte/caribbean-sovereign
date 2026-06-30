# Schiffe (Wiki)

Jeder Unterordner hier ist **ein Schiff**. Das Wiki in der App lädt alle Ordner automatisch.

## Neues Schiff anlegen
1. Neuen Ordner anlegen, z.B. `ships/galeone/`
2. Darin diese Dateien ablegen:
   - `ship.json` (Pflicht) — Metadaten + Stats
   - `image.png` (optional) — grafische Darstellung
   - `preview.mp4` (optional, auch .webm/.mov) — Vorschauvideo, läuft als Hintergrund oben auf der Detailseite

## ship.json
```json
{
  "name": "Schaluppe",
  "class": "Leicht",
  "summary": "Kurzbeschreibung",
  "description": "Langtext",
  "stats": { "Feuerkraft": 6, "Rumpf": 40, "Crew": 25 }
}
```
Nur `name` ist Pflicht. Unter `stats` sind beliebige Werte erlaubt — sie erscheinen automatisch im Wiki.
