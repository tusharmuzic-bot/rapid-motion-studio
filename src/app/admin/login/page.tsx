import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getCurrentAdmin, isBootstrapInitialized } from "@/lib/admin-auth";
import { BrandLogo } from "@/components/brand/brand-logo";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

async function AdminLoginContent() {
  const admin = await getCurrentAdmin();
  if (admin) {
    redirect("/admin");
  }

  const initialized = await isBootstrapInitialized();

  return <AdminLoginForm initialized={initialized} />;
}

export default function AdminLoginPage() {
  return (
    <main className="studio-ambient-bg relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="pointer-events-none absolute inset-0 subtle-grid opacity-40" />

      <div className="relative z-10 w-full max-w-md space-y-6">
        <div className="flex items-center justify-between">
          <BrandLogo />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-ivory/15 px-3.5 py-1.5 text-xs text-ivory/75 transition hover:border-gold/40 hover:text-ivory"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Public Site
          </Link>
        </div>

        <div className="glass-panel rounded-3xl p-7 sm:p-8">
          <div className="mb-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-gold/80">
              Private Studio Access
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold text-ivory">
              Rapid Motion Admin Console
            </h1>
            <p className="mt-1.5 text-xs leading-relaxed text-ivory/65">
              Sign in to manage portfolio films, video slots, before &amp; after
              comparisons, pricing tiers, and incoming client briefs.
            </p>
          </div>

          <Suspense
            fallback={
              <div className="flex items-center justify-center py-10 text-ivory/60">
                <Loader2 className="h-5 w-5 animate-spin text-gold" />
              </div>
            }
          >
            <AdminLoginContent />
          </Suspense>
        </div>

        <p className="text-center text-[11px] text-ivory/45">
          Protected by Supabase Authentication &amp; Postgres Row-Level Security
        </p>
      </div>
    </main>
  );
}
