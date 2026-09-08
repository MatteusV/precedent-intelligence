import Link from "next/link";
import { FolderOpen, Plus } from "lucide-react";
import { CaseSpine } from "@/components/app/case-spine";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
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
      <div className="overflow-hidden rounded-xl border border-border bg-card/40">
        <div className="hidden grid-cols-[5.5rem_minmax(0,1fr)_auto] gap-4 border-b border-border px-4 py-2 font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase sm:grid sm:grid-cols-[5.5rem_minmax(0,1fr)_auto_8.5rem_5.5rem]">
          <span>Tribunal</span>
          <span>Caso</span>
          <span>Andamento</span>
          <span>Próximo passo</span>
          <span>Atualizado</span>
        </div>
        <Empty className="border-0">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderOpen />
            </EmptyMedia>
            <EmptyTitle>Nenhum caso neste escritório</EmptyTitle>
            <EmptyDescription>
              Cole o material do caso para abrir o primeiro. O dossiê e a
              petição nascem depois da confirmação do tema.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/app/casos/novo">
                <Plus />
                Novo caso
              </Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card/40">
      <div className="hidden grid-cols-[5.5rem_minmax(0,1fr)_auto] gap-4 border-b border-border px-4 py-2 font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase sm:grid sm:grid-cols-[5.5rem_minmax(0,1fr)_auto_8.5rem_5.5rem]">
        <span>Tribunal</span>
        <span>Caso</span>
        <span>Andamento</span>
        <span>Próximo passo</span>
        <span>Atualizado</span>
      </div>
      <ul className="divide-y divide-border">
        {cases.map((docketCase) => (
          <li key={docketCase.id}>
            <Link
              className="grid grid-cols-[4.5rem_minmax(0,1fr)_auto] items-center gap-4 px-4 py-3.5 outline-none transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 sm:grid-cols-[5.5rem_minmax(0,1fr)_auto_8.5rem_5.5rem]"
              href={docketCase.nextAction.href}
            >
              <span className="font-mono text-xs tracking-wider text-primary uppercase">
                {docketCase.tribunalLabel}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-folio text-lg leading-snug">
                  {docketCase.title}
                </span>
                {docketCase.judgeName ? (
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                    {docketCase.judgeName}
                  </span>
                ) : null}
              </span>
              <CaseSpine stages={docketCase.stages} variant="ticks" />
              <span className="hidden truncate text-xs text-muted-foreground sm:block">
                {docketCase.nextAction.label}
              </span>
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
    </div>
  );
}
