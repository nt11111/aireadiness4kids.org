/**
 * Runs on every server-rendered request (static pages are plain files; their headers come from
 * dist/_headers). It checks the session on the server, gates private routes, and adds the security
 * headers (brief sections 8.1 and 8.4).
 */
import { defineMiddleware } from "astro:middleware";
import { PUBLIC_FIREBASE_AUTH_DOMAIN, PUBLIC_FIREBASE_AUTH_EMULATOR_URL, PUBLIC_UMAMI_ID } from "astro:env/client";
import { securityHeaders } from "./lib/security/policy.mjs";
import { readSession } from "./lib/session";
import { gateFor } from "./lib/gate";

function forbidden(context: Parameters<Parameters<typeof defineMiddleware>[0]>[0]) {
  return context.rewrite(new Request(new URL("/forbidden", context.url), { headers: context.request.headers }));
}

export const onRequest = defineMiddleware(async (context, next) => {
  if (context.isPrerendered) return next();

  const { url, cookies, locals } = context;
  locals.user = null;
  const gate = await gateFor(url.pathname);
  // Only verify a session when there's a cookie to verify (signed-out visitors cost no Firebase call).
  if (cookies.has("__session")) locals.user = await readSession(cookies);

  let response: Response;
  if (gate !== "open" && !locals.user) {
    response = url.pathname.startsWith("/api/")
      ? new Response(JSON.stringify({ error: "signed-out" }), { status: 401, headers: { "Content-Type": "application/json" } })
      : context.redirect(`/signin?next=${encodeURIComponent(url.pathname + url.search)}`, 302);
  } else if (gate === "admin" && locals.user?.role !== "admin") {
    response = url.pathname.startsWith("/api/") ? new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: { "Content-Type": "application/json" } }) : await forbidden(context);
  } else if (gate === "facilitator" && locals.user?.role !== "facilitator" && locals.user?.role !== "admin") {
    response = await forbidden(context);
  } else {
    response = await next();
  }

  // Responses can't be modified after the fact on every runtime, so copy into a new one.
  const headers = new Headers(response.headers);
  const emulator = PUBLIC_FIREBASE_AUTH_EMULATOR_URL;
  for (const [name, value] of Object.entries(securityHeaders({ authDomain: PUBLIC_FIREBASE_AUTH_DOMAIN, emulatorOrigins: emulator ? [emulator] : [], https: url.protocol === "https:", analytics: Boolean(PUBLIC_UMAMI_ID) }))) {
    headers.set(name, value);
  }
  // Nothing personal or gated is ever stored by a CDN or shared cache.
  if (locals.user || gate !== "open" || url.pathname.startsWith("/api/")) headers.set("Cache-Control", "private, no-store");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
});
