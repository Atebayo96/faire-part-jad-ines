// Enregistrements d'écran du save-the-date (9:16, 1080 × 1920), sans légende ni carte de fin : la matière première des
// vidéos TikTok (plein écran, ou incrustée dans un téléphone filmé sur fond vert, voir fondvert.md).
// Le vrai site est piloté image par image (comme feuille/ecran.js) : le ticket est gratté pour de vrai, le levier tiré.
//   node business/ads/std/ecran.js preview <thème> <gratter|jackpot> [t1,t2,…]
//   node business/ads/std/ecran.js full [thème] [jeu]        (sans argument : les 10)
// Site servi en local sur 8765 (python3 -m http.server 8765 -d business/site). Sortie : ads/std/ecrans/<thème>-<jeu>.mp4
const {chromium}=require('/opt/node-tools/node_modules/playwright');
const {spawn}=require('child_process'); const fs=require('fs');
const W=405, H=720, DPR=1080/405, FPS=30, D=13;
const FICHES={
 dolcevita:{couple:['Sarah','Yanis'],date:'2027-06-12T10:00',city:'Ravello, Italie',palette:'#1f5f8b'},
 doucefrance:{couple:['Camille','Antoine'],date:'2027-07-03T10:00',city:'Aix-en-Provence',palette:'#5b4a8a'},
 oldmoney:{couple:['Victoire','Charles'],date:'2027-09-18T10:00',city:'Deauville',palette:'#1f4d3a'},
 nuits:{couple:['Léa','Karim'],date:'2027-05-22T10:00',city:'Marrakech',palette:'#8a6a1f'},
 alhambra:{couple:['Inès','Mehdi'],date:'2027-08-28T10:00',city:'Grenade',palette:'#9a4a2a'}
};
const CSS=`#tap{position:fixed;z-index:2147483647;pointer-events:none;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;
 background:rgba(255,255,255,.38);border:2.5px solid rgba(255,255,255,.95);box-shadow:0 0 0 1px rgba(0,0,0,.15),0 4px 14px rgba(0,0,0,.25);opacity:0}
.demo-tag,.snd,.std-skip{display:none!important}`;
const lin=(t,a,b)=>Math.min(1,Math.max(0,(t-a)/(b-a)));

async function film(b,mode,theme,jeu,shots){
 const F=FICHES[theme], ctx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:DPR,hasTouch:false});
 await ctx.clock.install({time:new Date('2026-11-19T12:00:00')});
 const p=await ctx.newPage(); p.on('pageerror',e=>console.error('page:',e.message));
 // la fiche de démo, avec le thème, le jeu et les prénoms voulus
 await p.route('**/d/std-sarah-yanis/',async r=>{ const res=await r.fetch(); let h=await res.text();
  h=h.replace(/window\.INVITE=(\{.*?\});<\/script>/s,(m,j)=>{ const o=JSON.parse(j); delete o.demo; o.theme=theme; o.couple=F.couple; o.date=F.date; o.palette=F.palette;
    o.std={anim:jeu,city:F.city}; o.events[0].title=F.city; o.events[0].start=F.date; o.events[0].end=F.date.slice(0,10)+'T23:30'; return 'window.INVITE='+JSON.stringify(o)+';</script>'; });
  await r.fulfill({response:res,body:h}); });
 await p.goto('http://localhost:8765/d/std-sarah-yanis/'); await p.waitForTimeout(2500);
 await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(800);
 await p.addStyleTag({content:CSS}); await p.evaluate(()=>{ const d=document.createElement('div'); d.id='tap'; document.documentElement.appendChild(d); });
 await p.clock.pauseAt(new Date('2026-11-19T12:05:00'));
 const step=async ms=>{ await p.clock.runFor(ms); await p.evaluate(()=>{ const n=performance.now(); for(const a of document.getAnimations()){ if(a._b===undefined){ a._b=n; a.pause(); } a.currentTime=n-a._b; } }); };
 await step(400);
 const box=async s=>p.evaluate(s=>{ const e=document.querySelector(s); if(!e) return null; const r=e.getBoundingClientRect(); return {x:r.left,y:r.top,w:r.width,h:r.height}; },s);
 const tap=(x,y,o)=>p.evaluate(([x,y,o])=>{ const d=document.getElementById('tap'); d.style.left=x+'px'; d.style.top=y+'px'; d.style.opacity=o; },[x,y,o]);
 const foil=await box('.tk-foil'), lever=await box('.jp-lever'), win=await box('.jp-win');
 let ff=null, dead=false, down=false, upd=false;
 const out=`${__dirname}/ecrans/${theme}-${jeu}.mp4`;
 if(mode==='full'){ fs.mkdirSync(`${__dirname}/ecrans`,{recursive:true});
  ff=spawn('ffmpeg',['-y','-f','image2pipe','-framerate',''+FPS,'-i','-','-c:v','libx264','-pix_fmt','yuv420p','-crf','18','-preset','medium','-r',''+FPS,'-movflags','+faststart',out],{stdio:['pipe','ignore','inherit']});
  ff.on('close',c=>{ if(c) dead=true; }); ff.stdin.on('error',()=>{ dead=true; }); }
 for(let i=0;i<D*FPS&&!dead;i++){
  const t=i/FPS;
  if(jeu==='gratter'&&foil){ // le doigt arrive à 1 s, gratte en zigzag jusqu'à 4,6 s
   const a=1, z=4.6, u=lin(t,a,z), rows=5, v=u*rows, r=Math.min(rows-1,Math.floor(v)), f=v-r, e=.5-.5*Math.cos(Math.PI*f);
   const x=foil.x+foil.w*(.1+.8*(r%2?1-e:e)), y=foil.y+foil.h*(.14+.72*(r+f)/rows);
   if(t>=a-.3&&t<a) await tap(x,y,lin(t,a-.3,a));
   if(t>=a&&!down){ down=true; await p.mouse.move(x,y); await p.mouse.down(); }
   if(down&&!upd){ await p.mouse.move(x,y,{steps:3}); await tap(x,y,1); }
   if(t>=z&&!upd){ upd=true; await p.mouse.up(); }
   if(upd) await tap(x,y,1-lin(t,z,z+.25));
  }
  if(jeu==='jackpot'&&(lever||win)){ // le levier est tiré vers le bas à 1,2 s
   const L=lever||win, a=1.2, z=1.75, x=L.x+L.w/2, y0=L.y+L.h*.22, y=y0+130*lin(t,a,z);
   if(t>=a-.3&&t<a) await tap(x,y0,lin(t,a-.3,a));
   if(t>=a&&!down){ down=true; await p.mouse.move(x,y0); await p.mouse.down(); }
   if(down&&!upd){ await p.mouse.move(x,y,{steps:3}); await tap(x,y,1); }
   if(t>=z&&!upd){ upd=true; await p.mouse.up(); }
   if(upd) await tap(x,y,1-lin(t,z,z+.25));
  }
  if(shots){ if(shots.some(s=>Math.abs(s-t)<1/(2*FPS))) await p.screenshot({path:`${__dirname}/e-${theme}-${jeu}-${t.toFixed(1)}.jpg`,type:'jpeg',quality:70}); }
  else { const buf=await p.screenshot({type:'jpeg',quality:93}); if(!ff.stdin.write(buf)) await new Promise(r=>{ ff.stdin.once('drain',r); ff.once('close',r); }); }
  await step(1000/FPS);
 }
 if(ff&&!dead){ ff.stdin.end(); await new Promise(r=>ff.on('close',r)); console.log(out); }
 await ctx.close();
}
(async()=>{
 const [mode,th,je,sh]=process.argv.slice(2), b=await chromium.launch();
 for(const t of th?[th]:Object.keys(FICHES)) for(const j of je?[je]:['gratter','jackpot'])
  await film(b,mode,t,j,mode==='preview'?(sh||'0.5,2,3.5,5,6.5,8,10,12').split(',').map(Number):null);
 await b.close();
})();
