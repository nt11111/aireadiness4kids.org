/**
 * The Firebase JS SDK in the browser, used only to sign in (brief section 8.1). Persistence is
 * in-memory: nothing is written to localStorage or IndexedDB, and right after sign-in the ID token
 * is traded for an httpOnly session cookie and the SDK signs out. The browser never talks to Firestore.
 * All values here are public by design (docs/SETUP_FIREBASE.md).
 */
import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { browserPopupRedirectResolver, connectAuthEmulator, initializeAuth, inMemoryPersistence, type Auth } from "firebase/auth";
import { getToken, initializeAppCheck, ReCaptchaEnterpriseProvider, type AppCheck } from "firebase/app-check";
import {
  PUBLIC_FIREBASE_API_KEY,
  PUBLIC_FIREBASE_APP_ID,
  PUBLIC_FIREBASE_AUTH_DOMAIN,
  PUBLIC_FIREBASE_AUTH_EMULATOR_URL,
  PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  PUBLIC_FIREBASE_PROJECT_ID,
  PUBLIC_RECAPTCHA_SITE_KEY,
} from "astro:env/client";

/** False until the Netlify env vars are set; sign-in pages then say sign-in isn't available yet. */
export const firebaseConfigured = Boolean(PUBLIC_FIREBASE_API_KEY && PUBLIC_FIREBASE_AUTH_DOMAIN && PUBLIC_FIREBASE_PROJECT_ID && PUBLIC_FIREBASE_APP_ID);

let auth: Auth | undefined;
let appCheck: AppCheck | undefined;

function firebaseApp(): FirebaseApp {
  return (
    getApps()[0] ??
    initializeApp({
      apiKey: PUBLIC_FIREBASE_API_KEY,
      authDomain: PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: PUBLIC_FIREBASE_PROJECT_ID,
      appId: PUBLIC_FIREBASE_APP_ID,
      messagingSenderId: PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    })
  );
}

/** App Check proves requests come from this site (reCAPTCHA Enterprise). Not used against the local emulators. */
function ensureAppCheck() {
  if (appCheck || PUBLIC_FIREBASE_AUTH_EMULATOR_URL || !PUBLIC_RECAPTCHA_SITE_KEY) return appCheck;
  appCheck = initializeAppCheck(firebaseApp(), { provider: new ReCaptchaEnterpriseProvider(PUBLIC_RECAPTCHA_SITE_KEY), isTokenAutoRefreshEnabled: true });
  return appCheck;
}

export function clientAuth(): Auth {
  if (!firebaseConfigured) throw new Error("firebase-not-configured");
  if (!auth) {
    auth = initializeAuth(firebaseApp(), { persistence: inMemoryPersistence, popupRedirectResolver: browserPopupRedirectResolver });
    if (PUBLIC_FIREBASE_AUTH_EMULATOR_URL) connectAuthEmulator(auth, PUBLIC_FIREBASE_AUTH_EMULATOR_URL, { disableWarnings: true });
    ensureAppCheck(); // start reCAPTCHA early so the first request isn't slow
  }
  return auth;
}

/** The App Check header for /api requests ({} on the emulators). */
export async function appCheckHeaders(): Promise<Record<string, string>> {
  const instance = firebaseConfigured ? ensureAppCheck() : undefined;
  if (!instance) return {};
  const { token } = await getToken(instance, false);
  return { "X-Firebase-AppCheck": token };
}
