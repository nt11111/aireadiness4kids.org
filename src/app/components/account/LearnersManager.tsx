import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { GRADE_BANDS, MAX_LEARNERS, NAME_HINT, NAME_PATTERN } from "../../../lib/account-rules";
import { apiErrorMessage, postJSON } from "../../auth/api";
import { Button } from "../ui/button";
import { Field, Notice, SelectField, SubmitButton } from "../auth/Field";

type Learner = { id: string; nickname: string; gradeBand: string | null };
const gradeLabel = (id: string | null) => GRADE_BANDS.find((g) => g.id === id)?.label ?? "No grade set";

/**
 * A parent's learner profiles (brief section 7): nickname and grade band only, like streaming-service
 * profiles. Every change goes through the server, which only ever touches this account's own profiles.
 */
export function LearnersManager({ initial, setup }: { initial: Learner[]; setup: boolean }) {
  const [learners, setLearners] = useState(initial);
  const [editing, setEditing] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [status, setStatus] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const addRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (setup) addRef.current?.focus();
  }, [setup]);

  async function remove(l: Learner) {
    const res = await postJSON("/api/account/learners/delete", { learnerId: l.id });
    if (res.ok) {
      setLearners((all) => all.filter((x) => x.id !== l.id));
      setStatus({ kind: "success", text: `Removed ${l.nickname}'s profile.` });
    } else {
      setStatus({ kind: "error", text: apiErrorMessage(res.data.error) });
    }
    setConfirming(null);
  }

  return (
    <div className="grid gap-6">
      {status && <Notice kind={status.kind}>{status.text}</Notice>}
      {learners.length === 0 ? (
        <p className="text-ui text-ink-soft">No learner profiles yet. Add one for each child below.</p>
      ) : (
        <ul className="grid gap-3">
          {learners.map((l) => (
            <li key={l.id} className="rounded-xl border border-line bg-surface p-4 shadow-1">
              {editing === l.id ? (
                <LearnerForm
                  submitLabel="Save"
                  initial={l}
                  onCancel={() => setEditing(null)}
                  onSubmit={async (v) => {
                    const res = await postJSON("/api/account/learners/update", { learnerId: l.id, ...v });
                    if (!res.ok) return apiErrorMessage(res.data.error);
                    setLearners((all) => all.map((x) => (x.id === l.id ? { ...x, ...v } : x)));
                    setEditing(null);
                    setStatus({ kind: "success", text: `Saved ${v.nickname}'s profile.` });
                    return null;
                  }}
                />
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-ink">{l.nickname}</p>
                    <p className="text-small text-ink-soft">{gradeLabel(l.gradeBand)}</p>
                  </div>
                  {confirming === l.id ? (
                    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={`Remove ${l.nickname}'s profile?`}>
                      <p className="w-full text-small text-ink">Their progress and certificates will be deleted too. This can't be undone.</p>
                      <Button type="button" variant="destructive" size="sm" className="min-h-11" onClick={() => remove(l)}>Yes, remove {l.nickname}</Button>
                      <Button type="button" variant="ghost" size="sm" className="min-h-11" onClick={() => setConfirming(null)}>Cancel</Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" className="min-h-11" onClick={() => setEditing(l.id)} aria-label={`Edit ${l.nickname}'s profile`}>Edit</Button>
                      <Button type="button" variant="ghost" size="sm" className="min-h-11" onClick={() => setConfirming(l.id)} aria-label={`Remove ${l.nickname}'s profile`}>Remove</Button>
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {learners.length < MAX_LEARNERS && (
        <section aria-labelledby="add-learner-h" className="rounded-xl border border-dashed border-line-strong bg-surface-2 p-4 sm:p-5">
          <h3 id="add-learner-h" ref={addRef} tabIndex={-1} className="text-title text-ink focus:outline-none">Add a learner</h3>
          {setup && <p className="mt-1 text-ui text-ink">Welcome! Add a profile for each child who'll learn with ARK.</p>}
          <p className="mt-1 text-small text-ink-soft">A nickname and grade are all we need. No email, photo, or full name.</p>
          <div className="mt-4">
            <LearnerForm
              submitLabel="Add learner"
              onSubmit={async (v) => {
                const res = await postJSON<{ learner?: { id: string } }>("/api/account/learners/create", v);
                if (!res.ok || !res.data.learner) return apiErrorMessage(res.data.error);
                setLearners((all) => [...all, { id: res.data.learner!.id, ...v }]);
                setStatus({ kind: "success", text: `Added ${v.nickname}.` });
                return null;
              }}
            />
          </div>
        </section>
      )}
    </div>
  );
}

function LearnerForm({ initial, submitLabel, onSubmit, onCancel }: {
  initial?: Learner;
  submitLabel: string;
  onSubmit: (v: { nickname: string; gradeBand: string }) => Promise<string | null>;
  onCancel?: () => void;
}) {
  const [nickname, setNickname] = useState(initial?.nickname ?? "");
  const [grade, setGrade] = useState(initial?.gradeBand ?? "");
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const uid = useId();

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!NAME_PATTERN.test(nickname.trim())) return setError(nickname.trim() ? NAME_HINT : "Enter a nickname.");
    if (!grade) return setFormError("Choose a grade.");
    setError(null);
    setFormError(null);
    setBusy(true);
    const problem = await onSubmit({ nickname: nickname.trim(), gradeBand: grade });
    setBusy(false);
    if (problem) setFormError(problem);
    else if (!initial) {
      setNickname("");
      setGrade("");
    }
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-4" aria-describedby={formError ? `${uid}-err` : undefined}>
      <Field label="Nickname" hint="A first name or nickname only." value={nickname} onChange={(e) => setNickname(e.target.value)} error={error} maxLength={30} autoComplete="off" />
      <SelectField label="Grade" value={grade} onChange={setGrade} placeholder="Choose a grade" options={GRADE_BANDS} required />
      {formError && <div id={`${uid}-err`}><Notice kind="error">{formError}</Notice></div>}
      <div className="flex flex-wrap gap-3">
        <SubmitButton loading={busy}>{submitLabel}</SubmitButton>
        {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>}
      </div>
    </form>
  );
}
