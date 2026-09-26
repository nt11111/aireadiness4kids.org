// Every page touched so far. Add new routes here as phases land.
// Module pages mirror src/content/modules/<track>/<slug>/ (checked by a test in a11y.spec.ts).
export const MODULES = [
  "explorers/what-is-ai",
  "explorers/ai-helpers",
  "explorers/smart-ai-user",
  "explorers/kindness-feelings-and-ai",
  "explorers/my-digital-footprint",
  "investigators/how-ai-actually-works",
  "investigators/bias-in-ai",
  "investigators/ai-and-schoolwork",
  "investigators/deepfakes-and-misinformation",
  "investigators/privacy-and-your-data",
  "investigators/ethical-dilemmas-in-ai",
  "architects/ai-landscape-today",
  "architects/ai-ethics-and-the-rules",
  "architects/algorithmic-bias-and-justice",
  "architects/ai-and-the-future-of-work",
  "architects/building-responsibly",
  "architects/advocacy-and-action",
];

// The sample module's lesson steps, in order (src/content/modules/investigators/bias-in-ai/NN-*.mdx).
export const BIAS_MODULE = "/courses/investigators/bias-in-ai";
export const BIAS_STEPS = ["what-is-bias", "where-it-comes-from", "scenario-hiring-bot", "check", "reflect", "recap"];

/**
 * auth: sign in as this kind of account first (steps 2+ and account pages need a session).
 * progress: give that account saved progress first (3 steps and the pre-check of Bias in AI; parents
 * get two learner profiles, the first with that progress).
 */
export type Route = { name: string; path: string; lesson?: boolean; auth?: "learner" | "parent" | "facilitator" | "admin"; progress?: boolean };

export const ROUTES: Route[] = [
  { name: "home", path: "/" },
  { name: "courses", path: "/courses" },
  { name: "course-explorers", path: "/courses/explorers" },
  { name: "course-investigators", path: "/courses/investigators" },
  { name: "course-architects", path: "/courses/architects" },
  ...MODULES.map((m) => ({ name: `module-${m.replace("/", "-")}`, path: `/courses/${m}` })),
  ...BIAS_STEPS.map((s, i): Route => ({ name: `step-${s}`, path: `${BIAS_MODULE}/${s}`, lesson: true, ...(i > 0 ? { auth: "learner" } : {}) })),
  ...["1", "2", "3"].map((n) => ({ name: `dev-explorers-preview-${n}`, path: `/dev/lesson-preview/${n}`, lesson: true })),
  { name: "dev-guide-bias-in-ai", path: "/dev/guides/investigators/bias-in-ai" },
  { name: "signin", path: "/signin" },
  { name: "signup", path: "/signup" },
  { name: "reset-password", path: "/reset-password" },
  { name: "auth-callback-invalid", path: "/auth/callback" },
  { name: "account-deleted", path: "/account-deleted" },
  { name: "account-learner", path: "/account", auth: "learner" },
  { name: "account-parent", path: "/account", auth: "parent" },
  { name: "add-first-learner", path: "/account/add-learner?next=%2Fcourses%2Finvestigators%2Fbias-in-ai%2Fwhere-it-comes-from", auth: "parent" },
  { name: "my-learning-empty", path: "/my-learning", auth: "learner" },
  { name: "my-learning-progress", path: "/my-learning", auth: "learner", progress: true },
  { name: "my-learning-parent-progress", path: "/my-learning", auth: "parent", progress: true },
  { name: "home-continue", path: "/", auth: "learner", progress: true },
  { name: "course-investigators-progress", path: "/courses/investigators", auth: "learner", progress: true },
  { name: "module-bias-in-ai-progress", path: BIAS_MODULE, auth: "learner", progress: true },
  { name: "check-bias-in-ai-pre", path: "/check/bias-in-ai/pre" },
  { name: "check-bias-in-ai-post", path: "/check/bias-in-ai/post?src=test-workshop" },
  { name: "admin", path: "/admin", auth: "admin" },
  { name: "forbidden", path: "/admin", auth: "learner" },
  { name: "present", path: "/present/investigators/bias-in-ai", auth: "facilitator" },
  { name: "about", path: "/about" },
  { name: "get-involved", path: "/get-involved" },
  { name: "donate", path: "/donate" },
  { name: "contact", path: "/contact" },
  { name: "programs", path: "/programs" },
  { name: "dev-components", path: "/dev/components" },
  { name: "404", path: "/this-page-does-not-exist" },
];
