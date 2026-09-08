"use client";

import { useRef, useState, type RefObject } from "react";
import {
  ArrowDown,
  ArrowDownLeft,
  ArrowDownRight,
  ArrowRight,
  BookOpen,
  Check,
  FolderOpen,
  Scale,
  ScrollText,
  type LucideIcon,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  type MotionValue,
} from "motion/react";
import { cn } from "@/lib/utils";

type WorkflowStep = {
  readonly step: string;
  readonly title: string;
  readonly description: string;
  readonly icon: LucideIcon;
};

type StepStatus = "upcoming" | "active" | "complete";

const WORKFLOW_STEPS: readonly WorkflowStep[] = [
  {
    step: "01",
    title: "Decisões do tema",
    description:
      "Acervo curado, DataJud e upload de PDF entram no recorte jurídico escolhido.",
    icon: BookOpen,
  },
  {
    step: "02",
    title: "Padrão do juiz",
    description:
      "O motor estrutura órgão, relator, resultado, tese e dispositivo por decisão.",
    icon: Scale,
  },
  {
    step: "03",
    title: "Caso do usuário",
    description:
      "Fatos, pedido, polo e juízo informado alimentam a comparação com o histórico.",
    icon: FolderOpen,
  },
  {
    step: "04",
    title: "Peça ancorada",
    description:
      "Dossiê citado e petição ou minuta com trechos rastreáveis — sem ementa inventada.",
    icon: ScrollText,
  },
];

const STEP_COUNT = WORKFLOW_STEPS.length;
const SCROLL_VH_PER_STEP = 70;

/**
 * Maps section scroll progress to the workflow stage currently in view.
 */
function getActiveStepIndex(progress: number, stepCount: number): number {
  if (stepCount <= 1) {
    return 0;
  }

  const clampedProgress = Math.min(Math.max(progress, 0), 0.999);
  return Math.floor(clampedProgress * stepCount);
}

function getStepStatus(index: number, activeIndex: number): StepStatus {
  if (index < activeIndex) {
    return "complete";
  }

  if (index === activeIndex) {
    return "active";
  }

  return "upcoming";
}

function scrollTrackToStep(
  track: HTMLElement,
  stepIndex: number,
  stepCount: number,
): void {
  const trackTop = window.scrollY + track.getBoundingClientRect().top;
  const scrollableRange = Math.max(track.offsetHeight - window.innerHeight, 0);
  const progress = stepCount <= 1 ? 0 : (stepIndex + 0.35) / stepCount;
  window.scrollTo({ top: trackTop + scrollableRange * progress, behavior: "smooth" });
}

/**
 * Landing workflow: arrows connect each stage, and scroll advances the chain.
 */
export function WorkflowScrollSteps() {
  const trackRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion() === true;
  const [activeIndex, setActiveIndex] = useState(0);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    setActiveIndex(getActiveStepIndex(progress, STEP_COUNT));
  });

  const selectStep = (stepIndex: number): void => {
    const track = trackRef.current;
    if (track) {
      scrollTrackToStep(track, stepIndex, STEP_COUNT);
    }
  };

  if (shouldReduceMotion) {
    return <WorkflowStaticList />;
  }

  return (
    <WorkflowStickyTrack
      activeIndex={activeIndex}
      onSelectStep={selectStep}
      progress={scrollYProgress}
      trackRef={trackRef}
    />
  );
}

function WorkflowStickyTrack({
  activeIndex,
  onSelectStep,
  progress,
  trackRef,
}: {
  activeIndex: number;
  onSelectStep: (stepIndex: number) => void;
  progress: MotionValue<number>;
  trackRef: RefObject<HTMLDivElement | null>;
}) {
  const activeTitle = WORKFLOW_STEPS[activeIndex].title;

  return (
    <div
      className="relative mt-8"
      ref={trackRef}
      style={{ height: `${STEP_COUNT * SCROLL_VH_PER_STEP}vh` }}
    >
      <p aria-live="polite" className="sr-only">
        Etapa {activeIndex + 1} de {STEP_COUNT}: {activeTitle}
      </p>
      <div className="sticky top-8 flex min-h-[min(36rem,calc(100svh-6rem))] items-center py-6">
        <div className="grid w-full gap-8 lg:grid-cols-[minmax(16rem,20rem)_minmax(0,1fr)] lg:items-center lg:gap-14">
          <WorkflowRail
            activeIndex={activeIndex}
            onSelectStep={onSelectStep}
            progress={progress}
          />
          <WorkflowFeaturedStep activeIndex={activeIndex} />
        </div>
      </div>
    </div>
  );
}

function WorkflowRail({
  activeIndex,
  onSelectStep,
  progress,
}: {
  activeIndex: number;
  onSelectStep: (stepIndex: number) => void;
  progress: MotionValue<number>;
}) {
  return (
    <nav aria-label="Etapas do fluxo">
      <ol className="relative flex items-center justify-between lg:flex-col lg:items-stretch lg:justify-start">
        <div className="absolute top-[1.125rem] right-[1.125rem] left-[1.125rem] h-px -translate-y-1/2 bg-border lg:hidden" />
        <div className="absolute top-[1.125rem] bottom-[1.125rem] left-[1.125rem] hidden w-px -translate-x-1/2 bg-border lg:block" />
        <motion.div
          className="absolute top-[1.125rem] bottom-[1.125rem] left-[1.125rem] hidden w-px origin-top bg-primary lg:block"
          style={{ scaleY: progress, x: "-50%" }}
        />
        <motion.div
          className="absolute top-[1.125rem] left-[1.125rem] h-px origin-left bg-primary lg:hidden"
          style={{ scaleX: progress, y: "-50%", width: "calc(100% - 2.25rem)" }}
        />
        {WORKFLOW_STEPS.map((step, index) => (
          <WorkflowStation
            activeIndex={activeIndex}
            index={index}
            key={step.step}
            onSelect={onSelectStep}
            step={step}
          />
        ))}
      </ol>
    </nav>
  );
}

function WorkflowStation({
  activeIndex,
  index,
  onSelect,
  step,
}: {
  activeIndex: number;
  index: number;
  onSelect: (stepIndex: number) => void;
  step: WorkflowStep;
}) {
  const status = getStepStatus(index, activeIndex);
  const isLast = index === STEP_COUNT - 1;

  return (
    <li
      className={cn(
        "relative z-10 flex items-center lg:flex-col lg:items-start",
        isLast ? "shrink-0" : "flex-1 lg:flex-none",
      )}
    >
      <button
        aria-current={status === "active" ? "step" : undefined}
        className="flex cursor-pointer items-center gap-3 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => onSelect(index)}
        type="button"
      >
        <StationMarker status={status} step={step.step} />
        <span
          className={cn(
            "hidden max-w-[11rem] text-sm font-medium transition-colors duration-300 lg:block",
            status === "upcoming" ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {step.title}
        </span>
      </button>
      {isLast ? null : (
        <StationArrow isLit={index < activeIndex} isNext={index === activeIndex} />
      )}
    </li>
  );
}

function StationMarker({
  status,
  step,
}: {
  status: StepStatus;
  step: string;
}) {
  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full border font-mono text-xs transition-colors duration-300",
        status === "active" && "border-primary bg-primary text-primary-foreground",
        status === "complete" && "border-primary bg-primary/15 text-primary",
        status === "upcoming" && "border-border bg-background text-muted-foreground",
      )}
    >
      {status === "complete" ? <Check className="size-3.5 stroke-[2.5]" /> : step}
    </span>
  );
}

function StationArrow({
  isLit,
  isNext,
}: {
  isLit: boolean;
  isNext: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex h-8 flex-1 items-center justify-center text-muted-foreground/40 transition-colors duration-500 lg:h-10 lg:w-9 lg:flex-none",
        (isLit || isNext) && "text-primary",
        isNext && "animate-pulse",
      )}
    >
      <ArrowRight className="size-4 lg:hidden" />
      <ArrowDown className="hidden size-4 lg:block" />
    </span>
  );
}

function WorkflowFeaturedStep({ activeIndex }: { activeIndex: number }) {
  const step = WORKFLOW_STEPS[activeIndex];
  const Icon = step.icon;

  return (
    <div className="relative min-h-[18rem] sm:min-h-[20rem]">
      <AnimatePresence mode="wait">
        <motion.article
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-2xl border border-border/60 border-l-2 border-l-primary bg-card/70 p-6 shadow-[0_0_0_1px_rgba(245,158,11,0.12)] backdrop-blur-sm sm:p-8"
          exit={{ opacity: 0, y: -20 }}
          initial={{ opacity: 0, y: 24 }}
          key={step.step}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="pointer-events-none absolute top-4 right-6 font-mono text-7xl text-primary/15">
            {step.step}
          </p>
          <FeaturedHeading icon={Icon} step={step.step} />
          <h3 className="mt-5 max-w-lg text-2xl font-semibold tracking-tight sm:text-3xl">
            {step.title}
          </h3>
          <p className="mt-4 max-w-lg text-sm leading-7 text-muted-foreground sm:text-base">
            {step.description}
          </p>
          <FeaturedNextHint activeIndex={activeIndex} />
        </motion.article>
      </AnimatePresence>
    </div>
  );
}

function FeaturedHeading({
  icon: Icon,
  step,
}: {
  icon: LucideIcon;
  step: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-10 items-center justify-center rounded-full bg-primary/15 text-primary">
        <Icon className="size-5" />
      </span>
      <p className="font-mono text-xs tracking-wide text-primary">
        Etapa {step} de {WORKFLOW_STEPS[STEP_COUNT - 1].step}
      </p>
    </div>
  );
}

function FeaturedNextHint({ activeIndex }: { activeIndex: number }) {
  const nextStep = WORKFLOW_STEPS[activeIndex + 1];

  if (!nextStep) {
    return <p className="mt-6 text-sm text-primary">Fluxo fechado na peça citada.</p>;
  }

  return (
    <p className="mt-6 flex items-center gap-2 text-sm text-primary">
      Próximo
      <ArrowRight className="size-4" />
      {nextStep.title}
    </p>
  );
}

function WorkflowStaticList() {
  return (
    <ol className="mt-12 space-y-2">
      {WORKFLOW_STEPS.map((step, index) => (
        <li key={step.step}>
          <StaticStepCard index={index} step={step} />
          {index === STEP_COUNT - 1 ? null : (
            <div className="flex justify-center py-1 md:justify-start md:pl-[40%]">
              {index % 2 === 0 ? (
                <ArrowDownRight className="size-7 text-primary" />
              ) : (
                <ArrowDownLeft className="size-7 text-primary" />
              )}
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}

function StaticStepCard({
  index,
  step,
}: {
  index: number;
  step: WorkflowStep;
}) {
  const Icon = step.icon;

  return (
    <article
      className={cn(
        "max-w-xl rounded-2xl border border-border/60 bg-card/70 p-5 backdrop-blur-sm",
        index % 2 === 1 && "md:ml-auto",
      )}
    >
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Icon className="size-4" />
        </span>
        <p className="font-mono text-xs text-primary">{step.step}</p>
      </div>
      <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
    </article>
  );
}
