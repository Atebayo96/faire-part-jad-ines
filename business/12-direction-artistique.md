# 12 — Direction artistique : l'amour par les mains, les dos et les symboles

_1er octobre 2026. À relire avant de régénérer les scènes des thèmes._

## Le principe

- **On montre l'union sans montrer de visages.** Des mains qui se tiennent, des alliances, des fronts qui se touchent vus de dos, deux silhouettes de dos qui marchent vers le lieu, des symboles (sceau, alliances, henné, deux verres, deux fils noués). C'est plus parlant, chaque couple peut s'y reconnaître, et ça évite les visages ratés.
- **Chaque scène est découpée en calques, comme le faire-part d'Inès & Jad** : au lieu d'une vidéo, 3 à 5 images fixes détourées en pleine définition, qui bougent chacune à sa vitesse au défilement. C'est ce qui garde l'image nette et donne la profondeur.
  1. **Fond** : le ciel (nuit, aube, couchant). Bouge très peu.
  2. **Décor** : le lieu (arche, château, riad, grange). Remonte doucement du bas, comme le bâtiment de la mairie d'Inès & Jad.
  3. **Le couple ou le symbole**, au premier plan : mains, dos, alliances. Avance légèrement, respire.
  4. **Éléments flottants** : lanternes, pétales, lucioles, confettis, oiseaux. Flottent et montent à des vitesses différentes.
- Même style peint que les scènes actuelles, mêmes couleurs par thème ; tout le texte reste lisible en haut de l'écran (ciel dégagé).

## Les scènes par thème (1 accueil · 2 et 3 événements · 4 réponse)

| Thème | 1. Accueil | 2. Premier événement | 3. Second événement | 4. Réponse |
|---|---|---|---|---|
| Conte de fées | Deux mains, alliances, posées sur un livre de contes ouvert, roses | Le couple de dos sous l'arche de roses, mains jointes | Silhouettes de dos, première danse sous les lustres | Mains jointes tenant la lettre au sceau, château au loin |
| Art déco | Deux coupes de champagne qui trinquent, motifs dorés | Le couple de dos dans le grand salon, elle en robe frangée | Mains gantées sur le piano, plumes | Deux alliances sur un plateau laqué noir et or |
| Aquarelle | Deux mains entrelacées, bouquet de pivoines | De dos sous l'arche fleurie | Mains qui se tiennent sur la nappe du dîner au jardin | Deux tasses et un bouquet sur un banc |
| Bollywood | Mains couvertes de henné qui forment un cœur | Mehndi : mains de la mariée tendues, henné en cours | Le nœud sacré des deux étoles (gathbandhan) sous le mandap | Pluie de pétales sur les mains jointes |
| Trait (minimal) | Deux mains dessinées d'un seul trait | Deux silhouettes de dos sur les marches de la mairie | Deux verres et deux mains sur une table de bistrot | Une seule ligne qui relie deux alliances |
| Bohème | Mains avec bagues sur des fleurs séchées | De dos sous l'arche de pampas, coucher de soleil | Deux mains autour d'un feu de camp, bougies | Pieds nus dans le sable, deux paires de chaussures |
| À l'américaine | Deux mains, alliances, sur une barrière en bois | De dos sur la pelouse, guirlandes lumineuses | Silhouettes de dos qui dansent dans la grange | Pancarte « Just married » et les deux mains |
| Pop rétro | Deux mains qui font un cœur, couleurs vives | De dos sous les marguerites | Silhouettes sous la boule à facettes | Voiture rétro « Just married », de dos |
| Azulejos | Deux mains sur des azulejos bleus, citrons | De dos devant la chapelle blanche | Deux verres de vinho verde face à l'océan | Les mains jointes sur le parapet, couchant sur le Tage |
| Mille et une nuits | Mains de la mariée au henné, bracelets d'or | Le henné : mains tendues sur le plateau de cuivre | De dos, main dans la main dans le riad | La mariée sur l'amaria vue de dos, lanternes |
| Gravure | Deux mains, alliances, gravure à l'ancienne | De dos sur le parvis de l'église | Mains qui trinquent au dîner du château | Deux colombes et un ruban noué |
| Dolce Vita | Deux mains, citrons et céramique | De dos devant la petite chapelle | Mains jointes sur la table face à la mer | Vespa de dos, couple sur la route de la côte |

## Côté technique

- Images : Gemini (clé de l'utilisateur), lue dans la variable d'environnement **`GEMINI_API_KEY`** de l'environnement cloud. Jamais dans le dépôt, jamais dans le chat, jamais sur Vercel (le site n'en a pas besoin : les images sont fabriquées ici puis publiées).
- Pour chaque scène : générer l'image complète, puis chaque calque sur fond transparent à partir de cette image (mêmes couleurs, même cadrage), et vérifier chaque calque en grand avant publication.
- Les transitions filmées (`img/trans`) restent possibles par-dessus, mais les calques passent en premier.
