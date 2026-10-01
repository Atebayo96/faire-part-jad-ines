# 13 — Audit de lisibilité et de qualité visuelle

_1er octobre 2026. À partir des remarques de l'utilisateur sur cinq écrans (Save the date Art déco, étapes de la vitrine,
sceau de l'accueil, accueil Conte de fées, liste de mariage Aquarelle). Les règles qui en sortent sont dans
[`../CLAUDE.md`](../CLAUDE.md) pour qu'elles s'appliquent à chaque session._

## Les cinq remarques, et le pattern derrière chacune

| Remarque | Écran montré | Ce que c'est vraiment | Où ça se reproduit |
|---|---|---|---|
| « Save the date n'est pas lisible » | Aperçu Art déco (vitrine) | Un chapeau de **10 px**, en or sur noir, posé **sur l'ornement** du haut de l'image. Trois causes : taille, contraste, superposition à un motif. | Tous les chapeaux (`.ey`) : 11 px dans le moteur, 10 px dans l'aperçu, 10 px dans le configurateur. |
| « Garder assez d'espace pour le texte dans chaque image » | Même écran | Les images ont été générées pour être belles, pas pour recevoir du texte. Aucune règle ne réservait une zone calme. | **32 images sur 48** échouent au contrôle (zone chargée ou contraste < 3 sur le pire quart). Voir le tableau plus bas. |
| « Les images ne sont pas vraiment ouf, idéalement de vraies photos ou du Gemini en look natif » | Étapes de la vitrine (`img/people/`) | Style « peinture » appliqué à des gens : visages flous, lumière de tableau, rendu artificiel. Ce style marche pour les décors de scènes, pas pour montrer des humains. | Les 6 images de `img/people/` (étapes et témoignages). |
| « Je ne sais pas pourquoi tu fais ce sceau comme ça » | Accueil Conte de fées | Le sceau de l'accueil est un **disque plat en CSS** (dégradé radial, lettres blanches) alors que l'enveloppe a un vrai sceau de cire aux initiales gravées. Deux rendus pour la même signature. | `.seal` du moteur et `.cp-seal` du configurateur. |
| « Le texte est trop petit, il faut aérer » | Accueil Conte, liste Aquarelle, et « ailleurs » | Une échelle serrée (9 à 11 px pour les mentions, 15 à 16 px pour le texte courant) et des marges de 2 à 12 px entre les lignes. Le bloc de texte est tassé dans le quart haut de l'écran. | Tout le moteur (13 faire-part), l'aperçu de la vitrine, le configurateur : trois copies de la même échelle, qui avaient dérivé. |

## Les patterns, en prenant du recul

1. **On n'avait pas de règle de contraste mesurée.** Le texte blanc avec une ombre portée était considéré comme
   « lisible ». Sur un ciel pastel (Conte de fées, Dolce Vita, À l'américaine, Pop), le rapport de contraste est
   entre **1,1 et 1,9** sur le pire quart de la zone, loin des 4,5 attendus. L'ombre portée ne compense pas.
2. **L'image dictait au texte, au lieu de l'inverse.** Les scènes ont été générées sans zone réservée ; ensuite le
   texte a été réduit et tassé pour « laisser voir l'image ». La bonne règle est l'inverse : l'image réserve la
   bande du haut (10 % à 55 %) calme et contrastée, et le texte garde sa taille.
3. **Un voile avait été retiré sans remplacement.** Le commit « sans voile sombre » a retiré le voile plein écran
   (à juste titre : il éteignait l'image), mais rien ne garantissait plus la lecture. La réponse est un **halo local**
   derrière le bloc de texte, pas un voile.
4. **Trois copies de la même échelle typographique.** Moteur, aperçu de la vitrine, configurateur : chacun avec ses
   tailles, toutes trop petites et différentes entre elles. L'aperçu ne montrait pas le vrai rendu.
5. **Un style unique appliqué à tout.** Le style peint convient aux décors ; appliqué aux personnes, il fait
   artificiel. Il faut deux registres : peinture pour les scènes, photo pour les humains.
6. **Deux rendus de la signature.** Le sceau de cire de l'enveloppe est le geste de la marque ; l'accueil le
   remplaçait par un badge plat.

## Ce qui a été corrigé dans ce commit

- **Échelle de lecture unique** (`invite.css`, variables `--fs-*` et `--sp-*`), reprise à l'identique dans l'aperçu
  et le configurateur de la vitrine :

  | Élément | Avant | Après |
  |---|---|---|
  | Chapeau (`.ey`) | 11 px (10 px dans l'aperçu) | 13 px |
  | Texte courant (`.tx`) | 16 à 20 px, interligne 1,4 | 18 à 22 px, interligne 1,45 |
  | Horaire (`.when`) | 15 à 18 px | 17 à 20 px |
  | Date entre filets (`.dl`) | 17 px | 19 px |
  | Boutons (`.b`) | 11 px, 9 × 14 px de marge | 12,5 px, 12 × 18 px |
  | Jours/heures du compte à rebours | 9 px (8 px dans l'aperçu) | 11,5 px ; chiffres 26 → 30 px |
  | Cartes infos : titre / texte / lien | 12 / 16 / 10 px | 13 / 17 / 12 px |
  | Frise « notre histoire » : année / titre / texte | 10 / 19 / 15 px | 11,5 / 21 / 17 px |
  | « Faites défiler », signature, « Touchez le sceau », bandeau démo | 9 à 10 px | 11,5 px |

- **Respirations** : 10 / 18 / 28 px (prénoms 18 px au-dessus et 14 px en dessous, 28 px avant un bouton, un compte
  à rebours ou une carte, 10 px entre deux lignes de texte au lieu de 2).
- **Halo de lisibilité local** derrière le bloc de texte de chaque page (`.pg::before`, radial, 50 % de noir sur les
  scènes sombres, 74 % de crème sur les thèmes clairs), aussi dans l'aperçu de la vitrine. Ce n'est pas le voile
  plein écran retiré précédemment : il s'arrête aux deux tiers de la hauteur et laisse le sujet intact.
- **Sceau de cire sur l'accueil** : même image de cire et mêmes initiales gravées que sur l'enveloppe, dans le moteur
  et dans le configurateur. Le disque plat en CSS est supprimé.
- **Outil de contrôle** `business/tools/check_images.py` : pour chaque scène, mesure l'agitation de la zone de texte
  et le contraste du texte du thème sur le pire quart de cette zone. Code de sortie 1 s'il y a des images à refaire.

## Ce qu'il reste à faire : les images

Résultat de `check_images.py` sur les 48 scènes actuelles (`business/landing/img/hd/`) :

| Thème | Scènes qui passent | À refaire (zone chargée ou contraste < 3) | Halo nécessaire (contraste 3 à 4,5) |
|---|---|---|---|
| Conte de fées | — | 1, 2, 3, 4 (ciel pastel, texte blanc : 1,6 à 2,5) | |
| Art déco | 3, 4 | 1, 2 (ornement et lustre dans la zone) | |
| Aquarelle | 1, 2, 3, 4 | | |
| Bollywood | — | 1, 2, 3 (palais rose, contraste 1,6 à 1,9), 4 (zone chargée) | 4 |
| Trait | 1, 2, 3, 4 | | |
| Bohème | 4 | 1 (arche dans la zone), 3 | 2 |
| À l'américaine | — | 1, 2, 3 (ciel clair, contraste 1,3 à 1,9) | 4 |
| Pop rétro | — | 1, 2, 3, 4 (fond clair, texte blanc : 1,2 à 1,6) | |
| Azulejos | — | 1, 2, 3, 4 (carreaux et citrons dans la zone) | 2, 4 |
| Mille et une nuits | 4 | 1, 2 (lanternes dans la zone), 3 | 1, 2 |
| Gravure | — | 1, 2, 3, 4 (cadre gravé dans la zone) | 1, 2 |
| Dolce Vita | — | 1, 2, 3, 4 (bougainvilliers, ciel clair) | 3 |

Lecture : seuls **Aquarelle** et **Trait** respectent les règles, parce que leur zone de texte est du papier nu.
Les thèmes sombres ont des ciels trop clairs (couchants pastel) pour du texte blanc ; les thèmes ornementés
(Art déco, Gravure, Azulejos) remplissent la zone de texte de motifs.

**Plan de régénération** (direction artistique de [12-direction-artistique.md](12-direction-artistique.md), plus la
contrainte de zone de texte) :

1. Prompt type à ajouter à chaque génération de scène :
   > « Format vertical 9:16. **La moitié haute de l'image (jusqu'à 55 % de la hauteur) est un ciel de nuit profond et
   > uni / un papier crème nu, sans aucun élément, ornement, cadre ni texte** : elle recevra des textes blancs
   > / foncés. Le sujet (…) occupe la moitié basse. » Pour les thèmes sombres, remplacer les couchants pastel par
   > des ciels de nuit, de crépuscule tardif ou de pénombre. Pour les thèmes clairs, un fond papier uni en haut.
2. Générer avec `business/tools/gemini.py`, regarder en grand, passer `check_images.py`, et ne garder que les
   scènes qui passent (agitation < 8 et contraste ≥ 4,5).
3. Ordre : d'abord les scènes 1 (accueil, celle qui sert d'aperçu WhatsApp et de vignette), thème par thème dans
   l'ordre de la vitrine ; puis les scènes 2 à 4.
4. **Images de personnes** (`img/people/`, 6 images) : remplacer par de vraies photos libres de droits (Unsplash ou
   Pexels, licence notée dans un `CREDITS.md`) ou par une génération en rendu photographique natif. Les six sujets
   restent les mêmes (couple qui choisit, mains et téléphone, grand-mère, famille, amis, couple qui lit les réponses).

Tant que les images ne sont pas refaites, le halo CSS garde les textes lisibles. Il n'est pas la solution finale.
