# TikTok : posts informatifs (carrousels de 3 images)

Des posts fixes qui **donnent une info utile** aux futurs mariés, sans vendre : la page ne doit pas être qu'une suite de pubs.
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
| `out/quand-envoyer/` | dolcevita | Quand envoyer son faire-part de mariage ? Save the date, faire-part, date limite, relance : le calendrier qui évite les « ah bon, c'était ce week-end ? ». #mariage #mariage2027 #fairepart #organisationmariage #futursmariés #weddingplanning |
| `out/7-infos/` | doucefrance | Les 7 informations qu'un faire-part de mariage doit contenir, et les 3 qu'on oublie tout le temps. #fairepart #mariage #mariage2027 #organisationmariage #mariée2027 #weddingtips |
| `out/rsvp/` | oldmoney | Pourquoi la moitié de vos invités ne répondent pas à votre faire-part (et ce qui marche vraiment). #mariage #rsvp #fairepart #organisationmariage #mariage2027 #futursmariés |
| `out/cout-papier/` | nuits | Combien coûte vraiment un faire-part papier pour 150 invités ? Le calcul complet, timbres compris. #mariage #budgetmariage #fairepart #mariage2027 #organisationmariage #mariée |
| `out/dress-code/` | alhambra | Comment écrire le dress code sur un faire-part sans vexer personne : les formules qui marchent et les 3 erreurs. #mariage #dresscode #fairepart #mariage2027 #tenuemariage #organisationmariage |
| `out/qui-invite/` | doucefrance | Qui invite sur un faire-part de mariage ? Les parents, le couple, les deux : les trois formules et les pièges des familles recomposées. #fairepart #mariage #mariage2027 #organisationmariage #textefairepart #futursmariés |
| `out/enfants-plus-un/` | dolcevita | Mariage sans enfants, invités avec ou sans +1 : comment le dire clairement sur le faire-part, sans drame. #mariage #fairepart #mariage2027 #organisationmariage #mariagesansenfants #futursmariés |
| `out/henne-mairie-salle/` | nuits | Henné, mairie, salle : trois moments, trois listes d'invités. Comment faire un seul faire-part qui dit à chacun où il est attendu. #mariage #henné #mariagemarocain #mariagealgerien #fairepart #mariage2027 #mariageoriental |

## Ordre conseillé (après les dix vidéos, en alternance)

quand-envoyer → 7-infos → rsvp → cout-papier → dress-code → qui-invite → enfants-plus-un → henne-mairie-salle.
Les deux premiers répondent aux questions les plus cherchées (« quand envoyer », « quoi écrire ») ; le post henné parle au segment A (fiche 17).

## Idées pour la suite (à écrire dans `posts.py`)

- Save the date ou faire-part : faut-il les deux ?
- Le texte de la liste de mariage / cagnotte sans gêne.
- Combien d'invités viennent vraiment (le taux de « non » moyen) et comment dimensionner la salle.
- Inviter la famille à l'étranger : visa, lettre d'invitation, délais.
- Le faire-part de baptême : ce qui change.
