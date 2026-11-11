import type { MetadataRoute } from "next";
import { getPublishedProjects, getPublishedServices } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://rapid-motion-studio.vercel.app";

  const [projects, services] = await Promise.all([
    getPublishedProjects(),
    getPublishedServices(),
  ]);

  const staticRoutes = [
    "",
    "/work",
    "/services",
    "/how-it-works",
    "/about",
    "/start-project",
    "/contact",
    "/privacy",
    "/terms",
    "/cookies",
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const projectRoutes = projects.map((p) => ({
    url: `${baseUrl}/work/${p.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  const serviceRoutes = services.map((s) => ({
    url: `${baseUrl}/services/${s.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  return [...staticRoutes, ...projectRoutes, ...serviceRoutes];
}
