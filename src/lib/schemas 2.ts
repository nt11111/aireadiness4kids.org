// Request fields shared by the progress and check routes. Strict formats, so nothing unexpected
// reaches a Firestore path or the stats counters.
import { z } from "astro/zod";
import { MODULE_ID, STEP_SLUG } from "./catalog";

export const ModuleId = z.string().max(80).regex(MODULE_ID);
export const StepSlug = z.string().max(60).regex(STEP_SLUG);
/** Checked properly by requireLearner (format, then ownership). */
export const LearnerId = z.string().max(64);
/** Question id -> chosen option id. Checks have 1 to 5 questions. */
export const Answers = z
  .record(z.string().regex(/^[\w-]{1,40}$/), z.string().regex(/^[\w-]{1,40}$/))
  .refine((a) => Object.keys(a).length >= 1 && Object.keys(a).length <= 5, { message: "1 to 5 answers" });
/** The browser's random anonymous id for workshop checks (crypto.randomUUID()). */
export const AnonSid = z.string().regex(/^[A-Za-z0-9-]{16,64}$/);
