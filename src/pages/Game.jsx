import React, { useState, useMemo } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/game/Sidebar";
import StatusBar from "@/components/game/StatusBar";
import CaribbeanMap from "@/components/game/CaribbeanMap";
import PortDetailPanel from "@/components/game/PortDetailPanel";
import BottomPanels from "@/components/game/BottomPanels";
import QuickActions from "@/components/game/QuickActions";
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

  const ports = data?.ports || [];
  const selectedPort = ports.find((p) => p.id === selectedPortId) || ports[0] || null;

  const portNameByUuid = useMemo(
    () => Object.fromEntries(ports.map((p) => [p.uuid, p.name])),
    [ports]
  );

  const handleQuickAction = (id) => {
    if (id === "trade") setModal("trade");
    else if (id === "build") setModal("build");
    else if (id === "contract") setModal("contract");
    else if (id === "report") toast({ title: "Bericht", description: "Berichtseditor folgt in einem späteren Schritt." });
    else if (id === "diplomacy") setActive("diplomatie");
    else if (id === "market") setActive("markt");
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-wood-deep">
        <Loader2 className="w-8 h-8 text-brass animate-spin" />
      </div>
    );
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
      <div className="absolute inset-0 bg-[var(--wood-deep)]/88" />

      <div className="relative z-10 flex w-full h-full">
        <Sidebar active={active} onSelect={setActive} />

        <div className="flex-1 flex flex-col min-w-0">
          <StatusBar player={data.player} world={data.world} factionByCode={data.factionByCode} />

          <div className="flex-1 flex gap-3 p-3 min-h-0">
            <div className="flex-1 min-w-0">
              <CaribbeanMap
                ports={ports}
                factionByCode={data.factionByCode}
                selectedPortId={selectedPort?.id}
                onSelectPort={setSelectedPortId}
              />
            </div>
            <div className="w-[340px] shrink-0">
              <PortDetailPanel
                port={selectedPort}
                factionByCode={data.factionByCode}
                onTravel={(p) => toast({ title: "Kurs gesetzt", description: `Reisen nach ${p.name} folgen im nächsten Schritt.` })}
              />
            </div>
          </div>

          <div className="px-3 pb-2 flex items-center justify-between gap-3">
            <span className="font-display text-[11px] tracking-[0.18em] uppercase text-ink-dim">Schnellaktionen</span>
            <QuickActions onAction={handleQuickAction} />
          </div>

          <div className="h-[200px] shrink-0 px-3 pb-3">
            <BottomPanels player={data.player} portNameByUuid={portNameByUuid} />
          </div>
        </div>
      </div>

      <TradeModal open={modal === "trade"} onOpenChange={(o) => !o && setModal(null)} />
      <BuildShipModal open={modal === "build"} onOpenChange={(o) => !o && setModal(null)} />
      <CreateContractModal open={modal === "contract"} onOpenChange={(o) => !o && setModal(null)} />
    </div>
  );
}