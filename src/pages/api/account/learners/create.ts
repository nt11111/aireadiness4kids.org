/** POST /api/account/learners/create: a parent adds a child's profile (nickname and grade band only). */
import { z } from "astro/zod";
import { requireUser } from "../../../../lib/authz";
import { methodNotAllowed, postRoute } from "../../../../lib/api";
import { addLearner, Grade, Name } from "../../../../lib/accounts";
export const prerender = false;

const Body = z.object({ nickname: Name, gradeBand: Grade });

export const POST = postRoute({ schema: Body }, async ({ locals }, body) => {
  const { uid } = requireUser(locals);
  return { ok: true, learner: await addLearner(uid, body) };
});

export const ALL = methodNotAllowed;
