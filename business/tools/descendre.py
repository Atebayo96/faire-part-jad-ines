"""Descend le sujet d'une scène qui monte trop haut (règle 6 : zone de texte calme jusqu'à 55 %), sans Gemini :
on étire verticalement le ciel ou le mur uni du haut (jamais le sujet), le sujet glisse vers le bas et le bas de l'image
(sol, reflets) est rogné d'autant, au plus 14 %. Solution d'attente tant que les calques ne peuvent pas être générés.
Usage : python3 business/tools/descendre.py <thème>-<clé> [...] [--cible 0.5]
Réécrit img/hd/<clé>.webp et la vignette (img/themes pour 1 à 4, img/lieux sinon)."""
import os, sys
import numpy as np
from PIL import Image
from scipy import ndimage

IMG = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'landing', 'img')
args = sys.argv[1:]
cible = .5
if '--cible' in args: i = args.index('--cible'); cible = float(args[i + 1]); del args[i:i + 2]
bande0 = None   # --bande 0.06 : bande étirée plus fine, quand une lune ou un astre est bas dans le ciel
if '--bande' in args: i = args.index('--bande'); bande0 = float(args[i + 1]); del args[i:i + 2]


def haut_du_sujet(im):
    a = np.asarray(im.convert('L').resize((270, 477))).astype(float)
    g = np.abs(ndimage.sobel(a, 1)) + np.abs(ndimage.sobel(a, 0))
    sm = np.convolve(np.array([np.percentile(r, 90) for r in g]), np.ones(9) / 9, 'same')
    return next((i for i in range(30, 477) if sm[i] > 60), 477) / 477


for key in args:
    p = os.path.join(IMG, 'hd', key + '.webp')
    im = Image.open(p).convert('RGB'); W, H = im.size
    t = haut_du_sujet(im); d = min(.14, cible - t)
    if d <= .01: print(key, 'déjà bas', round(t, 2)); continue
    s = max(.05, t - .03)                       # le ciel s'arrête un peu avant le sujet
    # on n'étire que la bande de ciel juste au-dessus du sujet (sans lune ni étoiles), le haut reste intact
    a0 = max(0, s - (bande0 or max(.12, d * 1.2)))
    haut = im.crop((0, 0, W, round(a0 * H)))
    bande = im.crop((0, round(a0 * H), W, round(s * H))).resize((W, round((s - a0 + d) * H)), Image.LANCZOS)
    reste = im.crop((0, round(s * H), W, round((1 - d) * H)))
    out = Image.new('RGB', (W, H)); out.paste(haut, (0, 0)); out.paste(bande, (0, haut.height)); out.paste(reste, (0, haut.height + bande.height))
    out.save(p, 'WEBP', quality=80, method=6)
    n = key.rsplit('-', 1)[1]
    small = os.path.join(IMG, 'themes' if n in '1234' else 'lieux', key + '.webp')
    out.resize((540, 954), Image.LANCZOS).save(small, 'WEBP', quality=82, method=6)
    print(key, f'{t:.2f} -> {haut_du_sujet(out):.2f} (rogné en bas : {d:.0%})')
