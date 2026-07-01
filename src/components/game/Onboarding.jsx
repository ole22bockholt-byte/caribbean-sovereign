import React, { useState } from "react";
import { invokeFunction } from "@/api/supabaseClient";
import { Anchor, Coins, Ship, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { factionFlag } from "@/lib/gameData";
import { formatGold } from "@/lib/format";
import { asset } from "@/lib/assets";

const PARCHMENT = asset("assets/parchment.png");
const STARTING_GOLD = 25000;

// Vollbild-Onboarding: Spieler wählt Fraktion + Starthafen und benennt seine Kompanie.
export default function Onboarding({ factions, ports, onDone }) {
  const [companyName, setCompanyName] = useState("");
  const [factionCode, setFactionCode] = useState(factions?.[0]?.code || "");
  const [portCode, setPortCode] = useState(ports?.[0]?.id || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const submit = async () => {
    if (!factionCode || !portCode) return;
    setSubmitting(true);
    setError(null);
    try {
      await invokeFunction("createPlayer", {
        faction_code: factionCode,
        home_port_code: portCode,
        company_name: companyName,
      });
      onDone();
    } catch (e) {
      setError(e.message || "Erstellung fehlgeschlagen.");
      setSubmitting(false);
    }
  };

  return (
    <div
      className="h-screen w-screen overflow-y-auto thin-scroll flex items-center justify-center text-ink font-body-game p-4"
      style={{ backgroundImage: `url(${PARCHMENT})`, backgroundSize: "cover" }}
    >
      <div className="absolute inset-0 bg-[var(--wood-deep)]/90" />

      <div className="relative z-10 w-full max-w-2xl panel rounded-sm">
        <div className="panel-header px-6 py-5 text-center">
          <Anchor className="w-8 h-8 mx-auto text-brass mb-2" strokeWidth={1.4} />
          <h1 className="font-display text-2xl text-brass-bright tracking-wide">Gründe deine Kompanie</h1>
          <p className="text-ink-dim font-serif-game text-lg mt-1">Karibik, Anno 1765</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Kompaniename */}
          <div>
            <label className="font-display text-[11px] tracking-[0.16em] uppercase text-brass block mb-2">Name der Kompanie</label>
            <Input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="z. B. Albion Trading Co."
              className="bg-wood-light border-line text-ink placeholder:text-ink-dim/60 focus-visible:ring-brass"
            />
          </div>

          {/* Fraktion */}
          <div>
            <label className="font-display text-[11px] tracking-[0.16em] uppercase text-brass block mb-2">Großfraktion</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {factions.map((f) => {
                const selected = factionCode === f.code;
                return (
                  <button
                    key={f.code}
                    onClick={() => setFactionCode(f.code)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-sm border text-left transition-colors ${
                      selected ? "border-brass bg-wood-light" : "border-line bg-wood hover:border-brass/50"
                    }`}
                  >
                    <span
                      className="w-6 h-6 inline-flex items-center justify-center rounded-sm border shrink-0"
                      style={{ borderColor: f.color, backgroundColor: `${f.color}22` }}
                    >
                      {factionFlag(f.code)}
                    </span>
                    <span className={`text-sm font-serif-game leading-tight ${selected ? "text-brass-bright" : "text-ink"}`}>
                      {f.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Starthafen */}
          <div>
            <label className="font-display text-[11px] tracking-[0.16em] uppercase text-brass block mb-2">Heimathafen</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto thin-scroll pr-1">
              {ports.map((p) => {
                const selected = portCode === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setPortCode(p.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-sm border text-left transition-colors ${
                      selected ? "border-brass bg-wood-light" : "border-line bg-wood hover:border-brass/50"
                    }`}
                  >
                    <Anchor className="w-3.5 h-3.5 shrink-0 text-ink-dim" />
                    <span className={`text-sm font-serif-game leading-tight ${selected ? "text-brass-bright" : "text-ink"}`}>
                      {p.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Startausstattung */}
          <div className="flex items-center gap-5 px-4 py-3 bg-wood-light border border-line rounded-sm">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-brass" />
              <span className="text-sm">Startgold: <span className="font-display text-brass-bright">{formatGold(STARTING_GOLD)} G</span></span>
            </div>
            <div className="flex items-center gap-2">
              <Ship className="w-4 h-4 text-brass" />
              <span className="text-sm">1 Schaluppe im Heimathafen</span>
            </div>
          </div>

          {error && <div className="text-sm text-[var(--blood)] font-body-game">{error}</div>}

          <Button
            onClick={submit}
            disabled={submitting || !factionCode || !portCode}
            className="w-full bg-[var(--brass)] hover:bg-[var(--brass-bright)] text-[var(--wood-deep)] font-display tracking-wide border-0"
          >
            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Anchor className="w-4 h-4 mr-2" />}
            In See stechen
          </Button>
        </div>
      </div>
    </div>
  );
}