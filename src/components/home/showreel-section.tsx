"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Maximize2, Minimize2, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

interface ShowreelSectionProps {
  videoUrl: string;
  posterUrl: string;
  content?: Record<string, unknown>;
}

const SHOWREEL_CHAPTERS = [
  { label: "01 Fragrance", sec: 0 },
  { label: "02 Automotive", sec: 4.5 },
  { label: "03 Horology", sec: 8.5 },
  { label: "04 Beauty", sec: 12.5 },
  { label: "05 Architecture", sec: 16.5 },
  { label: "06 Cinema Rig", sec: 20.5 },
];

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function ShowreelSection({
  videoUrl,
  posterUrl,
  content,
}: ShowreelSectionProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(24);

  const eyebrow =
    (content?.eyebrow as string) || "BRAND INTRODUCTION • SHOWREEL";
  const headline = (content?.headline as string) || BRAND.coreMessage;
  const subheadline =
    (content?.subheadline as string) || BRAND.supportingStatement;

  useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const togglePlay = async () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      await v.play().catch(() => {});
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const toggleFullscreen = async () => {
    const el = wrapperRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      await el.requestFullscreen?.().catch(() => {});
    } else {
      await document.exitFullscreen?.().catch(() => {});
    }
  };

  const jumpChapter = async (sec: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = sec;
    setCurrentTime(sec);
    if (v.paused) {
      await v.play().catch(() => {});
      setPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = val;
    setCurrentTime(val);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div id="brand-intro">
      {/* Kinetic Studio Capability Strip */}
      <div className="overflow-hidden border-y border-ivory/10 bg-[#1c0c11] py-3.5 text-ivory">
        <div className="animate-studio-marquee items-center gap-10 whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.26em]">
          {Array.from({ length: 2 }).map((_, dup) => (
            <div key={dup} className="flex items-center gap-10 pr-10">
              <span>{BRAND.name}</span>
              <span className="text-gold">•</span>
              <span>{BRAND.tagline}</span>
              <span className="text-gold">•</span>
              <span>PRODUCT COMMERCIALS</span>
              <span className="text-gold">•</span>
              <span>BRAND FILMS</span>
              <span className="text-gold">•</span>
              <span>CAMPAIGN VISUALS</span>
              <span className="text-gold">•</span>
              <span>ZERO TRADITIONAL SHOOT</span>
              <span className="text-gold">•</span>
            </div>
          ))}
        </div>
      </div>

      {/* Warm Ivory Architectural Brand Intro + Showreel Theater */}
      <section id="showreel" className="editorial-ivory relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="grid gap-10 border-b border-charcoal/15 pb-12 lg:grid-cols-12 lg:items-end"
          >
            <div className="lg:col-span-7">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.24em] text-burgundy">
                {eyebrow}
              </span>
              <h2 className="mt-4 font-display text-3xl font-extrabold leading-[1.06] tracking-tight text-charcoal sm:text-5xl">
                {headline}
              </h2>
            </div>
            <div className="space-y-3 lg:col-span-5">
              <p className="font-display text-base font-bold uppercase tracking-[0.12em] text-burgundy">
                {subheadline}
              </p>
              <p className="text-sm leading-relaxed text-charcoal/75 sm:text-base">
                Send your product images, raw clips, brand assets, or visual
                references. Our production team directs the lighting, scene
                design, soundscape, and cinema cut without studios or physical
                crews.
              </p>
            </div>
          </motion.div>

          {/* Showreel Chapter Rail */}
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {SHOWREEL_CHAPTERS.map((ch) => (
                <button
                  key={ch.label}
                  type="button"
                  onClick={() => jumpChapter(ch.sec)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors",
                    currentTime >= ch.sec && currentTime < ch.sec + 4.3
                      ? "border-burgundy bg-burgundy text-ivory"
                      : "border-charcoal/20 text-charcoal/70 hover:border-burgundy hover:text-burgundy"
                  )}
                >
                  {ch.label}
                </button>
              ))}
            </div>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-charcoal/55">
              16:9 Studio Showreel • 24 FPS
            </span>
          </div>

          {/* Framed Charcoal Theater Player on Ivory Canvas */}
          <div
            ref={wrapperRef}
            data-cursor={playing ? "pause" : "play"}
            className="mt-6 relative overflow-hidden rounded-3xl border border-charcoal/15 bg-obsidian p-2 shadow-[0_32px_80px_-28px_rgba(21,19,19,0.45)]"
          >
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black">
              <video
                ref={videoRef}
                key={videoUrl}
                muted={muted}
                playsInline
                preload="metadata"
                poster={posterUrl || "/media/generated/automotive-after.jpg"}
                onTimeUpdate={() =>
                  setCurrentTime(videoRef.current?.currentTime ?? 0)
                }
                onLoadedMetadata={() =>
                  setDuration(videoRef.current?.duration || 24)
                }
                onEnded={() => setPlaying(false)}
                onClick={togglePlay}
                className="h-full w-full cursor-pointer object-cover"
              >
                <source src={videoUrl} type="video/mp4" />
              </video>

              {!playing && (
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label="Play Studio Showreel"
                  className="group absolute inset-0 flex flex-col items-center justify-center bg-charcoal/35 backdrop-blur-[2px] transition-colors hover:bg-charcoal/20"
                >
                  <span className="flex h-20 w-20 items-center justify-center rounded-full border border-gold/75 bg-obsidian/80 text-ivory shadow-2xl transition-transform duration-300 group-hover:scale-110">
                    <Play className="h-7 w-7 translate-x-0.5 fill-gold text-gold" />
                  </span>
                  <span className="mt-4 font-mono text-[11px] uppercase tracking-[0.26em] text-ivory">
                    Watch Studio Showreel
                  </span>
                </button>
              )}

              {/* Bottom Control Bar */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-obsidian/95 via-obsidian/70 to-transparent px-4 pt-10 pb-4 sm:px-6">
                <div className="mb-3 flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={duration || 24}
                    step={0.1}
                    value={currentTime}
                    onChange={handleSeek}
                    aria-label="Seek showreel playback"
                    style={{
                      background: `linear-gradient(to right, #D8B477 ${progress}%, rgba(245,240,232,0.22) ${progress}%)`,
                    }}
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-full accent-gold"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-ivory/85">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={togglePlay}
                      aria-label={playing ? "Pause showreel" : "Play showreel"}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ivory/20 bg-ivory/[0.08] transition hover:border-gold hover:text-gold"
                    >
                      {playing ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4 translate-x-0.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={toggleMute}
                      aria-label={muted ? "Unmute showreel" : "Mute showreel"}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ivory/20 bg-ivory/[0.08] transition hover:border-gold hover:text-gold"
                    >
                      {muted ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4 text-gold" />
                      )}
                    </button>

                    <span className="font-mono text-[11px] text-ivory/75">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ivory/20 bg-ivory/[0.08] transition hover:border-gold hover:text-gold"
                  >
                    {fullscreen ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
