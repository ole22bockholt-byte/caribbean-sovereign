import { useCallback, useEffect, useMemo, useState } from "react";

// =============================================================================
// useEconomy — Spieler-Wirtschaft (Gold-Delta + Warenladung) auf Client-Seite.
//
// Bis das Wirtschafts-Backend (Base44-Funktion + `stock`/`ledger` in Supabase)
// angebunden ist, werden Käufe/Verkäufe hier gehalten und in localStorage
// gesichert — analog zu useVoyages. Ausgangspunkt ist das ECHTE Startgold aus
// gameState; Handel verändert nur das Delta, sodass die HUD-Anzeige konsistent
// bleibt. Beim Anbinden des Backends kann diese Schicht 1:1 ersetzt werden.
// =============================================================================

const STORAGE_KEY = "karibik1765.economy.v1";

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function useEconomy(player) {
  const playerId = player?.id || "anon";
  const baseGold = Number.isFinite(player?.gold) ? player.gold : 0;

  const [store, setStore] = useState(load);
  const state = store[playerId] || { goldDelta: 0, cargo: {} };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch { /* Speicher nicht verfügbar */ }
  }, [store]);

  const update = useCallback(
    (fn) => {
      setStore((prev) => {
        const cur = prev[playerId] || { goldDelta: 0, cargo: {} };
        return { ...prev, [playerId]: fn(cur) };
      });
    },
    [playerId]
  );

  const effectiveGold = baseGold + (state.goldDelta || 0);
  const cargo = state.cargo || {};

  // Warenhandel: side = 'buy' | 'sell'.
  const trade = useCallback(
    ({ side, good, qty, unitPrice }) => {
      const amount = Math.max(1, Math.floor(qty || 0));
      const price = Math.max(0, Math.round(unitPrice || 0));
      if (side === "buy") {
        const cost = amount * price;
        if (baseGold + (state.goldDelta || 0) < cost) return { ok: false, reason: "Nicht genügend Gold." };
        update((cur) => ({
          goldDelta: (cur.goldDelta || 0) - cost,
          cargo: { ...cur.cargo, [good]: (cur.cargo?.[good] || 0) + amount },
        }));
        return { ok: true };
      }
      const have = cargo[good] || 0;
      if (have < amount) return { ok: false, reason: "Nicht genügend Ware im Laderaum." };
      update((cur) => ({
        goldDelta: (cur.goldDelta || 0) + amount * price,
        cargo: { ...cur.cargo, [good]: (cur.cargo?.[good] || 0) - amount },
      }));
      return { ok: true };
    },
    [baseGold, state.goldDelta, cargo, update]
  );

  // Reine Ausgabe (Schiffe/Ausrüstung), ohne Warenladung zu verändern.
  const spend = useCallback(
    (amount) => {
      const cost = Math.max(0, Math.round(amount || 0));
      if (baseGold + (state.goldDelta || 0) < cost) return { ok: false, reason: "Nicht genügend Gold." };
      update((cur) => ({ ...cur, goldDelta: (cur.goldDelta || 0) - cost }));
      return { ok: true };
    },
    [baseGold, state.goldDelta, update]
  );

  const cargoUsed = useMemo(
    () => Object.values(cargo).reduce((sum, q) => sum + (q > 0 ? q : 0), 0),
    [cargo]
  );

  return { effectiveGold, cargo, cargoUsed, trade, spend };
}
