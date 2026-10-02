import { test, expect, type Locator, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { BIAS_MODULE, BIAS_STEPS } from "./routes";
import { account, signInBrowser } from "./support/firebase";
import { hydrated } from "./support/hydration";

const PHASE = process.env.PHASE ?? "phase-3";
const SEQ = `screenshots/${PHASE}/walkthrough-375`;

async function axe(page: Page, label: string) {
  // The sticky top and bottom bars overlap whatever happens to be scrolled beneath them, which axe's
  // target-size rule counts as shrinking those targets. Scroll padding keeps focused items clear of the
  // bars, so measure with the bars in normal flow (their own controls are still checked).
  const unstick = await page.addStyleTag({ content: "[data-sticky], [data-lesson-root] > header { position: static !important; }" });
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]).analyze();
  await unstick.evaluate((el) => (el as Element).remove());
  const blocking = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(blocking.map((v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(", ")})`), `${label}: serious/critical axe violations`).toEqual([]);
}

/** Press Tab (and only Tab) until `target` has focus. Fails if it can't be reached. */
async function tabTo(page: Page, target: Locator, max = 80) {
  for (let i = 0; i <= max; i++) {
    if (await target.evaluate((el) => el === document.activeElement).catch(() => false)) return;
    await page.keyboard.press("Tab");
  }
  throw new Error(`Couldn't reach ${target} by pressing Tab ${max} times`);
}

/** Arrow key held like a person would. Radix moves focus a tick after keydown and only selects while the key is down. */
async function arrow(page: Page, key: "ArrowDown" | "ArrowUp" | "ArrowLeft" | "ArrowRight") {
  await page.keyboard.down(key);
  await page.waitForTimeout(40);
  await page.keyboard.up(key);
}

let shot = 0;
const snap = (page: Page, name: string) => page.screenshot({ path: `${SEQ}/${String(++shot).padStart(2, "0")}-${name}.png` });

/** Wait for a client-side step change: new URL, new heading focused, islands hydrated. */
async function arrive(page: Page, slug: string) {
  await expect(page).toHaveURL(new RegExp(`${BIAS_MODULE}/${slug}$`));
  await hydrated(page);
  await expect(page.locator("[data-focus-on-nav]")).toBeFocused();
}

test("keyboard only: the whole Bias in AI module at 375px", async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 375, height: 812 });
  await signInBrowser(page.context(), await account("learner"));
  const requests: string[] = [];
  page.on("request", (r) => requests.push(`${r.url()} ${r.postData() ?? ""}`));

  await page.goto(BIAS_MODULE, { waitUntil: "networkidle" });
  await hydrated(page);
  await page.evaluate(() => { (window as unknown as { __sameDocument: boolean }).__sameDocument = true; });
  await snap(page, "overview");

  // Optional pre-check: open it, answer all three by keyboard, see a score (answers stay hidden).
  const preToggle = page.getByRole("button", { name: "Try the pre-check" });
  await tabTo(page, preToggle);
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Hide the pre-check" })).toHaveAttribute("aria-expanded", "true");
  for (const [i, downs] of [[0, 0], [1, 1], [2, 0]] as const) {
    await tabTo(page, page.getByRole("radiogroup").nth(i).getByRole("radio").first());
    for (let d = 0; d < downs; d++) await arrow(page, "ArrowDown");
    await page.keyboard.press("Space");
  }
  await tabTo(page, page.getByRole("button", { name: "See my score" }));
  await page.keyboard.press("Enter");
  await expect(page.getByText("You got 2 of 3. That's your starting point.")).toBeVisible();
  await snap(page, "precheck-score");
  await axe(page, "overview with pre-check");

  await tabTo(page, page.getByRole("link", { name: "Start the module" }));
  await page.keyboard.press("Enter");

  // Step 1: vocabulary popover opens with Enter and closes with Escape, back on its button.
  await arrive(page, BIAS_STEPS[0]);
  await snap(page, "step1");
  const vocab = page.getByRole("button", { name: "Bias (show definition)" });
  await tabTo(page, vocab);
  await page.keyboard.press("Enter");
  const popover = page.getByRole("dialog");
  await expect(popover).toContainText("A pattern that unfairly favors");
  await snap(page, "step1-vocab");
  await axe(page, "vocab popover");
  await page.keyboard.press("Escape");
  await expect(popover).toBeHidden();
  await expect(vocab).toBeFocused();
  await expect(page.getByRole("button", { name: "Read aloud" })).toBeVisible();

  // → goes to the next step, without a full page load (View Transitions / client router).
  await page.keyboard.press("ArrowRight");
  await arrive(page, BIAS_STEPS[1]);
  expect(await page.evaluate(() => (window as unknown as { __sameDocument?: boolean }).__sameDocument)).toBe(true);
  await snap(page, "step2");

  // Step 2: sort six cards with the bucket buttons; get one wrong on purpose, then fix it.
  const order = ["data", "choices", "data", "choices", "data", "data"]; // the last card belongs in "choices"
  await tabTo(page, page.getByRole("button", { name: /^Put ".+" in The data it learned from$/ }));
  for (const bucket of order) {
    if (bucket === "choices") await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
  }
  await expect(page.getByRole("button", { name: "Check my sorting" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByText("You put 5 of 6 where we would.")).toBeVisible();
  await page.getByText("We'd put this in \"Choices people made.\"").scrollIntoViewIfNeeded();
  await snap(page, "step2-sort-feedback");
  await axe(page, "sort checked");
  await tabTo(page, page.getByRole("button", { name: "Sort the others again" }));
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await tabTo(page, page.getByRole("button", { name: "Check my sorting" }), 5);
  await page.keyboard.press("Enter");
  await expect(page.getByText("You put 6 of 6 where we would.")).toBeVisible();

  // The mobile outline sheet, opened from "Step 2 of 6"; Escape returns focus to its button.
  const outlineBtn = page.getByRole("button", { name: /Step 2 of 6/ });
  await tabTo(page, outlineBtn);
  await page.keyboard.press("Enter");
  const sheet = page.getByRole("dialog");
  await expect(sheet).toBeVisible();
  await expect(sheet.getByRole("link", { name: /What is bias\?.*completed/ })).toBeVisible();
  await snap(page, "outline-sheet");
  await axe(page, "outline sheet");
  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();
  await expect(outlineBtn).toBeFocused();

  await page.keyboard.press("ArrowRight");
  await arrive(page, BIAS_STEPS[2]);

  // Step 3: explore two scenario choices, then open the discussion prompts.
  await tabTo(page, page.getByRole("button", { name: /^Say yes/ }));
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: /^Ask what data/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("If you chose B:")).toBeVisible();
  await snap(page, "step3-scenario");
  await tabTo(page, page.locator("summary", { hasText: "Talk about it" }));
  await page.keyboard.press("Enter");
  await expect(page.getByText("Should an AI tool ever make the final choice")).toBeVisible();
  await snap(page, "step3-discuss");
  await axe(page, "scenario answered");

  await page.keyboard.press("ArrowRight");
  await arrive(page, BIAS_STEPS[3]);

  // Step 4: arrows inside a radio group pick answers and never change the step.
  const groups = page.getByRole("radiogroup");
  await tabTo(page, groups.nth(0).getByRole("radio").first());
  await page.keyboard.press("Space"); // wrong on purpose
  await arrow(page, "ArrowRight");
  await expect(page).toHaveURL(new RegExp(`${BIAS_STEPS[3]}$`));
  await arrow(page, "ArrowLeft");
  await tabTo(page, page.getByRole("button", { name: "Check answer" }).first(), 3);
  await page.keyboard.press("Enter");
  await expect(page.locator(":focus")).toContainText("Not quite. Here's the idea:");
  await snap(page, "step4-not-quite");
  await tabTo(page, page.getByRole("button", { name: "Try again" }), 3);
  await page.keyboard.press("Enter");
  await expect(groups.nth(0).getByRole("radio").first()).toBeFocused();
  await arrow(page, "ArrowDown"); // b, the answer
  await tabTo(page, page.getByRole("button", { name: "Check answer" }).first(), 3);
  await page.keyboard.press("Enter");
  for (const [i, downs] of [[1, 1], [2, 0], [3, 0]] as const) {
    await tabTo(page, groups.nth(i).getByRole("radio").first());
    for (let d = 0; d < downs; d++) await arrow(page, "ArrowDown");
    await page.keyboard.press("Space");
    await tabTo(page, page.getByRole("button", { name: "Check answer" }).first(), 3);
    await page.keyboard.press("Enter");
  }
  await expect(page.getByText("All 4 answered. You got 3 of 4 on the first try.")).toBeVisible();
  await snap(page, "step4-done");
  await axe(page, "check answered");

  await page.keyboard.press("ArrowRight");
  await arrive(page, BIAS_STEPS[4]);

  // Step 5: typing a reflection saves it on this device only, and arrows don't leave the text box.
  const box = page.getByRole("textbox");
  await tabTo(page, box);
  const secret = "My music app only suggests songs in English.";
  await page.keyboard.type(secret);
  await page.keyboard.press("ArrowRight");
  await expect(page).toHaveURL(new RegExp(`${BIAS_STEPS[4]}$`));
  await expect(page.getByText("Saved on this device.")).toBeVisible();
  expect(await page.evaluate(() => Object.entries(localStorage).find(([k]) => k.startsWith("ark.reflect.v1:"))?.[1])).toBe(secret);
  await snap(page, "step5-reflect");
  await page.keyboard.press("Tab");

  await page.keyboard.press("ArrowRight");
  await arrive(page, BIAS_STEPS[5]);
  await snap(page, "step6-recap");

  // Finish: the last step is saved, then the completion page; the overview shows every step done.
  const finish = page.getByRole("link", { name: "Finish module" });
  await tabTo(page, finish, 120);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(new RegExp(`${BIAS_MODULE}/complete$`));
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("You finished Bias in AI");
  await snap(page, "complete");
  await page.goto(`${BIAS_MODULE}#steps`);
  await hydrated(page);
  await expect(page.getByText("You finished every step. Nice work!")).toBeVisible();
  await expect(page.locator("#steps").getByText("completed", { exact: false })).toHaveCount(6);
  await page.locator("#steps").scrollIntoViewIfNeeded();
  await snap(page, "overview-finished");

  // The reflection never left the browser.
  expect(requests.filter((r) => r.includes("music app"))).toEqual([]);
});

test.describe("desktop player", () => {
  test.use({ viewport: { width: 1280, height: 900 } });
  test.beforeEach(async ({ context }) => signInBrowser(context, await account("learner")));

  test("outline collapses, and stays collapsed between steps", async ({ page }) => {
    await page.goto(`${BIAS_MODULE}/${BIAS_STEPS[0]}`, { waitUntil: "networkidle" });
    await hydrated(page);
    const toggle = page.getByRole("button", { name: "Hide step names" });
    await tabTo(page, toggle);
    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: "Show step names" })).toHaveAttribute("aria-expanded", "false");
    await page.screenshot({ path: `screenshots/${PHASE}/desktop-outline-collapsed.png` });
    await page.locator("[data-focus-on-nav]").focus();
    await page.keyboard.press("ArrowRight");
    await arrive(page, BIAS_STEPS[1]);
    await expect(page.getByRole("button", { name: "Show step names" })).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByRole("link", { name: /Step 2: Where does bias come from\?/ })).toHaveAttribute("aria-current", "step");
    await axe(page, "collapsed outline");
  });

  test("arrow keys move between steps; Next marks a step complete", async ({ page }) => {
    await page.goto(`${BIAS_MODULE}/${BIAS_STEPS[1]}`, { waitUntil: "networkidle" });
    await hydrated(page);
    const bar = page.getByRole("progressbar", { name: "Progress through this module" });
    await expect(bar).toHaveAttribute("aria-valuenow", "2");
    await page.keyboard.press("ArrowLeft");
    await arrive(page, BIAS_STEPS[0]);
    await expect(bar).toHaveAttribute("aria-valuenow", "1");
    const outline = page.getByRole("complementary", { name: "Module outline" });
    await expect(outline).toContainText("0 of 6 steps done");
    await page.getByRole("link", { name: /^Next|Mark complete/ }).click();
    await arrive(page, BIAS_STEPS[1]);
    await expect(outline).toContainText("1 of 6 steps done");
    await expect(outline.getByRole("link", { name: /What is bias\?.*completed/ })).toBeVisible();
  });

  test("Next becomes \"Mark complete & continue\" at the end of the step", async ({ page }) => {
    await page.goto(`${BIAS_MODULE}/${BIAS_STEPS[1]}`, { waitUntil: "networkidle" });
    await hydrated(page);
    await expect(page.locator("[data-lesson-next]")).toHaveText(/^Next/);
    await page.locator("[data-lesson-end]").scrollIntoViewIfNeeded();
    await expect(page.locator("[data-lesson-next]")).toHaveText(/Mark complete & continue/);
  });
});

test.describe("AI Aware (K-5) variant", () => {
  test("20px text, 48px targets, and read-aloud on every step", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/dev/lesson-preview/2", { waitUntil: "networkidle" });
    await hydrated(page);
    expect(await page.locator("[data-lesson-article]").evaluate((el) => getComputedStyle(el).fontSize)).toBe("20px");
    await expect(page.getByRole("button", { name: "Read aloud" })).toBeVisible();
    for (const target of [page.locator("[data-lesson-next]"), page.getByRole("button", { name: /Step 2 of 3/ }), page.getByRole("button", { name: /^Put ".+" in Uses AI$/ })]) {
      const box = await target.boundingBox();
      expect(box!.height, await target.textContent() ?? "").toBeGreaterThanOrEqual(48);
    }
    await page.screenshot({ path: `screenshots/${PHASE}/aware-sort-375.png` });
  });

  test("read-aloud is hidden when the browser can't speak", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, "speechSynthesis", { get: () => undefined, configurable: true });
      Object.defineProperty(window, "SpeechSynthesisUtterance", { value: undefined, configurable: true });
    });
    await page.goto("/dev/lesson-preview/1", { waitUntil: "networkidle" });
    await hydrated(page);
    await expect(page.getByRole("button", { name: "Read aloud" })).toHaveCount(0);
  });
});

test.describe("signed out", () => {
  test("step 1 is open; Next opens the sign-up panel instead of step 2", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BIAS_MODULE}/${BIAS_STEPS[0]}`, { waitUntil: "networkidle" });
    await hydrated(page);
    await expect(page.getByRole("heading", { level: 1, name: "What is bias?" })).toBeVisible();
    await page.keyboard.press("ArrowRight");
    const panel = page.getByRole("dialog", { name: "Keep going for free" });
    await expect(panel).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`${BIAS_STEPS[0]}$`));
    const next = encodeURIComponent(`${BIAS_MODULE}/${BIAS_STEPS[1]}`);
    await expect(panel.getByRole("link", { name: /Continue with Google/ })).toHaveAttribute("href", `/signup?method=google&next=${next}`);
    await expect(panel.getByRole("link", { name: "Sign up with email" })).toHaveAttribute("href", `/signup?next=${next}`);
    await expect(panel.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", `/signin?next=${next}`);
    await page.screenshot({ path: `screenshots/${PHASE}/gate-panel-375.png` });
    await axe(page, "gate panel");
    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await expect(page.locator("[data-lesson-next]")).toBeFocused();
  });

  test("going straight to step 2 lands on sign-in with a return path", async ({ page }) => {
    await page.goto(`${BIAS_MODULE}/${BIAS_STEPS[1]}`);
    await expect(page).toHaveURL(`/signin?next=${encodeURIComponent(`${BIAS_MODULE}/${BIAS_STEPS[1]}`)}`);
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  });
});

test("Start course opens the first module with lessons, not a coming-soon stub", async ({ page }) => {
  // AI Literate: module 1 is still a stub, so Start goes to step 1 of Bias in AI (module 2).
  await page.goto("/courses/literate", { waitUntil: "networkidle" });
  await hydrated(page);
  const start = page.getByRole("link", { name: "Start course" });
  await expect(start).toHaveAttribute("href", `${BIAS_MODULE}/${BIAS_STEPS[0]}`);
  await start.click();
  await expect(page).toHaveURL(new RegExp(`${BIAS_MODULE}/${BIAS_STEPS[0]}$`));
  // Courses with no lessons yet don't promise one: the button shows the modules (each has slides).
  for (const trackId of ["aware", "fluent"]) {
    await page.goto(`/courses/${trackId}`, { waitUntil: "networkidle" });
    await hydrated(page);
    await expect(page.getByRole("link", { name: "Start course" })).toHaveCount(0);
    const see = page.getByRole("link", { name: "See the modules" });
    await expect(see).toHaveAttribute("href", "#syllabus");
    await expect(page.getByText("Lessons for this course are being written.")).toBeVisible();
    await see.click();
    await expect(page.getByRole("heading", { name: "Syllabus" })).toBeInViewport();
  }
});
