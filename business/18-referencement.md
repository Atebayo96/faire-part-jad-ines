# 18 · Référencement (SEO) : la méthode

Source : l'article « How to use Claude for SEO » (Nicholas Dulait, 10 novembre 2026), appliqué à savetheoui.fr.
Principe : des mots-clés d'acheteur, **un mot-clé = une page**, une page meilleure que les trois premières, une
checklist avant de publier, une revue chaque lundi. Jamais de pages en série qui n'apportent rien.

## 1. Un mot-clé par page

| Page | Mot-clé visé | Titre (moins de 60 caractères) |
|---|---|---|
| `/` | faire-part de mariage digital | Faire-part de mariage digital, dès 29 € — Save The Oui |
| `/modeles/` | modèles de faire-part de mariage | Modèles de faire-part de mariage digital — Save The Oui |
| `/formules/` | prix faire-part de mariage digital | Prix du faire-part de mariage digital — Save The Oui |
| `/creer/` | créer son faire-part de mariage en ligne | Créer son faire-part de mariage en ligne — Save The Oui |
| `/save-the-date/` | save the date animé | Save the date animé pour WhatsApp, 19 € — Save The Oui |
| `/questions/` | questions sur le faire-part digital | Questions sur le faire-part digital — Save The Oui |

Avant d'écrire une nouvelle page : vérifier dans la Search Console (Performances, filtre sur la requête, onglet Pages)
qu'aucune page ne ressort déjà. Si oui, on améliore celle-là.

**Les volumes ne s'inventent pas.** Ce tableau est fait sans donnée de recherche (ni Search Console, ni outil de
mots-clés branché) : c'est un choix d'intention, pas de volume. Dès que la Search Console est reliée, on le revoit avec
les vraies requêtes. Un mot-clé ne vaut que si les trois premiers résultats sont des pages de produit (avec un prix),
pas des articles, et si un site de notre taille peut entrer dans les dix premiers.

## 2. Checklist avant de publier une page

- Titre : le mot-clé au début, moins de 60 caractères, écrit pour donner envie de cliquer.
- Description : une phrase, ce que le lecteur obtient.
- Un seul `<h1>`, avec le mot-clé.
- Adresse courte, avec le mot-clé, sans date.
- Au moins 2 pages du site y mènent, avec un lien dont le texte dit où il va.
- Images compressées, `alt` qui décrit l'image.
- Données structurées : `Product` avec prix et disponibilité (`jsonld()` et `OFFERS` dans `build-site.py` : accueil,
  formules, save-the-date ; `FAQPage` tiré des questions). Un prix qui change se change aussi dans `OFFERS`.
- La page est dans `sitemap.xml` (liste `PAGES` de `build-site.py`) et n'a pas `noindex`.

## 3. Chaque lundi (une heure)

Search Console, 28 derniers jours : les requêtes en position 5 à 15, regroupées par page ; pour les 3 pages qui ont le
plus d'impressions, ce qu'il faut changer pour mieux répondre à ces requêtes. On ne retouche pas une page modifiée il y
a moins de 60 jours.

## 4. Ce qui manque encore

- Relier la **Search Console** à savetheoui.fr (validation DNS chez Hostinger) et y déposer le sitemap : sans elle,
  ni l'étape 1 ni la revue du lundi ne reposent sur des faits.
- Pages à écrire ensuite, une par mot-clé, seulement avec ce qu'on peut vraiment montrer (nos démos, nos prix) :
  une page par thème (« faire-part mariage oriental », « faire-part mariage Provence »…), « faire-part henné »,
  « faire-part baptême digital ». À valider avec les requêtes réelles avant d'écrire.
