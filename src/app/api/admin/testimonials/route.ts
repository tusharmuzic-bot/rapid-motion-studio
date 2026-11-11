import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-auth";
import { logAdminActivity, zodErrorResponse } from "@/lib/admin-api-helpers";
import { revalidateVeloraPublic } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/server";

const createTestimonialSchema = z.object({
  client_name: z.string().trim().min(2).max(120),
  role_and_company: z.string().trim().min(2).max(160),
  quote: z.string().trim().min(10).max(2000),
  project_type: z.string().trim().max(120).default("Client Production"),
  is_approved: z.boolean().default(false),
  is_published: z.boolean().default(false),
  display_order: z.number().int().min(0).max(999).default(0),
});

export async function GET() {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ testimonials: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const parsed = createTestimonialSchema.safeParse(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const payload = parsed.data;
  // Security/integrity rule: only approved testimonials may be published
  const isPublished = payload.is_approved ? payload.is_published : false;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("testimonials")
    .insert({
      ...payload,
      is_published: isPublished,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await logAdminActivity(
    supabase,
    auth.admin,
    "testimonial.created",
    "testimonials",
    data.id,
    `Added testimonial from ${data.client_name}`
  );
  revalidateVeloraPublic(["testimonials"]);
  return NextResponse.json({ testimonial: data }, { status: 201 });
}
