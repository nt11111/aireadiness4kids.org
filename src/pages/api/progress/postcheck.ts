/**
 * POST /api/progress/postcheck: the optional check on the completion page (the same questions as the
 * pre-check). Scored on the server; the first result is kept, so "before" and "after" stay fair.
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
  const { score, outOf } = await saveModuleCheck(uid, learner.id, body.moduleId, "post", body.answers);
  return { ok: true, score, outOf };
});

export const ALL = methodNotAllowed;
