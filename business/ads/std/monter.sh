#!/bin/bash
# Monte un enregistrement d'écran (ecrans/<thème>-<jeu>.mp4) en vidéo TikTok : l'écran dans un téléphone aux coins arrondis
# (jamais un rectangle à angles droits : « c'est moche »), posé sur son propre fond flouté, la légende au-dessus, une musique.
#   bash monter.sh <thème>-<jeu> <fichier musique> <début musique en s> "Ligne 1" ["Ligne 2"]   ->  videos/<thème>-<jeu>.mp4
cd "$(dirname "$0")"; mkdir -p videos
N=$1; M=$2; SS=$3
python3 - "$4" "$5" <<'PY'
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
# Zone sûre de TikTok (20 novembre 2026, capture de l'utilisateur : « c'est trop grand, on n'arrive pas à lire le texte du
# haut ») : en haut, l'heure et la barre de recherche couvrent ~240 px ; en bas, le nom, la légende et le bandeau couvrent
# tout sous ~1400 px ; à droite, les boutons. La légende commence donc à 262 px et le téléphone tient entre 500 et 1520.
X,Y,W,H,R,B=253,500,574,1020,58,10          # l'écran, son rayon, l'épaisseur de la coque
l=[x for x in sys.argv[1:3] if x]; f=ImageFont.truetype('/usr/share/fonts/opentype/inter/Inter-Bold.otf',58)
sh=Image.new('RGBA',(1080,1920),(0,0,0,0)); ImageDraw.Draw(sh).rounded_rectangle((X-B,Y-B+26,X+W+B,Y+H+B+26),R+B,fill=(0,0,0,150)); sh=sh.filter(ImageFilter.GaussianBlur(34))
d=ImageDraw.Draw(sh); d.rounded_rectangle((X-B,Y-B,X+W+B,Y+H+B),R+B,fill=(22,20,18,255))
y=262 if len(l)==2 else 330
for t in l:
    w=d.textlength(t,font=f); x=(1080-w)/2
    d.rounded_rectangle((x-30,y,x+w+30,y+96),34,fill=(255,255,255,255)); d.text((x,y+12),t,font=f,fill=(17,17,17,255)); y+=108
sh.save('/tmp/coque.png')
m=Image.new('L',(W,H),0); ImageDraw.Draw(m).rounded_rectangle((0,0,W-1,H-1),R,fill=255); m.save('/tmp/masque.png')
PY
ffmpeg -loglevel error -y -i ecrans/$N.mp4 -loop 1 -t 13 -i /tmp/coque.png -loop 1 -t 13 -i /tmp/masque.png -ss $SS -i $M -filter_complex "[0:v]split[a][b];[a]scale=1080:1920,gblur=sigma=45,eq=brightness=-0.16:saturation=0.9[bg];[b]scale=574:1020,format=rgba[s];[2:v]format=gray[m];[s][m]alphamerge[sr];[bg][1:v]overlay=0:0[c];[c][sr]overlay=253:500[v];[3:a]atrim=0:13,asetpts=PTS-STARTPTS,afade=t=in:d=0.25,afade=t=out:st=11.3:d=1.7,loudnorm=I=-16[a]" -map "[v]" -map "[a]" -t 13 -c:v libx264 -pix_fmt yuv420p -crf 19 -r 30 -c:a aac -b:a 192k -movflags +faststart videos/$N.mp4 && echo videos/$N.mp4
