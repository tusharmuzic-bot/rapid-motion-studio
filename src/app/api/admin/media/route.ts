import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-auth";
import {
  assetUrlSchema,
  logAdminActivity,
  zodErrorResponse,
} from "@/lib/admin-api-helpers";
import { revalidateStudioPublic } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/server";

const registerMediaSchema = z.object({
  title: z.string().trim().min(1).max(200),
  alt_text: z.string().trim().max(300).default(""),
  asset_kind: z.enum(["image", "video", "document"]),
  usage_slot: z
    .enum([
      "hero",
      "showreel",
      "portfolio",
      "service",
      "industry",
      "before_after",
      "general",
    ])
    .default("general"),
  bucket_name: z.string().trim().default("velora-media"),
  storage_path: z.string().trim().max(500).default(""),
  public_url: assetUrlSchema,
  mime_type: z.string().trim().max(120).default(""),
  file_size_bytes: z.number().int().nonnegative().default(0),
  assignSiteSlot: z
    .enum([
      "none",
      "hero_video_url",
      "hero_mobile_video_url",
      "hero_poster_url",
      "showreel_video_url",
      "showreel_poster_url",
      "og_image_url",
      "logo_url",
    ])
    .optional()
    .default("none"),
});

export async function GET(request: Request) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  const url = new URL(request.url);
  const kind = url.searchParams.get("kind");

  const supabase = await createClient();
  let query = supabase
    .from("media_assets")
    .select("*")
    .neq("usage_slot", "inquiry_upload")
    .order("created_at", { ascending: false });

  if (kind && (kind === "image" || kind === "video" || kind === "document")) {
    query = query.eq("asset_kind", kind);
  }

  const [assetsRes, settingsRes] = await Promise.all([
    query,
    supabase
      .from("site_settings")
      .select(
        "hero_video_url, hero_mobile_video_url, hero_poster_url, showreel_video_url, showreel_poster_url, logo_url, og_image_url"
      )
      .eq("id", 1)
      .maybeSingle(),
  ]);

  if (assetsRes.error) {
    return NextResponse.json({ error: assetsRes.error.message }, { status: 500 });
  }

  return NextResponse.json({
    assets: assetsRes.data ?? [],
    slots: settingsRes.data ?? {},
  });
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const parsed = registerMediaSchema.safeParse(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const d = parsed.data;
  const supabase = await createClient();

  const { data: asset, error } = await supabase
    .from("media_assets")
    .insert({
      title: d.title,
      alt_text: d.alt_text,
      asset_kind: d.asset_kind,
      usage_slot: d.usage_slot,
      bucket_name: d.bucket_name,
      storage_path: d.storage_path,
      public_url: d.public_url,
      mime_type: d.mime_type,
      file_size_bytes: d.file_size_bytes,
      uploaded_by: auth.admin.id,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (d.assignSiteSlot && d.assignSiteSlot !== "none" && d.public_url) {
    await supabase
      .from("site_settings")
      .update({ [d.assignSiteSlot]: d.public_url })
      .eq("id", 1);
    revalidateStudioPublic(["settings"]);
  }

  await logAdminActivity(
    supabase,
    auth.admin,
    "media.created",
    "media_assets",
    asset.id,
    `Registered ${d.asset_kind} asset "${d.title}"${d.assignSiteSlot !== "none" ? ` -> ${d.assignSiteSlot}` : ""}`
  );

  return NextResponse.json({ asset }, { status: 201 });
}
