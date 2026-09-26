/**
 * POST /api/session: trade a fresh Firebase ID token for an httpOnly session cookie (brief section 8.1).
 * The browser signs out of the Firebase SDK right after, so the session lives only in the cookie.
 */
import { z } from "astro/zod";
import { adminAuth } from "../../lib/firebase-admin";
import { HttpError } from "../../lib/authz";
import { json, methodNotAllowed, postRoute } from "../../lib/api";
import { createProfile, getProfile, Signup, Src } from "../../lib/accounts";
import { SESSION_MS, setSessionCookies } from "../../lib/session";
export const prerender = false;

const RECENT_SIGN_IN_SECONDS = 5 * 60;
/** A Google sign-in with no ARK profile is removed if it's this new: someone signed in without signing up. */
const ORPHAN_WINDOW_MS = 15 * 60 * 1000;

const Body = z.object({
  idToken: z.string().min(20).max(4096),
  // Only on sign-up: the answers from the age screen and the sign-up form.
  signup: Signup.optional(),
  src: Src.optional(),
});

export const POST = postRoute({ schema: Body }, async ({ cookies }, body) => {
  let decoded;
  try {
    decoded = await adminAuth().verifyIdToken(body.idToken, true);
  } catch {
    throw new HttpError(401, "invalid-token");
  }
  // A token minted long ago (say, a stolen one) can't be turned into a new session.
  if (Date.now() / 1000 - decoded.auth_time > RECENT_SIGN_IN_SECONDS) throw new HttpError(401, "recent-sign-in-required");

  const provider = decoded.firebase?.sign_in_provider ?? "";
  if (!(await getProfile(decoded.uid))) {
    if (!body.signup) {
      // Signing in without an ARK account. For Google, Firebase has just created a sign-in record;
      // remove it so no email is kept for someone who hasn't gone through the age screen.
      if (provider === "google.com") {
        const user = await adminAuth().getUser(decoded.uid);
        if (Date.now() - new Date(user.metadata.creationTime).getTime() < ORPHAN_WINDOW_MS) await adminAuth().deleteUser(decoded.uid);
      }
      throw new HttpError(404, "no-account");
    }
    await createProfile(decoded.uid, body.signup, body.src);
  }

  // Email accounts must verify their address first (brief section 8.1). No cookie until then.
  if (provider === "password" && !decoded.email_verified) return json(403, { error: "verify-email" });

  const sessionCookie = await adminAuth().createSessionCookie(body.idToken, { expiresIn: SESSION_MS });
  setSessionCookies(cookies, sessionCookie);
  return { ok: true, accountType: (await getProfile(decoded.uid))?.accountType };
});

export const ALL = methodNotAllowed;
