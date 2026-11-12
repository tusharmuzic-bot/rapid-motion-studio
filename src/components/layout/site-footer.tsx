import Link from "next/link";
import { ArrowUpRight, Mail, MessageCircle } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { BRAND } from "@/lib/brand";
import { sanitizeExternalUrl } from "@/lib/utils";
import type { ServiceItem, SiteSettings } from "@/lib/types";

interface SiteFooterProps {
  settings: SiteSettings;
  services: ServiceItem[];
  ctaContent?: Record<string, unknown>;
}

export function SiteFooter({ settings, services, ctaContent }: SiteFooterProps) {
  const eyebrow =
    (ctaContent?.eyebrow as string) || "START A PRODUCTION";
  const headline =
    (ctaContent?.headline as string) || BRAND.coreMessage;
  const ctaLabel = (ctaContent?.ctaLabel as string) || "START A PROJECT";

  const socialEntries = Object.entries(settings.social_links || {})
    .map(([key, val]) => ({
      name: key,
      url: sanitizeExternalUrl(val),
    }))
    .filter((entry): entry is { name: string; url: string } => Boolean(entry.url));

  const cleanWhatsapp = settings.whatsapp_number?.replace(/[^\d+]/g, "") || "";

  return (
    <footer className="relative border-t border-ivory/10 bg-[#0d0b0c] text-ivory">
      {/* Final Campaign CTA */}
      <div className="relative overflow-hidden border-b border-ivory/10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_50%_0%,rgba(75,16,27,0.34),transparent_72%)]"
        />
        <div className="relative mx-auto flex max-w-7xl flex-col items-start justify-between gap-10 px-6 py-20 sm:py-28 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-gold">
              {eyebrow}
            </span>
            <h2 className="mt-4 font-display text-3xl font-extrabold leading-[1.08] tracking-tight text-ivory sm:text-5xl lg:text-[3.5rem]">
              {headline}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-ivory/70 sm:text-base">
              Share your product imagery, raw clips, or brand guidelines. Our
              creative team directs and delivers commercial campaigns without a
              physical shoot.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/start-project"
              className="group inline-flex items-center gap-2.5 rounded-full bg-ivory px-8 py-4 text-xs font-bold uppercase tracking-[0.18em] text-charcoal transition-all duration-300 hover:bg-gold"
            >
              <span>{ctaLabel}</span>
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link
              href="/work"
              className="inline-flex items-center gap-2 rounded-full border border-ivory/20 px-7 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-ivory/85 transition-colors hover:border-gold/50 hover:text-ivory"
            >
              EXPLORE OUR WORK
            </Link>
          </div>
        </div>
      </div>

      {/* Multi-Column Directory */}
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4 space-y-4">
          <BrandLogo
            brandName={settings.brand_name}
            logoUrl={settings.logo_url}
          />
          <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-gold">
            {settings.footer_tagline || BRAND.tagline}
          </p>
          <p className="max-w-sm text-sm leading-relaxed text-ivory/65">
            Creative vision. Cinematic execution. Limitless possibilities.
            Commercial video production and brand campaigns without traditional
            shoots.
          </p>
        </div>

        <div className="lg:col-span-2">
          <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-gold/85">
            Navigation
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-ivory/70">
            <li>
              <Link href="/" className="transition-colors hover:text-ivory">
                Home
              </Link>
            </li>
            <li>
              <Link href="/work" className="transition-colors hover:text-ivory">
                Our Work
              </Link>
            </li>
            <li>
              <Link
                href="/services"
                className="transition-colors hover:text-ivory"
              >
                Services
              </Link>
            </li>
            <li>
              <Link
                href="/how-it-works"
                className="transition-colors hover:text-ivory"
              >
                How It Works
              </Link>
            </li>
            <li>
              <Link href="/about" className="transition-colors hover:text-ivory">
                About Us
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="transition-colors hover:text-ivory"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-gold/85">
            Services
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-ivory/70">
            {services.slice(0, 8).map((svc) => (
              <li key={svc.id}>
                <Link
                  href={`/services/${svc.slug}`}
                  className="transition-colors hover:text-ivory"
                >
                  {svc.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-gold/85">
            Studio Connect
          </h3>
          <div className="space-y-3 text-sm text-ivory/75">
            {settings.contact_email ? (
              <a
                href={`mailto:${settings.contact_email}`}
                className="flex items-center gap-2.5 transition-colors hover:text-gold"
              >
                <Mail className="h-4 w-4 text-gold/80" />
                <span>{settings.contact_email}</span>
              </a>
            ) : null}

            {cleanWhatsapp ? (
              <a
                href={`https://wa.me/${cleanWhatsapp.replace(/^\+/, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 transition-colors hover:text-gold"
              >
                <MessageCircle className="h-4 w-4 text-gold/80" />
                <span>WhatsApp: {settings.whatsapp_number}</span>
              </a>
            ) : null}

            <Link
              href="/start-project"
              className="inline-flex items-center gap-1.5 text-gold hover:underline"
            >
              <span>Submit Project Brief</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {socialEntries.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {socialEntries.map((item) => (
                <a
                  key={item.name}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-ivory/15 bg-ivory/[0.04] px-3 py-1.5 text-xs capitalize text-ivory/75 transition-colors hover:border-gold/40 hover:text-ivory"
                >
                  {item.name}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Legal Bar */}
      <div className="border-t border-ivory/10 px-6 py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-xs text-ivory/50 sm:flex-row">
          <p>
            © 2026 {settings.footer_copyright}
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/privacy" className="hover:text-ivory/85">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-ivory/85">
              Terms & Conditions
            </Link>
            <Link href="/cookies" className="hover:text-ivory/85">
              Cookie Policy
            </Link>
            <Link href="/admin" className="hover:text-gold/85">
              Studio Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
