"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardTiltProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  scaleHover?: number;
  showGlare?: boolean;
}

export function CardTilt({
  children,
  className,
  maxTilt = 7,
  scaleHover = 1.018,
  showGlare = true,
  ...props
}: CardTiltProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    const isFine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setCanHover(isFine && !reduced);
  }, []);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { stiffness: 380, damping: 28, mass: 0.3 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const rotateX = useTransform(springY, [-0.5, 0.5], [maxTilt, -maxTilt]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-maxTilt, maxTilt]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canHover || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const normX = clientX / rect.width - 0.5;
    const normY = clientY / rect.height - 0.5;

    x.set(normX);
    y.set(normY);

    if (showGlare) {
      const xPct = Math.round((clientX / rect.width) * 100);
      const yPct = Math.round((clientY / rect.height) * 100);
      cardRef.current.style.setProperty("--mouse-x", `${xPct}%`);
      cardRef.current.style.setProperty("--mouse-y", `${yPct}%`);
      cardRef.current.style.setProperty("--sheen-opacity", "1");
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    if (showGlare && cardRef.current) {
      cardRef.current.style.setProperty("--sheen-opacity", "0");
    }
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: canHover ? rotateX : 0,
        rotateY: canHover ? rotateY : 0,
        transformStyle: "preserve-3d",
      }}
      whileHover={canHover ? { scale: scaleHover } : undefined}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      className={cn("gpu-layer relative perspective-[1000px]", className)}
      {...(props as any)}
    >
      {children}
      {showGlare && <div className="card-specular-sheen" aria-hidden="true" />}
    </motion.div>
  );
}
