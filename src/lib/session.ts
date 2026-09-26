/**
 * Session cookies (brief section 8.1). The session lives only in an httpOnly cookie; the browser
 * never holds a Firebase token after sign-in.
 */
import type { AstroCookies } from "astro";
import { adminAuth, NotConfiguredError } from "./firebase-admin";

export const SESSION_COOKIE = "__session";
/** Not a secret: a UI hint so static pages know whether to ask /api/me who's signed in. The server never trusts it. */
export const SIGNED_IN_HINT = "ark_si";
export const SESSION_DAYS = 5;
export const SESSION_MS = SESSION_DAYS * 24 * 60 * 60 * 1000;

export type Role = "facilitator" | "admin";
export type SessionUser = {
  uid: string;
  email?: string;
  emailVerified: boolean;
  /** "password" or "google.com". */
  provider: string;
  role: Role | null;
  /** When the person last actually signed in (seconds). Sensitive actions require this to be recent. */
  authTime: number;
};

/** Errors that mean the cookie itself is no good, so it should be cleared. Anything else (say, a network blip) keeps it. */
const BAD_COOKIE = new Set([
  "auth/session-cookie-expired",
  "auth/session-cookie-revoked",
  "auth/argument-error",
  "auth/invalid-session-cookie-duration",
  "auth/user-disabled",
  "auth/user-not-found",
]);

export function setSessionCookies(cookies: AstroCookies, sessionCookie: string) {
  const maxAge = SESSION_MS / 1000;
  cookies.set(SESSION_COOKIE, sessionCookie, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge });
  cookies.set(SIGNED_IN_HINT, "1", { httpOnly: false, secure: true, sameSite: "lax", path: "/", maxAge });
}

export function clearSessionCookies(cookies: AstroCookies) {
  cookies.delete(SESSION_COOKIE, { path: "/", httpOnly: true, secure: true, sameSite: "lax" });
  cookies.delete(SIGNED_IN_HINT, { path: "/", secure: true, sameSite: "lax" });
}

/**
 * The signed-in user, or null. Verifies the cookie with Firebase on every call, including a check
 * that it hasn't been revoked (sign-out, password change, or role change all revoke it).
 * An email/password account that isn't verified counts as signed out.
 */
export async function readSession(cookies: AstroCookies): Promise<SessionUser | null> {
  const value = cookies.get(SESSION_COOKIE)?.value;
  if (!value) return null;
  try {
    const decoded = await adminAuth().verifySessionCookie(value, true);
    const provider = decoded.firebase?.sign_in_provider ?? "";
    if (provider === "password" && !decoded.email_verified) return null;
    const role = decoded.role === "admin" || decoded.role === "facilitator" ? (decoded.role as Role) : null;
    return { uid: decoded.uid, email: decoded.email, emailVerified: Boolean(decoded.email_verified), provider, role, authTime: decoded.auth_time };
  } catch (error) {
    if (error instanceof NotConfiguredError) return null;
    const code = (error as { code?: string }).code ?? "";
    if (BAD_COOKIE.has(code)) clearSessionCookies(cookies);
    return null;
  }
}
