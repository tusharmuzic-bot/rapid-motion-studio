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

const createProjectSchema = z.object({
  kind: z.literal("project").optional(),
  title: z.string().trim().min(2).max(160),
  slug: z.string().trim().max(160).optional(),
  category_id: z.string().uuid().nullable().optional(),
  brand_or_industry: z.string().trim().min(2).max(160),
  project_type: z.enum(["Demo Concept", "Client Production"]),
  short_description: z.string().trim().min(5).max(500),
  full_description: z.string().trim().max(4000).default(""),
  creative_concept: z.string().trim().max(4000).default(""),
  production_highlights: z.array(z.string().trim().max(240)).max(12).default([]),
  duration_label: z.string().trim().max(40).default("0:30"),
  thumbnail_url: assetUrlSchema.default(""),
  video_url: assetUrlSchema.default(""),
  mobile_video_url: assetUrlSchema.default(""),
  before_image_url: assetUrlSchema.default(""),
  after_image_url: assetUrlSchema.default(""),
  before_after_caption: z.string().trim().max(300).default(""),
  is_featured: z.boolean().default(false),
  is_published: z.boolean().default(true),
  display_order: z.number().int().min(0).max(9999).default(0),
});

const createCategorySchema = z.object({
  kind: z.literal("category"),
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().max(100).optional(),
  description: z.string().trim().max(300).default(""),
  display_order: z.number().int().min(0).max(999).default(0),
  is_active: z.boolean().default(true),
});

export async function GET() {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  const supabase = await createClient();
  const [projectsRes, categoriesRes] = await Promise.all([
    supabase
      .from("portfolio_projects")
      .select("*, category:portfolio_categories(*)")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false }),
    supabase
      .from("portfolio_categories")
      .select("*")
      .order("display_order", { ascending: true }),
  ]);

  if (projectsRes.error) {
    return NextResponse.json({ error: projectsRes.error.message }, { status: 500 });
  }

  return NextResponse.json({
    projects: projectsRes.data ?? [],
    categories: categoriesRes.data ?? [],
  });
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const supabase = await createClient();

  if (body?.kind === "category") {
    const parsedCat = createCategorySchema.safeParse(body);
    if (!parsedCat.success) return zodErrorResponse(parsedCat.error);
    const slug = slugify(parsedCat.data.slug || parsedCat.data.name);

    const { data, error } = await supabase
      .from("portfolio_categories")
      .insert({
        name: parsedCat.data.name,
        slug,
        description: parsedCat.data.description,
        display_order: parsedCat.data.display_order,
        is_active: parsedCat.data.is_active,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await logAdminActivity(
      supabase,
      auth.admin,
      "category.created",
      "portfolio_categories",
      data.id,
      `Created portfolio category "${data.name}"`
    );
    revalidateVeloraPublic(["portfolio"]);
    return NextResponse.json({ category: data }, { status: 201 });
  }

  const parsed = createProjectSchema.safeParse(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const d = parsed.data;
  const finalSlug = slugify(d.slug || d.title);

  const { data, error } = await supabase
    .from("portfolio_projects")
    .insert({
      title: d.title,
      slug: finalSlug,
      category_id: d.category_id || null,
      brand_or_industry: d.brand_or_industry,
      project_type: d.project_type,
      short_description: d.short_description,
      full_description: d.full_description,
      creative_concept: d.creative_concept,
      production_highlights: d.production_highlights,
      duration_label: d.duration_label,
      thumbnail_url: d.thumbnail_url,
      video_url: d.video_url,
      mobile_video_url: d.mobile_video_url,
      before_image_url: d.before_image_url,
      after_image_url: d.after_image_url,
      before_after_caption: d.before_after_caption,
      is_featured: d.is_featured,
      is_published: d.is_published,
      display_order: d.display_order,
    })
    .select("*, category:portfolio_categories(*)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await logAdminActivity(
    supabase,
    auth.admin,
    "project.created",
    "portfolio_projects",
    data.id,
    `Created portfolio project "${data.title}" (${data.project_type})`
  );
  revalidateVeloraPublic(["portfolio"]);
  return NextResponse.json({ project: data }, { status: 201 });
}
