import React, { useState } from "react";
import GameModalShell from "./GameModalShell";
import Field from "./Field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PORTS } from "@/lib/mockData";

const selectCls = "bg-wood-deep border-line text-ink";
const TYPES = [
  { id: "delivery", label: "Lieferung" },
  { id: "escort", label: "Eskorte" },
  { id: "combat", label: "Kampf / Kaperfahrt" },
  { id: "smuggle", label: "Schmuggel" },
];

export default function CreateContractModal({ open, onOpenChange }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("delivery");
  const [port, setPort] = useState("port-royal");
  const [reward, setReward] = useState(1500);
  const [notes, setNotes] = useState("");

  const submit = () => {
    // Supabase-ready payload — later: insert into `contracts` (status: open).
    console.log("CREATE_CONTRACT", { title, type, port, reward: Number(reward), notes });
    onOpenChange(false);
  };

  return (
    <GameModalShell
      open={open}
      onOpenChange={onOpenChange}
      title="Auftrag erstellen"
      subtitle="Schreibe einen neuen Auftrag für andere Kompanien aus."
      footer={
        <>
          <Button variant="ghost" className="text-ink-dim hover:text-ink" onClick={() => onOpenChange(false)}>Abbrechen</Button>
          <Button className="bg-[var(--brass)] hover:bg-[var(--brass-bright)] text-[var(--wood-deep)] font-display" onClick={submit}>Auftrag ausschreiben</Button>
        </>
      }
    >
      <Field label="Titel">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="z. B. Pulver nach Tortuga liefern" className="bg-wood-deep border-line text-ink placeholder:text-ink-dim/60" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Art">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className={selectCls}><SelectValue /></SelectTrigger>
            <SelectContent className="bg-wood border-line text-ink">
              {TYPES.map((t) => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Belohnung (Gold)">
          <Input type="number" min={0} value={reward} onChange={(e) => setReward(e.target.value)} className="bg-wood-deep border-line text-ink" />
        </Field>
      </div>
      <Field label="Hafen">
        <Select value={port} onValueChange={setPort}>
          <SelectTrigger className={selectCls}><SelectValue /></SelectTrigger>
          <SelectContent className="bg-wood border-line text-ink">
            {PORTS.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Beschreibung">
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Details, Bedingungen, Fristen…" className="bg-wood-deep border-line text-ink placeholder:text-ink-dim/60 resize-none" />
      </Field>
    </GameModalShell>
  );
}