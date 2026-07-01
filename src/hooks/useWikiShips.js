import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

// =============================================================================
// useWikiShips — lädt den Schiffstypen-Katalog aus der Backend-Funktion
// `wikiShips` (GitHub-Connector). Gemeinsame Quelle für das Wiki UND den
// Schiffshändler, damit beide dieselben Assets/Daten nutzen.
// =============================================================================
export function useWikiShips() {
  const [ships, setShips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await base44.functions.invoke("wikiShips", {});
        if (cancelled) return;
        setShips(res.data?.ships || []);
        if (res.data?.configured === false || res.data?.message) setNotice(res.data.message);
      } catch {
        if (!cancelled) setNotice("Schiffsdaten konnten nicht geladen werden.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { ships, loading, notice };
}
