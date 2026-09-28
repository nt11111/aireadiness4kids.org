import { useState } from "react";
import { ArrowRight, BookOpen, PlayCircle, Split, CircleCheck, PenLine, ListChecks, Hammer, Clock } from "lucide-react";
import { STEP_LABEL, type Question, type StepRef, type StepType } from "../../../lib/lesson-types";
import { progress, useProgress } from "../../lesson/progress";
import { StepDot } from "./OutlineList";
import { Check } from "./Check";
import { buttonVariants, Button } from "../ui/button";
import { cn } from "../ui/utils";

const ICON: Record<StepType, typeof BookOpen> = { explainer: BookOpen, video: PlayCircle, scenario: Split, check: CircleCheck, reflect: PenLine, recap: ListChecks, activity: Hammer };

/** "Start module", or "Continue" once some steps are done (module overview header). */
export function ModuleStart({ steps }: { steps: StepRef[] }) {
  const { completed } = useProgress();
  const done = steps.filter((s) => completed.has(s.id)).length;
  const next = steps.find((s) => !completed.has(s.id));
  const label = done === 0 ? "Start module" : next ? "Continue" : "Review from the start";
  const href = done > 0 && next ? next.href : steps[0].href;
  return (
    <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
      <a href={href} className={buttonVariants({ size: "lg" })}>
        {label} <ArrowRight aria-hidden="true" />
      </a>
      <p role="status" className="text-ui font-bold text-ink empty:hidden">
        {done === 0 ? "" : next ? `${done} of ${steps.length} steps done.` : "You finished every step. Nice work!"}
      </p>
    </div>
  );
}

/** The module's steps with type icons and completion checks (module overview). */
export function ModuleSteps({ steps, track }: { steps: StepRef[]; track: string }) {
  const { completed } = useProgress();
  return (
    <ol className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface shadow-1">
      {steps.map((step) => {
        const Icon = ICON[step.type];
        const done = completed.has(step.id);
        return (
          <li key={step.id}>
            <a href={step.href} className="flex min-h-[var(--tap)] items-center gap-4 px-4 py-3.5 transition-colors hover:bg-surface-2 sm:px-5">
              <StepDot n={step.n} done={done} current={false} track={track} />
              <span className="min-w-0 flex-1">
                <span className="block text-ui font-bold text-ink">{step.title}</span>
                <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-small text-ink-soft">
                  <Icon aria-hidden="true" className="size-4" />
                  {STEP_LABEL[step.type]} · <Clock aria-hidden="true" className="size-3.5" /> {step.minutes} min
                  {done && <span className="sr-only">, completed</span>}
                </span>
              </span>
              <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-ink-soft" />
            </a>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Optional "See what you already know" pre-check (brief section 7). Skipping it is one click: just
 * start the module. The first score is kept as the learner's starting point, so once there is one
 * the check isn't offered again (the same questions come back after the module).
 */
export function PreCheck({ questions, moduleId, startHref }: { questions: Question[]; moduleId: string; startHref: string }) {
  const [open, setOpen] = useState(false);
  const { precheck } = useProgress();
  const result = precheck.get(moduleId);
  const panelId = `precheck-${moduleId.replace(/\W+/g, "-")}`;
  return (
    <div className="rounded-xl border border-line bg-surface p-5 shadow-1 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-title font-semibold text-ink">See what you already know</h2>
          <p className="mt-1 text-ui text-ink-soft">
            {result ? `Your starting score: ${result.score} of ${result.total}.` : `${questions.length} quick questions before you start. Optional.`}
          </p>
        </div>
        {(open || !result) && (
          <Button type="button" variant="outline" className="min-h-[var(--tap)]" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(!open)}>
            {open ? "Hide the pre-check" : "Try the pre-check"}
          </Button>
        )}
      </div>
      <div id={panelId} hidden={!open} className={cn(open && "mt-5")}>
        {open && (
          <>
            <Check questions={questions} mode="pre" onScore={(score, total, answers) => progress.savePrecheck(moduleId, { score, total }, answers)} />
            <a href={startHref} className={cn(buttonVariants(), "mt-5")}>
              Start the module <ArrowRight aria-hidden="true" />
            </a>
          </>
        )}
      </div>
    </div>
  );
}
