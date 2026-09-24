# ARK: Claude Code prompts, phase by phase

**How to use this:**
1. Open Claude Code in the `ark-website` folder. The brief is already at `docs/ARK_UI_BUILD_BRIEF.md`, and `CLAUDE.md` loads automatically.
2. Everything happens on the `platform-v1` branch. The live site keeps running from `main` until you approve the cutover.
3. Paste one prompt per session, in order.
4. Check the screenshots and click through the site locally before moving to the next phase.

Don't paste the whole build as one prompt. One phase per session gives cleaner results and makes it easy to roll back.

---

## Phase 0: Setup and design system

```
Read docs/ARK_UI_BUILD_BRIEF.md fully before doing anything, then read CLAUDE.md. Build Phase 0 only.

- Check git status. Commit any uncommitted work on main, then create and switch to a branch named platform-v1. Do all work on this branch and never push to main.
- Convert this Vite + React app to Astro in place: add the React, MDX, and Tailwind v4 integrations; configure output: 'server' with the Netlify adapter; prerender every page that doesn't need a session.
- Move the existing pages (Home, About, GetInvolved, Donate, Contact) into Astro routes so they render exactly as today. Reuse Nav, Footer, and the components/ui primitives. Keep the copy in src/app/lib/content.ts.
- Replace Google Fonts imports with @fontsource (Fraunces + Atkinson Hyperlegible). Update src/styles/theme.css with the section 3 tokens, keeping the shadcn variable names. Check each text/background pair for WCAG AA; list any changes.
- Add Playwright + @axe-core/playwright, and npm scripts: dev, build, test:visual (screenshots at 375/768/1280), test:a11y.
- Build a /dev/components page: type scale, colors, buttons (all states), cards, chips, progress ring.
- Remove unused dependencies (report what and why).
- Leave the GitHub Pages workflow alone for now. It only runs on main.

Then run the section 9 checks, review your own screenshots, fix issues, commit, and report. Stop after Phase 0.
```

## Phase 1: Catalog pages

```
Read docs/ARK_UI_BUILD_BRIEF.md and CLAUDE.md. Build Phase 1 only.

- Set up content collections for tracks and modules (section 5 schema, validated with zod).
- Create all 3 track files and all 17 module stubs using the titles in section 4. Use the key topics from docs/source/RA4K_Curriculum_Templates.docx as stub summaries. Set status: draft on all of them.
- Build: Home, /courses, /courses/[track] (Coursera-style course page with syllabus accordion), and /courses/[track]/[module] (module overview), per section 7.
- The review-status badge must look good in draft and reviewed states. Show both on /dev/components.
- Hide the credibility strip when there's no data. Never render placeholder logos.

Run the section 9 checks, look at every screenshot at all three widths, fix what looks off, commit, and report. Stop after Phase 1.
```

## Phase 2: Lesson player and components

```
Read docs/ARK_UI_BUILD_BRIEF.md and CLAUDE.md. Build Phase 2 only. This is the most important screen on the site, so take your time on it.

- Build the lesson player per section 7: collapsible outline sidebar on desktop, a bottom sheet on mobile, top progress bar, sticky Back/Next bar, ← → keys, and Astro View Transitions between steps.
- Build every MDX component in section 6 as React islands only where interaction is needed, building on the existing components/ui primitives. Add each to /dev/components with an example.
- Add the Explorers (K-5) variant: 20px body, read-aloud visible, 48px tap targets.
- Write the full sample module Investigators → Bias in AI (6 steps: explainer, explainer, scenario, check, reflect, recap, plus guide.mdx and pre/post check questions). Follow the placeholder content rule: no invented stats or quotes; use [CITATION NEEDED].
- Step completion can be in-memory for now. Real persistence comes in Phase 3.

Test the whole module with keyboard only and on a 375px screenshot sequence. Run the section 9 checks, fix, commit, and report. Stop after Phase 2.
```

## Before Phase 3: set up Firebase (about 20 minutes)

Create a **new** Firebase project just for ARK. Don't reuse your other project. Use an ARK organization Google account if you have one, and add a second founder as Owner.
1. **Firebase console → Add project** ("ark-learning"). Google Analytics isn't needed.
2. **Authentication → Sign-in method:** turn on Google and Email/Password. Under Settings, keep email enumeration protection on. Under **Authorized domains**, add your Netlify domain and aireadiness4kids.org.
3. **Firestore Database → Create** in production mode (it starts locked, which is what we want).
4. **Project settings → Your apps → Web app:** copy the config values. These are public-safe.
5. **Project settings → Service accounts → Generate new private key.** This file is a secret. Don't put it in the repo, email it, or paste it into chat. It only goes into Netlify's environment variables.
6. **App Check:** register the web app with reCAPTCHA Enterprise.
7. **Netlify:** connect the repo and add the env vars that `docs/SETUP_FIREBASE.md` lists.

Phase 3 writes `docs/SETUP_FIREBASE.md` with exact click-paths and env var names, so you can also run Phase 3 first and follow that guide.

## Phase 3: Accounts and security

```
Read docs/ARK_UI_BUILD_BRIEF.md (especially sections 7 and 8) and CLAUDE.md. Build Phase 3 only. Security matters more than speed here, so go carefully and explain your choices.

- Write docs/SETUP_FIREBASE.md: a step-by-step guide a high schooler can follow for the new ARK Firebase project, App Check, API key restrictions, authorized domains, and Netlify env vars. Say exactly which values are public-safe and which are secret.
- Add firebase (client) and firebase-admin (server). Create src/lib/firebase-client.ts (inMemoryPersistence) and src/lib/firebase-admin.ts (server only; import it only from server code).
- Implement the session-cookie flow in 8.1: /api/session (create), /api/signout (clear + revoke), and Origin checks on every POST route.
- Add firestore.rules with deny-all client access, and firebase.json for the emulators.
- Build src/lib/authz.ts with requireUser, requireRole, and requireLearner(uid, learnerId). Every server route must use them.
- Add scripts/set-role.ts to set the facilitator/admin custom claims.
- Build /signup (neutral age screen → 13+ path or parent path), /signin, /reset-password, email verification, and /account (display name, learner profiles, data export, account deletion that removes the Firestore data and the auth user, and unlinks checkResults), per section 7.
- Add Astro middleware that gates steps 2+, /my-learning, /account, /present, /admin on the server via verifySessionCookie, with role checks for /present and /admin. Validate `next` redirects to internal paths only.
- Build the friendly sign-up panel shown when a signed-out visitor presses Next on step 1.
- Add the security headers in 8.4 and the build check that fails if a service account private_key is in any client bundle.
- Tests on the Firebase Emulator Suite (never production):
  (a) User A can't read or write user B's data through any API route.
  (b) Direct client Firestore access is denied.
  (c) Signed-out requests to gated routes get a redirect, not content.
  (d) A non-admin gets 403 on /admin.
  (e) Open redirects are blocked.
  (f) Cross-origin POSTs are rejected.

Run the section 9 checks, commit, and report, including a plain-English summary of how the security works and anything I still need to configure by hand. Stop after Phase 3.
```

## Phase 4: Progress and data

```
Read docs/ARK_UI_BUILD_BRIEF.md and CLAUDE.md. Build Phase 4 only.

- Progress: save step completions under the active learner in Firestore (through server routes using requireLearner), and update the running-total stats docs in the same batch (8.2). Wire it into the lesson player, course page, module overview, and the home "continue" card.
- Guest mode: step-1 progress and pre-check in localStorage (ark.guest.v1, try/catch), merged into the account on sign-up and then cleared.
- ?src= capture, URL cleanup, and first_src saved on sign-up.
- /my-learning with continue, completed, and the profile switcher for parent accounts.
- /check/[module]/[phase] (open, no login) and a /api/checks server endpoint with zod validation and rate limiting. Link anonymous results to the learner if they later sign up.
- src/lib/analytics.ts with the events in 8.7. Use Umami if PUBLIC_UMAMI_ID is set, otherwise a no-op.
- Playwright tests:
  - A guest does step 1, signs up, and progress carries over.
  - Progress persists across a sign-out and sign-in.
  - A parent switches between two learner profiles and each keeps its own progress.

Run the section 9 checks, commit, and report. Stop after Phase 4.
```

## Phase 5: Completion, educators, presenter, admin

```
Read docs/ARK_UI_BUILD_BRIEF.md and CLAUDE.md. Build Phase 5 only.

- Completion page with the pre/post comparison, and certificates issued from the account. 13+ learners get a public /verify/[id]; under-13 profiles get printable only. Add a print stylesheet so the certificate prints on one landscape letter page.
- /educators and /educators/[track]/[module] rendering guide.mdx (open to everyone), with a clean print stylesheet.
- /present/[track]/[module] (facilitator or admin role): full-screen, large type, arrow keys, and a QR code on check steps linking to /check/... with the presenter's ?src= value.
- /admin (admin role): the aggregate impact numbers in section 7, with filters by src and date, plus a CSV export. No individual learner data.

Screenshot the print views (use Playwright's PDF output), run the section 9 checks, commit, and report. Stop after Phase 5.
```

## Phase 6: Port, polish, security review, ship

```
Read docs/ARK_UI_BUILD_BRIEF.md and CLAUDE.md. Build Phase 6 only.

- Restyle the existing pages (About, Get Involved, Donate, Contact) and the Programs content (→ /workshops) to match the new design. Keep the copy from content.ts. Add the /curriculum → /courses and /programs → /workshops redirects.
- Write drafts of /privacy (with a section for parents), /terms, and the parent notice, each marked "DRAFT: needs legal review before launch". Also add /accessibility and a friendly 404.
- Security review: go through every item in section 8 and report pass/fail with evidence. Re-run all auth and access tests on the emulator. Run npm audit. Add SECURITY.md.
- Performance pass: check JS shipped per page type, image sizes, and font subsets. Report the numbers.
- Full a11y audit across every page type, including sign-up and sign-in, fixing everything serious or critical.
- Cutover prep: add netlify.toml, replace .github/workflows/deploy.yml with a CI workflow that only runs build + tests, and write DEPLOY.md with the exact steps to point aireadiness4kids.org at Netlify (DNS changes, removing the GitHub Pages custom domain). Don't merge to main. I'll do the cutover after review.
- Do a final visual consistency sweep.

Report a before/after summary, the security checklist results, and the open questions from section 11 that are still unanswered. Do not merge to main.
```

---

## Prompts for after you've looked at the result

- **When something looks off:** "On the course page at 375px, the syllabus rows feel cramped and the progress text wraps badly. Fix spacing and wrapping, then re-screenshot at all three widths."
- **When it feels too 'tech':** "This still reads like a SaaS product. Make it warmer: less shadow, more paper background, softer corners on cards, more white space around headings. Show before/after screenshots."
- **When adding a new module:** "Using the Bias in AI module as the pattern, build out Explorers → What Is AI? from the content I've pasted below. Keep status: draft."
