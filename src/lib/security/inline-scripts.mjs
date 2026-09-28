// The only inline scripts ARK writes itself. They live here so the Content-Security-Policy can
// allow exactly these by hash (policy.mjs). Change one and its hash updates automatically;
// check-dist.mjs fails the build if a page contains any inline script that isn't allowed.

/**
 * Before first paint: marks <html> as JS-enabled (presenter mode hides the other slides only when it can
 * show them), and with "si" when the "ark_si" hint says this browser may be signed in, so a static page's
 * header hides its sign-in links until it knows (Nav.tsx useSignedIn removes "si").
 */
export const JS_FLAG_SCRIPT = 'var h=document.documentElement;h.classList.add("js");if(/(?:^|;\\s*)ark_si=1/.test(document.cookie))h.classList.add("si");';
