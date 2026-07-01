import React, { useState, useMemo, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useVoyages } from "@/hooks/useVoyages";
import { computeSeaRoute } from "@/lib/seaRoute";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/game/Sidebar";
import StatusBar from "@/components/game/StatusBar";
import CaribbeanMap from "@/components/game/CaribbeanMap";
import PortDetailPanel from "@/components/game/PortDetailPanel";
import BottomPanels from "@/components/game/BottomPanels";
import ProfilePanel from "@/components/game/ProfilePanel";
import ShipView from "@/components/game/ships/ShipView";
import WikiPanel from "@/components/game/wiki/WikiPanel";
import StartScreen from "@/components/game/StartScreen";
import QuickActions from "@/components/game/QuickActions";
import WorldUpdateTimer from "@/components/game/WorldUpdateTimer";
import Onboarding from "@/components/game/Onboarding";
import TradeModal from "@/components/game/modals/TradeModal";
import BuildShipModal from "@/components/game/modals/BuildShipModal";
import CreateContractModal from "@/components/game/modals/CreateContractModal";
import { useGameState } from "@/hooks/useGameState";

const PARCHMENT = "https://media.base44.com/images/public/6a43defde92c0d47de02330a/ebfe1567b_generated_image.png";

export default function Game() {
  const { data, loading, error, reload } = useGameState();
  const [active, setActive] = useState("uebersicht");
  const [selectedPortId, setSelectedPortId] = useState(null);
  const [modal, setModal] = useState(null);
  const [started, setStarted] = useState(false);

  const [selectedShipId, setSelectedShipId] = useState(null);

  const ports = data?.ports || [];
  const selectedPort = ports.find((p) => p.id === selectedPortId) || ports[0] || null;

  const portNameByUuid = useMemo(
    () => Object.fromEntries(ports.map((p) => [p.uuid, p.name])),
    [ports]
  );
  const portByUuid = useMemo(
    () => Object.fromEntries(ports.map((p) => [p.uuid, p])),
    [ports]
  );
  const portById = useMemo(
    () => Object.fromEntries(ports.map((p) => [p.id, p])),
    [ports]
  );

  // Reisen-Simulation (physische Bewegung über die Karte).
  const { sailing, shipOverrides, startVoyage } = useVoyages(ports);

  // Schiffs-Ansicht: Backend-Schiffe + laufende Reise-Überschreibungen.
  const ships = useMemo(() => {
    const raw = data?.player?.ships || [];
    return raw.map((s) => {
      const homePortId = portByUuid[s.locationPortUuid]?.id || null;
      const ov = shipOverrides[s.id];
      const currentPortId = ov ? ov.currentPortId : homePortId;
      return {
        ...s,
        status: ov ? ov.status : s.status,
        currentPortId,
        locationName: currentPortId ? portById[currentPortId]?.name : "Auf See",
      };
    });
  }, [data, portByUuid, portById, shipOverrides]);

  const dockedShips = useMemo(
    () =>
      ships
        .filter((s) => s.status === "Im Hafen" && s.currentPortId)
        .map((s) => ({
          id: s.id,
          name: s.name,
          class: s.class,
          currentPortId: s.currentPortId,
          currentPortName: portById[s.currentPortId]?.name || "See",
        })),
    [ships, portById]
  );

  const shipPortIds = useMemo(
    () => ships.filter((s) => s.status === "Im Hafen" && s.currentPortId).map((s) => s.currentPortId),
    [ships]
  );

  // Ausgewähltes Schiff für die Reiseplanung (fällt auf erstes Schiff im Hafen zurück).
  useEffect(() => {
    if (dockedShips.length === 0) return;
    if (!dockedShips.some((s) => s.id === selectedShipId)) {
      setSelectedShipId(dockedShips[0].id);
    }
  }, [dockedShips, selectedShipId]);

  const selectedShip = dockedShips.find((s) => s.id === selectedShipId) || null;

  // Geplante Route (Vorschau) vom Standort des Schiffs zum gewählten Hafen.
  const planned = useMemo(() => {
    if (!selectedShip || !selectedPort || selectedShip.currentPortId === selectedPort.id) return null;
    const from = portById[selectedShip.currentPortId];
    if (!from) return null;
    return computeSeaRoute(from, selectedPort);
  }, [selectedShip, selectedPort, portById]);

  const routeInfo = planned
    ? { distanceSm: Math.round(planned.length * 22), durationSeconds: Math.round(planned.durationMs / 1000) }
    : null;

  const handleStartVoyage = () => {
    if (!selectedShip || !selectedPort || selectedShip.currentPortId === selectedPort.id) return;
    startVoyage({
      shipId: selectedShip.id,
      shipName: selectedShip.name,
      fromPortId: selectedShip.currentPortId,
      toPortId: selectedPort.id,
    });
    toast({
      title: "Segel gesetzt",
      description: `${selectedShip.name} nimmt Kurs auf ${selectedPort.name}.`,
    });
  };

  const overview = useMemo(() => {
    return [
      { label: "Aktive Aufträge", value: 0, to: "auftraege" },
      { label: "Laufende Reisen", value: sailing.length, to: "flotte" },
      { label: "Bauprojekte", value: 0, to: "siedlung" },
      { label: "Forschung", value: 0 },
      { label: "Ausbildungen", value: 0, to: "charaktere" },
    ];
  }, [sailing.length]);

  const handleQuickAction = (id) => {
    if (id === "trade") setModal("trade");
    else if (id === "build") setModal("build");
    else if (id === "contract") setModal("contract");
    else if (id === "report") toast({ title: "Bericht", description: "Berichtseditor folgt in einem späteren Schritt." });
    else if (id === "diplomacy") setActive("diplomatie");
    else if (id === "market") setActive("markt");
  };

  if (!started) {
    return <StartScreen ready={!loading && !error} onStart={() => setStarted(true)} />;
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-wood-deep text-ink gap-3 px-6 text-center">
        <AlertTriangle className="w-8 h-8 text-[var(--blood)]" />
        <p className="font-serif-game text-lg">{error}</p>
        <Button onClick={reload} className="bg-[var(--brass)] hover:bg-[var(--brass-bright)] text-[var(--wood-deep)] font-display border-0">
          Erneut versuchen
        </Button>
      </div>
    );
  }

  if (data?.needsOnboarding) {
    return <Onboarding factions={data.factions} ports={ports} onDone={reload} />;
  }

  return (
    <div
      className="h-screen w-screen overflow-hidden flex text-ink font-body-game"
      style={{ backgroundImage: `url(${PARCHMENT})`, backgroundSize: "cover" }}
    >
      <div className="absolute inset-0 bg-[var(--wood-deep)]/90" />

      <div className="relative z-10 flex flex-col w-full h-full">
        <StatusBar player={data.player} world={data.world} factionByCode={data.factionByCode} />

        <div className="flex-1 flex min-h-0 min-w-0">
          <Sidebar active={active} onSelect={setActive} overview={overview} />

          <div className="flex-1 flex flex-col min-w-0">
            {active === "schiffe" ? (
              <div className="flex-1 min-h-0 p-1 overflow-hidden">
                <ShipView
                  player={data.player}
                  factionByCode={data.factionByCode}
                  portNameByUuid={portNameByUuid}
                  onNavigate={setActive}
                />
              </div>
            ) : (
            <>
            <div className="flex-1 flex gap-1 p-1 min-h-0">
              {active === "profil" ? (
                <div className="flex-1 min-w-0 overflow-y-auto thin-scroll">
                  <ProfilePanel player={data.player} factionByCode={data.factionByCode} />
                </div>
              ) : active === "wiki" ? (
                <div className="flex-1 min-w-0 overflow-y-auto thin-scroll">
                  <WikiPanel />
                </div>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <CaribbeanMap
                      ports={ports}
                      factionByCode={data.factionByCode}
                      selectedPortId={selectedPort?.id}
                      onSelectPort={setSelectedPortId}
                      sailing={sailing}
                      plannedRoute={planned}
                      shipPortIds={shipPortIds}
                    />
                  </div>
                  <div className="w-[340px] shrink-0">
                    <PortDetailPanel
                      port={selectedPort}
                      factionByCode={data.factionByCode}
                      dockedShips={dockedShips}
                      selectedShipId={selectedShipId}
                      onSelectShip={setSelectedShipId}
                      routeInfo={routeInfo}
                      onStartVoyage={handleStartVoyage}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="h-[196px] shrink-0 px-1 pb-1">
              <BottomPanels ships={ships} voyages={sailing} onSelect={setActive} />
            </div>

            <div className="shrink-0 px-1 pb-1">
              <div className="panel rounded-sm flex items-center justify-between px-3 py-1.5">
                <QuickActions onAction={handleQuickAction} />
                <WorldUpdateTimer lastTickAt={data.world?.last_tick_at} />
              </div>
            </div>
            </>
            )}
          </div>
        </div>
      </div>

      <TradeModal open={modal === "trade"} onOpenChange={(o) => !o && setModal(null)} />
      <BuildShipModal open={modal === "build"} onOpenChange={(o) => !o && setModal(null)} />
      <CreateContractModal open={modal === "contract"} onOpenChange={(o) => !o && setModal(null)} />
    </div>
  );
}