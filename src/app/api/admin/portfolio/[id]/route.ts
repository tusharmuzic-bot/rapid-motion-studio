import { revalidatePath } from "next/cache";
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
import { slugify } from "@/lib/utils";

const patchProjectSchema = z.object({
  title: z.string().trim().min(2).max(160).optional(),
  slug: z.string().trim().min(2).max(160).optional(),
  category_id: z.string().uuid().nullable().optional(),
  brand_or_industry: z.string().trim().min(2).max(160).optional(),
  project_type: z.enum(["Demo Concept", "Client Production"]).optional(),
  short_description: z.string().trim().min(5).max(500).optional(),
  full_description: z.string().trim().max(4000).optional(),
  creative_concept: z.string().trim().max(4000).optional(),
  production_highlights: z.array(z.string().trim().max(240)).max(12).optional(),
  duration_label: z.string().trim().max(40).optional(),
  thumbnail_url: assetUrlSchema.optional(),
  video_url: assetUrlSchema.optional(),
  mobile_video_url: assetUrlSchema.optional(),
  before_image_url: assetUrlSchema.optional(),
  after_image_url: assetUrlSchema.optional(),
  before_after_caption: z.string().trim().max(300).optional(),
  is_featured: z.boolean().optional(),
  is_published: z.boolean().optional(),
  display_order: z.number().int().min(0).max(9999).optional(),
});

const patchCategorySchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  slug: z.string().trim().min(2).max(100).optional(),
  description: z.string().trim().max(300).optional(),
  display_order: z.number().int().min(0).max(999).optional(),
  is_active: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const body = await request.json();
  const supabase = await createClient();

  if (type === "category") {
    const parsedCat = patchCategorySchema.safeParse(body);
    if (!parsedCat.success) return zodErrorResponse(parsedCat.error);
    const updates = { ...parsedCat.data };
    if (updates.slug) updates.slug = slugify(updates.slug);

    const { data, error } = await supabase
      .from("portfolio_categories")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    await logAdminActivity(
      supabase,
      auth.admin,
      "category.updated",
      "portfolio_categories",
      id,
      `Updated category "${data.name}"`
    );
    revalidateVeloraPublic(["portfolio"]);
    return NextResponse.json({ category: data });
  }

  const parsed = patchProjectSchema.safeParse(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const updates = { ...parsed.data };
  if (updates.slug) {
    updates.slug = slugify(updates.slug);
  }

  const { data, error } = await supabase
    .from("portfolio_projects")
    .update(updates)
    .eq("id", id)
    .select("*, category:portfolio_categories(*)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await logAdminActivity(
    supabase,
    auth.admin,
    "project.updated",
    "portfolio_projects",
    id,
    `Updated portfolio project "${data.title}"`
  );
  revalidateVeloraPublic(["portfolio"]);
  revalidatePath(`/work/${data.slug}`);
  return NextResponse.json({ project: data });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi("admin");
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const supabase = await createClient();

  if (type === "category") {
    const { data: existing } = await supabase
      .from("portfolio_categories")
      .select("name")
      .eq("id", id)
      .maybeSingle();

    const { error } = await supabase
      .from("portfolio_categories")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await logAdminActivity(
      supabase,
      auth.admin,
      "category.deleted",
      "portfolio_categories",
      id,
      `Deleted category "${existing?.name || id}"`
    );
    revalidateVeloraPublic(["portfolio"]);
    return NextResponse.json({ deleted: true });
  }

  const { data: existing } = await supabase
    .from("portfolio_projects")
    .select("title, slug")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase
    .from("portfolio_projects")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await logAdminActivity(
    supabase,
    auth.admin,
    "project.deleted",
    "portfolio_projects",
    id,
    `Deleted portfolio project "${existing?.title || id}"`
  );
  revalidateVeloraPublic(["portfolio"]);
  if (existing?.slug) {
    revalidatePath(`/work/${existing.slug}`);
  }
  return NextResponse.json({ deleted: true });
}
