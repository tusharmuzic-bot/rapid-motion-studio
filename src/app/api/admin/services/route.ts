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

const createServiceSchema = z.object({
  number_label: z.string().trim().min(1).max(16).default("09"),
  title: z.string().trim().min(2).max(160),
  slug: z.string().trim().max(160).optional(),
  short_description: z.string().trim().min(5).max(500),
  business_value: z.string().trim().max(2000).default(""),
  creative_approach: z.string().trim().max(2000).default(""),
  deliverables: z.array(z.string().trim().max(200)).max(20).default([]),
  ideal_for: z.array(z.string().trim().max(160)).max(15).default([]),
  hero_image_url: assetUrlSchema.default(""),
  video_url: assetUrlSchema.default(""),
  cta_label: z.string().trim().max(80).default("Request Proposal"),
  display_order: z.number().int().min(0).max(999).default(0),
  is_published: z.boolean().default(true),
});

export async function GET() {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ services: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const parsed = createServiceSchema.safeParse(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const d = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .insert({
      ...d,
      slug: slugify(d.slug || d.title),
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await logAdminActivity(
    supabase,
    auth.admin,
    "service.created",
    "services",
    data.id,
    `Created service "${data.title}"`
  );
  revalidateVeloraPublic(["services"]);
  return NextResponse.json({ service: data }, { status: 201 });
}
