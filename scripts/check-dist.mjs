// Post-build checks (brief section 9.1 and 8.1). Fails the build if:
//  - any <img> lacks an alt attribute (alt="" is allowed for decorative images)
//  - any internal link, asset, or #anchor doesn't resolve to something in dist/
//  - a service-account "private_key" appears in any client bundle
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, relative, extname } from "node:path";

const DIST = fileURLToPath(new URL("../dist/", import.meta.url));
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const files = walk(DIST);
const html = files.filter((f) => f.endsWith(".html"));
const problems = [];

const pageFor = (path) => {
  const clean = decodeURIComponent(path.replace(/\/$/, "")) || "/";
  const candidates = clean === "/" ? ["index.html"] : [`${clean.slice(1)}/index.html`, `${clean.slice(1)}.html`, clean.slice(1)];
  return candidates.map((c) => join(DIST, c)).find((p) => existsSync(p) && statSync(p).isFile());
};
const idsIn = (file) => new Set([...readFileSync(file, "utf8").matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));

for (const file of html) {
  const src = readFileSync(file, "utf8");
  const where = "/" + relative(DIST, file);
  for (const [tag] of src.matchAll(/<img\b[^>]*>/g)) {
    if (!/\balt=/.test(tag)) problems.push(`${where}: <img> without alt: ${tag.slice(0, 120)}`);
  }
  const refs = [
    ...[...src.matchAll(/<a\b[^>]*\bhref="([^"]*)"/g)].map((m) => ["link", m[1]]),
    ...[...src.matchAll(/<(?:img|script)\b[^>]*\bsrc="([^"]*)"/g)].map((m) => ["asset", m[1]]),
    ...[...src.matchAll(/<link\b[^>]*\bhref="([^"]*)"/g)].map((m) => ["asset", m[1]]),
  ];
  for (const [kind, raw] of refs) {
    const ref = raw.replace(/&amp;/g, "&");
    if (!ref || /^(https?:|mailto:|tel:|data:|\/\/)/.test(ref)) continue;
    if (ref === "#") { problems.push(`${where}: placeholder link href="#"`); continue; }
    const [pathPart, hash] = ref.split("#");
    const path = (pathPart || where).split("?")[0];
    const target = kind === "link" && !extname(path) ? pageFor(path) : existsSync(join(DIST, path)) ? join(DIST, path) : pageFor(path);
    if (!target) { problems.push(`${where}: broken ${kind} ${ref}`); continue; }
    if (hash && target.endsWith(".html") && !idsIn(target).has(hash)) problems.push(`${where}: missing anchor #${hash} in ${ref}`);
  }
}

for (const js of files.filter((f) => f.endsWith(".js") && f.includes("/_astro/"))) {
  if (readFileSync(js, "utf8").includes("private_key")) problems.push(`${relative(DIST, js)}: contains "private_key"`);
}

if (problems.length) {
  console.error(`\ncheck-dist: ${problems.length} problem(s)\n` + problems.map((p) => `  - ${p}`).join("\n"));
  process.exit(1);
}
console.log(`check-dist: ${html.length} pages OK (alt text, internal links and anchors, no secrets in client bundles)`);
