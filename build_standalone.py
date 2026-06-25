#!/usr/bin/env python3
"""
Build fully self-contained, single-file versions of every page into dist/.
CSS and JS are inlined, and the ARK logo is embedded as a base64 data URI,
so each HTML file works on its own with no css/ js/ assets/ folders.

Re-run after editing the source files:  python3 build_standalone.py
"""
import base64, pathlib, re

ROOT = pathlib.Path(__file__).parent
DIST = ROOT / "dist"
DIST.mkdir(exist_ok=True)

PAGES = ["index.html", "curriculum.html", "programs.html", "about.html", "get-involved.html"]

css = (ROOT / "css" / "styles.css").read_text(encoding="utf-8")
js = (ROOT / "js" / "main.js").read_text(encoding="utf-8")

# Use the compressed logo if present, else the full transparent mark.
logo_path = pathlib.Path("/tmp/m128.png")
if not logo_path.exists():
    logo_path = ROOT / "assets" / "ark-mark.png"
logo_b64 = base64.b64encode(logo_path.read_bytes()).decode("ascii")
data_uri = f"data:image/png;base64,{logo_b64}"

for name in PAGES:
    html = (ROOT / name).read_text(encoding="utf-8")
    html = html.replace(
        '<link rel="stylesheet" href="css/styles.css">',
        "<style>\n" + css + "\n</style>",
    )
    html = html.replace(
        '<script src="js/main.js"></script>',
        "<script>\n" + js + "\n</script>",
    )
    # Embed every logo reference (mark, favicon sizes) as the data URI.
    for ref in ("assets/ark-mark-512.png", "assets/ark-mark-180.png", "assets/ark-mark.png"):
        html = html.replace(ref, data_uri)
    (DIST / name).write_text(html, encoding="utf-8")
    kb = round(len(html.encode("utf-8")) / 1024)
    print(f"  dist/{name:<20} {kb} KB")

# Helpful for GitHub Pages: disable Jekyll so nothing is reprocessed.
(DIST / ".nojekyll").write_text("", encoding="utf-8")
print("Done. Upload the contents of dist/ to your GitHub Pages repo root.")
