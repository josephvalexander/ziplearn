#!/usr/bin/env python3
"""
bundle.py — called by deploy.yml to inline js/*.js into index.html.
Usage: python3 bundle.py <input_html> <output_html>
"""
import re, os, sys

src_html  = sys.argv[1] if len(sys.argv) > 1 else '/tmp/index_patched.html'
dest_html = sys.argv[2] if len(sys.argv) > 2 else 'dist/index.html'

with open(src_html) as f:
    html = f.read()

def inline_script(m):
    path = m.group(1)
    if os.path.exists(path):
        content = open(path).read()
        return '<script>\n' + content + '\n</script>'
    print('WARNING: ' + path + ' not found — skipping', file=sys.stderr)
    return '<script>console.warn("Build: ' + path + ' missing");</script>'

result = re.sub(r'<script src="(js/[^"]+)"></script>', inline_script, html)

os.makedirs(os.path.dirname(dest_html) or '.', exist_ok=True)
with open(dest_html, 'w') as f:
    f.write(result)

n = len(re.findall(r'<script src="js/', html))
left = len(re.findall(r'<script src="js/', result))
print(f'Bundled {n} JS files into {dest_html}. External tags remaining: {left}')
