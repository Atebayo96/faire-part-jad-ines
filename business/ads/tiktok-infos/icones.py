# -*- coding: utf-8 -*-
"""Posts en iconographie (28 octobre 2026 : « pour les prochains posts, pas d'images réelles : des emojis, des symboles, des
icônes, des trucs qu'on peut faire gratuitement sans générer d'images »). Même mise en page que erreurs.py (titre de journal,
une phrase par image, mot clé surligné), mais en haut une grande icône dessinée au trait (SVG, dans le fichier, aucune image
générée) sur une tache jaune. python3 icones.py && node render.js repond"""
import os
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', 'landing'))
FONTS = open(os.path.join(ROOT, 'polices', 'polices.css'), encoding='utf-8').read().replace('url(/polices/', 'url(file://' + ROOT + '/polices/')

# icônes au trait, dessinées dans une boîte 0 0 200 200 (trait 7, bouts ronds)
I = dict(
 envelope='<rect x="30" y="55" width="140" height="95" rx="12"/><path d="M30 65l70 50 70-50"/><circle cx="150" cy="50" r="24" fill="#f6d66a" stroke="none"/><path d="M140 50h20M150 40v20" stroke="#1e1a17"/>',
 silence='<rect x="25" y="60" width="150" height="90" rx="14"/><path d="M25 70l75 50 75-50"/><path d="M60 170h80" stroke-dasharray="2 16"/>',
 phoneq='<rect x="60" y="20" width="80" height="160" rx="16"/><path d="M90 165h20"/><path d="M85 75c0-14 30-14 30 0 0 10-15 10-15 25" /><circle cx="100" cy="118" r="4" fill="#1e1a17" stroke="none"/>',
 calendar='<rect x="30" y="45" width="140" height="130" rx="12"/><path d="M30 80h140M65 30v30M135 30v30"/><path d="M75 130l50-30M75 100l50 30" />',
 family='<circle cx="60" cy="60" r="22"/><circle cx="140" cy="60" r="22"/><circle cx="100" cy="112" r="16"/><path d="M20 170c0-30 18-45 40-45s40 15 40 45M100 170c0-30 18-45 40-45s40 15 40 45"/><path d="M85 170c0-20 8-30 15-30s15 10 15 30"/>',
 thought='<path d="M70 140c-30 0-45-20-45-45 0-30 25-50 60-50 10-20 40-30 65-15 25 10 30 40 15 60 15 10 10 45-25 45-20 0-30-5-40-10-10 10-20 15-30 15z"/><circle cx="55" cy="160" r="8"/><circle cx="35" cy="180" r="5"/><path d="M80 90l15 15 30-35"/>',
 check='<rect x="35" y="25" width="130" height="150" rx="14"/><path d="M60 70l12 12 24-26M60 115l12 12 24-26M110 70h35M110 115h35"/>',
 bookmark='<path d="M55 25h90v150l-45-32-45 32z"/>',
)
def svg(k): return f'<svg viewBox="0 0 200 200" fill="none" stroke="#1e1a17" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">{I[k]}</svg>'

SLIDES = [
 dict(k="Faire-part de mariage", h="Tu as envoyé ton faire-part et <i>personne ne t'a répondu ?</i>", p="Ce n'est pas qu'ils s'en fichent.", ic="silence", go=True),
 dict(n=1, t="Raison 1 sur 4", h="Ils ne savent pas <i>comment répondre.</i>", p="Pas de numéro, pas de lien, pas de carton : alors ils attendent.", ic="phoneq"),
 dict(n=2, t="Raison 2 sur 4", h="Il n'y a pas de <i>date limite.</i>", p="Sans date, c'est « plus tard ». Et plus tard, c'est jamais.", ic="calendar"),
 dict(n=3, t="Raison 3 sur 4", h="Ils attendent de savoir pour <i>les enfants</i> ou pour leur +1.", p="Tant que ce n'est pas clair sur le faire-part, ils ne répondent pas.", ic="family"),
 dict(n=4, t="Raison 4 sur 4", h="Ils pensent que <i>tu sais déjà</i> qu'ils viennent.", p="Ta sœur, ton meilleur ami, tes parents. Eux aussi doivent répondre.", ic="thought"),
 dict(k="Ce qui marche", h="Une date limite. <i>Une seule</i> façon de répondre.", p="Demande le menu en même temps. Et relance en message privé, pas dans un groupe.", ic="check"),
 dict(k="À retenir", h="<i>Enregistre</i> ce post pour le jour où tu relances.", p="Tu as une autre astuce ? Dis‑la en commentaire.", ic="bookmark", end=True),
]

def typo(t):
    return (t.replace('« ', '« ').replace(' »', ' »').replace(' :', ' :').replace(' ?', ' ?').replace(' !', ' !'))

CSS = """
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1080px;height:1920px;overflow:hidden}
.ad{position:relative;width:1080px;height:1920px;overflow:hidden;background:#f6f1e8;color:#1e1a17;font-variant-numeric:lining-nums}
.ad::before{content:"";position:absolute;inset:0;background:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .14 0'/></filter><rect width='300' height='300' filter='url(%23n)'/></svg>");opacity:.5;pointer-events:none}
.ic{position:absolute;left:0;top:0;width:1080px;height:860px;display:grid;place-items:center}
.ic .blob{position:absolute;width:560px;height:520px;border-radius:48% 52% 46% 54% / 55% 45% 55% 45%;background:#f6d66a;transform:rotate(-8deg)}
.ic svg{position:relative;width:420px;height:420px}
.in{position:absolute;left:84px;right:84px;top:880px;bottom:380px;display:flex;flex-direction:column;justify-content:flex-start;gap:34px}
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
    top = f'<div class="k">{typo(s["k"])}</div>' if s.get('k') else f'<div class="n"><b>{s["n"]}</b>{s["t"]}</div>'
    body = f'<h1>{typo(s["h"])}</h1>' + (f'<p>{typo(s["p"])}</p>' if s.get('p') else '')
    go = '<div class="go">Glisse <i>→</i></div>' if s.get('go') else ''
    sig = '<div class="sig"><span>SAVE THE</span><b>Oui</b></div>' if s.get('end') else ''
    ic = f'<div class="ic"><div class="blob"></div>{svg(s["ic"])}</div>'
    fit = '<script>document.fonts.ready.then(()=>{const b=document.querySelector(".in"),h=b.querySelector("h1");let fs=parseFloat(getComputedStyle(h).fontSize);while(b.scrollHeight>b.clientHeight&&fs>84){fs-=2;h.style.fontSize=fs+"px"}})</script>'
    return f'<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>{FONTS}{CSS}</style></head><body><div class="ad{' hook' if s.get('go') else ''}">{ic}<div class="in">{top}{body}</div>{go}{sig}<div class="pg">{i} / {n}</div></div>{fit}</body></html>'

if __name__ == '__main__':
    os.makedirs(os.path.join(HERE, 'html'), exist_ok=True)
    for i, s in enumerate(SLIDES, 1):
        open(os.path.join(HERE, 'html', f'repond-{i}.html'), 'w', encoding='utf-8').write(html(s, i, len(SLIDES)))
    print('html:', len(SLIDES))
