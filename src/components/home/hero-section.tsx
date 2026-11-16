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

  const mediaY = useTransform(scrollYProgress, [0, 1], ["0%", "16%"]);
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1.02, 1.12]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0.15]);
  const textRotateX = useTransform(scrollYProgress, [0, 1], [0, 14]);
  const textScale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const textZ = useTransform(scrollYProgress, [0, 1], [0, -70]);

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
      style={{ perspective: "1200px" }}
      className="relative flex min-h-[96vh] w-full flex-col justify-end overflow-hidden bg-obsidian pt-24 pb-12 sm:pt-28 sm:pb-16"
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

      {/* Main Editorial Lockup with 3D Spatial Parallax Layer */}
      <motion.div
        style={{
          y: textY,
          opacity: textOpacity,
          rotateX: textRotateX,
          scale: textScale,
          z: textZ,
          transformStyle: "preserve-3d",
        }}
        className="relative z-10 mx-auto w-full max-w-7xl px-6"
      >
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-3 border-b border-ivory/20 pb-2.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-studio-beacon absolute inline-flex h-full w-full rounded-full bg-gold opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
            </span>
            <span className="font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-ivory/85">
              {eyebrow}
            </span>
          </div>

          <h1 className="mt-6 font-display text-5xl font-extrabold leading-[0.96] tracking-[-0.038em] text-ivory sm:text-7xl lg:text-[5.5rem]">
            {lines.map((line, i) => (
              <span key={line} className="block overflow-hidden py-0.5">
                <motion.span
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    duration: 0.75,
                    ease: [0.16, 1, 0.3, 1],
                    delay: 0.15 + i * 0.12,
                  }}
                  className={`inline-block ${
                    i === lines.length - 1
                      ? "text-transparent bg-clip-text bg-gradient-to-r from-ivory via-gold to-gold-warm"
                      : ""
                  }`}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-6 max-w-xl text-base leading-relaxed text-ivory/85 sm:text-lg"
          >
            {subheadline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Link
              href="/work"
              data-cursor="EXPLORE"
              data-magnetic="true"
              className="group inline-flex items-center gap-2.5 rounded-full bg-ivory px-7 py-3.5 text-xs font-bold uppercase tracking-[0.18em] text-charcoal transition-all duration-300 hover:bg-gold hover:shadow-[0_0_24px_rgba(216,180,119,0.4)]"
            >
              <span>{primaryCta}</span>
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link
              href="/start-project"
              data-magnetic="true"
              className="inline-flex items-center gap-2.5 rounded-full border border-ivory/30 bg-obsidian/45 px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-ivory backdrop-blur-md transition-all duration-300 hover:border-gold hover:text-gold hover:shadow-[0_0_16px_rgba(216,180,119,0.25)]"
            >
              <span>{secondaryCta}</span>
            </Link>
          </motion.div>
        </div>

        {/* Bottom Interactive 4K Reel Scene Scrubber Bar with Soundwave & Radial Progress */}
        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-ivory/15 pt-5">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              data-magnetic="true"
              aria-label={paused ? "Play 4K hero reel" : "Pause 4K hero reel"}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-ivory/25 bg-obsidian/60 text-ivory transition hover:border-gold hover:text-gold"
            >
              {paused ? (
                <Play className="h-3.5 w-3.5 translate-x-0.5" />
              ) : (
                <Pause className="h-3.5 w-3.5" />
              )}
            </button>

            {HERO_CHAPTERS.map((ch, idx) => {
              const isActive = activeChapter === idx;
              return (
                <button
                  key={ch.id}
                  type="button"
                  data-magnetic="true"
                  onClick={() => seekToChapter(idx)}
                  className={cn(
                    "relative overflow-hidden rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] transition-all",
                    isActive
                      ? "border-gold bg-gold/20 text-gold shadow-[0_0_12px_rgba(216,180,119,0.28)]"
                      : "border-ivory/15 bg-obsidian/40 text-ivory/65 hover:border-ivory/35 hover:text-ivory"
                  )}
                >
                  {/* Subtle active progress bar underneath */}
                  {isActive && !paused && (
                    <span className="absolute bottom-0 left-0 h-[1.5px] w-full origin-left bg-gradient-to-r from-gold to-gold-warm animate-[studio-marquee_2.2s_linear_infinite]" />
                  )}
                  <span className="relative z-10">
                    {ch.id} {ch.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-5">
            {/* Live 4-Bar Sound Design Audio Visualizer */}
            <div className="hidden items-center gap-2 rounded-full border border-ivory/15 bg-obsidian/40 px-3 py-1 sm:flex">
              <div className="flex items-end gap-0.5 h-3">
                <span className="w-0.5 rounded-full bg-gold animate-audio-bar-1" />
                <span className="w-0.5 rounded-full bg-gold-warm animate-audio-bar-2" />
                <span className="w-0.5 rounded-full bg-gold animate-audio-bar-3" />
                <span className="w-0.5 rounded-full bg-ivory animate-audio-bar-4" />
              </div>
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-ivory/60">
                48kHz Sound Design
              </span>
            </div>

            <span className="hidden font-mono text-[10px] uppercase tracking-[0.22em] text-ivory/55 sm:inline">
              3840 × 2160 • 4K MASTER
            </span>
            <a
              href="#brand-intro"
              data-magnetic="true"
              aria-label="Scroll to brand introduction"
              className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ivory/75 transition hover:text-gold"
            >
              <span>Scroll</span>
              <ArrowDown className="h-3.5 w-3.5 animate-bounce text-gold" />
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
