import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, FileImage, Film, Layers, Palette, Volume2 } from "lucide-react";
import { ProcessAndAdvantages } from "@/components/home/process-and-advantages";
import { getSiteContentMap } from "@/lib/data";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Discover how RAPID MOTION STUDIO transforms your product photos, raw clips, and brand assets into cinema-grade commercials without a physical shoot.",
};

const INPUT_CHECKLIST = [
  { icon: FileImage, title: "Product Photographs", desc: "Clean front, 3/4, or detail angles—even basic smartphone or studio packshots." },
  { icon: Film, title: "Optional Raw Video", desc: "Existing clips, unedited B-roll, or handheld product demos ready for elevation." },
  { icon: Layers, title: "Logos & Brand Kit", desc: "Vector marks, typography preferences, color codes, and packaging labels." },
  { icon: Palette, title: "Visual References", desc: "Mood boards, competitor benchmarks, or tone notes you want us to surpass." },
  { icon: Volume2, title: "Script or Voice Notes", desc: "Optional talking points, taglines, or key product claims (or let us script it)." },
];

export default async function HowItWorksPage() {
  const contentMap = await getSiteContentMap();

  return (
    <div className="pt-12 pb-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="glass-panel rounded-3xl p-8 sm:p-12">
          <span className="font-mono text-xs uppercase tracking-[0.22em] text-gold">
            FROM BRIEF TO LAUNCH
          </span>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ivory sm:text-6xl">
            NO CAMERAS. NO COMPLEX SHOOTS. JUST GREAT CREATIVE.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ivory/75 sm:text-base">
            We replace multi-week location scouting, crew booking, and physical
            reshoots with one structured digital studio workflow.
          </p>
        </div>

        {/* What You Provide Checklist */}
        <div className="mt-12">
          <h2 className="font-display text-2xl font-bold text-ivory sm:text-3xl">
            What You Send Us
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {INPUT_CHECKLIST.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="glass-card rounded-3xl p-5">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-gold/30 bg-wine/70 text-gold">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="mt-4 font-display text-base font-bold text-ivory">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-ivory/70">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* What We Handle */}
        <div className="mt-12 glass-card rounded-3xl p-7 sm:p-10">
          <h2 className="font-display text-2xl font-bold text-ivory sm:text-3xl">
            What Our Team Handles End-to-End
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Creative concept development",
              "Advertising strategy",
              "AI-assisted video production",
              "Cinematic scene creation",
              "Product visualization",
              "AI environments & backgrounds",
              "AI actors & virtual models",
              "Voiceovers & sound design",
              "Professional editing",
              "Color grading",
              "Motion graphics",
              "Ad-ready multi-format delivery",
            ].map((step) => (
              <div
                key={step}
                className="flex items-center gap-2.5 rounded-2xl border border-ivory/10 bg-ivory/[0.03] px-4 py-3 text-xs font-medium text-ivory/85"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-gold" />
                <span>{step}</span>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link
              href="/start-project"
              className="inline-flex items-center gap-2 rounded-full border border-gold/55 bg-gradient-to-r from-burgundy to-wine px-7 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-ivory"
            >
              <span>Start Your Project Brief</span>
              <ArrowUpRight className="h-4 w-4 text-gold" />
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <ProcessAndAdvantages
          howItWorksContent={contentMap.how_it_works}
          btsContent={contentMap.behind_the_scenes}
        />
      </div>
    </div>
  );
}
