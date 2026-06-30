import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// =============================================================================
// wikiShips — lädt die Schiffstypen-Daten für das Wiki aus einem GitHub-Repo.
//
// ERWEITERBAR: Die Quelle ist hier zentral konfiguriert. Passe REPO / BRANCH /
// SHIPS_PATH an dein Repository an. Die JSON-Datei im Repo soll ein Array von
// Schiffstypen enthalten — Felder sind frei erweiterbar (eigene Stats/Assets),
// das Frontend rendert generisch alle gelieferten Felder.
//
// Beispiel-Schema einer Schiffstyp-Datei (data/ships.json):
// [
//   {
//     "id": "sloop",
//     "name": "Schaluppe",
//     "class": "Leicht",
//     "imageUrl": "https://...",        // optionales eigenes Asset
//     "summary": "Wendiges Aufklärungsschiff ...",
//     "stats": { "Feuerkraft": 6, "Rumpf": 40, "Crew": 25, "Geschwindigkeit": 9 },
//     "description": "Langtext / Markdown ..."
//   }
// ]
// =============================================================================

const REPO = "OWNER/REPO";          // <-- HIER dein Repo eintragen, z.B. "captain/karibik-wiki"
const BRANCH = "main";
const SHIPS_PATH = "data/ships.json";

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

    const url = `https://api.github.com/repos/${REPO}/contents/${SHIPS_PATH}?ref=${BRANCH}`;
    const res = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/vnd.github.raw+json",
        "User-Agent": "karibik-1765-wiki",
      },
    });

    if (!res.ok) {
      return Response.json({
        ships: [],
        configured: true,
        message: `GitHub-Datei konnte nicht geladen werden (${res.status}). Prüfe Repo/Pfad/Branch.`,
      });
    }

    const text = await res.text();
    let ships;
    try {
      ships = JSON.parse(text);
    } catch {
      return Response.json({ ships: [], configured: true, message: "ships.json ist kein gültiges JSON." });
    }

    if (!Array.isArray(ships)) ships = [];
    return Response.json({ ships, configured: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});