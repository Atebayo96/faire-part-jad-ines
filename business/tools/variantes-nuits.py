"""Variantes de « Mille et une nuits » (family:'nuits' dans themes.js) : Alhambra, Nuit du désert, Émeraude & or.
Les 4 scènes de chaque variante (img/hd/<thème>-1..4 et img/themes/), peintes dans la même série que le riad de nuit
(références : nuits-1 et le tableau de Nour & Ilyes), mêmes contrôles de lisibilité que les décors (check_images.py).
Ensuite : lieux.py <thème> --lieux mairie,mosquee,salle,jardin,plage,fond ; portes.py ; long-gen.py + long-assets.py.
Usage : python3 business/tools/variantes-nuits.py [thème ...] [--only 1,3] [--force]"""
import os, sys, concurrent.futures as cf
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image
import lieux as L
hd = os.path.join(L.IMG, 'hd'); th = os.path.join(L.IMG, 'themes')
SC = {
 'alhambra': {'uni': "an Andalusian palace by day (Alhambra): ivory carved stucco, slender marble columns, reflecting pools, myrtle hedges, orange trees, soft warm morning light, ivory, terracotta and myrtle green",
   1: "a long reflecting pool lined with myrtle hedges leading to a portico of slender columns and lace-like carved stucco arches, cypress trees; no people",
   2: "a palace courtyard with a round fountain held by stone lions, carved ivory arches, orange trees in terracotta pots, rose petals on the marble floor; the bride and groom seen from behind walking under the arches",
   3: "an arcade gallery in golden light with a long dinner table dressed in white linen, brass lanterns standing on the table, jasmine garlands, orange trees; no people",
   4: "a low table in the palace garden with a brass tray, two tea glasses and rose petals, orange trees and myrtle hedges behind it, everything below the middle of the image, open pale cream sky above; no people"},
 'maghreb': {'uni': "a Maghreb medina by day (Chefchaouen, Sidi Bou Said, the Casbah): whitewashed walls, studded blue doors, blue and green zellige, bougainvillea, terracotta pots, bright soft light, white, cobalt blue and terracotta",
   1: "a whitewashed medina alley with a monumental studded blue door under a horseshoe arch, blue zellige steps, terracotta pots with geraniums, bougainvillea; no people",
   2: "a henna afternoon in a white patio: a low brass tray with henna cones, tea glasses and rose petals on blue zellige, embroidered cushions, a woman's hands with fresh henna (hands only, no face)",
   3: "a white riad patio with blue zellige fountain, orange trees, carved cedar balconies; the bride in a white and gold caftan and the groom in a cream djellaba seen from behind walking hand in hand",
   4: "a blue window with a carved wooden shutter in a white wall, a brass tray with two tea glasses and jasmine on the sill, bougainvillea around; no people"},
 'desert': {'uni': "a Moroccan desert wedding at night: golden dunes, a caidal tent, brass lanterns on the sand, Berber rugs, deep indigo sky",
   1: "golden dunes under a deep indigo night sky, a thin crescent moon low above the dunes, a caidal tent glowing from inside at the foot of the dunes, lanterns standing on the sand; no people",
   2: "a henna evening seen from INSIDE a caidal tent: the dark embroidered tent ceiling above, embroidered cushions, a low brass tray with henna cones and tea glasses, lanterns on Berber rugs, a woman's hands with fresh henna (hands only, no face); no dunes visible",
   3: "the bride and groom seen from behind on a dune crest facing a ceremony arch of palm fronds and white flowers, lanterns along a path in the sand, deep blue dusk",
   4: "a desert camp at night: a row of caidal tents lit from inside, lanterns on the sand, camels resting by a small campfire; no people"},
 'emeraude': {'uni': "a Moroccan palace salon in deep emerald velvet and chiselled gold: horseshoe arches, brass lanterns, embroidered sofas, silver trays, rich and festive, dark emerald walls",
   1: "a monumental carved gold horseshoe doorway in a dark emerald wall, brass lanterns standing on the marble floor on each side, a low gold-embroidered emerald sofa; no people",
   2: "a family celebration at home: a low carved table with a silver tray of dates and glasses of milk, a tea set, emerald velvet cushions with gold embroidery, rose petals; a bride's hands with fine henna and gold bracelets (hands only, no face)",
   3: "a palace reception hall: emerald velvet drapes, round tables with gold cutlery and white roses, tall brass candelabra standing on the floor; the bride in a gold-embroidered caftan and the groom seen from behind entering",
   4: "a pair of gold rings on an emerald velvet cushion beside a chiselled brass lantern standing on a low table, white rose petals; no people"},
}
REFS = [os.path.join(L.IMG, 'hd', 'nuits-1.webp'), os.path.join(L.IMG, 'long', 'nuits', 'hero.webp')]


def save(png, k, n):
    im = Image.open(png).convert('RGB'); w, h = im.size; tw = round(h * 540 / 954)
    if tw < w: im = im.crop(((w - tw) // 2, 0, (w - tw) // 2 + tw, h))
    im.resize((1080, 1909), Image.LANCZOS).save(f'{hd}/{k}-{n}.webp', 'WEBP', quality=80, method=6)
    im.resize((540, 954), Image.LANCZOS).save(f'{th}/{k}-{n}.webp', 'WEBP', quality=82, method=6)


def scene(k, n, force):
    t = L.T[k]
    if not force and os.path.exists(f'{hd}/{k}-{n}.webp'): return f'{k}-{n} : déjà là'
    # la scène 1 donne le ton de la variante : les suivantes l'ont aussi en référence
    refs = REFS + ([f'{hd}/{k}-1.webp'] if n != 1 and os.path.exists(f'{hd}/{k}-1.webp') else [])
    best = None
    for i in range(4):
        out = f'{L.TMP}/{k}-{n}-{i}.png'
        p = (f"The reference images are one illustrated wedding invitation series (Moroccan riad at night, painterly gouache). "
             f"Paint a NEW scene of the same series, in a variant universe: {SC[k]['uni']}. The scene: {SC[k][n]}. "
             "Same medium, brushwork and level of detail as the references, with the light and palette of this variant. Vertical 9:16. "
             + L.zone_rule(t) + " The subject sits in the lower 45%. No text, no faces, no watermark, no frame.")
        if not L.gemini(out, p, refs): continue
        good, r = L.ok(out, t)
        if good: save(out, k, n); return f'{k}-{n} : ok {r}'
        if best is None or r['contrast'] > best[1]['contrast']: best = (out, r)
    if best: save(best[0], k, n)
    return f'{k}-{n} : À REVOIR {best[1] if best else "échec"}'


if __name__ == '__main__':
    a = sys.argv[1:]; force = '--force' in a; a = [x for x in a if x != '--force']
    only = None
    if '--only' in a: i = a.index('--only'); only = [int(x) for x in a[i + 1].split(',')]; del a[i:i + 2]
    themes = a or list(SC)
    ns = only or [1, 2, 3, 4]
    # scène 1 d'abord (référence des autres), puis 2 à 4
    with cf.ThreadPoolExecutor(6) as ex:
        if 1 in ns:
            for r in ex.map(lambda k: scene(k, 1, force), themes): print(r, flush=True)
        for r in ex.map(lambda j: scene(*j, force), [(k, n) for k in themes for n in ns if n != 1]): print(r, flush=True)
