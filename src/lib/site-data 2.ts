// Hand-edited site data (see src/data/README.md), validated at build time.
import { existsSync } from "node:fs";
import { join } from "node:path";
import { z } from "astro/zod";
import partnersJson from "../data/partners.json";
import impactJson from "../data/impact.json";

const partnerSchema = z.object({
  name: z.string().min(1),
  url: z.url().optional(),
  logo: z.string().regex(/^\/brand\/partners\/[\w.-]+\.(svg|png|webp)$/, "Logos live in public/brand/partners/").optional(),
});

const impactSchema = z.object({
  stats: z.array(z.object({ label: z.string().min(1), value: z.string().min(1), as_of: z.iso.date() })),
});

export const partners = z.array(partnerSchema).parse(partnersJson);
export const impact = impactSchema.parse(impactJson);

// Never render a missing or placeholder logo: every listed file must exist.
for (const p of partners) {
  if (p.logo && !existsSync(join(process.cwd(), "public", p.logo))) {
    throw new Error(`src/data/partners.json: logo for "${p.name}" not found at public${p.logo}`);
  }
}
