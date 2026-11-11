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

const patchServiceSchema = z.object({
  number_label: z.string().trim().min(1).max(16).optional(),
  title: z.string().trim().min(2).max(160).optional(),
  slug: z.string().trim().min(2).max(160).optional(),
  short_description: z.string().trim().min(5).max(500).optional(),
  business_value: z.string().trim().max(2000).optional(),
  creative_approach: z.string().trim().max(2000).optional(),
  deliverables: z.array(z.string().trim().max(200)).max(20).optional(),
  ideal_for: z.array(z.string().trim().max(160)).max(15).optional(),
  hero_image_url: assetUrlSchema.optional(),
  video_url: assetUrlSchema.optional(),
  cta_label: z.string().trim().max(80).optional(),
  display_order: z.number().int().min(0).max(999).optional(),
  is_published: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const body = await request.json();
  const parsed = patchServiceSchema.safeParse(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const updates = { ...parsed.data };
  if (updates.slug) updates.slug = slugify(updates.slug);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
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
    "service.updated",
    "services",
    id,
    `Updated service "${data.title}"`
  );
  revalidateVeloraPublic(["services"]);
  revalidatePath(`/services/${data.slug}`);
  return NextResponse.json({ service: data });
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
    .from("services")
    .select("title, slug")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await logAdminActivity(
    supabase,
    auth.admin,
    "service.deleted",
    "services",
    id,
    `Deleted service "${existing?.title || id}"`
  );
  revalidateVeloraPublic(["services"]);
  if (existing?.slug) {
    revalidatePath(`/services/${existing.slug}`);
  }
  return NextResponse.json({ deleted: true });
}
