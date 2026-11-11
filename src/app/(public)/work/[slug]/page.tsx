import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CheckCircle2, Clock } from "lucide-react";
import { BeforeAfterShowcase } from "@/components/home/before-after-showcase";
import { getProjectBySlug, getPublishedProjects } from "@/lib/data";

export async function generateStaticParams() {
  const projects = await getPublishedProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Project Not Found" };
  return {
    title: project.title,
    description: project.short_description,
    openGraph: {
      title: project.title,
      description: project.short_description,
      images: project.thumbnail_url ? [{ url: project.thumbnail_url }] : [],
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [project, allProjects] = await Promise.all([
    getProjectBySlug(slug),
    getPublishedProjects(),
  ]);

  if (!project) {
    notFound();
  }

  const related = allProjects
    .filter((p) => p.id !== project.id)
    .slice(0, 3);

  const hasBeforeAfter =
    Boolean(project.before_image_url) && Boolean(project.after_image_url);

  return (
    <div className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-6">
        <Link
          href="/work"
          className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-ivory/70 transition-colors hover:text-gold"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Our Work</span>
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-gold/45 bg-wine/80 px-3.5 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-gold">
            {project.project_type}
          </span>
          <span className="font-mono text-xs text-ivory/65">
            {project.brand_or_industry}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-ivory/15 bg-ivory/5 px-3 py-1 font-mono text-xs text-ivory/80">
            <Clock className="h-3 w-3 text-gold" />
            {project.duration_label}
          </span>
        </div>

        <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ivory sm:text-5xl lg:text-6xl">
          {project.title}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-ivory/75 sm:text-lg">
          {project.short_description}
        </p>

        {/* Fullscreen Video Showcase */}
        <div className="mt-10 glass-panel overflow-hidden rounded-3xl p-2 sm:p-3">
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-obsidian">
            {project.video_url ? (
              <video
                src={project.video_url}
                poster={project.thumbnail_url}
                controls
                playsInline
                className="h-full w-full object-cover"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={project.thumbnail_url}
                alt={project.title}
                className="h-full w-full object-cover"
              />
            )}
          </div>
        </div>

        {/* Concept & Production Breakdown */}
        <div className="mt-12 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-card rounded-3xl p-7">
              <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-gold">
                Project Overview
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ivory/80 sm:text-base">
                {project.full_description || project.short_description}
              </p>
            </div>

            {project.creative_concept && (
              <div className="glass-card rounded-3xl p-7">
                <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-gold">
                  Creative Concept
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-ivory/80 sm:text-base">
                  {project.creative_concept}
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel rounded-3xl p-7">
              <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-gold">
                Production Highlights
              </h2>
              <ul className="mt-4 space-y-3">
                {(project.production_highlights ?? []).map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm text-ivory/85"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 border-t border-ivory/10 pt-6">
                <Link
                  href={`/start-project?service=${encodeURIComponent(
                    project.category?.name || "AI Product Commercials"
                  )}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-gold/55 bg-gradient-to-r from-burgundy to-wine px-6 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-ivory"
                >
                  <span>Start a Similar Campaign</span>
                  <ArrowUpRight className="h-4 w-4 text-gold" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project-Specific Before & After if available */}
      {hasBeforeAfter && (
        <div className="mt-16">
          <BeforeAfterShowcase
            comparisons={[
              {
                id: project.id,
                title: project.title,
                category_label: project.category?.name || "Transformation",
                description:
                  project.before_after_caption || project.short_description,
                before_image_url: project.before_image_url,
                after_image_url: project.after_image_url,
                display_order: 1,
                is_published: true,
              },
            ]}
            content={{
              eyebrow: "PROJECT TRANSFORMATION",
              headline: "BEFORE & AFTER PRODUCTION COMPARISON.",
              subheadline:
                project.before_after_caption ||
                "Compare the source input frame against the final RAPID MOTION STUDIO commercial treatment.",
            }}
          />
        </div>
      )}

      {/* Related Projects */}
      {related.length > 0 && (
        <section className="mx-auto mt-16 max-w-7xl px-6">
          <h2 className="font-display text-2xl font-bold text-ivory sm:text-3xl">
            Related Productions
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item.id}
                href={`/work/${item.slug}`}
                className="glass-card group overflow-hidden rounded-3xl transition-all hover:border-gold/40"
              >
                <div className="aspect-[16/10] w-full overflow-hidden bg-obsidian">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.thumbnail_url}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold">
                    {item.project_type}
                  </span>
                  <h3 className="mt-1 font-display text-lg font-bold text-ivory">
                    {item.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
