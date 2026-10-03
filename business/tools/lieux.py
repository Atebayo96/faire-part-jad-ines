"""Bibliothèque de lieux des thèmes en scènes (formule Essentiel) : 5 lieux + 1 fond par thème, générés avec Gemini
dans le style du thème, puis contrôlés comme les décors (check_images.py : zone de texte calme et contrastée).

  lieux : mairie, eglise, salle, jardin, plage -> écran « Scène » d'un événement
  fond  : le même ciel ou papier, sans sujet  -> écran « simple » (le texte sur le décor, le tableau continue)

Usage : python3 business/tools/lieux.py [theme ...] [--lieux mairie,fond] [--force]
Sortie : business/landing/img/hd/<theme>-<lieu>.webp (1080 x 1909, décor du faire-part)
     et business/landing/img/lieux/<theme>-<lieu>.webp (540 x 954, vignettes et aperçu de la vitrine).
Une image qui échoue au contrôle est retouchée par Gemini (ciel ou papier repeint, sujet gardé), jusqu'à 3 fois."""
import os, subprocess, sys, concurrent.futures as cf
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import check_images as C

IMG = os.path.join(HERE, '..', 'landing', 'img')
TMP = os.environ.get('LIEUX_TMP', '/tmp/lieux')
os.makedirs(TMP, exist_ok=True); os.makedirs(os.path.join(IMG, 'lieux'), exist_ok=True)

LIEUX = {
    'mairie': "a town hall (French 'mairie'): a dignified civic building facade with a clock, tall windows, a flag and wide front steps, seen from the square",
    'eglise': "a church: a stone chapel or church facade with its bell tower and an open wooden door, seen from the forecourt",
    'salle': "a reception venue for the wedding party: an elegant manor or banquet hall, every window glowing warm, string lights at the entrance",
    'jardin': "an outdoor garden ceremony: a flowered arch at the end of an aisle between rows of empty chairs, trees and greenery around",
    'plage': "a seaside ceremony: a light draped arch on the sand facing the sea, a path of petals, gentle waves",
    'fond': "NO venue and NO subject: only the calm background of this theme (its sky, night or paper texture) filling the whole screen, "
            "with at most a very discreet strip of the theme's decoration along the bottom 15% (foliage, flowers, sand, a thin ornament)",
}

T = C.themes()


def zone_rule(t):
    if t.get('light'):
        return ("The text written on it is DARK, so the area from 10% to 55% of the height must be LIGHT and PLAIN: "
                "pale paper, cream or a very pale sky, uniform, with no pattern, no ornament, no cloud detail.")
    return ("The text written on it is WHITE, so the area from 10% to 55% of the height must be DARK and CALM: "
            "a deep dusk or night sky (deep blue, indigo, dark plum or black), smooth, with no bright clouds, no sunset glow, "
            "no stars cluster, no lanterns, no branches in that area.")


def ok(png, t):
    r = C.analyse(png, C.hex_rgb(t['color']) if t.get('light') else (255, 255, 255))
    return r['agitation'] <= C.AGIT_MAX and r['contrast'] >= C.CONTRAST_MIN, r


def gemini(out, prompt, refs):
    for _ in range(3):
        r = subprocess.run([sys.executable, os.path.join(HERE, 'gemini.py'), out, prompt, *refs], capture_output=True, text=True)
        if r.returncode == 0 and os.path.exists(out): return True
    return False


def save(png, k, lieu):
    im = Image.open(png).convert('RGB')
    w, h = im.size; tw = round(h * 540 / 954)
    if tw < w: im = im.crop(((w - tw) // 2, 0, (w - tw) // 2 + tw, h))
    im.resize((1080, 1909), Image.LANCZOS).save(os.path.join(IMG, 'hd', f'{k}-{lieu}.webp'), 'WEBP', quality=80, method=6)
    im.resize((540, 954), Image.LANCZOS).save(os.path.join(IMG, 'lieux', f'{k}-{lieu}.webp'), 'WEBP', quality=82, method=6)


def make(k, lieu, force):
    t = T[k]
    out = os.path.join(IMG, 'hd', f'{k}-{lieu}.webp')
    if os.path.exists(out) and not force and ok(out, t)[0]: return f'{k}-{lieu} : déjà là'
    refs = [os.path.join(IMG, 'hd', f'{k}-{n}.webp') for n in (1, 2, 3)]
    png = os.path.join(TMP, f'{k}-{lieu}.png')
    prompt = (
        "The three reference images are scenes from the same illustrated wedding invitation theme. "
        f"Paint a NEW scene of the same series showing {LIEUX[lieu]}, adapted to the universe of this theme. "
        "Match the references exactly: same artistic medium and brushwork, same colour palette, same paper texture. "
        "Vertical 9:16 phone screen. " + zone_rule(t) + " "
        "The subject sits in the lower 45% of the image only. "
        "No people at all, no faces. No text, no letters, no signs with writing, no watermark, no frame.")
    if not gemini(png, prompt, refs): return f'{k}-{lieu} : ÉCHEC génération'
    good, r = ok(png, t)
    for _ in range(3):
        if good: break
        # retouche : on garde le sujet, on repeint la zone du texte
        fix = os.path.join(TMP, f'{k}-{lieu}-fix.png')
        p2 = ("Keep this illustration exactly as it is in its lower part (same subject, same style, same colours). "
              "Repaint only the upper part of the image. " + zone_rule(t) + " "
              "Blend smoothly into the lower part, with no visible line. No text, no people.")
        if gemini(fix, p2, [png]): os.replace(fix, png)
        good, r = ok(png, t)
    save(png, k, lieu)
    return f"{k}-{lieu} : {'ok' if good else 'À REVOIR'} (agitation {r['agitation']}, contraste {r['contrast']})"


if __name__ == '__main__':
    args = sys.argv[1:]
    force = '--force' in args; args = [a for a in args if a != '--force']
    only = None
    if '--lieux' in args:
        i = args.index('--lieux'); only = args[i + 1].split(','); del args[i:i + 2]
    themes = args or [k for k, t in T.items() if not t.get('long')]
    jobs = [(k, l) for k in themes for l in LIEUX if not only or l in only]
    with cf.ThreadPoolExecutor(6) as ex:
        for res in ex.map(lambda j: make(*j, force), jobs): print(res, flush=True)
