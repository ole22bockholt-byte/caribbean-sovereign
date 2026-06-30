import React, { useState } from "react";
import GameModalShell from "./GameModalShell";
import Field from "./Field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PORTS, SHIP_CLASSES } from "@/lib/mockData";
import { formatGold } from "@/lib/format";

const selectCls = "bg-wood-deep border-line text-ink";

export default function BuildShipModal({ open, onOpenChange }) {
  const [classId, setClassId] = useState(SHIP_CLASSES[1].id);
  const [name, setName] = useState("");
  const [shipyard, setShipyard] = useState("port-royal");

  const selected = SHIP_CLASSES.find((c) => c.id === classId);

  const submit = () => {
    // Supabase-ready payload — later: insert into `ships` (status: building) + deduct gold.
    console.log("BUILD_SHIP", { classId, name, shipyard });
    onOpenChange(false);
  };

  return (
    <GameModalShell
      open={open}
      onOpenChange={onOpenChange}
      title="Schiff bauen"
      subtitle="Beauftrage eine Werft mit dem Bau eines neuen Schiffes."
      footer={
        <>
          <Button variant="ghost" className="text-ink-dim hover:text-ink" onClick={() => onOpenChange(false)}>Abbrechen</Button>
          <Button className="bg-[var(--brass)] hover:bg-[var(--brass-bright)] text-[var(--wood-deep)] font-display" onClick={submit}>Bauauftrag erteilen</Button>
        </>
      }
    >
      <Field label="Schiffsname">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="z. B. HMS Triumph" className="bg-wood-deep border-line text-ink placeholder:text-ink-dim/60" />
      </Field>
      <Field label="Schiffsklasse">
        <Select value={classId} onValueChange={setClassId}>
          <SelectTrigger className={selectCls}><SelectValue /></SelectTrigger>
          <SelectContent className="bg-wood border-line text-ink">
            {SHIP_CLASSES.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Werft">
        <Select value={shipyard} onValueChange={setShipyard}>
          <SelectTrigger className={selectCls}><SelectValue /></SelectTrigger>
          <SelectContent className="bg-wood border-line text-ink">
            {PORTS.filter((p) => p.buildings.includes("Werft")).map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </Field>

      {selected && (
        <div className="grid grid-cols-4 gap-2 pt-1">
          {[
            { l: "Kosten", v: `${formatGold(selected.cost)} G` },
            { l: "Bauzeit", v: `${selected.days} Tage` },
            { l: "Feuerkraft", v: selected.firepower },
            { l: "Crew", v: selected.crew },
          ].map((s) => (
            <div key={s.l} className="bg-wood-light border border-line rounded-sm px-2 py-2 text-center">
              <div className="text-[9px] uppercase tracking-wider text-ink-dim font-body-game">{s.l}</div>
              <div className="font-display text-brass-bright text-sm mt-0.5">{s.v}</div>
            </div>
          ))}
        </div>
      )}
    </GameModalShell>
  );
}