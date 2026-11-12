import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-auth";
import { logAdminActivity, zodErrorResponse } from "@/lib/admin-api-helpers";
import { revalidateStudioPublic } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

const patchPricingSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  slug: z.string().trim().min(2).max(120).optional(),
  tagline: z.string().trim().max(200).optional(),
  price_label: z.string().trim().min(2).max(120).optional(),
  deliverables_summary: z.string().trim().max(300).optional(),
  video_duration_summary: z.string().trim().max(160).optional(),
  revisions_summary: z.string().trim().max(160).optional(),
  delivery_timeline: z.string().trim().max(160).optional(),
  included_services: z.array(z.string().trim().max(200)).max(20).optional(),
  additional_benefits: z.array(z.string().trim().max(200)).max(20).optional(),
  cta_label: z.string().trim().max(80).optional(),
  is_highlighted: z.boolean().optional(),
  is_published: z.boolean().optional(),
  display_order: z.number().int().min(0).max(999).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const body = await request.json();
  const parsed = patchPricingSchema.safeParse(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const updates = { ...parsed.data };
  if (updates.slug) updates.slug = slugify(updates.slug);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pricing_packages")
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
    "pricing.updated",
    "pricing_packages",
    id,
    `Updated pricing package "${data.name}"`
  );
  revalidateStudioPublic(["pricing"]);
  return NextResponse.json({ package: data });
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
    .from("pricing_packages")
    .select("name")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase
    .from("pricing_packages")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await logAdminActivity(
    supabase,
    auth.admin,
    "pricing.deleted",
    "pricing_packages",
    id,
    `Deleted pricing package "${existing?.name || id}"`
  );
  revalidateStudioPublic(["pricing"]);
  return NextResponse.json({ deleted: true });
}
