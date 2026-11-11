"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

const STUDIO_PILLARS = [
  {
    code: "01",
    title: "No Physical Shoots Required",
    text: "Eliminate stage bookings, camera trucks, casting logistics, and location travel across every campaign.",
  },
  {
    code: "02",
    title: "Accelerated Turnaround",
    text: "Move from raw product photographs or unedited footage to graded cinema deliverables in focused sprints.",
  },
  {
    code: "03",
    title: "Limitless Production Environments",
    text: "Stage products inside architectural travertine, dark obsidian landscapes, or custom macro worlds.",
  },
  {
    code: "04",
    title: "Multi-Format Ad Variations",
    text: "Deliver 16:9 cinema spots alongside native 9:16 vertical hooks and 1:1 product cutdowns from one brief.",
  },
  {
    code: "05",
    title: "Uncompromising Product Fidelity",
    text: "Industrial proportions, label typography, surface sheen, and brand colorways remain faithful frame by frame.",
  },
  {
    code: "06",
    title: "Director-Led Craft",
    text: "Every piece is shaped by art direction, editorial pacing, sound design, and color grading.",
  },
  {
    code: "07",
    title: "Scalable Across SKUs",
    text: "Launch seasonal drops and regional variations seamlessly without repeating physical set construction.",
  },
  {
    code: "08",
    title: "End-to-End Delivery",
    text: "Concept strategy, scriptwriting, visual production, audio mix, and final masters handled under one roof.",
  },
];

const INDUSTRIES = [
  {
    name: "Fashion",
    tag: "Editorial & Runway Films",
    image: "/media/generated/fashion-after.jpg",
  },
  {
    name: "Beauty & Cosmetics",
    tag: "Fragrance & Color Campaigns",
    image: "/media/generated/perfume-after.jpg",
  },
  {
    name: "Skincare",
    tag: "Texture & Ritual Films",
    image: "/media/generated/skincare-after.jpg",
  },
  {
    name: "Food & Beverage",
    tag: "Sensory Pour & Macro Studies",
    image: "/media/generated/food-after.jpg",
  },
  {
    name: "Consumer Electronics",
    tag: "Industrial Hardware Launches",
    image: "/media/generated/tech-after.jpg",
  },
  {
    name: "Luxury Products",
    tag: "Horology & Objects",
    image: "/media/generated/luxury-watch-after.jpg",
  },
  {
    name: "Automotive",
    tag: "Velocity & Performance",
    image: "/media/generated/automotive-after.jpg",
  },
  {
    name: "Home & Interior",
    tag: "Architectural Living",
    image: "/media/generated/interior-after.jpg",
  },
  {
    name: "E-commerce",
    tag: "Conversion Paid Social",
    image: "/media/generated/skincare-before.jpg",
  },
  {
    name: "Startups",
    tag: "Flagship Launch Movies",
    image: "/media/generated/studio-bts.jpg",
  },
  {
    name: "Fitness & Lifestyle",
    tag: "Kinetic Product Movement",
    image: "/media/generated/fashion-after.jpg",
  },
  {
    name: "Personal Brands",
    tag: "Signature Authority Films",
    image: "/media/generated/perfume-after.jpg",
  },
];

interface ProcessAndAdvantagesProps {
  howItWorksContent?: Record<string, unknown>;
  btsContent?: Record<string, unknown>;
}

export function ProcessAndAdvantages({
  howItWorksContent,
  btsContent,
}: ProcessAndAdvantagesProps) {
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [activeIndustryIdx, setActiveIndustryIdx] = useState(0);

  const processHeadline =
    (howItWorksContent?.headline as string) ||
    "NO CAMERAS. NO COMPLEX SHOOTS. JUST GREAT CREATIVE.";
  const processSteps = (howItWorksContent?.steps as Array<{
    step: string;
    title: string;
    description: string;
  }>) || [
    {
      step: "01",
      title: "SHARE YOUR VISION",
      description:
        "Tell us about your brand, product, target audience, and marketing objectives.",
    },
    {
      step: "02",
      title: "SEND YOUR MATERIALS",
      description:
        "Upload raw videos, product photographs, logos, brand assets, and references.",
    },
    {
      step: "03",
      title: "WE CREATE",
      description:
        "Our creative team develops concepts and transforms your materials into premium advertising campaigns.",
    },
    {
      step: "04",
      title: "REVIEW & RECEIVE",
      description:
        "Review the creative output, request revisions according to your package, and receive advertising-ready assets.",
    },
  ];

  const btsHeadline =
    (btsContent?.headline as string) || "TECHNOLOGY SERVES THE STORY.";
  const btsSub =
    (btsContent?.subheadline as string) ||
    "Every frame is steered by creative direction, lighting craft, editorial pacing, and audio engineering.";
  const btsStages = (btsContent?.stages as Array<{
    code: string;
    title: string;
    detail: string;
  }>) || [
    { code: "01", title: "Brand Brief", detail: "Positioning & goals" },
    { code: "02", title: "Visual Architecture", detail: "Story & shot bible" },
    { code: "03", title: "Product Calibration", detail: "Geometry & tone" },
    { code: "04", title: "Motion Synthesis", detail: "Scene & camera craft" },
    { code: "05", title: "Editorial & Sound", detail: "Cut, LUTs & mix" },
    { code: "06", title: "Cinema Mastering", detail: "Ad-ready masters" },
  ];

  const activeIndustry = INDUSTRIES[activeIndustryIdx] || INDUSTRIES[0];

  return (
    <>
      {/* How We Create — Interactive 4-Step Pipeline */}
      <section className="relative border-t border-ivory/10 bg-[#181214] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-6 border-b border-ivory/10 pb-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-gold">
                HOW WE CREATE • CLIENT WORKFLOW
              </span>
              <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ivory sm:text-5xl">
                {processHeadline}
              </h2>
            </div>
            <p className="text-sm text-ivory/65 lg:col-span-4">
              {BRAND.coreMessage}
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step, idx) => {
              const active = idx === activeStepIdx;
              return (
                <motion.button
                  key={step.step}
                  type="button"
                  onMouseEnter={() => setActiveStepIdx(idx)}
                  onClick={() => setActiveStepIdx(idx)}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 0.4, delay: idx * 0.06 }}
                  className={cn(
                    "flex flex-col justify-between rounded-2xl border p-6 text-left transition-all duration-300",
                    active
                      ? "border-gold/55 bg-wine/40"
                      : "border-ivory/10 bg-charcoal/70 hover:border-ivory/25"
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "font-mono text-xs font-semibold tracking-[0.2em]",
                          active ? "text-gold" : "text-ivory/45"
                        )}
                      >
                        STEP {step.step}
                      </span>
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full transition-colors",
                          active ? "bg-gold" : "bg-ivory/20"
                        )}
                      />
                    </div>
                    <h3 className="mt-4 font-display text-lg font-bold text-ivory">
                      {step.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-ivory/70">
                      {step.description}
                    </p>
                  </div>

                  <div
                    className={cn(
                      "mt-6 h-[2px] rounded-full transition-all duration-500",
                      active ? "w-full bg-gold" : "w-10 bg-ivory/20"
                    )}
                  />
                </motion.button>
              );
            })}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-ivory/10 pt-8">
            <p className="font-display text-base font-semibold text-ivory sm:text-lg">
              {BRAND.coreMessage}
            </p>
            <Link
              href="/start-project"
              className="inline-flex items-center gap-2 rounded-full bg-ivory px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-charcoal transition hover:bg-gold"
            >
              <span>Start a Project</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Rapid Motion Studio — Restrained Editorial Grid */}
      <section className="relative border-t border-ivory/10 bg-charcoal py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-gold">
              STUDIO ADVANTAGES
            </span>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ivory sm:text-5xl">
              WHY {BRAND.name}.
            </h2>
          </div>

          <div className="mt-12 grid divide-y divide-ivory/10 border-t border-b border-ivory/10 md:grid-cols-2 md:divide-y-0">
            {STUDIO_PILLARS.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.35, delay: idx * 0.03 }}
                className={cn(
                  "flex gap-5 py-7 md:border-b md:border-ivory/10",
                  idx % 2 === 0 ? "md:pr-10" : "md:pl-10 md:border-l"
                )}
              >
                <span className="mt-1 font-mono text-xs font-semibold tracking-[0.2em] text-gold">
                  {item.code}
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold text-ivory">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ivory/68">
                    {item.text}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Behind the Scenes — Cinema Suite Architecture */}
      <section className="relative overflow-hidden border-y border-ivory/10 bg-obsidian py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5">
              <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-gold">
                PRODUCTION DISCIPLINE
              </span>
              <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ivory sm:text-5xl">
                {btsHeadline}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-ivory/75 sm:text-base">
                {btsSub}
              </p>

              <div className="mt-8 overflow-hidden rounded-3xl border border-ivory/15">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/media/generated/studio-bts.jpg"
                  alt={`${BRAND.name} cinema rig and grading workflow`}
                  className="aspect-video w-full object-cover"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
              {btsStages.map((stage, idx) => (
                <motion.div
                  key={stage.code}
                  initial={{ opacity: 0, x: 14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 0.35, delay: idx * 0.05 }}
                  className="rounded-2xl border border-ivory/10 bg-[#151213] p-5 transition-colors hover:border-gold/35"
                >
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">
                    STAGE {stage.code}
                  </span>
                  <h3 className="mt-2 font-display text-base font-bold text-ivory">
                    {stage.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-ivory/68">
                    {stage.detail}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Industries We Serve — Interactive Editorial Lookbook */}
      <section className="relative bg-charcoal py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col justify-between gap-4 border-b border-ivory/10 pb-8 md:flex-row md:items-end">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-gold">
                SECTORS • 12 DISCIPLINES
              </span>
              <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ivory sm:text-5xl">
                INDUSTRIES WE SERVE.
              </h2>
            </div>
            <p className="max-w-md text-sm text-ivory/65">
              Hover any sector below to preview its production aesthetic or
              start a customized industry brief.
            </p>
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-start">
            <div className="divide-y divide-ivory/10 border-b border-ivory/10 lg:col-span-7">
              {INDUSTRIES.map((ind, idx) => {
                const active = idx === activeIndustryIdx;
                return (
                  <Link
                    key={ind.name}
                    href={`/start-project?industry=${encodeURIComponent(ind.name)}`}
                    onMouseEnter={() => setActiveIndustryIdx(idx)}
                    onFocus={() => setActiveIndustryIdx(idx)}
                    className={cn(
                      "flex items-center justify-between gap-4 py-4 transition-all",
                      active ? "px-3 -mx-3 bg-wine/25 rounded-xl" : ""
                    )}
                  >
                    <div className="flex items-baseline gap-4">
                      <span
                        className={cn(
                          "font-mono text-[11px]",
                          active ? "text-gold" : "text-ivory/35"
                        )}
                      >
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={cn(
                          "font-display text-lg font-bold transition-colors sm:text-xl",
                          active ? "text-ivory" : "text-ivory/70"
                        )}
                      >
                        {ind.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="hidden font-mono text-[11px] uppercase tracking-[0.14em] text-ivory/50 sm:inline">
                        {ind.tag}
                      </span>
                      <ArrowUpRight
                        className={cn(
                          "h-4 w-4 transition-transform",
                          active ? "text-gold translate-x-0.5 -translate-y-0.5" : "text-ivory/40"
                        )}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="lg:sticky lg:top-28 lg:col-span-5">
              <div className="overflow-hidden rounded-3xl border border-ivory/15 bg-obsidian p-3 shadow-2xl">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-charcoal">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={`${activeIndustry.name}-${activeIndustry.image}`}
                      src={activeIndustry.image}
                      alt={activeIndustry.name}
                      initial={{ opacity: 0.3, scale: 1.04 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0.3 }}
                      transition={{ duration: 0.35 }}
                      className="h-full w-full object-cover"
                    />
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
                        {activeIndustry.tag}
                      </p>
                      <p className="mt-1 font-display text-xl font-bold text-ivory">
                        {activeIndustry.name}
                      </p>
                    </div>
                    <Link
                      href={`/start-project?industry=${encodeURIComponent(
                        activeIndustry.name
                      )}`}
                      className="rounded-full bg-ivory px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-charcoal transition hover:bg-gold"
                    >
                      Brief Sector
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
