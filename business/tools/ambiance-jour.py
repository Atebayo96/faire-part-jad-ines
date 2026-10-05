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


def accueil():
    # « l'image est trop basse, on voit pas le couple » : du ciel jusqu'au couple, la composition est plus haute qu'un
    # écran 9:16. On la prend entière (0 à 1890 px), réduite d'environ 16 % pour tenir en hauteur ; les deux bandes qui
    # manquent sur les côtés reprennent les bords de la peinture en reflet, et un téléphone 9:19,5 les coupe de toute façon.
    from PIL import ImageFilter
    im = Image.open(os.path.join(SRC, 'hero.webp')).convert('RGB'); W = im.width
    reg = im.crop((0, 0, W, 1890)); th = round(W / R); sw = round(W * th / reg.height)
    mid = reg.resize((sw, th), Image.LANCZOS); out = Image.new('RGB', (W, th)); m = (W - sw) // 2
    from PIL import ImageOps
    r = W - sw - m  # bords : le reflet de la peinture (feuillages, falaise), pas une bande floue
    out.paste(ImageOps.mirror(mid.crop((0, 0, m, th))), (0, 0)); out.paste(ImageOps.mirror(mid.crop((sw - r, 0, sw, th))), (m + sw, 0))
    out.paste(mid, (m, 0)); return out


S = {'1': accueil(), '2': fit('ev1.webp'), '3': fit('ev2.webp'), '4': fit('ev3.webp')}
for n, im in S.items(): out(im, n, 'themes')
for lieu, n in (('jardin', '1'), ('eglise', '2'), ('salle', '3')): out(S[n], lieu, 'lieux')
out(fit('tex1.webp', top=True), 'fond', 'lieux')
# le dîner et la Vespa montaient dans la zone du texte : on étire leur ciel uni (descendre.py, rien de repeint), puis le
# lieu « Salle » reprend le dîner corrigé
import subprocess, sys
subprocess.run([sys.executable, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'descendre.py'), f'{K}-4'], check=True)
# le dîner : au-dessus de la poutre, la peinture a des chevrons et des feuillages flous ; les étirer faisait des traînées
# (« celle-là est mal faite »). On les retire : le ciel net du haut est étiré jusqu'à la poutre, fondu sur quelques
# pixels dans la peinture d'origine, et la pergola descend sous le texte (~45 % de la hauteur).
def diner():
    im = S['3']; W, H = im.size
    ciel, coupe, fondu, d = round(.225 * H), round(.31 * H), round(.035 * H), round(.14 * H)
    haut = im.crop((0, 0, W, ciel)).resize((W, coupe + d), Image.LANCZOS)
    bas = im.crop((0, coupe - fondu, W, H - d + 0))
    out = Image.new('RGB', (W, H)); out.paste(haut, (0, 0))
    m = Image.linear_gradient('L').resize((W, fondu))  # 0 en haut -> 255 en bas : la peinture apparaît peu à peu
    zone = Image.composite(bas.crop((0, 0, W, fondu)), haut.crop((0, coupe + d - fondu, W, coupe + d)), m)
    out.paste(zone, (0, coupe + d - fondu)); out.paste(bas.crop((0, fondu, W, bas.height)), (0, coupe + d))
    return out
out(diner(), '3', 'themes')
shutil.copy(os.path.join(IMG, 'hd', f'{K}-3.webp'), os.path.join(IMG, 'hd', f'{K}-salle.webp'))
Image.open(os.path.join(IMG, 'hd', f'{K}-3.webp')).resize((540, 954), Image.LANCZOS).save(os.path.join(IMG, 'lieux', f'{K}-salle.webp'), 'WEBP', quality=82, method=6)
for x in ('portes', 'rideau'): shutil.copy(os.path.join(IMG, 'open', f'dolcevita-{x}.webp'), os.path.join(IMG, 'open', f'{K}-{x}.webp'))
print('ok')
