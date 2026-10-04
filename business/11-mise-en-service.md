# 11 — Mise en service : ce qui est prêt, ce qu'il reste à faire

_Mis à jour le 3 octobre 2026 : plan de lancement par priorités._

## Ce qui est en place

| Sujet | État | Où |
|---|---|---|
| Formulaire « Réserver ma place » | Envoie vraiment la demande (nom, e-mail, date, formule, choix faits dans l'essai) | `landing/index.html` → `/api/lead` |
| Pages légales | Mentions légales, CGV, confidentialité, avec les champs à compléter **[entre crochets]** surlignés en jaune | `legal/*.md` → `python3 business/legal-template.py` |
| Allégations corrigées | Plus de « Le plus choisi », de « TTC », de « Prêt tout de suite » ni de « 4 saisons » ; langues FR · EN | `landing/index.html` |
| Aperçu WhatsApp et icône | Image d'aperçu pour la vitrine et pour chaque faire-part | `og-sceau.jpg`, `d/<slug>/og.jpg`, `favicon.svg` |
| **Moteur de faire-part** | Ouverture (enveloppe, rideau, voile opaque qui s'ouvre par le milieu, grandes portes), défilement page par page comme notre faire-part (un swipe = la scène suivante, calée plein écran), décors animés au défilement (720 px), pages animées (zoom lent, parallaxe, apparition des textes, particules par thème), musique, compte à rebours (début, page dédiée, fin, aucun), itinéraire, ajout au calendrier (Google, Apple, Outlook), infos pratiques, réponses des invités, **liens par famille** (`?f=famille-martin` : message d'accueil et événements filtrés), FR et EN | `landing/invite.js`, `landing/invite.css` |
| Démos | 12 démos, une par thème, plus Yasmine & Karim (notre faire-part réel, avec une musique libre) | `invites/*.json` → `/d/<slug>/` |
| Réponses des invités | Enregistrées en Europe (Paris), une seule réponse gardée par personne, supprimées automatiquement 90 jours après le mariage | `/api/rsvp`, `/api/purge` (tous les jours à 4 h) |
| Tableau de bord des mariés | Totaux, détail par événement, liens par famille à copier, recherche, export CSV pour le traiteur | `/tableau/` (exemple : `/tableau/?demo=emma-louis`) |
| Admin | Demandes reçues et liens des tableaux de bord de chaque faire-part | `/admin/` (clé : variable `SCEAU_SECRET` sur Vercel) |
| Musique | 7 morceaux libres de droits, sources notées | `landing/music/CREDITS.md` |

## Plan de lancement (décidé le 3 octobre 2026)

Fait : stockage Blob `sceau-donnees` branché et testé en prod ; pages légales avec l'éditeur (Jad GHAILAN EI, nom commercial Noctuna, SIRET 100 079 342 00018, TVA non applicable art. 293 B) ; ajout de l'activité « Activités spécialisées de design » (libérale) déposé en brouillon sur le guichet INPI.

| Prio | Sujet | Détail | État |
|---|---|---|---|
| 1 | **Stripe** | Nouveau compte « Maison Sceau » dans le Stripe existant (pas le compte du projet heritage, en clés de test), virements vers Shine, 2 Payment Links (Essentiel 99 €, Signature 229 €) → `landing/paiement.js` | en cours |
| 2 | **Nom de domaine** | `maisonsceau.fr` + `maisonsceau.com` (libres au 3/10/2026), à brancher sur le projet Vercel, puis e-mail `contact@` | à faire |
| 3 | **Médiateur CM2C** (48 €) | ⚠️ **Obligatoire avant la première vente** : on n'active pas les liens de paiement sur le site tant que le médiateur n'est pas dans les CGV (`legal/cgv.md`, article 11) | à faire |
| 4 | **Parcours client en libre-service** | Espace client (connexion par lien e-mail), éditeur complet avec aperçu, publication automatique, paiement pour publier. Essentiel 100 % automatique, Signature avec le lieu peint ajouté à la main | à faire |
| 5 | **Nettoyer la vitrine** | On propose trop de choses : réduire les options, simplifier les formules et l'essai | à faire |
| 6 | **Simuler 2 ou 3 parcours complets** | De la vitrine au faire-part publié et aux réponses des invités, au format téléphone | à faire |

Ne pas oublier :
- **Lundi** : France Identité à la mairie, puis signer avec FranceConnect+ le brouillon « ajout activité » sur formalites.entreprises.gouv.fr (délai légal : un mois après la première vente).
- **E-mail de contact** à mettre dans les 3 pages légales (`legal/*.md`).
- **Adresse** de l'éditeur : retirée à la demande, mais obligatoire pour vendre à distance (Code de la consommation) : la remettre ou prendre une domiciliation avant la première vente.
- Déclarer chaque mois le CA Sceau dans la case « prestations de services libérales (BNC) » sur autoentrepreneur.urssaf.fr ; surveiller le seuil de franchise de TVA des services.
- Clé admin : Vercel → Settings → Environment Variables → `SCEAU_SECRET` (ouvre `/admin/`). Ne la partage pas.

## Paiement Stripe (à faire une fois)

1. Créer le compte sur stripe.com (statut auto-entrepreneur, IBAN pro). Dans Paramètres → Informations publiques, indiquer l'adresse des CGV : `https://sceau-faire-part.vercel.app/cgv/`.
2. Catalogue de produits : créer **Essentiel** (99 €) et **Signature** (229 €), paiement unique.
3. Pour chacun : **Créer un lien de paiement** → onglet « Après le paiement » → **Ne pas afficher la page de confirmation, rediriger vers votre site** : `https://sceau-faire-part.vercel.app/merci/`. Activer « Autoriser les codes promotionnels » si on fait l'offre de lancement (code créé dans Produits → Coupons).
4. Copier les deux liens (`https://buy.stripe.com/...`, ce ne sont pas des secrets) dans `business/landing/paiement.js`, puis `python3 business/build-site.py`, commit et déploiement. Les boutons « Choisir » ouvrent alors la commande : récapitulatif, conditions de vente et renonciation au délai de rétractation cochées (gardées avec la demande dans `/admin/`, marquée « commande » avec sa référence), puis la page Stripe avec l'e-mail pré-rempli. La même référence apparaît dans Stripe (« client_reference_id »).

## Réponses des invités

Chaque invité peut changer sa réponse : sur le même téléphone, la fenêtre est pré-remplie ; après l'envoi, il reçoit un lien personnel (`?r=…`) qui permet de la modifier depuis un autre téléphone. La nouvelle réponse remplace l'ancienne dans le tableau de bord.

## Créer le faire-part d'un client

1. Copier une démo proche : `cp business/invites/emma-louis.json business/invites/prenom1-prenom2.json`.
2. Changer `slug` (identique au nom du fichier), `demo` → `false`, prénoms, date, événements (adresse exacte pour l'itinéraire), familles, textes, couleur du sceau (`palette`), ouverture, musique.
3. `python3 business/build-site.py`, puis commit et déploiement.
4. Dans `/admin/`, copier le lien du tableau de bord et l'envoyer aux mariés ; ils y trouvent aussi les liens par famille.

Écrans en option (chacun est facultatif, voir les démos pour des exemples) : `parents` (le mot des familles), `story` (notre histoire, avec `photos` possibles), `program` (le programme heure par heure), `dress` (dress code et couleurs), `stay` (hébergement et accès), `faq` (vos questions), `gifts` (liste de mariage ou cagnotte), `photos` (album partagé après le mariage), et `table` dans une famille (`families.<id>.table`) pour afficher sa table sur son lien personnel. Un lien `"url": "demo"` affiche une explication au lieu d'ouvrir un site.

Décor de chaque événement (choisi par le client à l'étape « Vos écrans » de la vitrine, repris dans sa demande) : `"lieu": "mairie" | "eglise" | "salle" | "jardin" | "plage"` pour une scène de la bibliothèque du thème (`img/hd/<thème>-<lieu>.webp`), ou `"bg": "simple"` pour un écran simple (le texte sur le fond du tableau, `img/hd/<thème>-fond.webp`). Sans rien, l'événement prend les scènes 2 et 3 du thème. Régénérer : `python3 business/tools/lieux.py [thème ...] [--lieux mairie,fond] --force` (contrôle de lisibilité et retouche automatiques).

Calques (sujets détourés, posés entiers sur le fond du thème, plus de rognage selon le téléphone) : `python3 business/tools/calques.py <thème ...> [--only 2,eglise] [--force] [--hint "consigne"]` → `img/calques/<thème>-<clé>.webp`, pris en compte au prochain `build-site.py` (une scène sans calque garde l'ancien rendu). Regarder chaque calque en grand avant de publier.

Transitions filmées d'une scène à l'autre : `python3 business/tools/frames.py --trans <theme>-1-2=<vidéo>` (vidéo avec image de début = scène 1 et image de fin = scène 2). Elles sont jouées pendant le glissement, dans les deux sens ; au repos, l'image d'origine en pleine définition est affichée.

Les options : `opening` = `env` | `cur` | `door` ; `countdown` = `debut` | `page` | `fin` | `non` ; `reveal` = `scratch` (date à gratter) | `wheel` (roue qui s'arrête sur la date) | `slot` (jackpot jour, mois, année), absent = la date s'affiche directement ; `music` = `nocturne` | `valse` | `ragtime` | `marine` | `scheherazade` | `raga` | `funiculi` | `none` (ou `musicUrl` pour le morceau du client) ; `font` = `script` | `classique` | `moderne` | `deco` (sinon celle du thème) ; `lang` = `fr` | `en` ; `tz` = fuseau horaire si le mariage n'est pas en France.

## Encore à faire (jaune, ensuite)

- Factures (Stripe ou Abby), WhatsApp Business.
- Vérifier « Sceau » et « Maison Sceau » à l'INPI (classes 41, 42) et les comptes Instagram / TikTok.
- Mesure d'audience sans cookie (Vercel Analytics ou Plausible).
- Photos du couple (bloc à ajouter au moteur), version arabe (affichage de droite à gauche).
- Faire relire les CGV par un juriste avant les premières ventes.

## Créer un style « grand tableau » (mise en page continue)

Dix styles existent : Mille et une nuits, Bollywood, Dolce Vita, et les styles par communauté Double bonheur (chinois,
Nouvel an), Sakura (japonais), Gzhel (porcelaine russe), Laque & or (asian chic), Y2K, Old money et Kente (afro).
Les sept derniers n'existent qu'en grand tableau (`long: true` dans `landing/themes.js`, hors du configurateur).

1. Écrire les consignes du style dans `tools/long-prompts.json` (illustration d'ouverture `hero`, fonds `tex1-3`,
   guirlandes `band1-2` sur fond bleu ou magenta pur, cadre `frame`, photos `ph1-4`, scènes d'événements `scene2-4`).
2. Générer : `python3 business/tools/long-gen.py <dossier brut> <thème>` (en parallèle ; ce qui s'appuie sur
   l'illustration d'ouverture est fait ensuite ; une image refusée est retentée).
3. Regarder chaque image en grand. Ranger les scènes dans `banque/<thème>-2..4.webp`.
4. Régler les couleurs du texte du style dans `tools/long-assets.py` (`THEMES`), puis
   `python3 business/tools/long-assets.py <dossier brut> <thème>` → `landing/img/long/<thème>/`.
5. Déclarer le style dans `landing/themes.js` (police, couleurs, musique), ajouter sa police à `tools/fonts.py`,
   créer la fiche de démo `invites/<slug>.json` (`"layout": "long"`) et l'ajouter à la liste `LONGS` de la vitrine.
