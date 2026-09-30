# 05 — Prix et modèle financier

> **Révision du 30/09/2026.** Deux choses ont changé depuis la première version :
> 1. **The Digital Yes** (plus de 3 000 couples, 4,9/5 sur Trustpilot, 31 modèles) vend exactement ce type de produit à **175 € / 575 € / 975 €**. Le marché accepte donc des prix bien plus hauts que nos 89 / 189 €. Nos prix remontent : **99 / 229 / 590 €**.
> 2. On n'a plus à chercher la direction artistique pour chaque client. Les **modèles de base sont produits à l'avance**, donc le temps par commande baisse fortement (voir le §3).

## 1. Principes de prix

1. **Prix fixe par mariage, invités illimités.** C'est l'argument n°1 face au papier, et c'est la norme du marché.
2. **Se placer sous The Digital Yes, au-dessus des modèles bas de gamme.** Signature (229 €) coûte moins de la moitié de leur Premium (575 €) et inclut un lieu peint d'après photo.
3. **Trois formules** (l'effet de « l'option du milieu »). Couture capte les gros budgets et fait paraître Signature raisonnable.
4. **Comparer au papier dans le texte de vente :** « 300 invités en papier : 500 à 900 € avec l'envoi. »

### Comparaison avec les concurrents directs

| | Weddinvita | **Sceau** | The Digital Yes |
|---|---|---|---|
| Entrée de gamme | 149 € | **99 €** (libre-service, immédiat) | 175 € |
| Milieu de gamme | — | **229 €** | 575 € |
| Haut de gamme | sur devis | **dès 590 €** | 975 € |
| Délai | 48 h | **immédiat à 5 jours** | 1 à 2 semaines (express +85 €) |
| Lieu recréé | non | **oui, bibliothèque + sur-mesure** | oui (modèle « La Finca ») |
| Scènes animées au doigt | non | **oui** | partiellement |

## 2. Grille de prix (TTC)

| | **Essentiel** | **Signature** ⭐ | **Couture** |
|---|---|---|---|
| **Prix** | **99 €** | **229 €** | **dès 590 €** (sur devis, jusqu'à ~990 €) |
| Pour qui | Petits budgets, PACS, fiançailles | Le cœur de l'offre | Gros mariages, plusieurs jours, exigence artistique |
| Modèles | Les 6 modèles de base × 4 saisons | Idem | Idem + direction artistique sur-mesure |
| Lieux peints | Bibliothèque (+19 €) | Bibliothèque + **1 sur-mesure** | **Tous sur-mesure** |
| Événements | 2 | 6 | Illimités |
| Liens par invité et par groupe | — | ✔ | ✔ |
| RSVP | Simple | Complet + relances + export | + accès planner |
| Langues | 1 | 2 | 3 et plus |
| Musique | Bibliothèque ou **la vôtre** | Idem | Idem |
| Save-the-date | +29 € | ✔ inclus | ✔ |
| Vidéo 9:16 | — | ✔ | ✔ |
| Livraison | Immédiate (libre-service) | 3 à 5 jours ouvrés | 2 à 3 semaines |
| En ligne | 12 mois | 18 mois | 36 mois |

### Options
| Option | Prix |
|---|---|
| Lieu peint sur-mesure supplémentaire (d'après photo) | **+59 €** par scène |
| Lieu de la bibliothèque (Essentiel) | +19 € |
| Langue supplémentaire | +29 € |
| Événement supplémentaire (Essentiel) | +19 € |
| Save-the-date seul (sans faire-part) | 49 € |
| Livraison express 48 h | +49 € |
| Domaine personnalisé | +29 € par an |
| Remerciements et galerie photos | +39 € |
| Carte papier avec QR code (partenaire) | ~1 € la carte + envoi |
| **Pack « Toute l'histoire »** : save-the-date + faire-part + remerciements | Signature + 49 € |

### Offres de lancement
- **10 couples pilotes : −40 %** en échange d'un témoignage vidéo et de l'accord pour montrer leur faire-part.
- **Parrainage** : 20 € pour le parrain, −10 % pour le filleul.
- **Invités d'un faire-part Sceau** : −15 % avec le code affiché en bas du faire-part.
- **Planners et salles** : 15 à 20 % de commission.

## 3. Coûts unitaires (par commande)

Avec des **modèles produits à l'avance**, une commande ne demande plus de chercher une direction artistique. Il reste à remplir la config, éventuellement peindre un lieu, et vérifier.

| Poste | Essentiel | Signature | Couture |
|---|---|---|---|
| Frais Stripe (~1,5 % + 0,25 €) | 1,7 € | 3,7 € | 10 € |
| Génération IA | 0 € | ~4 € (1 lieu) | ~25 € (4 à 6 lieux) |
| Hébergement, e-mails | ~0,5 € | ~0,5 € | ~0,5 € |
| **Marge brute hors temps** | **~97 €** | **~221 €** | **~615 €** |
| Temps de travail *(H)* | ~5 min (SAV) | **~40 min** | ~4 h |
| **Marge par heure** | — | **~335 €/h** | ~155 €/h |

Répartition des ventes supposée : 50 % Essentiel · 38 % Signature · 12 % Couture (~650 € en moyenne), et ~22 € d'options en moyenne.
→ **Panier moyen ≈ 236 €**, coûts variables ≈ 8,50 € par commande, **temps moyen ≈ 47 min par commande**.

**Coût de départ (à payer une seule fois)** : produire les 6 modèles de base et la première bibliothèque de lieux (voir [mvp/plan-generation-modeles.md](mvp/plan-generation-modeles.md)). C'est de l'abonnement IA et environ 2 à 3 semaines de travail, pas du coût par client.

## 4. Charges fixes (par an)

| Poste | Prudent | Central | Ambitieux |
|---|---|---|---|
| Outils : Vercel, Supabase, Resend, abonnement IA, Figma | 2 160 € | 2 160 € | 4 000 € |
| Comptabilité | 900 € | 900 € | 1 500 € |
| RC pro | 350 € | 350 € | 350 € |
| Marque INPI | 350 € | 350 € | 350 € |
| Domaines | 50 € | 50 € | 50 € |
| Salons | 1 000 € | 2 500 € | 5 000 € |
| Publicité | 3 000 € | 9 000 € | 24 000 € |
| Production de la bibliothèque | 1 500 € | 1 500 € | 3 000 € |
| Freelance ou alternant | — | — | 30 000 € |
| **Total** | **9 310 €** | **16 810 €** | **68 250 €** |

## 5. Scénarios année 1 (octobre 2026 à septembre 2027)

| | Prudent | Central | Ambitieux |
|---|---|---|---|
| Commandes | 150 | 400 | 1 200 |
| **Chiffre d'affaires** | **35 500 €** | **94 600 €** | **283 800 €** |
| Coûts variables | 1 300 € | 3 400 € | 10 200 € |
| Charges fixes | 9 300 € | 16 800 € | 68 250 € |
| **Résultat avant rémunération et impôts** | **~24 900 €** | **~74 400 €** | **~205 400 €** |
| Heures de production | ~120 h | ~310 h | ~940 h |

> En micro-entreprise, il faut retirer ~21 à 25 % de cotisations sur le CA. Les scénarios central et ambitieux **dépassent le plafond de la micro** : passer en SASU ou EURL (doc 08).

### Seuils de rentabilité (scénario central)
- Marge par commande ≈ **228 €**
- **Couvrir les charges fixes : ~74 commandes**
- **Charges + ~21 k€ de rémunération : ~166 commandes**

## 6. Saisonnalité (scénario central, 400 commandes)

| Mois | Oct | Nov | Déc | Jan | Fév | Mar | Avr | Mai | Juin | Juil | Août | Sep |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Part | 8 % | 8 % | 6 % | 12 % | 12 % | 13 % | 12 % | 9 % | 6 % | 4 % | 3 % | 7 % |
| Commandes | 32 | 32 | 24 | 48 | 48 | 52 | 48 | 36 | 24 | 16 | 12 | 28 |

→ De janvier à avril, environ **50 commandes par mois, soit ~10 h de production par semaine** avec les modèles prêts. C'est tenable à une personne.

## 7. À partir de l'année 2
- **Pack famille** : fiançailles, henné, naissance, baptême.
- **Offre pro pour les salles et les planners** : 29 à 49 € par mois.
- **Marque blanche** pour les agences d'événementiel : 500 à 3 000 € par projet.
- **International** : prix par région (doc 09).
