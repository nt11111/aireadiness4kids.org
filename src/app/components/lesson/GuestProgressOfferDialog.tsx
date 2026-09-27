import { useState } from "react";
import { acceptGuestProgress, declineGuestProgress, useProgress } from "../../lesson/progress";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Notice } from "../auth/Field";
import { LATER_KEY } from "./GuestProgressOffer";

/** The dialog itself. Loaded only when GuestProgressOffer finds progress to offer (see there). */
export function Offer() {
  const { offer, learner, accountType } = useProgress();
  const [busy, setBusy] = useState<"add" | "skip" | null>(null);
  const [error, setError] = useState(false);
  const [closed, setClosed] = useState(false);
  const into = accountType === "parent" && learner ? `${learner.nickname}'s profile` : "your account";

  async function add() {
    setBusy("add");
    setError(false);
    if (await acceptGuestProgress()) {
      // Pages drawn on the server (My learning) don't know about the new progress until they reload.
      if (document.querySelector("[data-server-progress]")) location.reload();
    } else {
      setError(true);
    }
    setBusy(null);
  }

  function skip() {
    setBusy("skip");
    declineGuestProgress();
    setBusy(null);
  }

  function later(open: boolean) {
    if (open || busy) return;
    try {
      sessionStorage.setItem(LATER_KEY, "1");
    } catch {
      // asks again on the next page
    }
    setClosed(true);
  }

  return (
    <Dialog open={offer && !closed} onOpenChange={later}>
      <DialogContent className="max-w-[min(28rem,calc(100%-2rem))] gap-0 p-6 sm:max-w-md sm:p-8">
        <DialogTitle className="pr-10 font-display text-display-sm font-semibold text-ink">Progress found on this device</DialogTitle>
        <DialogDescription className="mt-2 text-ui text-ink-soft">
          We found progress on this device from before you signed in. Add it to {into}?
        </DialogDescription>
        {error && <div className="mt-4"><Notice kind="error">That didn't work. Check your connection and try again.</Notice></div>}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button type="button" size="lg" onClick={add} loading={busy === "add"} disabled={Boolean(busy)}>Add it</Button>
          <Button type="button" size="lg" variant="outline" onClick={skip} disabled={Boolean(busy)}>No thanks</Button>
        </div>
        <p className="mt-4 text-small text-ink-soft">"No thanks" removes it from this device. Nothing is added to your account.</p>
      </DialogContent>
    </Dialog>
  );
}
