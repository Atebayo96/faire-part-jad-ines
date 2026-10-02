"""Génère les images brutes des faire-part « en continu » à partir de business/tools/long-prompts.json (avec gemini.py).
Usage : python3 business/tools/long-gen.py <dossier des images brutes> <thème> [<thème> ...] [--only hero,tex1] [--jobs 6] [--force]
Résultat : <dossier>/<thème>-<nom>.png (hero, tex1-3, band1-2, frame, ph1-4, scene2-4), à passer ensuite à long-assets.py.
Une référence « @<thème>/<nom> » désigne une image brute déjà générée (par exemple l'illustration d'ouverture) :
ces images-là sont faites en second, une fois leur référence prête. Une image qui échoue est retentée deux fois."""
import json, os, subprocess, sys
from concurrent.futures import ThreadPoolExecutor

args = sys.argv[1:]
def opt(name, default):
    if name in args:
        i = args.index(name); v = args[i + 1]; del args[i:i + 2]; return v
    return default
jobs, only = int(opt('--jobs', '6')), opt('--only', '')
force = '--force' in args
if force: args.remove('--force')
RAW, themes = args[0], args[1:]
B = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = json.load(open(os.path.join(B, 'tools', 'long-prompts.json'), encoding='utf-8'))
os.makedirs(RAW, exist_ok=True)
out = lambda key: os.path.join(RAW, key.replace('/', '-') + '.png')

todo = [k for k in P if k.split('/')[0] in themes and (not only or k.split('/')[1] in only.split(','))]
todo = [k for k in todo if force or not os.path.exists(out(k))]

def run(key):
    c = P[key]; ref = c.get('ref')
    refs = [] if not ref else [out(ref[1:]) if ref.startswith('@') else os.path.join(B, '..', ref)]
    cmd = [sys.executable, os.path.join(B, 'tools', 'gemini.py'), out(key), c['prompt'], *refs,
           '--model', c.get('model', 'gemini-3-pro-image'), '--ratio', c.get('ratio', '9:16'), '--size', c.get('size', '2K')]
    for attempt in range(3):
        r = subprocess.run(cmd, capture_output=True, text=True)
        if r.returncode == 0 and os.path.exists(out(key)):
            print('ok   ', key, flush=True); return True
    print('ÉCHEC', key, (r.stderr or r.stdout).strip()[-300:], flush=True); return False

first = [k for k in todo if not str(P[k].get('ref', '')).startswith('@')]
second = [k for k in todo if k not in first]
with ThreadPoolExecutor(jobs) as ex:
    list(ex.map(run, first))
    list(ex.map(run, [k for k in second if os.path.exists(out(P[k]['ref'][1:]))]))
missing = [k for k in todo if not os.path.exists(out(k))]
print(len(todo) - len(missing), '/', len(todo), 'images', ('— manquantes : ' + ', '.join(missing)) if missing else '')
