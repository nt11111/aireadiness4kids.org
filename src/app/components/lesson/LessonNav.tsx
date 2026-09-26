import { useEffect, useState, type MouseEvent } from "react";
import { ArrowLeft, ArrowRight, ListOrdered } from "lucide-react";
import type { StepRef } from "../../../lib/lesson-types";
import { progress, useProgress } from "../../lesson/progress";
import { track as trackEvent } from "../../../lib/analytics";
import { OutlineList } from "./OutlineList";
import { GatePanel } from "./GatePanel";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { buttonVariants } from "../ui/button";
import { cn } from "../ui/utils";

type Props = {
  steps: StepRef[];
  index: number;
  track: string;
  moduleTitle: string;
  prevHref: string;
  nextHref: string;
  /** Signed out on step 1: Next opens the sign-up panel instead of going to step 2. */
  gated?: boolean;
};

/**
 * The sticky Back / Next bar (brief section 7), and on phones the "Step 3 of 6" button that opens
 * the outline as a bottom sheet. Next marks the step complete. Arrow keys press these links (keys.ts).
 */
export function LessonNav({ steps, index, track, moduleTitle, prevHref, nextHref, gated = false }: Props) {
  const step = steps[index];
  const isFirst = index === 0;
  const isLast = index === steps.length - 1;
  const [atEnd, setAtEnd] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const { completed } = useProgress();

  // "Next" becomes "Mark complete & continue" once the learner reaches the end of the step.
  useEffect(() => {
    setAtEnd(false);
    const end = document.querySelector("[data-lesson-end]");
    if (!end || !("IntersectionObserver" in window)) { setAtEnd(true); return; }
    const io = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setAtEnd(true); }, { rootMargin: "0px 0px -60px 0px" });
    io.observe(end);
    return () => io.disconnect();
  }, [step.id]);

  const markComplete = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!completed.has(step.id)) trackEvent({ name: "step_complete", props: { type: step.type } });
    progress.complete(step.id);
    if (gated) {
      e.preventDefault();
      trackEvent({ name: "gate_shown", props: {} });
      setGateOpen(true);
    }
  };

  const tap = "min-h-[var(--tap)]";
  const counter = `Step ${step.n} of ${steps.length}`;

  return (
    <div data-sticky className="sticky bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur">
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <nav aria-label="Lesson" className="mx-auto flex max-w-[calc(var(--reading)+3rem)] items-center justify-between gap-2 px-4 py-3 sm:px-6">
          <a href={prevHref} data-lesson-prev className={cn(buttonVariants({ variant: "ghost" }), tap, "px-3 sm:px-4")} aria-label={isFirst ? "Back to module overview" : undefined}>
            <ArrowLeft aria-hidden="true" />
            <span className={cn(isFirst ? "hidden sm:inline" : "sr-only sm:not-sr-only")}>{isFirst ? "Overview" : "Back"}</span>
          </a>

          {/* Phones: the outline opens as a bottom sheet (SheetTrigger returns focus here on close). Desktop has the sidebar, so this is plain text. */}
          <SheetTrigger className={cn(buttonVariants({ variant: "outline", size: "sm" }), tap, "min-w-0 px-3 lg:hidden")}>
            <ListOrdered aria-hidden="true" />
            <span><span className="sr-only sm:not-sr-only">Step </span>{step.n} of {steps.length}</span>
            <span className="sr-only">: open the list of steps</span>
          </SheetTrigger>
          <p className="hidden text-small font-bold text-ink-soft lg:block" aria-hidden="true">{counter}</p>

          <a href={nextHref} data-lesson-next onClick={markComplete} className={cn(buttonVariants(), tap, "px-4 sm:px-6")}>
            {isLast ? (
              <span>Finish module</span>
            ) : atEnd ? (
              <>
                <span className="sm:hidden">Complete &amp; next</span>
                <span className="hidden sm:inline">Mark complete &amp; continue</span>
              </>
            ) : (
              <span>Next</span>
            )}
            <ArrowRight aria-hidden="true" />
          </a>
        </nav>

        <SheetContent side="bottom" className="max-h-[85dvh] rounded-t-xl pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden">
          <SheetHeader className="px-5 pb-0 pr-16 pt-5">
            <SheetTitle className="font-display text-title">{moduleTitle}</SheetTitle>
            <SheetDescription className="text-small text-ink-soft">
              {counter} · {steps.filter((s) => completed.has(s.id)).length} of {steps.length} done
            </SheetDescription>
          </SheetHeader>
          <nav aria-label="Steps" className="overflow-y-auto px-3 pb-2">
            <OutlineList steps={steps} currentId={step.id} completed={completed} track={track} onNavigate={() => setSheetOpen(false)} />
          </nav>
        </SheetContent>
      </Sheet>
      {gated && <GatePanel open={gateOpen} onOpenChange={setGateOpen} next={nextHref} />}
    </div>
  );
}
