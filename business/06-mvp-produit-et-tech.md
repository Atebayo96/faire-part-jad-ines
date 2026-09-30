# 06 — MVP : produit et technique

## 1. Stratégie : d'abord « concierge », ensuite le libre-service

On **ne commence pas par coder un éditeur.** On vend d'abord, et on produit à la main, mais **à partir d'un seul fichier de config** au lieu de modifier le HTML.

| Phase | Ce que voit le client | Ce qu'on fait derrière | Objectif |
|---|---|---|---|
| **0. Concierge** (sem. 1 à 6) | Landing page → questionnaire (Tally) → paiement (lien Stripe) → faire-part livré sous 5 jours | On remplit un `invitation.json` et on génère les lieux peints. Le template affiche le faire-part | Valider la demande, le prix et le temps de production. **10 à 30 clients** |
| **1. Plateforme** (mois 2 à 4) | Tableau de bord : suivi des RSVP, liste d'invités, liens par invité, modifications simples | Template piloté par la config, base de données, auth, RSVP | Signature à moins de 1 h 30 de travail |
| **2. Libre-service** (mois 4 à 6) | Configurateur en 9 étapes (doc 04), aperçu en direct, paiement intégré | Éditeur, formule Essentiel entièrement automatique | Essentiel à 0 h de travail. Passage à l'échelle |

## 2. Point de départ : ce que contient le repo aujourd'hui

- `index.html` (762 lignes) : HTML, CSS et JS dans un seul fichier. Couches `.stage .layer[data-i]`, séquences d'images `*_frames/frame_001..024.webp` pilotées par le scroll, intro enveloppe et sceau, swipe pleine page piloté en JS, compte à rebours, musique, calendrier (Google pour Android et PC, `.ics` hébergé pour Apple), balises `og:`.
- `en.html` : copie traduite, et `test4.html` : copie de test. **3 copies du même code, c'est la dette n°1.**
- Poids : `assets/` ~19 Mo (des PNG de 1 à 2 Mo : enveloppe, sceau, bâtiments), séquences ~0,6 à 1,8 Mo chacune, `hero_concepts/` 6 Mo (des recherches, à ne pas déployer).

## 3. Du fichier unique au template

### Étape A — Extraire les données (1 à 2 jours)
Tout ce qui est propre au mariage passe dans un JSON (voir le [schéma](mvp/invitation.schema.json) et [l'exemple Inès & Jad](mvp/collections/lanterne-ines-jad.json)) :
- identité (prénoms, date, textes, basmala), langues et traductions (**cela supprime `en.html`**)
- événements (type, lieu, adresse, horaires en UTC, scène associée) : les URL Maps, Google Agenda et `.ics` sont **générées**
- scènes (image fixe + séquence de frames + couleurs d'accent + scrim de lisibilité)
- musique, sceau, enveloppe, balises og

### Étape B — Rendu (2 à 4 jours)
Deux options :

| Option | + | − |
|---|---|---|
| **B1. Générateur statique** (un script Node qui injecte le JSON dans un template et produit un dossier HTML par client, déployé sur Vercel) | Très simple, rapide, zéro serveur. Parfait pour la phase 0 | Pas de RSVP en base, un déploiement par client |
| **B2. App Next.js** (route `/[slug]` qui lit la config en base) | Un seul déploiement, RSVP, tableau de bord, liens par invité | Plus de travail |

**Recommandation :** B1 pour les 10 premiers clients (tout de suite), puis B2 au mois 2. Le template HTML, CSS et JS reste **le même** : on garde le moteur qu'on a déjà réglé.

### Étape C — Le moteur de scènes générique
Aujourd'hui les scènes sont en dur (`mairieFg`, `palacioFg`, `nightFliers`). On en fait des **composants** :
```
Scene {
  kind: "sky" | "building" | "city" | "custom"
  background: { still, frames[24], sky?, skyNight? }
  foreground?: { image, rise: true }        // le bâtiment qui remonte (Mairie, Palacio)
  particles?: "lanterns" | "petals" | "leaves" | "snow" | "fireflies" | "confetti" | null
  text: { eyebrow, title, body, accent, scrim }
  blocks: [ "countdown" | "event" | "rsvp" | "closing" ]
}
```

## 4. Architecture cible (phase 1 et 2)

```
               ┌────────────────────────────────────────────────┐
  Invité ─────▶│  Next.js sur Vercel (edge)                     │
  (WhatsApp)   │  /[slug]?g=<token>  → rendu du faire-part      │
               │  /api/rsvp          → écrit la réponse         │
               │  /api/og/[slug]     → aperçu WhatsApp (image)  │
  Couple ─────▶│  /dashboard         → invités, RSVP, export    │
               │  /create            → configurateur (phase 2)  │
               └──────┬───────────────────────┬─────────────────┘
                      │                       │
          ┌───────────▼─────────┐   ┌─────────▼──────────┐
          │ Supabase            │   │ Stockage des assets│
          │ Postgres + Auth     │   │ (Supabase Storage  │
          │ (lien magique)      │   │  ou Vercel Blob +  │
          │ RLS par couple      │   │  CDN)              │
          └───────────┬─────────┘   └─────────▲──────────┘
                      │                       │
          ┌───────────▼─────────┐   ┌─────────┴──────────┐
          │ Stripe Checkout     │   │ Pipeline IA        │
          │ + webhooks          │   │ photo du lieu →    │
          │ Resend (e-mails)    │   │ image → Kling →    │
          └─────────────────────┘   │ 24 frames WebP/AVIF│
                                    └────────────────────┘
```

**Stack :** Next.js (App Router) · TypeScript · Supabase (Postgres, Auth, Storage, RLS) · Stripe · Resend · Vercel · Sharp/ffmpeg (pour extraire les frames). Pas de framework d'animation : on garde le JS vanilla actuel, qui est léger et déjà au point.

## 5. Modèle de données (simplifié)

```sql
couple        (id, email, name, locale, created_at)
invitation    (id, couple_id, slug unique, plan: essentiel|signature|couture,
               collection, season, mood, config jsonb, status: draft|live|archived,
               expires_at, published_at)
event         (id, invitation_id, type, title, starts_at timestamptz, ends_at,
               venue_name, address, lat, lng, scene_id, position)
scene         (id, library: bool, kind, place_name, city, season, mood,
               still_url, frames_prefix, frame_count, created_by, license_note)
guest_group   (id, invitation_id, name, event_ids uuid[])
guest         (id, invitation_id, group_id, display_name, envelope_name,
               phone, email, locale, seats_max, token unique, opened_at)
rsvp          (id, guest_id, event_id, attending bool, adults int, children int,
               diet text null, message text, answered_at)
order         (id, couple_id, invitation_id, stripe_session, amount, options jsonb, status)
```
- `token` : 16 caractères aléatoires dans le lien `?g=`. Il sert à pré-remplir le RSVP et à afficher le nom sur l'enveloppe.
- `diet` : **optionnel, avec consentement explicite**, et supprimé automatiquement 3 mois après l'événement (doc 08).
- `scene.library = true` : le lieu peint est réutilisable (bibliothèque).

## 6. Pipeline de production d'un lieu peint (cible : 20 min)

1. Le client envoie 1 à 3 photos du lieu (façade, idéalement en journée).
2. **Image fixe** : génération dans le style de la collection et de la saison (prompt maîtrisé + image de référence), avec le **bâtiment détouré** en couche séparée comme `mairie_building.png` et `palacio_building.png`.
3. **Ciel animé** : Kling sur le ciel seul (nuages qui dérivent, étoiles), 24 frames extraites (`ffmpeg -vf fps=…`), en **WebP ou AVIF à 70–80 % de qualité**.
4. Contrôle qualité : lisibilité du texte (le scrim), cohérence des couleurs, pas d'artefacts.
5. Envoi dans le stockage, et entrée dans la bibliothèque si le lieu est public (mairie, salle).

À écrire : `scripts/scene-pipeline` (prompts versionnés par collection et saison, extraction des frames, compression, fichier de métadonnées).

## 7. Budget de performance (non négociable)

Nos invités ouvrent le lien **dans WhatsApp, en 4G, parfois sur un vieil Android**.

| Élément | Aujourd'hui | Cible |
|---|---|---|
| Premier affichage (enveloppe visible) | PNG de 1 à 2 Mo | **< 400 Ko** (AVIF + WebP, `srcset` mobile) |
| Poids total avant le toucher du sceau | ~5 à 8 Mo *(estimé)* | **< 1,5 Mo** |
| Séquences de frames | chargées tôt | **chargées en différé, scène par scène** (celle d'après en tâche de fond) |
| Musique | MP3 plein | AAC/Opus ~96 kbps, ~1,5 Mo, lancée après l'ouverture |
| LCP en 4G (Moto G) | à mesurer | < 2,5 s |
| Polices | TTF | WOFF2 en sous-ensemble (sans les caractères inutiles) |

## 8. Backlog du MVP (par priorité)

**Phase 0 : concierge (objectif : premiers paiements avant fin novembre 2026)**
- [ ] Extraire la config du faire-part Inès & Jad en JSON et générer `index.html` + `en.html` avec le même template (non-régression : rendu identique)
- [ ] Compresser les assets (AVIF/WebP) et ne plus déployer `hero_concepts/` ni `test4.html`
- [ ] Bibliothèque musicale libre de droits (10 pistes, licence commerciale vérifiée)
- [ ] 3 démos en ligne : **Lanterne** (la nôtre, anonymisée « Yasmine & Karim »), **Cathédrale automne**, **Épure**
- [ ] Landing page (`landing/`), questionnaire Tally ([contenu ici](mvp/questionnaire-client.md)), liens de paiement Stripe
- [ ] RSVP minimal : formulaire → Google Sheet ou Supabase + e-mail au couple
- [ ] Aperçu WhatsApp généré par client
- [ ] CGV, mentions légales, politique de confidentialité

**Phase 1 : plateforme**
- [ ] App Next.js `/[slug]`, config en base, RLS
- [ ] Liens par invité (`?g=token`), nom sur l'enveloppe, événements par groupe
- [ ] Tableau de bord : taux d'ouverture, RSVP par événement, export CSV/Excel, relance WhatsApp (lien `wa.me` pré-rempli)
- [ ] Langues avec l'arabe de droite à gauche
- [ ] Save-the-date (version courte : ouverture + prénoms + date + calendrier)
- [ ] Export vidéo 9:16 de l'ouverture (capture avec Playwright + ffmpeg)

**Phase 2 : libre-service**
- [ ] Configurateur en 9 étapes, aperçu en direct
- [ ] Stripe Checkout intégré + options
- [ ] Choix des lieux dans la bibliothèque (recherche par ville ou par salle)
- [ ] Commande de lieu peint sur-mesure (upload de photo → file de production)
- [ ] Remerciements et galerie après le mariage

## 9. Qualité et tests
- Test visuel automatique (Playwright, qui est déjà disponible) : captures de chaque scène sur iPhone SE, iPhone 15 et Pixel 5, **dans le navigateur de WhatsApp et d'Instagram** si possible.
- Checklist avant livraison : textes relus, fuseaux horaires (`starts_at` en UTC → heure de Paris affichée, comme `20261017T120000Z` pour 14 h), tous les liens Maps et Calendrier testés, audio coupé en arrière-plan, aperçu WhatsApp vérifié, Lighthouse mobile ≥ 85.
