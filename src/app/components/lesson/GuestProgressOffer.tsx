import { lazy, Suspense, useEffect, useState } from "react";
import { hasGuestProgress, readGuest, signedInHint } from "../../lesson/guest";

export const LATER_KEY = "ark.guest.offer.later";

// The dialog, the progress store, and Radix Dialog load only when there's something to offer, so the
// other pages (nearly every visit) don't download them.
const Offer = lazy(() => import("./GuestProgressOfferDialog").then((m) => ({ default: m.Offer })));

/**
 * On a shared computer, one person's guest progress must not slip into the next person's account
 * (brief section 8.5). When someone signs in on a browser that holds guest progress from before,
 * and this account wasn't created here, ask. "No thanks" deletes the browser's copy. Closing the
 * dialog asks again next visit. Mounted on every page; it does nothing unless there's progress to offer.
 */
export function GuestProgressOffer() {
  const [eligible, setEligible] = useState(false);
  useEffect(() => {
    let later = false;
    try {
      later = sessionStorage.getItem(LATER_KEY) === "1";
    } catch {
      // storage blocked: ask
    }
    // Cheap checks first, so the progress store only loads when there's something to offer.
    if (!later && signedInHint() && hasGuestProgress(readGuest())) setEligible(true);
  }, []);
  return eligible ? <Suspense fallback={null}><Offer /></Suspense> : null;
}
