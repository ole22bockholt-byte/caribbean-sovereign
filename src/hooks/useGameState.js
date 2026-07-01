import { useState, useEffect, useCallback } from "react";
import { invokeFunction } from "@/api/supabaseClient";
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
      const res = await invokeFunction("gameState");
      setData(transformGameState(res));
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