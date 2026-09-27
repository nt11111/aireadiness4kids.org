// The only inline scripts ARK writes itself. They live here so the Content-Security-Policy can
// allow exactly these by hash (policy.mjs). Change one and its hash updates automatically;
// check-dist.mjs fails the build if a page contains any inline script that isn't allowed.

/** Marks <html> as JS-enabled before first paint (presenter mode hides the other slides only when it can show them). */
export const JS_FLAG_SCRIPT = 'document.documentElement.classList.add("js");';
