// Builds the site for local tests (Node adapter + emulators) into dist-test/, then runs the build checks.
import { spawnSync } from "node:child_process";
import { BUILD_ENV } from "./test-env.mjs";

const run = (cmd, args, env = {}) => {
  const result = spawnSync(cmd, args, { stdio: "inherit", env: { ...process.env, ...env } });
  if (result.status !== 0) process.exit(result.status ?? 1);
};
run("npx", ["astro", "build"], BUILD_ENV);
run("node", ["scripts/check-dist.mjs", "--dir", "dist-test/client"]);
