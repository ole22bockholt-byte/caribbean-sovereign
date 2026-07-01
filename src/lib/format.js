// Shared formatting helpers used across the dashboard.

export const formatGold = (n) =>
  new Intl.NumberFormat("de-DE").format(Math.round(n));

export const formatCountdown = (totalSeconds) => {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m ${String(sec).padStart(2, "0")}s`;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

export const ROUTE_COLORS = {
  own: "#c8a24c",
  neutral: "#6b7280",
  enemy: "#b23a46",
  pirate: "#1f2937",
};

// Fünfstufige Verfügbarkeits-/Level-Skala (0..100) -> deutsche Bezeichnung + Ton.
export const LEVELS = [
  { min: 80, label: "Sehr hoch", tone: "pos" },
  { min: 60, label: "Hoch", tone: "pos" },
  { min: 40, label: "Mittel", tone: "brass" },
  { min: 20, label: "Niedrig", tone: "dim" },
  { min: 0, label: "Sehr niedrig", tone: "neg" },
];

export const levelFor = (pct) =>
  LEVELS.find((l) => pct >= l.min) || LEVELS[LEVELS.length - 1];

// Sicherheitsstufe eines Hafens als Wort (für die Hafen-Übersicht).
export const securityLevel = (pct) => levelFor(pct);

// Ruf-Rang aus dem Einfluss abgeleitet (reine Darstellung; kein Backend-Wert).
export const reputationRank = (influence = 0) => {
  if (influence >= 5000) return "Legendär";
  if (influence >= 3000) return "Respektiert";
  if (influence >= 1500) return "Angesehen";
  if (influence >= 600) return "Bekannt";
  if (influence >= 150) return "Geduldet";
  return "Unbekannt";
};