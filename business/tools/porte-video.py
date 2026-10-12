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


def vide(a):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    lum = (r + g + b) / 3
    # la pièce (vert olive) et son ombre presque noire le long de l'arc (« les petits trucs noirs qui sont restés »)
    return (g >= r - 6) & (((g > b + 8) & (lum < 150)) | (lum < 70))


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
        k = pousse(k, (lum < 95) & ((a[..., 0] - a[..., 1]) < 22))
        # le sol : sous le vide, ce qui n'est pas du bois (le bois est nettement plus rouge que vert)
        y0 = int(H * .80)
        r, g = a[..., 0], a[..., 1]
        for x in np.where(k[y0])[0]:
            col = (r[y0:, x] - g[y0:, x]) < 34
            k[y0:, x] |= col
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
