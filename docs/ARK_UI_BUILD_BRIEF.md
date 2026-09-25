# ARK Learning Platform: UI Build Brief (for Claude Code)

**Project:** aireadiness4kids.org (ARK). A free, open AI literacy curriculum for K-12
**Owner:** ARK founding team
**Status:** V1 build spec, free curriculum with a soft login gate (v3: Firebase)
**Where this file lives:** `ark-website/docs/ARK_UI_BUILD_BRIEF.md` (the live site repo). Claude Code reads it at the start of every phase, alongside `ark-website/CLAUDE.md`.

---

## 1. What we're building

We're turning the current 5-page marketing site into a **free course platform with accounts**. It should feel like Khan Academy (clean, friendly, obvious next step) crossed with Coursera (clear course pages, a syllabus, a sense of progress). The curriculum is always free. An account is what lets a learner keep going, save progress, and earn certificates.

ARK runs the program. Founders and ambassadors lead workshops, then send people to the site to keep going. Teachers are welcome to use it in class, but nothing in the product requires them.

### Non-negotiables
1. **Soft gate.** Anyone can browse the home page, catalog, course pages, module overviews, and **the first step of every module** without signing in. Continuing past step 1, saving progress, and earning certificates require an account. Educator guides stay open. Workshop QR knowledge checks stay open (learners in a room shouldn't have to sign up mid-session).
2. **Secure and minimal by design.** We use a managed auth provider and never write our own password handling. We collect the least data possible. Kids under 13 never give us an email; a parent account holds it. Analytics use no cookies. Full detail is in section 8.
3. **Accessible.** WCAG 2.2 AA, keyboard-navigable, screen-reader friendly, and it respects reduced motion. Lighthouse Accessibility score ≥ 95 on every page type.
4. **Quick on a school Chromebook.** Static pages, minimal JS, and LCP under 2.5s on a mid-range device.
5. **Works on phones.** Everything works at 360px width with no horizontal scroll.
6. **Content is editable by non-developers.** Lessons are MDX files with frontmatter. A volunteer should be able to add a module by copying a folder.

### Out of scope for V1
Teacher/classroom dashboards, forums, public profiles, search, mentorship matching, and a full kid-owned-account consent flow. Leave room for a `facilitator` role (ambassadors) in the data model, but only build what section 8 lists.

---

## 2. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Astro** (latest stable) with **MDX** and the **React** integration, `output: 'server'` with pages marked `prerender = true` wherever no session is needed | Static speed for content; server-side session checks for gated steps |
| Auth + database | **Firebase** (a new project just for ARK): Firebase Authentication + Cloud Firestore, with `firebase-admin` on the server and Firebase session cookies | Managed, audited auth; Google sign-in built in; the team already knows Firebase; the free Spark plan covers launch |
| Bot protection | **Firebase App Check** with reCAPTCHA Enterprise | Blocks scripted abuse of our API routes; free tier covers launch |
| Interactivity | **React** islands (`client:visible` / `client:idle`), only where needed | Reuses the existing React components; interactive pieces only |
| Styling | **Tailwind v4 + the existing shadcn/Radix components** in `src/app/components/ui/`, with tokens in `src/styles/theme.css` | Already in the repo; Radix primitives are accessible out of the box |
| Fonts | Self-hosted via `@fontsource` | No Google Fonts request, so it loads quicker and is friendlier to school networks |
| Progress | Firestore (per learner) for signed-in learners; `localStorage` for the free step-1 preview, merged into the account on sign-up | Progress follows the learner across devices |
| Analytics | **Umami Cloud** (free tier) or Cloudflare Web Analytics. Pluggable through one `analytics.ts` module | Cookie-free, supports custom events (Umami) |
| Knowledge-check submissions | Stored in Firestore `checkResults`. Anonymous workshop submissions go through a server endpoint (`/api/checks`) that validates input and rate-limits; they never use a client-side insert | One place for all impact data |
| QR codes | `qrcode` npm package, rendered at build or client-side | Used for workshop presenter mode |
| Hosting | **Netlify** (free tier) with `@astrojs/netlify`. GitHub Pages can't run server code. Firebase Hosting would need the paid Blaze plan for server code. Cloudflare Workers/Pages can't run `firebase-admin`'s Firestore client, which would mean hand-written token checks | $0 |
| Domain + DNS | **Cloudflare** (where `aireadiness4kids.org` is registered and its DNS lives). It stays there. At cutover, the DNS records are changed to point at Netlify | $0 |
| Testing | Playwright (screenshots and smoke tests) + `@axe-core/playwright` | Lets Claude Code check its own visual and a11y work |

**Current site and migration:** The live site is `ark-website/`. It's a React 18 + Vite + Tailwind v4 + shadcn/Radix single-page app (exported from Figma Make), using React Router, with all copy in `src/app/lib/content.ts` and pages in `src/app/pages/`. **It auto-deploys to GitHub Pages on every push to `main`** (`.github/workflows/deploy.yml`, custom domain via `public/CNAME`).
- **Work only on a branch (`platform-v1`). Never push to `main` until the team approves the cutover.**
- Convert the repo in place to Astro with the React + MDX + Tailwind integrations. Reuse the existing pages, `components/site/*`, and `components/ui/*` as React components or port them to `.astro` where they have no interactivity. Keep all copy from `content.ts`.
- Keep the existing routes working: `/`, `/about`, `/get-involved`, `/donate`, `/contact`. Redirect `/curriculum` → `/courses` and `/programs` → `/workshops`.
- Remove dependencies the new site doesn't use (MUI/Emotion, react-slick, react-dnd, recharts, and so on, if unused). List what was removed and why.
- Cutover (Phase 6) moves hosting from GitHub Pages to Netlify, keeping `aireadiness4kids.org`. **The domain and DNS stay in Cloudflare.** Only the DNS records change, so they point at Netlify instead of GitHub Pages. Set those records to **DNS only (grey cloud)**, so Netlify can issue the SSL certificate. Replace the GitHub Pages workflow with a CI workflow that only runs build + tests.
- The old hand-written static site is in `../_archive/old-static-site/` for reference only.

---

## 3. Design direction

### Feel
- **Warm, calm, trustworthy nonprofit**, not a tech startup. Advisors said the current site reads as "SaaS" (heavy blue, grid-heavy, glossy shadows). Move away from that.
- Big, readable type. Lots of white space. One clear primary action per screen.
- Friendly, not babyish. The K-5 track gets a softer, larger treatment; 9-12 feels closer to a college course page.
- Motion is subtle: 150-250ms ease-out on hover and step transitions, a small celebration on module completion. It is all turned off under `prefers-reduced-motion`.
- Take cues from the *structure* of Khan Academy and Coursera, not their branding. Do not copy their logos, illustrations, colors, or wording.

### Tokens (starting proposal; the team may swap values)
Update the existing variable names in `src/styles/theme.css` (`--background`, `--primary`, `--accent`, and so on, which shadcn components read), and add the track and brand variables below. Check every text/background pair for AA contrast and adjust shades if needed.

```
--bg:            #FBF8F3   /* warm paper */
--surface:       #FFFFFF
--surface-2:     #F4EFE6
--ink:           #1C2430
--ink-soft:      #4A5563
--ink-faint:     #6B7480
--line:          #E6DFD2

--brand:         #1F6F5C   /* deep green: primary buttons, links */
--brand-ink:     #FFFFFF
--brand-soft:    #E3F1EC

--accent:        #F2A93B   /* marigold: progress, completion, highlights */

/* Track colors, used for chips, progress rings, and course headers */
--track-explorers:     #E08A1E   /* K-5 */
--track-investigators: #C9503A   /* 6-8 */
--track-architects:    #3D4FA8   /* 9-12 */

--success: #2E7D4F   --warning: #B7791F   --danger: #B42318

--radius-sm: 8px  --radius: 14px  --radius-lg: 20px
--shadow-1: 0 1px 2px rgba(28,36,48,.06), 0 1px 3px rgba(28,36,48,.08)
--shadow-2: 0 6px 20px rgba(28,36,48,.08)
--space scale: 4, 8, 12, 16, 24, 32, 48, 64, 96
--container: 1180px   --reading: 68ch
```

### Type
- **Headings:** Fraunces (already in the brand) at weights 500-600. Use it only for display headings.
- **Body and UI:** Atkinson Hyperlegible, which is built for readability and suits young and struggling readers.
- Base size is 18px for lesson body text and 16px for UI. The Explorers (K-5) lesson body is 20px with 1.6 line height.

### Logo
The current logo is over-designed. For V1, use a **text wordmark** ("ARK" in Fraunces, with "AIReadiness4Kids" in small caps beneath) and the existing mark at small sizes only. Build it as a single `<Logo />` component so it can be replaced in one place.

---

## 4. Information architecture

```
/                               Home
/courses                        Catalog: the 3 tracks
/courses/[track]                Course page (Coursera-style landing + syllabus)
/courses/[track]/[module]       Module overview (objectives, steps, time)
/courses/[track]/[module]/[step]  Lesson player
/courses/[track]/[module]/complete  Completion + certificate
/my-learning                    Continue where you left off (signed in)
/signin  /signup                Google or email; age screen first on sign-up
/auth/callback                  OAuth + email-link return route
/reset-password                 Request + set new password
/account                        Profile, learner profiles (parents), export data, delete account
/verify/[certId]                Public certificate check (13+ learners only)
/admin                          Founders only: impact numbers + CSV export
/educators                      How to use ARK in a classroom
/educators/[track]/[module]     Printable facilitator guide
/present/[track]/[module]       Workshop presenter mode (full-screen + QR), facilitator role
/check/[module]/[phase]         Open workshop knowledge check (no login)
/terms                          Terms of use (draft for legal review)
/workshops                      Book an ARK workshop (from programs.html)
/about  /get-involved           Ported from the current site
/privacy                        "We don't collect personal data" in plain language
/accessibility                  Accessibility statement
/404
```

### Content hierarchy
**Track → Module → Step.** Each module (60-90 min in a classroom) is broken into **5-8 short steps** of 3-10 minutes each. This is what makes it feel like Khan Academy instead of a slideshow.

### Curriculum (from `docs/source/RA4K_Curriculum_Templates.docx`)

| Track | Grades | Modules |
|---|---|---|
| **AI Explorers** | K-5 | 1 What Is AI? · 2 AI Helpers, and When They Get It Wrong · 3 Being a Smart AI User · 4 Kindness, Feelings & AI · 5 My Digital Footprint |
| **AI Investigators** | 6-8 | 1 How AI Actually Works · 2 Bias in AI · 3 AI & Schoolwork: Where's the Line? · 4 Deepfakes & Misinformation · 5 Privacy & Your Data · 6 Ethical Dilemmas in AI |
| **AI Architects** | 9-12 | 1 The AI Landscape Today · 2 AI Ethics & Who Makes the Rules · 3 Algorithmic Bias & Systemic Justice · 4 AI & the Future of Work · 5 Building Responsibly: Design Thinking with AI · 6 Advocacy & Action |

---

## 5. Content model

```
src/content/
  tracks/
    explorers.md            # frontmatter: title, grades, color, tagline, summary, order
    investigators.md
    architects.md
  modules/
    investigators/
      bias-in-ai/
        index.mdx           # module frontmatter + overview body
        01-what-is-bias.mdx
        02-where-it-comes-from.mdx
        03-scenario-hiring-bot.mdx
        04-check.mdx
        05-reflect.mdx
        06-recap.mdx
        guide.mdx           # facilitator guide (educators page + print)
```

**Module frontmatter**
```yaml
title: Bias in AI
track: investigators
order: 2
duration_minutes: 60
summary: One-sentence description for cards.
objectives: [ "...", "...", "..." ]
vocabulary: [ { term: "training data", def: "..." } ]
status: draft          # draft | in-review | reviewed
reviewers: []          # names + credentials once expert-reviewed
slides_url: ""         # optional link to the Canva/Slides deck
pre_check: [ ...question objects... ]
post_check: [ ...same questions, same ids... ]
```

**Step frontmatter**
```yaml
title: Where does bias come from?
type: explainer       # explainer | video | scenario | check | reflect | recap | activity
minutes: 5
```

**Review status is visible.** If `status: draft`, show a small, honest badge on the module page: *"Draft: under expert review."* If `status: reviewed`, show *"Reviewed by [names]"* with a link to /about#reviewers. Credibility with educators depends on this, so make it look good in both states.

**Placeholder content rule:** Build **one complete sample module** (Investigators → Bias in AI) with draft content so every component is exercised. Every other module gets a stub: real title, the key topics from the templates doc, and "Content coming soon." Do not invent statistics, studies, or quotes. Where a fact is needed, write `[CITATION NEEDED]` so reviewers can find it.

---

## 6. MDX components (the lesson toolkit)

Build each one as its own component with an example in `/dev/components` (a hidden style-guide page).

| Component | Purpose | Notes |
|---|---|---|
| `<Callout kind="think|tip|warning|fact">` | Highlighted aside | Icon + tinted background, not color alone |
| `<Vocab term="">` | Inline term with a definition popover | Keyboard + touch accessible |
| `<Figure src alt caption>` | Images | `alt` is required; the build fails if it's missing |
| `<Video src captions poster>` | Optional video | Captions required, no autoplay |
| `<Scenario>` | "What would you do?" branching choice with feedback per option | No wrong-answer shaming. Feedback explains why |
| `<Check>` | 1-5 multiple-choice or true/false questions with instant feedback | Emits an analytics event with the score bucket only |
| `<Sort>` | Drag or tap items into buckets ("AI or not AI?") | Must work with keyboard and without drag |
| `<Reflect prompt="">` | Free-text reflection | Saved **locally only**; never sent anywhere. The UI says so |
| `<Discuss>` | Discussion prompts for class or family | Shows only in the facilitator view + as a collapsible in the lesson |
| `<Recap>` | Key takeaways | Used on the last step |
| `<ReadAloud />` | Reads the step aloud via the Web Speech API | On by default for the Explorers track; hidden if unsupported |

---

## 7. Page specs

### Home `/`
- **Hero:** a plain-language promise ("Free AI lessons for every K-12 learner. Always free."), two buttons ("Start learning" → /courses, "Bring ARK to your school" → /workshops), and a simple illustration or photo slot.
- **"Pick your level":** 3 track cards (color band, grade range, module count, total time, "Start" button).
- **"Continue where you left off"** card, shown only to signed-in learners with progress.
- The header shows "Sign in" / "Create free account" when signed out, and the learner's avatar menu when signed in (with a profile switcher for parent accounts).
- **How it works:** 3 steps (Attend a workshop or jump in → Learn at your own speed → Earn a certificate).
- **Credibility strip:** reviewer names and partner logos (UYS Academy). Hide the whole strip if it's empty; never show placeholders publicly.
- Impact numbers (lessons completed, learners reached) are pulled from a JSON file the team updates by hand.
- Footer: mission, links, privacy promise, contact.

### Course page `/courses/[track]` (Coursera-style)
- Header in the track color: title, grades, tagline, total modules, total time, "Start course" or "Resume" button, and the progress ring if started.
- **"What you'll learn":** 4-6 bullets.
- **Syllabus:** a module accordion. Each row shows number, title, duration, review status, progress (0/6 steps), and expands to the step list.
- **For educators:** a side card linking the facilitator guides and slides.
- On mobile, the sticky right column moves below the header.

### Module overview `/courses/[track]/[module]`
- Title, objectives, vocabulary preview, time, review badge.
- A step list with type icons and completion checks.
- "Start" / "Continue" button, plus an **optional 3-question pre-check** ("See what you already know"). The pre-check can be skipped with one click.

### Lesson player `/courses/[track]/[module]/[step]` (the most important screen)
- **Desktop:** a left sidebar with the module outline (steps with check marks, current one highlighted) that can collapse. The center has a reading column (`--reading` width). A thin progress bar sits at the top.
- **Mobile:** the outline becomes a bottom sheet opened from a "Step 3 of 6" button.
- A sticky bottom bar holds **Back** and **Next**. Next becomes "Mark complete & continue" on the last scroll position. Keyboard shortcuts: ← →.
- A step counts as complete when the learner hits Next, or answers a Check or Scenario.
- **The gate:** a signed-out visitor can do step 1 fully. Pressing Next on step 1 opens a friendly sign-up panel (not a hard redirect): "Keep going for free: create an account to save your progress and earn a certificate." It offers "Continue with Google", "Sign up with email", and "Already have an account? Sign in". Steps 2+ also check the session **on the server** and redirect to `/signin?next=<step>` if it's missing. Hiding them only in the UI doesn't count as a gate.
- Smooth page transitions via Astro View Transitions. The outline sidebar keeps its state between steps.
- **Explorers (K-5) variant:** larger type, read-aloud visible, more illustration space, shorter paragraphs, and bigger tap targets (48px).

### Completion `/…/complete`
- A calm celebration (confetti only if motion is allowed), a summary of what they learned, and the **post-check** (same questions as the pre-check, optional).
- If they did both checks, show "You improved from 1/3 to 3/3."
- **Certificate:** issued from the account. Show the module or course, the date, the ARK wordmark, and the learner's display name.
  - **13+ learners:** the certificate gets an unguessable ID and a "Verify at aireadiness4kids.org/verify/…" line. This is useful on LinkedIn and college applications.
  - **Under-13 learner profiles:** printable only, with no public verify page. The certificate shows the nickname the parent chose.
- Next module suggestion.

### My learning `/my-learning` (signed in)
- Tracks and modules in progress, with a "Continue" button on each.
- Completed modules, with a "Reprint certificate" option.
- For parent accounts, this page shows the active learner profile with a switcher.

### Sign-up flow `/signup`
1. **Age screen (neutral).** "How old are you?" with a month/year picker. It gives no hint that some ages get a different path, and it doesn't let the user go back and change the answer in the same session. Store only the **age band** (`under13`, `13to17`, `18plus`), never the birth date.
2. **13+:** "Continue with Google" or "Sign up with email" (email + password, then email verification). Then choose a display name (first name or nickname) and optional grade band.
3. **Under 13:** show "Ask a grown-up to set up your account." The flow switches to a **parent sign-up**. The parent signs up with Google or email and confirms they are the parent or guardian with a checkbox tied to a short plain-language notice. Then the parent adds one or more **learner profiles** (nickname + grade band only, no email, no photo). This works like streaming-service profiles.
4. After sign-up, merge any `localStorage` step-1 progress into the account, then send the learner back to where they were (`next` param, validated to be an internal path).

### Sign-in `/signin`
- "Continue with Google", email + password, "Forgot password?".
- Show a small note: "School Google account not working? Your school may block outside apps. Sign up with email instead."
- Errors are generic ("Email or password is incorrect"). They never reveal whether an email has an account.

### Account `/account`
- Edit display name, manage learner profiles (parents), and change password (email accounts).
- **Download my data** (JSON) and **Delete my account**. Deletion removes the profile, learner profiles, progress, and certificates, and unlinks check results. Confirm by typing "DELETE".

### Admin `/admin` (role `admin` only, checked on the server)
- Totals: accounts by age band, learners, module starts and completions, certificates, pre/post average change per module. Each can be filtered by `src` (workshop/partner) and date range.
- CSV export of aggregate numbers only. No individual learner data is shown on this page.

### Educators `/educators`
- How a teacher or parent can use ARK: run it live (presenter mode), assign links, or print guides.
- Guide pages render `guide.mdx` with objectives, timing, materials, discussion prompts, and answer notes. Add a print stylesheet so a guide prints cleanly on letter paper.
- Link to slides where `slides_url` exists.

### Presenter mode `/present/[track]/[module]`
For ARK-led workshops. The facilitator projects this view. It requires an account with the `facilitator` or `admin` role; founders grant the role with `scripts/set-role.ts` (section 8.1).
- Full-screen, large type, one step per screen, arrow-key navigation.
- On `check` steps, show a **QR code** linking learners to that check on their own phones, with `?src=` taken from the presenter URL.
- A "Show results" toggle is out of scope for V1. Results go to the Google Sheet.

---

## 8. Accounts, security, progress, and data

### 8.1 Auth setup (Firebase Authentication)
- **Use a new Firebase project just for ARK**, owned by an ARK organization Google account. Never share a project with another app.
- Sign-in providers: **Google** and **Email/Password**. Turn off all others. Require email verification for email accounts; the server treats an unverified email account as signed out for gated routes.
- **Authorized domains:** the production domain, the Netlify preview domain, and `localhost` only. In Google Cloud, restrict the Firebase web API key to those HTTP referrers.
- The Firebase web config (`apiKey`, `authDomain`, etc.) is public by design and can go in `PUBLIC_` env vars. The **service account key is secret**: it lives only in a server env var (`FIREBASE_SERVICE_ACCOUNT`, base64 JSON). It is never in the repo and never in client code. Add a build check that fails if `private_key` appears in any client bundle.
- **Session flow (httpOnly cookies, no tokens in the browser):**
  1. The client signs in with the Firebase JS SDK, with persistence set to `inMemoryPersistence`. Google uses `signInWithPopup`, falling back to redirect when the popup is blocked.
  2. The client POSTs the ID token to `/api/session`. The server verifies it with `firebase-admin` (`verifyIdToken(token, true)`), requires a sign-in within the last 5 minutes, and creates a **session cookie** (`createSessionCookie`, 5-day expiry). It is set as `__session`, `HttpOnly; Secure; SameSite=Lax; Path=/`.
  3. The client then signs out of the JS SDK. From then on the session lives only in the cookie.
  4. **Astro middleware** calls `verifySessionCookie(cookie, true)` on every gated request (steps 2+, `/my-learning`, `/account`, `/present`, `/admin`).
  5. Sign-out clears the cookie and calls `revokeRefreshTokens(uid)`.
- **CSRF:** every state-changing `/api/*` route accepts POST only and rejects requests whose `Origin` header isn't the site's own.
- **Roles** (`facilitator`, `admin`) are **custom claims**, set only by `scripts/set-role.ts`, which a founder runs locally with the service account. Users can't change them. The server checks the claim, never a field the client could edit.
- **Passwords:** at least 10 characters, enforced in the sign-up form. Also set it in Firebase's password policy settings if the project has them. Keep Firebase's **email enumeration protection** on.
- **Bot protection:** **Firebase App Check** with reCAPTCHA Enterprise (free tier) on the site. `/api/*` routes verify the App Check token. Firebase Auth's built-in rate limits cover sign-in attempts.
- The `next` redirect parameter only accepts internal paths starting with `/`. Anything else goes to `/my-learning`.

### 8.2 Database (Cloud Firestore, server-only access)
**The browser never talks to Firestore.** All reads and writes go through Astro server routes using `firebase-admin`, after the session cookie is verified. The Firestore security rules deny all client access:
```
rules_version = '2';
service cloud.firestore { match /databases/{db}/documents { match /{doc=**} { allow read, write: if false; } } }
```
The Admin SDK bypasses these rules, so **every server route must check ownership** through one shared helper: `requireLearner(uid, learnerId)` throws unless that learner belongs to that user. No route reads another user's path.

```
users/{uid}
  accountType: 'learner' | 'parent'
  ageBand: '13to17' | '18plus'          # parents are always '18plus'
  firstSrc, createdAt
users/{uid}/learners/{learnerId}
  nickname, gradeBand, isSelf, createdAt
  # every account has ≥1 learner: 13+ accounts get one with isSelf = true;
  # parent accounts get one per child
users/{uid}/learners/{learnerId}/progress/{moduleId}
  steps: { [stepId]: timestamp }, pre: {score, outOf, at}, post: {...}, completedAt
certificates/{certId}            # certId = random, unguessable
  uid, learnerId, scope: 'module'|'course', refId, displayName, issuedAt, public
checkResults/{autoId}
  uid?, learnerId?, anonSid?, src, moduleId, phase, answers, score, outOf, gradeBand, createdAt
stats/global, stats/bySrc_{src}, stats/byModule_{moduleId}, stats/daily_{yyyy-mm-dd}
  counters: accounts_{ageBand}, learners, moduleStarts, moduleCompletions, certificates,
            preScoreSum, preCount, postScoreSum, postCount
```
- **Impact numbers use running totals.** Every server write that changes a metric also updates the matching `stats` docs with `FieldValue.increment` in the same batch. `/admin` reads only the `stats` docs, so it's instant and never loads individual learners. Deeper analysis can come later through Firebase's BigQuery export extension.
- `/verify/[certId]` is a server route that returns only display name, course, and date, and only when `public = true`. Under-13 learner certificates are always `public = false`.
- **Tests (run against the Firebase Emulator Suite, never production):**
  - Two users: each API route rejects user A's session trying to read or write user B's learners, progress, or certificates.
  - A direct client SDK read or write to Firestore is denied by the rules.
  - A user without the `admin` claim gets 403 from `/admin` and its API.

The phase isn't done until these pass.

### 8.3 Data we collect, and why
| Data | Who | Why |
|---|---|---|
| Email | 13+ learners, parents | Sign-in and account recovery. Never used for marketing unless the user opts in separately |
| Display name / nickname | Everyone | Greeting and certificate |
| Age band | Everyone | Decides the sign-up path and certificate visibility. Never the birth date |
| Grade band | Optional | Picks the default track; aggregate reporting |
| Progress, check scores | Learners | Resume learning; impact numbers |
| `src` tag | Everyone | Workshop/partner attribution |

Reflections (`<Reflect>`) **stay in the browser only**, even when signed in. We don't need to hold kids' free-text writing. Children's profiles never have an email, photo, or free-text field that other people can see.

### 8.4 Security headers and hygiene
- Headers on every response: a strict `Content-Security-Policy` (self + the Firebase/Google auth and reCAPTCHA hosts + analytics host only), `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera, mic, and geolocation off), and `frame-ancestors 'none'`.
- Validate all API input with zod. Rate-limit `/api/checks` per IP and per `anon_sid`.
- Never log emails, tokens, or answers to the console in production.
- Run `npm audit` in CI. Pin dependency versions.
- Add `SECURITY.md` with a contact email for reporting issues.

### 8.5 Guest progress and source tracking
- Signed-out visitors: step-1 completion and pre-check go in `localStorage` key `ark.guest.v1` (wrapped in try/catch). They merge into the account on sign-up, then the key is cleared.
- Any URL with `?src=xyz` stores `src` (in the guest key, then `users/{uid}.firstSrc` on sign-up) and strips it from the address bar. Link pattern: `aireadiness4kids.org/?src=<partner>-<event>`, e.g. `?src=uys-fall26`.

### 8.6 Workshop knowledge checks (no login)
- QR links from presenter mode open `/check/[module]/[phase]?src=…`. This page is open to everyone: a few questions, then a thank-you with "Create a free account to keep learning."
- Submissions go to `/api/checks` with an anonymous random `anon_sid` kept in the browser. If the person later signs up, earlier anonymous results are linked to their learner.

### 8.7 Analytics (`analytics.ts`)
Cookie-free events sent to Umami (or a no-op if not configured): `lesson_start`, `step_complete`, `gate_shown`, `signup_complete {method, age_band}`, `module_complete`, `check_submit {phase, score_bucket}`, `certificate_issued`, `present_start`. Events never carry emails, names, IDs, or free text.

### 8.8 Legal pages (drafts for human review)
Write plain-language drafts of `/privacy` (with a section written for parents), `/terms`, and the parent confirmation notice. Mark each clearly **"DRAFT: needs legal review before launch."** Claude Code should not present these as final.

---

## 9. Quality bar and how Claude Code checks its own work

After every phase:
1. `npm run build` passes with zero warnings about missing alt text or broken links.
2. Playwright takes screenshots of every touched page at **375, 768, and 1280** widths into `screenshots/phase-N/` (gitignored). Look at them and fix anything that looks off before reporting.
3. axe finds zero serious or critical violations on touched pages.
4. Keyboard pass: every interactive element can be reached and has a visible focus ring.
5. From Phase 3 on: the two-user access tests pass on the Firebase emulator, signed-out requests to gated routes return a redirect (not the content), and no secret appears in the client bundle.
6. Commit with a clear message. One phase equals one or more commits; never mix phases.
7. Report: what was built, screenshots path, known gaps, and what's needed from the team.

**Don'ts:** Don't add dependencies without saying why. Use Tailwind and the existing shadcn/Radix components instead of adding new UI libraries. No tracking pixels and no third-party embeds that set cookies. Never push to `main` before cutover.

---

## 10. Build phases

| Phase | Output |
|---|---|
| **0: Setup** | Branch `platform-v1`, convert the Vite app to Astro (React + MDX + Tailwind), existing pages still working, tokens, fonts, base layout, header/footer, Logo component, `/dev/components` page, Playwright + axe wired up |
| **1: Catalog pages** | Home, /courses, course page, module overview. All 17 modules present as stubs from the content collection |
| **2: Lesson player + components** | Lesson player (desktop + mobile), all MDX components, full sample module (Bias in AI) |
| **3: Accounts + security** | Firebase setup guide, session-cookie auth, Firestore deny-all rules + ownership helper, role script, sign-up (age screen, 13+ and parent paths), sign-in, Google + email, reset, middleware gate, the step-1 sign-up panel, `/account` (profiles, export, delete), security headers, emulator access tests |
| **4: Progress + data** | Progress sync + guest merge, running-total `stats` counters, `?src=` capture, My learning, `/check` pages + `/api/checks`, analytics module |
| **5: Completion, educators, presenter, admin** | Certificates + `/verify`, educator pages + print CSS, presenter mode with QR (facilitator role), `/admin` impact page |
| **6: Port, polish, security review, ship** | Port about / get-involved / workshops copy, privacy/terms drafts, accessibility page, 404, performance pass, full a11y audit, security checklist review, deploy config |

---

## 11. Open questions for the team (Claude Code: flag them, don't guess)
- Final brand colors and logo. The tokens above are a starting point.
- The analytics provider choice (Umami vs. Cloudflare).
- Who owns the Firebase/Google Cloud project and the Netlify account. The Cloudflare account (domain + DNS) should also be under ARK ownership. Use an ARK organization email, not a personal one, with two founders as admins.
- Legal review of the privacy policy, terms, and parent notice before launch (a pro bono lawyer or a law school clinic).
- Reviewer names and credentials for badges.
- UYS Academy learners' age range, which decides which track leads the pilot.
- Photos or illustrations. Until then, use simple geometric shapes in the track colors, with no stock photos and no AI-generated images of children.
