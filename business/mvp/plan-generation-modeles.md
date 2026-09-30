# Plan de génération : 6 modèles de base + bibliothèque de lieux

La direction artistique est trouvée (notre faire-part : peinture douce, lumière dorée, ciels animés, bâtiment en couche séparée qui remonte au scroll).
On la réutilise pour produire **à l'avance** 6 modèles complets que le client n'a plus qu'à personnaliser.

## Méthode (la même pour chaque scène)

| Étape | Outil | Réglages |
|---|---|---|
| 1. Image fixe de la scène, format vertical | GPT Image 2.5 (Higgsfield), **avec nos scènes en référence de style** (`landing/img/ciel.webp`, `mairie.webp`, `reception.webp`, `nuit.webp`) | 9:16, 2k, qualité high |
| 2. Bâtiment détouré (scènes de lieu) | GPT Image 2.5, `background: transparent` | Même cadrage que l'étape 1 |
| 3. Ciel ou ambiance animés | **Kling 3.0**, image de départ = l'image fixe | 9:16, 5 s, mode std, **son off** (moins cher) |
| 4. Découpage en 24 images | ffmpeg → WebP qualité 75 | Comme `mairie_frames/` et `palacio_frames/` |
| 5. Intégration | Config JSON du modèle (`mvp/collections/*.json`) | Non-régression visuelle avec Playwright |

**Prompt de base (commun à toutes les scènes) :**
> Soft painterly illustration, gentle gouache and oil texture, warm diffused light, delicate brush strokes, elegant and calm, vertical 9:16 composition, generous empty sky in the upper third for text, no text, no letters, same art direction as the reference images.

## Les 6 modèles (1 saison au départ, les 3 autres ensuite)

| Modèle | Saison de lancement | Scènes à produire | Déjà fait |
|---|---|---|---|
| **Lanterne** | Été (nuit) | Sceau **Y&K** pour la démo | Tout le reste (notre faire-part) |
| **Hôtel de Ville** | Printemps | Ouverture (confettis, toits de Paris au matin), apéro en terrasse, fin (ville au coucher du soleil) | Mairie de Nanterre |
| **Cathédrale** | Automne | Ouverture (rayon de lumière dans les vitraux), église générique, vin d'honneur au jardin, château de nuit | — |
| **Champêtre** | Été | Ouverture (champ de lavande ou d'herbes au matin), domaine ou grange, longue table sous les guirlandes, nuit étoilée | — |
| **Intime** | Printemps | Ouverture (mains, lettre manuscrite), maison de famille, table aux bougies | — |
| **Épure** | Hiver | 1 animation d'encre ou d'aquarelle sur papier, neige discrète | — |
| **Enveloppes et sceaux** | — | 1 enveloppe par modèle (papier, couleur) + 1 sceau vierge par couleur de cire | Enveloppe ivoire, sceau doré |

**Total de départ :** ~17 scènes (image + couche bâtiment + animation) + ~6 enveloppes et sceaux, avec des essais.
**Coût :** à mesurer sur la première scène avant de lancer le reste (solde Higgsfield actuel : 600 crédits, plan Pro).

## Le sceau aux initiales (pour chaque commande)
Le sceau actuel a « J&I » gravé dans l'image. Deux options :
1. **Générer un sceau par commande** (1 image, quelques secondes) : le rendu est parfait, mais ça coûte un peu à chaque client.
2. **Un sceau vierge + les initiales en relief en CSS** (ombre intérieure et dégradé doré) : gratuit et instantané, pour la formule Essentiel.

→ Option 2 pour Essentiel, option 1 pour Signature et Couture.

## Bibliothèque de lieux (en parallèle)
Même méthode, étape 2 (bâtiment détouré) + un ciel de la bibliothèque (jour, crépuscule, nuit étoilée, déjà animés).
Priorité : **20 mairies d'Île-de-France** (les plus demandées) + **10 salles de réception** partenaires + **10 villes d'origine** (Tanger, Casablanca, Fès, Marrakech, Alger, Oran, Tunis, Dakar, Lisbonne, Istanbul).
