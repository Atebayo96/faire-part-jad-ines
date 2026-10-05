# Recette automatique (Playwright)

Site construit et servi en local : `python3 business/build-site.py` puis `cd business/site && python3 -m http.server 8765`.

- `node vitrine-configurateur.js <dossier de sortie>` : 11 pages de la vitrine à 390 et 1280 px (erreurs JS, débordement,
  images et liens cassés, texte sous 11 px), puis le configurateur dans toutes les combinaisons occasion × thème × format
  (étapes, aperçu du bon format, réglages de chaque partie cochée, nom de la liste, lien de commande).
- `node demos-moteur.js <dossier> demos` : chaque démo à 390 et 360 px (ouverture, rien hors écran, réponse jusqu'au « Merci »).
- `node demos-moteur.js <dossier> moteur` : l'accueil du vrai moteur (harness.js) pour chaque thème de la famille,
  mariage et sbouâ, chaque révélation de date : le texte doit finir au-dessus du sujet de la scène.

Les résultats sont écrits dans `<dossier>/recette*.json` ; les cas en échec sont listés à la fin (`KO …`).
