"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Save, Loader2 } from "lucide-react";
import {
  AdminConfirmDialog,
  AdminModal,
  AdminPageHeader,
  adminInputClass,
  adminLabelClass,
  useAdminToast,
} from "@/components/admin/admin-ui";
import type { FaqItem, SiteContentBlock } from "@/lib/types";
import { cn } from "@/lib/utils";

const LEGAL_KEYS = new Set(["legal_privacy", "legal_terms", "legal_cookies"]);

export default function AdminContentPage() {
  const { pushToast } = useAdminToast();
  const [blocks, setBlocks] = useState<SiteContentBlock[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"sections" | "faqs" | "legal">("sections");

  // Editing block state
  const [editingBlock, setEditingBlock] = useState<SiteContentBlock | null>(null);
  const [blockDraft, setBlockDraft] = useState<Record<string, unknown>>({});
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [savingBlock, setSavingBlock] = useState(false);

  // FAQ Modal state
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [faqForm, setFaqForm] = useState({
    question: "",
    answer: "",
    category: "Process",
    display_order: 1,
    is_published: true,
  });
  const [savingFaq, setSavingFaq] = useState(false);
  const [deleteFaqTarget, setDeleteFaqTarget] = useState<FaqItem | null>(null);
  const [deletingFaq, setDeletingFaq] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [contentRes, faqRes] = await Promise.all([
        fetch("/api/admin/content", { cache: "no-store" }),
        fetch("/api/admin/faqs", { cache: "no-store" }),
      ]);
      const contentJson = await contentRes.json();
      const faqJson = await faqRes.json();
      setBlocks(contentJson.blocks ?? []);
      setFaqs(faqJson.faqs ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function openBlockEditor(block: SiteContentBlock) {
    setEditingBlock(block);
    setBlockDraft({ ...block.content });
    setJsonText(JSON.stringify(block.content, null, 2));
    setJsonMode(false);
  }

  async function saveBlock(e: React.FormEvent) {
    e.preventDefault();
    if (!editingBlock) return;

    let finalContent: Record<string, unknown> = blockDraft;
    if (jsonMode) {
      try {
        finalContent = JSON.parse(jsonText);
      } catch {
        pushToast("Invalid JSON syntax. Please check braces and quotes.", "error");
        return;
      }
    }

    setSavingBlock(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: editingBlock.key,
          section: editingBlock.section,
          label: editingBlock.label,
          content: finalContent,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        pushToast(json.error || "Save failed", "error");
        return;
      }
      pushToast(`Saved "${editingBlock.label}"`, "success");
      setEditingBlock(null);
      await loadData();
    } finally {
      setSavingBlock(false);
    }
  }

  function openNewFaq() {
    setEditingFaq(null);
    setFaqForm({
      question: "",
      answer: "",
      category: "Process",
      display_order: faqs.length + 1,
      is_published: true,
    });
    setFaqModalOpen(true);
  }

  function openEditFaq(faq: FaqItem) {
    setEditingFaq(faq);
    setFaqForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      display_order: faq.display_order,
      is_published: faq.is_published,
    });
    setFaqModalOpen(true);
  }

  async function saveFaq(e: React.FormEvent) {
    e.preventDefault();
    setSavingFaq(true);
    try {
      const url = editingFaq
        ? `/api/admin/faqs/${editingFaq.id}`
        : "/api/admin/faqs";
      const method = editingFaq ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(faqForm),
      });
      if (!res.ok) {
        const j = await res.json();
        pushToast(j.error || "Failed to save FAQ", "error");
        return;
      }
      pushToast(editingFaq ? "FAQ updated" : "FAQ added", "success");
      setFaqModalOpen(false);
      await loadData();
    } finally {
      setSavingFaq(false);
    }
  }

  async function deleteFaq() {
    if (!deleteFaqTarget) return;
    setDeletingFaq(true);
    try {
      const res = await fetch(`/api/admin/faqs/${deleteFaqTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        pushToast("FAQ deleted", "success");
        setDeleteFaqTarget(null);
        await loadData();
      }
    } finally {
      setDeletingFaq(false);
    }
  }

  const sectionBlocks = blocks.filter((b) => !LEGAL_KEYS.has(b.key));
  const legalBlocks = blocks.filter((b) => LEGAL_KEYS.has(b.key));

  return (
    <div>
      <AdminPageHeader
        eyebrow="Module H • Editorial Copy"
        title="Website Content, FAQs & Legal Pages"
        description="Edit homepage copy, process steps, About philosophy, FAQs, and Privacy / Terms / Cookie policies with instant cache revalidation."
        actions={
          tab === "faqs" ? (
            <button
              type="button"
              onClick={openNewFaq}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-gold to-gold-warm px-4 py-2.5 text-xs font-semibold text-obsidian"
            >
              <Plus className="h-4 w-4" />
              Add FAQ
            </button>
          ) : null
        }
      />

      <div className="mb-6 inline-flex rounded-xl border border-ivory/15 bg-charcoal p-1">
        {[
          { id: "sections", label: `Site Sections (${sectionBlocks.length})` },
          { id: "faqs", label: `FAQs (${faqs.length})` },
          { id: "legal", label: `Legal Policies (${legalBlocks.length})` },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id as "sections" | "faqs" | "legal")}
            className={cn(
              "rounded-lg px-4 py-1.5 text-xs font-medium transition",
              tab === item.id
                ? "bg-wine text-gold"
                : "text-ivory/65 hover:text-ivory"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-gold" />
        </div>
      ) : tab === "faqs" ? (
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div key={faq.id} className="glass-card rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-gold">
                    #{faq.display_order} • {faq.category} •{" "}
                    {faq.is_published ? "Published" : "Hidden"}
                  </span>
                  <h3 className="mt-1 font-display text-base font-semibold text-ivory">
                    {faq.question}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-ivory/70">
                    {faq.answer}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => openEditFaq(faq)}
                    className="rounded-lg border border-ivory/15 p-2 text-ivory/75 hover:border-gold/40"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteFaqTarget(faq)}
                    className="rounded-lg border border-rose-400/25 p-2 text-rose-200 hover:bg-rose-500/15"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {(tab === "sections" ? sectionBlocks : legalBlocks).map((block) => (
            <div key={block.key} className="glass-card rounded-3xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-gold">
                    {block.key}
                  </span>
                  <h3 className="mt-1 font-display text-base font-semibold text-ivory">
                    {block.label}
                  </h3>
                  <p className="mt-1 text-xs text-ivory/55">
                    {Object.keys(block.content || {}).length} editable fields
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openBlockEditor(block)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs font-medium text-gold hover:bg-gold/20"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit Block
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Block Editor Modal */}
      <AdminModal
        open={Boolean(editingBlock)}
        onClose={() => setEditingBlock(null)}
        title={editingBlock ? `Edit: ${editingBlock.label}` : "Edit Content"}
        subtitle={`Content key: ${editingBlock?.key}`}
        maxWidth="max-w-4xl"
      >
        {editingBlock ? (
          <form onSubmit={saveBlock} className="space-y-4">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (!jsonMode) {
                    setJsonText(JSON.stringify(blockDraft, null, 2));
                    setJsonMode(true);
                  } else {
                    try {
                      setBlockDraft(JSON.parse(jsonText));
                      setJsonMode(false);
                    } catch {
                      pushToast("Fix JSON syntax before switching view", "error");
                    }
                  }
                }}
                className="rounded-lg border border-ivory/20 px-3 py-1 font-mono text-[11px] text-gold hover:border-gold/45"
              >
                {jsonMode ? "Switch to Field Form" : "Switch to Raw JSON"}
              </button>
            </div>

            {jsonMode ? (
              <textarea
                rows={16}
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                className={`${adminInputClass} font-mono text-xs leading-relaxed`}
              />
            ) : (
              <div className="space-y-4">
                {Object.entries(blockDraft).map(([fieldKey, val]) => {
                  if (typeof val === "string") {
                    const multiline = val.length > 80 || val.includes("\n");
                    return (
                      <div key={fieldKey}>
                        <label className={adminLabelClass}>
                          {fieldKey.replace(/_/g, " ")}
                        </label>
                        {multiline ? (
                          <textarea
                            rows={3}
                            value={val}
                            onChange={(e) =>
                              setBlockDraft((prev) => ({
                                ...prev,
                                [fieldKey]: e.target.value,
                              }))
                            }
                            className={adminInputClass}
                          />
                        ) : (
                          <input
                            type="text"
                            value={val}
                            onChange={(e) =>
                              setBlockDraft((prev) => ({
                                ...prev,
                                [fieldKey]: e.target.value,
                              }))
                            }
                            className={adminInputClass}
                          />
                        )}
                      </div>
                    );
                  }

                  return (
                    <div key={fieldKey}>
                      <label className={adminLabelClass}>
                        {fieldKey.replace(/_/g, " ")} (Structured List / JSON)
                      </label>
                      <textarea
                        rows={6}
                        value={JSON.stringify(val, null, 2)}
                        onChange={(e) => {
                          try {
                            const parsed = JSON.parse(e.target.value);
                            setBlockDraft((prev) => ({
                              ...prev,
                              [fieldKey]: parsed,
                            }));
                          } catch {
                            // Keep editing in Raw JSON if nested array syntax is mid-edit
                          }
                        }}
                        className={`${adminInputClass} font-mono text-xs`}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end gap-3 border-t border-ivory/10 pt-4">
              <button
                type="button"
                onClick={() => setEditingBlock(null)}
                className="rounded-xl border border-ivory/15 px-4 py-2 text-sm text-ivory/75"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingBlock}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold to-gold-warm px-5 py-2 text-sm font-semibold text-obsidian"
              >
                {savingBlock ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Content Block
              </button>
            </div>
          </form>
        ) : null}
      </AdminModal>

      {/* FAQ Modal */}
      <AdminModal
        open={faqModalOpen}
        onClose={() => setFaqModalOpen(false)}
        title={editingFaq ? "Edit FAQ" : "Add FAQ"}
      >
        <form onSubmit={saveFaq} className="space-y-4">
          <div>
            <label className={adminLabelClass}>Question *</label>
            <input
              type="text"
              required
              value={faqForm.question}
              onChange={(e) =>
                setFaqForm((f) => ({ ...f, question: e.target.value }))
              }
              className={adminInputClass}
            />
          </div>
          <div>
            <label className={adminLabelClass}>Answer *</label>
            <textarea
              rows={4}
              required
              value={faqForm.answer}
              onChange={(e) =>
                setFaqForm((f) => ({ ...f, answer: e.target.value }))
              }
              className={adminInputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={adminLabelClass}>Category</label>
              <input
                type="text"
                value={faqForm.category}
                onChange={(e) =>
                  setFaqForm((f) => ({ ...f, category: e.target.value }))
                }
                className={adminInputClass}
              />
            </div>
            <div>
              <label className={adminLabelClass}>Order</label>
              <input
                type="number"
                value={faqForm.display_order}
                onChange={(e) =>
                  setFaqForm((f) => ({
                    ...f,
                    display_order: Number(e.target.value) || 0,
                  }))
                }
                className={adminInputClass}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs text-ivory/85">
            <input
              type="checkbox"
              checked={faqForm.is_published}
              onChange={(e) =>
                setFaqForm((f) => ({ ...f, is_published: e.target.checked }))
              }
              className="h-4 w-4 accent-gold"
            />
            Published
          </label>
          <div className="flex justify-end gap-3 border-t border-ivory/10 pt-4">
            <button
              type="button"
              onClick={() => setFaqModalOpen(false)}
              className="rounded-xl border border-ivory/15 px-4 py-2 text-sm text-ivory/75"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingFaq}
              className="rounded-xl bg-gradient-to-r from-gold to-gold-warm px-5 py-2 text-sm font-semibold text-obsidian"
            >
              {savingFaq ? "Saving..." : "Save FAQ"}
            </button>
          </div>
        </form>
      </AdminModal>

      <AdminConfirmDialog
        open={Boolean(deleteFaqTarget)}
        title="Delete FAQ?"
        message={`Remove "${deleteFaqTarget?.question}" from the public FAQ section?`}
        busy={deletingFaq}
        onCancel={() => setDeleteFaqTarget(null)}
        onConfirm={deleteFaq}
      />
    </div>
  );
}
