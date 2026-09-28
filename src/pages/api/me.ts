/**
 * GET /api/me: who's signed in, for the site header. A first name, the account type, and (for
 * parents) the learner nicknames for the profile switcher. Never an email.
 */
import { getRoute, methodNotAllowed } from "../../lib/api";
import { getProfile } from "../../lib/accounts";
import { activeLearner } from "../../lib/learning";
export const prerender = false;

export const GET = getRoute(async ({ locals, cookies }) => {
  if (!locals.user) return { signedIn: false };
  const profile = await getProfile(locals.user.uid);
  if (!profile) return { signedIn: false };
  const parent = profile.accountType === "parent";
  const { learner, learners } = parent ? await activeLearner(locals.user.uid, cookies) : { learner: null, learners: [] };
  return {
    signedIn: true,
    displayName: profile.displayName,
    accountType: profile.accountType,
    role: locals.user.role,
    ...(parent ? { learnerId: learner?.id ?? null, learners: learners.map((l) => ({ id: l.id, nickname: l.nickname })) } : {}),
  };
});

export const ALL = methodNotAllowed;
