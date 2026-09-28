import { ArrowRight, CircleCheck } from "lucide-react";
import { useProgress, nextStep, type StepSet } from "../../lesson/progress";
import { ProgressRing } from "../ui/progress-ring";
import { buttonVariants } from "../ui/button";
import { cn } from "../ui/utils";

/** What these islands need to know about a module (plain data from the static page). */
export type ModuleLite = { id: string; title: string; href: string; track: string; trackTitle?: string; steps: { id: string; href: string; title?: string }[] };
type TrackId = "explorers" | "investigators" | "architects";

const countDone = (steps: ModuleLite["steps"], completed: StepSet) => steps.filter((s) => completed.has(s.id)).length;

/**
 * The module a learner was last working on (most recently updated, not finished), and the step to
 * open next. Null when nothing is in progress.
 */
export function resumeTarget(modules: ModuleLite[], state: ReturnType<typeof useProgress>) {
  let best: { mod: ModuleLite; step: ModuleLite["steps"][number]; at: string } | null = null;
  for (const mod of modules) {
    const m = state.modules.get(mod.id);
    if (!m || !mod.steps.length) continue;
    const step = nextStep(mod.steps, state.completed);
    const done = countDone(mod.steps, state.completed);
    if (!step || done === 0) continue;
    const at = m.updatedAt ?? m.startedAt ?? "";
    if (!best || at > best.at) best = { mod, step, at };
  }
  return best;
}

/** Course header (brief section 7): "Start course", or "Resume" with a progress ring once started. */
export function CourseStart({ modules, trackId, variant }: { modules: ModuleLite[]; trackId: TrackId; variant: "ink" | "light" }) {
  const state = useProgress();
  const withSteps = modules.filter((m) => m.steps.length > 0);
  const total = withSteps.reduce((n, m) => n + m.steps.length, 0);
  const done = withSteps.reduce((n, m) => n + countDone(m.steps, state.completed), 0);
  const finished = withSteps.filter((m) => m.steps.length && countDone(m.steps, state.completed) === m.steps.length).length;
  const resume = resumeTarget(modules, state);
  const next = resume ?? withSteps.map((mod) => ({ mod, step: nextStep(mod.steps, state.completed) })).find((x) => x.step && done > 0);
  // Nothing started yet: step 1 of the first module that has lessons (earlier modules may still be
  // "coming soon" stubs), or the first module's overview when none has lessons yet.
  const href = next?.step?.href ?? withSteps[0]?.steps[0]?.href ?? modules[0].href;
  // No module in this course has lessons yet: don't promise a course; point to the syllabus, where
  // every module links its slide deck.
  if (!withSteps.length) {
    return (
      <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
        <a href="#syllabus" className={buttonVariants({ variant, size: "lg" })}>
          See the modules <ArrowRight aria-hidden="true" />
        </a>
        <p className="max-w-md text-ui font-bold">Lessons for this course are being written. Every module has a slide deck you can use now.</p>
      </div>
    );
  }
  return (
    <div className="mt-8 flex flex-wrap items-center gap-4">
      <a href={href} className={buttonVariants({ variant, size: "lg" })}>
        {done > 0 ? "Resume" : "Start course"} <ArrowRight aria-hidden="true" />
      </a>
      {done > 0 && total > 0 && (
        <div className="flex items-center gap-3 rounded-full bg-surface py-1.5 pl-1.5 pr-5 text-ink shadow-1">
          <ProgressRing done={done} total={total} label="Your progress in this course" track={trackId} size="sm" showValue={false} />
          <p className="text-small font-bold">
            {done} of {total} lesson steps done{finished > 0 ? ` · ${finished} ${finished === 1 ? "module" : "modules"} finished` : ""}
          </p>
        </div>
      )}
    </div>
  );
}

/** A syllabus row's "2/6 steps", or "Finished" (course page). Plain text until progress loads. */
export function ModuleRowProgress({ steps }: { steps: ModuleLite["steps"] }) {
  const { completed } = useProgress();
  const done = countDone(steps, completed);
  if (steps.length && done === steps.length) {
    return (
      <span className="inline-flex items-center gap-1 font-bold text-success">
        <CircleCheck aria-hidden="true" className="size-4" />Finished
      </span>
    );
  }
  return <span className={cn(done > 0 && "font-bold text-ink")}>{done}/{steps.length} steps</span>;
}

/** Home page (brief section 7): "Continue where you left off", only for signed-in learners with progress. */
export function ContinueCard({ modules }: { modules: ModuleLite[] }) {
  const state = useProgress();
  if (state.status !== "account") return null;
  const resume = resumeTarget(modules, state);
  if (!resume) return null;
  const { mod, step } = resume;
  const done = countDone(mod.steps, state.completed);
  const n = mod.steps.indexOf(step) + 1;
  return (
    <section aria-labelledby="continue-h" className="px-4 pb-12 sm:px-6">
      <div className="mx-auto flex max-w-site flex-col gap-5 rounded-xl border border-line bg-surface p-6 shadow-1 sm:flex-row sm:items-center sm:p-8">
        <ProgressRing done={done} total={mod.steps.length} label={`${mod.title}: your progress`} track={mod.track as TrackId} />
        <div className="min-w-0 flex-1">
          <h2 id="continue-h" className="font-sans text-small font-bold uppercase tracking-[0.12em] text-ink-soft">
            Continue where you left off{state.learner && state.accountType === "parent" ? ` · ${state.learner.nickname}` : ""}
          </h2>
          <p className="mt-1 font-display text-title font-semibold text-ink">{mod.title}</p>
          <p className="mt-1 text-ui text-ink-soft">
            {mod.trackTitle ? `${mod.trackTitle} · ` : ""}Step {n} of {mod.steps.length}{step.title ? `: ${step.title}` : ""}
          </p>
        </div>
        <a href={step.href} className={cn(buttonVariants({ size: "lg" }), "self-start sm:self-center")}>
          Continue <span className="sr-only">{mod.title}</span> <ArrowRight aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
