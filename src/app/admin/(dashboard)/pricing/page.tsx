"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, Sparkles } from "lucide-react";
import {
  AdminConfirmDialog,
  AdminModal,
  AdminPageHeader,
  adminInputClass,
  adminLabelClass,
  useAdminToast,
} from "@/components/admin/admin-ui";
import type { PricingPackage } from "@/lib/types";
import { cn, slugify } from "@/lib/utils";

const EMPTY_PKG = {
  name: "",
  slug: "",
  tagline: "",
  price_label: "Custom Quote",
  deliverables_summary: "",
  video_duration_summary: "",
  revisions_summary: "",
  delivery_timeline: "",
  includedText: "",
  benefitsText: "",
  cta_label: "Request Custom Quote",
  is_highlighted: false,
  is_published: true,
  display_order: 4,
};

export default function AdminPricingPage() {
  const { pushToast } = useAdminToast();
  const [packages, setPackages] = useState<PricingPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PricingPackage | null>(null);
  const [form, setForm] = useState(EMPTY_PKG);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PricingPackage | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pricing", { cache: "no-store" });
      const json = await res.json();
      setPackages(json.packages ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function openNew() {
    setEditing(null);
    setForm({ ...EMPTY_PKG, display_order: packages.length + 1 });
    setModalOpen(true);
  }

  function openEdit(pkg: PricingPackage) {
    setEditing(pkg);
    setForm({
      name: pkg.name,
      slug: pkg.slug,
      tagline: pkg.tagline,
      price_label: pkg.price_label,
      deliverables_summary: pkg.deliverables_summary,
      video_duration_summary: pkg.video_duration_summary,
      revisions_summary: pkg.revisions_summary,
      delivery_timeline: pkg.delivery_timeline,
      includedText: (pkg.included_services ?? []).join("\n"),
      benefitsText: (pkg.additional_benefits ?? []).join("\n"),
      cta_label: pkg.cta_label,
      is_highlighted: pkg.is_highlighted,
      is_published: pkg.is_published,
      display_order: pkg.display_order,
    });
    setModalOpen(true);
  }

  async function savePackage(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      slug: slugify(form.slug || form.name),
      tagline: form.tagline.trim(),
      price_label: form.price_label.trim(),
      deliverables_summary: form.deliverables_summary.trim(),
      video_duration_summary: form.video_duration_summary.trim(),
      revisions_summary: form.revisions_summary.trim(),
      delivery_timeline: form.delivery_timeline.trim(),
      included_services: form.includedText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      additional_benefits: form.benefitsText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      cta_label: form.cta_label.trim() || "Request Custom Quote",
      is_highlighted: form.is_highlighted,
      is_published: form.is_published,
      display_order: Number(form.display_order) || 0,
    };

    try {
      const url = editing
        ? `/api/admin/pricing/${editing.id}`
        : "/api/admin/pricing";
      const method = editing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        pushToast(json.error || "Failed to save package", "error");
        setSaving(false);
        return;
      }
      pushToast(editing ? "Pricing tier updated" : "Pricing tier created", "success");
      setModalOpen(false);
      await loadData();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/pricing/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        pushToast("Pricing package deleted", "success");
        setDeleteTarget(null);
        await loadData();
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <AdminPageHeader
        eyebrow="Module F • Production Investment"
        title="Pricing Packages & Tiers"
        description="Configure package deliverables, timelines, revision scopes, highlighted recommendations, and custom quote labels."
        actions={
          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-gold to-gold-warm px-4 py-2.5 text-xs font-semibold text-obsidian"
          >
            <Plus className="h-4 w-4" />
            Add Tier
          </button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-gold" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={cn(
                "glass-card flex flex-col justify-between rounded-3xl p-6",
                pkg.is_highlighted && "border-gold/45 bg-wine/30"
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold uppercase tracking-widest text-gold">
                    {pkg.name}
                  </span>
                  {pkg.is_highlighted ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gold/20 px-2.5 py-0.5 text-[10px] font-medium text-gold">
                      <Sparkles className="h-3 w-3" />
                      Recommended
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 font-display text-xl font-bold text-ivory">
                  {pkg.price_label}
                </p>
                <p className="mt-1 text-xs text-ivory/65">{pkg.tagline}</p>

                <dl className="mt-4 space-y-2 border-t border-ivory/10 pt-4 text-xs">
                  <div>
                    <dt className="text-ivory/45">Deliverables</dt>
                    <dd className="text-ivory/85">{pkg.deliverables_summary}</dd>
                  </div>
                  <div>
                    <dt className="text-ivory/45">Timeline</dt>
                    <dd className="text-ivory/85">{pkg.delivery_timeline}</dd>
                  </div>
                  <div>
                    <dt className="text-ivory/45">Revisions</dt>
                    <dd className="text-ivory/85">{pkg.revisions_summary}</dd>
                  </div>
                </dl>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-ivory/10 pt-3">
                <span className="text-[11px] text-ivory/55">
                  {pkg.is_published ? "Published" : "Hidden"}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(pkg)}
                    className="inline-flex items-center gap-1 rounded-lg border border-ivory/15 px-2.5 py-1 text-xs text-ivory/80 hover:border-gold/40"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(pkg)}
                    className="inline-flex items-center gap-1 rounded-lg border border-rose-400/25 px-2.5 py-1 text-xs text-rose-200 hover:bg-rose-500/15"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Edit Tier: ${editing.name}` : "Create Pricing Package"}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={savePackage} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={adminLabelClass}>Tier Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    name: e.target.value,
                    slug: editing ? f.slug : slugify(e.target.value),
                  }))
                }
                className={adminInputClass}
              />
            </div>
            <div>
              <label className={adminLabelClass}>Price / Quote Label *</label>
              <input
                type="text"
                required
                value={form.price_label}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price_label: e.target.value }))
                }
                className={adminInputClass}
              />
            </div>
            <div>
              <label className={adminLabelClass}>CTA Button Text</label>
              <input
                type="text"
                value={form.cta_label}
                onChange={(e) =>
                  setForm((f) => ({ ...f, cta_label: e.target.value }))
                }
                className={adminInputClass}
              />
            </div>
          </div>

          <div>
            <label className={adminLabelClass}>Tagline</label>
            <input
              type="text"
              value={form.tagline}
              onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
              className={adminInputClass}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={adminLabelClass}>Deliverables Summary</label>
              <input
                type="text"
                value={form.deliverables_summary}
                onChange={(e) =>
                  setForm((f) => ({ ...f, deliverables_summary: e.target.value }))
                }
                className={adminInputClass}
              />
            </div>
            <div>
              <label className={adminLabelClass}>Video Duration Summary</label>
              <input
                type="text"
                value={form.video_duration_summary}
                onChange={(e) =>
                  setForm((f) => ({ ...f, video_duration_summary: e.target.value }))
                }
                className={adminInputClass}
              />
            </div>
            <div>
              <label className={adminLabelClass}>Revisions Summary</label>
              <input
                type="text"
                value={form.revisions_summary}
                onChange={(e) =>
                  setForm((f) => ({ ...f, revisions_summary: e.target.value }))
                }
                className={adminInputClass}
              />
            </div>
            <div>
              <label className={adminLabelClass}>Delivery Timeline</label>
              <input
                type="text"
                value={form.delivery_timeline}
                onChange={(e) =>
                  setForm((f) => ({ ...f, delivery_timeline: e.target.value }))
                }
                className={adminInputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={adminLabelClass}>Included Services (one per line)</label>
              <textarea
                rows={4}
                value={form.includedText}
                onChange={(e) =>
                  setForm((f) => ({ ...f, includedText: e.target.value }))
                }
                className={adminInputClass}
              />
            </div>
            <div>
              <label className={adminLabelClass}>Additional Benefits (one per line)</label>
              <textarea
                rows={4}
                value={form.benefitsText}
                onChange={(e) =>
                  setForm((f) => ({ ...f, benefitsText: e.target.value }))
                }
                className={adminInputClass}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 text-xs text-ivory/85">
              <input
                type="checkbox"
                checked={form.is_highlighted}
                onChange={(e) =>
                  setForm((f) => ({ ...f, is_highlighted: e.target.checked }))
                }
                className="h-4 w-4 accent-gold"
              />
              Highlight Recommended Card
            </label>
            <label className="flex items-center gap-2 text-xs text-ivory/85">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) =>
                  setForm((f) => ({ ...f, is_published: e.target.checked }))
                }
                className="h-4 w-4 accent-gold"
              />
              Published
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t border-ivory/10 pt-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-xl border border-ivory/15 px-4 py-2 text-sm text-ivory/75"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-gradient-to-r from-gold to-gold-warm px-5 py-2 text-sm font-semibold text-obsidian"
            >
              {saving ? "Saving..." : "Save Package"}
            </button>
          </div>
        </form>
      </AdminModal>

      <AdminConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Pricing Tier?"
        message={`Remove "${deleteTarget?.name}" from the Pricing section?`}
        busy={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
