"""Assemble le site Sceau dans business/site/ (déployé sur Vercel, projet sceau-faire-part, racine business/site).

  - business/landing/      -> vitrine, moteur de faire-part (invite.js/css), API, pages légales, tableau de bord
  - business/invites/*.json -> un faire-part par fichier, publié sur /d/<slug>/ (avec son aperçu WhatsApp og.jpg)
  - business/demo/yasmine-karim -> notre faire-part réel renommé, publié sur /d/yasmine-karim/

Usage : python3 business/build-site.py  (depuis la racine du repo)
"""
import json, os, shutil, random, html
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from PIL import Image, ImageDraw, ImageFont, ImageFilter

SITE_URL = 'https://savetheoui.fr'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
B = os.path.join(ROOT, 'business')
SITE = os.path.join(B, 'site')
FONTS = os.path.join(B, 'fonts-og')

# police de l'aperçu (og.jpg) par thème, et ses réglages
OGF = {
    'conte': ('Great_Vibes', 1.15, False), 'artdeco': ('Limelight', .8, False), 'aquarelle': ('Parisienne', 1.05, False),
    'bollywood': ('Cinzel_Decorative', .72, False), 'minimal': ('Jost_wght_300', .62, True), 'boheme': ('Cormorant_Garamond_ital_wght_1_400', .95, False),
    'americaine': ('Playfair_Display_ital_1', .85, False), 'pop': ('Shrikhand', .8, False), 'ceramique': ('DM_Serif_Display', .85, False),
    'nuits': ('Aref_Ruqaa', .85, False), 'gravure': ('IM_Fell_English_ital_1', .8, False), 'dolcevita': ('Italiana', .9, False), 'dolcevitajour': ('Italiana', .9, False),
}


def themes():
    """Lit themes.js (objet JS) via node pour récupérer couleurs et polices."""
    import subprocess
    out = subprocess.run(['node', '-e', "global.window={};require(process.argv[1]);console.log(JSON.stringify(window.SCEAU_THEMES))",
                          os.path.join(B, 'landing', 'themes.js')], capture_output=True, text=True, check=True).stdout
    return json.loads(out)


def to_utc(s, tz):
    d = datetime.fromisoformat(s).replace(tzinfo=ZoneInfo(tz))
    return d.astimezone(ZoneInfo('UTC'))


MONTHS = {'fr': 'janvier février mars avril mai juin juillet août septembre octobre novembre décembre'.split(),
          'en': 'January February March April May June July August September October November December'.split()}


def date_text(inv):
    if inv.get('intro', {}).get('dateText'):
        return inv['intro']['dateText']
    d = datetime.fromisoformat(inv['date'])
    m = MONTHS[inv.get('lang', 'fr')][d.month - 1]
    return f"{d.day} {m} {d.year}" if inv.get('lang', 'fr') == 'fr' else f"{m} {d.day}, {d.year}"


OGX = {'gravure': {'crop': .355, 'maxw': .42, 'ty': .44}, 'boheme': {'crop': 0, 'ty': .42}, 'yk': {'crop': .12, 'ty': .27}}


def og_image(bg_path, out, title, sub, theme_key, t, crop_top=.08, x=None):
    """Image d'aperçu 1200x630 : le haut de la scène d'accueil + les prénoms dans la police du thème."""
    W, H = 1200, 630
    x = x or OGX.get(theme_key, {})
    crop_top = x.get('crop', crop_top)
    im = Image.open(bg_path).convert('RGB')
    im = im.resize((W, int(im.height * W / im.width)), Image.LANCZOS)
    y = int(im.height * crop_top)
    im = im.crop((0, y, W, y + H))
    light = t.get('light')
    if not light:
        shade = Image.new('L', (1, H))
        for i in range(H):
            shade.putpixel((0, i), int(120 * (1 - i / H) ** 1.2) + 30)
        im = Image.composite(Image.new('RGB', (W, H), (12, 10, 8)), im, shade.resize((W, H)))
    else:
        veil = Image.new('RGB', (W, H), (255, 253, 248))
        im = Image.blend(im, veil, .35)
    d = ImageDraw.Draw(im)
    fname, k, upper = OGF.get(theme_key, ('Cormorant_Garamond_wght_500', 1, False))
    txt = title.upper() if upper else title
    size = int(118 * k)
    f = ImageFont.truetype(os.path.join(FONTS, fname + '.ttf'), size)
    while d.textlength(txt, font=f) > W * x.get('maxw', .86) and size > 30:
        size -= 4
        f = ImageFont.truetype(os.path.join(FONTS, fname + '.ttf'), size)
    col = t.get('color', '#ffffff') if light else '#ffffff'
    sub_col = t.get('tx', col) if light else '#f3ead8'
    tw = d.textlength(txt, font=f)
    ty = H * x.get('ty', .40) - size / 2
    if not light:
        glow = Image.new('L', (W, H), 0)
        ImageDraw.Draw(glow).text(((W - tw) / 2, ty), txt, font=f, fill=150)
        im = Image.composite(Image.new('RGB', (W, H), (0, 0, 0)), im, glow.filter(ImageFilter.GaussianBlur(14)))
        d = ImageDraw.Draw(im)
    d.text(((W - tw) / 2, ty), txt, font=f, fill=col)
    fs = ImageFont.truetype(os.path.join(FONTS, 'Cormorant_Garamond_wght_500.ttf'), 46 if x.get('maxw', 1) > .6 else 36)
    sw = d.textlength(sub, font=fs)
    sy = ty + size * 1.25 + 18
    d.text(((W - sw) / 2, sy), sub, font=fs, fill=sub_col)
    d.line(((W - sw) / 2 - 70, sy + 28, (W - sw) / 2 - 22, sy + 28), fill=sub_col, width=2)
    d.line(((W + sw) / 2 + 22, sy + 28, (W + sw) / 2 + 70, sy + 28), fill=sub_col, width=2)
    im.save(out, 'JPEG', quality=84, optimize=True, progressive=True)


PAGE = """<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="robots" content="noindex">
<meta property="og:type" content="website">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="{site}/d/{slug}/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="{site}/d/{slug}/">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#111111">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/polices/polices.css">
<link rel="preload" as="image" href="{preload}">
<link rel="stylesheet" href="/invite.css">
<link rel="stylesheet" href="/reveal.css">
</head>
<body>
<noscript><p style="padding:24px;font-family:sans-serif">{title}. Activez JavaScript pour ouvrir le faire-part.</p></noscript>
<script>window.INVITE={data};</script>
<script src="/themes.js"></script>
<script src="/reveal.js"></script>
<script src="/invite.js"></script>
</body>
</html>
"""
EXTRA_FONTS = {'script': '', 'classique': '&family=Playfair+Display:ital@0;1', 'moderne': '&family=Jost:wght@300;400', 'deco': '&family=Limelight'}

FIRST = ['Sophie', 'Karim', 'Léa', 'Mehdi', 'Camille', 'Lucas', 'Inès', 'Hugo', 'Nadia', 'Julien', 'Amina', 'Thomas', 'Sarah', 'Youssef', 'Claire', 'Antoine',
         'Fatima', 'Paul', 'Chloé', 'Omar', 'Manon', 'Rachid', 'Julie', 'Pierre', 'Leïla', 'Nicolas', 'Emma', 'Samir', 'Laura', 'Maxime']
LAST = ['Martin', 'Benali', 'Durand', 'Haddad', 'Lefèvre', 'Moreau', 'Rossi', 'Garcia', 'Bernard', 'Cherif', 'Petit', 'Roux', 'Fontaine', 'Mercier', 'Girard', 'Lambert']
MSGS = ['Trop hâte !', 'Félicitations à vous deux ❤️', 'On sera là, évidemment.', 'Merci pour cette belle invitation.', '', '', '', 'Vive les mariés !',
        'Désolés, nous serons à l’étranger. On pense fort à vous.', 'Le faire-part est magnifique !']


def demo_dashboard(inv):
    """Réponses fictives, clairement présentées comme un exemple, pour le tableau de bord de démo
    (personnes nommées et leur menu, réponse à la question, ouvertures des liens par famille)."""
    rnd = random.Random(inv['slug'])
    evs = [e['id'] for e in inv['events']]
    fams = inv.get('families') or {}
    R = inv.get('rsvp') or {}
    menus, question = R.get('menu') or [], R.get('question') or ''
    rows = []
    start = to_utc(inv['date'], inv.get('tz', 'Europe/Paris')) - timedelta(days=120)
    for i in range(rnd.randint(26, 38)):
        fam = rnd.choice(list(fams) + [None] * 4) if fams else None
        allowed = (fams.get(fam) or {}).get('events') or evs
        yes = rnd.random() > .16
        ev = {e: (yes and rnd.random() > .1) for e in allowed}
        last = rnd.choice(LAST)
        n = rnd.choice([1, 2, 2, 2, 3, 4]) if yes else 1
        people = [{'name': f"{rnd.choice(FIRST)} {last}", 'menu': rnd.choice(menus) if menus else ''} for _ in range(n)]
        rows.append({'rid': f"demo-{i}", 'at': (start + timedelta(hours=rnd.randint(0, 24 * 70))).isoformat().replace('+00:00', 'Z'),
                     'name': people[0]['name'], 'family': fam, 'guests': n, 'events': ev, 'people': people if yes else [],
                     'diet': rnd.choice(['', '', '', '', 'Végétarien', 'Sans gluten', 'Allergie aux fruits à coque', 'Halal']),
                     'answer': rnd.choice(['', '', 'Dancing Queen', 'Quelque chose de Stromae', 'Aïcha, Khaled', 'Un peu de Céline Dion']) if question else '',
                     'message': rnd.choice(MSGS)})
    rows.sort(key=lambda r: r['at'])
    # ouvertures des liens par famille : l'exemple montre les trois états (répondu, ouvert sans réponse, pas encore ouvert)
    seen = {}
    for i, f in enumerate(fams):
        state = i % 3
        if state:
            rows = [r for r in rows if r['family'] != f]
        if state == 2:
            continue
        first = start + timedelta(hours=rnd.randint(0, 24 * 20))
        seen[f] = {'first': first.isoformat().replace('+00:00', 'Z'), 'last': (first + timedelta(hours=rnd.randint(0, 24 * 30))).isoformat().replace('+00:00', 'Z'), 'n': rnd.randint(1, 5)}
    return {'demo': True, 'invite': {'slug': inv['slug'], 'couple': ' & '.join(inv['couple']),
                                     'events': [{'id': e['id'], 'label': e.get('eyebrow') or e['title']} for e in inv['events']],
                                     'families': {k: v.get('label', k) for k, v in fams.items()}, 'menu': menus, 'question': question},
            'responses': rows, 'seen': seen}


def build_yk():
    """Publie la démo Yasmine & Karim (notre faire-part) avec seulement les fichiers nécessaires, et une musique libre."""
    src = os.path.join(B, 'demo', 'yasmine-karim', 'index.html')
    out = os.path.join(SITE, 'd', 'yasmine-karim')
    os.makedirs(out, exist_ok=True)
    h = open(src, encoding='utf-8').read()
    h = h.replace('<base href="../../../">', '<base href="/d/yasmine-karim/">')
    h = h.replace('src="assets/music.mp3"', 'src="/music/scheherazade.mp3"')
    og = (f'<meta property="og:image" content="{SITE_URL}/d/yasmine-karim/og.jpg">\n  <meta property="og:url" content="{SITE_URL}/d/yasmine-karim/">\n'
          '  <meta name="robots" content="noindex">\n  <meta property="og:image:width" content="1200">\n  <meta property="og:image:height" content="630">')
    h = h.replace('<meta property="og:image:width" content="768">\n  <meta property="og:image:height" content="768">', og)
    assert 'assets/music.mp3' not in h, 'la musique du mariage ne doit pas partir en ligne'
    open(os.path.join(out, 'index.html'), 'w', encoding='utf-8').write(h)
    files = ['assets/el_lantern.png', 'assets/env_gen_body_without_flap_flat20.png', 'assets/env_gen_top_flap_flat20_cropped_plus10.png',
             'assets/hero_hands.png', 'assets/mairie_building.png', 'assets/mairie_sky.png', 'assets/palacio_building.png', 'assets/palacio_sky_starry.png',
             'hero_concepts/final_paris2.png', 'hero_concepts/g6_grotte_a.png', 'hero_concepts/v3_bague_jade_mir.png',
             'business/demo/yasmine-karim/mairie.ics', 'business/demo/yasmine-karim/palacio.ics', 'business/demo/yasmine-karim/seal_yk.webp']
    files += [f'assets/nuit_lantern_{i}.png' for i in range(1, 6)]
    for f in files:
        os.makedirs(os.path.dirname(os.path.join(out, f)), exist_ok=True)
        shutil.copy(os.path.join(ROOT, f), os.path.join(out, f))
    for d in ['fonts', 'hero_frames_mir', 'grotte_frames', 'paris_frames', 'mairie_frames', 'palacio_frames']:
        shutil.copytree(os.path.join(ROOT, d), os.path.join(out, d))
    og_image(os.path.join(ROOT, 'hero_concepts', 'v3_bague_jade_mir.png'), os.path.join(out, 'og.jpg'),
             'Yasmine & Karim', '12 juin 2027', 'conte', {'color': '#ffffff'}, x=OGX['yk'])
    th = Image.open(os.path.join(ROOT, 'hero_concepts', 'final_paris2.png')).convert('RGB')
    th = th.resize((540, int(th.height * 540 / th.width)), Image.LANCZOS)
    th.save(os.path.join(out, 'thumb.webp'), 'WEBP', quality=76)


def site_og(T):
    """Aperçu de la vitrine : 4 thèmes côte à côte + la signature."""
    W, H = 1200, 630
    im = Image.new('RGB', (W, H), (255, 255, 255))
    for i, k in enumerate(['conte', 'artdeco', 'nuits', 'dolcevita', 'aquarelle']):
        t = Image.open(os.path.join(SITE, 'img', 'hd', f'{k}-2.webp')).convert('RGB')
        w = W // 5
        t = t.resize((int(t.width * H / t.height), H), Image.LANCZOS)
        x0 = (t.width - w) // 2
        im.paste(t.crop((x0, 0, x0 + w, H)), (i * w, 0))
    shade = Image.new('RGB', (W, H), (10, 9, 8))
    mask = Image.new('L', (W, H), 0)
    ImageDraw.Draw(mask).rectangle((0, 190, W, 440), fill=165)
    im = Image.composite(shade, im, mask.filter(ImageFilter.GaussianBlur(40)))
    d = ImageDraw.Draw(im)
    f1 = ImageFont.truetype(os.path.join(FONTS, 'Inter_wght_500.ttf'), 30)
    f2 = ImageFont.truetype(os.path.join(FONTS, 'Cormorant_Garamond_ital_wght_1_400.ttf'), 92)
    for txt, f, y, sp in [('S A V E   T H E   O U I', f1, 222, 0), ("Votre mariage, peint et animé.", f2, 272, 0)]:
        w = d.textlength(txt, font=f)
        d.text(((W - w) / 2, y), txt, font=f, fill=(255, 255, 255))
    im.save(os.path.join(SITE, 'og-sceau.jpg'), 'JPEG', quality=84, optimize=True)


def main():
    # les images d'animation (img/frames) ne vivent que dans site/ : on les met de côté pendant la reconstruction
    # (scènes animées img/frames et transitions filmées img/trans)
    kept = []
    for sub in ('frames', 'trans'):
        src, keep = os.path.join(SITE, 'img', sub), os.path.join(B, f'.{sub}-keep')
        if os.path.isdir(src):
            shutil.rmtree(keep, ignore_errors=True); shutil.move(src, keep); kept.append((keep, src))
    shutil.rmtree(SITE, ignore_errors=True)
    shutil.copytree(os.path.join(B, 'landing'), SITE, ignore=shutil.ignore_patterns('CREDITS.md', 'node_modules'))
    for keep, src in kept:
        shutil.move(keep, src)
    # la vitrine est en quatre pages (accueil, modèles, formules, créer) qui partagent vitrine.css et vitrine.js
    PAGES = ['/', '/modeles/', '/formules/', '/creer/', '/questions/', '/contact/']
    for u in PAGES:
        fp = os.path.join(SITE, u.strip('/'), 'index.html')
        l = open(fp, encoding='utf-8').read()
        l = l.replace('<meta name="robots" content="noindex">\n', '')
        l = l.replace('<link rel="icon" href="/favicon.svg" type="image/svg+xml">', f'<link rel="icon" href="/favicon.svg" type="image/svg+xml">\n<link rel="canonical" href="{SITE_URL}{u}">', 1)
        open(fp, 'w', encoding='utf-8').write(l)
    # référencement : la vitrine et les pages légales ; les faire-part, tableaux de bord et l'admin restent hors des moteurs
    open(os.path.join(SITE, 'robots.txt'), 'w').write(f"User-agent: *\nDisallow: /d/\nDisallow: /tableau/\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: {SITE_URL}/sitemap.xml\n")
    today = __import__('datetime').date.today().isoformat()
    urls = ''.join(f'  <url><loc>{SITE_URL}{u}</loc><lastmod>{today}</lastmod></url>\n' for u in PAGES + ['/mentions-legales/', '/cgv/', '/confidentialite/'])
    open(os.path.join(SITE, 'sitemap.xml'), 'w').write(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{urls}</urlset>\n')

    T = themes()
    invites = {}
    # calques disponibles par thème (img/calques/<thème>-<clé>.webp, business/tools/calques.py)
    calques = {}
    cdir = os.path.join(SITE, 'img', 'calques')
    for f in (sorted(os.listdir(cdir)) if os.path.isdir(cdir) else []):
        th, key = f[:-5].rsplit('-', 1)
        # nocal:true (themes.js) : le thème garde ses peintures entières, sans détourage (Dolce Vita, 5 octobre 2026)
        if T.get(th, {}).get('nocal'): continue
        calques.setdefault(th, []).append(key)
    os.makedirs(os.path.join(SITE, 'tableau', 'demo'), exist_ok=True)
    for fn in sorted(os.listdir(os.path.join(B, 'invites'))):
        if not fn.endswith('.json'):
            continue
        inv = json.load(open(os.path.join(B, 'invites', fn), encoding='utf-8'))
        slug, t = inv['slug'], T[inv['theme']]
        assert slug + '.json' == fn, fn
        tz = inv.get('tz', 'Europe/Paris')
        couple = ' & '.join(inv['couple'])
        out = os.path.join(SITE, 'd', slug)
        os.makedirs(out, exist_ok=True)
        lang = inv.get('lang', 'fr')
        dt = date_text(inv)
        title = inv.get('title') or f"{couple} · {dt}"
        desc = ('You are invited. Open our wedding invitation.' if lang == 'en' else 'Vous êtes invités. Ouvrez notre faire-part.')
        # scènes animées disponibles (images tirées des vidéos, voir business/tools/frames.py)
        inv['anim'] = [n for n in range(1, 5) if os.path.isdir(os.path.join(SITE, 'img', 'frames', f"{inv['theme']}-{n}"))]
        # calques : sujets détourés posés sur le fond du thème (business/tools/calques.py)
        inv['calques'] = calques.get(inv['theme'], [])
        # mise en page continue : description des images du thème (business/tools/long-assets.py)
        if inv.get('layout') == 'long':
            inv['long'] = json.load(open(os.path.join(B, 'landing', 'img', 'long', inv['theme'], 'meta.json')))
        # transitions filmées disponibles pour ce thème (img/trans/<theme>-<a>-<b>/)
        # portiers devant les grandes portes : seulement sur demande ("doormen": true) et si le thème a son image
        # (img/open/<thème>-portier.webp). Retirés des démos : l'utilisateur les a trouvés « pas ouf pour l'instant ».
        inv['doormen'] = inv.get('doormen') is True and inv.get('opening') == 'door' and os.path.exists(os.path.join(SITE, 'img', 'open', f"{inv['theme']}-portier.webp"))
        inv['trans'] = sorted(k[len(inv['theme'])+1:] for k in os.listdir(os.path.join(SITE, 'img', 'trans')) if k.startswith(inv['theme'] + '-')) if os.path.isdir(os.path.join(SITE, 'img', 'trans')) else []
        data = json.dumps(inv, ensure_ascii=False).replace('</', '<\\/')
        page = PAGE.format(lang=lang, title=html.escape(title), desc=html.escape(desc), site=SITE_URL, slug=slug, gf='' if t['gf'] == 'Great+Vibes' else '&family=' + t['gf'],
                           fontx=EXTRA_FONTS.get(inv.get('font'), ''), theme=inv['theme'], data=data,
                           preload=inv['long']['base'] + '/' + inv['long']['hero']['src'] if inv.get('long') else f"/img/hd/{inv['theme']}-1.webp")
        open(os.path.join(out, 'index.html'), 'w', encoding='utf-8').write(page)
        # aperçu WhatsApp : le haut de la scène d'accueil, ou, pour les styles qui n'existent qu'en grand tableau, le ciel de l'illustration
        if t.get('long'):
            og_image(os.path.join(SITE, 'img', 'long', inv['theme'], 'hero.webp'), os.path.join(out, 'og.jpg'), couple, dt, inv['theme'], t, x={'crop': .01})
        else:
            og_image(os.path.join(SITE, 'img', 'hd', f"{inv['theme']}-1.webp"), os.path.join(out, 'og.jpg'), couple, dt, inv['theme'], t)
        fams = inv.get('families') or {}
        invites[slug] = {
            'demo': bool(inv.get('demo')), 'couple': couple, 'date': to_utc(inv['date'], tz).isoformat(),
            'events': [e['id'] for e in inv['events']],
            'eventList': [{'id': e['id'], 'label': e.get('eyebrow') or e['title']} for e in inv['events']],
            'families': {k: {'events': v.get('events')} for k, v in fams.items()},
            'familyLabels': {k: v.get('label', k) for k, v in fams.items()},
            # réponse enrichie : les menus au choix et la question libre du couple (api/rsvp.js vérifie le menu, le tableau de bord les affiche)
            'rsvpMenu': [str(m) for m in ((inv.get('rsvp') or {}).get('menu') or [])][:8],
            'rsvpQuestion': (inv.get('rsvp') or {}).get('question') or '',
            # liste de mariage chez nous : les cadeaux qu'on peut réserver (api/gifts.js)
            'gifts': [x.get('id') or f'g{k}' for k, x in enumerate((inv.get('gifts') or {}).get('items') or [])] if (inv.get('gifts') or {}).get('mode') == 'liste' else [],
            'giftLabels': {(x.get('id') or f'g{k}'): x.get('name', '') for k, x in enumerate((inv.get('gifts') or {}).get('items') or [])},
        }
        if inv.get('demo'):
            json.dump(demo_dashboard(inv), open(os.path.join(SITE, 'tableau', 'demo', slug + '.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    open(os.path.join(SITE, 'api', '_invites.js'), 'w', encoding='utf-8').write(
        '// Généré par business/build-site.py à partir de business/invites/*.json. Ne pas modifier à la main.\nexport default ' +
        json.dumps(invites, ensure_ascii=False, indent=1) + ';\n')
    build_yk()
    # liste des démos pour la vitrine
    demos = [{'slug': 'yasmine-karim', 'theme': 'nuits', 'couple': 'Yasmine & Karim', 'special': 'Lieux réels peints et animés', 'events': 2,
              'music': 'scheherazade', 'thumb': '/d/yasmine-karim/thumb.webp'}]
    for fn in sorted(os.listdir(os.path.join(B, 'invites'))):
        inv = json.load(open(os.path.join(B, 'invites', fn), encoding='utf-8'))
        if inv.get('demo'):
            demos.append({'slug': inv['slug'], 'theme': inv['theme'], 'couple': ' & '.join(inv['couple']), 'opening': inv.get('opening', 'env'), 'layout': inv.get('layout', 'pages'), 'reveal': inv.get('reveal'), 'kind': inv.get('kind'),
                          'events': len(inv['events']), 'families': bool(inv.get('families')), 'lang': inv.get('lang', 'fr'),
                          'music': inv.get('music') or T[inv['theme']].get('music'), 'thumb': f"/img/themes/{inv['theme']}-2.webp"})
    for u in PAGES:
        p = os.path.join(SITE, u.strip('/'), 'index.html')
        l = open(p, encoding='utf-8').read()
        assert '[]/*DEMOS*/' in l and '{}/*CALQUES*/' in l, p
        open(p, 'w', encoding='utf-8').write(l.replace('[]/*DEMOS*/', json.dumps(demos, ensure_ascii=False)).replace('{}/*CALQUES*/', json.dumps(calques)))
    site_og(T)
    print('site ->', SITE, '|', len(invites), 'faire-part')


if __name__ == '__main__':
    main()
