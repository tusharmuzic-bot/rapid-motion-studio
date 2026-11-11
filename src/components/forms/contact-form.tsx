"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";

export function ContactForm() {
  const [fullName, setFullName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inquiryCode, setInquiryCode] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!consent) {
      setError("Please accept the privacy consent to send your message.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceType: "contact_message",
          fullName: fullName.trim(),
          brandName: brandName.trim(),
          email: email.trim(),
          projectDescription: message.trim(),
          consentAccepted: consent,
          honeypot,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not send message.");
      setInquiryCode(data.inquiryCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message.");
    } finally {
      setSubmitting(false);
    }
  };

  if (inquiryCode) {
    return (
      <div className="glass-panel rounded-3xl p-8 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-gold" />
        <h3 className="mt-4 font-display text-2xl font-bold text-ivory">
          Message Received
        </h3>
        <p className="mt-2 text-sm text-ivory/75">
          Your reference code is{" "}
          <span className="font-mono font-bold text-gold">{inquiryCode}</span>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="glass-panel space-y-5 rounded-3xl p-7 sm:p-9">
      <input
        type="text"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        className="hidden"
        aria-hidden="true"
      />
      <h2 className="font-display text-2xl font-bold text-ivory">
        Send a Studio Message
      </h2>
      {error && (
        <div className="flex items-start gap-2 rounded-2xl border border-red-400/40 bg-red-950/50 px-4 py-3 text-xs text-red-100">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-wider text-ivory/70">
            Full Name *
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-2xl border border-ivory/15 bg-obsidian/80 px-4 py-3 text-sm text-ivory focus:border-gold focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-wider text-ivory/70">
            Brand / Company
          </label>
          <input
            type="text"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            className="w-full rounded-2xl border border-ivory/15 bg-obsidian/80 px-4 py-3 text-sm text-ivory focus:border-gold focus:outline-none"
          />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-xs uppercase tracking-wider text-ivory/70">
          Email Address *
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-2xl border border-ivory/15 bg-obsidian/80 px-4 py-3 text-sm text-ivory focus:border-gold focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs uppercase tracking-wider text-ivory/70">
          Message *
        </label>
        <textarea
          rows={4}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us about your creative goals or ask any pre-production question..."
          className="w-full rounded-2xl border border-ivory/15 bg-obsidian/80 px-4 py-3 text-sm text-ivory placeholder:text-ivory/35 focus:border-gold focus:outline-none"
        />
      </div>

      <label className="flex items-start gap-3 text-xs text-ivory/75">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 h-4 w-4 accent-gold"
        />
        <span>
          I agree to the{" "}
          <Link href="/privacy" className="text-gold underline">
            Privacy Policy
          </Link>{" "}
          and consent to receiving a response.
        </span>
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center gap-2 rounded-full border border-gold/55 bg-gradient-to-r from-burgundy to-wine px-7 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-ivory disabled:opacity-60"
      >
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin text-gold" />
        ) : (
          <Send className="h-3.5 w-3.5 text-gold" />
        )}
        <span>{submitting ? "Sending..." : "Send Message"}</span>
      </button>
    </form>
  );
}
