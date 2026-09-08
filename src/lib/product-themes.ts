export interface ProductThemeDefinition {
  readonly slug: string;
  readonly name: string;
}

export const PRODUCT_THEMES: readonly ProductThemeDefinition[] = [
  {
    slug: "dano-moral-relacao-consumo",
    name: "dano moral em relação de consumo",
  },
  {
    slug: "tutela-urgencia-saude",
    name: "tutela de urgência em saúde",
  },
  {
    slug: "responsabilidade-civil-fornecedor",
    name: "responsabilidade civil do fornecedor",
  },
  {
    slug: "revisao-contratual-bancaria",
    name: "revisão contratual bancária",
  },
  {
    slug: "desconsideracao-personalidade-juridica",
    name: "desconsideração da personalidade jurídica",
  },
] as const;

export const SEED_THEME_SLUG = "dano-moral-relacao-consumo";

export const OUTRO_THEME_MIN_LENGTH = 8;

export function isProductThemeName(name: string): boolean {
  const normalized = name.trim().toLowerCase();
  return PRODUCT_THEMES.some(
    (theme) => theme.name.toLowerCase() === normalized,
  );
}

export function getProductThemeBySlug(
  slug: string,
): ProductThemeDefinition | undefined {
  return PRODUCT_THEMES.find((theme) => theme.slug === slug);
}

export function getProductThemeNames(): string[] {
  return PRODUCT_THEMES.map((theme) => theme.name);
}
