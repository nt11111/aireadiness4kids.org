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

const question = z
  .object({
    id: z.string().min(1),
    prompt: z.string().min(1),
    options: z.array(z.object({ id: z.string().min(1), text: z.string().min(1) })).min(2),
    answer: z.string().min(1),
    explanation: z.string().optional(),
  })
  .refine((q) => q.options.some((o) => o.id === q.answer), { message: "answer must match one of the option ids" });

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
      pre_check: z.array(question).default([]),
      post_check: z.array(question).default([]),
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

// The steps collection arrives with the first lesson steps (Phase 2); an empty glob only produces a build warning.
export const collections = { tracks, modules };
