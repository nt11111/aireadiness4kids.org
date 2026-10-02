// Verifies WCAG AA contrast for every token pair the design system relies on.
// Reads hex values from the :root block of src/styles/theme.css, so changing a
// token there is automatically re-checked. Exits 1 on any failure.
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/styles/theme.css", import.meta.url), "utf8");
const root = css.slice(css.indexOf(":root {"), css.indexOf("}", css.indexOf(":root {")));
const T = Object.fromEntries([...root.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\b/g)].map(([, k, v]) => [k, v]));
T.white = "#FFFFFF";

const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

const TEXT = 4.5, UI = 3;
const LIGHT = ["bg", "surface", "surface-2"];
const pairs = [
  ...["ink", "ink-soft", "ink-faint", "brand", "success", "warning", "danger"].flatMap((fg) => LIGHT.map((bg) => [fg, bg, TEXT, "text"])),
  ["ink", "brand-soft", TEXT, "text on brand tint"], ["brand", "brand-soft", TEXT, "brand text on tint"],
  ["brand-ink", "brand", TEXT, "primary button label"], ["glow", "brand", TEXT, "emphasis on dark brand"], ["glow", "ink", TEXT, "emphasis on ink"],
  ["ink", "accent", TEXT, "text on marigold"], ["white", "danger", TEXT, "destructive button"], ["white", "success", TEXT, "success fill"], ["white", "warning", TEXT, "warning fill"],
  ["warning", "warning-soft", TEXT, "draft badge"], ["ink-soft", "surface-2", TEXT, "in-review badge"], ["brand", "brand-soft", TEXT, "reviewed badge"], ["success", "brand-soft", TEXT, "correct answer on tint"], ["warning", "surface-2", UI, "hint icon"],
  ...LIGHT.map((bg) => ["accent-strong", bg, UI, "progress fill"]),
  ...LIGHT.map((bg) => ["line-strong", bg, UI, "control border"]),
  ...LIGHT.map((bg) => ["brand", bg, UI, "focus ring"]),
  ...["aware", "literate", "fluent"].flatMap((t) => [
    [`track-${t}-on`, `track-${t}`, TEXT, "text on track fill"],
    ...LIGHT.map((bg) => [`track-${t}-ink`, bg, TEXT, "track text / ring"]),
    [`track-${t}-ink`, `track-${t}-soft`, TEXT, "chip text on tint"], ["ink", `track-${t}-soft`, TEXT, "ink on track tint"],
  ]),
];

let failed = 0;
const rows = pairs.map(([fg, bg, need, use]) => {
  if (!T[fg] || !T[bg]) { failed++; return `MISSING  --${fg} on --${bg}`; }
  const r = ratio(T[fg], T[bg]); const ok = r >= need; if (!ok) failed++;
  return `${ok ? "PASS" : "FAIL"}  ${r.toFixed(2).padStart(5)} / ${need}  --${fg} on --${bg}  (${use})`;
});
console.log(rows.join("\n"));
console.log(`\n${pairs.length - failed}/${pairs.length} pairs pass WCAG AA`);
process.exit(failed ? 1 : 0);
