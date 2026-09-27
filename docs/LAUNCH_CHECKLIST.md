# Launch checklist

Everything that must be true **before** running `DEPLOY.md` (the cutover of aireadiness4kids.org to Netlify). Work top to bottom. When every row is **Done**, the cutover can start.

- **Done**: finished and checked.
- **Open**: known work, someone just has to do it.
- **Decision**: the team has to choose first (brief section 11). The row says what's being chosen.

Last reviewed: 2026-09-27 (Phase 6). State of the branch site: `platform-v1--aireadiness4kids.netlify.app`, commit `3436ea3`.

---

## Summary

| # | Item | Status |
|---|---|---|
| 1 | Netlify project visibility: production public | **Done** (2026-09-27) |
| 2 | Legal review of privacy policy, terms, parent notice signed off | **Open** |
| 3 | Legal name and mailing address on the legal pages | **Open** |
| 4 | License for reusing ARK lessons and slides | **Decision** |
| 5 | Who owns the Firebase, Netlify, and Cloudflare accounts | **Decision** |
| 6 | contact@aireadiness4kids.org set up as an admin | **Done** |
| 7 | Admin list reviewed | **Decision** |
| 8 | Facilitator role granted to workshop leaders | **Open** |
| 9 | Test accounts, test progress, and stats wiped in Firestore | **Open** (do last) |
| 10 | Rate-limit cleanup | **Done** (starts at cutover) |
| 11 | Backups | **Decision** |
| 12 | App Check enforcement plan | **Decision** (plan below) |
| 13 | Production settings: Netlify env vars, `NODE_ENV`, Firebase and Google Cloud domains | **Open** |
| 14 | Analytics provider | **Decision** |
| 15 | Which modules are real and which are stubs, and how stubs look | **Done** (review) |
| 16 | Reviewer names and credentials | **Decision** |
| 17 | Brand colors, logo, imagery | **Decision** |
| 18 | UYS Academy age range (which track leads the pilot) | **Decision** |
| 19 | Developer preview pages in production | **Decision** |
| 20 | Final look at the Cloudflare DNS dashboard | **Open** (day of cutover) |
| 21 | CI green and the pull request reviewed | **Open** (day of cutover) |
| 22 | Branch deploys public or private | **Decision** |

---

## 1. Netlify project visibility: production public: Done

Done 2026-09-27: `https://aireadiness4kids.netlify.app/` answers 200 to the public. **Branch deploys are now public too** (`platform-v1--aireadiness4kids.netlify.app` answers 200 without a Netlify login), so anyone with the link can use the pre-launch site, including sign-up against the real Firebase project. Its `robots.txt` keeps search engines out. Item 22 covers whether to keep it that way.

The notes below are how it was fixed.

Right now **every** deploy of the Netlify project needs a Netlify team login, production included. `https://aireadiness4kids.netlify.app/` and `https://main--aireadiness4kids.netlify.app/` both answer `401` to the public (checked 2026-09-27). If DNS moved now, every visitor to aireadiness4kids.org would get a Netlify login page.

- The cause is the project's visibility, which is **Private** (the "Private · Make public" toolbar on the branch site). Netlify > project `aireadiness4kids` > **Project configuration > General > Visitor access > Project visibility**: set production deploys to **Public** and leave previews **Private**, then **Save**. The **Make public** button does the same. Branch deploys like `platform-v1--…` stay private (on the free plan, only the team owner can open them).
- Safe to do before the cutover: production on Netlify is still the old site from `main`, and this doesn't touch the domain.
- Check afterwards, from a browser that isn't signed in to Netlify (a private window): `https://aireadiness4kids.netlify.app/` loads. Today that's still the old site from `main`; that's fine.

## 2. Legal review signed off: Open

`/privacy`, `/terms`, and the parent notice (sign-up, under-13 path; the same text is on `/privacy#parent-notice`) are plain-language drafts. Each shows **"Draft: needs legal review before launch"**. Questions for the lawyer are highlighted in brackets on the pages themselves:

- how COPPA applies, and whether the parent confirmation checkbox is an adequate way to get consent;
- what changes when a school or teacher, not a parent, sets up learners (FERPA, state student-privacy laws such as California's SOPIPA);
- the Google sign-in name and photo link that Firebase stores;
- Netlify's log retention, provider backups, and state-specific privacy rights;
- the disclaimer, limit of liability, and governing law in the terms.

**When it's signed off:** for each page, apply the lawyer's edits, delete every `<ReviewNote>`, set `draft: false` and the real date in the page's frontmatter (`src/pages/privacy.mdx`, `src/pages/terms.mdx`), and update `PARENT_NOTICE` / remove the draft label in `src/app/lib/legal.ts`. `tests/a11y.spec.ts` checks for the draft label, so update that test in the same change. Record who reviewed it and when.

## 3. Legal name and mailing address: Open

Both legal pages have a review note asking for ARK's legal name, state of incorporation, and mailing address.

## 4. License for reusing lessons and slides: Decision

The terms say teachers and families can use everything for free, but not whether others may adapt or republish it. Pick a license (for example Creative Commons CC BY-NC-SA 4.0) and how to credit ARK. Then update the "Our lessons and materials" section of `/terms`.

## 5. Who owns the accounts: Decision

The brief asks for an ARK organization account with two founders as admins on each service. Today:

- **Firebase / Google Cloud** (`ark-learning-58324`): owners contact@aireadiness4kids.org and neiltodkar@gmail.com; rishidatta20 invited.
- **Netlify** (project `aireadiness4kids`, free plan): under Neil's team.
- **Cloudflare** (domain and DNS): confirm which login owns it.
- **GitHub** (`nt11111/aireadiness4kids.org`): Neil's personal account.

Decide the owner for each, add a second founder, and move anything under a personal account (or write down why it stays).

## 6. contact@aireadiness4kids.org is an admin: Done

Granted on 2026-09-27 (Google sign-in). After the cutover, sign in with it on aireadiness4kids.org and open `/admin` once to confirm.

## 7. Admin list reviewed: Decision

Admins today: neiltodkar@gmail.com and contact@aireadiness4kids.org. Decide whether personal accounts keep `admin` after launch. Change roles with `scripts/set-role.ts` (see `docs/SETUP_FIREBASE.md`).

## 8. Facilitator role for workshop leaders: Open

Presenter mode (`/present`) needs the `facilitator` (or `admin`) role. List the founders and ambassadors who will lead workshops. Each creates an account on the site, then a founder runs `node scripts/set-role.ts <email> facilitator`. The script signs them out everywhere, so the role applies the next time they sign in.

## 9. Wipe test data in Firestore: Open (do this last, right before the cutover)

The live project has test data from building and testing Phases 3 to 6: Neil's account with Bias in AI progress and certificates, test sign-ups, workshop check answers, and the running totals in `stats/*`, which include all of them. `/admin` would show these as real impact numbers. The live test pass on 2026-09-27 added a workshop check tagged `live-test-0927` (it shows up in the `/admin` tag filter until the stats are wiped).

In the Firebase console (project `ark-learning-58324`):

1. **Authentication > Users:** delete test users. Keep the admin accounts (deleting a user also removes their role). For admin accounts, delete only their test data in the next steps.
2. **Firestore:** delete the `stats` collection (all docs), `checkResults`, and `certificates`. Under each kept admin's `users/{uid}/learners/{id}/progress`, delete the progress docs (their certificates are gone with step 2's `certificates`). Delete `users/{uid}` for any user deleted in step 1, with their `learners` subcollection. `rateLimits` can go too.
3. Open `/admin`: every total should be zero.

Anyone who then signs in keeps their account but starts from zero. Tell the team first so nobody is surprised.

## 10. Rate-limit cleanup: Done (starts at cutover)

Expired `rateLimits` records are deleted once a day by the Netlify scheduled function `cleanup-rate-limits` (no Blaze plan needed). Netlify runs scheduled functions only on the production deploy, so it starts after the cutover. **The day after:** Netlify > Logs > Functions > `cleanup-rate-limits` shows `[cleanup-rate-limits] deleted N`.

## 11. Backups: Decision

On the free Spark plan Firestore has no scheduled backups or point-in-time recovery; a bad delete is permanent. The data is small (accounts, progress, totals). Options: accept it for the pilot; run a manual export now and then (`gcloud firestore export` needs a Cloud Storage bucket, which needs Blaze); or move to Blaze and turn on backups. Decide which.

## 12. App Check enforcement plan: Decision (proposed plan)

Today every ARK API route **already requires a valid App Check token**, checked on the server (`src/lib/api.ts`). What is not enforced is App Check for **Firebase Authentication** itself (the Firebase console's "Enforce" switch), so a script could still call Firebase's sign-up and sign-in endpoints directly. Firebase's own rate limits cover it meanwhile.

Proposed:
1. At launch, leave it on "monitor".
2. For the first one or two weeks, check Firebase console > **App Check > APIs > Authentication**: the share of **verified** requests.
3. When it is close to 100% (older browsers and blocked reCAPTCHA show up as unverified), click **Enforce** for Authentication. Don't enforce for Cloud Firestore: the browser never talks to it, and the server's Admin SDK isn't affected.
4. If school networks block reCAPTCHA and sign-ins fail, turn enforcement back off (instant) and write down which schools.

## 13. Production settings: Open

All in `DEPLOY.md` > "Before the cutover":
- Netlify env vars have real values for the **Production** context (including the real `PUBLIC_FIREBASE_API_KEY`).
- `NODE_ENV=production` for Production (safe since Phase 6).
- Firebase **Authorized domains** include `aireadiness4kids.org` and `www.aireadiness4kids.org`.
- The Google Cloud **API key** allows `https://aireadiness4kids.org/*` and `https://www.aireadiness4kids.org/*`.
- The **reCAPTCHA Enterprise** key lists both domains.

## 14. Analytics provider: Decision

Umami Cloud or Cloudflare Web Analytics. Until someone decides, analytics stay off (`PUBLIC_UMAMI_ID` unset, so no script loads and no events are sent). Either is cookie-free. If Cloudflare Web Analytics wins, `src/lib/analytics.ts` needs a small change, and the privacy policy's "Analytics" bullet needs updating either way.

## 15. Which modules are real, and how stubs look: Done (for review)

| Track | Module | Lesson steps | Facilitator guide | Slides | Status |
|---|---|---|---|---|---|
| Investigators | **Bias in AI** | 6 (complete sample module) | Yes | Yes | Draft |
| All three | The other 16 modules | None (stub) | "Coming soon" | Yes | Draft |

- Every module shows **"Draft: under expert review"** with a link to how review works.
- A stub's module page shows its real title, summary, and key topics, then **"Content coming soon"**, with a note that the steps are being written and a link to the module's slide deck. Stubs aren't offered as "in progress" anywhere, and "Start course" opens the first module that has lessons.
- On the course pages, stub rows show no step list, and the educators page says "Guide coming soon".

Decide whether that's how the team wants to launch (one full module and 16 slide-deck-only ones), or whether to wait for more modules.

## 16. Reviewer names: Decision

No module has finished expert review, so no names appear anywhere (About > "Our reviewers" says so). When a review is done, add the reviewer's name and credentials to that module's frontmatter (`reviewers`) and set `status: reviewed`; the badges and the About page update themselves. The home page credibility strip also stays hidden until there are reviewers or partner logos (`src/data/partners.json`), and impact numbers stay hidden while `src/data/impact.json` is empty.

## 17. Brand colors, logo, imagery: Decision

The site uses the brief's starting tokens and a text wordmark, and geometric shapes instead of photos. Final colors, logo, and any photos or illustrations are the team's call (no stock photos or AI-generated images of children). Run `npm run check:contrast` after any color change.

## 18. UYS Academy age range: Decision

Decides which track leads the pilot, and which `?src=` link to hand out (for example `?src=uys-fall26`).

## 19. Developer preview pages: Decision

`/dev/components` and `/dev/lesson-preview/1-3` are in the build. They're `noindex` and not linked from anywhere, but anyone who knows the address can open them. Keep them (handy for volunteers adding modules) or remove them from production.

## 20. Final look at the Cloudflare DNS dashboard: Open (day of cutover)

Before step 4 of `DEPLOY.md`, open Cloudflare > `aireadiness4kids.org` > **DNS > Records**, take a screenshot, and check:
- the web records on `@` and `www` point at GitHub Pages as `DEPLOY.md` expects (the public lookup shows only Cloudflare's IPs because they're proxied);
- the email records (**MX**, the SPF **TXT** `v=spf1 include:_spf.mx.cloudflare.net ~all`) are there and will be left alone;
- any **Rules** (Redirect Rules / Page Rules) on `www` or the apex are written down, since they stop applying once the records are DNS only;
- the TTL has been lowered to 5 minutes.

## 21. CI green and pull request reviewed: Open (day of cutover)

Open the pull request `platform-v1` > `main`. The **CI** check (audit, build, type check, all emulator tests) must pass, and a second founder should review it. Then follow `DEPLOY.md`.

## 22. Branch deploys public or private: Decision

Since the visibility change, `platform-v1--aireadiness4kids.netlify.app` is public. That's handy for sharing with the team (on the free plan a private preview can only be opened by the team owner), but it means strangers can create real accounts in the Firebase project before the legal review is done, and those accounts count in `/admin`.
- Keep it public until the cutover and wipe the data (item 9) right before, or
- set previews back to **Private**: Project configuration > General > Visitor access > Project visibility > previews **Private**.

Search engines are kept out either way: `robots.txt` answers `Disallow: /` on every host except aireadiness4kids.org.
