"use client";

import { useEffect, useRef, useState } from "react";

// Counts up/down to the new value instead of jumping.
export default function AnimatedNumber({ value, pad = 2, duration = 500 }) {
  const [display, setDisplay] = useState(value);
  const current = useRef(value);

  useEffect(() => {
    const from = current.current;
    if (from === value) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      current.current = value;
      setDisplay(value);
      return;
    }
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const next = Math.round(from + (value - from) * (1 - (1 - p) ** 3));
      current.current = next;
      setDisplay(next);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return String(display).padStart(pad, "0");
}
