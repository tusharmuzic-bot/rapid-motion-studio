import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";

interface LegalSection {
  heading: string;
  body: string;
}

interface LegalDocumentProps {
  content?: Record<string, unknown>;
  fallbackTitle: string;
}

export function LegalDocument({ content, fallbackTitle }: LegalDocumentProps) {
  const title = (content?.title as string) || fallbackTitle;
  const lastUpdated = (content?.lastUpdated as string) || "Editable via Admin";
  const notice = (content?.notice as string) || "";
  const sections = (content?.sections as LegalSection[]) || [];

  return (
    <div className="py-12 sm:py-20">
      <div className="mx-auto max-w-4xl px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-ivory/70 hover:text-gold"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Studio</span>
        </Link>

        <div className="mt-6 glass-panel rounded-3xl p-8 sm:p-12">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-gold">
            LEGAL & TRUST • {lastUpdated}
          </span>
          <h1 className="mt-3 font-display text-3xl font-extrabold text-ivory sm:text-5xl">
            {title}
          </h1>

          {notice && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-gold/30 bg-wine/40 p-4 text-xs leading-relaxed text-ivory/80">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <span>{notice}</span>
            </div>
          )}

          <div className="mt-10 space-y-8">
            {sections.map((sec) => (
              <section key={sec.heading} className="space-y-2">
                <h2 className="font-display text-lg font-bold text-ivory">
                  {sec.heading}
                </h2>
                <p className="text-sm leading-relaxed text-ivory/75">
                  {sec.body}
                </p>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
