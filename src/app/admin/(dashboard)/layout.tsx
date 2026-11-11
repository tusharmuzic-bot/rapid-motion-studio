import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { getSiteSettings } from "@/lib/data";
import { AdminShell } from "@/components/admin/admin-shell";

async function AdminDashboardGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [admin, settings] = await Promise.all([
    requireAdmin(),
    getSiteSettings(),
  ]);

  return (
    <AdminShell admin={admin} brandName={settings.brand_name}>
      {children}
    </AdminShell>
  );
}

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-obsidian text-ivory/70">
          <div className="flex items-center gap-3 rounded-2xl border border-gold/20 bg-charcoal/80 px-5 py-3.5">
            <Loader2 className="h-4 w-4 animate-spin text-gold" />
            <span className="font-mono text-xs uppercase tracking-widest">
              Verifying Studio Session...
            </span>
          </div>
        </div>
      }
    >
      <AdminDashboardGuard>{children}</AdminDashboardGuard>
    </Suspense>
  );
}
