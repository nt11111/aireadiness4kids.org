/**
 * The guest key (brief section 8.5): what a signed-out visitor does is kept in this browser only,
 * under localStorage "ark.guest.v1", and merged into their account when they sign up (then cleared).
 *
 *   src      the first ?src= tag this browser arrived with (workshop or partner)
 *   anonSid  a random id for anonymous workshop checks, so they can be linked on sign-up
 *   steps    { moduleId: [stepSlug] }    completed steps (a guest can only reach step 1)
 *   pre      { moduleId: { answers, score, total } }   the optional pre-check
 *
 * Storage can be blocked (private mode, school policies), so every access is wrapped in try/catch
 * and the site works the same without it; progress just isn't kept.
 */
export type GuestPre = { answers: Record<string, string>; score: number; total: number };
export type Guest = { v: 1; src?: string; anonSid?: string; steps: Record<string, string[]>; pre: Record<string, GuestPre> };

export const GUEST_KEY = "ark.guest.v1";
const VISIT_SRC_KEY = "ark.src.v1";
export const SRC_PATTERN = /^[a-z0-9-]{1,40}$/;
export const MODULE_PATTERN = /^[a-z]+\/[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const empty = (): Guest => ({ v: 1, steps: {}, pre: {} });

export function readGuest(): Guest {
  try {
    const raw = JSON.parse(localStorage.getItem(GUEST_KEY) ?? "null");
    if (!raw || raw.v !== 1) return empty();
    return { ...empty(), ...raw, steps: raw.steps ?? {}, pre: raw.pre ?? {} };
  } catch {
    return empty();
  }
}

export function updateGuest(change: (g: Guest) => void) {
  try {
    const g = readGuest();
    change(g);
    localStorage.setItem(GUEST_KEY, JSON.stringify(g));
  } catch {
    // storage blocked or full: nothing is kept, which is fine for a guest
  }
}

export function clearGuest() {
  try {
    localStorage.removeItem(GUEST_KEY);
  } catch {
    // nothing to clear
  }
}

/** Only well-formed module ids and step slugs; anything else (say, a preview page) is left out. */
export function guestProgress(g: Guest) {
  const steps = Object.fromEntries(
    Object.entries(g.steps)
      .filter(([m]) => MODULE_PATTERN.test(m))
      .map(([m, slugs]) => [m, [...new Set(slugs)].filter((s) => SLUG_PATTERN.test(s)).slice(0, 10)] as const)
      .filter(([, slugs]) => slugs.length > 0)
      .slice(0, 20),
  );
  const pre = Object.fromEntries(
    Object.entries(g.pre)
      .filter(([m, p]) => MODULE_PATTERN.test(m) && p && typeof p.answers === "object")
      .map(([m, p]) => [m, p.answers] as const)
      .slice(0, 20),
  );
  return { steps, pre, anonSid: g.anonSid };
}

export const hasGuestProgress = (g: Guest) => Object.keys(g.steps).length > 0 || Object.keys(g.pre).length > 0 || Boolean(g.anonSid);

/** The browser's anonymous id for workshop checks, created the first time it's needed. */
export function anonSid(): string {
  let id = readGuest().anonSid;
  if (!id) {
    id = crypto.randomUUID();
    const fresh = id;
    updateGuest((g) => { g.anonSid ??= fresh; });
    id = readGuest().anonSid ?? fresh;
  }
  return id;
}

/** Whether the non-secret "ark_si" hint says this browser may have a session (the server decides). */
export const signedInHint = () => /(?:^|;\s*)ark_si=1/.test(document.cookie);

/**
 * Keeps a ?src= tag: for this visit (workshop checks use it), and as the browser's first src for
 * sign-up if it doesn't have one yet and nobody's signed in.
 */
export function rememberSrc(src: string) {
  try {
    sessionStorage.setItem(VISIT_SRC_KEY, src);
  } catch {
    // not kept for this visit
  }
  if (!signedInHint()) updateGuest((g) => { g.src ??= src; });
}

/** The src for a workshop check: this visit's, else the browser's first one. */
export function currentSrc(): string | undefined {
  try {
    const visit = sessionStorage.getItem(VISIT_SRC_KEY);
    if (visit && SRC_PATTERN.test(visit)) return visit;
  } catch {
    // fall back to the guest key
  }
  const first = readGuest().src;
  return first && SRC_PATTERN.test(first) ? first : undefined;
}

/** The first src, sent once with sign-up so the account remembers where the learner came from. */
export function firstSrc(): string | undefined {
  const g = readGuest().src;
  return g && SRC_PATTERN.test(g) ? g : currentSrc();
}
