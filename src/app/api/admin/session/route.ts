import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdminApi } from "@/lib/admin-auth";

export async function GET() {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;
  return NextResponse.json({ admin: auth.admin });
}

export async function POST() {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  const supabase = await createClient();
  const now = new Date().toISOString();

  await supabase
    .from("admin_users")
    .update({ last_login_at: now })
    .eq("id", auth.admin.id);

  await supabase.from("activity_logs").insert({
    event_type: "admin.login",
    entity_type: "admin_users",
    entity_id: auth.admin.id,
    summary: `${auth.admin.email} signed in to Studio Admin`,
    actor_email: auth.admin.email,
  });

  return NextResponse.json({
    admin: { ...auth.admin, last_login_at: now },
  });
}
