import React from "react";
import { getFaction } from "@/lib/mockData";

export default function FactionFlag({ factionId, size = "sm", showName = false }) {
  const f = getFaction(factionId);
  const dim = size === "lg" ? "w-7 h-7 text-base" : "w-5 h-5 text-[11px]";
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`${dim} inline-flex items-center justify-center rounded-sm border`}
        style={{ borderColor: f.color, backgroundColor: `${f.color}22`, color: f.color }}
        title={f.name}
      >
        {f.flag}
      </span>
      {showName && <span className="text-ink-dim text-sm">{f.name}</span>}
    </span>
  );
}