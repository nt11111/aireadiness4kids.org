import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Adds .in to any .reveal element once it scrolls into view. Re-runs per route. */
export function useReveal() {
  const { pathname } = useLocation();
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal:not(.in)"));
    if (!("IntersectionObserver" in window)) { els.forEach((e) => e.classList.add("in")); return; }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);
}

/** Scroll to top (or to hash) on route change. */
export function useScrollRestore() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) { setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 60); return; }
    }
    window.scrollTo({ top: 0 });
  }, [pathname, hash]);
}
