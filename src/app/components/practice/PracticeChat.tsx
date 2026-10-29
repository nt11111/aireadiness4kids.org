import { useId, useRef, useState, type FormEvent } from "react";
import { RotateCcw } from "lucide-react";
import { MAX_CONVERSATION_CHARS, MAX_MESSAGE_CHARS, MAX_TURNS } from "../../../lib/practice-rules";
import { postJSON } from "../../auth/api";
import { Notice, SubmitButton } from "../auth/Field";
import { Button } from "../ui/button";
import { useEarlyInput } from "../ui/use-hydration";
import { cn } from "../ui/utils";

type Message = { role: "user" | "assistant"; content: string };

function errorText(status: number, code: string | undefined): string {
  if (status === 401 && code === "signed-out") return "You've been signed out. Sign in again to keep practicing.";
  switch (code) {
    case "rate-limited":
      return "You've sent a lot of messages. Take a break and try again later.";
    case "practice-resting":
      return "The practice tool is resting for today. Use the \"No AI tool?\" version of the activity instead.";
    case "practice-busy":
      return "The practice tool is busy right now. Wait a moment and try again.";
    case "practice-off":
      return "The practice tool isn't available right now. Use the \"No AI tool?\" version of the activity instead.";
    case "learners-only":
      return "The practice tool is for learner accounts, ages 13 and up.";
    case "invalid":
    case "too-large":
      return "This conversation is too long. Start over to keep practicing.";
    case "network":
      return "We couldn't reach ARK. Check your connection and try again.";
    case "app-check":
      return "We couldn't confirm this request came from the ARK site. Refresh the page and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

/**
 * The ARK practice tool's chat (src/lib/practice.ts). The conversation lives only in this
 * component's memory: nothing is saved in the browser or by ARK, and it's gone when the tab closes.
 */
export function PracticeChat({ initialPrompt = "" }: { initialPrompt?: string }) {
  const id = useId();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState(initialPrompt);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const box = useRef<HTMLTextAreaElement>(null);
  useEarlyInput(box, text, (el) => setText(el.value));

  const turns = messages.filter((m) => m.role === "user").length;
  const used = messages.reduce((n, m) => n + m.content.length, 0);
  // A reply can run to a few thousand characters, so a conversation this close to the cap is done.
  const full = turns >= MAX_TURNS || used > MAX_CONVERSATION_CHARS - 4000;
  const tooLong = text.length > MAX_MESSAGE_CHARS;

  async function send(e: FormEvent) {
    e.preventDefault();
    const content = text.trim();
    if (!content || busy || full) return;
    if (tooLong) return setError(`Keep your message under ${MAX_MESSAGE_CHARS.toLocaleString("en-US")} characters.`);
    if (used + content.length > MAX_CONVERSATION_CHARS) return setError("This conversation is too long. Start over to keep practicing.");
    const next: Message[] = [...messages, { role: "user", content }];
    setMessages(next);
    setText("");
    setError(null);
    setBusy(true);
    const res = await postJSON<{ reply: string }>("/api/practice", { messages: next });
    setBusy(false);
    if (res.ok && res.data.reply) {
      setMessages([...next, { role: "assistant", content: res.data.reply }]);
    } else {
      // Put the message back so nothing typed is lost, and drop it from the conversation.
      setMessages(messages);
      setText(content);
      setError(errorText(res.status, res.data.error));
    }
    box.current?.focus();
  }

  function startOver() {
    setMessages([]);
    setText(initialPrompt);
    setError(null);
    box.current?.focus();
  }

  return (
    <div className="grid gap-5">
      <div role="log" aria-label="Conversation" className={cn("grid gap-3", messages.length === 0 && "sr-only")}>
        {messages.map((m, i) => (
          <div
            key={i}
            data-practice-message={m.role}
            className={cn("rounded-xl border p-4", m.role === "user" ? "ml-6 border-line bg-surface-2 sm:ml-16" : "mr-6 border-brand/30 bg-surface shadow-1 sm:mr-16")}
          >
            <p className="font-display text-small font-bold text-ink-soft">{m.role === "user" ? "You" : "Practice tool (AI)"}</p>
            <p className="mt-1.5 whitespace-pre-wrap break-words text-lesson text-ink">{m.content}</p>
          </div>
        ))}
      </div>

      <p role="status" className={cn("text-ui text-ink-soft", !busy && "sr-only")}>{busy ? "The practice tool is writing a reply…" : ""}</p>

      {error && <Notice kind="error">{error}</Notice>}

      {full ? (
        <Notice kind="info">This conversation is full. Start over to keep practicing.</Notice>
      ) : (
        <form onSubmit={send} noValidate className="grid gap-2">
          <label htmlFor={`${id}-text`} className="text-ui font-bold text-ink">Your message</label>
          {/* A plain textarea (styled like ui/textarea) so the ref reaches it: React 18 function components don't forward refs. */}
          <textarea
            ref={box}
            id={`${id}-text`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-describedby={`${id}-count`}
            aria-invalid={tooLong || undefined}
            rows={5}
            className="field-sizing-content min-h-32 w-full resize-y rounded-md border-[1.5px] border-input bg-input-background px-3 py-2 text-ui text-ink placeholder:text-ink-faint focus-visible:border-ring aria-invalid:border-destructive"
          />
          <p id={`${id}-count`} className={cn("text-small", tooLong ? "font-bold text-danger" : "text-ink-soft")}>
            {text.length.toLocaleString("en-US")} of {MAX_MESSAGE_CHARS.toLocaleString("en-US")} characters
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <SubmitButton loading={busy} disabled={!text.trim()}>Send</SubmitButton>
            {messages.length > 0 && (
              <Button type="button" variant="outline" onClick={startOver} disabled={busy}>
                <RotateCcw aria-hidden="true" className="size-4" />
                Start over
              </Button>
            )}
          </div>
        </form>
      )}
      {full && (
        <div>
          <Button type="button" variant="outline" onClick={startOver}>
            <RotateCcw aria-hidden="true" className="size-4" />
            Start over
          </Button>
        </div>
      )}
    </div>
  );
}
