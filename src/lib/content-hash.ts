import { createHash } from "node:crypto";

export function computeContentHash(rawText: string): string {
  return createHash("sha256").update(rawText.trim()).digest("hex");
}

export function extractCaseNumbers(text: string): string[] {
  const matches = text.match(/\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}/g);
  return matches ? [...new Set(matches)] : [];
}
