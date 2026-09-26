import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readdirSync } from "node:fs";
import { ROUTES, MODULES } from "./routes";
import { prepare } from "./support/routes";

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];

async function axe(page: Page, label: string) {
  const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  const blocking = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  const other = violations.filter((v) => !blocking.includes(v));
  if (other.length) console.log(`[${label}] non-blocking: ${other.map((v) => `${v.id} (${v.impact}, ${v.nodes.length})`).join(", ")}`);
  const detail = blocking.map((v) => `${v.id} (${v.impact}): ${v.help}\n${v.nodes.slice(0, 5).map((n) => `   ${n.target.join(" ")}\n   ${n.failureSummary?.split("\n").slice(0, 2).join(" ")}`).join("\n")}`).join("\n\n");
  expect(blocking, `${label}: serious/critical axe violations\n\n${detail}`).toEqual([]);
}

for (const route of ROUTES) {
  for (const width of [375, 1280]) {
    test(`axe: ${route.name} @ ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await prepare(page, route);
      await page.goto(route.path, { waitUntil: "networkidle" });
      await axe(page, `${route.name}@${width}`);
    });
  }

  test(`keyboard: ${route.name}`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await prepare(page, route);
    await page.goto(route.path, { waitUntil: "networkidle" });

    // Everything a keyboard user should be able to reach: visible, not inert, tabIndex >= 0.
    const expected = await page.evaluate(() => {
      const sel = "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]";
      return [...document.querySelectorAll<HTMLElement>(sel)]
        .filter((el) => el.tabIndex >= 0 && el.getClientRects().length > 0 && !el.closest("[inert],[hidden]") && getComputedStyle(el).visibility !== "hidden")
        // Content of a closed <details> is not focusable until the row is opened (its <summary> is).
        .filter((el) => !(el.closest("details:not([open])") && !el.closest("summary")))
        .map((el, i) => { el.dataset.kbId = String(i); return String(i); });
    });

    const reached = new Set<string>();
    const problems: string[] = [];
    for (let i = 0; i < expected.length + 15; i++) {
      await page.keyboard.press("Tab");
      const info = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        // Media elements put focus on their built-in controls (inside the browser's shadow DOM), which draw their own ring.
        const ring = el.matches("video, audio") || (cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) >= 2);
        // WCAG 2.4.11: the focused element must not be covered by the fixed header or the lesson's sticky bars.
        const top = document.elementFromPoint(Math.min(Math.max(r.left + r.width / 2, 0), innerWidth - 1), Math.min(Math.max(r.top + r.height / 2, 0), innerHeight - 1));
        const sticky = "header, [data-sticky]";
        const obscured = !!top && !el.contains(top) && !top.contains(el) && !!top.closest(sticky) && !el.closest(sticky);
        // Count focus landing inside an element as reaching it: Radix radio groups pass focus straight to a radio.
        const ids: string[] = [];
        for (let n: HTMLElement | null = el; n; n = n.parentElement) if (n.dataset.kbId) ids.push(n.dataset.kbId);
        return { ids, desc: `${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 40)}"`, ring, obscured };
      });
      if (!info) break; // wrapped past the end of the page
      info.ids.forEach((id) => reached.add(id));
      if (!info.ring) problems.push(`no visible focus ring on ${info.desc}`);
      if (info.obscured) problems.push(`focused element hidden under a sticky bar: ${info.desc}`);
    }
    const missed = expected.filter((id) => !reached.has(id));
    const missedDesc = await page.evaluate((ids) => ids.map((id) => { const el = document.querySelector<HTMLElement>(`[data-kb-id="${id}"]`)!; return `${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 40)}"`; }), missed);
    expect([...problems, ...missedDesc.map((d) => `not reachable by Tab: ${d}`)]).toEqual([]);
  });
}

test("axe: mobile menu open", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto("/about", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page.locator("#mobile-menu")).toBeVisible();
  await axe(page, "mobile-menu");
  await page.keyboard.press("Escape");
  await expect(page.locator("#mobile-menu")).toBeHidden();
  await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
});

test("keyboard: nav dropdown opens, is reachable, closes on Escape", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/about", { waitUntil: "networkidle" });
  const toggle = page.getByRole("button", { name: "Our Work menu" });
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Tab");
  await expect(page.locator("#nav-our-work").getByRole("link", { name: /^Programs & workshops/ })).toBeFocused();
  await axe(page, "nav-dropdown-open");
  await page.keyboard.press("Escape");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(toggle).toBeFocused();
});

test("keyboard: syllabus rows open and close with Enter", async ({ page }) => {
  await page.goto("/courses/investigators", { waitUntil: "networkidle" });
  const row = page.locator("details").nth(1);
  const summary = row.locator("summary");
  await expect(row).not.toHaveAttribute("open", "");
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(row).toHaveAttribute("open", "");
  // Bias in AI has lesson steps, so Tab reaches the first step link inside the row.
  await page.keyboard.press("Tab");
  await expect(row.getByRole("link", { name: /What is bias\?/ })).toBeFocused();
  await axe(page, "syllabus-open");
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(row).not.toHaveAttribute("open", "");
});

test("/curriculum redirects to /courses", async ({ page }) => {
  const res = await page.goto("/curriculum", { waitUntil: "domcontentloaded" });
  expect(new URL(page.url()).pathname).toBe("/courses");
  expect(res?.status()).toBe(200);
});

test("home hides the credibility strip and impact numbers when there is no data", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator("[data-credibility]")).toHaveCount(0);
  await expect(page.locator("[data-impact]")).toHaveCount(0);
  // Never a placeholder logo: every image on the page has a real source and alt attribute.
  const imgs = await page.locator("img").evaluateAll((els) => els.map((e) => ({ src: e.getAttribute("src") ?? "", alt: e.getAttribute("alt") })));
  for (const img of imgs) {
    expect(img.src).not.toMatch(/placeholder|partners\//i);
    expect(img.alt).not.toBeNull();
  }
});

test("every module folder has a page in the route list, and every stub is marked draft", async ({ page }) => {
  const base = "src/content/modules";
  const folders = readdirSync(base).flatMap((t) => readdirSync(`${base}/${t}`).map((m) => `${t}/${m}`)).sort();
  expect(folders).toEqual([...MODULES].sort());
  expect(folders).toHaveLength(17);
  for (const m of MODULES) {
    await page.goto(`/courses/${m}`, { waitUntil: "domcontentloaded" });
    await expect(page.getByText("Draft: under expert review")).toBeVisible();
  }
});
