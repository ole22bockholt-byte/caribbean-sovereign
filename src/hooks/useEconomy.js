import { useCallback, useEffect, useMemo, useState } from "react";
import { goodWeight, cargoWeight } from "@/lib/goodsData";

// =============================================================================
// useEconomy — Spieler-Wirtschaft mit PHYSISCHEN, schiffsgebundenen Laderäumen.
//
// Waren liegen nicht in einem abstrakten Inventar, sondern im Laderaum eines
// konkreten Schiffs (holds[shipId]). Jede Ware wiegt Tonnen (goodsData), jedes
// Schiff hat eine Kapazität in Tonnen (ships.cargo_capacity). Käufe verladen in
// ein Schiff, Verkäufe entladen; Umladen verschiebt zwischen zwei Schiffen —
// stets begrenzt durch die freie Tonnage.
//
// Bis das Wirtschafts-/Bestands-Backend (Supabase `stock`) angebunden ist, wird
// der Zustand client-seitig in localStorage gehalten — analog zu useVoyages.
// =============================================================================

const STORAGE_KEY = "karibik1765.economy.v2";

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
  const state = store[playerId] || { goldDelta: 0, holds: {} };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch { /* Speicher nicht verfügbar */ }
  }, [store]);

  const update = useCallback(
    (fn) => {
      setStore((prev) => {
        const cur = prev[playerId] || { goldDelta: 0, holds: {} };
        return { ...prev, [playerId]: fn(cur) };
      });
    },
    [playerId]
  );

  const effectiveGold = baseGold + (state.goldDelta || 0);
  const holds = state.holds || {};

  const holdItems = useCallback((shipId) => holds[shipId] || {}, [holds]);
  const holdWeight = useCallback((shipId) => cargoWeight(holds[shipId]), [holds]);

  // Kauf/Verkauf verladen in / entladen aus einem konkreten Schiff.
  const trade = useCallback(
    ({ side, good, qty, unitPrice, shipId, capacity }) => {
      const amount = Math.max(1, Math.floor(qty || 0));
      const price = Math.max(0, Math.round(unitPrice || 0));
      if (!shipId) return { ok: false, reason: "Kein Schiff zum Verladen im Hafen." };
      const hold = holds[shipId] || {};
      if (side === "buy") {
        const cost = amount * price;
        if (effectiveGold < cost) return { ok: false, reason: "Nicht genügend Gold." };
        const addWeight = amount * goodWeight(good);
        if (Number.isFinite(capacity) && cargoWeight(hold) + addWeight > capacity + 1e-6) {
          return { ok: false, reason: "Laderaum voll — nicht genügend freie Tonnage." };
        }
        update((cur) => {
          const h = { ...(cur.holds?.[shipId] || {}) };
          h[good] = (h[good] || 0) + amount;
          return { goldDelta: (cur.goldDelta || 0) - cost, holds: { ...cur.holds, [shipId]: h } };
        });
        return { ok: true };
      }
      const have = hold[good] || 0;
      if (have < amount) return { ok: false, reason: "Nicht genügend Ware an Bord." };
      update((cur) => {
        const h = { ...(cur.holds?.[shipId] || {}) };
        h[good] = (h[good] || 0) - amount;
        return { goldDelta: (cur.goldDelta || 0) + amount * price, holds: { ...cur.holds, [shipId]: h } };
      });
      return { ok: true };
    },
    [effectiveGold, holds, update]
  );

  // Umladen: Ware zwischen zwei (im selben Hafen liegenden) Schiffen verschieben.
  const transfer = useCallback(
    ({ good, qty, fromShipId, toShipId, toCapacity }) => {
      const amount = Math.max(1, Math.floor(qty || 0));
      if (!fromShipId || !toShipId || fromShipId === toShipId) return { ok: false, reason: "Ziel-Schiff wählen." };
      const from = holds[fromShipId] || {};
      const to = holds[toShipId] || {};
      if ((from[good] || 0) < amount) return { ok: false, reason: "Nicht genügend Ware an Bord." };
      const addWeight = amount * goodWeight(good);
      if (Number.isFinite(toCapacity) && cargoWeight(to) + addWeight > toCapacity + 1e-6) {
        return { ok: false, reason: "Zielladeraum voll." };
      }
      update((cur) => {
        const f = { ...(cur.holds?.[fromShipId] || {}) };
        const t = { ...(cur.holds?.[toShipId] || {}) };
        f[good] = (f[good] || 0) - amount;
        t[good] = (t[good] || 0) + amount;
        return { ...cur, holds: { ...cur.holds, [fromShipId]: f, [toShipId]: t } };
      });
      return { ok: true };
    },
    [holds, update]
  );

  // Reine Ausgabe (Schiffe/Ausrüstung).
  const spend = useCallback(
    (amount) => {
      const cost = Math.max(0, Math.round(amount || 0));
      if (effectiveGold < cost) return { ok: false, reason: "Nicht genügend Gold." };
      update((cur) => ({ ...cur, goldDelta: (cur.goldDelta || 0) - cost }));
      return { ok: true };
    },
    [effectiveGold, update]
  );

  const totalWeight = useMemo(
    () => Object.keys(holds).reduce((s, id) => s + cargoWeight(holds[id]), 0),
    [holds]
  );

  return { effectiveGold, holds, totalWeight, holdItems, holdWeight, trade, transfer, spend };
}
