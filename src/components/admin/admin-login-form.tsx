"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, LockKeyhole, ShieldCheck, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { adminInputClass, adminLabelClass } from "./admin-ui";

export function AdminLoginForm({ initialized }: { initialized: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: signInErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInErr || !data.user) {
        setError(signInErr?.message || "Invalid studio credentials.");
        setLoading(false);
        return;
      }

      const sessionRes = await fetch("/api/admin/session", {
        method: "POST",
      });

      if (!sessionRes.ok) {
        await supabase.auth.signOut();
        const payload = await sessionRes.json().catch(() => ({}));
        setError(
          payload.error ||
            "This account does not have active Studio Admin permissions."
        );
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error while signing in. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {!initialized ? (
        <div className="rounded-2xl border border-gold/35 bg-wine/35 p-4 text-sm text-ivory/90">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
            <div className="space-y-2">
              <p className="font-medium text-ivory">
                First-Time Studio Setup Required
              </p>
              <p className="text-xs leading-relaxed text-ivory/75">
                No Super Admin account has been registered yet. Complete the
                one-time setup flow using your server Setup Token to activate
                the Studio Control Panel.
              </p>
              <Link
                href="/admin/setup"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold hover:underline"
              >
                Register Initial Super Admin
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? (
          <div
            role="alert"
            className="rounded-xl border border-rose-400/40 bg-rose-500/15 px-4 py-3 text-sm text-rose-100"
          >
            {error}
          </div>
        ) : null}

        <div>
          <label htmlFor="admin-email" className={adminLabelClass}>
            Studio Email
          </label>
          <input
            id="admin-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="director@yourstudio.com"
            className={adminInputClass}
          />
        </div>

        <div>
          <label htmlFor="admin-password" className={adminLabelClass}>
            Password
          </label>
          <div className="relative">
            <input
              id="admin-password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className={`${adminInputClass} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-ivory/50 hover:text-ivory"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold to-gold-warm px-5 py-3 text-sm font-semibold text-obsidian shadow-[0_12px_30px_-10px_rgba(216,180,119,0.55)] transition hover:brightness-105 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LockKeyhole className="h-4 w-4" />
          )}
          {loading ? "Authenticating..." : "Sign In to Studio Control"}
        </button>
      </form>
    </div>
  );
}
