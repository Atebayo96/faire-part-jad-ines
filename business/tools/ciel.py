"""Ciel nu des calques : le fond d'un thème (<thème>-fond.webp) porte un jardin en bas (fleurs, sable, lanternes). Posé fixe
derrière les sujets détourés, ce bas restait visible sous chaque scène et traçait une ligne droite (bord du sable) au
défilement. Le décor des calques est donc le ciel seul : la bande calme du haut du fond, étirée sur toute la hauteur
(le dégradé du ciel reste continu, jamais de miroir). Sans Gemini.
Usage : python3 business/tools/ciel.py <thème> [...]   ->  img/hd/<thème>-ciel.webp et img/lieux/<thème>-ciel.webp"""
import os, sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

IMG = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'landing', 'img')


def haut_du_jardin(im):
    a = np.asarray(im.convert('L').resize((270, 477))).astype(float)
    g = np.abs(ndimage.sobel(a, 1)) + np.abs(ndimage.sobel(a, 0))
    sm = np.convolve(np.array([np.percentile(r, 97) for r in g]), np.ones(9) / 9, 'same')
    return next((i for i in range(120, 477) if sm[i] > 45), 477) / 477


for k in sys.argv[1:]:
    im = Image.open(os.path.join(IMG, 'hd', k + '-fond.webp')).convert('RGB'); W, H = im.size
    y = max(.4, haut_du_jardin(im) - .03)
    # un léger flou vertical sur la bande étirée : les étoiles ne deviennent pas des traits
    ciel = im.crop((0, 0, W, round(y * H))).resize((W, H), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.2))
    ciel.save(os.path.join(IMG, 'hd', k + '-ciel.webp'), 'WEBP', quality=80, method=6)
    ciel.resize((540, 954), Image.LANCZOS).save(os.path.join(IMG, 'lieux', k + '-ciel.webp'), 'WEBP', quality=82, method=6)
    print(k, f'ciel jusqu’à {y:.0%} de la hauteur')
