# public/ — statische Assets

Dateien in diesem Ordner werden von Vite unverändert unter dem Web-Root ausgeliefert
(z. B. `public/ship-blueprint.png` → erreichbar unter `/ship-blueprint.png`).

## Erwartete Assets

- **`ship-blueprint.png`** — Hintergrundtextur **hinter Schiffsbildern**
  (Wiki: `ShipCard`, `ShipDetail`; Schiff-Ansicht: `ShipView`).
  Wird zentral über die CSS-Variable `--tex-pictureground` in `src/index.css`
  eingebunden (Klasse `.picture-ground`).

  Zum Austauschen einfach eine neue Datei mit exakt diesem Namen hier ablegen —
  ohne Code-Änderung. Solange die Datei fehlt, fällt die Fläche auf die
  Hintergrundfarbe (`--sea`) zurück.
