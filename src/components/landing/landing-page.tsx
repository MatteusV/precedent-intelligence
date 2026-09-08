import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { CopyrightYear } from "@/components/landing/copyright-year";
import { ProcessDisplayCards } from "@/components/landing/process-display-cards";
import { WorkflowScrollSteps } from "@/components/landing/workflow-scroll-steps";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PricingSection } from "@/components/ui/pricing-4";
import { Separator } from "@/components/ui/separator";

const painPoints = [
  "Caçar acórdãos espalhados em DataJud, diário e PDF",
  "Descobrir como aquele relator decide — não o tribunal em abstrato",
  "Montar tese sem citar o que o juiz já rejeitou",
];

const capabilities = {
  can: [
    "Classificar decisões no tema e extrair fundamentos",
    "Comparar o caso com o padrão daquele juiz",
    "Redigir peça citando o dossiê gravado",
    "Apontar risco quando o relator rejeita determinada tese",
  ],
  cannot: [
    "Garantir resultado do processo",
    "Inventar ementa, número ou trecho",
    "Substituir prova e juízo de fato",
    "Decidir no lugar do juiz",
  ],
};

const audiences = [
  {
    role: "Advogado",
    focus: "Dado este caso e este juiz, qual tese cabe e como redigir a peça.",
  },
  {
    role: "Gabinete",
    focus:
      "Como este juízo tem decidido o tema e qual minuta se sustenta na jurisprudência local.",
  },
];

export function LandingPage() {
  return (
    <div className="relative flex min-h-full flex-col">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
          <BrandMark href="/" />
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a className="transition-colors hover:text-foreground" href="#como-funciona">
              Como funciona
            </a>
            <a className="transition-colors hover:text-foreground" href="#produto">
              Produto
            </a>
            <a className="transition-colors hover:text-foreground" href="#precos">
              Preços
            </a>
            <a className="transition-colors hover:text-foreground" href="#regras">
              Regras
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="ghost">
              <Link href="/sign-in">Entrar</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/sign-up">Criar conta</Link>
            </Button>
          </div>
        </div>
        <nav
          aria-label="Seções da página"
          className="flex gap-4 overflow-x-auto border-t border-border/60 px-6 py-2 text-xs text-muted-foreground md:hidden"
        >
          <a href="#como-funciona">Como funciona</a>
          <a href="#produto">Produto</a>
          <a href="#precos">Preços</a>
          <a href="#regras">Regras</a>
        </nav>
      </header>

      <main className="flex-1">
        <section className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
          <div className="space-y-8">
            <Badge className="border-primary/20 bg-primary/10 text-primary hover:bg-primary/10">
              Inteligência de precedentes por tema
            </Badge>
            <div className="space-y-4">
              <h1 className="max-w-xl font-folio text-4xl leading-tight tracking-tight text-balance sm:text-5xl">
                O último metro do trabalho jurídico, com precedente que existe
              </h1>
              <p className="max-w-xl text-lg leading-8 text-muted-foreground">
                Para um tema fechado, lemos o histórico de decisões, extraímos o
                padrão daquele juiz e daquele órgão, e devolvemos um dossiê
                citado e uma peça ancorada nas fontes.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/sign-up">
                  Entrar no escritório
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#como-funciona">Ver como funciona</a>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Não é chat sobre a lei. É casar o caso com quem vai julgar.
            </p>
          </div>

          <ProcessDisplayCards />
        </section>

        <section className="border-y border-border/60 bg-muted/20 py-16">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-2 lg:items-center">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border/60">
              <Image
                alt="Documentos jurídicos e caneta sobre mesa de trabalho"
                className="object-cover"
                fill
                priority={false}
                sizes="(max-width: 1024px) 100vw, 50vw"
                src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
              <div className="absolute right-4 bottom-4 left-4 rounded-xl border border-border/60 bg-background/80 p-4 backdrop-blur-sm">
                <p className="text-sm font-medium">Regra de ouro</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Sem precedente no dossiê, não há afirmação de jurisprudência.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <Badge variant="outline">A dor</Badge>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight">
                  Ferramentas de acervo acham texto. Quase ninguém resolve este
                  juiz, este pedido, esta peça.
                </h2>
              </div>
              <ul className="space-y-4">
                {painPoints.map((point) => (
                  <li className="flex gap-3 text-muted-foreground" key={point}>
                    <XCircle className="mt-0.5 size-5 shrink-0 text-destructive/80" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="scroll-mt-20 py-20" id="como-funciona">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="outline">Fluxo</Badge>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight">
                Decisões viram padrão. Padrão vira peça.
              </h2>
              <p className="mt-4 text-muted-foreground">
                Com o tema fechado, dezenas de decisões boas valem mais do que
                um lago jurídico. Sem tema, a base não ensina nada.
              </p>
            </div>

            <WorkflowScrollSteps />
          </div>
        </section>

        <section className="border-y border-border/60 bg-muted/20 py-20" id="produto">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-10 lg:grid-cols-2">
              <div className="space-y-6">
                <Badge variant="outline">Unidade de produto</Badge>
                <h2 className="text-3xl font-semibold tracking-tight">
                  Um tema estreito. Volume real de decisões. Saída citável.
                </h2>
                <p className="leading-7 text-muted-foreground">
                  Exemplo: dano moral em relação de consumo, tutela de urgência
                  em saúde. O recorte define o acervo, o padrão e a peça final.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {audiences.map((audience) => (
                    <Card className="border-border/60" key={audience.role}>
                      <CardHeader>
                        <CardTitle className="text-base">{audience.role}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="leading-6">
                          {audience.focus}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="relative min-h-[320px] overflow-hidden rounded-2xl border border-border/60">
                <Image
                  alt="Biblioteca jurídica com volumes de jurisprudência"
                  className="object-cover"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <div className="rounded-xl border border-border/60 bg-background/85 p-5 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <BookOpen className="size-4 text-primary" />
                      Saída do v1
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Padrão histórico no recorte, 5–15 precedentes
                      identificáveis e uma petição inicial com âncoras e
                      disclaimer.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20" id="regras">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="outline">Limites claros</Badge>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight">
                IA com trilho. Jurisprudência com fonte.
              </h2>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CheckCircle2 className="size-5 text-primary" />O que a IA
                    pode
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {capabilities.can.map((item) => (
                      <li className="flex gap-3 text-sm leading-6 text-muted-foreground" key={item}>
                        <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ShieldCheck className="size-5 text-muted-foreground" />O
                    que a IA não pode
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {capabilities.cannot.map((item) => (
                      <li className="flex gap-3 text-sm leading-6 text-muted-foreground" key={item}>
                        <XCircle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="border-y border-border/60 py-20" id="precos">
          <div className="mx-auto max-w-6xl px-6">
            <PricingSection />
          </div>
        </section>

        <section className="border-t border-border/60 bg-muted/20 py-20">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-balance">
              Pare de caçar julgado. Comece a escrever com o padrão de quem
              decide.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Escritórios que repetem o mesmo tema dezenas de vezes por mês são
              o primeiro público.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/sign-up">
                  Criar conta
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/sign-in">Entrar</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <BrandMark href="/" />
          <p>Assistente de consistência jurídica — não substitui o juiz.</p>
        </div>
        <Separator />
        <div className="mx-auto max-w-6xl px-6 py-4 text-xs text-muted-foreground">
          © <CopyrightYear /> Precedent Intelligence. Todos os direitos
          reservados.
        </div>
      </footer>
    </div>
  );
}
