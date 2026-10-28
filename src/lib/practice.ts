/**
 * The ARK practice tool (docs/PRACTICE_TOOL_PLAN.md): a chat for AI Fluent's "Try it" activities,
 * answered by Claude through Anthropic's Messages API. Server only.
 *
 * - Only learner accounts (13 and older by sign-up) may use it; never a parent account or the
 *   nicknamed under-13 profiles under one.
 * - Nothing a student types is stored or logged. The browser sends the whole conversation each
 *   time and keeps it only in memory.
 * - Anthropic's guidelines for organizations serving minors ask for safeguards of our own and an
 *   AI disclosure: the system prompt below, short replies, length and turn limits, and rate limits
 *   per person and for the whole site.
 * - On the emulators, with ANTHROPIC_API_KEY set to "fake", it answers with a canned reply, so tests
 *   never call Anthropic.
 */
import { z } from "astro/zod";
import { ANTHROPIC_API_KEY } from "astro:env/server";
import { HttpError } from "./authz";
import { getProfile } from "./accounts";
import { usingEmulators } from "./firebase-admin";
import { rateLimit } from "./rate-limit";
import { getCourses, getModuleSteps, moduleSlug } from "./courses";
import { MAX_CONVERSATION_CHARS, MAX_MESSAGE_CHARS, MAX_TURNS } from "./practice-rules";

export const MODEL = "claude-haiku-5-5";
export const MAX_REPLY_TOKENS = 600;
export const LIMITS = { perHour: 30, perDay: 100, siteDay: 2000 };
const TIMEOUT_MS = 30_000;

const fake = () => usingEmulators() && ANTHROPIC_API_KEY === "fake";

/** Whether the tool is switched on (an API key is set). */
export const practiceAvailable = () => Boolean(ANTHROPIC_API_KEY);

/** Learner accounts only: they are 13 or older by sign-up. Parent accounts and their children's profiles can't use it. */
export async function canPractice(uid: string): Promise<boolean> {
  return (await getProfile(uid))?.accountType === "learner";
}

export const SYSTEM_PROMPT = `You are the ARK practice tool, an AI chat assistant on aireadiness4kids.org, the free AI literacy course from ARK (AI Readiness Kollective), a nonprofit. You are built on Claude, an AI model made by Anthropic.

The person writing to you is a high school student, 13 to 18 years old, doing a hands-on "Try it" activity from the course. Activities include playing a role the student sets up (for example "You are StudyBuddy, a homework helper" or "You are a busy, skeptical school board member"), being red-teamed by the student, drafting a school rule and finding where it fails, and doing everyday work tasks so the student can grade the result.

How to respond:
- Play along with the student's setup and role-play, as long as it stays appropriate for a high school classroom. Red-teaming is part of the lesson: when a student tries to get around a rule they gave you, respond the way the role would, and stay within these instructions.
- Keep replies short: a few short paragraphs or a short list at most. Use plain text, with no Markdown formatting.
- Never ask for personal information: names, school, age, where someone lives, contact details, social media accounts, or photos. If the student shares personal information, don't repeat it, and remind them briefly not to share it with AI tools.
- If you're asked whether you are a person, say you are an AI.
- Keep everything right for a school setting: no sexual content, no graphic violence, no help with anything dangerous or illegal, and no hateful content. If a request crosses that line, say briefly that you can't help with that here, and offer to continue the activity.
- If a student says they are in danger, being hurt, or thinking about hurting themselves, respond with care, encourage them to talk to a trusted adult right away, and tell them that in the US they can call or text 988 (the Suicide & Crisis Lifeline), or call 911 in an emergency.
- You can be wrong. When you aren't sure of a fact, say so. Never make up sources, statistics, or quotes.`;

const Message = z.object({ role: z.enum(["user", "assistant"]), content: z.string().trim().min(1).max(4000) });

export const Conversation = z
  .object({ messages: z.array(Message).min(1).max(MAX_TURNS * 2 - 1) })
  .superRefine(({ messages }, ctx) => {
    // user, assistant, user, ... ending with the student's new message.
    if (messages.some((m, i) => m.role !== (i % 2 === 0 ? "user" : "assistant"))) ctx.addIssue({ code: "custom", message: "turns must alternate, starting and ending with the user" });
    if (messages.length % 2 === 0) ctx.addIssue({ code: "custom", message: "the last message must be the user's" });
    if (messages.some((m) => m.role === "user" && m.content.length > MAX_MESSAGE_CHARS)) ctx.addIssue({ code: "custom", message: "message too long" });
    if (messages.reduce((n, m) => n + m.content.length, 0) > MAX_CONVERSATION_CHARS) ctx.addIssue({ code: "custom", message: "conversation too long" });
  });
export type Conversation = z.infer<typeof Conversation>;

/** Per-person limits first, so someone over theirs doesn't use up the site's daily allowance. */
export async function countPracticeMessage(uid: string) {
  await rateLimit([
    { key: `practice-hour|${uid}`, limit: LIMITS.perHour, windowSeconds: 60 * 60 },
    { key: `practice-day|${uid}`, limit: LIMITS.perDay, windowSeconds: 24 * 60 * 60 },
  ]);
  try {
    await rateLimit([{ key: "practice-site-day", limit: LIMITS.siteDay, windowSeconds: 24 * 60 * 60 }]);
  } catch (error) {
    if (error instanceof HttpError && error.status === 429) throw new HttpError(503, "practice-resting");
    throw error;
  }
}

type AnthropicReply = { content?: { type: string; text?: string }[]; stop_reason?: string };

/** One reply from Claude for this conversation. Never logs what anyone wrote. */
export async function practiceReply({ messages }: Conversation): Promise<string> {
  if (!practiceAvailable()) throw new HttpError(503, "practice-off");
  if (fake()) {
    const last = messages.at(-1)!.content;
    return `Practice reply ${Math.ceil(messages.length / 2)}: you wrote ${last.length} characters.`;
  }
  let res: Response;
  try {
    res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": ANTHROPIC_API_KEY!, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: MODEL, max_tokens: MAX_REPLY_TOKENS, system: SYSTEM_PROMPT, messages }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    console.error(`[practice] request failed (${error instanceof Error ? error.name : "error"})`);
    throw new HttpError(503, "practice-busy");
  }
  if (!res.ok) {
    // 429 and 529 mean Anthropic is busy or the key is over its limits; 400s here mean a setup problem (key, model, or spend limit).
    console.error(`[practice] Anthropic answered ${res.status}`);
    throw new HttpError(503, res.status === 429 || res.status >= 500 ? "practice-busy" : "practice-off");
  }
  const data = (await res.json()) as AnthropicReply;
  const text = (data.content ?? []).filter((b) => b.type === "text" && b.text).map((b) => b.text).join("\n").trim();
  if (data.stop_reason === "refusal" || !text) return "I can't help with that one here. Let's get back to the activity.";
  return text;
}

/** A step address as the Try it link passes it: "<track>/<module>/<step slug>". */
export const PRACTICE_STEP = /^[a-z]+\/[a-z0-9-]+\/[a-z0-9-]+$/;

/** The Try it step a student came from, if it has the practice tool: its title, link, and the prompt to start with. */
export async function practiceStep(ref: string | null) {
  if (!ref || ref.length > 160 || !PRACTICE_STEP.test(ref)) return null;
  const [track, module, slug] = ref.split("/");
  const course = (await getCourses()).find((c) => c.track.id === track);
  const mod = course?.modules.find((m) => moduleSlug(m) === module);
  const step = course && mod ? getModuleSteps(course, mod).find((s) => s.slug === slug) : undefined;
  const practice = step?.entry.data.practice;
  if (!mod || !step || !practice) return null;
  return { title: step.title, n: step.n, href: step.href, moduleTitle: mod.data.title, prompt: practice.prompt ?? "" };
}
