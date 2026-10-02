# 13 — Jeux et interactions : les petits gestes qui rendent le faire-part vivant

> L'idée : l'invité ne fait pas que lire, il **fait un geste** (gratter, tourner, souffler, signer), et quelque chose
> se révèle. C'est ce qu'on retient, ce qu'on rejoue, ce qu'on montre aux autres. C'est aussi un argument de vente
> qu'aucun concurrent ne met en avant.

## Déjà en ligne : la date à découvrir

Module `landing/reveal.js` + `reveal.css`, option `"reveal"` dans la fiche du couple (voir [11-mise-en-service.md](11-mise-en-service.md)).
Mis en avant sur la vitrine (section « La date, ils la découvrent. ») et dans l'essai en direct.

| Jeu | Option | Ce que fait l'invité | Démo |
|---|---|---|---|
| À gratter | `scratch` | Gratte une feuille d'or aux couleurs du couple, la date apparaît dessous | Emma & Louis |
| La roue | `wheel` | Touche « Tourner », la roue s'arrête toujours sur la vraie date | Giulia & Hugo |
| Le jackpot | `slot` | Tire le levier, le jour, le mois puis l'année tombent un par un | Lou & Max |

Limite actuelle : uniquement dans le faire-part page par page (pas encore dans la mise en page continue).
À décider : inclus dans toutes les formules ou option payante.

## Idées notées, à développer plus tard

Chaque idée peut devenir une nouvelle option de `reveal` (révéler la date) ou un moment ailleurs dans le faire-part.

| # | Idée | Le geste | Ce qui se révèle | Où dans le faire-part | Remarques |
|---|---|---|---|---|---|
| 1 | **Souffler les bougies** | Souffler dans le micro (ou appui long si le micro est refusé) | La date dans la fumée | Accueil (`reveal`) | Demande l'accès au micro : toujours prévoir l'appui long en secours |
| 2 | **La carte à retourner** | Toucher la carte | La date au dos | Accueil (`reveal`) | Très simple, marche avec tous les thèmes (carte de jeu, carte postale, carton d'invitation) |
| 3 | **Le cadenas des amoureux** | Faire tourner les chiffres du code (le code = la date) | Le cadenas s'ouvre | Accueil (`reveal`) | Variante romantique du jackpot, réutilise le moteur des rouleaux |
| 4 | **La buée à essuyer** | Essuyer une vitre embuée avec le doigt | La date derrière la vitre | Accueil (`reveal`) | Même moteur que le ticket à gratter, rendu plus poétique (buée blanche floutée au lieu de l'or) |
| 5 | **Le bouquet à attraper** | Toucher le bouquet qui tombe | Une étiquette avec la date | Accueil (`reveal`) | Le bouquet doit être un sprite peint dans le style du thème (règle des particules, `CLAUDE.md`) |
| 6 | **Les pétales à effeuiller** | « Il m'aime, un peu… » : enlever les pétales un par un | Le dernier pétale porte la date | Accueil (`reveal`) | Fleur peinte par thème (marguerite pour Pop rétro, rose pour Conte de fées…) |
| 7 | **Le quiz du couple** | Répondre à 2 ou 3 questions (« Où se sont-ils rencontrés ? ») | La suite du faire-part | Avant « Notre histoire » | Questions et réponses saisies par le couple ; jamais bloquant (on peut passer) |
| 8 | **Le « Oui » à signer** | Tracer sa signature au doigt sur un registre | Confirmation de venue | Réponse (RSVP) | Enregistrée avec la réponse et visible dans le tableau de bord : fort argument de vente |
| 9 | **Le toast** | Faire trinquer deux verres d'un glissement du doigt | Le message de fin | Dernière page | Petit moment de clôture, avec des confettis |

### Priorités proposées

1. **La buée à essuyer** et **le cadenas** : rapides, ils réutilisent le ticket à gratter et le jackpot.
2. **Le « Oui » à signer** : rend la réponse mémorable et donne aux mariés un souvenir (les signatures de tous les invités).
3. Le reste selon les retours des premiers couples.

### Règles à respecter pour chaque nouveau jeu

- Toujours **rejouable** et jamais bloquant : un invité qui ne joue pas peut quand même faire défiler.
- Texte jamais sous 11 px, contraste mesuré (règles 1 et 3 de `CLAUDE.md`).
- Aux couleurs du couple (palette, cire du sceau) et dans le style du thème ; objets peints, jamais de formes « V0 » dessinées en code.
- Accessible : chaque geste a une alternative au clavier ou par un simple toucher.
- Vérifié en capture au format téléphone (390 × 844), dans le faire-part, la vitrine et l'aperçu du configurateur.
