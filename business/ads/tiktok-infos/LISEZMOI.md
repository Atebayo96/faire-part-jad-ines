# TikTok : posts informatifs (carrousels de 3 images)

Des posts fixes qui **donnent une info utile** aux futurs mariés, sans vendre : la page ne doit pas être qu'une suite de pubs.
**Angle (28 octobre 2026)** : la personne se reconnaît dès la première image (« tu viens de te fiancer ? », « papier ou
numérique ? », « les erreurs que j'ai faites »), on la tutoie, on lui parle comme une copine qui vient de se marier.
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
| `out/fiances/` | dolcevita | Tu viens de te fiancer ? Avant de parler faire-part, il y a 5 choses à poser. Dans cet ordre. #fiancailles #mariage2027 #futuremariee #organisationmariage #mariage #fiancée |
| `out/date-trouvee/` | doucefrance | Tu viens de trouver ta date de mariage ? Voilà quand envoyer ton faire-part (et quand ajouter deux mois). #mariage #mariage2027 #fairepart #organisationmariage #futuremariee #datedemariage |
| `out/papier-ou-numerique/` | oldmoney | Tu hésites entre faire-part papier et faire-part numérique ? Ce n'est pas l'un ou l'autre : le bon ratio. #fairepart #mariage #mariage2027 #fairepartmariage #organisationmariage #futuremariee |
| `out/mes-erreurs/` | nuits | Les 5 erreurs que j'ai faites sur mon faire-part de mariage (pour que tu ne les fasses pas). #mariage #fairepart #erreursmariage #mariage2027 #organisationmariage #futuremariee |
| `out/ce-que-jai-appris/` | alhambra | Ce que mon faire-part de mariage m'a appris sur mes invités (et que j'aurais aimé savoir avant). #mariage #fairepart #mariage2027 #organisationmariage #futuremariee #vécu |
| `out/texte-qui-invite/` | doucefrance | Tu bloques sur le texte de ton faire-part ? Commence par la première phrase : qui invite. Les 3 formules, et les cas délicats. #fairepart #textefairepart #mariage #mariage2027 #organisationmariage #futuremariee |
| `out/personne-ne-repond/` | oldmoney | Tu as envoyé ton faire-part et personne ne répond ? Ce n'est pas qu'ils s'en fichent. Les vraies raisons, et ce qui marche. #mariage #rsvp #fairepart #organisationmariage #mariage2027 #futuremariee |
| `out/combien-viendront/` | nuits | Tu as 150 noms sur ta liste : combien vont vraiment venir ? Les proportions qu'on observe, pour dimensionner la salle sans se tromper. #mariage #listeinvites #mariage2027 #organisationmariage #budgetmariage #futuremariee |
| `out/enfants-plus-un/` | dolcevita | Mariage sans enfants ? Invités avec ou sans +1 ? Comment le dire sur ton faire-part, clairement et sans drame. #mariage #fairepart #mariage2027 #mariagesansenfants #organisationmariage #futuremariee |
| `out/dress-code/` | alhambra | Tu veux un dress code sans vexer personne ? Les phrases qui marchent, celles qui piquent. #mariage #dresscode #fairepart #mariage2027 #tenuemariage #futuremariee |
| `out/trois-jours/` | nuits | Henné, mairie, salle : tu as trois jours de fête et une seule liste d'invités ? Comment dire à chacun où il est attendu. #mariage #henné #mariagemarocain #mariagealgerien #mariageoriental #mariage2027 #fairepart |
| `out/cout-papier/` | doucefrance | Tu as 150 invités et tu penses au faire-part papier ? Le vrai calcul, timbres compris, avant de signer le devis. #mariage #budgetmariage #fairepart #mariage2027 #organisationmariage #futuremariee |

## Ordre conseillé (en alternance avec les vidéos : une pub, un post utile)

fiances → date-trouvee → papier-ou-numerique → mes-erreurs → personne-ne-repond → texte-qui-invite → combien-viendront →
ce-que-jai-appris → enfants-plus-un → dress-code → trois-jours → cout-papier.
Les posts « mes-erreurs » et « ce-que-jai-appris » parlent en « je » : c'est la voix de la marque (le faire-part d'Inès & Jad est
réel) ; à relire et à garder vrai.

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
