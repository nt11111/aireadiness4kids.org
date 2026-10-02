// Every page touched so far. Add new routes here as phases land.
// Module pages mirror src/content/modules/<track>/<slug>/ (checked by a test in a11y.spec.ts).
export const MODULES = [
  "aware/what-is-ai",
  "aware/ai-helpers",
  "aware/smart-ai-user",
  "aware/kindness-feelings-and-ai",
  "aware/my-digital-footprint",
  "literate/how-ai-actually-works",
  "literate/bias-in-ai",
  "literate/ai-and-schoolwork",
  "literate/deepfakes-and-misinformation",
  "literate/privacy-and-your-data",
  "literate/ethical-dilemmas-in-ai",
  "fluent/ai-landscape-today",
  "fluent/ai-ethics-and-the-rules",
  "fluent/algorithmic-bias-and-justice",
  "fluent/ai-and-the-future-of-work",
  "fluent/building-responsibly",
  "fluent/advocacy-and-action",
];

// The sample module's lesson steps, in order (src/content/modules/literate/bias-in-ai/NN-*.mdx).
export const BIAS_MODULE = "/courses/literate/bias-in-ai";
export const BIAS_STEPS = ["what-is-bias", "where-it-comes-from", "scenario-hiring-bot", "check", "reflect", "recap"];

/**
 * auth: sign in as this kind of account first (steps 2+ and account pages need a session).
 * progress: give that account saved progress first (3 steps, or all of them, and the pre-check of
 * Bias in AI; parents get two learner profiles, the first with that progress). See support/routes.ts.
 */
export type Route = {
  name: string;
  path: string;
  lesson?: boolean;
  auth?: "learner" | "parent" | "facilitator" | "admin";
  /** "complete": every step of Bias in AI done. A path with "{cert}" gets a certificate issued for it. */
  progress?: true | "complete";
  /** Set up the account (and certificate), but look at the page signed out. */
  signedOut?: boolean;
};

export const ROUTES: Route[] = [
  { name: "home", path: "/" },
  { name: "courses", path: "/courses" },
  { name: "course-aware", path: "/courses/aware" },
  { name: "course-literate", path: "/courses/literate" },
  { name: "course-fluent", path: "/courses/fluent" },
  ...MODULES.map((m) => ({ name: `module-${m.replace("/", "-")}`, path: `/courses/${m}` })),
  ...BIAS_STEPS.map((s, i): Route => ({ name: `step-${s}`, path: `${BIAS_MODULE}/${s}`, lesson: true, ...(i > 0 ? { auth: "learner" } : {}) })),
  ...["1", "2", "3"].map((n) => ({ name: `dev-aware-preview-${n}`, path: `/dev/lesson-preview/${n}`, lesson: true })),
  { name: "educators", path: "/educators" },
  { name: "educators-guide-bias-in-ai", path: "/educators/literate/bias-in-ai" },
  { name: "signin", path: "/signin" },
  { name: "signup", path: "/signup" },
  { name: "reset-password", path: "/reset-password" },
  { name: "auth-callback-invalid", path: "/auth/callback" },
  { name: "account-deleted", path: "/account-deleted" },
  { name: "account-learner", path: "/account", auth: "learner" },
  { name: "account-parent", path: "/account", auth: "parent" },
  { name: "add-first-learner", path: "/account/add-learner?next=%2Fcourses%2Fliterate%2Fbias-in-ai%2Fwhere-it-comes-from", auth: "parent" },
  { name: "my-learning-empty", path: "/my-learning", auth: "learner" },
  { name: "my-learning-progress", path: "/my-learning", auth: "learner", progress: true },
  { name: "my-learning-parent-progress", path: "/my-learning", auth: "parent", progress: true },
  { name: "home-continue", path: "/", auth: "learner", progress: true },
  { name: "course-literate-progress", path: "/courses/literate", auth: "learner", progress: true },
  { name: "module-bias-in-ai-progress", path: BIAS_MODULE, auth: "learner", progress: true },
  { name: "check-bias-in-ai-pre", path: "/check/bias-in-ai/pre" },
  { name: "check-bias-in-ai-post", path: "/check/bias-in-ai/post?src=test-workshop" },
  { name: "complete-not-yet", path: `${BIAS_MODULE}/complete`, auth: "learner", progress: true },
  { name: "complete-learner", path: `${BIAS_MODULE}/complete`, auth: "learner", progress: "complete" },
  { name: "complete-parent", path: `${BIAS_MODULE}/complete`, auth: "parent", progress: "complete" },
  { name: "certificate-learner", path: "/certificates/{cert}", auth: "learner", progress: "complete" },
  { name: "certificate-child", path: "/certificates/{cert}", auth: "parent", progress: "complete" },
  { name: "verify", path: "/verify/{cert}", auth: "learner", progress: "complete", signedOut: true },
  { name: "verify-not-found", path: "/verify/AAAAAAAAAAAAAAAAAAAAAA" },
  { name: "admin", path: "/admin", auth: "admin" },
  { name: "admin-filtered", path: "/admin?source=_none&from=2026-01-01", auth: "admin" },
  { name: "present-index", path: "/present", auth: "facilitator" },
  { name: "present-check-slide", path: "/present/literate/bias-in-ai?src=test-workshop#slide-5", auth: "facilitator" },
  { name: "forbidden", path: "/admin", auth: "learner" },
  { name: "present", path: "/present/literate/bias-in-ai", auth: "facilitator" },
  { name: "about", path: "/about" },
  { name: "get-involved", path: "/get-involved" },
  { name: "donate", path: "/donate" },
  { name: "contact", path: "/contact" },
  { name: "workshops", path: "/workshops" },
  { name: "privacy", path: "/privacy" },
  { name: "terms", path: "/terms" },
  { name: "accessibility", path: "/accessibility" },
  { name: "dev-components", path: "/dev/components" },
  { name: "404", path: "/this-page-does-not-exist" },
];
