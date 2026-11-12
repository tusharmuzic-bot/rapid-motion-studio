import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-auth";
import { logAdminActivity, zodErrorResponse } from "@/lib/admin-api-helpers";
import { revalidateStudioPublic } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

const createPricingSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().max(120).optional(),
  tagline: z.string().trim().max(200).default(""),
  price_label: z.string().trim().min(2).max(120).default("Custom Quote"),
  deliverables_summary: z.string().trim().max(300).default(""),
  video_duration_summary: z.string().trim().max(160).default(""),
  revisions_summary: z.string().trim().max(160).default(""),
  delivery_timeline: z.string().trim().max(160).default(""),
  included_services: z.array(z.string().trim().max(200)).max(20).default([]),
  additional_benefits: z.array(z.string().trim().max(200)).max(20).default([]),
  cta_label: z.string().trim().max(80).default("Request Custom Quote"),
  is_highlighted: z.boolean().default(false),
  is_published: z.boolean().default(true),
  display_order: z.number().int().min(0).max(999).default(0),
});

export async function GET() {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pricing_packages")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ packages: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const parsed = createPricingSchema.safeParse(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const d = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pricing_packages")
    .insert({
      ...d,
      slug: slugify(d.slug || d.name),
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await logAdminActivity(
    supabase,
    auth.admin,
    "pricing.created",
    "pricing_packages",
    data.id,
    `Created pricing package "${data.name}"`
  );
  revalidateStudioPublic(["pricing"]);
  return NextResponse.json({ package: data }, { status: 201 });
}
