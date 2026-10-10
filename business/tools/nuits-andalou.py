"""Mille et une nuits (riad de nuit, texte blanc) et l'Andalou (palais de jour, texte foncé) repeints selon les règles de
Dolce Vita et Douce France (10 octobre 2026, 38 images accordées, ~5,70 € : « tu l'as archi mal fait, il respecte pas les
règles qu'on a faites pour Dolce Vita, c'est mal coupé »). L'Andalou était en vignettes sur papier crème, coupées droit.

Par thème, 19 images, une génération chacune, composées pour le plein écran (cover, sujet dans les 80 % du milieu, ciel ou
mur qui descend derrière toute la scène, rien qui s'arrête sur une ligne droite, invités de dos) :
  1 2 3 4                                  les scènes du thème (la 1 fixe le style : peinte d'abord, puis référence des autres)
  mains verres fond                        l'accueil (gros plan), la réponse, l'écran « texte seul »
  mairie eglise mosquee salle jardin plage les lieux d'un événement (« le thème n'est qu'un style » : une mairie reste une mairie)
  fete cocktail sortie                     les décors en plus d'un événement
  prog dress info                          programme, dress code, infos

Usage : python3 business/tools/nuits-andalou.py [--phase 1|2] [clé ...]   (clé = <thème>-<image>)
Sortie : img/hd/<thème>-<clé>.webp (1080 x 1909), img/lieux/ (540 x 954), et img/themes/ pour les scènes 1 à 4.
Une image qui échoue au contrôle est signalée, pas refaite (aucune génération sans accord chiffré, CLAUDE.md 32f)."""
import os, sys, concurrent.futures as cf
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import lieux as L, check_images as C

WHOLE = ("One single continuous painting from edge to edge: the sky or the wall continues down BEHIND the whole scene to the "
         "horizon; every tree, roof, dome and arch is painted WHOLE, never cut by a straight line. No blank paper, no cream "
         "void, no flat band of colour, no vignette, no frame, no border.")
NIGHT = ("WHITE text is written in the upper part, so the area from 10% to 50% of the height is a REAL PAINTED NIGHT SKY, "
         "deep blue to indigo, smooth and dark (a thin crescent moon or a few faint stars at most), that continues down behind "
         "the buildings and trees. Palm crowns and towers stay below 50% of the height.")
DAY = ("DARK text is written in the upper part, so the area from 10% to 50% of the height is a REAL PAINTED SKY, soft and "
       "pale (pale blue to warm ivory, a few light delicate clouds), light enough for dark text, that continues down behind "
       "the arcades, towers and cypress trees. Towers and cypresses stay below 50% of the height.")
FOCUS_N = ("This is a CLOSE-UP. The upper part of the image, from the top down to 55% of the height, is the softly blurred "
           "background of the place at night (deep blue to indigo, a few very soft distant lantern lights at most), DARK and "
           "CALM, because WHITE text is written there.")
FOCUS_D = ("This is a CLOSE-UP. The upper part of the image, from the top down to 55% of the height, is the softly blurred "
           "background of the place in daylight (pale sky and soft out-of-focus colours), LIGHT and CALM, because DARK text "
           "is written there.")
PEOPLE = ("The guests are shown only from behind or as small distant silhouettes: no face is visible, nobody looks at the "
          "viewer. It stays symbolic and elegant, never a crowded stock photo.")
HANDS = "Only hands are visible (no face, no body beyond the wrists and sleeves)."
STYLE_ONLY = ("The theme is only a painting style: the place itself is an ordinary real wedding venue, painted in the style, "
              "palette and light of the references.")
# l'Andalou : ses anciennes images sont des vignettes posées sur du papier crème ; on ne garde que la touche et les couleurs
VIGNETTE = ("IMPORTANT: some reference images are small vignettes on blank cream paper. DO NOT copy that layout: keep only "
            "their brushwork, palette and Andalusian architecture, and paint a complete scene that fills the whole frame.")

N1, A1 = ('nuits', 'nuits-1@new', 'nuits-3', 'nuits-mosquee'), ('alhambra', 'alhambra-1@new', 'alhambra-3', 'alhambra-mosquee')
J = {
    # ---------- Mille et une nuits : un riad, la nuit, texte blanc ----------
    'nuits-1': (('nuits', 'nuits-1', 'nuits-3', 'nuits-mosquee'), NIGHT, PEOPLE + " The bride and groom seen from behind "
        "climbing the lantern-lit steps to the carved arched door of a riad at night, bougainvillea and jasmine on the walls, "
        "two palm trees, a crescent moon"),
    'nuits-2': (N1, FOCUS_N, HANDS + " The henna night, seen from above: a bride's two hands painted with fine henna "
        "patterns, resting on a brass tray with henna cones, rose petals and two small glasses of mint tea, on a zellige "
        "floor, warm lanterns around, in the lower part of the image"),
    'nuits-3': (N1, NIGHT, PEOPLE + " The ceremony in the courtyard of the riad at night: the bride and groom seen from behind "
        "under a carved horseshoe arch, guests seated in rows seen from behind, a fountain, orange trees in pots, lanterns"),
    'nuits-4': (N1, NIGHT, PEOPLE + " The party in a great caidal tent at night: warm light inside, guests dancing seen from "
        "behind as silhouettes, rugs and lanterns, a few sky lanterns rising far away in the dark sky"),
    'nuits-mains': (N1, FOCUS_N, HANDS + " The joined hands of the bride and groom with their wedding rings, her hand with "
        "delicate henna, resting on embroidered velvet beside a small plate of dates and a glowing brass lantern, in the "
        "lower part of the image"),
    'nuits-verres': (N1, FOCUS_N, HANDS + " Two hands raising two gold-rimmed glasses of mint tea that touch in a toast, in "
        "the lower part of the image, the blurred lanterns of a riad courtyard at night behind"),
    'nuits-fond': (N1, NIGHT, "The 'text only' screen of the invitation: almost the whole image is a calm painted night sky, "
        "deep blue to indigo, a thin crescent moon and a few faint stars. Only the lower 30% shows, painted whole and touching "
        "the bottom: the rooftops and a small minaret of an old medina, two palm trees and a few warm lanterns. No people"),
    'nuits-mairie': (N1, NIGHT, PEOPLE + " " + STYLE_ONLY + " A classic French town hall (mairie) on the wedding evening: its "
        "stone facade with a clock and a flag, every window glowing warm, guests in suits and caftans seen from behind on the "
        "front steps, a few lanterns"),
    'nuits-eglise': (N1, NIGHT, PEOPLE + " " + STYLE_ONLY + " A classic stone church with its bell tower at dusk, its wooden "
        "door open and lit, guests seen from behind gathering on the square before the ceremony"),
    'nuits-mosquee': (N1, NIGHT, PEOPLE + " A graceful mosque with its square minaret and carved horseshoe doorway at night, "
        "seen from its courtyard with a fountain and orange trees, a few guests seen from behind walking towards the door"),
    'nuits-salle': (N1, NIGHT, PEOPLE + " " + STYLE_ONLY + " An elegant wedding reception venue at night: a large lit hall "
        "opening on a courtyard, lanterns at the entrance, guests seen from behind arriving, every window glowing"),
    'nuits-jardin': (N1, NIGHT, PEOPLE + " A garden ceremony at dusk: an arch of white flowers at the end of an aisle between "
        "rows of chairs with guests seen from behind, orange trees and palm trees, lanterns along the aisle"),
    'nuits-plage': (N1, NIGHT, PEOPLE + " A seaside ceremony at dusk: a light draped arch on the sand facing the sea, a path "
        "of rose petals lined with lanterns, a few guests seen from behind"),
    'nuits-fete': (N1, NIGHT, PEOPLE + " The evening party in the courtyard of the riad: strings of warm lanterns, couples "
        "dancing seen from behind as silhouettes, musicians in the corner, a fountain, palm trees"),
    'nuits-cocktail': (N1, NIGHT, PEOPLE + " The reception on a riad terrace at dusk: low tables with mint tea, pastries and "
        "dates, guests chatting seen from behind, lanterns, the rooftops of the medina beyond"),
    'nuits-sortie': (N1, NIGHT, PEOPLE + " Leaving the ceremony: the bride and groom seen from behind walking out of a carved "
        "arched door under a shower of rose petals thrown by the guests on each side, lanterns on the path"),
    'nuits-prog': (N1, NIGHT, "A calm view of a riad rooftop terrace at night, set with low cushions, brass lanterns and a "
        "tea tray, the domes and minarets of the medina beyond. No people"),
    'nuits-dress': (N1, NIGHT, "An embroidered caftan in deep green and gold displayed on a stand beside a carved wooden "
        "door, a pair of embroidered slippers and a lantern on the zellige floor, in a riad at night. No people"),
    'nuits-info': (N1, NIGHT, "The way to the wedding: an old medina gate (bab) at night lit by lanterns, a palm-lined road "
        "leading to it and a vintage car waiting. No people"),
    # ---------- l'Andalou : un palais andalou, de jour, texte foncé ----------
    'alhambra-1': (('alhambra', 'alhambra-1', 'alhambra-3', 'alhambra-mosquee'), DAY, VIGNETTE + " " + PEOPLE + " The bride "
        "and groom seen from behind walking along the long reflecting pool of an Andalusian palace courtyard, carved arcades "
        "on each side, myrtle hedges and orange trees, a slender tower beyond"),
    'alhambra-2': (A1, DAY, VIGNETTE + " " + PEOPLE + " The ceremony in the courtyard of orange trees of the palace: the "
        "couple seen from behind under a carved arch, guests seated in rows seen from behind, a marble fountain"),
    'alhambra-3': (A1, DAY, VIGNETTE + " " + PEOPLE + " The dinner under the arcades in the golden afternoon light: a long "
        "table with white cloths, candles and oranges along the pool, guests seen from behind taking their seats"),
    'alhambra-4': (A1, DAY, VIGNETTE + " The gardens of the palace: water jets along a long canal, flower beds, clipped "
        "hedges and cypress trees, a white pavilion at the end. No people"),
    'alhambra-mains': (A1, FOCUS_D, VIGNETTE + " " + HANDS + " The joined hands of the bride and groom with their wedding "
        "rings, resting on a carved marble ledge with orange blossoms, in the lower part of the image, the courtyard softly "
        "blurred behind"),
    'alhambra-verres': (A1, FOCUS_D, VIGNETTE + " " + HANDS + " Two hands raising two glasses of orange-blossom lemonade "
        "that touch in a toast, in the lower part of the image, the arcades and orange trees softly blurred behind"),
    'alhambra-fond': (A1, DAY, VIGNETTE + " The 'text only' screen of the invitation: almost the whole image is a calm pale "
        "sky. Only the lower 30% shows, painted whole and touching the bottom: the towers and walls of the palace on its hill, "
        "cypress trees and orange trees. No people"),
    'alhambra-mairie': (A1, DAY, VIGNETTE + " " + PEOPLE + " " + STYLE_ONLY + " A classic French town hall (mairie) on the "
        "wedding day: its stone facade with a clock and a flag, guests seen from behind on the front steps, orange trees in pots"),
    'alhambra-eglise': (A1, DAY, VIGNETTE + " " + PEOPLE + " " + STYLE_ONLY + " A classic stone church with its bell tower in "
        "sunlight, its wooden door open, guests seen from behind gathering on the square before the ceremony"),
    'alhambra-mosquee': (A1, DAY, VIGNETTE + " " + PEOPLE + " A graceful Andalusian mosque with its square minaret and carved "
        "horseshoe doorway, seen from its courtyard with a fountain and orange trees, a few guests seen from behind"),
    'alhambra-salle': (A1, DAY, VIGNETTE + " " + PEOPLE + " " + STYLE_ONLY + " An elegant wedding reception venue with arcades "
        "around a courtyard, tables with white cloths, guests seen from behind arriving"),
    'alhambra-jardin': (A1, DAY, VIGNETTE + " " + PEOPLE + " A garden ceremony: an arch of white flowers at the end of an aisle "
        "between rows of chairs with guests seen from behind, cypress and orange trees"),
    'alhambra-plage': (A1, DAY, VIGNETTE + " " + PEOPLE + " A seaside ceremony on the Andalusian coast: a light draped arch on "
        "the sand facing the sea, a path of petals, a few guests seen from behind, white village on the cliff far away"),
    'alhambra-fete': (A1, NIGHT, VIGNETTE + " " + PEOPLE + " The evening party in the palace courtyard at night: lanterns along "
        "the arcades and the pool, couples dancing seen from behind as warm silhouettes"),
    'alhambra-cocktail': (A1, DAY, VIGNETTE + " " + PEOPLE + " The reception under the arcades: a table with orange-blossom "
        "lemonade, mint tea and pastries, guests chatting seen from behind, orange trees"),
    'alhambra-sortie': (A1, DAY, VIGNETTE + " " + PEOPLE + " Leaving the ceremony: the bride and groom seen from behind walking "
        "out through a carved arch under a shower of rose petals thrown by the guests on each side"),
    'alhambra-prog': (A1, DAY, VIGNETTE + " A calm view of the palace terrace looking over the gardens and the city below, a "
        "table set with white cloth and oranges, cypresses. No people"),
    'alhambra-dress': (A1, DAY, VIGNETTE + " A silk shawl with fringes and a painted fan laid on a carved stone bench in the "
        "courtyard, roses and orange blossoms beside, arcades behind. No people"),
    'alhambra-info': (A1, DAY, VIGNETTE + " The way to the wedding: a cypress-lined path climbing to the palace gate, a vintage "
        "car waiting at the foot of the hill. No people"),
}
ANCHORS = ['nuits-1', 'alhambra-1']
NIGHTZ = (NIGHT, FOCUS_N)
SRC = '/tmp/claude-0/nuits-andalou'


def ref(name):
    # « nuits-1@new » : la nouvelle scène 1 (peinte en phase 1), sinon l'image actuelle (sauvegardée avant la génération)
    if name.endswith('@new'): return os.path.join(L.IMG, 'hd', name[:-4] + '.webp')
    old = os.path.join(SRC, 'avant', name + '.webp'); return old if os.path.exists(old) else os.path.join(L.IMG, 'hd', name + '.webp')


def make(key):
    (th, *refs), zone, subject = J[key]
    t = L.T[th]; ink = (255, 255, 255) if zone in NIGHTZ else C.hex_rgb(t['color'])
    png = os.path.join(SRC, key + '.png')
    if os.path.exists(png): return key + ' : déjà générée'
    prompt = ("The reference images are scenes from the same illustrated wedding invitation theme. "
              f"Paint a NEW scene of the same series. {subject}. "
              "Match the references: same artistic medium and brushwork, same colour palette, same light. "
              "Vertical 9:16 phone screen. " + WHOLE + " " + zone + " The subject sits in the lower 45% of the image and "
              "touches the bottom. It will be shown on a taller phone and cropped by about 10% on EACH side: keep everything "
              "important within the central 80% of the width; the outer 10% on each side only shows the scenery continuing. "
              "No text, no letters, no signs with writing, no watermark.")
    if not L.gemini(png, prompt, [ref(r) for r in refs]): return key + ' : ÉCHEC génération'
    r = C.analyse(png, ink); good = r['agitation'] <= C.AGIT_MAX and r['contrast'] >= C.CONTRAST_MIN
    k = key.split('-', 1)[1]; L.save(png, th, k)
    if k in '1234': Image.open(os.path.join(L.IMG, 'lieux', f'{th}-{k}.webp')).save(os.path.join(L.IMG, 'themes', f'{th}-{k}.webp'), 'WEBP', quality=82, method=6)
    return f"{key} : {'ok' if good else 'À REVOIR'} (agitation {r['agitation']}, contraste {r['contrast']})"


if __name__ == '__main__':
    a = sys.argv[1:]; phase = None
    if '--phase' in a: i = a.index('--phase'); phase = a[i + 1]; del a[i:i + 2]
    os.makedirs(os.path.join(SRC, 'avant'), exist_ok=True)
    for k in J:   # sauvegarde des images actuelles (références de style, et retour en arrière possible)
        src, dst = os.path.join(L.IMG, 'hd', k + '.webp'), os.path.join(SRC, 'avant', k + '.webp')
        if os.path.exists(src) and not os.path.exists(dst): Image.open(src).save(dst)
    keys = a or (ANCHORS if phase == '1' else [k for k in J if k not in ANCHORS])
    with cf.ThreadPoolExecutor(6) as ex:
        for res in ex.map(make, keys): print(res, flush=True)
