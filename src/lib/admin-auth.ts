import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AdminRole, AdminUser } from "./types";

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return null;

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("*")
    .eq("id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  return (adminRow as AdminUser | null) ?? null;
}

export async function requireAdmin(minRole?: AdminRole): Promise<AdminUser> {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }
  if (minRole === "super_admin" && admin.role !== "super_admin") {
    redirect("/admin");
  }
  if (minRole === "admin" && admin.role === "editor") {
    redirect("/admin");
  }
  return admin;
}

export async function requireAdminApi(
  minRole?: AdminRole
): Promise<{ admin: AdminUser } | { error: Response }> {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return {
      error: Response.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  if (minRole === "super_admin" && admin.role !== "super_admin") {
    return {
      error: Response.json({ error: "Forbidden: super_admin required" }, { status: 403 }),
    };
  }
  if (minRole === "admin" && admin.role === "editor") {
    return {
      error: Response.json({ error: "Forbidden: admin role required" }, { status: 403 }),
    };
  }
  return { admin };
}

export async function isBootstrapInitialized(): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("app_bootstrap_state")
    .select("admin_initialized")
    .eq("id", 1)
    .maybeSingle();
  return Boolean(data?.admin_initialized);
}
