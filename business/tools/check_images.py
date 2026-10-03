"""Contrôle de lisibilité des décors de scènes (business/landing/img/hd/<theme>-<n>.webp, et les lieux <theme>-<lieu>.webp).

Pour chaque image, on regarde la ZONE DE TEXTE (du haut : 10 % à 55 % de la hauteur, 10 % à 90 % de la largeur),
là où le moteur (invite.js) pose le chapeau, les prénoms, la phrase et la date :

  - agitation : à quel point la zone est chargée (écart de luminance entre pixels voisins, moyenne du quart
    le plus contrasté, sur 0-100). Un ciel dégagé ou un papier uni reste sous 6 ; un ornement, des lanternes,
    une façade ou des fleurs dans la zone dépassent 8.
  - contraste : rapport WCAG entre la couleur du texte du thème (blanc sur les thèmes sombres, t.color sur les clairs)
    et la zone, mesuré sur le fond LE PLUS DÉFAVORABLE (le quart des pixels le plus proche de la couleur du texte).
    Objectif : 4,5 (texte courant) ; en dessous de 3, le texte ne tient plus (il n'y a plus de halo CSS).

Usage : python3 business/tools/check_images.py [--dir business/landing/img/hd] [--json]
Sortie : un tableau par thème et par scène, et la liste des images à refaire. Code de sortie 1 s'il y a des échecs.
"""
import json, os, subprocess, sys, warnings
from PIL import Image
warnings.simplefilter('ignore', DeprecationWarning)

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
B = os.path.join(ROOT, 'business')
ZONE = (.10, .10, .90, .55)      # x0, y0, x1, y1 en fraction de l'image
AGIT_MAX = 8.0                  # au-delà : fond trop chargé pour y poser du texte
CONTRAST_MIN = 4.5              # WCAG AA texte courant
CONTRAST_WARN = 3.0             # en dessous : illisible


def themes():
    out = subprocess.run(['node', '-e', "global.window={};require(process.argv[1]);console.log(JSON.stringify(window.SCEAU_THEMES))",
                          os.path.join(B, 'landing', 'themes.js')], capture_output=True, text=True, check=True).stdout
    return json.loads(out)


def lum(rgb):
    def ch(c):
        c /= 255
        return c / 12.92 if c <= .03928 else ((c + .055) / 1.055) ** 2.4
    r, g, b = rgb
    return .2126 * ch(r) + .7152 * ch(g) + .0722 * ch(b)


def contrast(l1, l2):
    a, b = max(l1, l2), min(l1, l2)
    return (a + .05) / (b + .05)


def hex_rgb(h):
    h = h.lstrip('#')
    if len(h) == 3:
        h = ''.join(c * 2 for c in h)
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def analyse(path, text_rgb):
    im = Image.open(path).convert('RGB')
    W, H = im.size
    zone = im.crop((int(W * ZONE[0]), int(H * ZONE[1]), int(W * ZONE[2]), int(H * ZONE[3])))
    # agitation : luminance réduite, écarts avec le voisin de droite et du bas, moyenne du quart le plus contrasté
    g = zone.convert('L').resize((160, int(160 * zone.height / zone.width)), Image.LANCZOS)
    px, w, h = g.load(), g.width, g.height
    diffs = sorted(abs(px[x, y] - px[x + 1, y]) + abs(px[x, y] - px[x, y + 1]) for y in range(h - 1) for x in range(w - 1))
    top = diffs[len(diffs) * 3 // 4:]
    agit = sum(top) / len(top) / 2.55 / 2   # 0-100
    # contraste : luminance de chaque pixel (image réduite), on prend le quart le plus proche de la luminance du texte
    small = zone.resize((48, int(48 * zone.height / zone.width)), Image.LANCZOS)
    lt = lum(text_rgb)
    ls = sorted((lum(p) for p in list(small.getdata())), key=lambda l: abs(l - lt))
    worst = ls[:max(1, len(ls) // 4)]
    mean_worst = sum(worst) / len(worst)
    return {'agitation': round(agit, 1), 'contrast': round(contrast(lt, mean_worst), 2),
            'contrast_mean': round(contrast(lt, sum(ls) / len(ls)), 2)}


def main():
    args = sys.argv[1:]
    d = os.path.join(B, 'landing', 'img', 'hd')
    if '--dir' in args:
        d = args[args.index('--dir') + 1]
    T = themes()
    rows, fails = [], []
    for k, t in T.items():
        text = hex_rgb(t['color']) if t.get('light') else (255, 255, 255)
        # scènes 1 à 4 du thème, puis la bibliothèque de lieux et le fond des écrans simples (tools/lieux.py)
        for n in [1, 2, 3, 4, 'mairie', 'eglise', 'salle', 'jardin', 'plage', 'fond']:
            p = os.path.join(d, f'{k}-{n}.webp')
            if not os.path.exists(p):
                continue
            dark_page = isinstance(n, int) and (t['scenes'][n - 1] + [None] * 5)[4] == 'dark'   # page forcée en texte blanc
            r = analyse(p, (255, 255, 255) if dark_page else text)
            r.update(theme=k, scene=n, file=os.path.relpath(p, ROOT))
            r['issues'] = []
            if r['agitation'] > AGIT_MAX:
                r['issues'].append('zone de texte chargée')
            if r['contrast'] < CONTRAST_WARN:
                r['issues'].append('contraste insuffisant')
            elif r['contrast'] < CONTRAST_MIN:
                r['issues'].append('contraste faible (plus de halo CSS : image à refaire)')
            rows.append(r)
            if r['issues']:
                fails.append(r)
    if '--json' in args:
        print(json.dumps(rows, ensure_ascii=False, indent=1))
        return
    print(f"{'thème':12} {'sc':>6} {'agit.':>6} {'contr.':>7}  remarques")
    for r in rows:
        print(f"{r['theme']:12} {str(r['scene']):>6} {r['agitation']:>6} {r['contrast']:>7}  {', '.join(r['issues'])}")
    hard = [r for r in fails if any('chargée' in i or 'même avec' in i for i in r['issues'])]
    print(f"\n{len(rows)} images, {len(fails)} à surveiller, {len(hard)} à refaire :")
    for r in hard:
        print('  -', r['file'], '→', ', '.join(r['issues']))
    sys.exit(1 if hard else 0)


if __name__ == '__main__':
    main()
