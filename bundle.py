#!/usr/bin/env python3
"""
bundle.py — inlines all js/*.js into ONE <script> block in index.html.

CRITICAL: must be ONE block, not 5 separate ones.
In browsers, `const` at top-level of a <script> block is scoped to that
block only — a second <script> block cannot see consts from the first.
Concatenating into one block makes all globals visible to each other.

Usage: python3 bundle.py <input_html> <output_html>
Runs from repo root so js/ paths resolve correctly.
"""
import re, os, sys

src_html  = sys.argv[1] if len(sys.argv) > 1 else 'index.html'
dest_html = sys.argv[2] if len(sys.argv) > 2 else 'dist/index.html'

repo_root = os.path.dirname(os.path.abspath(__file__))

with open(src_html) as f:
    html = f.read()

# Collect ALL <script src="js/..."> tags into one ordered list
JS_ORDER = ['js/data.js', 'js/app.js', 'js/renderers.js',
            'js/gamification.js', 'js/features.js']

errors = []
combined_js = []

for rel_path in JS_ORDER:
    abs_path = os.path.join(repo_root, rel_path)
    if os.path.exists(abs_path):
        content = open(abs_path).read()
        combined_js.append(f'// ── {rel_path} ──────────────────────────────')
        combined_js.append(content)
        print(f'  + {rel_path} ({len(content.splitlines())} lines)')
    else:
        errors.append(rel_path)
        print(f'  WARNING: {rel_path} not found', file=sys.stderr)

if errors:
    print('ERROR: missing JS files — aborting:', errors, file=sys.stderr)
    sys.exit(1)

# Replace ALL <script src="js/..."></script> tags with one combined block
# First remove all 5 individual tags
html = re.sub(r'\s*<script src="js/[^"]+"></script>', '', html)

# Insert the single combined block just before </body>
one_block = '<script>\n' + '\n\n'.join(combined_js) + '\n</script>\n'
html = html.replace('</body>', one_block + '</body>')

os.makedirs(os.path.dirname(dest_html) or '.', exist_ok=True)
with open(dest_html, 'w') as f:
    f.write(html)

blocks = len(re.findall(r'<script>', html))
print(f'Done. Combined into {blocks} script block(s) -> {dest_html} ({html.count(chr(10))} lines)')
