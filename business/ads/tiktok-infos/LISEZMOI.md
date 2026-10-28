# TikTok : posts informatifs (carrousels)

**Le premier post à publier : `out/erreurs/` (7 images), « Les 5 erreurs que tu dois absolument éviter sur ton faire-part »**
(28 octobre 2026 : « on va juste en faire un, on va le faire bien »). Mise en page très simple, titre de journal : fond papier
uni, texte énorme (DM Serif Display 122 px, explication 56 px), un mot clé surligné en jaune par image, une image par erreur,
une image de fin, **une photo documentaire de `img/people/` en haut de chaque image**. `python3 erreurs.py && node render.js erreurs`. Légende : « Les 5 erreurs que tu dois absolument éviter sur
ton faire-part de mariage. La 5, tout le monde la fait. #mariage #fairepart #mariage2027 #organisationmariage #futuremariee ».
La version « feuille sur fond peint » ci-dessous (texte plus petit, « les gens ne vont pas le lire ») reste pour mémoire.

Des posts fixes qui **donnent une info utile** aux futurs mariés, sans vendre : la page ne doit pas être qu'une suite de pubs.
**Ton validé (28 octobre 2026)** : la première image est une phrase simple et complète que la personne se dit (« Tu as envoyé
ton faire-part et personne ne t'a répondu ? ») ou une liste (« Les 5 erreurs à éviter », « 5 choses qui ont sauvé mon
mariage ») ; tutoiement, mots simples, pas d'expression, pas de chiffre comme accroche, jamais de vente. **Le texte se valide
en chat avant tout rendu.** On commence par trois posts ; les autres textes validés attendent dans `candidats.md`.
Chaque post = 3 images 1080 × 1920 (`out/<post>/`) : 1) l'accroche, 2) le contenu, 3) « à retenir ». Le texte tient dans une
feuille de papier (comme la Carte), posée sur le fond peint d'un univers, sceau de cire, signature « Save The Oui » discrète.
La zone basse (légende, boutons TikTok) et le bord droit restent libres.

Fabrication : `python3 build.py` (HTML dans `html/`) puis `node render.js` (JPG dans `out/`). Les textes sont dans `posts.py`.
Le rendu refuse tout débordement (« DÉBORDE ») ; typographie française (espaces insécables), chiffres alignés, contraste de
l'encre et des accents ≥ 4,5:1 sur le papier le plus sombre.

## Publier (TikTok Studio, « Photos »)

1. « Sélectionner » → les 3 images du dossier, dans l'ordre 1, 2, 3.
2. Coller la légende ci-dessous (hashtags compris). Son : une musique calme de la bibliothèque TikTok, ou aucun.
3. Commentaires activés. Programmer à 12 h, **en alternance avec les vidéos** (`tiktok-calendrier.md`) : une pub, un post utile.

## Les posts et leurs légendes

| Dossier | Univers | Légende |
|---|---|---|
| `out/personne-ne-repond/` | oldmoney | Tu as envoyé ton faire-part et personne ne t'a répondu ? Ce n'est pas qu'ils s'en fichent. Les vraies raisons, et ce qui marche. #mariage #fairepart #rsvp #organisationmariage #mariage2027 #futuremariee |
| `out/5-erreurs/` | doucefrance | Tu prépares ton mariage ? Les 5 erreurs à éviter sur ton faire-part. #mariage #fairepart #mariage2027 #organisationmariage #futuremariee #erreursaeviter |
| `out/5-choses/` | nuits | 5 choses que j'ai mises dans mon faire-part et qui ont sauvé mon mariage. #mariage #fairepart #mariage2027 #organisationmariage #futuremariee #astucesmariage |

## Publier depuis Claude (connecteur Higgsfield)

Le connecteur Higgsfield publie sur TikTok des carrousels photo (JPEG, 1080 × 1920, jusqu'à 35 images) : une fois le
compte relié (lien d'autorisation à ouvrir, valable 10 minutes, `tiktok_connect`), les images sont déposées chez
Higgsfield puis un formulaire de publication est proposé ; mode `UPLOAD_TO_DRAFT` = le post arrive **dans les brouillons
de l'application TikTok**, il ne reste qu'à appuyer sur Publier. Pas d'heure programmable par ce chemin.

## Idées pour la suite (à écrire dans `posts.py`)

- Save the date ou faire-part : faut-il les deux ?
- La liste de mariage / cagnotte : comment le dire sans gêne.
- Inviter la famille à l'étranger : visa, lettre d'invitation, délais.
- Le faire-part de baptême : ce qui change.
- « Ce que j'aurais dû demander à mes invités dès le faire-part » (menu, allergies, hébergement).
