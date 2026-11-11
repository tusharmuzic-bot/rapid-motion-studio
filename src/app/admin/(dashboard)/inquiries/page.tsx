"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Search,
  Paperclip,
  Download,
  Loader2,
  Trash2,
  ExternalLink,
  Save,
} from "lucide-react";
import {
  AdminConfirmDialog,
  AdminModal,
  AdminPageHeader,
  adminInputClass,
  adminLabelClass,
  useAdminToast,
} from "@/components/admin/admin-ui";
import type { ClientInquiry, InquiryStatus, MediaAsset } from "@/lib/types";
import { cn, formatBytes, formatDateShort } from "@/lib/utils";

const STATUSES: InquiryStatus[] = [
  "New",
  "Contacted",
  "Proposal Sent",
  "In Discussion",
  "Approved",
  "In Production",
  "Completed",
  "Rejected",
];

type InquiryWithCount = ClientInquiry & { attachment_count?: number };
type AttachmentWithUrl = MediaAsset & { signed_url: string | null };

export default function AdminInquiriesPage() {
  const { pushToast } = useAdminToast();
  const [inquiries, setInquiries] = useState<InquiryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Detail modal state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailInquiry, setDetailInquiry] = useState<ClientInquiry | null>(null);
  const [detailAttachments, setDetailAttachments] = useState<AttachmentWithUrl[]>([]);
  const [notesDraft, setNotesDraft] = useState("");
  const [statusDraft, setStatusDraft] = useState<InquiryStatus>("New");
  const [savingDetail, setSavingDetail] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<ClientInquiry | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "All") params.set("status", statusFilter);
      if (searchQuery.trim()) params.set("q", searchQuery.trim());

      const res = await fetch(`/api/admin/inquiries?${params.toString()}`, {
        cache: "no-store",
      });
      const json = await res.json();
      setInquiries(json.inquiries ?? []);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    loadInquiries();
  }, [loadInquiries]);

  async function openInquiryDetail(id: string) {
    setSelectedId(id);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, { cache: "no-store" });
      const json = await res.json();
      if (res.ok && json.inquiry) {
        setDetailInquiry(json.inquiry);
        setDetailAttachments(json.attachments ?? []);
        setStatusDraft(json.inquiry.status);
        setNotesDraft(json.inquiry.internal_notes || "");
      } else {
        pushToast(json.error || "Could not load inquiry", "error");
        setSelectedId(null);
      }
    } finally {
      setDetailLoading(false);
    }
  }

  async function saveInquiryUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!detailInquiry) return;
    setSavingDetail(true);
    try {
      const res = await fetch(`/api/admin/inquiries/${detailInquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: statusDraft,
          internal_notes: notesDraft,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        pushToast(json.error || "Failed to save inquiry", "error");
        return;
      }
      setDetailInquiry(json.inquiry);
      setInquiries((prev) =>
        prev.map((item) =>
          item.id === json.inquiry.id
            ? { ...item, status: json.inquiry.status, internal_notes: json.inquiry.internal_notes }
            : item
        )
      );
      pushToast("Inquiry status & notes saved", "success");
    } finally {
      setSavingDetail(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/inquiries/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        pushToast("Inquiry deleted", "success");
        setDeleteTarget(null);
        setSelectedId(null);
        await loadInquiries();
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
        eyebrow="Module G • Studio CRM"
        title="Client Inquiries & Project Briefs"
        description="Inspect submitted campaign briefs, access private client product uploads via signed Storage links, update workflow statuses, and record producer notes."
      />

      {/* Search + Status Filter Bar */}
      <div className="mb-6 space-y-4">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory/45" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, brand, email, or RMS code..."
            className={`${adminInputClass} pl-10`}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {(["All", ...STATUSES] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition",
                statusFilter === status
                  ? "border-gold/50 bg-wine text-gold"
                  : "border-ivory/15 text-ivory/65 hover:border-ivory/35"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-gold" />
        </div>
      ) : inquiries.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center">
          <p className="text-sm text-ivory/65">
            No matching client inquiries found.
          </p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden rounded-3xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ivory/10 bg-charcoal/80 font-mono text-[11px] uppercase tracking-wider text-ivory/55">
                <tr>
                  <th className="px-5 py-3.5">Code</th>
                  <th className="px-5 py-3.5">Client / Brand</th>
                  <th className="px-5 py-3.5">Service</th>
                  <th className="px-5 py-3.5">Budget / Timeline</th>
                  <th className="px-5 py-3.5">Files</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory/10">
                {inquiries.map((inq) => (
                  <tr
                    key={inq.id}
                    onClick={() => openInquiryDetail(inq.id)}
                    className="cursor-pointer transition hover:bg-white/[0.03]"
                  >
                    <td className="px-5 py-4 font-mono text-xs text-gold">
                      {inq.inquiry_code}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-ivory">{inq.full_name}</p>
                      <p className="text-xs text-ivory/55">
                        {inq.brand_name ? `${inq.brand_name} • ` : ""}
                        {inq.email}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-xs text-ivory/80">
                      {inq.required_service || "General Inquiry"}
                    </td>
                    <td className="px-5 py-4 text-xs text-ivory/70">
                      <p>{inq.budget_range || "—"}</p>
                      <p className="text-[11px] text-ivory/45">
                        {inq.preferred_timeline || ""}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-xs text-ivory/70">
                      {inq.attachment_count ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-gold/25 bg-gold/10 px-2 py-0.5 text-gold">
                          <Paperclip className="h-3 w-3" />
                          {inq.attachment_count}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full border border-gold/30 bg-wine/55 px-2.5 py-0.5 text-[11px] font-medium text-gold">
                        {inq.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-ivory/50">
                      {formatDateShort(inq.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inquiry Detail Modal */}
      <AdminModal
        open={Boolean(selectedId)}
        onClose={() => setSelectedId(null)}
        title={
          detailInquiry
            ? `${detailInquiry.inquiry_code} • ${detailInquiry.full_name}`
            : "Loading Inquiry..."
        }
        subtitle={
          detailInquiry
            ? `${detailInquiry.brand_name || "Independent"} • ${detailInquiry.email}`
            : undefined
        }
        maxWidth="max-w-4xl"
      >
        {detailLoading || !detailInquiry ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-gold" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 rounded-2xl border border-ivory/10 bg-charcoal/70 p-4 text-xs sm:grid-cols-2 md:grid-cols-3">
              <div>
                <span className="text-ivory/45">Service Needed</span>
                <p className="mt-1 font-medium text-ivory">
                  {detailInquiry.required_service || "—"}
                </p>
              </div>
              <div>
                <span className="text-ivory/45">Industry</span>
                <p className="mt-1 font-medium text-ivory">
                  {detailInquiry.industry || "—"}
                </p>
              </div>
              <div>
                <span className="text-ivory/45">WhatsApp / Phone</span>
                <p className="mt-1 font-medium text-ivory">
                  {detailInquiry.whatsapp || "—"}
                </p>
              </div>
              <div>
                <span className="text-ivory/45">Budget Range</span>
                <p className="mt-1 font-medium text-gold">
                  {detailInquiry.budget_range || "—"}
                </p>
              </div>
              <div>
                <span className="text-ivory/45">Timeline</span>
                <p className="mt-1 font-medium text-ivory">
                  {detailInquiry.preferred_timeline || "—"}
                </p>
              </div>
              <div>
                <span className="text-ivory/45">Brand Website</span>
                {detailInquiry.website_url ? (
                  <a
                    href={detailInquiry.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-gold hover:underline"
                  >
                    Visit <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <p className="mt-1 text-ivory">—</p>
                )}
              </div>
            </div>

            <div>
              <h3 className={adminLabelClass}>Project Brief &amp; Objectives</h3>
              <p className="whitespace-pre-wrap rounded-2xl border border-ivory/10 bg-charcoal/60 p-4 text-sm leading-relaxed text-ivory/85">
                {detailInquiry.project_description}
              </p>
              {detailInquiry.expected_deliverables ? (
                <p className="mt-2 text-xs text-ivory/70">
                  <strong>Expected Deliverables:</strong>{" "}
                  {detailInquiry.expected_deliverables}
                </p>
              ) : null}
            </div>

            {detailInquiry.reference_links?.length ? (
              <div>
                <h3 className={adminLabelClass}>Reference Links</h3>
                <ul className="space-y-1 text-xs">
                  {detailInquiry.reference_links.map((link, idx) => (
                    <li key={idx}>
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-gold hover:underline"
                      >
                        {link} <ExternalLink className="h-3 w-3" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div>
              <h3 className={adminLabelClass}>
                Client Uploaded Files ({detailAttachments.length})
              </h3>
              {detailAttachments.length === 0 ? (
                <p className="text-xs text-ivory/50">
                  No files attached to this submission.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {detailAttachments.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-ivory/15 bg-charcoal/80 p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-ivory">
                          {file.title}
                        </p>
                        <p className="mt-0.5 font-mono text-[10px] text-ivory/50">
                          {file.mime_type} • {formatBytes(file.file_size_bytes)}
                        </p>
                      </div>
                      {file.signed_url ? (
                        <a
                          href={file.signed_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs font-medium text-gold hover:bg-gold/20"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Open
                        </a>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form
              onSubmit={saveInquiryUpdate}
              className="space-y-4 border-t border-ivory/10 pt-5"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={adminLabelClass}>Workflow Status</label>
                  <select
                    value={statusDraft}
                    onChange={(e) =>
                      setStatusDraft(e.target.value as InquiryStatus)
                    }
                    className={adminInputClass}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={adminLabelClass}>
                  Internal Producer Notes (Private)
                </label>
                <textarea
                  rows={3}
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  placeholder="Call summary, quote sent, production notes..."
                  className={adminInputClass}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(detailInquiry)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-400/30 px-3.5 py-2 text-xs text-rose-200 hover:bg-rose-500/15"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete Inquiry
                </button>
                <button
                  type="submit"
                  disabled={savingDetail}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold to-gold-warm px-5 py-2 text-xs font-semibold text-obsidian disabled:opacity-50"
                >
                  {savingDetail ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save CRM Update
                </button>
              </div>
            </form>
          </div>
        )}
      </AdminModal>

      <AdminConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Client Inquiry?"
        message={`Permanently delete ${deleteTarget?.inquiry_code} and all privately attached storage files?`}
        busy={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
