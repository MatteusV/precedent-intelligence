"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { GenerationStepView } from "@/lib/generation-jobs";

/**
 * Checklist of generation stages so a long job never looks frozen.
 */
export function GenerationProgress({
  title,
  steps,
}: {
  readonly title: string;
  readonly steps: readonly GenerationStepView[];
}) {
  const currentIndex = steps.findIndex((step) => step.state === "current" || step.state === "failed");
  const current = currentIndex >= 0 ? steps[currentIndex] : steps[0];
  const completedCount = steps.filter((step) => step.state === "complete").length;
  const elapsedLabel = useElapsedLabel();
  const progressRatio =
    steps.length === 0 ? 0 : (completedCount + (current?.state === "failed" ? 0 : 0.45)) / steps.length;

  return (
    <div
      aria-busy={current?.state === "current"}
      aria-live="polite"
      className="rounded-lg border border-dashed border-primary/35 bg-card/40 px-4 py-5"
      role="status"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="font-mono text-[11px] tracking-[0.18em] text-primary uppercase">
            Etapa {Math.max(currentIndex, 0) + 1} de {steps.length}
          </p>
          <p className="text-sm text-foreground">{title}</p>
        </div>
        <p className="font-mono text-xs text-muted-foreground">há {elapsedLabel}</p>
      </div>

      <div
        aria-hidden="true"
        className="mt-4 h-1 overflow-hidden rounded-full bg-border"
      >
        <div
          className="h-full origin-left bg-primary transition-[width] duration-500 motion-reduce:transition-none"
          style={{ width: `${Math.min(100, Math.round(progressRatio * 100))}%` }}
        />
      </div>

      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {current?.description}
      </p>

      <ol aria-label="Etapas da geração" className="relative mt-5 flex flex-col gap-4">
        <span
          aria-hidden="true"
          className="absolute top-2 bottom-2 left-[5px] w-px bg-border"
        />
        {steps.map((step) => (
          <li className="flex items-start gap-3" key={step.id}>
            <span
              className={cn(
                "relative z-10 mt-1 size-2.5 shrink-0 rounded-full border",
                step.state === "upcoming" && "border-border bg-background",
                step.state === "complete" && "border-primary bg-primary",
                step.state === "current" &&
                  "border-primary bg-background ring-2 ring-primary/50 motion-safe:animate-pulse",
                step.state === "failed" && "border-stamp bg-stamp",
              )}
            />
            <span className="min-w-0">
              <span
                aria-current={step.state === "current" ? "step" : undefined}
                className={cn(
                  "block text-sm",
                  step.state === "upcoming" && "text-muted-foreground",
                  step.state === "current" && "text-foreground",
                  step.state === "complete" && "text-foreground",
                  step.state === "failed" && "text-stamp",
                )}
              >
                {step.label}
              </span>
              {step.state === "current" || step.state === "failed" ? (
                <span className="block text-xs text-muted-foreground">
                  {step.state === "failed"
                    ? "Esta etapa falhou. Tente gerar de novo."
                    : step.description}
                </span>
              ) : null}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function useElapsedLabel(): string {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return formatElapsed(elapsedSeconds);
}

function formatElapsed(totalSeconds: number): string {
  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}min ${seconds}s`;
}
