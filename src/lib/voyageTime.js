// =============================================================================
// voyageTime — realistische Reisedauer aus Schiffsgeschwindigkeit und Distanz.
//
// Die Routenlänge (Karteneinheiten, aus seaRoute) wird in Seemeilen (sm)
// umgerechnet; zusammen mit der Schiffsgeschwindigkeit in Knoten (sm/h) ergibt
// sich die Reisedauer in GAME-ZEIT:  Stunden = Distanz(sm) / Geschwindigkeit(kn).
// Diese Game-Zeit wird als Ankunfts-Angabe (Tage/Stunden) angezeigt.
//
// Für die Darstellung (Schiffsbewegung auf der Karte) wird die Game-Zeit
// zeitgerafft abgespielt (REAL_SECONDS_PER_GAME_HOUR) — schnellere Schiffe und
// kürzere Routen brauchen dadurch spürbar weniger, längere Routen deutlich mehr.
// Die Weltuhr (useWorldTime) bleibt die Referenz für Datum/Uhrzeit.
// =============================================================================

// Seemeilen je Karteneinheit (Karibik ~1300 sm über die volle Breite).
export const NM_PER_UNIT = 13;

// Zeitraffung: reale Sekunden je Game-Stunde bei der Darstellung der Reise.
const REAL_SECONDS_PER_GAME_HOUR = 2.5;
const MIN_REAL_MS = 20000; // sehr kurze Sprünge dauern trotzdem ~20 s

// Marschgeschwindigkeit in Knoten je Schiffsklasse (Standard, falls das Schiff
// keinen eigenen Geschwindigkeitswert trägt).
const SPEED_BY_CLASS = {
  Schaluppe: 9,
  Brigg: 8,
  Fregatte: 7,
  Galeone: 5,
};

export function shipSpeedKnots(ship) {
  if (Number.isFinite(ship?.speed)) return ship.speed;
  if (Number.isFinite(ship?.stats?.speed)) return ship.stats.speed;
  return SPEED_BY_CLASS[ship?.class] ?? 7;
}

// Liefert { distanceNm, gameMinutes, realMs } für eine Route der Länge `length`.
export function estimateVoyage(length, speedKn) {
  const speed = speedKn > 0 ? speedKn : 7;
  const distanceNm = length * NM_PER_UNIT;
  const gameHours = distanceNm / speed;
  const gameMinutes = gameHours * 60;
  const realMs = Math.max(MIN_REAL_MS, Math.round(gameHours * REAL_SECONDS_PER_GAME_HOUR * 1000));
  return { distanceNm: Math.round(distanceNm), gameMinutes, realMs };
}

// Game-Zeit als kompakte deutsche Angabe (z. B. „6 Tg 14 Std", „8 Std", „25 Min").
export function formatGameDuration(gameMinutes) {
  const gm = Math.max(0, Math.round(gameMinutes));
  const d = Math.floor(gm / 1440);
  const h = Math.floor((gm % 1440) / 60);
  const m = gm % 60;
  if (d > 0) return `${d} Tg ${h} Std`;
  if (h > 0) return `${h} Std`;
  return `${Math.max(1, m)} Min`;
}
