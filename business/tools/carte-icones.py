"""Les icônes des moments de la carte (11 octobre 2026, 1 génération accordée, ~0,15 € : une planche de 8 icônes à la
dorure gravée, sur une carte verte). Découpe : la carte verte, une grille de 4 × 2, détourage du vert, poussières retirées
(on garde le grand morceau et ce qui est près de lui), puis la dorure recolorée d'un or soutenu (le vert faisait un or pâle
et verdâtre sur le papier).
L'assiette et ses couverts (ico-assiette.webp, réception et dîner) : 1 génération de plus le même jour (~0,15 €),
détourée à part, traits épaissis pour rester lisibles une fois pressés.
Usage : python3 business/tools/carte-icones.py planche.png   →   business/landing/img/carte/ico-<nom>.webp"""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage

NAMES = ['alliances', 'coupes', 'mairie', 'diner', 'henne', 'berceau', 'cocktail', 'bouquet']
DARK, LIGHT = np.array([92, 60, 14.]), np.array([226, 186, 98.])
a = np.asarray(Image.open(sys.argv[1]).convert('RGB')).astype(np.float32)
g = (a[..., 1] > a[..., 0] + 60) & (a[..., 1] > a[..., 2] + 60)
ys, xs = np.where(g); a = a[ys.min() + 12:ys.max() - 12, xs.min() + 12:xs.max() - 12]
g = (a[..., 1] > a[..., 0] + 60) & (a[..., 1] > a[..., 2] + 60)
H, W = a.shape[:2]; bg = np.median(a[g], axis=0)
al = np.clip((np.sqrt(((a - bg) ** 2).sum(axis=2)) - 40) / 80, 0, 1)
lum = (a[..., 0] * .5 + a[..., 2] * .5) / 255          # le vert fausse la luminosité : rouge et bleu seulement
for i, n in enumerate(NAMES):
    r, c = divmod(i, 4); sl = (slice(r * H // 2, (r + 1) * H // 2), slice(c * W // 4, (c + 1) * W // 4))
    A, L = al[sl], lum[sl]
    lab, k = ndimage.label(ndimage.binary_dilation(A > .3, iterations=6))
    sz = ndimage.sum(np.ones_like(A), lab, range(1, k + 1)); big = np.argmax(sz) + 1
    keep = np.isin(lab, [j + 1 for j, s in enumerate(sz) if s > sz[big - 1] * .02])   # bulles des coupes gardées
    A = A * keep
    t = np.clip((L - .25) / .6, 0, 1) ** .9
    rgb = DARK[None, None] * (1 - t[..., None]) + LIGHT[None, None] * t[..., None]
    im = Image.fromarray(np.dstack([rgb, np.clip(A * 1.25, 0, 1) * 255]).astype(np.uint8), 'RGBA')
    im = im.crop(im.getbbox()); im.thumbnail((240, 240), Image.LANCZOS)
    im.save(f'business/landing/img/carte/ico-{n}.webp', quality=92); print(n, im.size)
