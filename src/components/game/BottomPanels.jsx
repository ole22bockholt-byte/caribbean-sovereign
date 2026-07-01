import React from "react";
import { Ship, Navigation, ScrollText, Mail } from "lucide-react";

// Gemeinsame Hülle: Kopf mit Titel/Anzahl, scrollbarer Inhalt, Fußzeile mit Aktion.
function PanelShell({ title, icon: Icon, count, footer, onFooter, children }) {
  return (
    <div className="panel rounded-sm flex flex-col min-h-0">
      <div className="panel-header px-3 py-2 flex items-center justify-between">
        <span className="font-display text-[12px] tracking-[0.16em] uppercase text-brass inline-flex items-center gap-2">
          <Icon className="w-3.5 h-3.5" strokeWidth={1.6} /> {title}
        </span>
        {count != null && <span className="text-[11px] text-ink-dim font-body-game">{count}</span>}
      </div>
      <div className="flex-1 overflow-y-auto thin-scroll px-2.5 py-2">{children}</div>
      {footer && (
        <div className="px-2.5 pb-2.5 pt-1">
          <button onClick={onFooter} className="ghost-btn w-full">{footer}</button>
        </div>
      )}
    </div>
  );
}

function EmptyRow({ text }) {
  return (
    <div className="h-full min-h-[60px] flex items-center justify-center text-center px-2">
      <span className="text-[12px] text-ink-dim font-body-game">{text}</span>
    </div>
  );
}

const statusColor = (s) =>
  s === "Unterwegs" ? "text-brass-bright" : s === "Im Gefecht" ? "text-blood" : "text-ink-dim";

export default function BottomPanels({ player, portNameByUuid, onSelect }) {
  const ships = player?.ships || [];
  const sailing = ships.filter((s) => s.status === "Unterwegs");

  return (
    <div className="grid grid-cols-4 gap-1 h-full min-h-0">
      {/* Eigene Schiffe */}
      <PanelShell
        title="Eigene Schiffe"
        icon={Ship}
        count={ships.length}
        footer="Alle Schiffe anzeigen"
        onFooter={() => onSelect?.("schiffe")}
      >
        {ships.length === 0 ? (
          <EmptyRow text="Noch keine Schiffe." />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Schiff</th>
                <th>Typ</th>
                <th>Standort</th>
                <th>Status</th>
                <th className="!text-right">Crew</th>
              </tr>
            </thead>
            <tbody>
              {ships.map((s) => (
                <tr key={s.id}>
                  <td className="font-serif-game text-[13px]">{s.name}</td>
                  <td className="text-ink-dim">{s.class}</td>
                  <td className="text-ink-dim">{portNameByUuid?.[s.locationPortUuid] || "Auf See"}</td>
                  <td className={statusColor(s.status)}>{s.status}</td>
                  <td className="text-right">{s.crew}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </PanelShell>

      {/* Laufende Reisen */}
      <PanelShell
        title="Laufende Reisen"
        icon={Navigation}
        count={sailing.length}
        footer="Alle Reisen anzeigen"
        onFooter={() => onSelect?.("flotte")}
      >
        {sailing.length === 0 ? (
          <EmptyRow text="Keine laufenden Reisen." />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Schiff</th>
                <th>Von</th>
                <th>Nach</th>
                <th className="!text-right">Ankunft</th>
              </tr>
            </thead>
            <tbody>
              {sailing.map((s) => (
                <tr key={s.id}>
                  <td className="font-serif-game text-[13px]">{s.name}</td>
                  <td className="text-ink-dim">{portNameByUuid?.[s.locationPortUuid] || "See"}</td>
                  <td className="text-ink-dim">—</td>
                  <td className="text-right text-ink-dim">—</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </PanelShell>

      {/* Aktive Aufträge */}
      <PanelShell
        title="Aktive Aufträge"
        icon={ScrollText}
        count={0}
        footer="Alle Aufträge anzeigen"
        onFooter={() => onSelect?.("auftraege")}
      >
        <EmptyRow text="Noch keine aktiven Aufträge." />
      </PanelShell>

      {/* Nachrichten */}
      <PanelShell
        title="Nachrichten"
        icon={Mail}
        count={0}
        footer="Alle Nachrichten anzeigen"
        onFooter={() => onSelect?.("berichte")}
      >
        <EmptyRow text="Keine Nachrichten." />
      </PanelShell>
    </div>
  );
}
