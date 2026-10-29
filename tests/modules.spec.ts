// The 17 course modules as lessons (modules-v1): the soft gate on every step, page metadata, the
// new lesson components, and a keyboard-only pass through one module from overview to completion.
import { test, expect, type Locator, type Page } from "@playwright/test";
import { MODULES, stepSlugs } from "./routes";
import { account, call, signInBrowser } from "./support/firebase";
import { hydrated } from "./support/hydration";

const PHASE = process.env.PHASE ?? "phase-3";

const decode = (s: string) =>
  s.replace(/&#(\d+);/g, (_m, n) => String.fromCharCode(Number(n))).replace(/&#x([0-9a-f]+);/gi, (_m, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const tag = (html: string, re: RegExp) => decode(re.exec(html)?.[1] ?? "");
const count = (html: string, re: RegExp) => (html.match(re) ?? []).length;

test("signed out, the first three steps of every module are open and every later step redirects to sign-in", async () => {
  for (const m of MODULES) {
    const steps = stepSlugs(m);
    expect(steps.length, m).toBeGreaterThanOrEqual(5);
    for (const [i, slug] of steps.slice(0, 3).entries()) expect((await call(`/courses/${m}/${slug}`, { method: "GET" })).status, `${m} step ${i + 1}`).toBe(200);
    for (const slug of steps.slice(3)) {
      const path = `/courses/${m}/${slug}`;
      const res = await call(path, { method: "GET" });
      expect(res.status, path).toBe(302);
      expect(res.headers.get("location"), path).toBe(`/signin?next=${encodeURIComponent(path)}`);
    }
  }
});

test("every step page: one h1, a 'Step · Module · ARK' title, a short description, and a way back to the course", async () => {
  test.setTimeout(120_000);
  const a = await account("learner");
  let sourceNeeded: string[] = [];
  for (const m of MODULES) {
    const [track] = m.split("/");
    const overview = (await call(`/courses/${m}`, { method: "GET" })).text;
    const moduleTitle = tag(overview, /<h1[^>]*>([^<]+)<\/h1>/);
    const courseTitle = tag(overview, /<title>[^<]*· ([^·<]+) · ARK<\/title>/);
    expect(tag(overview, /<title>([^<]+)<\/title>/), `${m} overview`).toBe(`${moduleTitle} · ${courseTitle} · ARK`);
    expect(tag(overview, /<meta name="description" content="([^"]*)"/).length, `${m} overview description`).toBeLessThan(160);
    for (const [i, slug] of stepSlugs(m).entries()) {
      const path = `/courses/${m}/${slug}`;
      const res = await call(path, { method: "GET", cookie: a.cookie });
      expect(res.status, path).toBe(200);
      const html = res.text;
      expect(count(html, /<h1[\s>]/g), `${path}: one h1`).toBe(1);
      const h1 = tag(html, /<h1[^>]*>([^<]+)<\/h1>/);
      expect(tag(html, /<title>([^<]+)<\/title>/), path).toBe(`${h1} · ${moduleTitle} · ARK`);
      const description = tag(html, /<meta name="description" content="([^"]*)"/);
      expect(description.length, `${path} description`).toBeGreaterThan(0);
      expect(description.length, `${path} description`).toBeLessThan(160);
      expect(tag(html, /<link rel="canonical" href="([^"]+)"/), path).toMatch(new RegExp(`${path}$`));
      expect(html, `${path}: breadcrumb to the course page`).toMatch(new RegExp(`<nav aria-label="Breadcrumb"[\\s\\S]*?href="/courses/${track}"`));
      if (html.includes("data-source-needed")) sourceNeeded.push(`${m} step ${i + 1}`);
      // Writer-only text never reaches the page.
      expect(html, path).not.toMatch(/YOUR TURN|Check these:|\[CITATION NEEDED\]|\[VOCAB|\[CALLOUT|\[TRY\]/);
    }
  }
  // After literate/_citations.md, one claim still needs a source.
  expect(sourceNeeded).toEqual(["literate/how-ai-actually-works step 1"]);
});

test("ARK's view, Try it, pending figures, and step sources render as built", async () => {
  const a = await account("learner");
  const page = async (m: string, n: number) => (await call(`/courses/${m}/${stepSlugs(m)[n - 1]}`, { method: "GET", cookie: a.cookie })).text;
  // AI Aware: "What ARK thinks" / "Some people say", in the Reflect step, labeled as an opinion.
  const aware = await page("aware/what-is-ai", 6);
  expect(aware).toContain('aria-label="ARK\'s opinion"');
  expect(aware).toContain("What ARK thinks");
  expect(aware).toContain("Some people say");
  // AI Fluent: the Try it shows its no-AI version and the personal-information warning, and names no product.
  const tryIt = await page("fluent/ai-landscape-today", 4);
  expect(tryIt).toContain("data-try-offline");
  expect(tryIt).toContain("No AI tool?");
  expect(tryIt).toContain("Never type your name, school, or anything personal into an AI tool.");
  // The fairness slider doesn't exist yet: its paper version shows.
  expect(await page("fluent/algorithmic-bias-and-justice", 4)).toContain("No slider?");
  // A figure that isn't made yet shows its alt text in a placeholder; a drawn one is an image with the writers' alt text.
  const pending = await page("aware/kindness-feelings-and-ai", 2);
  expect(pending).toContain("data-figure-pending");
  expect(pending).toContain("Picture coming soon");
  const drawn = await page("literate/deepfakes-and-misinformation", 4);
  expect(drawn).not.toContain("data-figure-pending");
  expect(drawn).toContain('src="/lessons/literate/deepfakes-and-misinformation/three-moves.svg" alt="Diagram of three steps in order: stop, check the source, find a second source."');
  // Sources sit at the bottom of the step, collapsed, with working links.
  const sources = await page("fluent/ai-landscape-today", 1);
  expect(sources).toMatch(/<details data-step-sources[\s\S]*href="https:\/\/www\.ftc\.gov\/node\/88167"/);
  // AI Aware's Level up box is marked optional.
  expect(await page("aware/what-is-ai", 3)).toContain('aria-label="Level up (grades 3-5) (optional)"');
});

/** Press Tab (and only Tab) until `target` has focus. Fails if it can't be reached. */
async function tabTo(page: Page, target: Locator, max = 80) {
  for (let i = 0; i <= max; i++) {
    if (await target.evaluate((el) => el === document.activeElement).catch(() => false)) return;
    await page.keyboard.press("Tab");
  }
  throw new Error(`Couldn't reach ${target} by pressing Tab ${max} times`);
}

async function arrow(page: Page, key: "ArrowDown") {
  await page.keyboard.down(key);
  await page.waitForTimeout(40);
  await page.keyboard.up(key);
}

test("keyboard only: the whole What Is AI? module, from the course page to the next module", async ({ page }) => {
  test.setTimeout(150_000);
  const M = "/courses/aware/what-is-ai";
  const steps = stepSlugs("aware/what-is-ai");
  const shot = (name: string) => page.screenshot({ path: `screenshots/${PHASE}/keyboard-what-is-ai/${name}.png` });
  await page.setViewportSize({ width: 375, height: 812 });
  await signInBrowser(page.context(), await account("learner"));

  // The course page lists the modules in order; reach module 1 by keyboard.
  await page.goto("/courses/aware", { waitUntil: "networkidle" });
  await hydrated(page);
  await tabTo(page, page.getByRole("link", { name: "Start course" }));
  await page.keyboard.press("Enter");

  const arrive = async (n: number) => {
    await expect(page).toHaveURL(new RegExp(`${M}/${steps[n - 1]}$`));
    await hydrated(page);
    // Between steps the client router moves focus to the new heading (step 1 is a full page load).
    if (n > 1) await expect(page.locator("[data-focus-on-nav]")).toBeFocused();
    await expect(page.getByRole("article").getByText(`Step ${n} of ${steps.length}`)).toBeVisible();
  };
  const next = async (n: number) => {
    await tabTo(page, page.locator("[data-lesson-next]"), 120);
    await page.keyboard.press("Enter");
    if (n <= steps.length) await arrive(n);
  };

  await arrive(1);
  // A way back to the course page from the step, reachable by keyboard.
  await tabTo(page, page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link", { name: "AI Aware" }));
  await shot("01");
  await next(2);

  // Step 2: sort the six cards with the bucket buttons.
  const buckets = ["uses", "not", "uses", "not", "not", "uses"];
  await tabTo(page, page.getByRole("button", { name: /^Put ".+" in Uses AI$/ }));
  for (const b of buckets) {
    if (b === "not") await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
  }
  await expect(page.getByRole("button", { name: "Check my sorting" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByText("You put 6 of 6 where we would.")).toBeVisible();
  await shot("02");
  await next(3);

  // Step 3 (Play it): read, then on.
  await shot("03");
  await next(4);

  // Step 4: pick a scenario choice and see its feedback.
  await tabTo(page, page.getByRole("button", { name: /^Tell a grown-up/ }));
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: /^Tell a grown-up/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("Asking why is what careful AI users do.")).toBeVisible();
  await shot("04");
  await next(5);

  // Step 5: answer the four questions (b, c, b, b) with arrows and Space.
  const groups = page.getByRole("radiogroup");
  for (const [i, downs] of [[0, 1], [1, 2], [2, 1], [3, 1]] as const) {
    await tabTo(page, groups.nth(i).getByRole("radio").first());
    for (let d = 0; d < downs; d++) await arrow(page, "ArrowDown");
    await page.keyboard.press("Space");
    await tabTo(page, page.getByRole("button", { name: "Check answer" }).first(), 3);
    await page.keyboard.press("Enter");
  }
  await expect(page.getByText("All 4 answered. You got 4 of 4 on the first try.")).toBeVisible();
  await shot("05");
  await next(6);

  // Step 6: ARK's view is on screen; the reflection is typed and stays on this device.
  await expect(page.getByRole("region", { name: "ARK's opinion" })).toBeVisible();
  await tabTo(page, page.getByRole("textbox").first());
  await page.keyboard.type("The AI should not decide.");
  await expect(page.getByText("Saved on this device.").first()).toBeVisible();
  await shot("06");
  await next(7);

  // Step 7: Finish module, then the completion page offers the next module in the course.
  await shot("07");
  await expect(page.locator("[data-lesson-next]")).toHaveText(/Finish module/);
  await next(8);
  await expect(page).toHaveURL(new RegExp(`${M}/complete$`));
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("You finished What Is AI?");
  const up = page.getByRole("link", { name: /AI Helpers, and When They Get It Wrong/ }).first();
  await tabTo(page, up, 120);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/courses\/aware\/ai-helpers(\/|$)/);
  await shot("08-next-module");
});
