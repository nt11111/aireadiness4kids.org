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

export const ROUTES = [
  { name: "home", path: "/" },
  { name: "courses", path: "/courses" },
  { name: "course-explorers", path: "/courses/explorers" },
  { name: "course-investigators", path: "/courses/investigators" },
  { name: "course-architects", path: "/courses/architects" },
  ...MODULES.map((m) => ({ name: `module-${m.replace("/", "-")}`, path: `/courses/${m}` })),
  { name: "about", path: "/about" },
  { name: "get-involved", path: "/get-involved" },
  { name: "donate", path: "/donate" },
  { name: "contact", path: "/contact" },
  { name: "programs", path: "/programs" },
  { name: "dev-components", path: "/dev/components" },
  { name: "404", path: "/this-page-does-not-exist" },
];
