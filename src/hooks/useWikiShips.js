import { useState, useEffect } from "react";
import { invokeFunction } from "@/api/supabaseClient";

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
        const res = await invokeFunction("wikiShips");
        if (cancelled) return;
        setShips(res?.ships || []);
        if (res?.configured === false || res?.message) setNotice(res.message);
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
