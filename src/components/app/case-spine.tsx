import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  CASE_STAGE_COPY,
  getCaseStageHref,
  type CaseStageProgress,
} from "@/lib/case-stages";

/**
 * Case-file spine: the product workflow encoded as a binding, not decoration.
 */
export function CaseSpine({
  stages,
  caseId,
  variant = "full",
}: {
  readonly stages: readonly CaseStageProgress[];
  readonly caseId?: string;
  readonly variant?: "full" | "ticks";
}) {
  if (variant === "ticks") {
    return (
      <ol
        aria-label="Andamento do caso"
        className="flex items-center gap-1.5"
      >
        {stages.map((stage) => (
          <li key={stage.id}>
            <span
              className={cn(
                "block size-1.5 rounded-full",
                stage.state === "upcoming" && "bg-border",
                stage.state === "complete" && "bg-primary",
                stage.state === "current" &&
                  "bg-primary ring-2 ring-primary/40",
                stage.isBusy && "motion-safe:animate-pulse",
              )}
              title={
                stage.note
                  ? `${CASE_STAGE_COPY[stage.id].label}: ${stage.note}`
                  : CASE_STAGE_COPY[stage.id].label
              }
            />
            <span className="sr-only">
              {CASE_STAGE_COPY[stage.id].label}: {stage.note ?? stage.state}
            </span>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <ol className="relative flex flex-col gap-6">
      <span
        aria-hidden="true"
        className="absolute top-2 bottom-2 left-[5px] w-px bg-border"
      />
      {stages.map((stage) => {
        const href = caseId
          ? getCaseStageHref(caseId, stage.id, stage.state)
          : undefined;
        const copy = CASE_STAGE_COPY[stage.id];
        const content = (
          <>
            <span
              className={cn(
                "relative z-10 mt-1 size-2.5 shrink-0 rounded-full border",
                stage.state === "upcoming" && "border-border bg-background",
                stage.state === "complete" && "border-primary bg-primary",
                stage.state === "current" &&
                  "border-primary bg-background ring-2 ring-primary/50",
                stage.isBusy && "motion-safe:animate-pulse",
              )}
            />
            <span className="min-w-0">
              <span
                className={cn(
                  "block text-sm",
                  stage.state === "upcoming"
                    ? "text-muted-foreground"
                    : "text-foreground",
                )}
              >
                {copy.label}
              </span>
              <span className="block text-xs text-muted-foreground">
                {stage.note ?? copy.description}
              </span>
            </span>
          </>
        );

        return (
          <li key={stage.id}>
            {href ? (
              <Link
                aria-current={stage.state === "current" ? "step" : undefined}
                className="flex items-start gap-3 rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                href={href}
              >
                {content}
              </Link>
            ) : (
              <div className="flex items-start gap-3">{content}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
