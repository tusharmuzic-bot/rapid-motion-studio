"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, Eye, EyeOff } from "lucide-react";
import {
  AdminConfirmDialog,
  AdminModal,
  AdminPageHeader,
  adminInputClass,
  adminLabelClass,
  useAdminToast,
} from "@/components/admin/admin-ui";
import { MediaUrlOrUploadField } from "@/components/admin/media-upload-control";
import type { ServiceItem } from "@/lib/types";
import { cn, slugify } from "@/lib/utils";

const EMPTY_SERVICE = {
  number_label: "09",
  title: "",
  slug: "",
  short_description: "",
  business_value: "",
  creative_approach: "",
  deliverablesText: "",
  idealForText: "",
  hero_image_url: "",
  video_url: "",
  cta_label: "Start This Service",
  display_order: 9,
  is_published: true,
};

export default function AdminServicesPage() {
  const { pushToast } = useAdminToast();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceItem | null>(null);
  const [form, setForm] = useState(EMPTY_SERVICE);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ServiceItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/services", { cache: "no-store" });
      const json = await res.json();
      setServices(json.services ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function openNew() {
    setEditing(null);
    const nextNum = String(services.length + 1).padStart(2, "0");
    setForm({
      ...EMPTY_SERVICE,
      number_label: nextNum,
      display_order: services.length + 1,
    });
    setModalOpen(true);
  }

  function openEdit(item: ServiceItem) {
    setEditing(item);
    setForm({
      number_label: item.number_label,
      title: item.title,
      slug: item.slug,
      short_description: item.short_description,
      business_value: item.business_value,
      creative_approach: item.creative_approach,
      deliverablesText: (item.deliverables ?? []).join("\n"),
      idealForText: (item.ideal_for ?? []).join("\n"),
      hero_image_url: item.hero_image_url,
      video_url: item.video_url,
      cta_label: item.cta_label,
      display_order: item.display_order,
      is_published: item.is_published,
    });
    setModalOpen(true);
  }

  async function saveService(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      number_label: form.number_label.trim(),
      title: form.title.trim(),
      slug: slugify(form.slug || form.title),
      short_description: form.short_description.trim(),
      business_value: form.business_value.trim(),
      creative_approach: form.creative_approach.trim(),
      deliverables: form.deliverablesText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      ideal_for: form.idealForText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      hero_image_url: form.hero_image_url.trim(),
      video_url: form.video_url.trim(),
      cta_label: form.cta_label.trim() || "Request Proposal",
      display_order: Number(form.display_order) || 0,
      is_published: form.is_published,
    };

    try {
      const url = editing
        ? `/api/admin/services/${editing.id}`
        : "/api/admin/services";
      const method = editing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        pushToast(json.error || "Could not save service", "error");
        setSaving(false);
        return;
      }
      pushToast(editing ? "Service updated" : "Service created", "success");
      setModalOpen(false);
      await loadData();
    } finally {
      setSaving(false);
    }
  }

  async function togglePublished(item: ServiceItem) {
    const res = await fetch(`/api/admin/services/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: !item.is_published }),
    });
    if (res.ok) {
      setServices((prev) =>
        prev.map((s) =>
          s.id === item.id ? { ...s, is_published: !s.is_published } : s
        )
      );
      pushToast("Service visibility updated", "success");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/services/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        pushToast("Service deleted", "success");
        setDeleteTarget(null);
        await loadData();
      } else {
        const j = await res.json();
        pushToast(j.error || "Delete failed", "error");
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <AdminPageHeader
        eyebrow="Module E • Capabilities"
        title="Creative Services"
        description="Edit service descriptions, deliverables, visual previews, and ordering across both homepage cards and dedicated service detail pages."
        actions={
          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-gold to-gold-warm px-4 py-2.5 text-xs font-semibold text-obsidian"
          >
            <Plus className="h-4 w-4" />
            Add Service
          </button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-gold" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {services.map((svc) => (
            <div key={svc.id} className="glass-card rounded-3xl p-5">
              <div className="flex items-start gap-4">
                {svc.hero_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={svc.hero_image_url}
                    alt={svc.title}
                    className="h-20 w-28 shrink-0 rounded-2xl border border-ivory/10 object-cover"
                  />
                ) : null}
                <div className="min-w-0 flex-1">
                  <span className="font-mono text-xs text-gold">
                    Service {svc.number_label}
                  </span>
                  <h3 className="mt-0.5 truncate font-display text-base font-semibold text-ivory">
                    {svc.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs text-ivory/65">
                    {svc.short_description}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-ivory/10 pt-3">
                <button
                  type="button"
                  onClick={() => togglePublished(svc)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px]",
                    svc.is_published
                      ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                      : "border-ivory/15 text-ivory/55"
                  )}
                >
                  {svc.is_published ? (
                    <Eye className="h-3 w-3" />
                  ) : (
                    <EyeOff className="h-3 w-3" />
                  )}
                  {svc.is_published ? "Published" : "Hidden"}
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(svc)}
                    className="inline-flex items-center gap-1 rounded-lg border border-ivory/15 px-2.5 py-1 text-xs text-ivory/80 hover:border-gold/40"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(svc)}
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
        title={editing ? `Edit: ${editing.title}` : "Add Creative Service"}
        maxWidth="max-w-4xl"
      >
        <form onSubmit={saveService} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={adminLabelClass}>Number Badge</label>
              <input
                type="text"
                required
                value={form.number_label}
                onChange={(e) =>
                  setForm((f) => ({ ...f, number_label: e.target.value }))
                }
                className={`${adminInputClass} font-mono`}
              />
            </div>
            <div>
              <label className={adminLabelClass}>Service Title *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    title: e.target.value,
                    slug: editing ? f.slug : slugify(e.target.value),
                  }))
                }
                className={adminInputClass}
              />
            </div>
            <div>
              <label className={adminLabelClass}>Slug *</label>
              <input
                type="text"
                required
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                className={`${adminInputClass} font-mono`}
              />
            </div>
          </div>

          <div>
            <label className={adminLabelClass}>Short Description *</label>
            <textarea
              rows={2}
              required
              value={form.short_description}
              onChange={(e) =>
                setForm((f) => ({ ...f, short_description: e.target.value }))
              }
              className={adminInputClass}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={adminLabelClass}>Business Value</label>
              <textarea
                rows={3}
                value={form.business_value}
                onChange={(e) =>
                  setForm((f) => ({ ...f, business_value: e.target.value }))
                }
                className={adminInputClass}
              />
            </div>
            <div>
              <label className={adminLabelClass}>Creative Approach</label>
              <textarea
                rows={3}
                value={form.creative_approach}
                onChange={(e) =>
                  setForm((f) => ({ ...f, creative_approach: e.target.value }))
                }
                className={adminInputClass}
              />
            </div>
            <div>
              <label className={adminLabelClass}>Deliverables (one per line)</label>
              <textarea
                rows={4}
                value={form.deliverablesText}
                onChange={(e) =>
                  setForm((f) => ({ ...f, deliverablesText: e.target.value }))
                }
                className={adminInputClass}
              />
            </div>
            <div>
              <label className={adminLabelClass}>Ideal For (one per line)</label>
              <textarea
                rows={4}
                value={form.idealForText}
                onChange={(e) =>
                  setForm((f) => ({ ...f, idealForText: e.target.value }))
                }
                className={adminInputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={adminLabelClass}>Hero Image</label>
              <MediaUrlOrUploadField
                assetKind="image"
                usageSlot="service"
                value={form.hero_image_url}
                onChange={(url) =>
                  setForm((f) => ({ ...f, hero_image_url: url }))
                }
              />
            </div>
            <div>
              <label className={adminLabelClass}>Preview Video</label>
              <MediaUrlOrUploadField
                assetKind="video"
                usageSlot="service"
                accept="video/mp4,video/webm"
                value={form.video_url}
                onChange={(url) => setForm((f) => ({ ...f, video_url: url }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={adminLabelClass}>CTA Label</label>
              <input
                type="text"
                value={form.cta_label}
                onChange={(e) =>
                  setForm((f) => ({ ...f, cta_label: e.target.value }))
                }
                className={adminInputClass}
              />
            </div>
            <div>
              <label className={adminLabelClass}>Display Order</label>
              <input
                type="number"
                min={0}
                value={form.display_order}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    display_order: Number(e.target.value) || 0,
                  }))
                }
                className={adminInputClass}
              />
            </div>
            <div className="flex items-end pb-2">
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
              {saving ? "Saving..." : "Save Service"}
            </button>
          </div>
        </form>
      </AdminModal>

      <AdminConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Service?"
        message={`Remove "${deleteTarget?.title}" from the Studio Services catalog?`}
        busy={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
