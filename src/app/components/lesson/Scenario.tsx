import { useId, useState } from "react";
import { Eye, Split } from "lucide-react";
import type { ScenarioData } from "../../../lib/lesson-types";
import { progress } from "../../lesson/progress";
import { cn } from "../ui/utils";

type Props = ScenarioData & { stepId?: string };

const letter = (i: number) => String.fromCharCode(65 + i);

/**
 * <Scenario>: "What would you do?" (brief section 6). Every choice gets feedback that explains
 * what could happen; nothing is marked wrong, and learners can explore the other choices.
 */
export function Scenario({ prompt, options, stepId }: Props) {
  const uid = useId();
  const [chosen, setChosen] = useState<string | null>(null);
  const [seen, setSeen] = useState<ReadonlySet<string>>(new Set());

  const choose = (id: string) => {
    setChosen(id);
    setSeen((prev) => new Set(prev).add(id));
    if (stepId) progress.complete(stepId);
  };

  const index = options.findIndex((o) => o.id === chosen);
  const picked = options[index];

  return (
    <div role="group" aria-labelledby={`${uid}-prompt`} className="rounded-xl border border-line bg-surface p-5 shadow-1 sm:p-6">
      <p className="inline-flex items-center gap-2 text-small font-bold uppercase tracking-[0.12em] text-brand">
        <Split aria-hidden="true" className="size-4" /> What would you do?
      </p>
      <p id={`${uid}-prompt`} className="mt-2 text-lesson font-bold text-ink">{prompt}</p>
      <ul className="mt-4 grid gap-2">
        {options.map((o, i) => (
          <li key={o.id}>
            <button
              type="button"
              aria-pressed={chosen === o.id}
              onClick={() => choose(o.id)}
              className={cn(
                "flex min-h-[var(--tap)] w-full items-start gap-3 rounded-lg border-[1.5px] px-4 py-3 text-left text-ui text-ink transition-colors duration-[var(--dur-fast)]",
                chosen === o.id ? "border-primary bg-brand-soft/60" : "border-line bg-surface hover:border-input",
              )}
            >
              <span aria-hidden="true" className={cn("grid size-7 shrink-0 place-items-center rounded-full border-[1.5px] text-small font-bold", chosen === o.id ? "border-primary bg-primary text-primary-foreground" : "border-input text-ink-soft")}>
                {letter(i)}
              </span>
              <span className="flex-1 pt-0.5">{o.text}</span>
              {seen.has(o.id) && chosen !== o.id && (
                <span className="inline-flex shrink-0 items-center gap-1 pt-1 text-small text-ink-soft"><Eye aria-hidden="true" className="size-4" />Seen</span>
              )}
            </button>
          </li>
        ))}
      </ul>
      <div aria-live="polite" className="mt-4 empty:mt-0">
        {picked && (
          <div className="rounded-lg border border-line bg-surface-2 p-4 sm:p-5">
            <p className="font-bold text-ink">If you chose {letter(index)}:</p>
            <p className="mt-1.5 text-ui text-ink">{picked.feedback}</p>
            <p className="mt-3 text-small text-ink-soft">
              {seen.size < options.length ? "Curious how the other choices play out? Pick another one." : "You've seen every choice. Which would you pick now, and why?"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
