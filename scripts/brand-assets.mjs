// Renders the Hull mark's PNG icons and the social card from public/brand/ark-mark.svg.
// Run after changing the mark: node scripts/brand-assets.mjs
import sharp from "sharp";
import { readFileSync } from "node:fs";

const dir = new URL("../public/brand/", import.meta.url).pathname;
const inner = readFileSync(`${dir}ark-mark.svg`, "utf8").replace(/^<svg[^>]*>|<\/svg>\s*$/g, "").replace(/<title>.*?<\/title>/, "");
const font = "Helvetica Neue, Arial, sans-serif";

// Square tiles on white, for touch icons and the 404 page.
const tile = (px) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="-8 -11 64 64"><rect x="-8" y="-11" width="64" height="64" fill="#FFFFFF"/>${inner}</svg>`);
for (const px of [128, 180, 512]) await sharp(tile(px)).png().toFile(`${dir}ark-mark-${px}.png`);

// Social card, 1200x630: the mark, the name, and the three course bars along the bottom.
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#FFFFFF"/>
<g transform="translate(96 120) scale(5)">${inner}</g>
<text x="96" y="440" font-family="${font}" font-weight="800" font-size="120" letter-spacing="7" fill="#111827">ARK</text>
<text x="100" y="500" font-family="${font}" font-weight="700" font-size="34" letter-spacing="4" fill="#4B5563">AI READINESS KOLLECTIVE</text>
<text x="1104" y="250" text-anchor="end" font-family="${font}" font-weight="700" font-size="54" fill="#111827">Free AI lessons</text>
<text x="1104" y="318" text-anchor="end" font-family="${font}" font-weight="700" font-size="54" fill="#111827">for grades K-12</text>
<rect x="0" y="582" width="400" height="48" fill="#2348C8"/><rect x="400" y="582" width="400" height="48" fill="#E2512C"/><rect x="800" y="582" width="400" height="48" fill="#F2B21B"/>
</svg>`;
await sharp(Buffer.from(og)).jpeg({ quality: 88 }).toFile(`${dir}ark-og.jpg`);
console.log("Wrote ark-mark-128/180/512.png and ark-og.jpg");
