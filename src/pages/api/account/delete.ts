/**
 * POST /api/account/delete: delete the account and its data (brief section 7). Needs the typed
 * confirmation and a sign-in within the last 15 minutes, so a session left open on a shared computer
 * can't be used to wipe someone's account.
 */
import { z } from "astro/zod";
import { HttpError, requireUser } from "../../../lib/authz";
import { methodNotAllowed, postRoute } from "../../../lib/api";
import { deleteAccount } from "../../../lib/accounts";
import { clearSessionCookies } from "../../../lib/session";
export const prerender = false;

const RECENT_SIGN_IN_SECONDS = 15 * 60;
const Body = z.object({ confirm: z.literal("DELETE") });

export const POST = postRoute({ schema: Body }, async ({ locals, cookies }) => {
  const user = requireUser(locals);
  if (Date.now() / 1000 - user.authTime > RECENT_SIGN_IN_SECONDS) throw new HttpError(401, "recent-sign-in-required");
  await deleteAccount(user.uid);
  clearSessionCookies(cookies);
  return { ok: true };
});

export const ALL = methodNotAllowed;
