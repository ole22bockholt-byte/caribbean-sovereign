import React, { useState, useRef, useEffect } from "react";
import { Store, Send, Users, Handshake, Anchor } from "lucide-react";
import { factionFlag } from "@/lib/gameData";
import PortServiceHeader from "./PortServiceHeader";

// Marktplatz — Community-Hub eines Hafens: Kapitäne vor Ort, Hafenschänke (Chat)
// und Handelsangebote zwischen Spielern. Live-Daten (andere Spieler, Chat, P2P-
// Angebote) folgen mit dem Mehrspieler-Backend; bis dahin saubere Leerzustände.
export default function MarktplatzPanel({ port, factionByCode, player, onBack }) {
  const [messages, setMessages] = useState([
    { id: "sys", author: "Hafenmeister", text: `Willkommen in der Hafenschänke von ${port?.name || "diesem Hafen"}.`, system: true },
  ]);
  const [draft, setDraft] = useState("");
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages((m) => [...m, { id: `m${Date.now()}`, author: player?.companyName || "Du", text, self: true }]);
    setDraft("");
  };

  return (
    <div className="panel rounded-sm h-full flex flex-col overflow-hidden">
      <PortServiceHeader icon={Store} title="Marktplatz" port={port} factionByCode={factionByCode} onBack={onBack} />

      <div className="flex-1 min-h-0 flex">
        {/* Hafenschänke (Chat) */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="panel-header px-4 py-2 flex items-center gap-2">
            <span className="font-display text-[11px] tracking-[0.16em] uppercase text-brass inline-flex items-center gap-2">
              <Users className="w-3.5 h-3.5" /> Hafenschänke
            </span>
            <span className="text-[11px] text-ink-dim font-body-game">· Vorschau (Live-Chat folgt mit dem Mehrspieler-Backend)</span>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto thin-scroll px-4 py-3 space-y-2">
            {messages.map((m) => (
              <div key={m.id} className={`flex flex-col ${m.self ? "items-end" : "items-start"}`}>
                <div className={`max-w-[80%] px-3 py-1.5 rounded-sm border text-sm font-body-game ${
                  m.system ? "bg-transparent border-line text-ink-dim italic"
                  : m.self ? "bg-[var(--wood-light)] border-brass/50 text-ink"
                  : "bg-[rgba(11,17,22,0.6)] border-line text-ink"
                }`}>
                  {!m.system && <span className="block text-[10px] uppercase tracking-wider text-ink-dim mb-0.5">{m.author}</span>}
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <div className="p-3 border-t border-line flex items-center gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Nachricht an die Kapitäne im Hafen …"
              className="flex-1 bg-[var(--wood-light)] border border-line rounded-sm px-3 py-2 text-sm text-ink font-body-game focus:outline-none focus:border-brass"
            />
            <button onClick={send} className="brass-btn px-3 py-2"><Send className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Kapitäne + Handelsangebote */}
        <div className="w-[280px] shrink-0 border-l border-line flex flex-col">
          <div className="panel-header px-4 py-2">
            <span className="font-display text-[11px] tracking-[0.16em] uppercase text-brass inline-flex items-center gap-2">
              <Anchor className="w-3.5 h-3.5" /> Kapitäne im Hafen
            </span>
          </div>
          <div className="px-4 py-3 space-y-2 border-b border-line">
            <div className="flex items-center justify-between text-sm font-body-game">
              <span className="text-ink inline-flex items-center gap-2">
                {factionFlag(player?.factionCode)} {player?.companyName || "Deine Kompanie"}
              </span>
              <span className="text-[11px] text-brass">Du</span>
            </div>
            <p className="text-[12px] text-ink-dim font-body-game">Weitere Kapitäne erscheinen hier, sobald sie im selben Hafen ankern.</p>
          </div>

          <div className="panel-header px-4 py-2">
            <span className="font-display text-[11px] tracking-[0.16em] uppercase text-brass inline-flex items-center gap-2">
              <Handshake className="w-3.5 h-3.5" /> Handelsangebote
            </span>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto thin-scroll px-4 py-3">
            <p className="text-[12px] text-ink-dim font-body-game">
              Noch keine Angebote anderer Kapitäne. Spieler-zu-Spieler-Handel wird mit dem Mehrspieler-Backend freigeschaltet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
