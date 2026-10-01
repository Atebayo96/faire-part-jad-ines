"""Transforme une vidéo de scène en 24 images pour l'animation au défilement.
Usage : python3 business/tools/frames.py conte-1=https://.../video.mp4 [artdeco-2=/chemin/local.mp4 ...]
Résultat : business/site/img/frames/<theme>-<n>/f01.webp ... f24.webp (720 px de large, la définition native de la vidéo).
Transitions filmées d'une scène à l'autre : python3 business/tools/frames.py --trans nuits-1-2=https://.../video.mp4
  -> business/site/img/trans/nuits-1-2/f01.webp ... f32.webp (la première image = scène 1, la dernière = scène 2)."""
import os, sys, subprocess, tempfile, urllib.request
import imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe()
# rangées directement dans le site publié (une seule copie dans le dépôt ; build-site.py les conserve)
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'site', 'img', 'frames')
TRANS = '--trans' in sys.argv
if TRANS: OUT = os.path.join(os.path.dirname(OUT), 'trans')
N = 32 if TRANS else 24
for arg in [a for a in sys.argv[1:] if a != '--trans']:
    key, url = arg.split('=', 1)
    with tempfile.TemporaryDirectory() as tmp:
        src = os.path.join(tmp, 'v.mp4')
        if url.startswith('http'): urllib.request.urlretrieve(url, src)
        else: src = url
        dur = float(subprocess.run([FF, '-i', src], capture_output=True, text=True).stderr.split('Duration: ')[1].split(',')[0].split(':')[-1])
        d = os.path.join(OUT, key); os.makedirs(d, exist_ok=True)
        # 24 images régulièrement espacées, en évitant la toute dernière image (souvent figée)
        fps = N / max(.5, dur - .05)
        subprocess.run([FF, '-y', '-loglevel', 'error', '-i', src, '-vf', f'fps={fps:.4f},scale=' + ('768' if TRANS else '720') + ':-2:flags=lanczos', '-frames:v', str(N),
                        '-c:v', 'libwebp', '-quality', '70', '-compression_level', '6', os.path.join(d, 'f%02d.webp')], check=True)
        print(key, len(os.listdir(d)), 'images', f'{dur:.2f}s')
