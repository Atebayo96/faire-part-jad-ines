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
   chapeaux 13 px, texte courant 18 px et plus, horaires 17 px et plus, boutons 12,5 px, mentions 11,5 px.
   L'aperçu de la vitrine et le configurateur doivent afficher **les mêmes tailles** que le vrai faire-part.
4. **Aérer.** Trois respirations : 10 px (entre deux lignes liées), 18 px (entre deux éléments), 28 px (avant un bouton,
   un compte à rebours, une carte). Interligne 1,45 pour le texte courant. On ne tasse jamais le bloc de texte pour
   « laisser voir l'image » : c'est l'image qui réserve la place au texte (règle 6).
5. **Ne pas superposer un texte à un motif.** Un chapeau, une date ou un titre ne passe jamais sur un ornement,
   un lustre, des lanternes ou des fleurs. Si c'est le cas, on déplace le texte ou on refait l'image, on ne réduit
   pas le texte.

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
21. **Le moins de choix possible.** Configurateur Essentiel en 3 étapes : 1) prénoms, date, thème (ouverture, couleurs,
    police, révélation et compte à rebours rangés dans « Plus de réglages », fermé) ; 2) pour chaque événement :
    écran simple ou scène, et si scène, le lieu (mairie, église, salle, jardin, plage) parmi les vignettes du thème ;
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
