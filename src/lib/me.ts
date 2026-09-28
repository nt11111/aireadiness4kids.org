/**
 * Who's signed in, for the site header: a first name, the account type, the role, and (for parents)
 * the learner nicknames for the profile switcher. Never an email. Used by GET /api/me (static pages
 * ask it after load) and by BaseLayout on server-rendered pages, so their header is right on first paint.
 */
import type { AstroCookies } from "astro";
import { getProfile } from "./accounts";
import { activeLearner } from "./learning";
import type { SessionUser } from "./session";

export type HeaderMe = {
  displayName: string;
  accountType: string;
  role: string | null;
  learnerId?: string | null;
  learners?: { id: string; nickname: string }[];
};

export async function headerMe(user: SessionUser | null | undefined, cookies: AstroCookies): Promise<HeaderMe | null> {
  if (!user) return null;
  const profile = await getProfile(user.uid);
  if (!profile) return null;
  const parent = profile.accountType === "parent";
  const { learner, learners } = parent ? await activeLearner(user.uid, cookies) : { learner: null, learners: [] };
  return {
    displayName: profile.displayName,
    accountType: profile.accountType,
    role: user.role,
    ...(parent ? { learnerId: learner?.id ?? null, learners: learners.map((l) => ({ id: l.id, nickname: l.nickname })) } : {}),
  };
}
