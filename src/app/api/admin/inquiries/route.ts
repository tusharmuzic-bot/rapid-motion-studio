import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  const url = new URL(request.url);
  const status = url.searchParams.get("status")?.trim();
  const source = url.searchParams.get("source")?.trim();
  const q = url.searchParams.get("q")?.trim();

  const supabase = await createClient();
  let query = supabase
    .from("client_inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  if (status && status !== "All") {
    query = query.eq("status", status);
  }
  if (source && source !== "All") {
    query = query.eq("source_type", source);
  }
  if (q) {
    const safeQ = q.replace(/[%_]/g, "");
    query = query.or(
      `full_name.ilike.%${safeQ}%,brand_name.ilike.%${safeQ}%,email.ilike.%${safeQ}%,inquiry_code.ilike.%${safeQ}%,required_service.ilike.%${safeQ}%`
    );
  }

  const { data: inquiries, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const inquiryIds = (inquiries ?? []).map((item) => item.id);
  const attachmentCounts: Record<string, number> = {};

  if (inquiryIds.length > 0) {
    const { data: assets } = await supabase
      .from("media_assets")
      .select("inquiry_id")
      .in("inquiry_id", inquiryIds);

    for (const row of assets ?? []) {
      if (row.inquiry_id) {
        attachmentCounts[row.inquiry_id] =
          (attachmentCounts[row.inquiry_id] || 0) + 1;
      }
    }
  }

  return NextResponse.json({
    inquiries: (inquiries ?? []).map((item) => ({
      ...item,
      attachment_count: attachmentCounts[item.id] || 0,
    })),
  });
}
