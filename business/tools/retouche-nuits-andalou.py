"""Retouches sans génération des images de Mille et une nuits et de l'Andalou (10 octobre 2026), après nuits-andalou.py :
  - alhambra-mairie : Gemini a écrit « MAIRIE » dans le ciel ; le mot est effacé (ses traits foncés sont bouchés avec le
    ciel autour, par diffusion), aucun autre pixel ne bouge ;
  - les zones de texte au contraste trop juste sont corrigées DANS la peinture (règle 7) : assombries pour un texte blanc,
    adoucies et éclaircies pour un texte foncé, avec un fondu entre 50 et 62 % de la hauteur (aucune ligne visible).
Repart toujours de l'image générée (/tmp/claude-0/nuits-andalou/<clé>.png), réécrit img/hd, img/lieux (et img/themes pour
les scènes 1 à 4), puis mesure le contraste avec check_images.py.
Usage : python3 business/tools/retouche-nuits-andalou.py"""
import os, sys
import numpy as np
from PIL import Image, ImageFilter
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import lieux as L, check_images as C
SRC = '/tmp/claude-0/nuits-andalou'


def ramp(h, a=.50, b=.62):
    # 1 en haut, 0 sous b : la retouche ne touche que la zone du texte et s'efface sans ligne
    y = np.arange(h) / h
    return np.clip((b - y) / (b - a), 0, 1)[:, None, None]


def darken(im, f):
    a = np.asarray(im).astype(float); m = ramp(a.shape[0])
    return Image.fromarray(np.clip(a * (1 - (1 - f) * m), 0, 255).astype('uint8'))


def soften(im, blur, white):
    a = np.asarray(im).astype(float); b = np.asarray(im.filter(ImageFilter.GaussianBlur(blur))).astype(float)
    m = ramp(a.shape[0]); out = a * (1 - m) + (b * (1 - white) + 255 * white) * m
    return Image.fromarray(np.clip(out, 0, 255).astype('uint8'))


def box(x, r):
    # moyenne sur un carré de (2r+1)² pixels, par sommes cumulées (flou en virgule flottante)
    p = np.pad(x, r + 1, mode='edge'); c = p.cumsum(0).cumsum(1); n = 2 * r + 1
    s = c[n:, n:] - c[:-n, n:] - c[n:, :-n] + c[:-n, :-n]
    return s[:x.shape[0], :x.shape[1]] / (n * n)


def erase_text(im, bx):
    # traits foncés du mot dans la boîte, élargis de 3 px, remplis par la moyenne des pixels connus voisins (diffusion)
    a = np.asarray(im).astype(float); x0, y0, x1, y1 = bx
    lum = a[..., 0] * .3 + a[..., 1] * .59 + a[..., 2] * .11
    mask = np.zeros(lum.shape, bool); mask[y0:y1, x0:x1] = lum[y0:y1, x0:x1] < 175
    mi = Image.fromarray((mask * 255).astype('uint8')).filter(ImageFilter.MaxFilter(7)); mask = np.asarray(mi) > 0
    known = (~mask).astype(float)
    for r in (2, 4, 8, 16, 32):
        for _ in range(6):
            num = np.stack([box(a[..., c] * known, r) for c in range(3)], -1)
            den = box(known, r)[..., None]
            fill = num / np.maximum(den, 1e-4)
            a[mask] = fill[mask]
    return Image.fromarray(np.clip(a, 0, 255).astype('uint8'))


JOBS = {  # clé : (opérations, texte blanc ?)
    'alhambra-mairie': ([('erase', (355, 285, 725, 365)), ('soften', 2, .2)], False),
    'alhambra-mains': ([('soften', 14, .42)], False),
    'alhambra-fete': ([('darken', .62)], True),
    'nuits-eglise': ([('darken', .82)], True),
    'nuits-2': ([('darken', .82)], True),
}

if __name__ == '__main__':
    for key, (ops, white) in JOBS.items():
        th, k = key.split('-', 1)
        im = Image.open(os.path.join(SRC, key + '.png')).convert('RGB')
        w, h = im.size; tw = round(h * 540 / 954)
        if tw < w: im = im.crop(((w - tw) // 2, 0, (w - tw) // 2 + tw, h))
        im = im.resize((1080, 1909), Image.LANCZOS)
        for op in ops:
            im = erase_text(im, op[1]) if op[0] == 'erase' else soften(im, *op[1:]) if op[0] == 'soften' else darken(im, op[1])
        tmp = os.path.join(SRC, key + '-retouche.png'); im.save(tmp); L.save(tmp, th, k)
        if k in ('1', '2', '3', '4'):
            Image.open(os.path.join(L.IMG, 'lieux', f'{th}-{k}.webp')).save(os.path.join(L.IMG, 'themes', f'{th}-{k}.webp'), 'WEBP', quality=82, method=6)
        r = C.analyse(tmp, (255, 255, 255) if white else C.hex_rgb(L.T[th]['color']))
        print(key, 'ok' if r['contrast'] >= C.CONTRAST_MIN and r['agitation'] <= C.AGIT_MAX else 'À REVOIR', r)
