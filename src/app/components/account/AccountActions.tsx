import { useState, type FormEvent } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { clientAuth } from "../../../lib/firebase-client";
import { apiErrorMessage, postJSON } from "../../auth/api";
import { Button } from "../ui/button";
import { Field, Notice, SubmitButton } from "../auth/Field";

/** Sign out: clears the session cookie and revokes this account's sessions everywhere. */
export function SignOutButton({ className }: { className?: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      className={className}
      loading={busy}
      onClick={async () => {
        setBusy(true);
        await postJSON("/api/signout", {}, { appCheck: false });
        location.assign("/");
      }}
    >
      Sign out
    </Button>
  );
}

/** Email accounts change their password through a reset link, so the password is never typed into ARK's own pages. */
export function PasswordLink({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "busy" | "sent" | "error">("idle");
  return (
    <div className="grid gap-3">
      <p className="text-ui text-ink-soft">We'll email <strong className="text-ink [overflow-wrap:anywhere]">{email}</strong> a link to choose a new password.</p>
      <div>
        <Button
          type="button"
          variant="outline"
          loading={state === "busy"}
          onClick={async () => {
            setState("busy");
            try {
              await sendPasswordResetEmail(clientAuth(), email, { url: new URL("/signin", location.origin).toString() });
              setState("sent");
            } catch {
              setState("error");
            }
          }}
        >
          Email me a link
        </Button>
      </div>
      {state === "sent" && <Notice kind="success">Check your inbox for the link.</Notice>}
      {state === "error" && <Notice kind="error">We couldn't send the link. Please try again in a few minutes.</Notice>}
    </div>
  );
}

/** Delete my account: typed confirmation, and a recent sign-in (checked on the server). */
export function DeleteAccount() {
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [needsSignIn, setNeedsSignIn] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setNeedsSignIn(false);
    if (typed !== "DELETE") return setError('Type DELETE (in capital letters) to confirm.');
    setError(null);
    setBusy(true);
    const res = await postJSON("/api/account/delete", { confirm: "DELETE" });
    setBusy(false);
    if (res.ok) return location.assign("/account-deleted");
    if (res.data.error === "recent-sign-in-required") return setNeedsSignIn(true);
    setError(apiErrorMessage(res.data.error));
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      <p className="text-ui text-ink">This deletes your account, every learner profile, all progress, and all certificates. Quiz answers you sent in stay only as anonymous totals. This can't be undone.</p>
      <Field label='Type DELETE to confirm' value={typed} onChange={(e) => setTyped(e.target.value)} error={error} autoComplete="off" spellCheck={false} />
      {needsSignIn && (
        <Notice kind="info">
          For your security, sign in again first, then come back here.{" "}
          <a href={`/signin?reauth=1&next=${encodeURIComponent("/account#delete")}`} className="font-bold text-brand underline underline-offset-4">Sign in again</a>
        </Notice>
      )}
      <div>
        <SubmitButton variant="destructive" loading={busy}>Delete my account</SubmitButton>
      </div>
    </form>
  );
}
