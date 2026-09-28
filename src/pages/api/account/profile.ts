/** POST /api/account/profile: change your display name (and, for 13+ learners, grade band). */
import { z } from "astro/zod";
import { requireUser } from "../../../lib/authz";
import { methodNotAllowed, postRoute } from "../../../lib/api";
import { Grade, Name, updateProfile } from "../../../lib/accounts";
export const prerender = false;

const Body = z.object({ displayName: Name, gradeBand: Grade.nullable().optional() });

export const POST = postRoute({ schema: Body }, async ({ locals }, body) => {
  const { uid } = requireUser(locals);
  await updateProfile(uid, body);
  return { ok: true };
});

export const ALL = methodNotAllowed;
