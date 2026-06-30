import React from "react";
import { useWorldTime } from "@/hooks/useWorldTime";

const pad = (n) => String(n).padStart(2, "0");

// Laufende Weltzeit im 24h-Format (nur Stunden:Minuten), abgeleitet aus dem letzten Welt-Tick.
export default function WorldClock({ lastTickAt, className = "" }) {
  const { hours, minutes } = useWorldTime(lastTickAt);

  return (
    <span className={`font-mono tabular-nums text-brass-bright ${className}`}>
      {pad(hours)}:{pad(minutes)}
    </span>
  );
}