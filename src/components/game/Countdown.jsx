import React from "react";
import useCountdown from "@/hooks/useCountdown";
import { formatCountdown } from "@/lib/format";

// Live countdown badge. Set loop for the world tick.
export default function Countdown({ seconds, loop = false, className = "" }) {
  const remaining = useCountdown(seconds, { loop });
  const urgent = remaining <= 120 && !loop;
  return (
    <span className={`font-mono tabular-nums ${urgent ? "text-[var(--blood)]" : "text-brass-bright"} ${className}`}>
      {formatCountdown(remaining)}
    </span>
  );
}