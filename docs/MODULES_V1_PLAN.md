# modules-v1: integrate the 17 draft modules

Working notes for the `modules-v1` branch. The audit and plan below were written on 2026-10-18 and approved for pushing. **Nothing in `src/` has changed yet.** The "go" to build is still pending, along with a copy of the module sources.

## Next steps (on your own computer)

1. Copy `~/Claude/Projects/ResponsibleAI4Kids/module-sources/` into `docs/source/modules/` and commit it as-is.
2. Read the per-module files against the mapping below, and list anything that won't map before building (see "Things that may not map cleanly").
3. Say "go" to build. Then run the checks at the end of this file and report.

Pushing `modules-v1` is approved. Never push or merge to `main`.

## Audit (from the code)

**Stack.** Astro 7.3 with React 18 islands, MDX, and Tailwind v4. It uses `output: 'server'` with the Netlify adapter, and tests build with the Node adapter. `main` already has the course platform (merge `7172ccb`), so the "platform-v1 / waiting for cutover" wording in CLAUDE.md is out of date.

**Track ids.** `aware`, `literate`, `fluent` (`TRACK_IDS` in `src/content.config.ts`). The old ids appear only in `src/lib/renamed-tracks.mjs`.

**Content collections** (`src/content.config.ts`, zod):
- `tracks`: title, grades, color, tagline, summary, order, outcomes (4 to 6), slides_folder_url.
- `modules` (`<track>/<slug>/index.mdx`): title, track, order, `duration_minutes?`, summary (280 characters max), topics, objectives (empty, or 3 to 5), vocabulary `{term, def}`, status, reviewers, slides_url, and `pre_check`/`post_check`. Each check holds up to 5 questions, and the two must use the same ids.
- `steps` (`NN-slug.mdx`): title, type, minutes (1 to 15), questions (max 5), and an optional scenario (2 to 5 options) and sort (2 to 4 buckets, 2 to 10 items). A `check` step needs questions; a `scenario` step needs a scenario.
- `guides` (`guide.mdx`): title, status, duration_minutes, materials.
- Step types: explainer, video, scenario, check, reflect, recap, activity. Step numbers must run 01 to N with no gaps, and the slugs `complete` and `guide` are reserved.

**Stubs and slugs (all kept).**
- aware: what-is-ai, ai-helpers, smart-ai-user, kindness-feelings-and-ai, my-digital-footprint
- literate: how-ai-actually-works, bias-in-ai, ai-and-schoolwork, deepfakes-and-misinformation, privacy-and-your-data, ethical-dilemmas-in-ai
- fluent: ai-landscape-today, ai-ethics-and-the-rules, algorithmic-bias-and-justice, ai-and-the-future-of-work, building-responsibly, advocacy-and-action

Every stub has `status: draft`, a slides_url, empty objectives and vocabulary, and "Content coming soon." Module slugs have to stay unique across tracks, since `/check/<slug>/…` uses the slug alone.

**Bias in AI (the pattern).** Six steps: explainer, explainer with `<Sort />`, scenario, check, reflect, recap. It also has `guide.mdx` and a pre_check reused as post_check through a YAML alias (`post_check: *checks`). Its sources are Markdown footnotes (`[^name]`), which render as a "Sources" list that isn't collapsible. Not to be touched.

**Lesson toolkit** (`src/components/lesson/index.ts`, no imports needed in MDX):
- `<Callout kind="think|tip|warning|fact" title?>`
- `<Vocab term def?>`: the definition comes from the module vocabulary, and a missing term fails the build. An optional child sets the visible label.
- `<Figure src alt caption? width? height?>`: alt is required.
- `<Video src captions title poster? transcript?>`
- `<Scenario />`, `<Sort />`, `<Check />`: data comes from the step frontmatter, or from props.
- `<Reflect prompt id?>`: saved only in the browser.
- `<Discuss title? open?>`: collapsed in lessons, open in the guide.
- `<Recap title?>` and `<ReadAloud />`. AI Aware steps get ReadAloud automatically.
- Presenter mode has its own read-only set in `src/components/present/present-components.tsx`. Any new MDX component has to be added there too, or `/present` breaks.

**Player and navigation.**
- `[step].astro` → `LessonPlayer.astro` uses View Transitions, an outline sidebar on desktop, and a bottom sheet on phones.
- `LessonNav` has Back/Next. Back on step 1 goes to the overview. Next on the last step reads "Finish module", waits for `progress.flush()`, then opens `/complete`.
- `/complete` shows the post-check, the certificate, and the next module. After a course's last module it suggests the first module of the next course.
- The top bar links to the module overview only. No step links to the course page today.
- Page titles are currently `Step | Module | ARK`. The description is the module summary, and the canonical and og:url tags carry the slug.

**Soft gate.**
- `src/lib/gate.ts` builds the set of step-2+ paths from the content and redirects signed-out visitors to `/signin?next=…`.
- `[step].astro` checks again on the server. On step 1, Next opens the sign-up panel for signed-out visitors.
- New steps are covered with no code changes.

**Sitemap.** `src/pages/sitemap.xml.ts` already lists every course page, module overview, step 1, and guide from the collections.

**Tests that assume stubs and will need updating:**
- `lesson.spec.ts:316`: Start course skips the literate stub, and aware and fluent have no Start button.
- `certificates.spec.ts:114`: the deepfakes completion page is a 404.
- `checks.spec.ts:107`: what-is-ai has no check.
- `present-admin.spec.ts:98` and `:198`: deepfakes presenter page is a 404, and "Guide coming soon" appears ×16.

`a11y.spec.ts:177` ("every module is draft") still holds.

## Plan

### Files

| File | Change | Why |
|---|---|---|
| `docs/source/modules/**` | Add as-is | Source of record |
| `src/content.config.ts` | Modules: optional `big_idea`, `hard_idea`, `recent_events {last_checked, items[]}`, `vocabulary_sources[]`. Steps: optional `sources: [{title, url}]` (zod `z.url()`) | New fields; validated links |
| `src/content/modules/*/*/index.mdx` (16, not bias-in-ai) | Fill in frontmatter (see mapping) | Module header |
| `src/content/modules/*/*/NN-*.mdx` | New step files | One page per step |
| `src/content/modules/*/*/guide.mdx` (16) | New | Facilitator guides |
| `src/components/lesson/TryIt.astro` | New | `[TRY]` |
| `src/components/lesson/ArkView.astro` | New | ARK's opinion vs. the best case against |
| `src/components/lesson/SourceNeeded.astro` | New: small inline "Source needed" marker | Leftover `[CITATION NEEDED]` / `[VERIFY]` |
| `src/components/lesson/Sources.astro` | New: collapsible `<details>`, styled like `<Discuss>`, title and link only | Per-step Sources |
| `src/components/lesson/Figure.astro` | Add a `pending` mode: neutral placeholder, alt still required, `src` optional only when pending | `[FIGURE]` with no image yet |
| `src/components/lesson/Callout.astro` | Add `optional` prop: dashed border and an "Optional" pill | "Level up (grades 3-5)" tips that K-2 groups can skip |
| `src/components/lesson/index.ts` | Register the new components | Usable in MDX |
| `src/components/lesson/LessonPlayer.astro` | Render `sources` at the end of the step. Add a breadcrumb (Courses › Course › Module) above the step label | Sources at the bottom; a way back to the course page from every step |
| `src/pages/courses/[track]/[module]/[step].astro` | Title becomes `Step · Module · ARK`; description from the summary, cut at a word boundary to under 160 characters; pass `sources` | Metadata rule |
| `src/pages/courses/[track]/[module]/index.astro` | Show big/hard idea and Recent events (with "Last checked"); title becomes `Module · Course · ARK`; same description rule | New fields on the overview |
| `src/lib/courses.ts` | Small `metaDescription()` helper | Shared by both pages |
| `src/components/present/present-components.tsx` | Read-only TryIt, ArkView, and SourceNeeded | Keeps `/present` working |
| `src/pages/dev/components.astro` | Examples of the new components | Style-guide convention |
| `src/styles/lesson.css` | Only if the new components need a rule Tailwind classes can't cover | Keep style changes small |
| `tests/routes.ts`, `visual.spec.ts`, `a11y.spec.ts`, `lesson.spec.ts` | Add one full module per course at 375/768/1280, every overview, at least one step of each type, and a keyboard pass through one module | Requested checks |
| The 4 stub-dependent tests above | Switch to an unknown module (still 404) or the new counts | They would fail once every module has steps |

Not touched: auth, gate, middleware, APIs, `courses/[track]/index.astro`, the tracks, Bias in AI, and other pages and styles.

### Source → component mapping

| Source element | Target |
|---|---|
| Fixed title | `title` |
| "On the site" text | `summary`. Where it differs from the stub, the stub's summary stays and the difference is listed |
| Objectives / vocabulary | `objectives` (schema needs 3 to 5) / `vocabulary {term, def}` |
| "Slide deck" link | `slides_url`. If it differs from the stub's link, list it |
| Sum of step minutes | `duration_minutes` |
| Big idea (Aware, Literate) / Hard idea (Fluent) | `big_idea` / `hard_idea`, shown as a panel under the overview summary |
| Recent events + last checked (Fluent) | `recent_events`, a section on the overview with "Last checked: <date>" |
| `Step N: Name (type, X min)` / `STEP N:` + `Title:` | `NN-<slug-from-title>.mdx` with `title`, `type`, `minutes`. "Try it" and "Play it" → `activity` |
| `[CALLOUT kind]` | `<Callout kind>`. A kind outside think/tip/warning/fact gets listed |
| `[CALLOUT tip]` "Level up (grades 3-5)" | `<Callout kind="tip" title="Level up (grades 3-5)" optional>` |
| `[VOCAB term]` | `<Vocab term>`. Any mismatch with the vocabulary list gets listed |
| `[FIGURE] description \| alt` | `<Figure pending alt="…" brief="…">`. The placeholder shows "Picture coming soon" with the alt text visible. `brief` (the illustrator's description) is kept in the file but not shown. Every one gets listed |
| `[SORT]` / `[SCENARIO]` / `[CHECK]` | Step frontmatter `sort` / `scenario` / `questions` (with `answer` and `explanation`) plus `<Sort />` / `<Scenario />` / `<Check />`. A second one in the same step goes in as props |
| `[REFLECT]` / `[DISCUSS]` / `[RECAP]` | `<Reflect prompt>` / `<Discuss>` / `<Recap>` |
| `[TRY]` | `<TryIt>` with slots for the task, "What to look for", "No AI tool?", and the writer's personal-information warning. No product names or links. The "No AI tool?" version is always visible. The Module 3 slider shows as its paper version |
| "ARK's view:" + "The best case against:" (Aware: "What ARK thinks:" + "Some people say:") | `<ArkView>` with two labeled panels, the writer's own labels, and an "ARK's opinion" pill. It uses a neutral card with a quote-style rule, so it looks different from the teal Fact callout. The reflect prompt after it stays a `<Reflect>` |
| Pre/post check | `pre_check`, with `post_check: *checks` as in Bias in AI |
| Facilitator guide | `guide.mdx` (`title: "Facilitator guide: <Module>"`, `status: draft`, minutes, materials) |
| Step "Sources:" lists, Literate "SOURCES AND FACTS TO VERIFY" lines (matched by "Step N"), `_citations.md` rows | That step's `sources` frontmatter, merged and de-duplicated, titles and links only |
| `_citations.md` definition sources | A "Vocabulary sources" list in `guide.mdx`, where module-level sources sit in Bias in AI |
| Leftover `[CITATION NEEDED]` / `[VERIFY]` | `<SourceNeeded />` inline. Expected: one, at Literate M1 Step 1 (scrolling past videos). List any others |

### Writer-only parts (left out)

Removed and counted in the report:
- YOUR TURN boxes and the `____` line after each one. If a box has a written answer instead of `____`, leave it out and list it by module and step.
- "Check these:" lists.
- Status, Writer, and Peer checker lines.
- Sign-off tables.
- "Depth pass: suggested upgrades" sections.
- Instruction text around sources ("Open every link…", "Confirm…", "Find…").

Compare the `_course.md` files with `src/content/tracks/*.md` and report the differences without making changes.

### Things that may not map cleanly (confirm against the files)

- **Schema limits.** If a module has fewer than 3 or more than 5 objectives, or a sort has more than 10 cards, or a scenario has more than 5 options, or a step runs over 15 minutes, stop and ask. Don't reword or split anything.
- **Unknown step types** ("Discussion", "Game", for example): map them to the closest existing type and list them. No new types.
- **Product names in `[TRY]` text:** removing a name changes the writer's words, so leave that passage out and list it.
- **Descriptions over 160 characters** (AI & Schoolwork's is about 170): cut the meta description at a word boundary with "…" and list which ones. Only the meta tag changes.
- **Titles:** the `·` format changes only step and module pages. Other pages keep `|`.

## Checks before reporting

- `npm run build`, which checks alt text and internal links.
- A script that checks every external source link and lists broken ones (report, don't fix).
- Visual screenshots at 375, 768, and 1280 for one full module per course, plus every module overview. Review them and fix what looks off.
- Axe on each step type: zero serious or critical issues.
- A keyboard-only pass through one module.
- Steps 2 and up still redirect when signed out, for all 17 modules.
