/**
 * GET /api/progress: the active learner's progress in every module, for the course pages, the
 * module overview, the lesson player, and the home "continue" card. Parents also get their
 * learner profiles for the switcher. Only this account's own data.
 */
import { HttpError, requireUser } from "../../../lib/authz";
import { getRoute, methodNotAllowed } from "../../../lib/api";
import { getProfile } from "../../../lib/accounts";
import { activeLearner, learnerProgress } from "../../../lib/learning";
export const prerender = false;

export const GET = getRoute(async ({ locals, cookies }) => {
  const { uid } = requireUser(locals);
  const profile = await getProfile(uid);
  if (!profile) throw new HttpError(404, "no-profile");
  const { learner, learners } = await activeLearner(uid, cookies);
  return {
    accountType: profile.accountType,
    learner: learner ? { id: learner.id, nickname: learner.nickname } : null,
    learners: profile.accountType === "parent" ? learners.map((l) => ({ id: l.id, nickname: l.nickname })) : [],
    modules: learner ? await learnerProgress(uid, learner.id) : {},
  };
});

export const ALL = methodNotAllowed;
