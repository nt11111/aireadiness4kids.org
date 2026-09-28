/**
 * The header's signed-in state. Server-rendered pages draw it from the session the middleware already
 * checked, so it's right in the HTML itself; static pages ask /api/me and hide the sign-in links
 * (keeping their space) while the "ark_si" hint says the answer may be "signed in".
 */
import { test, expect } from "@playwright/test";
import { account, call, signInBrowser } from "./support/firebase";

test("a server-rendered page's HTML already has the signed-in header", async () => {
  const acct = await account("learner", { name: "Robin" });
  const { status, text } = await call("/my-learning", { method: "GET", cookie: acct.cookie });
  expect(status).toBe(200);
  const header = text.slice(text.indexOf("<header"), text.indexOf("</header>"));
  expect(header).toContain("Account menu for");
  expect(header).toContain("Robin");
  expect(header).not.toContain(">Sign in<");
  expect(header).not.toContain("Create free account");
});

test("a signed-out server-rendered page's HTML has the sign-in links", async () => {
  const { text } = await call("/verify/AAAAAAAAAAAAAAAAAAAAAA", { method: "GET" });
  const header = text.slice(text.indexOf("<header"), text.indexOf("</header>"));
  expect(header).toContain(">Sign in<");
  expect(header).not.toContain("Account menu for");
});

test("a static page hides the sign-in links until /api/me answers, then shows the account", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const acct = await account("learner", { name: "Sam" });
  await signInBrowser(page.context(), acct);
  let release!: () => void;
  const held = new Promise<void>((r) => (release = r));
  await page.route("**/api/me", async (route) => { await held; await route.continue(); });
  await page.goto("/courses/");
  const header = page.locator("header");
  await expect(header.getByRole("link", { name: "Create free account" })).toBeHidden();
  await expect(header.getByRole("link", { name: "Sign in", exact: true })).toBeHidden();
  release();
  await expect(header.getByRole("button", { name: /Account menu for Sam/ })).toBeVisible();
  await expect(header.getByRole("link", { name: "Create free account" })).toHaveCount(0);
});

test("a stale hint with no session shows the sign-in links once /api/me says signed out", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.context().addCookies([{ name: "ark_si", value: "1", domain: "127.0.0.1", path: "/", secure: true, sameSite: "Lax" }]);
  await page.goto("/courses/");
  const header = page.locator("header");
  await expect(header.getByRole("link", { name: "Sign in", exact: true })).toBeVisible();
  await expect(header.getByRole("link", { name: "Create free account" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.classList.contains("si"))).toBe(false);
  expect(await page.evaluate(() => /ark_si=1/.test(document.cookie))).toBe(false);
});
