# -*- coding: utf-8 -*-
"""Posts TikTok informatifs (carrousels de 3 images). Trois posts pour commencer (28 octobre 2026 : « on va faire 3 TikTok,
on va pas en faire 1000, on va voir ce que ça donne »). Ton validé par l'utilisateur : la première image est une phrase
simple et complète que la personne se dit (« Tu as envoyé ton faire-part et personne ne t'a répondu ? »), ou une liste
(« 5 erreurs à éviter », « 5 choses qui ont sauvé mon mariage ») ; tutoiement, mots simples, pas d'expression française
(« failli tomber de ta chaise » refusé), pas de chiffre comme accroche (« tu as 150 noms » refusé), jamais de vente.
Le texte se valide en chat AVANT tout rendu. Les autres textes validés attendent dans candidats.md.
theme = fond peint de la Carte, seal = cire. slides = [hook, contenu, à retenir]."""

POSTS = [
 dict(slug="personne-ne-repond", theme="oldmoney", seal="bleu",
  caption="Tu as envoyé ton faire-part et personne ne t'a répondu ? Ce n'est pas qu'ils s'en fichent. Les vraies raisons, et ce qui marche. #mariage #fairepart #rsvp #organisationmariage #mariage2027 #futuremariee",
  slides=[
   dict(kind="hook", kicker="Le silence", title="Tu as envoyé ton faire-part et personne ne t'a répondu ?", sub="Ce n'est pas qu'ils s'en fichent."),
   dict(kind="list", kicker="Les vraies raisons", title="Ils ne répondent pas parce que…",
        items=["Ils ne savent pas comment répondre : pas de numéro, pas de lien, pas de carton.",
               "Il n'y a pas de date limite, donc « plus tard ».",
               "Ils attendent de savoir pour les enfants ou pour leur +1.",
               "Ils pensent que tu sais déjà qu'ils viennent."]),
   dict(kind="tips", kicker="Ce qui marche", title="Quatre réflexes",
        items=["Une date limite écrite sur le faire-part.",
               "Une seule façon de répondre, pas trois.",
               "Demander le menu en même temps.",
               "Une relance en message privé, pas dans un groupe."],
        foot="Enregistre ce post pour le jour où tu relances."),
  ]),
 dict(slug="5-erreurs", theme="doucefrance", seal="sauge",
  caption="Tu prépares ton mariage ? Les 5 erreurs à éviter sur ton faire-part. #mariage #fairepart #mariage2027 #organisationmariage #futuremariee #erreursaeviter",
  slides=[
   dict(kind="hook", kicker="Tu prépares ton mariage ?", title="Les 5 erreurs à éviter sur ton faire-part", sub="Celles qu'on voit sur un faire-part sur deux."),
   dict(kind="list", kicker="Les 5 erreurs", title="À éviter",
        items=["Oublier le jour de la semaine : « 12 juin », c'est un vendredi ou un samedi ?",
               "Mettre le nom du lieu sans l'adresse.",
               "Ne pas mettre de date limite pour répondre.",
               "Ne pas dire qui est invité à quoi.",
               "Ne pas faire relire : une faute dans un prénom, imprimée 150 fois."]),
   dict(kind="tips", kicker="À retenir", title="Avant d'envoyer",
        items=["Fais relire ton faire-part par quelqu'un qui n'est pas dans le projet.",
               "Il verra ce que tu ne vois plus."],
        foot="Tu as fait une autre erreur ? Raconte-la en commentaire, ça aidera quelqu'un."),
  ]),
 dict(slug="5-choses", theme="nuits", seal="or",
  caption="5 choses que j'ai mises dans mon faire-part et qui ont sauvé mon mariage. #mariage #fairepart #mariage2027 #organisationmariage #futuremariee #astucesmariage",
  slides=[
   dict(kind="hook", kicker="Vécu", title="5 choses que j'ai mises dans mon faire-part et qui ont sauvé mon mariage", sub=""),
   dict(kind="list", kicker="Les 5 choses", title="Ce qui m'a sauvée",
        items=["Le lien vers l'itinéraire : personne ne m'a appelée pour l'adresse.",
               "Le choix du menu dans la réponse : le traiteur a eu ses chiffres tout de suite.",
               "Un numéro WhatsApp pour répondre : mes tantes ont répondu en une minute.",
               "La date limite de réponse : j'ai pu relancer sans gêne.",
               "Le programme de la journée : plus de « ça commence à quelle heure ? »."]),
   dict(kind="tips", kicker="À retenir", title="Un faire-part, ce n'est pas que joli",
        items=["C'est ce qui évite les cinquante messages de la dernière semaine.",
               "Mets-y tout ce qu'on va te demander : l'adresse, l'heure, le menu, comment répondre."],
        foot="Enregistre ce post pour quand tu écriras le tien."),
  ]),
]
