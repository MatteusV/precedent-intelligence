"use client";

import { cn } from "@/lib/utils";

export type FREQUENCY = "monthly" | "yearly";

interface FrequencyToggleProps {
  frequency: FREQUENCY;
  setFrequency: (frequency: FREQUENCY) => void;
}

export function FrequencyToggle({
  frequency,
  setFrequency,
}: FrequencyToggleProps) {
  return (
    <div className="flex items-center rounded-lg border border-border/60 bg-muted/40 p-1">
      <button
        className={cn(
          "rounded-md px-4 py-2 text-sm font-medium transition-colors",
          frequency === "monthly"
            ? "bg-background text-foreground shadow-xs"
            : "text-muted-foreground hover:text-foreground",
        )}
        onClick={() => setFrequency("monthly")}
        type="button"
      >
        Mensal
      </button>
      <button
        className={cn(
          "rounded-md px-4 py-2 text-sm font-medium transition-colors",
          frequency === "yearly"
            ? "bg-background text-foreground shadow-xs"
            : "text-muted-foreground hover:text-foreground",
        )}
        onClick={() => setFrequency("yearly")}
        type="button"
      >
        Anual
      </button>
    </div>
  );
}
