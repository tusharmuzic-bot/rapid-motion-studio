import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  const supabase = await createClient();

  const [
    projectsRes,
    newInquiriesRes,
    totalInquiriesRes,
    servicesRes,
    mediaRes,
    recentInquiriesRes,
    logsRes,
  ] = await Promise.all([
    supabase
      .from("portfolio_projects")
      .select("id, is_published, project_type"),
    supabase
      .from("client_inquiries")
      .select("id", { count: "exact", head: true })
      .eq("status", "New"),
    supabase
      .from("client_inquiries")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("services")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true),
    supabase.from("media_assets").select("id", { count: "exact", head: true }),
    supabase
      .from("client_inquiries")
      .select("id, inquiry_code, full_name, brand_name, required_service, status, source_type, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(12),
  ]);

  const allProjects = projectsRes.data ?? [];
  const publishedProjects = allProjects.filter((p) => p.is_published).length;

  return NextResponse.json({
    kpis: {
      totalProjects: allProjects.length,
      publishedProjects,
      demoProjects: allProjects.filter((p) => p.project_type === "Demo Concept")
        .length,
      clientProjects: allProjects.filter(
        (p) => p.project_type === "Client Production"
      ).length,
      newInquiries: newInquiriesRes.count ?? 0,
      totalInquiries: totalInquiriesRes.count ?? 0,
      publishedServices: servicesRes.count ?? 0,
      mediaAssets: mediaRes.count ?? 0,
    },
    recentInquiries: recentInquiriesRes.data ?? [],
    activityLogs: logsRes.data ?? [],
  });
}
