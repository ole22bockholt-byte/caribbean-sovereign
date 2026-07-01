import React, { useState } from "react";
import { Sailboat, Coins, Loader2, Github, ArrowLeft, Ship } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { formatGold } from "@/lib/format";
import { useWikiShips } from "@/hooks/useWikiShips";
import ShipDetail from "@/components/game/wiki/ShipDetail";
import PortServiceHeader from "./PortServiceHeader";

// Verkaufspreis eines Schiffs herleiten (explizit oder aus der Klasse geschätzt).
export function shipPrice(ship) {
  if (Number.isFinite(ship?.price)) return ship.price;
  const p = Number(ship?.stats?.Preis ?? ship?.stats?.price);
  if (Number.isFinite(p) && p > 0) return p;
  const c = (ship?.class || "").toLowerCase();
  if (c.includes("galeone")) return 42000;
  if (c.includes("fregatte")) return 28000;
  if (c.includes("brigg")) return 15000;
  return 8000;
}

function ShipYardCard({ ship, price, onOpen, onBuy }) {
  return (
    <div className="panel text-left p-3 flex flex-col gap-2">
      <button onClick={onOpen} className="group flex flex-col gap-2 text-left">
        <div className="aspect-[16/10] rounded-sm overflow-hidden picture-ground border border-line flex items-center justify-center">
          {ship.imageUrl ? (
            <img src={ship.imageUrl} alt={ship.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <Ship className="w-10 h-10 text-ink-dim" strokeWidth={1.2} />
          )}
        </div>
        <div>
          <div className="font-display text-ink text-base leading-tight group-hover:text-brass-bright transition-colors">{ship.name}</div>
          {ship.class && <div className="font-body-game text-[11px] uppercase tracking-[0.18em] text-ink-dim mt-0.5">{ship.class}</div>}
        </div>
      </button>
      <div className="flex items-center justify-between mt-auto pt-1">
        <span className="inline-flex items-center gap-1 text-brass-bright font-display text-sm">
          <Coins className="w-4 h-4" /> {formatGold(price)} G
        </span>
        <button onClick={onBuy} className="brass-btn px-3 py-1.5 text-xs">Kaufen</button>
      </div>
    </div>
  );
}

// Schiffshändler (Werft): verkauft Schiffe aus demselben Katalog wie das Wiki
// (gleiche Assets über die Funktion `wikiShips`).
export default function SchiffshaendlerPanel({ port, factionByCode, economy, onBack, ships: shipsProp }) {
  const wiki = useWikiShips();
  // Optionaler Override (z. B. Dev-Harness ohne Backend).
  const ships = shipsProp || wiki.ships;
  const loading = shipsProp ? false : wiki.loading;
  const notice = shipsProp ? null : wiki.notice;
  const [selected, setSelected] = useState(null);

  const buy = (ship) => {
    const price = shipPrice(ship);
    const res = economy?.spend?.(price);
    if (!res?.ok) {
      toast({ title: "Kauf nicht möglich", description: res?.reason || "Unbekannter Fehler." });
      return;
    }
    toast({
      title: "Schiff gekauft",
      description: `${ship.name} für ${formatGold(price)} G erworben. Das Schiff wird in ${port?.name} ausgerüstet.`,
    });
  };

  if (selected) {
    const price = shipPrice(selected);
    return (
      <div className="panel rounded-sm h-full flex flex-col overflow-hidden">
        <PortServiceHeader
          icon={Sailboat}
          title="Schiffshändler"
          port={port}
          factionByCode={factionByCode}
          onBack={() => setSelected(null)}
          right={
            <button onClick={() => buy(selected)} className="brass-btn px-3 py-2 text-sm shrink-0">
              <Coins className="w-4 h-4" /> Kaufen · {formatGold(price)} G
            </button>
          }
        />
        <div className="flex-1 min-h-0 overflow-y-auto thin-scroll p-1">
          <button onClick={() => setSelected(null)} className="text-ink-dim hover:text-brass-bright hover:bg-transparent px-2 py-2 font-body-game inline-flex items-center text-sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Zurück zur Werft
          </button>
          <ShipDetail ship={selected} onBack={() => setSelected(null)} />
        </div>
      </div>
    );
  }

  return (
    <div className="panel rounded-sm h-full flex flex-col overflow-hidden">
      <PortServiceHeader
        icon={Sailboat}
        title="Schiffshändler"
        port={port}
        factionByCode={factionByCode}
        onBack={onBack}
        right={
          <span className="inline-flex items-center gap-1.5 text-brass-bright font-display text-sm shrink-0">
            <Coins className="w-4 h-4" /> {formatGold(economy?.effectiveGold ?? 0)} G
          </span>
        }
      />
      <div className="flex-1 min-h-0 overflow-y-auto thin-scroll p-4">
        <p className="font-body-game text-sm text-ink-dim mb-3">
          Die Werft von {port?.name} verkauft Schiffe aus dem Flottenkatalog.
        </p>

        {loading ? (
          <div className="flex items-center justify-center h-40 text-ink-dim gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-brass" /> <span className="font-body-game">Werft wird geladen …</span>
          </div>
        ) : notice ? (
          <div className="panel p-4 flex items-start gap-3">
            <Github className="w-5 h-5 text-ink-dim shrink-0 mt-0.5" />
            <p className="font-body-game text-sm text-ink-dim">{notice}</p>
          </div>
        ) : ships.length === 0 ? (
          <div className="panel p-8 text-center font-serif-game text-ink-dim">Zurzeit keine Schiffe im Angebot.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {ships.map((ship, i) => (
              <ShipYardCard
                key={ship.id || i}
                ship={ship}
                price={shipPrice(ship)}
                onOpen={() => setSelected(ship)}
                onBuy={() => buy(ship)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
