"""Photos de personnes de la vitrine (« Comment ça marche », « Fait pour ceux que vous aimez »), avec Gemini en rendu
photographique natif (règle 9 de CLAUDE.md). L'utilisateur a trouvé la série précédente « trop IA, pas naturelle, trop
cliché » : ici, des photos prises sur le vif (documentaire, lumière naturelle, cadrage imparfait, personne ne pose,
personne ne sourit à la caméra), jamais une scène de banque d'images.
Usage : python3 business/tools/people.py [nom ...] [--n 2]   -> candidats dans $PEOPLE_TMP, puis on choisit et on copie."""
import os, sys, subprocess, concurrent.futures as cf
from PIL import Image
HERE=os.path.dirname(os.path.abspath(__file__)); OUT=os.environ.get('PEOPLE_TMP','/tmp/people'); os.makedirs(OUT,exist_ok=True)
BASE=("Candid documentary photograph, taken on the fly with a 35 mm lens, natural daylight only, realistic skin texture and pores, "
      "slight film grain, shallow but believable depth of field, imperfect framing as in a real family photo. Nobody poses, nobody looks "
      "at the camera, nobody has a wide stock-photo smile: people are absorbed in what they do, expressions are small and real. "
      "Ordinary French interior or street, lived-in, a bit messy. No text, no logo, no watermark. Vertical 4:5. ")
SHOTS={
 'famille':"A grandfather in a cardigan on an old sofa, reading glasses on his nose, holding a phone at arm's length; his daughter leans over the backrest pointing at the screen, a child of about six climbs on the armrest to see. Late afternoon light from a window on the left. Shot from slightly behind the child.",
 'amis':"Two friends in their thirties in a small kitchen during a dinner, one leaning against the counter holding a phone horizontally, the other reading over her shoulder with a glass of wine, mid-sentence, half laughing. Dishes on the counter, warm tungsten mixed with the last daylight. Shot from the table, slightly out of focus foreground.",
 'reponses':"A couple in their early thirties at a kitchen table in the morning, bowls and a cafetière, she scrolls a phone while he reads the newspaper next to her, she nudges him with her elbow to show him something on the screen. Overcast window light, muted colours. Shot from across the table.",
 'choisir':"A couple aged 25 to 30, she with long dark hair tied up in a messy bun and a hoodie, he with a short beard and a t-shirt, cross-legged on a bed or a low sofa in a small bright flat with plants and posters, both looking at a laptop on his knees where several illustrated wedding-invitation designs are displayed as a row of thumbnails; she points at one. Daylight. Shot from the side, slightly above.",
 'parametrer':"Over-the-shoulder close-up of a young woman's hands (28, nail polish, a thin ring) holding a phone over a café table: on the screen, a vertical illustrated wedding invitation with a painted town hall and, below it, a row of small illustrated venue thumbnails (church, garden, beach); her thumb is swiping between them. A flat white and a croissant on the table, a tote bag. Natural daylight.",
 'mamie':"A modern grandmother of about 68: short white hair cut in a neat bob, round tortoiseshell glasses, a camel coat or a navy knit, gold hoop earrings, sitting at a café terrace or in a bright contemporary kitchen with her coffee, holding a phone in one hand and reading an invitation on it with a quiet, delighted half-smile, the other hand touching her necklace. Nothing old-fashioned: no floral armchair, no doilies, no slippers. Natural daylight.",
}
args=sys.argv[1:]; n=2
if '--n' in args: i=args.index('--n'); n=int(args[i+1]); del args[i:i+2]
names=args or list(SHOTS)
def one(j):
    name,k=j; png=f'{OUT}/{name}-{k}.png'
    r=subprocess.run([sys.executable,os.path.join(HERE,'gemini.py'),png,BASE+SHOTS[name],'--ratio','4:5','--size','1K'],capture_output=True,text=True)
    if r.returncode: return f'{name}-{k} : ÉCHEC {r.stderr.strip()[:120]}'
    im=Image.open(png).convert('RGB'); w,h=im.size; tw=round(h*4/5)
    if tw<w: im=im.crop(((w-tw)//2,0,(w-tw)//2+tw,h))
    im.resize((720,900),Image.LANCZOS).save(f'{OUT}/{name}-{k}.webp','WEBP',quality=84,method=6); return f'{name}-{k} : ok'
with cf.ThreadPoolExecutor(6) as ex:
    for res in ex.map(one,[(nm,k) for nm in names for k in range(n)]): print(res,flush=True)
