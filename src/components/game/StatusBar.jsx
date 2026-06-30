import React from "react";
import { Coins, TrendingUp, Ship, CalendarDays, Timer } from "lucide-react";
import { factionFlag } from "@/lib/gameData";
import { formatGold } from "@/lib/format";
import WorldClock from "./WorldClock";

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

function formatGameDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" });
}

export default function StatusBar({ player, world, factionByCode }) {
  const faction = factionByCode?.[player?.factionCode];

  return (
    <header className="bg-wood-deep border-b border-line flex items-stretch divide-x divide-[var(--line)]">
      <div className="flex items-center gap-2.5 px-4 py-2">
        <span className="text-xl" title={faction?.name}>{factionFlag(player?.factionCode)}</span>
        <div className="leading-tight">
          <div className="text-[9px] uppercase tracking-[0.16em] text-ink-dim font-body-game">Großfraktion</div>
          <div className="text-sm font-display text-ink">{faction?.name || "—"}</div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 px-4 py-2">
        <div className="leading-tight">
          <div className="text-[9px] uppercase tracking-[0.16em] text-ink-dim font-body-game">Kompanie</div>
          <div className="text-sm font-display text-brass-bright">{player?.companyName || "—"}</div>
        </div>
      </div>

      <div className="flex items-center divide-x divide-[var(--line)] flex-1">
        <Stat icon={Coins} label="Gold" value={formatGold(player?.gold || 0)} accent />
        <Stat icon={TrendingUp} label="Einfluss" value={formatGold(player?.influence || 0)} />
        <Stat icon={Ship} label="Schiffe" value={player?.ships?.length || 0} />
      </div>

      <div className="flex items-center gap-2.5 px-4 py-2">
        <CalendarDays className="w-4 h-4 text-ink-dim" strokeWidth={1.6} />
        <div className="leading-tight">
          <div className="text-[9px] uppercase tracking-[0.16em] text-ink-dim font-body-game">Spieldatum</div>
          <div className="text-sm font-display text-ink">{formatGameDate(world?.game_date)}</div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 px-4 py-2 bg-wood">
        <Timer className="w-4 h-4 text-brass pulse-dot" strokeWidth={1.6} />
        <div className="leading-tight">
          <div className="text-[9px] uppercase tracking-[0.16em] text-ink-dim font-body-game">Weltzeit</div>
          <WorldClock lastTickAt={world?.last_tick_at} className="text-sm" />
        </div>
      </div>
    </header>
  );
}