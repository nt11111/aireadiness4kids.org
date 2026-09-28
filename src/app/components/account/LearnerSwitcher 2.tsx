import { useState } from "react";
import { Check } from "lucide-react";
import { switchLearner } from "../../lib/post";
import { useHydrated } from "../ui/use-hydration";
import { cn } from "../ui/utils";

type Learner = { id: string; nickname: string };

/**
 * A parent's profile switcher (brief section 7, "My learning"). Like streaming-service profiles:
 * pick who's learning and the page shows that child's progress. The choice is a cookie the server
 * checks against the account every time (it can only ever point at your own learners).
 */
export function LearnerSwitcher({ learners, activeId }: { learners: Learner[]; activeId: string | null }) {
  const hydrated = useHydrated();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState(false);

  async function choose(id: string) {
    if (id === activeId || busy) return;
    setBusy(id);
    setError(false);
    const status = await switchLearner(id);
    if (status < 200 || status >= 300) {
      setBusy(null);
      setError(true);
    }
  }

  return (
    <div role="group" aria-labelledby="switcher-h" className="rounded-xl border border-line bg-surface p-5 shadow-1 sm:w-fit sm:min-w-[20rem] sm:p-6">
      <h2 id="switcher-h" className="font-sans text-small font-bold uppercase tracking-[0.12em] text-ink-soft">Who's learning?</h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {learners.map((l) => {
          const active = l.id === activeId;
          return (
            <li key={l.id}>
              <button
                type="button"
                aria-pressed={active}
                disabled={!hydrated || Boolean(busy)}
                onClick={() => choose(l.id)}
                className={cn(
                  "inline-flex min-h-[var(--tap)] items-center gap-2 rounded-full border-[1.5px] px-4 text-ui font-bold transition-colors disabled:cursor-default",
                  active ? "border-primary bg-brand-soft text-ink" : "border-line bg-surface text-ink-soft hover:border-input hover:text-ink",
                )}
              >
                <span aria-hidden="true" className="grid size-7 place-items-center rounded-full bg-surface-2 font-display text-ui text-brand">{l.nickname.slice(0, 1).toUpperCase()}</span>
                {l.nickname}
                {active && <Check aria-hidden="true" className="size-4 text-brand" />}
              </button>
            </li>
          );
        })}
      </ul>
      <p role="status" className="mt-3 text-small text-ink-soft empty:hidden">
        {busy ? `Switching to ${learners.find((l) => l.id === busy)?.nickname ?? "that profile"}…` : error ? "That didn't work. Refresh the page and try again." : ""}
      </p>
    </div>
  );
}
