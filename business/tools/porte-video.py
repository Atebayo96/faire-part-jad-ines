#!/usr/bin/env python3
"""Ouverture « Portes » en vidéo (12 octobre 2026 : « les portes s'ouvrent machinalement, c'est pas logique »).

Une vidéo d'ouverture générée (fal.ai, Kling, à partir de img/open/<thème>-portes.webp) devient
img/open/<thème>-porte.mp4 : la couleur en haut, le masque en bas (blanc = la porte et son arc, noir = le vide
derrière les battants, où l'on voit le faire-part). invite.js lit les deux moitiés et pose la page derrière.

Le vide derrière les battants est la pièce que Kling peint (vert sombre, presque olive) : on le reconnaît à sa
couleur (vert au moins égal au rouge, nettement plus que le bleu, sombre), puis :
  - le sol de la pièce, sous ce vide, est rattaché au vide (colonne par colonne, ce qui n'est pas du bois) ;
  - le masque ne fait que grandir d'une image à l'autre (les battants s'écartent) : pas de scintillement ;
  - bord adouci d'un pixel, liseré vert retiré de la couleur (le vert ne dépasse pas le rouge près du bord).

  python3 business/tools/porte-video.py alhambra /chemin/porte.mp4 [--debut 0.4]
"""
import argparse, os, subprocess, tempfile, glob
import numpy as np
from PIL import Image, ImageFilter

B = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W = 540


REF = None  # couleur du mur du fond, lue au centre de la dernière image (portes ouvertes)


def vide(a):
    """le mur du fond (sa teinte varie d'une vidéo à l'autre : vert olive, brun olive) et son ombre presque noire le long
    de l'arc (« les petits trucs noirs qui sont restés ») ; le bois des battants est bien plus rouge, le stuc bien plus clair"""
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    lum = (r + g + b) / 3
    rg, gb, L = REF
    teinte = (np.abs((r - g) - rg) < 12) & (np.abs((g - b) - gb) < 16) & (lum < L * 1.35)
    # l'ombre presque noire : seulement le long de l'arc, en haut (plus bas, c'est le métal des poignées : « la serrure a sauté »)
    haut = np.zeros_like(lum, bool); haut[:int(a.shape[0] * .32)] = True
    # l'interstice des premières images est presque noir et neutre ; le métal des poignées est plus clair et doré
    noir = (lum < 45) & (np.abs(r - g) < 10)
    return teinte | ((lum < 60) & ((r - g) < rg + 12) & haut) | noir


def garde_centre(k):
    from PIL import ImageDraw
    h, w = k.shape
    im = Image.fromarray((k * 255).astype('uint8')).copy()  # sans copie, floodfill n'écrit pas dans l'image
    for fy in (.3, .45, .6, .75):
        y = int(h * fy)
        for dx in range(0, int(w * .12)):
            for x in (w // 2 - dx, w // 2 + dx):
                if im.getpixel((x, y)) == 255:
                    ImageDraw.floodfill(im, (x, y), 128)
                    break
            else:
                continue
            break
    return np.asarray(im) == 128


def ouvre_vertical(k, y0, n):
    """érosion puis dilatation verticales (fenêtre n) sous la rangée y0"""
    b = k[y0:].astype(np.int32)
    def win(m, full):
        c = np.vstack([np.zeros((1, m.shape[1]), np.int32), np.cumsum(m, 0)])
        h = m.shape[0]; r = n // 2
        lo = np.clip(np.arange(h) - r, 0, h); hi = np.clip(np.arange(h) + r + 1, 0, h)
        s = c[hi] - c[lo]
        return (s == (hi - lo)[:, None]) if full else (s > 0)
    e = win(b, True).astype(np.int32)
    d = win(e, False)
    k = k.copy(); k[y0:] = d
    return k


def interstice(k, a):
    h, w = k.shape
    lum = a.sum(2) / 3
    sombre = k | ((lum < 75) & ((a[..., 0] - a[..., 1]) < 38))
    ys = slice(int(h * .3), int(h * .8))
    xs = np.where(k[ys])[1]
    xc = int(np.median(xs)) if len(xs) > 50 else w // 2
    k = k.copy()
    X0 = np.full(h, np.nan); X1 = np.full(h, np.nan)
    for y in range(int(h * .08), h):
        row = sombre[y]
        x = next((x for d in range(0, int(w * .06)) for x in (xc - d, xc + d) if row[x]), None)
        if x is None:
            continue
        x0 = x
        while x0 > 0 and row[x0 - 1]: x0 -= 1
        x1 = x
        while x1 < w - 1 and row[x1 + 1]: x1 += 1
        if x1 - x0 < w * .9:
            X0[y], X1[y] = x0, x1
    # bords lissés sur la hauteur (médiane sur 61 rangées) : le métal sombre d'une poignée élargissait l'interstice sur
    # quelques rangées et laissait une encoche (« la serrure a sauté »)
    r = 30
    for y in range(h):
        if np.isnan(X0[y]):
            continue
        a0 = X0[max(0, y - r):y + r + 1]; a1 = X1[max(0, y - r):y + r + 1]
        x0 = int(np.nanmedian(a0)); x1 = int(np.nanmedian(a1))
        if x1 > x0:
            k[y, x0:x1 + 1] = True
    return k


def pousse(k, cand, n=8):
    """étend le vide aux pixels candidats qui le touchent (ombres, bord adouci par la compression)"""
    for _ in range(n):
        d = np.asarray(Image.fromarray((k * 255).astype('uint8')).filter(ImageFilter.MaxFilter(3))) > 127
        k = k | (d & cand)
    return k


def main():
    p = argparse.ArgumentParser()
    p.add_argument('theme'); p.add_argument('src'); p.add_argument('--debut', type=float, default=0.4)
    o = p.parse_args()
    t = tempfile.mkdtemp()
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(o.debut), '-i', o.src, '-vf', f'scale={W}:-2,fps=24', f'{t}/%04d.png'], check=True)
    fs = sorted(glob.glob(f'{t}/*.png'))
    global REF
    z = np.asarray(Image.open(fs[-1]).convert('RGB')).astype(np.int16); h, w = z.shape[:2]
    c = z[int(h * .4):int(h * .6), int(w * .45):int(w * .55)].reshape(-1, 3)
    m = np.median(c, 0); REF = (m[0] - m[1], m[1] - m[2], m.mean())
    print('mur du fond', m.astype(int))
    acc = None
    for f in fs:
        a = np.asarray(Image.open(f).convert('RGB')).astype(np.int16)
        H = a.shape[0]
        k = vide(a)
        # nettoie les points isolés, referme les trous
        m = Image.fromarray((k * 255).astype('uint8')).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(3))
        k = np.asarray(m) > 127
        # tout ce qui est sombre et pas du bois, au contact du vide, en fait partie
        lum = a.sum(2) / 3
        haut = np.zeros_like(k); haut[:int(H * .32)] = True
        k = pousse(k, (lum < 95) & ((a[..., 0] - a[..., 1]) < REF[0] + 10) & haut)
        # le sol : sous le vide, ce qui n'est pas du bois (le bois est nettement plus rouge que vert)
        # l'interstice des premières images : une ombre brune très sombre entre les deux battants. Rangée par rangée, depuis
        # le milieu de l'interstice, on prend tout ce qui est sombre et d'un seul tenant (sinon il était découpé par morceaux)
        k = interstice(k, a)
        # seulement la zone d'un seul tenant au milieu de l'embrasure : l'ombre au bord des colonnes de stuc, sombre elle
        # aussi, faisait des traits verticaux en dehors de l'arc
        k = garde_centre(k)
        # sous l'arc, toute avancée de moins de 71 px de haut est retirée (ouverture verticale) : c'est une poignée (environ 50 px)
        k = ouvre_vertical(k, int(H * .35), 71)
        # le mur du fond à 80 % de la hauteur : tout ce qui est dessous, dans la même colonne, est la plinthe ou le sol
        # (le parquet est aussi rouge que le bois des battants : on ne peut pas le reconnaître à sa couleur)
        y0 = int(H * .80)
        cols = np.where(k[y0])[0]
        k[y0:, cols] = True
        acc = k if acc is None else (acc | k)
        al = Image.fromarray(((~acc) * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(.8))
        A = np.asarray(al).astype(np.int16)
        # liseré : près du bord, le vert ne dépasse pas le rouge
        edge = (A > 10) & (A < 245)
        c = a.copy(); c[..., 1] = np.where(edge, np.minimum(c[..., 1], c[..., 0]), c[..., 1])
        out = np.concatenate([c, np.repeat(A[..., None], 3, 2)], 0).astype('uint8')
        Image.fromarray(out).save(f)
    dst = os.path.join(B, 'landing', 'img', 'open', f'{o.theme}-porte.mp4')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-framerate', '24', '-i', f'{t}/%04d.png', '-c:v', 'libx264', '-preset', 'slow',
                    '-crf', '24', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', dst], check=True)
    # WebM (VP9) pour les navigateurs sans H.264 (Chromium libre, certains Android)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-framerate', '24', '-i', f'{t}/%04d.png', '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '36',
                    '-row-mt', '1', '-pix_fmt', 'yuv420p', '-an', dst.replace('.mp4', '.webm')], check=True)
    # la première image (portes fermées) sert d'affiche, sans attendre la vidéo
    Image.open(fs[0]).crop((0, 0, W, Image.open(fs[0]).size[1] // 2)).save(dst.replace('.mp4', '.webp'), quality=88)
    print(dst, os.path.getsize(dst) // 1024, 'Ko,', len(fs), 'images')


if __name__ == '__main__':
    main()
