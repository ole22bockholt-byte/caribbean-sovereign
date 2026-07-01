import { useCallback, useEffect, useMemo, useState } from "react";
import { computeSeaRoute, pointAlong } from "@/lib/seaRoute";
import { estimateVoyage, formatGameDuration } from "@/lib/voyageTime";

// =============================================================================
// useVoyages — verwaltet laufende Schiffsreisen als physische Bewegung über die
// Karte. Bis das Backend Reisen persistiert (Tabelle `voyages`), läuft die
// Simulation client-seitig: ein Seeweg (um Land herum) wird berechnet, das
// Schiff bewegt sich in Echtzeit entlang der Wegpunkte und dockt bei Ankunft
// am Zielhafen an. Der Fortschritt wird in localStorage gesichert, damit
// Reisen über ein Neuladen hinweg fortlaufen.
// =============================================================================

const STORAGE_KEY = "karibik1765.voyages.v1";
const TICK_MS = 120;

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    const cutoff = Date.now() - 60 * 60 * 1000; // 1h alte Reisen verwerfen
    return Array.isArray(arr) ? arr.filter((v) => v.arriveAt > cutoff) : [];
  } catch {
    return [];
  }
}

export function useVoyages(ports) {
  const [voyages, setVoyages] = useState(loadStored);
  const [now, setNow] = useState(() => Date.now());

  const portById = useMemo(() => {
    const m = {};
    for (const p of ports || []) m[p.id] = p;
    return m;
  }, [ports]);

  // Persistenz.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(voyages));
    } catch { /* Speicher nicht verfügbar — ignorieren */ }
  }, [voyages]);

  // Animation nur solange eine Reise läuft.
  const hasActive = voyages.some((v) => v.arriveAt > now);
  useEffect(() => {
    if (!hasActive) return undefined;
    const id = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(id);
  }, [hasActive]);

  const startVoyage = useCallback(
    ({ shipId, shipName, fromPortId, toPortId, speedKn }) => {
      const from = portById[fromPortId];
      const to = portById[toPortId];
      if (!to || fromPortId === toPortId) return null;
      const origin = from || { x: to.x, y: to.y };
      const { points, length } = computeSeaRoute(origin, to);
      // Realistische Reisedauer aus Geschwindigkeit × Distanz (Game-Zeit) +
      // die zeitgeraffte reale Abspieldauer.
      const { distanceNm, gameMinutes, realMs } = estimateVoyage(length, speedKn);
      const departAt = Date.now();
      const voyage = {
        id: `voy_${shipId}_${departAt}`,
        shipId,
        shipName: shipName || "Schiff",
        fromPortId: fromPortId || null,
        toPortId,
        fromName: from?.name || "See",
        toName: to.name,
        route: points,
        length,
        distanceNm,
        gameMinutes,
        speedKn: speedKn || null,
        departAt,
        arriveAt: departAt + realMs,
      };
      // Bestehende Reise desselben Schiffs ersetzen.
      setVoyages((prev) => [...prev.filter((v) => v.shipId !== shipId), voyage]);
      setNow(Date.now());
      return voyage;
    },
    [portById]
  );

  const cancelVoyage = useCallback((shipId) => {
    setVoyages((prev) => prev.filter((v) => v.shipId !== shipId));
  }, []);

  // Aktuell fahrende Reisen inkl. interpolierter Position/Kurs/Restzeit.
  const sailing = useMemo(() => {
    return voyages
      .filter((v) => v.arriveAt > now)
      .map((v) => {
        const t = (now - v.departAt) / (v.arriveAt - v.departAt);
        const pos = pointAlong(v.route, t);
        const remainingFraction = Math.min(1, Math.max(0, 1 - t));
        const gameMinutesRemaining = (v.gameMinutes || 0) * remainingFraction;
        return {
          ...v,
          x: pos.x,
          y: pos.y,
          heading: pos.heading,
          progress: Math.min(1, Math.max(0, t)),
          gameMinutesRemaining,
          etaGameLabel: formatGameDuration(gameMinutesRemaining),
        };
      });
  }, [voyages, now]);

  // Zustands-Überschreibungen je Schiff (fährt / liegt nach Ankunft im Zielhafen).
  const shipOverrides = useMemo(() => {
    const m = {};
    for (const v of voyages) {
      if (v.arriveAt > now) {
        m[v.shipId] = { status: "Unterwegs", currentPortId: null, toName: v.toName, fromName: v.fromName };
      } else {
        // Angekommen: Schiff liegt jetzt im Zielhafen.
        m[v.shipId] = { status: "Im Hafen", currentPortId: v.toPortId };
      }
    }
    return m;
  }, [voyages, now]);

  return { voyages, sailing, shipOverrides, startVoyage, cancelVoyage };
}
