import React, { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import Sidebar from "@/components/game/Sidebar";
import StatusBar from "@/components/game/StatusBar";
import CaribbeanMap from "@/components/game/CaribbeanMap";
import PortDetailPanel from "@/components/game/PortDetailPanel";
import BottomPanels from "@/components/game/BottomPanels";
import QuickActions from "@/components/game/QuickActions";
import TradeModal from "@/components/game/modals/TradeModal";
import BuildShipModal from "@/components/game/modals/BuildShipModal";
import CreateContractModal from "@/components/game/modals/CreateContractModal";
import { PORTS } from "@/lib/mockData";

const PARCHMENT = "https://media.base44.com/images/public/6a43defde92c0d47de02330a/ebfe1567b_generated_image.png";

export default function Game() {
  const [active, setActive] = useState("uebersicht");
  const [selectedPortId, setSelectedPortId] = useState("port-royal");
  const [modal, setModal] = useState(null); // 'trade' | 'build' | 'contract'

  const selectedPort = PORTS.find((p) => p.id === selectedPortId);

  const handleQuickAction = (id) => {
    if (id === "trade") setModal("trade");
    else if (id === "build") setModal("build");
    else if (id === "contract") setModal("contract");
    else if (id === "report") toast({ title: "Bericht", description: "Berichtseditor folgt in einem späteren Schritt." });
    else if (id === "diplomacy") setActive("diplomatie");
    else if (id === "market") setActive("markt");
  };

  return (
    <div
      className="h-screen w-screen overflow-hidden flex text-ink font-body-game"
      style={{ backgroundImage: `url(${PARCHMENT})`, backgroundSize: "cover" }}
    >
      <div className="absolute inset-0 bg-[var(--wood-deep)]/88" />

      <div className="relative z-10 flex w-full h-full">
        <Sidebar active={active} onSelect={setActive} />

        <div className="flex-1 flex flex-col min-w-0">
          <StatusBar />

          {/* Central area: map + right detail panel */}
          <div className="flex-1 flex gap-3 p-3 min-h-0">
            <div className="flex-1 min-w-0">
              <CaribbeanMap selectedPortId={selectedPortId} onSelectPort={setSelectedPortId} />
            </div>
            <div className="w-[340px] shrink-0">
              <PortDetailPanel
                port={selectedPort}
                onTravel={(p) => toast({ title: "Kurs gesetzt", description: `Deine Kompanie wechselt nach ${p.name}.` })}
              />
            </div>
          </div>

          {/* Quick actions bar */}
          <div className="px-3 pb-2 flex items-center justify-between gap-3">
            <span className="font-display text-[11px] tracking-[0.18em] uppercase text-ink-dim">Schnellaktionen</span>
            <QuickActions onAction={handleQuickAction} />
          </div>

          {/* Bottom panels */}
          <div className="h-[200px] shrink-0 px-3 pb-3">
            <BottomPanels />
          </div>
        </div>
      </div>

      <TradeModal open={modal === "trade"} onOpenChange={(o) => !o && setModal(null)} />
      <BuildShipModal open={modal === "build"} onOpenChange={(o) => !o && setModal(null)} />
      <CreateContractModal open={modal === "contract"} onOpenChange={(o) => !o && setModal(null)} />
    </div>
  );
}