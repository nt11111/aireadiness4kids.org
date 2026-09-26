# Setting up Firebase for ARK

This guide sets up sign-in and the database for the ARK site. You don't need to write code. Follow the steps in order; it takes about 30 minutes. Screens in the Firebase and Google Cloud consoles change now and then, so a button may be in a slightly different place than described.

**Golden rule:** there is exactly **one secret** in this whole setup, the service account key (step 7). It goes into Netlify and nowhere else. Never commit it, email it, paste it in a chat, or leave the file in your Downloads folder. Everything else in this guide is public on purpose.

## What you're setting up, in one paragraph

People sign in with Google or with an email and password. Firebase Authentication checks who they are. ARK's server then gives the browser a session cookie that page scripts can't read, and the browser forgets everything else. All of ARK's data (profiles, progress, certificates) lives in Cloud Firestore, but only ARK's server can read or write it, using the secret key. Firestore's rules block every direct request from a browser. App Check (with reCAPTCHA Enterprise) proves requests come from the real ARK site, not a bot.

## Before you start

- Use an **ARK organization Google account** (for example, a shared founders account), not a personal one. Add a second founder as an Owner in step 1, so ARK never depends on one person.
- Have access to ARK's **Netlify** site settings.
- Use a computer you trust (you'll handle the secret key once).

## 1. Create the Firebase project

1. Go to <https://console.firebase.google.com> signed in as the ARK account and choose **Create a project**.
2. Name it something like `ark-learning`. Note the **project ID** it shows (for example `ark-learning-1a2b3`).
3. Google Analytics: **turn it off**. ARK doesn't use it (brief section 8.7).
4. When the project opens: gear icon > **Users and permissions** > **Add member** > the second founder's ARK email, role **Owner**.

This must be a **new project just for ARK**. Don't reuse one from another app.

## 2. Turn on sign-in methods

1. **Build > Authentication > Get started**.
2. **Sign-in method** tab:
   - **Email/Password**: enable it. Leave "Email link (passwordless sign-in)" **off**.
   - **Google**: enable it, set the public-facing name to "ARK" and the support email to the ARK account.
   - Make sure every other provider stays **off**.
3. **Settings** tab:
   - **User actions > Email enumeration protection**: make sure it's **on**. This stops anyone from using sign-in to find out who has an account.
   - **Password policy** (if you see it): require at least **10 characters**. The site's forms already require 10.

## 3. Authorized domains

**Authentication > Settings > Authorized domains.** The list should contain only:

- `aireadiness4kids.org`
- your Netlify site's domain, for example `aireadiness4kids.netlify.app`
- until the Phase 6 cutover, the `platform-v1` branch address `platform-v1--aireadiness4kids.netlify.app` (that's where the new site runs; Netlify's main address still shows the old site)
- `localhost`
- the `...firebaseapp.com` domain Firebase added itself (leave it)

Remove anything else. To test a Netlify **deploy preview**, add that preview's exact domain temporarily, then remove it.

## 4. Point email links at the site

So "confirm your email" and "reset your password" links open ARK's own page:

1. **Authentication > Templates**.
2. Open **Email address verification**, click the pencil, then **Customize action URL**, and enter:
   `https://aireadiness4kids.org/auth/callback`
3. That setting applies to all templates. While you're there, set the sender name to "ARK" on each template.

Until the site moves to aireadiness4kids.org (Phase 6), use the address where the new site runs instead, for example `https://platform-v1--aireadiness4kids.netlify.app/auth/callback`.

**If Firebase says "An error occurred updating action URL"** (the underlying error is `EMAIL_TEMPLATE_UPDATE_NOT_ALLOWED`; Firebase blocks this on some new projects), leave the default. Email links then open Firebase's own page, which confirms the email or resets the password and shows a **Continue** button back to ARK, because the site sends its own address with every email. Try again after launch.

## 5. Create the database and lock it

1. **Build > Firestore Database > Create database**.
2. Edition: **Standard**. Location: pick one near most learners (for the US, `nam5 (United States)`). This can't be changed later.
3. Start in **production mode** (it starts locked, which is what we want).
4. Open the **Rules** tab, replace everything with the contents of `firestore.rules` from the repo, and click **Publish**. The rules deny every browser request; only ARK's server (step 7) can read or write.

Or, from a terminal in the repo, after `firebase login`:

```bash
firebase deploy --only firestore:rules --project YOUR_PROJECT_ID
```

## 6. Register the web app (public values)

1. Gear icon > **Project settings > General > Your apps > Add app > Web** (the `</>` icon).
2. Nickname: `ARK website`. Don't set up Firebase Hosting.
3. Firebase shows a `firebaseConfig` block. These values are **public by design**: they identify the project but can't unlock anything, because the database rules deny browsers and the server checks every request. Copy them into Netlify (step 10):

| firebaseConfig field | Netlify variable |
|---|---|
| `apiKey` | `PUBLIC_FIREBASE_API_KEY` |
| `authDomain` | `PUBLIC_FIREBASE_AUTH_DOMAIN` |
| `projectId` | `PUBLIC_FIREBASE_PROJECT_ID` |
| `appId` | `PUBLIC_FIREBASE_APP_ID` |
| `messagingSenderId` | `PUBLIC_FIREBASE_MESSAGING_SENDER_ID` |

## 7. The service account key (SECRET)

This is the only secret. It lets ARK's server read and write the database and manage sign-ins.

1. **Project settings > Service accounts > Generate new private key > Generate key**. A `.json` file downloads.
2. Open the file in a text editor. You need two values from it:
   - `client_email` goes into Netlify as **`FIREBASE_CLIENT_EMAIL`**.
   - `private_key` goes into Netlify as **`FIREBASE_PRIVATE_KEY`**. Copy everything between the quotes, from `-----BEGIN PRIVATE KEY-----` through `-----END PRIVATE KEY-----\n`. The `\n` characters can stay as they are; the site turns them back into line breaks.
3. In Netlify, mark both as **secret** ("Contains secret values") and give them the **Functions** scope only (the build doesn't need them).
4. **Delete the downloaded file and empty the trash.** If you ever think the key leaked, go back to **Service accounts**, delete that key in Google Cloud (IAM > Service accounts > keys), and generate a new one.

## 8. App Check with reCAPTCHA Enterprise (bot protection)

ARK's server rejects any `/api` request without a valid App Check token, so **sign-in won't work until this is done**.

1. In Google Cloud (<https://console.cloud.google.com>, same project), open **Security > reCAPTCHA**. Enable the API if asked.
2. **Create key**: type **Website**; add the domains `aireadiness4kids.org` and your Netlify domain; leave "Use checkbox challenge" **off**. Copy the **key ID**. It's public: put it in Netlify as `PUBLIC_RECAPTCHA_SITE_KEY`.
3. In Firebase: **Build > App Check > Apps**, pick the web app, choose **reCAPTCHA Enterprise**, paste the same key, and save.
4. After a few days of real traffic, check **App Check > APIs > Authentication**. When nearly all requests show as verified, click **Enforce**. (You don't need to enforce it for Firestore: browsers never talk to Firestore, and ARK's server isn't affected.)

## 9. Restrict the API key

The public `apiKey` should only work from ARK's sites.

1. Google Cloud console > **APIs & Services > Credentials**. Open the key named "Browser key (auto created by Firebase)".
2. **Application restrictions > Websites**, add:
   - `https://aireadiness4kids.org/*`
   - `https://YOUR-SITE.netlify.app/*`
   - `https://YOUR_PROJECT_ID.firebaseapp.com/*` (the sign-in pop-up needs this)
   - `https://platform-v1--aireadiness4kids.netlify.app/*` (until the Phase 6 cutover)
   - `http://localhost:5180/*` (only if someone develops against the real project)
3. **API restrictions > Restrict key**, and allow only: **Identity Toolkit API**, **Token Service API**, and **Firebase App Check API**.
4. Save. It can take a few minutes to apply.

## 10. Netlify environment variables

Netlify > your site > **Site configuration > Environment variables**. Everything here totals well under Netlify's 4 KB limit for functions.

**On Netlify's free plan** you can't pick scopes ("Specific scopes" says "Upgrade to unlock"). That's OK: leave the defaults. Secret variables then get Builds, Functions, and Runtime, and the build check still fails if a private key ever reaches the browser's JavaScript. Don't set `NODE_ENV` for now (see below the table).

| Variable | Value from | Public or secret | Scopes |
|---|---|---|---|
| `PUBLIC_FIREBASE_API_KEY` | step 6 | public | Builds, Functions |
| `PUBLIC_FIREBASE_AUTH_DOMAIN` | step 6 | public | Builds, Functions |
| `PUBLIC_FIREBASE_PROJECT_ID` | step 6 | public | Builds, Functions |
| `PUBLIC_FIREBASE_APP_ID` | step 6 | public | Builds, Functions |
| `PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | step 6 | public | Builds, Functions |
| `PUBLIC_RECAPTCHA_SITE_KEY` | step 8 | public | Builds, Functions |
| `FIREBASE_CLIENT_EMAIL` | step 7 | **SECRET** | Functions only |
| `FIREBASE_PRIVATE_KEY` | step 7 | **SECRET** | Functions only |
| `NODE_ENV` = `production` | (type it) | public | Functions only; **not yet**, see below |

- `PUBLIC_` variables are built into the site's JavaScript, so anyone can see them. That's fine.
- The two secrets are only read by ARK's server code at runtime. The build fails if a private key ever shows up in the browser's JavaScript.
- `NODE_ENV=production` makes the server use React's fast production build. Without it pages still work, just slower. **Don't set it yet.** On the free plan it can't be limited to Functions, so it also reaches the build, where it makes Netlify skip dev dependencies. `astro.config.mjs` currently loads the test adapter (`@astrojs/node`, a dev dependency) on every build, so the build fails with "Cannot find module '@astrojs/node'". Once the config loads that adapter only for test builds, set it with **Different value for each deploy context**: `production` for Deploy Previews and Branch deploys, and for Production only after the Phase 6 cutover (until then Production builds the old site from `main`, which needs its dev dependencies).
- **Never** set `ARK_EMULATORS`, `FIREBASE_AUTH_EMULATOR_HOST`, or `FIRESTORE_EMULATOR_HOST` in Netlify. They're for local tests only, and the site refuses to start if it sees them next to a real project.

After changing variables, trigger a new deploy.

## 11. Give staff roles

Facilitators (who run presenter mode) and admins (who see impact totals) are set with a script; nobody can give themselves a role. The person must have signed up first.

```bash
# from the repo, with the secret values in your terminal session only
export PUBLIC_FIREBASE_PROJECT_ID=your-project-id
export FIREBASE_CLIENT_EMAIL='...'
export FIREBASE_PRIVATE_KEY='...'
node scripts/set-role.ts founder@example.org admin
node scripts/set-role.ts ambassador@example.org facilitator
node scripts/set-role.ts someone@example.org none      # remove a role
```

The person is signed out everywhere and gets the new role the next time they sign in. Close the terminal afterwards so the secret isn't left in it.

## 12. Check it works

On the deployed site:

1. Open a lesson's first step while signed out, press **Next**, and check the "Keep going for free" panel appears.
2. Sign up with email, confirm the email from the link, sign in, and check you land on step 2.
3. Sign out and try opening step 2 directly: you should land on the sign-in page.
4. In the browser's developer tools (Network tab), click the page and check the response headers include `content-security-policy` and `strict-transport-security`.
5. Try **Download my data** and **Delete my account** on a test account.

## Local development and tests

Tests never touch this project. `npm test` starts the Firebase **emulators** with a pretend project called `demo-ark`, which can't reach real Firebase. You need:

- the Firebase CLI: `npm install -g firebase-tools`
- Java 21 or newer (the database emulator needs it), for example `brew install openjdk@21`

Then:

```bash
npm test                 # builds a test copy, starts the emulators, runs every test
npm run test:security    # just the security, database-rules, and sign-in tests
```

To click around locally with sign-in: `npm run build:test`, then `npm run emulators` in one terminal and `npm run preview` in another, and open <http://127.0.0.1:4321>. Accounts you create there live only in the emulator and disappear when it stops.

## If something goes wrong

| What you see | Likely cause |
|---|---|
| "Accounts aren't switched on yet" | The `PUBLIC_FIREBASE_*` variables aren't set, or the site wasn't redeployed after setting them. |
| "Sign-in isn't set up for this address yet" | The domain isn't in **Authorized domains** (step 3) or the API key's website list (step 9). |
| "We couldn't confirm this request came from the ARK site" | App Check isn't set up (step 8), or the reCAPTCHA key doesn't list this domain. |
| An `/api` request returns `503` | `FIREBASE_CLIENT_EMAIL` or `FIREBASE_PRIVATE_KEY` is missing or pasted wrong. |
| Google sign-in pop-up opens and closes | Pop-ups or third-party cookies are blocked. Try email sign-in, or allow pop-ups for the site. |
