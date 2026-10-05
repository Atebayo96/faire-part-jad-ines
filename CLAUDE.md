# Règles du projet (faire-part Inès & Jad, et Sceau)

Ce dépôt contient le faire-part réel (`index.html`, `en.html`) et le produit Sceau (`business/`).
Le moteur de faire-part est `business/landing/invite.css` + `invite.js`, les thèmes sont dans `business/landing/themes.js`,
le site se reconstruit avec `python3 business/build-site.py` (il copie `landing/` dans `site/`, ne jamais éditer `site/` à la main).

Les règles ci-dessous viennent des allers-retours avec l'utilisateur. Elles s'appliquent à tout ce qui est visible :
faire-part, vitrine, aperçus, images d'aperçu WhatsApp (og.jpg), images générées.

## Lisibilité : le texte se lit d'un coup d'œil, par une grand-mère, sur un téléphone au soleil

1. **Contraste mesuré, jamais supposé.** Tout texte posé sur une image ou une couleur doit atteindre un rapport
   de contraste WCAG d'au moins **4,5:1** sur le fond réel (le plus clair ou le plus sombre de la zone, pas la moyenne).
   Un texte blanc sur un ciel pastel, de l'or sur du beige, du gris clair sur du blanc : interdit.
   Vérifier avec `python3 business/tools/check_images.py` pour les décors de scènes.
2. **Ni voile, ni halo dans la page.** L'utilisateur a fait retirer le voile plein écran qui éteignait l'image, puis le
   halo local derrière le bloc de texte (`.pg::before`) : coupé au bord de la page par `overflow:hidden`, il traçait une
   ligne sombre qui séparait les deux pages pendant le glissement. Rien de sombre ne doit être posé **dans** une page
   (tout ce qui est dans `.pg` glisse avec elle et se coupe à son bord). La lisibilité vient de l'image (règles 6 et 7)
   et des ombres portées des textes ; si ça ne suffit pas, on refait l'image.
3. **Rien sous 11 px.** Échelle unique (variables `--fs-*` dans invite.css, reprises dans l'aperçu de la vitrine) :
   chapeaux 13 px, texte courant 18 px et plus, horaires 17 px et plus, boutons 17 px (garamond), mentions 11,5 px.
   L'aperçu de la vitrine et le configurateur doivent afficher **les mêmes tailles** que le vrai faire-part.
4. **Aérer.** Trois respirations : 10 px (entre deux lignes liées), 18 px (entre deux éléments), 28 px (avant un bouton,
   un compte à rebours, une carte). Interligne 1,45 pour le texte courant. On ne tasse jamais le bloc de texte pour
   « laisser voir l'image » : c'est l'image qui réserve la place au texte (règle 6).
5. **Ne pas superposer un texte à un motif.** Un chapeau, une date ou un titre ne passe jamais sur un ornement,
   un lustre, des lanternes ou des fleurs. Si c'est le cas, on déplace le texte ou on refait l'image, on ne réduit
   pas le texte.

5b. **Les boutons sont des pastilles, pas des encadrés en capitales.** L'utilisateur a jugé l'ancien bouton (filet fin,
    capitales espacées, icône au trait) « trop cliché ». Le bouton (`.b` dans invite.css, `.bt` dans l'aperçu de la vitrine,
    `.rvl-btn` pour la révélation) est une pastille arrondie de 46 px de haut en verre dépoli, l'icône dans un médaillon
    à la couleur du couple (`--pal`, ou `--ac` dans le grand tableau), le mot en Cormorant Garamond 17 px. Les deux actions
    d'un événement ont la même largeur et restent côte à côte dès 360 px ; enfoncement au toucher, contour de focus.
    Verre sombre à 50 % sur les scènes (à 30 %, un couchant clair tombait à 3,5:1), verre blanc sur les thèmes papier ;
    dans le grand tableau, le verre se choisit par section d'après l'encre (`--gl`, invite.js). Contraste du mot mesuré
    sur le fond réel du bouton, pire pixel compris, 4,5:1 minimum.

## Images : chaque image réserve la place du texte avant d'être belle

6. **Zone de texte réservée.** Dans toute image de scène (format 9:16), la bande **du haut, de 10 % à 55 % de la
   hauteur**, est calme : ciel dégagé, mur uni, papier nu, nuit profonde. Pas d'ornement, pas de cadre, pas de sujet.
   Le sujet (château, arche, mains, couple de dos) vit dans la moitié basse. Le prompt de génération le dit
   explicitement, et `check_images.py` le vérifie (agitation < 8, contraste ≥ 4,5 sur le pire quart de la zone).
7. **Le contraste est dans l'image.** Thèmes sombres : la zone de texte est **sombre** (ciel de nuit, pénombre), pas
   un couchant pastel. Thèmes clairs : la zone de texte est **claire et unie** (papier, crème), le texte est de couleur
   foncée. Il n'y a plus de filet de sécurité en CSS : une image qui ne porte pas son texte est refaite.
8. **Images d'aperçu (og.jpg) et vignettes** : mêmes règles, le texte se pose sur une bande calme et contrastée.
9. **Personnes et scènes « vraies » (vitrine, étapes, témoignages)** : soit de **vraies photos libres de droits**
   (Unsplash, Pexels, licence vérifiée et notée dans `business/landing/music/CREDITS.md` ou un `CREDITS.md` d'images),
   soit une génération en **rendu photographique natif** (lumière naturelle, optique réelle, grain). Jamais le style
   « peinture » pour des gens : il paraît artificiel et fait « cheap ».
10. **Toute image générée est regardée en grand avant d'être publiée**, et passée dans `check_images.py` si c'est une
    scène. Une image qui échoue est régénérée, pas rafistolée en CSS.
10b. **Scène par scène = des calques, jamais une image rognée.** Une image 9:16 posée en `cover` sur un téléphone 9:19,5
    perd ses côtés (« tt les scène par scène t'as coupé c pas ouf ») : l'utilisateur a demandé « un détourage sur les objets,
    en plusieurs calques ». Désormais chaque scène ou lieu a son **sujet détouré** (`img/calques/<thème>-<clé>.webp`, RGBA,
    1080 px de large, `business/tools/calques.py` : Gemini repeint le sujet sur fond vert, incrustation, contrôles : haut vide,
    sujet jusqu'au bord bas, pas de bord supérieur rectiligne ; `--hint` pour recomposer une scène trop dense) et le
    **fond calme du thème** (`<thème>-fond.webp`) est peint **une fois derrière tout** (`.sc.cal`, `#cpScroll.cal`). Le
    sujet est posé **entier**, toute la largeur, au bas de l'écran (`.bg .sub`, `object-fit: contain`, jamais de zoom), il
    monte avec ses pages et passe devant le précédent (pas de masque de fondu sur ces cadres : le fondu de 45 % en fond uni
    délavait le sujet du bas de la page précédente). Légère profondeur au défilement (5 %, plafonnée à 6 % d'un écran).
    En partant, le bas du sujet (le sol) traçait une ligne droite sur le fond (« des lignes nettes, c'est moche ») : dès que
    le cadre remonte, son bas se fond d'autant plus qu'il est monté (`calFade()` dans invite.js, `cpFade()` dans vitrine.js,
    au plus 35 % d'un écran) ; rien tant que la page est posée. **Jamais de débord du cadre sur la page suivante** : un
    débord fixe d'un quart d'écran laissait le manoir en haut de la dernière page, sous la tente (« deux écrans en un »).
    Une page posée ne montre que son propre sujet.
    Derrière les calques, le décor est le **ciel nu** (`<thème>-ciel.webp`, `tools/ciel.py` : le haut calme du fond étiré
    sur toute la hauteur), pas `<thème>-fond.webp` : son jardin du bas (fleurs, sable, lanternes) restait fixe sous chaque
    scène et son bord de sable faisait une ligne droite. `-fond` reste l'image des écrans simples.
    Pas de `will-change: transform` sur le sujet : dans un cadre collant masqué, Chromium ne le repeignait pas après un saut.
    `build-site.py` liste les calques existants (`inv.calques`, `window.SCEAU_CALQUES`) ; sans calque, une scène garde
    l'ancien rendu plein cadre. Un calque échoué se régénère, on ne réduit pas le sujet pour le faire tenir.
    La **vignette** d'une scène en calques (`img/themes` et `img/hd`, cartes de la vitrine, carrousel, configurateur) se
    recompose avec `business/tools/vignettes.py <thème>-<clé>` (fond + sujet) : la peinture d'origine pouvait garder une
    bande sombre collée sur la scène (« c'est coupé, c'est moche » sur la carte « Scène par scène »).

## Ce qui tombe : les particules

- **Désactivées pour l'instant** (`PARTICLES_ON=false` dans invite.js) : l'utilisateur a demandé de retirer « les fleurs,
  pétales, tout ça qui descend, on n'y est pas encore ». Les règles ci-dessous valent pour le jour où on les rallume.

- **Jamais de forme dessinée en code** (ellipse, rectangle, rond flou) : l'utilisateur l'a jugée « V0 ». Chaque particule
  est un **sprite peint** dans le style du thème : `business/landing/img/fx/<famille>-<i>.webp`, découpé par
  `business/tools/fx-sprites.py` depuis une planche `gemini.py` (fond vert uni pour les objets opaques, **fond noir et
  `--key luma`** pour les objets clairs ou lumineux : graines, lanternes, où le halo devient une vraie transparence).
  `img/fx/index.json` dit combien de sprites a chaque famille ; invite.js le lit.
- Le mouvement a de la **profondeur** (lointains plus petits, plus pâles, plus lents), une **culbute** (le sprite se
  retourne), un balancement propre et un vent commun ; il est en temps réel (indépendant des images par seconde).
- Les particules passent **devant le décor et derrière le texte** (`#fx` z 1, `.sc` z 2). Sur les thèmes clairs, une
  ombre portée douce ; sur les lanternes, fondu additif et scintillement.
- Le canvas `#fx` a `width:100%;height:100%` : sans ça il garde 300 × 150 px et tout tombe dans un bandeau en haut.

## Signature : le sceau

11. **Le sceau est toujours un sceau de cire** (`img/seals/<cire>.webp`), avec les initiales **gravées** (dégradé
    clair/moyen/sombre de la cire, voir `.op-seal b`). Jamais un disque plat en CSS avec des lettres blanches.
    Même rendu sur l'enveloppe, l'accueil du faire-part, le configurateur.

## Ouvertures : tout s'enchaîne, jamais de temps mort sur la lumière

15. **La lumière arrive avec l'entrebâillement, et la page est déjà là derrière.** Rideau : la lumière part au
    toucher (`flash: 0`). Portes et voile : l'utilisateur a d'abord refusé une lumière qui n'arrivait qu'une fois les
    battants bien ouverts, puis une lumière qui partait « presque au clic, c'est pas ouf, faut attendre un petit
    peu » : elle part quand les battants ou les pans s'entrouvrent (`flash: 500` portes, `flash: 400` voile, lueur
    `opGlow` à 0,5 s) ; elle
    grandit avec l'ouverture (pic à mi-course : `.flash.door` 0,45 à 1,4 s, `.flash.soft` 0,75 à 0,9 s), jamais un
    écran blanc. La page est montée tout de suite (`on` ≈ 150–320 ms) et se voit à travers l'entrebâillement ; les
    battants, le rideau ou les pans s'effacent pendant qu'ils finissent de s'ouvrir. L'utilisateur a aussi refusé
    la version où l'on restait une seconde sur un écran de lumière avant de voir la page (démo Nour & Ilyes).
    Toute nouvelle ouverture se vérifie **image par image** (capture toutes les 250 ms au format téléphone) : à
    aucun moment l'écran ne doit être vide ou tout blanc.
    - **Voile** = un grand rideau **opaque** (le tissu du thème, `img/open/<thème>-rideau.webp`, coupé en deux
      pans) qui s'ouvre **par le milieu**, les pans se tassant en plis vers les bords. La version en gaze
      translucide a été refusée (« un vrai voile opaque, comme des rideaux »).
      Le mouvement est **un seul geste** sur une seule courbe (`opSheerL/R`, `scale` + `translate`), l'ondulation du
      tissu étant une animation à part (`opWaveL/R`, `skewY`) : la version en étapes (petit recul vers le centre puis
      ouverture, chaque étape freinant à zéro) « se fait en 2 parties, le mouvement n'est pas fluide ». Pans effacés
      à 1,5 s (fondu 0,8 s).
    - **Pas d'objets 3D.** Une version three.js (portes épaisses sur gonds, tissus maillés à plis, ressort amorti) a été
      construite et mise en ligne, puis refusée par l'utilisateur (« j'aime pas trop, reviens sur ce qu'on avait
      avant ») : commits annulés. Les ouvertures restent en CSS (images du thème, transformations et courbes
      ci-dessous). Ne pas y revenir sans demande explicite.
    - **Mouvements naturels.** Un objet qui s'ouvre a un poids : il part lentement (inertie), accélère, ralentit,
      dépasse un peu sa position et s'y repose (porte : `opDoorL/R`, dépassement à 103°) ; un tissu tiré se ramasse
      d'abord, ondule pendant la traction (`skewY`) puis se pose (`opSheerL/R`). Jamais une courbe uniforme d'un bout
      à l'autre : l'utilisateur trouvait les mouvements « pas naturels », « un détail qui a son importance ».
      Portes 10 % plus lentes (2,9 s) et sans trait lumineux vertical entre les battants (retiré, « moche »).
      La lumière des portes ne traîne pas : « dès que ça commence à partir, plus d'animation ». Puis l'utilisateur a
      encore vu « le halo qui reste » sur la page (démo Nour & Ilyes) : la lueur `.op-glow` montait à 0,9 et y
      restait jusqu'au fondu final. Désormais **toutes** les lumières des portes s'éteignent d'elles-mêmes avant
      1,4 s : lueur `opGlow` (monte puis redescend à 0, 1,3 s), salle `opRoom` (1 s), flash `flashDoor` (1,4 s),
      `gone` 1,4 s avec fondu 0,5 s. Une lumière ne doit jamais rester allumée en `both` à son maximum.
    - **Portiers** (`doormen`) : retirés des démos (« pas ouf pour l'instant »), activables seulement avec
      `"doormen": true` dans la fiche. Les images `img/open/<thème>-portier.webp` restent.
17. **La basmala est une calligraphie, pas une phrase.** « Bismillah » s'affiche avec la ligature `U+FDFD` (« ﷽ »)
    de la police Amiri, comme sur le faire-part d'Inès & Jad (`window.SCEAU_BASMALA` dans `themes.js`), jamais
    lettre à lettre ni en capitales espacées.
18. **Tout défile en continu, on ne sent jamais de page.** Même les faire-part en scènes (anciennement « page par
    page ») défilent librement : aucun calage en plein écran (pas de `scroll-snap`, pas de « calage doux » après le
    geste), molette et clavier natifs, textes sans fondu ni décalage pendant le défilement. Historique : l'utilisateur
    a d'abord refusé le « swipe brusque », puis le décor fixe (« un changement de page, c'est moche »), puis a tranché :
    « le plus stylé c'est continu ; l'idée c'est que ce soit en continu mais tu ne te rends pas compte que tu changes
    de page ». On garde les illustrations par scène ; le décor est une **bande continue qui défile avec les pages**
    (`layoutStrip()` dans invite.js, `cpLayout()` dans le configurateur) : une image par suite de pages de même
    scène, deux scènes voisines se chevauchent sur **45 %** d'un écran et se fondent par un masque en dégradé.
    Jamais un décor fixe derrière des pages qui glissent. Même règle dans l'aperçu du configurateur (`.pv-scroll`).
    **Le décor garde la taille de l'écran** : le cadre d'une scène est plus haut que l'écran (bande de fondu de 45 %),
    et un `cover` sur ce cadre agrandissait l'image d'environ 1,8× (« ça fait un zoom »). `fitBg()` (invite.js) et
    `cpLayout()` dimensionnent l'image sur l'écran ; la bande de fondu au-dessus est remplie par la première bande de
    l'image étirée (`::before`). Pas de miroir de tout le haut : il inversait le dégradé du ciel et faisait un pli.
    Aucune image ne doit avoir de **coupure droite** (un arbre ou une bande qui s'arrête sur une ligne horizontale,
    reste d'un collage) : on la redessine d'un seul tenant, en vignette sur le papier si besoin.
19. **Tout bloc centré l'est explicitement.** Dans la mise en page continue, `.lg-hero-txt` n'est pas une colonne
    flex : une ligne `display:flex` (la date entre ses deux filets) s'y collait au bord gauche. Toujours vérifier le
    centrage sur une capture, à 390 px **et** à 440 px (la date tient alors sur une ligne).
16. **Une seule séquence par ouverture**, définie dans `invite.js` (`SEQ`) et recopiée telle quelle dans le
    configurateur de la vitrine (`index.html`, `SEQ`) ; même chose pour le CSS des ouvertures.

## Un seul produit : le grand tableau, plus ou moins dessiné

20. **« Un seul grand tableau » et « scène par scène », c'est la même chose.** L'utilisateur ne veut plus deux types de
    faire-part présentés à part (vitrine en deux colonnes, deux sections) : « l'idée c'est d'avoir une continuité ;
    des fois tu dessines plus, des fois tu mets des trucs blancs et tu mets du texte ». Chaque écran est soit une
    **scène** (un lieu dessiné), soit un **écran simple** (le texte sur le fond du tableau). La vitrine montre un seul
    téléphone et parle d'un seul produit.
21. **Le moins de choix possible.** Configurateur Essentiel (aujourd'hui en 5 étapes, règle 33) : 1) prénoms, date, thème (ouverture, couleurs,
    police, révélation et compte à rebours rangés dans « Plus de réglages », fermé) ; 2) pour chaque événement :
    son nom, son heure, son adresse, et **une seule rangée de vignettes qu'on fait glisser** : « Texte seul » (écran simple ;
    « Scène du thème » en grand tableau), puis les lieux du thème, puis « Votre lieu » (Signature). Plus de bouton séparé
    « Écran simple / Scène » ni de grande grille (« pas évident, faut un truc très très simple », 5 octobre 2026) ;
    3) récapitulatif et commande. Bibliothèque : `img/hd/<thème>-<lieu>.webp` et `<thème>-fond.webp`
    (`business/tools/lieux.py`, contrôlés comme les décors).
22. **La vitrine est en quatre pages, pas une page à ancres** : `/` (accueil : ce qu'on vend, les exemples dans un
    téléphone, deux boutons vers `/creer/` et `/modeles/`, puis trois infographies courtes), `/modeles/`, `/formules/`
    (cartes, **tableau de ce qui change d'une formule à l'autre**, ce qui est dans toutes, comparaison avec le papier,
    questions), `/creer/` (configurateur, formulaire de contact, commande). Elles partagent `vitrine.css` et
    `vitrine.js` (chaque bloc du script ne tourne que si sa page a ses éléments ; chemins absolus `/img/…`).
    L'utilisateur a refusé les gros blocs de texte (« Pourquoi Sceau, et pas… ») : on explique par des infographies
    simples (étapes numérotées, tableaux), pas par des paragraphes. `build-site.py` traite les quatre pages.
23. **Upsell sans frustration.** Dans le configurateur, les options de Signature (lieu peint d'après photo, 3e événement
    et plus, lien par famille, anglais) sont proposées au même endroit que les autres, avec l'étiquette « Signature »,
    jamais grisées. Si on les choisit en Essentiel, la formule passe d'elle-même sur Signature et le récapitulatif dit
    pourquoi ; si l'on revient à Essentiel à la main, il dit seulement ce qui n'y est pas compris (« vous pourrez les
    retirer, ou passer en Signature »). Le `.ok` de la vitrine est le message « Merci » caché : ne pas réutiliser ce nom.

24. **La marque s'appelle « Save The Oui »** (depuis le 3 octobre 2026 ; « Sceau » était le nom de travail). Logo :
    « SAVE THE » en capitales espacées + « Oui » en Great Vibes (`.logo`), favicon = sceau de cire avec un O. Tout ce qui
    est visible dit Save The Oui ; les identifiants du code (`SCEAU_THEMES`, `sceau-rsvp-…`, `og-sceau.jpg`) ne changent pas.
25. **Le configurateur avance par étapes** (thème, écrans, détails, formule : `.wz`, `#wzNav`), une seule à l'écran, l'aperçu
    à côté (collant sur grand écran, au-dessus sur téléphone). L'utilisateur trouvait la page unique « trop complexe ».
    Tout reste dans la page, seulement masqué : `paint()` tient tout à jour. Les photos de personnes sont prises sur le vif
    (`tools/people.py`) : rien de posé, personne ne sourit à la caméra, pas de scène de banque d'images.

26. **Une seule galerie de thèmes** (`/modeles/`) : les 22 univers dans la même grille, chaque carte avec son étiquette
    « Composer » (12 thèmes à scènes, bouton vers `/creer/?theme=…`) ou « Avec nous » (10 styles en grand tableau, vers
    `/contact/`). Jamais deux sections (« nos faire-part à ouvrir » puis « 12 thèmes ») : l'utilisateur s'y perdait, et
    un thème présent dans les deux versions n'apparaît qu'une fois. Le configurateur montre les mêmes vignettes.
27. **Chaque chose à sa page** : les questions sur `/questions/`, le formulaire de contact sur `/contact/` (plus dans le
    configurateur), le tableau de bord en lien depuis « Les réponses arrivent » (accueil) et « Dans toutes les formules ».
    Les formules se comparent **en images** (bande de 4 vignettes par formule, badge appareil photo = peint d'après votre
    photo), pas seulement en texte. La fin du configurateur est un récapitulatif ligne par ligne, la formule, « Ensuite »
    en 3 temps, puis le bouton « Commander · formule prix ».

28. **Dans une grille de vignettes, la sélection est une coche** (pastille noire ✓ en haut à droite, les autres vignettes
    s'estompent à 72 %), jamais un cadre noir autour (« pas ouf »). La vignette « Votre lieu, d'après votre photo » montre
    le lieu du thème en fond avec un appareil photo dans une pastille blanche, pas une case grise. Le configurateur
    propose **tous** les thèmes, les 10 « sur mesure » dans un second groupe (l'aperçu montre leur tableau avec les
    prénoms, la demande part au contact). L'ouverture se choisit à l'étape 1, avec le thème. Dix couleurs, pas cinq.
    Les listes des formules portent une icône par ligne ; Signature et Couture commencent par un bloc « Tout Essentiel »
    / « Tout Signature » suivi d'un rond « + », puis la liste de ce qui s'ajoute (pas d'étiquette « en plus » par ligne,
    refusée) : on comprend que chaque formule contient la précédente. Plus de section de photos de personnes « Fait pour ceux
    que vous aimez » sur l'accueil (« ne sert plus à rien »).

29. **Un seul moteur pour tous les thèmes : le scène par scène** (un événement par écran, en plein écran, défilement continu,
    comme le faire-part d'Inès & Jad). L'utilisateur tient à « un événement par écran » ; les cadres du grand tableau
    restent une possibilité du sur mesure, pas la règle. Les 7 univers culturels d'abord faits en grand tableau (Double
    bonheur, Sakura, Gzhel, Laque & or, Y2K, Old money, Kente) ont désormais leurs 4 scènes, leurs 5 lieux et leur fond
    dans leur style (`tools/scenes-long.py`, références = leur tableau), leurs portes et rideau (`tools/portes.py`), et
    sont marqués `plan:"signature"` dans themes.js : dans la liste unique, « dès Signature » ; les choisir en Essentiel
    fait basculer la formule avec l'explication. Le dernier groupe « sur mesure » du configurateur a disparu.
    Après toute régénération d'images déjà publiées, augmenter `?v=` (vitrine) et `IMGV` (invite.js), sinon le
    navigateur garde les anciennes : c'est ce qui faisait croire que Mille et une nuits n'avait pas changé.

30. **Deux formats, clairs dès le début, sur cinq thèmes.** La « fusion » (scènes plein écran insérées dans le rouleau,
    essayée sur Victoire & Charles) a été refusée : « on se perd entre deux propositions ». On propose donc **les deux
    formats, nommés et montrés dès l'accueil** : *scène par scène* (un événement par écran, lieu en plein écran) et
    *grand tableau* (un rouleau peint, lieux dans des cadres ; un `lieu` de la bibliothèque remplit le cadre). Au
    lancement, **5 thèmes** (`launch:true` dans themes.js : Mille et une nuits, Dolce Vita, Bollywood, Sakura, Old money),
    chacun avec une démo dans chaque format ; les autres thèmes restent dans le code et leurs démos en ligne, mais hors
    galerie et configurateur tant qu'ils n'existent pas dans les deux formats. Le format se choisit à l'étape 1 du
    configurateur (`C.fmt`, champ `format` dans la demande) ; aucun thème n'est réservé à Signature.

31. **Configurateur sur téléphone** : l'aperçu reste **collé en haut, réduit** (téléphone à 30 %, `position:sticky`,
    196 px) pendant qu'on configure, avec un bouton « Agrandir » qui l'ouvre en plein écran (`.comp-prev.big`, croix pour
    fermer). L'utilisateur devait sinon remonter à chaque réglage pour voir le résultat. Le téléphone agrandi reste
    `position:relative` (ses calques sont absolus : en `static`, ils s'étalaient sur tout l'écran). Le bandeau fait
    150 px au total : téléphone à 21 % et, à côté, **les quatre étapes** (déplacées là par JS sous 720 px) et le lien
    « Agrandir l'aperçu » ; la première version à 196 px + barre d'étapes séparée « prenait trop d'espace ». Puis
    l'utilisateur a voulu le téléphone **plus grand** avec **un résumé des choix** à côté (`#cpSum` : thème · format,
    prénoms · date, lieux, formule), les étapes en dessous sur une ligne : bandeau à 214 px, téléphone à 31 %.
    En format « grand tableau », l'étape 2 change de mots (« Vos événements », « Sans lieu / Un lieu dans le cadre »).
    Les vignettes du choix de format suivent le thème choisi (`paint()`). Les vignettes qui
    illustrent un format montrent la **scène** (`object-position: center 72 %`), pas le ciel vide du haut de l'image.
    Toute vignette plus courte que 9:16 (tuiles de thème 3:4, cartes 4:5) se cadre sur le **bas** de l'image
    (`center 80–88 %`), là où est le sujet : centrée, elle coupait le torii et le manoir. `html,body{overflow-x:clip}` :
    sur Safari iOS, un débordement invisible suffisait à « pousser » la page vers la gauche.

32. **Au lancement, on se concentre sur Mille et une nuits et la communauté arabe et musulmane.** Le configurateur ne
    propose que la famille `family:"nuits"` (themes.js) : le riad de nuit (`nuits`) et ses variantes **Alhambra** (palais
    andalou de jour, thème clair, police Amiri), **Nuit du désert** (dunes, tente caïdale) et **Émeraude & or** (cour de
    palais émeraude). Chaque variante a ses 4 scènes (`tools/variantes-nuits.py`, références : nuits-1 et le tableau de
    Nour & Ilyes), ses lieux, ses portes et rideau, son grand tableau, et une démo dans chaque format. Dans cette famille,
    le lieu « Église » est remplacé par **« Mosquée »** (`mosquee` dans lieux.py). Les autres thèmes restent dans la
    galerie et le code. Provisoire : le quota Gemini a été atteint le 5 octobre 2026 avant l'illustration verticale et
    les guirlandes des variantes ; leur grand tableau s'ouvre sur leur scène 1 et reprend les guirlandes du riad
    (`hero_hd`, `bands_from` dans long-assets.py) ; la scène se fond sur 40 % de sa hauteur (`hero.fade`) dans le vrai fond du thème, sans teinter ce fond de la couleur du sol (Émeraude finissait sur un taupe « coupé, moche »). Dès que le quota revient : `long-gen.py /tmp/longraw alhambra desert
    emeraude` puis `long-assets.py`, et les calques (`calques.py`).
    **Nuit du désert et Émeraude & or sont retirés** (`pending:true`, 5 octobre 2026 : « c'est pas encore propre ») ;
    au lancement, le configurateur propose le riad et l'Andalou.
    **À repeindre en priorité** (coupure droite dans l'image, un ciel collé sur une scène d'intérieur, relevée par
    l'utilisateur le 5 octobre 2026) : `alhambra-2`, `alhambra-4` (en attendant, fondues en vignette sur le papier par
    `tools/vignette-papier.py`), puis, pour remettre les deux variantes, `desert-2`, `emeraude-1` à `emeraude-4`
    (`variantes-nuits.py <thème> --only … --force`, consigne : scène d'un seul tenant, ciel ou mur qui descend derrière
    le sujet). Rien d'autre : l'utilisateur veut qu'on reste concentré, pas qu'on régénère pour régénérer.
32b. **Depuis le 5 octobre 2026, le configurateur ne propose que Dolce Vita** (« pour l'instant on se focus sur ça »).
    Ce que le configurateur propose est marqué `compose:true` dans themes.js (indépendant de `launch`, qui garde la galerie
    et l'accueil). Sans thème de la famille `nuits` dans le configurateur, seule l'occasion « Mariage » existe (le choix
    est masqué), le lieu est « Église » (« Mosquée » seulement pour `family:"nuits"`), les exemples pré-remplis sont
    neutres (familles Martin et Rossi, chic d'été). Dans la galerie, une carte d'un thème qui ne se compose pas en ligne
    mène au contact (« Avec nous → »). Les boutons disent « Créer **votre** faire-part », jamais « notre ».
    **Dolce Vita garde ses peintures entières, sans calques** (`nocal:true` dans themes.js, lu par `build-site.py`) :
    l'utilisateur a trouvé la version en calques « sombre » (le sujet détouré sur le ciel nu) et veut les scènes déjà
    peintes, crépuscule et lumières comprises (« elles sont belles, faut pas les détourer ») ; **pas de nouvelle image**.
    Les calques restent dans `img/calques/` sans être utilisés. `tools/dolcevita-jour.py` (version de jour) existe mais
    n'est pas à lancer sans demande.

32c. **Le grand tableau est retiré de l'offre ; on reste en scène par scène, avec des ambiances** (5 octobre 2026 :
    « on reste sur du scène par scène, juste on propose 2 visuels différents »). Configurateur : Dolce Vita et Old money
    (`compose:true`). Un thème peut avoir plusieurs **ambiances** (`group` / `amb` / `ambSub` dans themes.js) : Dolce Vita
    « Crépuscule » (`dolcevita`) et « Plein jour » (`dolcevitajour`, thème clair, texte `#193f64`). Étape 1 : une tuile par
    thème, puis « Quelle ambiance ? » (à la place de l'ancien choix de format, `#cFmt`, `buildAmb()`), chaque carte avec sa
    démo qui défile dans un téléphone (`REEL`, captures `img/reel/scenes-<thème>.webp` sans la roue). Masqué s'il n'y a
    qu'une ambiance (Old money). **« Plein jour » n'a aucune image générée** : ce sont les peintures de jour du grand
    tableau (`tools/ambiance-jour.py` : découpe 9:16, `descendre.py` pour la Vespa ; pour le dîner, les chevrons et
    feuillages flous au-dessus de la poutre sont retirés et remplacés par le ciel net du haut, fondu sur 3,5 % : les étirer
    faisait des traînées, « celle-là est mal faite » ; lieux Église = chapelle,
    Jardin = pergola, Salle = dîner, fond = papier aux citrons) ; toutes passent `check_images.py`. Une ambiance déclare
    ses lieux (`lieux`, les autres sont masqués et un événement passe sur le premier qui existe) et ses lieux sombres
    (`darkLieux` : le dîner de nuit est en texte blanc, `isDark()` dans invite.js). Démo : Elena & Matteo.
    Accueil (« Deux ambiances pour Dolce Vita »), carrousel et galerie (liens par ambiance) ne montrent plus de grand
    tableau ; les démos en grand tableau restent en ligne, le moteur et l'aperçu `lgInvite` restent dans le code.
    **Posée, une page ne montre que sa propre scène** aussi pour les peintures entières (sans calques) : la scène suivante,
    qui commence 45 % d'écran plus haut, est invisible tant que la page est posée et apparaît en défilant (opacité selon
    le défilement, invite.js et `cpFade()`) ; son ciel clair délavait le bas de l'écran.

33. **L'ouverture a son propre onglet** (étape 2 sur 5 : thème, ouverture, écrans, détails, récapitulatif), avec la
    révélation de la date. Arriver sur l'onglet rejoue l'ouverture dans l'aperçu.
    **Chaque carte montre son effet** dans un petit téléphone aux images du thème : **au repos, ce que l'invité voit en
    premier, fermé et réaliste** (enveloppe scellée, rideau baissé, voile et portes fermés, ticket intact, roue au départ,
    rouleaux sur « ? ») ; les images suivent le format (scène 1 ou illustration du grand tableau) ; l'animation
    (5 s) ne joue qu'**au survol** (« pour pas que ça prenne trop de dégâts »). L'enveloppe reprend les vraies images de
    l'ouverture (`env-body`, `env-flap`, sceau sur la pointe du rabat), pas un dessin en CSS. Détail (`OV` dans vitrine.js,
    `.op-card.anim` et `ov*` dans vitrine.css) : enveloppe (sceau, rabat, descente), rideau qui se lève, voile qui s'ouvre
    par le milieu, portes sur gonds avec la lumière, date qui apparaît, ticket gratté par une pièce, roue qui tourne,
    jackpot 28 · 08 · 27. « Les gens voient direct l'impact, sans attendre le téléphone à droite. » Sélection par la coche.
34. **En grand tableau, l'étape 3 décrit le tableau, pas des écrans** (« Votre tableau ») : l'illustration d'ouverture,
    le mot des familles, les événements dans leurs cadres (la scène peinte du thème, un lieu de la bibliothèque ou votre
    photo), puis les parties facultatives (histoire, bande de photos, dress code ; bon à savoir, liste), la réponse et le
    compte à rebours. Les écrans propres au scène par scène (programme, FAQ, table…) n'y sont pas proposés, ni la page
    dédiée au compte à rebours. **La révélation de la date existe aussi en grand tableau** (5 octobre 2026) : elle se
    joue sur l'illustration d'ouverture, sous les prénoms (`.lg-hero-txt [data-rvl]` dans invite.js). L'aperçu du grand tableau est **le vrai moteur** (invite.js)
    dans un `iframe` `srcdoc`, nourri d'une fiche faite des choix (`lgInvite()` dans vitrine.js) : l'utilisateur avait vu
    que l'étape ne changeait pas quand il choisissait le grand tableau, « c'est plus du tout la même chose ».

35. **Faire-part d'un seul événement (« one shot ») : henné et sbouâ.** Étape 1 du configurateur, « Pour quelle
    occasion ? » : Mariage, Henné (la mariée, le marié facultatif ; un seul événement, la scène 2 du thème « Le henné »
    proposée comme lieu `s2`), Sbouâ (le prénom de l'enfant, les parents, fille ou garçon ; un écran simple « À la
    maison » par défaut). Un seul événement, pas de « + Ajouter un événement ». Le moteur accepte **un seul prénom**
    (`couple: ["Lina"]` : sceau et monogramme à une initiale, `solo` dans invite.js) et une fiche peut porter
    `"kind": "henne" | "sbou3"` : ces démos (`henne-yasmine`, `sbou3-lina`) sont dans la section « Un seul événement » de
    /modeles/, jamais prises comme démo principale d'un thème. Le champ `occasion` part avec la demande.
    À faire quand le quota Gemini revient : des scènes propres au sbouâ (berceau, plateau de dattes et de lait, bougies),
    aujourd'hui l'accueil et la réponse reprennent les scènes du thème.
36. **Andalou et Maghrébin.** « Andalou » est le nom affiché du thème `alhambra`. « Maghrébin » (`maghreb` : médina
    blanche, portes bleues, zellige, de Chefchaouen à Sidi Bou Saïd, thème clair) est défini partout (themes.js, scènes,
    portes, grand tableau) mais `pending:true` tant que ses images n'existent pas :
    `bash business/tools/theme-nuits.sh maghreb`, regarder les images, retirer `pending`, mettre `launch:true`, ajouter
    ses deux démos.

37. **Le grand compte à rebours tient dans l'écran** : `clamp(28px, 10.5vw, 46px)` (invite.css), 32 px dans le téléphone de
    l'aperçu. À 46 px fixes, « 250 04 42 20 » débordait des deux côtés d'un écran de 300 px.

38. **Le format se choisit à l'étape 1, juste sous le thème** (« Comment raconter votre journée ? ») : l'utilisateur l'a
    redemandé le 5 octobre 2026 (il était à l'étape 3) ; l'étape 3 change ensuite de mots selon le format. Deux cartes avec un **visuel entier, jamais rogné** (« c'est moche parce que c'est
    coupé ») : trois écrans 9:16 du thème pour le scène par scène ; pour le grand tableau, « les gens ne comprennent pas la
    différence » : les deux cartes montrent **la vraie démo du thème qui défile dans un téléphone**, coupée net au bord de
    l'écran (rien ne dépasse) : `img/reel/scenes-<thème>.webp` et `tableau-<thème>.webp`, captures pleine page des deux démos
    (`REEL` dans vitrine.js). **La différence se voit au rythme** : le scène par scène s'arrête sur chaque écran
    (`tbScenes`, 7 arrêts = les 7 écrans de 844 px de la démo ; à refaire si la démo change), le grand tableau descend
    d'un trait (`tbLong`). Sous-titres : « Un moment par écran, chaque lieu en grand. Le plus spectaculaire. » /
    « Tout sur un seul tableau qu'on déroule, lieux dans des cadres. Le plus proche du papier. » (sans capture : les
    vignettes et le haut du rouleau, comme avant) ; sélection par la coche (règle 28). Dessous, « Vos écrans, dans l'ordre » ou « Le tableau, de haut en bas ».

39. **Les couleurs suivent le thème.** Chaque thème de la famille porte ses couleurs (`pals` dans themes.js : 3 teintes et
    la cire de sceau qui va avec), proposées en premier et choisies par défaut, puis les dix couleurs communes. Elles colorent
    le sceau, la date à gratter, la roue, le jackpot et le médaillon des boutons : tout restait doré (« couleur standard »).
40. **Boutons à leur taille.** Un bouton seul garde sa largeur naturelle (`.acts .b:only-child`) ; deux boutons sont côte à
    côte et de même largeur, plafonnés à 200 px, et passent l'un sous l'autre sans s'étirer sur un écran étroit.
    La basmala tient dans l'écran : `clamp(17px, 5.2vw, 24px)`, 16 px dans le téléphone de l'aperçu (elle était coupée).
41. **Chaque partie se règle quand on la coche** (grand tableau : sous la partie ; scène par scène : sous « Écrans en
    plus ») : familles et leur phrase, moments de l'histoire, dress code et ses couleurs, infos du bon à savoir avec leur
    icône, phrase et lien de la liste (`C.data`, `ED` dans vitrine.js). L'aperçu montre ce qui est écrit, la demande
    l'emporte (`fScreens`). Une partie vide ou non cochée n'apparaît pas (le titre « Notre histoire » s'affichait seul).
    Les mots suivent l'occasion : liste de mariage / cagnotte (henné) / liste de naissance (sbouâ), « Avec ses
    grands-parents » et « leur petit-enfant » pour un sbouâ, pas de « Notre histoire » ni de « Les célébrations » pour un
    événement seul ; le cadre d'un sbouâ en écran simple montre le fond du thème, pas le couple.
    **Le programme et les questions se règlent ligne par ligne** (heure + moment ; question + réponse ; intitulés au-dessus de
    la première ligne seulement). **La liste de mariage a trois façons** (`gifts.mode`, choix en trois cartes) :
    *Liste chez nous* (des cadeaux avec un prix facultatif, chacun se réserve une seule fois d'un toucher avec son prénom :
    `api/gifts.js`, fichiers `gifts/<slug>/<cadeau>.json`, 409 si déjà pris ; les mariés voient qui offre quoi dans le
    tableau de bord ; démos : réservation gardée dans le navigateur), *Cagnotte* (QR code sur fond blanc, lien à copier,
    bouton Participer ; `qrcode.js`, MIT, chargé seulement s'il y a un QR) et *Liste ailleurs* (un bouton). La phrase par
    défaut suit le mode tant qu'on ne l'a pas réécrite.

42. **Recette rejouable** (`business/tools/recette/`, compte rendu `business/15-recette-mille-et-une-nuits.md`) : vitrine,
    configurateur dans toutes les combinaisons, toutes les démos jusqu'au « Merci », accueil du moteur. À rejouer après
    toute grosse évolution. Une scène dont le sujet monte au-dessus de 50 % se corrige en attendant Gemini avec
    `tools/descendre.py` (étire la bande de ciel uni au-dessus du sujet, jamais le sujet ni la lune : `--bande 0.05`).

## Méthode

12. Avant de livrer un écran : capture au format téléphone (390 × 844), lue en grand, et vérification des trois
    questions : *est-ce lisible sans effort ? est-ce aéré ? le texte est-il sur une zone calme ?*
13. Une seule source pour chaque réglage visuel : l'échelle de texte est définie dans `invite.css`
    et recopiés tels quels dans l'aperçu de la vitrine. Toute nouvelle taille ou marge passe par une variable.
14. Les règles de design apprises sont écrites ici, pas seulement appliquées. Un retour de l'utilisateur sur un
    écran est un retour sur **le pattern** : on corrige partout où il se produit, pas seulement sur l'écran montré.

## Mise en production : chaque push va en prod

- Le projet Vercel `sceau-faire-part` (racine `business/site`) est relié au dépôt GitHub. Un push sur une branche de
  travail `claude/...` ne crée qu'un **aperçu** (`target: null`) : la prod (`sceau-faire-part.vercel.app`) ne bougeait
  pas, l'utilisateur l'a constaté. La prod se déploie depuis la branche de production de Vercel (`main`).
- Règle : **à chaque push, pousser aussi `main`** en avance rapide sur le même commit :
  `git push origin HEAD:main` (après `git push -u origin <branche>`). `main` doit toujours être un ancêtre de la branche
  de travail ; si ce n'est plus le cas, fusionner d'abord `main` dans la branche (jamais de force-push).
- **Autorisation permanente** : tant que Sceau ne vend pas encore, toute modification part en prod **sans demander**
  et sans action manuelle. On ne pose pas la question, on pousse la branche de travail ET `main`, à chaque fois.
- Si la prod doit partir sans attendre, l'API Vercel (`create_deployment`, `target: production`, `gitSource` = le commit)
  déploie ce commit en production ; `request_promote` d'un aperçu est refusé (422) sur ce projet.

## Cache des images

- Les images (`/img/…`) sont servies avec `max-age=0, must-revalidate` (vercel.json) : le navigateur vérifie à chaque
  visite si elles ont changé. Avant, elles étaient gardées 7 jours : l'utilisateur voyait encore les anciennes photos
  en prod après leur remplacement. Pour les navigateurs qui ont gardé une ancienne copie, une image remplacée change
  d'adresse : nouveau nom de fichier, ou `?v=` augmenté (`IMGV` dans invite.js, `?v=` des décors dans index.html).

## Confidentialité

- `GEMINI_API_KEY` vient de l'environnement, jamais du dépôt ni du chat. La musique du mariage (`assets/music.mp3`)
  ne part jamais en ligne (le build le vérifie).
