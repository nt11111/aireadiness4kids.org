/**
 * firebase-admin, for server code only (API routes, middleware, server-rendered pages).
 * It holds the service account, so never import it from a component, island, or anything
 * under src/app/. Astro refuses to build if client code imports `astro:env/server`, and
 * scripts/check-dist.mjs fails the build if a private key shows up in any client bundle.
 */
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getAppCheck } from "firebase-admin/app-check";
import { ARK_EMULATORS, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } from "astro:env/server";
import { PUBLIC_FIREBASE_PROJECT_ID } from "astro:env/client";

/** Firebase isn't set up yet (missing env vars). Routes answer 503 instead of crashing. */
export class NotConfiguredError extends Error {}

const APP_NAME = "ark-server";

function adminApp(): App {
  const existing = getApps().find((a) => a.name === APP_NAME);
  if (existing) return existing;
  const projectId = PUBLIC_FIREBASE_PROJECT_ID;
  const emulatorHosts = Boolean(process.env.FIREBASE_AUTH_EMULATOR_HOST && process.env.FIRESTORE_EMULATOR_HOST);

  if (ARK_EMULATORS) {
    // Test runs only. "demo-" projects can't reach real Firebase, so a mistake here can't touch production.
    if (!projectId?.startsWith("demo-") || !emulatorHosts) {
      throw new Error("ARK_EMULATORS is set, but the project isn't a demo- project on the local emulators. Refusing to start.");
    }
    return initializeApp({ projectId }, APP_NAME);
  }

  if (process.env.FIREBASE_AUTH_EMULATOR_HOST || process.env.FIRESTORE_EMULATOR_HOST) {
    throw new Error("Emulator hosts are set without ARK_EMULATORS. Refusing to start.");
  }
  if (!projectId || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) throw new NotConfiguredError("Firebase isn't configured");
  return initializeApp(
    {
      projectId,
      // Netlify stores the key with literal "\n"; turn those back into newlines.
      credential: cert({ projectId, clientEmail: FIREBASE_CLIENT_EMAIL, privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n") }),
    },
    APP_NAME,
  );
}

export const adminAuth = () => getAuth(adminApp());
export const db = () => getFirestore(adminApp());
export const appCheck = () => getAppCheck(adminApp());
export const usingEmulators = () => ARK_EMULATORS;
