import React from "react";

// Small labeled wrapper for modal form fields.
export default function Field({ label, children }) {
  return (
    <label className="block">
      <span className="font-display text-[10px] tracking-[0.16em] uppercase text-brass block mb-1.5">{label}</span>
      {children}
    </label>
  );
}