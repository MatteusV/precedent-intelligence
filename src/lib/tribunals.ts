export interface TribunalDefinition {
  readonly slug: string;
  readonly label: string;
}

export const SUPPORTED_TRIBUNALS: readonly TribunalDefinition[] = [
  { slug: "tjsp", label: "TJSP" },
  { slug: "tjrj", label: "TJRJ" },
  { slug: "tjmg", label: "TJMG" },
  { slug: "tjrs", label: "TJRS" },
  { slug: "stj", label: "STJ" },
  { slug: "stf", label: "STF" },
  { slug: "tst", label: "TST" },
  { slug: "trf1", label: "TRF1" },
  { slug: "trf2", label: "TRF2" },
  { slug: "trf3", label: "TRF3" },
  { slug: "trf4", label: "TRF4" },
] as const;

export const SEED_TRIBUNAL_SLUG = "tjsp";

export function getTribunalBySlug(
  slug: string,
): TribunalDefinition | undefined {
  return SUPPORTED_TRIBUNALS.find((tribunal) => tribunal.slug === slug);
}

export function isSupportedTribunalSlug(slug: string): boolean {
  return SUPPORTED_TRIBUNALS.some((tribunal) => tribunal.slug === slug);
}
