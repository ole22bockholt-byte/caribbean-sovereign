import { handleOptions, jsonResponse } from "../_shared/cors.ts";
import { getUser } from "../_shared/supabase.ts";

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
// KONFIGURATION über Function-Secrets (optional):
//   WIKI_REPO        z. B. "ole22bockholt-byte/caribbean-sovereign" (Standard)
//   WIKI_BRANCH      Standard: "main"
//   WIKI_SHIPS_DIR   Standard: "ships"
//   GITHUB_TOKEN     optional; nur für private Repos oder höhere Rate-Limits nötig.
// =============================================================================

const REPO = Deno.env.get("WIKI_REPO") ?? "ole22bockholt-byte/caribbean-sovereign";
const BRANCH = Deno.env.get("WIKI_BRANCH") ?? "main";
const SHIPS_DIR = Deno.env.get("WIKI_SHIPS_DIR") ?? "ships";
const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN") ?? "";

const VIDEO_EXTS = ["preview.mp4", "preview.webm", "preview.mov"];

// Minimaler Typ für die GitHub-„Contents"-API-Antwort.
interface GitHubContent {
  name: string;
  type: string;
}

function ghHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Accept": "application/vnd.github+json",
    "User-Agent": "karibik-1765-wiki",
  };
  if (GITHUB_TOKEN) headers["Authorization"] = `Bearer ${GITHUB_TOKEN}`;
  return headers;
}

function rawUrl(path: string): string {
  return `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${path}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleOptions();
  try {
    const user = await getUser(req);
    if (!user) return jsonResponse({ error: "Unauthorized" }, { status: 401 });

    const headers = ghHeaders();

    // 1) Schiff-Ordner unter SHIPS_DIR auflisten
    const dirRes = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${SHIPS_DIR}?ref=${BRANCH}`,
      { headers },
    );
    if (!dirRes.ok) {
      return jsonResponse({
        ships: [],
        configured: true,
        message: `Verzeichnis "${SHIPS_DIR}" konnte nicht geladen werden (${dirRes.status}). Prüfe Repo/Pfad/Branch.`,
      });
    }

    const entries = await dirRes.json() as GitHubContent[];
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
      const files = await filesRes.json() as GitHubContent[];
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

    return jsonResponse({ ships, configured: true });
  } catch (error) {
    return jsonResponse({ error: (error as Error).message }, { status: 500 });
  }
});
