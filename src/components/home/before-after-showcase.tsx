"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MoveHorizontal } from "lucide-react";
import type { BeforeAfterComparison } from "@/lib/types";
import { cn } from "@/lib/utils";

interface BeforeAfterShowcaseProps {
  comparisons: BeforeAfterComparison[];
  content?: Record<string, unknown>;
}

export function BeforeAfterShowcase({
  comparisons,
  content,
}: BeforeAfterShowcaseProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [position, setPosition] = useState(50);
  const [hasSwept, setHasSwept] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  const active = comparisons[activeIdx];

  // Subtle automatic demonstration sweep once the showcase scrolls into view
  useEffect(() => {
    const el = containerRef.current;
    if (!el || hasSwept) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasSwept(true);
          setTimeout(() => setPosition(74), 200);
          setTimeout(() => setPosition(28), 750);
          setTimeout(() => setPosition(50), 1300);
        }
      },
      { threshold: 0.35 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasSwept]);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.max(4, Math.min(96, pct)));
  }, []);

  if (!active) return null;

  const eyebrow =
    (content?.eyebrow as string) || "RAW INPUT → CINEMATIC EXECUTION";
  const headline =
    (content?.headline as string) || "FROM ORDINARY MATERIAL TO CINEMA.";
  const subheadline =
    (content?.subheadline as string) ||
    "Drag across real everyday product snapshots to see how RAPID MOTION STUDIO builds complete commercial worlds around them.";

  return (
    <section className="editorial-ivory relative border-y border-charcoal/10 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.55 }}
          className="grid gap-8 lg:grid-cols-12 lg:items-end"
        >
          <div className="lg:col-span-7">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.24em] text-burgundy">
              {eyebrow}
            </span>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-charcoal sm:text-5xl">
              {headline}
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-charcoal/75 sm:text-base lg:col-span-5">
            {subheadline}
          </p>
        </motion.div>

        {/* Discipline Switcher Tabs */}
        <div
          className="mt-10 flex flex-wrap gap-2.5"
          role="tablist"
          aria-label="Before and after examples"
        >
          {comparisons.map((item, idx) => {
            const selected = idx === activeIdx;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => {
                  setActiveIdx(idx);
                  setPosition(50);
                }}
                className={cn(
                  "rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-200",
                  selected
                    ? "border-burgundy bg-burgundy text-ivory"
                    : "border-charcoal/20 bg-white/40 text-charcoal/75 hover:border-burgundy hover:text-burgundy"
                )}
              >
                {item.category_label || item.title}
              </button>
            );
          })}
        </div>

        {/* High-Contrast Charcoal Comparison Theater inside Ivory Frame */}
        <div className="mt-8 overflow-hidden rounded-3xl border border-charcoal/15 bg-obsidian p-2 shadow-[0_32px_70px_-28px_rgba(21,19,19,0.45)] sm:p-3">
          <div
            ref={containerRef}
            data-cursor="drag"
            onPointerDown={(e) => {
              draggingRef.current = true;
              (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
              updateFromClientX(e.clientX);
            }}
            onPointerMove={(e) => {
              if (!draggingRef.current) return;
              updateFromClientX(e.clientX);
            }}
            onPointerUp={() => {
              draggingRef.current = false;
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") setPosition((p) => Math.max(4, p - 4));
              if (e.key === "ArrowRight") setPosition((p) => Math.min(96, p + 4));
            }}
            role="slider"
            tabIndex={0}
            aria-label={`Before and after comparison for ${active.title}`}
            aria-valuemin={4}
            aria-valuemax={96}
            aria-valuenow={Math.round(position)}
            className="relative aspect-[16/9] w-full cursor-ew-resize select-none overflow-hidden rounded-2xl bg-obsidian focus:outline-none"
          >
            {/* RIGHT / AFTER: RAPID MOTION STUDIO AI Cinema Output */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={active.after_image_url}
              alt={`${active.title} — RAPID MOTION STUDIO AI Cinema`}
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover"
            />

            {/* LEFT / BEFORE: Genuine Raw Client Input */}
            <div
              className="absolute inset-0 overflow-hidden transition-[clip-path] duration-75 ease-out"
              style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={active.before_image_url}
                alt={`${active.title} — Basic Raw Input`}
                draggable={false}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Split Hairline & Aperture Handle */}
            <div
              className="pointer-events-none absolute inset-y-0 z-10 w-[2px] -translate-x-1/2 bg-ivory shadow-[0_0_20px_rgba(245,240,232,0.75)]"
              style={{ left: `${position}%` }}
            >
              <div className="absolute top-1/2 left-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gold bg-obsidian/90 text-ivory shadow-2xl">
                <MoveHorizontal className="h-4 w-4 text-gold" />
              </div>
            </div>

            {/* Honest Corner Badges */}
            <div className="pointer-events-none absolute top-4 left-4 z-10 rounded-full border border-white/25 bg-charcoal/85 px-3.5 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-ivory backdrop-blur-md">
              RAW CLIENT PHOTO
            </div>
            <div className="pointer-events-none absolute top-4 right-4 z-10 rounded-full border border-gold/65 bg-burgundy/90 px-3.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ivory backdrop-blur-md">
              RAPID MOTION CINEMA
            </div>
          </div>

          <div className="flex flex-col justify-between gap-4 px-4 py-5 text-ivory sm:flex-row sm:items-center sm:px-6">
            <div>
              <h3 className="font-display text-lg font-bold text-ivory">
                {active.title}
              </h3>
              <p className="mt-1 max-w-3xl text-sm leading-relaxed text-ivory/70">
                {active.description}
              </p>
            </div>
            <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-gold/85">
              Drag Aperture to Inspect
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
