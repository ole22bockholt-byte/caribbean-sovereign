import React from "react";

export default function SectionTitle({ children, right }) {
  return (
    <div className="panel-header px-4 py-2.5 flex items-center justify-between">
      <h2 className="font-display text-[13px] tracking-[0.18em] uppercase text-brass">{children}</h2>
      {right}
    </div>
  );
}