"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  Loader2,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn, formatBytes } from "@/lib/utils";

interface UploadedAttachment {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string;
  progress: number;
  status: "uploading" | "done" | "error";
  error?: string;
}

const ACCEPTED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "application/pdf",
]);

const MAX_FILE_BYTES = 50 * 1024 * 1024; // 50 MB per file (matches bucket cap)
const MAX_FILES = 10;

const INDUSTRIES = [
  "Fashion",
  "Beauty and Cosmetics",
  "Skincare",
  "Food and Beverage",
  "Consumer Electronics",
  "E-commerce",
  "Luxury Products",
  "Fitness and Lifestyle",
  "Home and Interior",
  "Automotive",
  "Startups",
  "Personal Brands",
  "Other",
];

const BUDGET_TIERS = [
  "Exploring / Starter Scope",
  "Growth / Multi-Creative Campaign",
  "Full Campaign / Agency Retainer",
  "Custom Enterprise Proposal",
];

const TIMELINES = [
  "Urgent Launch (Priority Sprint)",
  "Within 2–3 Weeks",
  "Within 1 Month",
  "Ongoing Monthly Production",
];

interface ProjectInquiryFormProps {
  services: string[];
  initialService?: string;
  initialPackage?: string;
  initialIndustry?: string;
}

export function ProjectInquiryForm({
  services,
  initialService = "",
  initialPackage = "",
  initialIndustry = "",
}: ProjectInquiryFormProps) {
  const sessionFolderId = useMemo(() => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `sess-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }, []);

  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [industry, setIndustry] = useState(initialIndustry || "");
  const [requiredService, setRequiredService] = useState(
    initialService || services[0] || "AI Product Commercials"
  );
  const [budgetRange, setBudgetRange] = useState(
    initialPackage ? `${initialPackage} Tier` : BUDGET_TIERS[1]
  );
  const [expectedDeliverables, setExpectedDeliverables] = useState("");
  const [preferredTimeline, setPreferredTimeline] = useState(TIMELINES[1]);
  const [projectDescription, setProjectDescription] = useState("");
  const [referenceLinksRaw, setReferenceLinksRaw] = useState("");
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  const [attachments, setAttachments] = useState<UploadedAttachment[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<{
    inquiryCode: string;
    emailSent: boolean;
    uploadedCount: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const uploadSingleFile = async (file: File) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    if (!ACCEPTED_MIME_TYPES.has(file.type)) {
      setAttachments((prev) => [
        ...prev,
        {
          id,
          fileName: file.name,
          mimeType: file.type || "unknown",
          sizeBytes: file.size,
          storagePath: "",
          progress: 0,
          status: "error",
          error:
            "Unsupported format. Allowed: JPG, PNG, WebP, AVIF, SVG, MP4, WebM, MOV, PDF.",
        },
      ]);
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      setAttachments((prev) => [
        ...prev,
        {
          id,
          fileName: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          storagePath: "",
          progress: 0,
          status: "error",
          error: "File exceeds the 50 MB per-file upload limit.",
        },
      ]);
      return;
    }

    const safeFileName = `${id}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const storagePath = `inquiries/${sessionFolderId}/${safeFileName}`;

    setAttachments((prev) => [
      ...prev,
      {
        id,
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        storagePath,
        progress: 5,
        status: "uploading",
      },
    ]);

    try {
      // Request optional signed upload URL (or direct Storage path when service key is absent)
      const signRes = await fetch("/api/inquiries/sign-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionFolderId,
          fileName: safeFileName,
          mimeType: file.type,
          sizeBytes: file.size,
        }),
      });

      const signJson = await signRes.json();
      if (!signRes.ok) {
        throw new Error(signJson.error || "Failed to initialize upload.");
      }

      const targetPath = signJson.storagePath || storagePath;
      const supabase = createClient();

      // Use XHR against Supabase Storage REST API for real byte progress reporting
      const uploadEndpoint = signJson.signedUrl
        ? signJson.signedUrl
        : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/inquiry-uploads/${targetPath}`;

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(signJson.signedUrl ? "PUT" : "POST", uploadEndpoint);
        if (!signJson.signedUrl) {
          xhr.setRequestHeader(
            "apikey",
            process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
          );
          xhr.setRequestHeader(
            "Authorization",
            `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!}`
          );
          xhr.setRequestHeader("x-upsert", "false");
        }
        xhr.setRequestHeader("Content-Type", file.type);

        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable) {
            const pct = Math.max(8, Math.round((evt.loaded / evt.total) * 100));
            setAttachments((prev) =>
              prev.map((a) => (a.id === id ? { ...a, progress: pct } : a))
            );
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(
              new Error(
                `Upload failed (${xhr.status}): verify storage permissions or file type.`
              )
            );
          }
        };
        xhr.onerror = () => reject(new Error("Network error during upload."));
        xhr.send(file);
      });

      // Fallback validation reference via supabase client not needed if XHR succeeded
      void supabase;

      setAttachments((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                storagePath: targetPath,
                progress: 100,
                status: "done",
              }
            : a
        )
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setAttachments((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, status: "error", error: msg, progress: 0 } : a
        )
      );
    }
  };

  const handleFilesSelected = (fileList: FileList | null) => {
    if (!fileList) return;
    setFormError(null);
    const remainingSlots = MAX_FILES - attachments.length;
    if (remainingSlots <= 0) {
      setFormError(`Maximum of ${MAX_FILES} files per brief reached.`);
      return;
    }
    const chosen = Array.from(fileList).slice(0, remainingSlots);
    chosen.forEach((f) => void uploadSingleFile(f));
  };

  const validateStep = (targetStep: number): boolean => {
    setFormError(null);
    if (step === 1 && targetStep > 1) {
      if (fullName.trim().length < 2) {
        setFormError("Please enter your full name.");
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setFormError("Please enter a valid email address.");
        return false;
      }
      if (!industry) {
        setFormError("Please select your brand's industry.");
        return false;
      }
    }
    if (step === 2 && targetStep > 2) {
      if (!requiredService) {
        setFormError("Please choose the required creative service.");
        return false;
      }
    }
    if (step === 3 && targetStep > 3) {
      if (attachments.some((a) => a.status === "uploading")) {
        setFormError("Please wait for active file uploads to complete.");
        return false;
      }
      if (projectDescription.trim().length < 15) {
        setFormError(
          "Please share at least a brief description (15+ characters) of your product and campaign goals."
        );
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!consentAccepted) {
      setFormError(
        "Please confirm authorization and accept our Privacy Policy to submit."
      );
      return;
    }
    if (attachments.some((a) => a.status === "uploading")) {
      setFormError("Please wait for all uploads to finish.");
      return;
    }

    setSubmitting(true);
    try {
      const referenceLinks = referenceLinksRaw
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean);

      const completedUploads = attachments
        .filter((a) => a.status === "done")
        .map((a) => ({
          fileName: a.fileName,
          mimeType: a.mimeType,
          sizeBytes: a.sizeBytes,
          storagePath: a.storagePath,
        }));

      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceType: "project_brief",
          fullName: fullName.trim(),
          brandName: brandName.trim(),
          email: email.trim(),
          whatsapp: whatsapp.trim(),
          websiteUrl: websiteUrl.trim(),
          industry,
          requiredService,
          budgetRange,
          expectedDeliverables: expectedDeliverables.trim(),
          preferredTimeline,
          projectDescription: projectDescription.trim(),
          referenceLinks,
          consentAccepted,
          honeypot,
          attachments: completedUploads,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to submit project inquiry.");
      }

      setSubmittedResult({
        inquiryCode: data.inquiryCode,
        emailSent: Boolean(data.emailSent),
        uploadedCount: completedUploads.length,
      });
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Submission failed. Please retry."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedResult) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel mx-auto max-w-2xl rounded-3xl p-8 text-center sm:p-12"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-gold/50 bg-wine/80 text-gold">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <span className="mt-6 inline-block font-mono text-xs uppercase tracking-[0.22em] text-gold">
          BRIEF RECEIVED • CONFIRMED
        </span>
        <h2 className="mt-3 font-display text-3xl font-extrabold text-ivory">
          Thank You, {fullName.split(" ")[0]}.
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ivory/75 sm:text-base">
          Your project inquiry and{" "}
          {submittedResult.uploadedCount > 0
            ? `${submittedResult.uploadedCount} uploaded creative asset(s) have`
            : "brief details have"}{" "}
          been securely logged for review by our creative production team.
        </p>

        <div className="mt-8 rounded-2xl border border-gold/30 bg-ivory/[0.04] px-6 py-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ivory/60">
            Unique Inquiry ID
          </p>
          <p className="mt-1 font-mono text-2xl font-bold tracking-wider text-gold">
            {submittedResult.inquiryCode}
          </p>
          <p className="mt-2 text-xs text-ivory/65">
            {submittedResult.emailSent
              ? `An acknowledgment email was sent to ${email}.`
              : "Please save this Inquiry ID for your records."}
          </p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/work"
            className="rounded-full border border-gold/50 bg-gradient-to-r from-burgundy to-wine px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] text-ivory"
          >
            Explore Portfolio
          </Link>
          <Link
            href="/"
            className="rounded-full border border-ivory/20 bg-ivory/[0.04] px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-ivory/85"
          >
            Return Home
          </Link>
        </div>
      </motion.div>
    );
  }

  const STEP_LABELS = [
    "Brand & Contact",
    "Scope & Budget",
    "Brief & Materials",
    "Review & Submit",
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-panel mx-auto max-w-4xl rounded-3xl p-6 sm:p-10"
      noValidate
    >
      {/* Honeypot trap */}
      <input
        type="text"
        name="company_fax"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      {/* Step Indicator */}
      <div className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {STEP_LABELS.map((label, i) => {
          const s = i + 1;
          const active = s === step;
          const completed = s < step;
          return (
            <button
              key={label}
              type="button"
              onClick={() => {
                if (s < step || validateStep(s)) setStep(s);
              }}
              className={cn(
                "flex items-center gap-2.5 rounded-2xl border px-3.5 py-2.5 text-left transition-all",
                active
                  ? "border-gold/60 bg-wine/70 text-ivory"
                  : completed
                  ? "border-gold/30 bg-ivory/[0.05] text-gold"
                  : "border-ivory/10 bg-ivory/[0.02] text-ivory/50"
              )}
            >
              <span className="font-mono text-xs font-bold">
                0{s}
              </span>
              <span className="truncate text-xs font-medium">{label}</span>
            </button>
          );
        })}
      </div>

      {formError && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-2.5 rounded-2xl border border-red-400/40 bg-red-950/50 px-4 py-3 text-xs text-red-100 sm:text-sm"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
          <span>{formError}</span>
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            className="grid gap-5 sm:grid-cols-2"
          >
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ivory/75">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Morgan"
                className="w-full rounded-2xl border border-ivory/15 bg-obsidian/80 px-4 py-3 text-sm text-ivory placeholder:text-ivory/35 focus:border-gold focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ivory/75">
                Business or Brand Name
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Atelier Noir"
                className="w-full rounded-2xl border border-ivory/15 bg-obsidian/80 px-4 py-3 text-sm text-ivory placeholder:text-ivory/35 focus:border-gold focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ivory/75">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@brand.com"
                className="w-full rounded-2xl border border-ivory/15 bg-obsidian/80 px-4 py-3 text-sm text-ivory placeholder:text-ivory/35 focus:border-gold focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ivory/75">
                WhatsApp Number
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+1 555 000 0000"
                className="w-full rounded-2xl border border-ivory/15 bg-obsidian/80 px-4 py-3 text-sm text-ivory placeholder:text-ivory/35 focus:border-gold focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ivory/75">
                Website or Social Media URL
              </label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://yourbrand.com"
                className="w-full rounded-2xl border border-ivory/15 bg-obsidian/80 px-4 py-3 text-sm text-ivory placeholder:text-ivory/35 focus:border-gold focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ivory/75">
                Industry *
              </label>
              <select
                required
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full rounded-2xl border border-ivory/15 bg-obsidian/90 px-4 py-3 text-sm text-ivory focus:border-gold focus:outline-none"
              >
                <option value="">Select Industry</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            className="grid gap-5 sm:grid-cols-2"
          >
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ivory/75">
                Required Service *
              </label>
              <select
                value={requiredService}
                onChange={(e) => setRequiredService(e.target.value)}
                className="w-full rounded-2xl border border-ivory/15 bg-obsidian/90 px-4 py-3 text-sm text-ivory focus:border-gold focus:outline-none"
              >
                {services.map((svc) => (
                  <option key={svc} value={svc}>
                    {svc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ivory/75">
                Project Budget / Scope Tier
              </label>
              <select
                value={budgetRange}
                onChange={(e) => setBudgetRange(e.target.value)}
                className="w-full rounded-2xl border border-ivory/15 bg-obsidian/90 px-4 py-3 text-sm text-ivory focus:border-gold focus:outline-none"
              >
                {BUDGET_TIERS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
                {initialPackage &&
                  !BUDGET_TIERS.includes(`${initialPackage} Tier`) && (
                    <option value={`${initialPackage} Tier`}>
                      {initialPackage} Tier
                    </option>
                  )}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ivory/75">
                Preferred Timeline
              </label>
              <select
                value={preferredTimeline}
                onChange={(e) => setPreferredTimeline(e.target.value)}
                className="w-full rounded-2xl border border-ivory/15 bg-obsidian/90 px-4 py-3 text-sm text-ivory focus:border-gold focus:outline-none"
              >
                {TIMELINES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ivory/75">
                Expected Deliverables
              </label>
              <input
                type="text"
                value={expectedDeliverables}
                onChange={(e) => setExpectedDeliverables(e.target.value)}
                placeholder="e.g., 1x 30s Hero Film (16:9), 3x 15s Paid Social Hooks (9:16), 5 Key Visual Stills"
                className="w-full rounded-2xl border border-ivory/15 bg-obsidian/80 px-4 py-3 text-sm text-ivory placeholder:text-ivory/35 focus:border-gold focus:outline-none"
              />
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step-3"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            className="space-y-6"
          >
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ivory/75">
                Project Description & Marketing Objectives *
              </label>
              <textarea
                rows={4}
                required
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Describe your product, target audience, desired atmosphere, key selling points, and where the campaign will run..."
                className="w-full rounded-2xl border border-ivory/15 bg-obsidian/80 px-4 py-3 text-sm text-ivory placeholder:text-ivory/35 focus:border-gold focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ivory/75">
                Reference Links (Optional — one per line)
              </label>
              <textarea
                rows={2}
                value={referenceLinksRaw}
                onChange={(e) => setReferenceLinksRaw(e.target.value)}
                placeholder="https://example.com/moodboard"
                className="w-full rounded-2xl border border-ivory/15 bg-obsidian/80 px-4 py-3 text-sm text-ivory placeholder:text-ivory/35 focus:border-gold focus:outline-none"
              />
            </div>

            {/* Multi-File Cloud Storage Dropzone */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-medium uppercase tracking-wider text-ivory/75">
                  Upload Product Photos, Raw Videos, Logos & References
                </label>
                <span className="font-mono text-[11px] text-ivory/50">
                  Max {MAX_FILES} files • 50 MB each
                </span>
              </div>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFilesSelected(e.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer rounded-3xl border border-dashed border-gold/40 bg-ivory/[0.03] p-8 text-center transition-colors hover:border-gold hover:bg-wine/25"
              >
                <UploadCloud className="mx-auto h-8 w-8 text-gold" />
                <p className="mt-3 text-sm font-semibold text-ivory">
                  Click to browse or drag & drop files here
                </p>
                <p className="mt-1 text-xs text-ivory/60">
                  JPG, PNG, WebP, SVG, MP4, WebM, MOV, PDF — uploaded securely
                  to private cloud storage
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/mp4,video/webm,video/quicktime,application/pdf"
                  onChange={(e) => {
                    handleFilesSelected(e.target.files);
                    e.currentTarget.value = "";
                  }}
                  className="hidden"
                />
              </div>

              {attachments.length > 0 && (
                <ul className="mt-4 space-y-2.5">
                  {attachments.map((att) => (
                    <li
                      key={att.id}
                      className="rounded-2xl border border-ivory/10 bg-obsidian/80 px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <FileCheck2
                            className={cn(
                              "h-4 w-4 shrink-0",
                              att.status === "error"
                                ? "text-red-400"
                                : att.status === "done"
                                ? "text-gold"
                                : "text-ivory/60"
                            )}
                          />
                          <div className="min-w-0">
                            <p className="truncate text-xs font-medium text-ivory">
                              {att.fileName}
                            </p>
                            <p className="text-[11px] text-ivory/55">
                              {formatBytes(att.sizeBytes)} •{" "}
                              {att.status === "uploading"
                                ? `Uploading ${att.progress}%`
                                : att.status === "done"
                                ? "Uploaded securely"
                                : att.error}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setAttachments((prev) =>
                              prev.filter((item) => item.id !== att.id)
                            )
                          }
                          aria-label={`Remove ${att.fileName}`}
                          className="rounded-lg p-1.5 text-ivory/50 transition-colors hover:bg-ivory/10 hover:text-red-300"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {att.status === "uploading" && (
                        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-ivory/15">
                          <div
                            className="h-full bg-gold transition-all duration-150"
                            style={{ width: `${att.progress}%` }}
                          />
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step-4"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            className="space-y-6"
          >
            <div className="rounded-2xl border border-ivory/10 bg-obsidian/75 p-5 space-y-3 text-sm">
              <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-gold">
                Brief Summary
              </h3>
              <dl className="grid gap-3 sm:grid-cols-2 text-xs">
                <div>
                  <dt className="text-ivory/50">Client</dt>
                  <dd className="font-medium text-ivory">
                    {fullName} {brandName ? `(${brandName})` : ""}
                  </dd>
                </div>
                <div>
                  <dt className="text-ivory/50">Email</dt>
                  <dd className="font-medium text-ivory">{email}</dd>
                </div>
                <div>
                  <dt className="text-ivory/50">Industry & Service</dt>
                  <dd className="font-medium text-ivory">
                    {industry} • {requiredService}
                  </dd>
                </div>
                <div>
                  <dt className="text-ivory/50">Scope & Timeline</dt>
                  <dd className="font-medium text-ivory">
                    {budgetRange} • {preferredTimeline}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-ivory/50">Uploaded Files</dt>
                  <dd className="font-medium text-gold">
                    {attachments.filter((a) => a.status === "done").length}{" "}
                    file(s) staged securely
                  </dd>
                </div>
              </dl>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-ivory/15 bg-ivory/[0.03] p-4">
              <input
                type="checkbox"
                checked={consentAccepted}
                onChange={(e) => setConsentAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 accent-gold"
              />
              <span className="text-xs leading-relaxed text-ivory/80">
                I confirm I hold rights to share the uploaded brand materials
                and references, agree to the{" "}
                <Link href="/privacy" className="text-gold underline">
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link href="/terms" className="text-gold underline">
                  Terms & Conditions
                </Link>
                , and consent to RAPID MOTION STUDIO contacting me regarding
                this project brief.
              </span>
            </label>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="mt-8 flex items-center justify-between border-t border-ivory/10 pt-6">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            className="inline-flex items-center gap-2 rounded-full border border-ivory/20 bg-ivory/[0.04] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-ivory/85 hover:border-gold/40"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back</span>
          </button>
        ) : (
          <span />
        )}

        {step < 4 ? (
          <button
            type="button"
            onClick={() => {
              const next = step + 1;
              if (validateStep(next)) setStep(next);
            }}
            className="inline-flex items-center gap-2 rounded-full border border-gold/55 bg-gradient-to-r from-burgundy to-wine px-7 py-3 text-xs font-bold uppercase tracking-[0.16em] text-ivory"
          >
            <span>Continue</span>
            <ArrowRight className="h-3.5 w-3.5 text-gold" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-full border border-gold/60 bg-gradient-to-r from-burgundy via-[#681829] to-burgundy px-8 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-ivory shadow-[0_12px_32px_-8px_rgba(216,180,119,0.5)] disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-gold" />
                <span>Submitting Brief...</span>
              </>
            ) : (
              <>
                <span>Submit Project Brief</span>
                <CheckCircle2 className="h-4 w-4 text-gold" />
              </>
            )}
          </button>
        )}
      </div>
    </form>
  );
}
