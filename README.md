# ARK · AI Readiness for Kids: course platform

Free AI literacy courses for K-12 students, live at **https://aireadiness4kids.org**.

The site has three courses (grades K-5, 6-8, and 9-12) and 17 modules. One module, Bias in AI, has its full set of lesson steps. The other 16 have a summary, key topics, and a slide deck. Every module is marked Draft until an expert reviewer signs it off.

This repo held a five-page React + Vite marketing site until September 2026, when the course platform replaced it on `main`.

## What it does

- A lesson player with short steps: explainers, scenarios, quick checks, and reflections.
- Accounts with progress that follows a learner across devices. A guest's progress merges into the account they create.
- Certificates with verification pages (public only for learners 13 and older).
- Facilitator guides, a presenter mode with QR-code knowledge checks, and an admin dashboard with CSV export.

## Stack

Astro 7 (server output, Netlify adapter), React islands, TypeScript, MDX content collections validated with zod, Tailwind v4, Firebase Auth and Cloud Firestore through `firebase-admin`, Playwright, GitHub Actions.

## How it handles data

- The browser never talks to the database. Firestore rules deny all client access, and every server route checks that the record belongs to the signed-in account.
- Sessions live in an httpOnly cookie that browser scripts can't read. Every state-changing request must pass an Origin check and carry an App Check token.
- Learners under 13 are nickname-only profiles under a parent's account. The app stores an age band, never a birth date.

More detail: [`SECURITY.md`](SECURITY.md) and section 8 of [`docs/ARK_UI_BUILD_BRIEF.md`](docs/ARK_UI_BUILD_BRIEF.md).

## Run locally

```bash
npm install
npm run dev              # http://localhost:5180
npm run build            # production build + alt-text, link, CSP, and secret checks
npm run check:contrast   # WCAG AA check of every token pair
npm test                 # everything below, on the Firebase emulators
npm run test:security    # sign-in, access-control, and database-rules tests
npm run test:visual      # screenshots at 375/768/1280 into screenshots/phase-N/
npm run test:a11y        # axe (WCAG 2.2 AA) + keyboard checks
```

First time only: `npx playwright install chromium`. Tests also need the Firebase CLI (`npm install -g firebase-tools`) and Java 21+ for the database emulator. They use a pretend `demo-ark` project and never touch real data. Firebase setup for the real site: [`docs/SETUP_FIREBASE.md`](docs/SETUP_FIREBASE.md).

## Tests

106 Playwright tests run on the Firebase Auth and Firestore emulators, never on real data. They cover sign-in, access control, database rules, progress, certificates, rate limiting, and accessibility (axe for WCAG 2.2 AA, plus keyboard-only use). GitHub Actions runs `npm audit`, the production build, and the full suite on every push to `main` and `platform-v1` and on every pull request.

The production build fails on missing alt text, a broken internal link, an inline script outside the Content Security Policy, or a service-account key in a browser bundle.

## Edit content

- Courses: `src/content/tracks/*.md`.
- Modules: one folder each in `src/content/modules/<track>/<slug>/`, holding `index.mdx`, numbered step files, and `guide.mdx` (the facilitator guide). `src/content.config.ts` validates every file at build time.
- Site copy: `src/app/lib/content.ts`. Design tokens: `src/styles/theme.css`. Brand assets: `public/brand/`.

## Deploy

Netlify builds and hosts the site from `main` (`netlify.toml`), so a push to `main` is a production deploy. The domain and DNS stay on Cloudflare. GitHub Actions only builds and tests. Cutover and rollback steps are in [`DEPLOY.md`](DEPLOY.md); open launch items are in [`docs/LAUNCH_CHECKLIST.md`](docs/LAUNCH_CHECKLIST.md).

## How it was built

Neil Todkar built the platform in seven phases from a written brief ([`docs/ARK_UI_BUILD_BRIEF.md`](docs/ARK_UI_BUILD_BRIEF.md)), with Claude Code as the implementation tool. [`CLAUDE.md`](CLAUDE.md) holds the rules it works under. Each phase had to pass the build, screenshot checks at three screen widths, and the accessibility and security tests before it was committed.
