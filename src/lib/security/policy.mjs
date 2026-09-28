// Security headers for every response (brief section 8.4). Plain JS so both astro.config.mjs
// (which writes dist/_headers for static pages) and src/middleware.ts (server-rendered pages)
// build the exact same policy.
import { createHash } from "node:crypto";
import loadDirective from "astro/client/load.prebuilt.js";
import idleDirective from "astro/client/idle.prebuilt.js";
import visibleDirective from "astro/client/visible.prebuilt.js";
import mediaDirective from "astro/client/media.prebuilt.js";
import onlyDirective from "astro/client/only.prebuilt.js";
import islandScript from "astro/runtime/server/astro-island.prebuilt.js";
import { JS_FLAG_SCRIPT } from "./inline-scripts.mjs";

/**
 * Every inline script a page may contain: Astro's island loaders (fixed per Astro version) and
 * the one in inline-scripts.mjs. Everything else must be a file served from this site.
 */
export const INLINE_SCRIPTS = [loadDirective, idleDirective, visibleDirective, mediaDirective, onlyDirective, islandScript, JS_FLAG_SCRIPT];

export const sha256 = (text) => createHash("sha256").update(text).digest("base64");
export const inlineScriptHashes = () => INLINE_SCRIPTS.map(sha256);

// Hosts Firebase Auth, App Check, and reCAPTCHA Enterprise need. Nothing else third-party is allowed.
const GOOGLE_SCRIPTS = ["https://apis.google.com", "https://www.google.com/recaptcha/", "https://www.gstatic.com/recaptcha/"];
const GOOGLE_CONNECT = [
  "https://identitytoolkit.googleapis.com",
  "https://securetoken.googleapis.com",
  "https://firebaseappcheck.googleapis.com",
  "https://content-firebaseappcheck.googleapis.com",
  "https://www.google.com/recaptcha/",
];
const GOOGLE_FRAMES = ["https://www.google.com/recaptcha/", "https://recaptcha.google.com/recaptcha/"];

/** Umami Cloud (brief section 8.7): its tracker script, and the host it sends events to. Allowed only when PUBLIC_UMAMI_ID is set. */
export const UMAMI = { script: "https://cloud.umami.is/script.js", scriptOrigin: "https://cloud.umami.is", eventOrigin: "https://gateway.umami.is" };

/**
 * @param {{ authDomain?: string, emulatorOrigins?: string[], https?: boolean, analytics?: boolean }} opts
 *   authDomain: Firebase auth domain (its /__/auth/ iframe handles Google sign-in).
 *   emulatorOrigins: local Firebase emulators, only in test builds.
 *   https: false for http://localhost test servers (skips upgrade-insecure-requests).
 *   analytics: true when Umami is configured (PUBLIC_UMAMI_ID), to allow its script and event host.
 */
export function contentSecurityPolicy({ authDomain, emulatorOrigins = [], https = true, analytics = false } = {}) {
  const hashes = inlineScriptHashes().map((h) => `'sha256-${h}'`);
  const frames = [authDomain ? `https://${authDomain}` : null, ...GOOGLE_FRAMES, ...emulatorOrigins].filter(Boolean);
  const directives = [
    "default-src 'self'",
    // Scripts: our own files, the inline scripts above (by hash), and Google's auth/reCAPTCHA hosts.
    `script-src 'self' ${hashes.join(" ")} ${[...GOOGLE_SCRIPTS, ...(analytics ? [UMAMI.scriptOrigin] : [])].join(" ")}`,
    // Inline styles stay allowed: style attributes (progress bars, popover positions) and Astro's
    // page-transition styles use them. Script injection is the XSS risk, and scripts are locked down.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://www.gstatic.com/recaptcha/",
    "font-src 'self'",
    "media-src 'self'",
    `connect-src 'self' ${[...GOOGLE_CONNECT, ...(analytics ? [UMAMI.scriptOrigin, UMAMI.eventOrigin] : []), ...emulatorOrigins].join(" ")}`,
    `frame-src ${frames.join(" ")}`,
    "worker-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ];
  if (https) directives.push("upgrade-insecure-requests");
  return directives.join("; ");
}

/** All headers from brief section 8.4, plus X-Frame-Options for old browsers and COOP that still allows the Google sign-in popup. */
export function securityHeaders(opts = {}) {
  return {
    "Content-Security-Policy": contentSecurityPolicy(opts),
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
    "X-Frame-Options": "DENY",
    "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
  };
}

/** Netlify `_headers` file contents for the static pages (server-rendered pages get the same headers from the middleware). */
export function netlifyHeadersFile(opts = {}) {
  const lines = ["/*", ...Object.entries(securityHeaders(opts)).map(([k, v]) => `  ${k}: ${v}`)];
  lines.push("/_astro/*", "  Cache-Control: public, max-age=31536000, immutable");
  return `${lines.join("\n")}\n`;
}
