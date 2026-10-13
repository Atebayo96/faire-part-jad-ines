# Publicités (vidéos et visuels fixes)

Chaque pub est une page HTML animée, filmée image par image (Playwright + ffmpeg), avec les vraies images du site.
Il faut le site servi en local : `python3 -m http.server 8765 -d business/site`.

| Dossier | Vidéo | Ce qu'elle montre |
|---|---|---|
| `ouverture/` | `save-the-oui-15s.mp4` (9:16) | La vraie ouverture d'enveloppe du site, puis les moments de Dolce Vita, la réponse et le tableau de bord, puis le logo. |
| `carrousel/` | `save-the-oui-carrousel-9x16.mp4`, `-4x5.mp4` | Tous nos univers sur un arc 3D qui défile par swipes (scène 1 de chaque thème, prénoms et date dans la police du thème). La version principale. |
| `carrousel/` | `save-the-oui-carrousel-ouvertures-9x16.mp4`, `-4x5.mp4` | Variante : chaque carte s'ouvre en arrivant au centre (enveloppe, portes, rideau, images de `img/open`). Gardée pour plus tard : les portes ont plu (6 octobre 2026). |
| `parcours/` | `save-the-oui-etapes-9x16.mp4` | « 3 étapes » : le vrai configurateur filmé (prénoms tapés, l'aperçu agrandi à côté, le thème Douce France touché, « Commander »), puis le lien envoyé dans une conversation et l'enveloppe ouverte par l'invité. |
| `parcours/` | `save-the-oui-direct-9x16.mp4` | « Vous réglez, vous voyez » : le faire-part change au toucher d'un panneau de réglages (thème, couleur du sceau, ouverture en portes). |
| `parcours/` | `save-the-oui-oui-9x16.mp4` | « Ce soir vous composez, demain les oui arrivent » : la soirée de commande, le lien prêt, envoyé à la famille, les premières réponses en notification, le tableau de bord. |
| `feuille/` | `save-the-oui-feuille-prix-9x16.mp4` (18 s) | Carte et Page unique. Accroche prix : « 200 faire-part en papier : 700 € » barré, « Le nôtre : 29 € », la carte Douce France en gros plan, envoyée dans une conversation de famille, puis les 5 univers. |
| `feuille/` | `save-the-oui-feuille-univers-9x16.mp4` (18 s) | Accroche « 5 univers. Lequel est le vôtre ? » : les feuilles défilent au rythme, gros plan sur le gaufrage d'Old money, les 3 papiers côte à côte, Carte (PNG · PDF) ou Page unique (un lien). |
| `feuille/` | `save-the-oui-feuille-mamie-9x16.mp4` (18 s) | Accroche « POV : Mamie reçoit votre faire-part » : le lien dans la conversation, la page unique de l'Andalou, l'agenda, la réponse en trois touchers, puis les oui qui arrivent sur le téléphone des mariés. |
| `statiques/` | `crea-1.jpg` à `crea-5.jpg` (4:5, 1080 × 1350) | Visuels fixes pour le fil Instagram et Facebook, un par angle de la fiche 17 : diaspora (« De Paris à Tanger »), prix contre le papier, l'ouverture aux portes, le tableau de bord, Canva contre nous. Source : `statiques/crea.html` (polices et images du site en `file://`), capturée avec Playwright. |

Rendus :
- ouverture : `node business/ads/ouverture/real.js 156` (filme le vrai moteur), puis `node business/ads/ouverture/render.js full business/landing/music/valse.mp3 1.3`
- carrousel : `node business/ads/carrousel/render.js full business/landing/music/valse.mp3 30 1920` (ou `1350` pour le 4:5 ; `OUVERTURES=1` devant pour la variante) ; la liste des univers est `carrousel/themes.json`.

- parcours : `node business/ads/parcours/captures.js` (configurateur, faire-part, tableau de bord, dans `caps/`), puis `node business/ads/parcours/render.js full <etapes|direct|oui> business/landing/music/valse.mp3 <début>`
- feuille : `node business/ads/feuille/render.js full <prix|univers|mamie> business/landing/music/valse.mp3 1.3` (`preview` pour quelques images) ; les feuilles sont dessinées en direct par `carte.js` d'après les fiches de démo (`business/invites/`), aucune image générée.

Règles : jamais d'image prolongée ou détourée (`*-eglise` en 9:21, `img/calques/`) ; l'ouverture montrée est toujours celle du vrai moteur.

Tant que le paiement en ligne n'est pas branché, les pubs ne promettent pas « en ligne dès le paiement » (le site dit « prêt sous 48 h ») : les fins des pubs parcours disent « Composez le vôtre · dès 99 € ».
