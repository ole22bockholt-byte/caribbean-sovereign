import React from "react";
import { Coins, TrendingUp, Boxes, Users, Ship, CalendarDays, Timer } from "lucide-react";
import { PLAYER, WORLD, getFaction } from "@/lib/mockData";
import { formatGold } from "@/lib/format";
import Countdown from "./Countdown";

function Stat({ icon: Icon, label, value, accent }) {
  return (
    <div className="flex items-center gap-2 px-3.5 py-1.5">
      <Icon className={`w-4 h-4 ${accent ? "text-brass" : "text-ink-dim"}`} strokeWidth={1.6} />
      <div className="leading-tight">
        <div className="text-[9px] uppercase tracking-[0.16em] text-ink-dim font-body-game">{label}</div>
        <div className={`text-sm font-display ${accent ? "text-brass-bright" : "text-ink"}`}>{value}</div>
      </div>
    </div>
  );
}

export default function StatusBar() {
  const faction = getFaction(PLAYER.greatFaction);
  const totalResources = Object.values(PLAYER.resources).reduce((a, b) => a + b, 0);

  return (
    <header className="bg-wood-deep border-b border-line flex items-stretch divide-x divide-[var(--line)]">
      <div className="flex items-center gap-2.5 px-4 py-2">
        <span className="text-xl" title={faction.name}>{faction.flag}</span>
        <div className="leading-tight">
          <div className="text-[9px] uppercase tracking-[0.16em] text-ink-dim font-body-game">Großfraktion</div>
          <div className="text-sm font-display text-ink">{faction.name}</div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 px-4 py-2">
        <div className="leading-tight">
          <div className="text-[9px] uppercase tracking-[0.16em] text-ink-dim font-body-game">Kompanie</div>
          <div className="text-sm font-display text-brass-bright">{PLAYER.companyName}</div>
        </div>
      </div>

      <div className="flex items-center divide-x divide-[var(--line)] flex-1">
        <Stat icon={Coins} label="Gold" value={formatGold(PLAYER.gold)} accent />
        <Stat icon={TrendingUp} label="Einfluss" value={formatGold(PLAYER.influence)} />
        <Stat icon={Boxes} label="Ressourcen" value={formatGold(totalResources)} />
        <Stat icon={Users} label="Crew" value={PLAYER.crew} />
        <Stat icon={Ship} label="Schiffe" value={PLAYER.shipCount} />
      </div>

      <div className="flex items-center gap-2.5 px-4 py-2">
        <CalendarDays className="w-4 h-4 text-ink-dim" strokeWidth={1.6} />
        <div className="leading-tight">
          <div className="text-[9px] uppercase tracking-[0.16em] text-ink-dim font-body-game">Spieldatum</div>
          <div className="text-sm font-display text-ink">{WORLD.gameDate}</div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 px-4 py-2 bg-wood">
        <Timer className="w-4 h-4 text-brass pulse-dot" strokeWidth={1.6} />
        <div className="leading-tight">
          <div className="text-[9px] uppercase tracking-[0.16em] text-ink-dim font-body-game">Welt-Tick</div>
          <Countdown seconds={WORLD.tickIntervalSeconds} loop className="text-sm" />
        </div>
      </div>
    </header>
  );
}