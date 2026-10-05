"""Dolce Vita de jour (5 octobre 2026) : l'utilisateur a demandé pourquoi Dolce Vita était sombre « alors qu'on a fait un
truc tout beau ». Les scènes d'origine étaient en plein jour (mer turquoise, citronniers) ; elles avaient été repeintes de
nuit pour porter un texte blanc. Dolce Vita devient un thème clair (light:true, texte bleu de Riviera) : les 4 scènes sont
repeintes en plein jour, ciel d'été pâle et uni sur la zone du texte (règles 6 et 7), d'après les scènes de jour
d'origine et le grand tableau (img/long/dolcevita/hero.webp), qui est resté lumineux.
Ensuite : lieux.py dolcevita --force ; ciel.py dolcevita ; calques.py dolcevita --force ; vignettes.py.
Usage : python3 business/tools/dolcevita-jour.py [--only 1,3] [--force]
Références de jour : les scènes d'avant le 2 octobre (git show 4a3619d:business/landing/img/hd/dolcevita-<n>.webp), extraites d'office."""
import os, sys, concurrent.futures as cf
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image
import lieux as L
hd = os.path.join(L.IMG, 'hd'); th = os.path.join(L.IMG, 'themes')
K = 'dolcevita'
UNI = ("the Amalfi coast on a bright summer day: turquoise sea, pastel cliffside village (Positano, Ravello), lemon trees, "
       "bougainvillea, terracotta tiles and white stone balustrades, soft warm daylight, palette of lemon yellow, sea blue, "
       "bougainvillea pink and warm white")
SC = {1: "a terrace under a pergola of lemons and bougainvillea with a long dinner table dressed in white linen, a cream Vespa parked beside it, the sea and the pastel village behind; no people",
      2: "a small white chapel with a flowered arch of bougainvillea and lemons over its door, terracotta pots of lemon trees; the bride and groom seen from behind walking hand in hand towards it",
      3: "a long dinner table by the sea under a pergola of lemons with string lights (unlit, daytime), white linen, glasses and flowers, guests seated seen from behind, late afternoon golden light",
      4: "a terrace with a white stone balustrade overlooking the sea, potted lemon trees and bougainvillea, a sailboat on the water; no people"}
REFS = [os.path.join(L.IMG, 'long', K, 'hero.webp')]
# les scènes de jour d'origine, tirées de l'historique git si elles ne sont pas déjà là
import subprocess
for n in (1, 2, 3, 4):
    f = f'{L.TMP}/dv-jour-ref-{n}.webp'
    if not os.path.exists(f):
        open(f, 'wb').write(subprocess.run(['git', 'show', f'4a3619d:business/landing/img/hd/{K}-{n}.webp'], capture_output=True, check=True, cwd=L.IMG).stdout)


def save(png, n):
    im = Image.open(png).convert('RGB'); w, h = im.size; tw = round(h * 540 / 954)
    if tw < w: im = im.crop(((w - tw) // 2, 0, (w - tw) // 2 + tw, h))
    im.resize((1080, 1909), Image.LANCZOS).save(f'{hd}/{K}-{n}.webp', 'WEBP', quality=80, method=6)
    im.resize((540, 954), Image.LANCZOS).save(f'{th}/{K}-{n}.webp', 'WEBP', quality=82, method=6)


def scene(n, force):
    t = L.T[K]
    if not force and L.ok(f'{hd}/{K}-{n}.webp', t)[0]: return f'{K}-{n} : déjà là'
    refs = REFS + [f'{L.TMP}/dv-jour-ref-{n}.webp'] + ([f'{L.TMP}/{K}-jour-1.png'] if n != 1 and os.path.exists(f'{L.TMP}/{K}-jour-1.png') else [])
    best = None
    for i in range(4):
        out = f'{L.TMP}/{K}-jour-{n}-{i}.png'
        p = (f"The reference images are one illustrated wedding invitation series (Amalfi coast, painterly gouache, bright daylight). "
             f"Paint the scene again in the same series: {UNI}. The scene: {SC[n]}. "
             "Same medium, brushwork and level of detail as the references, bright and luminous. Vertical 9:16. "
             + L.zone_rule(t) + " Concretely: the top 55% is an empty, clear, very pale summer sky (almost white near the top, "
             "a hint of pale blue), with NO cloud, no birds, no branches, no flowers, no pergola reaching into it. "
             "The whole subject, including the sea horizon, the cliffs and the pergola, sits in the lower 45%. "
             "One single continuous painting, no seam, no horizontal cut. No text, no faces, no watermark, no frame.")
        if not L.gemini(out, p, refs): continue
        good, r = L.ok(out, t)
        if good:
            save(out, n)
            if n == 1: Image.open(out).save(f'{L.TMP}/{K}-jour-1.png')
            return f'{K}-{n} : ok {r}'
        if best is None or r['contrast'] > best[1]['contrast']: best = (out, r)
    if best:
        save(best[0], n)
        if n == 1: Image.open(best[0]).save(f'{L.TMP}/{K}-jour-1.png')
    return f'{K}-{n} : À REVOIR {best[1] if best else "échec"}'


if __name__ == '__main__':
    a = sys.argv[1:]; force = '--force' in a
    ns = [int(x) for x in a[a.index('--only') + 1].split(',')] if '--only' in a else [1, 2, 3, 4]
    if 1 in ns: print(scene(1, force), flush=True)
    with cf.ThreadPoolExecutor(3) as ex:
        for r in ex.map(lambda n: scene(n, force), [n for n in ns if n != 1]): print(r, flush=True)
