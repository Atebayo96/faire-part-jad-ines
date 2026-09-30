# 10 — Benchmark : les 4 concurrents à étudier

> Analyse du 30/09/2026 : sites visités, prix relevés, et assets de la démo « Raabta » de Missing Piece téléchargés pour voir comment elle est construite.

## 1. Vue d'ensemble

| | **Missing Piece** 🇮🇳 | **The Digital Yes** | **Perfect Yes** | **Weddinvita** 🇫🇷 | **Sceau (nous)** |
|---|---|---|---|---|---|
| Positionnement | **La référence en qualité** : modèles illustrés et animés, en libre-service | Mini-site privé haut de gamme, fait à la main | Mini-site élégant, fait à la main | Faire-part numérique avec RSVP, livré en 48 h | Scènes peintes et animées, lieux déjà prêts |
| Prix | **INR 3 999 (~40 €)**, prix unique | 175 / 575 / 975 € | 199 / 249 / 499 € | 149 € | 99 / 229 / 590 € |
| Délai | **10 minutes** (le client remplit lui-même) | 1 à 2 semaines | ~3 semaines en haute saison | 48 h | Immédiat à 5 jours |
| Nombre de modèles | Une vingtaine, **classés par tradition** (hindou, musulman, sikh, chrétien, sud-indien) | 31 | 3 | 8 | 6 (prévus) |
| Preuve sociale | Témoignages | Plus de 3 000 couples, 4,9/5 Trustpilot | 4,94/5 sur 155 avis | — | Notre mariage |
| Plusieurs événements | ✔ (6 dans la démo : Mehendi, Manjha, Sangeet, Fiançailles, Nikah, Walima), **pages privées par événement** | ✔ | ✔ | ✔ | ✔ |
| Musique | **N'importe quel MP3** | Au choix | Au choix | Au choix | Bibliothèque ou MP3 du client |
| Photos du couple | ✔ **Au cœur du design** (séance pré-mariage) | ✔ | ✔ (Love Letter) | ✔ | ❌ **à ajouter** |
| Modifiable après l'envoi | ✔ en direct | ✔ | ✔ | — | ✔ |
| Technique | Modèle **Framer** que le client personnalise lui-même, hébergement gratuit | Fait à la main | Fait à la main | Fait à la main | Notre propre moteur (HTML/JS) |

## 2. Pourquoi Missing Piece est si fort (et ce qu'on reprend)

Leur démo « Raabta » (mariage musulman) est construite à partir d'**une trentaine de calques séparés**, chacun animé indépendamment :
- **Des décors peints en bandes verticales très hautes** (ciel texturé façon peinture, palais, tapis vert qui mène au bâtiment) qui défilent comme un long travelling.
- **Des éléments détourés** qui bougent chacun à leur rythme (parallaxe) : lanternes, bouquets de fleurs, cadre ornemental, **voitures anciennes**, textures de tissu (damas, motifs).
- **Les photos du couple** (séance pré-mariage) intégrées dans des cadres.
- Des **icônes au trait fin** pour les infos pratiques (voiture = itinéraire, personne = dress code…).
- Une typographie simple, beaucoup d'espace, **la basmala en en-tête**, les parents des deux côtés, puis 6 événements.

**Ce que ça nous apprend :**

| Leçon | Ce qu'on fait |
|---|---|
| **La richesse vient des calques, pas d'une image unique.** Une scène = un fond + 5 à 10 éléments qui bougent à des vitesses différentes | On a déjà le principe (lanternes `nuit_lantern_1..5` avec `data-rate`, bâtiments qui remontent, `el_lantern`, `el_leaves`). On le **généralise** : chaque modèle a une **bibliothèque d'éléments** détourés (fleurs, lanternes, voitures, cadres, arches, bougies, oiseaux) en plus des scènes |
| **Classer par tradition**, pas seulement par style | Navigation « Musulman · Chrétien · Civil · Juif · Mixte · Laïque » **en plus** des 6 modèles |
| **Libre-service en 10 minutes à ~40 €** : c'est le vrai plancher du marché | Notre **Essentiel à 99 €** doit être aussi simple (formulaire → publié). Pour un public français et un rendu plus « peint », 99 € reste crédible. On peut **tester 69 €** |
| **Les photos du couple rendent le faire-part vivant** | Ajouter un bloc « Photos » (1 à 6 photos dans des cadres du modèle) à toutes les formules |
| **Des pages privées par événement** | Déjà prévu (groupes d'invités), c'est à mettre en avant |
| **Icônes au trait + textes courts** | À reprendre pour les infos pratiques (on a des boutons « Itinéraire » et « Calendrier », c'est bien, on ajoute les icônes) |

## 3. Où on peut les battre

1. **Les lieux réels peints** : Missing Piece utilise des palais génériques. Nous, **la vraie mairie et la vraie salle** du couple, déjà dans la bibliothèque.
2. **L'ouverture** : enveloppe, sceau, flash. Missing Piece n'en a pas.
3. **Le marché français et la francophonie** : ils sont en anglais, en roupies, centrés sur l'Inde. **Personne ne fait ce niveau de qualité en libre-service en français.**
4. **Les ciels animés en vraie vidéo** (Kling, 24 images au scroll) en plus de la parallaxe des éléments : un mouvement « vivant » que la parallaxe seule n'a pas.
5. **Le public franco-maghrébin** : basmala, arabe, henné, mairie puis salle. Missing Piece prouve avec « Raabta » que ça se vend (en Inde et aux Émirats).

## 4. Ce qu'il faut rattraper
- **Photos du couple** (bloc à ajouter).
- **Bibliothèque d'éléments détourés** par modèle (voir [mvp/plan-generation-modeles.md](mvp/plan-generation-modeles.md)).
- **Un éditeur en libre-service vraiment en 10 minutes** (phase 2 du doc 06). C'est leur plus gros avantage.
- **Preuve sociale** : avis et nombre de couples, dès les 10 premiers clients.

Sources : [Missing Piece](https://www.missingpieceinvites.com/) · [démo Raabta](https://www.missingpieceinvites.com/demos/raabta) · [The Digital Yes](https://www.thedigitalyes.com/fr) · [Perfect Yes](https://www.perfect-yes.com/) · [Weddinvita](https://www.weddinvita.com/guide/faire-part-mariage-digital)
