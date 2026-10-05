const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs=require('fs'); const S=process.argv[2]; const B='http://localhost:8765'; const {base,open}=require('./harness.js');
const PART=process.argv[3]; const R=[]; const add=(zone,cas,ok,detail='')=>R.push({zone,cas,ok,detail});
(async()=>{ const b=await chromium.launch();
  const slugs=fs.readdirSync('/home/user/faire-part-jad-ines/business/invites').map(f=>f.replace('.json',''));
  if(PART==='demos'){ const jobs=[]; for(const slug of slugs) for(const wh of [[390,844],[360,740]]) jobs.push([slug,wh]);
    const one=async([slug,[w,h]])=>{ const p=await b.newPage({viewport:{width:w,height:h}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    await p.goto(`${B}/d/${slug}/`); await p.waitForTimeout(900); await p.click('#op'); await p.waitForTimeout(2600);
    await p.evaluate(()=>{ const s=document.getElementById('sc'); s.scrollTop=s.scrollHeight; }); await p.waitForTimeout(900);
    const ow=await p.evaluate(()=>{ let n=[]; document.querySelectorAll('#sc .acts, #sc .b, #sc .cd, #sc .nm, #sc .ey, #sc .tx').forEach(e=>{ const r=e.getBoundingClientRect(); if(r.width&&(r.right>innerWidth+1||r.left<-1)) n.push(e.className+':'+(e.textContent||'').trim().slice(0,20)); }); return n; });
    let step='';
    try{ await p.click('[data-rsvp]',{timeout:3000,force:true}); await p.waitForTimeout(600);
      if(!await p.$('.sheet.on')) step='la feuille ne s’ouvre pas';
      else { const name=await p.$('.sheet.on input[name="name"]'); if(name){ await name.fill('Test Recette',{timeout:3000}); }
        for(const r of await p.$$('.sheet.on input[type=radio][value="1"]')) await r.check({force:true}).catch(()=>{});
        const sub=await p.$('.sheet.on button[type=submit]'); if(sub){ await sub.click({timeout:3000,force:true}); await p.waitForTimeout(900); }
        const done=await p.$('.sheet.on .done-msg'); if(!done) step='pas de message de remerciement : '+(await p.$eval('.sheet.on',e=>e.innerText.slice(0,120).replace(/\n/g,' '))); } }catch(e){ step='bouton Répondre introuvable'; }
    console.log('·',slug,w); add('Démos',`/d/${slug}/ ${w}px`,!errs.length&&!ow.length&&!step,[errs.join(' | '),ow.length?'hors écran : '+ow.slice(0,3).join(', '):'',step].filter(Boolean).join(' · '));
    await p.close(); };
    let k=0; await Promise.all(Array.from({length:6},async()=>{ while(k<jobs.length){ const j=jobs[k++]; await one(j).catch(e=>add('Démos',j[0]+' '+j[1][0]+'px',false,'erreur de recette : '+e.message.slice(0,80))); } })); }
  // accueil du moteur : la fin du texte doit rester au-dessus du sujet de la scène (haut du sujet mesuré dans l'image)
  if(PART==='moteur') for(const theme of (process.argv[4]||'dolcevita').split(',')) for(const occ of (theme==='dolcevita'?['mariage']:['mariage','sbou3'])) for(const rv of [null,'scratch','slot','wheel']) for(const [w,h] of [[390,844],[360,740]]){
    const inv=Object.assign(JSON.parse(JSON.stringify(base)),{theme,reveal:rv,countdown:'fin',couple:occ==='sbou3'?['Lina']:['Emma','Louis'],intro:Object.assign({},base.intro,occ==='sbou3'?{text:'Yasmine & Karim vous convient au sbouâ de leur fille'}:{})});
    inv.calques=['nuits','dolcevita'].includes(theme)?['1','2','3','4']:[];
    const {p,errs}=await open(b,inv,w,h);
    const m=await p.evaluate(()=>{ const s=document.querySelector('.pg'), H=innerHeight; let bot=0; s.querySelectorAll('.ey,.nm,.tx,.dl,.seal').forEach(e=>{ const r=e.getBoundingClientRect(); if(r.height) bot=Math.max(bot,r.bottom); }); return Math.round(bot/H*100); });
    const lim=['nuits','dolcevita'].includes(theme)?55:50; // nuits : sujet en calque posé au bas ; les autres : haut du sujet ≥ 50 % (descendre.py)
    add('Moteur · accueil',`${theme} · ${occ} · ${rv||'date affichée'} · ${w}px`,!errs.length&&m<=lim,`texte jusqu'à ${m} % de l'écran (limite ${lim} %)`+(errs.length?' · '+errs.join(' | '):''));
    if(m>lim) await p.screenshot({path:`${S}/ko-${theme}-${occ}-${rv}-${w}.png`});
    await p.close(); }
  fs.writeFileSync(S+'/recette-'+PART+'.json',JSON.stringify(R,null,1));
  const ko=R.filter(r=>!r.ok); console.log('cas',R.length,'échecs',ko.length); ko.forEach(r=>console.log('KO',r.zone,'|',r.cas,'|',r.detail));
  await b.close(); })();
