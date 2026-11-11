import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-auth";
import { logAdminActivity, zodErrorResponse } from "@/lib/admin-api-helpers";
import { revalidateVeloraPublic } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/server";

const patchFaqSchema = z.object({
  question: z.string().trim().min(5).max(300).optional(),
  answer: z.string().trim().min(5).max(3000).optional(),
  category: z.string().trim().min(2).max(100).optional(),
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
  const parsed = patchFaqSchema.safeParse(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("faqs")
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
    "faq.updated",
    "faqs",
    id,
    `Updated FAQ "${data.question.slice(0, 60)}"`
  );
  revalidateVeloraPublic(["faqs"]);
  return NextResponse.json({ faq: data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi("admin");
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const supabase = await createClient();
  const { error } = await supabase.from("faqs").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await logAdminActivity(
    supabase,
    auth.admin,
    "faq.deleted",
    "faqs",
    id,
    `Deleted FAQ ${id}`
  );
  revalidateVeloraPublic(["faqs"]);
  return NextResponse.json({ deleted: true });
}
