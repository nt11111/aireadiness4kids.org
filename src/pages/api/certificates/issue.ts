/**
 * POST /api/certificates/issue: the certificate for a module one of your learners has finished
 * (requireLearner). Issuing again returns the same certificate.
 */
import { z } from "astro/zod";
import { requireUser } from "../../../lib/authz";
import { methodNotAllowed, postRoute } from "../../../lib/api";
import { issueCertificate } from "../../../lib/certificates";
import { LearnerId, ModuleId } from "../../../lib/schemas";
export const prerender = false;

const Body = z.object({ learnerId: LearnerId, moduleId: ModuleId });

export const POST = postRoute({ schema: Body }, async ({ locals }, body) => {
  const { uid } = requireUser(locals);
  const cert = await issueCertificate(uid, body.learnerId, body.moduleId);
  return { ok: true, id: cert.id, public: cert.public, issued: cert.issued };
});

export const ALL = methodNotAllowed;
