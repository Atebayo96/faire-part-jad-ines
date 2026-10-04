"""Vignette d'une scène en calques : le fond calme du thème (img/hd/<thème>-fond) avec le sujet détouré
(img/calques/<thème>-<clé>) posé entier, toute la largeur, au bas de l'image, comme le moteur l'affiche (règle 10b).

Remplace img/hd/<thème>-<clé>.webp et img/themes/<thème>-<clé>.webp : la peinture d'origine gardait parfois une
bande sombre collée sur la scène (« c'est coupé, c'est moche » sur la carte « Scène par scène »), alors que le
faire-part ne la montre plus.

Usage : python3 business/tools/vignettes.py nuits-2 [bollywood-1 ...]
"""
import os, sys
from PIL import Image

IMG = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'landing', 'img')


def vignette(key):
    theme, n = key.rsplit('-', 1)
    fond = Image.open(os.path.join(IMG, 'hd', f'{theme}-fond.webp')).convert('RGB')
    sub = Image.open(os.path.join(IMG, 'calques', f'{key}.webp')).convert('RGBA')
    W, H = fond.size
    if sub.width != W:
        sub = sub.resize((W, round(sub.height * W / sub.width)), Image.LANCZOS)
    if sub.height > H:  # jamais de zoom : le sujet tient en hauteur, sinon on le laisse tel quel et on coupe le haut
        sub = sub.crop((0, sub.height - H, W, sub.height))
    im = fond.copy()
    im.paste(sub, (0, H - sub.height), sub)
    im.save(os.path.join(IMG, 'hd', f'{key}.webp'), 'WEBP', quality=80, method=6)
    im.resize((540, 954), Image.LANCZOS).save(os.path.join(IMG, 'themes', f'{key}.webp'), 'WEBP', quality=82, method=6)
    print(key, 'ok', flush=True)


if __name__ == '__main__':
    for k in sys.argv[1:] or ['nuits-2']:
        vignette(k)
