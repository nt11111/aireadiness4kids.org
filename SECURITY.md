# Security

ARK serves students, many of them children, so we take reports seriously.

## Reporting a problem

Email **contact@aireadiness4kids.org** with "Security" in the subject. Please include what you found, how to reproduce it, and which page or feature it affects. Don't include anyone else's personal data.

We'll reply within a week. Please give us a reasonable chance to fix the issue before sharing it publicly, and don't access, change, or delete other people's data while testing.

## How the site protects accounts

- Sign-in uses Firebase Authentication. ARK never stores or handles passwords.
- Sessions live in an httpOnly, Secure, SameSite=Lax cookie that browser scripts can't read.
- The browser never talks to the database: Firestore rules deny all client access, and every server route checks that the data belongs to the signed-in account.
- Every state-changing request must come from this site (Origin check) and carry an App Check token.
- Children under 13 never give us an email; a parent's account holds it. We store age bands, never birth dates.

More detail: `docs/ARK_UI_BUILD_BRIEF.md` (section 8) and `docs/SETUP_FIREBASE.md`.

## Rate-limit records

The workshop checks count requests per scrambled IP and browser id in Firestore `rateLimits`. A Netlify scheduled function (`netlify/functions/cleanup-rate-limits.mts`) deletes expired counters once a day on the production deploy, instead of Firestore's TTL policy (which needs the paid Blaze plan). It logs only a count. Tested on the emulator in `tests/rate-limit-cleanup.spec.ts`.

## Dependency advisories we know about

`npm audit` runs in CI on every push (`.github/workflows/ci.yml`): the report is always printed, and a critical advisory fails the build. Reviewed 2026-09-27:

| Package | Severity | Why it's accepted for now |
|---|---|---|
| `extract-zip` (via `@astrojs/netlify` > `@netlify/vite-plugin` > `@netlify/dev`) | high | Only Netlify's local dev server imports it, to unpack function zips on a developer's machine. It isn't in the built site or the server function. npm's suggested fix downgrades the adapter to a version that doesn't support Astro 7. |
| `uuid` 9 (via `firebase-admin` > `@google-cloud/storage` > `gaxios` 6) | moderate | The advisory affects `uuid` v3/v5/v6 called with a buffer; `gaxios` only calls v4. ARK doesn't use Cloud Storage. |

Re-check both whenever `@astrojs/netlify` or `firebase-admin` is updated.

## Security review

The Phase 6 review of every item in the build brief's section 8 (accounts, database access, data collected, headers, input validation, logging, guest progress, workshop checks, analytics) is recorded in the Phase 6 report. The emulator tests in `tests/security.spec.ts`, `tests/rules.spec.ts`, `tests/auth.spec.ts`, and the other specs listed under `npm run test:security` re-check the access rules on every CI run.
