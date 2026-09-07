"use client";

import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface DisplayCardProps {
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  date?: string;
  iconClassName?: string;
  titleClassName?: string;
}

function DisplayCard({
  className,
  icon = <Sparkles className="size-4 text-amber-200" />,
  title = "Featured",
  description = "Discover amazing content",
  date = "Just now",
  iconClassName = "text-amber-500",
  titleClassName = "text-amber-500",
}: DisplayCardProps) {
  return (
    <div
      className={cn(
        "relative flex h-36 w-[22rem] -skew-y-[8deg] select-none flex-col justify-between rounded-xl border-2 bg-muted/70 px-4 py-3 backdrop-blur-sm transition-all duration-700 after:absolute after:top-[-5%] after:-right-1 after:h-[110%] after:w-[20rem] after:bg-gradient-to-l after:from-background after:to-transparent after:content-[''] hover:border-white/20 hover:bg-muted [&>*]:flex [&>*]:items-center [&>*]:gap-2",
        className
      )}
    >
      <div>
        <span className="relative inline-block rounded-full bg-amber-900/80 p-1">
          {icon}
        </span>
        <p className={cn("text-lg font-medium", titleClassName)}>{title}</p>
      </div>
      <p className="text-lg whitespace-nowrap">{description}</p>
      <p className="text-muted-foreground">{date}</p>
    </div>
  );
}

interface DisplayCardsProps {
  cards?: DisplayCardProps[];
}

export default function DisplayCards({ cards }: DisplayCardsProps) {
  const defaultCards = [
    {
      className:
        "[grid-area:stack] grayscale-[100%] hover:-translate-y-10 hover:grayscale-0 before:absolute before:top-0 before:left-0 before:h-[100%] before:w-[100%] before:rounded-xl before:bg-background/50 before:bg-blend-overlay before:outline-1 before:outline-border before:transition-opacity before:duration-700 before:content-[''] hover:before:opacity-0",
    },
    {
      className:
        "[grid-area:stack] translate-x-16 translate-y-10 grayscale-[100%] hover:-translate-y-1 hover:grayscale-0 before:absolute before:top-0 before:left-0 before:h-[100%] before:w-[100%] before:rounded-xl before:bg-background/50 before:bg-blend-overlay before:outline-1 before:outline-border before:transition-opacity before:duration-700 before:content-[''] hover:before:opacity-0",
    },
    {
      className:
        "[grid-area:stack] translate-x-32 translate-y-20 hover:translate-y-10",
    },
  ];

  const displayCards = cards ?? defaultCards;

  return (
    <div className="grid animate-in place-items-center opacity-100 duration-700 fade-in-0 [grid-template-areas:'stack']">
      {displayCards.map((cardProps, index) => (
        <DisplayCard key={index} {...cardProps} />
      ))}
    </div>
  );
}
