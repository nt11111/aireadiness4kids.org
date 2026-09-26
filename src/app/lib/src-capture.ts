/**
 * ?src= capture (brief section 8.5). Links like aireadiness4kids.org/?src=uys-fall26 tag where a
 * learner came from. The tag is kept in this browser (see guest.ts) and removed from the address
 * bar, so it isn't bookmarked, shared onward, or sent to analytics. Loaded on every page.
 */
import { rememberSrc, SRC_PATTERN } from "../lesson/guest";

function capture() {
  const url = new URL(location.href);
  const raw = url.searchParams.get("src");
  if (raw === null) return;
  const src = raw.trim().toLowerCase();
  if (SRC_PATTERN.test(src)) rememberSrc(src);
  url.searchParams.delete("src");
  // Keep the client router's history state; only the visible address changes.
  history.replaceState(history.state, "", `${url.pathname}${url.search}${url.hash}`);
}

capture();
// Pages that use the client router fire this after each navigation (and once on load; running
// twice is harmless because the tag is gone after the first).
document.addEventListener("astro:page-load", capture);
