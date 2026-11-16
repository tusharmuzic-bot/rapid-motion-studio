"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function StudioCursor() {
  const [visible, setVisible] = useState(false);
  const [cursorLabel, setCursorLabel] = useState<string | null>(null);
  const [isInteractive, setIsInteractive] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);

  // High-performance spring values tuned for silky 60fps responsiveness
  const mouseX = useMotionValue(-120);
  const mouseY = useMotionValue(-120);

  const springConfig = { stiffness: 450, damping: 32, mass: 0.25 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reduced) return;

    let rafId: number | null = null;

    const onMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;

      // Check for magnetic element attraction
      const magneticEl = target?.closest("[data-magnetic='true']") as HTMLElement | null;
      if (magneticEl) {
        const rect = magneticEl.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        // Blend 40% towards center for smooth tactile snap
        const magX = e.clientX + (centerX - e.clientX) * 0.38;
        const magY = e.clientY + (centerY - e.clientY) * 0.38;
        mouseX.set(magX);
        mouseY.set(magY);
      } else {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
      }

      setVisible(true);

      const customLabelEl = target?.closest("[data-cursor]") as HTMLElement | null;
      const label = customLabelEl?.getAttribute("data-cursor") || null;
      setCursorLabel(label);

      const interactive = Boolean(
        target?.closest("a, button, [role='slider'], [role='tab'], input, select, textarea, [data-magnetic='true']")
      );
      setIsInteractive(interactive || Boolean(label));
    };

    const onMouseDown = () => setIsMouseDown(true);
    const onMouseUp = () => setIsMouseDown(false);
    const onLeave = () => setVisible(false);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown, { passive: true });
    window.addEventListener("mouseup", onMouseUp, { passive: true });
    document.addEventListener("mouseleave", onLeave);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [mouseX, mouseY]);

  if (!visible) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{
        x: springX,
        y: springY,
        scale: isMouseDown ? 0.88 : 1,
      }}
      className="gpu-layer pointer-events-none fixed top-0 left-0 z-50 hidden -translate-x-1/2 -translate-y-1/2 lg:block"
    >
      {cursorLabel ? (
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-gold/90 bg-obsidian/90 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-gold backdrop-blur-md shadow-[0_0_24px_rgba(216,180,119,0.25)] transition-transform duration-200">
          {/* Subtle optical crosshair tickmarks */}
          <span className="absolute top-1 left-1/2 h-1 w-[1px] -translate-x-1/2 bg-gold/50" />
          <span className="absolute bottom-1 left-1/2 h-1 w-[1px] -translate-x-1/2 bg-gold/50" />
          <span className="absolute left-1 top-1/2 h-[1px] w-1 -translate-y-1/2 bg-gold/50" />
          <span className="absolute right-1 top-1/2 h-[1px] w-1 -translate-y-1/2 bg-gold/50" />
          <span>{cursorLabel}</span>
        </div>
      ) : (
        <div className="relative flex items-center justify-center">
          <div
            className={`rounded-full border transition-all duration-200 ${
              isInteractive
                ? "h-10 w-10 border-gold/80 bg-gold/15 shadow-[0_0_16px_rgba(216,180,119,0.22)]"
                : "h-5 w-5 border-ivory/40 bg-ivory/[0.05]"
            }`}
          />
          {/* Central precision reticle dot */}
          <div
            className={`absolute rounded-full transition-all duration-150 ${
              isInteractive
                ? "h-1 w-1 bg-gold shadow-[0_0_6px_rgba(216,180,119,0.9)]"
                : "h-1 w-1 bg-ivory/80"
            }`}
          />
        </div>
      )}
    </motion.div>
  );
}
