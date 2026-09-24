# ARK website (aireadiness4kids.org)

This repo is being rebuilt from a marketing site into ARK's free course platform. The full spec is **`docs/ARK_UI_BUILD_BRIEF.md`**. Read it before starting any phase. The phase prompts are in `docs/ARK_Claude_Code_Prompts.md`.

## Current state
- Live site: React 18 + Vite + Tailwind v4 + shadcn/Radix (Figma Make export), with React Router.
- Copy lives in `src/app/lib/content.ts`, pages in `src/app/pages/`, and brand assets in `public/brand/`.
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
