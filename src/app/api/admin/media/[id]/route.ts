import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-auth";
import { logAdminActivity, zodErrorResponse } from "@/lib/admin-api-helpers";
import { revalidateStudioPublic } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/server";

const patchMediaSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  alt_text: z.string().trim().max(300).optional(),
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
    .optional(),
  assignSiteSlot: z
    .enum([
      "hero_video_url",
      "hero_mobile_video_url",
      "hero_poster_url",
      "showreel_video_url",
      "showreel_poster_url",
      "og_image_url",
      "logo_url",
    ])
    .optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const body = await request.json();
  const parsed = patchMediaSchema.safeParse(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const supabase = await createClient();
  const { assignSiteSlot, ...updates } = parsed.data;

  const { data: asset, error } = await supabase
    .from("media_assets")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (assignSiteSlot && asset.public_url) {
    await supabase
      .from("site_settings")
      .update({ [assignSiteSlot]: asset.public_url })
      .eq("id", 1);
    revalidateStudioPublic(["settings"]);
  }

  await logAdminActivity(
    supabase,
    auth.admin,
    "media.updated",
    "media_assets",
    id,
    `Updated media asset "${asset.title}"${assignSiteSlot ? ` -> ${assignSiteSlot}` : ""}`
  );

  return NextResponse.json({ asset });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi("admin");
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("media_assets")
    .select("title, bucket_name, storage_path")
    .eq("id", id)
    .maybeSingle();

  if (existing?.bucket_name === "rapid-motion-media" && existing.storage_path) {
    await supabase.storage.from("rapid-motion-media").remove([existing.storage_path]);
  }

  const { error } = await supabase.from("media_assets").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await logAdminActivity(
    supabase,
    auth.admin,
    "media.deleted",
    "media_assets",
    id,
    `Deleted media asset "${existing?.title || id}"`
  );

  return NextResponse.json({ deleted: true });
}
