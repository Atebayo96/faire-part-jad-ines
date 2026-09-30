# Questionnaire client (Tally, phase concierge)

> À recopier dans Tally ou Typeform. Chaque réponse alimente directement un champ de `invitation.schema.json` (entre crochets).
> Durée visée : **10 minutes**. Ton chaleureux, tutoiement ou vouvoiement selon la marque.

## 0. Formule
1. Formule choisie : Essentiel / Signature / Couture `[plan]`
2. Options : lieu peint supplémentaire, langue, express 48 h, domaine, remerciements `[options]`

## 1. Vous deux
3. Vos prénoms, dans l'ordre d'affichage souhaité `[identity.partnerA/B.firstName]`
4. Vos noms de famille (affichés à la fin, facultatif) `[identity.partnerA/B.lastName]`
5. Initiales du sceau (ex. « IJ ») `[envelope.monogram]`
6. Qui invite ? Vous deux / vos parents (noms exacts) / les deux `[identity.hosts]`
7. Phrase d'invitation : choisir parmi 3 modèles ou écrire la vôtre `[identity.invitationText]`
8. Une bénédiction, un verset ou une citation à afficher en tête ? (basmala, verset, citation, rien) `[identity.blessing]`

## 2. L'univers
9. Collection : Lanterne / Cathédrale / Hôtel de Ville / Intime / Épure (avec vignettes) `[collection]`
10. Saison : printemps / été / automne / hiver (proposée automatiquement selon la date) `[season]`
11. Ambiance : jour / crépuscule / nuit `[mood]`
12. Couleur de cire préférée (6 pastilles, ou un code couleur) `[envelope.sealColor]`
13. Musique : écouter les 3 propositions de la collection et en choisir une, ou pas de musique `[music.trackId]`

## 3. Vos événements (à répéter pour chacun)
14. Type : henné, mairie, église, nikah, houppa, laïque, vin d'honneur, réception, soirée, brunch `[events[].type]`
15. Nom du lieu et adresse complète `[events[].venue]`
16. Date, heure de début et, si possible, heure de fin `[events[].startsAt/endsAt]`
17. Comment afficher l'horaire ? (ex. « Dès 19h », « À 14h00 ») `[events[].showTime]`
18. Petit texte (ex. « Cocktail de bienvenue, suivi du dîner et de la soirée ») `[events[].description]`
19. Dress code (facultatif) `[events[].dressCode]`
20. **Voulez-vous que ce lieu soit peint ?** → envoyez 1 à 3 photos de la façade (en journée, de face) `[scenes[].source = sur-mesure]`
21. Cet événement est-il réservé à certains invités ? (ex. henné pour les femmes de la famille) `[events[].groups]`

## 4. Vos invités (Signature et plus)
22. Voulez-vous des liens personnalisés (« Chère famille Benali ») ? `[guests.personalizedLinks]`
23. Importez votre liste (modèle CSV : nom affiché sur l'enveloppe, groupe, nombre de places, téléphone facultatif, langue) `[guest]`
24. Nommez vos groupes (Famille, Amis, Travail…) `[guests.groups]`

## 5. Les réponses
25. Comment voulez-vous recevoir les réponses ? Formulaire intégré avec tableau de bord / directement sur votre WhatsApp / pas de réponse (save-the-date) `[rsvp.mode]`
26. Date limite (ou aucune) `[rsvp.deadline]`
27. Demander le nombre d'enfants ? `[rsvp.askChildren]`
28. Demander les contraintes alimentaires ? *(les invités devront donner leur accord, et les données seront supprimées 3 mois après le mariage)* `[rsvp.askDiet]`
29. Numéro WhatsApp de contact (si réponse directe) `[rsvp.contactWhatsapp]`

## 6. Infos pratiques (facultatif)
30. Hébergement, parking, navette, liste de mariage ou cagnotte (lien), FAQ `[practical]`

## 7. Langues et partage
31. Langues du faire-part : FR, EN, AR, ES… (la première est celle par défaut) `[locales]`
32. Titre de l'aperçu WhatsApp (proposé : « Prénom & Prénom — date ») `[share.ogTitle]`
33. Domaine personnalisé souhaité (option) `[share.customDomain]`

## 8. Validation et consentements
34. ☐ J'ai vérifié les prénoms, dates, horaires et adresses. Je validerai l'aperçu final avant la mise en ligne.
35. ☐ Je demande l'exécution immédiate de la prestation et je reconnais perdre mon droit de rétractation (art. L221-28 du Code de la consommation).
36. ☐ J'atteste avoir les droits sur les photos et la musique que je fournis.
37. ☐ *(facultatif)* J'accepte que Sceau montre mon faire-part (anonymisé ou non) dans son portfolio.
38. Comment nous avez-vous connus ? (faire-part d'un proche / TikTok / Instagram / salle / planner / salon / Google / autre) → **mesure de la boucle virale**
