"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight, Pause, Play } from "lucide-react";
import { BRAND } from "@/lib/brand";
import type { SiteSettings } from "@/lib/types";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  settings: SiteSettings;
  content?: Record<string, unknown>;
}

const HERO_CHAPTERS = [
  { id: "01", label: "Fragrance", time: 0.2 },
  { id: "02", label: "Horology", time: 2.3 },
  { id: "03", label: "Automotive", time: 4.3 },
  { id: "04", label: "Skincare", time: 6.3 },
  { id: "05", label: "Hardware", time: 8.3 },
  { id: "06", label: "Architecture", time: 10.3 },
];

export function HeroSection({ settings, content }: HeroSectionProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [paused, setPaused] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const mediaY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1.02, 1.09]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  const eyebrow =
    (content?.eyebrow as string) ||
    `${BRAND.name} — ${BRAND.tagline}`;
  const headline =
    (content?.headline as string) || "WE MAKE\nIDEAS MOVE.";
  const subheadline =
    (content?.subheadline as string) ||
    "High-impact cinematic advertising and creative campaigns, produced through a new generation of visual technology.";
  const primaryCta = (content?.primaryCta as string) || "EXPLORE OUR WORK";
  const secondaryCta = (content?.secondaryCta as string) || "START A PROJECT";

  const activeVideoSrc =
    isMobile && settings.hero_mobile_video_url
      ? settings.hero_mobile_video_url
      : settings.hero_video_url;

  const lines = headline.split("\n").filter(Boolean);

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    const t = v.currentTime;
    const idx = HERO_CHAPTERS.findLastIndex((c) => t >= c.time - 0.15);
    if (idx >= 0 && idx !== activeChapter) {
      setActiveChapter(idx);
    }
  };

  const seekToChapter = (idx: number) => {
    const v = videoRef.current;
    setActiveChapter(idx);
    if (v) {
      v.currentTime = HERO_CHAPTERS[idx].time;
      if (v.paused) {
        v.play().catch(() => {});
        setPaused(false);
      }
    }
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setPaused(false);
    } else {
      v.pause();
      setPaused(true);
    }
  };

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-[92vh] w-full flex-col justify-end overflow-hidden bg-obsidian pt-14 pb-10 sm:pt-20 sm:pb-14"
    >
      {/* 4K UHD Cinema Background Reel */}
      <motion.div
        style={{ y: mediaY, scale: mediaScale }}
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {activeVideoSrc ? (
          <video
            ref={videoRef}
            key={activeVideoSrc}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            onTimeUpdate={handleTimeUpdate}
            poster={settings.hero_poster_url || "/media/generated/perfume-after.jpg"}
            className="h-full w-full object-cover opacity-82"
          >
            <source src={activeVideoSrc} type="video/mp4" />
          </video>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={settings.hero_poster_url || "/media/generated/perfume-after.jpg"}
            alt={`${BRAND.name} Production Showcase`}
            className="h-full w-full object-cover opacity-80"
          />
        )}

        {/* Restrained Optical Gradient Scrims so 4K video shines clearly while text stays crisp */}
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/45 to-obsidian/35" />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian/80 via-obsidian/25 to-transparent" />
      </motion.div>

      {/* Main Editorial Lockup */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-3 border-b border-ivory/25 pb-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-ivory/85">
              {eyebrow}
            </span>
          </div>

          <h1 className="mt-6 font-display text-5xl font-extrabold leading-[0.98] tracking-[-0.035em] text-ivory sm:text-7xl lg:text-[5.5rem]">
            {lines.map((line, i) => (
              <span
                key={line}
                className={`block ${
                  i === lines.length - 1 ? "text-gold" : ""
                }`}
              >
                {line}
              </span>
            ))}
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-ivory/85 sm:text-lg">
            {subheadline}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/work"
              data-cursor="explore"
              className="group inline-flex items-center gap-2.5 rounded-full bg-ivory px-7 py-3.5 text-xs font-bold uppercase tracking-[0.18em] text-charcoal transition-all duration-300 hover:bg-gold"
            >
              <span>{primaryCta}</span>
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link
              href="/start-project"
              className="inline-flex items-center gap-2.5 rounded-full border border-ivory/30 bg-obsidian/45 px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-ivory backdrop-blur-md transition-all duration-300 hover:border-gold hover:text-gold"
            >
              <span>{secondaryCta}</span>
            </Link>
          </div>
        </div>

        {/* Bottom Interactive 4K Reel Scene Scrubber Bar */}
        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-ivory/15 pt-5">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={paused ? "Play 4K hero reel" : "Pause 4K hero reel"}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-ivory/25 bg-obsidian/60 text-ivory transition hover:border-gold hover:text-gold"
            >
              {paused ? (
                <Play className="h-3.5 w-3.5 translate-x-0.5" />
              ) : (
                <Pause className="h-3.5 w-3.5" />
              )}
            </button>

            {HERO_CHAPTERS.map((ch, idx) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => seekToChapter(idx)}
                className={cn(
                  "rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] transition-all",
                  activeChapter === idx
                    ? "border-gold bg-gold/15 text-gold"
                    : "border-ivory/15 bg-obsidian/40 text-ivory/65 hover:border-ivory/35 hover:text-ivory"
                )}
              >
                {ch.id} {ch.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-5">
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.22em] text-ivory/55 sm:inline">
              3840 × 2160 • 4K MASTER REEL
            </span>
            <a
              href="#brand-intro"
              aria-label="Scroll to brand introduction"
              className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ivory/75 transition hover:text-gold"
            >
              <span>Scroll</span>
              <ArrowDown className="h-3.5 w-3.5 animate-bounce text-gold" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
