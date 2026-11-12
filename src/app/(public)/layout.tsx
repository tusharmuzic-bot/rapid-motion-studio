import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { StudioCursor } from "@/components/ui/studio-cursor";
import {
  getPublishedServices,
  getSiteContentMap,
  getSiteSettings,
} from "@/lib/data";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, services, contentMap] = await Promise.all([
    getSiteSettings(),
    getPublishedServices(),
    getSiteContentMap(),
  ]);

  return (
    <div className="relative flex min-h-screen flex-col bg-charcoal studio-ambient-bg">
      <StudioCursor />
      <SiteHeader settings={settings} />
      <main className="flex-1">{children}</main>
      <SiteFooter
        settings={settings}
        services={services}
        ctaContent={contentMap.footer_cta}
      />
    </div>
  );
}
