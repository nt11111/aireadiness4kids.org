import { useState } from "react";
import type { SortData } from "../../../lib/lesson-types";
import { cn } from "../ui/utils";
import { buttonVariants } from "../ui/button";

/**
 * The home page's "Try a real question": the first few cards of a real lesson's sort, one at a time.
 * Pick an answer, press Check, read why, then go on. Nothing is saved.
 */
export function SampleQuestion({ sort, lessonHref, lessonTitle }: { sort: SortData; lessonHref: string; lessonTitle: string }) {
  const items = sort.items;
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const item = items[i];
  const right = checked && pick === item.bucket;
  const last = i === items.length - 1;

  const next = () => { setI(i + 1); setPick(null); setChecked(false); };

  return (
    <div className="border-2 border-ink bg-surface">
      <div className="flex justify-between border-b border-ink px-4 py-3 font-display text-small font-bold">
        <span>{sort.prompt}</span>
        <span className="tabular-nums" aria-label={`Card ${i + 1} of ${items.length}`}>{i + 1} / {items.length}</span>
      </div>
      <div className="grid gap-4 px-4 py-5">
        <div className="grid grid-flow-col gap-[3px]" aria-hidden="true">
          {items.map((it, n) => <i key={it.id} className={cn("block h-2", n < i || (n === i && checked) ? "bg-track-aware" : "bg-line")} />)}
        </div>
        <p className="min-h-[2.3em] font-display text-[clamp(1.375rem,3vw,1.875rem)] font-bold leading-tight text-ink" aria-live="polite">{item.text}</p>
        <div role="group" aria-label="Your answer" className="grid grid-cols-2 border-2 border-ink">
          {sort.buckets.map((b, n) => (
            <button
              key={b.id}
              type="button"
              aria-pressed={pick === b.id}
              disabled={checked}
              onClick={() => setPick(b.id)}
              className={cn(
                "flex min-h-16 items-center justify-between gap-3 px-4 py-4 text-left font-display text-lg font-bold leading-tight transition-colors after:size-[18px] after:shrink-0 after:border-2 after:content-['']",
                n > 0 && "border-l-2 border-ink",
                pick === b.id ? "bg-ink text-white after:border-white after:bg-white" : "bg-surface text-ink after:border-ink hover:bg-surface-2",
              )}
            >
              {b.label}
            </button>
          ))}
        </div>
        {checked && (
          <div role="status" className={cn("border-l-[6px] px-4 py-3 font-bold", right ? "border-success bg-success-soft text-success" : "border-warning bg-warning-soft text-warning")}>
            {right ? "Yes, that's right." : `Not quite. It ${item.bucket === sort.buckets[0].id ? "uses" : "doesn't use"} AI.`}
            <span className="mt-0.5 block font-normal text-ink">{item.why}</span>
          </div>
        )}
        {!checked ? (
          <button type="button" disabled={!pick} onClick={() => setChecked(true)} className={cn(buttonVariants({ size: "lg" }), "w-full")}>Check</button>
        ) : last ? (
          <a href={lessonHref} className={cn(buttonVariants({ size: "lg" }), "w-full justify-between")}>Keep going in “{lessonTitle}” <span aria-hidden="true">→</span></a>
        ) : (
          <button type="button" onClick={next} className={cn(buttonVariants({ size: "lg" }), "w-full")}>Next card</button>
        )}
      </div>
    </div>
  );
}
