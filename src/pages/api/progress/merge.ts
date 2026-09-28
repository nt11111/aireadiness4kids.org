/**
 * POST /api/progress/merge: after sign-up (or sign-in) on a browser that was used as a guest, bring
 * its step-1 progress, pre-check answers, and anonymous workshop checks into one of your learners
 * (brief section 8.5). The browser clears its guest key once this succeeds.
 */
import { z } from "astro/zod";
import { requireLearner, requireUser } from "../../../lib/authz";
import { methodNotAllowed, postRoute } from "../../../lib/api";
import { mergeGuest } from "../../../lib/learning";
import { AnonSid, Answers, LearnerId, ModuleId, StepSlug } from "../../../lib/schemas";
export const prerender = false;

const MAX_MODULES = 20;
const few = <T extends z.ZodType>(schema: T) => z.record(ModuleId, schema).refine((r) => Object.keys(r).length <= MAX_MODULES, { message: "too many modules" });

const Body = z.object({
  learnerId: LearnerId,
  steps: few(z.array(StepSlug).min(1).max(10)).default({}),
  pre: few(Answers).default({}),
  anonSid: AnonSid.optional(),
});

export const POST = postRoute({ schema: Body }, async ({ locals }, body) => {
  const { uid } = requireUser(locals);
  const learner = await requireLearner(uid, body.learnerId);
  const merged = await mergeGuest(uid, learner, { steps: body.steps, pre: body.pre, anonSid: body.anonSid });
  return { ok: true, merged };
});

export const ALL = methodNotAllowed;
