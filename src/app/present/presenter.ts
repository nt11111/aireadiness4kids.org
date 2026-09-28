/**
 * Presenter mode controls (brief section 7): one slide at a time, arrow keys (and the Page Up /
 * Page Down that presentation clickers send), Home / End, F for full screen. The slide number is
 * kept in the address (#slide-3), so a reload stays put. Without JavaScript every slide shows,
 * one after another.
 */
import { track } from "../../lib/analytics";

const root = document.querySelector<HTMLElement>("[data-present]");
if (root) {
  const slides = [...root.querySelectorAll<HTMLElement>("[data-slide]")];
  const prev = root.querySelector<HTMLButtonElement>("[data-present-prev]")!;
  const next = root.querySelector<HTMLButtonElement>("[data-present-next]")!;
  const counter = root.querySelector<HTMLElement>("[data-present-counter]")!;
  const status = root.querySelector<HTMLElement>("[data-present-status]")!;
  const full = root.querySelector<HTMLButtonElement>("[data-present-fullscreen]")!;
  const exit = root.querySelector<HTMLAnchorElement>("[data-present-exit]");
  // Exit goes back to the page the presenter came from on this site (a lesson, the course page),
  // or to the module's page (the link's own href) when they came from elsewhere or presenter mode.
  try {
    const from = document.referrer ? new URL(document.referrer) : null;
    if (exit && from && from.origin === location.origin && !from.pathname.startsWith("/present")) exit.href = `${from.pathname}${from.search}`;
  } catch {
    // keep the module page
  }
  let current = 0;

  const fromHash = () => {
    const n = Number(/^#slide-(\d+)$/.exec(location.hash)?.[1]);
    return Number.isInteger(n) && n >= 1 && n <= slides.length ? n - 1 : 0;
  };

  function show(i: number, announce = true) {
    current = Math.max(0, Math.min(slides.length - 1, i));
    slides.forEach((slide, k) => slide.toggleAttribute("data-current", k === current));
    counter.textContent = `${current + 1} / ${slides.length}`;
    prev.disabled = current === 0;
    next.disabled = current === slides.length - 1;
    history.replaceState(history.state, "", `#slide-${current + 1}`);
    window.scrollTo({ top: 0 });
    if (announce) {
      const heading = slides[current].querySelector("h1")?.textContent?.trim() ?? "";
      status.textContent = `Slide ${current + 1} of ${slides.length}: ${heading}`;
    }
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.().catch(() => {});
  }

  prev.addEventListener("click", () => show(current - 1));
  next.addEventListener("click", () => show(current + 1));
  full.addEventListener("click", toggleFullscreen);
  document.addEventListener("fullscreenchange", () => full.setAttribute("aria-pressed", String(Boolean(document.fullscreenElement))));

  document.addEventListener("keydown", (e) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    const target = e.target as HTMLElement | null;
    if (target?.closest("input, textarea, select, [contenteditable]")) return;
    const onControl = Boolean(target?.closest("button, a, summary"));
    switch (e.key) {
      case "ArrowRight":
      case "PageDown":
        show(current + 1);
        break;
      case " ":
        if (onControl) return; // Space presses the focused button or link instead
        show(current + (e.shiftKey ? -1 : 1));
        break;
      case "ArrowLeft":
      case "PageUp":
        show(current - 1);
        break;
      case "Home":
        show(0);
        break;
      case "End":
        show(slides.length - 1);
        break;
      case "f":
      case "F":
        toggleFullscreen();
        break;
      default:
        return;
    }
    e.preventDefault();
  });
  window.addEventListener("hashchange", () => show(fromHash()));

  show(fromHash(), false);
  track({ name: "present_start", props: { track: root.dataset.track ?? "" } });
}
