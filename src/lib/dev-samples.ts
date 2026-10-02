// Sample data for /dev/components and the AI Aware player preview. Layout examples only,
// not lesson content; real lessons keep their questions in step frontmatter.
import type { Question, ScenarioData, SortData } from "./lesson-types";

export const SAMPLE_CHECK: Question[] = [
  {
    id: "sample-learns",
    prompt: "Which of these learns from examples?",
    options: [
      { id: "a", text: "A spam filter" },
      { id: "b", text: "A light switch" },
      { id: "c", text: "A ruler" },
    ],
    answer: "a",
    explanation: "A spam filter learns from emails people marked as spam. A light switch and a ruler work the same way every time.",
  },
  {
    id: "sample-always-right",
    prompt: "True or false: AI tools are always right.",
    options: [
      { id: "true", text: "True" },
      { id: "false", text: "False" },
    ],
    answer: "false",
    explanation: "AI tools can make mistakes, so it's smart to double-check what they tell you.",
  },
];

export const SAMPLE_SCENARIO: ScenarioData = {
  prompt: "A chatbot gives your friend an answer for a science project, with no sources. What would you do?",
  options: [
    { id: "copy", text: "Copy the answer as it is.", feedback: "It's quick, but chatbots can sound sure and still be wrong. Without a source, there's no way to know." },
    { id: "check", text: "Check it against a trusted source, like a textbook or a teacher.", feedback: "A great habit. If the answer holds up, you've learned something. If it doesn't, you caught a mistake." },
    { id: "ask", text: "Ask the chatbot where the information came from.", feedback: "Worth a try, but chatbots can make up sources that sound real. Check any source it gives you." },
  ],
};

export const SAMPLE_SORT: SortData = {
  prompt: "AI or not AI? Put each card in a bucket.",
  buckets: [
    { id: "ai", label: "Uses AI" },
    { id: "not", label: "Doesn't use AI" },
  ],
  items: [
    { id: "spam", text: "A spam filter that learns from emails people marked as spam", bucket: "ai", why: "It learns from examples." },
    { id: "switch", text: "A light switch", bucket: "not", why: "It does the same thing every time and never learns." },
    { id: "faces", text: "A photo app that finds faces in your pictures", bucket: "ai", why: "It learned what faces look like from lots of example photos." },
    { id: "calculator", text: "A calculator adding two numbers", bucket: "not", why: "It follows fixed rules. It doesn't learn from examples." },
  ],
};
