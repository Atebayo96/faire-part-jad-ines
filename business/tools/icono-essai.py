"""Essai d'un nouveau style pour Mille et une nuits et l'Andalou (10 octobre 2026, 4 images accordées, ~0,60 €) :
« trop d'oranges ; on va changer le style pour Mille et une nuits et l'Andalou : des trucs simples, surtout de l'illustration
iconographique, pas trop de trucs ciblés ». Quelques formes nettes, une palette réduite, beaucoup d'espace, un ou deux
motifs (arche, lanterne, croissant, mains au henné), pas de foule ni de détail.
Pour chaque thème : les mains (l'accueil) d'abord, puis la mairie peinte d'après elle. Les images restent dans
/tmp/claude-0/icono/ : rien n'est publié avant que l'utilisateur valide le style.
Usage : python3 business/tools/icono-essai.py"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import lieux as L, check_images as C

OUT = '/tmp/claude-0/icono'; os.makedirs(OUT, exist_ok=True)
ICONO = ("STYLE: a simple ICONOGRAPHIC illustration for an elegant wedding invitation, like a fine flat gouache print: a few "
         "clean shapes, a limited palette of three or four colours, generous empty space, soft paper grain. One single motif, "
         "at most two small decorative elements. No crowd, no small details, no clutter, no fruit, no busy foliage. Never "
         "photorealistic, never a detailed painting. Vertical 9:16 phone screen, one continuous image from edge to edge, no "
         "frame, no border. No text, no letters, no watermark.")
NIGHT = ("Palette: deep night blue, warm gold, terracotta and cream. WHITE text is written in the upper part, so the area from "
         "10% to 55% of the height is a plain, calm, DARK night blue (a thin gold crescent moon at most). The motif sits in "
         "the lower 45% and touches the bottom.")
DAY_RIAD = ("Palette: soft sky blue, sand, terracotta and warm gold, in daylight. DARK text is written in the upper part, so "
            "the area from 10% to 55% of the height is a plain, calm, PALE sky (no clouds or one soft cloud). The motif sits "
            "in the lower 45% and touches the bottom.")
DAY_AND = ("Palette: ivory, terracotta, sage green and soft gold, in daylight. DARK text is written in the upper part, so the "
           "area from 10% to 55% of the height is a plain, calm, LIGHT ivory or pale sky. The motif sits in the lower 45% "
           "and touches the bottom.")
JOBS = [
    ('nuits-mains', None, NIGHT, "Two hands joined, one with fine henna, two gold wedding rings, beside a single glowing "
        "brass lantern, drawn as an elegant flat icon"),
    ('nuits-mairie-jour', 'nuits-mains', DAY_RIAD, "A simple iconic town hall: a symmetrical facade with a clock and a small "
        "French flag, framed by two slender palm silhouettes, drawn as an elegant flat icon, in the same style as the "
        "reference but in daylight"),
    ('alhambra-mains', None, DAY_AND, "Two hands joined with gold wedding rings, framed by the outline of a single carved "
        "Andalusian horseshoe arch, a sprig of jasmine, drawn as an elegant flat icon"),
    ('alhambra-mairie', 'alhambra-mains', DAY_AND, "A simple iconic town hall: a symmetrical facade with a clock and a small "
        "French flag, framed by one carved Andalusian arch and two cypress silhouettes, drawn as an elegant flat icon, in the "
        "same style as the reference"),
]

if __name__ == '__main__':
    for key, ref, zone, subject in JOBS:
        png = os.path.join(OUT, key + '.png')
        if os.path.exists(png): print(key, ': déjà générée'); continue
        refs = [os.path.join(OUT, ref + '.png')] if ref else []
        intro = "The reference image is from the same wedding invitation: match its style exactly. " if ref else ""
        if not L.gemini(png, intro + subject + ". " + ICONO + " " + zone, refs): print(key, ': ÉCHEC'); continue
        r = C.analyse(png, (255, 255, 255) if zone == NIGHT else (74, 38, 22))
        print(key, ':', r)
