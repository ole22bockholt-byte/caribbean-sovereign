import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// =============================================================================
// wikiShips — lädt die Schiffstypen-Daten für das Wiki aus einem GitHub-Repo.
//
// STRUKTUR: Jedes Schiff bekommt einen EIGENEN ORDNER unter SHIPS_DIR. Ein neues
// Schiff anzulegen heißt: einen neuen Unterordner mit diesen Dateien committen.
//
//   <SHIPS_DIR>/<ship-id>/
//       ship.json     (Pflicht)  -> Metadaten + Stats (siehe Schema unten)
//       image.png     (optional) -> grafische Darstellung des Schiffs
//       preview.mp4   (optional) -> Vorschauvideo, läuft als Seiten-Hintergrund
//                                   (auch preview.webm / preview.mov werden erkannt)
//
// ship.json Schema (alle Felder außer "name" optional, frei erweiterbar):
// {
//   "name": "Schaluppe",
//   "class": "Leicht",
//   "summary": "Wendiges Aufklärungsschiff ...",
//   "description": "Langtext ...",
//   "stats": { "Feuerkraft": 6, "Rumpf": 40, "Crew": 25, "Geschwindigkeit": 9 },
//   "imageFile": "image.png",      // optional, Standard: image.png im Ordner
//   "videoFile": "preview.mp4"     // optional, Standard: erste preview.* im Ordner
// }
//
// ERWEITERBAR: stats ist ein freies Objekt — neue Werte erscheinen automatisch im
// Frontend. Pro-Schiff-Ordner ermöglichen beliebig viele Schiffe ohne Konflikte.
// =============================================================================

const REPO = "OWNER/REPO";          // <-- HIER dein Repo eintragen, z.B. "captain/karibik-wiki"
const BRANCH = "main";
const SHIPS_DIR = "ships";          // Verzeichnis, das die Schiff-Ordner enthält

const VIDEO_EXTS = ["preview.mp4", "preview.webm", "preview.mov"];

function ghHeaders(accessToken) {
  return {
    "Authorization": `Bearer ${accessToken}`,
    "Accept": "application/vnd.github+json",
    "User-Agent": "karibik-1765-wiki",
  };
}

function rawUrl(path) {
  return `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${path}`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    if (REPO === "OWNER/REPO") {
      return Response.json({
        ships: [],
        configured: false,
        message: "GitHub-Repository ist noch nicht konfiguriert (REPO in wikiShips/entry.ts).",
      });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection("github");
    const headers = ghHeaders(accessToken);

    // 1) Schiff-Ordner unter SHIPS_DIR auflisten
    const dirRes = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${SHIPS_DIR}?ref=${BRANCH}`,
      { headers },
    );
    if (!dirRes.ok) {
      return Response.json({
        ships: [],
        configured: true,
        message: `Verzeichnis "${SHIPS_DIR}" konnte nicht geladen werden (${dirRes.status}). Prüfe Repo/Pfad/Branch.`,
      });
    }

    const entries = await dirRes.json();
    const shipDirs = Array.isArray(entries) ? entries.filter((e) => e.type === "dir") : [];

    // 2) Pro Ordner ship.json laden und Asset-URLs zusammensetzen
    const ships = [];
    for (const dir of shipDirs) {
      const id = dir.name;
      const base = `${SHIPS_DIR}/${id}`;

      const filesRes = await fetch(
        `https://api.github.com/repos/${REPO}/contents/${base}?ref=${BRANCH}`,
        { headers },
      );
      if (!filesRes.ok) continue;
      const files = await filesRes.json();
      const fileNames = Array.isArray(files) ? files.map((f) => f.name) : [];

      const metaFile = files.find((f) => f.name === "ship.json");
      if (!metaFile) continue;

      const metaRes = await fetch(rawUrl(`${base}/ship.json`), { headers });
      if (!metaRes.ok) continue;
      let meta;
      try {
        meta = JSON.parse(await metaRes.text());
      } catch {
        continue;
      }

      const imageName = meta.imageFile || (fileNames.includes("image.png") ? "image.png" : null);
      const videoName = meta.videoFile || VIDEO_EXTS.find((v) => fileNames.includes(v)) || null;

      ships.push({
        id,
        name: meta.name || id,
        class: meta.class || null,
        summary: meta.summary || null,
        description: meta.description || null,
        stats: meta.stats || {},
        imageUrl: imageName ? rawUrl(`${base}/${imageName}`) : null,
        videoUrl: videoName ? rawUrl(`${base}/${videoName}`) : null,
      });
    }

    return Response.json({ ships, configured: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});