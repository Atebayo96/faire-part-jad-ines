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
    # Douce France : jour en texte foncé, soir en texte blanc (la fête et les verres sont dans darkLieux)
    'doucefrance-fete': (FN, NIGHT, PEOPLE + " The village ball under the plane trees at night: strings of guinguette bulbs "
        "and paper lanterns, couples dancing on the little square seen from behind as warm silhouettes, the lit stone bastide "
        "behind"),
    'doucefrance-cocktail': (F, DAY, PEOPLE + " The vin d'honneur in the afternoon: a long table under an old olive tree "
        "with rosé, baskets of lavender and fougasse, guests standing and chatting seen from behind, the lavender fields beyond"),
    'doucefrance-sortie': (F, DAY, PEOPLE + " Leaving the village church: the bride and groom seen from behind walking out "
        "of the stone church under the bell tower, guests on each side throwing lavender in the air"),
    'doucefrance-mains': (F, FOCUS_D, HANDS + " The joined hands of the bride and groom with their wedding rings, resting on "
        "a bouquet of lavender and olive branches on raw linen, in the lower part of the image"),
    'doucefrance-verres': (FN, FOCUS_N, HANDS + " Two hands raising two glasses of rosé that touch in a toast, in the lower "
        "part of the image, a blurred lavender field and the warm lights of the bastide at dusk behind"),
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
    t = L.T[th]; night = zone in (NIGHT, FOCUS_N); ink = (255, 255, 255) if night else C.hex_rgb(t['color'])
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
