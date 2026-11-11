import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Mail, MessageCircle, ShieldCheck } from "lucide-react";
import { ContactForm } from "@/components/forms/contact-form";
import { getSiteSettings } from "@/lib/data";
import { sanitizeExternalUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Connect with RAPID MOTION STUDIO to discuss commercial production, campaign packages, or creative partnerships.",
};

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const socials = Object.entries(settings.social_links || {})
    .map(([k, v]) => ({ name: k, url: sanitizeExternalUrl(v) }))
    .filter((s): s is { name: string; url: string } => Boolean(s.url));

  const cleanWa = settings.whatsapp_number?.replace(/[^\d+]/g, "") || "";

  return (
    <div className="py-12 sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-12">
        <div className="lg:col-span-5 space-y-6">
          <span className="glass-pill inline-block rounded-full px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.22em] text-gold">
            CONTACT THE STUDIO
          </span>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-ivory sm:text-5xl">
            LET&apos;S SHAPE YOUR NEXT CAMPAIGN.
          </h1>
          <p className="text-sm leading-relaxed text-ivory/75 sm:text-base">
            RAPID MOTION STUDIO collaborates digitally with brands, startups,
            and creative agencies worldwide. Reach out via the message form or
            submit a structured brief with reference uploads.
          </p>

          <div className="glass-card space-y-4 rounded-3xl p-6">
            <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-gold">
              Configured Studio Channels
            </h2>

            {settings.contact_email ? (
              <a
                href={`mailto:${settings.contact_email}`}
                className="flex items-center gap-3 text-sm text-ivory hover:text-gold"
              >
                <Mail className="h-4 w-4 text-gold" />
                <span>{settings.contact_email}</span>
              </a>
            ) : (
              <p className="flex items-center gap-2.5 text-xs text-ivory/60">
                <ShieldCheck className="h-4 w-4 text-gold/75" />
                <span>
                  Direct studio email can be configured anytime in Global
                  Settings.
                </span>
              </p>
            )}

            {cleanWa ? (
              <a
                href={`https://wa.me/${cleanWa.replace(/^\+/, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-ivory hover:text-gold"
              >
                <MessageCircle className="h-4 w-4 text-gold" />
                <span>WhatsApp: {settings.whatsapp_number}</span>
              </a>
            ) : null}

            {socials.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {socials.map((s) => (
                  <a
                    key={s.name}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-ivory/15 bg-ivory/[0.04] px-3.5 py-1.5 text-xs capitalize text-ivory/80 hover:border-gold/45 hover:text-gold"
                  >
                    {s.name}
                  </a>
                ))}
              </div>
            )}

            <div className="border-t border-ivory/10 pt-4">
              <Link
                href="/start-project"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-gold hover:underline"
              >
                <span>Need to upload files? Open Full Project Brief</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
