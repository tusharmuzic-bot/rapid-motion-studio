"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Loader2,
  Tag,
} from "lucide-react";
import {
  AdminConfirmDialog,
  AdminModal,
  AdminPageHeader,
  adminInputClass,
  adminLabelClass,
  useAdminToast,
} from "@/components/admin/admin-ui";
import { MediaUrlOrUploadField } from "@/components/admin/media-upload-control";
import type { PortfolioCategory, PortfolioProject } from "@/lib/types";
import { cn, slugify } from "@/lib/utils";

const EMPTY_PROJECT_FORM = {
  title: "",
  slug: "",
  category_id: "",
  brand_or_industry: "",
  project_type: "Demo Concept" as "Demo Concept" | "Client Production",
  short_description: "",
  full_description: "",
  creative_concept: "",
  highlightsText: "",
  duration_label: "0:30",
  thumbnail_url: "",
  video_url: "",
  mobile_video_url: "",
  before_image_url: "",
  after_image_url: "",
  before_after_caption: "",
  is_featured: false,
  is_published: true,
  display_order: 10,
};

export default function AdminPortfolioPage() {
  const { pushToast } = useAdminToast();
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [categories, setCategories] = useState<PortfolioCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"projects" | "categories">("projects");
  const [filterType, setFilterType] = useState<"All" | "Demo Concept" | "Client Production">("All");

  // Project modal state
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null);
  const [projectForm, setProjectForm] = useState(EMPTY_PROJECT_FORM);
  const [saving, setSaving] = useState(false);

  // Category modal state
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [catForm, setCatForm] = useState({ name: "", slug: "", description: "", display_order: 10 });

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    label: string;
    kind: "project" | "category";
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/portfolio", { cache: "no-store" });
      const json = await res.json();
      setProjects(json.projects ?? []);
      setCategories(json.categories ?? []);
    } catch {
      pushToast("Failed to load portfolio data", "error");
    } finally {
      setLoading(false);
    }
  }, [pushToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function openNewProjectModal() {
    setEditingProject(null);
    setProjectForm({
      ...EMPTY_PROJECT_FORM,
      category_id: categories[0]?.id ?? "",
      display_order: projects.length + 1,
    });
    setProjectModalOpen(true);
  }

  function openEditProjectModal(proj: PortfolioProject) {
    setEditingProject(proj);
    setProjectForm({
      title: proj.title,
      slug: proj.slug,
      category_id: proj.category_id ?? "",
      brand_or_industry: proj.brand_or_industry,
      project_type: proj.project_type,
      short_description: proj.short_description,
      full_description: proj.full_description,
      creative_concept: proj.creative_concept,
      highlightsText: (proj.production_highlights ?? []).join("\n"),
      duration_label: proj.duration_label,
      thumbnail_url: proj.thumbnail_url,
      video_url: proj.video_url,
      mobile_video_url: proj.mobile_video_url,
      before_image_url: proj.before_image_url,
      after_image_url: proj.after_image_url,
      before_after_caption: proj.before_after_caption,
      is_featured: proj.is_featured,
      is_published: proj.is_published,
      display_order: proj.display_order,
    });
    setProjectModalOpen(true);
  }

  async function saveProject(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      title: projectForm.title.trim(),
      slug: slugify(projectForm.slug || projectForm.title),
      category_id: projectForm.category_id || null,
      brand_or_industry: projectForm.brand_or_industry.trim(),
      project_type: projectForm.project_type,
      short_description: projectForm.short_description.trim(),
      full_description: projectForm.full_description.trim(),
      creative_concept: projectForm.creative_concept.trim(),
      production_highlights: projectForm.highlightsText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      duration_label: projectForm.duration_label.trim(),
      thumbnail_url: projectForm.thumbnail_url.trim(),
      video_url: projectForm.video_url.trim(),
      mobile_video_url: projectForm.mobile_video_url.trim(),
      before_image_url: projectForm.before_image_url.trim(),
      after_image_url: projectForm.after_image_url.trim(),
      before_after_caption: projectForm.before_after_caption.trim(),
      is_featured: projectForm.is_featured,
      is_published: projectForm.is_published,
      display_order: Number(projectForm.display_order) || 0,
    };

    try {
      const url = editingProject
        ? `/api/admin/portfolio/${editingProject.id}`
        : "/api/admin/portfolio";
      const method = editingProject ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        pushToast(json.error || "Failed to save project", "error");
        setSaving(false);
        return;
      }

      pushToast(
        editingProject ? "Portfolio project updated" : "Portfolio project created",
        "success"
      );
      setProjectModalOpen(false);
      await loadData();
    } catch {
      pushToast("Error saving project", "error");
    } finally {
      setSaving(false);
    }
  }

  async function quickToggle(proj: PortfolioProject, field: "is_published" | "is_featured") {
    try {
      const res = await fetch(`/api/admin/portfolio/${proj.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !proj[field] }),
      });
      if (!res.ok) {
        const j = await res.json();
        pushToast(j.error || "Update failed", "error");
        return;
      }
      setProjects((prev) =>
        prev.map((item) =>
          item.id === proj.id ? { ...item, [field]: !item[field] } : item
        )
      );
      pushToast("Project updated", "success");
    } catch {
      pushToast("Failed to update project", "error");
    }
  }

  async function createCategory(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "category",
          name: catForm.name,
          slug: slugify(catForm.slug || catForm.name),
          description: catForm.description,
          display_order: Number(catForm.display_order) || 0,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        pushToast(json.error || "Could not create category", "error");
        setSaving(false);
        return;
      }
      pushToast("Category created", "success");
      setCatModalOpen(false);
      setCatForm({ name: "", slug: "", description: "", display_order: categories.length + 1 });
      await loadData();
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const suffix = deleteTarget.kind === "category" ? "?type=category" : "";
      const res = await fetch(`/api/admin/portfolio/${deleteTarget.id}${suffix}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) {
        pushToast(json.error || "Delete failed", "error");
        setDeleting(false);
        return;
      }
      pushToast(`Deleted "${deleteTarget.label}"`, "success");
      setDeleteTarget(null);
      await loadData();
    } finally {
      setDeleting(false);
    }
  }

  const filteredProjects =
    filterType === "All"
      ? projects
      : projects.filter((p) => p.project_type === filterType);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Portfolio CMS"
        title="Creative Work & Categories"
        description="Manage Demo Concepts and genuine Client Productions. Clearly distinguish Demo Concepts until verified client productions are delivered."
        actions={
          <>
            <button
              type="button"
              onClick={() => setCatModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-ivory/15 px-4 py-2.5 text-xs font-medium text-ivory/80 transition hover:border-gold/40 hover:text-ivory"
            >
              <Tag className="h-3.5 w-3.5 text-gold" />
              New Category
            </button>
            <button
              type="button"
              onClick={openNewProjectModal}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-gold to-gold-warm px-4 py-2.5 text-xs font-semibold text-obsidian transition hover:brightness-105"
            >
              <Plus className="h-4 w-4" />
              Add Project
            </button>
          </>
        }
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex rounded-xl border border-ivory/15 bg-charcoal p-1">
          <button
            type="button"
            onClick={() => setTab("projects")}
            className={cn(
              "rounded-lg px-4 py-1.5 text-xs font-medium transition",
              tab === "projects" ? "bg-wine text-gold" : "text-ivory/65 hover:text-ivory"
            )}
          >
            Projects ({projects.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("categories")}
            className={cn(
              "rounded-lg px-4 py-1.5 text-xs font-medium transition",
              tab === "categories" ? "bg-wine text-gold" : "text-ivory/65 hover:text-ivory"
            )}
          >
            Categories ({categories.length})
          </button>
        </div>

        {tab === "projects" ? (
          <div className="flex items-center gap-2">
            {(["All", "Demo Concept", "Client Production"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFilterType(type)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition",
                  filterType === type
                    ? "border-gold/50 bg-gold/15 text-gold"
                    : "border-ivory/15 text-ivory/65 hover:border-ivory/35"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-gold" />
        </div>
      ) : tab === "projects" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredProjects.map((proj) => (
            <div
              key={proj.id}
              className="glass-card flex flex-col justify-between rounded-3xl p-5"
            >
              <div className="flex gap-4">
                {proj.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={proj.thumbnail_url}
                    alt={proj.title}
                    className="h-24 w-36 shrink-0 rounded-2xl border border-ivory/10 object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-36 shrink-0 items-center justify-center rounded-2xl border border-ivory/10 bg-wine/30 text-xs text-ivory/50">
                    No Thumb
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                        proj.project_type === "Client Production"
                          ? "border-emerald-400/35 bg-emerald-500/15 text-emerald-200"
                          : "border-gold/30 bg-wine/50 text-gold"
                      )}
                    >
                      {proj.project_type}
                    </span>
                    <span className="font-mono text-[10px] text-ivory/50">
                      #{proj.display_order} • {proj.duration_label}
                    </span>
                  </div>
                  <h3 className="mt-1.5 truncate font-display text-base font-semibold text-ivory">
                    {proj.title}
                  </h3>
                  <p className="truncate text-xs text-gold/80">
                    {proj.brand_or_industry}
                    {proj.category?.name ? ` • ${proj.category.name}` : ""}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-ivory/60">
                    {proj.short_description}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-ivory/10 pt-3.5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => quickToggle(proj, "is_published")}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px]",
                      proj.is_published
                        ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                        : "border-ivory/15 bg-charcoal text-ivory/55"
                    )}
                  >
                    {proj.is_published ? (
                      <Eye className="h-3 w-3" />
                    ) : (
                      <EyeOff className="h-3 w-3" />
                    )}
                    {proj.is_published ? "Published" : "Hidden"}
                  </button>
                  <button
                    type="button"
                    onClick={() => quickToggle(proj, "is_featured")}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px]",
                      proj.is_featured
                        ? "border-gold/40 bg-gold/15 text-gold"
                        : "border-ivory/15 bg-charcoal text-ivory/55"
                    )}
                  >
                    <Star className="h-3 w-3" />
                    {proj.is_featured ? "Featured" : "Standard"}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditProjectModal(proj)}
                    className="inline-flex items-center gap-1 rounded-lg border border-ivory/15 px-2.5 py-1 text-xs text-ivory/80 hover:border-gold/40 hover:text-ivory"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDeleteTarget({ id: proj.id, label: proj.title, kind: "project" })
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-rose-400/25 px-2.5 py-1 text-xs text-rose-200 hover:bg-rose-500/15"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="glass-card flex items-center justify-between rounded-2xl px-5 py-4"
            >
              <div>
                <p className="font-display text-sm font-semibold text-ivory">
                  {cat.name}{" "}
                  <span className="ml-2 font-mono text-xs text-gold/75">
                    /{cat.slug}
                  </span>
                </p>
                {cat.description ? (
                  <p className="mt-1 text-xs text-ivory/60">{cat.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() =>
                  setDeleteTarget({ id: cat.id, label: cat.name, kind: "category" })
                }
                className="rounded-lg border border-rose-400/25 p-2 text-rose-200 hover:bg-rose-500/15"
                aria-label={`Delete category ${cat.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Project Modal */}
      <AdminModal
        open={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        title={editingProject ? `Edit: ${editingProject.title}` : "Add Portfolio Project"}
        subtitle="Manage video assets, editorial copy, and Demo vs Client classification"
        maxWidth="max-w-4xl"
      >
        <form onSubmit={saveProject} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={adminLabelClass}>Project Title *</label>
              <input
                type="text"
                required
                value={projectForm.title}
                onChange={(e) =>
                  setProjectForm((f) => ({
                    ...f,
                    title: e.target.value,
                    slug: editingProject ? f.slug : slugify(e.target.value),
                  }))
                }
                className={adminInputClass}
              />
            </div>
            <div>
              <label className={adminLabelClass}>URL Slug *</label>
              <input
                type="text"
                required
                value={projectForm.slug}
                onChange={(e) =>
                  setProjectForm((f) => ({ ...f, slug: e.target.value }))
                }
                className={`${adminInputClass} font-mono`}
              />
            </div>
            <div>
              <label className={adminLabelClass}>Category</label>
              <select
                value={projectForm.category_id}
                onChange={(e) =>
                  setProjectForm((f) => ({ ...f, category_id: e.target.value }))
                }
                className={adminInputClass}
              >
                <option value="">Uncategorized</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={adminLabelClass}>Project Type *</label>
              <select
                value={projectForm.project_type}
                onChange={(e) =>
                  setProjectForm((f) => ({
                    ...f,
                    project_type: e.target.value as "Demo Concept" | "Client Production",
                  }))
                }
                className={adminInputClass}
              >
                <option value="Demo Concept">Demo Concept</option>
                <option value="Client Production">Client Production</option>
              </select>
            </div>
            <div>
              <label className={adminLabelClass}>Brand or Industry *</label>
              <input
                type="text"
                required
                value={projectForm.brand_or_industry}
                onChange={(e) =>
                  setProjectForm((f) => ({ ...f, brand_or_industry: e.target.value }))
                }
                className={adminInputClass}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={adminLabelClass}>Duration</label>
                <input
                  type="text"
                  value={projectForm.duration_label}
                  onChange={(e) =>
                    setProjectForm((f) => ({ ...f, duration_label: e.target.value }))
                  }
                  placeholder="0:30"
                  className={adminInputClass}
                />
              </div>
              <div>
                <label className={adminLabelClass}>Display Order</label>
                <input
                  type="number"
                  min={0}
                  value={projectForm.display_order}
                  onChange={(e) =>
                    setProjectForm((f) => ({
                      ...f,
                      display_order: Number(e.target.value) || 0,
                    }))
                  }
                  className={adminInputClass}
                />
              </div>
            </div>
          </div>

          <div>
            <label className={adminLabelClass}>Short Summary *</label>
            <input
              type="text"
              required
              value={projectForm.short_description}
              onChange={(e) =>
                setProjectForm((f) => ({ ...f, short_description: e.target.value }))
              }
              className={adminInputClass}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={adminLabelClass}>Full Description</label>
              <textarea
                rows={4}
                value={projectForm.full_description}
                onChange={(e) =>
                  setProjectForm((f) => ({ ...f, full_description: e.target.value }))
                }
                className={adminInputClass}
              />
            </div>
            <div>
              <label className={adminLabelClass}>Creative Concept</label>
              <textarea
                rows={4}
                value={projectForm.creative_concept}
                onChange={(e) =>
                  setProjectForm((f) => ({ ...f, creative_concept: e.target.value }))
                }
                className={adminInputClass}
              />
            </div>
          </div>

          <div>
            <label className={adminLabelClass}>
              Production Highlights (one item per line)
            </label>
            <textarea
              rows={3}
              value={projectForm.highlightsText}
              onChange={(e) =>
                setProjectForm((f) => ({ ...f, highlightsText: e.target.value }))
              }
              placeholder="Zero-shoot volumetric lighting&#10;Custom sound design & color grade"
              className={adminInputClass}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 border-t border-ivory/10 pt-4 sm:grid-cols-2">
            <div>
              <label className={adminLabelClass}>Thumbnail Image URL</label>
              <MediaUrlOrUploadField
                assetKind="image"
                usageSlot="portfolio"
                accept="image/*"
                value={projectForm.thumbnail_url}
                onChange={(url) =>
                  setProjectForm((f) => ({ ...f, thumbnail_url: url }))
                }
              />
            </div>
            <div>
              <label className={adminLabelClass}>Main Video URL</label>
              <MediaUrlOrUploadField
                assetKind="video"
                usageSlot="portfolio"
                accept="video/mp4,video/webm,video/quicktime"
                value={projectForm.video_url}
                onChange={(url) =>
                  setProjectForm((f) => ({ ...f, video_url: url }))
                }
              />
            </div>
            <div>
              <label className={adminLabelClass}>Before Comparison Image</label>
              <MediaUrlOrUploadField
                assetKind="image"
                usageSlot="before_after"
                accept="image/*"
                value={projectForm.before_image_url}
                onChange={(url) =>
                  setProjectForm((f) => ({ ...f, before_image_url: url }))
                }
              />
            </div>
            <div>
              <label className={adminLabelClass}>After Comparison Image</label>
              <MediaUrlOrUploadField
                assetKind="image"
                usageSlot="before_after"
                accept="image/*"
                value={projectForm.after_image_url}
                onChange={(url) =>
                  setProjectForm((f) => ({ ...f, after_image_url: url }))
                }
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 text-xs text-ivory/85">
              <input
                type="checkbox"
                checked={projectForm.is_published}
                onChange={(e) =>
                  setProjectForm((f) => ({ ...f, is_published: e.target.checked }))
                }
                className="h-4 w-4 accent-gold"
              />
              Published on Live Site
            </label>
            <label className="flex items-center gap-2 text-xs text-ivory/85">
              <input
                type="checkbox"
                checked={projectForm.is_featured}
                onChange={(e) =>
                  setProjectForm((f) => ({ ...f, is_featured: e.target.checked }))
                }
                className="h-4 w-4 accent-gold"
              />
              Featured Highlight
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t border-ivory/10 pt-4">
            <button
              type="button"
              onClick={() => setProjectModalOpen(false)}
              className="rounded-xl border border-ivory/15 px-4 py-2 text-sm text-ivory/75"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold to-gold-warm px-5 py-2 text-sm font-semibold text-obsidian disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {editingProject ? "Save Changes" : "Create Project"}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* New Category Modal */}
      <AdminModal
        open={catModalOpen}
        onClose={() => setCatModalOpen(false)}
        title="Add Portfolio Category"
        maxWidth="max-w-md"
      >
        <form onSubmit={createCategory} className="space-y-4">
          <div>
            <label className={adminLabelClass}>Category Name *</label>
            <input
              type="text"
              required
              value={catForm.name}
              onChange={(e) =>
                setCatForm((c) => ({
                  ...c,
                  name: e.target.value,
                  slug: slugify(e.target.value),
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
              value={catForm.slug}
              onChange={(e) => setCatForm((c) => ({ ...c, slug: e.target.value }))}
              className={`${adminInputClass} font-mono`}
            />
          </div>
          <div>
            <label className={adminLabelClass}>Description</label>
            <input
              type="text"
              value={catForm.description}
              onChange={(e) =>
                setCatForm((c) => ({ ...c, description: e.target.value }))
              }
              className={adminInputClass}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setCatModalOpen(false)}
              className="rounded-xl border border-ivory/15 px-4 py-2 text-xs text-ivory/75"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-gradient-to-r from-gold to-gold-warm px-4 py-2 text-xs font-semibold text-obsidian"
            >
              Create Category
            </button>
          </div>
        </form>
      </AdminModal>

      <AdminConfirmDialog
        open={Boolean(deleteTarget)}
        title={`Delete ${deleteTarget?.kind === "category" ? "Category" : "Project"}?`}
        message={`This will permanently remove "${deleteTarget?.label}" from Supabase and immediately revalidate the public site.`}
        busy={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
