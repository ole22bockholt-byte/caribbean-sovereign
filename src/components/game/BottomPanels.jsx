import React from "react";
import { Ship, Navigation, ScrollText, Mail } from "lucide-react";
import SectionTitle from "./SectionTitle";

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

function Empty({ text }) {
  return <p className="text-[12px] text-ink-dim font-body-game px-1 py-2">{text}</p>;
}

const statusColor = (s) =>
  s === "Unterwegs" ? "text-brass-bright" : s === "Im Gefecht" ? "text-[var(--blood)]" : "text-ink-dim";

export default function BottomPanels({ player, portNameByUuid }) {
  const ships = player?.ships || [];

  return (
    <div className="grid grid-cols-4 gap-3 h-full min-h-0">
      <Panel title="Eigene Schiffe" icon={Ship} count={ships.length}>
        {ships.length === 0 ? (
          <Empty text="Noch keine Schiffe." />
        ) : (
          ships.map((s) => (
            <div key={s.id} className="bg-wood-light border border-line rounded-sm px-2.5 py-1.5">
              <div className="flex items-center justify-between">
                <span className="font-serif-game text-[15px] text-ink leading-none">{s.name}</span>
                <span className={`text-[11px] font-body-game ${statusColor(s.status)}`}>{s.status}</span>
              </div>
              <div className="text-[11px] text-ink-dim font-body-game mt-0.5">
                {s.class} · {portNameByUuid?.[s.locationPortUuid] || "Auf See"} · ⚔ {s.firepower} · ☗ {s.crew}
              </div>
            </div>
          ))
        )}
      </Panel>

      <Panel title="Laufende Reisen" icon={Navigation} count={0}>
        <Empty text="Reisen folgen im nächsten Schritt." />
      </Panel>

      <Panel title="Aktive Aufträge" icon={ScrollText} count={0}>
        <Empty text="Aufträge folgen im nächsten Schritt." />
      </Panel>

      <Panel title="Nachrichten" icon={Mail} count={0}>
        <Empty text="Keine Nachrichten." />
      </Panel>
    </div>
  );
}