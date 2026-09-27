/**
 * /sitemap.xml: every public page, built with the site. Course, module, and first-step pages come
 * from the content collections, so a new module appears here without editing this file.
 * Signed-in pages, the workshop checks (for people in the room), and /dev are left out.
 */
import type { APIRoute } from "astro";
import { getCourses, getModuleSteps, moduleHref, moduleSlug, trackHref } from "../lib/courses";
import { getCollection } from "astro:content";
export const prerender = true;

const PAGES = ["/", "/courses", "/educators", "/workshops", "/about", "/get-involved", "/donate", "/contact", "/privacy", "/terms", "/accessibility", "/signup", "/signin"];

export const GET: APIRoute = async ({ site }) => {
  const [courses, guides] = await Promise.all([getCourses(), getCollection("guides")]);
  const guideIds = new Set(guides.map((g) => g.id));
  // Static pages are served with a trailing slash on Netlify (without one they redirect); lesson
  // steps are server-rendered and answer without it. List the address that answers 200 directly.
  const paths = PAGES.map((p) => (p === "/" ? p : `${p}/`));
  for (const course of courses) {
    paths.push(`${trackHref(course.track)}/`);
    for (const m of course.modules) {
      paths.push(`${moduleHref(m)}/`);
      const first = getModuleSteps(course, m)[0];
      if (first) paths.push(first.href); // step 1 is open to everyone; later steps need an account
      if (guideIds.has(m.id)) paths.push(`/educators/${course.track.id}/${moduleSlug(m)}/`);
    }
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map((p) => `  <url><loc>${new URL(p, site).href}</loc></url>`).join("\n")}\n</urlset>\n`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
