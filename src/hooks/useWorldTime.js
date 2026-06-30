import { useState, useEffect } from "react";

// Eine Spielminute vergeht pro Echtsekunde -> die Weltuhr läuft lückenlos durch.
const GAME_SECONDS_PER_REAL_SECOND = 60;
const DAY_SECONDS = 24 * 3600;

// Zentrale Ableitung der laufenden Weltzeit aus dem letzten Welt-Tick:
//   - hours/minutes: aktuelle Weltuhrzeit (24h)
//   - dayOffset: Anzahl voller Spieltage, die seit dem Tick-Datum vergangen sind
// Datum und Uhr bleiben so immer synchron (Tageswechsel == Uhr-Überlauf bei 24:00).
export function useWorldTime(lastTickAt) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const anchor = lastTickAt ? new Date(lastTickAt).getTime() : now;
  const realElapsed = Math.max(0, (now - anchor) / 1000);
  const totalGameSeconds = Math.floor(realElapsed * GAME_SECONDS_PER_REAL_SECOND);

  const dayOffset = Math.floor(totalGameSeconds / DAY_SECONDS);
  const secondsOfDay = totalGameSeconds % DAY_SECONDS;

  return {
    dayOffset,
    hours: Math.floor(secondsOfDay / 3600),
    minutes: Math.floor((secondsOfDay % 3600) / 60),
  };
}