import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/legal-document";
import { getSiteContentMap } from "@/lib/data";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How RAPID MOTION STUDIO handles client inquiry details and uploaded assets.",
};

export default async function PrivacyPage() {
  const content = await getSiteContentMap();
  return <LegalDocument content={content.legal_privacy} fallbackTitle="Privacy Policy" />;
}
