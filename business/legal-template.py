"""Génère les 3 pages légales de la vitrine (business/landing/<page>/index.html) à partir de business/legal/*.md.
Les champs à compléter sont écrits [ENTRE CROCHETS] dans les .md et apparaissent surlignés sur le site."""
import os, re, html
B = os.path.dirname(os.path.abspath(__file__))
TPL = """<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} · Save The Oui</title><link rel="icon" href="/favicon.svg" type="image/svg+xml">
<style>
body{{margin:0;font:400 16px/1.65 Inter,-apple-system,"Helvetica Neue",Arial,sans-serif;color:#111;background:#fff}}
header{{border-bottom:1px solid #e6e6e6}} header div{{max-width:760px;margin:0 auto;padding:0 16px;height:60px;display:flex;align-items:center;justify-content:space-between}}
header a{{font:600 14px/1 -apple-system,"Helvetica Neue",sans-serif;letter-spacing:.32em;color:#111;text-decoration:none}}
main{{max-width:760px;margin:0 auto;padding:30px 16px 70px}}
h1{{font:500 clamp(30px,6vw,44px)/1.1 -apple-system,"Helvetica Neue",sans-serif;letter-spacing:-.03em;margin:10px 0 6px}}
h2{{font:500 20px/1.3 -apple-system,"Helvetica Neue",sans-serif;margin:34px 0 8px}}
p,li{{color:#333}} a{{color:#111}} .upd{{color:#6b6b6b;font-size:14px}}
mark{{background:#fff1c9;padding:0 3px;border-radius:3px}}
nav{{display:flex;gap:16px;flex-wrap:wrap;font-size:14px;margin-top:40px;padding-top:20px;border-top:1px solid #e6e6e6}}
</style></head><body>
<header><div><a href="/"><span style="letter-spacing:.18em;text-transform:uppercase;font-size:12px">Save the</span> <b style="font:400 24px/1 'Great Vibes',cursive;letter-spacing:0">Oui</b></a><a href="/#commencer" style="letter-spacing:0;font-weight:500">Commencer</a></div></header>
<main>{body}
<nav><a href="/mentions-legales/">Mentions légales</a><a href="/cgv/">CGV</a><a href="/confidentialite/">Confidentialité</a></nav></main>
</body></html>
"""
def md(s):
    out, ul = [], False
    for line in s.strip().split('\n'):
        t = html.escape(line.strip())
        t = re.sub(r'\[([^\]]+)\]\((https?://[^)]+|/[^)]*)\)', r'<a href="\2">\1</a>', t)
        t = re.sub(r'\[([^\]]+)\]', r'<mark>\1</mark>', t)
        t = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', t)
        if t.startswith('- '):
            if not ul: out.append('<ul>'); ul = True
            out.append('<li>' + t[2:] + '</li>'); continue
        if ul: out.append('</ul>'); ul = False
        if t.startswith('# '): out.append('<h1>' + t[2:] + '</h1>')
        elif t.startswith('## '): out.append('<h2>' + t[3:] + '</h2>')
        elif t.startswith('_') and t.endswith('_'): out.append('<p class="upd">' + t[1:-1] + '</p>')
        elif t: out.append('<p>' + t + '</p>')
    if ul: out.append('</ul>')
    return '\n'.join(out)
for name in ['mentions-legales', 'cgv', 'confidentialite']:
    src = open(os.path.join(B, 'legal', name + '.md'), encoding='utf-8').read()
    title = src.strip().split('\n')[0].lstrip('# ')
    os.makedirs(os.path.join(B, 'landing', name), exist_ok=True)
    open(os.path.join(B, 'landing', name, 'index.html'), 'w', encoding='utf-8').write(TPL.format(title=html.escape(title), body=md(src)))
    print('ok', name)
