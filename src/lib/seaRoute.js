// =============================================================================
// seaRoute — physische Seewege zwischen zwei Punkten (0..100-Koordinaten).
//
// Ein Rasternetz über die Karte markiert Land (bzw. küstennahes Wasser) als
// blockiert. A* findet den kürzesten Wasserweg; anschließend wird der Pfad per
// Sichtlinien-Glättung auf wenige Wegpunkte reduziert. So umsegeln Schiffe die
// Inseln, statt über Land zu fahren.
// =============================================================================

import { isBlocked } from "./mapGeography.js";

const GRID = 160; // Zellen je Achse
const CELL = 100 / GRID; // Zellgröße in Karteneinheiten
const CLEARANCE = 0.45; // Sicherheitsabstand zur Küste beim Glätten
const GRID_MARGIN = 0.35; // Küstenpuffer beim Rastern (schmale Kanäle bleiben frei)

// Reisedauer aus der Weglänge (Einheiten). Client-seitige Taktung, damit die
// Bewegung sichtbar ist: kurze Sprünge ~einige Sekunden, Querungen ~1 Minute.
const MS_PER_UNIT = 520;
const MIN_MS = 4000;
export function estimateDurationMs(length) {
  return Math.max(MIN_MS, Math.round(length * MS_PER_UNIT));
}

// Rasternetz einmalig aufbauen (blocked[row][col]).
let blockedGrid = null;
function grid() {
  if (blockedGrid) return blockedGrid;
  blockedGrid = [];
  for (let r = 0; r < GRID; r++) {
    const row = new Uint8Array(GRID);
    for (let c = 0; c < GRID; c++) {
      row[c] = isBlocked((c + 0.5) * CELL, (r + 0.5) * CELL, GRID_MARGIN) ? 1 : 0;
    }
    blockedGrid.push(row);
  }
  return blockedGrid;
}

const cellOf = (v) => Math.min(GRID - 1, Math.max(0, Math.floor(v / CELL)));
const centerOf = (idx) => (idx + 0.5) * CELL;

// Ist die Strecke a→b frei (Wasser inkl. Küstenpuffer)? Feine Abtastung.
function segmentClear(a, b, margin = CLEARANCE) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy);
  const n = Math.max(1, Math.ceil(dist / 0.25));
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    if (isBlocked(a.x + dx * t, a.y + dy * t, margin)) return false;
  }
  return true;
}

// Nächste freie (Wasser-)Zelle per Spiralsuche.
function nearestOpen(g, col, row) {
  if (!g[row][col]) return [col, row];
  for (let radius = 1; radius < GRID; radius++) {
    for (let dr = -radius; dr <= radius; dr++) {
      for (let dc = -radius; dc <= radius; dc++) {
        if (Math.max(Math.abs(dr), Math.abs(dc)) !== radius) continue;
        const nc = col + dc;
        const nr = row + dr;
        if (nc < 0 || nr < 0 || nc >= GRID || nr >= GRID) continue;
        if (!g[nr][nc]) return [nc, nr];
      }
    }
  }
  return [col, row];
}

const key = (c, r) => r * GRID + c;
const NEIGHBORS = [
  [1, 0], [-1, 0], [0, 1], [0, -1],
  [1, 1], [1, -1], [-1, 1], [-1, -1],
];

// A* auf dem Rasternetz zwischen zwei Zellen. Liefert eine Zellenliste.
function astar(g, start, goal) {
  const [sc, sr] = start;
  const [gc, gr] = goal;
  const open = new Map(); // key -> fScore
  const came = new Map();
  const gScore = new Map();
  const h = (c, r) => Math.hypot(c - gc, r - gr);
  const startKey = key(sc, sr);
  gScore.set(startKey, 0);
  open.set(startKey, h(sc, sr));

  while (open.size) {
    // Knoten mit kleinstem fScore holen.
    let curKey = null;
    let best = Infinity;
    for (const [k, f] of open) if (f < best) { best = f; curKey = k; }
    open.delete(curKey);
    const cc = curKey % GRID;
    const cr = Math.floor(curKey / GRID);
    if (cc === gc && cr === gr) {
      const path = [[cc, cr]];
      let k = curKey;
      while (came.has(k)) { k = came.get(k); path.push([k % GRID, Math.floor(k / GRID)]); }
      return path.reverse();
    }
    const curG = gScore.get(curKey);
    for (const [dc, dr] of NEIGHBORS) {
      const nc = cc + dc;
      const nr = cr + dr;
      if (nc < 0 || nr < 0 || nc >= GRID || nr >= GRID) continue;
      if (g[nr][nc]) continue;
      // Diagonale nicht durch blockierte Ecken quetschen.
      if (dc !== 0 && dr !== 0 && (g[cr][nc] || g[nr][cc])) continue;
      const step = dc !== 0 && dr !== 0 ? 1.41421356 : 1;
      const tentative = curG + step;
      const nKey = key(nc, nr);
      if (tentative < (gScore.get(nKey) ?? Infinity)) {
        came.set(nKey, curKey);
        gScore.set(nKey, tentative);
        open.set(nKey, tentative + h(nc, nr));
      }
    }
  }
  return null;
}

// Pfad per Sichtlinie glätten: Wegpunkte überspringen, solange die direkte
// Strecke frei bleibt (Küstenpuffer). Arbeitet ausschließlich auf Wasserpunkten.
function smooth(points) {
  if (points.length <= 2) return points.slice();
  const out = [points[0]];
  let anchor = 0;
  for (let i = 2; i < points.length; i++) {
    if (!segmentClear(points[anchor], points[i])) {
      out.push(points[i - 1]);
      anchor = i - 1;
    }
  }
  out.push(points[points.length - 1]);
  return out;
}

export function routeLength(points) {
  let len = 0;
  for (let i = 1; i < points.length; i++) {
    len += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }
  return len;
}

// Öffentliche API: Seeweg von {x,y} nach {x,y}.
// Liefert { points:[{x,y}...], length, durationMs }.
export function computeSeaRoute(from, to) {
  const g = grid();
  const start = nearestOpen(g, cellOf(from.x), cellOf(from.y));
  const goal = nearestOpen(g, cellOf(to.x), cellOf(to.y));
  const cellPath = astar(g, start, goal);

  let points;
  if (!cellPath) {
    points = [{ x: from.x, y: from.y }, { x: to.x, y: to.y }];
  } else {
    // Wasser-Wegpunkte (Zellmittelpunkte) glätten, dann die echten Hafenpunkte
    // an den Enden anhängen — so bleibt die Mittelstrecke garantiert im Wasser.
    const mid = cellPath.map(([c, r]) => ({ x: centerOf(c), y: centerOf(r) }));
    const smoothed = smooth(mid);
    points = [{ x: from.x, y: from.y }, ...smoothed, { x: to.x, y: to.y }];
  }
  const length = routeLength(points);
  return { points, length, durationMs: estimateDurationMs(length) };
}

// Position & Kurs auf einem Pfad zum Fortschritt t (0..1).
export function pointAlong(points, t) {
  if (!points || points.length === 0) return { x: 0, y: 0, heading: 0 };
  if (points.length === 1) return { ...points[0], heading: 0 };
  const total = routeLength(points);
  const target = Math.min(1, Math.max(0, t)) * total;
  let acc = 0;
  for (let i = 1; i < points.length; i++) {
    const seg = Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    if (acc + seg >= target || i === points.length - 1) {
      const local = seg === 0 ? 0 : (target - acc) / seg;
      const x = points[i - 1].x + (points[i].x - points[i - 1].x) * local;
      const y = points[i - 1].y + (points[i].y - points[i - 1].y) * local;
      const heading =
        (Math.atan2(points[i].y - points[i - 1].y, points[i].x - points[i - 1].x) * 180) / Math.PI;
      return { x, y, heading };
    }
    acc += seg;
  }
  const last = points[points.length - 1];
  return { ...last, heading: 0 };
}
