import { ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../ui/dialog";
import { buttonVariants } from "../ui/button";
import { cn } from "../ui/utils";

/**
 * The friendly sign-up panel (brief section 7) shown when a signed-out learner presses Next on step 1.
 * It's not a redirect: they can close it and stay. Step 2 is also locked on the server, so this panel
 * is a courtesy, not the lock. Google sign-up still goes through the age screen first.
 */
export function GatePanel({ open, onOpenChange, next }: { open: boolean; onOpenChange: (open: boolean) => void; next: string }) {
  const q = `next=${encodeURIComponent(next)}`;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[min(28rem,calc(100%-2rem))] gap-0 p-6 sm:max-w-md sm:p-8"
        // It's opened by the Next link (or the arrow key), so return focus there when it closes.
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          document.querySelector<HTMLElement>("[data-lesson-next]")?.focus();
        }}
      >
        <DialogTitle className="pr-10 font-display text-display-sm font-semibold text-ink">Keep going for free</DialogTitle>
        <DialogDescription className="mt-2 text-ui text-ink-soft">Create an account to save your progress and earn a certificate.</DialogDescription>
        <div className="mt-6 grid gap-3">
          <a href={`/signup?method=google&${q}`} className={cn(buttonVariants({ size: "lg" }), "w-full")}>
            Continue with Google <ArrowRight aria-hidden="true" />
          </a>
          <a href={`/signup?${q}`} className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full")}>Sign up with email</a>
        </div>
        <p className="mt-5 text-ui text-ink-soft">
          Already have an account? <a href={`/signin?${q}`} className="font-bold text-brand underline underline-offset-4">Sign in</a>
        </p>
      </DialogContent>
    </Dialog>
  );
}
