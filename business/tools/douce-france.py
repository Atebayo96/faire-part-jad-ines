"""Douce France (6 octobre 2026, accord de l'utilisateur : « vas-y ») : la Provence, bastide en pierre dorée, lavande,
platanes. Une seule génération par image, sans retouche automatique (CLAUDE.md 32f). Chaque image est une peinture
entière, d'un bord à l'autre : vrai ciel qui descend derrière toute la scène, silhouettes entières, ni fondu blanc, ni
bande unie, ni poutre en travers (CLAUDE.md 32g).

  python3 business/tools/douce-france.py 1          # la scène d'accueil, qui fixe le style
  python3 business/tools/douce-france.py            # tout le reste, d'après la scène 1
Sortie : img/hd/doucefrance-<clé>.webp (1080 x 1909), img/themes/doucefrance-<n>.webp et img/lieux/ (540 x 954)."""
import os, sys, concurrent.futures as cf
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import lieux as L, check_images as C

K = 'doucefrance'
STYLE = ("A warm, luminous impressionist oil painting with visible soft brushwork, like a fine wedding stationery illustration "
         "of Provence: honey-coloured stone, lavender fields, plane trees, olive trees, cypresses, terracotta roofs, pale blue "
         "shutters.")
DAY = ("The text written on it is DARK, so the area from 10% to 55% of the height is a REAL PAINTED SUMMER SKY: soft pale "
       "blue with a few light, delicate clouds, light enough for dark text. Every tree, roof and building keeps its complete "
       "silhouette against that sky. Absolutely NO white fade, NO mist band, NO vignette, nothing dissolves into white.")
NIGHT = ("The text written on it is WHITE, so the area from 10% to 55% of the height is a REAL PAINTED EVENING SKY, deep blue "
         "to indigo, smooth, with no bright sunset glow, no lanterns or branches in that area; it descends continuously to "
         "the horizon behind the whole scene, and every tree and building keeps its complete silhouette against it.")
END = (" The subject sits in the lower 45% of the image and touches both side edges and the bottom. One single continuous "
       "painting from edge to edge: no frame, no border, no straight horizontal edge, no beam or roof across the top. "
       "Vertical 9:16 phone screen. No people unless stated, no faces. No text, no letters, no signs with writing, no watermark.")
J = {  # clé : (jour/nuit, sujet)
    '1': (DAY, "the bride and groom seen from behind, walking hand in hand along a path between rows of blooming lavender "
               "towards a honey-stone Provençal bastide with pale blue shutters, plane trees and cypresses around it"),
    '2': (DAY, "the bride and groom seen from behind, standing at the open door of a small Romanesque village church in "
               "honey-coloured stone with its bell gable, olive trees and lavender in pots on the little square"),
    '3': (NIGHT, "a long dinner table under great plane trees in the courtyard of the bastide, white tablecloth, candles, "
                 "string lights in the branches, guests seen from behind and from afar, warm windows behind"),
    '4': (NIGHT, "the bastide terrace at night after dinner: a stone balustrade with lit candle lanterns, a bench and lavender "
                 "in pots, the lavender fields and dark hills below under the evening sky"),
    'mairie': (DAY, "a small Provençal village town hall: honey-stone facade with a clock, a French flag, tall pale blue "
                    "shutters, plane trees and a fountain on the square, seen from the square"),
    'eglise': (DAY, "a small Romanesque village church in honey-coloured stone with its bell gable and open wooden door, "
                    "olive trees on the little square"),
    'salle': (NIGHT, "a large honey-stone bastide where the wedding party takes place, every window glowing warm, string "
                     "lights at the entrance, plane trees around"),
    'jardin': (DAY, "an outdoor ceremony in the bastide garden: a flowered arch of white roses and lavender at the end of an "
                    "aisle between rows of empty chairs, olive trees and cypresses around"),
    'plage': (DAY, "a ceremony by the Mediterranean in the calanques: a light draped arch on a pale rocky shore with pines, "
                   "turquoise water, a path of petals"),
    'fond': (DAY, "NO venue and NO subject: rolling lavender fields and a few olive trees along the bottom 20% only, the "
                  "rest is the calm summer sky"),
    'prog': (NIGHT, "the aperitif in the bastide courtyard at dusk: a stone table with glasses of rosé, a carafe, olives and "
                    "apricots in a bowl, lavender in pots, string lights in an olive tree on each side"),
    # première version : la robe sur un pan de mur collé à bords droits ; ici tout est dehors, d'un seul tenant
    'dress': (NIGHT, "the dress code, OUTDOORS in the lavender field in front of the bastide at dusk: a flowing pale silk "
                     "evening dress and a cream linen jacket hanging on a wooden clothes stand standing among the lavender, "
                     "a straw hat and a lavender bouquet on a small iron chair beside it, olive trees and the bastide behind; "
                     "no wall, no panel, no rectangle"),
    'info': (NIGHT, "arriving at the bastide at dusk: an old pale car parked on the gravel under the plane trees, a leather "
                    "suitcase, the lit front door and windows of the honey-stone bastide"),
    'liste': (NIGHT, "the wedding gift list, OUTDOORS on the bastide terrace at dusk: a round table with a linen tablecloth "
                     "holding gift boxes wrapped in kraft paper and lavender ribbon, candles, a jug of lavender, the open "
                     "evening sky above"),
}


def make(key):
    zone, subject = J[key]
    hd = lambda n: os.path.join(L.IMG, 'hd', n + '.webp')
    if key == '1':
        refs = [hd('dolcevitajour-1'), hd('dolcevitajour-2')]
        lead = ("The two reference images only show the painting technique and quality wanted (same medium, brushwork and "
                "finish), NOT the place. Paint a NEW scene in Provence, France. ")
    else:
        refs = [hd(K + '-1')] + ([hd('dolcevita-3')] if zone is NIGHT else [])
        lead = ("The first reference image is the opening scene of this illustrated wedding invitation: match its artistic "
                "medium, brushwork, palette and paper texture exactly. "
                + ("The second reference only shows how an evening light is painted in this series. " if zone is NIGHT else "")
                + "Paint a NEW scene of the same series. ")
    png = os.path.join(L.TMP, f'{K}-{key}.png')
    prompt = lead + STYLE + f" The scene: {subject}. " + zone + END
    if not L.gemini(png, prompt, refs): return key + ' : ÉCHEC génération'
    ink = (255, 255, 255) if zone is NIGHT else C.hex_rgb('#2f3a5a')
    r = C.analyse(png, ink); good = r['agitation'] <= C.AGIT_MAX and r['contrast'] >= C.CONTRAST_MIN
    L.save(png, K, key)
    if key.isdigit():  # vignette de la scène (carrousel, galerie, configurateur)
        Image.open(os.path.join(L.IMG, 'hd', f'{K}-{key}.webp')).resize((540, 954), Image.LANCZOS).save(
            os.path.join(L.IMG, 'themes', f'{K}-{key}.webp'), 'WEBP', quality=82, method=6)
    return f"{key} : {'ok' if good else 'À REVOIR'} (agitation {r['agitation']}, contraste {r['contrast']})"


if __name__ == '__main__':
    keys = sys.argv[1:] or [k for k in J if k != '1']
    with cf.ThreadPoolExecutor(8) as ex:
        for res in ex.map(make, keys): print(res, flush=True)
