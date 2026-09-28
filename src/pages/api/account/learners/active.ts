/** POST /api/account/learners/active: a parent switches which child's profile this browser is learning as. Only your own (requireLearner). */
import { z } from "astro/zod";
import { requireLearner, requireUser } from "../../../../lib/authz";
import { methodNotAllowed, postRoute } from "../../../../lib/api";
import { setActiveLearnerCookie } from "../../../../lib/learning";
import { LearnerId } from "../../../../lib/schemas";
export const prerender = false;

const Body = z.object({ learnerId: LearnerId });

export const POST = postRoute({ schema: Body }, async ({ locals, cookies }, body) => {
  const { uid } = requireUser(locals);
  const learner = await requireLearner(uid, body.learnerId);
  setActiveLearnerCookie(cookies, learner.id);
  return { ok: true, learner: { id: learner.id, nickname: learner.nickname } };
});

export const ALL = methodNotAllowed;
