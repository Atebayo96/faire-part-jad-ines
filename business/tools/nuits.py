"""Les 4 scènes du thème « Mille et une nuits » (img/hd/nuits-1..4), refaites dans l'univers de Nour & Ilyes (img/long/nuits :
riad de nuit, lune, palmiers, bougainvilliers) que l'utilisateur préfère. Mêmes règles que les décors : zone de texte sombre et calme."""
import os, sys; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image
import lieux as L
hd=os.path.join(L.IMG,'hd'); th=os.path.join(L.IMG,'themes'); t=L.T['nuits']
refs=[os.path.join(L.IMG,'long','nuits',f) for f in ('hero.webp','ev1.webp','ev3.webp')]
SC={1:"the facade of a Moroccan riad at night under a crescent moon, carved cedar balcony, tall palms, bougainvillea, lanterns glowing on the steps; no people",
    2:"a henna evening: a low brass tray with henna cones, tea glasses and roses on zellige, lanterns around, a woman's hands with fresh henna (hands only, no face)",
    3:"the riad courtyard at night: a zellige fountain, orange trees, arches lit from inside, lanterns on the ground, a bride and groom seen from behind walking towards the arches",
    4:"a desert night: a caidal tent lit from inside, lanterns on the sand, dunes, sky lanterns rising; no people"}
for n,desc in SC.items():
    for k in range(3):
        out=f'{L.TMP}/nuits-{n}-{k}.png'
        p=("The reference images are the same illustrated wedding invitation universe (Moroccan riad at night, warm lanterns, deep blue sky, painterly). "
           f"Paint a NEW scene of this series: {desc}. Same medium, palette, light and mood as the references. Vertical 9:16. "+L.zone_rule(t)+
           " The subject sits in the lower 45%. No text, no watermark, no frame.")
        if not L.gemini(out,p,refs): continue
        good,r=L.ok(out,t); print(n,k,good,r,flush=True)
        if good:
            im=Image.open(out).convert('RGB'); w,h=im.size; tw=round(h*540/954)
            if tw<w: im=im.crop(((w-tw)//2,0,(w-tw)//2+tw,h))
            im.resize((1080,1909),Image.LANCZOS).save(f'{hd}/nuits-{n}.webp','WEBP',quality=80,method=6)
            im.resize((540,954),Image.LANCZOS).save(f'{th}/nuits-{n}.webp','WEBP',quality=82,method=6); break
