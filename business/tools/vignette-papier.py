"""Coupure droite dans une scène de thème clair (un papier uni collé au-dessus d'une scène d'intérieur, coupée net) :
le haut de la scène se fond dans le papier, en vignette, avec un bord en arc irrégulier (CLAUDE.md, règle 18 : jamais de
coupure droite ; « en vignette sur le papier si besoin »). Solution d'attente, sans Gemini, avant de repeindre la scène.
Usage : python3 business/tools/vignette-papier.py <thème>-<n> [...]   (réécrit img/hd et img/themes)"""
import os, sys
import numpy as np
from PIL import Image

IMG = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'landing', 'img')

for key in sys.argv[1:]:
    p = os.path.join(IMG, 'hd', key + '.webp')
    im = Image.open(p).convert('RGB'); W, H = im.size; a = np.asarray(im).astype(np.float32)
    # la coupure : la ligne où presque toute la largeur change d'un coup
    d = np.abs(np.diff(a, axis=0)).sum(2)
    frac = (d > 40).mean(1); s = int(np.argmax(frac[int(H * .3):int(H * .75)])) + int(H * .3)
    # le papier : au-dessus de la coupure, le papier d'origine ; dessous, la bande de papier juste au-dessus, reprise en
    # aller-retour (papier uni : pas de dégradé à inverser), sans étirement (il faisait des stries verticales)
    b = round(.1 * H); band = a[s - 4 - b:s - 4]; reps = [band if i % 2 == 0 else band[::-1] for i in range(H // b + 2)]
    papier = a.copy(); papier[s - 4:] = np.concatenate(reps)[:H - s + 4]
    # bord de la vignette : un arc (la scène garde plus de hauteur au centre), une ondulation lente, un fondu large
    x = np.linspace(-1, 1, W)
    rng = np.random.default_rng(7); ond = sum(np.sin(x * f * np.pi + rng.uniform(0, 6)) / f for f in (2.3, 4.1, 7.3)) * .012 * H
    bord = s + .07 * H * x ** 2 + ond                    # là où la scène commence à apparaître
    F = .11 * H                                          # hauteur du fondu
    y = np.arange(H)[:, None]
    t = np.clip((y - bord[None, :]) / F, 0, 1); al = (t * t * (3 - 2 * t))[..., None]
    out = Image.fromarray((papier * (1 - al) + a * al).clip(0, 255).astype(np.uint8))
    out.save(p, 'WEBP', quality=80, method=6)
    out.resize((540, 954), Image.LANCZOS).save(os.path.join(IMG, 'themes', key + '.webp'), 'WEBP', quality=82, method=6)
    print(key, f'coupure à {s / H:.0%}, fondue en vignette')
