import React, { useEffect, useState } from "react";
import { LifeBuoy } from "lucide-react";

// Angenommenes Intervall zwischen zwei Welt-Ticks (reine Anzeige/Schätzung).
// Zentral hier anpassen, sobald das echte Tick-Intervall aus dem Backend vorliegt.
const TICK_INTERVAL_SECONDS = 60 * 60;

const pad = (n) => String(n).padStart(2, "0");

// Countdown bis zum nächsten Welt-Update, abgeleitet aus last_tick_at + Intervall.
export default function WorldUpdateTimer({ lastTickAt }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const anchor = lastTickAt ? new Date(lastTickAt).getTime() : now;
  const elapsed = Math.max(0, (now - anchor) / 1000);
  const remaining = TICK_INTERVAL_SECONDS - (elapsed % TICK_INTERVAL_SECONDS);
  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = Math.floor(remaining % 60);

  return (
    <div className="flex items-center gap-2.5 px-2">
      <LifeBuoy className="w-5 h-5 text-brass pulse-dot" strokeWidth={1.5} />
      <div className="leading-tight text-right">
        <div className="text-[10px] uppercase tracking-[0.14em] text-ink-dim font-body-game">
          Nächstes Welt-Update
        </div>
        <div className="font-mono tabular-nums text-sm text-brass-bright">
          {pad(h)}:{pad(m)}:{pad(s)}
        </div>
      </div>
    </div>
  );
}
