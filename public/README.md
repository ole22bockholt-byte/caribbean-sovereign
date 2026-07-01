# public/ — statische Assets

Dateien in diesem Ordner werden von Vite unverändert unter dem Web-Root ausgeliefert
(z. B. `public/datei.png` → erreichbar unter `<BASE_URL>datei.png`).

## Spiel-Grafiken

Die im Spiel verwendeten Bilder liegen unter **`public/assets/`** (Pergament,
Startbildschirm, Hafen/Karte, Fraktionsflaggen). Sie werden über den Helfer
`src/lib/assets.js` base-pfad-sicher eingebunden. Zum Austauschen die jeweilige
Datei dort ersetzen.

## Texturen

Die auswechselbaren UI-Texturen (z. B. `--tex-pictureground`, `--tex-outline`)
liegen unter **`src/assets/textures/`** und werden zentral über CSS-Variablen in
`src/index.css` eingebunden. Sie werden von Vite gebündelt (korrekter Basis-Pfad).
Zum Austauschen die Datei dort ersetzen — ohne Code-Änderung.
