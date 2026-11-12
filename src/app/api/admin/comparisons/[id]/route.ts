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

const patchComparisonSchema = z.object({
  title: z.string().trim().min(2).max(160).optional(),
  category_label: z.string().trim().min(2).max(120).optional(),
  description: z.string().trim().min(5).max(500).optional(),
  before_image_url: assetUrlSchema.optional(),
  after_image_url: assetUrlSchema.optional(),
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
  const parsed = patchComparisonSchema.safeParse(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("before_after_comparisons")
    .update(parsed.data)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await logAdminActivity(
    supabase,
    auth.admin,
    "comparison.updated",
    "before_after_comparisons",
    id,
    `Updated Before/After showcase "${data.title}"`
  );
  revalidateStudioPublic(["comparisons"]);
  return NextResponse.json({ comparison: data });
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
    .from("before_after_comparisons")
    .select("title")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase
    .from("before_after_comparisons")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await logAdminActivity(
    supabase,
    auth.admin,
    "comparison.deleted",
    "before_after_comparisons",
    id,
    `Deleted Before/After showcase "${existing?.title || id}"`
  );
  revalidateStudioPublic(["comparisons"]);
  return NextResponse.json({ deleted: true });
}
