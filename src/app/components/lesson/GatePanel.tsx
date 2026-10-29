import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../ui/dialog";
import { buttonVariants } from "../ui/button";
import { cn } from "../ui/utils";

/**
 * The sign-up step (brief section 7) shown when a signed-out learner presses Next on the last open step.
 * It's not a redirect: they can close it and stay. The next step is also locked on the server, so this
 * panel is a courtesy, not the lock. Sign-up starts with the neutral age screen, which sends under-13s
 * to a grown-up, so this panel explains both paths instead of asking for an age itself.
 */
export function GatePanel({ open, onOpenChange, next, done, total }: { open: boolean; onOpenChange: (open: boolean) => void; next: string; done: number; total: number }) {
  const q = `next=${encodeURIComponent(next)}`;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[min(32rem,calc(100%-2rem))] gap-0 border-2 border-ink p-0 sm:max-w-lg"
        // It's opened by the Next link (or the arrow key), so return focus there when it closes.
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          document.querySelector<HTMLElement>("[data-lesson-next]")?.focus();
        }}
      >
        <div className="border-b-2 border-ink bg-surface-2 px-6 py-5 pr-14">
          <p className="font-display text-small font-bold text-ink-soft">You finished {done} of {total} steps</p>
          <DialogTitle className="mt-1 font-display text-display-sm font-bold text-ink">Save your place to keep going.</DialogTitle>
        </div>
        <div className="px-6 py-5">
          <DialogDescription className="text-ui text-ink">A free account remembers where you stopped, so you can finish later. It takes about a minute.</DialogDescription>
          <dl className="mt-4 border-t-2 border-ink">
            <div className="border-b border-line py-3">
              <dt className="font-display font-bold text-ink">Under 13</dt>
              <dd className="text-ui text-ink-soft">A grown-up sets it up. You get a nickname, never an email.</dd>
            </div>
            <div className="border-b border-line py-3">
              <dt className="font-display font-bold text-ink">13 or older</dt>
              <dd className="text-ui text-ink-soft">Make your own free account with an email or Google.</dd>
            </div>
          </dl>
          <a href={`/signup?${q}`} className={cn(buttonVariants({ size: "lg" }), "mt-5 w-full")}>Make a free account</a>
          <p className="mt-4 text-ui text-ink-soft">
            Already have an account? <a href={`/signin?${q}`} className="font-bold text-brand underline underline-offset-4">Sign in</a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
