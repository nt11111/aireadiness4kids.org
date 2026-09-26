/** POST /api/account/learners/delete: remove a child's profile and its data. Only your own (requireLearner). */
import { z } from "astro/zod";
import { requireUser } from "../../../../lib/authz";
import { methodNotAllowed, postRoute } from "../../../../lib/api";
import { deleteLearner } from "../../../../lib/accounts";
export const prerender = false;

const Body = z.object({ learnerId: z.string().max(64) });

export const POST = postRoute({ schema: Body }, async ({ locals }, body) => {
  const { uid } = requireUser(locals);
  await deleteLearner(uid, body.learnerId);
  return { ok: true };
});

export const ALL = methodNotAllowed;
