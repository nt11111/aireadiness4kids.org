/**
 * Which routes need what (brief section 8.1): lesson steps 2+, completion pages, /my-learning,
 * /account, /certificates, and the progress and certificate APIs need a signed-in user; /present needs the facilitator (or admin) role; /admin needs admin.
 */
import { getCourses } from "./courses";

export type Gate = "open" | "user" | "facilitator" | "admin";

let lockedSteps: Promise<Set<string>> | undefined;

/** URL paths of every lesson step after the first in its module. */
function lockedStepPaths() {
  lockedSteps ??= getCourses().then((courses) => {
    const paths = new Set<string>();
    for (const course of courses) for (const steps of course.steps.values()) for (const step of steps.slice(1)) paths.add(step.href);
    return paths;
  });
  return lockedSteps;
}

/**
 * Normalizes the path the way routing sees it (decoded, no repeated or trailing slashes), so
 * "/%61ccount" or "/account/" can't slip past as a different string.
 */
export function normalizePath(pathname: string): string | null {
  let decoded: string;
  try {
    decoded = pathname.split("/").map(decodeURIComponent).join("/");
  } catch {
    return null;
  }
  const collapsed = decoded.replace(/\/{2,}/g, "/").replace(/\/+$/, "");
  return collapsed || "/";
}

export async function gateFor(pathname: string): Promise<Gate> {
  const path = normalizePath(pathname);
  if (path === null) return "user"; // malformed encoding: treat as private, never as open
  const under = (prefix: string) => path === prefix || path.startsWith(`${prefix}/`);
  if (under("/admin") || under("/api/admin")) return "admin";
  if (under("/present")) return "facilitator";
  if (["/account", "/my-learning", "/certificates", "/api/account", "/api/progress", "/api/certificates"].some(under)) return "user";
  if (/^\/courses\/[^/]+\/[^/]+\/complete$/.test(path)) return "user";
  if (/^\/courses\/[^/]+\/[^/]+\/[^/]+$/.test(path)) return (await lockedStepPaths()).has(path) ? "user" : "open";
  return "open";
}
