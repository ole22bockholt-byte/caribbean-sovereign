import React, { useState } from "react";
import GameModalShell from "./GameModalShell";
import Field from "./Field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PORTS, TRADE_GOODS, SHIPS } from "@/lib/mockData";

const selectCls = "bg-wood-deep border-line text-ink";

export default function TradeModal({ open, onOpenChange }) {
  const [origin, setOrigin] = useState("port-royal");
  const [dest, setDest] = useState("kingston");
  const [good, setGood] = useState("Rum");
  const [qty, setQty] = useState(100);
  const [ship, setShip] = useState(SHIPS[0]?.id);

  const submit = () => {
    // Supabase-ready payload — later: insert into `voyages` + reserve cargo from `warehouses`.
    console.log("CREATE_TRADE", { origin, dest, good, qty: Number(qty), shipId: ship });
    onOpenChange(false);
  };

  return (
    <GameModalShell
      open={open}
      onOpenChange={onOpenChange}
      title="Handel starten"
      subtitle="Lege Route, Ware und Schiff für eine neue Handelsreise fest."
      footer={
        <>
          <Button variant="ghost" className="text-ink-dim hover:text-ink" onClick={() => onOpenChange(false)}>Abbrechen</Button>
          <Button className="bg-[var(--brass)] hover:bg-[var(--brass-bright)] text-[var(--wood-deep)] font-display" onClick={submit}>Reise auslaufen lassen</Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <Field label="Von Hafen">
          <Select value={origin} onValueChange={setOrigin}>
            <SelectTrigger className={selectCls}><SelectValue /></SelectTrigger>
            <SelectContent className="bg-wood border-line text-ink">
              {PORTS.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Nach Hafen">
          <Select value={dest} onValueChange={setDest}>
            <SelectTrigger className={selectCls}><SelectValue /></SelectTrigger>
            <SelectContent className="bg-wood border-line text-ink">
              {PORTS.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Ware">
          <Select value={good} onValueChange={setGood}>
            <SelectTrigger className={selectCls}><SelectValue /></SelectTrigger>
            <SelectContent className="bg-wood border-line text-ink">
              {TRADE_GOODS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Menge (Fässer)">
          <Input type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} className="bg-wood-deep border-line text-ink" />
        </Field>
      </div>
      <Field label="Schiff">
        <Select value={ship} onValueChange={setShip}>
          <SelectTrigger className={selectCls}><SelectValue /></SelectTrigger>
          <SelectContent className="bg-wood border-line text-ink">
            {SHIPS.map((s) => <SelectItem key={s.id} value={s.id}>{s.name} ({s.class})</SelectItem>)}
          </SelectContent>
        </Select>
      </Field>
    </GameModalShell>
  );
}