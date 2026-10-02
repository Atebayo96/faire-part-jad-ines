"""Découpe une planche de particules (générée par gemini.py) en sprites WebP avec transparence.

Usage : python3 business/tools/fx-sprites.py planche.png nom [--key chroma|luma] [--max 160] [--min 400] [--skip 3,7] [--out business/landing/img/fx]
  - nom : préfixe des sprites (petals, leaves, ...), écrits en <out>/<nom>-<i>.webp
  - --key chroma : planche sur fond vert uni #00FF00 (objets opaques et colorés)
    --key luma   : planche sur fond noir, pour les objets clairs ou lumineux (graines, lanternes) :
                   l'alpha est la luminosité, le halo lumineux devient une vraie transparence
  - --max : plus grand côté d'un sprite (px) ; --min : surface minimale d'un sprite (px² sur la planche)
  - --skip : index (dans l'ordre de lecture, voir la planche de contrôle) à ignorer
Écrit business/.fx-check/<nom>.png (planche de contrôle numérotée, fond gris, à regarder en grand : règle 10 ; hors dépôt)
et met à jour <out>/index.json (nombre de sprites par nom, lu par invite.js).
"""
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

args = sys.argv[1:]
def opt(name, default):
    if name in args:
        i = args.index(name); v = args[i + 1]; del args[i:i + 2]; return v
    return default
KEY = opt('--key', 'chroma')
MAX = int(opt('--max', '160'))
MIN = int(opt('--min', '400'))
SKIP = {int(x) for x in opt('--skip', '').split(',') if x}
OUT = opt('--out', 'business/landing/img/fx')
sheet, name = args[0], args[1]

im = np.asarray(Image.open(sheet).convert('RGB')).astype(np.float32)
if KEY == 'luma':
    # fond noir : un pixel = couleur * alpha (prémultiplié). alpha = luminosité max, couleur = pixel / alpha
    a = np.clip(im.max(axis=2) / 255, 0, 1)
    a = np.clip((a - .04) / .96, 0, 1)
    col = np.clip(im / np.maximum(a[..., None], 1e-3), 0, 255)
else:
    # le fond n'est jamais exactement #00FF00 : on prend la couleur médiane des bords
    border = np.concatenate([im[0], im[-1], im[:, 0], im[:, -1]])
    bg = np.median(border, axis=0)
    dist = np.sqrt(((im - bg) ** 2).sum(axis=2))
    # alpha : 0 sur le fond, 1 dès qu'on s'éloigne franchement de la couleur du fond
    a = np.clip((dist - 55) / 100, 0, 1)
    # un pixel de bord est un mélange (1-a)*fond + a*couleur : on retrouve la couleur sans le vert
    col = np.where(a[..., None] > 0, (im - (1 - a[..., None]) * bg) / np.maximum(a[..., None], 1e-3), 0)
    col = np.clip(col, 0, 255)
    # liseré : sur une bande de 4 px le long du bord, le vert ne peut pas dépasser le rouge ou le bleu
    edge = ndimage.binary_dilation(a < .5, iterations=4) & (a > 0)
    g_max = np.maximum(col[..., 0], col[..., 2])
    col[..., 1] = np.where(edge, np.minimum(col[..., 1], g_max), col[..., 1])
rgba = np.dstack([col, a * 255]).astype(np.uint8)

# composantes connexes (sur un masque un peu dilaté pour ne pas couper une tige)
mask = ndimage.binary_dilation(a > .15, iterations=6)
lab, n = ndimage.label(mask)
boxes = []
for k in range(1, n + 1):
    ys, xs = np.where(lab == k)
    if len(ys) < MIN: continue   # poussière, lucioles isolées
    boxes.append((ys.min(), xs.min(), ys.max() + 1, xs.max() + 1))
# ordre de lecture : par ligne (regroupées), puis de gauche à droite
boxes.sort(key=lambda b: (round(((b[0] + b[2]) / 2) / (im.shape[0] / 3)), b[1]))

os.makedirs(OUT, exist_ok=True)
for f in os.listdir(OUT):
    if f.startswith(name + '-'):
        os.remove(os.path.join(OUT, f))
pad = 4
sprites = []
H, W = a.shape
for i, (y0, x0, y1, x1) in enumerate(boxes):
    if i in SKIP: continue
    if x0 == 0 or y0 == 0 or x1 == W or y1 == H: continue   # coupé par le bord de la planche
    crop = rgba[y0:y1, x0:x1]
    # recadre sur l'alpha réel (sans la dilatation), avec une petite marge
    ys, xs = np.where(crop[..., 3] > 8)
    crop = crop[max(0, ys.min() - pad):ys.max() + pad, max(0, xs.min() - pad):xs.max() + pad]
    s = Image.fromarray(crop, 'RGBA')
    s.thumbnail((MAX, MAX), Image.LANCZOS)
    sprites.append(s)
for j, s in enumerate(sprites):
    s.save(os.path.join(OUT, f'{name}-{j}.webp'), 'WEBP', quality=88, method=6)

# planche de contrôle
cell = MAX + 24
cols = min(6, max(1, len(sprites)))
rows = (len(sprites) + cols - 1) // cols
chk = Image.new('RGB', (cols * cell, rows * cell), (110, 110, 110))
d = ImageDraw.Draw(chk)
for j, s in enumerate(sprites):
    x, y = (j % cols) * cell, (j // cols) * cell
    chk.paste(s, (x + 12 + (MAX - s.width) // 2, y + 12 + (MAX - s.height) // 2), s)
    d.text((x + 4, y + 2), str(j), fill=(255, 255, 255))
CHK = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.fx-check')
os.makedirs(CHK, exist_ok=True)
chk.save(os.path.join(CHK, f'{name}.png'))

idx_path = os.path.join(OUT, 'index.json')
idx = json.load(open(idx_path)) if os.path.exists(idx_path) else {}
idx[name] = len(sprites)
json.dump(dict(sorted(idx.items())), open(idx_path, 'w'), indent=0)
print(f'{name} : {len(sprites)} sprites ({len(boxes)} trouvés, {len(SKIP)} ignorés) -> {OUT}')
