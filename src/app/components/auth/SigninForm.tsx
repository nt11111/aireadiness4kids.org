import { useEffect, useRef, useState, type FormEvent } from "react";
import type { User } from "firebase/auth";
import { firebaseConfigured } from "../../../lib/firebase-client";
import { safeNext } from "../../../lib/safe-next";
import { authErrorMessage, resumeRedirect, sendVerification, signInWithEmail, signInWithGoogle, startSession } from "../../auth/firebase-auth";
import { apiErrorMessage } from "../../auth/api";
import { Button } from "../ui/button";
import { Divider, Field, GoogleButton, Notice } from "./Field";

type Message = { kind: "error" | "info" | "success"; text: string; action?: "resend" | "signup" } | null;

/** /signin: Google or email + password (brief section 7). Errors never reveal whether an email has an account. */
export function SigninForm() {
  const [next, setNext] = useState("/my-learning");
  const [banner, setBanner] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<"google" | "email" | null>(null);
  const [message, setMessage] = useState<Message>(null);
  const unverified = useRef<User | null>(null);
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setNext(safeNext(params.get("next")));
    if (params.get("verified")) setBanner("Your email is confirmed. Sign in to continue.");
    else if (params.get("reauth")) setBanner("For your security, please sign in again.");
    if (!firebaseConfigured) return;
    resumeRedirect()
      .then((r) => r && finish(r.user))
      .catch((e) => show({ kind: "error", text: authErrorMessage(e) ?? "" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const show = (m: Message) => {
    setMessage(m && m.text ? m : null);
    requestAnimationFrame(() => messageRef.current?.focus());
  };

  async function finish(user: User) {
    const result = await startSession(user);
    if (result.outcome === "ok") {
      location.assign(safeNext(new URLSearchParams(location.search).get("next")));
      return;
    }
    setBusy(null);
    if (result.outcome === "verify-email") {
      unverified.current = user;
      show({ kind: "info", text: "Please confirm your email first. Open the link we sent you, then sign in again.", action: "resend" });
    } else if (result.outcome === "no-account") {
      show({ kind: "info", text: "We couldn't find an ARK account for that Google account.", action: "signup" });
    } else {
      show({ kind: "error", text: apiErrorMessage(result.error) });
    }
  }

  async function google() {
    setBusy("google");
    setMessage(null);
    try {
      const user = await signInWithGoogle({ next });
      if (user) await finish(user);
    } catch (e) {
      setBusy(null);
      show({ kind: "error", text: authErrorMessage(e) ?? "" });
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      show({ kind: "error", text: "Enter your email and password." });
      return;
    }
    setBusy("email");
    setMessage(null);
    try {
      await finish(await signInWithEmail(email.trim(), password));
    } catch (err) {
      setBusy(null);
      show({ kind: "error", text: authErrorMessage(err) ?? "" });
    }
  }

  async function resend() {
    if (!unverified.current) return;
    try {
      await sendVerification(unverified.current, next);
      show({ kind: "success", text: "We sent a new confirmation link. Check your inbox (and spam folder)." });
    } catch (err) {
      show({ kind: "error", text: authErrorMessage(err) ?? "" });
    }
  }

  if (!firebaseConfigured) return <Notice>Accounts aren't switched on yet. You can still explore every course, and try the first step of any module.</Notice>;

  const signupHref = `/signup?next=${encodeURIComponent(next)}`;
  return (
    <div className="grid gap-5">
      {banner && <Notice kind="success">{banner}</Notice>}
      {message && (
        <div ref={messageRef} tabIndex={-1} className="focus:outline-none">
          <Notice kind={message.kind}>
            <p>{message.text}</p>
            {message.action === "resend" && (
              <Button type="button" variant="outline" size="sm" className="mt-3 min-h-11" onClick={resend}>Resend the confirmation email</Button>
            )}
            {message.action === "signup" && (
              <a href={signupHref} className="mt-2 inline-block font-bold text-brand underline underline-offset-4">Create a free account</a>
            )}
          </Notice>
        </div>
      )}

      <GoogleButton onClick={google} busy={busy === "google"} disabled={busy !== null} />
      <p className="text-small text-ink-soft">
        School Google account not working? Your school may block outside apps. <a href={signupHref} className="font-bold text-brand underline underline-offset-4">Sign up with email</a> instead.
      </p>

      <Divider>or sign in with email</Divider>

      <form onSubmit={submit} noValidate className="grid gap-4">
        <Field label="Email" type="email" name="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Field label="Password" type="password" name="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <a href="/reset-password" className="justify-self-start rounded-sm text-small font-bold text-brand underline underline-offset-4">Forgot password?</a>
        <Button type="submit" size="lg" loading={busy === "email"} disabled={busy !== null}>Sign in</Button>
      </form>

      <p className="text-ui text-ink-soft">
        New to ARK? <a href={signupHref} className="font-bold text-brand underline underline-offset-4">Create a free account</a>
      </p>
    </div>
  );
}
