import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CheckCircle2, Film } from "lucide-react";
import { getPublishedServices, getServiceBySlug } from "@/lib/data";

export async function generateStaticParams() {
  const services = await getPublishedServices();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return { title: "Service Not Found" };
  return {
    title: service.title,
    description: service.short_description,
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [service, allServices] = await Promise.all([
    getServiceBySlug(slug),
    getPublishedServices(),
  ]);

  if (!service) notFound();

  const others = allServices.filter((s) => s.id !== service.id).slice(0, 3);

  return (
    <div className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-6">
        <Link
          href="/services"
          className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-ivory/70 transition-colors hover:text-gold"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>All Services</span>
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-6">
            <span className="glass-pill inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-gold">
              <Film className="h-3.5 w-3.5" />
              Service {service.number_label}
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-ivory sm:text-5xl">
              {service.title}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-ivory/80 sm:text-lg">
              {service.short_description}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-ivory/70 sm:text-base">
              {service.business_value}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/start-project?service=${encodeURIComponent(
                  service.title
                )}`}
                className="inline-flex items-center gap-2 rounded-full border border-gold/55 bg-gradient-to-r from-burgundy to-wine px-7 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-ivory"
              >
                <span>{service.cta_label || "Start a Project"}</span>
                <ArrowUpRight className="h-4 w-4 text-gold" />
              </Link>
              <Link
                href="/work"
                className="inline-flex items-center rounded-full border border-ivory/20 bg-ivory/[0.04] px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-ivory/85 hover:border-gold/40"
              >
                View Portfolio
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="glass-panel overflow-hidden rounded-3xl p-2">
              <div className="aspect-video w-full overflow-hidden rounded-2xl bg-obsidian">
                {service.video_url ? (
                  <video
                    src={service.video_url}
                    poster={service.hero_image_url}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="h-full w-full object-cover"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={service.hero_image_url}
                    alt={service.title}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          <div className="glass-card rounded-3xl p-7">
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-gold">
              Creative Approach
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ivory/80">
              {service.creative_approach}
            </p>
          </div>

          <div className="glass-card rounded-3xl p-7">
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-gold">
              Deliverables
            </h2>
            <ul className="mt-4 space-y-2.5">
              {(service.deliverables ?? []).map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm text-ivory/85"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card rounded-3xl p-7">
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-gold">
              Ideal Applications
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {(service.ideal_for ?? []).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-ivory/15 bg-ivory/[0.04] px-3.5 py-1.5 text-xs text-ivory/80"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="font-display text-2xl font-bold text-ivory">
            Related Capabilities
          </h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {others.map((o) => (
              <Link
                key={o.id}
                href={`/services/${o.slug}`}
                className="glass-card rounded-3xl p-6 transition-colors hover:border-gold/40"
              >
                <span className="font-mono text-xs text-gold">
                  {o.number_label}
                </span>
                <h3 className="mt-2 font-display text-lg font-bold text-ivory">
                  {o.title}
                </h3>
                <p className="mt-2 text-xs text-ivory/70">
                  {o.short_description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
