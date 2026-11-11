import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-auth";
import {
  assetUrlSchema,
  logAdminActivity,
  zodErrorResponse,
} from "@/lib/admin-api-helpers";
import { revalidateVeloraPublic } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/server";

const settingsSchema = z.object({
  brand_name: z.string().trim().min(2).max(120).optional(),
  tagline: z.string().trim().min(2).max(200).optional(),
  logo_url: assetUrlSchema.optional(),
  favicon_url: assetUrlSchema.optional(),
  announcement_enabled: z.boolean().optional(),
  announcement_text: z.string().trim().max(240).optional(),
  hero_video_url: assetUrlSchema.optional(),
  hero_mobile_video_url: assetUrlSchema.optional(),
  hero_poster_url: assetUrlSchema.optional(),
  showreel_video_url: assetUrlSchema.optional(),
  showreel_poster_url: assetUrlSchema.optional(),
  contact_email: z.string().trim().max(200).optional(),
  whatsapp_number: z.string().trim().max(60).optional(),
  social_links: z.record(z.string(), z.string().trim().max(300)).optional(),
  theme_accent: z.record(z.string(), z.string().trim().max(40)).optional(),
  seo_title: z.string().trim().max(200).optional(),
  seo_description: z.string().trim().max(500).optional(),
  og_image_url: assetUrlSchema.optional(),
  footer_tagline: z.string().trim().max(240).optional(),
  footer_copyright: z.string().trim().max(240).optional(),
});

export async function GET() {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ settings: data });
}

export async function PUT(request: Request) {
  const auth = await requireAdminApi("admin");
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .update(parsed.data)
    .eq("id", 1)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await logAdminActivity(
    supabase,
    auth.admin,
    "settings.updated",
    "site_settings",
    "1",
    `Updated global studio settings`
  );
  revalidateVeloraPublic(["settings"]);
  return NextResponse.json({ settings: data });
}
