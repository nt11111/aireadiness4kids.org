import { expect, type Page, type Route } from "@playwright/test";

/**
 * Waits until the page's React islands are live, so what a test types goes through React.
 * Astro drops an island's `ssr` attribute as soon as it hands the component to React, but
 * @astrojs/react hydrates inside startTransition, so React can still be mid-hydration then. The
 * island is only live once its React root has committed (React 18: isDehydrated is false).
 * client:visible and client:media islands are skipped: they wait for the viewport or a media query.
 */
export async function hydrated(page: Page) {
  await page.waitForFunction(() => {
    type Fiber = { return?: Fiber | null; stateNode?: { current?: { memoizedState?: { isDehydrated?: boolean } } } };
    const own = (el: Element | null, prefix: string) => {
      const key = el && Object.keys(el).find((k) => k.startsWith(prefix));
      return key ? ((el as unknown as Record<string, Fiber>)[key] ?? null) : null;
    };
    return [...document.querySelectorAll("astro-island")]
      .filter((island) => ["load", "idle", "only"].includes(island.getAttribute("client") ?? ""))
      .every((island) => {
        if (island.hasAttribute("ssr")) return false;
        // The container key points at the root; Astro deletes it when it re-renders a persisted
        // island (transition:persist), so fall back to walking up from a rendered child.
        let fiber = own(island, "__reactContainer$") ?? own(island.firstElementChild, "__reactFiber$");
        while (fiber?.return) fiber = fiber.return;
        return fiber?.stateNode?.current?.memoizedState?.isDehydrated === false;
      });
  });
}

/**
 * Opens url with the page's JavaScript held back, so its islands stay plain server HTML while
 * `act` runs (a slow connection), then lets them hydrate.
 */
export async function beforeHydration(page: Page, url: string, act: () => Promise<unknown>) {
  let release!: () => void;
  const held = new Promise<void>((resolve) => (release = resolve));
  const hold = async (route: Route) => {
    await held;
    await route.continue();
  };
  await page.route("**/_astro/**/*.js", hold);
  await page.goto(url, { waitUntil: "commit" });
  await act();
  const serverHtml = page.locator("astro-island[ssr]").filter({ has: page.locator("input, select, textarea") });
  await expect(serverHtml.first(), "the form should still be server HTML").toBeAttached();
  // Leave the route in place: with the gate open it just lets requests through. (Unrouting now
  // would settle the held requests out from under the handler.)
  release();
  await hydrated(page);
}
