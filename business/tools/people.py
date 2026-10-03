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
 'choisir':"A couple on a worn sofa in the evening, a laptop on their knees, she holds the phone, both looking at the laptop screen, the man scratching his neck in thought. A lamp on, the room half dark. Shot from the side.",
 'parametrer':"Close-up of two hands at a wooden table, one holding a phone, the other writing dates on a paper notebook, a coffee cup, a ring on one finger. Daylight from a window, shadows of the window frame on the table. Top-down, slightly tilted.",
 'mamie':"An elderly woman in an armchair by a window, cardigan and slippers, holding a phone with both hands close to her face, mouth slightly open with surprise, a hand half raised to her cheek. Plants on the sill, framed photos behind. Shot from the side at her eye level.",
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
