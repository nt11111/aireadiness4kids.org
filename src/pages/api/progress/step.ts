/** POST /api/progress/step: mark one lesson step complete for one of your learners (requireLearner). */
import { z } from "astro/zod";
import { requireLearner, requireUser } from "../../../lib/authz";
import { methodNotAllowed, postRoute } from "../../../lib/api";
import { completeSteps } from "../../../lib/learning";
import { LearnerId, ModuleId, StepSlug } from "../../../lib/schemas";
export const prerender = false;

const Body = z.object({ learnerId: LearnerId, moduleId: ModuleId, step: StepSlug });

export const POST = postRoute({ schema: Body }, async ({ locals }, body) => {
  const { uid } = requireUser(locals);
  const learner = await requireLearner(uid, body.learnerId);
  const result = await completeSteps(uid, learner.id, body.moduleId, [body.step]);
  return { ok: true, ...result };
});

export const ALL = methodNotAllowed;
