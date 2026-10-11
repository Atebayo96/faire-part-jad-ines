"""Les peintures de la carte et de la page unique (11 octobre 2026, 15 images accordées, ~2,25 €) : pour chaque thème,
un fond peint (ce qu'on voit autour de la feuille) et deux illustrations détourées (posées dans les coins, carte.js DECO).
Une génération par image (gemini.py), illustrations sur fond vert uni puis détourées ici (même méthode que fx-sprites.py).

Usage : python3 business/tools/carte-art.py gen <brut_dir> [clé ...]   (génère, une image par clé, sans écraser)
        python3 business/tools/carte-art.py cut <brut_dir> [clé ...]   (fonds en WebP 1080 px, illustrations détourées)
Sortie : business/landing/img/carte/<clé>.webp"""
import os, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
import numpy as np
from PIL import Image
from scipy import ndimage

STYLE = ('Fine hand-painted watercolor and gouache illustration with delicate gold ink accents, the quality of a luxury '
         'wedding stationery artist, soft natural light, crisp edges, no text, no letters, no signature, no watermark.')
GREEN = (' A single isolated object, entirely visible with a margin all around, nothing cut by the frame, on a perfectly flat '
         'uniform pure green #00FF00 background with no shadow, no gradient, no glow and no halo on the background.')
FOND = (' Seen perfectly straight on, flat, evenly lit, filling the whole frame edge to edge, no objects, no perspective, '
        'no vignette, no border, no text. It is a background surface, calm and rich in texture.')
ART = {
  # fonds (9:16)
  'dolcevita-fond':  ('Hand-painted Amalfi coast maiolica ceramic wall tiles, cobalt blue and white with small touches of lemon '
                      'yellow and green, glazed, slightly irregular hand-painted brushwork, thin grout lines.' + FOND, '9:16'),
  'nuits-fond':      ('A deep midnight blue night sky painted in gouache on textured paper, scattered small golden stars of '
                      'different sizes, a few faint gold dust specks, subtle painterly variations of blue.' + FOND, '9:16'),
  'alhambra-fond':   ('Andalusian zellige mosaic wall of hand-cut glazed tiles, eight-pointed star pattern in terracotta, deep '
                      'teal, cream and a little gold, slightly uneven glaze reflections.' + FOND, '9:16'),
  'oldmoney-fond':   ('Deep bottle green silk damask fabric with a tone-on-tone baroque floral pattern, soft sheen, fine woven '
                      'texture, no folds.' + FOND, '9:16'),
  'doucefrance-fond':('Provencal printed cotton fabric (indienne), soft lavender background with a small repeating pattern of '
                      'tiny purple and cream flowers and leaves, visible linen weave.' + FOND, '9:16'),
  # illustrations (1:1, détourées)
  'dolcevita-citrons':('A branch of an Amalfi lemon tree going diagonally from the top left corner towards the bottom right, '
                       'glossy green leaves, three ripe yellow lemons and a few small white blossoms. ' + STYLE + GREEN, '1:1'),
  'dolcevita-bouquet':('A small cluster of two ripe yellow lemons with leaves and a sprig of magenta bougainvillea. ' + STYLE + GREEN, '1:1'),
  'nuits-lanternes':  ('Three ornate brass Moroccan lanterns with pierced metal patterns and coloured glass, hanging side by '
                       'side from thin gold chains of different lengths, the chains going straight up, warm light inside the '
                       'glass only. ' + STYLE + GREEN, '1:1'),
  'nuits-lune':       ('A golden crescent moon with two small eight-pointed golden stars beside it, gilded with gold leaf texture. ' + STYLE + GREEN, '1:1'),
  'alhambra-rosace':  ('A round Andalusian zellige rosette medallion, eight-pointed star in teal, terracotta and cream glazed tiles '
                       'with a thin gold rim, seen straight on. ' + STYLE + GREEN, '1:1'),
  'alhambra-jasmin':  ('A sprig of white jasmine flowers with dark green leaves, going diagonally from bottom left to top right. ' + STYLE + GREEN, '1:1'),
  'oldmoney-laurier': ('Two gold leaf laurel branches crossing at the bottom, tied with a small dark green velvet ribbon, forming '
                       'an open half wreath (a U shape), real gold foil sheen. ' + STYLE + GREEN, '1:1'),
  'oldmoney-roses':   ('A spray of three white and blush English garden roses with green leaves and buds, going diagonally from '
                       'the top right corner towards the bottom left. ' + STYLE + GREEN, '1:1'),
  'doucefrance-lavande':('A small bouquet of fresh lavender stems tied with a pale lilac silk ribbon bow, stems at the bottom, '
                       'flowers fanning upwards. ' + STYLE + GREEN, '1:1'),
  'doucefrance-olivier':('An olive branch with silvery green narrow leaves and a few dark olives, going diagonally from the top '
                       'right corner towards the bottom left. ' + STYLE + GREEN, '1:1'),
}
OUT = 'business/landing/img/carte'

def gen(raw, k):
    p = os.path.join(raw, k + '.png')
    if os.path.exists(p): return k + ' (déjà là)'
    prompt, ratio = ART[k]
    r = subprocess.run([sys.executable, 'business/tools/gemini.py', p, prompt, '--ratio', ratio, '--size', '2K' if ratio == '9:16' else '1K'],
                       capture_output=True, text=True)
    return k + ' : ' + (r.stdout.strip() or r.stderr.strip()[-300:])

# les seules images posées par Gemini sur une carte ou avec un liseré (le second passage abîmerait les chaînes, la lune…) ;
# la valeur : retrait (px) pour lire la couleur de ce fond intérieur
INNER = {'dolcevita-bouquet': 6, 'oldmoney-laurier': 6, 'doucefrance-olivier': 40}

def inner(rgba, inset=6):
    """Gemini pose parfois l'objet sur une carte (papier blanc, carré vert foncé) au milieu du vert, ou l'entoure d'un liseré
    blanc d'autocollant : on enlève, depuis l'extérieur, tout ce qui a la couleur de ce fond intérieur et touche le vide."""
    a = np.asarray(rgba).astype(np.float32); al = a[..., 3] / 255
    for _ in range(2):
        out = al < .5
        ring = ndimage.binary_dilation(out, iterations=inset) & ~ndimage.binary_dilation(out, iterations=max(1, inset - 6))
        if ring.sum() < 50: break
        c = np.median(a[..., :3][ring], axis=0)
        d = np.sqrt(((a[..., :3] - c) ** 2).sum(axis=2))
        near = (d < 55) & (al > .5)
        if near[ring].mean() < .6: break
        lab, _ = ndimage.label(near | out)
        bg = np.isin(lab, np.unique(lab[out]))
        soft = np.clip((d - 55) / 40, 0, 1)
        edge = ndimage.binary_dilation(bg, iterations=2) & ~bg
        al = np.where(bg, 0, np.where(edge, al * soft, al))
    # les filets d'un pixel laissés par le bord de la carte ou du liseré : ouverture morphologique, grands morceaux seulement
    m = ndimage.binary_opening(al > .3, iterations=2)
    lab, n = ndimage.label(m); sz = ndimage.sum(np.ones_like(al), lab, range(1, n + 1))
    m = np.isin(lab, [i + 1 for i, v in enumerate(sz) if v > 400])
    al = al * ndimage.binary_dilation(m, iterations=1)
    a[..., 3] = al * 255
    im = Image.fromarray(a.astype(np.uint8), 'RGBA')
    return im.crop(im.getbbox())

def cut(raw, k):
    im = Image.open(os.path.join(raw, k + '.png')).convert('RGB')
    os.makedirs(OUT, exist_ok=True)
    if k.endswith('-fond'):
        im.resize((1080, round(1080 * im.height / im.width)), Image.LANCZOS).save(f'{OUT}/{k}.webp', quality=86); return k
    a = np.asarray(im).astype(np.float32)
    border = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]]); bg = np.median(border, axis=0)
    dist = np.sqrt(((a - bg) ** 2).sum(axis=2))
    al = np.clip((dist - 55) / 100, 0, 1)
    # le vert ne déborde jamais du rouge ou du bleu (liseré et reflets verts), partout où le pixel n'est pas franchement vert
    col = np.where(al[..., None] > 0, (a - (1 - al[..., None]) * bg) / np.maximum(al[..., None], 1e-3), 0)
    col = np.clip(col, 0, 255)
    gmax = np.maximum(col[..., 0], col[..., 2]) * 1.15 + 18
    spill = (a[..., 1] > a[..., 0] + 40) & (a[..., 1] > a[..., 2] + 40)
    col[..., 1] = np.where(spill | (al < .98), np.minimum(col[..., 1], gmax), col[..., 1])
    # on ne garde que les morceaux assez grands (miettes de fond)
    lab, n = ndimage.label(al > .5); sizes = ndimage.sum(np.ones_like(al), lab, range(1, n + 1))
    keep = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s > 300])
    al = al * ndimage.binary_dilation(keep, iterations=3)
    rgba = Image.fromarray(np.dstack([col, al * 255]).astype(np.uint8), 'RGBA')
    rgba = rgba.crop(rgba.getbbox())
    if k in INNER: rgba = inner(rgba, INNER[k])
    rgba.thumbnail((720, 720), Image.LANCZOS)
    rgba.save(f'{OUT}/{k}.webp', quality=90); return k + ' %dx%d' % rgba.size

if __name__ == '__main__':
    mode, raw, keys = sys.argv[1], sys.argv[2], sys.argv[3:] or list(ART)
    os.makedirs(raw, exist_ok=True)
    if mode == 'gen':
        with ThreadPoolExecutor(6) as ex:
            for r in ex.map(lambda k: gen(raw, k), keys): print(r)
    else:
        for k in keys: print(cut(raw, k))
