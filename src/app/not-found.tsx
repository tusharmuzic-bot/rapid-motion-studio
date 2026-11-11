import Link from "next/link";
import { ArrowLeft, Film } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-charcoal px-6 text-center velora-ambient-bg">
      <div className="glass-panel max-w-lg rounded-3xl p-10">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-gold/40 bg-wine/70 text-gold">
          <Film className="h-6 w-6" />
        </span>
        <p className="mt-5 font-mono text-xs uppercase tracking-[0.25em] text-gold">
          404 • SCENE NOT FOUND
        </p>
        <h1 className="mt-3 font-display text-3xl font-extrabold text-ivory sm:text-4xl">
          THIS FRAME DOESN&apos;T EXIST.
        </h1>
        <p className="mt-3 text-sm text-ivory/70">
          The page or production showcase you requested may have moved or been
          unpublished.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-gold/55 bg-gradient-to-r from-burgundy to-wine px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-ivory"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-gold" />
            <span>Return Home</span>
          </Link>
          <Link
            href="/work"
            className="inline-flex items-center rounded-full border border-ivory/20 bg-ivory/[0.04] px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-ivory/85"
          >
            Explore Our Work
          </Link>
        </div>
      </div>
    </div>
  );
}
