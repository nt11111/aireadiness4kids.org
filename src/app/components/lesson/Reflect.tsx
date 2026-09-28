import { useEffect, useId, useRef, useState } from "react";
import { Lock } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

type Props = { prompt: string; stepId?: string; /** Tells two reflections on one step apart. */ id?: string };

const PREFIX = "ark.reflect.v1";

/**
 * <Reflect>: free-text reflection (brief sections 6 and 8.3). Saved only in this browser's
 * localStorage, even for signed-in learners, and never sent anywhere. The UI says so.
 */
export function Reflect({ prompt, stepId = "sample", id = "main" }: Props) {
  const uid = useId();
  const key = `${PREFIX}:${stepId}:${id}`;
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "saved" | "cleared" | "unavailable">("idle");
  const timer = useRef<number>();
  const firstLoad = useRef(true);

  useEffect(() => {
    // Anything typed before this island hydrated is still in the box. Keep it (and save it) rather
    // than loading the saved answer over it; the box wasn't showing that answer while they typed.
    const early = firstLoad.current ? (document.getElementById(`${uid}-text`) as HTMLTextAreaElement | null)?.value : "";
    firstLoad.current = false;
    if (early) {
      save(early);
      return;
    }
    try {
      setText(localStorage.getItem(key) ?? "");
    } catch {
      setStatus("unavailable");
    }
  }, [key]);

  const save = (value: string) => {
    setText(value);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      try {
        if (value) localStorage.setItem(key, value);
        else localStorage.removeItem(key);
        setStatus("saved");
      } catch {
        setStatus("unavailable");
      }
    }, 400);
  };

  const clear = () => {
    window.clearTimeout(timer.current);
    setText("");
    try { localStorage.removeItem(key); setStatus("cleared"); } catch { setStatus("unavailable"); }
  };

  const message = {
    idle: "",
    saved: "Saved on this device.",
    cleared: "Cleared from this device.",
    unavailable: "This browser can't save it, so your answer will disappear when you leave the page.",
  }[status];

  return (
    <div className="rounded-xl border border-line bg-surface p-5 shadow-1 sm:p-6">
      <label htmlFor={`${uid}-text`} className="block text-lesson font-bold text-ink">{prompt}</label>
      <p id={`${uid}-privacy`} className="mt-2 flex gap-2 text-small text-ink-soft">
        <Lock aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <span>Only saved in this browser, on this device. It is never sent to ARK or anyone else. On a shared computer, clear it when you're done.</span>
      </p>
      <Textarea
        id={`${uid}-text`}
        aria-describedby={`${uid}-privacy`}
        value={text}
        onChange={(e) => save(e.target.value)}
        rows={5}
        className="mt-3 min-h-32 border-[1.5px] text-ui md:text-ui"
      />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p role="status" className="text-small text-ink-soft">{message}</p>
        <Button type="button" variant="ghost" size="sm" className="min-h-[var(--tap)]" onClick={clear} disabled={!text}>
          Clear my answer
        </Button>
      </div>
    </div>
  );
}
