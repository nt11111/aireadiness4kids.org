/**
 * Phase 5: presenter mode (facilitator role), the admin impact page (admin role), and the open
 * educator pages (brief section 7), against the Firebase emulators only.
 */
import { test, expect } from "@playwright/test";
import { BIAS_STEPS } from "./routes";
import { account, adminDb, call, createUser, idTokenFor, LEARNER_SIGNUP, sessionCookieFrom, signInBrowser, unique } from "./support/firebase";

const MOD = "investigators/bias-in-ai";
const PRESENT = "/present/investigators/bias-in-ai";
const RIGHT = { "pc-training-data": "a", "pc-past-hiring": "b", "pc-catch-bias": "b" };
const ONE_RIGHT = { ...RIGHT, "pc-past-hiring": "a", "pc-catch-bias": "a" };
const newSrc = () => `t-${unique()}`.toLowerCase().slice(0, 40);

test.describe("presenter mode", () => {
  test("one slide at a time, arrow keys and buttons, QR codes carry the presenter's src", async ({ page }) => {
    await signInBrowser(page.context(), await account("learner", { role: "facilitator" }));
    await page.goto(`${PRESENT}?src=uys-fall26`, { waitUntil: "networkidle" });
    const slides = page.locator("[data-slide]");
    const total = BIAS_STEPS.length + 2;
    await expect(slides).toHaveCount(total);
    await expect(page.locator("[data-slide]:visible")).toHaveCount(1);
    await expect(page.locator("[data-slide]:visible h1")).toHaveText("Bias in AI");
    await expect(page.locator("[data-present-counter]")).toHaveText(`1 / ${total}`);
    // The presenter's tag stays in the address and out of their own browser's guest data.
    expect(new URL(page.url()).searchParams.get("src")).toBe("uys-fall26");
    expect(await page.evaluate(() => localStorage.getItem("ark.guest.v1"))).toBeNull();

    const pre = new URL((await page.locator('[data-qr="pre"]').getAttribute("data-qr-url"))!);
    expect(pre.pathname).toBe("/check/bias-in-ai/pre");
    expect(pre.searchParams.get("src")).toBe("uys-fall26");
    await expect(page.locator('[data-qr="pre"] svg[role="img"]')).toBeVisible();

    await page.keyboard.press("ArrowRight");
    await expect(page.locator("[data-slide]:visible h1")).toHaveText("What is bias?");
    await expect(page).toHaveURL(/#slide-2$/);
    await page.keyboard.press("PageDown");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    // Step 4 is the check step: its questions (without answers) and a QR code for the room.
    const check = page.locator("[data-slide]:visible");
    await expect(check.locator("h1")).toHaveText("Quick check");
    await expect(check.locator("[data-present-questions] > li")).toHaveCount(4);
    const post = new URL((await check.locator('[data-qr="post"]').getAttribute("data-qr-url"))!);
    expect(`${post.pathname}${post.search}`).toBe("/check/bias-in-ai/post?src=uys-fall26");
    await expect(check.getByText("Scan to answer on your phone")).toBeVisible();

    await page.keyboard.press("ArrowLeft");
    await expect(page.locator("[data-present-counter]")).toHaveText(`4 / ${total}`);
    await page.keyboard.press("End");
    await expect(page.locator("[data-slide]:visible h1")).toHaveText("Keep going");
    await expect(page.locator("[data-present-next]")).toBeDisabled();
    await page.getByRole("button", { name: "Back" }).click();
    await expect(page.locator("[data-present-counter]")).toHaveText(`${total - 1} / ${total}`);
    await page.keyboard.press("Home");
    await expect(page.locator("[data-present-prev]")).toBeDisabled();

    // A reload keeps the slide.
    await page.goto(`${PRESENT}?src=uys-fall26#slide-5`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-slide]:visible h1")).toHaveText("Quick check");
  });

  test("Exit leaves presenter mode for the page the presenter came from, or the module page", async ({ page }) => {
    await signInBrowser(page.context(), await account("learner", { role: "facilitator" }));
    await page.goto("/courses/investigators", { waitUntil: "networkidle" });
    await page.evaluate((href) => { location.href = href; }, PRESENT);
    await page.waitForURL(`**${PRESENT}`);
    await page.keyboard.press("ArrowRight");
    await page.getByRole("link", { name: /^Exit/ }).click();
    await expect(page).toHaveURL(/\/courses\/investigators\/?$/);
    await expect(page.locator("header").first()).toBeVisible();
    // Opened directly (a bookmark, or from the presenter list): Exit goes to the module's page.
    for (const viaList of [false, true]) {
      if (viaList) {
        await page.goto("/present", { waitUntil: "networkidle" });
        await page.getByRole("link", { name: /^Present/ }).click();
        await page.waitForURL(`**${PRESENT}`);
      } else {
        await page.goto(PRESENT, { waitUntil: "networkidle" });
      }
      await page.getByRole("link", { name: /^Exit/ }).click();
      await expect(page).toHaveURL(/\/courses\/investigators\/bias-in-ai\/?$/);
      expect(await page.evaluate(() => document.documentElement.classList.contains("present"))).toBe(false);
    }
  });

  test("the workshop tag can be set on the first slide; a bad one is ignored", async ({ page }) => {
    await signInBrowser(page.context(), await account("learner", { role: "admin" }));
    await page.goto(`${PRESENT}?src=Not%20OK!`, { waitUntil: "networkidle" });
    await expect(page.getByText("That tag isn't valid")).toBeVisible();
    expect(new URL((await page.locator('[data-qr="pre"]').getAttribute("data-qr-url"))!).search).toBe("");
    await page.getByLabel("Workshop tag for the QR codes").fill("lib-night");
    await page.getByRole("button", { name: "Update" }).click();
    await expect(page.getByText('Check answers count toward "lib-night".')).toBeVisible();
    expect(new URL((await page.locator('[data-qr="module"]').getAttribute("data-qr-url"))!).searchParams.get("src")).toBe("lib-night");
  });

  test("only facilitators and admins can present; stubs and unknown modules are 404", async () => {
    const learner = await account("learner");
    const f = await account("learner", { role: "facilitator" });
    expect((await call("/present", { method: "GET", cookie: learner.cookie })).status).toBe(403);
    expect((await call(PRESENT, { method: "GET", cookie: learner.cookie })).status).toBe(403);
    expect((await call("/present", { method: "GET" })).status).toBe(302);
    const list = await call("/present", { method: "GET", cookie: f.cookie });
    expect(list.status).toBe(200);
    expect(list.text).toContain(`href="${PRESENT}"`);
    expect((await call("/present/investigators/deepfakes-and-misinformation", { method: "GET", cookie: f.cookie })).status).toBe(404);
    expect((await call("/present/investigators/nope", { method: "GET", cookie: f.cookie })).status).toBe(404);
  });
});

test.describe("admin impact page", () => {
  test("totals and per-module numbers filter by src and date; the CSV matches; nothing personal shows", async ({ page }) => {
    const src = newSrc();
    // One learner from this workshop: finishes the module, gets a certificate, does both checks,
    // plus one anonymous workshop check with the same tag.
    const user = await createUser();
    const res = await call("/api/session", { body: { idToken: await idTokenFor(user), signup: LEARNER_SIGNUP("Quinn"), src } });
    const cookie = sessionCookieFrom(res.headers)!.split(";")[0];
    const learnerId = (await adminDb.collection(`users/${user.uid}/learners`).get()).docs[0].id;
    await call("/api/progress/precheck", { cookie, body: { learnerId, moduleId: MOD, answers: ONE_RIGHT } });
    for (const step of BIAS_STEPS) await call("/api/progress/step", { cookie, body: { learnerId, moduleId: MOD, step } });
    await call("/api/progress/postcheck", { cookie, body: { learnerId, moduleId: MOD, answers: RIGHT } });
    expect((await call("/api/certificates/issue", { cookie, body: { learnerId, moduleId: MOD } })).status).toBe(200);
    expect((await call("/api/checks", { body: { moduleId: MOD, phase: "post", answers: RIGHT, anonSid: crypto.randomUUID(), src }, headers: { "x-ark-test-ip": `10.9.0.${Math.floor(Math.random() * 250)}` } })).status).toBe(200);

    const admin = await account("learner", { role: "admin" });
    const today = new Date().toISOString().slice(0, 10);
    const json = await call(`/api/admin/stats?source=${src}`, { method: "GET", cookie: admin.cookie });
    expect(json.json?.totals).toMatchObject({ accounts_13to17: 1, learners: 1, moduleStarts: 1, moduleCompletions: 1, certificates: 1, preCount: 1, postCount: 2 });
    expect(json.json?.preAvg).toBe(33);
    expect(json.json?.postAvg).toBe(100);
    expect(json.json?.modules).toEqual([expect.objectContaining({ moduleId: MOD, starts: 1, completions: 1, preAvg: 33, postAvg: 100, change: 67 })]);
    expect(json.json?.sources).toContain(src);

    // The same numbers for today's date range; none for a range with no activity.
    const byDate = await call(`/api/admin/stats?source=${src}&from=${today}&to=${today}`, { method: "GET", cookie: admin.cookie });
    expect(byDate.json?.totals).toEqual(json.json?.totals);
    expect(byDate.json?.modules).toEqual(json.json?.modules);
    const empty = await call(`/api/admin/stats?source=${src}&from=2001-01-01&to=2001-01-31`, { method: "GET", cookie: admin.cookie });
    expect(empty.json?.totals.moduleStarts).toBe(0);
    expect(empty.json?.modules).toEqual([]);

    const csv = await call(`/api/admin/stats.csv?source=${src}`, { method: "GET", cookie: admin.cookie });
    expect(csv.status).toBe(200);
    expect(csv.headers.get("content-type")).toContain("text/csv");
    expect(csv.headers.get("content-disposition")).toBe(`attachment; filename="ark-impact_${src}.csv"`);
    expect(csv.text).toContain(`source,${src}`);
    expect(csv.text).toContain("moduleCompletions,1");
    expect(csv.text).toContain("certificates,1");
    expect(csv.text).toContain("Bias in AI,investigators,1,1,1,33,2,100,67");

    await signInBrowser(page.context(), admin);
    await page.goto(`/admin?source=${src}`);
    await expect(page.locator('[data-metric="moduleCompletions"] dd')).toHaveText("1");
    await expect(page.locator('[data-metric="post-avg"] dd')).toHaveText("100%");
    await expect(page.locator("[data-admin-modules] tbody tr")).toHaveCount(1);
    await expect(page.locator("[data-admin-modules] tbody tr td").last()).toHaveText("+67 pts");
    await expect(page.getByRole("link", { name: "Download CSV" })).toHaveAttribute("href", `/api/admin/stats.csv?source=${src}`);
    const html = await page.content();
    for (const personal of [user.email, user.uid, learnerId, "Quinn", cookie.slice(10, 40)]) {
      expect(html).not.toContain(personal);
      expect(csv.text).not.toContain(personal);
      expect(json.text).not.toContain(personal);
    }

    // The filter form puts the choices in the address.
    await page.getByLabel("From").fill(today);
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(page).toHaveURL(new RegExp(`source=${src}.*from=${today}`));
    await expect(page.locator("[data-admin-scope]")).toContainText(`tag ${src}, ${today} to today`);
  });

  test("bad filter values are ignored, and the CSV is admins only", async () => {
    const admin = await account("learner", { role: "admin" });
    const learner = await account("learner");
    const facilitator = await account("learner", { role: "facilitator" });
    const odd = await call("/api/admin/stats?source=../users&from=yesterday&to=2026-13-99", { method: "GET", cookie: admin.cookie });
    expect(odd.status).toBe(200);
    expect(odd.json?.filter).toEqual({ source: null, from: null, to: null });
    expect((await call("/api/admin/stats.csv", { method: "GET" })).status).toBe(401);
    expect((await call("/api/admin/stats.csv", { method: "GET", cookie: learner.cookie })).status).toBe(403);
    expect((await call("/api/admin/stats.csv", { method: "GET", cookie: facilitator.cookie })).status).toBe(403);
  });
});

test.describe("educator pages", () => {
  test("open to everyone, linked from the module page, with the guide's sections", async ({ page }) => {
    await page.goto("/courses/investigators/bias-in-ai");
    await page.getByRole("link", { name: "Facilitator guide for Bias in AI" }).click();
    await expect(page).toHaveURL(/\/educators\/investigators\/bias-in-ai$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Facilitator guide: Bias in AI");
    for (const h of ["Materials", "Learning objectives", "Timing (60 minutes)", "Discussion prompts", "Answer notes", "Words to know", "Workshop quick checks"]) {
      await expect(page.getByRole("heading", { name: h, exact: true })).toBeVisible();
    }
    await page.goto("/educators");
    await expect(page.getByRole("link", { name: "Facilitator guide for Bias in AI" })).toBeVisible();
    await expect(page.getByText("Guide coming soon")).toHaveCount(16);
  });
});
