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
