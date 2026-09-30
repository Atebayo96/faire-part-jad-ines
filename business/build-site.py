"""Assemble le site vitrine autonome dans business/site/ (deploye sur Vercel, projet sceau-faire-part).
Usage : python3 business/build-site.py  (depuis la racine du repo)"""
import shutil, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(ROOT, 'business', 'site')
shutil.rmtree(SITE, ignore_errors=True)
shutil.copytree(os.path.join(ROOT, 'business/landing/img'), os.path.join(SITE, 'img'))
l = open(os.path.join(ROOT, 'business/landing/index.html'), encoding='utf-8').read()
l = l.replace('<meta name="robots" content="noindex">\n', '')
open(os.path.join(SITE, 'index.html'), 'w', encoding='utf-8').write(l)
print('site ->', SITE)
