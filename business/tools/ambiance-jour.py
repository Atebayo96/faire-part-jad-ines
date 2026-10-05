"""Ambiance « Plein jour » de Dolce Vita (thème dolcevitajour, 5 octobre 2026), sans nouvelle image : les peintures de jour
du grand tableau (img/long/dolcevita : hero, ev1, ev2, ev3) sont déjà au format 9:16. Le grand tableau est retiré de l'offre ;
l'utilisateur aimait ses images : « faudra les décliner en scène par scène, on propose 2 visuels différents ».
  scène 1 (accueil)   = le haut de l'illustration (pergola de citrons face à la mer)   -> aussi le lieu « Jardin »
  scène 2 (cérémonie) = ev1 (le couple marche vers la chapelle)                        -> aussi le lieu « Église »
  scène 3 (dîner)     = ev2 (dîner sous la pergola, ciel bleu nuit : texte blanc, mode 'dark') -> aussi le lieu « Salle »
  (le dîner et la Vespa sont descendus par descendre.py : leur sujet montait dans la zone du texte)
  scène 4 (réponse)   = ev3 (la Vespa des mariés sur la corniche)
  fond (texte seul)   = le papier crème aux citrons du tableau (tex1)
Sorties : img/hd (1080 x 1909), img/themes (scènes, 540 x 954), img/lieux (lieux et fond, 540 x 954), img/open (portes, rideau).
Usage : python3 business/tools/ambiance-jour.py"""
import os, shutil
from PIL import Image
IMG = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'landing', 'img')
SRC, K = os.path.join(IMG, 'long', 'dolcevita'), 'dolcevitajour'
R = 540 / 954


def fit(f, top=False):
    im = Image.open(os.path.join(SRC, f)).convert('RGB'); w, h = im.size
    th = round(w / R)
    if th <= h:  # trop haute : on garde le haut (illustration) ou le bas (le sujet)
        y = 0 if top else h - th
        return im.crop((0, y, w, y + th))
    tw = round(h * R); x = (w - tw) // 2
    return im.crop((x, 0, x + tw, h))


def out(im, name, small):
    im.resize((1080, 1909), Image.LANCZOS).save(os.path.join(IMG, 'hd', f'{K}-{name}.webp'), 'WEBP', quality=82, method=6)
    im.resize((540, 954), Image.LANCZOS).save(os.path.join(IMG, small, f'{K}-{name}.webp'), 'WEBP', quality=82, method=6)


S = {'1': fit('hero.webp', top=True), '2': fit('ev1.webp'), '3': fit('ev2.webp'), '4': fit('ev3.webp')}
for n, im in S.items(): out(im, n, 'themes')
for lieu, n in (('jardin', '1'), ('eglise', '2'), ('salle', '3')): out(S[n], lieu, 'lieux')
out(fit('tex1.webp', top=True), 'fond', 'lieux')
# le dîner et la Vespa montaient dans la zone du texte : on étire leur ciel uni (descendre.py, rien de repeint), puis le
# lieu « Salle » reprend le dîner corrigé
import subprocess, sys
subprocess.run([sys.executable, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'descendre.py'), f'{K}-3', f'{K}-4'], check=True)
shutil.copy(os.path.join(IMG, 'hd', f'{K}-3.webp'), os.path.join(IMG, 'hd', f'{K}-salle.webp'))
Image.open(os.path.join(IMG, 'hd', f'{K}-3.webp')).resize((540, 954), Image.LANCZOS).save(os.path.join(IMG, 'lieux', f'{K}-salle.webp'), 'WEBP', quality=82, method=6)
for x in ('portes', 'rideau'): shutil.copy(os.path.join(IMG, 'open', f'dolcevita-{x}.webp'), os.path.join(IMG, 'open', f'{K}-{x}.webp'))
print('ok')
