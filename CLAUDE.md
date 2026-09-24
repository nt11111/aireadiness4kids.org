# ARK website (aireadiness4kids.org)

This repo is being rebuilt from a marketing site into ARK's free course platform. The full spec is **`docs/ARK_UI_BUILD_BRIEF.md`**. Read it before starting any phase. The phase prompts are in `docs/ARK_Claude_Code_Prompts.md`.

## Current state
- `main` is the live site: React 18 + Vite + Tailwind v4 + shadcn/Radix (Figma Make export), with React Router.
- `platform-v1` (Phases 0 and 1 done): Astro 7 + React islands + MDX + Tailwind v4, `output: 'server'` with the Netlify adapter. Every page so far sets `prerender = true`.
- Course content lives in content collections (`src/content.config.ts`, zod-validated): `src/content/tracks/*.md` and `src/content/modules/<track>/<slug>/index.mdx` (17 stubs, all `status: draft`). `src/lib/courses.ts` loads and orders them. Course pages are `src/pages/courses/`; their Astro components are in `src/components/`. Reviewer names come from module frontmatter; partner logos and impact numbers come from `src/data/*.json` (see `src/data/README.md`), and those home-page sections stay hidden while empty.
- Routes are `.astro` files in `src/pages/`; page sections in `src/app/sections/`; shared components in `src/app/components/site/` and shadcn primitives in `src/app/components/ui/`. Copy lives in `src/app/lib/content.ts`, tokens in `src/styles/theme.css`, brand assets in `public/brand/`. Style guide: `/dev/components` (noindex, unlinked).
- Commands: `npm run dev` (port 5180), `npm run build` (also checks alt text, links, and bundle secrets), `npm run check:contrast`, `npm run check`, `npm run test:visual`, `npm run test:a11y`, `npm test`.
- **Pushing to `main` deploys to production** (GitHub Pages via `.github/workflows/deploy.yml`).

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
