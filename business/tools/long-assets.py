"""Prépare les images des faire-part « en continu » (layout long) à partir des images générées (business/tools/long-prompts.json).
Usage : python3 business/tools/long-assets.py <dossier des images brutes> [<thème> ...]  (sans thème : tous)
Résultat : business/landing/img/long/<thème>/ (illustration d'ouverture, fonds, guirlandes détourées, cadre + masque, photos, scènes) et meta.json."""
import json, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage

RAW = sys.argv[1]
B = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(B, 'landing', 'img', 'long')
KEYS = {'blue': (0, 0, 255), 'magenta': (255, 0, 255)}
THEMES = {
  'nuits': dict(thumb=.12, hero=dict(ink='#f6eedb', shadow='0 2px 14px rgba(0,0,0,.55)', top='31%'), frame='magenta',
                sec=[dict(ink='#f7efdc', accent='#e9cd8a'), dict(ink='#3b2a18', accent='#6b4621'), dict(ink='#f3ead6', accent='#e2c27a')],
                bands=[('band1', 'blue', .66), ('band2', 'blue', 1.0)], ev=['nuits-2', 'nuits-3', 'nuits-4'], photos=[1, 2, 3, 4]),
  'bollywood': dict(thumb=.13, hero=dict(ink='#6b1230', shadow='0 1px 10px rgba(255,236,214,.7)', top='14%'), frame='blue',
                sec=[dict(ink='#fff1e0', accent='#f6c453'), dict(ink='#4a1426', accent='#76183e'), dict(ink='#fbf0dc', accent='#f2c14e')],
                bands=[('band1', 'blue', .86), ('band2', 'blue', .78)], ev=['bollywood-2', 'bollywood-3', 'bollywood-4'], photos=[1, 2, 3, 4]),
  'dolcevita': dict(thumb=.2, hero=dict(ink='#193f64', shadow='0 1px 12px rgba(255,255,255,.8)', top='14%'), frame='magenta',
                sec=[dict(ink='#2f3b4f', accent='#2b6598'), dict(ink='#fbf5e6', accent='#fbf4d9'), dict(ink='#3d3a2a', accent='#265a88')],
                bands=[('band1', 'blue', .9), ('band2', 'magenta', 1.0)], ev=['dolcevita-2', 'dolcevita-3', 'dolcevita-4'], photos=[1, 2, 3, 4]),
  # styles par communauté : scènes des événements générées avec le reste (long-gen.py), rangées dans la banque
  'chinois': dict(thumb=.1, hero=dict(ink='#fbeedd', shadow='0 2px 14px rgba(0,0,0,.6)', top='12%'), frame='magenta',
                sec=[dict(ink='#fbeedd', accent='#e9c37a'), dict(ink='#4a1a16', accent='#a3161f'), dict(ink='#fff1dc', accent='#f2cf7e')],
                bands=[('band1', 'blue', 1.0), ('band2', 'magenta', 1.0)], ev=['chinois-2', 'chinois-3', 'chinois-4'], photos=[1, 2, 3, 4]),
  'japonais': dict(thumb=.08, hero=dict(ink='#2b2830', shadow='0 1px 10px rgba(255,250,240,.85)', top='12%'), frame='magenta',
                sec=[dict(ink='#2b2b33', accent='#b8382a'), dict(ink='#f4eee2', accent='#f2c4cc'), dict(ink='#3a2830', accent='#a8322e')],
                bands=[('band1', 'blue', 1.0), ('band2', 'magenta', 1.0)], ev=['japonais-2', 'japonais-3', 'japonais-4'], photos=[1, 2, 3, 4]),
  'gzhel': dict(thumb=.08, hero=dict(ink='#1d3f9a', shadow='0 1px 10px rgba(255,255,255,.9)', top='12%'), frame='magenta',
                sec=[dict(ink='#1d3f9a', accent='#2448a8'), dict(ink='#f5f7fb', accent='#d6e1ff'), dict(ink='#1a2f73', accent='#2448a8')],
                bands=[('band1', 'magenta', 1.0), ('band2', 'magenta', 1.0)], ev=['gzhel-2', 'gzhel-3', 'gzhel-4'], photos=[1, 2, 3, 4]),
  'asianchic': dict(thumb=.08, hero=dict(ink='#f2e7cf', shadow='0 2px 14px rgba(0,0,0,.7)', top='12%'), frame='magenta',
                sec=[dict(ink='#f2e7cf', accent='#d8b469'), dict(ink='#1e1d19', accent='#2a6152'), dict(ink='#f3ead6', accent='#e6c77f')],
                bands=[('band1', 'blue', 1.0), ('band2', 'magenta', 1.0)], ev=['asianchic-2', 'asianchic-3', 'asianchic-4'], photos=[1, 2, 3, 4]),
  'y2k': dict(thumb=.08, hero=dict(ink='#4a1640', shadow='0 1px 10px rgba(255,240,248,.85)', top='12%'), frame='magenta',
                sec=[dict(ink='#4a1f45', accent='#b0156e'), dict(ink='#2a1d4a', accent='#5a2fb0'), dict(ink='#1d3550', accent='#215f9e')],
                bands=[('band1', 'blue', 1.0), ('band2', 'magenta', 1.0)], ev=['y2k-2', 'y2k-3', 'y2k-4'], photos=[1, 2, 3, 4]),
  'oldmoney': dict(thumb=.08, hero=dict(ink='#1f2b44', shadow='0 1px 10px rgba(255,252,244,.9)', top='12%'), frame='magenta',
                sec=[dict(ink='#1f2b44', accent='#2f4a36'), dict(ink='#f2ecdf', accent='#d2b475'), dict(ink='#f3eee2', accent='#e0c890')],
                bands=[('band1', 'blue', 1.0), ('band2', 'magenta', 1.0)], ev=['oldmoney-2', 'oldmoney-3', 'oldmoney-4'], photos=[1, 2, 3, 4]),
  'afro': dict(thumb=.08, hero=dict(ink='#fbeedb', shadow='0 2px 14px rgba(0,0,0,.6)', top='12%'), frame='magenta',
                sec=[dict(ink='#fbeedb', accent='#f2b440'), dict(ink='#2b1a10', accent='#9a3a18'), dict(ink='#f6ecd6', accent='#f2c14e')],
                bands=[('band1', 'blue', 1.0), ('band2', 'magenta', 1.0)], ev=['afro-2', 'afro-3', 'afro-4'], photos=[1, 2, 3, 4]),
  # variantes de Mille et une nuits (family:'nuits') : scènes des événements = leurs décors 2 à 4 (rangés dans la banque)
  'alhambra': dict(hero_hd=True, bands_from='nuits', thumb=.08, hero=dict(ink='#4a2416', shadow='0 1px 10px rgba(255,250,240,.85)', top='12%'), frame='magenta',
                sec=[dict(ink='#3e2518', accent='#8a4a22'), dict(ink='#2b3424', accent='#3f5a34'), dict(ink='#3e2518', accent='#9a4f2a')],
                bands=[('band1', 'blue', 1.0), ('band2', 'blue', 1.0)], ev=['alhambra-2', 'alhambra-3', 'alhambra-4'], photos=[1, 2, 3, 4]),
  'maghreb': dict(thumb=.08, hero=dict(ink='#1d3f73', shadow='0 1px 10px rgba(255,255,255,.85)', top='12%'), frame='magenta',
                sec=[dict(ink='#1d3f73', accent='#2f5c9a'), dict(ink='#f4f6fa', accent='#f2c46a'), dict(ink='#3a2a1c', accent='#a3532a')],
                bands=[('band1', 'blue', 1.0), ('band2', 'blue', 1.0)], ev=['maghreb-2', 'maghreb-3', 'maghreb-4'], photos=[1, 2, 3, 4]),
  'desert': dict(hero_hd=True, bands_from='nuits', thumb=.08, hero=dict(ink='#f6e7c8', shadow='0 2px 14px rgba(0,0,0,.6)', top='12%'), frame='magenta',
                sec=[dict(ink='#f6e7c8', accent='#e7c27a'), dict(ink='#3a2616', accent='#7a4a1e'), dict(ink='#f4e6cc', accent='#e2b66a')],
                bands=[('band1', 'blue', 1.0), ('band2', 'blue', 1.0)], ev=['desert-2', 'desert-3', 'desert-4'], photos=[1, 2, 3, 4]),
  'emeraude': dict(hero_hd=True, bands_from='nuits', thumb=.08, hero=dict(ink='#f6e3ae', shadow='0 2px 14px rgba(0,0,0,.65)', top='12%'), frame='magenta',
                sec=[dict(ink='#f6ecd2', accent='#e6c77a'), dict(ink='#1f2a20', accent='#1f5a44'), dict(ink='#f3e9d0', accent='#e2c27a')],
                bands=[('band1', 'blue', 1.0), ('band2', 'blue', 1.0)], ev=['emeraude-2', 'emeraude-3', 'emeraude-4'], photos=[1, 2, 3, 4]),
}

def key_alpha(a, key, lo=70, hi=150):
    d = np.sqrt(((a[..., :3].astype(float) - np.array(key)) ** 2).sum(-1))
    return np.clip((d - lo) / (hi - lo), 0, 1)

def unspill(rgb, alpha, key):
    a = np.maximum(alpha, 1e-3)[..., None]
    out = (rgb.astype(float) - (1 - a) * np.array(key)) / a
    return np.clip(out, 0, 255)

def save_rgba(rgb, alpha, path, width, q=82):
    im = Image.fromarray(np.dstack([rgb, alpha * 255]).astype(np.uint8), 'RGBA')
    im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    im.save(path, 'WEBP', quality=q, method=6)
    return im.size

ONLY = sys.argv[2:]
for t, c in THEMES.items():
    if ONLY and t not in ONLY: continue
    d = os.path.join(OUT, t); os.makedirs(d, exist_ok=True)
    meta = dict(base=f'/img/long/{t}', sec=[], bands=[], ev=[], photos=[])
    # illustration d'ouverture
    # provisoire (quota Gemini atteint le 5 octobre 2026) : sans illustration verticale peinte, l'ouverture est la scène 1
    # du thème (img/hd/<thème>-1, zone de texte déjà contrôlée) ; à remplacer par long-gen.py dès que possible
    hraw = f'{RAW}/{t}-hero.png'
    h = Image.open(hraw if os.path.exists(hraw) or not c.get('hero_hd') else os.path.join(B, 'landing', 'img', 'hd', f'{t}-1.webp')).convert('RGB')
    ha = np.asarray(h); bottom = ha[-int(ha.shape[0] * .025):].reshape(-1, 3).mean(0)
    h = h.resize((900, round(h.height * 900 / h.width)), Image.LANCZOS); h.save(f'{d}/hero.webp', 'WEBP', quality=80, method=6)
    meta['hero'] = dict(src='hero.webp', w=h.width, h=h.height, **c['hero'], **({'fade': '58%'} if c.get('hero_hd') and not os.path.exists(hraw) else {}))
    # fonds : le premier prend exactement la couleur du bas de l'illustration ; raccord invisible en hauteur (miroir)
    for i in (1, 2, 3):
        tx = np.asarray(Image.open(f'{RAW}/{t}-tex{i}.png').convert('RGB')).astype(float)
        # provisoire (hero_hd) : la scène 1 n'est pas peinte pour se prolonger ; on garde la vraie couleur du fond du thème
        # et l'image s'y fond sur une longue hauteur (hero.fade), au lieu de teinter le fond de la couleur du sol de la scène
        if i == 1 and not c.get('hero_hd'): tx = tx - tx.reshape(-1, 3).mean(0) + bottom
        tx = np.clip(tx, 0, 255).astype(np.uint8)
        tile = np.vstack([tx, tx[::-1]])
        im = Image.fromarray(tile).resize((780, round(tile.shape[0] * 780 / tile.shape[1])), Image.LANCZOS)
        im.save(f'{d}/tex{i}.webp', 'WEBP', quality=78, method=6)
        meta['sec'].append(dict(tex=f'tex{i}.webp', **c['sec'][i - 1]))
    # guirlandes détourées
    for name, k, keep in c['bands']:
        if not os.path.exists(f'{RAW}/{t}-{name}.png') and c.get('bands_from'):  # provisoire : guirlandes d'un thème voisin
            Image.open(os.path.join(OUT, c['bands_from'], f'{name}.webp')).save(f'{d}/{name}.webp', 'WEBP', quality=82, method=6)
            meta['bands'].append(f'{name}.webp'); continue
        a = np.asarray(Image.open(f'{RAW}/{t}-{name}.png').convert('RGB')); a = a[:int(a.shape[0] * keep)]
        al = key_alpha(a, KEYS[k]); rgb = unspill(a, al, KEYS[k])
        # on ne garde que la guirlande : les petits morceaux isolés (taches, objets parasites) sont effacés
        lab, n = ndimage.label(al > .3); sizes = ndimage.sum(np.ones_like(al), lab, range(1, n + 1))
        keepl = [i + 1 for i, sz in enumerate(sizes) if sz >= .02 * sizes.max()]
        al = al * ndimage.binary_dilation(np.isin(lab, keepl), iterations=3)
        rows = np.where(al.max(1) > .05)[0]; rgb, al = rgb[rows[0]:rows[-1] + 1], al[rows[0]:rows[-1] + 1]
        save_rgba(rgb, al, f'{d}/{name}.webp', 1400)
        meta['bands'].append(f'{name}.webp')
    # cadre : fenêtre (fond de la couleur clé au centre) -> masque pour la scène ; extérieur transparent
    a = np.asarray(Image.open(f'{RAW}/{t}-frame.png').convert('RGB')); K = KEYS[c['frame']]
    al = key_alpha(a, K); lab, n = ndimage.label(al < .5)
    win = lab == lab[a.shape[0] // 2, a.shape[1] // 2]
    rgb = unspill(a, al, K)
    ys, xs = np.where(al > .5); y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    rgb, al, win = rgb[y0:y1, x0:x1], al[y0:y1, x0:x1], win[y0:y1, x0:x1]
    size = save_rgba(rgb, al, f'{d}/frame.webp', 720)
    m = ndimage.binary_dilation(win, iterations=8).astype(float)
    Image.fromarray((np.dstack([np.full(m.shape + (3,), 255), m * 255])).astype(np.uint8), 'RGBA').resize(size, Image.LANCZOS).save(f'{d}/frame-mask.png', optimize=True)
    meta['frame'] = dict(src='frame.webp', mask='frame-mask.png', w=size[0], h=size[1])
    # scènes des événements (banque d'images) et photos
    for i, s in enumerate(c['ev']):
        im = Image.open(os.path.join(B, 'banque', s + '.webp')).convert('RGB'); im = im.resize((720, round(im.height * 720 / im.width)), Image.LANCZOS)
        im.save(f'{d}/ev{i + 1}.webp', 'WEBP', quality=80, method=6); meta['ev'].append(f'ev{i + 1}.webp')
    for i in c['photos']:
        im = Image.open(f'{RAW}/{t}-ph{i}.png').convert('RGB'); im = im.resize((640, round(im.height * 640 / im.width)), Image.LANCZOS)
        im.save(f'{d}/ph{i}.webp', 'WEBP', quality=80, method=6); meta['photos'].append(f'ph{i}.webp')
    # vignette pour la vitrine : le haut de l'illustration
    th = Image.open(f'{d}/hero.webp').convert('RGB'); y0 = round(th.height * c.get('thumb', .1)); th.crop((0, y0, th.width, y0 + round(th.width * 1.6))).resize((480, 768), Image.LANCZOS).save(f'{d}/thumb.webp', 'WEBP', quality=80)
    json.dump(meta, open(f'{d}/meta.json', 'w'), indent=1)
    print(t, 'ok', sum(os.path.getsize(os.path.join(d, f)) for f in os.listdir(d)) // 1024, 'Ko')
