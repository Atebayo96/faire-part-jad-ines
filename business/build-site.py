"""Assemble le site vitrine autonome dans business/site/ (deploye sur Vercel, projet separe du faire-part).
Usage : python3 business/build-site.py  (depuis la racine du repo)"""
import re, shutil, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(ROOT, 'business', 'site')
shutil.rmtree(SITE, ignore_errors=True)
os.makedirs(os.path.join(SITE, 'demo'))
cp = lambda src, dst: (os.makedirs(os.path.dirname(os.path.join(SITE, dst)), exist_ok=True), shutil.copy2(os.path.join(ROOT, src), os.path.join(SITE, dst)))
shutil.copytree(os.path.join(ROOT, 'business/landing/img'), os.path.join(SITE, 'img'))
for d in ['hero_frames_mir', 'grotte_frames', 'mairie_frames', 'palacio_frames', 'paris_frames', 'fonts']:
    shutil.copytree(os.path.join(ROOT, d), os.path.join(SITE, d))
for f in ['final_paris2.png', 'g6_grotte_a.png', 'v3_bague_jade_mir.png']:
    cp('hero_concepts/' + f, 'hero_concepts/' + f)
for a in ['env_gen_top_flap_flat20_cropped_plus10.png', 'env_gen_body_without_flap_flat20.png', 'el_lantern.png', 'hero_hands.png',
          'mairie_building.png', 'mairie_sky.png', 'palacio_building.png', 'palacio_sky_starry.png'] + [f'nuit_lantern_{i}.png' for i in range(1, 6)]:
    cp('assets/' + a, 'assets/' + a)
for f in ['seal_yk.webp', 'mairie.ics', 'palacio.ics']:
    cp('business/demo/yasmine-karim/' + f, 'demo/' + f)
d = open(os.path.join(ROOT, 'business/demo/yasmine-karim/index.html'), encoding='utf-8').read()
d = d.replace('<base href="../../../">', '<base href="../">').replace('business/demo/yasmine-karim/', 'demo/')
# musique du mariage : non diffusee dans la vitrine (droits)
d = d.replace('<audio id="bgm" src="assets/music.mp3" loop preload="auto"></audio>', '<audio id="bgm" loop preload="none"></audio>')
open(os.path.join(SITE, 'demo/index.html'), 'w', encoding='utf-8').write(d)
l = open(os.path.join(ROOT, 'business/landing/index.html'), encoding='utf-8').read()
l = l.replace('src="../demo/yasmine-karim/index.html"', 'src="demo/index.html"').replace('<meta name="robots" content="noindex">\n', '')
open(os.path.join(SITE, 'index.html'), 'w', encoding='utf-8').write(l)
print('site ->', SITE)
