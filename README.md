# ARK · AI Readiness for Kids: website

Live at **https://aireadiness4kids.org** (the `main` branch, React + Vite, deployed to GitHub Pages on every push to `main`).

The `platform-v1` branch is the course-platform rebuild (Astro + React islands + Tailwind + MDX, Netlify adapter). Spec: `docs/ARK_UI_BUILD_BRIEF.md`. Rules for contributors: `CLAUDE.md`.

## Edit content
Copy lives in `src/app/lib/content.ts`. Design tokens are in `src/styles/theme.css`. Brand assets are in `public/brand/`.

## Run locally (platform-v1)
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
First time only: `npx playwright install chromium`. Tests also need the Firebase CLI (`npm install -g firebase-tools`) and Java 21+ for the database emulator. They use a pretend `demo-ark` project and never touch real data. Firebase setup for the real site: `docs/SETUP_FIREBASE.md`.

## Deploy
`main` deploys to GitHub Pages. `platform-v1` is not deployed; hosting moves to Netlify at cutover (brief Phase 6).
