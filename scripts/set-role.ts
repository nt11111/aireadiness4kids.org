/**
 * Give or remove a staff role (brief section 8.1). Roles are Firebase custom claims, so only someone
 * with the service account can change them; users can't.
 *
 *   node scripts/set-role.ts <email> <facilitator|admin|none>
 *
 * Credentials (never commit them):
 *   - GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json (delete the file when you're done), or
 *   - FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, and PUBLIC_FIREBASE_PROJECT_ID in your shell.
 * With FIREBASE_AUTH_EMULATOR_HOST set, it changes the local emulator instead.
 *
 * The person is signed out everywhere afterwards, so the change applies the next time they sign in.
 */
import { applicationDefault, cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const ROLES = ["facilitator", "admin", "none"] as const;
type RoleArg = (typeof ROLES)[number];

const [email, role] = process.argv.slice(2) as [string | undefined, RoleArg | undefined];
if (!email || !role || !ROLES.includes(role)) {
  console.error("Usage: node scripts/set-role.ts <email> <facilitator|admin|none>");
  process.exit(1);
}

const projectId = process.env.PUBLIC_FIREBASE_PROJECT_ID ?? process.env.GCLOUD_PROJECT;
const emulator = Boolean(process.env.FIREBASE_AUTH_EMULATOR_HOST);
const credential = emulator
  ? undefined
  : process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY
    ? cert({ projectId, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n") })
    : applicationDefault();
initializeApp({ projectId, ...(credential ? { credential } : {}) });

const auth = getAuth();
const user = await auth.getUserByEmail(email).catch(() => null);
if (!user) {
  console.error(`No account found for ${email}. They need to sign up first.`);
  process.exit(1);
}
const claims = { ...(user.customClaims ?? {}) } as Record<string, unknown>;
if (role === "none") delete claims.role;
else claims.role = role;
await auth.setCustomUserClaims(user.uid, claims);
// Ends their current sessions, so the new role (or its removal) takes effect at their next sign-in.
await auth.revokeRefreshTokens(user.uid);
console.log(`${email} is now ${role === "none" ? "a regular user" : `a ${role}`}${emulator ? " (emulator)" : ""}. They'll need to sign in again.`);
