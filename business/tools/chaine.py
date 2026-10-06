"""Chaîne continue (6 octobre 2026) : le faire-part est UNE peinture verticale qu'on descend, chaque moment (accueil,
événements, infos, réponse) peint comme la suite du précédent, la lumière tournant du jour à la nuit. « L'idée c'est que
ce soit en continu, quand je swipe l'image d'après, que ce soit comme une seule chaîne. »
Méthode : on part d'une scène (start) ; pour chaque station suivante, Gemini reçoit un canevas 9:16 dont le haut (15 %)
est le bas de la peinture déjà faite et le reste est vide, et prolonge la peinture vers le bas : une bande calme (brume,
nuages, ciel) qui portera le texte, puis le sujet de la station. Le raccord est fondu sur la zone commune.
Sortie : landing/img/chaine/<nom>/strip.webp (1080 px de large) et meta.json (ancres : y en px, rôle, texte clair/foncé).
Usage : python3 business/tools/chaine.py <nom> [--from k]   (spécification : tools/chaines.json)"""
import json, os, sys
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lieux as L
import check_images as C

B = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W, H, OV = 1080, 1920, 480           # canevas 9:16, zone commune de 25 % (la brume du bas du morceau d'avant)
SCREEN = round(W * 844 / 390)        # un écran de téléphone à 1080 px de large


def calm(st):
    return ("a calm open area of deep, dark, smooth night sky (deep indigo or navy, no bright clouds, no pale mist, no moon "
            "in it: it will carry WHITE text)" if st['dark'] else
            "a calm open area of soft pale mist, light clouds and sky, smooth and empty (it will carry dark text)")


def bottom(nxt):
    tone = ("dark blue night haze" if nxt and nxt['dark'] else "pale drifting mist and clouds")
    return (f"At the very bottom of the canvas, the scene dissolves softly into {tone} (about the last 12% of the height): "
            "no ground edge, no floor line, nothing cut by the bottom edge. "
            "One continuous painting: no seam, no horizontal line, no border, no frame, no text, no letters, no faces.")


def prompt(spec, st, nxt=None):
    return ("This canvas is part of ONE tall vertical painting painted from top to bottom. The top strip of the canvas "
            "already contains the bottom of the painting so far: keep it exactly as it is, and continue the painting "
            "downward, seamlessly, in exactly the same style: " + spec['style'] + ". "
            f"Light and colours of this new part: {st['light']}. "
            f"Directly below the existing strip, blending smoothly out of it, paint {calm(st)}, "
            "about 45% of the canvas height (no objects, no birds, no branches in it). "
            f"Below that calm area, filling the lower part of the canvas from edge to edge: {st['subject']}. "
            + bottom(nxt))


BOTTOM = ("At the very bottom of the canvas, the scene dissolves softly into pale drifting mist and clouds (about the "
          "last 12% of the height): no ground edge, no floor line, nothing cut by the bottom edge. "
          "One continuous painting: no seam, no horizontal line, no border, no frame, no text, no letters, no faces.")


def first(spec, st, nxt=None):
    return ("The reference image shows the style and the scene. Paint a NEW vertical 9:16 painting in exactly this style: "
            + spec['style'] + f". Light: {st['light']}. The top 50% is calm open sky, smooth and empty (it will carry text). "
            f"Below it, from edge to edge: {st['subject']}. " + bottom(nxt))


RECOMP0 = RECOMP = '--recompose' in sys.argv
REDO = int(sys.argv[sys.argv.index('--redo') + 1]) if '--redo' in sys.argv else 99   # avec --recompose : repeint à partir de cette station   # refait l'assemblage avec les morceaux déjà générés, sans Gemini


def soften(g, at=None):
    """Gemini garde la brume du haut puis repart sur un ciel net : une ligne horizontale. On cherche cette ligne (plus fort
    saut de couleur moyen entre deux rangées, sous la zone commune) et on la fond en dégradé : la bande autour est remplacée
    peu à peu par une version très floue d'elle-même, la brume passe au ciel sans bord."""
    from scipy import ndimage
    rows = g.mean(1); d = np.abs(np.diff(rows, axis=0)).sum(1)
    c0 = OV if at is None else at
    lo, hi = max(1, c0 - 280), min(H - 2, c0 + 280); y = lo + int(np.argmax(d[lo:hi]))
    blur = ndimage.gaussian_filter(g, (90, 40, 0))
    band = 260; yy = np.arange(H)[:, None, None]
    w = np.clip(1 - np.abs(yy - y) / band, 0, 1) ** .8
    return g * (1 - w) + blur * w


def zone_contrast(a, dark, spec):
    c = np.where(a <= .03928, a / 12.92, ((a + .055) / 1.055) ** 2.4); z = (.2126 * c[..., 0] + .7152 * c[..., 1] + .0722 * c[..., 2])[::6, ::6].ravel()
    lt = 1.0 if dark else C.lum(C.hex_rgb(spec.get('ink', '#193f64')))
    z = z[np.argsort(np.abs(z - lt))][:max(1, len(z) // 4)].mean(); return (max(lt, z) + .05) / (min(lt, z) + .05)


def station(spec, st, k):
    return ("The reference images show the style (and, if there are two, the previous scene of the same series). Paint a "
            "NEW vertical 9:16 painting of the same series, in exactly this style: " + spec['style'] + ". "
            f"Light and colours: {st['light']}. The top {st.get('calm', 45)}% of the canvas is {calm(st)}. Below it, large and detailed, "
            f"filling the canvas from edge to edge down to the bottom edge: {st['subject']}. "
            "No border, no frame, no text, no letters, no faces.")


def bridge(spec, a, b):
    return ("This canvas belongs to ONE tall vertical painting. Its top quarter is the bottom of one scene and its bottom "
            "quarter is the top of the next scene: keep both exactly as they are. Paint the grey middle part so that the "
            "two connect seamlessly into one continuous painting, in exactly the same style: " + spec['style'] + ". "
            f"The middle is a soft transition of drifting clouds, mist and sky, the light changing gradually from "
            f"\"{a['light']}\" to \"{b['light']}\". Nothing new in it: no object, no building, no person. "
            "No seam, no horizontal line, no border, no frame, no text.")


def gen(gp, p, refs, check=None):
    """Génère (ou reprend avec --recompose) ; check(img) -> contraste de la zone du texte, jusqu'à 3 essais."""
    if RECOMP and os.path.exists(gp): return
    best = None
    for t in range(3 if check else 1):
        tp = gp.replace('.png', f'-{t}.png')
        if not L.gemini(tp, p, refs): continue
        c = check(np.asarray(Image.open(tp).convert('RGB').resize((W, H), Image.LANCZOS)).astype(float) / 255) if check else 9
        print(f'  {os.path.basename(gp)} essai {t + 1} : contraste {c:.2f}', flush=True)
        if best is None or c > best[0]: best = (c, tp)
        if c >= 4.5: break
    if not best: sys.exit(f'{gp} : échec de génération')
    os.replace(best[1], gp)


def run(name):
    """Chaque moment est peint seul, en pleine page (ciel calme en haut, scène en grand en bas) ; entre deux moments, un
    passage peint par Gemini à partir du bas de l'un et du haut de l'autre (brume, ciel, la lumière qui tourne)."""
    global RECOMP
    spec = json.load(open(os.path.join(B, 'tools', 'chaines.json')))[name]
    out = os.path.join(B, 'landing', 'img', 'chaine', name); os.makedirs(out, exist_ok=True)
    tmp = os.path.join(L.TMP, 'chaine3-' + name); os.makedirs(tmp, exist_ok=True)
    S = spec['stations']; load = lambda p: np.asarray(Image.open(p).convert('RGB').resize((W, H), Image.LANCZOS)).astype(float)
    imgs = []
    for k, st in enumerate(S):
        RECOMP = RECOMP0 and k < REDO
        gp = os.path.join(tmp, f'st-{k}.png')
        refs = [os.path.join(B, spec['start'])] + ([os.path.join(tmp, f'st-{k - 1}.png')] if k else [])
        gen(gp, station(spec, st, k), refs, lambda a, st=st: zone_contrast(a[60:int(H * .42), int(W * .1):int(W * .9)], st['dark'], spec))
        imgs.append(load(gp))
    # accueil : le plus long bloc de texte (sceau, prénoms, date à découvrir). On prolonge sa peinture vers le HAUT d'un
    # ciel calme (lift, en px) pour que tout le texte tienne au-dessus du sujet ; jamais de remplissage ajouté à la main.
    lift = S[0].get('lift', 0)
    if lift:
        keep = H - lift; c = np.full((H, W, 3), 128.0); c[lift:] = imgs[0][:keep]
        cp = os.path.join(tmp, 'canvas-lift.png'); Image.fromarray(c.astype('uint8')).save(cp)
        gp = os.path.join(tmp, 'lift.png')
        RECOMP = RECOMP0 and 0 < REDO
        gen(gp, "This canvas is the top of a vertical painting. Its lower part is already painted: keep it exactly as it is. "
            "Paint the grey upper part as a continuation of the same sky, upward, in exactly the same style and colours: "
            + spec['style'] + ". Only calm open sky with a few soft clouds, smooth and empty (it will carry text). "
            "No seam, no horizontal line, no border, no frame, no text.", [cp])
        g = soften(load(gp), lift); b = np.linspace(0, 1, 240)[:, None, None]
        top = g[:lift + 240].copy(); top[lift:] = g[lift:lift + 240] * (1 - b) + imgs[0][:240] * b
        imgs[0] = np.concatenate([top, imgs[0][240:]], 0)
    # chaque moment, seul, pour les vignettes (cartes de la vitrine, tuiles du configurateur, portes et rideau) :
    # img/chaine/<nom>/st-<n>.webp et img/themes/<nom>-<n>.webp (accueil, cérémonie, dîner, réponse)
    for n, k in enumerate([0, 1, 2, len(S) - 1], 1):
        im_k = Image.fromarray(load(os.path.join(tmp, f'st-{k}.png')).astype('uint8'))
        im_k.save(os.path.join(out, f'st-{n}.webp'), 'WEBP', quality=82, method=6)
        im_k.resize((540, 954), Image.LANCZOS).save(os.path.join(B, 'landing', 'img', 'themes', f'{name}-{n}.webp'), 'WEBP', quality=82, method=6)
    strip, meta = imgs[0][:-OV], [{'y': 0, 'role': S[0]['role'], 'dark': S[0]['dark']}]
    a = np.linspace(0, 1, OV)[:, None, None]
    for k in range(1, len(S)):
        RECOMP = RECOMP0 and k < REDO
        c = np.full((H, W, 3), 128.0); c[:OV] = imgs[k - 1][-OV:]; c[H - OV:] = imgs[k][:OV]
        cp = os.path.join(tmp, f'canvas-{k}.png'); Image.fromarray(c.astype('uint8')).save(cp)
        gp = os.path.join(tmp, f'br-{k}.png'); gen(gp, bridge(spec, S[k - 1], S[k]), [cp]); g = soften(soften(load(gp), OV), H - OV)
        # raccords : bas de la scène d'avant -> passage -> haut de la scène suivante, fondus sur les zones communes
        top = imgs[k - 1][-OV:] * (1 - a) + g[:OV] * a
        bot = g[H - OV:] * (1 - a) + imgs[k][:OV] * a
        strip = np.concatenate([strip, top, g[OV:H - OV], bot], 0)
        meta.append({'y': int(strip.shape[0] - OV), 'role': S[k]['role'], 'dark': S[k]['dark']})
        strip = np.concatenate([strip, imgs[k][OV:] if k == len(S) - 1 else imgs[k][OV:H - OV]], 0)
        print(f'station {k} ({S[k]["role"]}) : ok, hauteur {strip.shape[0]}', flush=True)
    im = Image.fromarray(strip.astype('uint8'))
    im.save(os.path.join(out, 'strip.webp'), 'WEBP', quality=80, method=6)
    # ancres : pour chaque moment, l'endroit le plus lisible autour de sa brume et la couleur de texte qui s'y lit le mieux
    # (texte de l'écran : de 8 à 50 % de sa hauteur, 10 à 90 % de sa largeur ; pire quart des pixels, comme check_images)
    A = np.asarray(im.convert('RGB')).astype(float) / 255
    lum = lambda a: (lambda c: .2126 * c[..., 0] + .7152 * c[..., 1] + .0722 * c[..., 2])(np.where(a <= .03928, a / 12.92, ((a + .055) / 1.055) ** 2.4))
    Lm = lum(A[::8, ::8]); ink = C.lum(C.hex_rgb(spec.get('ink', '#193f64')))
    def score(y, dark):
        z = Lm[int((y + SCREEN * .08) / 8):int((y + SCREEN * ZB) / 8), int(W * .1 / 8):int(W * .9 / 8)].ravel()
        if not len(z): return 0
        lt = 1.0 if dark else ink; z = z[np.argsort(np.abs(z - lt))][:max(1, len(z) // 4)].mean()
        hi, lo = max(lt, z), min(lt, z); return (hi + .05) / (lo + .05)
    G = np.abs(np.diff(Lm, axis=0))[:, :-1] + np.abs(np.diff(Lm, axis=1))[:-1, :]
    ZB = .5   # bas de la zone du texte (accueil : 50 % de l'écran ; un événement tient dans 42 %)
    def agit(y):   # agitation de la zone du texte : un texte ne passe jamais sur un sujet (règle 5)
        z = G[int((y + SCREEN * .06) / 8):int((y + SCREEN * ZB) / 8), int(W * .08 / 8):int(W * .92 / 8)]
        return float(np.percentile(z, 90)) if z.size else 1
    for k, m in enumerate(meta):
        ZB = .5 if m['role'] == 'home' else .42
        top = A.shape[0] - SCREEN   # le dernier écran finit au bas de la peinture
        cands = [0] if k == 0 else (list(range(max(0, m['y'] - 300), min(top, m['y'] + 200), 20)) or [top])
        sc = [(score(y, d), y, d, agit(y)) for y in cands for d in (False, True)]
        calm = [x for x in sc if x[3] < .045] or sorted(sc, key=lambda x: x[3])[:6]
        best = max(calm)
        print('   agitation', round(best[3], 3))
        m['y'], m['dark'], m['contrast'] = int(best[1]), bool(best[2]), round(best[0], 2)
        print(m['role'], m['y'], 'texte blanc' if m['dark'] else 'texte foncé', m['contrast'])
    json.dump({'src': f'/img/chaine/{name}/strip.webp', 'w': W, 'h': im.height, 'ink': {'nm': spec.get('ink', '#193f64'), 'ey': spec.get('ey', spec.get('ink', '#193f64')), 'tx': spec.get('tx', spec.get('ink', '#193f64'))}, 'anchors': meta}, open(os.path.join(out, 'meta.json'), 'w'), indent=1)


if __name__ == '__main__':
    run(sys.argv[1])
