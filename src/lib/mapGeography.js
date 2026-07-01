// =============================================================================
// mapGeography — geografische Grundlage der Karibik-Karte (Stand ~1765).
//
// Koordinatensystem: x (0 = West, 100 = Ost) und y (0 = Nord, 100 = Süd) in
// Prozent — identisch zum Backend-Feld `ports.x/y`. So liegen SVG-Landmassen,
// Gitter und die (per left%/top% positionierten) Hafen-Pins exakt übereinander.
//
// Die Landmassen sind eine stilisierte, aber wiedererkennbare Darstellung der
// realen Karibik: Kuba, Hispaniola, Jamaika, Puerto Rico, die Bahamas, die
// Kleinen Antillen, Yucatán/Florida sowie die Tierra Firme (spanisches
// Festland). Die schiffbaren Kanäle zwischen den Inseln bleiben Wasser, damit
// Reisen physisch um Land herum führen.
//
// PORT_CATALOG ist die Quelle der Wahrheit für die *Kartenposition* und den
// historischen Charakter der Häfen. Das Backend (seedWorld / Migration) hält
// dieselben Codes/Positionen; das Frontend richtet Backend-Häfen anhand des
// Codes an diesem Katalog aus, damit die Karte auch vor einem Reseed korrekt
// aussieht.
// =============================================================================

// Landmassen als Polygone [ [x,y], ... ]. `label` (optional) = Beschriftung,
// `faction` (optional) = dominante Kolonialmacht für die politische Karte.
export const LANDMASSES = [
  {
    id: "florida",
    label: "FLORIDA",
    labelAt: [16, 3],
    faction: "gb",
    points: [
      [6, -2], [30, -2], [31, 4], [26, 8], [20, 10], [14, 9], [9, 6], [6, 2],
    ],
  },
  {
    id: "yucatan",
    label: "YUCATÁN",
    labelAt: [4, 34],
    faction: "es",
    points: [
      [-2, 14], [9, 15], [11, 22], [10, 30], [8, 40], [4, 49], [-2, 50],
    ],
  },
  {
    id: "cuba",
    label: "KUBA",
    labelAt: [30, 26],
    faction: "es",
    points: [
      [13, 27], [17, 21], [25, 19], [34, 19], [42, 22], [49, 30], [50, 34],
      [47, 35], [39, 33], [30, 32], [21, 31], [15, 30],
    ],
  },
  {
    id: "jamaica",
    label: "JAMAIKA",
    labelAt: [39, 44],
    faction: "gb",
    points: [
      [35, 43], [40, 41], [45, 42], [46, 45], [43, 47], [37, 47], [34, 45],
    ],
  },
  {
    id: "hispaniola",
    label: "HISPANIOLA",
    labelAt: [60, 40],
    faction: "fr",
    points: [
      [49, 38], [52, 35], [58, 34], [66, 35], [71, 39], [70, 43], [65, 45],
      [59, 46], [55, 46], [51, 45], [49, 44], [52, 42], [50, 41],
    ],
  },
  {
    id: "tortuga",
    points: [[52, 31.5], [56, 30.8], [57.2, 32.4], [53, 33.2]],
  },
  {
    id: "puerto_rico",
    label: "PUERTO RICO",
    labelAt: [77, 44],
    faction: "es",
    points: [[74, 40], [80.5, 39.7], [81.5, 41.8], [78, 43], [74, 43]],
  },
  {
    id: "bahamas_1",
    label: "BAHAMAS",
    labelAt: [64, 8],
    faction: "gb",
    points: [[55, 9], [62, 8], [65, 11], [61, 14], [55, 13]],
  },
  { id: "bahamas_2", points: [[67, 16], [73, 15], [75, 18], [70, 20], [65, 19]] },
  { id: "bahamas_3", points: [[48, 12], [53, 11], [54, 14], [49, 15]] },
  // Kleine Antillen (Bogen im Osten)
  { id: "virgin", points: [[82.5, 38.5], [85.5, 38], [86.5, 40], [83.5, 41]] },
  {
    id: "st_eustatius",
    points: [[85, 45], [87.4, 44.3], [88.2, 46.2], [85.8, 47]],
  },
  {
    id: "guadeloupe",
    points: [[87, 50], [90, 49.2], [91, 52], [88, 53]],
  },
  {
    id: "martinique",
    points: [[88, 56], [91, 55.5], [92, 58.5], [89, 60]],
  },
  { id: "st_vincent", points: [[88, 64], [90, 63.6], [90.6, 66], [87.6, 66.6]] },
  {
    id: "barbados",
    points: [[93, 62], [95.4, 61.8], [95.6, 64], [93.2, 64.2]],
  },
  {
    id: "trinidad",
    faction: "es",
    points: [[85, 74], [92, 73], [93.5, 78], [87, 79.5]],
  },
  // Niederländische ABC-Inseln vor der Festlandküste
  {
    id: "curacao",
    points: [[58, 72], [63, 71.5], [64, 74.5], [59, 75.2]],
  },
  { id: "aruba", points: [[51, 73], [54, 72.6], [54.6, 74.6], [51.4, 75]] },
  {
    id: "tierra_firme",
    label: "TIERRA FIRME",
    labelAt: [50, 95],
    faction: "es",
    points: [
      [-2, 66], [8, 63], [17, 65], [23, 71], [26, 79], [31, 86], [40, 84],
      [50, 86], [62, 83], [74, 85], [86, 83], [97, 85], [102, 90], [102, 102],
      [-2, 102],
    ],
  },
];

// Historische Häfen der Karibik um 1765. type: 'fort' (befestigt),
// 'harbor' (Handelshafen), 'pirate' (Freibeuter), 'neutral' (freier Hafen).
export const PORT_CATALOG = {
  // --- Bestehende Codes (mit korrigierter Geografie) ---
  port_royal: { name: "Port Royal", faction: "gb", type: "fort", x: 42, y: 45.5 },
  kingston: { name: "Kingston", faction: "gb", type: "harbor", x: 44.5, y: 46.5 },
  havana: { name: "Havanna", faction: "es", type: "fort", x: 24, y: 20 },
  santiago: { name: "Santiago de Cuba", faction: "es", type: "harbor", x: 47, y: 34.5 },
  cartagena: { name: "Cartagena", faction: "es", type: "fort", x: 40, y: 82 },
  tortuga: { name: "Tortuga", faction: "pirate", type: "pirate", x: 54.5, y: 32.4 },
  petit_goave: { name: "Petit-Goâve", faction: "fr", type: "harbor", x: 51.5, y: 45 },
  willemstad: { name: "Willemstad", faction: "nl", type: "harbor", x: 60.5, y: 73.5 },
  nassau: { name: "Nassau", faction: "neutral", type: "neutral", x: 60, y: 11 },
  // --- Historisch ergänzte Häfen ---
  cap_francais: { name: "Cap-Français", faction: "fr", type: "fort", x: 53, y: 34.6 },
  san_juan: { name: "San Juan", faction: "es", type: "fort", x: 77, y: 39.3 },
  santo_domingo: { name: "Santo Domingo", faction: "es", type: "harbor", x: 64, y: 45.5 },
  bridgetown: { name: "Bridgetown", faction: "gb", type: "harbor", x: 94, y: 63 },
  fort_royal: { name: "Fort-Royal", faction: "fr", type: "fort", x: 89.5, y: 58 },
  basse_terre: { name: "Basse-Terre", faction: "fr", type: "harbor", x: 88, y: 51.5 },
  oranjestad: { name: "Oranjestad", faction: "nl", type: "neutral", x: 86, y: 45.8 },
  portobelo: { name: "Portobelo", faction: "es", type: "fort", x: 24, y: 79 },
  port_of_spain: { name: "Port of Spain", faction: "es", type: "harbor", x: 88, y: 76 },
  campeche: { name: "Campeche", faction: "es", type: "harbor", x: 9.5, y: 25 },
};

// Sichtbare Meeresbeschriftungen (rein dekorativ).
export const SEA_LABELS = [
  { text: "GOLF VON MEXIKO", x: 20, y: 12, size: 13 },
  { text: "ATLANTISCHER OZEAN", x: 82, y: 22, size: 13 },
  { text: "KARIBISCHES MEER", x: 66, y: 62, size: 16 },
  { text: "KARIBISCHES MEER", x: 30, y: 60, size: 12 },
];

// ---------------------------------------------------------------------------
// Punkt-in-Polygon (Ray-Casting). Prüft, ob (x,y) in einem der Polygone liegt.
// ---------------------------------------------------------------------------
function pointInPolygon(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1];
    const xj = poly[j][0], yj = poly[j][1];
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

// Ist der Punkt (x,y) Land? (in irgendeiner Landmasse)
export function isLand(x, y) {
  for (const m of LANDMASSES) {
    if (pointInPolygon(x, y, m.points)) return true;
  }
  return false;
}

// Wasser mit kleinem Sicherheitsabstand zur Küste (für die Routen-Rasterung).
export function isBlocked(x, y, margin = 0.9) {
  if (isLand(x, y)) return true;
  if (margin > 0) {
    if (isLand(x + margin, y) || isLand(x - margin, y)) return true;
    if (isLand(x, y + margin) || isLand(x, y - margin)) return true;
  }
  return false;
}

// Liegt die Strecke a→b vollständig im Wasser? (feine Abtastung)
export function segmentInWater(a, b, step = 0.5) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy);
  const n = Math.max(1, Math.ceil(dist / step));
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    if (isLand(a.x + dx * t, a.y + dy * t)) return false;
  }
  return true;
}

// SVG-Path-String eines Polygons (für <path d=...>).
export function polygonPath(points) {
  return points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x} ${y}`).join(" ") + " Z";
}
