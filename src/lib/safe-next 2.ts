/**
 * The `next` redirect parameter only accepts internal paths starting with "/" (brief section 8.1).
 * Anything else, including "//evil.example", "/\evil.example", "https://...", "javascript:...",
 * control characters, and /api/ paths, falls back to /my-learning. Used on the server and in the browser.
 */
export const DEFAULT_NEXT = "/my-learning";
const PROBE = "https://ark.invalid";

export function safeNext(raw: unknown, fallback = DEFAULT_NEXT): string {
  if (typeof raw !== "string" || raw.length === 0 || raw.length > 512) return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;
  // Backslashes and control characters (browsers treat "\" like "/" and strip tabs and newlines).
  if (/[\\\u0000-\u001F\u007F]/.test(raw)) return fallback;
  let url: URL;
  try {
    url = new URL(raw, PROBE);
  } catch {
    return fallback;
  }
  if (url.origin !== PROBE) return fallback;
  if (url.pathname === "/api" || url.pathname.startsWith("/api/")) return fallback;
  return `${url.pathname}${url.search}${url.hash}`;
}
