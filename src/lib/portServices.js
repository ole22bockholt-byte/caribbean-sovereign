// =============================================================================
// portServices — leitet die an einem Hafen verfügbaren Dienste aus den (echten)
// Hafendaten ab. Grundlage für die standortabhängige Navigation: je nach Hafen
// werden Händler, Marktplatz, Schiffshändler, Ausrüstung und Aufträge ein- oder
// ausgeblendet.
//
// Regeln (rein aus vorhandenen Feldern abgeleitet — keine erfundenen Daten):
//   - Händler:        an JEDEM Hafen (eigener Warenhandel je Hafenwirtschaft).
//   - Marktplatz:     an größeren Häfen (Fort/Freihafen/Freibeuternest/Haupthafen).
//   - Schiffshändler: an Häfen mit Werft (Forts + Fraktions-Haupthäfen).
//   - Ausrüstung:     nur am Haupthafen einer Fraktion.
//   - Aufträge:       an größeren Häfen.
// =============================================================================

// Ein Haupthafen (Kapitale) je Fraktion.
export const FACTION_CAPITAL = {
  gb: "port_royal",
  es: "havana",
  fr: "cap_francais",
  nl: "willemstad",
  pirate: "tortuga",
  neutral: "nassau",
};

export const CAPITAL_PORT_IDS = new Set(Object.values(FACTION_CAPITAL));

export function isCapital(port) {
  return !!port && CAPITAL_PORT_IDS.has(port.id);
}

// Reihenfolge + Beschriftung der Hafendienste (Icons werden in der UI zugeordnet).
export const PORT_SERVICES = [
  { id: "handel", label: "Händler" },
  { id: "marktplatz", label: "Marktplatz" },
  { id: "schiffshaendler", label: "Schiffshändler" },
  { id: "ausruestung", label: "Ausrüstung" },
  { id: "auftraege", label: "Aufträge" },
];

export const SERVICE_IDS = PORT_SERVICES.map((s) => s.id);

// Verfügbarkeits-Map je Hafen.
export function serviceAvailability(port) {
  if (!port) {
    return { handel: false, marktplatz: false, schiffshaendler: false, ausruestung: false, auftraege: false };
  }
  const cap = CAPITAL_PORT_IDS.has(port.id);
  const type = port.type; // 'fort' | 'harbor' | 'pirate' | 'neutral'
  const fort = type === "fort";
  const major = fort || cap || type === "neutral" || type === "pirate";
  return {
    handel: true,
    marktplatz: major,
    schiffshaendler: fort || cap,
    ausruestung: cap,
    auftraege: major,
  };
}

// Geordnete Liste der an einem Hafen verfügbaren Dienste (mit Labels).
export function availableServices(port) {
  const avail = serviceAvailability(port);
  return PORT_SERVICES.filter((s) => avail[s.id]);
}

export function isServiceAvailable(port, serviceId) {
  return !!serviceAvailability(port)[serviceId];
}
