import React, { useState, useEffect } from "react";

// Tick-Intervall der Welt (siehe Automation): 30 Minuten Echtzeit = 1 Spieltag.
const TICK_INTERVAL_SECONDS = 1800;
// Eine vergangene Tick-Periode entspricht 24 Spielstunden -> Spielsekunden je Echtsekunde.
const GAME_SECONDS_PER_REAL_SECOND = (24 * 3600) / TICK_INTERVAL_SECONDS;

const pad = (n) => String(n).padStart(2, "0");

// Laufende Weltzeit im 24h-Format, abgeleitet aus dem letzten Welt-Tick.
export default function WorldClock({ lastTickAt, className = "" }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const anchor = lastTickAt ? new Date(lastTickAt).getTime() : now;
  const realElapsed = Math.max(0, (now - anchor) / 1000);
  const gameSeconds = Math.floor(realElapsed * GAME_SECONDS_PER_REAL_SECOND) % (24 * 3600);

  const h = Math.floor(gameSeconds / 3600);
  const m = Math.floor((gameSeconds % 3600) / 60);
  const s = gameSeconds % 60;

  return (
    <span className={`font-mono tabular-nums text-brass-bright ${className}`}>
      {pad(h)}:{pad(m)}:{pad(s)}
    </span>
  );
}