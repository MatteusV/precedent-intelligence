"use client";

import DisplayCards from "@/components/ui/display-cards";
import { FileText, Scale, ScrollText } from "lucide-react";

const stackClassName =
  "before:absolute before:top-0 before:left-0 before:h-[100%] before:w-[100%] before:rounded-xl before:bg-background/50 before:bg-blend-overlay before:outline-1 before:outline-border before:transition-opacity before:duration-300 before:content-[''] hover:before:opacity-0 motion-reduce:before:transition-none";

const processCards = [
  {
    icon: <FileText className="size-4 text-primary" />,
    title: "Acórdão",
    description: "REsp 1.234.567 · STJ",
    date: "Rel. Min. Maria Silva",
    iconClassName: "text-primary",
    titleClassName: "text-primary",
    className: `[grid-area:stack] grayscale-[100%] hover:-translate-y-10 hover:grayscale-0 ${stackClassName}`,
  },
  {
    icon: <Scale className="size-4 text-primary" />,
    title: "Dossiê citado",
    description: "Padrão do relator no tema",
    date: "12 precedentes · 3 divergências",
    iconClassName: "text-primary",
    titleClassName: "text-primary",
    className: `[grid-area:stack] translate-x-12 translate-y-10 grayscale-[100%] hover:-translate-y-1 hover:grayscale-0 sm:translate-x-16 ${stackClassName}`,
  },
  {
    icon: <ScrollText className="size-4 text-primary" />,
    title: "Petição ancorada",
    description: "Tese alinhada ao juízo",
    date: "Com âncoras e disclaimer",
    iconClassName: "text-primary",
    titleClassName: "text-primary",
    className:
      "[grid-area:stack] translate-x-24 translate-y-20 hover:translate-y-10 sm:translate-x-32",
  },
];

export function ProcessDisplayCards() {
  return (
    <div className="flex min-h-[420px] w-full items-center justify-center overflow-hidden py-8">
      <div className="w-full max-w-3xl scale-[0.85] sm:scale-100">
        <DisplayCards cards={processCards} />
      </div>
    </div>
  );
}
