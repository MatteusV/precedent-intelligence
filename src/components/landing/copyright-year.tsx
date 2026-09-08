"use client";

/**
 * Renders the current calendar year for static-shell footers.
 */
export function CopyrightYear() {
  return <>{new Date().getFullYear()}</>;
}
