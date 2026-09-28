/**
 * Guards shared by every /api route (brief sections 8.1 and 8.4):
 * - state-changing routes are POST only, and reject any request whose Origin isn't this site (CSRF);
 * - bodies must be JSON, small, and pass a zod schema;
 * - an App Check token is required (bot protection), except on the local emulators;
 * - errors come back as { error: code } with no details, and nothing personal is logged.
 */
import type { APIContext, APIRoute } from "astro";
import { z } from "astro/zod";
import { HttpError } from "./authz";
import { appCheck, NotConfiguredError, usingEmulators } from "./firebase-admin";

const MAX_BODY_BYTES = 16 * 1024;

export function json(status: number, data: unknown, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "private, no-store", ...headers },
  });
}

export function assertSameOrigin(request: Request, url: URL) {
  if (request.method !== "POST") throw new HttpError(405, "method-not-allowed");
  const origin = request.headers.get("origin");
  if (!origin || origin !== url.origin) throw new HttpError(403, "cross-origin");
  // Browsers also say where the request came from; if they do, it must be this site.
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") throw new HttpError(403, "cross-origin");
}

export async function assertAppCheck(request: Request) {
  if (usingEmulators()) return; // App Check has no emulator; test runs are local only (see firebase-admin.ts).
  const token = request.headers.get("x-firebase-appcheck");
  if (!token || token.length > 4096) throw new HttpError(401, "app-check");
  try {
    await appCheck().verifyToken(token);
  } catch (error) {
    if (error instanceof NotConfiguredError) throw error;
    throw new HttpError(401, "app-check");
  }
}

async function readJson(request: Request): Promise<unknown> {
  const type = (request.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  if (type !== "application/json") throw new HttpError(415, "json-only");
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) throw new HttpError(413, "too-large");
  try {
    return JSON.parse(text || "{}");
  } catch {
    throw new HttpError(400, "invalid");
  }
}

export function errorResponse(error: unknown) {
  if (error instanceof HttpError) return json(error.status, { error: error.code });
  if (error instanceof NotConfiguredError) return json(503, { error: "not-configured" });
  if (error instanceof z.ZodError) return json(400, { error: "invalid" });
  // Log the kind of failure only: messages from Firebase can include emails.
  const code = (error as { code?: string }).code;
  console.error(`[api] ${error instanceof Error ? error.name : "error"}${code ? ` (${code})` : ""}`);
  return json(500, { error: "server" });
}

type PostOptions<S extends z.ZodType> = {
  schema: S;
  /** Signing out skips App Check so it always works; everything that creates or changes data requires it. */
  appCheck?: boolean;
};

/** A POST-only JSON endpoint with the CSRF, App Check, and validation guards applied. */
export function postRoute<S extends z.ZodType>(opts: PostOptions<S>, handler: (context: APIContext, body: z.infer<S>) => Promise<Response | object>): APIRoute {
  return async (context) => {
    try {
      assertSameOrigin(context.request, context.url);
      if (opts.appCheck !== false) await assertAppCheck(context.request);
      const body = opts.schema.parse(await readJson(context.request));
      const result = await handler(context, body);
      return result instanceof Response ? result : json(200, result);
    } catch (error) {
      return errorResponse(error);
    }
  };
}

/** A read-only GET endpoint. */
export function getRoute(handler: (context: APIContext) => Promise<Response | object>): APIRoute {
  return async (context) => {
    try {
      const result = await handler(context);
      return result instanceof Response ? result : json(200, result);
    } catch (error) {
      return errorResponse(error);
    }
  };
}

/** Any other method on an API route. */
export const methodNotAllowed: APIRoute = () => json(405, { error: "method-not-allowed" });
