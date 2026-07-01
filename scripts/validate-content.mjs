#!/usr/bin/env node
// =============================================================================
// validate-content.mjs — Inhalts-Validator für Karibik 1765
// -----------------------------------------------------------------------------
// Prüft die dateibasierten Kataloge im Repo auf ein einheitliches, robustes
// Schema, damit neue Schiffe, Ausrüstung und Personen ohne stille Fehler
// hinzugefügt werden können:
//
//   ships/<id>/ship.json            Schiffe   (baseStats + slots)
//   equipment/<slot>/slot.json      Slot-Kategorien
//   equipment/<slot>/<item>/part.json   Ausrüstungsgegenstände
//   characters/<id>/character.json  Personen  (Kapitäne/Offiziere/Crew)
//
// Ohne externe Abhängigkeiten — nur Node-Standardbibliothek.
// Aufruf:  npm run validate:content   (oder: node scripts/validate-content.mjs)
// Exit-Code 0 = alles ok (Warnungen erlaubt), 1 = mindestens ein Fehler.
// =============================================================================

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Repo-Wurzel unabhängig vom aktuellen Arbeitsverzeichnis bestimmen.
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// ---- Kanonische Vokabulare (zentrale Quelle der Wahrheit) -------------------
// Ausrüstungs-Klassentag = "<Schweregrad>-<Stufe>", z. B. "Schwer-C".
const WEIGHTS = ["Schwer", "Mittelschwer", "Standard", "Mittelleicht", "Leicht"];
const TIERS = ["F", "E", "D", "C", "B", "A", "S"]; // schwach -> stark
const CLASS_TAG = /^(Schwer|Mittelschwer|Standard|Mittelleicht|Leicht)-([FEDCBAS])$/;

const FACTIONS = ["gb", "es", "fr", "nl", "pirate", "neutral"];
const RARITIES = ["common", "uncommon", "rare", "legendary"];
const CATEGORIES = ["admiral", "captain", "naval_officer", "function_officer", "crew"];

// ---- Fehler-/Warnungs-Sammler ----------------------------------------------
const errors = [];
const warnings = [];
const rel = (p) => relative(ROOT, p);
const err = (file, msg) => errors.push(`${rel(file)}: ${msg}`);
const warn = (file, msg) => warnings.push(`${rel(file)}: ${msg}`);

const isObject = (v) => typeof v === "object" && v !== null && !Array.isArray(v);
const isInt = (v) => typeof v === "number" && Number.isInteger(v);

function dirs(path) {
  if (!existsSync(path)) return [];
  return readdirSync(path, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
}

function readJson(file) {
  try {
    return { data: JSON.parse(readFileSync(file, "utf8")) };
  } catch (e) {
    return { error: e.message };
  }
}

// ---- Ausrüstung -------------------------------------------------------------
// Liefert den Katalog { slotKey -> { label, items: { itemId -> {weight, tier} } } }.
function validateEquipment() {
  const catalog = {};
  const base = join(ROOT, "equipment");
  let itemCount = 0;

  for (const slotDir of dirs(base)) {
    const slotPath = join(base, slotDir);
    const slotFile = join(slotPath, "slot.json");
    let slotKey = slotDir;

    if (!existsSync(slotFile)) {
      err(slotPath, "slot.json fehlt.");
    } else {
      const { data, error } = readJson(slotFile);
      if (error) err(slotFile, `ungültiges JSON (${error}).`);
      else {
        if (typeof data.key !== "string" || !data.key) err(slotFile, 'Feld "key" (string) fehlt.');
        else if (data.key !== slotDir) err(slotFile, `"key" ("${data.key}") muss dem Ordnernamen ("${slotDir}") entsprechen.`);
        if (typeof data.label !== "string" || !data.label) err(slotFile, 'Feld "label" (string) fehlt.');
        if (typeof data.key === "string" && data.key) slotKey = data.key;
      }
    }

    const items = {};
    for (const itemDir of dirs(slotPath)) {
      const partFile = join(slotPath, itemDir, "part.json");
      if (!existsSync(partFile)) {
        err(join(slotPath, itemDir), "part.json fehlt.");
        continue;
      }
      const { data, error } = readJson(partFile);
      if (error) {
        err(partFile, `ungültiges JSON (${error}).`);
        continue;
      }
      itemCount++;
      if (data.id !== itemDir) err(partFile, `"id" ("${data.id}") muss dem Ordnernamen ("${itemDir}") entsprechen.`);
      if (data.slot !== slotKey) err(partFile, `"slot" ("${data.slot}") muss "${slotKey}" sein.`);
      if (typeof data.name !== "string" || !data.name) err(partFile, 'Feld "name" (string) fehlt.');

      let weight = null;
      let tier = null;
      if (typeof data.class !== "string") {
        err(partFile, 'Feld "class" (z. B. "Schwer-C") fehlt.');
      } else {
        const m = CLASS_TAG.exec(data.class);
        if (!m) err(partFile, `"class" ("${data.class}") muss "<Schweregrad>-<Stufe>" sein, z. B. "Schwer-C". Schweregrade: ${WEIGHTS.join(", ")}; Stufen: ${TIERS.join("")}.`);
        else {
          weight = m[1];
          tier = m[2];
        }
      }
      if (data.stats !== undefined && !isObject(data.stats)) err(partFile, '"stats" muss ein Objekt sein.');
      if (data.summary !== undefined && typeof data.summary !== "string") err(partFile, '"summary" muss ein string sein.');

      if (items[itemDir]) err(partFile, `doppelte Item-ID "${itemDir}" in Slot "${slotKey}".`);
      items[itemDir] = { weight, tier };
    }

    catalog[slotKey] = { label: undefined, items };
  }

  return { catalog, slotCount: Object.keys(catalog).length, itemCount };
}

// ---- Schiffe ----------------------------------------------------------------
function validateShips(catalog) {
  const base = join(ROOT, "ships");
  let count = 0;

  for (const shipDir of dirs(base)) {
    const shipPath = join(base, shipDir);
    const file = join(shipPath, "ship.json");
    if (!existsSync(file)) {
      err(shipPath, "ship.json fehlt.");
      continue;
    }
    const { data, error } = readJson(file);
    if (error) {
      err(file, `ungültiges JSON (${error}).`);
      continue;
    }
    count++;
    if (typeof data.name !== "string" || !data.name) err(file, 'Feld "name" (string) ist Pflicht.');

    if (data.baseStats !== undefined) {
      if (!isObject(data.baseStats)) err(file, '"baseStats" muss ein Objekt sein.');
      else for (const [k, v] of Object.entries(data.baseStats)) {
        if (typeof v !== "number") warn(file, `baseStats.${k} sollte eine Zahl sein (ist "${v}").`);
      }
    }

    if (data.slots !== undefined) {
      if (!isObject(data.slots)) {
        err(file, '"slots" muss ein Objekt sein.');
      } else for (const [slotKey, def] of Object.entries(data.slots)) {
        const slot = catalog[slotKey];
        if (!slot) {
          err(file, `Slot "${slotKey}" ist unbekannt (kein equipment/${slotKey}/slot.json).`);
          continue;
        }
        if (!isObject(def)) {
          err(file, `Slot "${slotKey}" muss ein Objekt sein.`);
          continue;
        }
        if (!isInt(def.count) || def.count <= 0) err(file, `Slot "${slotKey}": "count" muss eine positive Ganzzahl sein.`);

        // allowedWeights (Pflicht): welche Schweregrade physisch passen.
        let allowed = [];
        if (!Array.isArray(def.allowedWeights) || def.allowedWeights.length === 0) {
          err(file, `Slot "${slotKey}": "allowedWeights" muss eine nicht-leere Liste sein (aus: ${WEIGHTS.join(", ")}).`);
        } else {
          for (const w of def.allowedWeights) {
            if (!WEIGHTS.includes(w)) err(file, `Slot "${slotKey}": unbekannter Schweregrad "${w}" (erlaubt: ${WEIGHTS.join(", ")}).`);
          }
          allowed = def.allowedWeights;
        }

        // allowedTiers (optional): zusätzliche Stufen-Begrenzung (Progression).
        let allowedTiers = null;
        if (def.allowedTiers !== undefined) {
          if (!Array.isArray(def.allowedTiers) || def.allowedTiers.length === 0) {
            err(file, `Slot "${slotKey}": "allowedTiers" muss (falls gesetzt) eine nicht-leere Liste sein (aus: ${TIERS.join(", ")}).`);
          } else {
            allowedTiers = def.allowedTiers;
            for (const t of allowedTiers) {
              if (!TIERS.includes(t)) err(file, `Slot "${slotKey}": unbekannte Stufe "${t}" (erlaubt: ${TIERS.join(", ")}).`);
            }
          }
        }

        // default: muss ein existierendes Item dieses Slots referenzieren …
        if (typeof def.default !== "string" || !def.default) {
          err(file, `Slot "${slotKey}": "default" (Item-ID) fehlt.`);
        } else {
          const item = slot.items[def.default];
          if (!item) {
            err(file, `Slot "${slotKey}": default "${def.default}" existiert nicht in equipment/${slotKey}/.`);
          } else {
            // … und dessen Schweregrad/Stufe muss zu den erlaubten passen.
            if (allowed.length && item.weight && !allowed.includes(item.weight)) {
              err(file, `Slot "${slotKey}": default "${def.default}" (${item.weight}) ist nicht in allowedWeights [${allowed.join(", ")}].`);
            }
            if (allowedTiers && item.tier && !allowedTiers.includes(item.tier)) {
              err(file, `Slot "${slotKey}": default "${def.default}" (Stufe ${item.tier}) ist nicht in allowedTiers [${allowedTiers.join(", ")}].`);
            }
          }
        }
      }
    }

    // Optionale Asset-Referenzen prüfen.
    for (const field of ["imageFile", "videoFile"]) {
      if (typeof data[field] === "string" && data[field] && !existsSync(join(shipPath, data[field]))) {
        warn(file, `${field} "${data[field]}" wurde im Ordner nicht gefunden.`);
      }
    }
  }

  return count;
}

// ---- Personen ---------------------------------------------------------------
function validateCharacters() {
  const base = join(ROOT, "characters");
  let count = 0;

  for (const charDir of dirs(base)) {
    const file = join(base, charDir, "character.json");
    if (!existsSync(file)) {
      err(join(base, charDir), "character.json fehlt.");
      continue;
    }
    const { data, error } = readJson(file);
    if (error) {
      err(file, `ungültiges JSON (${error}).`);
      continue;
    }
    count++;
    if (typeof data.name !== "string" || !data.name) err(file, 'Feld "name" (string) ist Pflicht.');

    if (data.factionCode !== undefined && !FACTIONS.includes(data.factionCode)) {
      err(file, `unbekannter factionCode "${data.factionCode}" (erlaubt: ${FACTIONS.join(", ")}).`);
    }
    if (data.rarity !== undefined && !RARITIES.includes(data.rarity)) {
      warn(file, `ungewöhnliche rarity "${data.rarity}" (üblich: ${RARITIES.join(", ")}).`);
    }
    if (data.category !== undefined && !CATEGORIES.includes(data.category)) {
      warn(file, `ungewöhnliche category "${data.category}" (üblich: ${CATEGORIES.join(", ")}).`);
    }
    if (data.commandLimit !== undefined && (!isInt(data.commandLimit) || data.commandLimit < 0)) {
      err(file, '"commandLimit" muss eine Ganzzahl >= 0 sein.');
    }
    if (data.skills !== undefined) {
      if (!isObject(data.skills)) err(file, '"skills" muss ein Objekt sein.');
      else for (const [k, v] of Object.entries(data.skills)) {
        if (!isInt(v)) warn(file, `skills.${k} sollte eine Ganzzahl sein (ist "${v}").`);
      }
    }
    if (data.uniqueAbilities !== undefined) {
      if (!Array.isArray(data.uniqueAbilities)) {
        err(file, '"uniqueAbilities" muss eine Liste sein.');
      } else data.uniqueAbilities.forEach((a, i) => {
        if (!isObject(a) || typeof a.name !== "string" || typeof a.description !== "string") {
          err(file, `uniqueAbilities[${i}] braucht "name" und "description" (string).`);
        }
      });
    }
  }

  return count;
}

// ---- Ausführung -------------------------------------------------------------
console.log("Karibik 1765 — Inhalts-Validierung\n");

const eq = validateEquipment();
const ships = validateShips(eq.catalog);
const chars = validateCharacters();

console.log(`  Ausrüstung : ${eq.slotCount} Slots, ${eq.itemCount} Teile`);
console.log(`  Schiffe    : ${ships}`);
console.log(`  Personen   : ${chars}\n`);

if (warnings.length) {
  console.log(`Warnungen (${warnings.length}):`);
  for (const w of warnings) console.log(`  ⚠ ${w}`);
  console.log("");
}

if (errors.length) {
  console.log(`Fehler (${errors.length}):`);
  for (const e of errors) console.log(`  ✖ ${e}`);
  console.log(`\n✖ Validierung fehlgeschlagen: ${errors.length} Fehler.`);
  process.exit(1);
}

console.log("✓ Alle Inhalte gültig.");
process.exit(0);
