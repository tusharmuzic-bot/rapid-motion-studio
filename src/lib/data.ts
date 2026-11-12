import { createClient } from "@supabase/supabase-js";
import { cacheLife, cacheTag } from "next/cache";
import type {
  BeforeAfterComparison,
  FaqItem,
  PortfolioCategory,
  PortfolioProject,
  PricingPackage,
  ServiceItem,
  SiteSettings,
  TestimonialItem,
} from "./types";

function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

export async function getSiteSettings(): Promise<SiteSettings> {
  "use cache";
  cacheLife("minutes");
  cacheTag("rapid-motion-public", "settings");

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  return (
    (data as SiteSettings | null) ?? {
      id: 1,
      brand_name: "RAPID MOTION STUDIO",
      tagline: "THE ART OF MOVING IDEAS.",
      logo_url: "/assets/rapid-motion-logo.png",
      favicon_url: "/icon.png",
      announcement_enabled: false,
      announcement_text: "",
      hero_video_url: "/media/videos/hero-reel.mp4",
      hero_mobile_video_url: "/media/videos/hero-reel-mobile.mp4",
      hero_poster_url: "/media/generated/perfume-after.jpg",
      showreel_video_url: "/media/videos/rapid-motion-showreel.mp4",
      showreel_poster_url: "/media/generated/automotive-after.jpg",
      contact_email: "",
      whatsapp_number: "",
      social_links: {},
      theme_accent: {
        burgundy: "#4B101B",
        wine: "#290B12",
        gold: "#D8B477",
        metallicGold: "#B78B50",
        ivory: "#F5F0E8",
        charcoal: "#151313",
        rose: "#A77C80",
      },
      seo_title: "RAPID MOTION STUDIO — THE ART OF MOVING IDEAS.",
      seo_description:
        "An AI-powered creative production studio creating cinematic advertisements, product commercials, brand films, and premium marketing content without traditional shoots.",
      og_image_url: "/media/generated/perfume-after.jpg",
      footer_tagline: "THE ART OF MOVING IDEAS.",
      footer_copyright: "RAPID MOTION STUDIO. All rights reserved.",
    }
  );
}

export async function getSiteContentMap(): Promise<
  Record<string, Record<string, unknown>>
> {
  "use cache";
  cacheLife("minutes");
  cacheTag("rapid-motion-public", "content");

  const supabase = createPublicClient();
  const { data } = await supabase.from("site_content").select("key, content");
  const map: Record<string, Record<string, unknown>> = {};
  for (const row of data ?? []) {
    map[row.key] = (row.content as Record<string, unknown>) ?? {};
  }
  return map;
}

export async function getPortfolioCategories(): Promise<PortfolioCategory[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("rapid-motion-public", "portfolio");

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("portfolio_categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });
  return (data as PortfolioCategory[]) ?? [];
}

export async function getPublishedProjects(): Promise<PortfolioProject[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("rapid-motion-public", "portfolio");

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("portfolio_projects")
    .select("*, category:portfolio_categories(*)")
    .eq("is_published", true)
    .order("display_order", { ascending: true });
  return (data as PortfolioProject[]) ?? [];
}

export async function getProjectBySlug(
  slug: string
): Promise<PortfolioProject | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("rapid-motion-public", "portfolio");

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("portfolio_projects")
    .select("*, category:portfolio_categories(*)")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  return (data as PortfolioProject | null) ?? null;
}

export async function getPublishedComparisons(): Promise<
  BeforeAfterComparison[]
> {
  "use cache";
  cacheLife("minutes");
  cacheTag("rapid-motion-public", "comparisons");

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("before_after_comparisons")
    .select("*")
    .eq("is_published", true)
    .order("display_order", { ascending: true });
  return (data as BeforeAfterComparison[]) ?? [];
}

export async function getPublishedServices(): Promise<ServiceItem[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("rapid-motion-public", "services");

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("services")
    .select("*")
    .eq("is_published", true)
    .order("display_order", { ascending: true });
  return (data as ServiceItem[]) ?? [];
}

export async function getServiceBySlug(
  slug: string
): Promise<ServiceItem | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("rapid-motion-public", "services");

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("services")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  return (data as ServiceItem | null) ?? null;
}

export async function getPublishedPricing(): Promise<PricingPackage[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("rapid-motion-public", "pricing");

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("pricing_packages")
    .select("*")
    .eq("is_published", true)
    .order("display_order", { ascending: true });
  return (data as PricingPackage[]) ?? [];
}

export async function getPublishedFaqs(): Promise<FaqItem[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("rapid-motion-public", "faqs");

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("faqs")
    .select("*")
    .eq("is_published", true)
    .order("display_order", { ascending: true });
  return (data as FaqItem[]) ?? [];
}

export async function getPublishedTestimonials(): Promise<TestimonialItem[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("rapid-motion-public", "testimonials");

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("testimonials")
    .select("*")
    .eq("is_approved", true)
    .eq("is_published", true)
    .order("display_order", { ascending: true });
  return (data as TestimonialItem[]) ?? [];
}
