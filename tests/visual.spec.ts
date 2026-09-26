import { test, expect } from "@playwright/test";
import { ROUTES } from "./routes";
import { prepare } from "./support/routes";

const WIDTHS = [375, 768, 1280];
const PHASE = process.env.PHASE ?? "phase-3";

for (const route of ROUTES) {
  for (const width of WIDTHS) {
    test(`${route.name} @ ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await prepare(page, route);
      await page.goto(route.path, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      if (route.lesson) {
        // The lesson player uses a full-height sidebar and a sticky bottom bar, so capture it as one tall
        // screen (as on a tall monitor) instead of stitching, which leaves the sticky bar mid-page.
        const height = await page.evaluate(() => document.documentElement.scrollHeight);
        await page.setViewportSize({ width, height: Math.min(height, 8000) });
        await page.screenshot({ path: `screenshots/${PHASE}/${route.name}-${width}.png` });
      } else {
        await page.screenshot({ path: `screenshots/${PHASE}/${route.name}-${width}.png`, fullPage: true });
      }
    });
  }

  // Brief non-negotiable 5: everything works at 360px with no horizontal scroll.
  test(`${route.name} has no horizontal scroll at 360px`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await prepare(page, route);
    await page.goto(route.path, { waitUntil: "networkidle" });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `page is ${overflow}px wider than the viewport`).toBeLessThanOrEqual(0);
  });
}
