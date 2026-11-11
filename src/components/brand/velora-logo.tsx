import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  brandName?: string;
  compact?: boolean;
  logoUrl?: string;
  surface?: "dark" | "ivory";
}

export function BrandLogo({
  className,
  brandName = BRAND.name,
  compact = false,
  logoUrl,
  surface = "dark",
}: BrandLogoProps) {
  const words = brandName.trim().split(/\s+/);
  const firstTwo = words.length >= 2 ? words.slice(0, 2).join(" ") : brandName;
  const remaining = words.length > 2 ? words.slice(2).join(" ") : "STUDIO";

  // Use custom admin-uploaded PNG if provided; otherwise use surface-matched custom PNG mark
  const resolvedLogoSrc =
    logoUrl && logoUrl.trim()
      ? surface === "ivory" && logoUrl === BRAND.logo
        ? BRAND.logoDark
        : logoUrl
      : surface === "ivory"
      ? BRAND.logoDark
      : BRAND.logo;

  const isIvorySurface = surface === "ivory";

  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-3.5 focus:outline-none",
        className
      )}
      aria-label={brandName}
    >
      {/* Clean un-cropped logo mark preserving natural aspect ratio (3:1 horizontal RMS monogram) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={resolvedLogoSrc}
        alt={`${brandName} logo`}
        className="h-6 w-auto max-w-[112px] object-contain transition-transform duration-300 group-hover:scale-[1.03] sm:h-7"
      />

      {!compact && (
        <span
          className={cn(
            "hidden flex-col border-l pl-3 leading-none sm:flex",
            isIvorySurface ? "border-charcoal/20" : "border-ivory/20"
          )}
        >
          <span
            className={cn(
              "font-display text-[11px] font-bold tracking-[0.22em] uppercase",
              isIvorySurface ? "text-charcoal" : "text-ivory"
            )}
          >
            {firstTwo}
          </span>
          <span
            className={cn(
              "mt-1 font-mono text-[9px] font-medium tracking-[0.28em] uppercase",
              isIvorySurface ? "text-burgundy/80" : "text-gold/85"
            )}
          >
            {remaining}
          </span>
        </span>
      )}
    </Link>
  );
}

// Re-export under existing name for clean compatibility across imports
export { BrandLogo as VeloraLogo };
