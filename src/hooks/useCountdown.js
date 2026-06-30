import { useState, useEffect } from "react";

// Generic 1s-tick countdown. Returns remaining seconds (clamped at 0).
// When it reaches 0, optionally loops back to `loopTo` (used for the world tick).
export default function useCountdown(startSeconds, { loop = false } = {}) {
  const [remaining, setRemaining] = useState(startSeconds);

  useEffect(() => {
    setRemaining(startSeconds);
  }, [startSeconds]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) return loop ? startSeconds : 0;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [startSeconds, loop]);

  return remaining;
}