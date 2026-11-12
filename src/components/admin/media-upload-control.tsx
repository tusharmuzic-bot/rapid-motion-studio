"use client";

import { useState } from "react";
import { Upload, Loader2, FolderOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { MediaAsset } from "@/lib/types";
import { adminInputClass, AdminModal, useAdminToast } from "./admin-ui";

interface MediaUploadInputProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  assetKind: "image" | "video";
  usageSlot?: MediaAsset["usage_slot"];
  placeholder?: string;
}

export function MediaUrlOrUploadField({
  value,
  onChange,
  accept = "image/*",
  assetKind,
  usageSlot = "general",
  placeholder = "/media/generated/... or https://...",
}: MediaUploadInputProps) {
  const { pushToast } = useAdminToast();
  const [uploading, setUploading] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [libraryAssets, setLibraryAssets] = useState<MediaAsset[]>([]);
  const [loadingLib, setLoadingLib] = useState(false);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const supabase = createClient();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const folder = assetKind === "video" ? "videos" : "images";
      const storagePath = `${folder}/${Date.now()}-${safeName}`;

      const { error: uploadErr } = await supabase.storage
        .from("rapid-motion-media")
        .upload(storagePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadErr) {
        pushToast(uploadErr.message || "Storage upload failed", "error");
        setUploading(false);
        return;
      }

      const { data: pub } = supabase.storage
        .from("rapid-motion-media")
        .getPublicUrl(storagePath);

      const publicUrl = pub.publicUrl;

      await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: file.name,
          alt_text: file.name,
          asset_kind: assetKind,
          usage_slot: usageSlot,
          bucket_name: "rapid-motion-media",
          storage_path: storagePath,
          public_url: publicUrl,
          mime_type: file.type,
          file_size_bytes: file.size,
        }),
      });

      onChange(publicUrl);
      pushToast(`Uploaded ${file.name}`, "success");
    } catch {
      pushToast("Upload failed. Please verify file size (<50 MB).", "error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function openLibrary() {
    setLibraryOpen(true);
    setLoadingLib(true);
    try {
      const res = await fetch(`/api/admin/media?kind=${assetKind}`, {
        cache: "no-store",
      });
      const json = await res.json();
      setLibraryAssets(json.assets ?? []);
    } catch {
      setLibraryAssets([]);
    } finally {
      setLoadingLib(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${adminInputClass} min-w-[200px] flex-1 font-mono text-xs`}
        />
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-gold/30 bg-gold/10 px-3 py-2 text-xs font-medium text-gold transition hover:bg-gold/20">
          {uploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="h-3.5 w-3.5" />
          )}
          <span>{uploading ? "Uploading..." : "Upload"}</span>
          <input
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />
        </label>
        <button
          type="button"
          onClick={openLibrary}
          className="inline-flex items-center gap-1.5 rounded-xl border border-ivory/15 bg-charcoal px-3 py-2 text-xs text-ivory/80 transition hover:border-gold/35 hover:text-ivory"
        >
          <FolderOpen className="h-3.5 w-3.5" />
          <span>Library</span>
        </button>
      </div>

      <AdminModal
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        title={`Select ${assetKind === "video" ? "Video" : "Image"} Asset`}
        subtitle="Pick from uploaded or bundled studio media"
      >
        {loadingLib ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-gold" />
          </div>
        ) : libraryAssets.length === 0 ? (
          <p className="py-10 text-center text-sm text-ivory/60">
            No {assetKind} assets found yet. Upload one directly.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {libraryAssets.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onChange(item.public_url);
                  setLibraryOpen(false);
                }}
                className="flex items-center gap-3 rounded-2xl border border-ivory/15 bg-charcoal/80 p-3 text-left transition hover:border-gold/45"
              >
                {item.asset_kind === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.public_url}
                    alt={item.title}
                    className="h-14 w-20 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-lg bg-wine/50 font-mono text-[10px] text-gold">
                    MP4
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-ivory">
                    {item.title}
                  </p>
                  <p className="mt-0.5 truncate font-mono text-[10px] text-ivory/50">
                    {item.public_url}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </AdminModal>
    </div>
  );
}
