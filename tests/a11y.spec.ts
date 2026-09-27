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
      const path = await prepare(page, route);
      await page.goto(path, { waitUntil: "networkidle" });
      await axe(page, `${route.name}@${width}`);
    });
  }

  test(`keyboard: ${route.name}`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    const path = await prepare(page, route);
    await page.goto(path, { waitUntil: "networkidle" });

    // Everything a keyboard user should be able to reach: visible, not inert, tabIndex >= 0.
    const expected = await page.evaluate(() => {
      const sel = "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]";
      return [...document.querySelectorAll<HTMLElement>(sel)]
        .filter((el) => el.tabIndex >= 0 && el.getClientRects().length > 0 && !el.closest("[inert],[hidden]") && getComputedStyle(el).visibility !== "hidden")
        // Content of a closed <details> is not focusable until the row is opened (its <summary> is).
        .filter((el) => !(el.closest("details:not([open])") && !el.closest("summary")))
        // A group of native radio buttons is one Tab stop (arrow keys move within it), so expect its first radio only.
        .filter((el, _i, all) => !(el instanceof HTMLInputElement && el.type === "radio" && all.find((o) => o instanceof HTMLInputElement && o.type === "radio" && o.name === el.name) !== el))
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
        // Tab lands on the checked radio of a group (or its first): either way the group is reached.
        if (el instanceof HTMLInputElement && el.type === "radio") {
          const first = document.querySelector<HTMLElement>(`input[type="radio"][name="${CSS.escape(el.name)}"][data-kb-id]`);
          if (first?.dataset.kbId) ids.push(first.dataset.kbId);
        }
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
  await expect(page.locator("#nav-our-work").getByRole("link", { name: /^Workshops & programs/ })).toBeFocused();
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

for (const [from, to] of [["/curriculum", "/courses"], ["/programs", "/workshops"]]) {
  test(`${from} redirects to ${to}`, async ({ page, request }) => {
    const direct = await request.get(from, { maxRedirects: 0 });
    expect(direct.status()).toBe(301);
    const res = await page.goto(from, { waitUntil: "domcontentloaded" });
    expect(new URL(page.url()).pathname).toBe(to);
    expect(res?.status()).toBe(200);
  });
}

test("old /programs anchors land on the same section of /workshops", async ({ page }) => {
  await page.goto("/programs#research", { waitUntil: "domcontentloaded" });
  expect(new URL(page.url()).pathname).toBe("/workshops");
  await expect(page.locator("#research")).toBeInViewport();
});

test("privacy, terms, and the parent notice are marked as drafts for legal review", async ({ page }) => {
  for (const path of ["/privacy", "/terms"]) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("note").getByText("Draft: needs legal review before launch")).toBeVisible();
  }
  // The parent notice from sign-up is also on /privacy, where the sign-up form links to it.
  await page.goto("/privacy#parents", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "The notice you confirm at sign-up" })).toBeVisible();
  await expect(page.getByText("Your child's profile holds only a nickname and a grade band.", { exact: false }).first()).toBeVisible();
});

test("the footer links to privacy, terms, and accessibility on every page type", async ({ page }) => {
  for (const path of ["/", "/courses/investigators/bias-in-ai", "/signin", "/this-page-does-not-exist"]) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    const legal = page.getByRole("navigation", { name: "Legal" });
    for (const name of ["Privacy", "Terms", "Accessibility"]) await expect(legal.getByRole("link", { name })).toBeVisible();
  }
});

test("the 404 page answers 404", async ({ request }) => {
  const res = await request.get("/this-page-does-not-exist");
  expect(res.status()).toBe(404);
  expect(await res.text()).toContain("We couldn't find that page.");
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
