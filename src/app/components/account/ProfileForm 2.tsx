import { useState, type FormEvent } from "react";
import { GRADE_BANDS, NAME_HINT, NAME_PATTERN, type AccountType } from "../../../lib/account-rules";
import { apiErrorMessage, postJSON } from "../../auth/api";
import { Field, Notice, SelectField, SubmitButton } from "../auth/Field";

/** Display name (and grade band for 13+ learners). */
export function ProfileForm({ displayName, gradeBand, accountType }: { displayName: string; gradeBand: string | null; accountType: AccountType }) {
  const [name, setName] = useState(displayName);
  const [grade, setGrade] = useState(gradeBand ?? "");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setStatus(null);
    if (!NAME_PATTERN.test(name.trim())) return setError(NAME_HINT);
    setError(null);
    setBusy(true);
    const res = await postJSON("/api/account/profile", { displayName: name.trim(), ...(accountType === "learner" ? { gradeBand: grade || null } : {}) });
    setBusy(false);
    setStatus(res.ok ? { kind: "success", text: "Saved." } : { kind: "error", text: apiErrorMessage(res.data.error) });
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      <Field label={accountType === "parent" ? "Your first name" : "Display name"} hint={accountType === "learner" ? "Shown on your certificates." : undefined} value={name} onChange={(e) => setName(e.target.value)} error={error} maxLength={30} autoComplete="nickname" />
      {accountType === "learner" && <SelectField label="Grade" value={grade} onChange={setGrade} placeholder="Not set" options={GRADE_BANDS} />}
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton loading={busy}>Save</SubmitButton>
        {status && <div className="flex-1"><Notice kind={status.kind}>{status.text}</Notice></div>}
      </div>
    </form>
  );
}
