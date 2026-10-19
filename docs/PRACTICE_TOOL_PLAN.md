# ARK practice tool: plan

The six AI Fluent "Try it" activities say "Use an AI tool your school allows, or the ARK practice tool once it launches." This plan builds that tool: a chat page on the site, answered by Claude through ARK's server.

**Status: built** on the `diagrams-and-practice-tool` branch. It stays off until `ANTHROPIC_API_KEY` is set (see For you to do). Two changes from the plan while building:

- Four Try it activities link to the tool, not five. AI Fluent 1's asks the AI to build a flashcard app and then break it by using it, which a chat can't do: there's no app to run. Its "No AI tool?" version still works.
- Only two activities have a prompt to start with (StudyBuddy and the skeptical board member), because they're the only ones that quote one. The other two open the tool with an empty box.

## What students get

- A page at `/practice`, linked from 4 of the 6 AI Fluent Try it activities (AI Fluent 2, 4, 5, and 6; the fairness slider is a different tool, and AI Fluent 1 needs an app the chat can't run). The link opens in a new tab and fills the message box with that activity's prompt, such as the StudyBuddy setup. The student can edit it before sending.
- A plain chat: a labeled message box, Send, and the replies. It is keyboard-only friendly and announces replies to screen readers. Start over clears it.
- Always on screen: "You are talking to an AI, not a person. It can be wrong." and the Try it's warning: "Never type your name, school, or anything personal into an AI tool."
- The "No AI tool?" paper version stays on every Try it, unchanged.

## Who can use it

Signed-in learner accounts of 13 or older (age band `13to17` or `18plus`). It is closed to the nicknamed under-13 profiles under a parent account, and to anyone signed out. The Try it steps are step 4, so a student is already signed in to reach them.

## Privacy

- Nothing a student types is saved by ARK. The conversation lives only in that browser tab and is gone when the tab closes, with no Firestore write and no browser storage. Server logs record failures by kind only, never message text (as every ARK route already does).
- Messages go to Anthropic to get a reply. That makes Anthropic a processor of what students type, so the privacy page and the parent notice need a line about it. Both are drafts waiting on the lawyer; this goes on the lawyer's list. Check Anthropic's current API data-retention terms when writing that line.

## Safety (Anthropic's requirements for products used by minors)

Anthropic allows its API in products for under-18s if the organization adds its own safeguards and tells users they are talking to an AI ([Anthropic's guidelines for organizations serving minors](https://support.claude.com/en/articles/9307344-responsible-use-of-anthropic-s-models-guidelines-for-organizations-serving-minors)). The plan:

- The AI disclosure above, on the page at all times.
- A server-side system prompt the student can't see or change: a practice tool for high school students in an AI literacy course, age-appropriate, no personal questions, and a reminder not to share personal information when a student does. If Anthropic offers its child-safety system prompt for this account, it goes in too.
- Short replies (about 600 tokens), messages of up to 2,000 characters, and conversations of up to 20 turns.
- Anthropic's own safeguards run on every request by default.
- A "Report a problem" link to ARK's contact page.
- COPPA: under-13s can't open the tool (see Who can use it).

## Cost and abuse limits

- Per person: 30 messages an hour and 100 a day, counted in Firestore with the existing `src/lib/rate-limit.ts` (keys are HMAC'd, never stored raw).
- Site-wide: a daily cap (2,000 messages to start). Past it, the page says the tool is resting for the day and points to the "No AI tool?" version.
- Set a monthly spending limit on the API key in the Anthropic Console.
- Model: Claude Haiku 5.5 (`claude-haiku-5-5`). It's fast and the cheapest current model, and Try it activities don't need more.

## How it's built

- `src/pages/api/practice.ts`: `postRoute` (POST only, Origin check, App Check, zod), `requireUser`, the 13+ check, the rate limits, then one call to Anthropic's Messages API with `fetch`. No new dependency (no SDK).
- `ANTHROPIC_API_KEY`: a new server-only secret in `astro.config.mjs` `env.schema`, set in Netlify's environment variables. While it's unset, the page says the tool isn't available yet and the Try it links stay hidden. The build's bundle-secrets check keeps it out of browser code.
- `src/pages/practice.astro` (server-rendered, gated, `noindex`) and a React island for the chat, using `SubmitButton` and `useEarlyInput` as other forms do.
- `practice:` in a step's frontmatter (with an optional `prompt`, copied word for word from the activity) makes its `<TryIt>` link to the tool. The link passes the step's address, and the page looks the prompt up on the server, so prompts never travel in the URL.
- No CSP change: the browser talks only to ARK's server.
- Tests on the emulators with a fake reply (test runs never call Anthropic): signed-out redirect, under-13 and parent-profile refusal, rate limits, the daily cap, input limits, "not available" with no key, plus a11y, keyboard, and visual checks at 375/768/1280.

## For you to do

1. Create an API key in the Anthropic Console (console.anthropic.com) for ARK's organization, and set a monthly spending limit there.
2. Add it to Netlify as `ANTHROPIC_API_KEY` (Site configuration → Environment variables), scoped to Functions. Never paste the key into chat or a file in the repo.
3. Ask the lawyer to add Anthropic to the privacy page and the parent notice.
4. Decide whether your AI Fluent line "or the ARK practice tool once it launches" should drop "once it launches" when the tool goes live. The plan leaves the wording as it is.
