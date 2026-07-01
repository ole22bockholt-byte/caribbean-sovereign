import React, { useState } from "react";
import { Coins, TrendingUp, Ship, Users, Pause, Play } from "lucide-react";
import { factionFlag, factionFlagImage } from "@/lib/gameData";
import { formatGold, reputationRank } from "@/lib/format";
import WorldClock from "./WorldClock";
import WorldDate from "./WorldDate";

// Einzelne Kennzahl im rechten Ressourcen-Cluster der Statusleiste.
function Stat({ icon: Icon, label, value, accent = false }) {
  return (
    <div className="flex items-center gap-2 px-3.5 py-1.5">
      <Icon className={`w-4 h-4 ${accent ? "text-brass" : "text-ink-dim"}`} strokeWidth={1.6} />
      <div className="leading-tight">
        <div className="text-[9px] uppercase tracking-[0.16em] text-ink-dim font-body-game">{label}</div>
        <div className={`text-sm font-display leading-tight ${accent ? "text-brass-bright" : "text-ink"}`}>{value}</div>
      </div>
    </div>
  );
}

export default function StatusBar({ player, world, factionByCode }) {
  const [paused, setPaused] = useState(false);
  const faction = factionByCode?.[player?.factionCode];
  const flagImg = factionFlagImage(player?.factionCode);

  const ships = player?.ships || [];
  const crewTotal = ships.reduce((sum, s) => sum + (Number(s.crew) || 0), 0);
  const influence = player?.influence || 0;

  return (
    <header className="nav-ground nav-line-b flex items-stretch divide-x divide-[var(--line)]">
      {/* Wappen + Großfraktion */}
      <div className="flex items-center gap-3 px-4 py-2">
        <div className="w-9 h-9 rounded-sm border border-line bg-[var(--wood-light)] flex items-center justify-center overflow-hidden shrink-0">
          {flagImg ? (
            <img src={flagImg} alt={faction?.name || "Wappen"} className="w-full h-full object-cover" />
          ) : (
            <span className="text-lg" title={faction?.name}>{factionFlag(player?.factionCode)}</span>
          )}
        </div>
        <div className="leading-tight">
          <div className="text-[9px] uppercase tracking-[0.16em] text-ink-dim font-body-game">Großfraktion</div>
          <div className="text-sm font-display text-brass-bright leading-tight">{faction?.name || "—"}</div>
          <div className="text-[11px] text-ink-dim font-body-game leading-tight">Westindische Kompanie</div>
        </div>
      </div>

      {/* Kompanie + Ruf */}
      <div className="flex items-center px-4 py-2">
        <div className="leading-tight">
          <div className="text-[9px] uppercase tracking-[0.16em] text-ink-dim font-body-game">Kompanie</div>
          <div className="text-sm font-display text-ink leading-tight">{player?.companyName || "—"}</div>
          <div className="text-[11px] text-ink-dim font-body-game leading-tight">
            Ruf: <span className="text-brass">{formatGold(influence)}</span> ({reputationRank(influence)})
          </div>
        </div>
      </div>

      {/* Ressourcen-Cluster */}
      <div className="flex items-center divide-x divide-[var(--line)] ml-auto">
        <Stat icon={Coins} label="Gold" value={formatGold(player?.gold || 0)} accent />
        <Stat icon={TrendingUp} label="Einfluss" value={formatGold(influence)} />
        <Stat icon={Users} label="Crew" value={crewTotal} />
        <Stat icon={Ship} label="Schiffe" value={ships.length} />
      </div>

      {/* Datum + Weltuhr + Pause */}
      <div className="flex items-center gap-3 px-4 py-2">
        <div className="leading-tight text-right">
          <WorldDate
            gameDate={world?.game_date}
            lastTickAt={world?.last_tick_at}
            className="text-sm font-display text-ink leading-tight block"
          />
          <WorldClock lastTickAt={world?.last_tick_at} className="text-sm leading-tight" />
        </div>
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          title={paused ? "Fortsetzen" : "Pause"}
          className="w-8 h-8 rounded-sm border border-line bg-[var(--wood-light)] flex items-center justify-center text-brass hover:text-brass-bright hover:border-brass transition-colors"
        >
          {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
