import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/legal-document";
import { getSiteContentMap } from "@/lib/data";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Essential cookie usage for RAPID MOTION STUDIO.",
};

export default async function CookiesPage() {
  const content = await getSiteContentMap();
  return <LegalDocument content={content.legal_cookies} fallbackTitle="Cookie Policy" />;
}
