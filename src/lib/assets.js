// Baut eine URL zu einer Datei im public/-Ordner und berücksichtigt dabei den
// Basis-Pfad (BASE_URL), unter dem die App läuft — z. B. /caribbean-sovereign/
// auf GitHub-Projekt-Seiten oder / lokal bzw. bei eigener Domain.
export const asset = (path) => `${import.meta.env.BASE_URL}${String(path).replace(/^\//, "")}`;
