// Plain types shared by the lesson pages (server) and the lesson islands (browser).
// No imports here, so islands can use them without pulling in astro:content.

export type StepType = "explainer" | "video" | "scenario" | "check" | "reflect" | "recap" | "activity";

export type Option = { id: string; text: string };
export type Question = { id: string; prompt: string; options: Option[]; answer: string; explanation: string };
export type ScenarioData = { prompt: string; options: { id: string; text: string; feedback: string }[] };
export type SortData = {
  prompt: string;
  buckets: { id: string; label: string }[];
  items: { id: string; text: string; bucket: string; why: string }[];
};
export type VocabEntry = { term: string; def: string };

/** What the lesson player needs to know about one step. */
export type StepRef = { id: string; n: number; slug: string; title: string; type: StepType; minutes: number; href: string };

/**
 * Set on Astro.locals.lesson by the step page, so MDX components can find this step's data:
 * authors write <Check /> or <Vocab term="bias" /> without repeating it in props.
 */
export type LessonContext = {
  stepId: string;
  moduleId: string;
  track: string;
  vocabulary: VocabEntry[];
  questions: Question[];
  scenario?: ScenarioData;
  sort?: SortData;
};

export const STEP_LABEL: Record<StepType, string> = {
  explainer: "Explainer",
  video: "Video",
  scenario: "Scenario",
  check: "Quick check",
  reflect: "Reflect",
  recap: "Recap",
  activity: "Activity",
};
