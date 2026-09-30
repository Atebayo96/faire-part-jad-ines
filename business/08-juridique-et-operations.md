# 08 — Juridique et opérations

> ⚠️ Ce document est une **liste de points à vérifier**, pas un avis juridique. Les seuils et taux changent souvent
> (lois de finances). À valider avec un expert-comptable et, pour les CGV et le RGPD, avec un juriste.

## 1. Statut et fiscalité
| Sujet | Recommandation au démarrage |
|---|---|
| Statut | **Micro-entreprise** pour tester. Activité de prestation de services (création numérique), BIC ou BNC selon le code APE retenu. À valider avec le comptable |
| Plafond de CA micro (services) | ~77 700 €/an (valeur 2025, à vérifier). **Le scénario central l'approche.** Prévoir le passage en SASU ou EURL dès que 60 k€ de CA sont en vue |
| TVA | Franchise en base tant que le CA reste sous le seuil (~37 500 € pour les services, **seuils en discussion en 2025-2026, à vérifier**). Au-delà : TVA à 20 % → **afficher des prix TTC** dès le départ pour ne pas avoir à les changer |
| Vente hors de l'UE ou aux entreprises | Règles de TVA spécifiques (guichet OSS pour les particuliers de l'UE au-delà de 10 000 €) → à voir avec le comptable avant l'international |
| Compte bancaire | Compte pro dédié (obligatoire au-delà de 10 k€ de CA pendant 2 ans en micro) |
| Assurance | RC professionnelle (un faire-part avec une erreur de date ou d'adresse = un préjudice possible) |

## 2. Contrat avec le client (CGV)
- **Droit de rétractation (14 jours)** : il existe des exceptions pour les **contenus numériques fournis dès l'achat** avec accord exprès (Code de la consommation, art. L221-28, 13°) et pour les **prestations faites selon les demandes du client** (L221-28, 3°). À appliquer correctement : **case à cocher** « Je demande l'exécution immédiate et je reconnais perdre mon droit de rétractation », puis e-mail de confirmation.
- **Validation du client** : le client relit et **valide l'aperçu final** (textes, dates, adresses) avant la mise en ligne. Notre responsabilité est limitée aux erreurs qui viennent de nous.
- **Nombre d'allers-retours** par formule (doc 04), puis modification au-delà à 19 €.
- **Durée de mise en ligne** (12, 18 ou 36 mois), puis archivage et export possible.
- **Propriété** : le client a une licence d'usage personnel et non commercial sur les visuels. **Nous gardons le droit de réutiliser les lieux publics peints** (bibliothèque). Autorisation de montrer le faire-part en portfolio : **case séparée, facultative**.
- **Force majeure et fournisseurs** : panne d'un hébergeur ou d'un outil IA.

## 3. RGPD : le point le plus sensible
Nous traitons des données **d'invités qui n'ont rien signé** : noms, téléphones, réponses, et parfois des **préférences alimentaires**.

| Point | Mesure |
|---|---|
| Rôles | Le couple est **responsable de traitement** pour sa liste d'invités, nous sommes **sous-traitant** (clause art. 28 dans les CGV). Pour nos propres clients, nous sommes responsables |
| **Données sensibles (art. 9)** | « Halal », « casher », « sans porc », « végétarien pour raisons religieuses » **révèlent une conviction religieuse**. « Allergie » est une donnée de **santé**. → Question **facultative**, formulée de façon neutre (« Contraintes alimentaires à signaler au traiteur »), **consentement explicite** par case à cocher, accès limité au couple, **suppression automatique 3 mois après l'événement** |
| Minimisation | Le téléphone n'est pas obligatoire (le lien suffit). Pas d'e-mail des invités sans raison |
| Hébergement | Supabase et Vercel **en région UE** (Francfort ou Paris). Clauses de transfert si un outil est hors UE (Stripe, Resend) |
| Pages | Politique de confidentialité, mentions légales, formulaire d'exercice des droits |
| Sécurité | Tokens d'invité non devinables, RLS, pas de liste d'invités publique, pages `noindex` |
| Cookies | Mesure d'audience sans cookie (Plausible ou Vercel Analytics) → pas de bandeau nécessaire, à vérifier |
| Registre | Tenir un registre des traitements simple dès le départ |

## 4. Propriété intellectuelle et droits

| Sujet | Risque | Mesure |
|---|---|---|
| **Musique** | Les morceaux de **notre** bibliothèque doivent être sous licence commerciale. La musique **importée par le client** relève de sa responsabilité, mais c'est nous qui l'hébergeons | **Bibliothèque** : uniquement des morceaux libres de droits avec licence commerciale (vérifier que la licence couvre bien la diffusion chez nos clients). **Musique du client** : autorisée. Case à cocher « J'atteste avoir les droits sur la musique importée », clause dans les CGV qui met la responsabilité sur le client, et retrait immédiat sur signalement (statut d'hébergeur, loi LCEN). Pages en `noindex` et liens privés, donc risque faible. **La musique d'un client n'est jamais utilisée dans nos démos ni nos pubs** (comme `assets/music.mp3` du faire-part d'Inès & Jad) |
| **Images IA** | Conditions d'usage commercial selon l'outil et l'abonnement (Kling, Higgsfield…) | Utiliser uniquement des **abonnements payants avec usage commercial**, archiver les CGU à la date de création, noter le modèle utilisé pour chaque scène (`scene.license_note`) |
| **Bâtiments** | Peindre une façade vue de la rue : en général acceptable (liberté de panorama, reproduction non fidèle). **Exception : les œuvres architecturales récentes** dont l'architecte est vivant ou mort depuis moins de 70 ans | Style peint et interprété, pas de copie de photos de tiers. Pour la bibliothèque des salles : **accord écrit de la salle** (qui y a d'ailleurs intérêt) |
| **Tour Eiffel la nuit** | **L'éclairage et le scintillement de la Tour Eiffel sont protégés** (droits de la SETE) : une utilisation commerciale demande une autorisation. La Tour de jour est libre | Scène « Paris la nuit » (comme la nôtre) : **ne pas la vendre** telle quelle au catalogue. Tour de jour, ou Paris la nuit sans scintillement reconnaissable, ou demande d'autorisation |
| **Photos du client** | Droits du photographe | Le client atteste avoir les droits |
| **Polices** | Amiri, Great Vibes et Playfair Display sont sous **licence OFL** → usage commercial OK. Vérifier toute nouvelle police |
| **Marque** | Nom pris par quelqu'un d'autre | Recherche INPI, EUIPO et WIPO, **dépôt INPI** (~190 € pour 1 classe, puis ~40 € par classe supplémentaire, classes 9, 41 et 42), domaines, comptes sociaux |
| **Notre faire-part comme vitrine** | Vie privée d'Inès, des familles, des adresses | **Accord d'Inès**, et une version démo anonymisée (« Yasmine & Karim », faux lieux et fausse date) |

## 5. Opérations
- **Outils du quotidien** : Notion ou Linear (commandes), Tally (questionnaire), Stripe (paiements, factures), Crisp ou WhatsApp Business (support), un outil de compta (Pennylane, Indy…).
- **SLA** : réponse sous 24 h ouvrées. **Astreinte le week-end en pleine saison** (vendredi et samedi, pour les faire-part modifiés à la dernière minute).
- **Processus de livraison Signature** (objectif moins de 1 h 15) :
  1. Questionnaire reçu → config JSON préremplie (10 min)
  2. Lieu peint : bibliothèque ou pipeline (20 min)
  3. Aperçu envoyé → retours → corrections (2 × 10 min)
  4. Checklist qualité (doc 06 §9) (10 min)
  5. Mise en ligne, aperçu WhatsApp, vidéo 9:16, tutoriel d'envoi (5 min)
- **Service après-vente** : modèles de messages (relance RSVP, « comment envoyer à Mamie », « changement d'horaire »).
- **Sauvegardes** : export quotidien de la base, versionnage des configs.
