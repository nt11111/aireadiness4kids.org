/**
 * POST /api/progress/precheck: a learner's optional "See what you already know" answers. Scored on
 * the server; the first result is kept so it stays a fair "before" number.
 */
import { z } from "astro/zod";
import { requireLearner, requireUser } from "../../../lib/authz";
import { methodNotAllowed, postRoute } from "../../../lib/api";
import { saveModuleCheck } from "../../../lib/learning";
import { Answers, LearnerId, ModuleId } from "../../../lib/schemas";
export const prerender = false;

const Body = z.object({ learnerId: LearnerId, moduleId: ModuleId, answers: Answers });

export const POST = postRoute({ schema: Body }, async ({ locals }, body) => {
  const { uid } = requireUser(locals);
  const learner = await requireLearner(uid, body.learnerId);
  const { score, outOf } = await saveModuleCheck(uid, learner.id, body.moduleId, "pre", body.answers);
  return { ok: true, score, outOf };
});

export const ALL = methodNotAllowed;
