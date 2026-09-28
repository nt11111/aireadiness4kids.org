/**
 * /robots.txt. Server-rendered so it can tell hosts apart: on aireadiness4kids.org it lists the
 * sitemap and keeps crawlers out of account pages; on every other host (Netlify branch deploys,
 * Deploy Previews, *.netlify.app, local test builds) it asks crawlers to stay out entirely, so a
 * public preview never competes with the real site in search results.
 */
import type { APIRoute } from "astro";
export const prerender = false;

const PRODUCTION_HOSTS = new Set(["aireadiness4kids.org", "www.aireadiness4kids.org"]);

// Signed-in and API routes. They already redirect or refuse signed-out visitors; this just saves crawlers the trip.
const PRIVATE = ["/api/", "/account", "/my-learning", "/admin", "/present", "/certificates/", "/auth/", "/dev/", "/forbidden"];

export const GET: APIRoute = ({ url, site }) => {
  const body = PRODUCTION_HOSTS.has(url.hostname)
    ? ["User-agent: *", ...PRIVATE.map((p) => `Disallow: ${p}`), "", `Sitemap: ${new URL("/sitemap.xml", site)}`, ""].join("\n")
    : "# Preview deploy: not for search engines. The real site is https://aireadiness4kids.org\nUser-agent: *\nDisallow: /\n";
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
};
