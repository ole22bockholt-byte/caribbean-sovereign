import React, { useEffect, useMemo, useState } from "react";
import { Coins, TrendingUp, TrendingDown, Minus, Plus, Package, ShoppingCart, Ship, ArrowLeftRight } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { formatGold, levelFor } from "@/lib/format";
import { goodWeight, formatTons } from "@/lib/goodsData";
import PortServiceHeader from "./PortServiceHeader";

const TrendIcon = ({ t }) =>
  t === "up" ? <TrendingUp className="w-3.5 h-3.5 text-[var(--pos)]" /> :
  t === "down" ? <TrendingDown className="w-3.5 h-3.5 text-[var(--blood)]" /> :
  <Minus className="w-3.5 h-3.5 text-ink-dim" />;

function withAvailability(market) {
  if (!market || market.length === 0) return [];
  const prices = market.map((m) => m.buy);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const span = max - min || 1;
  return market.map((m) => ({ ...m, level: levelFor(Math.round((1 - (m.buy - min) / span) * 100)) }));
}

const toneColor = (tone) =>
  tone === "pos" ? "var(--pos)" : tone === "neg" ? "var(--blood)" : tone === "dim" ? "var(--ink-dim)" : "var(--brass)";

// Kapazitätsbalken (Tonnen).
function CargoBar({ used, capacity }) {
  const pct = capacity > 0 ? Math.min(100, (used / capacity) * 100) : 0;
  const color = pct >= 100 ? "var(--blood)" : pct >= 80 ? "var(--brass)" : "var(--pos)";
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] font-body-game text-ink-dim mb-1">
        <span>Laderaum</span>
        <span className="text-ink">{formatTons(used)} / {formatTons(capacity)}</span>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--wood-deep)] overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

// Händler: Warenhandel gegen die Hafenwirtschaft. Gekaufte Waren werden PHYSISCH
// in den Laderaum eines im Hafen liegenden Schiffs verladen (begrenzt durch die
// freie Tonnage); Verkäufe entladen. „Umladen" verschiebt Waren zwischen Schiffen.
export default function HaendlerPanel({ port, factionByCode, economy, shipsAtPort = [], onBack }) {
  const goods = useMemo(() => withAvailability(port?.market || []), [port]);
  const [selected, setSelected] = useState(goods[0]?.good || null);
  const [qty, setQty] = useState(1);
  const [shipId, setShipId] = useState(shipsAtPort[0]?.id || null);
  const [targetId, setTargetId] = useState(null);
  const [xferQty, setXferQty] = useState(1);

  useEffect(() => {
    if (shipsAtPort.length && !shipsAtPort.some((s) => s.id === shipId)) setShipId(shipsAtPort[0].id);
  }, [shipsAtPort, shipId]);

  const ship = shipsAtPort.find((s) => s.id === shipId) || null;
  const cap = ship?.cargoCapacity || 0;
  const used = ship ? economy?.holdWeight?.(ship.id) || 0 : 0;
  const free = Math.max(0, cap - used);
  const hold = ship ? economy?.holdItems?.(ship.id) || {} : {};

  const row = goods.find((g) => g.good === selected) || goods[0] || null;
  const onBoard = (good) => hold[good] || 0;
  const orderWeight = row ? qty * goodWeight(row.good) : 0;
  const canFit = orderWeight <= free + 1e-6;

  const otherShips = shipsAtPort.filter((s) => s.id !== shipId);
  useEffect(() => {
    if (otherShips.length && !otherShips.some((s) => s.id === targetId)) setTargetId(otherShips[0].id);
  }, [otherShips, targetId]);

  const doTrade = (side) => {
    if (!row || !ship) return;
    const unitPrice = side === "buy" ? row.buy : row.sell;
    const res = economy?.trade?.({ side, good: row.good, qty, unitPrice, shipId: ship.id, capacity: cap });
    if (!res?.ok) { toast({ title: "Handel nicht möglich", description: res?.reason || "Fehler." }); return; }
    toast({
      title: side === "buy" ? "Verladen" : "Entladen",
      description: `${qty} × ${row.good} (${formatTons(orderWeight)}) ${side === "buy" ? "an Bord der" : "von der"} ${ship.name} · ${formatGold(qty * unitPrice)} G`,
    });
  };

  const doTransfer = () => {
    if (!row || !ship || !targetId) return;
    const target = shipsAtPort.find((s) => s.id === targetId);
    const res = economy?.transfer?.({ good: row.good, qty: xferQty, fromShipId: ship.id, toShipId: targetId, toCapacity: target?.cargoCapacity });
    if (!res?.ok) { toast({ title: "Umladen nicht möglich", description: res?.reason || "Fehler." }); return; }
    toast({ title: "Umgeladen", description: `${xferQty} × ${row.good} → ${target?.name}` });
  };

  return (
    <div className="panel rounded-sm h-full flex flex-col overflow-hidden">
      <PortServiceHeader
        icon={Coins}
        title="Händler"
        port={port}
        factionByCode={factionByCode}
        onBack={onBack}
        right={
          <span className="inline-flex items-center gap-1.5 text-brass-bright font-display text-sm shrink-0">
            <Coins className="w-4 h-4" /> {formatGold(economy?.effectiveGold ?? 0)} G
          </span>
        }
      />

      <div className="flex-1 min-h-0 flex">
        {/* Warenliste */}
        <div className="flex-1 min-w-0 overflow-y-auto thin-scroll p-4">
          <p className="font-body-game text-sm text-ink-dim mb-3">
            Waren werden physisch in den Laderaum eines Schiffs im Hafen verladen (nach Gewicht in Tonnen).
          </p>
          {goods.length === 0 ? (
            <div className="panel p-6 text-center font-serif-game text-ink-dim">Keine Handelsdaten für diesen Hafen.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ware</th>
                  <th className="!text-right">Gewicht</th>
                  <th>Verfügbarkeit</th>
                  <th className="!text-right">Einkauf</th>
                  <th className="!text-right">Verkauf</th>
                  <th className="!text-right">Trend</th>
                  <th className="!text-right">An Bord</th>
                </tr>
              </thead>
              <tbody>
                {goods.map((g) => {
                  const active = g.good === selected;
                  return (
                    <tr key={g.good} onClick={() => { setSelected(g.good); setQty(1); }} className={`cursor-pointer ${active ? "!bg-[rgba(230,200,120,0.08)]" : ""}`}>
                      <td className="font-serif-game text-[14px] text-ink">{g.good}</td>
                      <td className="text-right text-ink-dim">{goodWeight(g.good)} t</td>
                      <td>
                        <span className="level-badge" style={{ color: toneColor(g.level.tone), borderColor: toneColor(g.level.tone) }}>{g.level.label}</span>
                      </td>
                      <td className="text-right text-ink">{g.buy} G</td>
                      <td className="text-right text-ink-dim">{g.sell} G</td>
                      <td><div className="flex justify-end"><TrendIcon t={g.trend} /></div></td>
                      <td className="text-right text-brass">{onBoard(g.good)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Handelsposten + Laderaum */}
        <div className="w-[288px] shrink-0 border-l border-line p-4 flex flex-col gap-3 overflow-y-auto thin-scroll bg-[rgba(11,17,22,0.35)]">
          <div className="font-display text-[10px] tracking-[0.16em] uppercase text-brass inline-flex items-center gap-1.5">
            <ShoppingCart className="w-3.5 h-3.5" /> Handelsposten
          </div>

          {shipsAtPort.length === 0 ? (
            <p className="text-sm text-ink-dim font-body-game">Kein Schiff im Hafen — Waren können nicht verladen werden. Setze zuerst ein Schiff hierher.</p>
          ) : (
            <>
              {/* Ziel-Schiff */}
              <div>
                <div className="text-[10px] uppercase tracking-wider text-ink-dim mb-1 font-body-game inline-flex items-center gap-1"><Ship className="w-3.5 h-3.5" /> Laderaum-Schiff</div>
                <select
                  value={shipId || ""}
                  onChange={(e) => setShipId(e.target.value)}
                  className="w-full bg-[var(--wood-light)] border border-line rounded-sm px-2 py-1 text-sm text-ink font-body-game focus:outline-none focus:border-brass"
                >
                  {shipsAtPort.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} · {formatTons(economy?.holdWeight?.(s.id) || 0)}/{formatTons(s.cargoCapacity || 0)}</option>
                  ))}
                </select>
              </div>

              {ship && <CargoBar used={used} capacity={cap} />}

              {row && (
                <>
                  <div className="font-serif-game text-lg text-brass-bright">{row.good} <span className="text-ink-dim text-sm">· {goodWeight(row.good)} t/Einh.</span></div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-ink-dim mb-1 font-body-game">Menge · {formatTons(orderWeight)}</div>
                    <div className="flex items-center gap-2">
                      <button className="ghost-btn !px-2" onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus className="w-3.5 h-3.5" /></button>
                      <input type="number" min="1" value={qty} onChange={(e) => setQty(Math.max(1, parseInt(e.target.value || "1", 10)))}
                        className="w-full text-center bg-[var(--wood-light)] border border-line rounded-sm px-2 py-1 text-ink font-display focus:outline-none focus:border-brass" />
                      <button className="ghost-btn !px-2" onClick={() => setQty((q) => q + 1)}><Plus className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <button className="brass-btn w-full py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed" disabled={!canFit} title={canFit ? "" : "Laderaum voll"} onClick={() => doTrade("buy")}>
                      Kaufen & verladen · {formatGold(qty * row.buy)} G
                    </button>
                    <button className="ghost-btn w-full py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed" disabled={onBoard(row.good) < qty} onClick={() => doTrade("sell")}>
                      Verkaufen & entladen · {formatGold(qty * row.sell)} G
                    </button>
                    {!canFit && <p className="text-[11px] text-[var(--blood)] font-body-game">Nur noch {formatTons(free)} frei.</p>}
                  </div>
                </>
              )}

              {/* Laderaum-Inhalt */}
              <div className="mt-1 border-t border-line pt-2">
                <div className="text-[10px] uppercase tracking-wider text-ink-dim mb-1 font-body-game inline-flex items-center gap-1"><Package className="w-3.5 h-3.5" /> An Bord: {ship?.name}</div>
                {Object.entries(hold).filter(([, q]) => q > 0).length === 0 ? (
                  <p className="text-[12px] text-ink-dim font-body-game">Laderaum leer.</p>
                ) : (
                  <div className="space-y-1">
                    {Object.entries(hold).filter(([, q]) => q > 0).map(([g, q]) => (
                      <div key={g} className="flex items-center justify-between text-[12px] font-body-game">
                        <span className="text-ink">{g}</span>
                        <span className="text-ink-dim">{q} · {formatTons(q * goodWeight(g))}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Umladen zwischen Schiffen */}
              {otherShips.length > 0 && row && (
                <div className="mt-1 border-t border-line pt-2 space-y-2">
                  <div className="text-[10px] uppercase tracking-wider text-ink-dim font-body-game inline-flex items-center gap-1"><ArrowLeftRight className="w-3.5 h-3.5" /> Umladen: {row.good}</div>
                  <div className="flex items-center gap-2">
                    <input type="number" min="1" value={xferQty} onChange={(e) => setXferQty(Math.max(1, parseInt(e.target.value || "1", 10)))}
                      className="w-16 text-center bg-[var(--wood-light)] border border-line rounded-sm px-2 py-1 text-ink font-display focus:outline-none focus:border-brass" />
                    <span className="text-ink-dim text-sm font-body-game">→</span>
                    <select value={targetId || ""} onChange={(e) => setTargetId(e.target.value)}
                      className="flex-1 bg-[var(--wood-light)] border border-line rounded-sm px-2 py-1 text-sm text-ink font-body-game focus:outline-none focus:border-brass">
                      {otherShips.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <button className="ghost-btn w-full py-1.5 text-sm" onClick={doTransfer}>Umladen</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
