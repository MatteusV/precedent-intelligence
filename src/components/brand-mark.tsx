import Link from "next/link";
import { Scale } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Product mark used on marketing, auth, and office chrome.
 */
export function BrandMark({
  href,
  compact = false,
  className,
}: {
  readonly href: string;
  readonly compact?: boolean;
  readonly className?: string;
}) {
  return (
    <Link
      className={cn(
        "flex items-center gap-2 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
      href={href}
    >
      <Scale className="size-4 text-primary" />
      {compact ? (
        <span className="font-medium tracking-tight">PI</span>
      ) : (
        <span className="font-medium tracking-tight">
          Precedent Intelligence
        </span>
      )}
    </Link>
  );
}
