# Dix jours pour tout montrer (20 au 29 novembre 2026)

But : montrer sur TikTok tout ce que le site sait faire, pas seulement le ticket et le jackpot, et voir vers quoi les gens vont
(« on se donne 10 jours pour proposer le max de trucs et avoir un retour global »). 10 posts par jour, aucune pub payante.
Le site rouvre les pages faire-part pour que ce qu'on montre puisse s'acheter (`/modeles/`, `/formules/`, `/creer/`).

## Les familles testées (chaque post porte une famille, on compare les familles, pas les posts)

| Famille | Ce qu'on montre | Produit | Matière |
|---|---|---|---|
| A. Ticket à gratter | le save-the-date, ticket | 19 € | `ads/std/videos/*-gratter.mp4` |
| B. Jackpot peint | le save-the-date, machine en maïolique (Dolce Vita seulement ; le jackpot classique est refusé) | 19 € | `ads/std/videos/dolcevita-jackpot.mp4` |
| C. La feuille | Carte et Page unique, les cinq papiers | 29 € / 59 € | `ads/feuille/`, `ads/projection/` |
| D. Les ouvertures | enveloppe, portes, rideau, voile | dès 99 € | `ads/ouverture/`, `ads/carrousel/` |
| E. Le faire-part animé | une scène par moment, la roue, la réponse | dès 99 € | `ads/feuille/…-serie`, `ads/projection/…-anime` |
| F. Le parcours | on compose, on paie, les réponses arrivent, tableau de bord | tous | `ads/parcours/` |
| G. Info utile | carrousels sans vente (organisation, date, invités, faire-part) | aucun | `ads/tiktok-infos/` |
| H. En vrai | téléphone filmé sur fond vert, notre écran incrusté | tous | prises de l'utilisateur (`ads/std/fondvert.md`) |

## Rythme d'une journée

5 carrousels G (7 h 15, 10 h 30, 14 h, 18 h, 21 h) et 5 vidéos (8 h 30, 12 h 15, 16 h 30, 19 h 30, 22 h 15).
Jours 1 à 3 : surtout A et C (ce qui existe). Jours 4 à 7 : D, E, F, et de nouvelles vidéos filmées sur le vrai site.
Jours 8 à 10 : on double les deux familles qui ressortent, H dès que les prises existent.

## Ce qu'on relève (jours 3, 6 et 10)

Par famille : vues, part vue jusqu'au bout, enregistrements, partages (`node business/tools/tiktok.mjs stats`) ; visites par
page et étapes du tunnel ; ventes par formule (`/admin/`). Bilan le jour 10 : la famille qui retient, celle qui amène des
visites, celle qui vend ; on garde, on retire, on décide du produit mis en avant.
