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

// Flaggen-Bilder je Fraktion (auswechselbar). Fehlt ein Bild, fällt die UI auf
// das Emoji aus FLAG_BY_CODE zurück.
const FLAG_IMG_BY_CODE = {
  gb: "https://media.base44.com/images/public/6a43defde92c0d47de02330a/78c446dd1_gb_union_jack.webp",
};

import { DUMMY_RESOLUTE } from "./shipData";
import { PORT_CATALOG } from "./mapGeography";

// Hafentyp aus dem Backend-Status ableiten (Fallback, falls nicht im Katalog).
const typeFromStatus = (status) =>
  status === "fort" ? "fort" : status === "neutral_zone" ? "neutral" : "harbor";

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

    // Kartenposition & -typ aus dem Geografie-Katalog übernehmen (Quelle der
    // Wahrheit für die Darstellung), damit Häfen deckungsgleich zu den Landmassen
    // liegen — auch bevor das Backend mit den neuen Koordinaten neu geseedet ist.
    const cat = PORT_CATALOG[p.code];
    return {
      id: p.code,
      uuid: p.id,
      name: p.name,
      controllingFactionCode: ctrl?.code || "neutral",
      x: cat ? cat.x : Number(p.x),
      y: cat ? cat.y : Number(p.y),
      type: cat?.type || typeFromStatus(p.status),
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
          cargoCapacity: Number.isFinite(s.cargo_capacity) ? s.cargo_capacity : 0,
        })),
      }
    : null;

  // Dummy-Fregatte „Resolute" für alle Nutzer ergänzen (Platzhalter bis Backend-
  // Anbindung). Liegt im ersten verfügbaren Hafen, damit sie „Im Hafen" erscheint.
  if (player) {
    player.ships = [
      ...player.ships,
      { ...DUMMY_RESOLUTE, locationPortUuid: ports[0]?.uuid || null },
    ];
  }

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

// Liefert die Bild-URL der Flagge einer Fraktion (oder null, wenn keine hinterlegt).
export function factionFlagImage(code) {
  return FLAG_IMG_BY_CODE[code] || null;
}