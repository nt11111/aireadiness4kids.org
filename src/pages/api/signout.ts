/**
 * POST /api/signout: clear the session cookie and revoke the user's tokens, which also ends
 * sessions on their other devices. No App Check here, so signing out always works.
 */
import { z } from "astro/zod";
import { adminAuth } from "../../lib/firebase-admin";
import { methodNotAllowed, postRoute } from "../../lib/api";
import { clearSessionCookies, SESSION_COOKIE } from "../../lib/session";
export const prerender = false;

export const POST = postRoute({ schema: z.object({}), appCheck: false }, async ({ cookies }) => {
  const value = cookies.get(SESSION_COOKIE)?.value;
  clearSessionCookies(cookies);
  if (value) {
    try {
      const decoded = await adminAuth().verifySessionCookie(value);
      await adminAuth().revokeRefreshTokens(decoded.sub);
    } catch {
      // Already expired or invalid: clearing the cookie is all there is to do.
    }
  }
  return { ok: true };
});

export const ALL = methodNotAllowed;
