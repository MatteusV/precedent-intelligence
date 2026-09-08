"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { Plus } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
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

  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="flex h-14 items-center gap-3 px-4 sm:gap-4 sm:px-6">
        <BrandMark
          className="hidden sm:flex"
          compact={false}
          href={hasOffice ? "/app" : "/app/escritorio"}
        />
        <BrandMark
          className="sm:hidden"
          compact
          href={hasOffice ? "/app" : "/app/escritorio"}
        />

        {hasOffice ? (
          <nav
            aria-label="Áreas do escritório"
            className="flex items-center gap-1 text-sm"
          >
            <Link
              aria-current={isCasos ? "page" : undefined}
              className={cn(
                "rounded-md px-2.5 py-1.5 outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
                isCasos
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
              href="/app"
            >
              Casos
            </Link>
          </nav>
        ) : null}

        <div className="ml-auto flex items-center gap-2">
          {hasOffice ? (
            <>
              <Button asChild size="sm">
                <Link href="/app/casos/novo">
                  <Plus />
                  <span className="hidden sm:inline">Novo caso</span>
                  <span className="sm:hidden">Novo</span>
                </Link>
              </Button>
              <OrganizationSwitcher
                afterCreateOrganizationUrl="/app"
                afterSelectOrganizationUrl="/app"
                appearance={{
                  elements: {
                    rootBox: "flex items-center",
                    organizationSwitcherTrigger:
                      "rounded-md border border-border bg-background px-2 py-1 text-sm",
                  },
                }}
                hidePersonal
              />
            </>
          ) : null}
          <UserButton />
        </div>
      </div>
    </header>
  );
}
