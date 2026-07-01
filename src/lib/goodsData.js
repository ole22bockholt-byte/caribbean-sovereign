// =============================================================================
// goodsData — physikalische Eigenschaften der Handelswaren.
//
// Jede Ware hat ein Gewicht in TONNEN je Einheit. Zusammen mit der Laderaum-
// Kapazität eines Schiffs (ebenfalls in Tonnen, Backend-Feld ships.cargo_capacity)
// bildet das den „physischen" Laderaum: Waren belegen Platz nach Gewicht.
//
// Quelle der Wahrheit für die Anzeige/Logik; das Backend hält dieselben Werte
// (Migration 0006, goods.weight_tons) für spätere serverseitige Bestände.
// =============================================================================

// Gewicht je Einheit in Tonnen (nach Waren-Anzeigename).
export const GOOD_WEIGHT = {
  "Rum": 1,
  "Zucker": 1,
  "Tabak": 0.8,
  "Baumwolle": 0.6,
  "Gewürze": 0.3,
  "Kaffee": 0.7,
  "Schießpulver": 1.2,
  "Bauholz": 1.5,
};

export const DEFAULT_WEIGHT = 1;

export function goodWeight(name) {
  return GOOD_WEIGHT[name] ?? DEFAULT_WEIGHT;
}

// Gesamtgewicht (Tonnen) einer Ladung { warenname: menge }.
export function cargoWeight(cargo) {
  if (!cargo) return 0;
  let t = 0;
  for (const [good, qty] of Object.entries(cargo)) {
    if (qty > 0) t += qty * goodWeight(good);
  }
  return Math.round(t * 10) / 10;
}

// Tonnen hübsch formatieren (deutsch), z. B. "12,5 t".
export function formatTons(t) {
  return `${new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 }).format(Math.round((t || 0) * 10) / 10)} t`;
}
