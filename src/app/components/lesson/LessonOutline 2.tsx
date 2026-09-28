import { useState } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import type { StepRef } from "../../../lib/lesson-types";
import { useProgress } from "../../lesson/progress";
import { OutlineList } from "./OutlineList";
import { cn } from "../ui/utils";

type Props = { steps: StepRef[]; currentId: string; track: string; moduleTitle: string; moduleHref: string };

/**
 * Desktop module outline (brief section 7). The step page renders it with transition:persist,
 * so its open/closed state and scroll position carry over from step to step.
 */
export function LessonOutline({ steps, currentId, track, moduleTitle, moduleHref }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const { completed } = useProgress();
  const done = steps.filter((s) => completed.has(s.id)).length;

  return (
    <aside
      aria-label="Module outline"
      className={cn(
        "sticky top-[var(--lesson-top)] hidden h-[calc(100dvh-var(--lesson-top))] shrink-0 flex-col border-r border-line bg-surface transition-[width] duration-[var(--dur)] ease-out lg:flex",
        collapsed ? "w-[4.75rem]" : "w-80",
      )}
    >
      <div className={cn("flex items-start gap-2 border-b border-line p-3", collapsed ? "justify-center" : "justify-between pl-5")}>
        {!collapsed && (
          <div className="min-w-0 pt-1.5">
            <p className="text-small font-bold uppercase tracking-[0.12em] text-ink-soft">Module outline</p>
            <p className="mt-1 text-small text-ink-soft">
              <a href={moduleHref} className="rounded-sm font-bold text-ink underline decoration-line-strong decoration-1 underline-offset-4 hover:decoration-2">{moduleTitle}</a>
              <span className="block">{done} of {steps.length} steps done</span>
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          aria-expanded={!collapsed}
          aria-controls="lesson-outline-steps"
          className="grid size-11 shrink-0 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink"
        >
          {collapsed ? <PanelLeftOpen aria-hidden="true" className="size-5" /> : <PanelLeftClose aria-hidden="true" className="size-5" />}
          <span className="sr-only">{collapsed ? "Show step names" : "Hide step names"}</span>
        </button>
      </div>
      <nav aria-label="Steps" className="flex-1 overflow-y-auto overscroll-contain p-3">
        <OutlineList id="lesson-outline-steps" steps={steps} currentId={currentId} completed={completed} track={track} compact={collapsed} />
      </nav>
    </aside>
  );
}
