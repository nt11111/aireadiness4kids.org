import { Check } from "lucide-react";
import { STEP_LABEL, type StepRef } from "../../../lib/lesson-types";
import { trackStyle } from "../../lib/tracks";
import { cn } from "../ui/utils";

/** The circle beside each step: a check when done, the step number otherwise (current step in the track color). */
export function StepDot({ n, done, current, track, className }: { n: number; done: boolean; current: boolean; track: string; className?: string }) {
  const s = trackStyle(track);
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-7 shrink-0 place-items-center rounded-full text-small font-bold tabular-nums",
        done ? "bg-success text-white" : current ? s.fill : "border-[1.5px] border-input bg-surface text-ink-soft",
        className,
      )}
    >
      {done ? <Check className="size-4" strokeWidth={3} /> : n}
    </span>
  );
}

type Props = {
  steps: StepRef[];
  currentId: string;
  completed: ReadonlySet<string>;
  track: string;
  /** Collapsed rail: numbers only, names stay available to screen readers. */
  compact?: boolean;
  onNavigate?: () => void;
  id?: string;
};

/** The module's steps, used by the desktop sidebar and the mobile bottom sheet. */
export function OutlineList({ steps, currentId, completed, track, compact = false, onNavigate, id }: Props) {
  const s = trackStyle(track);
  return (
    <ol id={id} className={cn("grid", compact ? "justify-items-center gap-2" : "gap-1")}>
      {steps.map((step) => {
        const current = step.id === currentId;
        const done = completed.has(step.id);
        const status = done ? ", completed" : "";
        return (
          <li key={step.id} className={cn(!compact && "relative")}>
            {!compact && current && <span aria-hidden="true" className={cn("absolute inset-y-2 left-0 w-1 rounded-full", s.bar)} />}
            <a
              href={step.href}
              onClick={onNavigate}
              aria-current={current ? "step" : undefined}
              aria-label={compact ? `Step ${step.n}: ${step.title}${status}` : undefined}
              title={compact ? step.title : undefined}
              className={cn(
                "flex rounded-lg transition-colors duration-[var(--dur-fast)]",
                compact ? "size-11 place-items-center justify-center" : "min-h-[var(--tap)] items-start gap-3 py-2.5 pl-4 pr-3",
                current ? "bg-surface-2" : "hover:bg-surface-2/70",
                compact && "grid",
              )}
            >
              <StepDot n={step.n} done={done} current={current} track={track} className={cn(!compact && "mt-0.5")} />
              {!compact && (
                <span className="min-w-0">
                  <span className={cn("block text-ui leading-snug text-ink", current && "font-bold")}>{step.title}</span>
                  <span className="mt-0.5 block text-small text-ink-soft">
                    {STEP_LABEL[step.type]} · {step.minutes} min
                    {done && <span className="sr-only">, completed</span>}
                  </span>
                </span>
              )}
            </a>
          </li>
        );
      })}
    </ol>
  );
}
