"""Scènes propres aux écrans d'après les événements (programme, dress code, hébergement, infos, liste), pour qu'une même
image ne se répète plus sur trois pages (6 octobre 2026, 8 images accordées par l'utilisateur).

Usage : python3 business/tools/pages-extra.py [thème-clé ...]
Une seule génération par image, sans retouche automatique : une image qui échoue au contrôle est signalée, pas refaite
(aucune génération sans accord chiffré, CLAUDE.md 32f). Sortie : img/hd/<thème>-<clé>.webp (1080 x 1909) et img/lieux/."""
import os, sys, concurrent.futures as cf
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import lieux as L, check_images as C

NIGHT = ("The text written on it is WHITE, so the area from 10% to 55% of the height must be DARK and CALM: a deep dusk or "
         "night sky (deep blue to indigo), smooth, with no bright clouds, no sunset glow, no lanterns or branches in that area.")
# « une zone claire et unie » faisait estomper le haut des falaises et des maisons en blanc (« pourquoi on coupe ici ? ») :
# on demande un vrai ciel peint, comme sur la chapelle de jour, et un décor entier qui monte dans ce ciel
DAY = ("The text written on it is DARK, so the area from 10% to 55% of the height is a REAL PAINTED SKY like in the "
       "references: soft pale blue with a few light, delicate clouds, light enough for dark text. Cliffs, houses, trees and "
       "flowers keep their complete silhouettes and rise naturally into that sky. Absolutely NO white fade, NO mist band, "
       "NO vignette: nothing in the painting dissolves or fades into white or into a blank area.")
JOBS = {
    # première version : une pergola coupée net sur un aplat de ciel (« pas besoin de couper, faut vraiment la full image ») ;
    # terrasse ouverte, sans poutre au-dessus, et un vrai ciel du soir qui descend derrière tout
    'dolcevita-prog': (('dolcevita', 1, 3, 4), NIGHT + " The sky is a real painted evening sky with a smooth gradient down to "
        "the horizon, continuous behind the whole scene; trees, flowers and the coast keep their complete silhouettes against "
        "it. No straight horizontal edge, no beam or roof across the top of the scene, no flat band.",
        "the aperitivo on an OPEN terrace above the sea at dusk, with no pergola and no roof: a small marble bar with spritz "
        "glasses, a bowl of lemons, an ice bucket, potted lemon trees and bougainvillea on each side, a few lanterns on the "
        "balustrade, the lights of the coastal village and the sea below"),
    'dolcevita-dress': (('dolcevita', 1, 3, 4), NIGHT, "the dress code: on a wrought-iron balcony rail covered in bougainvillea, "
        "a flowing pale silk evening dress and a cream linen jacket hang on wooden hangers, a straw hat and a fan on a little "
        "table beside them, the sea and the village lights below at dusk"),
    'dolcevita-info': (('dolcevita', 1, 3, 4), NIGHT, "where to stay: a small pastel hotel villa with green shutters and every "
        "window glowing warm, a stone staircase lined with lemon trees going down to the harbour where boats are moored, dusk"),
    'dolcevitajour-prog': (('dolcevitajour', 1, 2, 3), DAY, "the aperitivo on a sunny terrace above the turquoise sea: a small "
        "marble bar with spritz glasses, a bowl of lemons, an ice bucket, potted lemon trees and bougainvillea, the coastal "
        "village below in full daylight"),
    'dolcevitajour-dress': (('dolcevitajour', 1, 2, 3), DAY, "the dress code: on a wrought-iron balcony rail covered in "
        "bougainvillea, a flowing pale silk dress and a cream linen jacket hang on wooden hangers, a straw hat and a fan on a "
        "little table beside them, the turquoise sea below in full daylight"),
    'dolcevitajour-info': (('dolcevitajour', 1, 2, 3), DAY, "where to stay, seen from a little further away so that every "
        "building is shown WHOLE with its roof and chimney against the sky: a row of small pastel hotel villas with green "
        "shutters on the right, a stone staircase lined with lemon trees going down to the harbour where boats are moored, "
        "the coast beyond, full daylight"),
    'oldmoney-info': (('oldmoney', 2, 3, 4), NIGHT, "practical information, arriving at the manor: a vintage dark green car "
        "parked on the gravel forecourt, an old leather suitcase and a hat box beside it, a lit lantern on the stone steps, "
        "clipped box hedges, the manor door glowing warm, at dusk"),
    # première version jetée : un ciel de nuit au-dessus d'une orangerie intérieure ; la scène est donc dehors
    'oldmoney-liste': (('oldmoney', 2, 3, 4), NIGHT, "the wedding gift list, OUTDOORS on the stone terrace of the manor at "
        "dusk: a round table with a white tablecloth holding a stack of gift boxes wrapped in cream paper and silk ribbon, a "
        "silver tray, a vase of white roses and lit candles, clipped box hedges and the softly lit manor windows behind, the "
        "open evening sky above (a real outdoor sky, no ceiling, no interior)"),
}


def make(key):
    (th, *refs), zone, subject = JOBS[key]
    t = L.T[th]; ink = (255, 255, 255) if zone.startswith(NIGHT) else C.hex_rgb(t['color'])
    png = os.path.join(L.TMP, key + '.png')
    prompt = ("The three reference images are scenes from the same illustrated wedding invitation theme. "
              f"Paint a NEW scene of the same series showing {subject}. "
              "Match the references exactly: same artistic medium and brushwork, same colour palette, same light. "
              "Vertical 9:16 phone screen, one single continuous painting from edge to edge, no frame, no border, no vignette. "
              + zone + " The subject sits in the lower 45% of the image only and touches both side edges and the bottom. "
              "No people at all, no faces. No text, no letters, no signs with writing, no watermark.")
    if not L.gemini(png, prompt, [os.path.join(L.IMG, 'hd', f'{th}-{n}.webp') for n in refs]): return key + ' : ÉCHEC génération'
    r = C.analyse(png, ink); good = r['agitation'] <= C.AGIT_MAX and r['contrast'] >= C.CONTRAST_MIN
    th2, k = key.rsplit('-', 1); L.save(png, th2, k)
    return f"{key} : {'ok' if good else 'À REVOIR'} (agitation {r['agitation']}, contraste {r['contrast']})"


if __name__ == '__main__':
    keys = sys.argv[1:] or list(JOBS)
    with cf.ThreadPoolExecutor(8) as ex:
        for res in ex.map(make, keys): print(res, flush=True)
