"""Télécharge les polices (Google Fonts) et les héberge sur notre site : aucune requête vers Google chez les visiteurs (RGPD).
Usage : python3 business/tools/fonts.py  ->  business/landing/polices/*.woff2 + polices.css (sous-ensembles latin et latin étendu)."""
import os, re, urllib.request, hashlib
FAMILIES = ['Inter:wght@400;500;600', 'Inter+Tight:wght@400;500;600', 'Cormorant+Garamond:ital,wght@0,500;1,400', 'Great+Vibes',
            'Playfair+Display:ital,wght@0,400;1,400', 'Cinzel+Decorative:wght@400', 'Aref+Ruqaa', 'Italiana', 'Limelight', 'Parisienne',
            'Jost:wght@300;400', 'Shrikhand', 'DM+Serif+Display:ital@0;1', 'IM+Fell+English:ital@0;1']
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'landing', 'polices')
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
os.makedirs(OUT, exist_ok=True)
url = 'https://fonts.googleapis.com/css2?' + '&'.join('family=' + f for f in FAMILIES) + '&display=swap'
css = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA})).read().decode()
out = ['/* Polices hébergées chez nous (générées par business/tools/fonts.py). Licences : SIL Open Font License. */']
for sub, block in re.findall(r'/\* ([\w-]+) \*/\s*(@font-face \{.*?\})', css, re.S):
    if sub not in ('latin', 'latin-ext'):
        continue
    src = re.search(r'url\((https://[^)]+)\)', block).group(1)
    fam = re.search(r"font-family: '([^']+)'", block).group(1)
    name = re.sub(r'\W+', '-', fam).lower() + '-' + hashlib.md5(src.encode()).hexdigest()[:8] + '.woff2'
    path = os.path.join(OUT, name)
    if not os.path.exists(path):
        open(path, 'wb').write(urllib.request.urlopen(src).read())
    out.append(f'/* {sub} */\n' + block.replace(src, '/polices/' + name))
open(os.path.join(OUT, 'polices.css'), 'w').write('\n'.join(out) + '\n')
print(len(out) - 1, 'déclarations', len([f for f in os.listdir(OUT) if f.endswith('.woff2')]), 'fichiers')
