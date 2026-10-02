import { useId, useLayoutEffect, useState } from "react";
import { CircleCheck, Lightbulb } from "lucide-react";
import type { Question } from "../../../lib/lesson-types";
import { progress } from "../../lesson/progress";
import { scoreBucket, track } from "../../../lib/analytics";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";

type QState = { selected: string | null; checked: boolean; firstTry: boolean | null; nudge: boolean };

type Props = {
  questions: Question[];
  /** Marks this lesson step complete once every question has been answered. */
  stepId?: string;
  /**
   * lesson: check each answer and explain it right away.
   * pre: the optional "See what you already know" check. Shows a score only, so the answers
   * stay fresh for the post-check at the end of the module.
   * post: the same questions again on the completion page, also score only.
   */
  mode?: "lesson" | "pre" | "post";
  /** answers: question id -> chosen option id (the server re-scores these; see /api/progress/precheck). */
  onScore?: (score: number, total: number, answers: Record<string, string>) => void;
};

/** <Check>: 1 to 5 multiple-choice or true/false questions (brief section 6). */
export function Check({ questions, stepId, mode = "lesson", onScore }: Props) {
  const uid = useId();
  const [qs, setQs] = useState<Record<string, QState>>(() =>
    Object.fromEntries(questions.map((q) => [q.id, { selected: null, checked: false, firstTry: null, nudge: false }])),
  );
  const [reported, setReported] = useState(false);
  const [preResult, setPreResult] = useState<{ score: number; nudge: boolean } | null>(null);
  // The Check / Try again buttons disappear when pressed, so move focus somewhere useful instead of losing it.
  const [focusId, setFocusId] = useState<string | null>(null);
  // Layout effect: focus moves in the same task as the click, before the next key press arrives.
  useLayoutEffect(() => {
    if (!focusId) return;
    document.getElementById(focusId)?.focus();
    setFocusId(null);
  }, [focusId]);

  const update = (id: string, patch: Partial<QState>) => setQs((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const checkOne = (q: Question) => {
    const s = qs[q.id];
    if (!s.selected) { update(q.id, { nudge: true }); return; }
    const correct = s.selected === q.answer;
    const next = { ...qs, [q.id]: { ...s, checked: true, nudge: false, firstTry: s.firstTry ?? correct } };
    setQs(next);
    setFocusId(`${uid}-${q.id}-feedback`);
    const all = questions.every((x) => next[x.id].checked);
    if (all && !reported) {
      setReported(true);
      const score = questions.filter((x) => next[x.id].firstTry).length;
      track({ name: "check_submit", props: { phase: "lesson", score_bucket: scoreBucket(score, questions.length) } });
      if (stepId) progress.complete(stepId);
      onScore?.(score, questions.length, Object.fromEntries(questions.map((x) => [x.id, next[x.id].selected ?? ""])));
    }
  };

  const submitPre = () => {
    const unanswered = questions.some((q) => !qs[q.id].selected);
    if (unanswered) { setPreResult({ score: 0, nudge: true }); return; }
    const score = questions.filter((q) => qs[q.id].selected === q.answer).length;
    setPreResult({ score, nudge: false });
    track({ name: "check_submit", props: { phase: mode === "post" ? "post" : "pre", score_bucket: scoreBucket(score, questions.length) } });
    onScore?.(score, questions.length, Object.fromEntries(questions.map((q) => [q.id, qs[q.id].selected ?? ""])));
  };

  const allChecked = questions.every((q) => qs[q.id].checked);
  const firstTryScore = questions.filter((q) => qs[q.id].firstTry).length;
  const preLocked = mode !== "lesson" && preResult !== null && !preResult.nudge;

  return (
    <div className="grid gap-5">
      {questions.map((q, i) => {
        const s = qs[q.id];
        const promptId = `${uid}-${q.id}-prompt`;
        const correct = s.checked && s.selected === q.answer;
        const locked = (mode === "lesson" && s.checked) || preLocked;
        return (
          <div key={q.id} className="rounded-xl border border-line bg-surface p-5 shadow-1 sm:p-6">
            <p className="text-small font-bold text-ink-soft">Question {i + 1} of {questions.length}</p>
            <p id={promptId} className="mt-1 text-lesson font-bold text-ink [.lesson-aware_&]:text-lesson-aware">{q.prompt}</p>
            <RadioGroup
              value={s.selected ?? ""}
              onValueChange={(v) => update(q.id, { selected: v, nudge: false })}
              aria-labelledby={promptId}
              disabled={locked}
              className="mt-4 gap-2"
            >
              {q.options.map((o) => {
                const id = `${uid}-${q.id}-${o.id}`;
                const chosen = s.selected === o.id;
                const isAnswer = o.id === q.answer;
                const reveal = mode === "lesson" && s.checked;
                return (
                  <label
                    key={o.id}
                    htmlFor={id}
                    className={cn(
                      "flex min-h-[var(--tap)] items-center gap-3 rounded-lg border-[1.5px] px-4 py-2.5 text-ui text-ink transition-colors duration-[var(--dur-fast)]",
                      locked ? "cursor-default" : "cursor-pointer hover:border-input",
                      reveal && isAnswer ? "border-success bg-brand-soft" : chosen ? "border-primary bg-brand-soft/50" : "border-line bg-surface",
                    )}
                  >
                    <RadioGroupItem value={o.id} id={id} />
                    <span className="flex-1">{o.text}</span>
                    {reveal && isAnswer && (
                      <span className="inline-flex shrink-0 items-center gap-1 text-small font-bold text-success"><CircleCheck aria-hidden="true" className="size-4" />Answer</span>
                    )}
                    {reveal && chosen && !isAnswer && <span className="shrink-0 text-small font-bold text-ink-soft">Your pick</span>}
                  </label>
                );
              })}
            </RadioGroup>

            {mode === "lesson" && (
              <>
                {!s.checked && (
                  <Button type="button" variant="secondary" className="mt-4 min-h-[var(--tap)]" onClick={() => checkOne(q)}>
                    Check answer
                  </Button>
                )}
                <div role="status" className="mt-4 empty:mt-0">
                  {s.nudge && <p className="text-ui text-ink-soft">Pick an answer first, then check it.</p>}
                  {s.checked && (
                    <div id={`${uid}-${q.id}-feedback`} tabIndex={-1} className={cn("rounded-lg border p-4 focus-visible:outline-offset-2", correct ? "border-success/40 bg-brand-soft" : "border-line bg-surface-2")}>
                      <p className="flex items-center gap-2 font-bold text-ink">
                        {correct ? <CircleCheck aria-hidden="true" className="size-5 shrink-0 text-success" /> : <Lightbulb aria-hidden="true" className="size-5 shrink-0 text-warning" />}
                        {correct ? "That's it." : "Not quite. Here's the idea:"}
                      </p>
                      <p className="mt-1.5 text-ui text-ink">{q.explanation}</p>
                      {!correct && (
                        <Button type="button" variant="outline" size="sm" className="mt-3 min-h-[var(--tap)]" onClick={() => { update(q.id, { checked: false, selected: null }); setFocusId(`${uid}-${q.id}-${q.options[0].id}`); }}>
                          Try again
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        );
      })}

      {mode === "lesson" && (
        <p role="status" className="text-ui text-ink-soft empty:hidden">
          {allChecked ? `All ${questions.length} answered. You got ${firstTryScore} of ${questions.length} on the first try.` : ""}
        </p>
      )}

      {mode !== "lesson" && (
        <div className="grid gap-3">
          {!preLocked && (
            <Button type="button" className="min-h-[var(--tap)] justify-self-start" onClick={submitPre}>See my score</Button>
          )}
          <p role="status" className="text-ui text-ink empty:hidden">
            {preResult?.nudge && "Answer all the questions first, or skip the check. It's optional."}
            {preLocked && mode === "pre" && `You got ${preResult!.score} of ${questions.length}. That's your starting point. You'll see the answers as you go, and can try these again at the end.`}
            {preLocked && mode === "post" && `You got ${preResult!.score} of ${questions.length}.`}
          </p>
        </div>
      )}
    </div>
  );
}
