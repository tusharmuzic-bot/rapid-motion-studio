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
import type { BeforeAfterComparison } from "@/lib/types";
import { cn } from "@/lib/utils";

const EMPTY_COMP = {
  title: "",
  category_label: "",
  description: "",
  before_image_url: "",
  after_image_url: "",
  display_order: 1,
  is_published: true,
};

export default function AdminComparisonsPage() {
  const { pushToast } = useAdminToast();
  const [items, setItems] = useState<BeforeAfterComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BeforeAfterComparison | null>(null);
  const [form, setForm] = useState(EMPTY_COMP);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BeforeAfterComparison | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/comparisons", { cache: "no-store" });
      const json = await res.json();
      setItems(json.comparisons ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function openNew() {
    setEditing(null);
    setForm({ ...EMPTY_COMP, display_order: items.length + 1 });
    setModalOpen(true);
  }

  function openEdit(item: BeforeAfterComparison) {
    setEditing(item);
    setForm({
      title: item.title,
      category_label: item.category_label,
      description: item.description,
      before_image_url: item.before_image_url,
      after_image_url: item.after_image_url,
      display_order: item.display_order,
      is_published: item.is_published,
    });
    setModalOpen(true);
  }

  async function saveComparison(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editing
        ? `/api/admin/comparisons/${editing.id}`
        : "/api/admin/comparisons";
      const method = editing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        pushToast(json.error || "Failed to save comparison", "error");
        setSaving(false);
        return;
      }
      pushToast(editing ? "Comparison updated" : "Comparison added", "success");
      setModalOpen(false);
      await loadData();
    } finally {
      setSaving(false);
    }
  }

  async function togglePublished(item: BeforeAfterComparison) {
    const res = await fetch(`/api/admin/comparisons/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: !item.is_published }),
    });
    if (res.ok) {
      setItems((prev) =>
        prev.map((x) =>
          x.id === item.id ? { ...x, is_published: !x.is_published } : x
        )
      );
      pushToast("Visibility updated", "success");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/comparisons/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        pushToast("Comparison deleted", "success");
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
        eyebrow="Transformation Slider"
        title="Before & After Showcase"
        description="Manage interactive comparison pairs showing raw product photos or footage transformed into luxury AI commercials."
        actions={
          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-gold to-gold-warm px-4 py-2.5 text-xs font-semibold text-obsidian"
          >
            <Plus className="h-4 w-4" />
            Add Comparison
          </button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-gold" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {items.map((item) => (
            <div key={item.id} className="glass-card rounded-3xl p-5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-ivory/50">
                    Raw Input
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.before_image_url}
                    alt={`${item.title} before`}
                    className="h-32 w-full rounded-2xl border border-ivory/10 object-cover"
                  />
                </div>
                <div>
                  <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-gold">
                    Rapid Motion Cinema
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.after_image_url}
                    alt={`${item.title} after`}
                    className="h-32 w-full rounded-2xl border border-gold/25 object-cover"
                  />
                </div>
              </div>

              <div className="mt-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-gold/80">
                  #{item.display_order} • {item.category_label}
                </p>
                <h3 className="mt-1 font-display text-base font-semibold text-ivory">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-ivory/65">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-ivory/10 pt-3">
                <button
                  type="button"
                  onClick={() => togglePublished(item)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px]",
                    item.is_published
                      ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                      : "border-ivory/15 text-ivory/55"
                  )}
                >
                  {item.is_published ? (
                    <Eye className="h-3 w-3" />
                  ) : (
                    <EyeOff className="h-3 w-3" />
                  )}
                  {item.is_published ? "Published" : "Hidden"}
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    className="inline-flex items-center gap-1 rounded-lg border border-ivory/15 px-2.5 py-1 text-xs text-ivory/80 hover:border-gold/40"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
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
        title={editing ? `Edit: ${editing.title}` : "Add Before & After Pair"}
      >
        <form onSubmit={saveComparison} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={adminLabelClass}>Comparison Title *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className={adminInputClass}
              />
            </div>
            <div>
              <label className={adminLabelClass}>Category Label *</label>
              <input
                type="text"
                required
                value={form.category_label}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category_label: e.target.value }))
                }
                placeholder="Luxury Fragrance"
                className={adminInputClass}
              />
            </div>
          </div>

          <div>
            <label className={adminLabelClass}>Explanation *</label>
            <textarea
              rows={3}
              required
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              className={adminInputClass}
            />
          </div>

          <div>
            <label className={adminLabelClass}>Before Asset (Original Photo/Frame) *</label>
            <MediaUrlOrUploadField
              assetKind="image"
              usageSlot="before_after"
              value={form.before_image_url}
              onChange={(url) =>
                setForm((f) => ({ ...f, before_image_url: url }))
              }
            />
          </div>

          <div>
            <label className={adminLabelClass}>After Asset (Rapid Motion Cinema) *</label>
            <MediaUrlOrUploadField
              assetKind="image"
              usageSlot="before_after"
              value={form.after_image_url}
              onChange={(url) =>
                setForm((f) => ({ ...f, after_image_url: url }))
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                Published on Live Site
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
              {saving ? "Saving..." : "Save Comparison"}
            </button>
          </div>
        </form>
      </AdminModal>

      <AdminConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Comparison?"
        message={`Remove "${deleteTarget?.title}" from the Before & After Showcase?`}
        busy={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
