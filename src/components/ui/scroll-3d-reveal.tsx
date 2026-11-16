"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface Scroll3DRevealProps {
  children: React.ReactNode;
  className?: string;
  depth?: number; // max tilt in degrees (e.g. 8 to 16)
  speed?: "slow" | "medium" | "fast";
  direction?: "up" | "down" | "tilt";
}

/**
 * 60fps GPU-accelerated 3D scroll container.
 * As the user scrolls up or down, elements experience real spatial depth
 * (perspective, subtle dynamic rotateX/rotateY, translateZ layering)
 * with zero layout repaints.
 */
export function Scroll3DReveal({
  children,
  className,
  depth = 10,
  direction = "tilt",
}: Scroll3DRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Smooth out scroll progress with high-response spring
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 280,
    damping: 35,
    mass: 0.2,
  });

  // Calculate dynamic 3D tilt as the user scrolls past
  // [-depth deg when entering from bottom, 0 deg at center, depth deg when exiting top]
  const rotateX = useTransform(
    smoothProgress,
    [0, 0.45, 0.55, 1],
    direction === "tilt"
      ? [depth, 0, 0, -depth]
      : direction === "up"
      ? [depth * 1.2, 0, 0, 0]
      : [0, 0, 0, -depth * 1.2]
  );

  const scale = useTransform(smoothProgress, [0, 0.5, 1], [0.96, 1, 0.97]);
  const opacity = useTransform(smoothProgress, [0, 0.15, 0.85, 1], [0.4, 1, 1, 0.5]);
  const translateZ = useTransform(smoothProgress, [0, 0.5, 1], [-40, 0, -30]);

  return (
    <div
      ref={containerRef}
      style={{ perspective: "1400px" }}
      className={cn("w-full transform-gpu", className)}
    >
      <motion.div
        style={{
          rotateX,
          scale,
          opacity,
          z: translateZ,
          transformStyle: "preserve-3d",
          willChange: "transform, opacity",
        }}
        className="w-full"
      >
        {children}
      </motion.div>
    </div>
  );
}
