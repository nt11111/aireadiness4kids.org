/**
 * POSTs to our API from islands that are on many pages (progress, the header's learner switcher).
 * The App Check header needs the Firebase SDK and reCAPTCHA, so they're loaded with import() on the
 * first POST instead of with every page. (The sign-in pages use src/app/auth/api.ts instead: they
 * need the SDK anyway.)
 */
export async function post<T>(path: string, body: unknown): Promise<{ status: number; data: T | null }> {
  let headers: Record<string, string> = { "Content-Type": "application/json" };
  try {
    const { appCheckHeaders } = await import("../lesson/app-check");
    headers = { ...headers, ...(await appCheckHeaders()) };
  } catch {
    // the server answers 401 app-check, and the caller keeps what it has
  }
  try {
    const res = await fetch(path, { method: "POST", credentials: "same-origin", headers, body: JSON.stringify(body) });
    return { status: res.status, data: res.ok ? ((await res.json()) as T) : null };
  } catch {
    return { status: 0, data: null };
  }
}

/** A parent picks which child's profile this browser learns as; the page reloads to show that child's progress. */
export async function switchLearner(learnerId: string) {
  const { status } = await post("/api/account/learners/active", { learnerId });
  if (status >= 200 && status < 300) location.reload();
  return status;
}
