"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import { CheckCircle2, AlertTriangle, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastKind = "success" | "error" | "info";

interface ToastItem {
  id: string;
  kind: ToastKind;
  message: string;
}

interface ToastContextValue {
  pushToast: (message: string, kind?: ToastKind) => void;
}

const AdminToastContext = createContext<ToastContextValue | null>(null);

export function AdminToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const pushToast = useCallback((message: string, kind: ToastKind = "info") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, kind, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 4500);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return (
    <AdminToastContext.Provider value={{ pushToast }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-5 right-5 z-[90] flex w-full max-w-sm flex-col gap-2.5 px-4 sm:px-0"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-xl transition-all",
              toast.kind === "success" &&
                "border-emerald-400/30 bg-[#121916]/95 text-emerald-100",
              toast.kind === "error" &&
                "border-rose-400/35 bg-[#1f1215]/95 text-rose-100",
              toast.kind === "info" &&
                "border-gold/30 bg-[#171315]/95 text-ivory"
            )}
          >
            {toast.kind === "success" ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
            ) : toast.kind === "error" ? (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
            )}
            <p className="flex-1 leading-snug">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
              className="rounded-lg p-1 text-ivory/50 hover:bg-white/10 hover:text-ivory"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </AdminToastContext.Provider>
  );
}

export function useAdminToast() {
  const ctx = useContext(AdminToastContext);
  if (!ctx) {
    throw new Error("useAdminToast must be used within AdminToastProvider");
  }
  return ctx;
}

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-ivory/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-gold/80">
          {eyebrow}
        </p>
        <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-ivory sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm text-ivory/65">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  );
}

export function AdminModal({
  open,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "max-w-3xl",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn(
          "glass-panel relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-3xl border border-gold/20 bg-obsidian/95 shadow-2xl",
          maxWidth
        )}
      >
        <div className="flex items-start justify-between border-b border-ivory/10 px-6 py-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-ivory">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-0.5 text-xs text-ivory/60">{subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-xl border border-ivory/10 p-2 text-ivory/65 transition hover:border-gold/30 hover:text-ivory"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

export function AdminConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <AdminModal
      open={open}
      onClose={busy ? () => {} : onCancel}
      title={title}
      maxWidth="max-w-md"
    >
      <p className="text-sm leading-relaxed text-ivory/75">{message}</p>
      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="rounded-xl border border-ivory/15 px-4 py-2 text-sm text-ivory/75 transition hover:border-ivory/35 hover:text-ivory disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-xl border border-rose-400/40 bg-rose-500/20 px-4 py-2 text-sm font-medium text-rose-100 transition hover:bg-rose-500/35 disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {confirmLabel}
        </button>
      </div>
    </AdminModal>
  );
}

export const adminInputClass =
  "w-full rounded-xl border border-ivory/15 bg-charcoal/80 px-3.5 py-2.5 text-sm text-ivory placeholder:text-ivory/35 focus:border-gold/60 focus:outline-none focus:ring-1 focus:ring-gold/30 transition";

export const adminLabelClass =
  "mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-ivory/70";
