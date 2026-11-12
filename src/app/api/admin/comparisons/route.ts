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

const createComparisonSchema = z.object({
  title: z.string().trim().min(2).max(160),
  category_label: z.string().trim().min(2).max(120),
  description: z.string().trim().min(5).max(500),
  before_image_url: assetUrlSchema,
  after_image_url: assetUrlSchema,
  display_order: z.number().int().min(0).max(999).default(0),
  is_published: z.boolean().default(true),
});

export async function GET() {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("before_after_comparisons")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ comparisons: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const parsed = createComparisonSchema.safeParse(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("before_after_comparisons")
    .insert(parsed.data)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await logAdminActivity(
    supabase,
    auth.admin,
    "comparison.created",
    "before_after_comparisons",
    data.id,
    `Added Before/After showcase "${data.title}"`
  );
  revalidateStudioPublic(["comparisons"]);
  return NextResponse.json({ comparison: data }, { status: 201 });
}
