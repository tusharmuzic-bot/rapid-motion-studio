"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Upload,
  Loader2,
  Trash2,
  Copy,
  Film,
  Image as ImageIcon,
  Save,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  AdminConfirmDialog,
  AdminPageHeader,
  adminInputClass,
  adminLabelClass,
  useAdminToast,
} from "@/components/admin/admin-ui";
import type { MediaAsset } from "@/lib/types";
import { cn, formatBytes } from "@/lib/utils";

interface SiteSlots {
  hero_video_url: string;
  hero_mobile_video_url: string;
  hero_poster_url: string;
  showreel_video_url: string;
  showreel_poster_url: string;
  og_image_url: string;
  logo_url: string;
}

const EMPTY_SLOTS: SiteSlots = {
  hero_video_url: "",
  hero_mobile_video_url: "",
  hero_poster_url: "",
  showreel_video_url: "",
  showreel_poster_url: "",
  og_image_url: "",
  logo_url: "",
};

export default function AdminMediaPage() {
  const { pushToast } = useAdminToast();
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [slots, setSlots] = useState<SiteSlots>(EMPTY_SLOTS);
  const [loading, setLoading] = useState(true);
  const [savingSlots, setSavingSlots] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);
  const [kindFilter, setKindFilter] = useState<"all" | "video" | "image">("all");
  const [deleteTarget, setDeleteTarget] = useState<MediaAsset | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/media", { cache: "no-store" });
      const json = await res.json();
      setAssets(json.assets ?? []);
      setSlots({ ...EMPTY_SLOTS, ...(json.slots ?? {}) });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function saveSlots() {
    setSavingSlots(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slots),
      });
      if (!res.ok) {
        const j = await res.json();
        pushToast(j.error || "Failed to update site slots", "error");
        return;
      }
      pushToast("Hero & Showreel slots saved and published", "success");
    } finally {
      setSavingSlots(false);
    }
  }

  async function handleDirectUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    targetSlot: keyof SiteSlots | "library",
    assetKind: "video" | "image"
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingSlot(targetSlot);

    try {
      const supabase = createClient();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const folder = assetKind === "video" ? "videos" : "images";
      const storagePath = `${folder}/${Date.now()}-${safeName}`;

      const { error: uploadErr } = await supabase.storage
        .from("velora-media")
        .upload(storagePath, file, { contentType: file.type, upsert: false });

      if (uploadErr) {
        pushToast(uploadErr.message || "Storage upload failed", "error");
        return;
      }

      const { data: pub } = supabase.storage
        .from("velora-media")
        .getPublicUrl(storagePath);
      const publicUrl = pub.publicUrl;

      await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: file.name,
          alt_text: file.name,
          asset_kind: assetKind,
          usage_slot:
            targetSlot.startsWith("hero")
              ? "hero"
              : targetSlot.startsWith("showreel")
              ? "showreel"
              : "general",
          bucket_name: "velora-media",
          storage_path: storagePath,
          public_url: publicUrl,
          mime_type: file.type,
          file_size_bytes: file.size,
          assignSiteSlot: targetSlot === "library" ? "none" : targetSlot,
        }),
      });

      if (targetSlot !== "library") {
        setSlots((prev) => ({ ...prev, [targetSlot]: publicUrl }));
      }
      pushToast(`Uploaded ${file.name}`, "success");
      await loadData();
    } finally {
      setUploadingSlot(null);
      e.target.value = "";
    }
  }

  async function assignExistingAsset(asset: MediaAsset, slotKey: keyof SiteSlots) {
    const res = await fetch(`/api/admin/media/${asset.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignSiteSlot: slotKey }),
    });
    if (res.ok) {
      setSlots((prev) => ({ ...prev, [slotKey]: asset.public_url }));
      pushToast(`Assigned to ${slotKey.replace(/_/g, " ")}`, "success");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/media/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        pushToast("Media asset removed", "success");
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

  const slotCards: Array<{
    key: keyof SiteSlots;
    label: string;
    kind: "video" | "image";
    accept: string;
  }> = [
    {
      key: "hero_video_url",
      label: "Hero Background Video (Desktop)",
      kind: "video",
      accept: "video/mp4,video/webm",
    },
    {
      key: "hero_mobile_video_url",
      label: "Hero Mobile Fallback Video",
      kind: "video",
      accept: "video/mp4,video/webm",
    },
    {
      key: "hero_poster_url",
      label: "Hero Fallback Poster Image",
      kind: "image",
      accept: "image/*",
    },
    {
      key: "showreel_video_url",
      label: "Main Studio Showreel Video",
      kind: "video",
      accept: "video/mp4,video/webm",
    },
    {
      key: "showreel_poster_url",
      label: "Showreel Custom Thumbnail Image",
      kind: "image",
      accept: "image/*",
    },
  ];

  const filteredAssets =
    kindFilter === "all"
      ? assets
      : assets.filter((a) => a.asset_kind === kindFilter);

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow="Modules C & D • Media Control"
        title="Videos, Posters & Asset Library"
        description="Upload MP4/WebM reels and high-resolution images directly to Supabase Storage (velora-media) and assign active Hero & Showreel slots."
        actions={
          <button
            type="button"
            onClick={saveSlots}
            disabled={savingSlots}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold to-gold-warm px-4 py-2.5 text-xs font-semibold text-obsidian disabled:opacity-50"
          >
            {savingSlots ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Slot Assignments
          </button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-gold" />
        </div>
      ) : (
        <>
          {/* Active Hero & Showreel Slot Manager */}
          <section className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-ivory">
              Active Homepage Video &amp; Poster Slots
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {slotCards.map((slot) => (
                <div key={slot.key} className="glass-card rounded-3xl p-5">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <label className={adminLabelClass}>{slot.label}</label>
                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gold/30 bg-gold/10 px-2.5 py-1 text-[11px] font-medium text-gold hover:bg-gold/20">
                      {uploadingSlot === slot.key ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Upload className="h-3 w-3" />
                      )}
                      <span>Replace File</span>
                      <input
                        type="file"
                        accept={slot.accept}
                        onChange={(e) =>
                          handleDirectUpload(e, slot.key, slot.kind)
                        }
                        className="hidden"
                      />
                    </label>
                  </div>

                  {slots[slot.key] ? (
                    slot.kind === "video" ? (
                      <video
                        key={slots[slot.key]}
                        src={slots[slot.key]}
                        controls
                        muted
                        playsInline
                        preload="metadata"
                        className="mb-3 h-40 w-full rounded-2xl border border-ivory/10 bg-black object-cover"
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={slots[slot.key]}
                        alt={slot.label}
                        className="mb-3 h-40 w-full rounded-2xl border border-ivory/10 object-cover"
                      />
                    )
                  ) : null}

                  <input
                    type="text"
                    value={slots[slot.key]}
                    onChange={(e) =>
                      setSlots((prev) => ({
                        ...prev,
                        [slot.key]: e.target.value,
                      }))
                    }
                    className={`${adminInputClass} font-mono text-xs`}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Media Library */}
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h2 className="font-display text-lg font-semibold text-ivory">
                  Studio Media Library ({filteredAssets.length})
                </h2>
                <div className="inline-flex rounded-xl border border-ivory/15 bg-charcoal p-1">
                  {(["all", "video", "image"] as const).map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setKindFilter(k)}
                      className={cn(
                        "rounded-lg px-3 py-1 text-xs capitalize transition",
                        kindFilter === k
                          ? "bg-wine text-gold"
                          : "text-ivory/65 hover:text-ivory"
                      )}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-gold/30 bg-gold/10 px-3.5 py-2 text-xs font-medium text-gold hover:bg-gold/20">
                  <Film className="h-3.5 w-3.5" />
                  <span>Upload Video</span>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    onChange={(e) => handleDirectUpload(e, "library", "video")}
                    className="hidden"
                  />
                </label>
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-ivory/20 bg-charcoal px-3.5 py-2 text-xs font-medium text-ivory hover:border-gold/40">
                  <ImageIcon className="h-3.5 w-3.5 text-gold" />
                  <span>Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleDirectUpload(e, "library", "image")}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="glass-card flex flex-col justify-between rounded-3xl p-4"
                >
                  <div>
                    {asset.asset_kind === "video" ? (
                      <video
                        src={asset.public_url}
                        muted
                        playsInline
                        preload="metadata"
                        controls
                        className="h-40 w-full rounded-2xl border border-ivory/10 bg-black object-cover"
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={asset.public_url}
                        alt={asset.alt_text || asset.title}
                        className="h-40 w-full rounded-2xl border border-ivory/10 object-cover"
                      />
                    )}
                    <div className="mt-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-full border border-gold/25 bg-wine/40 px-2 py-0.5 font-mono text-[10px] uppercase text-gold">
                          {asset.usage_slot}
                        </span>
                        <span className="font-mono text-[10px] text-ivory/50">
                          {formatBytes(asset.file_size_bytes)}
                        </span>
                      </div>
                      <h3 className="mt-1.5 truncate text-sm font-medium text-ivory">
                        {asset.title}
                      </h3>
                      <p className="mt-0.5 truncate font-mono text-[10px] text-ivory/50">
                        {asset.public_url}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-ivory/10 pt-3">
                    <select
                      aria-label={`Assign ${asset.title} to slot`}
                      defaultValue=""
                      onChange={(e) => {
                        const val = e.target.value as keyof SiteSlots | "";
                        if (val) assignExistingAsset(asset, val);
                        e.target.value = "";
                      }}
                      className="rounded-lg border border-ivory/15 bg-charcoal px-2 py-1 text-[11px] text-ivory/80"
                    >
                      <option value="">Assign Slot...</option>
                      {asset.asset_kind === "video" ? (
                        <>
                          <option value="hero_video_url">Hero Desktop Video</option>
                          <option value="hero_mobile_video_url">Hero Mobile Video</option>
                          <option value="showreel_video_url">Showreel Video</option>
                        </>
                      ) : (
                        <>
                          <option value="hero_poster_url">Hero Poster</option>
                          <option value="showreel_poster_url">Showreel Poster</option>
                          <option value="og_image_url">SEO OG Image</option>
                          <option value="logo_url">Studio Logo</option>
                        </>
                      )}
                    </select>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(asset.public_url);
                          pushToast("Copied URL to clipboard", "info");
                        }}
                        title="Copy URL"
                        className="rounded-lg border border-ivory/15 p-1.5 text-ivory/70 hover:border-gold/40 hover:text-ivory"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(asset)}
                        title="Delete Asset"
                        className="rounded-lg border border-rose-400/25 p-1.5 text-rose-200 hover:bg-rose-500/15"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      <AdminConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Media Asset?"
        message={`Remove "${deleteTarget?.title}" from the library${deleteTarget?.storage_path ? " and Supabase Storage" : ""}?`}
        busy={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
