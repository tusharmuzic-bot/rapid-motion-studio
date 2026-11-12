"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function StudioCursor() {
  const [visible, setVisible] = useState(false);
  const [cursorLabel, setCursorLabel] = useState<string | null>(null);
  const [isInteractive, setIsInteractive] = useState(false);

  const mouseX = useMotionValue(-120);
  const mouseY = useMotionValue(-120);

  const springX = useSpring(mouseX, { stiffness: 360, damping: 28, mass: 0.4 });
  const springY = useSpring(mouseY, { stiffness: 360, damping: 28, mass: 0.4 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reduced) return;

    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setVisible(true);

      const target = e.target as HTMLElement | null;
      const customLabelEl = target?.closest("[data-cursor]") as HTMLElement | null;
      const label = customLabelEl?.getAttribute("data-cursor") || null;
      setCursorLabel(label);

      const interactive = Boolean(
        target?.closest("a, button, [role='slider'], [role='tab'], input, select, textarea")
      );
      setIsInteractive(interactive || Boolean(label));
    };

    const onLeave = () => setVisible(false);

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [mouseX, mouseY]);

  if (!visible) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{ x: springX, y: springY }}
      className="pointer-events-none fixed top-0 left-0 z-50 hidden -translate-x-1/2 -translate-y-1/2 lg:block"
    >
      {cursorLabel ? (
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/80 bg-obsidian/85 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-gold backdrop-blur-md shadow-xl transition-transform duration-200">
          {cursorLabel}
        </div>
      ) : (
        <div
          className={`rounded-full border transition-all duration-200 ${
            isInteractive
              ? "h-9 w-9 border-gold/75 bg-gold/10"
              : "h-4 w-4 border-ivory/40 bg-ivory/[0.04]"
          }`}
        />
      )}
    </motion.div>
  );
}
