"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, CheckCircle2, Clock, Film, Play, X } from "lucide-react";
import type { PortfolioCategory, PortfolioProject } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PortfolioShowcaseProps {
  projects: PortfolioProject[];
  categories: PortfolioCategory[];
  limit?: number;
  showHeader?: boolean;
}

function getAspectMeta(project: PortfolioProject, idx: number) {
  const v = project.video_url || "";
  if (v.includes("ugc-radiance") || v.includes("fashion-atelier")) {
    return {
      ratioLabel: "9:16 VERTICAL",
      frameClass: "aspect-[9/14] sm:row-span-2",
      gridSpan: "lg:col-span-1",
    };
  }
  if (v.includes("perfume-aura") || v.includes("horology-chrono")) {
    return {
      ratioLabel: "1:1 SQUARE",
      frameClass: "aspect-square",
      gridSpan: idx === 0 ? "md:col-span-2 lg:col-span-2" : "lg:col-span-1",
    };
  }
  return {
    ratioLabel: "16:9 CINEMA",
    frameClass: idx === 0 ? "aspect-[16/9]" : "aspect-[16/10]",
    gridSpan: idx === 0 ? "md:col-span-2 lg:col-span-2" : "lg:col-span-1",
  };
}

function PortfolioCardMedia({
  project,
  frameClass,
  ratioLabel,
  onSelect,
}: {
  project: PortfolioProject;
  frameClass: string;
  ratioLabel: string;
  onSelect: () => void;
}) {
  const cardRef = useRef<HTMLButtonElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [activePreview, setActivePreview] = useState(false);

  // Pause automatically whenever card exits viewport
  useEffect(() => {
    const el = cardRef.current;
    const vid = videoRef.current;
    if (!el || !vid) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && !vid.paused) {
          vid.pause();
          setActivePreview(false);
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [activePreview]);

  const startHover = () => {
    setActivePreview(true);
    setTimeout(() => {
      videoRef.current?.play().catch(() => {});
    }, 30);
  };

  const stopHover = () => {
    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
    }
    setActivePreview(false);
  };

  return (
    <button
      ref={cardRef}
      type="button"
      onClick={onSelect}
      onMouseEnter={startHover}
      onMouseLeave={stopHover}
      data-cursor="watch"
      aria-label={`Watch ${project.title}`}
      className={cn(
        "relative w-full overflow-hidden bg-obsidian text-left focus:outline-none",
        frameClass
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={project.thumbnail_url || "/media/generated/perfume-after.jpg"}
        alt={project.title}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />

      {project.video_url && (
        <video
          ref={videoRef}
          src={project.video_url}
          loop
          muted
          playsInline
          preload="none"
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-300",
            activePreview ? "opacity-100" : "opacity-0"
          )}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/20 to-transparent opacity-85" />

      {/* Crisp Cinema Metadata */}
      <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-2">
        <span
          className={cn(
            "rounded-full border px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.16em] backdrop-blur-md",
            project.project_type === "Client Production"
              ? "border-gold/55 bg-wine/90 text-gold"
              : "border-ivory/25 bg-obsidian/80 text-ivory/90"
          )}
        >
          {project.project_type}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="hidden rounded-full border border-ivory/20 bg-obsidian/75 px-2.5 py-1 font-mono text-[10px] text-ivory/75 backdrop-blur-md sm:inline">
            {ratioLabel}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-ivory/20 bg-obsidian/80 px-2.5 py-1 font-mono text-[10px] text-ivory/90 backdrop-blur-md">
            <Clock className="h-3 w-3 text-gold" />
            {project.duration_label}
          </span>
        </div>
      </div>

      {/* Center Action Indicator */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <span className="inline-flex items-center gap-2 rounded-full border border-gold/60 bg-obsidian/85 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-ivory backdrop-blur-md shadow-xl">
          <Play className="h-3.5 w-3.5 fill-gold text-gold" />
          Watch Film
        </span>
      </div>
    </button>
  );
}

export function PortfolioShowcase({
  projects,
  categories,
  limit,
  showHeader = true,
}: PortfolioShowcaseProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [modalProject, setModalProject] = useState<PortfolioProject | null>(
    null
  );

  const filtered = useMemo(() => {
    const base =
      selectedCategory === "all"
        ? projects
        : projects.filter(
            (p) =>
              p.category?.slug === selectedCategory ||
              p.category_id === selectedCategory
          );
    return typeof limit === "number" ? base.slice(0, limit) : base;
  }, [projects, selectedCategory, limit]);

  return (
    <section className="relative bg-charcoal py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        {showHeader && (
          <div className="flex flex-col justify-between gap-6 border-b border-ivory/10 pb-8 lg:flex-row lg:items-end">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-gold">
                SELECTED CREATIVE WORK
              </span>
              <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ivory sm:text-5xl">
                CRAFTED FOR ATTENTION.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ivory/70 sm:text-base">
                Explore widescreen cinema spots, vertical social commercials,
                and product campaigns built from raw client references. Demo
                concepts are labeled transparently alongside client works.
              </p>
            </div>
            <Link
              href="/work"
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-ivory/20 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-ivory transition-colors hover:border-gold hover:text-gold"
            >
              <span>Explore Archive</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        {/* Category Filters */}
        <div
          className="mt-8 flex flex-wrap gap-2"
          role="tablist"
          aria-label="Filter projects by category"
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === "all"}
            onClick={() => setSelectedCategory("all")}
            className={cn(
              "rounded-full border px-4 py-2 text-xs font-medium transition-all duration-200",
              selectedCategory === "all"
                ? "border-gold bg-gold text-charcoal font-semibold"
                : "border-ivory/15 text-ivory/70 hover:border-ivory/40 hover:text-ivory"
            )}
          >
            All Projects
          </button>
          {categories.map((cat) => {
            const active = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedCategory(cat.slug)}
                className={cn(
                  "rounded-full border px-4 py-2 text-xs font-medium transition-all duration-200",
                  active
                    ? "border-gold bg-gold text-charcoal font-semibold"
                    : "border-ivory/15 text-ivory/70 hover:border-ivory/40 hover:text-ivory"
                )}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Mixed-Ratio Editorial Grid */}
        {filtered.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-ivory/10 bg-obsidian/70 p-12 text-center">
            <Film className="mx-auto h-8 w-8 text-gold/70" />
            <p className="mt-3 font-display text-lg font-semibold text-ivory">
              No published productions in this category yet.
            </p>
            <p className="mt-1 text-sm text-ivory/65">
              Select another discipline above or start a project brief.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid grid-flow-dense gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project, idx) => {
              const meta = getAspectMeta(project, idx);
              return (
                <motion.article
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 0.45, delay: Math.min(idx * 0.05, 0.25) }}
                  className={cn(
                    "group flex flex-col overflow-hidden rounded-3xl border border-ivory/10 bg-[#181415] transition-all duration-300 hover:border-gold/40",
                    meta.gridSpan
                  )}
                >
                  <PortfolioCardMedia
                    project={project}
                    frameClass={meta.frameClass}
                    ratioLabel={meta.ratioLabel}
                    onSelect={() => setModalProject(project)}
                  />

                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-gold">
                          {project.category?.name || project.brand_or_industry}
                        </span>
                        <span className="font-mono text-[10px] text-ivory/45">
                          {project.brand_or_industry}
                        </span>
                      </div>
                      <h3 className="mt-2 font-display text-xl font-bold tracking-tight text-ivory">
                        {project.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ivory/70">
                        {project.short_description}
                      </p>

                      {project.production_highlights?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {project.production_highlights.slice(0, 2).map((h) => (
                            <span
                              key={h}
                              className="rounded-md border border-ivory/10 bg-ivory/[0.03] px-2 py-0.5 text-[10px] text-ivory/65"
                            >
                              {h}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-ivory/10 pt-4">
                      <button
                        type="button"
                        onClick={() => setModalProject(project)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-gold transition-colors hover:text-ivory"
                      >
                        <Play className="h-3.5 w-3.5" />
                        <span>Watch Preview</span>
                      </button>
                      <Link
                        href={`/work/${project.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-ivory/70 transition-colors hover:text-ivory"
                      >
                        <span>View Project</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>

      {/* Fullscreen Project Cinema Modal */}
      <AnimatePresence>
        {modalProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalProject(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/88 p-4 backdrop-blur-xl sm:p-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-gold/30 bg-charcoal shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setModalProject(null)}
                aria-label="Close project viewer"
                className="absolute top-4 right-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-ivory/25 bg-obsidian/85 text-ivory transition-colors hover:border-gold hover:text-gold"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="relative aspect-video w-full bg-black">
                {modalProject.video_url ? (
                  <video
                    src={modalProject.video_url}
                    poster={modalProject.thumbnail_url}
                    controls
                    autoPlay
                    playsInline
                    className="h-full w-full object-contain"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={modalProject.thumbnail_url}
                    alt={modalProject.title}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-12">
                <div className="space-y-4 lg:col-span-8">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="rounded-full border border-gold/40 bg-wine/70 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-gold">
                      {modalProject.project_type}
                    </span>
                    <span className="font-mono text-xs text-ivory/65">
                      {modalProject.brand_or_industry}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl font-extrabold text-ivory sm:text-3xl">
                    {modalProject.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-ivory/80 sm:text-base">
                    {modalProject.full_description ||
                      modalProject.short_description}
                  </p>
                  {modalProject.creative_concept && (
                    <div className="rounded-2xl border border-ivory/10 bg-ivory/[0.03] p-4">
                      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-gold">
                        Creative Concept
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-ivory/75">
                        {modalProject.creative_concept}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-5 lg:col-span-4">
                  <div className="rounded-2xl border border-ivory/10 bg-ivory/[0.03] p-5">
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-gold">
                      Deliverables &amp; Scope
                    </p>
                    <ul className="mt-3 space-y-2.5">
                      {(modalProject.production_highlights ?? []).map(
                        (item) => (
                          <li
                            key={item}
                            className="flex items-start gap-2 text-xs text-ivory/80"
                          >
                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                            <span>{item}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <Link
                      href={`/work/${modalProject.slug}`}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ivory px-5 py-3 text-xs font-bold uppercase tracking-[0.15em] text-charcoal transition hover:bg-gold"
                    >
                      <span>Open Case Study</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/start-project?service=${encodeURIComponent(
                        modalProject.category?.name || "AI Product Commercials"
                      )}`}
                      className="inline-flex w-full items-center justify-center rounded-full border border-ivory/25 px-5 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-ivory hover:border-gold hover:text-gold"
                    >
                      Request Similar Production
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
