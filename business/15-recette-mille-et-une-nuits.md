# 15 — Recette du lancement Mille et une nuits (5 octobre 2026)

Rejouable : `business/tools/recette/` (voir LISEZMOI). Site construit, Chromium, téléphones 390 × 844 et 360 × 740,
ordinateur 1280 × 900.

## Résultat : 231 cas, 0 échec (après corrections)

| Zone | Cas | Ce qui est vérifié | Résultat |
|---|---|---|---|
| Vitrine | 22 pages + liens internes | 11 pages à 390 et 1280 px : erreurs JavaScript, défilement horizontal, images et liens cassés, texte sous 11 px | OK |
| Configurateur | 48 | 3 occasions × 4 thèmes × 2 formats × 2 écrans : les 5 étapes, l'aperçu du bon format (le vrai moteur en grand tableau), un cadre de réglages pour chaque partie cochée, le nom de la liste selon l'occasion, le lien de commande (occasion, thème, format) | OK |
| Démos | 64 | les 32 démos à 390 et 360 px : ouverture, rien hors écran, réponse remplie jusqu'au « Merci » | OK |
| Moteur, accueil | 64 | 4 thèmes × mariage / sbouâ × date affichée / à gratter / roue / jackpot × 2 téléphones : le texte finit au-dessus du sujet de la scène | OK après correction |

## Corrigé pendant la recette

1. **Le texte de l'accueil passait sur le décor** (portail d'Émeraude, toits d'Andalou), surtout avec une date à
   découvrir : le sujet des scènes provisoires montait à 36–44 % de la hauteur au lieu de 55 %. Sans Gemini, le sujet a
   été descendu à 50 % en étirant seulement la bande de ciel ou de mur uni au-dessus de lui (`tools/descendre.py`,
   bas de l'image rogné de 2 à 14 %), sur 22 images (Andalou, Désert, Émeraude, mosquée du riad). Toutes repassent
   `check_images.py`. Images servies en `?v=8` / `IMGV 9`.
2. **La roue de la date** était trop grande (jusqu'à 240 px) : 200 px au plus, 52 % de la largeur.
3. **Prénoms sur deux lignes dans l'aperçu** (Andalou, police Amiri, téléphone de 284 px) : ils se réduisent pour tenir
   sur une ligne, comme sur un vrai téléphone.

## Reste à faire (attend le quota Gemini)

- **Mosquée du riad** (`nuits-mosquee`) : le minaret, fin et haut, monte encore jusqu'à 45 % et passe derrière les
  boutons de l'écran d'événement. À repeindre (minaret plus bas) ou à détourer en calque.
- **Calques des variantes** (Andalou, Désert, Émeraude) : tant qu'ils n'existent pas, la scène est posée plein cadre et
  ses côtés sont rognés sur les téléphones étroits (règle 10b). La descente du sujet est une solution d'attente.
- **Grand tableau des variantes** : illustration verticale et guirlandes propres (aujourd'hui la scène 1 et les
  guirlandes du riad), **thème Maghrébin**, **scènes du sbouâ** : `bash business/tools/theme-nuits.sh …`.
- **Bande de photos** : le couple envoie ses photos après la commande ; pas encore de dépôt dans le configurateur.
