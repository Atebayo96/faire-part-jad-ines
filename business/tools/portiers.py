"""Détoure les portiers (générés avec gemini.py sur fond magenta #FF00FF, voir business/tools/long-prompts.json pour la méthode)
et les enregistre avec transparence pour l'ouverture « grandes portes » : business/landing/img/open/<thème>-portier.webp.
Usage : python3 business/tools/portiers.py <thème> <image_brute.png> [<thème> <image> ...]"""
import os, sys
import numpy as np
from PIL import Image

B = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(B, 'landing', 'img', 'open')
KEY = np.array((255, 0, 255), float)


def cutout(src, dst, width=460):
    a = np.asarray(Image.open(src).convert('RGB')).astype(float)
    d = np.sqrt(((a - KEY) ** 2).sum(-1))
    alpha = np.clip((d - 70) / (150 - 70), 0, 1)
    # retire la teinte magenta qui bave sur les bords
    al = np.maximum(alpha, 1e-3)[..., None]
    rgb = np.clip((a - (1 - al) * KEY) / al, 0, 255)
    ys, xs = np.where(alpha > .02)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    im = Image.fromarray(np.dstack([rgb, alpha * 255])[y0:y1, x0:x1].astype(np.uint8), 'RGBA')
    im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    im.save(dst, 'WEBP', quality=84, method=6)
    return im.size


args = sys.argv[1:]
for theme, src in zip(args[::2], args[1::2]):
    dst = os.path.join(OUT, f'{theme}-portier.webp')
    print(theme, cutout(src, dst), '->', dst)
