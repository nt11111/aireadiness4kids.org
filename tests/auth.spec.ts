/**
 * Sign-up, sign-in, and account flows in a real browser, against the Firebase emulators.
 * Screenshots go to screenshots/phase-3/auth/.
 */
import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { BIAS_MODULE, BIAS_STEPS } from "./routes";
import { account, adminAuth, adminDb, BASE, oobCodeFor, signInBrowser, unique } from "./support/firebase";
import { beforeHydration, hydrated } from "./support/hydration";

const PHASE = process.env.PHASE ?? "phase-3";
const shot = (page: Page, name: string) => page.screenshot({ path: `screenshots/${PHASE}/auth/${name}.png`, fullPage: true });
const PASSWORD = "correct-horse-battery";

async function axe(page: Page, label: string) {
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]).analyze();
  expect(violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => `${v.id}: ${v.help}`), label).toEqual([]);
}

async function chooseBirth(page: Page, yearsAgo: number, month = 1) {
  await hydrated(page);
  await page.getByLabel("Month").selectOption(String(month));
  await page.getByLabel("Year").selectOption(String(new Date().getFullYear() - yearsAgo));
  await page.getByRole("button", { name: "Continue" }).click();
}

async function confirmEmail(page: Page, email: string, next: string) {
  const code = await oobCodeFor(email, "VERIFY_EMAIL");
  const continueUrl = `${BASE}/signin?verified=1&next=${encodeURIComponent(next)}`;
  await page.goto(`/auth/callback?mode=verifyEmail&oobCode=${code}&continueUrl=${encodeURIComponent(continueUrl)}`);
  await expect(page.getByRole("heading", { name: "Your email is confirmed" })).toBeVisible();
  await page.locator("#main").getByRole("link", { name: "Sign in" }).click();
  await expect(page.getByText("Your email is confirmed. Sign in to continue.")).toBeVisible();
}

async function signInWithForm(page: Page, email: string, password = PASSWORD) {
  await hydrated(page);
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
}

test("13+ sign-up with email: age screen, confirm email, sign in, and land on the step you wanted", async ({ page }) => {
  const next = `${BIAS_MODULE}/${BIAS_STEPS[1]}`;
  await page.goto(`/signup?next=${encodeURIComponent(next)}`);
  await expect(page.getByRole("heading", { name: "How old are you?" })).toBeVisible();
  await shot(page, "01-age-screen");
  await axe(page, "age screen");
  await chooseBirth(page, 15, 3);
  await expect(page.getByRole("heading", { name: "Create your free account" })).toBeVisible();

  // The answer can't be changed in this tab by reloading or coming back.
  await page.reload();
  await expect(page.getByRole("heading", { name: "Create your free account" })).toBeVisible();

  const email = `ui-${unique()}@example.test`;
  await page.getByLabel("What should we call you?").fill("Riley");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill("short");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText("Use at least 10 characters.")).toBeVisible();
  await shot(page, "02-learner-form-errors");
  await axe(page, "learner form");
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();
  await shot(page, "03-check-email");

  await confirmEmail(page, email, next);
  await signInWithForm(page, email);
  await expect(page).toHaveURL(next);
  await expect(page.getByRole("heading", { level: 1, name: "Where does bias come from?" })).toBeVisible();

  // Stored: the age band only, never a birth date.
  const uid = (await adminAuth.getUserByEmail(email)).uid;
  const profile = (await adminDb.doc(`users/${uid}`).get()).data() ?? {};
  expect(profile.ageBand).toBe("13to17");
  expect(profile.accountType).toBe("learner");
  expect(Object.keys(profile).sort()).toEqual(["accountType", "ageBand", "createdAt", "displayName", "firstSrc"]);
  expect(JSON.stringify(profile)).not.toMatch(/birth|month|year/i);
});

test("under 13: a grown-up makes a family account, then adds the child's profile", async ({ page }) => {
  await page.goto("/signup");
  await chooseBirth(page, 9);
  await expect(page.getByRole("heading", { name: "Ask a grown-up to set up your account" })).toBeVisible();
  await shot(page, "04-ask-a-grown-up");
  await page.getByRole("button", { name: "I'm a parent or guardian" }).click();
  await expect(page.getByRole("heading", { name: "Set up a family account" })).toBeVisible();
  await expect(page.getByText("Draft: needs legal review before launch")).toBeVisible();

  const email = `parent-${unique()}@example.test`;
  await page.getByLabel("Your first name").fill("Jordan");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText("Please confirm you're the parent or guardian to continue.")).toBeVisible();
  await shot(page, "05-parent-form");
  await axe(page, "parent form");
  await page.getByLabel(/I'm this child's parent or legal guardian/).check();
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();

  await confirmEmail(page, email, "/account?setup=learners");
  await signInWithForm(page, email);
  await expect(page).toHaveURL("/account?setup=learners");
  await expect(page.getByRole("heading", { name: "Add a learner" })).toBeFocused();
  await page.getByLabel("Nickname").fill("Sam");
  await page.getByLabel("Grade").selectOption("3-5");
  await page.getByRole("button", { name: "Add learner" }).click();
  await expect(page.getByText("Added Sam.")).toBeVisible();
  await expect(page.locator("#learners").getByText("Sam", { exact: true })).toBeVisible();
  await shot(page, "06-account-parent");
  await axe(page, "parent account page");

  const uid = (await adminAuth.getUserByEmail(email)).uid;
  const profile = (await adminDb.doc(`users/${uid}`).get()).data() ?? {};
  expect(profile.accountType).toBe("parent");
  expect(profile.ageBand).toBe("18plus");
  expect(profile.parentConsent?.version).toBe("draft-2026-09");
  const kids = await adminDb.collection(`users/${uid}/learners`).get();
  expect(kids.size).toBe(1);
  expect(Object.keys(kids.docs[0].data()).sort()).toEqual(["createdAt", "gradeBand", "isSelf", "nickname"]);

  await page.goto("/my-learning");
  await expect(page.getByText("Sam", { exact: true })).toBeVisible();
});

test("sign-in errors never reveal whether an email has an account", async ({ page }) => {
  const known = await account("learner");
  await page.goto("/signin");
  await signInWithForm(page, known.email, "wrong-password-123");
  const alert = page.getByRole("alert");
  await expect(alert).toHaveText("Email or password is incorrect.");
  await signInWithForm(page, `nobody-${unique()}@example.test`, "wrong-password-123");
  await expect(alert).toHaveText("Email or password is incorrect.");
  await shot(page, "07-signin-error");
  await axe(page, "sign-in error");
});

test("(e) sign-in ignores a next= that points off the site", async ({ page }) => {
  for (const evil of ["https://evil.example/steal", "//evil.example", "/\\evil.example", "javascript:alert(1)"]) {
    const acct = await account("learner");
    await page.context().clearCookies();
    await page.goto(`/signin?next=${encodeURIComponent(evil)}`);
    await signInWithForm(page, acct.email);
    await expect(page, evil).toHaveURL(`${BASE}/my-learning`);
  }
});

test("header shows sign-in when signed out and an account menu when signed in; sign-out ends the session", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  const header = page.getByRole("banner");
  await expect(header.getByRole("link", { name: "Sign in" })).toBeVisible();
  await expect(header.getByRole("link", { name: "Create free account" })).toBeVisible();

  await signInBrowser(page.context(), await account("learner", { name: "Alex" }));
  await page.goto("/", { waitUntil: "networkidle" });
  await hydrated(page);
  const menu = page.getByRole("button", { name: "Account menu for Alex" });
  await expect(menu).toBeVisible();
  await menu.click();
  await shot(page, "08-header-account-menu");
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(`${BASE}/`);
  await expect(header.getByRole("link", { name: "Sign in" })).toBeVisible();
  await page.goto("/account");
  await expect(page).toHaveURL(`${BASE}/signin?next=%2Faccount`);
});

test("account page: rename, download my data, and delete the account", async ({ page }) => {
  const acct = await account("learner", { name: "Alex" });
  await signInBrowser(page.context(), acct);
  await page.goto("/account", { waitUntil: "networkidle" });
  await hydrated(page);
  await page.getByLabel("Display name").fill("Alexa");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText("Saved.")).toBeVisible();
  expect((await adminDb.doc(`users/${acct.uid}`).get()).get("displayName")).toBe("Alexa");

  const download = page.waitForEvent("download");
  await page.getByRole("link", { name: "Download my data" }).click();
  const file = await (await download).path();
  const data = JSON.parse(await (await import("node:fs/promises")).readFile(file, "utf8"));
  expect(data.account.email).toBe(acct.email);
  expect(data.profile.displayName).toBe("Alexa");

  await page.getByLabel("Type DELETE to confirm").fill("delete");
  await page.getByRole("button", { name: "Delete my account" }).click();
  await expect(page.getByText("Type DELETE (in capital letters) to confirm.")).toBeVisible();
  await shot(page, "09-account-learner");
  await page.getByLabel("Type DELETE to confirm").fill("DELETE");
  await page.getByRole("button", { name: "Delete my account" }).click();
  await expect(page).toHaveURL(`${BASE}/account-deleted`);
  await expect(adminAuth.getUser(acct.uid)).rejects.toMatchObject({ code: "auth/user-not-found" });
});

test("reset password: the same answer for any email, and the link sets a new password", async ({ page }) => {
  const acct = await account("learner");
  await page.goto("/reset-password");
  await hydrated(page);
  await page.getByLabel("Email", { exact: true }).fill(`nobody-${unique()}@example.test`);
  await page.getByRole("button", { name: "Send the link" }).click();
  await expect(page.getByText(/If there's an ARK account for/)).toBeVisible();

  await page.goto("/reset-password");
  await hydrated(page);
  await page.getByLabel("Email", { exact: true }).fill(acct.email);
  await page.getByRole("button", { name: "Send the link" }).click();
  await expect(page.getByText(/If there's an ARK account for/)).toBeVisible();

  const code = await oobCodeFor(acct.email, "PASSWORD_RESET");
  await page.goto(`/auth/callback?mode=resetPassword&oobCode=${code}`);
  await expect(page.getByRole("heading", { name: "Choose a new password" })).toBeVisible();
  await page.getByLabel("New password").fill("a-brand-new-password");
  await page.getByRole("button", { name: "Save new password" }).click();
  await expect(page.getByRole("heading", { name: "Your password is changed" })).toBeVisible();
  await page.locator("#main").getByRole("link", { name: "Sign in" }).click();
  await signInWithForm(page, acct.email, "a-brand-new-password");
  await expect(page).toHaveURL(`${BASE}/my-learning`);
});

test("a bad or used email link shows a clear message", async ({ page }) => {
  await page.goto("/auth/callback?mode=verifyEmail&oobCode=not-a-real-code");
  await expect(page.getByRole("heading", { name: "This link didn't work" })).toBeVisible();
});

test("what someone types before the page finishes loading isn't lost", async ({ page }) => {
  const email = `nobody-${unique()}@example.test`;
  await beforeHydration(page, "/reset-password", () => page.getByLabel("Email", { exact: true }).fill(email));
  await page.getByRole("button", { name: "Send the link" }).click();
  await expect(page.getByText(`If there's an ARK account for ${email},`)).toBeVisible();

  // Choosing the year re-renders the age form; the month chosen early has to survive that.
  await beforeHydration(page, "/signup", () => page.getByLabel("Month").selectOption("3"));
  await page.getByLabel("Year").selectOption(String(new Date().getFullYear() - 15));
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { name: "Create your free account" })).toBeVisible();

  // Sign-in: pressing Enter early does nothing, rather than the browser sending the form itself
  // with the password in the URL. The typing is kept for when the page is ready.
  const acct = await account("learner");
  const leaks: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes(acct.password)) leaks.push(r.url());
  });
  await beforeHydration(page, "/signin", async () => {
    await page.getByLabel("Email", { exact: true }).fill(acct.email);
    await page.getByLabel("Password", { exact: true }).fill(acct.password);
    await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeDisabled();
    await page.getByLabel("Password", { exact: true }).press("Enter");
  });
  await expect(page.getByLabel("Password", { exact: true })).toHaveValue(acct.password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(`${BASE}/my-learning`);
  expect(leaks).toEqual([]);
});
