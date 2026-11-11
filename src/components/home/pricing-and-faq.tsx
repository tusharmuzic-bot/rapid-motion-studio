"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Check, ChevronDown, Quote } from "lucide-react";
import type { FaqItem, PricingPackage, TestimonialItem } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PricingAndFaqProps {
  packages: PricingPackage[];
  faqs: FaqItem[];
  testimonials: TestimonialItem[];
}

export function PricingAndFaq({
  packages,
  faqs,
  testimonials,
}: PricingAndFaqProps) {
  const [openFaqId, setOpenFaqId] = useState<string | null>(
    faqs[0]?.id ?? null
  );

  return (
    <>
      {/* Configurable Editorial Production Packages — Warm Ivory Surface */}
      <section className="editorial-ivory relative border-y border-charcoal/10 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 border-b border-charcoal/15 pb-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.26em] text-burgundy">
                PRODUCTION INVESTMENT • CONFIGURABLE PACKAGES
              </span>
              <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-charcoal sm:text-5xl">
                TAILORED TO YOUR CAMPAIGN SCOPE.
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-charcoal/75 sm:text-base lg:col-span-5">
              Pricing adapts to deliverable volume, video duration, and creative
              complexity. Packages below reflect configurable baselines or custom
              quotations set directly by the studio.
            </p>
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-3">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={cn(
                  "flex flex-col justify-between rounded-3xl border p-8 transition-all duration-300",
                  pkg.is_highlighted
                    ? "border-burgundy bg-charcoal text-ivory shadow-[0_28px_70px_-28px_rgba(41,11,18,0.45)]"
                    : "border-charcoal/15 bg-white/60 text-charcoal hover:border-burgundy/40"
                )}
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={cn(
                        "font-mono text-[11px] font-bold uppercase tracking-[0.2em]",
                        pkg.is_highlighted ? "text-gold" : "text-burgundy"
                      )}
                    >
                      {pkg.name}
                    </span>
                    {pkg.is_highlighted && (
                      <span className="rounded-full border border-gold/45 bg-wine px-3 py-0.5 font-mono text-[10px] uppercase tracking-wider text-gold">
                        Recommended
                      </span>
                    )}
                  </div>

                  <p className="mt-5 font-display text-3xl font-extrabold tracking-tight">
                    {pkg.price_label || "Custom Quote"}
                  </p>
                  <p
                    className={cn(
                      "mt-2 text-sm leading-relaxed",
                      pkg.is_highlighted ? "text-ivory/75" : "text-charcoal/70"
                    )}
                  >
                    {pkg.tagline}
                  </p>

                  <dl
                    className={cn(
                      "mt-6 space-y-2.5 border-y py-4 text-xs",
                      pkg.is_highlighted
                        ? "border-ivory/15"
                        : "border-charcoal/15"
                    )}
                  >
                    <div className="flex justify-between gap-2">
                      <dt
                        className={
                          pkg.is_highlighted ? "text-ivory/55" : "text-charcoal/60"
                        }
                      >
                        Deliverables
                      </dt>
                      <dd className="text-right font-medium">
                        {pkg.deliverables_summary}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt
                        className={
                          pkg.is_highlighted ? "text-ivory/55" : "text-charcoal/60"
                        }
                      >
                        Duration
                      </dt>
                      <dd className="text-right font-medium">
                        {pkg.video_duration_summary}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt
                        className={
                          pkg.is_highlighted ? "text-ivory/55" : "text-charcoal/60"
                        }
                      >
                        Revisions
                      </dt>
                      <dd className="text-right font-medium">
                        {pkg.revisions_summary}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt
                        className={
                          pkg.is_highlighted ? "text-ivory/55" : "text-charcoal/60"
                        }
                      >
                        Delivery Timeline
                      </dt>
                      <dd
                        className={cn(
                          "text-right font-semibold",
                          pkg.is_highlighted ? "text-gold" : "text-burgundy"
                        )}
                      >
                        {pkg.delivery_timeline}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-6 space-y-2.5">
                    <p
                      className={cn(
                        "font-mono text-[10px] uppercase tracking-[0.2em]",
                        pkg.is_highlighted ? "text-gold" : "text-burgundy"
                      )}
                    >
                      Included Scope
                    </p>
                    <ul className="space-y-2">
                      {(pkg.included_services ?? []).map((svc) => (
                        <li
                          key={svc}
                          className={cn(
                            "flex items-start gap-2.5 text-xs sm:text-sm",
                            pkg.is_highlighted ? "text-ivory/85" : "text-charcoal/80"
                          )}
                        >
                          <Check
                            className={cn(
                              "mt-0.5 h-4 w-4 shrink-0",
                              pkg.is_highlighted ? "text-gold" : "text-burgundy"
                            )}
                          />
                          <span>{svc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {(pkg.additional_benefits ?? []).length > 0 && (
                    <div
                      className={cn(
                        "mt-5 space-y-1.5 border-t pt-4 text-xs",
                        pkg.is_highlighted
                          ? "border-ivory/10 text-ivory/65"
                          : "border-charcoal/10 text-charcoal/65"
                      )}
                    >
                      {(pkg.additional_benefits ?? []).map((b) => (
                        <p key={b}>+ {b}</p>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-8">
                  <Link
                    href={`/start-project?package=${encodeURIComponent(pkg.name)}`}
                    className={cn(
                      "inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-xs font-bold uppercase tracking-[0.16em] transition-all",
                      pkg.is_highlighted
                        ? "bg-ivory text-charcoal hover:bg-gold"
                        : "border border-charcoal bg-charcoal text-ivory hover:bg-burgundy hover:border-burgundy"
                    )}
                  >
                    <span>{pkg.cta_label || "Request Custom Quote"}</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Genuine Admin-Approved Testimonials (only rendered if real verified rows exist) */}
      {testimonials.length > 0 && (
        <section className="relative bg-obsidian py-20 text-ivory">
          <div className="mx-auto max-w-7xl px-6">
            <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-gold">
              CLIENT PERSPECTIVES
            </span>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ivory sm:text-4xl">
              TRUSTED BY CREATIVE TEAMS.
            </h2>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {testimonials.map((t) => (
                <blockquote
                  key={t.id}
                  className="flex flex-col justify-between rounded-3xl border border-ivory/10 bg-[#181415] p-6"
                >
                  <div>
                    <Quote className="h-6 w-6 text-gold/70" />
                    <p className="mt-4 text-sm leading-relaxed text-ivory/85">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                  </div>
                  <footer className="mt-6 border-t border-ivory/10 pt-4">
                    <p className="font-display text-sm font-bold text-ivory">
                      {t.client_name}
                    </p>
                    <p className="text-xs text-ivory/60">
                      {t.role_and_company}
                      {t.project_type ? ` • ${t.project_type}` : ""}
                    </p>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Accordion */}
      <section className="relative bg-charcoal py-24 text-ivory sm:py-32">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center">
            <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-gold">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ivory sm:text-5xl">
              CLEAR ANSWERS BEFORE PRODUCTION.
            </h2>
          </div>

          <div className="mt-12 divide-y divide-ivory/10 border-y border-ivory/10">
            {faqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div key={faq.id} className="transition-colors">
                  <button
                    type="button"
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 py-6 text-left"
                  >
                    <span className="font-display text-base font-semibold text-ivory sm:text-lg">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 text-gold transition-transform duration-300",
                        isOpen && "rotate-180"
                      )}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="pb-6 text-sm leading-relaxed text-ivory/72">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
