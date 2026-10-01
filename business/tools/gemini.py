"""Génère ou retouche une image avec Gemini (clé lue dans la variable d'environnement GEMINI_API_KEY, jamais écrite ailleurs).
Usage : python3 business/tools/gemini.py sortie.png "consigne" [image_de_reference.webp ...] [--model gemini-3-pro-image] [--ratio 9:16] [--size 2K]"""
import base64, json, os, sys, urllib.request, mimetypes

args = sys.argv[1:]
def opt(name, default):
    if name in args:
        i = args.index(name); v = args[i + 1]; del args[i:i + 2]; return v
    return default
model = opt('--model', 'gemini-3-pro-image')
ratio = opt('--ratio', '9:16')
size = opt('--size', '2K')
out, prompt, refs = args[0], args[1], args[2:]

parts = []
for r in refs:
    mime = mimetypes.guess_type(r)[0] or 'image/png'
    parts.append({'inline_data': {'mime_type': mime, 'data': base64.b64encode(open(r, 'rb').read()).decode()}})
parts.append({'text': prompt})
body = {'contents': [{'parts': parts}],
        'generationConfig': {'responseModalities': ['IMAGE'], 'imageConfig': {'aspectRatio': ratio, 'imageSize': size}}}
req = urllib.request.Request(f'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent',
                             data=json.dumps(body).encode(), method='POST',
                             headers={'Content-Type': 'application/json', 'x-goog-api-key': os.environ['GEMINI_API_KEY']})
try:
    res = json.load(urllib.request.urlopen(req, timeout=300))
except urllib.error.HTTPError as e:
    sys.exit(f'Erreur {e.code} : {e.read().decode()[:500]}')
for c in res.get('candidates', []):
    for p in c.get('content', {}).get('parts', []):
        d = p.get('inlineData') or p.get('inline_data')
        if d:
            open(out, 'wb').write(base64.b64decode(d['data'])); print(out); sys.exit()
sys.exit('Pas d\'image dans la réponse : ' + json.dumps(res)[:600])
