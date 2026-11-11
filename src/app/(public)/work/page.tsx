import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PortfolioShowcase } from "@/components/portfolio/portfolio-showcase";
import { getPortfolioCategories, getPublishedProjects } from "@/lib/data";

export const metadata: Metadata = {
  title: "Our Work",
  description:
    "Explore RAPID MOTION STUDIO's commercial productions, brand films, vertical reels, and visual transformation concepts.",
};

export default async function WorkPage() {
  const [projects, categories] = await Promise.all([
    getPublishedProjects(),
    getPortfolioCategories(),
  ]);

  return (
    <div className="pt-12 pb-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="glass-panel rounded-3xl p-8 sm:p-12">
          <span className="font-mono text-xs uppercase tracking-[0.22em] text-gold">
            SELECTED ARCHIVE & CONCEPTS
          </span>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ivory sm:text-6xl">
            CINEMATIC ADVERTISING WITHOUT LIMITS.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ivory/75 sm:text-base">
            Every work below demonstrates how raw product imagery, packshots,
            and footage evolve inside our AI creative pipeline. Demonstration
            showcase pieces are explicitly marked as Demo Concept.
          </p>
          <div className="mt-6">
            <Link
              href="/start-project"
              className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gradient-to-r from-burgundy to-wine px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-ivory"
            >
              <span>Commission Your Campaign</span>
              <ArrowUpRight className="h-4 w-4 text-gold" />
            </Link>
          </div>
        </div>
      </div>

      <PortfolioShowcase
        projects={projects}
        categories={categories}
        showHeader={false}
      />
    </div>
  );
}
