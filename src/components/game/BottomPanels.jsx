import React from "react";
import { Ship, Navigation, ScrollText, Mail } from "lucide-react";
import { SHIPS, VOYAGES, ACTIVE_CONTRACTS, MESSAGES } from "@/lib/mockData";
import SectionTitle from "./SectionTitle";
import Countdown from "./Countdown";

function Panel({ title, icon: Icon, count, children }) {
  return (
    <div className="panel rounded-sm flex flex-col min-h-0">
      <SectionTitle
        right={count != null && <span className="text-[11px] text-ink-dim font-body-game">{count}</span>}
      >
        <span className="inline-flex items-center gap-2"><Icon className="w-3.5 h-3.5" strokeWidth={1.6} /> {title}</span>
      </SectionTitle>
      <div className="flex-1 overflow-y-auto thin-scroll p-2.5 space-y-1.5">{children}</div>
    </div>
  );
}

const statusColor = (s) =>
  s === "Unterwegs" ? "text-brass-bright" : s === "Handelt" ? "text-[#3f7d4f]" : "text-ink-dim";

export default function BottomPanels() {
  return (
    <div className="grid grid-cols-4 gap-3 h-full min-h-0">
      <Panel title="Eigene Schiffe" icon={Ship} count={SHIPS.length}>
        {SHIPS.map((s) => (
          <div key={s.id} className="bg-wood-light border border-line rounded-sm px-2.5 py-1.5">
            <div className="flex items-center justify-between">
              <span className="font-serif-game text-[15px] text-ink leading-none">{s.name}</span>
              <span className={`text-[11px] font-body-game ${statusColor(s.status)}`}>{s.status}</span>
            </div>
            <div className="text-[11px] text-ink-dim font-body-game mt-0.5">
              {s.class} · {s.location} · ⚔ {s.firepower} · ☗ {s.crew}
            </div>
          </div>
        ))}
      </Panel>

      <Panel title="Laufende Reisen" icon={Navigation} count={VOYAGES.length}>
        {VOYAGES.map((v) => (
          <div key={v.id} className="bg-wood-light border border-line rounded-sm px-2.5 py-1.5">
            <div className="flex items-center justify-between">
              <span className="font-serif-game text-[15px] text-ink leading-none">{v.ship}</span>
              <Countdown seconds={v.etaSeconds} className="text-[11px]" />
            </div>
            <div className="text-[11px] text-ink-dim font-body-game mt-0.5">{v.from} → {v.to} · {v.cargo}</div>
            <div className="h-1 rounded-full bg-[var(--wood-deep)] overflow-hidden mt-1.5">
              <div className="h-full bg-[var(--brass)]" style={{ width: `${v.progress}%` }} />
            </div>
          </div>
        ))}
      </Panel>

      <Panel title="Aktive Aufträge" icon={ScrollText} count={ACTIVE_CONTRACTS.length}>
        {ACTIVE_CONTRACTS.map((c) => (
          <div key={c.id} className="bg-wood-light border border-line rounded-sm px-2.5 py-1.5">
            <div className="flex items-center justify-between">
              <span className="font-serif-game text-[15px] text-ink leading-none">{c.title}</span>
              <span className="text-[11px] font-display text-brass-bright">{c.reward} G</span>
            </div>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-[11px] text-ink-dim font-body-game">{c.port}</span>
              <span className="text-[11px] text-ink-dim font-body-game">Frist: <Countdown seconds={c.deadlineSeconds} className="text-[11px]" /></span>
            </div>
          </div>
        ))}
      </Panel>

      <Panel title="Nachrichten" icon={Mail} count={MESSAGES.filter((m) => m.unread).length}>
        {MESSAGES.map((m) => (
          <div key={m.id} className={`border rounded-sm px-2.5 py-1.5 ${m.unread ? "bg-wood-light border-brass/40" : "bg-wood border-line"}`}>
            <div className="flex items-center justify-between">
              <span className={`font-serif-game text-[15px] leading-none ${m.priority === "high" ? "text-[var(--blood)]" : "text-ink"}`}>
                {m.unread && <span className="text-brass mr-1">●</span>}{m.subject}
              </span>
            </div>
            <div className="text-[11px] text-ink-dim font-body-game mt-0.5">{m.from} · {m.time}</div>
          </div>
        ))}
      </Panel>
    </div>
  );
}