import React from "react";
import { useWorldTime } from "@/hooks/useWorldTime";

// Laufendes Spieldatum (Tag + Monat, OHNE Jahr). Zählt mit der Weltuhr weiter:
// erreicht die Weltzeit 24:00, springt das Datum auf den nächsten Tag.
// Das Jahr wird bewusst weder verändert noch angezeigt — Basis für spätere Jahreszeiten.
export default function WorldDate({ gameDate, lastTickAt, className = "" }) {
  const { dayOffset } = useWorldTime(lastTickAt);

  if (!gameDate) return <span className={className}>—</span>;

  const d = new Date(gameDate + "T00:00:00");
  d.setDate(d.getDate() + dayOffset);
  const label = d.toLocaleDateString("de-DE", { day: "numeric", month: "long" });

  return <span className={className}>{label}</span>;
}