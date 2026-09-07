"use client";

import NumberFlow from "@number-flow/react";
import { CheckCircle, Star } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  type FREQUENCY,
  FrequencyToggle,
} from "@/components/ui/pricing-4-utils/frequency-toggle";
import { cn } from "@/lib/utils";

type Plan = {
  name: string;
  info: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  btn: {
    text: string;
    href: string;
  };
  highlighted?: boolean;
};

const plans: Plan[] = [
  {
    name: "Essencial",
    info: "Advogado solo ou núcleo enxuto",
    price: {
      monthly: 197,
      yearly: 167,
    },
    features: [
      "1 tema jurídico ativo",
      "Até 10 dossiês por mês",
      "Até 5 peças ancoradas por mês",
      "Upload de PDF e acervo curado",
      "Citações rastreáveis no dossiê",
      "Suporte por e-mail",
    ],
    btn: {
      text: "Começar teste gratuito",
      href: "#",
    },
  },
  {
    highlighted: true,
    name: "Profissional",
    info: "Escritório pequeno e médio",
    price: {
      monthly: 497,
      yearly: 417,
    },
    features: [
      "Até 3 temas jurídicos ativos",
      "Até 40 dossiês por mês",
      "Até 25 peças ancoradas por mês",
      "Sincronização DataJud no recorte",
      "Padrão por relator e órgão",
      "3 usuários incluídos",
      "Suporte prioritário",
    ],
    btn: {
      text: "Assinar Profissional",
      href: "#",
    },
  },
  {
    name: "Escritório",
    info: "Times com volume recorrente",
    price: {
      monthly: 997,
      yearly: 847,
    },
    features: [
      "Temas ilimitados",
      "Dossiês e peças ilimitados",
      "Usuários ilimitados",
      "Acervo compartilhado do escritório",
      "Exportação do dossiê em PDF",
      "Onboarding e treinamento",
      "Suporte dedicado",
    ],
    btn: {
      text: "Falar com vendas",
      href: "#",
    },
  },
];

export default function PricingSection() {
  const [frequency, setFrequency] = React.useState<FREQUENCY>("monthly");

  return (
    <div className="flex w-full flex-col items-center justify-center space-y-7 p-4">
      <div className="mx-auto max-w-xl space-y-2">
        <h2 className="text-center text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl lg:font-extrabold">
          Planos que acompanham o volume do seu escritório
        </h2>
        <p className="text-center text-sm text-muted-foreground md:text-base">
          Do advogado solo ao núcleo massificado — preços transparentes, sem
          taxa escondida, cobrados por tema e uso real de dossiê e peça.
        </p>
      </div>

      <FrequencyToggle frequency={frequency} setFrequency={setFrequency} />
      <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <PricingCard frequency={frequency} key={plan.name} plan={plan} />
        ))}
      </div>
    </div>
  );
}

export { PricingSection };

type PricingCardProps = React.ComponentProps<"div"> & {
  plan: Plan;
  frequency?: FREQUENCY;
};

export function PricingCard({
  plan,
  className,
  frequency = "monthly",
  ...props
}: PricingCardProps) {
  const billingLabel = frequency === "monthly" ? "mensal" : "anual";

  return (
    <div
      className={cn(
        "relative flex w-full flex-col overflow-hidden rounded-lg border border-border/60 shadow-xs",
        plan.highlighted && "scale-105 border-primary/30",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "border-b p-4",
          plan.highlighted && "bg-card dark:bg-card/80",
        )}
      >
        <AnimatePresence mode="wait">
          <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
            {plan.highlighted && (
              <motion.div
                className="flex items-center gap-1 rounded-md border bg-background px-2 py-0.5 text-xs"
                key="popular-badge"
                layout
                transition={{ duration: 0.1 }}
              >
                <Star className="size-3 fill-current text-primary" />
                Mais escolhido
              </motion.div>
            )}

            {frequency === "yearly" &&
              plan.price.monthly > plan.price.yearly && (
                <motion.div
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-1 rounded-md border bg-primary px-2 py-0.5 text-xs text-primary-foreground"
                  exit={{ opacity: 0 }}
                  initial={{ opacity: 0 }}
                  key="discount-badge"
                  layout
                  transition={{ duration: 0.15 }}
                >
                  {Math.round(
                    ((plan.price.monthly - plan.price.yearly) /
                      plan.price.monthly) *
                      100,
                  )}
                  % off
                </motion.div>
              )}
          </div>
        </AnimatePresence>

        <div className="text-lg font-medium">{plan.name}</div>
        <p className="text-sm font-normal text-muted-foreground">{plan.info}</p>
        <h3 className="mt-6 mb-1 flex w-max items-end gap-1">
          <NumberFlow
            className="text-3xl font-extrabold [&::part(suffix)]:text-base [&::part(suffix)]:font-normal [&::part(suffix)]:text-muted-foreground"
            format={{
              style: "currency",
              currency: "BRL",
              maximumFractionDigits: 0,
            }}
            suffix="/mês"
            value={plan.price[frequency]}
          />
        </h3>
        <p className="mb-2 text-xs font-normal text-muted-foreground">
          cobrança {billingLabel}
        </p>
      </div>
      <div
        className={cn(
          "space-y-3 px-4 pt-6 pb-8 text-sm text-muted-foreground",
          plan.highlighted && "bg-muted/10",
        )}
      >
        {plan.features.map((feature) => (
          <div className="flex items-center gap-2" key={feature}>
            <CheckCircle className="size-3.5 text-primary" />
            <p>{feature}</p>
          </div>
        ))}
      </div>
      <div
        className={cn(
          "mt-auto w-full border-t p-3",
          plan.highlighted && "bg-card dark:bg-card/80",
        )}
      >
        <Button
          asChild
          className="w-full"
          variant={plan.highlighted ? "default" : "outline"}
        >
          <Link href={plan.btn.href}>{plan.btn.text}</Link>
        </Button>
      </div>
    </div>
  );
}
