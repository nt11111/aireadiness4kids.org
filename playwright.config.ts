import { defineConfig, devices } from "@playwright/test";
import { TEST_ORIGIN } from "./scripts/test-env.mjs";

// The test helpers use firebase-admin against the emulators; stop it probing for cloud metadata servers.
process.env.METADATA_SERVER_DETECTION = "none";

// Tests run against the test build (npm run build:test), served by the real Astro server with the
// middleware, and the Firebase emulators (project demo-ark). `npm test` starts the emulators first.
export default defineConfig({
  testDir: "tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [["list"]],
  globalSetup: "./tests/global-setup.ts",
  use: {
    baseURL: TEST_ORIGIN,
    // Deterministic screenshots and axe runs: transitions and animations are off under reduced motion.
    reducedMotion: "reduce",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "node scripts/test-server.mjs",
    url: TEST_ORIGIN,
    reuseExistingServer: false,
  },
});
