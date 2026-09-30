# 02 — SWOT, pain points et personas

## 1. SWOT

### Forces (internes)
- **Un produit qui existe et marche vraiment** : notre propre faire-part, envoyé en 2026. Démo, preuve sociale et premier témoignage en même temps.
- **Un rendu que personne n'a** : scènes peintes, animation pilotée par le doigt (24 images Kling par scène), ouverture d'enveloppe avec sceau, particules, musique. On passe de « carte » à « court-métrage interactif ».
- **Le savoir-faire IA** : on sait produire une scène cohérente (image puis animation Kling) et l'intégrer. Le **coût marginal d'un lieu peint est de quelques euros**, contre des centaines chez un motion designer.
- **Pensé pour WhatsApp** : aperçu soigné, pas d'app, ouverture en 1 tap, calendrier Apple et Google, itinéraire.
- **Plusieurs cultures et plusieurs langues dès le départ** : FR, EN, arabe (Amiri, basmala), plusieurs événements (mairie, réception…).
- **Tech et design en interne** : pas d'agence à payer, on itère vite (47 itérations sur notre faire-part).

### Faiblesses (internes)
- **Production artisanale** : notre faire-part a demandé des dizaines d'heures. Sans templates, **ce n'est pas rentable**. C'est le chantier n°1 du MVP (doc 06).
- **Code écrit pour un seul mariage** : noms, lieux et dates sont en dur dans `index.html`, et il y a 3 copies (`index`, `en`, `test4`).
- **Pages lourdes** : environ 34 Mo d'assets dans le repo (séquences d'images, PNG). Il faut un budget de performance pour la 4G.
- **RSVP par WhatsApp seulement** : pas de base de données, pas de tableau de bord, pas de relance.
- **Une seule référence**, pas encore de marque, pas d'avis clients.
- **Tout repose sur 1 ou 2 personnes** (temps, saisonnalité, SAV le week-end avant les mariages).
- **Droits de la musique** à régler : la piste actuelle ne peut pas être revendue (doc 08).

### Opportunités (externes)
- Des mariages **en hausse depuis 3 ans** (251 000 en 2025).
- De **gros mariages** (200 à 500 invités) où le papier coûte cher et où **la famille est à l'étranger**.
- Des **concurrents qui vendent des modèles génériques** : la place du « lieu peint » est libre.
- La **baisse continue des coûts** de la vidéo IA, avec une qualité qui monte.
- **Des achats en plusieurs fois** : save-the-date, puis faire-part, puis remerciements et galerie, puis naissance, baptême, anniversaire. **Un client peut revenir pendant 10 ans.**
- **Une boucle virale** : chaque faire-part est vu par 150 à 400 invités, et une partie se mariera dans les 2 ans.
- **Les partenariats avec les salles** : une salle dont le bâtiment est déjà peint dans notre bibliothèque devient un apporteur d'affaires.
- La francophonie puis l'international (EN, AR, ES).

### Menaces (externes)
- **Guerre des prix** : Canva et Joy sont gratuits, Etsy est à 10–30 €, Weddinvita à 149 €.
- **Copie** : le scroll-animation se copie en quelques semaines. Ce qui nous protège, c'est la bibliothèque de lieux, la marque et la qualité d'exécution.
- **Les couples le font eux-mêmes avec l'IA** : les outils grand public (Higgsfield, Kling, Canva AI) deviennent accessibles. Notre réponse : garder l'avance sur l'intégration (RSVP, multi-événements, langues, performance), pas seulement sur l'image.
- **Dépendance aux fournisseurs IA** : prix, conditions d'usage commercial, disparition d'un modèle.
- **Le numérique paraît « cheap » aux parents et grands-parents.** Réponse : l'effet waouh, et une carte papier « souvenir » avec QR code en option.
- **Saisonnalité** : 60 % des ventes en 5 mois, trésorerie en creux l'été.
- **Risques juridiques** : musique (SACEM), données sensibles des invités (régimes halal ou casher = religion), éclairage de la Tour Eiffel (doc 08).
- **Plateformes** : WhatsApp peut changer ses aperçus, un navigateur intégré (Instagram, WhatsApp) peut bloquer l'autoplay audio.

### Stratégies croisées (ce que le SWOT nous dit de faire)

| | Opportunités | Menaces |
|---|---|---|
| **Forces** | **S-O** : cibler d'abord les gros mariages multiculturels et la diaspora avec la collection Lanterne. Construire la **bibliothèque de lieux peints** (mairies et salles d'Île-de-France) avec les salles comme partenaires | **S-T** : ne pas se battre sur le prix. Vendre le lieu peint et l'expérience. Garder l'avance sur le produit complet (RSVP, multi-événements, langues), plus dur à copier qu'un effet visuel |
| **Faiblesses** | **W-O** : utiliser les 10 premiers clients (concierge) pour transformer notre code en templates. Chaque nouvelle scène entre dans la bibliothèque | **W-T** : formule Essentiel en libre-service pour les petits budgets. Musique libre de droits dès le jour 1. Avoir plusieurs fournisseurs IA |

## 2. Pain points

### 2.1 Les couples (l'acheteur)

| # | Problème | Intensité | Notre réponse |
|---|---|---|---|
| 1 | **Coût du papier et de l'envoi** pour 200 à 400 invités (plus de 500 € avec les timbres) | ●●●●● | Prix fixe, invités illimités |
| 2 | **La famille à l'étranger** : papier lent, perdu, cher | ●●●●● | Un lien WhatsApp, plusieurs langues, arabe de droite à gauche |
| 3 | **Courir après les réponses** : relancer 150 personnes, tenir un tableur | ●●●●○ | RSVP par événement, tableau de bord, relance en 1 clic, export Excel |
| 4 | **Plusieurs événements avec des invités différents** (henné, mairie, réception) | ●●●●○ | Liens par groupe : chaque invité ne voit que ses événements |
| 5 | **« Le numérique, ça fait cheap »** (peur du regard des parents) | ●●●●○ | Ouverture d'enveloppe, lieux peints, musique : un effet waouh qui se voit dès l'aperçu |
| 6 | **Les modèles se ressemblent tous** | ●●●○○ | Vos lieux et votre ville, peints : c'est unique par construction |
| 7 | **Pas le temps** de faire soi-même (Canva, montage vidéo) | ●●●○○ | Un questionnaire de 10 minutes, on livre en 5 jours (Signature) |
| 8 | **Une info change** (horaire, salle) après l'envoi | ●●●○○ | Modifiable jusqu'au jour J, le lien ne change pas |
| 9 | **Adresses postales introuvables** (jeunes, amis) | ●●○○○ | Il suffit d'un numéro de téléphone |
| 10 | **L'écologie** | ●●○○○ | Zéro papier. Carte QR code en option, sur papier recyclé |

### 2.2 Les invités (l'utilisateur, et nos futurs clients)

| Problème | Notre réponse |
|---|---|
| Perdre le faire-part, oublier la date | Ajout au calendrier en 1 tap, rappel avant le jour J |
| Trouver l'adresse, se garer | Bouton Itinéraire, infos parking et hébergement |
| Ne pas savoir quoi porter, quoi offrir | Blocs Dress code, Liste de mariage ou cagnotte |
| Répondre sans galérer | RSVP en 20 secondes, sans compte, avec le prénom déjà rempli grâce au lien personnel |
| Ne pas comprendre la langue | Sélecteur de langue (FR / EN / AR…) |
| Personnes âgées peu à l'aise sur smartphone | Très gros boutons, pas de compte, ça marche même si on n'ouvre que le lien, carte QR papier en option |

### 2.3 Les wedding planners et les salles (les prescripteurs)
- Tenir un fichier d'invités propre (nombre de personnes, régimes, enfants) → **export et accès « planner »** au tableau de bord.
- Se différencier auprès de leurs clients → **leur salle peinte offerte** et une **commission de 15 à 20 %**.

## 3. Personas

| Persona | Profil | Besoin n°1 | Formule probable | Collection |
|---|---|---|---|---|
| **Yasmine & Karim** | 29–34 ans, franco-marocains, Île-de-France, **350 invités**, henné + mairie + salle, familles à Casablanca et Tanger | Diaspora, plusieurs événements, rendu « digne » pour les parents | **Signature + options** (henné, arabe) | **Lanterne** |
| **Claire & Thomas** | 32–36 ans, cadres, mariage à l'église en Bourgogne, 150 invités, famille traditionnelle | Élégance, faire accepter le numérique aux grands-parents | Signature + carte QR papier | **Cathédrale** (automne, vignes) |
| **Léa & Sofiane** | 27–30 ans, Paris, mairie du 11e + dîner au bistrot, 80 invités, budget serré | Rapide, pas cher, joli | Essentiel | **Hôtel de Ville** |
| **Marc & Julien** | 40–45 ans, remariage ou petit comité, 30 invités, dîner dans une maison de famille | Intime, sobre, raffiné | Signature (maison peinte) | **Intime** |
| **Nadia (wedding planner)** | 20 à 40 mariages par an, Île-de-France, clientèle orientale et mixte | Proposer un plus à ses clients, être commissionnée | Prescriptrice | Toutes |

Pour démarrer : **Yasmine & Karim** (gros panier, besoin très fort, une communauté qui se parle beaucoup) et **Nadia** (volume).
