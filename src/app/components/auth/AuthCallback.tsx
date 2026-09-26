import { useEffect, useRef, useState, type FormEvent } from "react";
import { applyActionCode, confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { clientAuth, firebaseConfigured } from "../../../lib/firebase-client";
import { safeNext } from "../../../lib/safe-next";
import { MIN_PASSWORD } from "../../../lib/account-rules";
import { authErrorMessage } from "../../auth/firebase-auth";
import { Button } from "../ui/button";
import { Field } from "./Field";

type State = { kind: "working" } | { kind: "verified"; next: string } | { kind: "reset-form"; code: string } | { kind: "reset-done" } | { kind: "invalid" };

/**
 * /auth/callback: where links in Firebase's emails land when the Firebase action URL points here
 * (docs/SETUP_FIREBASE.md). It confirms an email address or sets a new password.
 */
export function AuthCallback() {
  const [state, setState] = useState<State>({ kind: "working" });
  const heading = useRef<HTMLHeadingElement>(null);

  // The result of opening the link is the page itself, so focus only moves after a later action
  // (saving a new password), not when the page first loads.
  useEffect(() => {
    if (state.kind === "reset-done") heading.current?.focus();
  }, [state.kind]);

  useEffect(() => {
    if (!firebaseConfigured) return setState({ kind: "invalid" });
    const params = new URLSearchParams(location.search);
    const mode = params.get("mode");
    const code = params.get("oobCode") ?? "";
    // The continue link can only send people to a page on this site.
    let next = "/my-learning";
    try {
      const cont = new URL(params.get("continueUrl") ?? "", location.origin);
      if (cont.origin === location.origin) next = safeNext(cont.searchParams.get("next"));
    } catch {
      // ignore a malformed continue link
    }
    if (mode === "verifyEmail" && code) {
      applyActionCode(clientAuth(), code).then(
        () => setState({ kind: "verified", next }),
        () => setState({ kind: "invalid" }),
      );
    } else if (mode === "resetPassword" && code) {
      verifyPasswordResetCode(clientAuth(), code).then(
        () => setState({ kind: "reset-form", code }),
        () => setState({ kind: "invalid" }),
      );
    } else {
      setState({ kind: "invalid" });
    }
  }, []);

  const title = {
    working: "One moment...",
    verified: "Your email is confirmed",
    "reset-form": "Choose a new password",
    "reset-done": "Your password is changed",
    invalid: "This link didn't work",
  }[state.kind];

  return (
    <div className="grid gap-6">
      <h1 ref={heading} tabIndex={-1} className="text-display-md text-ink focus:outline-none">{title}</h1>
      {state.kind === "verified" && (
        <>
          <p className="text-lesson text-ink">Thanks. Sign in to keep going.</p>
          <a href={`/signin?verified=1&next=${encodeURIComponent(state.next)}`} className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 font-bold text-primary-foreground">Sign in</a>
        </>
      )}
      {state.kind === "reset-form" && <NewPassword code={state.code} onDone={() => setState({ kind: "reset-done" })} />}
      {state.kind === "reset-done" && (
        <>
          <p className="text-lesson text-ink">Sign in with your new password.</p>
          <a href="/signin" className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 font-bold text-primary-foreground">Sign in</a>
        </>
      )}
      {state.kind === "invalid" && (
        <>
          <p className="text-lesson text-ink">The link may have expired or already been used. You can ask for a new one.</p>
          <div className="flex flex-wrap gap-4 text-ui font-bold">
            <a href="/reset-password" className="text-brand underline underline-offset-4">Reset your password</a>
            <a href="/signin" className="text-brand underline underline-offset-4">Sign in</a>
          </div>
        </>
      )}
    </div>
  );
}

function NewPassword({ code, onDone }: { code: string; onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (password.length < MIN_PASSWORD) return setError(`Use at least ${MIN_PASSWORD} characters.`);
    setBusy(true);
    try {
      await confirmPasswordReset(clientAuth(), code, password);
      onDone();
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      <Field label="New password" type="password" autoComplete="new-password" hint={`At least ${MIN_PASSWORD} characters.`} value={password} onChange={(e) => setPassword(e.target.value)} error={error} />
      <Button type="submit" size="lg" loading={busy}>Save new password</Button>
    </form>
  );
}
