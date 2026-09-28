// @ts-check
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig, envField } from "astro/config";
import { loadEnv } from "vite";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import { satteri } from "@astrojs/markdown-satteri";
import netlify from "@astrojs/netlify";
import tailwindcss from "@tailwindcss/vite";
import { netlifyHeadersFile } from "./src/lib/security/policy.mjs";

// Production builds for Netlify. Tests build the same site with the Node adapter (ARK_ADAPTER=node)
// so middleware and server routes run locally against the Firebase emulators.
const testBuild = process.env.ARK_ADAPTER === "node";
const env = loadEnv(process.env.NODE_ENV ?? "production", process.cwd(), "");

/** Writes the security headers for static pages into the build (brief section 8.4). */
const staticSecurityHeaders = () => ({
  name: "ark-static-security-headers",
  hooks: {
    /** @param {{ dir: URL }} opts */
    "astro:build:done": ({ dir }) => {
      const emulator = env.PUBLIC_FIREBASE_AUTH_EMULATOR_URL;
      writeFileSync(
        fileURLToPath(new URL("_headers", dir)),
        netlifyHeadersFile({ authDomain: env.PUBLIC_FIREBASE_AUTH_DOMAIN, emulatorOrigins: emulator ? [emulator] : [], https: !testBuild, analytics: Boolean(env.PUBLIC_UMAMI_ID) }),
      );
    },
  },
});

// Pages that don't need a session set `export const prerender = true` and are served as static files.
// Server-rendered: lesson steps, /account, /my-learning, /present, /admin, /forbidden, and /api/*.
export default defineConfig({
  site: "https://aireadiness4kids.org",
  output: "server",
  outDir: process.env.ARK_OUT_DIR ?? "./dist",
  // @astrojs/node is a dev dependency, loaded only for test builds, so Netlify can build with
  // NODE_ENV=production (which skips dev dependencies). docs/SETUP_FIREBASE.md.
  adapter: testBuild ? (await import("@astrojs/node")).default({ mode: "standalone" }) : netlify(),
  integrations: [react(), mdx(), staticSecurityHeaders()],
  // Environment variables (docs/SETUP_FIREBASE.md). Server secrets are read at runtime on the server
  // and Astro refuses to build if client code imports them.
  env: {
    schema: {
      PUBLIC_FIREBASE_API_KEY: envField.string({ context: "client", access: "public", optional: true }),
      PUBLIC_FIREBASE_AUTH_DOMAIN: envField.string({ context: "client", access: "public", optional: true }),
      PUBLIC_FIREBASE_PROJECT_ID: envField.string({ context: "client", access: "public", optional: true }),
      PUBLIC_FIREBASE_APP_ID: envField.string({ context: "client", access: "public", optional: true }),
      PUBLIC_FIREBASE_MESSAGING_SENDER_ID: envField.string({ context: "client", access: "public", optional: true }),
      PUBLIC_RECAPTCHA_SITE_KEY: envField.string({ context: "client", access: "public", optional: true }),
      // Umami Cloud website id (brief section 8.7). Unset: no analytics script and no events.
      PUBLIC_UMAMI_ID: envField.string({ context: "client", access: "public", optional: true }),
      // Test builds only: the local Auth emulator, e.g. http://127.0.0.1:9099.
      PUBLIC_FIREBASE_AUTH_EMULATOR_URL: envField.string({ context: "client", access: "public", optional: true }),
      FIREBASE_CLIENT_EMAIL: envField.string({ context: "server", access: "secret", optional: true }),
      FIREBASE_PRIVATE_KEY: envField.string({ context: "server", access: "secret", optional: true }),
      // Test runs only: talk to the local emulators and skip App Check. Refuses to run with a real project.
      ARK_EMULATORS: envField.boolean({ context: "server", access: "secret", default: false }),
    },
  },
  // Lessons cite facts with Markdown footnotes ([^name]); label that list "Sources".
  // (Sätteri is Astro's default Markdown processor; this only changes the footnote wording.)
  markdown: {
    processor: satteri({
      features: { gfm: { footnotes: { label: "Sources", backLabel: "Back to the text for source {reference}" } } },
    }),
  },
  // Old routes that moved (brief section 2). Permanent (301) redirects; #anchors carry over.
  redirects: {
    "/curriculum": "/courses",
    "/programs": "/workshops",
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      // Keep every bundled script a file on this site (never inlined), so the CSP can allow 'self'
      // and a fixed list of inline scripts only.
      assetsInlineLimit: 0,
      rolldownOptions: {
        // Astro tags MDX content modules with "use astro:head-inject" and reads the tag before
        // bundling; Rolldown then warns that it drops the directive. Filter only that known-harmless case.
        onwarn(warning, warn) {
          if (warning.code === "MODULE_LEVEL_DIRECTIVE" && warning.message.includes("astro:head-inject")) return;
          warn(warning);
        },
      },
    },
  },
  devToolbar: { enabled: false },
});
