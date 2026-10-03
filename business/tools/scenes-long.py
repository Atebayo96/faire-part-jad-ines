"""Les 7 univers qui n'existaient qu'en « grand tableau » (img/long/<thème>) reçoivent leurs décors de scènes : 4 scènes
(accueil, deux événements, réponse), les 5 lieux et le fond, dans le style de leur tableau (références : hero, ev1, ev3).
Ils passent ainsi dans le même configurateur scène par scène que les autres. Mêmes contrôles de lisibilité que les décors.
Usage : python3 business/tools/scenes-long.py [thème ...]"""
import os, sys, concurrent.futures as cf
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image
import lieux as L
hd=os.path.join(L.IMG,'hd'); th=os.path.join(L.IMG,'themes')
SC={
 'chinois':{'uni':"Chinese wedding universe: red lanterns, a pavilion with upturned roofs, plum blossoms, a lotus pond, double-happiness motifs, gold on red",
   1:"a pavilion with red lanterns on a lotus pond at dusk, plum blossoms, a moon bridge; no people",2:"a tea ceremony table: red cloth, porcelain tea set, two cups, red envelopes, plum branch; hands only",
   3:"the banquet hall entrance: red lanterns, round tables glimpsed through doors, the couple seen from behind in red",4:"a moon bridge over the pond at night, paper lanterns floating on the water; no people"},
 'japonais':{'uni':"Japanese wedding universe in the softness of a woodblock print: cherry blossoms, a vermilion torii, Mount Fuji, a red paper umbrella",
   1:"a vermilion torii among cherry trees, Mount Fuji far away, petals in the air; no people",2:"a shrine courtyard with a red umbrella held over the couple seen from behind, sakura",
   3:"a ryokan garden at dusk, stone lantern, pond with koi, lit shoji screens; no people",4:"a single cherry branch over a still pond, petals drifting; no people"},
 'gzhel':{'uni':"Gzhel universe: everything painted in cobalt blue on white porcelain, onion-domed church, troika, Gzhel roses, birches",
   1:"an onion-domed church among birches, painted in cobalt blue on white porcelain; no people",2:"a bread-and-salt welcome: embroidered towel, a round loaf, a salt cellar, cobalt roses; hands only",
   3:"a troika sleigh in the snow with bells, cobalt on white; no people",4:"two cobalt Gzhel roses tied with a ribbon on white porcelain"},
 'asianchic':{'uni':"modern Asian chic universe: black lacquer, gold leaf, jade, white orchids, a lacquered pavilion by still water",
   1:"a black lacquer pavilion with gold trim by a still pool at night, white orchids; no people",2:"a ceremony arch of white orchids and gold leaf on a black lacquer floor by water; no people",
   3:"a long black-tie dinner table with gold candlesticks and orchids under a pavilion at night; no people",4:"a single white orchid and two gold rings on black lacquer"},
 'y2k':{'uni':"Y2K wedding universe: bubblegum pink, chrome, butterflies, pastel sky, a pink convertible, palm trees, 2000s pop",
   1:"a pink convertible on a pastel boulevard with palm trees, chrome butterflies in the sky; no people",2:"a town hall facade in pink and chrome under a pastel sky, butterflies; no people",
   3:"a rooftop party at sunset: disco ball, pink neon, string lights, palm silhouettes; no people",4:"chrome butterflies and two rings on a glossy pink surface"},
 'oldmoney':{'uni':"old money universe: an English manor, a vintage car, clipped boxwood, muted greens and creams, discreet elegance",
   1:"an English manor behind clipped boxwood and a gravel drive, a vintage car; no people",2:"a stone chapel in a park with old oaks, soft overcast light; no people",
   3:"a dinner marquee on the lawn at dusk, warm light inside, hedges around; no people",4:"a pair of rings on a linen napkin with a sprig of boxwood"},
 'afro':{'uni':"African wedding universe: kente and wax patterns, a baobab at twilight, calabashes and cowries, warm oranges and deep indigo",
   1:"a great baobab against a twilight sky, kente-patterned cloth draped in the foreground; no people",2:"a ceremony under a draped kente canopy, calabashes and cowrie garlands; no people",
   3:"a night celebration: lanterns in the baobab, drums, wax-print cloths on long tables; no people",4:"two calabashes and a cowrie necklace on kente cloth"}}
def save(png,k,name):
    im=Image.open(png).convert('RGB'); w,h=im.size; tw=round(h*540/954)
    if tw<w: im=im.crop(((w-tw)//2,0,(w-tw)//2+tw,h))
    im.resize((1080,1909),Image.LANCZOS).save(f'{hd}/{k}-{name}.webp','WEBP',quality=80,method=6)
    im.resize((540,954),Image.LANCZOS).save(f'{th if isinstance(name,int) else os.path.join(L.IMG,"lieux")}/{k}-{name}.webp','WEBP',quality=82,method=6)
def scene(k,n):
    t=L.T[k]; refs=[os.path.join(L.IMG,'long',k,f) for f in ('hero.webp','ev1.webp','ev3.webp')]
    for i in range(4):
        out=f'{L.TMP}/{k}-{n}-{i}.png'
        p=(f"The reference images are one illustrated wedding invitation universe ({SC[k]['uni']}). Paint a NEW scene of the same series: {SC[k][n]}. "
           "Same medium, palette, light and mood as the references. Vertical 9:16. "+L.zone_rule(t)+" The subject sits in the lower 45%. No text, no faces, no watermark, no frame.")
        if not L.gemini(out,p,refs): continue
        good,r=L.ok(out,t)
        if good: save(out,k,n); return f'{k}-{n} : ok {r}'
    return f'{k}-{n} : À REVOIR {r}'
themes=sys.argv[1:] or list(SC)
with cf.ThreadPoolExecutor(6) as ex:
    for res in ex.map(lambda j: scene(*j), [(k,n) for k in themes for n in (1,2,3,4)]): print(res,flush=True)
# puis la bibliothèque de lieux et le fond, avec les nouvelles scènes comme références (tools/lieux.py)
with cf.ThreadPoolExecutor(6) as ex:
    for res in ex.map(lambda j: L.make(*j,True), [(k,l) for k in themes for l in L.LIEUX]): print(res,flush=True)
