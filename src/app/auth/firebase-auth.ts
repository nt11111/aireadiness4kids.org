/**
 * Sign-in helpers for the auth pages. After Firebase confirms who someone is, startSession() trades
 * the ID token for the httpOnly session cookie and signs the SDK out again (brief section 8.1).
 */
import {
  createUserWithEmailAndPassword,
  getRedirectResult,
  GoogleAuthProvider,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from "firebase/auth";
import { clientAuth } from "../../lib/firebase-client";
import { postJSON } from "./api";

const PENDING_KEY = "ark.auth.pending.v1";

/** What to do after a Google redirect comes back (sign-in pages only; cleared once used). */
export type Pending = { signup?: unknown; next: string };

function google() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return provider;
}

/** Google sign-in in a popup; if the browser blocks popups, a full-page redirect (handled by resumeRedirect). */
export async function signInWithGoogle(pending: Pending): Promise<User | null> {
  const auth = clientAuth();
  try {
    return (await signInWithPopup(auth, google())).user;
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code !== "auth/popup-blocked" && code !== "auth/operation-not-supported-in-this-environment") throw error;
    try {
      sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));
    } catch {
      // storage blocked: the redirect still signs in, the page just won't know the sign-up answers
    }
    await signInWithRedirect(auth, google());
    return null;
  }
}

/** After a Google redirect: the signed-in user and what was pending, if this page load is that return trip. */
export async function resumeRedirect(): Promise<{ user: User; pending: Pending | null } | null> {
  const result = await getRedirectResult(clientAuth());
  if (!result) return null;
  let pending: Pending | null = null;
  try {
    pending = JSON.parse(sessionStorage.getItem(PENDING_KEY) ?? "null");
    sessionStorage.removeItem(PENDING_KEY);
  } catch {
    pending = null;
  }
  return { user: result.user, pending };
}

export const signInWithEmail = async (email: string, password: string) => (await signInWithEmailAndPassword(clientAuth(), email, password)).user;

export async function signUpWithEmail(email: string, password: string, next: string) {
  const { user } = await createUserWithEmailAndPassword(clientAuth(), email, password);
  await sendVerification(user, next);
  return user;
}

export async function sendVerification(user: User, next: string) {
  const url = new URL("/signin", location.origin);
  url.searchParams.set("verified", "1");
  url.searchParams.set("next", next);
  await sendEmailVerification(user, { url: url.toString() });
}

export type SessionOutcome = "ok" | "verify-email" | "no-account" | "error";

/**
 * Creates the server session. On success the SDK signs out, so the only credential left is the
 * httpOnly cookie. For "verify-email" the user stays signed in to the SDK (in memory only) so the
 * page can resend the verification email.
 */
export async function startSession(user: User, extra: { signup?: unknown } = {}): Promise<{ outcome: SessionOutcome; accountType?: string; error?: string }> {
  const idToken = await user.getIdToken(true);
  const res = await postJSON<{ accountType?: string }>("/api/session", { idToken, ...extra });
  if (res.ok) {
    await signOut(clientAuth());
    return { outcome: "ok", accountType: res.data.accountType };
  }
  if (res.data.error === "verify-email") return { outcome: "verify-email" };
  if (res.data.error === "no-account") {
    await signOut(clientAuth());
    return { outcome: "no-account" };
  }
  await signOut(clientAuth());
  return { outcome: "error", error: res.data.error };
}

/**
 * Firebase error codes as plain language. Sign-in failures all get the same message, so the page
 * never reveals whether an email has an account (brief section 7).
 */
export function authErrorMessage(error: unknown): string | null {
  const code = (error as { code?: string })?.code ?? "";
  switch (code) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
    case "auth/user-cancelled":
      return null;
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
    case "auth/invalid-email":
    case "auth/invalid-login-credentials":
      return "Email or password is incorrect.";
    case "auth/email-already-in-use":
      return "That email can't be used for a new account. If it's yours, sign in instead.";
    case "auth/weak-password":
    case "auth/password-does-not-meet-requirements":
      return "Choose a longer password: at least 10 characters.";
    case "auth/too-many-requests":
      return "Too many tries. Wait a few minutes, then try again.";
    case "auth/network-request-failed":
      return "We couldn't reach the sign-in service. Check your connection and try again.";
    case "auth/unauthorized-domain":
    case "auth/operation-not-allowed":
      return "Sign-in isn't set up for this address yet.";
    default:
      return "Something went wrong. Please try again.";
  }
}
