import { BeforeAfterShowcase } from "@/components/home/before-after-showcase";
import { HeroSection } from "@/components/home/hero-section";
import { PricingAndFaq } from "@/components/home/pricing-and-faq";
import { ProcessAndAdvantages } from "@/components/home/process-and-advantages";
import { ServicesGrid } from "@/components/home/services-grid";
import { ShowreelSection } from "@/components/home/showreel-section";
import { PortfolioShowcase } from "@/components/portfolio/portfolio-showcase";
import { BRAND } from "@/lib/brand";
import {
  getPortfolioCategories,
  getPublishedComparisons,
  getPublishedFaqs,
  getPublishedPricing,
  getPublishedProjects,
  getPublishedServices,
  getPublishedTestimonials,
  getSiteContentMap,
  getSiteSettings,
} from "@/lib/data";

export default async function HomePage() {
  const [
    settings,
    contentMap,
    categories,
    projects,
    comparisons,
    services,
    pricing,
    faqs,
    testimonials,
  ] = await Promise.all([
    getSiteSettings(),
    getSiteContentMap(),
    getPortfolioCategories(),
    getPublishedProjects(),
    getPublishedComparisons(),
    getPublishedServices(),
    getPublishedPricing(),
    getPublishedFaqs(),
    getPublishedTestimonials(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: settings.brand_name,
    description: settings.seo_description,
    url: process.env.NEXT_PUBLIC_SITE_URL || BRAND.defaultSiteUrl,
    slogan: settings.tagline,
    serviceType: [
      "AI Video Production",
      "Commercial Production",
      "Brand Films",
      "Product Visualization",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. Cinematic 4K Hero */}
      <HeroSection settings={settings} content={contentMap.hero} />

      {/* 2. Brand Introduction & Cinema Showreel */}
      <ShowreelSection
        videoUrl={settings.showreel_video_url}
        posterUrl={settings.showreel_poster_url}
        content={contentMap.showreel}
      />

      {/* 3. Selected Creative Work (Portfolio Early!) */}
      <PortfolioShowcase
        projects={projects}
        categories={categories}
        limit={6}
      />

      {/* 4. Before & After Transformation */}
      <BeforeAfterShowcase
        comparisons={comparisons}
        content={contentMap.before_after}
      />

      {/* 5. Our Services */}
      <ServicesGrid services={services} />

      {/* 6 & 7. How We Create, Advantages & Industries */}
      <ProcessAndAdvantages
        howItWorksContent={contentMap.how_it_works}
        btsContent={contentMap.behind_the_scenes}
      />

      {/* 8. Pricing & FAQs */}
      <PricingAndFaq
        packages={pricing}
        faqs={faqs}
        testimonials={testimonials}
      />
    </>
  );
}
