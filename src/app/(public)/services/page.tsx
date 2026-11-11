import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { getPublishedServices } from "@/lib/data";

export const metadata: Metadata = {
  title: "Services",
  description:
    "AI Product Commercials, Brand Campaigns, UGC-Style Ads, Fashion Films, Product Photography, Virtual Models, Video Enhancement, and Complete Creative Campaigns.",
};

export default async function ServicesPage() {
  const services = await getPublishedServices();

  return (
    <div className="py-12 sm:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="glass-panel rounded-3xl p-8 sm:p-12">
          <span className="font-mono text-xs uppercase tracking-[0.22em] text-gold">
            STUDIO CAPABILITIES
          </span>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ivory sm:text-6xl">
            EVERY FORMAT OF MODERN ADVERTISING.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-ivory/75 sm:text-base">
            Whether you are launching one flagship SKU from static product
            angles or scaling dozens of creative variations across global markets,
            RAPID MOTION STUDIO delivers cinema-caliber campaigns without physical production
            friction.
          </p>
        </div>

        <div className="mt-12 space-y-6">
          {services.map((service) => (
            <article
              key={service.id}
              className="glass-card grid overflow-hidden rounded-3xl transition-colors hover:border-gold/35 lg:grid-cols-12"
            >
              <div className="relative aspect-[16/10] lg:col-span-5 lg:aspect-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={service.hero_image_url || "/media/generated/perfume-after.jpg"}
                  alt={service.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-charcoal/70 hidden lg:block" />
                <span className="absolute top-4 left-4 rounded-full border border-gold/45 bg-charcoal/85 px-3 py-1 font-mono text-xs font-bold text-gold backdrop-blur-md">
                  SERVICE {service.number_label}
                </span>
              </div>

              <div className="flex flex-col justify-between p-7 sm:p-9 lg:col-span-7">
                <div>
                  <h2 className="font-display text-2xl font-extrabold text-ivory sm:text-3xl">
                    {service.title}
                  </h2>
                  <p className="mt-2.5 text-sm leading-relaxed text-ivory/80 sm:text-base">
                    {service.business_value || service.short_description}
                  </p>

                  <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
                    {(service.deliverables ?? []).map((deliv) => (
                      <div
                        key={deliv}
                        className="flex items-start gap-2 rounded-2xl border border-ivory/10 bg-ivory/[0.03] px-3.5 py-2.5 text-xs text-ivory/85"
                      >
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                        <span>{deliv}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-ivory/10 pt-5">
                  <Link
                    href={`/services/${service.slug}`}
                    className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gradient-to-r from-burgundy to-wine px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] text-ivory"
                  >
                    <span>Service Details</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-gold" />
                  </Link>
                  <Link
                    href={`/start-project?service=${encodeURIComponent(
                      service.title
                    )}`}
                    className="inline-flex items-center gap-2 rounded-full border border-ivory/20 bg-ivory/[0.04] px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-ivory/85 hover:border-gold/45"
                  >
                    <span>{service.cta_label || "Start a Project"}</span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
