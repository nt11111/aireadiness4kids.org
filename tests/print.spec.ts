/**
 * Print views (Phase 5): Chromium's own PDF output, saved to screenshots/<phase>/ to look at.
 * A certificate must fit one landscape letter page; a facilitator guide prints on portrait letter
 * pages without the site's header, footer, or buttons.
 */
import { test, expect, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { BIAS_STEPS } from "./routes";
import { account, adminDb, call, signInBrowser } from "./support/firebase";

const PHASE = process.env.PHASE ?? "phase-5";
const MOD = "investigators/bias-in-ai";

/** Page count and the first page's size in points, read from the PDF's page objects. */
function pdfPages(pdf: Buffer) {
  const text = pdf.toString("latin1");
  const pages = text.match(/\/Type\s*\/Page(?![s\w])/g)?.length ?? 0;
  const box = /\/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)\s*\]/.exec(text);
  return { pages, width: box ? Math.round(Number(box[1])) : 0, height: box ? Math.round(Number(box[2])) : 0 };
}

async function printTo(page: Page, name: string) {
  mkdirSync(`screenshots/${PHASE}`, { recursive: true });
  await page.evaluate(() => document.fonts.ready);
  const pdf = await page.pdf({ path: `screenshots/${PHASE}/${name}.pdf`, preferCSSPageSize: true, printBackground: true });
  // A picture of the print layout too, for a quick look without opening the PDF.
  await page.emulateMedia({ media: "print" });
  await page.screenshot({ path: `screenshots/${PHASE}/${name}-print.png`, fullPage: true });
  await page.emulateMedia({ media: "screen" });
  return pdfPages(pdf);
}

async function certificateFor(kind: "learner" | "parent") {
  const acct = await account(kind, { name: kind === "learner" ? "Alexandra Montgomery-Okafor" : "Pat" });
  const learnerId =
    kind === "parent"
      ? ((await call("/api/account/learners/create", { cookie: acct.cookie, body: { nickname: "Sunny", gradeBand: "3-5" } })).json?.learner.id as string)
      : (await adminDb.collection(`users/${acct.uid}/learners`).get()).docs[0].id;
  for (const step of BIAS_STEPS) await call("/api/progress/step", { cookie: acct.cookie, body: { learnerId, moduleId: MOD, step } });
  const id = (await call("/api/certificates/issue", { cookie: acct.cookie, body: { learnerId, moduleId: MOD } })).json?.id as string;
  return { acct, id };
}

for (const kind of ["learner", "parent"] as const) {
  test(`a ${kind === "learner" ? "13+ learner's" : "child's"} certificate prints on one landscape letter page`, async ({ page }) => {
    const { acct, id } = await certificateFor(kind);
    await signInBrowser(page.context(), acct);
    await page.goto(`/certificates/${id}`, { waitUntil: "networkidle" });
    const pdf = await printTo(page, `certificate-${kind}`);
    expect(pdf).toEqual({ pages: 1, width: 792, height: 612 });
    // On paper: the certificate only.
    await page.emulateMedia({ media: "print" });
    await expect(page.locator("header")).toBeHidden();
    await expect(page.locator("footer")).toBeHidden();
    await expect(page.getByRole("button", { name: "Print certificate" })).toBeHidden();
    await expect(page.locator("[data-certificate]")).toBeVisible();
    await expect(page.locator("[data-cert-verify]")).toHaveCount(kind === "learner" ? 1 : 0);
  });
}

test("the facilitator guide prints on portrait letter pages without the site chrome", async ({ page }) => {
  await page.goto("/educators/investigators/bias-in-ai", { waitUntil: "networkidle" });
  const pdf = await printTo(page, "guide-bias-in-ai");
  expect(pdf.width).toBe(612);
  expect(pdf.height).toBe(792);
  expect(pdf.pages).toBeGreaterThanOrEqual(2);
  expect(pdf.pages).toBeLessThanOrEqual(6);
  await page.emulateMedia({ media: "print" });
  await expect(page.locator("header")).toBeHidden();
  await expect(page.locator("footer")).toBeHidden();
  await expect(page.getByRole("button", { name: "Print this guide" })).toBeHidden();
  await expect(page.getByRole("heading", { name: "Discussion prompts" })).toBeVisible();
  // Discussion prompts print open.
  await expect(page.getByText("Should an AI tool ever make the final choice about who gets a job?")).toBeVisible();
});
