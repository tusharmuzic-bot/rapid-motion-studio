"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { cn } from "@/lib/utils";
import type { SiteSettings } from "@/lib/types";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Our Work", href: "/work" },
  { label: "Services", href: "/services" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
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
      {settings.announcement_enabled && settings.announcement_text && (
        <div className="relative z-50 border-b border-ivory/10 bg-[#1c0b10] px-4 py-2 text-center text-[11px] font-medium tracking-[0.12em] text-ivory/90 uppercase">
          <span className="inline-flex items-center gap-2.5">
            <span
              className="h-1.5 w-1.5 rounded-full bg-gold"
              aria-hidden="true"
            />
            {settings.announcement_text}
          </span>
        </div>
      )}

      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-500",
          scrolled ? "pt-3 px-3 sm:px-6" : "pt-4 px-3 sm:px-6"
        )}
      >
        <div
          className={cn(
            "mx-auto flex max-w-7xl items-center justify-between rounded-2xl transition-all duration-500",
            scrolled
              ? "glass-nav px-4 py-2.5 sm:px-6"
              : "border border-ivory/10 bg-charcoal/65 backdrop-blur-xl px-4 py-3 sm:px-6 shadow-[0_12px_40px_-20px_rgba(0,0,0,0.75)]"
          )}
        >
          <BrandLogo
            brandName={settings.brand_name}
            logoUrl={settings.logo_url}
          />

          <nav
            className="hidden items-center gap-1 lg:flex"
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
                    "relative rounded-full px-3.5 py-2 text-xs font-medium tracking-[0.06em] transition-colors duration-200",
                    active
                      ? "text-ivory"
                      : "text-ivory/65 hover:text-ivory"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="rms-nav-pill"
                      transition={{ type: "spring", stiffness: 360, damping: 32 }}
                      className="absolute inset-0 rounded-full border border-gold/25 bg-ivory/[0.08]"
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2.5 lg:flex">
            <Link
              href="/start-project?intent=quote"
              className="rounded-full border border-ivory/15 px-4 py-2 text-xs font-medium tracking-[0.06em] text-ivory/80 transition-colors hover:border-ivory/35 hover:text-ivory"
            >
              Get a Quote
            </Link>
            <Link
              href="/start-project"
              className="group inline-flex items-center gap-1.5 rounded-full bg-ivory px-4 py-2 text-xs font-semibold tracking-[0.08em] text-charcoal transition-all duration-300 hover:bg-gold"
            >
              <span>Start a Project</span>
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-ivory/15 bg-ivory/[0.05] text-ivory transition-colors hover:border-gold/40 lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex flex-col bg-charcoal/95 backdrop-blur-2xl lg:hidden"
          >
            <div className="flex items-center justify-between border-b border-ivory/10 px-5 py-4">
              <BrandLogo
                brandName={settings.brand_name}
                logoUrl={settings.logo_url}
              />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation menu"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-ivory/15 bg-ivory/5 text-ivory"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav
              className="flex flex-1 flex-col justify-center gap-2 px-6 py-8"
              aria-label="Mobile Navigation"
            >
              {NAV_LINKS.map((item, idx) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 * idx }}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between rounded-2xl border px-5 py-3.5 font-display text-xl font-semibold tracking-tight transition-all",
                        active
                          ? "border-gold/40 bg-wine/70 text-ivory"
                          : "border-transparent bg-ivory/[0.02] text-ivory/75 hover:border-ivory/10 hover:text-ivory"
                      )}
                    >
                      <span>{item.label}</span>
                      <ArrowUpRight className="h-4 w-4 text-gold/80" />
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            <div className="border-t border-ivory/10 p-6 space-y-3">
              <Link
                href="/start-project"
                className="flex w-full items-center justify-center gap-2 rounded-full border border-gold/50 bg-gradient-to-r from-burgundy via-[#5e1524] to-burgundy py-3.5 text-sm font-semibold tracking-[0.08em] text-ivory shadow-lg"
              >
                <span>START A PROJECT</span>
                <ArrowUpRight className="h-4 w-4 text-gold" />
              </Link>
              <Link
                href="/start-project?intent=quote"
                className="flex w-full items-center justify-center rounded-full border border-ivory/20 bg-ivory/[0.04] py-3 text-sm font-medium text-ivory/85"
              >
                Get a Custom Quote
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
