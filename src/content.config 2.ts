// Content model (brief section 5). Every file under src/content is validated at build time;
// a volunteer adds a module by copying a folder in src/content/modules/<track>/.
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

export const TRACK_IDS = ["explorers", "investigators", "architects"] as const;
export const STEP_TYPES = ["explainer", "video", "scenario", "check", "reflect", "recap", "activity"] as const;
export const REVIEW_STATUSES = ["draft", "in-review", "reviewed"] as const;

const tracks = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/tracks" }),
  schema: z.object({
    title: z.string().min(1),
    grades: z.string().regex(/^(K|\d{1,2})-\d{1,2}$/, 'Use a grade range like "K-5" or "9-12"'),
    color: z.enum(["track-explorers", "track-investigators", "track-architects"]),
    tagline: z.string().min(1),
    summary: z.string().min(1),
    order: z.number().int().positive(),
    // "What you'll learn" on the course page (brief section 7: 4-6 bullets).
    outcomes: z.array(z.string().min(1)).min(4).max(6),
    slides_folder_url: z.url().optional(),
  }),
});

const unique = (ids: string[]) => new Set(ids).size === ids.length;

// A multiple-choice or true/false question (for true/false, list "True" and "False" as the options).
const question = z
  .object({
    id: z.string().min(1),
    prompt: z.string().min(1),
    options: z.array(z.object({ id: z.string().min(1), text: z.string().min(1) })).min(2).max(5),
    answer: z.string().min(1),
    // Shown after the learner checks their answer, right or wrong. Explain why; never scold.
    explanation: z.string().min(1),
  })
  .refine((q) => q.options.some((o) => o.id === q.answer), { message: "answer must match one of the option ids" })
  .refine((q) => unique(q.options.map((o) => o.id)), { message: "option ids must be unique" });

// <Scenario>: "What would you do?" Every option gets its own feedback; none is "wrong" (brief section 6).
const scenario = z
  .object({
    prompt: z.string().min(1),
    options: z.array(z.object({ id: z.string().min(1), text: z.string().min(1), feedback: z.string().min(1) })).min(2).max(5),
  })
  .refine((s) => unique(s.options.map((o) => o.id)), { message: "option ids must be unique" });

// <Sort>: put each item in the right bucket. Works by tapping or keyboard; dragging is optional.
const sort = z
  .object({
    prompt: z.string().min(1),
    buckets: z.array(z.object({ id: z.string().min(1), label: z.string().min(1) })).min(2).max(4),
    items: z.array(z.object({ id: z.string().min(1), text: z.string().min(1), bucket: z.string().min(1), why: z.string().min(1) })).min(2).max(10),
  })
  .refine((s) => s.items.every((i) => s.buckets.some((b) => b.id === i.bucket)), { message: "every item's bucket must match a bucket id" })
  .refine((s) => unique(s.items.map((i) => i.id)) && unique(s.buckets.map((b) => b.id)), { message: "item and bucket ids must be unique" });

const modules = defineCollection({
  // Entry id is "<track>/<module-slug>", taken from the folder path.
  loader: glob({
    pattern: "*/*/index.mdx",
    base: "./src/content/modules",
    generateId: ({ entry }) => entry.replace(/\/index\.mdx$/, ""),
  }),
  schema: z
    .object({
      title: z.string().min(1),
      track: z.enum(TRACK_IDS),
      order: z.number().int().positive(),
      // Leave unset until the module has been piloted; pages then show the templates' 60-90 minute range.
      duration_minutes: z.number().int().positive().optional(),
      summary: z.string().min(1).max(280),
      // Key topics from docs/source/RA4K_Curriculum_Templates.docx.
      topics: z.array(z.string().min(1)).min(1),
      objectives: z.array(z.string().min(1)).default([]),
      vocabulary: z.array(z.object({ term: z.string().min(1), def: z.string().min(1) })).default([]),
      status: z.enum(REVIEW_STATUSES),
      reviewers: z.array(z.object({ name: z.string().min(1), credentials: z.string().optional() })).default([]),
      slides_url: z.union([z.url(), z.literal("")]).default(""),
      // Optional "See what you already know" check on the module page, repeated after the module (brief section 7).
      pre_check: z.array(question).max(5).default([]),
      post_check: z.array(question).max(5).default([]),
    })
    .superRefine((m, ctx) => {
      if (m.status === "reviewed" && m.reviewers.length === 0) {
        ctx.addIssue({ code: "custom", path: ["reviewers"], message: 'A module marked "reviewed" must list its reviewers' });
      }
      if (m.objectives.length > 0 && (m.objectives.length < 3 || m.objectives.length > 5)) {
        ctx.addIssue({ code: "custom", path: ["objectives"], message: "Use 3 to 5 measurable objectives" });
      }
      const ids = (qs: { id: string }[]) => qs.map((q) => q.id).sort().join("|");
      if (m.pre_check.length > 0 && m.post_check.length > 0 && ids(m.pre_check) !== ids(m.post_check)) {
        ctx.addIssue({ code: "custom", path: ["post_check"], message: "post_check must use the same question ids as pre_check" });
      }
    }),
});

// Lesson steps: src/content/modules/<track>/<module>/NN-step-slug.mdx. The two-digit prefix sets the
// order; the URL is the slug without it (/courses/<track>/<module>/<step-slug>).
const steps = defineCollection({
  loader: glob({
    pattern: "*/*/[0-9][0-9]-*.mdx",
    base: "./src/content/modules",
    generateId: ({ entry }) => entry.replace(/\.mdx$/, ""),
  }),
  schema: z
    .object({
      title: z.string().min(1),
      type: z.enum(STEP_TYPES),
      // Brief section 4: steps are 3 to 10 minutes.
      minutes: z.number().int().min(1).max(15),
      questions: z.array(question).max(5).default([]),
      scenario: scenario.optional(),
      sort: sort.optional(),
    })
    .superRefine((s, ctx) => {
      if (s.type === "check" && s.questions.length === 0) ctx.addIssue({ code: "custom", path: ["questions"], message: "A check step needs 1 to 5 questions" });
      if (s.type === "scenario" && !s.scenario) ctx.addIssue({ code: "custom", path: ["scenario"], message: "A scenario step needs a scenario" });
      if (!unique(s.questions.map((q) => q.id))) ctx.addIssue({ code: "custom", path: ["questions"], message: "question ids must be unique" });
    }),
});

// Facilitator guide for a module: src/content/modules/<track>/<module>/guide.mdx (rendered on /educators in Phase 5).
const guides = defineCollection({
  loader: glob({
    pattern: "*/*/guide.mdx",
    base: "./src/content/modules",
    generateId: ({ entry }) => entry.replace(/\/guide\.mdx$/, ""),
  }),
  schema: z.object({
    title: z.string().min(1),
    status: z.enum(REVIEW_STATUSES),
    // Classroom time for the whole lesson plan.
    duration_minutes: z.number().int().positive(),
    materials: z.array(z.string().min(1)).default([]),
  }),
});

export const collections = { tracks, modules, steps, guides };
