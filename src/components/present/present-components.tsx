/**
 * MDX components for presenter mode (brief section 7). The room sees a step on a projector, so the
 * interactive pieces become plain, large, read-only versions: questions without answers, scenario
 * choices to vote on, sort cards to talk through, reflection prompts. They render on the server
 * only (no client directive), and each step gets its own set, bound to that step's frontmatter,
 * because every step renders on the same page.
 */
import type { ReactNode } from "react";
import { MessagesSquare, PenLine } from "lucide-react";
import type { Question, ScenarioData, SortData } from "../../lib/lesson-types";
import Callout from "../lesson/Callout.astro";
import Figure from "../lesson/Figure.astro";
import Video from "../lesson/Video.astro";
import Recap from "../lesson/Recap.astro";

const letter = (i: number) => String.fromCharCode(65 + i);

function Questions({ questions }: { questions: Question[] }) {
  return (
    <ol className="lesson-block grid list-decimal gap-6 pl-8 marker:font-bold marker:text-ink" data-present-questions>
      {questions.map((q) => (
        <li key={q.id}>
          <p className="font-bold text-ink">{q.prompt}</p>
          <ul className="mt-2 grid list-none gap-1 pl-0">
            {q.options.map((o, k) => <li key={o.id}><span className="font-bold text-brand">{letter(k)}.</span> {o.text}</li>)}
          </ul>
        </li>
      ))}
    </ol>
  );
}

function Choices({ scenario }: { scenario: ScenarioData }) {
  return (
    <div className="lesson-block rounded-xl border border-line bg-surface p-6">
      <p className="font-bold text-ink">{scenario.prompt}</p>
      <ul className="mt-4 grid gap-3">
        {scenario.options.map((o, k) => (
          <li key={o.id} className="flex gap-3"><span className="font-display font-semibold text-brand">{letter(k)}</span><span>{o.text}</span></li>
        ))}
      </ul>
    </div>
  );
}

function Cards({ sort }: { sort: SortData }) {
  return (
    <div className="lesson-block">
      <p className="font-bold text-ink">{sort.prompt}</p>
      <p className="mt-3 text-ink-soft">Sort into: {sort.buckets.map((b) => b.label).join(" or ")}</p>
      <ul className="mt-4 grid gap-3 md:grid-cols-2">
        {sort.items.map((item) => <li key={item.id} className="rounded-lg border border-line bg-surface px-4 py-3">{item.text}</li>)}
      </ul>
    </div>
  );
}

function Prompt({ prompt }: { prompt: string }) {
  return (
    <div className="lesson-block flex gap-4 rounded-xl border border-line bg-surface p-6">
      <PenLine aria-hidden="true" className="mt-1 size-7 shrink-0 text-brand" />
      <p className="font-bold text-ink">{prompt}</p>
    </div>
  );
}

function Talk({ title = "Talk about it", children }: { title?: string; children?: ReactNode }) {
  return (
    <div className="lesson-block rounded-xl border border-line bg-surface p-6">
      <p className="flex items-center gap-3 font-bold text-ink"><MessagesSquare aria-hidden="true" className="size-7 shrink-0 text-brand" />{title}</p>
      <div className="mt-3 [&_li+li]:mt-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6">{children}</div>
    </div>
  );
}

type StepData = { questions: Question[]; scenario?: ScenarioData; sort?: SortData };

export function presentComponents(step: StepData) {
  return {
    Callout,
    Figure,
    Video,
    Recap,
    Check: ({ questions }: { questions?: Question[] }) => <Questions questions={questions ?? step.questions} />,
    Scenario: (props: Partial<ScenarioData>) => <Choices scenario={props.prompt && props.options ? (props as ScenarioData) : step.scenario!} />,
    Sort: (props: Partial<SortData>) => <Cards sort={props.prompt && props.buckets && props.items ? (props as SortData) : step.sort!} />,
    Reflect: ({ prompt }: { prompt: string }) => <Prompt prompt={prompt} />,
    Discuss: Talk,
    Vocab: ({ term, children }: { term: string; children?: ReactNode }) => <strong className="font-bold text-ink">{children ?? term}</strong>,
    // Read-aloud is for a learner on their own device; in the room, the presenter reads.
    ReadAloud: () => <span hidden />,
  };
}
