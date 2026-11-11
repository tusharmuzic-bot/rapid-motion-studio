import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Compass, Film, Layers } from "lucide-react";
import { getPublishedTestimonials, getSiteContentMap } from "@/lib/data";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "RAPID MOTION STUDIO unites creative direction, AI visual synthesis, and cinema finishing to create commercial brand campaigns.",
};

export default async function AboutPage() {
  const [contentMap, testimonials] = await Promise.all([
    getSiteContentMap(),
    getPublishedTestimonials(),
  ]);

  const about = contentMap.about_story || {};
  const eyebrow = (about.eyebrow as string) || "ABOUT RAPID MOTION STUDIO";
  const headline =
    (about.headline as string) || "CREATIVE VISION. CINEMATIC EXECUTION. LIMITLESS POSSIBILITIES.";
  const lead =
    (about.lead as string) ||
    "RAPID MOTION STUDIO unites senior creative direction, visual synthesis, narrative architecture, and cinema finishing so brands launch high-caliber advertising without physical shoot friction.";
  const body =
    (about.body as string) ||
    "Traditional commercial production forces brands to pick between heavy studio budgets and flat everyday content. You bring the product. We bring the vision.";
  const pillars = (about.pillars as Array<{ title: string; text: string }>) || [
    {
      title: "Art Direction First",
      text: "Technology serves the story. Every frame starts with human art direction and brand discipline.",
    },
    {
      title: "Fidelity to Your Product",
      text: "Your packaging, silhouettes, typography, and color palette remain anchored and recognizable.",
    },
    {
      title: "Built for Modern Speed",
      text: "Iterate campaign concepts, seasonal backdrops, and multiple hooks without rebooking physical stages.",
    },
  ];

  const ICONS = [Compass, Film, Layers];

  return (
    <div className="py-12 sm:py-20">
      <div className="mx-auto max-w-7xl px-6 space-y-12">
        <div className="glass-panel grid gap-10 rounded-3xl p-8 sm:p-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <span className="font-mono text-xs uppercase tracking-[0.22em] text-gold">
              {eyebrow}
            </span>
            <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ivory sm:text-5xl lg:text-6xl">
              {headline}
            </h1>
            <p className="mt-5 text-base leading-relaxed text-ivory/85 sm:text-lg">
              {lead}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-ivory/70 sm:text-base">
              {body}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/start-project"
                className="inline-flex items-center gap-2 rounded-full border border-gold/55 bg-gradient-to-r from-burgundy to-wine px-7 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-ivory"
              >
                <span>Start a Project</span>
                <ArrowUpRight className="h-4 w-4 text-gold" />
              </Link>
              <Link
                href="/work"
                className="inline-flex items-center rounded-full border border-ivory/20 bg-ivory/[0.04] px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-ivory/85 hover:border-gold/40"
              >
                Explore Concepts
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="overflow-hidden rounded-3xl border border-gold/25 bg-obsidian p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/media/generated/studio-bts.jpg"
                alt="RAPID MOTION STUDIO creative production rig"
                className="aspect-[4/3] w-full rounded-2xl object-cover"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {pillars.map((pillar, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <div key={pillar.title} className="glass-card rounded-3xl p-7">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-gold/35 bg-wine/70 text-gold">
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="mt-5 font-display text-xl font-bold text-ivory">
                  {pillar.title}
                </h2>
                <p className="mt-2.5 text-sm leading-relaxed text-ivory/70">
                  {pillar.text}
                </p>
              </div>
            );
          })}
        </div>

        {testimonials.length > 0 && (
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-bold text-ivory sm:text-3xl">
              Approved Client Voices
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.map((t) => (
                <blockquote key={t.id} className="glass-card rounded-3xl p-6">
                  <p className="text-sm leading-relaxed text-ivory/85">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <footer className="mt-4 border-t border-ivory/10 pt-3">
                    <p className="text-sm font-bold text-ivory">
                      {t.client_name}
                    </p>
                    <p className="text-xs text-ivory/60">{t.role_and_company}</p>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
