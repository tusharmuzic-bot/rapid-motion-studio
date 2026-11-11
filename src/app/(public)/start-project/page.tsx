import type { Metadata } from "next";
import { Suspense } from "react";
import { ProjectInquiryForm } from "@/components/forms/project-inquiry-form";
import { getPublishedServices } from "@/lib/data";

export const metadata: Metadata = {
  title: "Start a Project",
  description:
    "Submit your brand brief, upload product photographs or raw clips, and receive a tailored creative production proposal from RAPID MOTION STUDIO.",
};

async function StartProjectLoader({
  searchParams,
}: {
  searchParams: Promise<{
    service?: string;
    package?: string;
    industry?: string;
  }>;
}) {
  const [resolvedParams, services] = await Promise.all([
    searchParams,
    getPublishedServices(),
  ]);

  return (
    <ProjectInquiryForm
      services={services.map((s) => s.title)}
      initialService={resolvedParams.service || ""}
      initialPackage={resolvedParams.package || ""}
      initialIndustry={resolvedParams.industry || ""}
    />
  );
}

export default function StartProjectPage({
  searchParams,
}: {
  searchParams: Promise<{
    service?: string;
    package?: string;
    industry?: string;
  }>;
}) {
  return (
    <div className="py-12 sm:py-20">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-10 text-center">
          <span className="glass-pill inline-block rounded-full px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.22em] text-gold">
            PROJECT BRIEF & CUSTOM QUOTE
          </span>
          <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-ivory sm:text-5xl">
            TELL US WHAT YOU&apos;RE LAUNCHING.
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-ivory/75 sm:text-base">
            Share your objectives, budget scope, and optional product photos or
            raw video clips. No production shoot setup required.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="glass-panel mx-auto h-96 max-w-4xl animate-pulse rounded-3xl" />
          }
        >
          <StartProjectLoader searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
