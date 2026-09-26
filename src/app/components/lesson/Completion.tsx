import { useEffect, useRef, useState } from "react";
import { ArrowRight, Award, ExternalLink, Printer } from "lucide-react";
import type { Question } from "../../../lib/lesson-types";
import { track } from "../../../lib/analytics";
import { post } from "../../lib/post";
import { Check } from "./Check";
import { Button, buttonVariants } from "../ui/button";
import { cn } from "../ui/utils";

type Score = { score: number; outOf: number };

/**
 * A small burst of confetti when the page opens (brief section 3), only if motion is allowed.
 * The library loads only then, so reduced-motion visitors never download it.
 */
export function Celebrate() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false;
    void import("canvas-confetti").then(({ default: confetti }) => {
      if (cancelled) return;
      void confetti({ particleCount: 90, spread: 70, startVelocity: 38, origin: { y: 0.3 }, colors: ["#1F6F5C", "#F2A93B", "#C9503A", "#3D4FA8"], disableForReducedMotion: true });
    });
    return () => { cancelled = true; };
  }, []);
  return <span hidden />;
}

/** "You improved from 1/3 to 3/3." (brief section 7), said kindly whichever way it went. */
export function compareLine(pre: Score, after: Score) {
  if (after.score > pre.score) return `You improved from ${pre.score}/${pre.outOf} to ${after.score}/${after.outOf}.`;
  if (after.score === pre.score) return `You got ${after.score}/${after.outOf} before and after.`;
  return `You got ${pre.score}/${pre.outOf} before and ${after.score}/${after.outOf} after. The recap is a good place for a second look.`;
}

type PostCheckProps = { moduleId: string; learnerId: string; questions: Question[]; pre: Score | null; after: Score | null };

/**
 * The optional post-check: the pre-check's questions again, scored on the server. With both
 * results, it shows how far the learner came; the first "after" result is the one kept.
 */
export function PostCheck({ moduleId, learnerId, questions, pre, after: initial }: PostCheckProps) {
  const [after, setAfter] = useState<Score | null>(initial);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(false);
  const result = useRef<HTMLParagraphElement>(null);

  useEffect(() => { if (after && !initial) result.current?.focus(); }, [after, initial]);

  // The Check shows its own score right away; the comparison uses the server's (the one that counts).
  async function save(answers: Record<string, string>) {
    setError(false);
    const { data } = await post<Score>("/api/progress/postcheck", { learnerId, moduleId, answers });
    if (data) setAfter({ score: data.score, outOf: data.outOf });
    else setError(true);
  }

  const summary = after && pre ? compareLine(pre, after) : after ? `After the module: ${after.score}/${after.outOf}.` : null;

  return (
    <div className="rounded-xl border border-line bg-surface p-5 shadow-1 sm:p-6">
      <h2 className="font-display text-title font-semibold text-ink">See what you learned</h2>
      {summary ? (
        <>
          <p ref={result} tabIndex={-1} className="mt-2 text-lesson font-bold text-ink focus:outline-none" data-compare>{summary}</p>
          {!pre && <p className="mt-1 text-ui text-ink-soft">You skipped the check at the start, so there's no "before" score to compare. That's fine.</p>}
        </>
      ) : (
        <>
          <p className="mt-1 text-ui text-ink-soft">
            {pre ? `You got ${pre.score}/${pre.outOf} before you started. Try the same ${questions.length} questions again. Optional.` : `${questions.length} quick questions. Optional.`}
          </p>
          {!open && (
            <Button type="button" variant="outline" className="mt-4 min-h-[var(--tap)]" onClick={() => setOpen(true)}>
              Try the questions again
            </Button>
          )}
          {open && (
            <div className="mt-5">
              <Check questions={questions} mode="post" onScore={(_score, _outOf, answers) => void save(answers)} />
            </div>
          )}
          {error && <p role="alert" className="mt-3 text-ui text-ink">We couldn't save that score. Check your connection and reload the page to try again.</p>}
        </>
      )}
    </div>
  );
}

type CertificateProps = {
  learnerId: string;
  moduleId: string;
  certificate: { id: string; public: boolean } | null;
  /** A parent's child profile: printable only, no public verify page. */
  child: boolean;
  nickname: string;
};

/** "Get my certificate", then links to print it (and for 13+ learners, the public verify page). */
export function CertificatePanel({ learnerId, moduleId, certificate: initial, child, nickname }: CertificateProps) {
  const [cert, setCert] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const ready = useRef<HTMLAnchorElement>(null);

  useEffect(() => { if (cert && !initial) ready.current?.focus(); }, [cert, initial]);

  async function issue() {
    if (busy) return;
    setBusy(true);
    setError(false);
    const { data } = await post<{ id: string; public: boolean; issued: boolean }>("/api/certificates/issue", { learnerId, moduleId });
    setBusy(false);
    if (!data) { setError(true); return; }
    if (data.issued) track({ name: "certificate_issued", props: { scope: "module" } });
    setCert({ id: data.id, public: data.public });
  }

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-accent/60 bg-surface p-5 shadow-1 sm:flex-row sm:items-start sm:p-6">
      <Award aria-hidden="true" className="size-10 shrink-0 text-accent-strong" />
      <div className="min-w-0 flex-1">
        <h2 className="font-display text-title font-semibold text-ink">Your certificate</h2>
        <p className="mt-1 text-ui text-ink-soft">
          {child
            ? `A certificate with the name ${nickname}, ready to print. It stays private: it has no public page.`
            : `With your name and today's date, ready to print or share. It gets its own link anyone can use to check it's real.`}
        </p>
        {cert ? (
          <div className="mt-4 flex flex-wrap gap-3">
            <a ref={ready} href={`/certificates/${cert.id}`} className={buttonVariants()}>
              <Printer aria-hidden="true" /> View and print
            </a>
            {cert.public && (
              <a href={`/verify/${cert.id}`} className={buttonVariants({ variant: "outline" })}>
                <ExternalLink aria-hidden="true" /> Public verify page
              </a>
            )}
          </div>
        ) : (
          <Button type="button" className={cn("mt-4 min-h-[var(--tap)]")} onClick={() => void issue()} disabled={busy} aria-busy={busy || undefined}>
            {busy ? "Getting it ready..." : child ? "Get the certificate" : "Get my certificate"} <ArrowRight aria-hidden="true" />
          </Button>
        )}
        {error && <p role="alert" className="mt-3 text-ui text-ink">Something went wrong making the certificate. Please try again in a moment.</p>}
      </div>
    </div>
  );
}
