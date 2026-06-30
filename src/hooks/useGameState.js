import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { transformGameState } from "@/lib/gameData";

// Zentraler Hook: lädt den kompletten Spielzustand und stellt ein reload() bereit.
export function useGameState() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("gameState", {});
      if (res.data?.error) throw new Error(res.data.error);
      setData(transformGameState(res.data));
    } catch (e) {
      setError(e.message || "Laden fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}