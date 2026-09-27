// Launch basics: robots.txt (per host), the sitemap, and security.txt.
import { test, expect } from "@playwright/test";

test("robots.txt keeps crawlers off preview hosts", async ({ request }) => {
  // The test server's host (localhost) stands in for a branch deploy or Deploy Preview.
  const res = await request.get("/robots.txt");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("text/plain");
  const body = await res.text();
  expect(body).toMatch(/^User-agent: \*$/m);
  expect(body).toMatch(/^Disallow: \/$/m);
  expect(body).not.toContain("Sitemap:");
});

test("robots.txt on aireadiness4kids.org lists the sitemap and keeps crawlers out of account pages", async ({ request }) => {
  const res = await request.get("/robots.txt", { headers: { host: "aireadiness4kids.org" } });
  const body = await res.text();
  expect(body).not.toMatch(/^Disallow: \/$/m);
  for (const p of ["/api/", "/account", "/my-learning", "/admin", "/present", "/certificates/"]) expect(body).toContain(`Disallow: ${p}`);
  expect(body).toContain("Sitemap: https://aireadiness4kids.org/sitemap.xml");
});

test("every sitemap address answers 200 directly, with public pages only", async ({ request }) => {
  const res = await request.get("/sitemap.xml");
  expect(res.status()).toBe(200);
  const locs = [...(await res.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]));
  expect(locs.every((u) => u.origin === "https://aireadiness4kids.org")).toBe(true);
  const paths = locs.map((u) => u.pathname);
  expect(paths).toContain("/courses/investigators/bias-in-ai/");
  expect(paths).toContain("/courses/investigators/bias-in-ai/what-is-bias");
  expect(paths).toContain("/privacy/");
  expect(paths.filter((p) => /^\/courses\/[^/]+\/[^/]+\/$/.test(p))).toHaveLength(17); // every module page
  for (const p of paths) {
    expect(p, "no signed-in or developer pages").not.toMatch(/^\/(api|account|my-learning|admin|present|certificates|dev|check)\b/);
    expect(p, "no second step (they need an account)").not.toMatch(/\/where-it-comes-from$/);
  }
  for (const p of paths) {
    const page = await request.get(p, { maxRedirects: 0 });
    expect(page.status(), p).toBe(200);
  }
});

test("security.txt says where to report a problem", async ({ request }) => {
  const res = await request.get("/.well-known/security.txt");
  expect(res.status()).toBe(200);
  const body = await res.text();
  expect(body).toContain("Contact: mailto:contact@aireadiness4kids.org");
  const expires = /^Expires: (.+)$/m.exec(body)?.[1];
  expect(expires && new Date(expires).getTime()).toBeGreaterThan(Date.now());
});
