# Du faire-part d'Inès & Jad à une marque de faire-part numériques

> Dossier business, séparé du faire-part lui-même. Il part de ce qu'on a construit pour le
> mariage (`../index.html`, `../en.html`) et pose tout ce qu'il faut pour lancer un MVP :
> étude de marché, SWOT, pain points, positionnement, collections, prix, tech, lancement, juridique, roadmap.

**Nom : « Save The Oui »** (choisi le 3 octobre 2026 ; « Sceau » était le nom de travail). C'est le geste signature
de notre faire-part : *on touche le sceau, l'enveloppe s'ouvre, le film commence*.
D'autres pistes de nom sont listées dans [03-proposition-de-valeur.md](03-proposition-de-valeur.md#nom-de-marque).

---

## Le résumé en une page

| | |
|---|---|
| **Le produit** | Un faire-part numérique « cinéma » : une enveloppe à ouvrir, puis des scènes peintes et animées qu'on fait défiler avec le doigt (vos lieux, votre ville, votre ciel), avec musique, compte à rebours, itinéraires, ajout au calendrier, RSVP. Un simple lien à envoyer sur WhatsApp. |
| **La preuve** | Il existe déjà et fonctionne en conditions réelles : notre mariage du 17/10/2026 (Tanger, Nanterre, Le Palacio, Paris), en FR + EN, avec l'aperçu WhatsApp. Il sert de démo sous le nom de **Yasmine & Karim** ([`demo/yasmine-karim/`](demo/yasmine-karim/index.html)). |
| **Le marché** | **251 000 mariages en France en 2025** (record depuis 2014, INSEE), en hausse pour la 3e année. Un couple dépense en moyenne **~425 €** en faire-part et papeterie. S'y ajoutent ~200 000 PACS, les naissances, baptêmes, bar/bat-mitsva, fiançailles, henné… |
| **Le problème** | Le papier coûte cher pour 200 à 400 invités, part lentement, n'arrive pas chez la famille à l'étranger, et les réponses sont une chasse. Le numérique existe, mais il est **générique** (Canva, Joy, modèles Etsy) et paraît « cheap » aux yeux des parents. |
| **La concurrence** | **The Digital Yes** (175 / 575 / 975 €, plus de 3 000 couples) et **Perfect Yes** (199 / 249 / 499 €) font déjà l'enveloppe à sceau et le lieu recréé, mais **à la main : c'est cher et ça prend 1 à 3 semaines**. Ils prouvent que le marché paie ce prix. |
| **Notre différence** | **Les mêmes faire-part, prêts plus vite et moins chers.** Vos lieux, peints et animés. La mairie, l'église, la salle, la ville d'origine, dessinées dans un style unique et animées (nuages, lanternes, étoiles). Nos 6 modèles et notre bibliothèque de lieux sont produits à l'avance, donc c'est livré le jour même (Essentiel) ou en 3 à 5 jours (Signature). C'est rendu possible par un pipeline IA qu'on maîtrise déjà (images + Kling). |
| **L'offre** | **5 thèmes** (Conte de fées, À l'américaine, Bollywood, Mille et une nuits, Dolce Vita) × 4 saisons, des styles de cérémonie (mairie, église, domaine…), des scènes libres, une bibliothèque de lieux déjà peints, et un configurateur. Musique au choix : notre bibliothèque libre de droits ou celle du client. 3 formules : **Essentiel 99 €**, **Signature 229 €**, **Couture dès 590 €**, plus des options. |
| **L'économie** | Panier moyen visé **~236 €**, marge brute de **90 % ou plus** hors temps passé. Avec les modèles prêts, une commande Signature prend **~40 min** au lieu de plusieurs jours. |
| **Le plan** | 1) **MVP « concierge »** en 6 semaines : landing page, 3 démos, paiement Stripe, production à la main à partir d'un fichier de config JSON. 2) Mettre le code du faire-part en template et ajouter RSVP et tableau de bord (mois 2 à 4). 3) Éditeur en libre-service (mois 4 à 6). 4) Belgique, Suisse, Maroc et Québec, puis anglais et arabe, puis autres événements (mois 6 à 18). |
| **Objectifs** | An 1 : 150 commandes (prudent), 400 (central), 1 200 (ambitieux), soit **35 k€ / 95 k€ / 284 k€ de CA**. An 3 : environ 3 000 commandes et ~700 k€. |

---

## Sommaire

| # | Document | Contenu |
|---|---|---|
| 01 | [Étude de marché](01-etude-de-marche.md) | Taille du marché (TAM, SAM, SOM), tendances, saisonnalité, carte des concurrents et de leurs prix |
| 02 | [SWOT, pain points, personas](02-swot-pain-points-personas.md) | SWOT détaillé, problèmes des couples, des invités et des wedding planners, 5 personas |
| 03 | [Proposition de valeur et différenciation](03-proposition-de-valeur.md) | Positionnement, promesse, 7 leviers pour se démarquer, nom de marque |
| 04 | [Modèles et configurateur](04-collections-et-configurateur.md) | 6 modèles de base (dont 5 nouveaux), variantes de saison, tous les réglages du configurateur |
| 05 | [Prix et modèle financier](05-pricing-et-modele-financier.md) | Formules, options, coûts unitaires, 3 scénarios, seuil de rentabilité |
| 06 | [MVP produit et tech](06-mvp-produit-et-tech.md) | Du fichier `index.html` à la plateforme : architecture, modèle de données, budget performance, backlog |
| 07 | [Go-to-market](07-go-to-market.md) | Contenus TikTok/Reels, boucle virale, partenariats (salles, mairies, planners), SEO, salons |
| 08 | [Juridique et opérations](08-juridique-et-operations.md) | Statut, CGV, droit de rétractation, RGPD (données sensibles !), droits musique, IA, Tour Eiffel |
| 09 | [Roadmap, KPIs, risques et international](09-roadmap-kpis-risques.md) | Plan à 90 jours, jalons à 18 mois, indicateurs, registre des risques, expansion mondiale |
| 10 | [Benchmark des concurrents](10-benchmark-concurrents.md) | Missing Piece (la référence en qualité), The Digital Yes, Perfect Yes, Weddinvita : ce qu'on reprend, où on les bat |
| 11 | [Mise en service](11-mise-en-service.md) | Ce qui est prêt (moteur, démos, réponses, tableau de bord, légal), ce qu'il reste à faire, comment créer le faire-part d'un client |
| 13 | [Jeux et interactions](13-jeux-et-interactions.md) | La date à découvrir (gratter, roue, jackpot) et les idées de gestes à développer : bougies, buée, cadenas, « Oui » à signer… |
| 16 | [Ce que font les Américains](16-benchmark-americains.md) | Paperless Post, Greenvelope, Zola, Joy, Partiful, Etsy, RSVP par texto : leur parcours, leurs prix, ce qu'on leur prend (enveloppe adressée, menus, vu / répondu, relance WhatsApp, album du lendemain) et ce qu'on laisse |
| — | [`mvp/`](mvp/) | Schéma JSON d'un faire-part, 5 configs d'exemple (une par collection), questionnaire client |
| — | [`mvp/plan-generation-modeles.md`](mvp/plan-generation-modeles.md) | Plan de production des 6 modèles et de la bibliothèque de lieux (méthode, prompts, outils) |
| — | [`demo/yasmine-karim/`](demo/yasmine-karim/index.html) | Notre faire-part réel, renommé Yasmine & Karim, pour les démos |
| — | [`landing/index.html`](landing/index.html) | Landing page de test : direction galerie blanche, vraie démo jouable, modèles, lieux, prix, liste d'attente |

---

## Ce qu'on réutilise directement du faire-part d'Inès & Jad

| Brique existante (dans `../index.html`) | Devient dans le produit |
|---|---|
| Enveloppe + sceau à toucher, rabat, flash | L'**ouverture signature** de toutes les collections (sceau aux initiales et couleur de cire au choix) |
| Scènes en couches (`.stage .layer`) + séquences de 24 images Kling pilotées par le scroll | Le **moteur de scènes** : chaque collection fournit ses séquences, chaque option « Lieu peint » ajoute une scène |
| Particules (`.drifters`, lanternes `.nightfliers`) | **Particules de saison** : pétales (printemps), lucioles (été), feuilles (automne), neige (hiver), lanternes (Lanterne) |
| Compte à rebours, boutons Itinéraire et Calendrier (Google / .ics Apple) | Blocs standards pour chaque événement |
| Musique qui démarre à l'ouverture et se coupe en arrière-plan | Bibliothèque de musiques libres de droits par ambiance |
| Balises `og:` + `og_preview.jpg` (aperçu WhatsApp) | Aperçu généré automatiquement pour chaque faire-part, voire pour chaque invité |
| `en.html` (version anglaise) | Système de langues (FR, EN, AR avec affichage de droite à gauche, ES…) |
| Basmala, polices Amiri, Great Vibes, Playfair | Modules culturels et paires de polices au choix |
| Ce qu'on a appris en 47 itérations (lisibilité sur ciel clair, lenteur de l'ouverture, swipe pleine page) | Des **règles de design** intégrées aux templates, pour ne pas avoir à refaire ces 47 allers-retours à chaque client |

> ⚠️ Les chiffres de marché viennent de sources publiques (INSEE, sites des concurrents, consultés en septembre 2026).
> Les taux d'adoption, taux de conversion et coûts sont des **hypothèses à valider** pendant le MVP.
> Elles sont signalées par *(H)* dans les documents.
