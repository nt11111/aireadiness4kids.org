// Post-build checks (brief sections 8.1, 8.4, and 9.1). Fails the build if:
//  - any <img> lacks an alt attribute (alt="" is allowed for decorative images)
//  - any internal link, asset, or #anchor doesn't resolve to a static file or a server-rendered route
//  - a page contains an inline <script> the Content-Security-Policy doesn't allow (src/lib/security)
//  - a service-account key, or the names of the server secrets, appear in any client bundle
//  - a redirect in _redirects points at a page that doesn't exist
//  - the _headers file with the security headers is missing
// Usage: node scripts/check-dist.mjs [--dir dist]   (the folder with the static files)
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, relative, extname, resolve } from "node:path";
import { inlineScriptHashes, sha256 } from "../src/lib/security/policy.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const dirArg = process.argv.indexOf("--dir");
const DIST = resolve(ROOT, dirArg > -1 ? process.argv[dirArg + 1] : "dist") + "/";
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const files = walk(DIST);
const html = files.filter((f) => f.endsWith(".html"));
const problems = [];

// Server-rendered routes have no file in the build; links to them are valid if the route exists.
const MODULES = join(ROOT, "src/content/modules");
const stepPaths = new Set(
  readdirSync(MODULES).flatMap((track) =>
    readdirSync(join(MODULES, track)).flatMap((mod) =>
      readdirSync(join(MODULES, track, mod))
        .map((f) => /^\d{2}-([a-z0-9-]+)\.mdx$/.exec(f)?.[1])
        .filter(Boolean)
        .map((slug) => `/courses/${track}/${mod}/${slug}`),
    ),
  ),
);
// A module with steps also has a server-rendered completion page.
for (const path of [...stepPaths]) stepPaths.add(path.replace(/[^/]+$/, "complete"));
const SSR_PAGES = new Set(["/account", "/my-learning", "/admin", "/forbidden"]);
const SSR_PREFIXES = ["/present/", "/api/"];
const isServerRoute = (path) => {
  const clean = decodeURIComponent(path.replace(/\/$/, "")) || "/";
  return stepPaths.has(clean) || SSR_PAGES.has(clean) || SSR_PREFIXES.some((p) => clean.startsWith(p));
};

const pageFor = (path) => {
  const clean = decodeURIComponent(path.replace(/\/$/, "")) || "/";
  const candidates = clean === "/" ? ["index.html"] : [`${clean.slice(1)}/index.html`, `${clean.slice(1)}.html`, clean.slice(1)];
  return candidates.map((c) => join(DIST, c)).find((p) => existsSync(p) && statSync(p).isFile());
};
const idsIn = (file) => new Set([...readFileSync(file, "utf8").matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
const allowedScripts = new Set(inlineScriptHashes());

for (const file of html) {
  const src = readFileSync(file, "utf8");
  const where = "/" + relative(DIST, file);
  for (const [tag] of src.matchAll(/<img\b[^>]*>/g)) {
    if (!/\balt=/.test(tag)) problems.push(`${where}: <img> without alt: ${tag.slice(0, 120)}`);
  }
  for (const m of src.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/type="application\/(ld\+)?json"/.test(m[1])) continue;
    if (!allowedScripts.has(sha256(m[2]))) problems.push(`${where}: inline <script> not allowed by the CSP: ${m[2].slice(0, 80).replace(/\s+/g, " ")}`);
  }
  const refs = [
    ...[...src.matchAll(/<a\b[^>]*\bhref="([^"]*)"/g)].map((m) => ["link", m[1]]),
    ...[...src.matchAll(/<(?:img|script|source|track|video)\b[^>]*\bsrc="([^"]*)"/g)].map((m) => ["asset", m[1]]),
    ...[...src.matchAll(/<video\b[^>]*\bposter="([^"]*)"/g)].map((m) => ["asset", m[1]]),
    ...[...src.matchAll(/<link\b[^>]*\bhref="([^"]*)"/g)].map((m) => ["asset", m[1]]),
  ];
  for (const [kind, raw] of refs) {
    const ref = raw.replace(/&amp;/g, "&");
    if (!ref || /^(https?:|mailto:|tel:|data:|\/\/)/.test(ref)) continue;
    if (ref === "#") { problems.push(`${where}: placeholder link href="#"`); continue; }
    const [pathPart, hash] = ref.split("#");
    const path = (pathPart || where).split("?")[0];
    if (kind === "link" && isServerRoute(path)) continue;
    const target = kind === "link" && !extname(path) ? pageFor(path) : existsSync(join(DIST, path)) ? join(DIST, path) : pageFor(path);
    if (!target) { problems.push(`${where}: broken ${kind} ${ref}`); continue; }
    if (hash && target.endsWith(".html") && !idsIn(target).has(hash)) problems.push(`${where}: missing anchor #${hash} in ${ref}`);
  }
}

const redirects = existsSync(join(DIST, "_redirects")) ? readFileSync(join(DIST, "_redirects"), "utf8").split("\n").map((l) => l.trim().split(/\s+/)).filter(([f, t]) => f && t && !f.startsWith("#")) : [];
for (const [from, to] of redirects) {
  if (to.startsWith("/") && !pageFor(to.split("#")[0]) && !isServerRoute(to)) problems.push(`_redirects: ${from} points to missing page ${to}`);
}

if (!existsSync(join(DIST, "_headers")) || !readFileSync(join(DIST, "_headers"), "utf8").includes("Content-Security-Policy")) {
  problems.push("_headers with the security headers is missing");
}

// Anything that would mean a server secret reached the browser.
const SECRET_PATTERNS = [/private_key/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/, /FIREBASE_PRIVATE_KEY/, /FIREBASE_CLIENT_EMAIL/, /iam\.gserviceaccount\.com/];
for (const js of files.filter((f) => f.endsWith(".js") && f.includes("/_astro/"))) {
  const text = readFileSync(js, "utf8");
  const hit = SECRET_PATTERNS.find((p) => p.test(text));
  if (hit) problems.push(`${relative(DIST, js)}: client bundle matches ${hit}`);
}

if (problems.length) {
  console.error(`\ncheck-dist: ${problems.length} problem(s)\n` + problems.map((p) => `  - ${p}`).join("\n"));
  process.exit(1);
}
console.log(`check-dist: ${html.length} pages and ${redirects.length} redirects OK (alt text, links and anchors, redirect targets, CSP-safe inline scripts, security headers, no secrets in client bundles)`);
