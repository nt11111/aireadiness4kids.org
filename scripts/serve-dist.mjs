// Minimal static server for the prerendered build (the Netlify adapter has no `astro preview`).
// Used by Playwright and `npm run preview`. Honors dist/_redirects (plain "from to status" lines, as
// Netlify would) and serves dist/404.html with status 404 for unknown paths.
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join, extname, normalize } from "node:path";

const DIST = fileURLToPath(new URL("../dist/", import.meta.url));
const port = Number(process.argv[process.argv.indexOf("--port") + 1]) || 4321;
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".woff": "font/woff", ".ico": "image/x-icon", ".json": "application/json", ".txt": "text/plain" };

const REDIRECTS = new Map(
  (existsSync(join(DIST, "_redirects")) ? readFileSync(join(DIST, "_redirects"), "utf8") : "")
    .split("\n").map((l) => l.trim().split(/\s+/)).filter(([from, to]) => from && to && !from.startsWith("#"))
    .map(([from, to, status]) => [from, { to, status: Number(status) || 301 }]),
);

const resolve = async (url) => {
  const path = normalize(decodeURIComponent(url.split("?")[0])).replace(/^(\.\.[/\\])+/, "");
  for (const c of [path, join(path, "index.html"), `${path.replace(/\/$/, "")}.html`]) {
    try { const p = join(DIST, c); if ((await stat(p)).isFile()) return p; } catch {}
  }
  return null;
};

createServer(async (req, res) => {
  const redirect = REDIRECTS.get((req.url ?? "/").split("?")[0]);
  if (redirect) { res.writeHead(redirect.status, { Location: redirect.to }); res.end(); return; }
  const file = await resolve(req.url ?? "/");
  const status = file ? 200 : 404;
  const body = await readFile(file ?? join(DIST, "404.html"));
  res.writeHead(status, { "Content-Type": (file ? TYPES[extname(file)] : TYPES[".html"]) ?? "application/octet-stream" });
  res.end(body);
}).listen(port, () => console.log(`serving dist/ at http://localhost:${port}`));
