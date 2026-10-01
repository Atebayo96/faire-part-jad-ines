# 04 — Collections et configurateur

L'offre est construite pour être **configurable sans être du sur-mesure** :
une **collection** (l'univers) × une **saison** (la palette, la lumière, les particules) × des **événements** (les scènes) × des **options**.
Chaque combinaison correspond à un fichier de config (voir [`mvp/`](mvp/)). Le moteur est le même pour tous.

---

## 0. Mise à jour du 30/09/2026 : l'offre s'organise par **thèmes**

La vitrine présente **5 thèmes**, des univers forts et faciles à choisir (comme Missing Piece ou The Digital Yes) :

| Thème | Univers | Pour qui |
|---|---|---|
| **Conte de fées** | Château sur une colline, carrosse, ciel lavande, lucioles | Mariages romantiques, château ou domaine |
| **À l'américaine** | Cérémonie en plein air, allée de chaises blanches, arche fleurie, maison coloniale, guirlandes | Cérémonies laïques, mariages en extérieur |
| **Bollywood** | Palais rose du Rajasthan, guirlandes de soucis, diyas, pétales | Mariages indiens et pakistanais, sangeet, mehndi |
| **Mille et une nuits** | Riad de nuit, arches, zellige, lanternes (notre faire-part) | Mariages orientaux, henné |
| **Dolce Vita** | Côte amalfitaine, citronniers, bougainvilliers, Vespa | Mariages d'été, destination, Méditerranée |

- **Les lieux** (mairie, église, domaine, château, ville d'origine) **s'ajoutent à n'importe quel thème**, peints dans son style.
- **Les scènes sont libres** : le couple ajoute, retire ou réordonne (rencontre, ville d'origine, henné, cérémonie, fête…).
- Les « collections » ci-dessous (Lanterne, Cathédrale, Hôtel de Ville, Champêtre, Intime, Épure) restent des **styles de cérémonie** : Lanterne devient le thème Mille et une nuits, et les autres servent de packs de scènes et de réglages par défaut.
- Visuels générés : 4 scènes par thème dans `landing/img/themes/<thème>-1..4.webp` (prénoms, cérémonie ou henné, fête, réponse), visibles dans l'aperçu interactif de la landing.

### Mise à jour du 01/10/2026 : 12 thèmes, 8 styles, 3 ouvertures
- **Styles** : Peinture (Conte de fées, À l'américaine, Bollywood, Mille et une nuits, Dolce Vita), Art déco, Aquarelle, Trait (minimal), Pop rétro, Bohème, Céramique (Azulejos), Gravure. Chaque thème a sa police et ses couleurs.
- **Ouvertures au choix** : enveloppe au sceau (aux initiales), rideau de théâtre qui se lève, grandes portes qui s'ouvrent.
- **Personnalisation sur la vitrine** : ouverture, prénoms, date, style, 5 palettes, 5 polices, avec un aperçu en direct.
- Pistes pour la suite : Hiver enchanté, Tropical, Japonais, Marin, Photo éditoriale, Gothique romantique.

## 1. Les 6 modèles de base (styles de cérémonie)

> Chaque modèle est **produit à l'avance** (scènes peintes et animées, enveloppe, musique) et **prêt à personnaliser**. La direction artistique est celle de notre faire-part. Plan de production : [mvp/plan-generation-modeles.md](mvp/plan-generation-modeles.md).

### ① LANTERNE (la collection de référence, issue de notre faire-part)
- **Pour qui :** mariages orientaux, andalous, franco-maghrébins, et mariages du soir.
- **Univers :** ciels peints du crépuscule à la nuit étoilée, lanternes qui flottent, arches et zelliges, ville d'origine (Tanger, Fès, Alger, Tunis…), dorures.
- **Scènes type :** Ouverture (sceau aux initiales) → Ciel et prénoms (basmala en option) → Ville d'origine + compte à rebours → Henné (optionnel) → Mairie → Réception de nuit → « Serez-vous des nôtres ? »
- **Musique :** oud et cordes, ou piano oriental (bibliothèque libre de droits).
- **Polices :** Great Vibes + Playfair + Amiri (arabe).
- **Particules :** lanternes, étoiles.

### ② CATHÉDRALE (mariage à l'église)
- **Pour qui :** mariages religieux chrétiens, familles traditionnelles.
- **Univers :** lumière qui traverse les vitraux, pierre blonde, lys et roses blanches, volée de cloches à l'ouverture, parvis avec pétales et riz.
- **Scènes type :** Ouverture (sceau de cire ivoire) → Faisceau de lumière et prénoms → Église (**peinte d'après la vraie**) → Vin d'honneur dans le jardin → Dîner (château ou domaine) → RSVP
- **Musique :** cordes, orgue doux, *Canon* de Pachelbel (arrangement libre de droits).
- **Polices :** Cormorant Garamond + une calligraphie fine.
- **Particules :** pétales blancs, rayons de lumière (poussière dorée).
- **Option :** livret de messe numérique (page annexe).

### ③ HÔTEL DE VILLE (mariage civil, urbain, moderne)
- **Pour qui :** mariage à la mairie puis bistrot, rooftop ou restaurant. Couples urbains, budgets serrés à moyens.
- **Univers :** façade de mairie peinte (bibliothèque des mairies d'Île-de-France, en commençant par **Nanterre, déjà faite**), confettis, drapeaux, terrasse de café, ville au coucher du soleil, ton éditorial type magazine.
- **Scènes type :** Ouverture (sceau tricolore ou couleur au choix) → Prénoms façon « une de journal » → Mairie → Apéro et dîner → RSVP
- **Musique :** jazz manouche, swing, piano bar.
- **Polices :** Playfair Display + une police à machine à écrire (mono).
- **Particules :** confettis, bulles de champagne.

### ④ INTIME (petit comité, elopement, remariage)
- **Pour qui :** moins de 50 invités, dîner dans une maison de famille, mariage à deux avec une fête après.
- **Univers :** longue table en lin, bougies, verres, mots manuscrits, lumière de fin de journée. **Le lieu est une maison, un jardin, un restaurant** peint d'après une photo du client.
- **Scènes type :** Ouverture (enveloppe kraft, ficelle au lieu du sceau) → Un seul texte manuscrit qui s'écrit à l'écran → Le lieu (peint) → Le dîner à la bougie → RSVP avec un mot personnel
- **Musique :** piano solo, guitare folk.
- **Polices :** une police manuscrite + Lora.
- **Particules :** lueurs de bougies, lucioles.
- **Spécificité :** message personnel par invité (lien individuel), pensé pour 10 à 50 personnes.

### ⑤ CHAMPÊTRE (domaine, jardin, grange)
- **Pour qui :** mariages à la campagne, en domaine, en grange ou en plein air. C'est le style le plus demandé en France.
- **Univers :** herbes hautes et lavande au matin, grange ou bastide en pierre, longue table sous les guirlandes lumineuses, nuit étoilée.
- **Scènes type :** Ouverture (champ au lever du jour) → Prénoms → Domaine (bibliothèque ou d'après photo) → Dîner sous les guirlandes → RSVP
- **Musique :** guitare folk, cordes légères.
- **Particules :** pétales de fleurs des champs, lucioles le soir.

### ⑥ ÉPURE (simple, minimaliste, le prix d'appel)
- **Pour qui :** les couples qui veulent un faire-part numérique beau, rapide et abordable. Ou un PACS, des fiançailles, un save-the-date.
- **Univers :** fond papier texturé, typographie, **une seule animation** (une tache d'encre ou d'aquarelle qui se diffuse et révèle les prénoms), monogramme.
- **Scènes type :** Ouverture (sceau simple) → Prénoms et date → Infos (lieu, horaire, boutons) → RSVP. **Pas de scène peinte** (sauf en option).
- **Musique :** optionnelle.
- **Polices :** 3 paires au choix.
- **Particules :** aucune, ou une seule discrète.
- **Rôle dans l'offre :** entièrement en libre-service. **Aucun temps de production.** C'est la porte d'entrée vers Signature.

---

## 2. Les 4 saisons (appliquées à chaque collection)

La saison change **la palette, la lumière du ciel, les particules, la végétation et la musique**. La structure reste la même.

| | Printemps | Été | Automne | Hiver |
|---|---|---|---|---|
| **Palette** | Pastels, rose poudré, vert tendre, blanc | Ocre, terracotta, bleu Méditerranée, or | Cuivre, bordeaux, olive, crème | Bleu nuit, argent, velours bordeaux, blanc |
| **Ciel** | Matin clair, nuages légers | Lumière dorée, coucher de soleil | Brume, fin d'après-midi | Neige qui tombe, nuit étoilée froide |
| **Particules** | Pétales de cerisier, pivoines | Lucioles, pétales de bougainvillier, lavande | Feuilles qui tombent, grains de raisin | Flocons, étincelles |
| **Végétation** | Glycine, pivoines, cerisiers | Oliviers, citronniers, bougainvillier | Vigne, érables, bruyère | Sapins, houx, eucalyptus |
| **Cire du sceau** | Rose poudré | Terracotta | Bordeaux | Argent |
| **Musique** | Cordes légères | Guitare, oud | Piano, violoncelle | Cordes, clochettes |

**6 modèles × 4 saisons = 24 univers prêts à l'emploi.** Production : 20 × environ 4 scènes génériques × (1 image + 24 images Kling) ≈ **80 séquences**, soit 2 à 3 semaines de production IA avant le lancement. On commence par **3 collections × 2 saisons** (voir le doc 09).

**Ambiance jour ou nuit** (réglage séparé) : les scènes du soir basculent vers le ciel étoilé, comme notre scène Palacio avec `palacio_sky_starry`.

---

## 3. Le configurateur : tous les réglages

### Étape 1 — Univers
- Collection : Lanterne · Cathédrale · Hôtel de Ville · Intime · Épure
- Saison : Printemps · Été · Automne · Hiver
- Ambiance : jour · crépuscule · nuit
- Palette d'accent : 6 préréglages, ou une couleur libre (Signature et plus)

### Étape 2 — Identité
- Prénoms, noms (ordre libre), monogramme ou initiales du sceau
- Couleur de cire, papier de l'enveloppe (ivoire, kraft, velours, marbre)
- Paire de polices (3 à 4 par collection)
- Formule d'invitation (textes prêts, modifiables) :
  - « X & Y ont la joie de vous convier à leur mariage… »
  - « Monsieur et Madame A, Monsieur et Madame B ont la joie de vous faire part du mariage de leurs enfants… »
  - « Nous nous disons oui ! »
- Module culturel : basmala, verset, citation, bénédiction (optionnel)

### Étape 3 — Événements (0 à 6, dans l'ordre choisi)
Types : **Henné** · **Mairie** · **Église** · **Nikah / mosquée** · **Houppa / synagogue** · **Cérémonie laïque** · **Vin d'honneur** · **Réception / dîner** · **Soirée** · **Brunch du lendemain**
Pour chacun : lieu (adresse → bouton Itinéraire), date et heure (→ bouton Calendrier), texte, dress code, **scène** (générique de la collection, **ou lieu peint de la bibliothèque, ou lieu peint sur-mesure** d'après photo).

### Étape 4 — Invités (Signature et plus)
- Import de la liste (CSV, collage, ou contacts)
- Groupes (Famille mariée, Famille marié, Amis, Travail…) → **les événements visibles par groupe**
- Nom sur l'enveloppe (« Chère famille Benali »), nombre de places autorisées
- Langue par invité

### Étape 5 — Réponses (RSVP)
- Par événement : oui ou non, nombre d'adultes et d'enfants
- Questions optionnelles : préférences alimentaires *(attention RGPD, voir le doc 08)*, allergies, message, chanson préférée
- Date limite (ou aucune, comme pour nous), relances automatiques
- Mode « informatif seulement » (réponse par WhatsApp au couple, comme notre version actuelle)

### Étape 6 — Pratique
- Compte à rebours · Hébergement · Parking · Transport / navette · Liste de mariage ou cagnotte (lien) · FAQ · Contact des témoins

### Étape 7 — Ambiance sonore
- Musique : bibliothèque libre de droits par modèle et saison
- **Ou la musique du client** : il importe le morceau qu'il veut (MP3 ou M4A). Il atteste en avoir le droit (voir le doc 08)
- Ou sans musique

### Étape 8 — Langues
- FR par défaut. + EN, AR (de droite à gauche), ES, PT, IT, NL (Signature : 2 langues incluses)

### Étape 9 — Partage
- Lien court personnalisé (`sceau.fr/ines-et-jad`), domaine personnalisé en option
- Aperçu WhatsApp (image et titre générés)
- Vidéo 9:16 de l'ouverture pour les statuts WhatsApp et les stories (Signature et plus)
- Carte papier avec QR code (partenaire d'impression, option)

---

## 4. Ce qui est inclus dans chaque formule

| Réglage | Épure / Essentiel | Signature | Couture |
|---|:-:|:-:|:-:|
| Collections | Épure + scènes génériques des autres collections | Toutes | Toutes, et une direction artistique sur-mesure |
| Saisons, ambiance | ✔ | ✔ | ✔ |
| Événements | 2 | 6 | Illimités |
| Lieux peints de la bibliothèque | — | ✔ | ✔ |
| Lieux peints sur-mesure (d'après photo) | option | **1 inclus** | **Tous** |
| Liens par invité et par groupe | — | ✔ | ✔ |
| RSVP et tableau de bord | ✔ (simple) | ✔ complet + relances | ✔ + accès planner |
| Langues | 1 | 2 | 3 et plus |
| Save-the-date | option | ✔ | ✔ |
| Vidéo 9:16 | — | ✔ | ✔ + montage long |
| Musique | Bibliothèque | Bibliothèque | Sur-mesure |
| Allers-retours | Libre-service | 2 | Illimités pendant 3 semaines |
| Délai | Immédiat | 5 jours ouvrés | 2 à 3 semaines |
| Mention « créé avec Sceau » | Visible (discrète) | Discrète | Retirable |
