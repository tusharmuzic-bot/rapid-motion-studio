"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Film,
  SplitSquareHorizontal,
  FolderKanban,
  Briefcase,
  Layers3,
  Inbox,
  FileText,
  Quote,
  Settings,
  Menu,
  X,
  ExternalLink,
  LogOut,
  Shield,
} from "lucide-react";
import type { AdminUser } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AdminToastProvider } from "./admin-ui";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/portfolio", label: "Portfolio", icon: Film },
  {
    href: "/admin/comparisons",
    label: "Before & After",
    icon: SplitSquareHorizontal,
  },
  { href: "/admin/media", label: "Videos & Images", icon: FolderKanban },
  { href: "/admin/services", label: "Services", icon: Briefcase },
  { href: "/admin/pricing", label: "Pricing Tiers", icon: Layers3 },
  { href: "/admin/inquiries", label: "Client Inquiries", icon: Inbox },
  { href: "/admin/content", label: "Content, FAQ & Legal", icon: FileText },
  { href: "/admin/testimonials", label: "Testimonials", icon: Quote },
  { href: "/admin/settings", label: "Settings & Admins", icon: Settings },
];

export function AdminShell({
  admin,
  brandName = "RAPID MOTION STUDIO",
  children,
}: {
  admin: AdminUser;
  brandName?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  }

  function renderNavLinks(onNavigate?: () => void) {
    return (
      <nav className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition",
                active
                  ? "border border-gold/30 bg-gradient-to-r from-wine/65 to-burgundy/40 text-gold shadow-[inset_0_1px_0_rgba(245,240,232,0.14)]"
                  : "border border-transparent text-ivory/70 hover:border-ivory/10 hover:bg-white/[0.04] hover:text-ivory"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  active ? "text-gold" : "text-ivory/50"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <AdminToastProvider>
      <div className="flex min-h-screen bg-obsidian text-ivory">
        {/* Desktop Sidebar */}
        <aside className="hidden w-68 shrink-0 flex-col border-r border-ivory/10 bg-[#110e0f] px-4 py-6 lg:flex">
          <div className="mb-8 px-2">
            <Link href="/admin" className="block">
              <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-gold">
                Studio Control
              </span>
              <p className="mt-1 truncate font-display text-base font-bold tracking-tight text-ivory">
                {brandName}
              </p>
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto pr-1">{renderNavLinks()}</div>

          <div className="mt-6 space-y-3 border-t border-ivory/10 pt-5">
            <div className="rounded-2xl border border-ivory/10 bg-charcoal/80 p-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-wine/60 font-mono text-xs font-semibold text-gold">
                  {(admin.full_name || admin.email).slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-ivory">
                    {admin.full_name || admin.email}
                  </p>
                  <div className="mt-0.5 flex items-center gap-1 text-[10px] uppercase tracking-wider text-gold/80">
                    <Shield className="h-3 w-3" />
                    <span>{admin.role.replace("_", " ")}</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-ivory/15 px-3 py-2 text-xs font-medium text-ivory/75 transition hover:border-rose-400/35 hover:bg-rose-500/10 hover:text-rose-100 disabled:opacity-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              {signingOut ? "Signing out..." : "Sign Out"}
            </button>
          </div>
        </aside>

        {/* Mobile Drawer */}
        {drawerOpen ? (
          <div className="fixed inset-0 z-[75] flex lg:hidden">
            <div
              className="fixed inset-0 bg-black/75 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
            />
            <div className="relative z-10 flex w-72 max-w-[85vw] flex-col border-r border-ivory/15 bg-[#120f10] p-5">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-gold">
                    Studio Control
                  </span>
                  <p className="font-display text-sm font-bold text-ivory">
                    {brandName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close navigation menu"
                  className="rounded-lg border border-ivory/15 p-1.5 text-ivory/70"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {renderNavLinks(() => setDrawerOpen(false))}
              </div>
              <div className="mt-4 border-t border-ivory/10 pt-4">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-ivory/15 px-3 py-2.5 text-xs text-ivory/80"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Main workspace */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-ivory/10 bg-obsidian/85 px-4 py-3.5 backdrop-blur-xl sm:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                aria-label="Open admin menu"
                className="rounded-xl border border-ivory/15 p-2 text-ivory/80 hover:border-gold/30 lg:hidden"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ivory/65">
                  Production Console
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1.5 text-xs font-medium text-gold transition hover:bg-gold/20"
              >
                <span>View Live Site</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </header>

          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-8">
            {children}
          </main>
        </div>
      </div>
    </AdminToastProvider>
  );
}
