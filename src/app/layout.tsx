import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Manrope } from "next/font/google";
import { MotionProvider } from "@/components/motion-provider";
import { getSiteSettings } from "@/lib/data";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#151313",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rapid-motion-studio.vercel.app";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: settings.seo_title || `${settings.brand_name} — ${settings.tagline}`,
      template: `%s | ${settings.brand_name}`,
    },
    description: settings.seo_description,
    keywords: [
      "AI video production studio",
      "commercial production studio",
      "AI product commercials",
      "brand films",
      "AI product photography",
      "creative production agency",
      "AI-generated brand campaigns",
      "RAPID MOTION STUDIO",
    ],
    openGraph: {
      type: "website",
      siteName: settings.brand_name,
      title: settings.seo_title,
      description: settings.seo_description,
      images: settings.og_image_url
        ? [
            {
              url: settings.og_image_url,
              width: 1200,
              height: 630,
              alt: settings.brand_name,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: settings.seo_title,
      description: settings.seo_description,
      images: settings.og_image_url ? [settings.og_image_url] : [],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${inter.variable} ${jetbrainsMono.variable} dark h-full`}
    >
      <body className="min-h-full bg-charcoal text-ivory antialiased selection:bg-gold/30 selection:text-ivory">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
