/**
 * Test helpers for the Firebase emulators (project demo-ark; never production). They create users
 * the way Firebase would, then go through ARK's real /api/session route to get a session cookie.
 */
import type { BrowserContext } from "@playwright/test";
import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { EMULATORS, TEST_ORIGIN } from "../../scripts/test-env.mjs";

process.env.FIREBASE_AUTH_EMULATOR_HOST = EMULATORS.auth;
process.env.FIRESTORE_EMULATOR_HOST = EMULATORS.firestore;
const app = getApps().find((a) => a.name === "tests") ?? initializeApp({ projectId: "demo-ark" }, "tests");
export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
export const BASE = TEST_ORIGIN;

let counter = 0;
export const unique = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}${counter++}`;

export type TestUser = { uid: string; email: string; password: string };

export async function createUser({ verified = true, role }: { verified?: boolean; role?: "admin" | "facilitator" } = {}): Promise<TestUser> {
  const email = `t-${unique()}@example.test`;
  const password = "correct-horse-battery";
  const user = await adminAuth.createUser({ email, password, emailVerified: verified });
  if (role) await adminAuth.setCustomUserClaims(user.uid, { role });
  return { uid: user.uid, email, password };
}

/** A fresh ID token, as the browser SDK would get after signing in. */
export async function idTokenFor(user: Pick<TestUser, "email" | "password">): Promise<string> {
  const res = await fetch(`http://${EMULATORS.auth}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-api-key`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: user.email, password: user.password, returnSecureToken: true }),
  });
  const data = (await res.json()) as { idToken?: string };
  if (!data.idToken) throw new Error(`emulator sign-in failed: ${JSON.stringify(data)}`);
  return data.idToken;
}

type Call = { method?: "GET" | "POST"; cookie?: string; body?: unknown; origin?: string | null; headers?: Record<string, string> };

/** Calls the test server like a browser on this site would (same Origin, JSON), unless told otherwise. */
export async function call(path: string, { method = "POST", cookie, body, origin = BASE, headers = {} }: Call = {}) {
  const res = await fetch(BASE + path, {
    method,
    redirect: "manual",
    headers: {
      ...(method === "POST" ? { "Content-Type": "application/json" } : {}),
      ...(origin ? { Origin: origin } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
      ...headers,
    },
    body: method === "POST" ? JSON.stringify(body ?? {}) : undefined,
  });
  const text = await res.text();
  let json: Record<string, any> | undefined;
  try {
    json = JSON.parse(text);
  } catch {
    json = undefined;
  }
  return { status: res.status, headers: res.headers, text, json };
}

export const LEARNER_SIGNUP = (displayName = "Alex") => ({ accountType: "learner", ageBand: "13to17", displayName, gradeBand: "6-8" });
export const PARENT_SIGNUP = (displayName = "Pat") => ({ accountType: "parent", displayName, parentConsent: true });

/** The Set-Cookie line for the session, as "__session=...". */
export function sessionCookieFrom(headers: Headers): string | undefined {
  return headers.getSetCookie().find((c) => c.startsWith("__session="));
}

export async function sessionFor(user: TestUser, signup?: unknown): Promise<string> {
  const res = await call("/api/session", { body: { idToken: await idTokenFor(user), ...(signup ? { signup } : {}) } });
  const cookie = sessionCookieFrom(res.headers);
  if (res.status !== 200 || !cookie) throw new Error(`session failed: ${res.status} ${res.text}`);
  return cookie.split(";")[0];
}

export type Account = TestUser & { cookie: string };

/** A signed-up, email-verified account with a live session. */
export async function account(kind: "learner" | "parent" = "learner", opts: { role?: "admin" | "facilitator"; name?: string } = {}): Promise<Account> {
  const user = await createUser({ role: opts.role });
  const cookie = await sessionFor(user, kind === "learner" ? LEARNER_SIGNUP(opts.name) : PARENT_SIGNUP(opts.name));
  return { ...user, cookie };
}

/** Puts a session into a browser context, as signing in would. */
export async function signInBrowser(context: BrowserContext, acct: Pick<Account, "cookie">) {
  const value = acct.cookie.slice("__session=".length);
  await context.addCookies([
    { name: "__session", value, domain: "127.0.0.1", path: "/", httpOnly: true, secure: true, sameSite: "Lax" },
    { name: "ark_si", value: "1", domain: "127.0.0.1", path: "/", secure: true, sameSite: "Lax" },
  ]);
}

/** The latest email-action code the Auth emulator "sent" to this address. */
export async function oobCodeFor(email: string, type: "VERIFY_EMAIL" | "PASSWORD_RESET"): Promise<string> {
  const res = await fetch(`http://${EMULATORS.auth}/emulator/v1/projects/demo-ark/oobCodes`);
  const { oobCodes } = (await res.json()) as { oobCodes: { email: string; oobCode: string; requestType: string }[] };
  const match = oobCodes.filter((c) => c.email === email && c.requestType === type).at(-1);
  if (!match) throw new Error(`no ${type} email for ${email}`);
  return match.oobCode;
}
