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

SITE_URL = 'https://sceau-faire-part.vercel.app'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
B = os.path.join(ROOT, 'business')
SITE = os.path.join(B, 'site')
FONTS = os.path.join(B, 'fonts-og')

# police de l'aperçu (og.jpg) par thème, et ses réglages
OGF = {
    'conte': ('Great_Vibes', 1.15, False), 'artdeco': ('Limelight', .8, False), 'aquarelle': ('Parisienne', 1.05, False),
    'bollywood': ('Cinzel_Decorative', .72, False), 'minimal': ('Jost_wght_300', .62, True), 'boheme': ('Cormorant_Garamond_ital_wght_1_400', .95, False),
    'americaine': ('Playfair_Display_ital_1', .85, False), 'pop': ('Shrikhand', .8, False), 'ceramique': ('DM_Serif_Display', .85, False),
    'nuits': ('Aref_Ruqaa', .85, False), 'gravure': ('IM_Fell_English_ital_1', .8, False), 'dolcevita': ('Italiana', .9, False),
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
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Inter+Tight:wght@500&family=Cormorant+Garamond:ital,wght@0,500;1,400&family=Great+Vibes{gf}{fontx}&display=swap" rel="stylesheet">
<link rel="preload" as="image" href="/img/hd/{theme}-1.webp">
<link rel="stylesheet" href="/invite.css">
</head>
<body>
<noscript><p style="padding:24px;font-family:sans-serif">{title}. Activez JavaScript pour ouvrir le faire-part.</p></noscript>
<script>window.INVITE={data};</script>
<script src="/themes.js"></script>
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
    """Réponses fictives, clairement présentées comme un exemple, pour le tableau de bord de démo."""
    rnd = random.Random(inv['slug'])
    evs = [e['id'] for e in inv['events']]
    fams = inv.get('families') or {}
    rows = []
    start = to_utc(inv['date'], inv.get('tz', 'Europe/Paris')) - timedelta(days=120)
    for i in range(rnd.randint(26, 38)):
        fam = rnd.choice(list(fams) + [None] * 4) if fams else None
        allowed = (fams.get(fam) or {}).get('events') or evs
        yes = rnd.random() > .16
        ev = {e: (yes and rnd.random() > .1) for e in allowed}
        rows.append({'at': (start + timedelta(hours=rnd.randint(0, 24 * 70))).isoformat().replace('+00:00', 'Z'),
                     'name': f"{rnd.choice(FIRST)} {rnd.choice(LAST)}", 'family': fam, 'guests': rnd.choice([1, 2, 2, 2, 3, 4]) if yes else 1,
                     'events': ev, 'diet': rnd.choice(['', '', '', '', 'Végétarien', 'Sans gluten', 'Allergie aux fruits à coque', 'Halal']),
                     'message': rnd.choice(MSGS)})
    rows.sort(key=lambda r: r['at'])
    return {'demo': True, 'invite': {'slug': inv['slug'], 'couple': ' & '.join(inv['couple']),
                                     'events': [{'id': e['id'], 'label': e.get('eyebrow') or e['title']} for e in inv['events']],
                                     'families': {k: v.get('label', k) for k, v in fams.items()}}, 'responses': rows}


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
    for txt, f, y, sp in [('S C E A U', f1, 222, 0), ("Le faire-part qui s'ouvre.", f2, 272, 0)]:
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
    l = open(os.path.join(SITE, 'index.html'), encoding='utf-8').read()
    l = l.replace('<meta name="robots" content="noindex">\n', '')
    open(os.path.join(SITE, 'index.html'), 'w', encoding='utf-8').write(l)

    T = themes()
    invites = {}
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
        # transitions filmées disponibles pour ce thème (img/trans/<theme>-<a>-<b>/)
        inv['trans'] = sorted(k[len(inv['theme'])+1:] for k in os.listdir(os.path.join(SITE, 'img', 'trans')) if k.startswith(inv['theme'] + '-')) if os.path.isdir(os.path.join(SITE, 'img', 'trans')) else []
        data = json.dumps(inv, ensure_ascii=False).replace('</', '<\\/')
        page = PAGE.format(lang=lang, title=html.escape(title), desc=html.escape(desc), site=SITE_URL, slug=slug, gf='' if t['gf'] == 'Great+Vibes' else '&family=' + t['gf'],
                           fontx=EXTRA_FONTS.get(inv.get('font'), ''), theme=inv['theme'], data=data)
        open(os.path.join(out, 'index.html'), 'w', encoding='utf-8').write(page)
        og_image(os.path.join(SITE, 'img', 'hd', f"{inv['theme']}-1.webp"), os.path.join(out, 'og.jpg'), couple, dt, inv['theme'], t)
        fams = inv.get('families') or {}
        invites[slug] = {
            'demo': bool(inv.get('demo')), 'couple': couple, 'date': to_utc(inv['date'], tz).isoformat(),
            'events': [e['id'] for e in inv['events']],
            'eventList': [{'id': e['id'], 'label': e.get('eyebrow') or e['title']} for e in inv['events']],
            'families': {k: {'events': v.get('events')} for k, v in fams.items()},
            'familyLabels': {k: v.get('label', k) for k, v in fams.items()},
        }
        if inv.get('demo'):
            json.dump(demo_dashboard(inv), open(os.path.join(SITE, 'tableau', 'demo', slug + '.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    open(os.path.join(SITE, 'api', '_invites.js'), 'w', encoding='utf-8').write(
        '// Généré par business/build-site.py à partir de business/invites/*.json. Ne pas modifier à la main.\nexport default ' +
        json.dumps(invites, ensure_ascii=False, indent=1) + ';\n')
    build_yk()
    # liste des démos pour la vitrine
    demos = [{'slug': 'yasmine-karim', 'theme': 'nuits', 'couple': 'Yasmine & Karim', 'special': 'Lieux réels peints et animés', 'events': 2,
              'music': 'scheherazade', 'thumb': 'd/yasmine-karim/thumb.webp'}]
    for fn in sorted(os.listdir(os.path.join(B, 'invites'))):
        inv = json.load(open(os.path.join(B, 'invites', fn), encoding='utf-8'))
        if inv.get('demo'):
            demos.append({'slug': inv['slug'], 'theme': inv['theme'], 'couple': ' & '.join(inv['couple']), 'opening': inv.get('opening', 'env'),
                          'events': len(inv['events']), 'families': bool(inv.get('families')), 'lang': inv.get('lang', 'fr'),
                          'music': inv.get('music') or T[inv['theme']].get('music'), 'thumb': f"img/themes/{inv['theme']}-2.webp"})
    p = os.path.join(SITE, 'index.html')
    l = open(p, encoding='utf-8').read()
    assert '[]/*DEMOS*/' in l
    open(p, 'w', encoding='utf-8').write(l.replace('[]/*DEMOS*/', json.dumps(demos, ensure_ascii=False)))
    site_og(T)
    print('site ->', SITE, '|', len(invites), 'faire-part')


if __name__ == '__main__':
    main()
