# Publicités (vidéos)

Chaque pub est une page HTML animée, filmée image par image (Playwright + ffmpeg), avec les vraies images du site.
Il faut le site servi en local : `python3 -m http.server 8765 -d business/site`.

| Dossier | Vidéo | Ce qu'elle montre |
|---|---|---|
| `ouverture/` | `save-the-oui-15s.mp4` (9:16) | La vraie ouverture d'enveloppe du site, puis les moments de Dolce Vita, la réponse et le tableau de bord, puis le logo. |
| `carrousel/` | `save-the-oui-carrousel-9x16.mp4`, `-4x5.mp4` | Tous nos univers sur un arc 3D qui défile par swipes (scène 1 de chaque thème, prénoms et date dans la police du thème). La version principale. |
| `carrousel/` | `save-the-oui-carrousel-ouvertures-9x16.mp4`, `-4x5.mp4` | Variante : chaque carte s'ouvre en arrivant au centre (enveloppe, portes, rideau, images de `img/open`). Gardée pour plus tard : les portes ont plu (6 octobre 2026). |

Rendus :
- ouverture : `node business/ads/ouverture/real.js 156` (filme le vrai moteur), puis `node business/ads/ouverture/render.js full business/landing/music/valse.mp3 1.3`
- carrousel : `node business/ads/carrousel/render.js full business/landing/music/valse.mp3 30 1920` (ou `1350` pour le 4:5 ; `OUVERTURES=1` devant pour la variante) ; la liste des univers est `carrousel/themes.json`.

Règles : jamais d'image prolongée ou détourée (`*-eglise` en 9:21, `img/calques/`) ; l'ouverture montrée est toujours celle du vrai moteur.
