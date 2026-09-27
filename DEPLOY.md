# Deploying ARK: the cutover to Netlify

This moves **aireadiness4kids.org** from the old site on GitHub Pages to the new course platform on Netlify.

- **The domain and DNS stay in Cloudflare.** Only DNS records change. Nothing is transferred.
- **Netlify** builds and hosts the site from the `main` branch (`netlify.toml`).
- **GitHub Actions** no longer deploys anything. `.github/workflows/ci.yml` only builds and tests.

Plan about an hour, at a quiet time. The old site keeps serving until the DNS change (step 4), and the DNS change is the only step visitors notice. Rollback is at the end.

---

## What things look like today (checked 2026-09-27)

| Thing | Today |
|---|---|
| DNS | Cloudflare (nameservers `amy.ns.cloudflare.com`, `ignat.ns.cloudflare.com`) |
| `aireadiness4kids.org` and `www` | **Proxied** (orange cloud), so the public lookup shows Cloudflare's IPs, not GitHub's |
| `www` | Redirects (301) to `https://aireadiness4kids.org/` |
| GitHub Pages | Repo `nt11111/aireadiness4kids.org`, built by the `deploy.yml` workflow from `main`, custom domain `aireadiness4kids.org` |
| GitHub Pages certificate | Failed (`bad_authz`, expired 2026-09-22). GitHub can't renew it while Cloudflare proxies the domain; Cloudflare's own certificate is what visitors see. Not a problem for the cutover, and it goes away with it |
| Netlify project | `aireadiness4kids` (free plan); production branch `main`; `platform-v1` is a branch deploy at `platform-v1--aireadiness4kids.netlify.app` |
| Email | Cloudflare Email Routing (the `TXT` SPF record `v=spf1 include:_spf.mx.cloudflare.net ~all` and Cloudflare's `MX` records). **Don't touch these.** |

---

## Before the cutover (can be done any time, nothing visible changes)

1. **Firebase: authorized domains.** Firebase console > project `ark-learning-58324` > Authentication > Settings > Authorized domains. Make sure `aireadiness4kids.org` and `www.aireadiness4kids.org` are both listed (keep `localhost` and `platform-v1--aireadiness4kids.netlify.app`).
2. **Google Cloud: API key referrers.** Google Cloud console > APIs & Services > Credentials > the Browser key. Under Website restrictions, make sure `https://aireadiness4kids.org/*` and `https://www.aireadiness4kids.org/*` are there.
3. **reCAPTCHA Enterprise key domains.** Google Cloud console > Security > reCAPTCHA > key "ARK website" > Domains: add `aireadiness4kids.org` and `www.aireadiness4kids.org` if missing.
4. **Netlify environment variables** (Site configuration > Environment variables). All the variables in `docs/SETUP_FIREBASE.md` must have real values in the **Production** context, not only for branch deploys. Paste the real `PUBLIC_FIREBASE_API_KEY` if it still says `apiKey`.
5. **Netlify `NODE_ENV`.** Add `NODE_ENV` with **Different value for each deploy context**: `production` for Production, Deploy Previews, and Branch deploys. (This used to break the build; since Phase 6, `astro.config.mjs` loads the test-only adapter only for test builds, so it is safe on the new code. Don't set it for Production while `main` still has the old site.)
6. **Lower the DNS TTL.** Cloudflare > `aireadiness4kids.org` > DNS > Records. The records are proxied now (their TTL shows "Auto"), and grey-cloud records created in step 4 will use the TTL you pick. Choose **5 min** so a rollback spreads quickly.
7. **Write down the current records** (screenshot the DNS page). You need them for a rollback.

---

## Cutover

### Step 1. Merge `platform-v1` into `main`

After the review, on GitHub: open a pull request from `platform-v1` into `main`, wait for the **CI** check to pass, and merge it.

What happens:
- Netlify builds `main` (the new site) as its production deploy, at `https://aireadiness4kids.netlify.app`.
- GitHub Pages does **not** redeploy: the merge deletes `deploy.yml` (and `public/CNAME`). The old site stays exactly as it was on aireadiness4kids.org until the DNS changes.

### Step 2. Check the new site on Netlify's address

Open `https://aireadiness4kids.netlify.app` and check: the home page, `/courses`, a module, step 1 of Bias in AI, `/about`, `/workshops`, `/programs` (redirects to `/workshops`), `/curriculum` (redirects to `/courses`), `/privacy`, and a 404 page. Sign-in won't work on this address unless it's an authorized domain; that's expected. Netlify > Deploys should show the production deploy as **Published**.

### Step 3. Add the custom domain in Netlify

Netlify > project `aireadiness4kids` > Domain management > **Add a domain**.

1. Enter `aireadiness4kids.org` and choose **Add domain**. When Netlify asks whether to use Netlify DNS, choose to **keep the DNS where it is** (external DNS). Netlify then shows "Awaiting External DNS"; that's expected.
2. Netlify adds `www.aireadiness4kids.org` automatically. If it doesn't, add it too.
3. Set **`aireadiness4kids.org` as the primary domain**. Netlify then redirects `www` to it with a 301.

If Netlify says the domain is already used by another Netlify site, it lets you verify ownership with a `TXT` record; add it in Cloudflare exactly as shown (DNS only).

### Step 4. Change the DNS records in Cloudflare

Cloudflare > `aireadiness4kids.org` > DNS > Records.

**Remove the GitHub Pages records.** Because they are proxied, the public lookup doesn't show them, so check the list in the dashboard. They are normally:

| Type | Name | Content |
|---|---|---|
| A | `aireadiness4kids.org` (`@`) | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA | `@` (if present) | `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153` |
| CNAME | `www` | `nt11111.github.io` |

Delete every `A`/`AAAA` record on `@` and the `www` record that points at GitHub (`185.199.x.x`, `2606:50c0:…`, or `*.github.io`). If what you see is different, delete whatever `@` and `www` web records point at GitHub, and **stop and ask** if something points somewhere else. Leave every `MX` and `TXT` record alone (email and verification).

**Add Netlify's records, both DNS only (grey cloud):**

| Type | Name | Target | Proxy status | TTL |
|---|---|---|---|---|
| CNAME | `@` | `apex-loadbalancer.netlify.com` | **DNS only** (grey cloud) | 5 min |
| CNAME | `www` | `aireadiness4kids.netlify.app` | **DNS only** (grey cloud) | 5 min |

- A `CNAME` on `@` is allowed in Cloudflare: it uses CNAME flattening. This is the option Netlify recommends. If Cloudflare refuses it, use an `A` record on `@` to `75.2.60.5` instead (DNS only).
- **The grey cloud matters.** With the orange cloud, Netlify can't issue the SSL certificate, and Netlify's own CDN and headers sit behind Cloudflare's.

### Step 5. Wait for the certificate

Netlify > Domain management > **HTTPS**. Netlify notices the DNS change within minutes (up to an hour; rarely a day) and issues a Let's Encrypt certificate for both names. If it shows "Waiting on DNS propagation" for more than an hour, choose **Verify DNS configuration**, then **Provision certificate**.

Check from a terminal (the answer should be Netlify's, with no Cloudflare):

```bash
dig +short aireadiness4kids.org
```

```bash
curl -sI https://aireadiness4kids.org | grep -i -E "^(HTTP|server|strict-transport)"
```

Expect `server: Netlify` and the `strict-transport-security` header. `https://www.aireadiness4kids.org` should 301 to `https://aireadiness4kids.org/`.

### Step 6. Test on the real domain

- Sign in with Google and with email; open `/my-learning`; go to step 2 of Bias in AI; sign out.
- Open `/admin` as a founder.
- Visit `/programs` and `/curriculum` (redirects), and a made-up URL (friendly 404).
- In the browser's developer tools, the Console shows no Content-Security-Policy errors.

### Step 7. Remove the domain from GitHub Pages (after about a week)

Wait until the new site has run cleanly for about a week (the rollback below relies on GitHub Pages still being there). Then: GitHub > `nt11111/aireadiness4kids.org` > **Settings > Pages**:

1. Under **Custom domain**, choose **Remove**.
2. Under **Build and deployment**, choose **Unpublish site** (or set the source to None) so the old site stops being served at `nt11111.github.io/aireadiness4kids.org`.

Optional but good: GitHub > your account **Settings > Pages > Add a domain** to verify `aireadiness4kids.org`, which stops anyone else from claiming it on GitHub Pages.

### Step 8. Tidy up

- Raise the Cloudflare TTLs back to **Auto** (or 1 hour).
- In Cloudflare, check for **Redirect Rules / Page Rules** on `www` or the apex (Rules > Overview). With grey-cloud records they no longer run; Netlify now does the `www` redirect, so delete them to avoid confusion.
- Update `CLAUDE.md` ("Current state") to say `main` is the Astro site on Netlify.

---

## Rollback

**If the new site has a problem after step 4**, point the DNS back to GitHub Pages. The old site is still published there until step 7.

1. Cloudflare > DNS: delete the two Netlify `CNAME` records (`@` and `www`).
2. Re-create the records you wrote down before the cutover, **proxied (orange cloud) as they were**: the four `A` records on `@` (`185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`), any `AAAA` records, and `www` `CNAME` `nt11111.github.io`.
3. With the 5-minute TTL, most visitors see the old site again within minutes.

The GitHub repo can stay as it is while you fix the problem: `main` has the new code, but nothing redeploys GitHub Pages, so the old site stays as it was. Fix forward on `platform-v1` (or a branch), check it on Netlify's branch deploy, merge, and repeat steps 4 to 6.

**If you need to roll back after step 7** (GitHub Pages already unpublished): check out the last old-site commit on `main` (`8d7d427` or later) in a new branch, restore `.github/workflows/deploy.yml` and `public/CNAME` from it, set Pages > Source to **GitHub Actions**, run the workflow, re-add the custom domain in Pages settings, then do the DNS steps above.

**Netlify-only rollback** (a bad deploy, not a DNS problem): Netlify > Deploys > pick the last good deploy > **Publish deploy**. This is instant and doesn't touch DNS.
