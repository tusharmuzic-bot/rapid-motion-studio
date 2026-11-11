"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Check } from "lucide-react";
import type { ServiceItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ServicesGrid({ services }: { services: ServiceItem[] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const current = services[activeIdx] || services[0];

  return (
    <section className="relative bg-obsidian py-24 text-ivory sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col justify-between gap-6 border-b border-ivory/10 pb-8 lg:flex-row lg:items-end">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-gold">
              CAPABILITIES • SERVICES 01–08
            </span>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ivory sm:text-5xl">
              WHAT WE CREATE.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ivory/70 sm:text-base">
              Eight specialized production disciplines crafted to elevate
              product positioning and launch advertising campaigns at modern
              speed.
            </p>
          </div>
          <Link
            href="/services"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-ivory/20 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-ivory transition-colors hover:border-gold hover:text-gold"
          >
            <span>All Disciplines</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Desktop Interactive Split Stage */}
        <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:items-start">
          {/* Interactive Numbered Index */}
          <div className="divide-y divide-ivory/10 border-t border-b border-ivory/10 lg:col-span-6">
            {services.map((service, idx) => {
              const active = idx === activeIdx;
              return (
                <div
                  key={service.id}
                  onMouseEnter={() => setActiveIdx(idx)}
                  onFocus={() => setActiveIdx(idx)}
                  className={cn(
                    "group relative cursor-pointer py-5 transition-colors",
                    active ? "bg-wine/20 px-4 -mx-4 rounded-2xl" : ""
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => setActiveIdx(idx)}
                      className="flex flex-1 items-start gap-4 text-left focus:outline-none"
                    >
                      <span
                        className={cn(
                          "mt-1 font-mono text-xs font-semibold tracking-[0.2em]",
                          active ? "text-gold" : "text-ivory/40"
                        )}
                      >
                        {service.number_label}
                      </span>
                      <div>
                        <h3
                          className={cn(
                            "font-display text-lg font-bold tracking-tight transition-colors sm:text-xl",
                            active
                              ? "text-ivory"
                              : "text-ivory/75 group-hover:text-ivory"
                          )}
                        >
                          {service.title}
                        </h3>
                        <p className="mt-1.5 text-xs leading-relaxed text-ivory/60 sm:text-sm">
                          {service.short_description}
                        </p>
                      </div>
                    </button>

                    <Link
                      href={`/services/${service.slug}`}
                      aria-label={`Open ${service.title}`}
                      className={cn(
                        "mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all",
                        active
                          ? "border-gold bg-gold text-charcoal"
                          : "border-ivory/15 text-ivory/50 group-hover:border-ivory/40 group-hover:text-ivory"
                      )}
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sticky Live Visual Stage */}
          {current && (
            <div className="lg:sticky lg:top-28 lg:col-span-6">
              <div className="overflow-hidden rounded-3xl border border-ivory/15 bg-[#161213] p-4 shadow-2xl sm:p-5">
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-black">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={current.id}
                      initial={{ opacity: 0.25, scale: 1.03 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0.25 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="h-full w-full"
                    >
                      {current.video_url ? (
                        <video
                          src={current.video_url}
                          poster={current.hero_image_url}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={
                            current.hero_image_url ||
                            "/media/generated/perfume-after.jpg"
                          }
                          alt={current.title}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent to-transparent" />
                  <span className="absolute top-4 left-4 rounded-full border border-gold/40 bg-obsidian/80 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-gold backdrop-blur-md">
                    DISCIPLINE {current.number_label}
                  </span>
                </div>

                <div className="mt-6 space-y-4">
                  <h4 className="font-display text-2xl font-bold text-ivory">
                    {current.title}
                  </h4>
                  <p className="text-sm leading-relaxed text-ivory/75">
                    {current.business_value || current.short_description}
                  </p>

                  {current.deliverables?.length > 0 && (
                    <div className="grid gap-2 border-t border-ivory/10 pt-4 sm:grid-cols-2">
                      {current.deliverables.slice(0, 4).map((deliv) => (
                        <div
                          key={deliv}
                          className="flex items-start gap-2 text-xs text-ivory/80"
                        >
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                          <span>{deliv}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 pt-2">
                    <Link
                      href={`/services/${current.slug}`}
                      className="inline-flex items-center gap-2 rounded-full bg-ivory px-5 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-charcoal transition hover:bg-gold"
                    >
                      <span>Explore Service</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                    <Link
                      href={`/start-project?service=${encodeURIComponent(current.title)}`}
                      className="inline-flex items-center gap-2 rounded-full border border-ivory/25 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-ivory transition hover:border-gold hover:text-gold"
                    >
                      Start Brief
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
