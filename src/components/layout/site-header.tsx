"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Menu, X, Sparkles, Clock, Globe2, Mail, Phone } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { cn } from "@/lib/utils";
import type { SiteSettings } from "@/lib/types";

const NAV_LINKS = [
  {
    num: "01",
    label: "Work",
    href: "/work",
    desc: "Commercial films, luxury product spots, and campaign portfolio",
    badge: "Selected",
  },
  {
    num: "02",
    label: "Services",
    href: "/services",
    desc: "AI-powered product commercials, 3D CGI, and brand campaigns",
    badge: "Capabilities",
  },
  {
    num: "03",
    label: "How We Create",
    href: "/how-it-works",
    desc: "From raw everyday product snapshots to high-impact cinema",
    badge: "Process",
  },
  {
    num: "04",
    label: "Studio",
    href: "/about",
    desc: "Our creative direction, engineering approach, and production vision",
    badge: "About Us",
  },
  {
    num: "05",
    label: "Contact",
    href: "/contact",
    desc: "Direct production desk and commercial commission briefs",
    badge: "Direct Line",
  },
];

export function SiteHeader({ settings }: { settings: SiteSettings }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-40 w-full transition-all duration-300",
          scrolled
            ? "border-b border-ivory/10 bg-[#0c090a]/92 backdrop-blur-xl py-3.5 shadow-[0_12px_36px_-15px_rgba(0,0,0,0.8)]"
            : "border-b border-white/[0.04] bg-gradient-to-b from-[#0d0b0c]/90 via-[#0d0b0c]/50 to-transparent py-4 sm:py-5"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 sm:px-8">
          <BrandLogo
            brandName={settings.brand_name}
            logoUrl={settings.logo_url}
          />

          {/* Editorial Humanized Navigation */}
          <nav
            className="hidden items-center gap-8 lg:flex"
            aria-label="Primary Navigation"
          >
            {NAV_LINKS.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative font-sans text-[12px] font-semibold tracking-[0.2em] uppercase transition-colors duration-200",
                    active
                      ? "text-ivory"
                      : "text-ivory/65 hover:text-ivory"
                  )}
                >
                  <span>{item.label}</span>
                  {active && (
                    <motion.span
                      layoutId="rms-nav-underline"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      className="absolute -bottom-1 left-0 h-[1.5px] w-full bg-gradient-to-r from-gold via-[#F35A2A] to-gold"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Clean Humanized Studio CTA */}
          <div className="hidden items-center gap-4 lg:flex">
            <Link
              href="/start-project"
              data-magnetic="true"
              className="group inline-flex items-center gap-2 rounded-full border border-ivory/25 bg-ivory/[0.06] hover:bg-ivory hover:text-charcoal px-5 py-2.5 text-[11px] font-bold tracking-[0.18em] uppercase text-ivory transition-all duration-300 hover:shadow-[0_0_24px_rgba(245,240,232,0.22)]"
            >
              <span>Start a Brief</span>
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          {/* Luxury Studio Navigation Trigger */}
          <button
            type="button"
            data-magnetic="true"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
            className="group relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-ivory/15 bg-ivory/[0.05] text-ivory transition-all duration-300 hover:border-gold/50 hover:bg-ivory/[0.1] lg:hidden"
          >
            <div className="flex flex-col items-end gap-1.5 transition-all">
              <span
                className={cn(
                  "h-0.5 rounded-full bg-ivory transition-all duration-300",
                  mobileOpen
                    ? "w-5 translate-y-2 rotate-45 bg-gold"
                    : "w-5 group-hover:w-6"
                )}
              />
              <span
                className={cn(
                  "h-0.5 w-3.5 rounded-full bg-[#F35A2A] transition-all duration-300",
                  mobileOpen ? "opacity-0" : "group-hover:w-5"
                )}
              />
              <span
                className={cn(
                  "h-0.5 rounded-full bg-ivory transition-all duration-300",
                  mobileOpen
                    ? "w-5 -translate-y-2 -rotate-45 bg-gold"
                    : "w-4 group-hover:w-6"
                )}
              />
            </div>
          </button>
        </div>
      </header>

      {/* Full-Screen Architectural Luxury Studio Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-[#0a0809]/98 backdrop-blur-3xl text-ivory lg:hidden"
          >
            {/* Atmospheric Ambient Glows */}
            <div className="pointer-events-none fixed -top-32 right-0 h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle,rgba(243,90,42,0.18),transparent_70%)] blur-3xl" />
            <div className="pointer-events-none fixed -bottom-32 left-0 h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle,rgba(75,16,27,0.35),transparent_70%)] blur-3xl" />

            {/* Top Modal Header Bar */}
            <div className="relative z-10 flex items-center justify-between border-b border-ivory/10 px-6 py-5 sm:px-8">
              <BrandLogo
                brandName={settings.brand_name}
                logoUrl={settings.logo_url}
              />

              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Studio Online
                </div>

                <button
                  type="button"
                  data-magnetic="true"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close navigation menu"
                  className="group inline-flex items-center gap-2 rounded-full border border-ivory/20 bg-ivory/[0.04] px-4 py-2 text-xs font-mono uppercase tracking-[0.18em] text-ivory/80 transition-all hover:border-gold hover:text-ivory"
                >
                  <span>Close</span>
                  <X className="h-4 w-4 transition-transform group-hover:rotate-90 duration-300" />
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="relative z-10 flex flex-1 flex-col justify-between px-6 py-8 sm:px-10">
              {/* Editorial Navigation Index */}
              <nav
                className="space-y-3"
                aria-label="Mobile Studio Navigation"
                style={{ perspective: "1000px" }}
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-gold/80 mb-4">
                  // STUDIO DIRECTORY
                </p>

                {NAV_LINKS.map((item, idx) => {
                  const active =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);

                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -24, rotateX: -12 }}
                      animate={{ opacity: 1, x: 0, rotateX: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{
                        delay: 0.05 * idx,
                        duration: 0.45,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "group relative flex items-center justify-between rounded-2xl border px-5 py-4 transition-all duration-300",
                          active
                            ? "border-gold/40 bg-gradient-to-r from-wine/80 via-burgundy/40 to-transparent shadow-[0_12px_30px_-10px_rgba(216,180,119,0.25)]"
                            : "border-ivory/[0.08] bg-ivory/[0.02] hover:border-ivory/25 hover:bg-ivory/[0.05]"
                        )}
                      >
                        <div className="flex items-center gap-4 sm:gap-6">
                          <span
                            className={cn(
                              "font-mono text-xs font-bold tracking-widest transition-colors",
                              active
                                ? "text-[#F35A2A]"
                                : "text-ivory/40 group-hover:text-gold"
                            )}
                          >
                            {item.num}
                          </span>
                          <div>
                            <div className="flex items-center gap-3">
                              <span
                                className={cn(
                                  "font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight transition-all group-hover:translate-x-1",
                                  active
                                    ? "text-ivory"
                                    : "text-ivory/85 group-hover:text-ivory"
                                )}
                              >
                                {item.label}
                              </span>
                              {item.badge && (
                                <span className="rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-gold">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 hidden text-xs text-ivory/55 sm:block">
                              {item.desc}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <ArrowUpRight
                            className={cn(
                              "h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1",
                              active ? "text-gold" : "text-ivory/40 group-hover:text-ivory"
                            )}
                          />
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              {/* Fast-Track Production CTAs & Studio Intelligence */}
              <div className="mt-8 border-t border-ivory/10 pt-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Link
                    href="/start-project"
                    onClick={() => setMobileOpen(false)}
                    className="group relative flex items-center justify-center gap-2.5 overflow-hidden rounded-2xl border border-gold/40 bg-gradient-to-r from-burgundy via-[#5b1422] to-burgundy p-4 text-xs font-bold uppercase tracking-[0.16em] text-ivory shadow-[0_14px_35px_-12px_rgba(243,90,42,0.35)] transition-all hover:scale-[1.01]"
                  >
                    <span>START A PROJECT BRIEF</span>
                    <ArrowUpRight className="h-4 w-4 text-gold transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>

                  <Link
                    href="/start-project?intent=quote"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center rounded-2xl border border-ivory/20 bg-ivory/[0.04] p-4 text-xs font-semibold uppercase tracking-[0.14em] text-ivory/90 transition-all hover:border-gold hover:text-ivory"
                  >
                    Request Custom Quote
                  </Link>
                </div>

                {/* Studio Global Telemetry & Direct Line */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.18em] text-ivory/55">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#F35A2A]" />
                    <span>PRODUCTION DESK: production@rapidmotionstudio.com</span>
                  </div>
                  <div>4K DCI • HDR10 • DOLBY VISION • 48kHz SPATIAL</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
