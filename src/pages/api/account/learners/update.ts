/** POST /api/account/learners/update: rename a learner profile or change its grade band. Only your own (requireLearner). */
import { z } from "astro/zod";
import { requireUser } from "../../../../lib/authz";
import { methodNotAllowed, postRoute } from "../../../../lib/api";
import { Grade, Name, updateLearner } from "../../../../lib/accounts";
export const prerender = false;

const Body = z.object({ learnerId: z.string().max(64), nickname: Name, gradeBand: Grade });

export const POST = postRoute({ schema: Body }, async ({ locals }, body) => {
  const { uid } = requireUser(locals);
  await updateLearner(uid, body.learnerId, body);
  return { ok: true };
});

export const ALL = methodNotAllowed;
