import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-auth";
import { logAdminActivity, zodErrorResponse } from "@/lib/admin-api-helpers";
import { revalidateStudioPublic } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/server";

const patchTestimonialSchema = z.object({
  client_name: z.string().trim().min(2).max(120).optional(),
  role_and_company: z.string().trim().min(2).max(160).optional(),
  quote: z.string().trim().min(10).max(2000).optional(),
  project_type: z.string().trim().max(120).optional(),
  is_approved: z.boolean().optional(),
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
  const parsed = patchTestimonialSchema.safeParse(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const supabase = await createClient();
  const updates = { ...parsed.data };
  if (updates.is_approved === false) {
    updates.is_published = false;
  }

  const { data, error } = await supabase
    .from("testimonials")
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
    "testimonial.updated",
    "testimonials",
    id,
    `Updated testimonial from ${data.client_name}`
  );
  revalidateStudioPublic(["testimonials"]);
  return NextResponse.json({ testimonial: data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi("admin");
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const supabase = await createClient();
  const { error } = await supabase.from("testimonials").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await logAdminActivity(
    supabase,
    auth.admin,
    "testimonial.deleted",
    "testimonials",
    id,
    `Deleted testimonial ${id}`
  );
  revalidateStudioPublic(["testimonials"]);
  return NextResponse.json({ deleted: true });
}
