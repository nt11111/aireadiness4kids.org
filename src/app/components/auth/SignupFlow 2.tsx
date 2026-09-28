import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import type { User } from "firebase/auth";
import { firebaseConfigured } from "../../../lib/firebase-client";
import { safeNext } from "../../../lib/safe-next";
import { ageBandFrom, GRADE_BANDS, MIN_PASSWORD, NAME_HINT, NAME_PATTERN, type AgeBand } from "../../../lib/account-rules";
import { authErrorMessage, resumeRedirect, sendVerification, signInWithGoogle, signUpWithEmail, startSession } from "../../auth/firebase-auth";
import { apiErrorMessage } from "../../auth/api";
import { claimGuest, firstSrc } from "../../lesson/guest";
import { track } from "../../../lib/analytics";
import { Button } from "../ui/button";
import { LEGAL_DRAFT, PARENT_NOTICE } from "../../lib/legal";
import { Divider, Field, GoogleButton, Notice, SelectField, SubmitButton } from "./Field";

type Band = "under13" | AgeBand;
type Step = "age" | "learner" | "under13" | "parent" | "verify";
type Signup = { accountType: "learner"; ageBand: AgeBand; displayName: string; gradeBand?: string } | { accountType: "parent"; displayName: string; parentConsent: true };

const AGE_KEY = "ark.signup.age.v1";
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const PARENT_NEXT = "/account?setup=learners";

function storedBand(): Band | null {
  try {
    const v = sessionStorage.getItem(AGE_KEY);
    return v === "under13" || v === "13to17" || v === "18plus" ? v : null;
  } catch {
    return null;
  }
}

/**
 * /signup (brief section 7): a neutral age screen, then the 13+ path or, for under-13s, a parent
 * account. Only the age band is kept (for this browser tab, so the answer can't be changed by going
 * back); the birth month and year never leave the page.
 */
export function SignupFlow() {
  const [step, setStep] = useState<Step>("age");
  const [band, setBand] = useState<Band | null>(null);
  const [next, setNext] = useState("/my-learning");
  const [verifyEmail, setVerifyEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const pendingUser = useRef<User | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  // Move focus to the new heading only when the person moves to a new step, never on page load.
  const moveFocus = useRef(false);

  useEffect(() => {
    setNext(safeNext(new URLSearchParams(location.search).get("next")));
    const saved = storedBand();
    if (saved) choose(saved, false);
    if (!firebaseConfigured) return;
    resumeRedirect()
      .then(async (r) => {
        if (r?.pending?.signup) await afterSignIn(r.user, r.pending.signup as Signup);
      })
      .catch((e) => setError(authErrorMessage(e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (moveFocus.current) heading.current?.focus();
    moveFocus.current = false;
  }, [step]);

  const go = (s: Step) => {
    moveFocus.current = true;
    setStep(s);
  };

  function choose(b: Band, remember = true) {
    setBand(b);
    if (remember) {
      try {
        sessionStorage.setItem(AGE_KEY, b);
      } catch {
        // private mode: the answer just isn't remembered across reloads
      }
    }
    if (remember) moveFocus.current = true;
    setStep(b === "under13" ? "under13" : "learner");
  }

  const destination = (signup: Signup) => (signup.accountType === "parent" ? PARENT_NEXT : next);

  async function afterSignIn(user: User, signup: Signup) {
    // The first ?src= this browser arrived with is saved on the new account (brief section 8.5).
    const result = await startSession(user, { signup, src: firstSrc() });
    if (result.outcome === "ok" || result.outcome === "verify-email") {
      // The account exists now (an email account just still needs its address confirmed). This
      // browser's guest progress is theirs: it's added when they're first signed in here.
      await claimGuest(user.uid);
      track({
        name: "signup_complete",
        props: { method: user.providerData.some((p) => p.providerId === "google.com") ? "google" : "email", age_band: signup.accountType === "learner" ? signup.ageBand : "18plus" },
      });
    }
    if (result.outcome === "ok") {
      location.assign(destination(signup));
    } else if (result.outcome === "verify-email") {
      pendingUser.current = user;
      setVerifyEmail(user.email ?? "");
      go("verify");
    } else {
      setError(apiErrorMessage(result.error));
    }
  }

  if (!firebaseConfigured) return <Notice>Accounts aren't switched on yet. You can still explore every course, and try the first step of any module.</Notice>;

  const title = { age: "How old are you?", learner: "Create your free account", under13: "Ask a grown-up to set up your account", parent: "Set up a family account", verify: "Check your email" }[step];

  return (
    <div className="grid gap-6">
      <h1 ref={heading} tabIndex={-1} className="text-display-md text-ink focus:outline-none">{title}</h1>
      {error && <Notice kind="error">{error}</Notice>}
      {step === "age" && <AgeStep onDone={(b) => choose(b)} />}
      {step === "learner" && band && band !== "under13" && (
        <AccountForm
          kind="learner"
          next={next}
          onError={setError}
          buildSignup={(f) => ({ accountType: "learner", ageBand: band, displayName: f.name, ...(f.grade ? { gradeBand: f.grade } : {}) })}
          afterSignIn={afterSignIn}
          destination={destination}
        />
      )}
      {step === "under13" && (
        <div className="grid gap-5">
          <p className="text-lesson text-ink">Kids learn on ARK with their own profile inside a parent's or guardian's account. Hand this device to a grown-up, or ask them to set it up for you.</p>
          <Button type="button" size="lg" onClick={() => go("parent")}>I'm a parent or guardian</Button>
          <a href="/courses" className="justify-self-start rounded-sm text-ui font-bold text-brand underline underline-offset-4">Keep exploring the free lessons</a>
        </div>
      )}
      {step === "parent" && (
        <AccountForm
          kind="parent"
          next={PARENT_NEXT}
          onError={setError}
          buildSignup={(f) => ({ accountType: "parent", displayName: f.name, parentConsent: true })}
          afterSignIn={afterSignIn}
          destination={destination}
        />
      )}
      {step === "verify" && (
        <VerifyStep
          email={verifyEmail}
          signinHref={`/signin?next=${encodeURIComponent(band === "under13" ? PARENT_NEXT : next)}`}
          onResend={async () => {
            if (pendingUser.current) await sendVerification(pendingUser.current, band === "under13" ? PARENT_NEXT : next);
          }}
        />
      )}
    </div>
  );
}

function AgeStep({ onDone }: { onDone: (band: Band) => void }) {
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState<string | null>(null);
  const now = new Date();
  const years = Array.from({ length: 100 }, (_, i) => String(now.getFullYear() - i));

  function submit(e: FormEvent) {
    e.preventDefault();
    const m = Number(month);
    const y = Number(year);
    if (!m || !y) return setError("Choose a month and a year.");
    if (y === now.getFullYear() && m > now.getMonth() + 1) return setError("Choose a month and year that have already happened.");
    onDone(ageBandFrom(m, y, now));
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-5">
      <fieldset className="grid gap-4">
        <legend className="mb-1 text-ui text-ink-soft">Choose the month and year you were born.</legend>
        <div className="grid grid-cols-2 gap-3">
          <SelectField label="Month" value={month} onChange={setMonth} placeholder="Month" options={MONTHS.map((label, i) => ({ id: String(i + 1), label }))} />
          <SelectField label="Year" value={year} onChange={setYear} placeholder="Year" options={years.map((y) => ({ id: y, label: y }))} />
        </div>
      </fieldset>
      {error && <Notice kind="error">{error}</Notice>}
      <SubmitButton size="lg">Continue</SubmitButton>
    </form>
  );
}

type FormValues = { name: string; grade: string };

function AccountForm({ kind, next, onError, buildSignup, afterSignIn, destination }: {
  kind: "learner" | "parent";
  next: string;
  onError: (m: string | null) => void;
  buildSignup: (f: FormValues) => Signup;
  afterSignIn: (user: User, signup: Signup) => Promise<void>;
  destination: (s: Signup) => string;
}) {
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [consent, setConsent] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<"google" | "email" | null>(null);

  function check(withEmail: boolean) {
    const e: Record<string, string> = {};
    if (!NAME_PATTERN.test(name.trim())) e.name = name.trim() ? NAME_HINT : "Enter a first name or nickname.";
    if (kind === "parent" && !consent) e.consent = "Please confirm you're the parent or guardian to continue.";
    if (withEmail) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = "Enter a valid email address.";
      if (password.length < MIN_PASSWORD) e.password = `Use at least ${MIN_PASSWORD} characters.`;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function google() {
    onError(null);
    if (!check(false)) return;
    const signup = buildSignup({ name: name.trim(), grade });
    setBusy("google");
    try {
      const user = await signInWithGoogle({ signup, next: destination(signup) });
      if (user) await afterSignIn(user, signup);
    } catch (e) {
      onError(authErrorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  async function submit(ev: FormEvent) {
    ev.preventDefault();
    onError(null);
    if (!check(true)) return;
    const signup = buildSignup({ name: name.trim(), grade });
    setBusy("email");
    try {
      const user = await signUpWithEmail(email.trim(), password, destination(signup));
      await afterSignIn(user, signup);
    } catch (e) {
      onError(authErrorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  const signinHref = `/signin?next=${encodeURIComponent(next)}`;
  return (
    <div className="grid gap-5">
      {kind === "parent" && <ParentNotice consent={consent} setConsent={setConsent} error={errors.consent} />}
      <Field
        label={kind === "parent" ? "Your first name" : "What should we call you?"}
        hint={kind === "parent" ? "We'll use it to greet you." : "A first name or nickname. It appears on your certificates."}
        autoComplete={kind === "parent" ? "given-name" : "nickname"}
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        maxLength={30}
      />
      {kind === "learner" && <SelectField label="Grade (optional)" value={grade} onChange={setGrade} placeholder="Choose a grade" options={GRADE_BANDS} hint="Helps us suggest a course." />}

      <GoogleButton onClick={google} busy={busy === "google"} disabled={busy !== null} />
      <Divider>or sign up with email</Divider>
      <form onSubmit={submit} noValidate className="grid gap-4">
        <Field label="Email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
        <Field label="Password" type="password" autoComplete="new-password" hint={`At least ${MIN_PASSWORD} characters.`} value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
        <SubmitButton size="lg" loading={busy === "email"} disabled={busy !== null}>Create account</SubmitButton>
      </form>
      <p className="text-ui text-ink-soft">Already have an account? <a href={signinHref} className="font-bold text-brand underline underline-offset-4">Sign in</a></p>
    </div>
  );
}

function ParentNotice({ consent, setConsent, error }: { consent: boolean; setConsent: (v: boolean) => void; error?: string }) {
  return (
    <div className="grid gap-4">
      <p className="text-lesson text-ink">Your child gets a profile inside your account. You'll add their nickname and grade next. They never need an email.</p>
      <section aria-labelledby="parent-notice-h" className="rounded-xl border border-line bg-surface-2 p-4 sm:p-5">
        <p className="text-small font-bold uppercase tracking-[0.1em] text-warning">{LEGAL_DRAFT}</p>
        <h2 id="parent-notice-h" className="mt-1 font-sans text-ui font-bold text-ink">Notice for parents and guardians</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-small text-ink">
          {PARENT_NOTICE.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <p className="mt-3 text-small text-ink">
          More detail is in our <a href="/privacy#parents" target="_blank" className="rounded-sm font-bold text-brand underline underline-offset-4">privacy policy<span className="sr-only"> (opens in a new tab)</span></a>.
        </p>
      </section>
      <div className="grid gap-1.5">
        <label className="flex items-start gap-3 text-ui text-ink">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "parent-consent-error" : undefined}
            className="mt-0.5 size-5 shrink-0 accent-[var(--brand)]"
          />
          <span>I'm this child's parent or legal guardian, and I've read the notice above.</span>
        </label>
        {error && <p id="parent-consent-error" className="text-small font-bold text-danger">{error}</p>}
      </div>
    </div>
  );
}

function VerifyStep({ email, signinHref, onResend }: { email: string; signinHref: string; onResend: () => Promise<void> }) {
  const [note, setNote] = useState<ReactNode>(null);
  return (
    <div className="grid gap-5">
      <p className="text-lesson text-ink">
        We sent a link to <strong>{email}</strong>. Open it to confirm your address, then come back and sign in.
      </p>
      <p className="text-ui text-ink-soft">Can't find it? Check your spam folder, or send it again.</p>
      {note && <Notice kind="success">{note}</Notice>}
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          onClick={async () => {
            try {
              await onResend();
              setNote("We sent a new link.");
            } catch (e) {
              setNote(authErrorMessage(e));
            }
          }}
        >
          Send the link again
        </Button>
        <a href={signinHref} className="inline-flex min-h-11 items-center rounded-full px-2 font-bold text-brand underline underline-offset-4">I've confirmed it: sign in</a>
      </div>
    </div>
  );
}
