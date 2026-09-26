/**
 * Lesson progress in the browser (brief sections 7 and 8.5). One store for every island that shows
 * or records progress: the lesson player, module overview, course page, and home "continue" card.
 *
 * - Signed in: loaded from /api/progress (the active learner's Firestore progress) and saved
 *   through /api/progress/* as the learner goes. Saves are optimistic: the page updates at once.
 * - Signed out: kept in the guest key (guest.ts), which is merged into the account at sign-up.
 *
 * It loads once per full page load; pages that use the client router keep it between steps.
 * Nothing loads on the server: server renders (and the first client render) see "nothing done",
 * so hydration always matches, and one visitor's progress can never leak into another's page.
 */
import { useEffect, useSyncExternalStore } from "react";
import { track } from "../../lib/analytics";
import { clearGuest, guestProgress, hasGuestProgress, readGuest, signedInHint, updateGuest } from "./guest";
import { post } from "../lib/post";

export type PrecheckResult = { score: number; total: number };
export type ModuleState = { steps: ReadonlySet<string>; pre: PrecheckResult | null; startedAt: string | null; updatedAt: string | null; completedAt: string | null };
export type LearnerRef = { id: string; nickname: string };

/** "track/module/NN-slug" (a step's content id) or "track/module/slug" -> "track/module/slug". */
export function stepKey(stepId: string) {
  const [trackId, mod, file = ""] = stepId.split("/");
  return `${trackId}/${mod}/${file.replace(/^\d{2}-/, "")}`;
}
const splitStep = (stepId: string) => {
  const [trackId, mod, slug] = stepKey(stepId).split("/");
  return { moduleId: `${trackId}/${mod}`, slug };
};

/** Completed steps. has() takes a step's content id, so islands can pass step.id as they always have. */
export class StepSet {
  constructor(private readonly keys: ReadonlySet<string> = new Set()) {}
  has(stepId: string) {
    return this.keys.has(stepKey(stepId));
  }
  get size() {
    return this.keys.size;
  }
}

type State = {
  /** loading until the first load finishes; "account" when a learner's progress is shown. */
  status: "loading" | "guest" | "account" | "no-learner";
  accountType: "learner" | "parent" | null;
  learner: LearnerRef | null;
  learners: LearnerRef[];
  modules: ReadonlyMap<string, ModuleState>;
  completed: StepSet;
  precheck: ReadonlyMap<string, PrecheckResult>;
};

const EMPTY: State = { status: "loading", accountType: null, learner: null, learners: [], modules: new Map(), completed: new StepSet(), precheck: new Map() };
let state: State = EMPTY;
const listeners = new Set<() => void>();

function setModules(modules: Map<string, ModuleState>, patch: Partial<State> = {}) {
  const keys = new Set<string>();
  const precheck = new Map<string, PrecheckResult>();
  for (const [moduleId, m] of modules) {
    for (const slug of m.steps) keys.add(`${moduleId}/${slug}`);
    if (m.pre) precheck.set(moduleId, m.pre);
  }
  state = { ...state, ...patch, modules, completed: new StepSet(keys), precheck };
  listeners.forEach((fn) => fn());
}

const blankModule = (): ModuleState => ({ steps: new Set(), pre: null, startedAt: null, updatedAt: null, completedAt: null });

type ServerModule = { steps: string[]; pre: { score: number; outOf: number } | null; startedAt: string | null; updatedAt: string | null; completedAt: string | null };
type ServerProgress = { accountType: "learner" | "parent"; learner: LearnerRef | null; learners: LearnerRef[]; modules: Record<string, ServerModule> };

async function getProgress(): Promise<ServerProgress | null> {
  const res = await fetch("/api/progress", { credentials: "same-origin" });
  return res.ok ? res.json() : null;
}

function fromServer(data: ServerProgress) {
  const modules = new Map<string, ModuleState>();
  for (const [moduleId, m] of Object.entries(data.modules)) {
    modules.set(moduleId, {
      steps: new Set(m.steps),
      pre: m.pre ? { score: m.pre.score, total: m.pre.outOf } : null,
      startedAt: m.startedAt,
      updatedAt: m.updatedAt,
      completedAt: m.completedAt,
    });
  }
  setModules(modules, { status: data.learner ? "account" : "no-learner", accountType: data.accountType, learner: data.learner, learners: data.learners });
}

function fromGuest() {
  const g = readGuest();
  const modules = new Map<string, ModuleState>();
  for (const [moduleId, slugs] of Object.entries(g.steps)) modules.set(moduleId, { ...blankModule(), steps: new Set(slugs) });
  for (const [moduleId, p] of Object.entries(g.pre)) modules.set(moduleId, { ...(modules.get(moduleId) ?? blankModule()), pre: { score: p.score, total: p.total } });
  setModules(modules, { status: "guest", accountType: null, learner: null, learners: [] });
}

/**
 * Signed in with guest progress on this browser: merge it into the active learner, then clear the
 * key. A parent with no learner profile yet keeps the key until they add one. A 4xx (say, content
 * that's gone) clears it too, so a bad key can't retry forever; a network or server error keeps it.
 */
async function mergeGuestInto(learnerId: string) {
  const g = readGuest();
  if (!hasGuestProgress(g)) return false;
  const { status } = await post("/api/progress/merge", { learnerId, ...guestProgress(g) });
  if ((status >= 200 && status < 300) || (status >= 400 && status < 500 && status !== 401)) clearGuest();
  return status >= 200 && status < 300;
}

type Action = { kind: "step"; stepId: string } | { kind: "pre"; moduleId: string; answers: Record<string, string>; result: PrecheckResult };
let pending: Action[] = [];
let loading: Promise<void> | null = null;

async function load() {
  if (signedInHint()) {
    try {
      let data = await getProgress();
      if (data?.learner && (await mergeGuestInto(data.learner.id))) data = await getProgress();
      if (data) {
        fromServer(data);
        return;
      }
    } catch {
      // fall back to the guest view below
    }
  }
  fromGuest();
}

/** Starts loading (once). Called by useProgress in the browser, never on the server. */
export function startProgress() {
  loading ??= load().then(() => {
    const queued = pending;
    pending = [];
    queued.forEach(apply);
  });
  return loading;
}

function apply(action: Action) {
  if (action.kind === "step") saveStep(action.stepId);
  else savePre(action.moduleId, action.answers, action.result);
}

function saveStep(stepId: string) {
  const { moduleId, slug } = splitStep(stepId);
  const current = state.modules.get(moduleId) ?? blankModule();
  if (current.steps.has(slug)) return;
  const now = new Date().toISOString();
  const modules = new Map(state.modules).set(moduleId, { ...current, steps: new Set(current.steps).add(slug), startedAt: current.startedAt ?? now, updatedAt: now });
  setModules(modules);
  if (state.status === "account" && state.learner) {
    void post<{ completed?: boolean }>("/api/progress/step", { learnerId: state.learner.id, moduleId, step: slug }).then(({ data }) => {
      if (data?.completed) track({ name: "module_complete", props: { track: moduleId.split("/")[0] } });
    });
  } else if (state.status === "guest") {
    updateGuest((g) => { g.steps[moduleId] = [...new Set([...(g.steps[moduleId] ?? []), slug])]; });
  }
}

function savePre(moduleId: string, answers: Record<string, string>, result: PrecheckResult) {
  const current = state.modules.get(moduleId) ?? blankModule();
  if (current.pre) return; // the first pre-check is the "before" number; it isn't replaced
  setModules(new Map(state.modules).set(moduleId, { ...current, pre: result }));
  if (state.status === "account" && state.learner) {
    void post<{ score: number; outOf: number }>("/api/progress/precheck", { learnerId: state.learner.id, moduleId, answers }).then(({ data }) => {
      // The server's score is the one that counts (it scores against the answer key itself).
      const latest = state.modules.get(moduleId);
      if (data && latest) setModules(new Map(state.modules).set(moduleId, { ...latest, pre: { score: data.score, total: data.outOf } }));
    });
  } else if (state.status === "guest") {
    updateGuest((g) => { g.pre[moduleId] ??= { answers, ...result }; });
  }
}

export const progress = {
  get: () => state,
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  },
  /** A step counts as complete when the learner presses Next or answers a Check or Scenario (brief section 7). */
  complete(stepId: string) {
    if (state.status === "loading") {
      pending.push({ kind: "step", stepId });
      void startProgress();
    } else saveStep(stepId);
  },
  savePrecheck(moduleId: string, result: PrecheckResult, answers: Record<string, string>) {
    const action: Action = { kind: "pre", moduleId, answers, result };
    if (state.status === "loading") {
      pending.push(action);
      void startProgress();
    } else apply(action);
  },
};

/** Current progress (starts loading it the first time any island asks). */
export function useProgress(): State {
  useEffect(() => { void startProgress(); }, []);
  return useSyncExternalStore(progress.subscribe, progress.get, () => EMPTY);
}

/** The next step to open in a module: the first one not done, or null when all are. */
export function nextStep<T extends { id: string }>(steps: T[], completed: StepSet): T | null {
  return steps.find((s) => !completed.has(s.id)) ?? null;
}
