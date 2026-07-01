// =============================================================================
// Dev-Harness (NICHT im Produktions-Build): rendert die Spiel-Oberfläche mit
// standortabhängiger Hafen-Navigation, Händler, Marktplatz, Schiffshändler,
// Ausrüstung, Aufträgen, Diplomatie und der Karten-Reise — mit Mock-Daten,
// ohne Base44-Login/Backend. Nur zum visuellen Testen.
// Aufruf: http://localhost:5173/mapdev.html
// =============================================================================
import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import { Coins, Package } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import Sidebar from "@/components/game/Sidebar";
import CaribbeanMap from "@/components/game/CaribbeanMap";
import PortDetailPanel from "@/components/game/PortDetailPanel";
import BottomPanels from "@/components/game/BottomPanels";
import QuickActions from "@/components/game/QuickActions";
import WorldUpdateTimer from "@/components/game/WorldUpdateTimer";
import DiplomatiePanel from "@/components/game/DiplomatiePanel";
import HaendlerPanel from "@/components/game/port/HaendlerPanel";
import MarktplatzPanel from "@/components/game/port/MarktplatzPanel";
import SchiffshaendlerPanel from "@/components/game/port/SchiffshaendlerPanel";
import AusruestungPanel from "@/components/game/port/AusruestungPanel";
import AuftraegePanel from "@/components/game/port/AuftraegePanel";
import { PORT_CATALOG } from "@/lib/mapGeography";
import { computeSeaRoute } from "@/lib/seaRoute";
import { availableServices, serviceAvailability, SERVICE_IDS } from "@/lib/portServices";
import { useVoyages } from "@/hooks/useVoyages";
import { useEconomy } from "@/hooks/useEconomy";
import { formatGold } from "@/lib/format";
import { cargoWeight, formatTons } from "@/lib/goodsData";
import { estimateVoyage, shipSpeedKnots, formatGameDuration } from "@/lib/voyageTime";

if (typeof location !== "undefined" && location.search.includes("reset")) {
  try {
    localStorage.removeItem("karibik1765.voyages.v1");
    localStorage.removeItem("karibik1765.economy.v1");
  } catch { /* ignore */ }
}

const FACTIONS = {
  gb: { code: "gb", name: "Großbritannien", color: "#c8102e" },
  es: { code: "es", name: "Spanien", color: "#f1bf00" },
  fr: { code: "fr", name: "Frankreich", color: "#0055a4" },
  nl: { code: "nl", name: "Niederlande", color: "#ff7900" },
  pirate: { code: "pirate", name: "Piraten", color: "#2b2b2b" },
  neutral: { code: "neutral", name: "Neutral", color: "#8a8a8a" },
};

const GOODS = ["Rum", "Zucker", "Tabak", "Baumwolle", "Gewürze", "Kaffee", "Schießpulver", "Bauholz"];

const PORTS = Object.entries(PORT_CATALOG).map(([code, c]) => ({
  id: code,
  uuid: code,
  name: c.name,
  controllingFactionCode: c.faction,
  x: c.x,
  y: c.y,
  type: c.type,
  security: 40 + Math.round(Math.random() * 55),
  isMajorNeutral: c.type === "neutral",
  factionInfluence: { [c.faction]: 70 },
  market: GOODS.map((g) => {
    const buy = 20 + Math.round(Math.random() * 60);
    return { good: g, buy, sell: Math.round(buy * 0.9), trend: ["up", "down", "flat"][Math.floor(Math.random() * 3)] };
  }),
}));

const PLAYER = { id: "dev", companyName: "Freie Handelskompanie", gold: 60000, influence: 1500, factionCode: "gb" };

const IMG = "https://media.base44.com/images/public/6a43defde92c0d47de02330a/c5394dcd2_generated_image.png";
const MOCK_SHIPS = [
  { id: "schaluppe", name: "Schaluppe", class: "Leicht", summary: "Wendiges Aufklärungsschiff für schnelle Routen.", price: 8000, imageUrl: IMG, stats: { Rumpf: 40, Ladung: 30, Tempo: 9, Crew: 25 } },
  { id: "brigg", name: "Brigg", class: "Brigg", summary: "Vielseitiger Begleiter für Handel und Gefecht.", price: 15000, imageUrl: IMG, stats: { Rumpf: 90, Ladung: 70, Tempo: 8, Crew: 60 } },
  { id: "fregatte", name: "Resolute", class: "Fregatte, 5th Rate", summary: "Arbeitspferd jeder Flotte.", price: 28000, imageUrl: IMG, stats: { Rumpf: 200, Ladung: 110, Tempo: 7, Crew: 210 } },
  { id: "galeone", name: "Galeone", class: "Galeone", summary: "Schwerer Fracht- und Kriegssegler.", price: 42000, imageUrl: IMG, stats: { Rumpf: 320, Ladung: 200, Tempo: 5, Crew: 260 } },
];
const MOCK_EQUIPMENT = [
  { id: "18pdr", slotLabel: "Hauptbatterie", name: "18-Pfünder", class: "Schwer-C", summary: "Schwere Linienkanone.", stats: { Schaden: 18, Reichweite: "Hoch" }, price: 4200 },
  { id: "carronade", slotLabel: "Decksgeschütz", name: "Karronade", class: "Schwer-B", summary: "Verheerend auf kurze Distanz.", stats: { Schaden: 26, Reichweite: "Kurz" }, price: 6500 },
  { id: "teak", slotLabel: "Rumpf", name: "Teak-Beplankung", class: "Standard-B", summary: "Robuster, langlebiger Rumpf.", stats: { Rumpf: "+15%" }, price: 6500 },
  { id: "chain_shot", slotLabel: "Munition", name: "Kettenkugeln", class: "Leicht-D", summary: "Zerfetzt gegnerische Takelage.", stats: { Effekt: "Segel" }, price: 2600 },
];
const MOCK_CONTRACTS = [
  { id: "c1", title: "Zuckerlieferung nach Bridgetown", type: "delivery", reward: 3200, destinationName: "Bridgetown", notes: "Liefere 40 Fass Zucker sicher ans Ziel." },
  { id: "c2", title: "Piratenjäger gesucht", type: "bounty", reward: 5400, notes: "Versenke einen berüchtigten Freibeuter." },
];

const INITIAL_SHIPS = [
  { id: "s1", name: "Resolute", class: "Fregatte", crew: 156, status: "Im Hafen", homePortId: "port_royal", cargoCapacity: 110 },
  { id: "s2", name: "Santa Ana", class: "Galeone", crew: 210, status: "Im Hafen", homePortId: "port_royal", cargoCapacity: 200 },
  { id: "s3", name: "Mistral", class: "Brigg", crew: 60, status: "Im Hafen", homePortId: "cap_francais", cargoCapacity: 70 },
];

function Harness() {
  const [active, setActive] = useState("uebersicht");
  const [selectedPortId, setSelectedPortId] = useState("port_royal");
  const [selectedShipId, setSelectedShipId] = useState("s1");
  const demoInitialized = useRef(false);

  const portById = useMemo(() => Object.fromEntries(PORTS.map((p) => [p.id, p])), []);
  const selectedPort = portById[selectedPortId] || PORTS[0];

  const { sailing, shipOverrides, startVoyage } = useVoyages(PORTS);
  const economy = useEconomy(PLAYER);

  const services = useMemo(() => availableServices(selectedPort), [selectedPort]);
  const svcAvailability = useMemo(() => serviceAvailability(selectedPort), [selectedPort]);
  const activeService = SERVICE_IDS.includes(active) && svcAvailability[active] ? active : null;

  const ships = useMemo(
    () =>
      INITIAL_SHIPS.map((s) => {
        const ov = shipOverrides[s.id];
        const currentPortId = ov ? ov.currentPortId : s.homePortId;
        return { ...s, status: ov ? ov.status : s.status, currentPortId, locationName: currentPortId ? portById[currentPortId]?.name : "Auf See", cargoUsed: cargoWeight(economy.holds[s.id]) };
      }),
    [shipOverrides, portById, economy.holds]
  );

  const dockedShips = ships
    .filter((s) => s.status === "Im Hafen" && s.currentPortId)
    .map((s) => ({ id: s.id, name: s.name, class: s.class, currentPortId: s.currentPortId, currentPortName: portById[s.currentPortId]?.name, cargoCapacity: s.cargoCapacity }));

  const shipsAtSelectedPort = dockedShips
    .filter((s) => s.currentPortId === selectedPort.id)
    .map((s) => ({ id: s.id, name: s.name, cargoCapacity: s.cargoCapacity }));

  const shipPortIds = ships.filter((s) => s.status === "Im Hafen" && s.currentPortId).map((s) => s.currentPortId);

  useEffect(() => {
    if (dockedShips.length && !dockedShips.some((s) => s.id === selectedShipId)) setSelectedShipId(dockedShips[0].id);
  }, [dockedShips, selectedShipId]);

  const selectedShip = dockedShips.find((s) => s.id === selectedShipId) || null;

  const planned = useMemo(() => {
    if (!selectedShip || selectedShip.currentPortId === selectedPort.id) return null;
    const from = portById[selectedShip.currentPortId];
    return from ? computeSeaRoute(from, selectedPort) : null;
  }, [selectedShip, selectedPort, portById]);

  const routeInfo = useMemo(() => {
    if (!planned || !selectedShip) return null;
    const est = estimateVoyage(planned.length, shipSpeedKnots(selectedShip));
    return { distanceSm: est.distanceNm, gameLabel: formatGameDuration(est.gameMinutes) };
  }, [planned, selectedShip]);

  const handleStartVoyage = () => {
    if (!selectedShip || selectedShip.currentPortId === selectedPort.id) return;
    startVoyage({ shipId: selectedShip.id, shipName: selectedShip.name, fromPortId: selectedShip.currentPortId, toPortId: selectedPort.id, speedKn: shipSpeedKnots(selectedShip) });
    toast({ title: "Segel gesetzt", description: `${selectedShip.name} nimmt Kurs auf ${selectedPort.name}.` });
  };

  // Demo-Modus: automatisch Mistral von Cap-Français nach Santo Domingo schicken
  useEffect(() => {
    if (demoInitialized.current) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("demo") === "1") {
      demoInitialized.current = true;
      setTimeout(() => {
        startVoyage({ shipId: "s3", shipName: "Mistral", fromPortId: "cap_francais", toPortId: "santo_domingo", speedKn: 8 });
      }, 100);
    }
  }, [startVoyage]);

  const back = () => setActive("uebersicht");

  const renderMain = () => {
    if (active === "diplomatie") {
      return <div className="flex-1 min-w-0 overflow-y-auto thin-scroll"><DiplomatiePanel factions={Object.values(FACTIONS)} player={PLAYER} /></div>;
    }
    if (activeService === "handel") return <div className="flex-1 min-w-0"><HaendlerPanel port={selectedPort} factionByCode={FACTIONS} economy={economy} shipsAtPort={shipsAtSelectedPort} onBack={back} /></div>;
    if (activeService === "marktplatz") return <div className="flex-1 min-w-0"><MarktplatzPanel port={selectedPort} factionByCode={FACTIONS} player={PLAYER} onBack={back} /></div>;
    if (activeService === "schiffshaendler") return <div className="flex-1 min-w-0"><SchiffshaendlerPanel port={selectedPort} factionByCode={FACTIONS} economy={economy} ships={MOCK_SHIPS} onBack={back} /></div>;
    if (activeService === "ausruestung") return <div className="flex-1 min-w-0"><AusruestungPanel port={selectedPort} factionByCode={FACTIONS} economy={economy} equipment={MOCK_EQUIPMENT} onBack={back} /></div>;
    if (activeService === "auftraege") return <div className="flex-1 min-w-0"><AuftraegePanel port={selectedPort} factionByCode={FACTIONS} contracts={MOCK_CONTRACTS} onBack={back} /></div>;
    return (
      <>
        <div className="flex-1 min-w-0">
          <CaribbeanMap ports={PORTS} factionByCode={FACTIONS} selectedPortId={selectedPort.id} onSelectPort={setSelectedPortId} sailing={sailing} plannedRoute={planned} shipPortIds={shipPortIds} />
        </div>
        <div className="w-[340px] shrink-0">
          <PortDetailPanel port={selectedPort} factionByCode={FACTIONS} dockedShips={dockedShips} selectedShipId={selectedShipId} onSelectShip={setSelectedShipId} routeInfo={routeInfo} onStartVoyage={handleStartVoyage} />
        </div>
      </>
    );
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col text-ink font-body-game bg-wood-deep">
      {/* Kopfleiste */}
      <div className="nav-ground nav-line-b flex items-center justify-between px-4 py-2">
        <span className="font-display text-brass-bright tracking-wide">Karibik 1765 · Dev-Vorschau</span>
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5 text-brass-bright font-display text-sm"><Coins className="w-4 h-4" /> {formatGold(economy.effectiveGold)} G</span>
          <span className="inline-flex items-center gap-1.5 text-ink-dim font-body-game text-sm"><Package className="w-4 h-4" /> {formatTons(economy.totalWeight)} Ladung</span>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        <Sidebar active={active} onSelect={setActive} portName={selectedPort?.name} services={services} />
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 flex gap-1 p-1 min-h-0">{renderMain()}</div>
          <div className="h-[196px] shrink-0 px-1 pb-1">
            <BottomPanels ships={ships} voyages={sailing} onSelect={setActive} />
          </div>
          <div className="shrink-0 px-1 pb-1">
            <div className="panel rounded-sm flex items-center justify-between px-3 py-1.5">
              <QuickActions onAction={setActive} availability={svcAvailability} />
              <WorldUpdateTimer lastTickAt={null} />
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

const el = document.getElementById("root");
if (!window.__mapdevRoot) window.__mapdevRoot = ReactDOM.createRoot(el);
window.__mapdevRoot.render(<Harness />);
