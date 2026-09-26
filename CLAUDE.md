# ARK website (aireadiness4kids.org)

This repo is being rebuilt from a marketing site into ARK's free course platform. The full spec is **`docs/ARK_UI_BUILD_BRIEF.md`**. Read it before starting any phase. The phase prompts are in `docs/ARK_Claude_Code_Prompts.md`.

## Current state
- `main` is the live site: React 18 + Vite + Tailwind v4 + shadcn/Radix (Figma Make export), with React Router.
- `platform-v1` (Phases 0 to 3 done): Astro 7 + React islands + MDX + Tailwind v4, `output: 'server'` with the Netlify adapter. Pages without a session set `prerender = true`; lesson steps, `/account`, `/my-learning`, `/admin`, `/present/*`, `/forbidden`, and `/api/*` are server-rendered.
- Course content lives in content collections (`src/content.config.ts`, zod-validated): `src/content/tracks/*.md` and `src/content/modules/<track>/<slug>/index.mdx` (17 stubs, all `status: draft`). `src/lib/courses.ts` loads and orders them. Course pages are `src/pages/courses/`; their Astro components are in `src/components/`. Reviewer names come from module frontmatter; partner logos and impact numbers come from `src/data/*.json` (see `src/data/README.md`), and those home-page sections stay hidden while empty.
- Lesson steps are `NN-slug.mdx` files beside a module's `index.mdx` (steps collection); `guide.mdx` is the facilitator guide. The player is `src/pages/courses/[track]/[module]/[step].astro` with `src/components/lesson/LessonPlayer.astro`, using Astro View Transitions (`<ClientRouter />`) so the outline and in-memory progress (`src/app/lesson/progress.ts`) carry between steps. MDX lesson components are in `src/components/lesson/` (Astro wrappers) and `src/app/components/lesson/` (React islands); `<Check />`, `<Scenario />`, `<Sort />` read the step's frontmatter and `<Vocab />` the module's vocabulary via `Astro.locals.lesson`. Sample module: Investigators > Bias in AI. `/dev/components#lesson`, `/dev/lesson-preview/1` (Explorers variant), and `/dev/guides/...` are noindex previews.
- Accounts (Phase 3, setup in `docs/SETUP_FIREBASE.md`): the browser signs in with the Firebase SDK (in-memory), `/api/session` swaps the ID token for the httpOnly `__session` cookie, and `src/middleware.ts` verifies it and gates routes (`src/lib/gate.ts`). API routes use `postRoute`/`getRoute` from `src/lib/api.ts` (POST + Origin check, App Check, zod) and `src/lib/authz.ts`; Firestore is only touched through `src/lib/firebase-admin.ts` and `src/lib/accounts.ts`. Security headers come from `src/lib/security/policy.mjs`: scripts are allowed by hash, so any new inline script must go in `src/lib/security/inline-scripts.mjs` (the build fails otherwise).
- Routes are `.astro` files in `src/pages/`; page sections in `src/app/sections/`; shared components in `src/app/components/site/` and shadcn primitives in `src/app/components/ui/`. Copy lives in `src/app/lib/content.ts`, tokens in `src/styles/theme.css`, brand assets in `public/brand/`. Style guide: `/dev/components` (noindex, unlinked).
- Commands: `npm run dev` (port 5180), `npm run build` (production; also checks alt text, links, inline scripts vs the CSP, and bundle secrets), `npm run check:contrast`, `npm run check`. Tests run on the Firebase emulators (project `demo-ark`, never production) and need the Firebase CLI and Java 21+: `npm test`, `npm run test:security`, `npm run test:visual`, `npm run test:a11y`. `npm run build:test` + `npm run emulators` + `npm run preview` runs the site locally with sign-in.
- **Pushing to `main` deploys to production** (GitHub Pages via `.github/workflows/deploy.yml`).
- Domain and DNS: **Cloudflare** (stays there). Hosting target after cutover: **Netlify**. At cutover, only Cloudflare DNS records change.

## Rules
1. **Work on the `platform-v1` branch. Never push or merge to `main`** unless the user explicitly says to do the cutover.
2. Build one phase at a time (brief section 10). Stop and report after each phase.
3. **Soft gate:** catalog, course pages, module overviews, step 1 of every module, educator guides, and workshop checks are open. Everything else requires sign-in, checked on the server.
4. **Security** (brief section 8):
   - Use Firebase Auth with httpOnly session cookies.
   - The browser never talks to Firestore directly; its rules deny all client access.
   - Every server route checks ownership through `src/lib/authz.ts`.
   - Never commit or print the Firebase service account key.
5. **Kids' data:**
   - Under-13 learners are nickname-only profiles under a parent account.
   - Store the age band, never a birth date.
   - Reflections stay in the browser.
6. **Accessibility:** WCAG 2.2 AA; axe finds no serious or critical issues; everything works by keyboard.
7. **Content:**
   - Never invent statistics, studies, or quotes. Use `[CITATION NEEDED]`.
   - New modules start as `status: draft`.
8. **Dependencies:** use Tailwind and the existing `src/app/components/ui` primitives before adding any UI library, and explain any new dependency.
9. **After each phase:**
   - Run the build, visual screenshots (375/768/1280), and a11y tests.
   - Look at the screenshots and fix problems.
   - Commit, then report.

## Reference
- Curriculum outline: `docs/source/RA4K_Curriculum_Templates.docx` (3 tracks, 17 modules).
- The old static site is in `../_archive/old-static-site/` (reference only).
- If a command fails with "Resource deadlock avoided", the file is an iCloud placeholder. Tell the user instead of retrying in a loop.
