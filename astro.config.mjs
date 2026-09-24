// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import netlify from "@astrojs/netlify";
import tailwindcss from "@tailwindcss/vite";

// Every page that doesn't need a session sets `export const prerender = true`.
// Gated routes (lesson steps 2+, /my-learning, /account, /present, /admin) arrive in Phase 3.
export default defineConfig({
  site: "https://aireadiness4kids.org",
  output: "server",
  adapter: netlify(),
  integrations: [react(), mdx()],
  vite: {
    plugins: [tailwindcss()],
  },
  devToolbar: { enabled: false },
});
