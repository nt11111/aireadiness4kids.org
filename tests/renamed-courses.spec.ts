// The October 2026 course rename: every URL under an old track id answers a permanent redirect to
// the same page under the new id. The old ids come from src/lib/renamed-tracks.mjs, the only place
// they're kept.
import { test, expect } from "@playwright/test";
import { RENAMED_TRACKS } from "../src/lib/renamed-tracks.mjs";
import { BIAS_STEPS, MODULES } from "./routes";
import { account, signInBrowser } from "./support/firebase";

const renamed = Object.entries(RENAMED_TRACKS);

/** [old path, new path] for every page that lived under an old track id. */
const OLD_URLS: [string, string][] = renamed.flatMap(([from, to]) => {
  const modules = MODULES.filter((m) => m.startsWith(`${to}/`)).map((m) => m.slice(to.length + 1));
  const paths = [
    "/courses/{t}",
    ...modules.map((m) => `/courses/{t}/${m}`),
    ...(modules.includes("bias-in-ai")
      ? [...BIAS_STEPS.map((s) => `/courses/{t}/bias-in-ai/${s}`), "/courses/{t}/bias-in-ai/complete", "/educators/{t}/bias-in-ai", "/present/{t}/bias-in-ai"]
      : []),
  ];
  return paths.map((p) => [p.replace("{t}", from), p.replace("{t}", to)] as [string, string]);
});

test("the old course list covers every module", () => {
  expect(OLD_URLS.filter(([, to]) => /^\/courses\/[a-z]+\/[a-z0-9-]+$/.test(to))).toHaveLength(MODULES.length);
});

for (const [from, to] of OLD_URLS) {
  test(`${from} redirects to ${to}`, async ({ request }) => {
    for (const path of [from, `${from}/`]) {
      const res = await request.get(path, { maxRedirects: 0 });
      expect(res.status(), path).toBe(301);
      expect(new URL(res.headers().location, "http://x").pathname, path).toBe(to);
    }
  });
}

test("an old course URL lands on the renamed course page", async ({ page }) => {
  const [from, to] = renamed[1];
  const res = await page.goto(`/courses/${from}`, { waitUntil: "domcontentloaded" });
  expect(new URL(page.url()).pathname).toBe(`/courses/${to}`);
  expect(res?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "AI Literate" })).toBeVisible();
});

test("an old lesson step URL lands on the same step, signed in", async ({ page, context }) => {
  const [from, to] = renamed[1];
  await signInBrowser(context, await account("learner", { name: "Rae" }));
  await page.goto(`/courses/${from}/bias-in-ai/${BIAS_STEPS[1]}`, { waitUntil: "domcontentloaded" });
  expect(new URL(page.url()).pathname).toBe(`/courses/${to}/bias-in-ai/${BIAS_STEPS[1]}`);
  await expect(page.getByRole("heading", { level: 1, name: "Where does bias come from?" })).toBeVisible();
});

test("no page links to an old course URL", async ({ page }) => {
  for (const path of ["/", "/courses", "/courses/literate/bias-in-ai", "/educators"]) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    const hrefs = await page.locator("a[href]").evaluateAll((as) => as.map((a) => a.getAttribute("href") ?? ""));
    for (const [from] of renamed) expect(hrefs.filter((h) => h.includes(`/${from}`)), path).toEqual([]);
  }
});
