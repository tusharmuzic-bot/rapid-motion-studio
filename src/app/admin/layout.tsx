import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Studio Control Panel",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-obsidian text-ivory">{children}</div>;
}
