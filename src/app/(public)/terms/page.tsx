import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/legal-document";
import { getSiteContentMap } from "@/lib/data";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Commercial production terms, uploaded asset authorization, and AI usage rights.",
};

export default async function TermsPage() {
  const content = await getSiteContentMap();
  return <LegalDocument content={content.legal_terms} fallbackTitle="Terms & Conditions" />;
}
