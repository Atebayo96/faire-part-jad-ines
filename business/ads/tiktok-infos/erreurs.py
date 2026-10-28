# -*- coding: utf-8 -*-
"""Le post « Les 5 erreurs » en mise en page très simple (28 octobre 2026 : « le message clair, grand, très lisible, titre de
journaux ; une slide par erreur ; les trucs en évidence, surlignés »). 7 images 1080 × 1920 : l'accroche, une par erreur,
une de fin. Fond papier uni, texte énorme, un mot clé surligné par image. python3 erreurs.py && node render.js erreurs"""
import os
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', 'landing'))
FONTS = open(os.path.join(ROOT, 'polices', 'polices.css'), encoding='utf-8').read().replace('url(/polices/', 'url(file://' + ROOT + '/polices/')

SLIDES = [
 dict(k="Faire-part de mariage", h="Les <i>5 erreurs</i> que tu dois absolument éviter sur ton faire-part.", p="", go=True, img="choisir", pos="center 40%"),
 dict(n=1, h="Tu as oublié <i>le jour de la semaine.</i>", p="« 12 juin », c'est un vendredi ou un samedi ? Tout le monde va te le demander.", img="reponses", pos="center 45%"),
 dict(n=2, h="Le nom du lieu, <i>sans l'adresse.</i>", p="« Domaine des Oliviers », ça ne suffit pas au GPS de tes invités.", img="mamie", pos="center 30%"),
 dict(n=3, h="Pas de <i>date limite</i> pour répondre.", p="Sans date, personne ne répond. Écris‑la en gros.", img="amis", pos="center 40%"),
 dict(n=4, h="Tu n'as pas dit <i>qui est invité à quoi.</i>", p="Cérémonie, dîner, soirée : chacun doit savoir où il est attendu.", img="famille", pos="center 45%"),
 dict(n=5, h="Tu n'as pas <i>fait relire.</i>", p="Une faute dans un prénom, imprimée 150 fois. Fais relire par quelqu'un d'autre.", img="parametrer", pos="center 50%"),
 dict(k="À retenir", h="<i>Enregistre</i> ce post avant d'écrire le tien.", p="Tu as fait une autre erreur ? Dis‑la en commentaire.", end=True, img="choisir", pos="center 40%"),
]

def typo(t):
    return (t.replace('« ', '« ').replace(' »', ' »').replace(' :', ' :').replace(' ?', ' ?').replace(' !', ' !'))

CSS = """
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1080px;height:1920px;overflow:hidden}
.ad{position:relative;width:1080px;height:1920px;overflow:hidden;background:#f6f1e8;color:#1e1a17;font-variant-numeric:lining-nums}
.ad::before{content:"";position:absolute;inset:0;background:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .14 0'/></filter><rect width='300' height='300' filter='url(%23n)'/></svg>");opacity:.5;pointer-events:none}
.ph{position:absolute;left:0;top:0;width:1080px;height:900px;overflow:hidden}
.ph img{width:100%;height:100%;object-fit:cover;filter:saturate(.92) contrast(1.02)}
.ph::after{content:"";position:absolute;left:0;right:0;bottom:0;height:140px;background:linear-gradient(rgba(246,241,232,0),#f6f1e8)}
.in{position:absolute;left:84px;right:84px;top:900px;bottom:380px;display:flex;flex-direction:column;justify-content:flex-start;gap:34px}
.k{font:600 30px/1 "Inter Tight",sans-serif;letter-spacing:.22em;text-transform:uppercase;color:#8a4a2a}
.n{display:inline-flex;align-items:center;gap:18px;font:600 30px/1 "Inter Tight",sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#1e1a17}
.n b{display:grid;place-items:center;width:78px;height:78px;border-radius:50%;background:#1e1a17;color:#f6f1e8;font:600 40px/1 "Inter Tight",sans-serif;letter-spacing:0}
h1{font:400 108px/1.12 "DM Serif Display",serif;letter-spacing:-.012em;text-wrap:balance}
h1 i{font-style:normal;background:#f6d66a;-webkit-box-decoration-break:clone;box-decoration-break:clone;padding:.01em .1em .03em;margin:0 -.1em;border-radius:6px}
p{font:400 50px/1.32 "Inter Tight",sans-serif;color:#3a342f;max-width:880px;text-wrap:pretty}
.go{position:absolute;left:84px;bottom:300px;display:flex;align-items:center;gap:18px;font:600 28px/1 "Inter Tight",sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#1e1a17}
.go i{width:54px;height:54px;border-radius:50%;background:#1e1a17;color:#f6f1e8;display:grid;place-items:center;font:normal 26px/1 sans-serif;font-style:normal}
.sig{position:absolute;left:84px;bottom:296px;display:flex;align-items:baseline;gap:10px;color:#1e1a17}
.sig span{font:500 20px/1 "Inter Tight",sans-serif;letter-spacing:.26em}
.sig b{font:400 46px/1 "Great Vibes",cursive}
.hook .ic{height:560px}.hook .ic .blob{width:380px;height:350px}.hook .ic svg{width:280px;height:280px}
.hook .ph{height:620px}
.hook .in{top:560px;bottom:380px;justify-content:center;gap:40px}
.hook h1{font-size:140px;line-height:1.12}
.hook p{font-size:54px}
.pg{position:absolute;right:84px;bottom:306px;font:500 24px/1 "Inter Tight",sans-serif;letter-spacing:.14em;color:#6b625b}
"""

def html(s, i, n):
    top = f'<div class="k">{typo(s["k"])}</div>' if s.get('k') else f'<div class="n"><b>{s["n"]}</b>Erreur {s["n"]} sur 5</div>'
    body = f'<h1>{typo(s["h"])}</h1>' + (f'<p>{typo(s["p"])}</p>' if s.get('p') else '')
    go = '<div class="go">Glisse <i>→</i></div>' if s.get('go') else ''
    sig = '<div class="sig"><span>SAVE THE</span><b>Oui</b></div>' if s.get('end') else ''
    ph = f'<div class="ph"><img src="file://{ROOT}/img/people/{s["img"]}-photo.webp" style="object-position:{s.get("pos","center")}"></div>' if s.get('img') else ''
    fit = '<script>document.fonts.ready.then(()=>{const b=document.querySelector(".in"),h=b.querySelector("h1");let fs=parseFloat(getComputedStyle(h).fontSize);while(b.scrollHeight>b.clientHeight&&fs>84){fs-=2;h.style.fontSize=fs+"px"}})</script>'
    return f'<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>{FONTS}{CSS}</style></head><body><div class="ad{' hook' if s.get('go') else ''}">{ph}<div class="in">{top}{body}</div>{go}{sig}<div class="pg">{i} / {n}</div></div>{fit}</body></html>'

if __name__ == '__main__':
    os.makedirs(os.path.join(HERE, 'html'), exist_ok=True)
    for i, s in enumerate(SLIDES, 1):
        open(os.path.join(HERE, 'html', f'erreurs-{i}.html'), 'w', encoding='utf-8').write(html(s, i, len(SLIDES)))
    print('html:', len(SLIDES))
