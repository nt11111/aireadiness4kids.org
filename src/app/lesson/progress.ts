/**
 * Lesson progress, in memory only (Phase 2). It lasts while the learner moves between a
 * module's pages, because those pages use Astro's client router and this module loads
 * once. A full page load starts fresh.
 *
 * Phase 3 and 4 back this with the learner's account (Firestore, via the server) and the
 * guest key in brief section 8.5. Keep this API so the islands don't change.
 */
import { useSyncExternalStore } from "react";

export type PrecheckResult = { score: number; total: number };
type State = {
  completed: ReadonlySet<string>;
  precheck: ReadonlyMap<string, PrecheckResult>;
};

const EMPTY: State = { completed: new Set(), precheck: new Map() };
let state: State = EMPTY;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((fn) => fn());

export const progress = {
  get: () => state,
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  },
  /** A step counts as complete when the learner presses Next or answers a Check or Scenario (brief section 7). */
  complete(stepId: string) {
    if (state.completed.has(stepId)) return;
    state = { ...state, completed: new Set(state.completed).add(stepId) };
    emit();
  },
  savePrecheck(moduleId: string, result: PrecheckResult) {
    state = { ...state, precheck: new Map(state.precheck).set(moduleId, result) };
    emit();
  },
};

/** Current progress. Server rendering and the first client render both see "nothing done", so hydration matches. */
export function useProgress(): State {
  return useSyncExternalStore(progress.subscribe, progress.get, () => EMPTY);
}
