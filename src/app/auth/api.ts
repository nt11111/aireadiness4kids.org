/**
 * Calls to our own /api routes from the browser: JSON, same-origin, with the App Check header.
 * The Firebase SDK (for App Check) loads with import() on the first call, so pages that only POST
 * on submit, like the workshop check that a whole room opens on phones, don't download it up front.
 */

export type ApiResult<T = Record<string, unknown>> = { ok: boolean; status: number; data: T & { error?: string } };

export async function postJSON<T = Record<string, unknown>>(path: string, body: unknown, { appCheck = true } = {}): Promise<ApiResult<T>> {
  let headers: Record<string, string> = { "Content-Type": "application/json" };
  try {
    if (appCheck) {
      const { appCheckHeaders } = await import("../../lib/firebase-client");
      headers = { ...headers, ...(await appCheckHeaders()) };
    }
  } catch {
    return { ok: false, status: 0, data: { error: "app-check" } as T & { error: string } };
  }
  try {
    const res = await fetch(path, { method: "POST", credentials: "same-origin", headers, body: JSON.stringify(body) });
    let data = {} as T & { error?: string };
    try {
      data = await res.json();
    } catch {
      // empty body
    }
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: { error: "network" } as T & { error: string } };
  }
}

/** Plain-language messages for API errors. */
export function apiErrorMessage(code: string | undefined): string {
  switch (code) {
    case "recent-sign-in-required":
      return "For your security, please sign in again first.";
    case "too-many-learners":
      return "You can have up to 10 learner profiles.";
    case "invalid":
      return "Check the highlighted fields and try again.";
    case "network":
      return "We couldn't reach ARK. Check your connection and try again.";
    case "app-check":
      return "We couldn't confirm this request came from the ARK site. Refresh the page and try again.";
    case "not-configured":
      return "Accounts aren't switched on yet. Please try again later.";
    default:
      return "Something went wrong. Please try again.";
  }
}
