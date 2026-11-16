import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  brandName?: string;
  compact?: boolean;
  logoUrl?: string;
  surface?: "dark" | "ivory";
  showWordmark?: boolean;
}

export function BrandLogo({
  className,
  brandName = BRAND.name,
  compact = false,
  logoUrl,
  surface = "dark",
  showWordmark = false,
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
      {/* Official Brand Logo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={resolvedLogoSrc}
        alt={`${brandName} logo`}
        className="h-8 w-auto max-w-[130px] object-contain transition-all duration-300 group-hover:scale-[1.04] group-hover:drop-shadow-[0_0_14px_rgba(243,90,42,0.45)] sm:h-9"
      />

      {showWordmark && !compact && (
        <span
          className={cn(
            "hidden flex-col border-l pl-3.5 leading-none sm:flex",
            isIvorySurface ? "border-charcoal/20" : "border-ivory/20"
          )}
        >
          <span
            className={cn(
              "font-display text-[11px] font-bold tracking-[0.24em] uppercase transition-colors group-hover:text-gold",
              isIvorySurface ? "text-charcoal" : "text-ivory"
            )}
          >
            {firstTwo}
          </span>
          <span
            className={cn(
              "mt-1 font-mono text-[9px] font-semibold tracking-[0.3em] uppercase transition-colors",
              isIvorySurface ? "text-burgundy/90" : "text-[#F35A2A] group-hover:text-gold"
            )}
          >
            {remaining}
          </span>
        </span>
      )}
    </Link>
  );
}
