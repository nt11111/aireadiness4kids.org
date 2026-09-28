import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { ArrowRight, CircleCheck } from "lucide-react";
import type { Question } from "../../../lib/lesson-types";
import { GRADE_BANDS } from "../../../lib/account-rules";
import { scoreBucket, track } from "../../../lib/analytics";
import { apiErrorMessage, postJSON } from "../../auth/api";
import { anonSid, currentSrc, signedInHint } from "../../lesson/guest";
import { Notice, SubmitButton } from "../auth/Field";
import { buttonVariants } from "../ui/button";
import { cn } from "../ui/utils";

type Props = { moduleId: string; moduleTitle: string; moduleHref: string; phase: "pre" | "post"; questions: Question[] };
type Done = { score: number; outOf: number; duplicate: boolean };

/**
 * The open workshop knowledge check (brief section 8.6), reached from the presenter's QR code.
 * A plain form with native radio buttons, read with FormData on submit: anything picked before the
 * page's JavaScript loads is kept, and SubmitButton stops the browser sending the form itself.
 * Answers go to /api/checks, which scores them; nothing here reveals the right answers.
 */
export function WorkshopCheck({ moduleId, moduleTitle, moduleHref, phase, questions }: Props) {
  const uid = useId();
  const form = useRef<HTMLFormElement>(null);
  const thanks = useRef<HTMLDivElement>(null);
  const [missing, setMissing] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<Done | null>(null);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => setSignedIn(signedInHint()), []);
  useEffect(() => { if (done) thanks.current?.focus(); }, [done]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const data = new FormData(e.currentTarget);
    const answers: Record<string, string> = {};
    const gaps: number[] = [];
    questions.forEach((q, i) => {
      const pick = data.get(`q-${q.id}`);
      if (typeof pick === "string" && pick) answers[q.id] = pick;
      else gaps.push(i + 1);
    });
    setMissing(gaps);
    setError(null);
    if (gaps.length) {
      form.current?.querySelector<HTMLInputElement>(`[data-question="${questions[gaps[0] - 1].id}"] input`)?.focus();
      return;
    }
    const grade = data.get("grade");
    setBusy(true);
    // Signed in: the result is linked to the learner by the server, so no browser id is kept.
    const sid = signedInHint() ? crypto.randomUUID() : anonSid();
    const src = currentSrc();
    const res = await postJSON<Done>("/api/checks", { moduleId, phase, answers, anonSid: sid, ...(src ? { src } : {}), ...(typeof grade === "string" && grade ? { gradeBand: grade } : {}) });
    setBusy(false);
    if (res.ok) {
      if (!res.data.duplicate) track({ name: "check_submit", props: { phase, score_bucket: scoreBucket(res.data.score, res.data.outOf) } });
      setDone(res.data);
    } else if (res.status === 429) {
      setError("Lots of answers are coming from this network right now. Wait a minute, then try again.");
    } else {
      setError(apiErrorMessage(res.data.error));
    }
  }

  if (done) {
    return (
      <div ref={thanks} tabIndex={-1} className="grid gap-5 rounded-xl border border-line bg-surface p-6 shadow-1 focus:outline-none sm:p-8">
        <p className="flex items-center gap-2 font-display text-title font-semibold text-ink">
          <CircleCheck aria-hidden="true" className="size-6 shrink-0 text-success" />
          {done.duplicate ? "You've already sent answers for this check. Thanks!" : "Thanks! Your answers are in."}
        </p>
        <p className="text-lesson text-ink">
          You got {done.score} of {done.outOf}.{" "}
          {phase === "pre" ? "That's your starting point. You'll see these ideas in the lesson." : "Nice work thinking it through."}
        </p>
        {signedIn ? (
          <a href={moduleHref} className={cn(buttonVariants({ size: "lg" }), "justify-self-start")}>
            Keep learning: {moduleTitle} <ArrowRight aria-hidden="true" />
          </a>
        ) : (
          <div className="grid gap-3 border-t border-line pt-5">
            <p className="text-ui text-ink">Create a free account to keep learning and save your progress. It's always free.</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a href={`/signup?next=${encodeURIComponent(moduleHref)}`} className={buttonVariants({ size: "lg" })}>Create a free account <ArrowRight aria-hidden="true" /></a>
              <a href={moduleHref} className={buttonVariants({ variant: "outline", size: "lg" })}>See the module</a>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <form ref={form} onSubmit={submit} noValidate className="grid gap-5">
      {questions.map((q, i) => {
        const gap = missing.includes(i + 1);
        return (
          <fieldset
            key={q.id}
            data-question={q.id}
            aria-describedby={gap ? `${uid}-${q.id}-gap` : undefined}
            className={cn("rounded-xl border bg-surface p-5 shadow-1 sm:p-6", gap ? "border-danger" : "border-line")}
          >
            <legend className="sr-only">Question {i + 1} of {questions.length}: {q.prompt}</legend>
            <p aria-hidden="true" className="text-small font-bold text-ink-soft">Question {i + 1} of {questions.length}</p>
            <p aria-hidden="true" className="mt-1 text-lesson font-bold text-ink">{q.prompt}</p>
            <div className="mt-4 grid gap-2">
              {q.options.map((o) => {
                const id = `${uid}-${q.id}-${o.id}`;
                return (
                  <label
                    key={o.id}
                    htmlFor={id}
                    className="flex min-h-[var(--tap)] cursor-pointer items-center gap-3 rounded-lg border-[1.5px] border-line bg-surface px-4 py-2.5 text-ui text-ink transition-colors hover:border-input has-[:checked]:border-primary has-[:checked]:bg-brand-soft/50"
                  >
                    <input id={id} type="radio" name={`q-${q.id}`} value={o.id} className="size-5 shrink-0 accent-[var(--brand)]" />
                    <span className="flex-1">{o.text}</span>
                  </label>
                );
              })}
            </div>
            {gap && <p id={`${uid}-${q.id}-gap`} className="mt-3 text-small font-bold text-danger">Pick an answer for this one.</p>}
          </fieldset>
        );
      })}

      <div className="grid gap-1.5 rounded-xl border border-line bg-surface p-5 shadow-1 sm:p-6">
        <label htmlFor={`${uid}-grade`} className="text-ui font-bold text-ink">What grade are you in? (optional)</label>
        <p id={`${uid}-grade-hint`} className="text-small text-ink-soft">Only used to count answers by grade. Skip it if you like.</p>
        <select id={`${uid}-grade`} name="grade" aria-describedby={`${uid}-grade-hint`} defaultValue="" className="h-11 w-full rounded-lg border-[1.5px] border-input bg-surface px-3 text-ui text-ink sm:max-w-sm">
          <option value="">Choose a grade (optional)</option>
          {GRADE_BANDS.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
        </select>
      </div>

      {missing.length > 0 && <Notice kind="error">Answer every question first: {missing.length === 1 ? `question ${missing[0]} is` : `questions ${missing.join(", ")} are`} still empty.</Notice>}
      {error && <Notice kind="error">{error}</Notice>}
      <SubmitButton size="lg" className="justify-self-start" disabled={busy} loading={busy}>Send my answers</SubmitButton>
    </form>
  );
}
