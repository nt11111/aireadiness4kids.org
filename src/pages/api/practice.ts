/**
 * POST /api/practice: the next reply in a practice tool conversation (src/lib/practice.ts).
 * Learner accounts only, rate limited per person and for the site. Nothing is stored.
 */
import { HttpError, requireUser } from "../../lib/authz";
import { methodNotAllowed, postRoute } from "../../lib/api";
import { canPractice, Conversation, countPracticeMessage, practiceAvailable, practiceReply } from "../../lib/practice";
export const prerender = false;

export const POST = postRoute({ schema: Conversation, maxBytes: 64 * 1024 }, async ({ locals }, conversation) => {
  const { uid } = requireUser(locals);
  if (!(await canPractice(uid))) throw new HttpError(403, "learners-only");
  if (!practiceAvailable()) throw new HttpError(503, "practice-off");
  await countPracticeMessage(uid);
  return { reply: await practiceReply(conversation) };
});

export const ALL = methodNotAllowed;
