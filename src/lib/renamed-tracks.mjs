// @ts-check
/**
 * The courses were renamed in October 2026: AI Explorers became AI Aware, AI Investigators became
 * AI Literate, and AI Architects became AI Fluent. Old track id -> new track id.
 *
 * This is the only place the old ids live. astro.config.mjs turns it into permanent redirects from
 * every old course, educator guide, and presenter URL; src/app/lesson/guest.ts uses it to map module
 * ids in guest progress saved before the rename ("investigators/bias-in-ai" -> "literate/bias-in-ai").
 */
export const RENAMED_TRACKS = /** @type {const} */ ({ explorers: "aware", investigators: "literate", architects: "fluent" });

/**
 * A module id under its current track id; ids that don't start with an old track id are returned as they are.
 * @param {string} id
 */
export function renameModuleId(id) {
  const slash = id.indexOf("/");
  const track = slash > 0 ? /** @type {Record<string, string>} */ (RENAMED_TRACKS)[id.slice(0, slash)] : undefined;
  return track ? `${track}${id.slice(slash)}` : id;
}
