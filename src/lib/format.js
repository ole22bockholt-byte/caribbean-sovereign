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
  own: "#caa65a",
  neutral: "#6b7280",
  enemy: "#9b1c2e",
  pirate: "#1f2937",
};