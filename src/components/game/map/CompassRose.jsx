import React from "react";

// Dekorative Kompassrose (feste Größe, damit unverzerrt) — Seekarten-Stil.
export default function CompassRose({ className = "" }) {
  return (
    <svg width="66" height="66" viewBox="0 0 100 100" className={className} aria-hidden="true">
      <g fill="none" stroke="var(--brass)" strokeOpacity="0.6">
        <circle cx="50" cy="50" r="34" strokeWidth="1.2" />
        <circle cx="50" cy="50" r="26" strokeWidth="0.6" strokeOpacity="0.35" />
      </g>
      {/* Nebenrichtungen */}
      <path d="M50 50 L64 36 L54 50 Z M50 50 L64 64 L50 54 Z M50 50 L36 64 L46 50 Z M50 50 L36 36 L50 46 Z"
        fill="var(--brass)" fillOpacity="0.35" />
      {/* Hauptrichtungen */}
      <path d="M50 12 L55 50 L50 45 L45 50 Z" fill="var(--brass-bright)" />
      <path d="M50 88 L45 50 L50 55 L55 50 Z" fill="var(--brass)" fillOpacity="0.7" />
      <path d="M12 50 L50 45 L45 50 L50 55 Z" fill="var(--brass)" fillOpacity="0.7" />
      <path d="M88 50 L50 55 L55 50 L50 45 Z" fill="var(--brass)" fillOpacity="0.7" />
      <text x="50" y="9" textAnchor="middle" fontSize="11" fontFamily="Cinzel, serif" fill="var(--brass-bright)">N</text>
    </svg>
  );
}
