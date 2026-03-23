#!/usr/bin/env python3
"""
bundle.py — inlines js/*.js into index.html for GitHub Pages deployment.
The workflow calls:  python3 bundle.py /tmp/index_patched.html dist/index.html
The script runs from the repo root, so js/ paths are relative to there.
"""
import re, os, sys

src_html  = sys.argv[1] if len(sys.argv) > 1 else 'index.html'
dest_html = sys.argv[2] if len(sys.argv) > 2 else 'dist/index.html'

# Always resolve js/ relative to the repo root (where this script lives)
repo_root = os.path.dirname(os.path.abspath(__file__))

with open(src_html) as f:
    html = f.read()

errors = []

def inline_script(m):
    rel_path = m.group(1)                              # e.g. js/app.js
    abs_path = os.path.join(repo_root, rel_path)
    if os.path.exists(abs_path):
        content = open(abs_path).read()
        print(f'  inlined: {rel_path} ({len(content.splitlines())} lines)')
        return '<script>\n' + content + '\n</script>'
    errors.append(rel_path)
    return f'<script>console.error("MISSING: {rel_path}");</script>'

result = re.sub(r'<script src="(js/[^"]+)"></script>', inline_script, html)

if errors:
    print('ERROR: missing JS files:', errors, file=sys.stderr)
    sys.exit(1)   # Fail the build — do not deploy broken HTML

os.makedirs(os.path.dirname(dest_html) or '.', exist_ok=True)
with open(dest_html, 'w') as f:
    f.write(result)

n = len(re.findall(r'<script src="js/', html))
print(f'Done. {n} files inlined -> {dest_html} ({result.count(chr(10))} lines)')
