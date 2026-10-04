"""Calques : pour chaque scène (1..4) et chaque lieu (mairie, eglise, salle, jardin, plage) d'un thème, le SUJET détouré
(bâtiment, arche, arbres, sol) en WebP avec transparence : business/landing/img/calques/<thème>-<clé>.webp (1080 px de large).
Le fond est le <thème>-fond.webp existant (ciel ou papier) : le moteur pose le sujet entier en bas de l'écran, quel que soit
le format du téléphone (plus de rognage), et le fait bouger légèrement au défilement (profondeur).
Méthode : Gemini repeint le sujet de la scène tel quel sur un fond vert uni, puis incrustation (comme fx-sprites.py).
Usage : python3 business/tools/calques.py <thème> [...] [--only 1,2,eglise] [--force]"""
import os, sys, subprocess, concurrent.futures as cf
import numpy as np
from PIL import Image
from scipy import ndimage
HERE=os.path.dirname(os.path.abspath(__file__)); IMG=os.path.join(HERE,'..','landing','img'); OUT=os.path.join(IMG,'calques'); os.makedirs(OUT,exist_ok=True)
TMP=os.environ.get('LIEUX_TMP','/tmp/lieux'); os.makedirs(TMP,exist_ok=True)
KEYS=['1','2','3','4','mairie','eglise','salle','jardin','plage']
args=sys.argv[1:]; force='--force' in args; args=[a for a in args if a!='--force']
only=None
if '--only' in args: i=args.index('--only'); only=args[i+1].split(','); del args[i:i+2]
hint=''
fresh='--fresh' in args; args=[a for a in args if a!='--fresh']   # repeindre seulement les éléments cités (scène trop dense pour un détourage)
if '--hint' in args: i=args.index('--hint'); hint=' '+args[i+1]; del args[i:i+2]   # consigne de recomposition pour une scène trop dense

def key_green(png):
    im=np.asarray(Image.open(png).convert('RGB')).astype(np.float32)
    # couleur du fond mesurée sur le haut de l'image (la zone du texte, qui doit être vide) : les côtés et le bas sont
    # souvent occupés par le sujet. Si ce haut n'est pas vert, Gemini a repeint un ciel (crème, gris) : on refuse.
    bg=np.median(im[:int(im.shape[0]*.06)].reshape(-1,3),axis=0)
    if not (bg[1]>140 and bg[0]<130 and bg[2]<130): return None
    dist=np.sqrt(((im-bg)**2).sum(axis=2)); a=np.clip((dist-55)/100,0,1)
    col=np.where(a[...,None]>0,(im-(1-a[...,None])*bg)/np.maximum(a[...,None],1e-3),0); col=np.clip(col,0,255)
    edge=ndimage.binary_dilation(a<.5,iterations=4)&(a>0); g_max=np.maximum(col[...,0],col[...,2])
    col[...,1]=np.where(edge,np.minimum(col[...,1],g_max),col[...,1])
    # on ne garde que la grande composante basse (le sujet), pas les taches isolées
    mask=a>.15; lab,n=ndimage.label(ndimage.binary_dilation(mask,iterations=3))
    if n>1:
        sizes=ndimage.sum(mask,lab,range(1,n+1)); keep=np.isin(lab,[i+1 for i,s in enumerate(sizes) if s>0.01*sizes.max()])
        a=np.where(keep,a,0)
    rgba=np.dstack([col,a*255]).astype(np.uint8)
    rows=np.where(rgba[...,3].max(axis=1)>8)[0]
    if len(rows)==0: return None
    # le haut de l'image (zone du texte) doit être vide : un sujet qui monte jusqu'au bord n'est pas un détourage
    if (a[:int(a.shape[0]*.12)]>.2).mean()>.05: return None
    # le sujet doit occuper le bas de l'image (une marge verte de quelques lignes est tolérée et coupée) : sinon Gemini a collé
    # la scène entière, avec son ciel, comme une vignette au milieu du vert
    if rows.max()<a.shape[0]*.96 or (a[rows.max()-2:rows.max()+1]>.5).mean()<.3: return None
    # un bord supérieur rectiligne sur une large part de la largeur = la scène entière collée en vignette, pas un détourage
    first=np.argmax(rgba[...,3]>8,axis=0); cols=rgba[...,3].max(axis=0)>8
    if cols.any() and (np.abs(first[cols]-rows.min())<=4).mean()>.45: return None
    # deux copies du sujet empilées (collage) : la moitié haute du calque ressemble trop à la moitié basse
    cut=rgba[rows.min():rows.max()+1]; hh=cut.shape[0]//2
    if hh>300:
        A=cut[:hh,:,:3].astype(np.float32).mean(axis=2); Bm=cut[cut.shape[0]-hh:,:,:3].astype(np.float32).mean(axis=2)
        A=A-A.mean(); Bm=Bm-Bm.mean(); corr=(A*Bm).sum()/max(1e-6,np.sqrt((A*A).sum()*(Bm*Bm).sum()))
        if corr>.6: return None
    return Image.fromarray(cut)   # on coupe le vide du haut et la marge du bas

def one(k,key):
    out=os.path.join(OUT,f'{k}-{key}.webp')
    if os.path.exists(out) and not force: return f'{k}-{key} : déjà là'
    src=os.path.join(IMG,'hd',f'{k}-{key}.webp'); png=os.path.join(TMP,f'calque-{k}-{key}.png')
    p=("Take the reference illustration and output the SAME picture with its background removed: keep every painted object exactly as it is "
       "(buildings, arch, trees, flowers, ground, steps, lanterns, water and shore, people or hands if any) at the same position, size and style, "
       "and replace ONLY the empty background (sky, paper, plain wall, blank night) with a flat, uniform, pure green #00FF00. "
       "Objects must keep their exact colours and soft edges; no green tint on them, no outline, no shadow on the green, no text. Same 9:16 framing."+hint)
    if fresh: p=("Using the reference illustration only as a STYLE and colour reference (same medium, brushwork, palette, paper texture), paint a new vertical 9:16 "
                 "picture on a flat, uniform, pure green #00FF00 background containing ONLY the following elements, standing on the ground along the bottom edge, "
                 "nothing else and no sky, no background, no trees behind:"+hint+" Everything above the elements is pure green. No text, no frame, no shadow on the green.")
    p2=p+(" IMPORTANT: the result is a green-screen cut-out. The whole upper half of the picture must be pure green #00FF00 with nothing in it: "
          "remove the sky, the clouds, the paper texture, any far background and any branch or object touching the top edge; keep only the "
          "main subject in the lower part, standing on green. The subject must reach the bottom edge of the picture (ground, water or floor at the very bottom), and the sky "
          "seen between branches or above a roof is background too: it must be green.")
    for i in range(5):
        # premier tour : on réessaie d'abord l'incrustation du dernier rendu déjà là (réglages changés), sans rappeler Gemini
        r=subprocess.CompletedProcess([],0) if (i==0 and os.path.exists(png)) else subprocess.run([sys.executable,os.path.join(HERE,'gemini.py'),png,p if i==0 else p2,src,'--ratio','9:16','--size','1K'],capture_output=True,text=True)
        if r.returncode==0 and os.path.exists(png):
            im=key_green(png)
            if im is not None and im.height>80:
                w,h=im.size; im=im.resize((1080,round(h*1080/w)),Image.LANCZOS); im.save(out,'WEBP',quality=84,method=6,exact=False)
                cov=np.asarray(im)[...,3].mean()/255
                return f'{k}-{key} : ok (hauteur {im.height}, couverture {cov:.2f})'
    return f'{k}-{key} : ÉCHEC'
themes=args
jobs=[(k,key) for k in themes for key in KEYS if (not only or key in only) and os.path.exists(os.path.join(IMG,'hd',f'{k}-{key}.webp'))]
with cf.ThreadPoolExecutor(5) as ex:
    for res in ex.map(lambda j: one(*j), jobs): print(res,flush=True)
