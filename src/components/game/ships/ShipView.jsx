import React, { useMemo, useState } from "react";
import {
  X, Ship, Box, Sailboat, Coins, Wrench, Package, Users, Anchor,
  Crosshair, Gauge, Star, Layers, ScrollText, ShieldCheck, UserRound,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { factionFlag, factionFlagImage } from "@/lib/gameData";
import { buildShipDetail } from "@/lib/shipData";
import { formatGold } from "@/lib/format";

const TABS = [
  { id: "uebersicht", label: "Übersicht" },
  { id: "ausruestung", label: "Ausrüstung" },
  { id: "upgrades", label: "Upgrades" },
  { id: "reparaturen", label: "Reparaturen" },
  { id: "historie", label: "Historie" },
  { id: "anpassen", label: "Anpassen" },
];

const soon = (title) =>
  toast({ title, description: "Diese Funktion wird später mit dem Spielsystem verknüpft." });

const barColor = (v) => (v >= 75 ? "var(--pos)" : v >= 50 ? "var(--brass)" : "var(--blood)");

// ---- kleine Bausteine -------------------------------------------------------

function Panel({ title, icon: Icon = null, footer = null, onFooter = () => {}, className = "", children }) {
  return (
    <div className={`panel rounded-sm flex flex-col ${className}`}>
      <div className="panel-header px-3 py-2">
        <span className="font-display text-[11px] tracking-[0.16em] uppercase text-brass inline-flex items-center gap-2">
          {Icon && <Icon className="w-3.5 h-3.5" strokeWidth={1.6} />} {title}
        </span>
      </div>
      <div className="p-3 flex-1 min-h-0">{children}</div>
      {footer && (
        <div className="px-3 pb-3">
          <button className="ghost-btn w-full" onClick={onFooter}>{footer}</button>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, flag = null, accent = false }) {
  return (
    <div className="flex items-center justify-between py-[3px] text-[13px] font-body-game">
      <span className="text-ink-dim">{label}</span>
      <span className={`inline-flex items-center gap-1.5 ${accent ? "text-brass-bright" : "text-ink"}`}>
        {flag && <span>{flag}</span>}
        {value}
      </span>
    </div>
  );
}

function BarRow({ label, value }) {
  return (
    <div className="mb-2 last:mb-0">
      <div className="flex items-center justify-between text-[12px] font-body-game mb-1">
        <span className="text-ink-dim">{label}</span>
        <span className="text-ink">{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--wood-deep)] overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: barColor(value) }} />
      </div>
    </div>
  );
}

function Progress({ value, max }) {
  const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  return (
    <div className="h-2 rounded-full bg-[var(--wood-deep)] overflow-hidden">
      <div className="h-full rounded-full bg-[var(--brass)]" style={{ width: `${pct}%` }} />
    </div>
  );
}

// ---- Übersicht --------------------------------------------------------------

function Overview({ detail }) {
  return (
    <div className="space-y-1">
      {/* Oberer Bereich: Darstellung + Kennwerte */}
      <div className="flex gap-1 flex-col xl:flex-row">
        {/* Schiffsdarstellung */}
        <div className="panel rounded-sm flex-[5] min-w-0 flex flex-col p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="font-display text-[11px] tracking-[0.16em] uppercase text-brass inline-flex items-center gap-2">
              <Star className="w-3.5 h-3.5" strokeWidth={1.6} /> Rang &amp; Erfahrung
            </span>
            <span className="text-[12px] font-body-game text-ink-dim">
              Stufe <span className="text-brass-bright font-display">{detail.level}</span> · {formatGold(detail.xp)} / {formatGold(detail.xpMax)} EP
            </span>
          </div>
          <Progress value={detail.xp} max={detail.xpMax} />

          <div className="flex gap-3 mt-3 flex-1 min-h-[240px]">
            <div className="picture-ground relative flex-1 rounded-sm border border-line flex items-center justify-center overflow-hidden">
              <Ship className="w-28 h-28 text-[var(--ink-dim)] opacity-40" strokeWidth={1} />
              <span className="absolute top-2 left-2 text-[10px] uppercase tracking-[0.14em] text-ink-dim font-body-game">
                Schiffsdarstellung · Platzhalter
              </span>
              <button
                onClick={() => soon("3D-Ansicht")}
                className="ghost-btn absolute bottom-2 left-2"
              >
                <Box className="w-3.5 h-3.5" /> 3D-Ansicht
              </button>
            </div>
            <div className="w-28 shrink-0 flex flex-col gap-3">
              {["Vorderansicht", "Heckansicht"].map((lbl) => (
                <div key={lbl} className="picture-ground rounded-sm border border-line flex-1 flex flex-col items-center justify-center gap-1">
                  <Ship className="w-8 h-8 text-[var(--ink-dim)] opacity-40" strokeWidth={1} />
                  <span className="text-[10px] text-ink-dim font-body-game">{lbl}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Kennwert-Panels 2×3 */}
        <div className="flex-[7] min-w-0 grid grid-cols-1 md:grid-cols-2 gap-1 auto-rows-min">
          <Panel title="Schiffsdaten" icon={Ship}>
            {detail.dataRows.map((r) => (
              <Row key={r.label} label={r.label} value={r.value} flag={r.flag} accent={r.accent} />
            ))}
          </Panel>

          <Panel title="Zustand" icon={ShieldCheck}>
            {detail.condition.map((c) => (
              <BarRow key={c.label} label={c.label} value={c.value} />
            ))}
            <div className="mt-2 pt-2 border-t border-line">
              <BarRow label="Gesamtzustand" value={detail.conditionTotal} />
            </div>
          </Panel>

          <Panel title="Bewaffnung" icon={Crosshair} footer="Bewaffnung verwalten" onFooter={() => soon("Bewaffnung verwalten")}>
            {detail.armament.map((a) => (
              <div key={a.label} className="flex items-center justify-between py-[3px] text-[13px] font-body-game">
                <span className="text-ink-dim">{a.label}</span>
                <span className="text-ink"><span className="font-display text-brass-bright">{a.count}</span> · {a.note}</span>
              </div>
            ))}
            <div className="mt-2 pt-2 border-t border-line">
              <Row label="Gesamtbreitseiten" value={detail.broadside} accent />
            </div>
          </Panel>

          <Panel title="Crew" icon={Users} footer="Crew verwalten" onFooter={() => soon("Crew verwalten")}>
            <Row label="Max. Besatzung" value={detail.crew.max} />
            <Row label="Aktuelle Besatzung" value={detail.crew.current} accent />
            <Row label="Offiziere" value={detail.crew.officers} />
            <div className="mt-2 pt-2 border-t border-line space-y-2">
              <BarRow label="Moral" value={detail.crew.morale} />
              <BarRow label="Disziplin" value={detail.crew.discipline} />
            </div>
          </Panel>

          <Panel title="Leistung" icon={Gauge}>
            {detail.performance.map((p) => (
              <Row key={p.label} label={p.label} value={p.value} />
            ))}
          </Panel>

          <Panel title="Kapitän" icon={UserRound} footer="Kapitän wechseln" onFooter={() => soon("Kapitän wechseln")}>
            <div className="flex gap-3">
              <div className="w-14 h-14 rounded-sm border border-brass bg-[var(--wood-light)] overflow-hidden shrink-0 flex items-center justify-center">
                {detail.captain.portrait ? (
                  <img src={detail.captain.portrait} alt={detail.captain.name} className="w-full h-full object-cover" />
                ) : (
                  <UserRound className="w-7 h-7 text-brass" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-display text-brass-bright text-sm leading-tight">{detail.captain.name}</div>
                <Row label="Rang" value={detail.captain.rank} />
                <Row label="Erfahrung" value={`${formatGold(detail.captain.xp)} / ${formatGold(detail.captain.xpMax)}`} />
                <Row label="Spezialisierung" value={detail.captain.specialization} />
              </div>
            </div>
          </Panel>
        </div>
      </div>

      {/* Unterer Bereich: 4 Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-1">
        <Panel
          title={`Laderaum · ${detail.cargo.used} / ${detail.cargo.capacity} t (${Math.round((detail.cargo.used / detail.cargo.capacity) * 100)} %)`}
          icon={Package}
          footer="Laderaum verwalten"
          onFooter={() => soon("Laderaum verwalten")}
        >
          <table className="data-table">
            <thead>
              <tr>
                <th>Ware</th>
                <th className="!text-right">Menge</th>
                <th className="!text-right">Gewicht</th>
                <th className="!text-right">Wert</th>
              </tr>
            </thead>
            <tbody>
              {detail.cargo.items.map((it) => (
                <tr key={it.good}>
                  <td>{it.good}</td>
                  <td className="text-right text-ink-dim">{it.amount}</td>
                  <td className="text-right text-ink-dim">{it.weight} t</td>
                  <td className="text-right">{it.value != null ? formatGold(it.value) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel title="Module & Upgrades" icon={Layers} footer="Upgrades verwalten" onFooter={() => soon("Upgrades verwalten")}>
          <div className="space-y-1">
            {detail.modules.map((m) => (
              <div key={m.name} className="flex items-center justify-between py-[3px] text-[13px] font-body-game">
                <span className="text-ink">{m.name}</span>
                <span className="level-badge text-brass" style={{ borderColor: "var(--line)" }}>Stufe {m.level}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Kosten & Unterhalt" icon={Coins}>
          {detail.costs.map((c) => (
            <Row key={c.label} label={c.label} value={formatGold(c.value)} />
          ))}
          <div className="mt-2 pt-2 border-t border-line">
            <Row label="Monatliche Gesamtkosten" value={formatGold(detail.monthlyTotal)} accent />
          </div>
        </Panel>

        <Panel title="Aktuelle Aufträge" icon={ScrollText} footer="Alle Aufträge anzeigen" onFooter={() => soon("Alle Aufträge anzeigen")}>
          <div className="space-y-2">
            {detail.orders.map((o) => (
              <div key={o.title} className="border-b border-line pb-2 last:border-0 last:pb-0">
                <div className="flex items-start gap-2">
                  <ScrollText className="w-3.5 h-3.5 text-brass mt-0.5 shrink-0" strokeWidth={1.6} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-body-game text-ink leading-tight">{o.title}</div>
                    <div className="text-[11px] text-ink-dim font-body-game">{o.sub}</div>
                  </div>
                  <span className="text-[11px] text-brass whitespace-nowrap">{o.eta}</span>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

// ---- Hauptkomponente --------------------------------------------------------

export default function ShipView({ player, factionByCode, portNameByUuid, onNavigate }) {
  const ships = player?.ships || [];
  const [shipId, setShipId] = useState(ships[0]?.id);
  const [tab, setTab] = useState("uebersicht");

  const ship = ships.find((s) => s.id === shipId) || ships[0] || null;
  const faction = factionByCode?.[player?.factionCode];

  const detail = useMemo(() => {
    if (!ship) return null;
    return buildShipDetail(ship, {
      factionName: faction?.name || "Neutral",
      factionFlag: factionFlag(player?.factionCode),
      currentPortName: portNameByUuid?.[ship.locationPortUuid] || "Auf See",
    });
  }, [ship, faction, player, portNameByUuid]);

  const flagImg = factionFlagImage(player?.factionCode);

  const ACTIONS = [
    { id: "sail", label: "Auslaufen", icon: Sailboat, onClick: () => soon("Auslaufen") },
    { id: "trade", label: "Handel", icon: Coins, onClick: () => soon("Handel") },
    { id: "repair", label: "Reparieren", icon: Wrench, onClick: () => soon("Reparieren") },
    { id: "transfer", label: "Umladen", icon: Package, onClick: () => soon("Umladen") },
    { id: "crew", label: "Crew verwalten", icon: Users, onClick: () => soon("Crew verwalten") },
  ];

  if (!ship) {
    return (
      <div className="panel rounded-sm h-full flex flex-col items-center justify-center text-center text-ink-dim gap-3">
        <Ship className="w-10 h-10 opacity-40" strokeWidth={1.2} />
        <p className="font-serif-game text-lg">Noch keine Schiffe in deiner Flotte.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-1 min-h-0">
      {/* Kopf + Tabs */}
      <div className="panel rounded-sm shrink-0">
        <div className="px-4 py-2.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-sm border border-line bg-[var(--wood-light)] flex items-center justify-center overflow-hidden shrink-0">
            {flagImg ? (
              <img src={flagImg} alt={faction?.name || "Wappen"} className="w-full h-full object-cover" />
            ) : (
              <Anchor className="w-5 h-5 text-brass" />
            )}
          </div>
          <div className="leading-tight min-w-0">
            <div className="font-display text-lg text-brass-bright leading-tight truncate">
              {ship.name}
              {ship.isDummy && (
                <span className="ml-2 align-middle level-badge text-ink-dim" style={{ borderColor: "var(--line)" }}>Dummy</span>
              )}
            </div>
            <div className="text-[12px] text-ink-dim font-body-game">
              {ship.class}{detail?.rank ? ` – ${detail.rank}` : ""}
            </div>
          </div>

          {/* Schiffsauswahl */}
          {ships.length > 1 && (
            <div className="ml-4 flex items-center gap-1.5 overflow-x-auto thin-scroll">
              {ships.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setShipId(s.id)}
                  className={`px-2.5 py-1 rounded-sm text-[12px] font-body-game whitespace-nowrap border transition-colors ${
                    s.id === ship.id
                      ? "border-brass text-brass-bright bg-[var(--wood-light)]"
                      : "border-line text-ink-dim hover:text-ink"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => onNavigate?.("uebersicht")}
            title="Schließen"
            className="ml-auto w-8 h-8 rounded-sm border border-line bg-[var(--wood-light)] flex items-center justify-center text-ink-dim hover:text-brass-bright hover:border-brass transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="game-tabs px-1 border-t border-line">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`game-tab ${tab === t.id ? "is-active" : ""}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inhalt */}
      <div className="flex-1 overflow-y-auto thin-scroll min-h-0 pr-1">
        {tab === "uebersicht" && detail ? (
          <Overview detail={detail} />
        ) : (
          <div className="panel rounded-sm h-full flex flex-col items-center justify-center text-center text-ink-dim gap-2 py-16">
            <Ship className="w-9 h-9 opacity-40" strokeWidth={1.2} />
            <p className="font-serif-game text-lg">
              „{TABS.find((t) => t.id === tab)?.label}" folgt in einem späteren Schritt.
            </p>
            <p className="text-[12px]">Dieser Bereich ist als Platzhalter für die spätere Anbindung vorgesehen.</p>
          </div>
        )}
      </div>

      {/* Aktionsleiste */}
      <div className="panel rounded-sm shrink-0 px-3 py-2 flex items-center gap-2 flex-wrap">
        {ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.id}
              onClick={a.onClick}
              className="ghost-btn px-3 py-2 flex-1 min-w-[120px]"
            >
              <Icon className="w-4 h-4" /> {a.label}
            </button>
          );
        })}
        <button
          onClick={() => onNavigate?.("flotte")}
          className="brass-btn px-4 py-2 flex-1 min-w-[120px] text-sm"
        >
          <Anchor className="w-4 h-4" /> Zur Flotte
        </button>
      </div>
    </div>
  );
}
