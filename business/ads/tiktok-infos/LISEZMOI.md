# TikTok : posts informatifs (carrousels)

**Le premier post à publier : `out/erreurs/` (7 images), « Les 5 erreurs que tu dois absolument éviter sur ton faire-part »**
(28 octobre 2026 : « on va juste en faire un, on va le faire bien »). Mise en page très simple, titre de journal : fond papier
uni, texte énorme (DM Serif Display 122 px, explication 56 px), un mot clé surligné en jaune par image, une image par erreur,
une image de fin, **une photo documentaire de `img/people/` en haut de chaque image**. `python3 erreurs.py && node render.js erreurs`. Légende : « Les 5 erreurs que tu dois absolument éviter sur
ton faire-part de mariage. La 5, tout le monde la fait. #mariage #fairepart #mariage2027 #organisationmariage #futuremariee ».
**Deuxième post, en iconographie : `out/repond/` (7 images)**, « Tu as envoyé ton faire-part et personne ne t'a répondu ? » :
même mise en page, une icône au trait sur une tache jaune en haut de chaque image, aucune image générée (`icones.py`,
`node render.js repond`). Légende : « Tu as envoyé ton faire-part et personne ne t'a répondu ? Les 4 vraies raisons, et ce qui
marche. #mariage #fairepart #rsvp #organisationmariage #mariage2027 #futuremariee ».
**Troisième post : `out/choses/` (7 images)**, « 5 choses à mettre absolument dans ton faire-part » : chaque chose est montrée
par une **capture du vrai faire-part** (démo Giulia & Hugo, `node captures.js` avec le site servi sur 8765 → `caps/`), dans un
téléphone zoomé avec un cadre jaune sur l'élément (`icones.py`, `cap`, `node render.js choses`). Légende : « 5 choses à mettre absolument dans ton
faire-part de mariage. Elles t'éviteront cinquante messages la dernière semaine. #mariage #fairepart
#mariage2027 #organisationmariage #futuremariee #astucesmariage ».
**Quatrième post : `out/types/` (3 images)**, nos trois faire-part, un par image avec le vrai produit en plein téléphone
(`cap` en mode `full`) : la Carte 29 €, la Page unique dès 59 €, le Faire-part animé dès 99 €. Légende : « Trois façons de
faire ton faire-part de mariage : la Carte, la Page unique, le Faire-part animé. Dès 29 €. #mariage #fairepart #mariage2027
#organisationmariage #futuremariee #savetheoui ».
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

## Publier depuis Claude : notre outil TikTok (29 octobre 2026)

Plus de Higgsfield ni de TikTok Studio (« je veux faire le nôtre », « un truc très simple qui permet de publier quand on
veut »). Tout est dans le site : `api/_tiktok.js` (API officielle TikTok : Login Kit + Content Posting), `api/tiktok.js`
(connexion, dépôt des fichiers, file des posts), `api/tiktok-cron.js` (toutes les 10 minutes, publie ce qui est dû et relit
l'état de ce qui est parti). Côté Claude : `business/tools/tiktok.mjs` en ligne de commande et le serveur MCP
`tiktok-mcp.mjs` (`.mcp.json` : outils `tiktok_statut`, `tiktok_connecter`, `tiktok_programmer`, `tiktok_publier_maintenant`,
`tiktok_liste`, `tiktok_publier`, `tiktok_retirer`, `tiktok_verifier`). Il faut `TIKTOK_ADMIN_KEY` (clé choisie par l'utilisateur, sur Vercel et dans l'environnement de la session ; `SCEAU_SECRET` marche aussi, mais Vercel ne le réaffiche pas). Page de publication : `/admin/tiktok/` (règles d'interface de TikTok, `?lang=en` pour la vidéo de l'audit).

```
node business/tools/tiktok.mjs programmer business/ads/tiktok-infos/out/repond --date 2026-11-02 --heure 12:00 \
  --titre "Tu as envoyé ton faire-part et personne ne t'a répondu ?" --legende "… #mariage #fairepart"
node business/tools/tiktok.mjs programmer business/ads/feuille/save-the-oui-feuille-trait-9x16.mp4 --maintenant --ia --legende "…"
node business/tools/tiktok.mjs liste | publier <id> | retirer <id> | verifier | statut
```

Un dossier = un carrousel (images dans l'ordre des numéros, 35 au plus, titre 90 caractères, légende 4000) ; un `.mp4` = une
vidéo (légende 2200). `--brouillon` dépose dans l'application TikTok au lieu de publier ; `--prive` = visible par nous seuls ;
`--ia` pose l'étiquette « généré par IA » (vidéos faites avec les images des thèmes : oui ; posts en icônes : non). Les
fichiers sont déposés dans le stockage privé du site et servis à TikTok sur `/tm/<clé>` (clé imprévisible), par morceaux de
3 Mo pour les vidéos. Heures en heure de Paris. Un post en échec garde son erreur dans la liste ; `publier <id>` le relance.

**Ce qui dépend de TikTok** (réglé une fois) : une app sur developers.tiktok.com avec Login Kit et Content Posting API,
retour OAuth `https://savetheoui.fr/tiktok/retour`, domaine `savetheoui.fr` vérifié dans « URL properties » (TikTok tire les
fichiers par URL) ; sa clé et son secret sur Vercel (`TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`), jamais dans le dépôt.
Tant que l'app n'est **pas auditée**, un post direct ne peut être que **privé** : l'outil le fait tout seul et le note sur le
post ; les brouillons marchent. L'audit (quelques jours à deux semaines) se demande dans le portail avec une courte vidéo de
démo de l'outil. Recette locale (faux TikTok) jouée le 29 octobre 2026 : connexion, carrousel, vidéo par morceaux en
brouillon, cron, renouvellement du jeton, refus sans clé.

## Idées pour la suite (à écrire dans `posts.py`)

- Save the date ou faire-part : faut-il les deux ?
- La liste de mariage / cagnotte : comment le dire sans gêne.
- Inviter la famille à l'étranger : visa, lettre d'invitation, délais.
- Le faire-part de baptême : ce qui change.
- « Ce que j'aurais dû demander à mes invités dès le faire-part » (menu, allergies, hébergement).
