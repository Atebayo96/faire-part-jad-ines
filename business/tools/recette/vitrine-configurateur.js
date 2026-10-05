const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs=require('fs'); const S=process.argv[2]; const B='http://localhost:8765';
const R=[]; const add=(zone,cas,ok,detail='')=>R.push({zone,cas,ok,detail});
async function audit(p){ return p.evaluate(()=>{
  const ow=document.documentElement.scrollWidth-innerWidth;
  const imgs=[...document.images].filter(i=>i.complete&&i.naturalWidth===0&&i.getAttribute('src')&&!i.loading).map(i=>i.getAttribute('src'));
  let small=[]; document.querySelectorAll('body *').forEach(e=>{ if(!e.childNodes.length) return; const own=[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()); if(!own) return; const cs=getComputedStyle(e); const r=e.getBoundingClientRect(); if(!r.width||cs.visibility==='hidden'||cs.display==='none'||cs.opacity==='0') return; if(e.closest('.cp-phone,.car-item,.duo-ph,.roll,.fmtc .fv,[aria-hidden="true"]')) return; const f=parseFloat(cs.fontSize); if(f<11) small.push(e.tagName+':'+f+':'+e.textContent.trim().slice(0,30)); });
  const links=[...document.querySelectorAll('a[href^="/"]')].map(a=>a.getAttribute('href').split('#')[0]).filter(Boolean);
  return {ow,imgs,small:small.slice(0,5),links}; }); }
(async()=>{ const b=await chromium.launch(); const links=new Set();
  // A. vitrine
  for(const u of ['/','/modeles/','/formules/','/questions/','/contact/','/creer/','/cgv/','/confidentialite/','/mentions-legales/','/merci/','/tableau/?demo=emma-louis']) for(const [w,h] of [[390,844],[1280,900]]){
    const p=await b.newPage({viewport:{width:w,height:h}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); const bad=[]; p.on('response',r=>{ if(r.status()>=400&&r.url().startsWith(B)) bad.push(r.status()+' '+r.url().slice(B.length)); });
    const r=await p.goto(B+u); await p.waitForTimeout(1500); await p.evaluate(()=>window.scrollTo(0,document.body.scrollHeight)); await p.waitForTimeout(800);
    const a=await audit(p); a.links.forEach(l=>links.add(l));
    add('Vitrine',`${u} ${w}px`,r.status()<400&&!errs.length&&a.ow<=0&&!bad.length&&!a.small.length,[r.status()!==200?'HTTP '+r.status():'',errs.join(' | '),a.ow>0?`déborde de ${a.ow}px`:'',bad.join(', '),a.small.length?'texte <11px : '+a.small.join(' ; '):''].filter(Boolean).join(' · '));
    await p.close(); }
  // liens internes
  { const p=await b.newPage(); const broken=[]; for(const l of links){ const r=await p.request.get(B+l); if(r.status()>=400) broken.push(l+' '+r.status()); } add('Vitrine','liens internes ('+links.size+')',!broken.length,broken.join(', ')); await p.close(); }
  // B. démos
  const slugs=fs.readdirSync('/home/user/faire-part-jad-ines/business/invites').map(f=>f.replace('.json',''));
  for(const slug of slugs){ const p=await b.newPage({viewport:{width:390,height:844}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); const bad=[]; p.on('response',r=>{ if(r.status()>=400&&r.url().startsWith(B)&&!r.url().includes('/api/')) bad.push(r.status()+' '+r.url().slice(B.length)); });
    await p.goto(`${B}/d/${slug}/`); await p.waitForTimeout(900); await p.click('#op'); await p.waitForTimeout(2600);
    await p.evaluate(()=>{ const s=document.getElementById('sc'); s.scrollTop=s.scrollHeight; }); await p.waitForTimeout(900);
    const ow=await p.evaluate(()=>{ let n=0; document.querySelectorAll('#sc *').forEach(e=>{ const r=e.getBoundingClientRect(); if(r.width&&r.right>innerWidth+2&&!e.closest('.lg-ph,.lg-band,.bgs,.fxw')) n++; }); return n; });
    let rsvp=false; try{ await p.click('[data-rsvp]',{timeout:3000}); await p.waitForTimeout(700); rsvp=await p.evaluate(()=>!!document.querySelector('.sheet.on, .sheet[open], .sheet:not([hidden])')); }catch(e){}
    add('Démos','/d/'+slug+'/',!errs.length&&!bad.length&&!ow&&rsvp,[errs.join(' | '),bad.join(', '),ow?ow+' éléments hors écran':'',rsvp?'':'feuille Répondre absente'].filter(Boolean).join(' · '));
    await p.close(); }
  // C. configurateur
  for(const [w,h] of [[1280,900],[390,844]]) for(const occ of ['mariage','henne','sbou3']) for(const k of ['nuits','alhambra','desert','emeraude']) for(const fmt of ['scenes','long']){
    const p=await b.newPage({viewport:{width:w,height:h}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    await p.goto(`${B}/creer/?theme=${k}`); await p.waitForTimeout(900);
    await p.click(`#cOcc [data-id="${occ}"]`); await p.waitForTimeout(200);
    for(const st of [2,3]){ await p.click(`#wzNav [data-go="${st}"]`); await p.waitForTimeout(250); }
    await p.click(`#cFmt [data-id="${fmt}"]`); await p.waitForTimeout(300);
    // tout cocher, puis vérifier qu'un cadre de réglages apparaît pour chaque partie réglable
    let eds=0, want=0;
    if(fmt==='long'){ for(const x of await p.$$('#cStory [data-x]:not([hidden])')){ await x.click(); await p.waitForTimeout(60); } want=await p.$$eval('#cStory [data-x]:not([hidden])',x=>x.filter(b=>b.dataset.x!=='album').length+x.filter(b=>b.dataset.x==='album').length); eds=await p.$$eval('#cStory .ed',x=>x.length); }
    await p.click('#wzNav [data-go="4"]'); await p.waitForTimeout(250);
    if(fmt==='scenes'){ for(const x of await p.$$('#cExtras button:not([hidden])')){ await x.click(); await p.waitForTimeout(60); } want=await p.$$eval('#cExtras button:not([hidden])',x=>x.filter(b=>['parents','story','dress','stay','gifts'].includes(b.dataset.id)).length); eds=await p.$$eval('#cExtrasEd .ed',x=>x.length); }
    await p.click('#wzNav [data-go="5"]'); await p.waitForTimeout(fmt==='long'?2500:600);
    const r=await p.evaluate(()=>({ow:document.documentElement.scrollWidth-innerWidth,sum:document.getElementById('cSum').innerText,href:document.getElementById('cGo').href,iframe:!!document.querySelector('iframe.cp-lg'),scroll:document.getElementById('cpScroll').hidden,gifts:(document.querySelector('#cExtras [data-id="gifts"]')||{}).textContent}));
    const giftOk={mariage:'Liste de mariage',henne:'Cagnotte',sbou3:'Liste de naissance'}[occ]===r.gifts;
    const okFmt=fmt==='long'?(r.iframe&&r.scroll):(!r.iframe&&!r.scroll);
    const okHref=r.href.includes('occasion='+occ)&&r.href.includes('theme='+k)&&r.href.includes('format='+fmt);
    add('Configurateur',`${occ} · ${k} · ${fmt} · ${w}px`,!errs.length&&r.ow<=0&&okFmt&&okHref&&giftOk&&eds===want,[errs.join(' | '),r.ow>0?`déborde de ${r.ow}px`:'',okFmt?'':'aperçu du mauvais format',okHref?'':'lien de commande incomplet',giftOk?'':'nom de la liste : '+r.gifts,eds===want?'':`réglages ${eds}/${want}`].filter(Boolean).join(' · '));
    await p.close(); }
  fs.writeFileSync(S+'/recette.json',JSON.stringify(R,null,1));
  const ko=R.filter(r=>!r.ok); console.log('cas',R.length,'échecs',ko.length); ko.forEach(r=>console.log('KO',r.zone,'|',r.cas,'|',r.detail));
  await b.close(); })();
