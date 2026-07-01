// =============================================================================
// shipData — Daten & Helfer für die detaillierte Schiffsansicht.
//
// Vieles hier sind bewusst DUMMY-Werte (Platzhalter) für Systeme, die noch nicht
// im Backend existieren (Zustand, Bewaffnung im Detail, Leistung, Kapitän, Module,
// Kosten, Aufträge, EP/Stufe). Sie sind optisch vollständig, damit die Ansicht
// später sauber an echte Daten aus `gameState` angebunden werden kann.
// Echte Werte (Name, Klasse, Crew, Feuerkraft, Rumpf) werden – wo vorhanden –
// aus dem Spielzustand übernommen.
// =============================================================================

// Dummy-Fregatte „Resolute" — wird in transformGameState allen Nutzern angehängt.
export const DUMMY_RESOLUTE = {
  id: "dummy-resolute",
  name: "Resolute",
  class: "Fregatte",
  classCode: "frigate",
  firepower: 32,
  hull: 81,
  crew: 156,
  status: "Im Hafen",
  locationPortUuid: null,
  isDummy: true,
  // Reiche Detailwerte für die Schiffsansicht (Platzhalter bis Backend-Anbindung).
  detail: {
    rank: "4. Klasse",
    year: "1758",
    homePort: "Port Royal",
    reputationBonus: "+8 % Handel",
    level: 12,
    xp: 3850,
    xpMax: 6000,
  },
};

const DEFAULT_CONDITION = [
  { label: "Rumpf", value: 82 },
  { label: "Segel", value: 76 },
  { label: "Bewaffnung", value: 88 },
  { label: "Ausrüstung", value: 79 },
];

const DEFAULT_ARMAMENT = [
  { label: "Kanonen (unter Deck)", count: 24, note: "12-Pfünder" },
  { label: "Kanonen (Oberdeck)", count: 24, note: "6-Pfünder" },
  { label: "Karronaden (Bug)", count: 4, note: "24-Pfünder" },
  { label: "Drehbassen", count: 2, note: "32-Pfünder" },
];

const DEFAULT_PERFORMANCE = [
  { label: "Geschwindigkeit (max.)", value: "12.5 kn" },
  { label: "Wendigkeit", value: "76 %" },
  { label: "Beschleunigung", value: "68 %" },
  { label: "Tiefgang", value: "6.4 m" },
  { label: "Segelfläche", value: "2.650 m²" },
];

const DEFAULT_CARGO_ITEMS = [
  { good: "Zucker", amount: 80, weight: 80, value: 24000 },
  { good: "Tabak", amount: 60, weight: 60, value: 18000 },
  { good: "Rum", amount: 40, weight: 40, value: 12000 },
  { good: "Holz", amount: 60, weight: 60, value: 6000 },
  { good: "Kakao", amount: 30, weight: 30, value: 7500 },
  { good: "Ballast", amount: 42, weight: 42, value: null },
];

const DEFAULT_MODULES = [
  { name: "Verstärkter Rumpf", level: 2 },
  { name: "Verbesserte Segel", level: 2 },
  { name: "Präzisionslafetten", level: 1 },
  { name: "Kupferbeschlag", level: 1 },
  { name: "Ausgeglichene Ballastierung", level: 1 },
];

const DEFAULT_COSTS = [
  { label: "Tägliche Unterhaltskosten", value: 1280 },
  { label: "Besatzungssöhne", value: 920 },
  { label: "Versorgung & Proviant", value: 210 },
  { label: "Reparaturreserve", value: 150 },
];

const DEFAULT_ORDERS = [
  { title: "Handelseinsatz: Zucker nach Nassau", sub: "Port Royal → Nassau", eta: "noch 2 Tage" },
  { title: "Patrouille: Karibisches Meer", sub: "Sektoren überwachen", eta: "noch 5 Tage" },
  { title: "Eskortenauftrag: Konvoi schützen", sub: "Willemstad → Port-au-Prince", eta: "noch 7 Tage" },
];

const CAPTAIN_PORTRAIT =
  "https://media.base44.com/images/public/6a43defde92c0d47de02330a/ebfe1567b_generated_image.png";

// Baut das vollständige Detailmodell für ein Schiff. Nutzt echte Felder, wo
// vorhanden, und ergänzt Platzhalter für noch nicht modellierte Systeme.
export function buildShipDetail(ship, ctx = {}) {
  const d = ship?.detail || {};
  const factionName = ctx.factionName || "Neutral";
  const currentPort = ctx.currentPortName || "Auf See";

  const hull = Number.isFinite(ship?.hull) ? ship.hull : 82;
  const condition = [
    { label: "Rumpf", value: hull },
    ...DEFAULT_CONDITION.filter((c) => c.label !== "Rumpf"),
  ];
  const total = Math.round(condition.reduce((s, c) => s + c.value, 0) / condition.length);

  const crewCurrent = Number.isFinite(ship?.crew) ? ship.crew : 156;
  const crewMax = d.crewMax || 200;

  const broadside = Number.isFinite(ship?.firepower) ? ship.firepower : 32;

  return {
    rank: d.rank || "4. Klasse",
    level: d.level ?? 12,
    xp: d.xp ?? 3850,
    xpMax: d.xpMax ?? 6000,

    dataRows: [
      { label: "Schiffstyp", value: ship?.class || "Fregatte" },
      { label: "Klasse", value: d.rank || "4. Klasse" },
      { label: "Nation", value: factionName, flag: ctx.factionFlag },
      { label: "Baujahr", value: d.year || "1758" },
      { label: "Heimathafen", value: d.homePort || "Port Royal" },
      { label: "Aktueller Hafen", value: currentPort },
      { label: "Ansehensbonus", value: d.reputationBonus || "+8 % Handel", accent: true },
    ],

    condition,
    conditionTotal: total,

    armament: DEFAULT_ARMAMENT,
    broadside,

    crew: {
      max: crewMax,
      current: crewCurrent,
      officers: d.officers ?? 12,
      morale: d.morale ?? 84,
      discipline: d.discipline ?? 78,
    },

    performance: DEFAULT_PERFORMANCE,

    captain: {
      name: d.captainName || "Edward Hawke",
      rank: "Kapitän",
      xp: 18250,
      xpMax: 25000,
      specialization: "Handel",
      portrait: CAPTAIN_PORTRAIT,
    },

    cargo: {
      used: 312,
      capacity: 400,
      items: DEFAULT_CARGO_ITEMS,
    },

    modules: DEFAULT_MODULES,

    costs: DEFAULT_COSTS,
    monthlyTotal: 38400,

    orders: DEFAULT_ORDERS,
  };
}
