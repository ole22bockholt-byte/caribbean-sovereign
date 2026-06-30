import React from "react";
import { Shield, Anchor, TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";
import { factionFlag } from "@/lib/gameData";
import SectionTitle from "./SectionTitle";
import { Button } from "@/components/ui/button";

function Bar({ value, color }) {
  return (
    <div className="h-1.5 rounded-full bg-[var(--wood-deep)] overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
    </div>
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

const TrendIcon = ({ t }) =>
  t === "up" ? <TrendingUp className="w-3.5 h-3.5 text-[#3f7d4f]" /> :
  t === "down" ? <TrendingDown className="w-3.5 h-3.5 text-[var(--blood)]" /> :
  <Minus className="w-3.5 h-3.5 text-ink-dim" />;

export default function PortDetailPanel({ port, factionByCode, onTravel }) {
  if (!port) {
    return (
      <div className="panel rounded-sm h-full flex flex-col">
        <SectionTitle>Hafendetails</SectionTitle>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 text-ink-dim">
          <Anchor className="w-10 h-10 mb-3 opacity-40" strokeWidth={1.2} />
          <p className="font-serif-game text-lg">Wähle einen Hafen auf der Karte,</p>
          <p className="font-serif-game text-lg">um Details einzusehen.</p>
        </div>
      </div>
    );
  }

  const ctrl = factionByCode?.[port.controllingFactionCode];
  const securityColor = port.security >= 70 ? "#3f7d4f" : port.security >= 45 ? "#caa65a" : "#9b1c2e";

  return (
    <div className="panel rounded-sm h-full flex flex-col">
      <div className="panel-header px-4 py-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg text-brass-bright leading-none">{port.name}</h2>
          <span className="text-xl">{factionFlag(port.controllingFactionCode)}</span>
        </div>
        <div className="mt-1 text-sm text-ink-dim font-body-game">Kontrolle: {ctrl?.name || "—"}</div>
      </div>

      <div className="flex-1 overflow-y-auto thin-scroll">
        <Block title="Sicherheit">
          <div className="flex items-center gap-2 mb-1.5">
            <Shield className="w-4 h-4" style={{ color: securityColor }} />
            <span className="font-display text-sm" style={{ color: securityColor }}>{port.security}%</span>
          </div>
          <Bar value={port.security} color={securityColor} />
        </Block>

        {Object.keys(port.factionInfluence || {}).length > 0 && (
          <Block title="Fraktionseinfluss">
            <div className="space-y-2">
              {Object.entries(port.factionInfluence)
                .sort((a, b) => b[1] - a[1])
                .map(([fc, val]) => {
                  const color = factionByCode?.[fc]?.color || "#8a8a8a";
                  return (
                    <div key={fc} className="flex items-center gap-2">
                      <span className="w-7 text-xs text-ink-dim">{factionFlag(fc)}</span>
                      <div className="flex-1"><Bar value={val} color={color} /></div>
                      <span className="w-9 text-right text-xs font-display text-ink">{val}%</span>
                    </div>
                  );
                })}
            </div>
          </Block>
        )}

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
      </div>

      <div className="p-3 border-t border-line">
        <Button
          onClick={() => onTravel?.(port)}
          className="w-full bg-[var(--brass)] hover:bg-[var(--brass-bright)] text-[var(--wood-deep)] font-display tracking-wide border-0"
        >
          <Anchor className="w-4 h-4 mr-2" /> Zum Hafen wechseln <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}