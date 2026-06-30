// =============================================================================
// MOCK DATA — Karibik 1765 Management Game
// -----------------------------------------------------------------------------
// This file mirrors the intended Supabase schema as closely as possible so that
// later we can swap these constants for real queries with minimal changes.
// Every record carries a stable `id`, owner references, and timestamps where
// relevant — matching the "physical / unique object" model discussed.
// =============================================================================

// ---- Factions (Großfraktionen / KI-Nationen) --------------------------------
export const FACTIONS = {
  britain: { id: "britain", name: "Britisches Empire", short: "GB", color: "#9b1c2e", flag: "🇬🇧" },
  spain: { id: "spain", name: "Spanische Krone", short: "ES", color: "#c79a3a", flag: "🇪🇸" },
  france: { id: "france", name: "Königreich Frankreich", short: "FR", color: "#2b4a7a", flag: "🇫🇷" },
  dutch: { id: "dutch", name: "Niederländische Kompanie", short: "NL", color: "#d4762a", flag: "🇳🇱" },
  pirates: { id: "pirates", name: "Bruderschaft der Küste", short: "PIR", color: "#2a2a2a", flag: "🏴‍☠️" },
  neutral: { id: "neutral", name: "Neutral / Freistadt", short: "NEU", color: "#6b7280", flag: "⚪" },
};

// ---- Player Company ----------------------------------------------------------
export const PLAYER = {
  id: "company-001",
  companyName: "Albion Trading Co.",
  greatFaction: "britain",
  gold: 48250,
  influence: 1340,
  crew: 312,
  shipCount: 7,
  resources: {
    rum: 480,
    sugar: 1250,
    tobacco: 760,
    cotton: 340,
    timber: 920,
    powder: 210,
  },
};

// ---- Ports -------------------------------------------------------------------
// Coordinates are percentages relative to the map container (0–100).
export const PORTS = [
  {
    id: "port-royal",
    name: "Port Royal",
    controllingFaction: "britain",
    x: 38, y: 62,
    security: 82,
    isMajorNeutral: false,
    factionInfluence: { britain: 64, spain: 12, france: 8, dutch: 6, pirates: 10 },
    resources: ["Zucker", "Rum", "Schießpulver"],
    imports: ["Werkzeug", "Stoffe", "Wein"],
    exports: ["Rum", "Zucker", "Tabak"],
    buildings: ["Werft", "Fort", "Handelskontor", "Taverne", "Lagerhaus"],
    market: [
      { good: "Rum", buy: 42, sell: 38, trend: "up" },
      { good: "Zucker", buy: 18, sell: 15, trend: "down" },
      { good: "Tabak", buy: 56, sell: 51, trend: "up" },
      { good: "Schießpulver", buy: 88, sell: 80, trend: "flat" },
    ],
    localContracts: [
      { id: "c-pr-1", title: "Rum nach Kingston liefern", reward: 1200, type: "delivery" },
      { id: "c-pr-2", title: "Patrouille gegen Piraten", reward: 2400, type: "combat" },
    ],
  },
  {
    id: "havana",
    name: "Havanna",
    controllingFaction: "spain",
    x: 30, y: 30,
    security: 91,
    isMajorNeutral: false,
    factionInfluence: { spain: 78, britain: 6, france: 9, dutch: 4, pirates: 3 },
    resources: ["Tabak", "Zucker", "Silber"],
    imports: ["Sklaven", "Werkzeug", "Wein"],
    exports: ["Tabak", "Silber", "Zucker"],
    buildings: ["Große Festung", "Werft", "Kathedrale", "Handelskontor"],
    market: [
      { good: "Tabak", buy: 60, sell: 54, trend: "up" },
      { good: "Silber", buy: 210, sell: 195, trend: "flat" },
      { good: "Zucker", buy: 16, sell: 13, trend: "down" },
    ],
    localContracts: [
      { id: "c-hv-1", title: "Silbertransport eskortieren", reward: 4800, type: "escort" },
    ],
  },
  {
    id: "nassau",
    name: "Nassau",
    controllingFaction: "pirates",
    x: 44, y: 18,
    security: 34,
    isMajorNeutral: false,
    factionInfluence: { pirates: 71, britain: 14, dutch: 9, spain: 3, france: 3 },
    resources: ["Beute", "Rum", "Munition"],
    imports: ["Waffen", "Rum", "Proviant"],
    exports: ["Beute", "Konterbande"],
    buildings: ["Piratenhafen", "Taverne", "Schmugglernest"],
    market: [
      { good: "Rum", buy: 50, sell: 44, trend: "up" },
      { good: "Munition", buy: 95, sell: 84, trend: "up" },
      { good: "Beute", buy: 140, sell: 120, trend: "flat" },
    ],
    localContracts: [
      { id: "c-ns-1", title: "Schmuggelware nach Tortuga", reward: 3100, type: "smuggle" },
    ],
  },
  {
    id: "kingston",
    name: "Kingston",
    controllingFaction: "britain",
    x: 40, y: 70,
    security: 76,
    isMajorNeutral: false,
    factionInfluence: { britain: 58, spain: 10, france: 7, dutch: 15, pirates: 10 },
    resources: ["Zucker", "Kaffee", "Stoffe"],
    imports: ["Werkzeug", "Wein", "Wein"],
    exports: ["Zucker", "Kaffee"],
    buildings: ["Werft", "Fort", "Plantagenkontor"],
    market: [
      { good: "Zucker", buy: 19, sell: 16, trend: "flat" },
      { good: "Kaffee", buy: 72, sell: 65, trend: "up" },
    ],
    localContracts: [
      { id: "c-kg-1", title: "Kaffeefracht nach Willemstad", reward: 1800, type: "delivery" },
    ],
  },
  {
    id: "santiago",
    name: "Santiago",
    controllingFaction: "spain",
    x: 48, y: 48,
    security: 68,
    isMajorNeutral: false,
    factionInfluence: { spain: 66, britain: 8, france: 12, dutch: 4, pirates: 10 },
    resources: ["Zucker", "Rum", "Kupfer"],
    imports: ["Werkzeug", "Stoffe"],
    exports: ["Kupfer", "Rum"],
    buildings: ["Festung", "Handelskontor", "Mine"],
    market: [
      { good: "Kupfer", buy: 64, sell: 57, trend: "up" },
      { good: "Rum", buy: 40, sell: 36, trend: "flat" },
    ],
    localContracts: [
      { id: "c-st-1", title: "Kupfererz abholen", reward: 2200, type: "delivery" },
    ],
  },
  {
    id: "san-juan",
    name: "San Juan",
    controllingFaction: "spain",
    x: 70, y: 42,
    security: 80,
    isMajorNeutral: false,
    factionInfluence: { spain: 74, britain: 7, france: 6, dutch: 8, pirates: 5 },
    resources: ["Zucker", "Tabak", "Salz"],
    imports: ["Werkzeug", "Wein", "Stoffe"],
    exports: ["Zucker", "Salz"],
    buildings: ["Große Festung", "Werft", "Handelskontor"],
    market: [
      { good: "Salz", buy: 22, sell: 18, trend: "down" },
      { good: "Tabak", buy: 58, sell: 52, trend: "up" },
    ],
    localContracts: [
      { id: "c-sj-1", title: "Salzfracht nach Nassau", reward: 1500, type: "delivery" },
    ],
  },
  {
    id: "willemstad",
    name: "Willemstad",
    controllingFaction: "dutch",
    x: 58, y: 82,
    security: 73,
    isMajorNeutral: true,
    factionInfluence: { dutch: 69, britain: 11, spain: 9, france: 6, pirates: 5 },
    resources: ["Stoffe", "Werkzeug", "Salz"],
    imports: ["Zucker", "Tabak", "Kaffee"],
    exports: ["Stoffe", "Werkzeug"],
    buildings: ["Freihafen", "Bank", "Werft", "Lagerhaus"],
    market: [
      { good: "Stoffe", buy: 34, sell: 30, trend: "flat" },
      { good: "Werkzeug", buy: 46, sell: 41, trend: "up" },
    ],
    localContracts: [
      { id: "c-wl-1", title: "Bankfracht versichern", reward: 2600, type: "escort" },
    ],
  },
  {
    id: "tortuga",
    name: "Tortuga",
    controllingFaction: "pirates",
    x: 52, y: 34,
    security: 28,
    isMajorNeutral: false,
    factionInfluence: { pirates: 64, france: 18, britain: 6, dutch: 7, spain: 5 },
    resources: ["Beute", "Rum", "Munition"],
    imports: ["Waffen", "Proviant"],
    exports: ["Beute", "Konterbande"],
    buildings: ["Piratenfestung", "Taverne", "Schwarzmarkt"],
    market: [
      { good: "Rum", buy: 52, sell: 46, trend: "up" },
      { good: "Beute", buy: 150, sell: 128, trend: "up" },
    ],
    localContracts: [
      { id: "c-tg-1", title: "Kaperfahrt gegen Spanier", reward: 5200, type: "combat" },
    ],
  },
  {
    id: "fort-de-france",
    name: "Fort-de-France",
    controllingFaction: "france",
    x: 80, y: 66,
    security: 77,
    isMajorNeutral: false,
    factionInfluence: { france: 71, britain: 8, dutch: 9, spain: 7, pirates: 5 },
    resources: ["Zucker", "Rum", "Kaffee"],
    imports: ["Werkzeug", "Wein", "Stoffe"],
    exports: ["Rum", "Kaffee"],
    buildings: ["Festung", "Werft", "Handelskontor", "Destillerie"],
    market: [
      { good: "Rum", buy: 44, sell: 39, trend: "up" },
      { good: "Kaffee", buy: 70, sell: 63, trend: "flat" },
    ],
    localContracts: [
      { id: "c-fdf-1", title: "Rumlieferung nach Port Royal", reward: 1900, type: "delivery" },
    ],
  },
];

// ---- Trade routes (between ports) -------------------------------------------
export const TRADE_ROUTES = [
  { id: "r1", from: "port-royal", to: "kingston", type: "own" },
  { id: "r2", from: "port-royal", to: "havana", type: "neutral" },
  { id: "r3", from: "havana", to: "san-juan", type: "enemy" },
  { id: "r4", from: "kingston", to: "willemstad", type: "own" },
  { id: "r5", from: "tortuga", to: "nassau", type: "pirate" },
  { id: "r6", from: "fort-de-france", to: "willemstad", type: "neutral" },
  { id: "r7", from: "santiago", to: "havana", type: "enemy" },
];

// ---- Pirate activity hotspots (for legend / map markers) --------------------
export const PIRATE_ACTIVITY = [
  { id: "pa1", x: 50, y: 26, intensity: "high" },
  { id: "pa2", x: 60, y: 56, intensity: "medium" },
];

// ---- Player Ships ------------------------------------------------------------
export const SHIPS = [
  { id: "ship-001", name: "HMS Resolute", class: "Fregatte", firepower: 48, hull: 92, sails: 88, crew: 220, status: "Im Hafen", location: "Port Royal" },
  { id: "ship-002", name: "Sea Sparrow", class: "Schaluppe", firepower: 12, hull: 70, sails: 95, crew: 40, status: "Unterwegs", location: "→ Kingston" },
  { id: "ship-003", name: "Golden Hind", class: "Galeone", firepower: 36, hull: 85, sails: 72, crew: 180, status: "Im Hafen", location: "Port Royal" },
  { id: "ship-004", name: "Maiden's Wrath", class: "Brigg", firepower: 24, hull: 78, sails: 84, crew: 90, status: "Handelt", location: "Willemstad" },
];

// ---- Active voyages ----------------------------------------------------------
export const VOYAGES = [
  { id: "v-001", ship: "Sea Sparrow", from: "Port Royal", to: "Kingston", cargo: "Rum ×120", etaSeconds: 540, progress: 64 },
  { id: "v-002", ship: "Maiden's Wrath", from: "Willemstad", to: "Fort-de-France", cargo: "Stoffe ×80", etaSeconds: 1280, progress: 31 },
];

// ---- Active contracts --------------------------------------------------------
export const ACTIVE_CONTRACTS = [
  { id: "ac-001", title: "Silbertransport eskortieren", port: "Havanna", reward: 4800, deadlineSeconds: 3600, type: "escort" },
  { id: "ac-002", title: "Rum nach Kingston liefern", port: "Port Royal", reward: 1200, deadlineSeconds: 900, type: "delivery" },
  { id: "ac-003", title: "Kaperfahrt gegen Spanier", port: "Tortuga", reward: 5200, deadlineSeconds: 7200, type: "combat" },
];

// ---- Messages / Berichte -----------------------------------------------------
export const MESSAGES = [
  { id: "m-001", from: "Hafenmeister Port Royal", subject: "Neue Rumpreise melden", time: "vor 12 Min.", unread: true, priority: "normal" },
  { id: "m-002", from: "Admiralität", subject: "Piratenaktivität bei Tortuga gemeldet", time: "vor 38 Min.", unread: true, priority: "high" },
  { id: "m-003", from: "Britische Handelsgilde", subject: "Allianz-Einladung erhalten", time: "vor 2 Std.", unread: false, priority: "normal" },
  { id: "m-004", from: "Kapitän der HMS Resolute", subject: "Reparaturen abgeschlossen", time: "vor 5 Std.", unread: false, priority: "low" },
];

// ---- World clock -------------------------------------------------------------
export const WORLD = {
  gameDate: "14. März 1765",
  tickIntervalSeconds: 600, // World-Tick every 10 minutes
};

// ---- Trade goods (for modals) ------------------------------------------------
export const TRADE_GOODS = ["Rum", "Zucker", "Tabak", "Kaffee", "Stoffe", "Silber", "Kupfer", "Schießpulver", "Salz", "Munition"];

// ---- Ship classes (for build modal) -----------------------------------------
export const SHIP_CLASSES = [
  { id: "schaluppe", name: "Schaluppe", cost: 4500, days: 3, firepower: 12, crew: 40 },
  { id: "brigg", name: "Brigg", cost: 9800, days: 6, firepower: 24, crew: 90 },
  { id: "fregatte", name: "Fregatte", cost: 24000, days: 12, firepower: 48, crew: 220 },
  { id: "galeone", name: "Galeone", cost: 31000, days: 15, firepower: 36, crew: 180 },
  { id: "linienschiff", name: "Linienschiff", cost: 58000, days: 24, firepower: 90, crew: 480 },
];

export const getFaction = (id) => FACTIONS[id] || FACTIONS.neutral;
export const getPort = (id) => PORTS.find((p) => p.id === id);