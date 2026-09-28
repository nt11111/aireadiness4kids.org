/**
 * GET /api/me: who's signed in, for the site header on static pages (src/lib/me.ts).
 */
import { getRoute, methodNotAllowed } from "../../lib/api";
import { headerMe } from "../../lib/me";
export const prerender = false;

export const GET = getRoute(async ({ locals, cookies }) => {
  const me = await headerMe(locals.user, cookies);
  return me ? { signedIn: true, ...me } : { signedIn: false };
});

export const ALL = methodNotAllowed;
