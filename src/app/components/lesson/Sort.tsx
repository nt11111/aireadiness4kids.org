import { useId, useLayoutEffect, useState, type DragEvent } from "react";
import { ArrowDown, CircleCheck, Lightbulb, Undo2 } from "lucide-react";
import type { SortData } from "../../../lib/lesson-types";
import { progress } from "../../lesson/progress";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";

type Props = SortData & { stepId?: string };

/**
 * <Sort>: put each card in a bucket (brief section 6). One card at a time, with a button for each
 * bucket, so it works by tapping and by keyboard; mouse users can also drag the card.
 * "Check my sorting" then explains every card.
 */
export function Sort({ prompt, buckets, items, stepId }: Props) {
  const uid = useId();
  const [place, setPlace] = useState<Record<string, string | null>>(() => Object.fromEntries(items.map((i) => [i.id, null])));
  const [checked, setChecked] = useState(false);
  const [message, setMessage] = useState("");
  const [over, setOver] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);

  const pool = items.filter((i) => !place[i.id]);
  const current = pool[0];
  const sorted = items.length - pool.length;
  const label = (id: string) => buckets.find((b) => b.id === id)?.label ?? "";
  const correct = items.filter((i) => place[i.id] === i.bucket).length;

  // When the bucket buttons go away (every card sorted), keep focus on something useful.
  // Layout effect: focus moves in the same task as the click, before the next key press arrives.
  useLayoutEffect(() => {
    if (!focusId) return;
    document.getElementById(focusId)?.focus();
    setFocusId(null);
  }, [focusId]);

  const move = (itemId: string, to: string | null) => {
    const item = items.find((i) => i.id === itemId);
    if (!item || place[itemId] === to) return;
    const nextPool = items.filter((i) => (i.id === itemId ? !to : !place[i.id]));
    setPlace((prev) => ({ ...prev, [itemId]: to }));
    setChecked(false);
    const next = nextPool[0];
    const moved = to ? `Put "${item.text}" in ${label(to)}.` : `Moved "${item.text}" back to the cards to sort.`;
    setMessage(next ? `${moved} Next card: ${next.text}` : `${moved} All cards sorted. You can check your sorting now.`);
    setFocusId(next ? `${uid}-put-0` : `${uid}-check`);
  };

  const check = () => {
    setChecked(true);
    setMessage(`You put ${correct} of ${items.length} where we would. Read the note on each card.`);
    setFocusId(`${uid}-status`);
    if (stepId) progress.complete(stepId);
  };

  const retry = () => {
    const wrong = items.filter((i) => place[i.id] !== i.bucket);
    setPlace((prev) => ({ ...prev, ...Object.fromEntries(wrong.map((i) => [i.id, null])) }));
    setChecked(false);
    setMessage(`${wrong.length} ${wrong.length === 1 ? "card is" : "cards are"} back to sort again. Next card: ${wrong[0]?.text ?? ""}`);
    setFocusId(`${uid}-put-0`);
  };

  // Dragging is an extra for mouse users; every move is also a button.
  const dropZone = (zone: string) => ({
    onDragOver: (e: DragEvent) => { e.preventDefault(); setOver(zone); },
    onDragLeave: () => setOver((z) => (z === zone ? null : z)),
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      setOver(null);
      const id = e.dataTransfer.getData("text/plain");
      if (id) move(id, zone);
    },
  });

  return (
    <div role="group" aria-labelledby={`${uid}-prompt`} className="rounded-xl border border-line bg-surface p-5 shadow-1 sm:p-6">
      <p id={`${uid}-prompt`} className="text-lesson font-bold text-ink">{prompt}</p>

      <div className="mt-4 rounded-lg bg-surface-2 p-4 sm:p-5">
        {current ? (
          <>
            <p className="text-small font-bold text-ink-soft">Card {sorted + 1} of {items.length}</p>
            <div
              draggable
              onDragStart={(e) => { e.dataTransfer.setData("text/plain", current.id); e.dataTransfer.effectAllowed = "move"; }}
              onDragEnd={() => setOver(null)}
              className="mt-2 cursor-grab rounded-lg border-[1.5px] border-line bg-surface p-4 shadow-2 active:cursor-grabbing"
            >
              <p id={`${uid}-card`} className="text-ui text-ink sm:text-lesson">{current.text}</p>
            </div>
            <p className="mt-4 flex items-center gap-1.5 text-small font-bold text-ink-soft">
              <ArrowDown aria-hidden="true" className="size-4" /> Put it in
              <span className="font-normal">(or drag it)</span>
            </p>
            <div className={cn("mt-2 grid gap-2", buckets.length > 1 && "sm:grid-cols-2")}>
              {buckets.map((b, bi) => (
                <Button
                  key={b.id}
                  id={`${uid}-put-${bi}`}
                  type="button"
                  variant="outline"
                  className="h-auto min-h-[var(--tap)] justify-start whitespace-normal py-2.5 text-left"
                  aria-label={`Put "${current.text}" in ${b.label}`}
                  onClick={() => move(current.id, b.id)}
                >
                  {b.label}
                </Button>
              ))}
            </div>
          </>
        ) : (
          <p className="text-ui text-ink">All {items.length} cards sorted.{checked ? "" : " Check your sorting when you're ready."}</p>
        )}
      </div>

      <div className={cn("mt-4 grid gap-3", buckets.length > 1 && "sm:grid-cols-2")}>
        {buckets.map((b) => {
          const inBucket = items.filter((i) => place[i.id] === b.id);
          return (
            <div
              key={b.id}
              role="group"
              aria-labelledby={`${uid}-bucket-${b.id}`}
              {...dropZone(b.id)}
              className={cn("rounded-lg border-2 border-dashed p-3 transition-colors", over === b.id ? "border-primary bg-brand-soft/50" : "border-input bg-surface")}
            >
              <p id={`${uid}-bucket-${b.id}`} className="flex items-baseline justify-between gap-2 font-bold text-ink">
                {b.label} <span className="shrink-0 text-small font-normal text-ink-soft">{inBucket.length} {inBucket.length === 1 ? "card" : "cards"}</span>
              </p>
              {inBucket.length === 0 ? (
                <p className="mt-1 text-small text-ink-soft">Nothing here yet.</p>
              ) : (
                <ul className="mt-2 grid gap-2">
                  {inBucket.map((item) => {
                    const right = item.bucket === b.id;
                    return (
                      <li key={item.id} className="rounded-md border border-line bg-surface-2 py-1 pl-3 pr-1">
                        <div className="flex items-start gap-1">
                          <p className="flex-1 py-2 text-small text-ink">{item.text}</p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-[var(--tap)] shrink-0 text-ink-soft"
                            aria-label={`Move "${item.text}" back to the cards to sort`}
                            title="Move back"
                            onClick={() => move(item.id, null)}
                          >
                            <Undo2 aria-hidden="true" />
                          </Button>
                        </div>
                        {checked && (
                          <p className="flex gap-2 pb-2 pr-2 text-small text-ink">
                            {right ? <CircleCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-success" /> : <Lightbulb aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-warning" />}
                            <span>
                              <span className="font-bold">{right ? "Good fit. " : `We'd put this in "${label(item.bucket)}." `}</span>
                              {item.why}
                            </span>
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {!checked && !current && (
          <Button id={`${uid}-check`} type="button" className="min-h-[var(--tap)]" onClick={check}>Check my sorting</Button>
        )}
        {checked && correct < items.length && (
          <Button type="button" variant="outline" className="min-h-[var(--tap)]" onClick={retry}>Sort the others again</Button>
        )}
      </div>
      <p id={`${uid}-status`} tabIndex={-1} role="status" className={cn("mt-3 text-ui text-ink empty:hidden", checked && "rounded-lg bg-surface-2 px-4 py-3 font-bold")}>{message}</p>
    </div>
  );
}
