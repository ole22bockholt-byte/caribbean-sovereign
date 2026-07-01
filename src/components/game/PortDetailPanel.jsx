import React, { useState } from "react";
import { Anchor, TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";
import { factionFlag } from "@/lib/gameData";
import { securityLevel, levelFor } from "@/lib/format";
import { asset } from "@/lib/assets";

const HARBOR_IMG = asset("assets/harbor.png");

const TABS = [
  { id: "uebersicht", label: "Übersicht" },
  { id: "markt", label: "Markt" },
  { id: "auftraege", label: "Aufträge" },
  { id: "gebaeude", label: "Gebäude" },
];

// Ton -> Farbe für Level-Badges (Sicherheit, Ressourcen).
const toneColor = (tone) =>
  tone === "pos" ? "var(--pos)" :
  tone === "neg" ? "var(--blood)" :
  tone === "dim" ? "var(--ink-dim)" : "var(--brass)";

const TrendIcon = ({ t }) =>
  t === "up" ? <TrendingUp className="w-3.5 h-3.5 text-[var(--pos)]" /> :
  t === "down" ? <TrendingDown className="w-3.5 h-3.5 text-[var(--blood)]" /> :
  <Minus className="w-3.5 h-3.5 text-ink-dim" />;

function LevelBadge({ level }) {
  const color = toneColor(level.tone);
  return (
    <span className="level-badge" style={{ color, borderColor: color }}>
      {level.label}
    </span>
  );
}

function Block({ title, children }) {
  return (
    <div className="px-4 py-3 border-b border-line">
      <div className="font-display text-[10px] tracking-[0.16em] uppercase text-brass mb-2">{title}</div>
      {children}
    </div>
  );
}

// Verfügbarkeit einer Ware aus dem lokalen Preis ableiten (günstig = hoch verfügbar).
function resourceLevels(market) {
  if (!market || market.length === 0) return [];
  const prices = market.map((m) => m.buy);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const span = max - min || 1;
  return market.map((m) => {
    const score = Math.round((1 - (m.buy - min) / span) * 100);
    return { good: m.good, level: levelFor(score) };
  });
}

export default function PortDetailPanel({ port, factionByCode, onTravel }) {
  const [tab, setTab] = useState("uebersicht");

  if (!port) {
    return (
      <div className="panel rounded-sm h-full flex flex-col">
        <div className="panel-header px-4 py-3">
          <h2 className="font-display text-lg text-brass-bright leading-none">Hafendetails</h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 text-ink-dim">
          <Anchor className="w-10 h-10 mb-3 opacity-40" strokeWidth={1.2} />
          <p className="font-serif-game text-lg">Wähle einen Hafen auf der Karte,</p>
          <p className="font-serif-game text-lg">um Details einzusehen.</p>
        </div>
      </div>
    );
  }

  const ctrl = factionByCode?.[port.controllingFactionCode];
  const sec = securityLevel(port.security);
  const secColor = toneColor(sec.tone);
  const resources = resourceLevels(port.market);
  const influence = Object.entries(port.factionInfluence || {}).sort((a, b) => b[1] - a[1]);

  return (
    <div className="panel rounded-sm h-full flex flex-col">
      {/* Kopf */}
      <div className="panel-header px-4 py-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg text-brass-bright leading-none">{port.name}</h2>
          <span className="text-xl">{factionFlag(port.controllingFactionCode)}</span>
        </div>
        <div className="mt-1 text-sm text-ink-dim font-body-game">
          {ctrl?.name || "Neutral"} · Handelshafen
        </div>
      </div>

      {/* Hafenbild */}
      <div className="picture-ground h-24 relative shrink-0 border-b border-line">
        <img src={HARBOR_IMG} alt={port.name} className="w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(11,17,22,0.8)] to-transparent" />
      </div>

      {/* Tabs */}
      <div className="game-tabs px-1 nav-line-b">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`game-tab ${tab === t.id ? "is-active" : ""}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto thin-scroll">
        {tab === "uebersicht" && (
          <>
            <Block title="Sicherheit">
              <div className="flex items-center justify-between">
                <span className="font-body-game text-sm text-ink">{port.security}%</span>
                <LevelBadge level={sec} />
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-[var(--wood-deep)] overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${port.security}%`, backgroundColor: secColor }} />
              </div>
            </Block>

            {influence.length > 0 && (
              <Block title="Einfluss">
                <div className="space-y-1.5">
                  {influence.map(([fc, val]) => {
                    const f = factionByCode?.[fc];
                    return (
                      <div key={fc} className="flex items-center justify-between text-sm font-body-game">
                        <span className="text-ink-dim">
                          Einfluss ({f?.name || fc})
                        </span>
                        <span className="text-ink font-display" style={{ color: f?.color }}>{val}%</span>
                      </div>
                    );
                  })}
                </div>
              </Block>
            )}

            <Block title="Verfügbare Ressourcen">
              {resources.length === 0 ? (
                <p className="text-sm text-ink-dim font-body-game">Keine Handelsdaten.</p>
              ) : (
                <div className="space-y-1.5">
                  {resources.map((r) => (
                    <div key={r.good} className="flex items-center justify-between">
                      <span className="text-sm text-ink font-body-game">{r.good}</span>
                      <LevelBadge level={r.level} />
                    </div>
                  ))}
                </div>
              )}
            </Block>
          </>
        )}

        {tab === "markt" && (
          <Block title="Marktpreise">
            {port.market.length === 0 ? (
              <p className="text-sm text-ink-dim font-body-game">Keine Marktdaten.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-ink-dim">
                    <th className="text-left font-normal pb-1">Ware</th>
                    <th className="text-right font-normal pb-1">Kauf</th>
                    <th className="text-right font-normal pb-1">Verkauf</th>
                    <th className="text-right font-normal pb-1">Trend</th>
                  </tr>
                </thead>
                <tbody className="font-body-game">
                  {port.market.map((m) => (
                    <tr key={m.good} className="border-t border-line/60">
                      <td className="py-1 text-ink">{m.good}</td>
                      <td className="py-1 text-right text-ink">{m.buy} G</td>
                      <td className="py-1 text-right text-ink-dim">{m.sell} G</td>
                      <td className="py-1"><div className="flex justify-end"><TrendIcon t={m.trend} /></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Block>
        )}

        {tab === "auftraege" && (
          <div className="px-4 py-6 text-center text-sm text-ink-dim font-body-game">
            Aufträge dieses Hafens folgen in einem späteren Schritt.
          </div>
        )}

        {tab === "gebaeude" && (
          <div className="px-4 py-6 text-center text-sm text-ink-dim font-body-game">
            Gebäude & Ausbau folgen in einem späteren Schritt.
          </div>
        )}
      </div>

      <div className="p-3 border-t border-line">
        <button
          onClick={() => onTravel?.(port)}
          className="brass-btn w-full py-2 text-sm tracking-wide"
        >
          <Anchor className="w-4 h-4" /> Zum Hafen wechseln <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
