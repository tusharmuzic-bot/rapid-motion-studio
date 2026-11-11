import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-auth";
import { logAdminActivity, zodErrorResponse } from "@/lib/admin-api-helpers";
import { revalidateVeloraPublic } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/server";

const createFaqSchema = z.object({
  question: z.string().trim().min(5).max(300),
  answer: z.string().trim().min(5).max(3000),
  category: z.string().trim().min(2).max(100).default("General"),
  display_order: z.number().int().min(0).max(999).default(0),
  is_published: z.boolean().default(true),
});

export async function GET() {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("faqs")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ faqs: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const parsed = createFaqSchema.safeParse(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("faqs")
    .insert(parsed.data)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await logAdminActivity(
    supabase,
    auth.admin,
    "faq.created",
    "faqs",
    data.id,
    `Created FAQ "${data.question.slice(0, 60)}"`
  );
  revalidateVeloraPublic(["faqs"]);
  return NextResponse.json({ faq: data }, { status: 201 });
}
