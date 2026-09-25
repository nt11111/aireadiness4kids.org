/**
 * Lesson-wide keyboard and focus behavior. Loaded once by LessonLayout (the client router
 * keeps it alive between steps), so there is exactly one listener however many steps you visit.
 *
 * - Left and right arrows press Back and Next, unless focus is somewhere arrows already mean
 *   something (text fields, radio groups, sliders, media, open dialogs).
 * - After moving to another step, focus goes to the step's heading, so screen reader and
 *   keyboard users start at the top of the new content.
 */
const ARROWS_IN_USE =
  'input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="radiogroup"], [role="radio"], [role="slider"], [role="tablist"], [role="menu"], [role="listbox"], [role="dialog"], video, audio';

document.addEventListener("keydown", (e) => {
  if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
  if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
  if (!document.querySelector("[data-lesson-root]")) return;
  const target = e.target instanceof Element ? e.target : null;
  if (target?.closest(ARROWS_IN_USE)) return;
  if (document.querySelector('[role="dialog"][data-state="open"]')) return;
  const link = document.querySelector<HTMLAnchorElement>(e.key === "ArrowRight" ? "[data-lesson-next]" : "[data-lesson-prev]");
  if (!link) return;
  e.preventDefault();
  link.click();
});

let swapped = false;
document.addEventListener("astro:after-swap", () => { swapped = true; });
document.addEventListener("astro:page-load", () => {
  if (!swapped) return;
  document.querySelector<HTMLElement>("[data-focus-on-nav]")?.focus({ preventScroll: true });
});
