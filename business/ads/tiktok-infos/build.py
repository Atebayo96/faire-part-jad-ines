# -*- coding: utf-8 -*-
"""Fabrique les images des posts TikTok informatifs : python3 build.py (HTML dans html/, puis node render.js -> out/).
Format 1080 × 1920 (photo TikTok). Le texte tient dans une feuille de papier posée sur le fond peint du thème ;
la zone basse (légende, boutons TikTok) et le bord droit restent libres."""
import os, re, html as H
from posts import POSTS

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'landing'))
HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = open(os.path.join(ROOT, 'polices', 'polices.css'), encoding='utf-8').read().replace('url(/polices/', 'url(file://' + ROOT + '/polices/')

# accent par thème : mesuré ≥ 4,5:1 sur le papier le plus sombre du relief (#ddd3c3)
ACC = dict(dolcevita='#1f4f8a', doucefrance='#5b3f7a', oldmoney='#2f5a3c', nuits='#22365e', alhambra='#7d3a17')
SEALS = dict(or_=['#fbe3a0','#c99a3a','#6e4a12'], bordeaux=['#d8737b','#8e2430','#3f0b10'], bleu=['#9bb4e8','#2f4f94','#0c1a3d'],
             sauge=['#e4ecd6','#8fa37f','#3f4d36'], terracotta=['#f5b085','#c0643f','#4f1f0c'])

CSS = """
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1080px;height:1920px;overflow:hidden;background:#111}
.ad{position:relative;width:1080px;height:1920px;overflow:hidden;font-family:"Cormorant Garamond",serif;color:#2a2420;font-variant-numeric:lining-nums}
.bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.bg2{position:absolute;inset:0;background:rgba(20,14,10,.18)}
.sheet{position:absolute;left:64px;right:64px;top:210px;bottom:440px;background:#f8f2e7;border-radius:300px 300px 26px 26px;
 box-shadow:0 30px 70px rgba(0,0,0,.45),0 4px 10px rgba(0,0,0,.25);overflow:hidden}
.sheet::before{content:"";position:absolute;inset:0;background:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .18 0'/></filter><rect width='300' height='300' filter='url(%23n)'/></svg>");opacity:.55;pointer-events:none}
.rim{position:absolute;left:22px;right:22px;top:22px;bottom:22px;border-radius:280px 280px 16px 16px;
 box-shadow:inset 1.5px 1.5px 0 rgba(255,255,255,.9),inset -1.5px -1.5px 0 rgba(90,70,40,.22),1px 1px 0 rgba(90,70,40,.18),-1px -1px 0 rgba(255,255,255,.8);pointer-events:none}
.rim2{position:absolute;left:34px;right:34px;top:34px;bottom:34px;border-radius:268px 268px 12px 12px;
 box-shadow:inset 1px 1px 0 rgba(255,255,255,.85),inset -1px -1px 0 rgba(90,70,40,.18),1px 1px 0 rgba(90,70,40,.14),-1px -1px 0 rgba(255,255,255,.7);pointer-events:none}
.seal{position:absolute;left:50%;top:-6px;width:170px;height:170px;margin-left:-85px;filter:drop-shadow(0 10px 16px rgba(0,0,0,.35));z-index:3}
.seal img{width:100%;height:100%;display:block}
.seal b{position:absolute;inset:0;display:grid;place-items:center;font:400 84px/1 "Great Vibes",cursive;padding-top:8px;
 -webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 1px 0 rgba(255,244,214,.5)) drop-shadow(0 -1px .6px rgba(20,10,4,.7))}
.in{position:absolute;left:78px;right:78px;top:190px;bottom:118px;display:flex;flex-direction:column}
.k{font:600 25px/1 "Inter Tight",sans-serif;letter-spacing:.26em;text-transform:uppercase;color:var(--ac);text-align:center}
.k::after{content:"";display:block;width:64px;height:2px;background:var(--ac);margin:18px auto 0;opacity:.75}
h1{font-weight:500;font-size:68px;line-height:1.08;text-align:center;margin-top:26px;letter-spacing:-.005em;text-wrap:balance}
.hook .in{justify-content:center;top:230px;bottom:150px}
.hook h1{font-size:88px;line-height:1.08;margin-top:30px}
.hook .sub{font:italic 400 46px/1.3 "Cormorant Garamond",serif;text-align:center;margin-top:34px;color:#4a403a;text-wrap:balance}
.hook .go{margin-top:auto;display:flex;align-items:center;justify-content:center;gap:16px;font:500 24px/1 "Inter Tight",sans-serif;letter-spacing:.2em;text-transform:uppercase;color:var(--ac)}
.hook .go i{width:44px;height:44px;border-radius:50%;background:var(--ac);color:#fff;display:grid;place-items:center;font:normal 22px/1 sans-serif}
.body{margin-top:40px;display:flex;flex-direction:column;justify-content:center;flex:1;gap:var(--g,26px)}
ol,ul{list-style:none}
.list li{display:grid;grid-template-columns:66px 1fr;gap:16px;align-items:start;font:400 41px/1.28 "Cormorant Garamond",serif}
.list li i{font:600 32px/50px "Cormorant Garamond",serif;font-variant-numeric:lining-nums;width:50px;height:50px;border-radius:50%;background:var(--ac);color:#fff;text-align:center;font-style:normal;margin-top:1px}
.steps li{display:grid;grid-template-columns:1fr;gap:6px}
.steps li b{font:600 46px/1.15 "Cormorant Garamond",serif;font-variant-numeric:lining-nums;color:var(--ac)}
.steps li span{font:400 40px/1.3 "Cormorant Garamond",serif}
.tips li{display:grid;grid-template-columns:40px 1fr;gap:14px;font:400 42px/1.3 "Cormorant Garamond",serif}
.tips li i{width:14px;height:14px;border-radius:50%;background:var(--ac);margin:20px 0 0 10px}
.foot{margin-top:auto;padding-top:28px;border-top:1px solid rgba(90,70,40,.3);font:italic 400 35px/1.3 "Cormorant Garamond",serif;text-align:center;color:#4a403a;text-wrap:balance}
.quotes li{display:grid;gap:8px}
.quotes li b{font:600 26px/1 "Inter Tight",sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--ac)}
.quotes li span{font:italic 400 40px/1.3 "Cormorant Garamond",serif}
table{width:100%;border-collapse:collapse;font:400 38px/1.25 "Cormorant Garamond",serif;font-variant-numeric:lining-nums}
td{padding:18px 0;border-bottom:1px solid rgba(90,70,40,.25);vertical-align:middle}
td.c{text-align:center;color:#4a403a;white-space:nowrap;padding:0 14px;font-size:33px}
td.r{text-align:right;white-space:nowrap;font-weight:600;font-size:40px}
tr.tot td{border:0;padding-top:28px;font-weight:600;font-size:50px;color:var(--ac)}
.sig{position:absolute;left:0;right:0;bottom:46px;display:flex;justify-content:center;align-items:baseline;gap:10px;color:#2a2420}
.sig span{font:500 19px/1 "Inter Tight",sans-serif;letter-spacing:.26em}
.sig b{font:400 44px/1 "Great Vibes",cursive}
.ad .in :is(h1,p,li,b,span,td,i,div){font-variant-numeric:lining-nums}
.num{position:absolute;right:70px;bottom:52px;font:500 20px/1 "Inter Tight",sans-serif;letter-spacing:.14em;color:#4a403a;font-variant-numeric:lining-nums}
"""

def typo(t):
    """Typographie française : rien ne se sépare d'un guillemet, d'un deux-points, d'un point d'interrogation."""
    return (t.replace('« ', '«\u00a0').replace(' »', '\u00a0»').replace(' :', '\u202f:').replace(' ?', '\u202f?')
             .replace(' !', '\u202f!').replace(' ;', '\u202f;').replace(' €', '\u00a0€').replace(' %', '\u00a0%'))

def slide_html(post, s, i, n):
    th = post['theme']; seal = post['seal']; sl = SEALS[seal if seal != 'or' else 'or_']
    kind = s['kind']; s = {k: (typo(v) if isinstance(v, str) else v) for k, v in s.items()}
    T = lambda x: typo(x) if isinstance(x, str) else tuple(typo(y) for y in x)
    parts = [f'<div class="k">{s["kicker"]}</div>', f'<h1>{s["title"]}</h1>']
    if kind == 'hook':
        parts.append(f'<p class="sub">{s["sub"]}</p>' if s.get('sub') else '')
        parts.append('<div class="go">Glissez <i>→</i></div>')
    elif kind == 'list':
        parts.append('<ol class="body list">' + ''.join(f'<li><i>{j+1}</i><span>{t}</span></li>' for j, t in enumerate(map(T, s['items']))) + '</ol>')
    elif kind == 'steps':
        parts.append('<ul class="body steps" style="--g:34px">' + ''.join(f'<li><b>{a}</b><span>{b}</span></li>' for a, b in map(T, s['items'])) + '</ul>')
    elif kind == 'tips':
        parts.append('<ul class="body tips" style="--g:30px">' + ''.join(f'<li><i></i><span>{t}</span></li>' for t in map(T, s['items'])) + '</ul>')
        parts.append(f'<p class="foot">{s["foot"]}</p>')
    elif kind == 'quotes':
        parts.append('<ul class="body quotes" style="--g:40px">' + ''.join(f'<li><b>{a}</b><span>{b}</span></li>' for a, b in map(T, s['items'])) + '</ul>')
    elif kind == 'table':
        rows = ''.join(f'<tr><td>{a}</td><td class="c">{b}</td><td class="r">{c}</td></tr>' for a, b, c in map(T, s['rows']))
        rows += f'<tr class="tot"><td>{typo(s["total"][0])}</td><td></td><td class="r">{typo(s["total"][1])}</td></tr>'
        parts.append(f'<div class="body"><table>{rows}</table></div>')
    grad = f'linear-gradient(165deg,{sl[0]} 0%,{sl[1]} 50%,{sl[2]} 100%)'
    return f'''<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>{FONTS}{CSS}</style></head><body>
<div class="ad {kind}" style="--ac:{ACC[th]}">
 <img class="bg" src="file://{ROOT}/img/carte/{th}-fond.webp"><div class="bg2"></div>
 <div class="sheet"><div class="rim"></div><div class="rim2"></div>
  <div class="seal"><img src="file://{ROOT}/img/seals/{seal}.webp"><b style="background:{grad};-webkit-background-clip:text;background-clip:text">O</b></div>
  <div class="in">{''.join(parts)}</div>
  <div class="sig"><span>SAVE THE</span><b>Oui</b></div>
  <div class="num">{i} / {n}</div>
 </div>
</div></body></html>'''

if __name__ == '__main__':
    os.makedirs(os.path.join(HERE, 'html'), exist_ok=True)
    for p in POSTS:
        n = len(p['slides'])
        for i, s in enumerate(p['slides'], 1):
            with open(os.path.join(HERE, 'html', f'{p["slug"]}-{i}.html'), 'w', encoding='utf-8') as f:
                f.write(slide_html(p, s, i, n))
    print('html:', sum(len(p['slides']) for p in POSTS), 'pages')
