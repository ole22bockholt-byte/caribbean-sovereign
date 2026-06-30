import React, { useState, useEffect, useCallback } from "react";

// Platzhalter-Hintergrund. Später manuell austauschbar (auch GIF/Video möglich) —
// einfach diese URL ersetzen. Auto-Erkennung/Upload ist bewusst NOCH NICHT implementiert.
const START_BG = "https://media.base44.com/images/public/6a43defde92c0d47de02330a/592b13c14_generated_image.png";

// Startbildschirm als Loader-Gate: erscheint erst wenn `ready` true ist (App vollständig
// geladen). Beim ersten Button-/Touch-Input spielt eine Fade-Out-Animation, danach `onStart`.
export default function StartScreen({ ready, onStart }) {
  const [leaving, setLeaving] = useState(false);

  const trigger = useCallback(() => {
    if (!ready || leaving) return;
    setLeaving(true);
    setTimeout(() => onStart(), 650);
  }, [ready, leaving, onStart]);

  useEffect(() => {
    if (!ready) return;
    const onKey = () => trigger();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ready, trigger]);

  return (
    <div
      onClick={trigger}
      onTouchStart={trigger}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center select-none cursor-pointer bg-wood-deep transition-opacity duration-700 ${
        leaving ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Auswechselbarer Hintergrund */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-transform duration-[1200ms] ${leaving ? "scale-110" : "scale-100"}`}
        style={{ backgroundImage: `url(${START_BG})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(18,13,9,0.55)] via-[rgba(18,13,9,0.35)] to-[rgba(18,13,9,0.9)]" />

      {/* Titel */}
      <div className="relative z-10 text-center px-6">
        <h1 className="font-display text-brass-bright text-5xl md:text-7xl tracking-[0.18em] drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
          KARIBIK
        </h1>
        <div className="font-display text-ink-dim text-base md:text-lg tracking-[0.42em] mt-2">ANNO 1765</div>
        <div className="brass-rule w-48 mx-auto mt-6" />
      </div>

      {/* Loader -> Prompt */}
      <div className="relative z-10 mt-16 h-10 flex items-center justify-center">
        {ready ? (
          <span className="font-body-game text-ink text-lg md:text-xl tracking-[0.22em] uppercase animate-pulse drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            Press any button to start
          </span>
        ) : (
          <div className="flex items-center gap-3 text-ink-dim">
            <div className="w-5 h-5 border-2 border-[var(--line)] border-t-[var(--brass)] rounded-full animate-spin" />
            <span className="font-body-game tracking-[0.2em] uppercase text-sm">Lade Welt …</span>
          </div>
        )}
      </div>
    </div>
  );
}