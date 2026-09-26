// The only inline scripts ARK writes itself. They live here so the Content-Security-Policy can
// allow exactly these by hash (policy.mjs). Change one and its hash updates automatically;
// check-dist.mjs fails the build if a page contains any inline script that isn't allowed.

/** Marks <html> as JS-enabled before first paint, so scroll-reveal content is only hidden when it can be revealed. */
export const JS_FLAG_SCRIPT = 'document.documentElement.classList.add("js");';

/** Adds `.in` to `.reveal` elements as they scroll into view. */
export const REVEAL_SCRIPT = `(function () {
  var els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  els.forEach(function (e) { io.observe(e); });
})();`;
