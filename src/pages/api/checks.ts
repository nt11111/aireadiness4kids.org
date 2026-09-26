/**
 * POST /api/checks: a workshop knowledge check from /check/[module]/[phase] (brief section 8.6).
 * Open to everyone (no sign-in), so it's the one route that needs more than the usual guards:
 * App Check, zod, server-side scoring, and rate limits per IP and per anonymous browser id.
 * A signed-in learner's result is linked to them straight away; an anonymous one is linked later
 * if that browser signs up (/api/progress/merge).
 */
import { z } from "astro/zod";
import type { APIContext } from "astro";
import { methodNotAllowed, postRoute } from "../../lib/api";
import { usingEmulators } from "../../lib/firebase-admin";
import { Grade, Src } from "../../lib/accounts";
import { activeLearner } from "../../lib/learning";
import { submitCheck } from "../../lib/checks";
import { rateLimit } from "../../lib/rate-limit";
import { AnonSid, Answers, ModuleId } from "../../lib/schemas";
export const prerender = false;

const Body = z.object({
  moduleId: ModuleId,
  phase: z.enum(["pre", "post"]),
  answers: Answers,
  anonSid: AnonSid,
  src: Src.optional(),
  gradeBand: Grade.optional(),
});

// A classroom shares one school IP, so the IP limit leaves room for two full classes doing a pre
// and a post check; one browser gets a dozen tries.
const PER_IP = { limit: 120, windowSeconds: 10 * 60 };
const PER_BROWSER = { limit: 12, windowSeconds: 10 * 60 };

function clientIp(context: APIContext) {
  // Test runs only (the emulators): each test gets its own "IP", so parallel tests don't share a limit.
  if (usingEmulators()) return context.request.headers.get("x-ark-test-ip") ?? "127.0.0.1";
  try {
    return context.clientAddress;
  } catch {
    return "unknown";
  }
}

export const POST = postRoute({ schema: Body }, async (context, body) => {
  await rateLimit([
    { key: `checks:ip:${clientIp(context)}`, ...PER_IP },
    { key: `checks:sid:${body.anonSid}`, ...PER_BROWSER },
  ]);
  let who = null;
  if (context.locals.user) {
    const { learner } = await activeLearner(context.locals.user.uid, context.cookies);
    if (learner) who = { uid: context.locals.user.uid, learnerId: learner.id, gradeBand: learner.gradeBand };
  }
  const result = await submitCheck(body, who);
  return { ok: true, score: result.score, outOf: result.outOf, duplicate: result.duplicate };
});

export const ALL = methodNotAllowed;
