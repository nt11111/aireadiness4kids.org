import { useEffect, useRef, useState } from "react";
import { Square, Volume2 } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";

const READABLE = "h1, h2, h3, h4, p, li, legend, label, figcaption, dt, dd, blockquote, [data-read]";

/** The text a listener should hear: headings, paragraphs, list items, and question text, each once, skipping controls and sources. */
function collect(root: Element) {
  const all = [...root.querySelectorAll<HTMLElement>(READABLE)].filter((el) => !el.closest("[data-read-skip], [data-footnotes], button, [hidden], [aria-hidden='true']"));
  const set = new Set(all);
  return all
    .filter((el) => {
      for (let p = el.parentElement; p && p !== root; p = p.parentElement) if (set.has(p)) return false;
      return el.checkVisibility ? el.checkVisibility() : true;
    })
    .map((el) => {
      // Drop citation numbers ("...systems.1") so they aren't read out mid-sentence.
      const copy = el.cloneNode(true) as HTMLElement;
      copy.querySelectorAll("sup, [data-footnote-ref]").forEach((n) => n.remove());
      return (copy.textContent ?? "").replace(/\s+/g, " ").trim();
    })
    .filter(Boolean);
}

/**
 * <ReadAloud />: reads the step aloud with the browser's built-in speech (Web Speech API).
 * Shown on every Explorers step; other tracks can add it. Renders nothing if the browser can't speak.
 * It never starts on its own.
 */
export function ReadAloud({ target = "[data-lesson-article]", className }: { target?: string; className?: string }) {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const run = useRef(0);

  useEffect(() => {
    setSupported(!!window.speechSynthesis && typeof window.SpeechSynthesisUtterance === "function");
    const stop = () => { run.current++; window.speechSynthesis?.cancel(); setSpeaking(false); };
    document.addEventListener("astro:before-preparation", stop);
    return () => { document.removeEventListener("astro:before-preparation", stop); stop(); };
  }, []);

  if (!supported) return null;

  const stop = () => { run.current++; speechSynthesis.cancel(); setSpeaking(false); };

  const start = () => {
    const root = document.querySelector(target);
    if (!root) return;
    speechSynthesis.cancel();
    const id = ++run.current;
    const parts = collect(root);
    // One utterance per block: long single utterances get cut off in some browsers.
    parts.forEach((text, i) => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = document.documentElement.lang || "en-US";
      u.rate = 0.95;
      if (i === parts.length - 1) u.onend = () => { if (run.current === id) setSpeaking(false); };
      u.onerror = () => { if (run.current === id) setSpeaking(false); };
      speechSynthesis.speak(u);
    });
    setSpeaking(parts.length > 0);
  };

  return (
    <div data-read-skip className={cn("flex items-center gap-3", className)}>
      <Button type="button" variant="secondary" className="min-h-[var(--tap)]" onClick={speaking ? stop : start} aria-pressed={speaking}>
        {speaking ? <Square aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
        {speaking ? "Stop reading" : "Read aloud"}
      </Button>
      <span role="status" className="text-small text-ink-soft">{speaking ? "Reading this step aloud." : ""}</span>
    </div>
  );
}
