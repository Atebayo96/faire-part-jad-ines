// Captures du vrai site pour les pubs « parcours » (configurateur, faire-part, tableau de bord).
// Site servi en local : python3 -m http.server 8765 -d business/site ; puis node business/ads/parcours/captures.js
// Tout est écrit dans caps/ (ignoré par git), en 390 × 844 × 2.
const {chromium}=require('/opt/node-tools/node_modules/playwright');
const fs=require('fs'), D=__dirname+'/caps/'; fs.mkdirSync(D,{recursive:true});
const INV='/home/user/faire-part-jad-ines/business/invites/';
const page=i=>`<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/polices/polices.css"><link rel="stylesheet" href="/invite.css"><link rel="stylesheet" href="/reveal.css"><style>.snd,.demo-tag{display:none!important}</style></head><body><script>window.INVITE=${JSON.stringify(i).replace(/</g,'\\u003c')};</script><script src="/themes.js"></script><script src="/reveal.js"></script><script src="/invite.js"></script></body></html>`;
const shot=(p,n)=>p.screenshot({path:D+n+'.jpg',type:'jpeg',quality:90});
const V={viewport:{width:390,height:844},deviceScaleFactor:2,locale:'fr-FR'};
// faire-part réel, horloge et animations pilotées (même méthode que ouverture/real.js)
async function invite(b,fiche,name,{frames=0,settle=3000}={}){
  const inv=Object.assign(JSON.parse(fs.readFileSync(INV+fiche+'.json')),{demo:false,music:null,reveal:null,countdown:null});
  Object.assign(inv,arguments[3]&&arguments[3].set||{});
  const ctx=await b.newContext(V); await ctx.clock.install({time:new Date('2026-10-06T12:00:00')});
  const p=await ctx.newPage(); p.on('pageerror',e=>console.log('ERR',name,e.message));
  await p.route('http://localhost:8765/_m/',r=>r.fulfill({contentType:'text/html; charset=utf-8',body:page(inv)}));
  await p.goto('http://localhost:8765/_m/'); await p.waitForTimeout(2500); await p.evaluate(()=>document.fonts.ready);
  await p.clock.pauseAt(new Date('2026-10-06T12:05:00'));
  const step=async ms=>{await p.clock.runFor(ms); await p.evaluate(()=>{const n=performance.now();for(const a of document.getAnimations()){if(a._b===undefined){a._b=n;a.pause();}a.currentTime=n-a._b;}});};
  await step(1000); await shot(p,name+'-pre');
  await p.evaluate(()=>document.querySelector('#op').click());
  for(let i=0;i<frames;i++){ await step(1000/30); await p.waitForTimeout(i%10?5:60); await shot(p,`${name}-${String(i).padStart(3,'0')}`); }
  for(let t=0;t<settle;t+=100) await step(100); await p.waitForTimeout(300); await shot(p,name+'-fin');
  await ctx.close();
}
(async()=>{
 const b=await chromium.launch({args:['--lang=fr-FR']}); const only=process.argv[2];
 const C='Camille', A='Antoine', taps={};
 if(!only||only==='cfg'){
  const p=await b.newPage(V); p.on('pageerror',e=>console.log('ERR cfg',e.message));
  await p.goto('http://localhost:8765/creer/?theme=dolcevita'); await p.waitForTimeout(2500);
  await p.fill('#cDate','2027-07-03'); await p.evaluate(()=>{const d=document.getElementById('cDate');d.type='text';d.value='03/07/2027';Object.defineProperty(d,'value',{get:()=>'2027-07-03',set:()=>{}})}); await p.fill('#cN1',''); await p.fill('#cN2',''); await p.waitForTimeout(400);
  await p.evaluate(()=>{const e=document.getElementById('cN1');scrollTo(0,e.getBoundingClientRect().top+scrollY-300)});
  await p.waitForTimeout(1500); let k=0; await shot(p,`cfg-a${String(k++).padStart(2,'0')}`);
  for(const [id,w] of [['#cN1',C],['#cN2',A]]){ await p.focus(id); for(const ch of w){ await p.type(id,ch); await p.waitForTimeout(220); await shot(p,`cfg-a${String(k++).padStart(2,'0')}`);} }
  await p.evaluate(()=>document.activeElement.blur()); await p.waitForTimeout(300); await shot(p,`cfg-a${String(k++).padStart(2,'0')}`);
  // défilement jusqu'aux thèmes
  const y0=await p.evaluate(()=>scrollY), y1=await p.evaluate(()=>{const t=[...document.querySelectorAll('.th')].find(e=>/Douce France/.test(e.textContent));return t.getBoundingClientRect().top+scrollY-420});
  for(let i=1;i<=12;i++){ const e=i/12, f=e<.5?2*e*e:1-Math.pow(-2*e+2,2)/2; await p.evaluate(y=>scrollTo(0,y),Math.round(y0+(y1-y0)*f)); await p.waitForTimeout(120); await shot(p,`cfg-b${String(i).padStart(2,'0')}`); }
  const th=p.locator('.th',{hasText:'Douce France'}); const bb=await th.boundingBox(); taps.theme=[bb.x+bb.width/2,bb.y+bb.height/2];
  await th.click(); for(let i=0;i<6;i++){ await p.waitForTimeout(300); await shot(p,`cfg-c${i}`); }
  // récapitulatif
  await p.locator('button',{hasText:'Récapitulatif'}).first().click(); await p.waitForTimeout(1500);
  const cmd=p.locator('button,a',{hasText:'Commander'}).first(); await cmd.evaluate(e=>scrollTo(0,e.getBoundingClientRect().top+scrollY-560)); await p.waitForTimeout(1200);
  const cb=await cmd.boundingBox(); taps.cmd=[cb.x+cb.width/2,cb.y+cb.height/2]; await shot(p,'cfg-d');
  fs.writeFileSync(D+'taps.json',JSON.stringify(taps)); await p.close();
 }
 if(!only||only==='inv'){
  await invite(b,'camille-antoine','ca-env',{frames:60,set:{opening:'env'}});
  const same={couple:['Camille','Antoine'],date:'2027-07-03T16:00',opening:'env',intro:{eyebrow:'Nous vous invitons'}};
  for(const [f,th] of [['camille-antoine','doucefrance'],['giulia-hugo','dolcevita'],['victoire-charles','oldmoney']]) await invite(b,f,'th-'+th,{set:same});
  for(const [c,n] of [['#6f63a3','lavande'],['#6b7a45','olivier'],['#b08648','or']]) await invite(b,'camille-antoine','pal-'+n,{set:{palette:c,opening:'env'}});
  await invite(b,'camille-antoine','door',{frames:78,set:{opening:'door'}});
 }
 if(!only||only==='tb'){
  const p=await b.newPage(V); await p.goto('http://localhost:8765/tableau/?demo=camille-antoine'); await p.waitForTimeout(3000); await shot(p,'tb'); await p.close();
 }
 await b.close();
})();
