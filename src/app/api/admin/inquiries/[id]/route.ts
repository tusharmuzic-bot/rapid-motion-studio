import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-auth";
import { logAdminActivity, zodErrorResponse } from "@/lib/admin-api-helpers";
import { createClient } from "@/lib/supabase/server";

const INQUIRY_STATUSES = [
  "New",
  "Contacted",
  "Proposal Sent",
  "In Discussion",
  "Approved",
  "In Production",
  "Completed",
  "Rejected",
] as const;

const patchInquirySchema = z.object({
  status: z.enum(INQUIRY_STATUSES).optional(),
  internal_notes: z.string().max(8000).optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const supabase = await createClient();

  const [inquiryRes, assetsRes] = await Promise.all([
    supabase.from("client_inquiries").select("*").eq("id", id).maybeSingle(),
    supabase.from("media_assets").select("*").eq("inquiry_id", id),
  ]);

  if (inquiryRes.error) {
    return NextResponse.json({ error: inquiryRes.error.message }, { status: 500 });
  }
  if (!inquiryRes.data) {
    return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
  }

  const attachments = await Promise.all(
    (assetsRes.data ?? []).map(async (asset) => {
      let signedUrl: string | null = null;
      if (asset.bucket_name === "inquiry-uploads" && asset.storage_path) {
        const { data: signed } = await supabase.storage
          .from("inquiry-uploads")
          .createSignedUrl(asset.storage_path, 3600);
        signedUrl = signed?.signedUrl ?? null;
      } else if (asset.public_url) {
        signedUrl = asset.public_url;
      }
      return {
        ...asset,
        signed_url: signedUrl,
      };
    })
  );

  return NextResponse.json({
    inquiry: inquiryRes.data,
    attachments,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const body = await request.json();
  const parsed = patchInquirySchema.safeParse(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("client_inquiries")
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
    "inquiry.updated",
    "client_inquiries",
    id,
    `Updated inquiry ${data.inquiry_code}${parsed.data.status ? ` -> ${parsed.data.status}` : ""}`
  );

  return NextResponse.json({ inquiry: data });
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
    .from("client_inquiries")
    .select("inquiry_code")
    .eq("id", id)
    .maybeSingle();

  const { data: assets } = await supabase
    .from("media_assets")
    .select("id, bucket_name, storage_path")
    .eq("inquiry_id", id);

  const privatePaths = (assets ?? [])
    .filter((a) => a.bucket_name === "inquiry-uploads" && a.storage_path)
    .map((a) => a.storage_path);

  if (privatePaths.length > 0) {
    await supabase.storage.from("inquiry-uploads").remove(privatePaths);
  }

  const { error } = await supabase.from("client_inquiries").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await logAdminActivity(
    supabase,
    auth.admin,
    "inquiry.deleted",
    "client_inquiries",
    id,
    `Deleted inquiry ${existing?.inquiry_code || id}`
  );

  return NextResponse.json({ deleted: true });
}
