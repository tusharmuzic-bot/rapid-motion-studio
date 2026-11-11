import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getCurrentAdmin, isBootstrapInitialized } from "@/lib/admin-auth";
import { VeloraLogo } from "@/components/brand/velora-logo";
import { AdminSetupForm } from "@/components/admin/admin-setup-form";

async function AdminSetupGuard() {
  const admin = await getCurrentAdmin();
  if (admin) {
    redirect("/admin");
  }

  const initialized = await isBootstrapInitialized();
  if (initialized) {
    redirect("/admin/login");
  }

  return <AdminSetupForm />;
}

export default function AdminSetupPage() {
  return (
    <main className="velora-ambient-bg relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="pointer-events-none absolute inset-0 subtle-grid opacity-40" />

      <div className="relative z-10 w-full max-w-lg space-y-6">
        <div className="flex items-center justify-between">
          <VeloraLogo />
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1.5 rounded-full border border-ivory/15 px-3.5 py-1.5 text-xs text-ivory/75 transition hover:border-gold/40 hover:text-ivory"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Admin Login
          </Link>
        </div>

        <div className="glass-panel rounded-3xl p-7 sm:p-8">
          <div className="mb-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-gold/80">
              One-Time Owner Bootstrap
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold text-ivory">
              Claim Rapid Motion Super Admin
            </h1>
            <p className="mt-1.5 text-xs leading-relaxed text-ivory/65">
              Create the primary studio owner account using the server-side{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[11px] text-gold">
                ADMIN_SETUP_TOKEN
              </code>{" "}
              from your deployment environment variables.
            </p>
          </div>

          <Suspense
            fallback={
              <div className="flex items-center justify-center py-10 text-ivory/60">
                <Loader2 className="h-5 w-5 animate-spin text-gold" />
              </div>
            }
          >
            <AdminSetupGuard />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
