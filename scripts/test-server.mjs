// Runs the test build (dist-test/) against the local Firebase emulators. Used by Playwright, or by hand:
//   npm run build:test && npm run emulators   (in one terminal)
//   node scripts/test-server.mjs              (in another), then open http://127.0.0.1:4321
import { SERVER_ENV } from "./test-env.mjs";

Object.assign(process.env, SERVER_ENV);
await import("../dist-test/server/entry.mjs");
