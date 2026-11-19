# -*- coding: utf-8 -*-
"""Posts en iconographie (28 octobre 2026 : « pour les prochains posts, pas d'images réelles : des emojis, des symboles, des
icônes, des trucs qu'on peut faire gratuitement sans générer d'images »). Même mise en page que erreurs.py (titre de journal,
une phrase par image, mot clé surligné), mais en haut une grande icône dessinée au trait (SVG, dans le fichier, aucune image
générée) sur une tache jaune. python3 icones.py && node render.js <repond|choses>"""
import os
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', 'landing'))
FONTS = open(os.path.join(ROOT, 'polices', 'polices.css'), encoding='utf-8').read().replace('url(/polices/', 'url(file://' + ROOT + '/polices/')

# icônes au trait, dessinées dans une boîte 0 0 200 200 (trait 7, bouts ronds)
I = dict(
 envelope='<rect x="30" y="55" width="140" height="95" rx="12"/><path d="M30 65l70 50 70-50"/><circle cx="150" cy="50" r="24" fill="#f6d66a" stroke="none"/><path d="M140 50h20M150 40v20" stroke="#1e1a17"/>',
 silence='<rect x="25" y="60" width="150" height="90" rx="14"/><path d="M25 70l75 50 75-50"/><path d="M60 170h80" stroke-dasharray="2 16"/>',
 phoneq='<rect x="60" y="20" width="80" height="160" rx="16"/><path d="M90 165h20"/><path d="M85 75c0-14 30-14 30 0 0 10-15 10-15 25" /><circle cx="100" cy="118" r="4" fill="#1e1a17" stroke="none"/>',
 calendar='<rect x="30" y="45" width="140" height="130" rx="12"/><path d="M30 80h140M65 30v30M135 30v30"/><path d="M75 130l50-30M75 100l50 30" />',
 family='<circle cx="60" cy="60" r="22"/><circle cx="140" cy="60" r="22"/><circle cx="100" cy="112" r="16"/><path d="M20 170c0-30 18-45 40-45s40 15 40 45M100 170c0-30 18-45 40-45s40 15 40 45"/><path d="M85 170c0-20 8-30 15-30s15 10 15 30"/>',
 thought='<path d="M70 140c-30 0-45-20-45-45 0-30 25-50 60-50 10-20 40-30 65-15 25 10 30 40 15 60 15 10 10 45-25 45-20 0-30-5-40-10-10 10-20 15-30 15z"/><circle cx="55" cy="160" r="8"/><circle cx="35" cy="180" r="5"/><path d="M80 90l15 15 30-35"/>',
 check='<rect x="35" y="25" width="130" height="150" rx="14"/><path d="M60 70l12 12 24-26M60 115l12 12 24-26M110 70h35M110 115h35"/>',
 bookmark='<path d="M55 25h90v150l-45-32-45 32z"/>',
 pin='<path d="M100 180c-35-45-60-75-60-105a60 60 0 0 1 120 0c0 30-25 60-60 105z"/><circle cx="100" cy="75" r="22"/><path d="M30 185c20-10 40-5 60 5s40 15 80-5" stroke-dasharray="3 14"/>',
 plate='<circle cx="100" cy="100" r="62"/><circle cx="100" cy="100" r="38"/><path d="M22 40v45M12 40v30q0 15 10 15t10-15V40M22 85v75"/><path d="M178 40c-14 10-14 50 0 60v60"/>',
 bubble='<path d="M40 150l-15 30 40-18h65c22 0 40-18 40-40V70c0-22-18-40-40-40H70C48 30 30 48 30 70v45c0 14 4 25 10 35z"/><text x="100" y="112" text-anchor="middle" font-family="Inter Tight" font-weight="600" font-size="46" fill="#1e1a17" stroke="none">Oui !</text>',
 calcheck='<rect x="30" y="45" width="140" height="130" rx="12"/><path d="M30 80h140M65 30v30M135 30v30"/><path d="M70 125l20 20 40-45"/>',
 rings='<circle cx="75" cy="115" r="48"/><circle cx="125" cy="115" r="48"/><path d="M62 52l13-22 13 22-13 14z"/>',
 mairie='<path d="M25 80l75-50 75 50z"/><path d="M40 80v80M80 80v80M120 80v80M160 80v80"/><path d="M20 165h160"/><path d="M100 30V10h22l-6 7 6 7h-22"/>',
 plane='<path d="M20 110l160-70-45 130-35-45z"/><path d="M100 125l80-85"/><path d="M100 125v40l22-22"/>',
 bed='<path d="M20 160V60M20 120h160v40M180 160v-40"/><path d="M40 120V95h50v25"/><path d="M100 120v-18h60q20 0 20 18"/>',
 coins='<ellipse cx="100" cy="60" rx="55" ry="22"/><path d="M45 60v35c0 12 25 22 55 22s55-10 55-22V60"/><path d="M45 95v35c0 12 25 22 55 22s55-10 55-22V95"/>',
 heart='<path d="M100 165C40 120 25 90 25 68a37 37 0 0 1 75-12 37 37 0 0 1 75 12c0 22-15 52-75 97z"/>',
 table='<circle cx="100" cy="100" r="34"/><circle cx="100" cy="32" r="12"/><circle cx="100" cy="168" r="12"/><circle cx="32" cy="100" r="12"/><circle cx="168" cy="100" r="12"/>',
 eye='<path d="M15 100c25-40 55-55 85-55s60 15 85 55c-25 40-55 55-85 55s-60-15-85-55z"/><circle cx="100" cy="100" r="24"/><path d="M30 170L170 30"/>',
 clock='<circle cx="100" cy="100" r="70"/><path d="M100 55v45l32 20"/><path d="M100 40v8M160 100h-8M100 160v-8M40 100h8"/>',
)
def svg(k): return f'<svg viewBox="0 0 200 200" fill="none" stroke="#1e1a17" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">{I[k]}</svg>'

POSTS = {}
POSTS['repond'] = [
 dict(k="Faire-part de mariage", h="Tu as envoyé ton faire-part et <i>personne ne t'a répondu ?</i>", p="Ce n'est pas qu'ils s'en fichent.", ic="silence", go=True),
 dict(n=1, t="Raison 1 sur 4", h="Ils ne savent pas <i>comment répondre.</i>", p="Pas de numéro, pas de lien, pas de carton : alors ils attendent.", ic="phoneq"),
 dict(n=2, t="Raison 2 sur 4", h="Il n'y a pas de <i>date limite.</i>", p="Sans date, c'est « plus tard ». Et plus tard, c'est jamais.", ic="calendar"),
 dict(n=3, t="Raison 3 sur 4", h="Ils attendent de savoir pour <i>les enfants</i> ou pour leur +1.", p="Tant que ce n'est pas clair sur le faire-part, ils ne répondent pas.", ic="family"),
 dict(n=4, t="Raison 4 sur 4", h="Ils pensent que <i>tu sais déjà</i> qu'ils viennent.", p="Ta sœur, ton meilleur ami, tes parents. Eux aussi doivent répondre.", ic="thought"),
 dict(k="Ce qui marche", h="Une date limite. <i>Une seule</i> façon de répondre.", p="Demande le menu en même temps. Et relance en message privé, pas dans un groupe.", ic="check"),
 dict(k="À retenir", h="<i>Enregistre</i> ce post pour le jour où tu relances.", p="Tu as une autre astuce ? Dis‑la en commentaire.", ic="bookmark", end=True),
]
POSTS['types'] = [
 dict(n=1, t="Nos faire-part · 1 sur 3", h="La Carte. <i>29 €</i>", p="Une image. Tu l'envoies sur WhatsApp, c'est tout.", cap=dict(file="carte", full=True), end=True),
 dict(n=2, t="Nos faire-part · 2 sur 3", h="La Page unique. <i>Dès 59 €</i>", p="Un lien. Tes invités répondent dessus, tu vois qui vient.", cap=dict(file="page-reponse", full=True), end=True),
 dict(n=3, t="Nos faire-part · 3 sur 3", h="Le Faire-part animé. <i>Dès 99 €</i>", p="Une enveloppe qui s'ouvre, un écran par moment.", cap=dict(file="itineraire", full=True), end=True),
]
POSTS['choses'] = [
 dict(k="Faire-part de mariage", h="<i>5 choses</i> à mettre absolument dans ton faire-part.", p="Elles t'éviteront cinquante messages la dernière semaine.", ic="check", go=True),
 dict(n=1, t="Chose 1 sur 5", h="Le bouton <i>Itinéraire.</i>", p="Un geste, et le GPS s'ouvre sur le lieu. Personne ne t'appelle pour l'adresse.", cap=dict(file="itineraire", off=350, box=[78,822,1081,964])),
 dict(n=2, t="Chose 2 sur 5", h="Le <i>programme</i> de la journée.", p="Cérémonie, apéritif, dîner, soirée, avec les heures. Plus de « ça commence à quelle heure ? ».", cap=dict(file="programme", off=390, box=[89,460,1081,1400])),
 dict(n=3, t="Chose 3 sur 5", h="La <i>date limite</i> pour répondre.", p="Écrite en grand, juste au-dessus du bouton. Tu peux relancer sans gêne.", cap=dict(file="deadline", off=100, box=[220,390,960,720])),
 dict(n=4, t="Chose 4 sur 5", h="Le choix du <i>menu</i> dans la réponse.", p="Viande, poisson, végétarien : chacun choisit. Le traiteur a ses chiffres tout de suite.", cap=dict(file="menu", off=170, box=[60,603,1110,808])),
 dict(n=5, t="Chose 5 sur 5", h="Un bouton <i>WhatsApp</i> pour répondre.", p="Pour ceux qui ne remplissent jamais un formulaire. Tes tantes répondent en une minute.", cap=dict(file="whatsapp", off=1455, box=[60,2120,1110,2255])),
 dict(k="À retenir", h="Un faire-part, ce n'est pas que <i>joli.</i>", p="C'est ce qui évite les questions. Enregistre ce post pour quand tu écriras le tien.", ic="bookmark", end=True),
]

POSTS['unan'] = [
 dict(k="Organisation du mariage", h="Tu te maries dans <i>moins d'un an ?</i>", p="3 choses à ne pas oublier.", ic="rings", go=True),
 dict(n=1, t="Chose 1 sur 3", h="Ta <i>liste d'invités.</i>", p="Fais‑la en premier. Le lieu, le traiteur, le budget : tout dépend du nombre de personnes.", ic="family"),
 dict(n=2, t="Chose 2 sur 3", h="Ton dossier <i>à la mairie.</i>", p="Chaque mairie a ses délais et sa liste de papiers. Appelle la tienne maintenant, pas dans six mois.", ic="mairie"),
 dict(n=3, t="Chose 3 sur 3", h="Annoncer <i>la date</i> à tes invités.", p="Ils doivent poser des congés et réserver leur trajet. Plus ils le savent tôt, plus ils viennent.", ic="calcheck"),
 dict(k="À retenir", h="La liste, la mairie, <i>la date.</i>", p="Enregistre ce post pour ne rien oublier. Et toi, tu en es où ?", ic="bookmark", end=True),
]

POSTS['datefixee'] = [
 dict(k="Organisation du mariage", h="Tu viens de fixer <i>ta date de mariage ?</i>", p="3 choses à faire cette semaine.", ic="calcheck", go=True),
 dict(n=1, t="Chose 1 sur 3", h="Dis‑le d'abord <i>à tes proches.</i>", p="Tes parents et tes témoins l'apprennent de ta bouche, pas dans une story.", ic="family"),
 dict(n=2, t="Chose 2 sur 3", h="Réserve <i>le lieu.</i>", p="Tant que le lieu n'est pas signé, ta date peut encore bouger. Ne l'annonce pas avant.", ic="pin"),
 dict(n=3, t="Chose 3 sur 3", h="Annonce la date <i>à tous tes invités.</i>", p="Un message court suffit : vos prénoms, la date, la ville. Le faire‑part viendra plus tard.", ic="envelope"),
 dict(k="À retenir", h="Les proches, le lieu, <i>puis tout le monde.</i>", p="Enregistre ce post. Et toi, ta date, c'est quand ?", ic="bookmark", end=True),
]
POSTS['cestquoi'] = [
 dict(k="Mariage", h="C'est quoi un save the date, et <i>est‑ce que tu en as besoin ?</i>", ic="phoneq", go=True),
 dict(n=1, t="Ce que c'est", h="Un message <i>très court.</i>", p="Vos prénoms, la date, la ville. Rien d'autre. Il dit juste : réservez votre journée.", ic="bubble"),
 dict(n=2, t="Ce que ce n'est pas", h="Ce n'est pas <i>le faire‑part.</i>", p="Pas d'horaires, pas d'adresse, pas de menu. Tout ça arrive plus tard, avec le faire‑part.", ic="envelope"),
 dict(n=3, t="Quand l'envoyer", h="Dès que la date et le lieu <i>sont sûrs.</i>", p="Souvent entre 6 et 12 mois avant le mariage.", ic="calcheck"),
 dict(n=4, t="Tu en as besoin si", h="Tes invités <i>viennent de loin.</i>", p="Ou si tu te maries en été, pendant un pont, ou à l'étranger. Ils doivent s'organiser tôt.", ic="plane"),
 dict(k="À retenir", h="La date d'abord, <i>les détails ensuite.</i>", p="Enregistre ce post pour le jour où ta date sera fixée.", ic="bookmark", end=True),
]
POSTS['ordre'] = [
 dict(k="Organisation du mariage", h="Tu ne sais pas <i>par où commencer</i> ton mariage ?", p="L'ordre qui évite de tout refaire.", ic="thought", go=True),
 dict(n=1, t="D'abord", h="Le <i>budget.</i>", p="Un chiffre, même approximatif. Sans lui, tu visites des lieux que tu ne pourras pas payer.", ic="coins"),
 dict(n=2, t="Ensuite", h="La liste <i>d'invités.</i>", p="Pas les noms exacts : le nombre. 60 ou 160 personnes, ce n'est pas le même lieu.", ic="family"),
 dict(n=3, t="Puis", h="Le lieu <i>et la date.</i>", p="Les deux se décident ensemble : c'est le lieu qui te dit quelles dates sont libres.", ic="pin"),
 dict(n=4, t="Et là seulement", h="Tu annonces <i>la date.</i>", p="Une fois le lieu réservé. Tout le reste (traiteur, tenue, déco) peut attendre un peu.", ic="calcheck"),
 dict(k="À retenir", h="Budget, invités, lieu, <i>date.</i>", p="Dans cet ordre. Enregistre ce post, et dis‑moi où tu en es.", ic="bookmark", end=True),
]
POSTS['loin'] = [
 dict(k="Invités", h="Tes invités <i>viennent de loin ?</i>", p="4 choses à leur dire le plus tôt possible.", ic="plane", go=True),
 dict(n=1, t="Chose 1 sur 4", h="La date <i>exacte.</i>", p="Pas « en juin ». Le jour précis, pour poser des congés et prendre un billet.", ic="calcheck"),
 dict(n=2, t="Chose 2 sur 4", h="La <i>ville.</i>", p="Pas besoin de l'adresse tout de suite. La ville suffit pour regarder les trajets.", ic="pin"),
 dict(n=3, t="Chose 3 sur 4", h="Combien <i>de jours.</i>", p="Une soirée, ou tout un week‑end ? Ça change le billet de retour.", ic="clock"),
 dict(n=4, t="Chose 4 sur 4", h="Où <i>dormir.</i>", p="Deux ou trois adresses près du lieu. Les meilleures partent en premier.", ic="bed"),
 dict(k="À retenir", h="Plus ils le savent tôt, <i>plus ils viennent.</i>", p="Enregistre ce post, et envoie‑le à celui ou celle qui organise avec toi.", ic="bookmark", end=True),
]
POSTS['erreursdate'] = [
 dict(k="Mariage", h="Les 4 erreurs quand on <i>annonce sa date</i> de mariage.", ic="calendar", go=True),
 dict(n=1, t="Erreur 1 sur 4", h="L'annoncer <i>avant d'avoir le lieu.</i>", p="Si le lieu n'est pas libre ce jour‑là, tu devras tout redire à tout le monde.", ic="pin"),
 dict(n=2, t="Erreur 2 sur 4", h="Oublier <i>la ville.</i>", p="La date sans le lieu, ça ne suffit pas pour s'organiser. La première question sera : c'est où ?", ic="phoneq"),
 dict(n=3, t="Erreur 3 sur 4", h="La dire <i>seulement en story.</i>", p="Elle disparaît en 24 heures, et ta grand‑mère ne l'aura jamais vue.", ic="eye"),
 dict(n=4, t="Erreur 4 sur 4", h="L'envoyer à des gens <i>que tu n'inviteras pas.</i>", p="Celui qui reçoit la date s'attend à recevoir le faire‑part.", ic="envelope"),
 dict(k="À retenir", h="Le lieu d'abord, <i>un vrai message ensuite.</i>", p="Enregistre ce post. Et toi, tu l'as annoncée comment ?", ic="bookmark", end=True),
]
POSTS['liste'] = [
 dict(k="Invités", h="Tu n'arrives pas à faire <i>ta liste d'invités ?</i>", p="3 questions qui t'aident à trancher.", ic="check", go=True),
 dict(n=1, t="Question 1 sur 3", h="Est‑ce que je l'ai vu <i>cette année ?</i>", p="Si ça fait trois ans sans nouvelles, la réponse est souvent là.", ic="calendar"),
 dict(n=2, t="Question 2 sur 3", h="Est‑ce que je l'inviterais <i>à dîner chez moi ?</i>", p="Ton mariage, c'est un très grand dîner. La question est la même.", ic="plate"),
 dict(n=3, t="Question 3 sur 3", h="Est‑ce que son absence <i>me ferait de la peine ?</i>", p="Si oui, il vient. Si tu hésites longtemps, tu as ta réponse.", ic="heart"),
 dict(k="À retenir", h="Tu invites pour toi, <i>pas par obligation.</i>", p="Enregistre ce post pour le soir où tu feras ta liste.", ic="bookmark", end=True),
]

def typo(t):
    return (t.replace('« ', '« ').replace(' »', ' »').replace(' :', ' :').replace(' ?', ' ?').replace(' !', ' !'))

CSS = """
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1080px;height:1920px;overflow:hidden}
.ad{position:relative;width:1080px;height:1920px;overflow:hidden;background:#f6f1e8;color:#1e1a17;font-variant-numeric:lining-nums}
.ad::before{content:"";position:absolute;inset:0;background:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .14 0'/></filter><rect width='300' height='300' filter='url(%23n)'/></svg>");opacity:.5;pointer-events:none}
.ic{position:absolute;left:0;top:0;width:1080px;height:860px;display:grid;place-items:center}
.ic .blob{position:absolute;width:560px;height:520px;border-radius:48% 52% 46% 54% / 55% 45% 55% 45%;background:#f6d66a;transform:rotate(-8deg)}
.ic svg{position:relative;width:420px;height:420px}
.ph{position:absolute;left:50%;top:70px;width:800px;height:740px;margin-left:-400px;border-radius:64px;background:#1e1a17;padding:20px;box-shadow:0 30px 60px rgba(0,0,0,.25)}
.ph .win{position:relative;width:760px;height:700px;border-radius:46px;overflow:hidden;background:#fff}
.ph .win img{position:absolute;left:0;width:760px}
.ph .hl{position:absolute;border:7px solid #f6d66a;border-radius:22px;box-shadow:0 0 0 4px rgba(30,26,23,.08)}
.ph.full{width:440px;height:906px;top:30px;margin-left:-220px;border-radius:56px;padding:20px}
.ph.full .win{width:400px;height:866px;border-radius:40px}
.ph.full .win img{width:400px;top:0}
.full-in .in{top:980px}
.in{position:absolute;left:84px;right:84px;top:880px;bottom:380px;display:flex;flex-direction:column;justify-content:flex-start;gap:34px}
.k{font:600 30px/1 "Inter Tight",sans-serif;letter-spacing:.22em;text-transform:uppercase;color:#8a4a2a}
.n{display:inline-flex;align-items:center;gap:18px;font:600 30px/1 "Inter Tight",sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#1e1a17}
.n b{display:grid;place-items:center;width:78px;height:78px;border-radius:50%;background:#1e1a17;color:#f6f1e8;font:600 40px/1 "Inter Tight",sans-serif;letter-spacing:0}
h1{font:400 108px/1.12 "DM Serif Display",serif;letter-spacing:-.012em;text-wrap:balance}
h1 i{font-style:normal;background:#f6d66a;-webkit-box-decoration-break:clone;box-decoration-break:clone;padding:.01em .1em .03em;margin:0 -.1em;border-radius:6px}
p{font:400 50px/1.32 "Inter Tight",sans-serif;color:#3a342f;max-width:880px;text-wrap:pretty}
.go{position:absolute;left:84px;bottom:300px;display:flex;align-items:center;gap:18px;font:600 28px/1 "Inter Tight",sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#1e1a17}
.go i{width:54px;height:54px;border-radius:50%;background:#1e1a17;color:#f6f1e8;display:grid;place-items:center;font:normal 26px/1 sans-serif;font-style:normal}
.sig{position:absolute;left:84px;bottom:296px;display:flex;align-items:baseline;gap:10px;color:#1e1a17}
.sig span{font:500 20px/1 "Inter Tight",sans-serif;letter-spacing:.26em}
.sig b{font:400 46px/1 "Great Vibes",cursive}
.hook .ic{height:560px}.hook .ic .blob{width:380px;height:350px}.hook .ic svg{width:280px;height:280px}
.hook .ph{height:620px}
.hook .in{top:560px;bottom:380px;justify-content:center;gap:40px}
.hook h1{font-size:140px;line-height:1.12}
.hook p{font-size:54px}
.pg{position:absolute;right:84px;bottom:306px;font:500 24px/1 "Inter Tight",sans-serif;letter-spacing:.14em;color:#6b625b}
"""

def html(s, i, n):
    top = f'<div class="k">{typo(s["k"])}</div>' if s.get('k') else f'<div class="n"><b>{s["n"]}</b>{s["t"]}</div>'
    body = f'<h1>{typo(s["h"])}</h1>' + (f'<p>{typo(s["p"])}</p>' if s.get('p') else '')
    go = '<div class="go">Glisse <i>→</i></div>' if s.get('go') else ''
    sig = '<div class="sig"><span>SAVE THE</span><b>Oui</b></div>' if s.get('end') else ''
    if s.get('cap') and s['cap'].get('full'):
        ic = f'<div class="ph full"><div class="win"><img src="file://{HERE}/caps/{s["cap"]["file"]}.png"></div></div>'
    elif s.get('cap'):
        c = s['cap']; k = 760 / 1170; off = c.get('off', 0); x0, y0, x1, y1 = c['box']
        hl = f'<div class="hl" style="left:{x0*k-10:.0f}px;top:{(y0-off)*k-10:.0f}px;width:{(x1-x0)*k+20:.0f}px;height:{(y1-y0)*k+20:.0f}px"></div>'
        ic = f'<div class="ph"><div class="win"><img src="file://{HERE}/caps/{c["file"]}.png" style="top:{-off*k:.0f}px">{hl}</div></div>'
    else:
        ic = f'<div class="ic"><div class="blob"></div>{svg(s["ic"])}</div>'
    fit = '<script>document.fonts.ready.then(()=>{const b=document.querySelector(".in"),h=b.querySelector("h1");let fs=parseFloat(getComputedStyle(h).fontSize);while(b.scrollHeight>b.clientHeight&&fs>84){fs-=2;h.style.fontSize=fs+"px"}})</script>'
    return f'<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>{FONTS}{CSS}</style></head><body><div class="ad{' hook' if s.get('go') else ''}{' full-in' if s.get('cap') and s['cap'].get('full') else ''}">{ic}<div class="in">{top}{body}</div>{go}{sig}<div class="pg">{i} / {n}</div></div>{fit}</body></html>'

if __name__ == '__main__':
    os.makedirs(os.path.join(HERE, 'html'), exist_ok=True)
    for slug, SL in POSTS.items():
        for i, s in enumerate(SL, 1):
            open(os.path.join(HERE, 'html', f'{slug}-{i}.html'), 'w', encoding='utf-8').write(html(s, i, len(SL)))
        print(slug, len(SL))
