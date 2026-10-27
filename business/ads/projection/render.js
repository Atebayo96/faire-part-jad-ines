// Pubs « projection » : 15 s, sans voix, une musique calme, le vrai faire-part montré en plein écran. Une vidéo par type :
//   carte  : la Carte (29 €), les cinq feuilles l'une après l'autre, lent zoom et fondu enchaîné ;
//   page   : la Page unique (dès 59 €), l'enveloppe d'Emma & Louis s'ouvre, la feuille, le bouton Répondre ;
//   anime  : le faire-part animé (dès 99 €), rideau de Giulia & Hugo, roue de la date, une scène par écran.
// Le vrai moteur est filmé (page /d/<slug>/, horloge pilotée comme feuille/ecran.js) ; une couche #ad pose une étiquette
// au début et la carte de fin (logo, prix). Son : une musique seule (feuille/audio ou landing/music), fondue à la fin.
//   node business/ads/projection/render.js caps                      (feuilles de la Carte -> caps/<slug>.png)
//   node business/ads/projection/render.js preview <carte|page|anime> [t1,t2,…]
//   node business/ads/projection/render.js full <carte|page|anime>
// Site servi en local sur 8765 (python3 -m http.server 8765 -d business/site).
const {chromium}=require('/opt/node-tools/node_modules/playwright');
const {spawn}=require('child_process'); const fs=require('fs'), path=require('path');
const W=405, H=720, DPR=1080/405, D=15, FPS=30;
const ROOT=path.join(__dirname,'../..'), MUS=n=>n.startsWith('m-')?`${ROOT}/ads/feuille/audio/${n}.mp3`:`${ROOT}/landing/music/${n}.mp3`;

// les cinq feuilles (une par univers), dans l'ordre de /modeles/
const SHEETS=['page-emma-louis','carte-camille-antoine','page-victoire-charles','page-nour-ilyes','page-leila-mehdi'];

// lb : [position CSS de l'étiquette, instant où elle s'efface] ; elle ne couvre jamais le sceau ni le texte de la feuille
const SC={
 carte:{label:'La Carte · 29 €', lb:['bottom:72px',3.4], music:'m-univers', each:2.35, end:{a:12.6,price:'La Carte · 29 €'}},
 page:{slug:'page-emma-louis', label:'La Page unique · dès 59 €', lb:['top:54px',2.7], music:'m-details',
  taps:[[1.5,{x:202,y:420}],[9.8,'[data-rsvp]']], end:{a:12.6,price:'Page unique · dès 59 €'}},
 anime:{slug:'giulia-hugo', label:'Le faire-part animé · dès 99 €', lb:['top:54px',2.5], music:'nocturne',
  taps:[[1.0,{x:202,y:420}],[3.0,'.rvl-hub']], keys:[[6.4,'ArrowDown'],[9.5,'ArrowDown']],
  end:{a:12.6,price:'Faire-part animé · dès 99 €'}}
};

const OVERLAY=`
#ad{position:fixed;inset:0;z-index:2147483647;pointer-events:none;font-family:"Inter Tight",Inter,sans-serif}
#ad .lb{position:absolute;left:0;right:0;text-align:center;opacity:0}
#ad .lb span{display:inline-block;background:#fff;color:#16140f;font:500 17px/1 "Cormorant Garamond",serif;padding:11px 18px;border-radius:30px;box-shadow:0 2px 12px rgba(0,0,0,.18)}
#ad .end{position:absolute;inset:0;background:#f6f2ea;opacity:0;color:#16140f}
#ad .end .seal{position:absolute;left:50%;top:205px;width:92px;height:92px;margin-left:-46px;background:url(/img/seals/or.webp) center/contain no-repeat;display:flex;align-items:center;justify-content:center;
  font:400 44px/1 "Great Vibes",cursive;color:#6e4f17;text-shadow:-1px -1px 0 rgba(255,236,170,.55),1px 1px 1px rgba(60,35,5,.7)}
#ad .end .logo{position:absolute;left:0;right:0;top:318px;text-align:center;white-space:nowrap}
#ad .end .logo span{font:500 15px/1 "Inter Tight",Inter;letter-spacing:.32em;text-transform:uppercase}
#ad .end .logo b{font:400 70px/1 "Great Vibes",cursive;font-weight:400;margin-left:5px;position:relative;top:6px}
#ad .end .pr{position:absolute;left:50%;top:430px;transform:translateX(-50%);white-space:nowrap;background:#16140f;color:#fbf7ef;border-radius:30px;padding:13px 24px;font:500 19px/1 "Cormorant Garamond",serif}
#ad .end .url{position:absolute;left:0;right:0;top:500px;text-align:center;font:600 12px/1 Inter;letter-spacing:.2em;color:#6b665d}
.demo-tag,.snd{display:none!important}`;

// la page de la Carte : les cinq feuilles capturées, en fondu enchaîné, chacune avec un lent zoom
const CARTE_HTML=(each)=>`<!doctype html><html lang="fr"><head><meta charset="utf-8"><link rel="stylesheet" href="/polices/polices.css">
<style>html,body{margin:0;width:${W}px;height:${H}px;overflow:hidden;background:#16140f}.s{position:absolute;inset:0;opacity:0;background:#000}.s img{display:block;width:100%;height:100%;object-fit:cover;transform-origin:50% 50%}</style></head><body>
${SHEETS.map(s=>`<div class="s"><img src="/_caps/${s}.png"></div>`).join('')}
<script>
const E=${each}, X=.5, S=[...document.querySelectorAll('.s')];
const lin=(t,a,b)=>Math.min(1,Math.max(0,(t-a)/(b-a))), eio=x=>x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;
window.render=t=>{ S.forEach((d,i)=>{ const a=i*E, z=a+E+X, last=i===S.length-1; const o=Math.min(i===0?1:eio(lin(t,a,a+X)),last?1:1-eio(lin(t,z-X,z))); d.style.opacity=o; d.style.zIndex=i;
  const k=lin(t,a-X,z), ox=50+(i%2?1:-1)*k*1.4, oy=44+k*8; const im=d.firstElementChild; im.style.transformOrigin=ox+'% '+oy+'%'; im.style.transform='scale('+(1+.055*k)+')'; }); };
window.ready=()=>Promise.all([document.fonts.ready,...S.map(d=>d.firstElementChild.complete?1:new Promise(r=>{d.firstElementChild.onload=r;}))]);
</script></body></html>`;

// une fiche de démo relue comme un vrai faire-part : sans mention « démo » ; options forcées (ouverture, bouton Répondre)
const pageOf=async(slug,patch)=>{ const r=await fetch(`http://localhost:8765/d/${slug}/`); const html=await r.text();
  return html.replace(/window\.INVITE=(\{.*?\});<\/script>/s,(_,j)=>`window.INVITE=${JSON.stringify(Object.assign(JSON.parse(j),{demo:false},patch)).replace(/</g,'\\u003c')};</script>`); };

(async()=>{
 const [mode,V]=[process.argv[2],process.argv[3]], S=SC[V];
 const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:DPR});
 if(mode==='caps'){ // les cinq feuilles de la Carte, telles que livrées : sans ouverture ni bouton Répondre
  fs.mkdirSync(__dirname+'/caps',{recursive:true});
  for(const s of SHEETS){ const p=await ctx.newPage(); const html=await pageOf(s,{opening:'none',reply:false});
   await p.route(`http://localhost:8765/d/${s}/`,r=>r.fulfill({contentType:'text/html; charset=utf-8',body:html}));
   await p.goto(`http://localhost:8765/d/${s}/`); await p.waitForTimeout(2500); await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(1500);
   await p.addStyleTag({content:'.demo-tag,.snd{display:none!important}'});
   await p.screenshot({path:`${__dirname}/caps/${s}.png`}); await p.close(); console.log('cap',s); }
  await b.close(); return; }
 await ctx.clock.install({time:new Date('2026-10-27T12:00:00')});
 const p=await ctx.newPage(); p.on('pageerror',e=>console.error('page:',e.message));
 if(V==='carte'){
  await p.route('http://localhost:8765/_carte/',r=>r.fulfill({contentType:'text/html; charset=utf-8',body:CARTE_HTML(S.each)}));
  await p.route('http://localhost:8765/_caps/**',r=>r.fulfill({path:__dirname+'/caps/'+path.basename(new URL(r.request().url()).pathname)}));
  await p.goto('http://localhost:8765/_carte/'); await p.evaluate(()=>window.ready()); await p.waitForTimeout(300);
 } else {
  const html=await pageOf(S.slug,{});
  await p.route(`http://localhost:8765/d/${S.slug}/`,r=>r.fulfill({contentType:'text/html; charset=utf-8',body:html}));
  await p.goto(`http://localhost:8765/d/${S.slug}/`); await p.waitForTimeout(3000);
  await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(1200);
 }
 await p.addStyleTag({content:OVERLAY});
 await p.evaluate(S=>{
  const ad=document.createElement('div'); ad.id='ad'; document.documentElement.appendChild(ad);
  const lin=(t,a,b)=>Math.min(1,Math.max(0,(t-a)/(b-a))), eo=x=>1-Math.pow(1-x,3);
  const lb=document.createElement('div'); lb.className='lb'; lb.style.cssText=S.lb[0]; lb.innerHTML=`<span>${S.label}</span>`; ad.appendChild(lb);
  const end=document.createElement('div'); end.className='end';
  end.innerHTML=`<div class="seal">O</div><div class="logo"><span>Save the</span><b>Oui</b></div><div class="pr">${S.end.price}</div><div class="url">SAVETHEOUI.FR</div>`; ad.appendChild(end);
  window.__ad=t=>{
   const k=eo(lin(t,.4,.8)); lb.style.opacity=Math.min(k,1-lin(t,S.lb[1]-.4,S.lb[1])); lb.style.transform=`translateY(${(1-k)*-8}px)`;
   const e=lin(t,S.end.a,S.end.a+.45); end.style.opacity=e;
   const sk=lin(t,S.end.a+.15,S.end.a+.6); end.querySelector('.seal').style.transform=`scale(${.6+.4*eo(sk)})`;
  };
 },S);
 await p.clock.pauseAt(new Date('2026-10-27T12:05:00'));
 const step=async ms=>{ await p.clock.runFor(ms); await p.evaluate(()=>{ const n=performance.now(); for(const a of document.getAnimations()){ if(a._b===undefined){ a._b=n; a.pause(); } a.currentTime=n-a._b; } }); };
 await step(500);
 const where=async tg=>{ if(typeof tg!=='string') return tg; return p.evaluate(sel=>{ const e=[...document.querySelectorAll(sel)].find(e=>{ const r=e.getBoundingClientRect(); return r.width&&r.height&&r.top>=0&&r.bottom<=innerHeight; }); if(!e) return null; const r=e.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2}; },tg); };
 const done=new Set(), N=D*FPS;
 let ff=null, dead=false;
 if(mode==='full'){
  ff=spawn('ffmpeg',['-y','-f','image2pipe','-framerate',''+FPS,'-i','-','-i',MUS(S.music),
    // même niveau sonore d'une vidéo à l'autre (les morceaux n'ont pas le même volume), fondu d'entrée et de sortie
    '-filter_complex',`[1:a]atrim=0:${D},asetpts=PTS-STARTPTS,loudnorm=I=-18:LRA=11:TP=-1.5,afade=t=in:d=0.6,afade=t=out:st=${(D-2).toFixed(2)}:d=2[a]`,
    '-map','0:v','-map','[a]','-t',''+D,'-c:v','libx264','-pix_fmt','yuv420p','-crf','18','-preset','medium','-r',''+FPS,
    '-c:a','aac','-b:a','192k','-movflags','+faststart',`${__dirname}/save-the-oui-projection-${V}-9x16.mp4`],{stdio:['pipe','ignore','inherit']});
  ff.on('close',c=>{ if(c){ dead=true; console.error('ffmpeg a échoué ('+c+')'); } }); ff.stdin.on('error',()=>{ dead=true; });
 }
 const shots=mode==='preview'?(process.argv[4]||'0,1,2,3,4,5,6,7,8,9,10,11,12,13,14').split(',').map(Number):null;
 for(let i=0;i<N&&!dead;i++){
  const t=i/FPS;
  for(const [k,[at,tg]] of (S.taps||[]).entries()) if(t>=at&&!done.has('t'+k)){ done.add('t'+k); const pt=await where(tg); if(pt) await p.mouse.click(pt.x,pt.y); else console.error('pas de cible',tg,'à',t); }
  for(const [k,[at,key]] of (S.keys||[]).entries()) if(t>=at&&!done.has('k'+k)){ done.add('k'+k); await p.keyboard.press(key); }
  if(V==='carte') await p.evaluate(t=>render(t),t);
  await p.evaluate(t=>window.__ad(t),t);
  if(shots){ if(shots.some(s=>Math.abs(s-t)<1/(2*FPS))) await p.screenshot({path:`${__dirname}/p-${V}-${t.toFixed(1)}.jpg`,type:'jpeg',quality:70}); }
  else { const buf=await p.screenshot({type:'jpeg',quality:92}); if(!ff.stdin.write(buf)) await new Promise(r=>{ ff.stdin.once('drain',r); ff.once('close',r); }); }
  await step(1000/FPS);
 }
 if(ff&&!dead){ ff.stdin.end(); await new Promise(r=>ff.on('close',r)); }
 await b.close();
})();
