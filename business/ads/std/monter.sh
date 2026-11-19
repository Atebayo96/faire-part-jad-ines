#!/bin/bash
# Monte un enregistrement d'écran (ecrans/<thème>-<jeu>.mp4) en vidéo TikTok : l'écran réduit sur son propre fond flouté,
# une légende blanche en haut (hors des boutons de TikTok), une musique libre de droits (landing/music/CREDITS.md).
#   bash monter.sh <thème>-<jeu> <musique> "Ligne 1" ["Ligne 2"]   ->  videos/<thème>-<jeu>.mp4
cd "$(dirname "$0")"; mkdir -p videos
N=$1; M=../../landing/music/$2.mp3; F=../../landing/polices
FONT=/usr/share/fonts/opentype/inter/Inter-Bold.otf
python3 - "$3" "$4" "$FONT" <<'PY'
import sys
from PIL import Image, ImageDraw, ImageFont
l=[x for x in sys.argv[1:3] if x]; f=ImageFont.truetype(sys.argv[3],58) if sys.argv[3].lower().endswith(('ttf','otf')) else ImageFont.load_default(58)
im=Image.new('RGBA',(1080,300),(0,0,0,0)); d=ImageDraw.Draw(im); y=40 if len(l)==2 else 95
for t in l:
    w=d.textlength(t,font=f); x=(1080-w)/2
    d.rounded_rectangle((x-26,y,x+w+26,y+92),18,fill=(255,255,255,255)); d.text((x,y+10),t,font=f,fill=(17,17,17,255)); y+=104
im.save('/tmp/legende.png')
PY
ffmpeg -loglevel error -y -i ecrans/$N.mp4 -i /tmp/legende.png -ss 20 -i $M -filter_complex "[0:v]split[a][b];[a]scale=1080:1920,gblur=sigma=40,eq=brightness=-0.22[bg];[b]scale=846:1504[s];[bg][s]overlay=117:318[v0];[v0][1:v]overlay=0:14[v];[2:a]atrim=0:13,afade=t=in:d=0.3,afade=t=out:st=11.5:d=1.5,loudnorm=I=-16[a]" -map "[v]" -map "[a]" -t 13 -c:v libx264 -pix_fmt yuv420p -crf 20 -r 30 -c:a aac -b:a 160k -movflags +faststart videos/$N.mp4 && echo videos/$N.mp4
