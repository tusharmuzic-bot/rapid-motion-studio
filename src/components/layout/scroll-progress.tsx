"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 400,
    damping: 38,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="gpu-layer pointer-events-none fixed top-0 left-0 right-0 z-50 h-[2px] origin-left bg-gradient-to-r from-burgundy via-gold to-gold-warm shadow-[0_0_8px_rgba(216,180,119,0.5)]"
      aria-hidden="true"
    />
  );
}
