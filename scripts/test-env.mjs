// Settings for local test builds and the test server: the Firebase emulators and a "demo-" project,
// which Firebase guarantees can never reach real (production) resources.
export const TEST_PORT = 4321;
export const TEST_ORIGIN = `http://127.0.0.1:${TEST_PORT}`;
export const EMULATORS = { auth: "127.0.0.1:9099", firestore: "127.0.0.1:8080" };

export const BUILD_ENV = {
  ARK_ADAPTER: "node",
  ARK_OUT_DIR: "./dist-test",
  PUBLIC_FIREBASE_API_KEY: "demo-api-key",
  PUBLIC_FIREBASE_AUTH_DOMAIN: "demo-ark.firebaseapp.com",
  PUBLIC_FIREBASE_PROJECT_ID: "demo-ark",
  PUBLIC_FIREBASE_APP_ID: "1:000000000000:web:demo",
  PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "000000000000",
  PUBLIC_FIREBASE_AUTH_EMULATOR_URL: `http://${EMULATORS.auth}`,
};

export const SERVER_ENV = {
  HOST: "127.0.0.1",
  PORT: String(TEST_PORT),
  ARK_EMULATORS: "true",
  FIREBASE_AUTH_EMULATOR_HOST: EMULATORS.auth,
  FIRESTORE_EMULATOR_HOST: EMULATORS.firestore,
  GCLOUD_PROJECT: "demo-ark",
  // Like production: React's production build, and no probing for Google Cloud metadata servers.
  NODE_ENV: "production",
  METADATA_SERVER_DETECTION: "none",
};
