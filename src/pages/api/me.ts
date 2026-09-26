/** GET /api/me: who's signed in, for the site header. Only a first name and account type, never an email. */
import { getRoute, methodNotAllowed } from "../../lib/api";
import { getProfile } from "../../lib/accounts";
export const prerender = false;

export const GET = getRoute(async ({ locals }) => {
  if (!locals.user) return { signedIn: false };
  const profile = await getProfile(locals.user.uid);
  if (!profile) return { signedIn: false };
  return { signedIn: true, displayName: profile.displayName, accountType: profile.accountType, role: locals.user.role };
});

export const ALL = methodNotAllowed;
