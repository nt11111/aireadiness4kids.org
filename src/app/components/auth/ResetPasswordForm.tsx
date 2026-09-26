import { useState, type FormEvent } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { clientAuth, firebaseConfigured } from "../../../lib/firebase-client";
import { Field, Notice, SubmitButton } from "./Field";

/**
 * /reset-password, step 1: request a link. The answer is the same whether or not the email has an
 * account, so this page can't be used to find out who's signed up.
 */
export function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Enter a valid email address.");
    setError(null);
    setBusy(true);
    try {
      await sendPasswordResetEmail(clientAuth(), email.trim(), { url: new URL("/signin", location.origin).toString() });
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code === "auth/too-many-requests") {
        setBusy(false);
        return setError("Too many tries. Wait a few minutes, then try again.");
      }
      if (code === "auth/network-request-failed") {
        setBusy(false);
        return setError("We couldn't reach the sign-in service. Check your connection and try again.");
      }
      // Any other answer (including "no such user") looks the same as success.
    }
    setBusy(false);
    setSent(true);
  }

  if (!firebaseConfigured) return <Notice>Accounts aren't switched on yet.</Notice>;
  if (sent) {
    return (
      <Notice kind="success">
        <p>If there's an ARK account for <strong>{email.trim()}</strong>, we've sent it a link to set a new password. It can take a few minutes; check your spam folder too.</p>
        <a href="/signin" className="mt-2 inline-block font-bold text-brand underline underline-offset-4">Back to sign in</a>
      </Notice>
    );
  }
  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      <p className="text-ui text-ink-soft">Enter the email you signed up with and we'll send you a link to set a new password. (Signed up with Google? Just sign in with Google.)</p>
      <Field label="Email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error} />
      <SubmitButton size="lg" loading={busy}>Send the link</SubmitButton>
      <a href="/signin" className="justify-self-start rounded-sm text-ui font-bold text-brand underline underline-offset-4">Back to sign in</a>
    </form>
  );
}
