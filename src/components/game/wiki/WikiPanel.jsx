import React, { useState, useEffect } from "react";
import { Loader2, BookOpen, Github } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ShipCard from "./ShipCard";
import ShipDetail from "./ShipDetail";

// Wiki: vorerst Schiffstypen aus GitHub. Aufgebaut als eigenständiger Bereich,
// damit später weitere Wiki-Kategorien (Waren, Fraktionen, ...) ergänzt werden können.
export default function WikiPanel() {
  const [ships, setShips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await base44.functions.invoke("wikiShips", {});
        if (cancelled) return;
        setShips(res.data?.ships || []);
        if (res.data?.configured === false || res.data?.message) setNotice(res.data.message);
      } catch (e) {
        if (!cancelled) setNotice("Wiki-Daten konnten nicht geladen werden.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-ink-dim gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-brass" /> <span className="font-body-game">Wiki wird geladen …</span>
      </div>
    );
  }

  if (selected) {
    return <ShipDetail ship={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="p-1">
      <div className="flex items-center gap-2 mb-1">
        <BookOpen className="w-5 h-5 text-brass" strokeWidth={1.6} />
        <h1 className="font-display text-brass-bright text-2xl tracking-wide">Wiki — Schiffstypen</h1>
      </div>
      <div className="brass-rule w-56 mb-5" />

      {notice && (
        <div className="panel p-4 mb-5 flex items-start gap-3">
          <Github className="w-5 h-5 text-ink-dim shrink-0 mt-0.5" />
          <p className="font-body-game text-sm text-ink-dim">{notice}</p>
        </div>
      )}

      {ships.length === 0 ? (
        <div className="panel p-8 text-center font-serif-game text-ink-dim">
          Noch keine Schiffstypen im Repository hinterlegt.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {ships.map((ship, i) => (
            <ShipCard key={ship.id || i} ship={ship} onOpen={() => setSelected(ship)} />
          ))}
        </div>
      )}
    </div>
  );
}