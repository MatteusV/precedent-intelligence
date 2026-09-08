"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CaseSpine } from "@/components/app/case-spine";
import { SectionLabel } from "@/components/app/section-label";
import { cn } from "@/lib/utils";
import type { DocketCase } from "@/lib/docket-case";

/**
 * Office canvas with a persistent case rail and a mobile case strip.
 */
export function OfficeShell({
  cases,
  children,
}: {
  readonly cases: readonly DocketCase[];
  readonly children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      {cases.length > 0 ? (
        <nav
          aria-label="Casos do escritório"
          className="flex gap-2 overflow-x-auto border-b border-border/80 px-4 py-2 lg:hidden"
        >
          {cases.map((docketCase) => {
            const href = `/app/casos/${docketCase.id}`;
            const isActive =
              pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "shrink-0 rounded-md border px-3 py-1.5 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  isActive
                    ? "border-primary/40 bg-muted/60"
                    : "border-border hover:bg-muted/40",
                )}
                href={href}
                key={docketCase.id}
              >
                <span className="block font-mono text-[10px] tracking-wider text-primary uppercase">
                  {docketCase.tribunalLabel}
                </span>
                <span className="block max-w-[10rem] truncate text-xs">
                  {docketCase.title}
                </span>
              </Link>
            );
          })}
        </nav>
      ) : null}

      <aside className="hidden border-r border-border/80 lg:flex lg:flex-col">
        <div className="flex items-center justify-between px-4 py-4">
          <SectionLabel className="text-muted-foreground">Casos</SectionLabel>
          <Link
            className="text-xs text-primary outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
            href="/app/casos/novo"
          >
            Novo
          </Link>
        </div>
        <nav
          aria-label="Casos do escritório"
          className="min-h-0 flex-1 overflow-y-auto"
        >
          {cases.length === 0 ? (
            <p className="px-4 text-sm text-muted-foreground">
              Nenhum caso ainda.
            </p>
          ) : (
            <ul>
              {cases.map((docketCase) => {
                const href = `/app/casos/${docketCase.id}`;
                const isActive =
                  pathname === href || pathname.startsWith(`${href}/`);

                return (
                  <li key={docketCase.id}>
                    <Link
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "block border-l-2 px-4 py-3 outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
                        isActive
                          ? "border-primary bg-muted/40"
                          : "border-transparent hover:bg-muted/30",
                      )}
                      href={href}
                    >
                      <p className="font-mono text-[10px] tracking-wider text-primary uppercase">
                        {docketCase.tribunalLabel}
                      </p>
                      <p className="mt-1 truncate text-sm">{docketCase.title}</p>
                      <p className="mt-1 truncate text-[11px] text-muted-foreground">
                        {docketCase.nextAction.label}
                      </p>
                      <div className="mt-2">
                        <CaseSpine stages={docketCase.stages} variant="ticks" />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </nav>
      </aside>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
