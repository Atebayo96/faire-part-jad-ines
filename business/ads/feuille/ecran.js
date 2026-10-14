// Pubs « découverte » : le vrai faire-part filmé comme un enregistrement d'écran de téléphone (9:16, 1080 × 1920).
// Playwright pilote la vraie page /d/<slug>/ (horloge et animations pas à pas, comme ouverture/real.js), touche pour de vrai
// (ouverture, roue, Répondre, formulaire), et une couche posée par-dessus (#ad) ajoute les légendes façon TikTok, le cercle
// du doigt, la conversation de départ et la carte de fin. Son : musique + voix off ElevenLabs (audio/), mixées comme render.js.
//   node business/ads/feuille/ecran.js preview <recu|imagine|serie> [t1,t2,…]
//   node business/ads/feuille/ecran.js full <recu|imagine|serie>
// Site servi en local sur 8765 (python3 -m http.server 8765 -d business/site).
const {chromium}=require('/opt/node-tools/node_modules/playwright');
const {spawn}=require('child_process'); const path=require('path');
const W=405, H=720, DPR=1080/405;

// ---- les trois films. tap: [t, cible] (sélecteur ou {x,y}, real:false = cercle seul) ; caps: [début, fin, texte, y]
const SC={
 recu:{slug:'page-leila-mehdi', d:17.5, music:'m-recu',
  vo:[['recu',.3,0,1.5],['recu',4.3,1.56,3.55],['recu',6.9,3.6,7.05],['recu',10.5,7.1,9.2],['recu',14.4,9.25,10.35]],
  chat:{who:'Leïla',msg:'C’est officiel !!',og:'/d/page-leila-mehdi/og.jpg',title:'Leïla & Mehdi vous invitent',until:3.0},
  caps:[[-1,3.0,'Regardez ce que j’ai reçu',420],[4.2,6.7,'attendez… des portes ?!',300],[6.9,10.3,'l’heure, l’adresse, l’itinéraire…',478],
        [10.5,14.2,'et je réponds direct',478],[14.3,15.4,'c’est trop beau',430]],
  taps:[[2.7,{x:150,y:395},false],[3.9,{x:202,y:420}],[8.4,'.ct-lk a',false],[9.4,'.ct-lk button',false],[10.4,'[data-rsvp]'],
        [12.5,'label:has(input[name="ev-e0"]):first-of-type'],[12.95,'label:has(input[name="ev-e1"]):first-of-type'],[14.0,'button.go']],
  sel:[[13.3,'select','Poisson']], scroll:[[13.55,'button.go']],
  type:[[11.1,12.3,'input[name="name"]','Sarah Benali']],
  end:{a:15.4,price:'Page unique · dès 59 €'}},
 imagine:{slug:'page-victoire-charles', d:15.5, music:'m-imagine', vo:[],
  caps:[[-1,2.6,'Imagine tu reçois ça pour un mariage',96],[3.6,5.4,'tout tient sur une seule page',96],[5.6,8.2,'les prénoms en relief',470],
        [8.6,9.9,'l’itinéraire en un clic',96],[9.9,11.2,'direct dans ton agenda',96],[11.3,12.6,'et ça part par WhatsApp',96]],
  taps:[[1.9,'.op-seal'],[8.9,'.ct-lk a',false],[10.1,'.ct-lk button',false]],
  zoom:[5.5,8.3,'.ct-nm',1.9],
  end:{a:12.7,price:'Page unique · dès 59 €'}},
 serie:{slug:'giulia-hugo', d:18, music:'m-serie', vo:[['serie',.2,0,16.6]],
  caps:[[-1,3.3,'POV : ton faire-part de mariage est une mini-série',96],[3.5,4.9,'le rideau se lève…',96],[5.0,8.2,'on tourne la roue pour la date',96],
        [8.3,9.5,'épisode 1 : la cérémonie',96],[9.6,10.4,'épisode 2 : le dîner',96],[10.5,11.2,'épisode 3 : le programme',96],[12.6,15.0,'et ils répondent en un clic',96]],
  taps:[[3.3,{x:202,y:420}],[5.0,'.rvl-hub'],[13.6,'[data-rsvp], .pg.on .b, .rsvp-b, button.b']],
  keys:[[8.3,'ArrowDown'],[9.6,'ArrowDown'],[10.5,'ArrowDown'],[11.2,'ArrowDown'],[11.9,'ArrowDown'],[12.6,'ArrowDown']],
  end:{a:15.1,price:'Faire-part animé · dès 99 €'}}
};

const OVERLAY=`
#ad{position:fixed;inset:0;z-index:2147483647;pointer-events:none;font-family:"Inter Tight",Inter,sans-serif}
#ad .cap{position:absolute;left:24px;right:24px;text-align:center;opacity:0}
#ad .cap span{display:inline;background:#fff;color:#111;font:700 21px/1.55 "Inter Tight",Inter,sans-serif;padding:4px 11px;border-radius:7px;
  -webkit-box-decoration-break:clone;box-decoration-break:clone;box-shadow:0 2px 10px rgba(0,0,0,.18)}
#ad .tap{position:absolute;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;background:rgba(255,255,255,.35);border:3px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.15),0 4px 14px rgba(0,0,0,.25);opacity:0}
#ad .chat{position:absolute;inset:0;background:#ece5d8;font-family:Inter,sans-serif}
#ad .chat .hd{height:92px;background:#fbf8f2;display:flex;align-items:flex-end;gap:11px;padding:0 16px 13px;border-bottom:1px solid #e2dacb}
#ad .chat .av{width:38px;height:38px;border-radius:50%;background:#b07a4f;color:#fff;display:flex;align-items:center;justify-content:center;font:600 17px/1 Inter}
#ad .chat .hd b{display:block;font:600 16px/1.2 Inter;color:#1d1a16}#ad .chat .hd small{font:500 12px/1.3 Inter;color:#7a7365}
#ad .bub{position:absolute;left:12px;max-width:82%;background:#fff;border-radius:16px;border-top-left-radius:4px;padding:9px 11px;font:500 15px/1.35 Inter;color:#1d1a16;box-shadow:0 1px 1px rgba(0,0,0,.08);opacity:0}
#ad .bub .tm{display:block;text-align:right;font:500 11px/1 Inter;color:#8a8475;margin-top:4px}
#ad .lnk{width:250px;border-radius:10px;overflow:hidden;background:#f4f1ea;margin:-3px -4px 7px}
#ad .lnk img{display:block;width:100%;height:131px;object-fit:cover}
#ad .lnk div{padding:8px 10px}#ad .lnk b{display:block;font:600 14px/1.25 Inter}#ad .lnk small{display:block;margin-top:3px;font:500 12px/1 Inter;color:#7a7365}
#ad .end{position:absolute;inset:0;background:#f6f2ea;opacity:0;color:#16140f}
#ad .end .seal{position:absolute;left:50%;top:205px;width:92px;height:92px;margin-left:-46px;background:url(/img/seals/or.webp) center/contain no-repeat;display:flex;align-items:center;justify-content:center;
  font:400 44px/1 "Great Vibes",cursive;color:#6e4f17;text-shadow:-1px -1px 0 rgba(255,236,170,.55),1px 1px 1px rgba(60,35,5,.7)}
#ad .end .logo{position:absolute;left:0;right:0;top:318px;text-align:center;white-space:nowrap}
#ad .end .logo span{font:500 15px/1 "Inter Tight",Inter;letter-spacing:.32em;text-transform:uppercase}
#ad .end .logo b{font:400 70px/1 "Great Vibes",cursive;font-weight:400;margin-left:5px;position:relative;top:6px}
#ad .end .pr{position:absolute;left:50%;top:430px;transform:translateX(-50%);white-space:nowrap;background:#16140f;color:#fbf7ef;border-radius:30px;padding:13px 24px;font:500 19px/1 "Cormorant Garamond",serif}
#ad .end .url{position:absolute;left:0;right:0;top:500px;text-align:center;font:600 12px/1 Inter;letter-spacing:.2em;color:#6b665d}
.demo-tag,.snd{display:none!important}`;

(async()=>{
 const [mode,V]=[process.argv[2],process.argv[3]], S=SC[V];
 const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:DPR});
 await ctx.clock.install({time:new Date('2026-10-14T12:00:00')});
 const p=await ctx.newPage(); p.on('pageerror',e=>console.error('page:',e.message));
 await p.goto(`http://localhost:8765/d/${S.slug}/`); await p.waitForTimeout(3000);
 await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(1200);
 await p.addStyleTag({content:OVERLAY});
 // la couche de la pub : légendes, doigt, conversation, carte de fin
 await p.evaluate(S=>{
  const ad=document.createElement('div'); ad.id='ad'; document.documentElement.appendChild(ad);
  const lin=(t,a,b)=>Math.min(1,Math.max(0,(t-a)/(b-a))), eo=x=>1-Math.pow(1-x,3);
  let chat=null, b1=null, b2=null;
  if(S.chat){ chat=document.createElement('div'); chat.className='chat';
    chat.innerHTML=`<div class="hd"><div class="av">${S.chat.who[0]}</div><div><b>${S.chat.who}</b><small>en ligne</small></div></div>`;
    b1=document.createElement('div'); b1.className='bub'; b1.style.top='112px'; b1.innerHTML=`${S.chat.msg}<span class="tm">18:42</span>`;
    b2=document.createElement('div'); b2.className='bub'; b2.style.top='170px'; b2.innerHTML=`<div class="lnk"><img src="${S.chat.og}"><div><b>${S.chat.title}</b><small>savetheoui.fr</small></div></div><span class="tm">18:42</span>`;
    chat.append(b1,b2); ad.appendChild(chat); }
  const caps=S.caps.map(([a,z,txt,y])=>{ const d=document.createElement('div'); d.className='cap'; d.style.top=y+'px'; d.innerHTML=`<span>${txt}</span>`; ad.appendChild(d); return {d,a,z}; });
  const tap=document.createElement('div'); tap.className='tap'; ad.appendChild(tap);
  const end=document.createElement('div'); end.className='end';
  end.innerHTML=`<div class="seal">O</div><div class="logo"><span>Save the</span><b>Oui</b></div><div class="pr">${S.end.price}</div><div class="url">SAVETHEOUI.FR</div>`; ad.appendChild(end);
  window.__ad=(t,taps)=>{
   if(chat){ const k=eo(lin(t,S.chat.until,S.chat.until+.4)); chat.style.transform=`translateX(${-k*105}%)`; chat.style.display=k>=1?'none':'';
     const p1=eo(lin(t,-1,0)), p2=eo(lin(t,.5,.8)); b1.style.opacity=p1; b2.style.opacity=p2; b2.style.transform=`translateY(${(1-p2)*14}px)`; }
   caps.forEach(({d,a,z})=>{ const k=eo(lin(t,a,a+.2)); d.style.opacity=Math.min(k,1-lin(t,z-.15,z)); d.style.transform=`scale(${.9+.1*k})`; });
   let o=0; for(const [at,x,y] of taps){ const k=lin(t,at-.3,at), u=lin(t,at,at+.3); if(k>0&&u<1){ tap.style.left=x+'px'; tap.style.top=y+'px'; o=k<1?eo(k):1-u; tap.style.transform=`scale(${k<1?1.3-.3*eo(k):1-.25*Math.sin(Math.PI*u)})`; } }
   tap.style.opacity=o;
   const e=lin(t,S.end.a,S.end.a+.35); end.style.opacity=e;
   const sk=lin(t,S.end.a+.15,S.end.a+.6); end.querySelector('.seal').style.transform=`scale(${.6+.4*eo(sk)})`;
  };
 },S);
 await p.clock.pauseAt(new Date('2026-10-14T12:05:00'));
 const step=async ms=>{ await p.clock.runFor(ms); await p.evaluate(()=>{ const n=performance.now(); for(const a of document.getAnimations()){ if(a._b===undefined){ a._b=n; a.pause(); } a.currentTime=n-a._b; } }); };
 await step(500);
 // position d'un toucher (viewport) : sélecteur ou point
 const where=async tg=>{ if(typeof tg!=='string') return tg; const r=await p.evaluate(sel=>{ for(const s of sel.split(',')){ try{ const e=[...document.querySelectorAll(s.trim())].find(e=>{ const r=e.getBoundingClientRect(); return r.width&&r.height&&r.top>=0&&r.bottom<=innerHeight; }); if(e){ const r=e.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2}; } }catch(_){} } return null; },tg); return r; };
 const taps=[], done=new Set();
 const fps=30, N=Math.round(S.d*fps), au=n=>`${__dirname}/audio/${n}.mp3`;
 let ff=null, dead=false;
 if(mode==='full'){
  const ins=['-i',au(S.music)], fl=[`[1:a]atrim=0:${S.d},asetpts=PTS-STARTPTS,afade=t=in:d=0.3,afade=t=out:st=${(S.d-1.5).toFixed(2)}:d=1.5,volume=${S.vo.length?0.55:0.9}[mu]`];
  if(S.vo.length){
   S.vo.forEach(([f,at,a,z],i)=>{ ins.push('-i',au(f)); fl.push(`[${i+2}:a]atrim=${a}:${z},asetpts=PTS-STARTPTS,afade=t=out:st=${Math.max(0,z-a-.08).toFixed(3)}:d=0.08,adelay=${Math.round(at*1000)}|${Math.round(at*1000)},volume=1.6[v${i}]`); });
   fl.push(`${S.vo.map((_,i)=>`[v${i}]`).join('')}amix=inputs=${S.vo.length}:normalize=0[vo]`,'[vo]asplit[vo1][vo2]','[mu][vo1]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=400[duck]','[duck][vo2]amix=inputs=2:normalize=0,alimiter=limit=0.95[a]');
  } else fl[0]=fl[0].replace('[mu]','[a]');
  ff=spawn('ffmpeg',['-y','-f','image2pipe','-framerate',''+fps,'-i','-',...ins,'-filter_complex',fl.join(';'),'-map','0:v','-map','[a]','-t',''+S.d,
    '-c:v','libx264','-pix_fmt','yuv420p','-crf','18','-preset','medium','-r',''+fps,'-c:a','aac','-b:a','192k','-movflags','+faststart',`${__dirname}/save-the-oui-decouverte-${V}-9x16.mp4`],{stdio:['pipe','ignore','inherit']});
  ff.on('close',c=>{ if(c){ dead=true; console.error('ffmpeg a échoué ('+c+')'); } }); ff.stdin.on('error',()=>{ dead=true; });
 }
 const shots=mode==='preview'?(process.argv[4]||'0,2,4,6,8,10,12,14,16').split(',').map(Number):null;
 for(let i=0;i<N&&!dead;i++){
  const t=i/fps;
  // gestes prévus à cet instant : le cercle apparaît 0,3 s avant, le vrai toucher a lieu à l'instant dit
  for(const [k,[at,tg,real]] of (S.taps||[]).entries()){
   if(t>=at-.3&&!done.has('w'+k)){ done.add('w'+k); const pt=await where(tg); if(pt) taps.push([at,pt.x,pt.y,k]); }
   if(t>=at&&!done.has('t'+k)){ done.add('t'+k); const pt=taps.find(x=>x[3]===k); if(pt&&real!==false) await p.mouse.click(pt[1],pt[2]); }
  }
  for(const [k,[at,sel,v]] of (S.sel||[]).entries()) if(t>=at&&!done.has('s'+k)){ done.add('s'+k); await p.evaluate(([sel,v])=>{ const e=[...document.querySelectorAll(sel)].find(e=>e.offsetParent); if(e){ const o=[...e.options].find(o=>o.text.includes(v)); if(o){ e.value=o.value; e.dispatchEvent(new Event('change',{bubbles:true})); } } },[sel,v]); }
  for(const [k,[at,sel]] of (S.scroll||[]).entries()) if(t>=at&&!done.has('c'+k)){ done.add('c'+k); await p.evaluate(sel=>{ const e=document.querySelector(sel); if(e) e.scrollIntoView({block:'center'}); },sel); }
  for(const [k,[at,key]] of (S.keys||[]).entries()) if(t>=at&&!done.has('k'+k)){ done.add('k'+k); await p.keyboard.press(key); }
  for(const [a,z,sel,txt] of (S.type||[])) if(t>=a&&t<=z+.05){ const n=Math.round(txt.length*Math.min(1,(t-a)/(z-a))); await p.evaluate(([sel,v])=>{ const e=document.querySelector(sel); if(e&&e.value!==v){ e.value=v; e.dispatchEvent(new Event('input',{bubbles:true})); } },[sel,txt.slice(0,n)]); }
  if(S.zoom){ const [a,z,sel,k]=S.zoom; if(t>=a-.05&&t<=z+.6){ const u=Math.min(1,(t-a)/.6), v=Math.min(1,Math.max(0,(t-z)/.6)), e=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2, s=1+(k-1)*e(u)*(1-e(v));
    await p.evaluate(([sel,s])=>{ const el=document.querySelector(sel), B=document.body; if(!B._o&&el){ const r=el.getBoundingClientRect(); B._o=`${r.left+r.width/2}px ${r.top+r.height/2}px`; } B.style.transformOrigin=B._o||'50% 30%'; B.style.transform=s>1.001?`scale(${s})`:''; },[sel,s]); } }
  // la mention « démo » des fiches d'exemple n'a rien à faire dans une pub
  await p.evaluate(()=>{ document.querySelectorAll('.note').forEach(n=>{ if(/Ceci est une démo/.test(n.textContent)){ if(n.textContent.trim().startsWith('Ceci est une démo')&&!n.querySelector('a')) n.remove(); else n.innerHTML=n.innerHTML.replace(/Ceci est une démo[^.]*\.\s*/,''); } }); document.querySelectorAll('a[href*="tableau/?demo"]').forEach(a=>a.parentNode.remove()); });
  await p.evaluate(([t,taps])=>window.__ad(t,taps),[t,taps]);
  if(shots){ if(shots.some(s=>Math.abs(s-t)<1/(2*fps))) await p.screenshot({path:`${__dirname}/e-${V}-${t.toFixed(1)}.jpg`,type:'jpeg',quality:70}); }
  else { const buf=await p.screenshot({type:'jpeg',quality:92}); if(!ff.stdin.write(buf)) await new Promise(r=>{ ff.stdin.once('drain',r); ff.once('close',r); }); }
  await step(1000/fps);
 }
 if(ff&&!dead){ ff.stdin.end(); await new Promise(r=>ff.on('close',r)); }
 await b.close();
})();
