"""Porte à deux battants et rideau pour l'ouverture, dans le style d'un thème (business/landing/img/open/<thème>-portes.webp
et -rideau.webp, 900 x 1591, comme ceux des 12 premiers thèmes). Référence : le tableau du thème (img/long/<thème>/hero.webp)
ou sa scène 1. Usage : python3 business/tools/portes.py <thème> [...]"""
import os, sys, subprocess, concurrent.futures as cf
from PIL import Image
HERE=os.path.dirname(os.path.abspath(__file__)); IMG=os.path.join(HERE,'..','landing','img'); TMP=os.environ.get('LIEUX_TMP','/tmp/lieux'); os.makedirs(TMP,exist_ok=True)
D={'chinois':"a pair of red lacquered Chinese doors with gold studs and round brass knockers, double-happiness motif, plum-blossom carvings",
   'japonais':"a pair of pale wooden shoji sliding doors with a cherry-blossom and crane motif painted in the manner of a woodblock print",
   'gzhel':"a pair of white porcelain-like doors painted with cobalt blue Gzhel roses and scrolls, blue handles",
   'asianchic':"a pair of black lacquer doors with gold-leaf geometric inlays and jade handles, white orchid motif",
   'y2k':"a pair of glossy bubblegum-pink doors with chrome trim, butterfly handles, holographic sheen",
   'oldmoney':"a pair of dark green painted panelled doors with brass lion knockers, boxwood topiary carved in relief",
   'afro':"a pair of carved wooden doors with kente and wax patterns painted in warm orange and indigo, cowrie-shell handles",
   'maghreb':"a pair of studded cobalt blue medina doors with black iron nails and a brass hand-of-Fatima knocker, in a whitewashed horseshoe arch",
   'alhambra':"a pair of tall Andalusian cedar doors with carved geometric star patterns, set in an ivory stucco horseshoe arch, bronze handles",
   'desert':"a pair of caidal tent flaps in heavy ochre and indigo embroidered cloth with geometric Berber motifs and gold tassels, closed in the middle",
   'emeraude':"a pair of monumental palace doors in deep emerald lacquer with chiselled gold geometric star inlays and heavy gold ring knockers",
   'doucefrance':"a pair of weathered pale blue wooden doors of a Provençal bastide with wrought-iron hinges, set in honey-coloured stone, lavender and climbing white roses around"}
R={'chinois':"a heavy red silk curtain with gold embroidery and tassels, double-happiness motif at the top",
   'japonais':"a pale pink noren-like curtain of soft linen with a cherry-branch print, in the manner of a woodblock print",
   'gzhel':"a white curtain painted with cobalt blue Gzhel roses, blue tassels",
   'asianchic':"a black silk curtain with fine gold-leaf threads, white orchids embroidered along the edges",
   'y2k':"a shiny bubblegum-pink satin curtain with chrome rings and butterfly embroidery",
   'oldmoney':"a deep green velvet curtain with brass rings and an understated gold braid",
   'afro':"a kente-patterned curtain in orange, gold and indigo with cowrie fringes",
   'maghreb':"a white cotton curtain with cobalt blue Berber geometric embroidery and blue tassels",
   'alhambra':"an ivory silk curtain with fine gold arabesque embroidery and a border of small orange blossoms",
   'desert':"a heavy indigo curtain of woven Berber cloth with ochre geometric motifs and long gold tassels",
   'emeraude':"a deep emerald velvet curtain with gold embroidered arabesques and heavy gold tassels",
   'doucefrance':"a natural linen curtain printed with small lavender sprigs and olive branches, a soft lavender-coloured braid"}
def one(k,kind):
    out=os.path.join(IMG,'open',f'{k}-{kind}.webp'); png=os.path.join(TMP,f'{k}-{kind}.png')
    ref=next(p for p in [os.path.join(IMG,'long',k,'hero.webp'),os.path.join(IMG,'chaine',k,'st-1.webp'),os.path.join(IMG,'hd',f'{k}-1.webp')] if os.path.exists(p))
    desc=D[k] if kind=='portes' else R[k]
    p=(f"Same painterly style and palette as the reference image. Frontal, flat, full-frame view of {desc}, filling the whole image edge to edge, "
       +("the two leaves meeting exactly on the vertical centre line, " if kind=='portes' else "hanging straight with vertical folds, top valance and bottom fringe, ")
       +"symmetrical, evenly lit, no floor, no walls around, no text, no people. Vertical 9:16.")
    for _ in range(3):
        r=subprocess.run([sys.executable,os.path.join(HERE,'gemini.py'),png,p,ref,'--ratio','9:16','--size','1K'],capture_output=True,text=True)
        if r.returncode==0: break
    else: return f'{k}-{kind} : ÉCHEC'
    im=Image.open(png).convert('RGB'); w,h=im.size; tw=round(h*900/1591)
    if tw<w: im=im.crop(((w-tw)//2,0,(w-tw)//2+tw,h))
    im.resize((900,1591),Image.LANCZOS).save(out,'WEBP',quality=82,method=6); return f'{k}-{kind} : ok'
themes=sys.argv[1:] or list(D)
with cf.ThreadPoolExecutor(4) as ex:
    for res in ex.map(lambda j: one(*j), [(k,kind) for k in themes for kind in ('portes','rideau')]): print(res,flush=True)
