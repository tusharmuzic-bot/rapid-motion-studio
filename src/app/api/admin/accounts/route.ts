import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-auth";
import { logAdminActivity, zodErrorResponse } from "@/lib/admin-api-helpers";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

const createAdminSchema = z.object({
  email: z.string().trim().email().max(200),
  full_name: z.string().trim().min(2).max(120),
  password: z.string().min(10).max(128),
  role: z.enum(["admin", "editor"]).default("admin"),
});

const patchAccountSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("change_password"),
    new_password: z.string().min(10).max(128),
  }),
  z.object({
    action: z.literal("update_admin"),
    id: z.string().uuid(),
    full_name: z.string().trim().min(2).max(120).optional(),
    role: z.enum(["super_admin", "admin", "editor"]).optional(),
    is_active: z.boolean().optional(),
  }),
]);

export async function GET() {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("admin_users")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    admins: data ?? [],
    currentAdmin: auth.admin,
    hasServiceRoleKey: Boolean(createServiceRoleClient()),
  });
}

export async function POST(request: Request) {
  const auth = await requireAdminApi("super_admin");
  if ("error" in auth) return auth.error;

  const serviceClient = createServiceRoleClient();
  if (!serviceClient) {
    return NextResponse.json(
      {
        error:
          "Creating additional team admins directly requires SUPABASE_SERVICE_ROLE_KEY in your server environment variables.",
      },
      { status: 400 }
    );
  }

  const body = await request.json();
  const parsed = createAdminSchema.safeParse(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const { email, full_name, password, role } = parsed.data;
  const { data: created, error: authErr } =
    await serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    });

  if (authErr || !created.user) {
    return NextResponse.json(
      { error: authErr?.message || "Failed to provision auth user" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { data: adminRow, error: rowErr } = await supabase
    .from("admin_users")
    .insert({
      id: created.user.id,
      email,
      full_name,
      role,
      is_active: true,
    })
    .select("*")
    .single();

  if (rowErr) {
    return NextResponse.json({ error: rowErr.message }, { status: 400 });
  }

  await logAdminActivity(
    supabase,
    auth.admin,
    "admin.created",
    "admin_users",
    adminRow.id,
    `Created ${role} account for ${email}`
  );

  return NextResponse.json({ admin: adminRow }, { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const parsed = patchAccountSchema.safeParse(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const supabase = await createClient();

  if (parsed.data.action === "change_password") {
    const { error } = await supabase.auth.updateUser({
      password: parsed.data.new_password,
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    await logAdminActivity(
      supabase,
      auth.admin,
      "admin.password_updated",
      "admin_users",
      auth.admin.id,
      `${auth.admin.email} updated their password`
    );
    return NextResponse.json({ updated: true });
  }

  if (auth.admin.role !== "super_admin") {
    return NextResponse.json(
      { error: "Only super_admin can modify admin roles or activation status." },
      { status: 403 }
    );
  }

  const { id, full_name, role, is_active } = parsed.data;
  if (id === auth.admin.id && is_active === false) {
    return NextResponse.json(
      { error: "You cannot deactivate your own active Super Admin session." },
      { status: 400 }
    );
  }

  const updates: Record<string, unknown> = {};
  if (full_name !== undefined) updates.full_name = full_name;
  if (role !== undefined) updates.role = role;
  if (is_active !== undefined) updates.is_active = is_active;

  const { data, error } = await supabase
    .from("admin_users")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await logAdminActivity(
    supabase,
    auth.admin,
    "admin.updated",
    "admin_users",
    id,
    `Updated admin ${data.email}`
  );

  return NextResponse.json({ admin: data });
}
