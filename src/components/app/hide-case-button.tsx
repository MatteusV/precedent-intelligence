"use client";

import { useState, useTransition } from "react";
import { hideCaseAction } from "@/app/actions/case-actions";
import { Button } from "@/components/ui/button";

/**
 * Two-step hide control for the case detail header.
 */
export function HideCaseButton({
  legalCaseId,
}: {
  readonly legalCaseId: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("legalCaseId", legalCaseId);
      await hideCaseAction(formData);
    });
  }

  return (
    <Button
      aria-expanded={confirming}
      disabled={isPending}
      onClick={handleClick}
      size="sm"
      type="button"
      variant={confirming ? "destructive" : "outline"}
    >
      {confirming ? "Confirmar ocultar" : "Ocultar caso"}
    </Button>
  );
}
