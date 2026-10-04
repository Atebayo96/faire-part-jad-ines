# 14 — Recette fonctionnelle « comme un client » (4 octobre 2026)

Parcours joués dans un navigateur (390 × 844, 375 × 667, 1400 × 900) sur le site construit, puis corrigés dans la foulée.
Script : `/tmp/…/audit.js` (Playwright) ; à rejouer après chaque grosse évolution.

## Ce qui a été testé

| Parcours | Résultat |
|---|---|
| Les 10 pages (accueil, modèles, formules, questions, contact, créer, CGV, confidentialité, mentions, merci, tableau de bord démo) | Toutes répondent, aucun lien interne cassé, aucune erreur JavaScript, aucune image en 404 |
| Défilement horizontal parasite sur téléphone | **Corrigé** : le menu débordait de 68 px (un lien caché ré-affiché par une règle plus forte), puis de 9 px (menu trop large à 390 px) |
| Titres de page | **Corrigé** : les 6 pages de la vitrine n'avaient pas de `h1` (référencement, lecteurs d'écran) |
| Textes sous 11 px (règle 3) | **Corrigé** : étiquettes « Signature » et « Dès Essentiel » (10 px), « Save the » du logo (10,5 px), « (facultatif) », « Touchez pour ouvrir » de l'aperçu, « Exemple » du tableau de bord |
| Cibles tactiles sous 32 px | **Corrigé** : liens du menu, du pied de page, « Agrandir l'aperçu », étapes du bandeau, liens des pages légales et de l'en-tête merci/tableau |
| Accueil → Créer → prénoms, date, thème → écrans (lieu, 3e événement) → détails (écran en plus) → récapitulatif → Commander | OK. La formule bascule en Signature au 3e événement avec l'explication ; le récapitulatif reprend tout |
| Commander → page contact | **Corrigé** : les prénoms et la date tapés dans le configurateur étaient perdus. Ils sont maintenant préremplis, la formule aussi, et une ligne « Votre composition : thème · format · formule » le confirme ; thème et format partent avec la demande (`composition`) |
| Formulaire de contact sans e-mail | OK : message d'erreur clair. Bouton renommé « Envoyer ma demande » (plus « Réserver ma place ») |
| Démos scène par scène (Salma & Rayan) et grand tableau (Nour & Ilyes) | OK : ouverture, défilement, bouton Répondre et feuille RSVP |
| Pages légales | **Corrigé** : lien d'en-tête « Commencer » pointait encore vers l'ancienne ancre `/#commencer` |

## Ce qui reste à faire (hors recette, à décider)

1. **Paiement** : `paiement.js` n'a pas encore les liens Stripe. « Commander » envoie donc vers le contact, avec la composition. Dès que les liens existent, le même bouton ouvre le paiement.
2. **Aperçu du grand tableau dans le configurateur** : il montre le rouleau de la démo du thème, pas encore les lieux choisis dans les cadres (le vrai faire-part, lui, les affiche).
3. **Domaine** : toujours `sceau-faire-part.vercel.app` ; l'aperçu WhatsApp (`og-sceau.jpg`) dit déjà Save The Oui.
4. **Après l'envoi du formulaire**, pas d'e-mail de confirmation au client (la demande arrive dans l'admin). À brancher quand on aura l'expéditeur.
5. **Les 14 autres thèmes** restent hors galerie tant qu'ils n'existent pas dans les deux formats.
