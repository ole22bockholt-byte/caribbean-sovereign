// =============================================================================
// gameData — wandelt die rohe Backend-Antwort (gameState) in die Form um, die
// die UI-Komponenten erwarten. So bleibt das Frontend nah an der bisherigen
// Mock-Struktur, während die Daten live aus Supabase kommen.
// =============================================================================

const FLAG_BY_CODE = {
  gb: "🇬🇧",
  es: "🇪🇸",
  fr: "🇫🇷",
  nl: "🇳🇱",
  pirate: "🏴‍☠️",
  neutral: "⚪",
};

const TREND_LABEL = (t) => (t > 0 ? "up" : t < 0 ? "down" : "flat");

const SHIP_CLASS_LABEL = {
  sloop: "Schaluppe",
  brig: "Brigg",
  frigate: "Fregatte",
  galleon: "Galeone",
};

const SHIP_STATE_LABEL = {
  docked: "Im Hafen",
  sailing: "Unterwegs",
  in_battle: "Im Gefecht",
  sunk: "Versenkt",
  captured: "Gekapert",
};

// Erzeugt ein { code -> faction } Lookup mit Flag-Fallback.
export function buildFactionMap(factions) {
  const map = {};
  for (const f of factions) {
    map[f.id] = { ...f, flag: FLAG_BY_CODE[f.code] || "⚑" };
  }
  return map;
}

// Verwandelt die flache gameState-Antwort in das Frontend-Modell.
export function transformGameState(raw) {
  const factionById = buildFactionMap(raw.factions || []);
  const factionByCode = {};
  for (const id in factionById) factionByCode[factionById[id].code] = factionById[id];

  const goodById = Object.fromEntries((raw.goods || []).map((g) => [g.id, g]));

  // Einfluss & Preise nach Hafen gruppieren.
  const influenceByPort = {};
  for (const row of raw.influence || []) {
    (influenceByPort[row.port_id] ||= []).push(row);
  }
  const pricesByPort = {};
  for (const row of raw.prices || []) {
    (pricesByPort[row.port_id] ||= []).push(row);
  }

  const ports = (raw.ports || []).map((p) => {
    const ctrl = factionById[p.controlling_faction];
    const influence = {};
    for (const row of influenceByPort[p.id] || []) {
      const fc = factionById[row.faction_id];
      if (fc) influence[fc.code] = row.influence;
    }
    const market = (pricesByPort[p.id] || [])
      .map((row) => {
        const g = goodById[row.good_id];
        if (!g) return null;
        return {
          good: g.name,
          buy: row.price,
          sell: Math.round(row.price * 0.9),
          trend: TREND_LABEL(row.trend),
        };
      })
      .filter(Boolean);

    return {
      id: p.code,
      uuid: p.id,
      name: p.name,
      controllingFactionCode: ctrl?.code || "neutral",
      x: Number(p.x),
      y: Number(p.y),
      security: p.security,
      isMajorNeutral: p.status === "neutral_zone",
      factionInfluence: influence,
      market,
    };
  });

  const player = raw.player
    ? {
        id: raw.player.id,
        companyName: raw.player.display_name,
        gold: raw.player.gold,
        influence: raw.player.influence,
        factionCode: raw.player.faction_code || "neutral",
        ships: (raw.player.ships || []).map((s) => ({
          id: s.id,
          name: s.name,
          class: SHIP_CLASS_LABEL[s.ship_class] || s.ship_class,
          firepower: s.firepower,
          hull: s.hull,
          crew: s.crew,
          status: SHIP_STATE_LABEL[s.state] || s.state,
          locationPortUuid: s.location_port,
        })),
      }
    : null;

  return {
    needsOnboarding: raw.needsOnboarding,
    world: raw.world,
    factions: raw.factions || [],
    factionByCode,
    goods: raw.goods || [],
    ports,
    player,
  };
}

export function factionFlag(code) {
  return FLAG_BY_CODE[code] || "⚑";
}