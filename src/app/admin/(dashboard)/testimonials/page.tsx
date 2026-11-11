"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, ShieldAlert } from "lucide-react";
import {
  AdminConfirmDialog,
  AdminModal,
  AdminPageHeader,
  adminInputClass,
  adminLabelClass,
  useAdminToast,
} from "@/components/admin/admin-ui";
import type { TestimonialItem } from "@/lib/types";

const EMPTY_TESTIMONIAL = {
  client_name: "",
  role_and_company: "",
  quote: "",
  project_type: "Client Production",
  is_approved: false,
  is_published: false,
  display_order: 1,
};

export default function AdminTestimonialsPage() {
  const { pushToast } = useAdminToast();
  const [items, setItems] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TestimonialItem | null>(null);
  const [form, setForm] = useState(EMPTY_TESTIMONIAL);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TestimonialItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/testimonials", { cache: "no-store" });
      const json = await res.json();
      setItems(json.testimonials ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function openNew() {
    setEditing(null);
    setForm({ ...EMPTY_TESTIMONIAL, display_order: items.length + 1 });
    setModalOpen(true);
  }

  function openEdit(item: TestimonialItem) {
    setEditing(item);
    setForm({
      client_name: item.client_name,
      role_and_company: item.role_and_company,
      quote: item.quote,
      project_type: item.project_type,
      is_approved: item.is_approved,
      is_published: item.is_published,
      display_order: item.display_order,
    });
    setModalOpen(true);
  }

  async function saveTestimonial(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editing
        ? `/api/admin/testimonials/${editing.id}`
        : "/api/admin/testimonials";
      const method = editing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const j = await res.json();
        pushToast(j.error || "Failed to save testimonial", "error");
        return;
      }
      pushToast(editing ? "Testimonial updated" : "Testimonial saved", "success");
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
      const res = await fetch(`/api/admin/testimonials/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        pushToast("Testimonial deleted", "success");
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
        eyebrow="Module I • Client Proof"
        title="Verified Client Testimonials"
        description="Store and approve genuine client testimonials. Quotes only appear publicly when marked both Approved and Published."
        actions={
          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-gold to-gold-warm px-4 py-2.5 text-xs font-semibold text-obsidian"
          >
            <Plus className="h-4 w-4" />
            Add Verified Quote
          </button>
        }
      />

      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-gold/25 bg-wine/30 p-4 text-xs text-ivory/80">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
        <p>
          <strong>Brand Integrity Rule:</strong> Never publish fabricated or
          placeholder client testimonials. Until real delivered clients provide
          signed approval, leave this library empty or unpublished.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-gold" />
        </div>
      ) : items.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center">
          <p className="font-display text-base font-medium text-ivory">
            No client testimonials yet
          </p>
          <p className="mt-1 text-xs text-ivory/60">
            The public homepage cleanly hides the testimonials section until at
            least one approved testimonial is published.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {items.map((item) => (
            <div key={item.id} className="glass-card rounded-3xl p-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-gold">
                  {item.is_approved && item.is_published
                    ? "Live Public"
                    : item.is_approved
                    ? "Approved (Draft)"
                    : "Unapproved Draft"}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    className="rounded-lg border border-ivory/15 p-1.5 text-ivory/75 hover:border-gold/40"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    className="rounded-lg border border-rose-400/25 p-1.5 text-rose-200 hover:bg-rose-500/15"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-sm italic leading-relaxed text-ivory/90">
                &ldquo;{item.quote}&rdquo;
              </p>
              <p className="mt-3 text-xs font-semibold text-ivory">
                {item.client_name}
              </p>
              <p className="text-xs text-ivory/55">
                {item.role_and_company} • {item.project_type}
              </p>
            </div>
          ))}
        </div>
      )}

      <AdminModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Client Testimonial" : "Add Client Testimonial"}
      >
        <form onSubmit={saveTestimonial} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={adminLabelClass}>Client Name *</label>
              <input
                type="text"
                required
                value={form.client_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, client_name: e.target.value }))
                }
                className={adminInputClass}
              />
            </div>
            <div>
              <label className={adminLabelClass}>Role &amp; Company *</label>
              <input
                type="text"
                required
                value={form.role_and_company}
                onChange={(e) =>
                  setForm((f) => ({ ...f, role_and_company: e.target.value }))
                }
                className={adminInputClass}
              />
            </div>
          </div>

          <div>
            <label className={adminLabelClass}>Verified Quote *</label>
            <textarea
              rows={4}
              required
              value={form.quote}
              onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))}
              className={adminInputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={adminLabelClass}>Project Type</label>
              <input
                type="text"
                value={form.project_type}
                onChange={(e) =>
                  setForm((f) => ({ ...f, project_type: e.target.value }))
                }
                className={adminInputClass}
              />
            </div>
            <div>
              <label className={adminLabelClass}>Order</label>
              <input
                type="number"
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
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-xs text-ivory/85">
              <input
                type="checkbox"
                checked={form.is_approved}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    is_approved: e.target.checked,
                    is_published: e.target.checked ? f.is_published : false,
                  }))
                }
                className="h-4 w-4 accent-gold"
              />
              Client Written Approval Verified
            </label>
            <label className="flex items-center gap-2 text-xs text-ivory/85">
              <input
                type="checkbox"
                checked={form.is_published}
                disabled={!form.is_approved}
                onChange={(e) =>
                  setForm((f) => ({ ...f, is_published: e.target.checked }))
                }
                className="h-4 w-4 accent-gold disabled:opacity-40"
              />
              Published on Live Homepage
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
              {saving ? "Saving..." : "Save Testimonial"}
            </button>
          </div>
        </form>
      </AdminModal>

      <AdminConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Testimonial?"
        message={`Remove quote by "${deleteTarget?.client_name}"?`}
        busy={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
