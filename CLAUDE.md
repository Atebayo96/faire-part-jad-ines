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

15. **La lumière part au toucher, en même temps que le mouvement, et la page est déjà là derrière.** Rideau,
    portes et voile : au toucher, le geste commence lentement ET la lumière commence à monter (`flash: 0` dans
    `SEQ`, l'utilisateur a refusé qu'elle n'arrive qu'une fois les portes ou le rideau déjà en mouvement) ; elle
    grandit avec l'ouverture (pic à mi-course : `.flash.door` 0,45 à 1,4 s, `.flash.soft` 0,75 à 0,9 s), jamais un
    écran blanc. La page est montée tout de suite (`on` ≈ 150–320 ms) et se voit à travers l'entrebâillement ; les
    battants, le rideau ou les pans s'effacent pendant qu'ils finissent de s'ouvrir. L'utilisateur a aussi refusé
    la version où l'on restait une seconde sur un écran de lumière avant de voir la page (démo Nour & Ilyes).
    Toute nouvelle ouverture se vérifie **image par image** (capture toutes les 250 ms au format téléphone) : à
    aucun moment l'écran ne doit être vide ou tout blanc.
    - **Voile** = un grand rideau **opaque** (le tissu du thème, `img/open/<thème>-rideau.webp`, coupé en deux
      pans) qui s'ouvre **par le milieu**, les pans se tassant en plis vers les bords. La version en gaze
      translucide a été refusée (« un vrai voile opaque, comme des rideaux »).
    - **Portiers** (`doormen`) : retirés des démos (« pas ouf pour l'instant »), activables seulement avec
      `"doormen": true` dans la fiche. Les images `img/open/<thème>-portier.webp` restent.
17. **La basmala est une calligraphie, pas une phrase.** « Bismillah » s'affiche avec la ligature `U+FDFD` (« ﷽ »)
    de la police Amiri, comme sur le faire-part d'Inès & Jad (`window.SCEAU_BASMALA` dans `themes.js`), jamais
    lettre à lettre ni en capitales espacées.
18. **Tout bloc centré l'est explicitement.** Dans la mise en page continue, `.lg-hero-txt` n'est pas une colonne
    flex : une ligne `display:flex` (la date entre ses deux filets) s'y collait au bord gauche. Toujours vérifier le
    centrage sur une capture, à 390 px **et** à 440 px (la date tient alors sur une ligne).
16. **Une seule séquence par ouverture**, définie dans `invite.js` (`SEQ`) et recopiée telle quelle dans le
    configurateur de la vitrine (`index.html`, `SEQ`) ; même chose pour le CSS des ouvertures.

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
- Si la prod doit partir sans attendre, l'API Vercel (`create_deployment`, `target: production`, `gitSource` = le commit)
  déploie ce commit en production ; `request_promote` d'un aperçu est refusé (422) sur ce projet.

## Confidentialité

- `GEMINI_API_KEY` vient de l'environnement, jamais du dépôt ni du chat. La musique du mariage (`assets/music.mp3`)
  ne part jamais en ligne (le build le vérifie).
