"""Transforme une vidéo de scène en 24 images pour l'animation au défilement.
Usage : python3 business/tools/frames.py conte-1=https://.../video.mp4 [artdeco-2=...]
Résultat : business/site/img/frames/<theme>-<n>/f01.webp ... f24.webp (560 px de large)."""
import os, sys, subprocess, tempfile, urllib.request
import imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe()
# rangées directement dans le site publié (une seule copie dans le dépôt ; build-site.py les conserve)
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'site', 'img', 'frames')
N = 24
for arg in sys.argv[1:]:
    key, url = arg.split('=', 1)
    with tempfile.TemporaryDirectory() as tmp:
        src = os.path.join(tmp, 'v.mp4')
        urllib.request.urlretrieve(url, src)
        dur = float(subprocess.run([FF, '-i', src], capture_output=True, text=True).stderr.split('Duration: ')[1].split(',')[0].split(':')[-1])
        d = os.path.join(OUT, key); os.makedirs(d, exist_ok=True)
        # 24 images régulièrement espacées, en évitant la toute dernière image (souvent figée)
        fps = N / max(.5, dur - .05)
        subprocess.run([FF, '-y', '-loglevel', 'error', '-i', src, '-vf', f'fps={fps:.4f},scale=560:-2:flags=lanczos', '-frames:v', str(N),
                        '-c:v', 'libwebp', '-quality', '58', os.path.join(d, 'f%02d.webp')], check=True)
        print(key, len(os.listdir(d)), 'images', f'{dur:.2f}s')
