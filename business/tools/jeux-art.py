"""Les objets peints des jeux du save-the-date (15 novembre 2026 : « ça fait cheap, ça se voit que c'est des objets déposés ;
un vrai truc dessiné, et derrière des vrais chiffres qui tournent »). Par thème, deux images, une génération chacune :
  <thème>-machine : la machine à sous vue de face, vitre vide (magenta, pour y poser nos rouleaux), et son levier à part ;
  <thème>-ticket  : le ticket, sa zone à gratter vide (magenta, pour y poser la date et le film à gratter).
Fond vert uni, détourage comme carte-art.py. Accord chiffré avant toute génération (règle 32f).
Usage : python3 business/tools/jeux-art.py gen <brut_dir> [clé ...]
        python3 business/tools/jeux-art.py cut <brut_dir> [clé ...]  -> business/landing/img/jeux/<clé>.webp (+ -levier) et meta.json"""
import json, os, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
import numpy as np
from PIL import Image
from scipy import ndimage

STYLE = ('Fine hand-painted watercolor and gouache illustration with delicate gold ink accents, the quality of a luxury wedding '
         'stationery artist, the same hand and palette as the reference images. Drawn perfectly straight on, as a flat front '
         'elevation: no perspective, no 3D rendering, no photo realism, soft even light, crisp clean edges. '
         'Absolutely no text, no letters, no numbers, no symbols on the reels, no signature, no watermark.')
GREEN = (' The background is a perfectly flat uniform pure green #00FF00 with no shadow, no gradient and no glow. Nothing is cut by the frame.')
MAG = 'filled with one perfectly flat uniform pure magenta #FF00FF colour, with nothing drawn inside it'
TH = {
  'dolcevita': ('Amalfi coast: cream glazed enamel, cobalt blue hand-painted maiolica ornament, small lemons with green leaves, thin gold trims',
                ['business/landing/img/carte/dolcevita-fond.webp', 'business/landing/img/carte/dolcevita-citrons.webp']),
}
def prompts(t):
    look = TH[t][0]
    return {
      t + '-machine': ('Two separate objects side by side, not touching, with a clear green gap between them. '
        'LEFT, large, taking about three quarters of the width: an elegant vintage slot machine (one-armed bandit) cabinet WITHOUT its lever. ' + look + '. '
        'From top to bottom: a rounded arched top holding a large plain blank cream signboard panel (completely empty, calm, no ornament inside it) '
        'with a row of small round glowing light bulbs along the arch above it; then a short plain blank cream band; then, in the middle of the '
        'cabinet, one single wide rectangular reel window with a gold frame, about three times wider than tall, ' + MAG + '; then another plain '
        'blank cream band; then a coin tray at the bottom and two small feet. The painted ornament stays on the sides and around the panels. '
        'RIGHT, narrow: the machine lever alone, perfectly vertical: a small round gold mounting base at the bottom, a slim gold rod going '
        'straight up, and a large glossy lemon-yellow ball knob at the top. ' + STYLE + GREEN, '3:4'),
      t + '-ticket': ('One single object: a large vintage paper ticket in portrait orientation, taller than wide, with small scalloped perforated '
        'edges. ' + look + ' as a painted border all around the ticket and in its corners. From top to bottom: a wide plain blank cream paper area '
        '(completely empty, calm, no ornament) taking the top quarter; a thin dashed perforation line; then one large rectangle with slightly '
        'rounded corners and a thin gold frame, taking the full inner width and almost half of the ticket height, ' + MAG + '; then a plain blank '
        'cream paper strip at the bottom. ' + STYLE + GREEN, '3:4'),
    }
ALL = {k: (v, TH[k.split('-')[0]][1]) for t in TH for k, v in prompts(t).items()}
OUT = 'business/landing/img/jeux'

def gen(raw, k):
    p = os.path.join(raw, k + '.png')
    if os.path.exists(p): return k + ' (déjà là)'
    (prompt, ratio), refs = ALL[k]
    r = subprocess.run([sys.executable, 'business/tools/gemini.py', p, prompt, *refs, '--ratio', ratio, '--size', '2K'], capture_output=True, text=True)
    return k + ' : ' + (r.stdout.strip() or r.stderr.strip()[-400:])

def key(im):
    """Détoure le vert ; rend l'image RGBA et le masque du magenta (la vitre ou la zone à gratter)."""
    a = np.asarray(im.convert('RGB')).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    green = np.clip((g - np.maximum(r, b) - 30) / 70, 0, 1)
    al = 1 - green
    lab, n = ndimage.label(al > .5); sz = ndimage.sum(np.ones_like(al), lab, range(1, n + 1))
    keep = np.isin(lab, [i + 1 for i, s in enumerate(sz) if s > 2000])
    al = al * ndimage.binary_dilation(keep, iterations=2)
    col = a.copy(); col[..., 1] = np.where(al < .98, np.minimum(g, np.maximum(r, b) * 1.1 + 12), g)
    mag = (r > 150) & (b > 150) & (g < 120) & (np.abs(r - b) < 90)
    return np.dstack([col, al * 255]).astype(np.uint8), mag, lab * keep

def box(m):
    ys, xs = np.where(m); return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1

def cut(raw, k):
    os.makedirs(OUT, exist_ok=True)
    mp = os.path.join(OUT, 'meta.json'); meta = json.load(open(mp)) if os.path.exists(mp) else {}
    rgba, mag, lab = key(Image.open(os.path.join(raw, k + '.png')))
    al = rgba[..., 3] > 127
    # les objets, du plus grand au plus petit : la machine (ou le ticket), puis le levier
    l2, n = ndimage.label(ndimage.binary_closing(al, iterations=3)); sz = ndimage.sum(np.ones(al.shape), l2, range(1, n + 1))
    order = np.argsort(sz)[::-1] + 1
    def save(idx, name, W):
        m = l2 == idx; x0, y0, x1, y1 = box(m)
        part = rgba[y0:y1, x0:x1].copy(); part[..., 3] = part[..., 3] * ndimage.binary_dilation(m, iterations=2)[y0:y1, x0:x1]
        im = Image.fromarray(part, 'RGBA'); s = W / im.width
        im = im.resize((W, round(im.height * s)), Image.LANCZOS); im.save(f'{OUT}/{name}.webp', quality=90)
        return (x0, y0, x1, y1), im.size
    (x0, y0, x1, y1), size = save(order[0], k, 900)
    wx0, wy0, wx1, wy1 = box(ndimage.binary_opening(mag & (l2 == order[0]), iterations=4))
    W, H = x1 - x0, y1 - y0
    meta[k] = {'w': size[0], 'h': size[1], 'win': [round((wx0 - x0) / W, 4), round((wy0 - y0) / H, 4), round((wx1 - wx0) / W, 4), round((wy1 - wy0) / H, 4)]}
    if k.endswith('-machine') and n > 1:
        (lx0, ly0, lx1, ly1), ls = save(order[1], k.replace('-machine', '-levier'), round(900 * (box(l2 == order[1])[2] - box(l2 == order[1])[0]) / W))
        meta[k]['lever'] = {'w': ls[0], 'h': ls[1], 'rw': round((lx1 - lx0) / W, 4), 'rh': round((ly1 - ly0) / H, 4)}
    json.dump(meta, open(mp, 'w'), indent=1)
    return k + ' ' + json.dumps(meta[k])

if __name__ == '__main__':
    mode, raw, keys = sys.argv[1], sys.argv[2], sys.argv[3:] or list(ALL)
    os.makedirs(raw, exist_ok=True)
    if mode == 'gen':
        with ThreadPoolExecutor(4) as ex:
            for r in ex.map(lambda k: gen(raw, k), keys): print(r)
    else:
        for k in keys: print(cut(raw, k))
