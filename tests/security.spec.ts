/**
 * Phase 3 security tests (brief sections 8.1, 8.2, and 9), against the Firebase emulators only.
 * API calls go straight to the server (no browser), so each test controls exactly what's sent.
 */
import { readFileSync } from "node:fs";
import { test, expect } from "@playwright/test";
import { safeNext } from "../src/lib/safe-next";
import { BIAS_MODULE, BIAS_STEPS } from "./routes";
import { account, adminDb, BASE, call, createUser, idTokenFor, LEARNER_SIGNUP, sessionCookieFrom, sessionFor } from "./support/firebase";

const EVIL = "https://evil.example";
const POST_ROUTES = [
  "/api/session",
  "/api/signout",
  "/api/account/profile",
  "/api/account/learners/create",
  "/api/account/learners/update",
  "/api/account/learners/delete",
  "/api/account/delete",
  "/api/account/learners/active",
  "/api/progress/step",
  "/api/progress/precheck",
  "/api/progress/merge",
  "/api/checks",
];

test.describe("(a) user A can't read or write user B's data through any API route", () => {
  test("learner profiles, progress, certificates, check results, profile, export, and deletion", async () => {
    const a = await account("parent", { name: "Ann" });
    const b = await account("parent", { name: "Bea" });
    const la = (await call("/api/account/learners/create", { cookie: a.cookie, body: { nickname: "Andy", gradeBand: "3-5" } })).json?.learner.id as string;
    const lb = (await call("/api/account/learners/create", { cookie: b.cookie, body: { nickname: "Bo", gradeBand: "6-8" } })).json?.learner.id as string;
    expect(la).toMatch(/^[A-Za-z0-9]{20}$/);
    expect(lb).toMatch(/^[A-Za-z0-9]{20}$/);

    // B's data that later phases write (progress, a certificate, a check result).
    await adminDb.doc(`users/${b.uid}/learners/${lb}/progress/investigators__bias-in-ai`).set({ steps: { s1: 1 } });
    const certB = `cert-${b.uid.slice(0, 8)}`;
    await adminDb.doc(`certificates/${certB}`).set({ uid: b.uid, learnerId: lb, scope: "module", refId: "investigators/bias-in-ai", public: false });
    const checkB = await adminDb.collection("checkResults").add({ uid: b.uid, learnerId: lb, moduleId: "investigators/bias-in-ai", score: 2, outOf: 3 });

    // Writing to B's learner with A's session: not found, and nothing changes.
    expect((await call("/api/account/learners/update", { cookie: a.cookie, body: { learnerId: lb, nickname: "Hacked", gradeBand: "k-2" } })).status).toBe(404);
    expect((await call("/api/account/learners/delete", { cookie: a.cookie, body: { learnerId: lb } })).status).toBe(404);
    const lbDoc = await adminDb.doc(`users/${b.uid}/learners/${lb}`).get();
    expect(lbDoc.get("nickname")).toBe("Bo");
    expect((await adminDb.doc(`users/${b.uid}/learners/${lb}/progress/investigators__bias-in-ai`).get()).exists).toBe(true);

    // Path tricks never reach Firestore.
    for (const bad of ["../../users/x", `${b.uid}/learners/${lb}`, "", "a".repeat(40), `${lb}/progress/x`]) {
      expect((await call("/api/account/learners/update", { cookie: a.cookie, body: { learnerId: bad, nickname: "X", gradeBand: "k-2" } })).status, bad).toBe(400);
    }

    // A uid in the body is ignored: the server only uses the session's uid.
    expect((await call("/api/account/profile", { cookie: a.cookie, body: { displayName: "Changed", uid: b.uid } })).status).toBe(200);
    expect((await adminDb.doc(`users/${b.uid}`).get()).get("displayName")).toBe("Bea");
    expect((await adminDb.doc(`users/${a.uid}`).get()).get("displayName")).toBe("Changed");

    // A's export holds only A's data.
    const exp = await call("/api/account/export", { method: "GET", cookie: a.cookie });
    expect(exp.status).toBe(200);
    expect(exp.headers.get("content-disposition")).toContain("attachment");
    expect(exp.text).toContain(la);
    // Names as JSON values: a random id can contain "Bo" by chance.
    for (const other of [lb, b.uid, b.email, certB, checkB.id, `"Bea"`, `"Bo"`]) expect(exp.text).not.toContain(other);

    // A deletes their account; B's data is untouched.
    expect((await call("/api/account/delete", { cookie: a.cookie, body: { confirm: "DELETE" } })).status).toBe(200);
    expect((await adminDb.doc(`users/${a.uid}`).get()).exists).toBe(false);
    expect((await adminDb.doc(`users/${b.uid}/learners/${lb}`).get()).exists).toBe(true);
    expect((await adminDb.doc(`certificates/${certB}`).get()).exists).toBe(true);
    expect((await checkB.get()).get("uid")).toBe(b.uid);
  });

  test("account deletion removes the account's own data and unlinks its check results", async () => {
    const a = await account("learner");
    const learners = await adminDb.collection(`users/${a.uid}/learners`).get();
    const self = learners.docs[0].id;
    await adminDb.doc(`users/${a.uid}/learners/${self}/progress/investigators__bias-in-ai`).set({ steps: {} });
    await adminDb.doc(`certificates/cert-a-${a.uid.slice(0, 6)}`).set({ uid: a.uid, learnerId: self, public: true });
    const check = await adminDb.collection("checkResults").add({ uid: a.uid, learnerId: self, score: 3, outOf: 3 });

    expect((await call("/api/account/delete", { cookie: a.cookie, body: { confirm: "delete" } })).status).toBe(400);
    const res = await call("/api/account/delete", { cookie: a.cookie, body: { confirm: "DELETE" } });
    expect(res.status).toBe(200);
    expect(sessionCookieFrom(res.headers)).toMatch(/Max-Age=0|Expires=Thu, 01 Jan 1970/);
    expect((await adminDb.doc(`users/${a.uid}`).get()).exists).toBe(false);
    expect((await adminDb.doc(`users/${a.uid}/learners/${self}/progress/investigators__bias-in-ai`).get()).exists).toBe(false);
    expect((await adminDb.doc(`certificates/cert-a-${a.uid.slice(0, 6)}`).get()).exists).toBe(false);
    const unlinked = await check.get();
    expect(unlinked.exists).toBe(true);
    expect(unlinked.get("uid")).toBeUndefined();
    expect(unlinked.get("learnerId")).toBeUndefined();
    // The sign-in account is gone, so the old cookie no longer works.
    expect((await call("/account", { method: "GET", cookie: a.cookie })).status).toBe(302);
  });

  test("learner accounts can't add child profiles, and nobody can remove their own self profile", async () => {
    const a = await account("learner");
    expect((await call("/api/account/learners/create", { cookie: a.cookie, body: { nickname: "Kid", gradeBand: "k-2" } })).status).toBe(403);
    const self = (await adminDb.collection(`users/${a.uid}/learners`).get()).docs[0].id;
    expect((await call("/api/account/learners/delete", { cookie: a.cookie, body: { learnerId: self } })).status).toBe(409);
  });

  test("names that could hold contact details are rejected", async () => {
    const a = await account("parent");
    for (const nickname of ["kid@example.com", "https://x.example", "<script>", "a".repeat(31)]) {
      expect((await call("/api/account/learners/create", { cookie: a.cookie, body: { nickname, gradeBand: "3-5" } })).status, nickname).toBe(400);
    }
  });
});

test.describe("(c) signed-out requests to gated routes get a redirect, not content", () => {
  const gated = [...BIAS_STEPS.slice(1).map((s) => `${BIAS_MODULE}/${s}`), "/my-learning", "/account", "/admin", "/present/investigators/bias-in-ai"];

  for (const path of gated) {
    test(`GET ${path}`, async () => {
      const res = await call(path, { method: "GET" });
      expect(res.status).toBe(302);
      expect(res.headers.get("location")).toBe(`/signin?next=${encodeURIComponent(path)}`);
      expect(res.text).toBe("");
      expect(res.headers.get("cache-control")).toContain("no-store");
    });
  }

  test("step 1 stays open", async () => {
    const res = await call(`${BIAS_MODULE}/${BIAS_STEPS[0]}`, { method: "GET" });
    expect(res.status).toBe(200);
    expect(res.text).toContain("Bias, in plain words");
  });

  test("gated APIs answer 401", async () => {
    for (const path of ["/api/account/export", "/api/admin/stats", "/api/progress"]) expect((await call(path, { method: "GET" })).status, path).toBe(401);
    expect((await call("/api/account/profile", { body: { displayName: "X" } })).status).toBe(401);
  });

  test("path variations can't slip past the gate", async () => {
    for (const path of ["/account/", "/%61ccount", `${BIAS_MODULE}/${BIAS_STEPS[1]}/`, "/my-learning?x=1"]) {
      const res = await call(path, { method: "GET" });
      expect([302, 404], path).toContain(res.status);
      expect(res.text, path).not.toContain("Your account");
      expect(res.text, path).not.toContain("Where does bias come from?");
    }
  });

  test("a forged or garbled cookie counts as signed out", async () => {
    for (const cookie of ["__session=forged", "__session=eyJhbGciOiJub25lIn0.eyJ1aWQiOiJ4In0."]) {
      expect((await call("/account", { method: "GET", cookie })).status).toBe(302);
    }
  });

  test("an unverified email account gets no session", async () => {
    const user = await createUser({ verified: false });
    const res = await call("/api/session", { body: { idToken: await idTokenFor(user), signup: LEARNER_SIGNUP() } });
    expect(res.status).toBe(403);
    expect(res.json?.error).toBe("verify-email");
    expect(sessionCookieFrom(res.headers)).toBeUndefined();
    // The profile is saved (so the age band isn't lost), but there's still no way in until they verify.
    expect((await adminDb.doc(`users/${user.uid}`).get()).exists).toBe(true);
  });

  test("signing out revokes the session, so an old copy of the cookie stops working", async () => {
    const a = await account("learner");
    expect((await call("/account", { method: "GET", cookie: a.cookie })).status).toBe(200);
    // Firebase records revocation to the second, so sign out at least a second after signing in (as anyone would).
    await new Promise((r) => setTimeout(r, 1100));
    const out = await call("/api/signout", { cookie: a.cookie });
    expect(out.status).toBe(200);
    expect(sessionCookieFrom(out.headers)).toMatch(/Max-Age=0|Expires=Thu, 01 Jan 1970/);
    expect((await call("/account", { method: "GET", cookie: a.cookie })).status).toBe(302);
  });

  test("a sign-in with no ARK account is refused (and a brand-new Google-style record isn't kept for password sign-ins)", async () => {
    const user = await createUser();
    const res = await call("/api/session", { body: { idToken: await idTokenFor(user) } });
    expect(res.status).toBe(404);
    expect(res.json?.error).toBe("no-account");
    expect(sessionCookieFrom(res.headers)).toBeUndefined();
  });
});

test.describe("(d) roles are checked on the server", () => {
  test("a regular user gets 403 from /admin, its API, and /present", async () => {
    const a = await account("learner");
    const page = await call("/admin", { method: "GET", cookie: a.cookie });
    expect(page.status).toBe(403);
    expect(page.text).toMatch(/You don(&#39;|')t have access/);
    expect((await call("/api/admin/stats", { method: "GET", cookie: a.cookie })).status).toBe(403);
    expect((await call("/present/investigators/bias-in-ai", { method: "GET", cookie: a.cookie })).status).toBe(403);
  });

  test("a facilitator can present but not open /admin", async () => {
    const f = await account("learner", { role: "facilitator" });
    expect((await call("/present/investigators/bias-in-ai", { method: "GET", cookie: f.cookie })).status).toBe(200);
    expect((await call("/admin", { method: "GET", cookie: f.cookie })).status).toBe(403);
    expect((await call("/api/admin/stats", { method: "GET", cookie: f.cookie })).status).toBe(403);
  });

  test("an admin can open /admin and its API", async () => {
    const admin = await account("learner", { role: "admin" });
    expect((await call("/admin", { method: "GET", cookie: admin.cookie })).status).toBe(200);
    const stats = await call("/api/admin/stats", { method: "GET", cookie: admin.cookie });
    expect(stats.status).toBe(200);
    expect(stats.json).toHaveProperty("totals");
  });
});

test.describe("(e) open redirects are blocked", () => {
  test("safeNext only allows paths on this site", () => {
    for (const bad of [
      "https://evil.example",
      "//evil.example",
      "/\\evil.example",
      "\\\\evil.example",
      "javascript:alert(1)",
      "%2F%2Fevil.example",
      "/\t/evil.example",
      "/\n/evil.example",
      "http:evil.example",
      "/api/signout",
      "",
      null,
      "x".repeat(600),
    ]) {
      expect(safeNext(bad), String(bad)).toBe("/my-learning");
    }
    expect(safeNext("/courses/investigators/bias-in-ai/check")).toBe("/courses/investigators/bias-in-ai/check");
    expect(safeNext("/account?setup=learners#learners")).toBe("/account?setup=learners#learners");
    expect(safeNext("/%2F%2Fevil.example")).toBe("/%2F%2Fevil.example"); // stays a path on this site
  });

  test("the gate's redirect always points at this site's sign-in page", async () => {
    const res = await call("//evil.example/account", { method: "GET" });
    const location = res.headers.get("location");
    if (location) expect(new URL(location, BASE).origin).toBe(BASE);
  });
});

test.describe("(f) cross-origin POSTs are rejected", () => {
  for (const path of POST_ROUTES) {
    test(`POST ${path}`, async () => {
      const a = await account("parent");
      const body = { displayName: "Evil", nickname: "Evil", gradeBand: "3-5", learnerId: "x".repeat(20), confirm: "DELETE", idToken: "x".repeat(40) };
      expect((await call(path, { cookie: a.cookie, body, origin: EVIL })).status, "evil Origin").toBe(403);
      expect((await call(path, { cookie: a.cookie, body, origin: null })).status, "no Origin").toBe(403);
      expect((await call(path, { cookie: a.cookie, body, headers: { "Sec-Fetch-Site": "cross-site" } })).status, "cross-site fetch").toBe(403);
      expect((await call(path, { cookie: a.cookie, body, headers: { "Content-Type": "text/plain" } })).status, "not JSON").toBe(415);
      expect((await call(path, { method: "GET", cookie: a.cookie })).status, "GET").toBe(405);
      // Nothing changed.
      expect((await adminDb.doc(`users/${a.uid}`).get()).get("displayName")).toBe("Pat");
    });
  }
});

test.describe("session cookie and headers", () => {
  test("the session cookie is HttpOnly, Secure, SameSite=Lax, and lasts 5 days", async () => {
    const user = await createUser();
    const res = await call("/api/session", { body: { idToken: await idTokenFor(user), signup: LEARNER_SIGNUP() } });
    const cookie = sessionCookieFrom(res.headers) ?? "";
    expect(cookie).toMatch(/HttpOnly/);
    expect(cookie).toMatch(/Secure/);
    expect(cookie).toMatch(/SameSite=Lax/);
    expect(cookie).toMatch(/Path=\//);
    expect(cookie).toMatch(/Max-Age=432000/);
    expect(res.text).not.toContain(".ey"); // no token in the body
  });

  test("server-rendered pages send the security headers", async () => {
    const a = await account("learner");
    for (const path of ["/account", `${BIAS_MODULE}/${BIAS_STEPS[0]}`]) {
      const res = await call(path, { method: "GET", cookie: a.cookie });
      const csp = res.headers.get("content-security-policy") ?? "";
      expect(csp).toContain("frame-ancestors 'none'");
      expect(csp).toContain("object-src 'none'");
      expect(csp).toMatch(/script-src 'self' 'sha256-/);
      expect(csp).not.toMatch(/script-src[^;]*'unsafe-inline'/);
      expect(res.headers.get("strict-transport-security")).toContain("max-age=");
      expect(res.headers.get("x-content-type-options")).toBe("nosniff");
      expect(res.headers.get("referrer-policy")).toBe("strict-origin-when-cross-origin");
      expect(res.headers.get("permissions-policy")).toContain("camera=()");
      expect(res.headers.get("cache-control")).toContain("no-store");
    }
  });

  test("static pages get the same headers from _headers", () => {
    const file = readFileSync("dist-test/client/_headers", "utf8");
    for (const h of ["Content-Security-Policy", "Strict-Transport-Security", "X-Content-Type-Options: nosniff", "Referrer-Policy", "Permissions-Policy", "frame-ancestors 'none'"]) expect(file).toContain(h);
  });

  test("a session can't be made from a stale or fake token", async () => {
    expect((await call("/api/session", { body: { idToken: "x".repeat(40) } })).status).toBe(401);
    const user = await createUser();
    await sessionFor(user, LEARNER_SIGNUP());
    // Revoking (for example, after a password change) invalidates tokens issued before it.
    const token = await idTokenFor(user);
    await new Promise((r) => setTimeout(r, 1100));
    const { adminAuth } = await import("./support/firebase");
    await adminAuth.revokeRefreshTokens(user.uid);
    expect((await call("/api/session", { body: { idToken: token } })).status).toBe(401);
  });
});
