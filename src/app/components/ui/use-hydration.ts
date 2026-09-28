import { useEffect, useLayoutEffect, useSyncExternalStore, type RefObject } from "react";

// useLayoutEffect warns in the server render, where there's nothing to do anyway.
const useClientLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Keeps what someone typed or chose before the island hydrated (a slow connection, or a password
 * manager's autofill). Hydration leaves that text in the field but not in React state, so the next
 * render would put the empty state back. `sync` copies it into state during the hydration commit.
 */
export function useEarlyInput<T extends HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(ref: RefObject<T>, value: unknown, sync: (el: T) => void) {
  useClientLayoutEffect(() => {
    const el = ref.current;
    if (el && value !== undefined && el.value !== String(value ?? "")) sync(el);
    // Only on mount: after that, onChange keeps state and the DOM in step.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

const noSubscription = () => () => {};

/**
 * False in the server render and while hydrating; true once the island can handle events. A
 * component that mounts after hydration gets true straight away.
 */
export function useHydrated() {
  return useSyncExternalStore(noSubscription, () => true, () => false);
}
