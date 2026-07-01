// =============================================================================
// Dev-Harness (NICHT im Produktions-Build): rendert die überarbeitete Karte mit
// dem vollständigen historischen Hafen-Katalog und funktionierender Reise-
// Simulation — ohne Base44-Login/Backend. Nur zum visuellen Testen der Karte.
// Aufruf: http://localhost:5173/mapdev.html
// =============================================================================
import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import CaribbeanMap from "@/components/game/CaribbeanMap";
import PortDetailPanel from "@/components/game/PortDetailPanel";
import BottomPanels from "@/components/game/BottomPanels";
import { PORT_CATALOG } from "@/lib/mapGeography";
import { computeSeaRoute } from "@/lib/seaRoute";
import { useVoyages } from "@/hooks/useVoyages";

const FACTIONS = {
  gb: { code: "gb", name: "Großbritannien", color: "#c8102e" },
  es: { code: "es", name: "Spanien", color: "#f1bf00" },
  fr: { code: "fr", name: "Frankreich", color: "#0055a4" },
  nl: { code: "nl", name: "Niederlande", color: "#ff7900" },
  pirate: { code: "pirate", name: "Piraten", color: "#2b2b2b" },
  neutral: { code: "neutral", name: "Neutral", color: "#8a8a8a" },
};

const GOODS = ["Rum", "Zucker", "Tabak", "Baumwolle", "Gewürze", "Kaffee"];

// Mock-Häfen aus dem echten Katalog erzeugen (mit Beispielmarkt).
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
  market: GOODS.map((g) => ({ good: g, buy: 20 + Math.round(Math.random() * 60), sell: 18, trend: "flat" })),
}));

const INITIAL_SHIPS = [
  { id: "s1", name: "Resolute", class: "Fregatte", crew: 156, status: "Im Hafen", homePortId: "port_royal" },
  { id: "s2", name: "Santa Ana", class: "Galeone", crew: 210, status: "Im Hafen", homePortId: "havana" },
  { id: "s3", name: "Mistral", class: "Brigg", crew: 88, status: "Im Hafen", homePortId: "cap_francais" },
];

function Harness() {
  const [selectedPortId, setSelectedPortId] = useState("bridgetown");
  const [selectedShipId, setSelectedShipId] = useState("s1");

  const portById = useMemo(() => Object.fromEntries(PORTS.map((p) => [p.id, p])), []);
  const selectedPort = portById[selectedPortId] || PORTS[0];

  const { sailing, shipOverrides, startVoyage } = useVoyages(PORTS);

  const ships = useMemo(
    () =>
      INITIAL_SHIPS.map((s) => {
        const ov = shipOverrides[s.id];
        const currentPortId = ov ? ov.currentPortId : s.homePortId;
        return {
          ...s,
          status: ov ? ov.status : s.status,
          currentPortId,
          locationName: currentPortId ? portById[currentPortId]?.name : "Auf See",
        };
      }),
    [shipOverrides, portById]
  );

  const dockedShips = ships
    .filter((s) => s.status === "Im Hafen" && s.currentPortId)
    .map((s) => ({
      id: s.id,
      name: s.name,
      class: s.class,
      currentPortId: s.currentPortId,
      currentPortName: portById[s.currentPortId]?.name,
    }));

  const shipPortIds = ships.filter((s) => s.status === "Im Hafen" && s.currentPortId).map((s) => s.currentPortId);

  useEffect(() => {
    if (dockedShips.length && !dockedShips.some((s) => s.id === selectedShipId)) {
      setSelectedShipId(dockedShips[0].id);
    }
  }, [dockedShips, selectedShipId]);

  const selectedShip = dockedShips.find((s) => s.id === selectedShipId) || null;

  const planned = useMemo(() => {
    if (!selectedShip || selectedShip.currentPortId === selectedPort.id) return null;
    const from = portById[selectedShip.currentPortId];
    return from ? computeSeaRoute(from, selectedPort) : null;
  }, [selectedShip, selectedPort, portById]);

  const routeInfo = planned
    ? { distanceSm: Math.round(planned.length * 22), durationSeconds: Math.round(planned.durationMs / 1000) }
    : null;

  const handleStartVoyage = () => {
    if (!selectedShip || selectedShip.currentPortId === selectedPort.id) return;
    startVoyage({
      shipId: selectedShip.id,
      shipName: selectedShip.name,
      fromPortId: selectedShip.currentPortId,
      toPortId: selectedPort.id,
    });
    toast({ title: "Segel gesetzt", description: `${selectedShip.name} nimmt Kurs auf ${selectedPort.name}.` });
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col text-ink font-body-game bg-wood-deep p-1 gap-1">
      <div className="flex-1 flex gap-1 min-h-0">
        <div className="flex-1 min-w-0">
          <CaribbeanMap
            ports={PORTS}
            factionByCode={FACTIONS}
            selectedPortId={selectedPort.id}
            onSelectPort={setSelectedPortId}
            sailing={sailing}
            plannedRoute={planned}
            shipPortIds={shipPortIds}
          />
        </div>
        <div className="w-[340px] shrink-0">
          <PortDetailPanel
            port={selectedPort}
            factionByCode={FACTIONS}
            dockedShips={dockedShips}
            selectedShipId={selectedShipId}
            onSelectShip={setSelectedShipId}
            routeInfo={routeInfo}
            onStartVoyage={handleStartVoyage}
          />
        </div>
      </div>
      <div className="h-[196px] shrink-0">
        <BottomPanels ships={ships} voyages={sailing} onSelect={() => {}} />
      </div>
      <Toaster />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Harness />);
