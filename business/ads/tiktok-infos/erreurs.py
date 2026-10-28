# -*- coding: utf-8 -*-
"""Le post « Les 5 erreurs » en mise en page très simple (28 octobre 2026 : « le message clair, grand, très lisible, titre de
journaux ; une slide par erreur ; les trucs en évidence, surlignés »). 7 images 1080 × 1920 : l'accroche, une par erreur,
une de fin. Fond papier uni, texte énorme, un mot clé surligné par image. python3 erreurs.py && node render.js erreurs"""
import os
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', 'landing'))
FONTS = open(os.path.join(ROOT, 'polices', 'polices.css'), encoding='utf-8').read().replace('url(/polices/', 'url(file://' + ROOT + '/polices/')

SLIDES = [
 dict(k="Faire-part de mariage", h="Les <i>5 erreurs</i> que tu dois absolument éviter sur ton faire-part.", p="", go=True),
 dict(n=1, h="Tu as oublié <i>le jour de la semaine.</i>", p="« 12 juin », c'est un vendredi ou un samedi ? Tout le monde va te le demander."),
 dict(n=2, h="Le nom du lieu, <i>sans l'adresse.</i>", p="« Domaine des Oliviers », ça ne suffit pas au GPS de tes invités."),
 dict(n=3, h="Pas de <i>date limite</i> pour répondre.", p="Sans date, personne ne répond. Écris‑la en gros."),
 dict(n=4, h="Tu n'as pas dit <i>qui est invité à quoi.</i>", p="Cérémonie, dîner, soirée : chacun doit savoir où il est attendu."),
 dict(n=5, h="Tu n'as pas <i>fait relire.</i>", p="Une faute dans un prénom, imprimée 150 fois. Fais relire par quelqu'un qui n'est pas dans le projet."),
 dict(k="À retenir", h="<i>Enregistre</i> ce post avant d'écrire le tien.", p="Tu as fait une autre erreur ? Dis‑la en commentaire.", end=True),
]

def typo(t):
    return (t.replace('« ', '« ').replace(' »', ' »').replace(' :', ' :').replace(' ?', ' ?').replace(' !', ' !'))

CSS = """
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1080px;height:1920px;overflow:hidden}
.ad{position:relative;width:1080px;height:1920px;overflow:hidden;background:#f6f1e8;color:#1e1a17;font-variant-numeric:lining-nums}
.ad::before{content:"";position:absolute;inset:0;background:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .14 0'/></filter><rect width='300' height='300' filter='url(%23n)'/></svg>");opacity:.5;pointer-events:none}
.in{position:absolute;left:84px;right:84px;top:300px;bottom:460px;display:flex;flex-direction:column;justify-content:center;gap:44px}
.k{font:600 30px/1 "Inter Tight",sans-serif;letter-spacing:.22em;text-transform:uppercase;color:#8a4a2a}
.n{display:inline-flex;align-items:center;gap:18px;font:600 30px/1 "Inter Tight",sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#1e1a17}
.n b{display:grid;place-items:center;width:78px;height:78px;border-radius:50%;background:#1e1a17;color:#f6f1e8;font:600 40px/1 "Inter Tight",sans-serif;letter-spacing:0}
h1{font:400 122px/1.14 "DM Serif Display",serif;letter-spacing:-.012em;text-wrap:balance}
h1 i{font-style:normal;background:#f6d66a;-webkit-box-decoration-break:clone;box-decoration-break:clone;padding:.01em .1em .03em;margin:0 -.1em;border-radius:6px}
p{font:400 56px/1.32 "Inter Tight",sans-serif;color:#3a342f;max-width:880px;text-wrap:pretty}
.go{position:absolute;left:84px;bottom:400px;display:flex;align-items:center;gap:18px;font:600 28px/1 "Inter Tight",sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#1e1a17}
.go i{width:54px;height:54px;border-radius:50%;background:#1e1a17;color:#f6f1e8;display:grid;place-items:center;font:normal 26px/1 sans-serif;font-style:normal}
.sig{position:absolute;left:84px;bottom:300px;display:flex;align-items:baseline;gap:10px;color:#1e1a17}
.sig span{font:500 20px/1 "Inter Tight",sans-serif;letter-spacing:.26em}
.sig b{font:400 46px/1 "Great Vibes",cursive}
.pg{position:absolute;right:84px;bottom:306px;font:500 24px/1 "Inter Tight",sans-serif;letter-spacing:.14em;color:#6b625b}
"""

def html(s, i, n):
    top = f'<div class="k">{typo(s["k"])}</div>' if s.get('k') else f'<div class="n"><b>{s["n"]}</b>Erreur {s["n"]} sur 5</div>'
    body = f'<h1>{typo(s["h"])}</h1>' + (f'<p>{typo(s["p"])}</p>' if s.get('p') else '')
    go = '<div class="go">Glisse <i>→</i></div>' if s.get('go') else ''
    sig = '<div class="sig"><span>SAVE THE</span><b>Oui</b></div>' if s.get('end') else ''
    return f'<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>{FONTS}{CSS}</style></head><body><div class="ad"><div class="in">{top}{body}</div>{go}{sig}<div class="pg">{i} / {n}</div></div></body></html>'

if __name__ == '__main__':
    os.makedirs(os.path.join(HERE, 'html'), exist_ok=True)
    for i, s in enumerate(SLIDES, 1):
        open(os.path.join(HERE, 'html', f'erreurs-{i}.html'), 'w', encoding='utf-8').write(html(s, i, len(SLIDES)))
    print('html:', len(SLIDES))
