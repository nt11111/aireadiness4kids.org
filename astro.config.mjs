// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import { satteri } from "@astrojs/markdown-satteri";
import netlify from "@astrojs/netlify";
import tailwindcss from "@tailwindcss/vite";

// Every page that doesn't need a session sets `export const prerender = true`.
// Gated routes (lesson steps 2+, /my-learning, /account, /present, /admin) arrive in Phase 3.
export default defineConfig({
  site: "https://aireadiness4kids.org",
  output: "server",
  adapter: netlify(),
  integrations: [react(), mdx()],
  // Lessons cite facts with Markdown footnotes ([^name]); label that list "Sources".
  // (Sätteri is Astro's default Markdown processor; this only changes the footnote wording.)
  markdown: {
    processor: satteri({
      features: { gfm: { footnotes: { label: "Sources", backLabel: "Back to the text for source {reference}" } } },
    }),
  },
  // Old routes that moved (brief section 2). /programs -> /workshops lands in Phase 6.
  redirects: {
    "/curriculum": "/courses",
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
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
