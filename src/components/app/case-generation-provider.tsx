"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { isGenerationJobInFlight } from "@/lib/generation-jobs";

export interface CaseGenerationSnapshot {
  readonly dossierJobStatus: string | null;
  readonly petitionJobStatus: string | null;
}

interface CaseGenerationContextValue {
  readonly legalCaseId: string;
  readonly dossierJobStatus: string | null;
  readonly petitionJobStatus: string | null;
  readonly isDossierBusy: boolean;
  readonly isPetitionBusy: boolean;
  readonly isDossierFailed: boolean;
  readonly isPetitionFailed: boolean;
  readonly markGenerating: (kind: "dossier" | "petition") => void;
}

const CaseGenerationContext = createContext<CaseGenerationContextValue | null>(
  null,
);

/**
 * Holds optimistic and polled generation status for a case file.
 */
export function CaseGenerationProvider({
  legalCaseId,
  initial,
  children,
}: {
  readonly legalCaseId: string;
  readonly initial: CaseGenerationSnapshot;
  readonly children: React.ReactNode;
}) {
  const [optimisticKind, setOptimisticKind] = useState<
    "dossier" | "petition" | null
  >(null);
  const [polled, setPolled] = useState<CaseGenerationSnapshot | null>(null);
  const snapshot = polled ?? initial;

  const isDossierFailed = snapshot.dossierJobStatus === "failed";
  const isPetitionFailed = snapshot.petitionJobStatus === "failed";
  const isDossierBusy =
    optimisticKind === "dossier" ||
    isGenerationJobInFlight(snapshot.dossierJobStatus);
  const isPetitionBusy =
    optimisticKind === "petition" ||
    isGenerationJobInFlight(snapshot.petitionJobStatus);
  const isBusy = isDossierBusy || isPetitionBusy;

  useEffect(() => {
    if (!isBusy) {
      return undefined;
    }

    let isCancelled = false;

    async function pollStatus(): Promise<void> {
      const next = await readGenerationSnapshot(legalCaseId);

      if (isCancelled || !next) {
        return;
      }

      setPolled(next);

      if (
        optimisticKind === "dossier" &&
        (next.dossierJobStatus === "completed" ||
          next.dossierJobStatus === "failed")
      ) {
        setOptimisticKind(null);
      }

      if (
        optimisticKind === "petition" &&
        (next.petitionJobStatus === "completed" ||
          next.petitionJobStatus === "failed")
      ) {
        setOptimisticKind(null);
      }
    }

    void pollStatus();
    const intervalId = window.setInterval(() => {
      void pollStatus();
    }, 1500);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
    };
  }, [isBusy, legalCaseId, optimisticKind]);

  const markGenerating = useCallback((kind: "dossier" | "petition") => {
    setOptimisticKind(kind);
    setPolled((current) => ({
      dossierJobStatus:
        kind === "dossier" &&
        !isGenerationJobInFlight(current?.dossierJobStatus ?? initial.dossierJobStatus)
          ? "pending"
          : (current?.dossierJobStatus ?? initial.dossierJobStatus),
      petitionJobStatus:
        kind === "petition" &&
        !isGenerationJobInFlight(
          current?.petitionJobStatus ?? initial.petitionJobStatus,
        )
          ? "pending"
          : (current?.petitionJobStatus ?? initial.petitionJobStatus),
    }));
  }, [initial]);

  const value = useMemo<CaseGenerationContextValue>(
    () => ({
      legalCaseId,
      dossierJobStatus: isDossierBusy
        ? (isGenerationJobInFlight(snapshot.dossierJobStatus) ||
          snapshot.dossierJobStatus === "failed"
            ? snapshot.dossierJobStatus
            : "pending")
        : snapshot.dossierJobStatus,
      petitionJobStatus: isPetitionBusy
        ? (isGenerationJobInFlight(snapshot.petitionJobStatus) ||
          snapshot.petitionJobStatus === "failed"
            ? snapshot.petitionJobStatus
            : "pending")
        : snapshot.petitionJobStatus,
      isDossierBusy,
      isPetitionBusy,
      isDossierFailed,
      isPetitionFailed,
      markGenerating,
    }),
    [
      legalCaseId,
      snapshot,
      isDossierBusy,
      isPetitionBusy,
      isDossierFailed,
      isPetitionFailed,
      markGenerating,
    ],
  );

  return (
    <CaseGenerationContext.Provider value={value}>
      {children}
    </CaseGenerationContext.Provider>
  );
}

/**
 * Returns live generation status when rendered inside a case file.
 */
export function useCaseGeneration(): CaseGenerationContextValue | null {
  return useContext(CaseGenerationContext);
}

async function readGenerationSnapshot(
  legalCaseId: string,
): Promise<CaseGenerationSnapshot | null> {
  const response = await fetch(`/api/casos/${legalCaseId}/generation-status`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const payload: unknown = await response.json();

  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as {
    dossierJobStatus?: unknown;
    petitionJobStatus?: unknown;
  };

  if (
    (typeof record.dossierJobStatus !== "string" &&
      record.dossierJobStatus !== null) ||
    (typeof record.petitionJobStatus !== "string" &&
      record.petitionJobStatus !== null)
  ) {
    return null;
  }

  return {
    dossierJobStatus: record.dossierJobStatus,
    petitionJobStatus: record.petitionJobStatus,
  };
}
