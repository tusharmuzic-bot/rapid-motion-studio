"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  MailCheck,
} from "lucide-react";
import { adminInputClass, adminLabelClass } from "./admin-ui";

export function AdminSetupForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [setupToken, setSetupToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailConfirmMessage, setEmailConfirmMessage] = useState<string | null>(
    null
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/bootstrap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          password,
          setupToken: setupToken.trim(),
        }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(payload.error || "Unable to complete Super Admin setup.");
        setLoading(false);
        return;
      }

      if (payload.requiresEmailConfirm) {
        setEmailConfirmMessage(
          payload.message ||
            "Confirmation email sent. Open the link in your inbox to activate Super Admin access."
        );
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error during studio setup. Please retry.");
      setLoading(false);
    }
  }

  if (emailConfirmMessage) {
    return (
      <div className="space-y-5 rounded-2xl border border-emerald-400/30 bg-emerald-950/30 p-5 text-sm text-emerald-100">
        <div className="flex items-start gap-3">
          <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
          <div className="space-y-2">
            <h2 className="font-display text-base font-semibold text-ivory">
              Confirm Your Email to Activate Super Admin
            </h2>
            <p className="text-xs leading-relaxed text-emerald-100/80">
              {emailConfirmMessage}
            </p>
            <p className="text-xs text-ivory/65">
              Once confirmed, your confirmation link automatically promotes your
              account via our server RPC and signs you into `/admin`.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
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
        <label htmlFor="setup-name" className={adminLabelClass}>
          Executive Producer / Owner Name
        </label>
        <input
          id="setup-name"
          type="text"
          required
          minLength={2}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Creative Director Name"
          className={adminInputClass}
        />
      </div>

      <div>
        <label htmlFor="setup-email" className={adminLabelClass}>
          Owner Email
        </label>
        <input
          id="setup-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="owner@rapidmotion.studio"
          className={adminInputClass}
        />
      </div>

      <div>
        <label htmlFor="setup-password" className={adminLabelClass}>
          Password (min 10 characters)
        </label>
        <div className="relative">
          <input
            id="setup-password"
            type={showPassword ? "text" : "password"}
            required
            minLength={10}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Strong unique passphrase"
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

      <div>
        <label htmlFor="setup-token" className={adminLabelClass}>
          Server Setup Token (`ADMIN_SETUP_TOKEN`)
        </label>
        <div className="relative">
          <input
            id="setup-token"
            type={showToken ? "text" : "password"}
            required
            minLength={8}
            value={setupToken}
            onChange={(e) => setSetupToken(e.target.value)}
            placeholder="Paste token from server environment variables"
            className={`${adminInputClass} pr-11 font-mono`}
          />
          <button
            type="button"
            onClick={() => setShowToken((prev) => !prev)}
            aria-label={showToken ? "Hide token" : "Show token"}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-ivory/50 hover:text-ivory"
          >
            {showToken ? (
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
          <KeyRound className="h-4 w-4" />
        )}
        {loading ? "Initializing Studio..." : "Initialize Super Admin Account"}
      </button>

      <div className="flex items-start gap-2 rounded-xl border border-ivory/10 bg-charcoal/50 p-3 text-[11px] text-ivory/60">
        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
        <p>
          Once registered, this bootstrap page locks permanently in Postgres and
          additional team admins can only be provisioned by the Super Admin.
        </p>
      </div>
    </form>
  );
}
