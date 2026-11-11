import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-auth";
import { logAdminActivity, zodErrorResponse } from "@/lib/admin-api-helpers";
import { revalidateVeloraPublic } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/server";

const updateContentSchema = z.object({
  key: z.string().trim().min(2).max(100),
  section: z.string().trim().min(2).max(100).optional(),
  label: z.string().trim().min(2).max(160).optional(),
  content: z.record(z.string(), z.unknown()),
});

export async function GET() {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_content")
    .select("*")
    .order("key", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ blocks: data ?? [] });
}

export async function PUT(request: Request) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const parsed = updateContentSchema.safeParse(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const supabase = await createClient();
  const { key, section, label, content } = parsed.data;

  const { data: existing } = await supabase
    .from("site_content")
    .select("section, label")
    .eq("key", key)
    .maybeSingle();

  const { data, error } = await supabase
    .from("site_content")
    .upsert({
      key,
      section: section || existing?.section || key,
      label: label || existing?.label || key,
      content,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await logAdminActivity(
    supabase,
    auth.admin,
    "content.updated",
    "site_content",
    key,
    `Updated site content block "${data.label}"`
  );
  revalidateVeloraPublic(["content"]);
  return NextResponse.json({ block: data });
}
