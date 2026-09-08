"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { Scale } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Persistent top chrome for every authenticated /app route.
 */
export function AppChrome({
  hasOffice,
}: {
  readonly hasOffice: boolean;
}) {
  const pathname = usePathname();
  const isCasos =
    pathname === "/app" ||
    (pathname.startsWith("/app/casos") && pathname !== "/app/casos/novo");
  const isNovo = pathname === "/app/casos/novo";

  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="flex h-14 items-center gap-4 px-4 sm:px-6">
        <Link
          className="flex items-center gap-2 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          href={hasOffice ? "/app" : "/app/escritorio"}
        >
          <Scale className="size-4 text-primary" />
          <span className="hidden font-medium tracking-tight sm:inline">
            Precedent Intelligence
          </span>
          <span className="font-medium tracking-tight sm:hidden">PI</span>
        </Link>

        {hasOffice ? (
          <nav
            aria-label="Áreas do escritório"
            className="flex items-center gap-1 text-sm"
          >
            <Link
              className={cn(
                "rounded-md px-2.5 py-1.5 outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
                isCasos
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              href="/app"
            >
              Casos
            </Link>
            <Link
              className={cn(
                "rounded-md px-2.5 py-1.5 outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
                isNovo
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              href="/app/casos/novo"
            >
              Novo caso
            </Link>
          </nav>
        ) : null}

        <div className="ml-auto flex items-center gap-2">
          {hasOffice ? (
            <OrganizationSwitcher
              appearance={{
                elements: {
                  rootBox: "flex items-center",
                  organizationSwitcherTrigger:
                    "rounded-md border border-border bg-background px-2 py-1 text-sm",
                },
              }}
              hidePersonal
            />
          ) : null}
          <UserButton />
        </div>
      </div>
    </header>
  );
}
