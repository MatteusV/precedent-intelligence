import Link from "next/link";
import { CaseSpine } from "@/components/app/case-spine";
import type { DocketCase } from "@/lib/docket-case";

function formatUpdatedAt(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

/**
 * Court-roll list of cases for the escritório home.
 */
export function DocketTable({
  cases,
}: {
  readonly cases: readonly DocketCase[];
}) {
  if (cases.length === 0) {
    return (
      <div className="border-y border-dashed border-border py-16 text-center">
        <p className="font-folio text-xl text-foreground">Nenhum caso neste escritório</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          Cole o material do caso para abrir o primeiro. O dossiê e a petição
          nascem depois da confirmação do tema.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border border-y border-border">
      {cases.map((docketCase) => (
        <li key={docketCase.id}>
          <Link
            className="grid grid-cols-[4.5rem_minmax(0,1fr)_auto] items-center gap-4 py-4 outline-none transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 sm:grid-cols-[5.5rem_minmax(0,1fr)_auto_5.5rem]"
            href={`/app/casos/${docketCase.id}`}
          >
            <span className="font-mono text-xs tracking-wider text-primary uppercase">
              {docketCase.tribunalLabel}
            </span>
            <span className="truncate font-folio text-lg leading-snug">
              {docketCase.title}
            </span>
            <CaseSpine stages={docketCase.stages} variant="ticks" />
            <time
              className="hidden font-mono text-xs text-muted-foreground sm:block"
              dateTime={docketCase.updatedAt.toISOString()}
            >
              {formatUpdatedAt(docketCase.updatedAt)}
            </time>
          </Link>
        </li>
      ))}
    </ul>
  );
}
