"""Scènes de fête et gros plans symboliques des thèmes du configurateur (6 octobre 2026, 15 images accordées par
l'utilisateur, une génération par image : « il manque des scènes de fête où il y a du monde, ou des focus, comme les
mains qui s'enlacent » ; « ça doit rester symbolique : les gens de dos, ou des symboles, une main, des verres qui trinquent »).

  fete     : la soirée dansante         -> décor « Soirée » d'un événement
  cocktail : le cocktail / vin d'honneur -> décor « Cocktail »
  sortie   : la sortie de la cérémonie  -> décor « Sortie de cérémonie »
  mains    : gros plan, les mains et les alliances -> écran du mot des familles
  verres   : gros plan, deux verres qui trinquent  -> écran de la réponse

Une seule génération par image, au format 9:16, composée pour être affichée en plein écran (cover) sur un téléphone
plus allongé : le sujet reste dans les 80 % du milieu, les bords ne portent que du décor qui continue (on y perd ~9 %
de chaque côté), et le ciel descend jusqu'au sujet. Pas de prolongement, pas de retouche automatique : une image qui
échoue au contrôle est signalée, pas refaite (aucune génération sans accord chiffré, CLAUDE.md 32f).
Usage : python3 business/tools/scenes-fete.py [thème-clé ...]
Sortie : img/hd/<thème>-<clé>.webp (1080 x 1909) et img/lieux/<thème>-<clé>.webp (540 x 954)."""
import os, sys, concurrent.futures as cf
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import lieux as L, check_images as C

NIGHT = ("The text written on it is WHITE, so the area from 10% to 55% of the height must be DARK and CALM: a deep dusk or "
         "night sky (deep blue to indigo), smooth, with no bright clouds, no sunset glow, no lanterns or branches in that area.")
DAY = ("The text written on it is DARK, so the area from 10% to 55% of the height is a REAL PAINTED SKY like in the "
       "references: soft pale sky with a few light, delicate clouds, light enough for dark text. Trees, roofs and flowers "
       "keep their complete silhouettes and rise naturally into that sky. No white fade, no mist band, no vignette.")
# gros plan : le haut de l'image est le fond flou de la scène, calme ; l'objet est grand, dans le bas
FOCUS_N = ("This is a CLOSE-UP. The upper part of the image, from the top down to 55% of the height, is the softly blurred "
           "background of the scene at night (deep blue to indigo, a few very soft distant lights at most), DARK and CALM, "
           "because WHITE text is written there.")
FOCUS_D = ("This is a CLOSE-UP. The upper part of the image, from the top down to 55% of the height, is the softly blurred "
           "background of the scene in daylight (pale sky and soft out-of-focus colours of the place), LIGHT and CALM, "
           "because DARK text is written there.")
PEOPLE = ("The guests are shown only from behind or as small distant silhouettes: no face is visible, nobody looks at the "
          "viewer. It stays symbolic and elegant, never a crowded stock photo.")
HANDS = "Only hands are visible (no face, no body beyond the wrists and sleeves)."

# 6 octobre 2026 : « ces champs comme ça n'existent pas, faut pas trop abuser » ; « l'église, le domaine, c'est vide, il
# n'y a pas de monde » ; « regarde ce qui se fait dans les mariages pour que ça ait l'air normal, une église classique,
# un domaine classique ». Et les platanes coupés net sous un aplat de ciel venaient de la consigne NIGHT (zone vide
# imposée) : pour la nuit, un vrai ciel qui descend derrière des arbres entiers.
REAL = ("It must look like a real, ordinary French wedding as people actually have them, not a cliché: no endless rows of "
        "lavender, no flower overload, no fairy-tale exaggeration. Lavender, if any, only as a small border or a few pots.")
NIGHT_TREES = ("WHITE text is written in the upper part, so the area from 10% to 50% of the height is a REAL PAINTED NIGHT SKY, "
               "deep blue to indigo, smooth and dark, that continues down behind the trees and buildings to the horizon. "
               "Every tree is painted WHOLE: its complete rounded crown rises into the sky, never cut by a straight line, "
               "and stays below 50% of the height. No flat band, no straight horizontal edge anywhere.")
D, F, O = ('dolcevita', 1, 3, 4), ('doucefrance', 1, 2, 3), ('oldmoney', 1, 2, 3)
DN, FN, ON = ('dolcevita', 3, 4, 2), ('doucefrance', 3, 4, 1), ('oldmoney', 3, 4, 1)
JOBS = {
    # Dolce Vita : le thème du soir, tout en texte blanc
    'dolcevita-fete': (DN, NIGHT, PEOPLE + " The evening party on the terrace above the sea: strings of warm festoon lights "
        "between the lemon trees, a few couples dancing seen from behind as warm silhouettes, a small band in the corner, the "
        "lights of the coastal village and the dark sea beyond"),
    'dolcevita-cocktail': (DN, NIGHT, PEOPLE + " The aperitivo at dusk on a terrace with bougainvillea: guests seen from "
        "behind, glasses of spritz in hand, chatting by a marble bar with a bowl of lemons, the sea and the village lights below"),
    'dolcevita-sortie': (DN, NIGHT, PEOPLE + " Leaving the little white chapel at dusk: the bride and groom seen from behind "
        "walking down the steps, guests on each side throwing bougainvillea petals in the air, lanterns lit along the path"),
    'dolcevita-mains': (DN, FOCUS_N, HANDS + " The joined hands of the bride and groom with their wedding rings, resting on a "
        "white linen tablecloth beside a lemon and a sprig of bougainvillea, a candle glowing, in the lower part of the image"),
    'dolcevita-verres': (DN, FOCUS_N, HANDS + " Two hands raising two glasses of spritz that touch in a toast, in the lower "
        "part of the image, the blurred lights of the coastal village and the sea at night behind"),
    # version de jour du premier écran de Dolce Vita (« faut refaire l'image le jour, c'est mieux ») : un mariage qui
    # commence avant 18 h s'ouvre sur elle (J.home, dayKey dans invite.js et vitrine.js)
    'dolcevitajour-mains': (('dolcevitajour', 1, 2, 3), FOCUS_D, HANDS + " A close-up still life in full daylight: the "
        "joined hands of the bride and groom with their wedding rings (her lace cuff, his cream linen cuff), resting on a "
        "white linen tablecloth beside a lemon and a sprig of bougainvillea, in the lower part of the image; behind, softly "
        "blurred, the turquoise sea, the coast and a pale sky with light clouds"),
    # Douce France : jour en texte foncé, soir en texte blanc (la fête et les verres sont dans darkLieux)
    'doucefrance-fete': (FN, NIGHT_TREES, PEOPLE + " " + REAL + " The evening party on the gravel square of the village, "
        "under two or three big plane trees painted whole: strings of warm bulbs and a few paper lanterns between them, "
        "couples dancing seen from behind as warm silhouettes, round tables with white cloths on the side, the lit stone "
        "bastide behind"),
    'doucefrance-cocktail': (F, DAY, PEOPLE + " The vin d'honneur in the afternoon: a long table under an old olive tree "
        "with rosé, baskets of lavender and fougasse, guests standing and chatting seen from behind, the lavender fields beyond"),
    'doucefrance-sortie': (F, DAY, PEOPLE + " Leaving the village church: the bride and groom seen from behind walking out "
        "of the stone church under the bell tower, guests on each side throwing lavender in the air"),
    # première version : un buste flou et coupé au-dessus des mains (« pourquoi t'as coupé ? autant en faire une plus
    # symbolique ») ; seulement les mains, vues de près, sur une table de pierre
    'doucefrance-mains': (F, FOCUS_D, HANDS + " A close-up still life: only the two joined hands of the bride and groom with "
        "their wedding rings (her lace cuff, his linen cuff, nothing above the wrists), resting on a bouquet of lavender and "
        "olive branches laid on raw linen on an old stone table, in the lower part of the image. No torso, no dress, no "
        "body, no person in the background: behind the table only the softly blurred lavender fields and the pale sky"),
    'doucefrance-verres': (FN, FOCUS_N, HANDS + " " + REAL + " Two hands raising two glasses of rosé that touch in a toast, in "
        "the lower part of the image, above the stone balustrade of the bastide terrace in the evening: a blurred olive tree, "
        "warm string lights and the lit windows of the house behind. No lavender field"),
    # lieux repeints (règle 21 : décors d'un événement), avec du monde
    'doucefrance-eglise': (F, DAY, PEOPLE + " " + REAL + " A classic village church in Provence on the wedding day: the "
        "Romanesque honey-stone church with its bell gable and open wooden door, the little square in front with plane "
        "trees, guests in suits and summer dresses seen from behind gathering on the steps and the square before the "
        "ceremony, a few white flowers by the door"),
    'doucefrance-salle': (FN, NIGHT_TREES, PEOPLE + " " + REAL + " A classic wedding estate in Provence in the evening: a "
        "honey-stone bastide with its gravel courtyard, cypress trees and one old olive tree, long tables with white cloths "
        "and candles under strings of warm lights, guests seen from behind arriving and chatting with a glass in hand, "
        "every window glowing. At most a few pots of lavender"),
    # Old money : jour en texte foncé, soir en texte blanc
    'oldmoney-fete': (ON, NIGHT, PEOPLE + " The evening ball under the large white marquee lit from inside, crystal "
        "chandeliers, couples in evening dress dancing seen from behind, the dark manor in the night behind"),
    'oldmoney-cocktail': (O, DAY, PEOPLE + " The garden party on the manor lawn: guests in elegant summer dress and hats seen "
        "from behind, a waiter with a tray of champagne coupes, rose bushes, the manor in the distance"),
    'oldmoney-sortie': (O, DAY, PEOPLE + " Leaving the chapel in the park: the bride and groom seen from behind under a "
        "shower of white rose petals thrown by the guests on each side, a vintage car waiting in front of the chapel"),
    'oldmoney-mains': (O, FOCUS_D, HANDS + " The joined hands of the bride and groom with a signet ring and their wedding "
        "rings, white satin and white roses, in the lower part of the image, on a softly blurred English green background"),
    'oldmoney-verres': (ON, FOCUS_N, HANDS + " Two hands raising two crystal champagne coupes that touch in a toast, in the "
        "lower part of the image, the softly lit manor blurred in the night behind"),
}


def make(key):
    (th, *refs), zone, subject = JOBS[key]
    t = L.T[th]; night = zone in (NIGHT, FOCUS_N, NIGHT_TREES); ink = (255, 255, 255) if night or zone == NIGHT_TREES else C.hex_rgb(t['color'])
    png = os.path.join(L.TMP, key + '.png')
    if os.path.exists(png): return key + ' : déjà générée (' + png + ')'
    prompt = ("The three reference images are scenes from the same illustrated wedding invitation theme. "
              f"Paint a NEW scene of the same series. {subject}. "
              "Match the references exactly: same artistic medium and brushwork, same colour palette, same light. "
              "Vertical 9:16 phone screen, one single continuous painting from edge to edge, no frame, no border, no vignette. "
              + zone + " The subject sits in the lower 45% of the image and touches the bottom. It will be shown on a "
              "taller phone and cropped by about 10% on EACH side: keep everything important (people, hands, glasses, "
              "buildings) within the central 80% of the width; the outer 10% on each side only shows the scenery continuing. "
              "No text, no letters, no signs with writing, no watermark.")
    if not L.gemini(png, prompt, [os.path.join(L.IMG, 'hd', f'{th}-{n}.webp') for n in refs]): return key + ' : ÉCHEC génération'
    r = C.analyse(png, ink); good = r['agitation'] <= C.AGIT_MAX and r['contrast'] >= C.CONTRAST_MIN
    th2, k = key.rsplit('-', 1); L.save(png, th2, k)
    return f"{key} : {'ok' if good else 'À REVOIR'} (agitation {r['agitation']}, contraste {r['contrast']})"


if __name__ == '__main__':
    keys = sys.argv[1:] or list(JOBS)
    with cf.ThreadPoolExecutor(8) as ex:
        for res in ex.map(make, keys): print(res, flush=True)
