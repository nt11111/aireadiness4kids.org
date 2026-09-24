import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { ROUTES } from "./routes";

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
      await page.goto(route.path, { waitUntil: "networkidle" });
      await axe(page, `${route.name}@${width}`);
    });
  }

  test(`keyboard: ${route.name}`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(route.path, { waitUntil: "networkidle" });

    // Everything a keyboard user should be able to reach: visible, not inert, tabIndex >= 0.
    const expected = await page.evaluate(() => {
      const sel = "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]";
      return [...document.querySelectorAll<HTMLElement>(sel)]
        .filter((el) => el.tabIndex >= 0 && el.getClientRects().length > 0 && !el.closest("[inert],[hidden]") && getComputedStyle(el).visibility !== "hidden")
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
        const ring = cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) >= 2;
        // WCAG 2.4.11: the focused element must not be entirely covered, e.g. by the fixed header.
        const top = document.elementFromPoint(Math.min(Math.max(r.left + r.width / 2, 0), innerWidth - 1), Math.min(Math.max(r.top + r.height / 2, 0), innerHeight - 1));
        const obscured = !!top && !el.contains(top) && !top.contains(el) && !!top.closest("header") && !el.closest("header");
        return { id: el.dataset.kbId ?? null, desc: `${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 40)}"`, ring, obscured };
      });
      if (!info) break; // wrapped past the end of the page
      if (info.id) reached.add(info.id);
      if (!info.ring) problems.push(`no visible focus ring on ${info.desc}`);
      if (info.obscured) problems.push(`focused element hidden under the fixed header: ${info.desc}`);
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
  await expect(page.getByRole("link", { name: /^Curriculum/ }).first()).toBeFocused();
  await axe(page, "nav-dropdown-open");
  await page.keyboard.press("Escape");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(toggle).toBeFocused();
});

test("keyboard: curriculum tabs follow the ARIA tabs pattern", async ({ page }) => {
  await page.goto("/curriculum#investigators", { waitUntil: "networkidle" });
  const tab = (name: RegExp) => page.getByRole("tab", { name });
  await expect(tab(/Investigators/)).toHaveAttribute("aria-selected", "true");
  await tab(/Investigators/).focus();
  await page.keyboard.press("ArrowRight");
  await expect(tab(/Architects/)).toBeFocused();
  await expect(tab(/Architects/)).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel")).toContainText("AI Architects");
  await page.keyboard.press("Home");
  await expect(tab(/Explorers/)).toHaveAttribute("aria-selected", "true");
});
