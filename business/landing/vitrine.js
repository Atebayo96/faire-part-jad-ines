  /* la vitrine est en quatre pages (accueil, /modeles/, /formules/, /creer/) qui partagent ce script : chaque bloc
     ne tourne que si sa page a les éléments. Les anciennes ancres de la page unique renvoient vers la bonne page. */
  if(location.pathname==='/'&&location.hash){ const H={'#prix':'/formules/','#formules':'/formules/','#inclus':'/formules/','#faq':'/questions/','#pourquoi':'/formules/#pourquoi','#commencer':'/contact/','#composer':'/creer/','#modeles':'/modeles/','#continu':'/modeles/','#demos':'/modeles/'}; if(H[location.hash]) location.replace(H[location.hash]); }
  const PLANS={essentiel:{name:'Essentiel',price:'99 €'},signature:{name:'Signature',price:'229 €'},couture:{name:'Couture',price:'dès 590 €'}};
  // bouton de formule : sur /creer/, la commande Stripe s'ouvre (formule payable en ligne) ; ailleurs, le lien mène à /creer/?plan=…
  document.querySelectorAll('[data-plan]').forEach(a=>a.addEventListener('click',e=>{ const sel=document.getElementById('planSel'); if(sel) sel.value=a.dataset.plan;
    const pay=(window.SCEAU_PAY||{})[a.dataset.plan]; if(pay&&openOrder){ e.preventDefault(); openOrder(a.dataset.plan,pay); } }));

  let openOrder=null;
  if(document.getElementById('order')){
  /* commande : récapitulatif, conditions de vente et renonciation au délai de rétractation, puis paiement Stripe */
  let ordPlan=null, ordLink=null;
  const ord=document.getElementById('order'), $o=id=>document.getElementById(id);
  function choicesText(){ const v=id=>($o(id)||{}).value||''; return [v('fOcc')&&v('fOcc')!=='Mariage'&&'occasion '+v('fOcc').toLowerCase(), v('fStyle')&&'thème '+v('fStyle'), v('fFormat')&&'format '+v('fFormat').toLowerCase(), v('fOpen')&&'ouverture '+v('fOpen').toLowerCase(), v('fPal')&&'couleurs '+v('fPal').toLowerCase(), v('fEvents')&&'écrans : '+v('fEvents'), v('fScreens')&&'écrans en plus : '+v('fScreens').toLowerCase()].filter(Boolean).join(' · '); }
  openOrder=function(plan,link){
    ordPlan=plan; ordLink=link; const P=PLANS[plan];
    $o('ordT').textContent=`${P.name} · ${P.price}`;
    const ch=choicesText(); $o('ordSub').textContent=ch?'Vos choix dans l’essai : '+ch+'. Tout reste modifiable ensuite.':'Vous choisirez le thème, les couleurs et les écrans avec nous juste après.';
    $o('oPay').textContent=`Payer ${P.price} avec Stripe`;
    const promo=(window.SCEAU_PAY||{}).promo; $o('ordNote').textContent=(promo?`Offre de lancement : saisissez le code ${promo} sur la page de paiement. `:'')+'Paiement sécurisé par Stripe. Vous recevez votre reçu par e-mail, puis nous vous écrivons pour recueillir vos lieux, horaires et textes.';
    if(!$o('oName').value&&$o('fNames')&&$o('fNames').value) $o('oName').value=$o('fNames').value;
    ord.hidden=false; document.body.style.overflow='hidden'; setTimeout(()=>$o('oEmail').focus(),50);
  };
  function closeOrder(){ ord.hidden=true; document.body.style.overflow=''; }
  $o('ordX').onclick=closeOrder; ord.addEventListener('click',e=>{ if(e.target===ord) closeOrder(); });
  addEventListener('keydown',e=>{ if(e.key==='Escape'&&!ord.hidden) closeOrder(); });
  $o('ordForm').addEventListener('submit',async e=>{
    e.preventDefault(); const err=$o('oErr'), show=m=>{ err.textContent=m; err.hidden=false; };
    const email=$o('oEmail').value.trim();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return show('Indiquez une adresse e-mail valide.');
    if(!$o('oCgv').checked) return show('Merci d’accepter les conditions de vente.');
    if(!$o('oWaiver').checked) return show('Cochez la case pour que nous puissions commencer la création dès votre paiement.');
    err.hidden=true; const btn=$o('oPay'); btn.disabled=true; btn.textContent='Ouverture du paiement…';
    const ref='sc_'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);
    const v=id=>($o(id)||{}).value||'';
    const body={type:'commande',ref,plan:ordPlan,email,name:$o('oName').value,date:$o('oDate').value,consent:true,cgv:true,waiver:true,
      style:v('fStyle'),format:v('fFormat'),palette:v('fPal'),font:v('fFont'),opening:v('fOpen'),countdown:v('fCount'),screens:v('fScreens'),events:v('fEvents'),names:$o('oName').value,weddingDate:$o('oDate').value};
    // on garde la trace de la commande et des cases cochées (preuve de la renonciation), sans bloquer le paiement
    try{ await Promise.race([fetch('/api/lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}),new Promise(r=>setTimeout(r,2500))]); }catch(x){}
    const u=new URL(ordLink); u.searchParams.set('prefilled_email',email); u.searchParams.set('client_reference_id',ref);
    location.href=u.toString();
  });
  }
  { const q=new URLSearchParams(location.search), sel=document.getElementById('planSel'), up=q.get('plan'); if(sel&&up&&[...sel.options].some(o=>o.value===up)) sel.value=up;
    // depuis le configurateur : prénoms, date, thème et format déjà remplis
    const fn=document.getElementById('fNames'), fd=document.getElementById('fDate'), pu=document.getElementById('fPlanUrl');
    if(fn&&fn.tagName==='INPUT'&&fn.type==='text'&&q.get('names')) fn.value=q.get('names');
    if(fd&&fd.tagName==='INPUT'&&q.get('date')){ fd.type='date'; fd.value=q.get('date'); }
    const OCN={henne:'henné',sbou3:'sbouâ'};
    if(pu) pu.value=[q.get('plan'),OCN[q.get('occasion')],q.get('theme'),q.get('format')].filter(Boolean).join(' · ');
    const intro=document.getElementById('ctxLine'); if(intro&&q.get('theme')&&window.SCEAU_THEMES&&window.SCEAU_THEMES[q.get('theme')]){ intro.hidden=false; intro.textContent=`Votre composition : ${OCN[q.get('occasion')]?'faire-part de '+OCN[q.get('occasion')]+' · ':''}${window.SCEAU_THEMES[q.get('theme')].name}${q.get('format')?' · '+(q.get('format')==='long'?'grand tableau':'scène par scène'):''}${up?' · '+up.charAt(0).toUpperCase()+up.slice(1):''}. On la retrouve avec votre message.`; } }
  if(document.getElementById('waitForm')) document.getElementById('waitForm').addEventListener('submit',async e=>{
    e.preventDefault();
    const f=e.currentTarget, fd=new FormData(f), err=document.getElementById('fErr'), btn=f.querySelector('button');
    const show=m=>{ err.textContent=m; err.hidden=false; };
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fd.get('email')||'')) return show('Indiquez une adresse e-mail valide.');
    if(!document.getElementById('fConsent').checked) return show('Cochez la case pour que nous puissions vous recontacter.');
    err.hidden=true; btn.disabled=true; btn.textContent='Envoi…';
    const body=Object.fromEntries(fd); body.consent=true; body.names=body.name; body.weddingDate=body.date;
    try{
      const r=await fetch('/api/lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      if(!r.ok) throw new Error(r.status);
      f.style.display='none'; document.querySelector('.consent').style.display='none'; document.getElementById('ok').style.display='block';
    }catch(x){ btn.disabled=false; btn.textContent='Envoyer ma demande'; show("L'envoi n'a pas fonctionné. Réessayez dans un instant."); }
  });

  /* apercu des themes : 4 scenes par theme, textes d'exemple */
  /* 9 themes, 5 styles. font/color = typographie propre au theme ; light = fond clair (texte fonce, pas de voile) */
  const THEMES=window.SCEAU_THEMES;
  const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  // chapeau : « Bismillah » s'écrit en arabe (basmala, voir themes.js), de droite à gauche, comme dans le faire-part
  function eyHtml(cls,t,st){ const e=window.sceauEy(t); return `<div class="${cls}${e.ar?' ar':''}"${e.ar?` lang="ar" dir="rtl" aria-label="${esc(window.SCEAU_BASMALA_LABEL)}"`:''} style="${st}">${esc(e.text)}</div>`; }
  function nameStyle(t,scale){
    const sz=(t.size||1)*scale;
    return `font-family:${t.font};color:${t.color};font-size:clamp(${Math.round(34*sz)}px,${(5.2*sz).toFixed(2)}vh,${Math.round(54*sz)}px);${t.italic?'font-style:italic;':''}${t.upper?'text-transform:uppercase;letter-spacing:.14em;font-weight:300;':''}`;
  }
  /* les 4 scenes d'une creation, empilees dans un film (aucun defilement a l'interieur du telephone) */
  function film(t,eager){
    const ey=t.ey||t.color, tx=t.tx||t.color;
    return '<div class="film">'+t.scenes.map((sc,i)=>{
      const [e,main,x,bt,mode]=sc, dk=mode==='dark';
      const tt=dk?Object.assign({},t,{color:'#fff'}):t, ey2=dk?'#fff':ey, tx2=dk?'#fff':tx;
      const nmTxt=main==='NAMES'?(t.stack?t.couple.split(' & ').map(esc).join('<br>&amp; '):esc(t.couple)):esc(main);
      const big=`<div class="nm" style="${esc(nameStyle(tt,main==='NAMES'?1:.78))}">${nmTxt}</div>`;
      return `<div class="pv-sc${t.light&&!dk?' light':''}" style="${i===0&&t.top1?'padding-top:'+t.top1:''}"><img class="bg" src="${esc(t.img(i+1))}" alt="" width="540" height="954" decoding="async"${eager&&i===0?'':' loading="lazy"'}>${eyHtml('ey',e,`color:${ey2}`)}${big}<div class="tx" style="color:${tx2}">${esc(x)}</div>${bt?`<span class="bt" style="color:${tx2};border-color:${tx2}">${esc(bt)}</span>`:''}</div>`;
    }).join('')+'</div>';
  }

  /* haut de page : tous nos faire-part dans un seul téléphone. L'utilisateur ne veut plus deux types présentés à part
     (« grand tableau » contre « scène par scène ») : c'est le même produit, plus ou moins dessiné selon les écrans. */
  // les styles « long » n'existent qu'en grand tableau (pas de décors de scènes) : hors des listes scène après scène
  // tous les thèmes ont leurs décors de scènes ; ceux marqués plan:'signature' se composent à partir de Signature
  // les thèmes du lancement (launch:true), chacun dans les deux formats : les 5 premiers et les 3 variantes de Mille et une nuits
  const KEYS=Object.keys(THEMES).filter(k=>THEMES[k].launch), DEMOS0=window.SCEAU_DEMOS||[];
  const LONGS=[
    {slug:'nour-ilyes',k:'nuits',couple:'Nour & Ilyes',ey:'Bismillah',date:'Du 8 au 10 juillet 2027 · Marrakech',ink:'#f6eedb',shadow:'0 2px 14px rgba(0,0,0,.55)',desc:'Henné, cérémonie et fête dans le désert',alt:'un riad de nuit, le couple de dos sur un balcon'},
    {slug:'ananya-rohan',k:'bollywood',couple:'Ananya & Rohan',ey:'Shubh Vivah',date:'Les 17 et 18 septembre 2027',ink:'#6b1230',shadow:'0 1px 10px rgba(255,236,214,.7)',desc:'Mehndi, mandap et sangeet',alt:'un palais du Rajasthan au crépuscule, le couple de dos'},
    {slug:'chiara-lucas',k:'dolcevita',couple:'Chiara & Lucas',ey:'Ci sposiamo',date:'Samedi 5 juin 2027 · Ravello',ink:'#193f64',shadow:'0 1px 12px rgba(255,255,255,.8)',desc:'Aperitivo, chapelle et dîner face à la mer',alt:'la côte amalfitaine, le couple de dos sous une pergola de citrons'},
    {slug:'lin-wei',k:'chinois',couple:'Lin & Wei',ey:'Double bonheur',date:'Samedi 13 février 2027 · Paris',ink:'#fbeedd',shadow:'0 2px 14px rgba(0,0,0,.6)',desc:'Cérémonie du thé, oui et banquet',alt:'un pavillon aux lanternes rouges, le couple de dos sur un pont'},
    {slug:'hana-kenji',k:'japonais',couple:'Hana & Kenji',ey:'Nous nous marions',date:'Samedi 3 avril 2027 · Kyoto',ink:'#2b2830',shadow:'0 1px 10px rgba(255,250,240,.85)',desc:'Sanctuaire, hanami et ryokan',alt:'des cerisiers et un torii, le couple de dos sous une ombrelle rouge'},
    {slug:'anastasia-nikolai',k:'gzhel',couple:'Anastasia & Nikolaï',ey:'Nous nous marions',date:'Samedi 16 janvier 2027 · Paris',ink:'#1d3f9a',shadow:'0 1px 10px rgba(255,255,255,.9)',desc:'Cathédrale, pain et sel, dîner',alt:'une troïka dans la neige, peinte en bleu cobalt'},
    {slug:'linh-thomas',k:'asianchic',couple:'Linh & Thomas',ey:'Save the date',date:'Samedi 18 septembre 2027 · Paris',ink:'#f2e7cf',shadow:'0 2px 14px rgba(0,0,0,.7)',desc:'Cérémonie au bord de l’eau, dîner black tie',alt:'un pavillon de laque noire et d’or, le couple de dos au bord d’un bassin'},
    {slug:'jade-enzo',k:'y2k',couple:'Jade & Enzo',ey:'On se marie !',date:'Samedi 26 juin 2027 · Marseille',ink:'#4a1640',shadow:'0 1px 10px rgba(255,240,248,.85)',desc:'Mairie, apéro et dance floor',alt:'une décapotable rose sur un boulevard pastel'},
    {slug:'victoire-charles',k:'oldmoney',couple:'Victoire & Charles',ey:'Ils se marient',date:'Samedi 12 juin 2027 · Normandie',ink:'#1f2b44',shadow:'0 1px 10px rgba(255,252,244,.9)',desc:'Chapelle, pelouse et dîner sous la tente',alt:'un manoir anglais et une voiture ancienne'},
    {slug:'fatou-kwame',k:'afro',couple:'Fatou & Kwame',ey:'Nous nous marions',date:'Samedi 21 août 2027 · Paris',ink:'#fbeedb',shadow:'0 2px 14px rgba(0,0,0,.6)',desc:'La dot, le oui et la fête',alt:'un pavillon drapé de kente sous un baobab'}
  ];
  // cartes de la section « Un seul grand tableau » : la même liste
  const contGrid=document.getElementById('contGrid'); if(contGrid) contGrid.innerHTML=LONGS.filter(l=>KEYS.includes(l.k)).map(l=>`<a class="cont" href="/d/${l.slug}/" target="_blank" rel="noopener"><div class="pic"><img src="/img/long/${l.k}/thumb.webp" alt="${esc('Le faire-part '+THEMES[l.k].name+' : '+l.alt)}" loading="lazy" width="480" height="768"></div><div class="txt"><b>${esc(THEMES[l.k].name)}</b><span>${esc(l.couple+' · '+l.desc)}</span><em>Ouvrir l'exemple →</em></div></a>`).join('');
  const CREAS=LONGS.filter(l=>KEYS.includes(l.k)).map(l=>{ const t=THEMES[l.k]; return Object.assign({},l,{kind:'long',label:t.name,desc:l.couple+' · '+l.desc,href:'/d/'+l.slug+'/',tag:t.name,font:t.font,size:t.size,italic:t.italic,upper:t.upper,stack:t.stack,img:()=>`/img/reel/long-${l.k}.webp`}); });
  // carrousel de l'accueil : un thème qui a sa démo en grand tableau y passe sous cette forme, pas deux fois
  KEYS.filter(k=>!LONGS.some(l=>l.k===k)).forEach(k=>{ const t=THEMES[k], d=DEMOS0.find(x=>x.theme===k&&x.slug!=='yasmine-karim'&&!x.kind);
    CREAS.push(Object.assign({},t,{kind:'pages',k,label:t.name,desc:(t.style!==t.name?t.style+' · ':'')+t.short,href:d?'/d/'+d.slug+'/':'',tag:t.name,img:i=>`/img/themes/${k}-${i}.webp?v=8`})); });
  // notre faire-part reel : les vrais lieux du couple, peints et animes (demo Yasmine & Karim)
  CREAS.push({kind:'pages',k:'yk',label:'Yasmine & Karim',desc:'Leurs vrais lieux, peints et animés : mairie, salle, ville',href:'/d/yasmine-karim/',tag:'Lieux réels peints',
    couple:'Yasmine & Karim',font:'"Great Vibes",cursive',color:'#2c2114',ey:'#8a6a2c',tx:'#5a4632',light:true,img:i=>`/img/reel/yk-${i}.webp`,
    scenes:[["Ils se marient","NAMES","Samedi 12 juin 2027"],["Cérémonie civile","Hôtel de Ville de Nanterre","À 14h00","Itinéraire","dark"],["Réception","Le Palacio","Dès 19h · cocktail, dîner et soirée","Itinéraire","dark"],["Réponse souhaitée","Serez-vous des nôtres ?","Avant le 1er mai","Répondre","dark"]]});
  function roll(c,eager){
    const tt={font:c.font,color:c.ink,size:c.size,italic:c.italic,upper:c.upper};
    return `<div class="roll"><img src="${esc(c.img())}" alt="" width="540" height="2176" decoding="async"${eager?'':' loading="lazy"'}></div><div class="roll-txt" style="color:${c.ink};text-shadow:${c.shadow}">${eyHtml('ey',c.ey,'')}<div class="nm" style="${esc(nameStyle(tt,1))}">${esc(c.couple)}</div><div class="tx">${esc(c.date)}</div></div>`;
  }
  // un seul téléphone pour tous nos faire-part : il montre un exemple à la fois et passe tout seul au suivant
  const noMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let inView=true;
  const warm=it=>it&&it.querySelectorAll('img[loading]').forEach(im=>im.removeAttribute('loading'));
  const cols=[...document.querySelectorAll('.duo-col')].map(col=>{
    const list=CREAS.filter(c=>col.dataset.kind==='all'||c.kind===col.dataset.kind), ph=col.querySelector('.duo-ph');
    const items=list.map((c,i)=>{
      const it=document.createElement('a'); it.className='car-item'; it.dataset.f=0; it.setAttribute('aria-label','Ouvrir la démo '+c.label);
      it.href=c.href||'#modeles'; if(c.href){ it.target='_blank'; it.rel='noopener'; }
      it.innerHTML=(c.kind==='long'?roll(c,i===0):film(c,i===0))+`<span class="car-tag">${esc(c.tag)}</span>`;
      ph.appendChild(it); return it;
    });
    const C={list,items,cur:-1,film:null,auto:null,col};
    C.show=i=>{
      i=(i+items.length)%items.length; if(i===C.cur) return;
      if(items[C.cur]){ items[C.cur].classList.remove('on'); items[C.cur].dataset.f=0; }
      C.cur=i; const it=items[i], c=list[i]; it.classList.add('on'); warm(it); warm(items[(i+1)%items.length]);
      col.querySelector('.car-label b').textContent=c.label; col.querySelector('.car-label span').textContent=c.desc;
      const o=col.querySelector('.car-open'); o.hidden=!c.href; if(c.href) o.href=c.href;
      clearInterval(C.film);
      if(c.kind!=='long'&&!noMotion) C.film=setInterval(()=>{ if(!document.hidden&&inView) it.dataset.f=((+it.dataset.f||0)+1)%4; },2800);
    };
    // passage automatique à l'exemple suivant ; un clic sur une flèche l'arrête
    C.next=()=>{ if(!document.hidden&&inView) C.show(C.cur+1); };
    if(!noMotion) C.auto=setInterval(C.next,13000);
    col.querySelectorAll('.car-arrow').forEach(b=>b.onclick=()=>{ clearInterval(C.auto); C.show(C.cur+ +b.dataset.d); });
    C.show(0); return C;
  });
  if('IntersectionObserver' in window&&document.getElementById('car')) new IntersectionObserver(es=>{ es.forEach(en=>{ inView=en.isIntersecting; }); },{threshold:.2}).observe(document.getElementById('car'));

  if(document.getElementById('models')){
  /* catalogue avec filtre par style */
  const models=document.getElementById('models'), filters=document.getElementById('filters');
  const DEMOS=window.SCEAU_DEMOS||[], OPN={env:'Enveloppe',cur:'Rideau',voile:'Voile',door:'Grandes portes'}, RVN={scratch:'Date à gratter',wheel:'Roue de la date',slot:'Jackpot'};
  // une carte par thème, avec ses deux formats : « scène par scène » (démo pages) et « grand tableau » (démo long)
  const card=(k)=>{ const t=THEMES[k], ds=DEMOS.find(x=>x.theme===k&&x.layout!=='long'&&!x.kind), dl=DEMOS.find(x=>x.theme===k&&x.layout==='long'&&!x.kind);
    const m=document.createElement('div'); m.className='model'; m.dataset.theme=k; m.dataset.style=t.style;
    m.innerHTML=`<a class="pic" href="/d/${esc((ds||dl).slug)}/" target="_blank" rel="noopener" aria-label="Ouvrir le faire-part ${esc(t.name)}"><img src="/img/themes/${k}-1.webp?v=8" alt="" loading="lazy"><img class="pic2" src="/img/themes/${k}-2.webp?v=8" alt="" loading="lazy" aria-hidden="true"><span class="cn" style="${esc(`font-family:${t.font};${t.italic?'font-style:italic;':''}${t.upper?'text-transform:uppercase;letter-spacing:.1em;font-size:19px;':''}`)}">${esc(t.couple)}</span></a><div class="meta"><div><h3>${esc(t.name)}</h3><p class="style">${esc(t.style+' · '+t.short)}</p></div>
      <div class="fmts">${ds?`<a href="/d/${esc(ds.slug)}/" target="_blank" rel="noopener"><b>Scène par scène</b><span>${esc(ds.couple)}</span></a>`:''}${dl?`<a href="/d/${esc(dl.slug)}/" target="_blank" rel="noopener"><b>Grand tableau</b><span>${esc(dl.couple)}</span></a>`:''}</div>
      <div class="acts"><a class="go" href="/creer/?theme=${esc(k)}">Composer →</a></div></div>`;
    models.appendChild(m); };
  KEYS.forEach(card);
  // faire-part d'un seul événement (« one shot ») : le henné, le sbouâ ; chacun avec sa démo et son lien vers le configurateur
  const one=document.getElementById('oneShots');
  if(one) one.innerHTML=[['henne','Henné','L’invitation à la soirée henné, seule ou en plus du mariage.'],['sbou3','Sbouâ','La naissance de votre enfant, fêtée au septième jour.']].map(([id,nm,tx])=>{ const d=DEMOS.find(x=>x.kind===id); if(!d) return ''; const t=THEMES[d.theme];
    return `<div class="model one"><a class="pic" href="/d/${esc(d.slug)}/" target="_blank" rel="noopener"><img src="/img/themes/${esc(d.theme)}-${id==='henne'?2:1}.webp?v=8" alt="" loading="lazy"><span class="cn" style="${esc(`font-family:${t.font};${t.italic?'font-style:italic;':''}`)}">${esc(d.couple)}</span></a>
      <div class="meta"><div><h3>${nm}</h3><p class="style">${esc(t.name)} · un seul événement</p><p>${tx}</p></div></div>
      <div class="fmts"><a href="/d/${esc(d.slug)}/" target="_blank" rel="noopener"><b>Voir l’exemple</b><span>${esc(d.couple)}</span></a></div>
      <div class="acts"><a class="go" href="/creer/?occasion=${id}&theme=${esc(d.theme)}">Composer →</a></div></div>`; }).join('');
  const STYLES=['Tous',...new Set(KEYS.map(k=>THEMES[k].style))];
  STYLES.forEach((st,i)=>{ const b=document.createElement('button'); b.type='button'; b.className='chip'; b.textContent=st; b.setAttribute('aria-pressed',i===0);
    b.onclick=()=>{ filters.querySelectorAll('.chip').forEach(c=>c.setAttribute('aria-pressed',c===b)); models.querySelectorAll('.model').forEach(m=>{ m.hidden=!(st==='Tous'||m.dataset.style===st); }); };
    filters.appendChild(b); });
  }

  if(document.getElementById('compForm')){
  /* composer : prenoms, date, style, palette, police -> apercu en direct */
  const PALS=[{id:'or',name:'Or & ivoire',c:'#b8975a'},{id:'sauge',name:'Sauge',c:'#7d9275'},{id:'terracotta',name:'Terracotta',c:'#c0643f'},{id:'nuit',name:'Bleu nuit',c:'#2e4a7d'},{id:'rose',name:'Rose poudré',c:'#d59aa3'},{id:'bordeaux',name:'Bordeaux',c:'#7a2e3b'},{id:'lavande',name:'Lavande',c:'#8a7fb5'},{id:'emeraude',name:'Émeraude',c:'#2f6b57'},{id:'ardoise',name:'Ardoise',c:'#4a5560'},{id:'champagne',name:'Champagne',c:'#cdb48a'}];
  const FONTS=[{id:'theme',name:'Du thème'},{id:'script',name:'Calligraphie',css:'"Great Vibes",cursive'},{id:'classique',name:'Classique',css:'"Playfair Display",Georgia,serif',italic:true},{id:'moderne',name:'Moderne',css:'"Jost",sans-serif',upper:true},{id:'deco',name:'Art déco',css:'"Limelight",serif'}];
  const urlPlan=new URLSearchParams(location.search).get('plan'), urlTheme=new URLSearchParams(location.search).get('theme');
  const urlFmt=new URLSearchParams(location.search).get('format'), urlOcc=new URLSearchParams(location.search).get('occasion');
  /* occasion : le mariage (tous ses événements) ou un faire-part d'un seul événement, « one shot » : l'invitation au henné,
     ou le sbouâ (la naissance, 7e jour). Un seul prénom possible : celui de l'enfant, ou de la mariée pour son henné. */
  const OCCS=[{id:'mariage',name:'Mariage',sub:'Tous vos événements, du henné à la fête'},{id:'henne',name:'Henné',sub:'Une invitation pour la soirée henné'},{id:'sbou3',name:'Sbouâ',sub:'La naissance de votre enfant'}];
  const OCC={
    mariage:{n:['Emma','Louis'],l:['Premier prénom','Second prénom'],ph:['',''],label:'Vos prénoms',ev:()=>[{name:'La cérémonie',time:'15:00',place:'Mairie du 11e',bg:'scene',lieu:'mairie'},{name:'La fête',time:'19:30',place:'Domaine des Roses',bg:'scene',lieu:'salle'}]},
    henne:{n:['Yasmine',''],l:['Prénom de la mariée','Prénom du marié (facultatif)'],ph:['Yasmine','Le marié (facultatif)'],label:'Le henné de',ev:()=>[{name:'Le henné',time:'19:30',place:'Chez la famille Alaoui',bg:'scene',lieu:'s2'}]},
    sbou3:{n:['Lina','Yasmine & Karim'],l:['Prénom de l’enfant','Les parents'],ph:['Prénom de l’enfant','Les parents (ex. Yasmine & Karim)'],label:'Le sbouâ de',ev:()=>[{name:'Le sbouâ',time:'15:00',place:'À la maison',bg:'simple',lieu:'salle'}]}};
  const nm1=()=>($('cN1').value.trim()||OCC[C.occ].n[0]), nm2=()=>(C.occ==='henne'?$('cN2').value.trim():($('cN2').value.trim()||OCC[C.occ].n[1]));
  const isSolo=()=>C.occ==='sbou3'||!nm2();
  const whoTxt=()=>C.occ==='sbou3'?`${nm1()} · parents ${nm2()}`:isSolo()?nm1():`${nm1()} & ${nm2()}`;
  const introTxt=()=>C.occ==='henne'?(isSolo()?'A la joie de vous convier à sa soirée henné':'Ont la joie de vous convier à leur soirée henné'):C.occ==='sbou3'?`${nm2()} vous convient au sbouâ de leur ${C.sexe==='fils'?'fils':'fille'}`:'Ont la joie de vous convier à leur mariage';
  /* au lancement, le configurateur se concentre sur Mille et une nuits et ses variantes (family:'nuits' dans themes.js),
     pour la communauté arabe et musulmane ; les autres thèmes restent dans la galerie et le code */
  const CK=Object.keys(THEMES).filter(k=>THEMES[k].family==='nuits'&&!THEMES[k].pending);
  const C={occ:OCC[urlOcc]?urlOcc:'mariage',sexe:'fille',k:CK.includes(urlTheme)?urlTheme:'nuits',fmt:urlFmt==='long'?'long':'scenes',pal:'t0',font:'theme',op:'env',cd:'fin',rvl:'non',x:new Set(),plan:PLANS[urlPlan]?urlPlan:'essentiel',
    ev:null}; C.ev=OCC[C.occ].ev();
  // les lieux déjà dessinés dans chaque thème (/img/lieux/<thème>-<lieu>.webp) ; « fond » = le décor des écrans simples
  const LIEUX=[{id:'s2',name:'Le henné',occ:'henne'},{id:'mairie',name:'Mairie'},{id:'mosquee',name:'Mosquée'},{id:'salle',name:'Salle'},{id:'jardin',name:'Jardin'},{id:'plage',name:'Plage'},{id:'photo',name:'Votre lieu',sig:true}];
  /* upsell sans frustration : les options de Signature (lieu peint d'après photo, 3e événement et plus, lien par famille,
     anglais) sont proposées au même endroit que les autres, avec l'étiquette « Signature ». On peut les choisir en Essentiel :
     la formule se met d'elle-même sur Signature et le récapitulatif explique pourquoi ; si l'on revient à Essentiel, il dit
     simplement ce qui n'y est pas compris. Jamais de case grisée ni de refus. */
  const sigNeeds=()=>{ const n=[]; if(C.ev.some(e=>e.bg==='scene'&&e.lieu==='photo')) n.push('votre lieu peint d’après photo');
    if(C.ev.length>2) n.push(`${C.ev.length} événements (2 en Essentiel)`); if(C.x.has('famille')) n.push('un lien par famille'); if(C.x.has('en')) n.push('la version anglaise'); return n; };
  const EXTRAS=[{id:'parents',name:'Le mot des familles'},{id:'story',name:'Notre histoire'},{id:'program',name:'Le programme'},{id:'dress',name:'Dress code'},{id:'stay',name:'Bon à savoir'},{id:'faq',name:'Vos questions'},{id:'gifts',name:'Liste de mariage'},{id:'photos',name:'Partage des photos'},{id:'table',name:'Votre table (par famille)'},{id:'famille',name:'Un lien par famille',sig:true},{id:'en',name:'Version anglaise',sig:true}];
  const LG_EXTRAS=['famille','en'];
  // options retenues pour le format choisi (une option propre à l'autre format reste en mémoire, sans compter)
  const LG_PARTS=[{id:'parents',name:'Le mot des familles'},{id:'story',name:'Notre histoire'},{id:'album',name:'Bande de photos'},{id:'dress',name:'Dress code'},{id:'stay',name:'Bon à savoir'},{id:'gifts',name:'Liste de mariage'}];
  const xOn=()=>(C.fmt==='long'?[...LG_PARTS,...EXTRAS.filter(x=>LG_EXTRAS.includes(x.id))]:EXTRAS).filter(x=>C.x.has(x.id));
  const COUNTS=[{id:'debut',name:'Au début',sub:'Sous la date'},{id:'page',name:'Page dédiée',sub:'Une page à part'},{id:'fin',name:'À la fin',sub:'Avec « Serez-vous des nôtres ? »'},{id:'non',name:'Aucun',sub:'Pas de compte à rebours'}];
  const REVEALS=[{id:'non',name:'Aucune',sub:'La date s\'affiche'},{id:'scratch',name:'À gratter',sub:'Comme un ticket'},{id:'wheel',name:'La roue',sub:'Elle s\'arrête sur la date'},{id:'slot',name:'Jackpot',sub:'Jour, mois, année'}];
  const OPENS=[{id:'env',name:'Enveloppe',sub:'Le sceau se brise'},{id:'cur',name:'Rideau',sub:'Il se lève sur la scène'},{id:'voile',name:'Voile',sub:'Il s\'ouvre par le milieu'},{id:'door',name:'Grandes portes',sub:'Elles s\'ouvrent sur la lumière'}];
  // thèmes qui ont leurs portiers (/img/open/<thème>-portier.webp) : ils apparaîtraient devant les grandes portes.
  // Vide pour l'instant : l'utilisateur les a trouvés « pas ouf », ils sont retirés (images conservées).
  const DOORMEN=[];
  const $=id=>document.getElementById(id);
  function shade(hex,f){ const n=parseInt(hex.slice(1),16); const ch=s=>Math.max(0,Math.min(255,Math.round(((n>>s)&255)*f))); return `rgb(${ch(16)},${ch(8)},${ch(0)})`; }
  function opt(box,items,key,label,draw){ items.forEach(it=>{ const b=document.createElement('button'); b.type='button'; b.dataset.id=it.id||it; draw(b,it); b.onclick=()=>{ C[key]=b.dataset.id; if(key==='k') C.font='theme'; paint(); }; box.appendChild(b); }); }
  opt($('cOpen'),OPENS,'op','',(b,o)=>{ b.className='op-card'; b.innerHTML=`<b>${o.name}</b><small>${o.sub}</small>`; });
  opt($('cReveal'),REVEALS,'rvl','',(b,o)=>{ b.className='op-card'; b.innerHTML=`<b>${o.name}</b><small>${o.sub}</small>`; });
  $('cReveal').addEventListener('click',e=>{ if(e.target.closest('button')) $('cpScroll').scrollTo({top:0,behavior:'smooth'}); });
  opt($('cStyles'),CK,'k','',(b,k)=>{ const t=THEMES[k]; b.className='th'; b.innerHTML=`<span style="background-image:url('/img/themes/${k}-1.webp?v=8')"></span>${esc(t.name)}${t.variant?`<small>${esc(t.variant)}</small>`:''}`; });
  // les deux formats, annoncés dès le début : scène par scène (un événement par écran) ou grand tableau (un seul tableau qu'on descend)
  const FMTS=[{id:'scenes',name:'Scène par scène',sub:'Un événement par écran, vos lieux en plein écran'},{id:'long',name:'Grand tableau',sub:'Un seul tableau qu’on descend, vos lieux dans des cadres peints'}];
  // le format se choisit à l'étape des écrans : c'est là qu'on décide quoi mettre. Visuels entiers, jamais rognés :
  // trois écrans 9:16 pour le scène par scène, un rouleau qui file vers le bas pour le grand tableau
  opt($('cFmt'),FMTS,'fmt','',(b,o)=>{ b.className='fmtc'; b.innerHTML=`<span class="fv"></span><b>${o.name}</b><small>${o.sub}</small>`; });
  const PLANSUB={essentiel:'2 événements, lieux de notre bibliothèque',signature:'+ votre lieu peint d’après photo, un lien par famille',couture:'tout sur mesure, on vous écrit'};
  opt($('cPlan'),Object.keys(PLANS),'plan','',(b,id)=>{ b.className='op-card'; b.innerHTML=`<b>${PLANS[id].name} · ${PLANS[id].price}</b><small>${PLANSUB[id]}</small>`; });
  $('cPlan').addEventListener('click',e=>{ if(e.target.closest('button')) C.planPicked=true; },true); // avant le clic du bouton (capture) : un choix de la main de l'utilisateur n'est plus changé
  /* couleurs : celles du thème d'abord (pals dans themes.js, choisies par défaut), puis les dix couleurs communes.
     Elles colorent les boutons de l'aperçu, le sceau, la date à gratter, la roue et le jackpot. */
  const palsOf=k=>[...(THEMES[k].pals||[]).map((x,i)=>Object.assign({id:'t'+i,theme:true},x)),...PALS];
  let palK='';
  function buildPal(){ if(palK===C.k) return; palK=C.k; const box=$('cPal'); box.innerHTML='';
    palsOf(C.k).forEach((x,i,a)=>{ const b=document.createElement('button'); b.type='button'; b.dataset.id=x.id; b.className='sw'+(x.theme&&!(a[i+1]||{}).theme?' th-end':'');
      b.style.background=x.c; b.setAttribute('aria-label',x.name+(x.theme?' (couleur du thème)':'')); b.onclick=()=>{ C.pal=x.id; C.palPicked=true; paint(); }; box.appendChild(b); });
    if(!palsOf(C.k).some(x=>x.id===C.pal)) C.pal=palsOf(C.k)[0].id; }
  opt($('cFonts'),FONTS,'font','',(b,f)=>{ b.className='fo'; b.innerHTML=`<b>Aa</b><small>${f.name}</small>`; });
  opt($('cCount'),COUNTS,'cd','',(b,o)=>{ b.className='op-card'; b.innerHTML=`<b>${o.name}</b><small>${o.sub}</small>`; });
  // écrans en option : plusieurs à la fois ; l'aperçu fait défiler jusqu'à l'écran ajouté
  EXTRAS.forEach(x=>{ const b=document.createElement('button'); b.type='button'; b.className='chip x'+(x.sig?' sig':''); b.dataset.id=x.id; b.innerHTML=esc(x.name)+(x.sig?'<i>Signature</i>':'');
    b.onclick=()=>{ const on=!C.x.has(x.id); on?C.x.add(x.id):C.x.delete(x.id); paint(); if(on){ const el=$('cpScroll').querySelector(`[data-x="${x.id}"]`); if(el) $('cpScroll').scrollTo({top:el.offsetTop,behavior:'smooth'}); } };
    $('cExtras').appendChild(b); });
  let resetEv=()=>{};
  // les écrans du faire-part, dans l'ordre (construits une fois : les champs gardent le focus)
  { const box=$('cStory'), li=(cls,h)=>{ const l=document.createElement('li'); l.className=cls; l.innerHTML=h; box.appendChild(l); return l; };
    li('fixed home','<b>Accueil</b><span>Vos prénoms, la date, le sceau</span>');
    /* grand tableau : ce n'est pas une suite d'écrans mais un seul tableau peint en trois parties ; l'étape montre ces
       parties dans l'ordre, avec ce qu'on peut y mettre (lg-only), et les événements dans leurs cadres peints */
    const part=(title,sub,ids)=>li('lg-only part',`<div class="ev-h"><b>${title}</b><small>${sub}</small></div><div class="opts">${ids.map(([id,n])=>`<button type="button" class="chip x" data-x="${id}">${n}</button>`).join('')}</div><div class="eds"></div>`);
    part('Sous l’illustration','l’invitation, puis vos événements',[['parents','Le mot des familles']]);
    const more=li('more','<button type="button" class="chip x sig" id="cAddEv">+ Ajouter un événement<i>Signature · jusqu’à 6</i></button>');
    const addEv=(e,i)=>{
      const l=li('ev',`<div class="ev-h"><b>Événement ${i+1}</b><small>${i<2?'inclus':'<i class="sig-tag">Signature</i>'}${i>=2?' · <a href="#" data-rm>Retirer</a>':''}</small></div>
        <div class="ev-f"><input type="text" data-k="name" maxlength="40" aria-label="Nom de l'événement ${i+1}" placeholder="La cérémonie"><input type="time" data-k="time" aria-label="Heure"><input type="text" data-k="place" maxlength="60" aria-label="Lieu" placeholder="Lieu (ex. Mairie du 11e)"></div>
        <div class="seg" role="group" aria-label="Fond de l'écran"><button type="button" data-bg="simple">Écran simple<small>Texte sur le fond</small></button><button type="button" data-bg="scene">Scène<small>Votre lieu dessiné</small></button></div>
        <div class="lieux" role="group" aria-label="Choisir le lieu">${LIEUX.map(x=>`<button type="button" data-lieu="${x.id}"${x.sig?' class="sig"':''}><span>${x.sig?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.2"/></svg>':''}</span>${x.name}${x.sig?'<small>d’après votre photo</small><i>Signature</i>':''}</button>`).join('')}</div>`);
      l.dataset.i=i;
      l.querySelectorAll('input').forEach(inp=>{ inp.value=e[inp.dataset.k]; inp.addEventListener('input',()=>{ e[inp.dataset.k]=inp.value; paint(); }); });
      l.querySelectorAll('[data-bg]').forEach(b=>b.onclick=()=>{ e.bg=b.dataset.bg; paint(); showEv(i); });
      l.querySelectorAll('[data-lieu]').forEach(b=>b.onclick=()=>{ e.lieu=b.dataset.lieu; e.bg='scene'; paint(); showEv(i); });
      const rm=l.querySelector('[data-rm]'); if(rm) rm.onclick=ev=>{ ev.preventDefault(); C.ev.splice(i,1); l.remove(); [...box.querySelectorAll('li.ev')].forEach((x,k)=>{ x.dataset.i=k; }); paint(); };
      box.insertBefore(l,more); return l; };
    C.ev.forEach(addEv);
    resetEv=()=>{ box.querySelectorAll('li.ev').forEach(l=>l.remove()); C.ev.forEach(addEv); };
    $('cAddEv').onclick=()=>{ if(C.ev.length>=6) return; const e={name:['','','La soirée','Le brunch','Le henné','La bénédiction'][C.ev.length]||'',time:'21:00',place:'',bg:'simple',lieu:'salle'}; C.ev.push(e); addEv(e,C.ev.length-1); paint(); showEv(C.ev.length-1); };
    part('Deuxième partie','facultatif',[['story','Notre histoire'],['album','Bande de photos'],['dress','Dress code']]);
    part('Troisième partie','facultatif',[['stay','Bon à savoir'],['gifts','Liste de mariage']]);
    li('fixed rsvp','<b>Réponse</b><span>« Serez-vous des nôtres ? »</span>');
    box.querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>{ const id=b.dataset.x; C.x.has(id)?C.x.delete(id):C.x.add(id); paint(); }); }
  // choix de l'occasion : prénoms, événements et textes par défaut de l'occasion (les prénoms tapés à la main restent)
  opt($('cOcc'),OCCS,'occ','',(b,o)=>{ b.className='op-card'; b.innerHTML=`<b>${o.name}</b><small>${o.sub}</small>`; });
  $('cOcc').addEventListener('click',e=>{ if(!e.target.closest('button')) return;
    const all=Object.values(OCC).flatMap(o=>o.n);
    [$('cN1'),$('cN2')].forEach((inp,i)=>{ if(!inp.value.trim()||all.includes(inp.value.trim())) inp.value=OCC[C.occ].n[i]; });
    C.ev=OCC[C.occ].ev(); resetEv(); occDefaults(); paint(); });
  if(C.occ!=='mariage'){ $('cN1').value=OCC[C.occ].n[0]; $('cN2').value=OCC[C.occ].n[1]; }
  opt($('cSexe'),[{id:'fille',name:'Une fille'},{id:'fils',name:'Un garçon'}],'sexe','',(b,o)=>{ b.className='chip'; b.textContent=o.name; });
  /* contenu des parties (grand tableau) et des écrans en plus (scène par scène) : chacun se règle dès qu'on le coche,
     au même endroit ; l'aperçu le montre tel quel et la demande l'emporte. La liste suit l'occasion (mariage, henné, sbouâ). */
  const giftName=()=>({henne:'Cagnotte',sbou3:'Liste de naissance'})[C.occ]||'Liste de mariage';
  const DEF={
    parents:{mariage:'ont la joie de vous convier au mariage de leurs enfants',henne:'vous attendent pour la soirée henné de leur fille',sbou3:'ont la joie de vous présenter leur petit-enfant'},
    gifts:{mariage:'Votre présence suffit. Pour ceux qui le souhaitent, une cagnotte pour notre voyage.',henne:'Votre présence suffit. Pour ceux qui le souhaitent, une petite cagnotte pour la mariée.',sbou3:'Votre présence suffit. Pour ceux qui le souhaitent, une liste de naissance.'}};
  C.data={
    parents:{n1:'Famille Alaoui',n2:'Famille Haddad',text:DEF.parents[C.occ]},
    story:[{when:'2018',title:'La rencontre',text:'Un mariage de cousins, deux places voisines.'},{when:'2022',title:'Paris',text:'Un premier appartement, le thé du dimanche.'},{when:'2026',title:'La demande',text:'Sur une terrasse, au coucher du soleil.'}],
    dress:{title:'Tenue de fête',text:'Caftans, takchitas et djellabas bienvenus.',colors:['#0f5e4c','#d4af37','#f2e6d0','#7a1f3d']},
    stay:[{icon:'hotel',title:'Dormir',text:'Chambres réservées à 5 min.'},{icon:'car',title:'Navettes',text:'Depuis la gare à 14h15.'}],
    gifts:{text:DEF.gifts[C.occ],url:''}};
  // l'occasion change : les phrases encore « par défaut » suivent ; ce que l'utilisateur a écrit reste
  const occDefaults=()=>{ [['parents','text'],['gifts','text']].forEach(([k,f])=>{ if(Object.values(DEF[k]).includes(C.data[k][f])) C.data[k][f]=DEF[k][C.occ]; }); };
  const famEy=()=>({henne:'Avec ses parents',sbou3:'Avec ses grands-parents'})[C.occ]||'Avec leurs familles';
  const ICONS=[['hotel','Dormir'],['car','Venir'],['kids','Enfants'],['dress','Tenue'],['gift','Cadeau'],['info','Autre']];
  const fldE=(lab,h)=>`<label class="ed-f"><span>${lab}</span>${h}</label>`;
  const inpE=(pa,ph,max)=>`<input type="text" data-p="${pa}" maxlength="${max||80}" placeholder="${esc(ph||'')}">`;
  const areaE=pa=>`<textarea data-p="${pa}" rows="2" maxlength="240"></textarea>`;
  const ED={
    parents:()=>`<div class="ed-row">${fldE('Première famille',inpE('parents.n1','Famille Alaoui',40))}${fldE('Seconde famille (facultatif)',inpE('parents.n2','Famille Haddad',40))}</div>${fldE('Leur phrase',areaE('parents.text'))}`,
    story:()=>C.data.story.map((x,i)=>`<div class="ed-row s">${fldE('Année',inpE(`story.${i}.when`,'2018',12))}${fldE('Moment',inpE(`story.${i}.title`,'La rencontre',40))}${fldE('En une phrase',inpE(`story.${i}.text`,'',120))}${C.data.story.length>1?`<button type="button" class="ed-x" data-rm="story.${i}" aria-label="Retirer ce moment">×</button>`:''}</div>`).join('')+(C.data.story.length<5?'<button type="button" class="ed-add" data-add="story">+ Un moment</button>':''),
    album:()=>`<p class="ed-n">Vous nous envoyez 4 à 8 photos après la commande. L'aperçu montre des photos d'exemple.</p>`,
    dress:()=>`${fldE('Titre',inpE('dress.title','Tenue de fête',40))}${fldE('Consigne',areaE('dress.text'))}<div class="ed-f"><span>Couleurs suggérées</span><div class="ed-cols">${C.data.dress.colors.map((c,i)=>`<input type="color" data-p="dress.colors.${i}" aria-label="Couleur ${i+1}">`).join('')}</div></div>`,
    stay:()=>C.data.stay.map((x,i)=>`<div class="ed-row s">${fldE('Icône',`<select data-p="stay.${i}.icon">${ICONS.map(([k,n])=>`<option value="${k}">${n}</option>`).join('')}</select>`)}${fldE('Titre',inpE(`stay.${i}.title`,'Dormir',30))}${fldE('Texte',inpE(`stay.${i}.text`,'',140))}${C.data.stay.length>1?`<button type="button" class="ed-x" data-rm="stay.${i}" aria-label="Retirer cette info">×</button>`:''}</div>`).join('')+(C.data.stay.length<4?'<button type="button" class="ed-add" data-add="stay">+ Une info</button>':''),
    gifts:()=>`${fldE('Votre phrase',areaE('gifts.text'))}${fldE('Lien de la cagnotte ou de la liste (facultatif)','<input type="url" data-p="gifts.url" maxlength="200" placeholder="https://…">')}`};
  const getP=pa=>pa.split('.').reduce((o,k)=>o==null?o:o[k],C.data);
  const setP=(pa,v)=>{ const ks=pa.split('.'), last=ks.pop(); ks.reduce((o,k)=>o[k],C.data)[last]=v; };
  const edTitle=id=>id==='gifts'?giftName():((LG_PARTS.find(x=>x.id===id)||EXTRAS.find(x=>x.id===id)||{}).name||'');
  // un cadre ne se reconstruit que si ses parties changent (les champs gardent le focus pendant la frappe)
  function edBox(host,ids){ if(!host) return; const key=ids.join(',')+'|'+C.occ+'|'+C.data.story.length+'|'+C.data.stay.length; if(host.dataset.key===key) return; host.dataset.key=key;
    host.innerHTML=ids.map(id=>`<div class="ed" data-ed="${id}"><b class="ed-t">${esc(edTitle(id))}</b>${ED[id]()}</div>`).join('');
    host.querySelectorAll('[data-p]').forEach(el=>{ const v=getP(el.dataset.p); el.value=v==null?'':v; el.addEventListener('input',()=>{ setP(el.dataset.p,el.value); paint(); }); });
    host.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{ const k=b.dataset.add; C.data[k].push(k==='story'?{when:'',title:'',text:''}:{icon:'info',title:'',text:''}); paint(); });
    host.querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{ const [k,i]=b.dataset.rm.split('.'); C.data[k].splice(+i,1); paint(); }); }
  function paintEd(long){
    $('cStory').querySelectorAll('li.part').forEach(l=>edBox(l.querySelector('.eds'),long?[...l.querySelectorAll('[data-x]')].map(b=>b.dataset.x).filter(id=>C.x.has(id)&&ED[id]&&!(id==='story'&&C.occ==='sbou3')):[]));
    edBox($('cExtrasEd'),long?[]:EXTRAS.map(x=>x.id).filter(id=>C.x.has(id)&&ED[id]&&!(id==='story'&&C.occ==='sbou3')));
    // la liste prend le nom de l'occasion ; « Notre histoire » n'a pas de sens pour un sbouâ
    document.querySelectorAll('#cStory [data-x="gifts"],#cExtras [data-id="gifts"]').forEach(b=>b.textContent=giftName());
    const st=$('cStory').querySelector('[data-x="story"]'); if(st) st.hidden=C.occ==='sbou3';
  }
  const edText=()=>{ const d=C.data, on=id=>C.x.has(id), o=[];
    if(on('parents')) o.push(`familles : ${[d.parents.n1,d.parents.n2].filter(Boolean).join(' & ')} « ${d.parents.text} »`);
    if(on('story')&&C.occ!=='sbou3') o.push('histoire : '+d.story.map(x=>[x.when,x.title,x.text].filter(Boolean).join(' ')).join(' / '));
    if(on('dress')) o.push(`dress code : ${d.dress.title}, ${d.dress.text} (${d.dress.colors.join(' ')})`);
    if(on('stay')) o.push('bon à savoir : '+d.stay.map(x=>`${x.title} ${x.text}`).join(' / '));
    if(on('gifts')) o.push(`${giftName().toLowerCase()} : ${d.gifts.text}${d.gifts.url?' '+d.gifts.url:''}`);
    return o.join(' ; '); };
  // l'aperçu descend jusqu'à l'écran modifié
  function showEv(i){ const el=$('cpScroll').querySelector(`[data-ev="${i}"]`); if(el) $('cpScroll').scrollTo({top:el.offsetTop,behavior:'smooth'}); }
  const hm=v=>{ const m=/^(\d{1,2}):(\d{2})/.exec(v||''); return m?`${+m[1]}h${m[2]}`:''; };
  const cdHtml=(big,col,extra)=>`<div class="cd${big?' big':''}" style="color:${col};${extra||''}"><div><b data-u="d">0</b><span>jours</span></div><div><b data-u="h">0</b><span>heures</span></div><div><b data-u="m">0</b><span>min</span></div><div><b data-u="s">0</b><span>sec</span></div></div>`;
  function weddingDate(){ const v=$('cDate').value; const d=v?new Date(v+'T15:00:00'):null; return d&&!isNaN(d)?d:new Date('2027-06-12T15:00:00'); }
  function tick(){
    const ms=Math.max(0,weddingDate()-Date.now()), v={d:Math.floor(ms/864e5),h:Math.floor(ms/36e5)%24,m:Math.floor(ms/6e4)%60,s:Math.floor(ms/1e3)%60};
    $('cpScroll').querySelectorAll('.cd b').forEach(b=>{ b.textContent=String(v[b.dataset.u]).padStart(b.dataset.u==='d'?1:2,'0'); });
  }
  setInterval(tick,1000);
  /* fond continu de l'aperçu, comme le moteur (invite.js, layoutStrip() et frame()) : une bande de décors qui défile avec
     les pages, deux scènes voisines se chevauchent et se fondent par un masque en dégradé (30 % d'un écran) ;
     les textes glissent avec la page et ne s'estompent que près du bord. Rien ne saute, on ne « change pas de page ». */
  let cpRuns=[];
  function cpLayout(){
    const sc=$('cpScroll'), h=sc.clientHeight, bgs=$('cpBgs'); if(!h||!bgs) return; const ov=Math.round(h*.45), secs=[...sc.querySelectorAll('.pv-sc')], layers=[...bgs.children];
    bgs.style.height=sc.scrollHeight+'px';
    cpRuns.forEach((r,ri)=>{ const L=layers[ri]; if(!L) return; const B=L.firstElementChild, top=secs[r.a].offsetTop, bot=secs[r.b].offsetTop+secs[r.b].offsetHeight;
      const t=ri>0?top-ov:top; L.style.top=t+'px'; L.style.height=(bot-t)+'px'; B.style.height=(ri>0?h+ov:h)+'px'; B.style.top=(ri>0?-ov:0)+'px';
      // calque : le cadre déborde d'un quart d'écran sur la suite et ce débord est fondu (comme layoutStrip() du moteur) :
      // le sol du sujet s'efface en remontant au lieu de tracer une ligne droite
      if(L.classList.contains('cal')){ B.style.webkitMaskImage=B.style.maskImage='';
        const ext=ri<cpRuns.length-1?Math.round(h*.25):0, m=ext?`linear-gradient(to bottom,#000 calc(100% - ${ext}px),transparent)`:'';
        L.style.height=(bot-t+ext)+'px'; L.style.webkitMaskImage=L.style.maskImage=m; return; }
      const m=ri>0?`linear-gradient(to bottom,transparent 0,#000 ${ov}px)`:''; B.style.webkitMaskImage=m; B.style.maskImage=m;
      // taille de l'écran, pas du cadre agrandi (sinon zoom ~1,8×) : même calcul que fitBg() dans invite.js
      const bw=Math.ceil(Math.max(sc.clientWidth,h*.566)), y=Math.round((ri>0?ov:0)+(h-bw/.566)/2);
      B.style.backgroundSize=bw+'px auto'; B.style.backgroundPosition=`center ${y}px`; B.style.setProperty('--bs',`${bw}px ${Math.round(Math.max(1,y)/.015)}px`); B.style.setProperty('--strip',Math.max(0,y)+'px'); });
  }
  addEventListener('resize',cpLayout); addEventListener('load',cpLayout);
  // défilement libre, sans calage ni fondu des textes : comme le vrai faire-part (invite.js)
  function paint(){
    buildPal();
    const t=THEMES[C.k], p=palsOf(C.k).find(x=>x.id===C.pal)||palsOf(C.k)[0], f=FONTS.find(x=>x.id===C.font);
    $('cExtras').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',C.x.has(b.dataset.id)));
    [['cStyles','k'],['cFmt','fmt'],['cOpen','op'],['cPal','pal'],['cCount','cd'],['cReveal','rvl']].forEach(([id,key])=>$(id).querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.id===C[key])));
    $('cFonts').querySelectorAll('button').forEach(b=>{ b.setAttribute('aria-pressed',b.dataset.id===C.font); const ff=FONTS.find(x=>x.id===b.dataset.id); b.querySelector('b').style.fontFamily=ff.css||t.font; b.querySelector('b').style.fontStyle=(ff.id==='theme'?t.italic:ff.italic)?'italic':'normal'; });
    $('cPalName').textContent=p.name;
    const needs=sigNeeds(); if(needs.length&&C.plan==='essentiel'&&!C.planPicked) C.plan='signature';
    $('cPlan').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.id===C.plan));
    { const sel=document.getElementById('planSel'); if(sel) sel.value=C.plan; const P=PLANS[C.plan];
      ['cGo','cpGo'].forEach(id=>{ const a=$(id); if(!a) return; a.dataset.plan=C.plan; a.href='/contact/?plan='+C.plan+'&theme='+C.k+'&format='+C.fmt+'&occasion='+C.occ+'&names='+encodeURIComponent(whoTxt())+'&date='+encodeURIComponent($('cDate').value||''); a.textContent=C.plan==='couture'?'Nous écrire · Couture':`Commander · ${P.name} ${P.price}`; }); }
    { const long=C.fmt==='long';
      $('wz2Title').textContent=long?'Votre tableau':'Vos écrans';
      $('wz2Sub').textContent=long?'Un seul tableau peint qu’on descend, en trois parties. Chaque événement a son cadre : la scène peinte du thème, un lieu de notre bibliothèque, ou votre lieu d’après photo.':'Pour chaque événement : un écran simple (votre texte sur le fond du tableau), ou une scène de votre lieu, dessinée dans le thème.';
      document.querySelectorAll('#cStory [data-bg="simple"]').forEach(b=>b.innerHTML=long?'La scène du thème<small>Peinte dans le cadre</small>':'Écran simple<small>Texte sur le fond</small>');
      $('wzNav3').textContent=long?'Tableau':'Écrans';
      $('cStory').classList.toggle('long',long);
      $('cStory').querySelector('.home').innerHTML=long?'<b>L’illustration d’ouverture</b><span>Vos prénoms et la date, en haut du tableau</span>':'<b>Accueil</b><span>Vos prénoms, la date, le sceau</span>';
      $('cStory').querySelector('.rsvp').innerHTML=long?'<b>Réponse</b><span>« Serez-vous des nôtres ? » et le compte à rebours</span>':'<b>Réponse</b><span>« Serez-vous des nôtres ? »</span>';
      $('cStory').querySelectorAll('li.ev .ev-h b').forEach((b,i)=>{ b.textContent=long?`Événement ${i+1} · son cadre`:`Événement ${i+1}`; });
      $('cStory').querySelectorAll('[data-x]').forEach(b=>b.setAttribute('aria-pressed',C.x.has(b.dataset.x)));
      paintEd(long);
      // les options qui sont des écrans de la suite scène par scène n'existent pas dans le tableau (elles y sont des parties, ci-dessus)
      $('cExtras').querySelectorAll('button').forEach(b=>{ b.hidden=long&&!LG_EXTRAS.includes(b.dataset.id); });
      $('cExtrasT').firstChild.textContent=long?'Options ':'Écrans en plus ';
      // compte à rebours : pas de page dédiée dans le tableau (il est en haut ou à la fin) ; pas de révélation de la date
      if(long&&C.cd==='page'){ C.cd='fin'; $('cCount').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.id===C.cd)); }
      $('cCount').querySelector('[data-id="page"]').hidden=long;
      $('fldReveal').hidden=long;
      document.querySelectorAll('#cStory [data-bg="scene"]').forEach(b=>b.innerHTML=long?'Un lieu<small>Dans le cadre</small>':'Scène<small>Votre lieu dessiné</small>'); }
    $('cFmt').querySelectorAll('button').forEach(b=>{ const v=b.firstChild, key=b.dataset.id+C.k; if(v.dataset.k===key) return; v.dataset.k=key;
      v.innerHTML=b.dataset.id==='long'?`<i class="roll" style="background-image:url('/img/long/${C.k}/thumb.webp')"></i>`:[1,2,4].map(n=>`<i style="background-image:url('/img/themes/${C.k}-${n}.webp?v=8')"></i>`).join(''); });
    $('cStoryT').textContent=C.fmt==='long'?'Le tableau, de haut en bas':'Vos écrans, dans l’ordre';
    $('cStory').querySelectorAll('li.ev').forEach(l=>{ const e=C.ev[+l.dataset.i];
      l.querySelectorAll('[data-bg]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.bg===e.bg));
      l.querySelector('.lieux').hidden=e.bg!=='scene';
      l.querySelectorAll('[data-lieu]').forEach(b=>{ b.setAttribute('aria-pressed',b.dataset.lieu===e.lieu); b.firstChild.style.backgroundImage=b.dataset.lieu==='s2'?`url('/img/themes/${C.k}-2.webp?v=8')`:`url('/img/lieux/${C.k}-${b.dataset.lieu==='photo'?'mairie':b.dataset.lieu}.webp')`; }); });
    $('cAddEv').hidden=C.ev.length>=6||C.occ!=='mariage';
    $('cpTint').style.background=p.c;
    const n1=nm1(), n2=nm2(), solo=isSolo(), oneShot=C.occ!=='mariage';
    const ini=(n1[0]||'').toUpperCase()+(solo?'':(n2[0]||'').toUpperCase());
    const iniH=solo?esc((n1[0]||'').toUpperCase()):`${esc((n1[0]||'').toUpperCase())}<i>&amp;</i>${esc((n2[0]||'').toUpperCase())}`;
    // occasion : libellés des prénoms, fille ou garçon pour le sbouâ, un seul événement pour un « one shot »
    $('cOcc').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.id===C.occ));
    $('cSexe').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.id===C.sexe));
    $('fldSexe').hidden=C.occ!=='sbou3'; $('cNamesL').textContent=OCC[C.occ].label;
    [$('cN1'),$('cN2')].forEach((inp,i)=>{ inp.setAttribute('aria-label',OCC[C.occ].l[i]); inp.placeholder=OCC[C.occ].ph[i]; });
    $('cNamesF').classList.toggle('sbou3',C.occ==='sbou3');
    $('cStory').querySelectorAll('[data-lieu]').forEach(b=>{ const L0=LIEUX.find(x=>x.id===b.dataset.lieu); b.hidden=!!(L0.occ&&L0.occ!==C.occ); });
    $('cExtras').querySelector('[data-id="story"]').hidden=C.occ==='sbou3'||C.fmt==='long';
    if($('fOcc')) $('fOcc').value=OCCS.find(o=>o.id===C.occ).name;
    const SEAL={or:['or','#fbe3a0','#c99a3a','#6e4a12'],sauge:['sauge','#e4ecd6','#8fa37f','#3f4d36'],terracotta:['terracotta','#f5b085','#c0643f','#4f1f0c'],nuit:['bleu','#9bb4e8','#2f4f94','#0c1a3d'],rose:['rose','#fff0f2','#d99aa6','#7a4250'],bordeaux:['terracotta','#e8a0a8','#7a2e3b','#3a1018'],lavande:['bleu','#d9d2f0','#8a7fb5','#3d3660'],emeraude:['sauge','#cfe7db','#2f6b57','#143427'],ardoise:['bleu','#c9d0d8','#4a5560','#1f262c'],champagne:['or','#f6ead2','#cdb48a','#6e5a35']}[p.seal||C.pal]||['or','#fbe3a0','#c99a3a','#6e4a12'];
    $('opSeal').style.backgroundImage=`url('/img/seals/${SEAL[0]}.webp')`;
    $('opSealTxt').innerHTML=iniH; $('opSealTxt').style.cssText=`--l:${SEAL[1]};--m:${SEAL[2]};--d:${SEAL[3]}`;
    $('opTap').textContent=C.op==='env'?'Touchez le sceau pour ouvrir':'Touchez pour ouvrir';
    { const o=$('cpOp'); o.style.setProperty('--door',`url('/img/open/${C.k}-portes.webp')`); o.style.setProperty('--cur',`url('/img/open/${C.k}-rideau.webp')`); o.style.setProperty('--pal',p.c); o.style.setProperty('--man',DOORMEN.includes(C.k)?`url('/img/open/${C.k}-portier.webp')`:'none');
      $('opMonoC').style.cssText=t.mono?`color:${t.mono[0]};text-shadow:${t.mono[1]}`:''; } $('opMonoC').textContent=$('opMonoV').textContent=solo?(n1[0]||'').toUpperCase():(n1[0]||'').toUpperCase()+' & '+(n2[0]||'').toUpperCase();
    const fam=f.css||t.font, it=f.id==='theme'?t.italic:f.italic, up=f.id==='theme'?t.upper:f.upper;
    const base=up?24:/Limelight|Cinzel/.test(fam)?30:40;
    const nmCss=(sz,col)=>`font-family:${fam};font-style:${it?'italic':'normal'};text-transform:${up?'uppercase':'none'};letter-spacing:${up?'.12em':'0'};font-weight:${up?300:400};font-size:${sz}px;color:${col}`;
    const d=weddingDate(), ds0=d.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'}), ds=ds0.charAt(0).toUpperCase()+ds0.slice(1);
    const names=solo?esc(n1):t.stack?`${esc(n1)}<br>&amp; ${esc(n2)}`:`${esc(n1)} &amp; ${esc(n2)}`;
    const page=(img,mode,inner,extra)=>{ const dk=mode==='dark', lt=t.light&&!dk;
      const c={nm:lt?t.color:'#fff',ey:lt?(t.ey||t.color):'#fff',tx:lt?(t.tx||t.color):'#fff'};
      // un numéro = scène du thème ; un nom = lieu de la bibliothèque, ou « fond » pour un écran simple
      // calque : le sujet détouré est posé entier au bas de l'écran sur le fond du thème (même rendu que le moteur)
      const hasCal=((window.SCEAU_CALQUES||{})[C.k]||[]).includes(String(img));
      const src=hasCal?`/img/lieux/${C.k}-fond.webp`:typeof img==='number'?`/img/themes/${C.k}-${img}.webp?v=8`:`/img/lieux/${C.k}-${img}.webp`;
      const sub=hasCal?`/img/calques/${C.k}-${img}.webp?v=8`:'';
      return {lt,c,html:h=>`<section class="pv-sc${lt?' light':''}" data-img="${esc(src)}" data-sub="${esc(sub)}" style="${esc(extra||'')}">${h(c)}</section>`}; };
    // boutons de l'aperçu : même pastille que le faire-part (invite.css .b), icône dans un médaillon à la couleur choisie
    const BT_IC={pin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',mail:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5.5" width="18" height="13" rx="1.5"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/></svg>',gift:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="9" width="16" height="11" rx="1"/><path d="M3 9h18M12 9v11M12 9c-2-4-6-4-6-1.5S10 9 12 9zm0 0c2-4 6-4 6-1.5S14 9 12 9z"/></svg>',cam:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>'};
    const btn=(c,label,icon)=>`<span class="bt" style="color:${c.tx};--pal:${p.c}">${BT_IC[icon]}${esc(label)}</span>`;
    const pages=[], rv=C.rvl!=='non'?C.rvl:null;
    // 1. prenoms + date (+ compte a rebours au debut)
    { const pg=page(1,'',null,t.top1?'padding-top:'+t.top1:'');
      const oval=!!t.top1;
      pages.push(pg.html(c=>`${oval?'':`<div class="cp-seal" style="${esc(`background-image:url('/img/seals/${SEAL[0]}.webp')`)}"><b style="${esc(`--l:${SEAL[1]};--m:${SEAL[2]};--d:${SEAL[3]}`)}">${iniH}</b></div>`}${eyHtml('ey',t.scenes[0][0],`color:${c.ey}`)}<div class="nm" style="${esc(nmCss(t.stack?base*.82:base,c.nm))}">${names}</div>${oval?'':`<div class="tx" style="color:${c.tx}">${esc(introTxt())}</div>`}${rv?`<div class="cp-rvl" style="width:100%;color:${c.tx}"></div>`:''}${!rv||rv==='wheel'?`<div class="cp-dl${rv?' rvl-later':''}" style="color:${pg.lt?p.c:'#fff'}"><i></i><span>${esc(ds)}</span><i></i></div>`:''}${C.cd==='debut'?`<div class="${rv?'rvl-later':''}">${cdHtml(false,c.tx,oval?'transform:scale(.8);margin-top:6px':'')}</div>`:''}<div class="pv-hint${rv?' rvl-later':''}" style="color:${c.ey}">Faites défiler ↓</div>`)); }
    const scene=(idx,withCd)=>{ let [e,main,x,bt,mode]=t.scenes[idx]; if(oneShot&&idx===3){ e='Réponse souhaitée'; main='Serez-vous des nôtres ?'; } const pg=page(idx+1,mode);
      return pg.html(c=>`<div class="ey" style="color:${c.ey}">${esc(e)}</div><div class="nm" style="${esc(nmCss(base*.72,c.nm))}">${esc(main)}</div><div class="tx" style="color:${c.tx}">${esc(x)}</div>${withCd?cdHtml(false,c.tx):''}${bt?btn(c,bt,/R[ée]pondre|RSVP/i.test(bt)?'mail':'pin'):''}`); };
    // événements : scène = le lieu choisi, écran simple = le fond du tableau (la bande continue les fond l'un dans l'autre)
    const evPage=i=>{ const e=C.ev[i], photo=e.bg==='scene'&&e.lieu==='photo', pg=page(e.bg==='scene'&&!photo?(e.lieu==='s2'?2:e.lieu):'fond','');
      return pg.html(c=>`<div class="ey" style="color:${c.ey}">${esc(e.name||'Événement '+(i+1))}</div><div class="nm" style="${esc(nmCss(base*.72,c.nm))}">${esc(e.place||'')}</div><div class="tx" style="color:${c.tx}">${esc(hm(e.time))}</div>${btn(c,'Itinéraire','pin')}${photo?`<div class="pv-photo" style="color:${c.tx};border-color:${c.tx}">Ici, votre lieu<br>peint d’après votre photo</div>`:''}`).replace('<section ',`<section data-ev="${i}" `); };
    // écrans en option (contenu d'exemple), sur le décor de la scène voisine, sans voile (comme le moteur)
    const xp=(id,img,mode,inner)=>{ if(!C.x.has(id)) return; const pg=page(img,mode);
      pages.push(pg.html(c=>inner(c,pg.lt)).replace('<section ',`<section data-x="${id}" `)); };
    const card=(c,lt,rows,one)=>`<div class="pv-card${one?' one':''}" style="color:${c.tx};background:${lt?'rgba(255,255,255,.5)':'rgba(0,0,0,.28)'}">${rows.map(r=>`<div>${r[0]?`<b>${r[0]}</b>`:''}<span>${r[1]}</span></div>`).join('')}</div>`;
    const hd=(c,ey,title)=>`<div class="ey" style="color:${c.ey};position:relative">${ey}</div>`+(title?`<div class="nm" style="${esc(nmCss(base*.62,c.nm))};position:relative">${title}</div>`:'');
    xp('parents',1,'',c=>hd(c,famEy(),'')+`<div class="pv-fam" style="color:${c.tx}">${[C.data.parents.n1,C.data.parents.n2].filter(Boolean).map(esc).join(' &amp; ')}</div><div class="tx" style="color:${c.tx};position:relative">${esc(C.data.parents.text)}</div><div class="nm" style="${esc(nmCss(base*.6,c.nm))};position:relative">${names}</div>`);
    xp('story',1,'',(c,lt)=>hd(c,'Notre histoire','Il était une fois')+card(c,lt,C.data.story.map(x=>[esc(x.when),esc([x.title,x.text].filter(Boolean).join(', '))])));
    pages.push(evPage(0));
    // page dediee au compte a rebours
    if(C.cd==='page'){ const pg=page('fond',''); pages.push(pg.html(c=>`<div class="ey" style="color:${c.ey};position:relative">Le grand jour approche</div><div class="nm" style="${esc(nmCss(base*.8,c.nm))};position:relative">Plus que</div><div style="position:relative">${cdHtml(true,c.tx)}</div><div class="cp-dl" style="color:${pg.lt?p.c:'#fff'};position:relative"><i></i><span>${esc(ds)}</span><i></i></div>`)); }
    C.ev.forEach((_,i)=>{ if(i) pages.push(evPage(i)); });
    xp('program','fond','',(c,lt)=>hd(c,'Le programme','Le grand jour')+card(c,lt,[['15h00','La cérémonie'],['17h00','Vin d’honneur'],['19h30','Le dîner'],['23h00','On danse']]));
    const m4=t.scenes[3][4];
    xp('dress',4,m4,c=>hd(c,'Dress code',esc(C.data.dress.title))+`<div class="pv-sws">${C.data.dress.colors.map(x=>`<i style="background:${esc(x)}"></i>`).join('')}</div><div class="tx" style="color:${c.tx};position:relative">${esc(C.data.dress.text)}</div>`);
    xp('stay',4,m4,(c,lt)=>hd(c,'Bon à savoir','')+card(c,lt,C.data.stay.map(x=>[esc(x.title),esc(x.text)])));
    xp('faq',4,m4,(c,lt)=>hd(c,'Vos questions','')+card(c,lt,[['','<b>Les enfants sont-ils invités ?</b><br>Oui, un espace jeux les attend.'],['','<b>Où se garer ?</b><br>Parking sur place.']],true));
    xp('gifts',4,m4,c=>hd(c,esc(giftName()),'')+`<div class="tx" style="color:${c.tx};position:relative">${esc(C.data.gifts.text)}</div>${btn(c,'Participer','gift')}`);
    xp('photos',4,m4,c=>hd(c,'Vos photos','')+`<div class="tx" style="color:${c.tx};position:relative">Partagez vos plus belles photos de la soirée dans notre album commun.</div>${btn(c,'Partager mes photos','cam')}`);
    xp('table',4,m4,c=>hd(c,'Le jour J','Votre table')+`<div class="tx" style="color:${c.tx};position:relative;font-size:26px;margin-top:6px">La table des Roses</div><div class="tx" style="color:${c.tx};position:relative;font-size:13px">Chaque famille voit sa table sur son lien personnel.</div>`);
    pages.push(scene(3,C.cd==='fin'));
    const sc=$('cpScroll'), st=sc.scrollTop; sc.innerHTML='<div class="cp-bgs" id="cpBgs" aria-hidden="true"></div>'+pages.join(''); sc.scrollTop=st; tick();
    // les prénoms de l'accueil tiennent sur une ligne dans le petit téléphone (comme sur un vrai téléphone, où ils tiennent) :
    // à 40 px, « Emma & Louis » passait sur deux lignes en Amiri et poussait la phrase sur le décor
    { const nm=sc.querySelector('.pv-sc .nm'); if(nm&&!t.stack){ nm.style.whiteSpace='nowrap'; let fs=parseFloat(nm.style.fontSize)||base, w=sc.clientWidth*.86; while(nm.scrollWidth>w&&fs>base*.62){ fs-=1; nm.style.fontSize=fs+'px'; } } }
    // décors : un cadre par suite de pages qui partagent la même image (comme les « runs » du moteur), image collante dedans
    cpRuns=[]; [...sc.querySelectorAll('.pv-sc')].forEach((s,i)=>{ const r=cpRuns[cpRuns.length-1]; if(r&&r.img===s.dataset.img&&r.sub===(s.dataset.sub||'')) r.b=i; else cpRuns.push({img:s.dataset.img,sub:s.dataset.sub||'',a:i,b:i}); });
    $('cpBgs').innerHTML=cpRuns.map(r=>r.sub?`<div class="cp-bg cal"><i><img class="sub" src="${esc(r.sub)}" alt=""></i></div>`:`<div class="cp-bg"><i style="background-image:url('${esc(r.img)}');--img:url('${esc(r.img)}')"></i></div>`).join('');
    // calques : le fond du thème est peint une fois derrière tout (comme .sc.cal dans invite.css)
    const anyCal=cpRuns.some(r=>r.sub); sc.classList.toggle('cal',anyCal); sc.style.backgroundImage=anyCal?`url('/img/lieux/${C.k}-fond.webp')`:'';
    cpLayout();
    // grand tableau : l'aperçu est le vrai faire-part (invite.js) construit avec vos choix, dans le téléphone
    sc.hidden=C.fmt==='long';
    if(C.fmt==='long') lgRender(lgInvite(t,p,f,n1,n2,ds)); else lgClear();
    { const h=sc.querySelector('.cp-rvl'); if(h&&window.SceauReveal) SceauReveal.mount(h,{kind:rv,date:d,pal:p.c,light:t.light&&t.scenes[0][4]!=='dark',scope:h.parentNode}); }
    $('fOpen').value=OPENS.find(o=>o.id===C.op).name; $('fCount').value=COUNTS.find(o=>o.id===C.cd).name; $('fReveal').value=C.fmt==='long'?'Aucune':REVEALS.find(o=>o.id===C.rvl).name; if($('fNames')) $('fNames').value=whoTxt(); $('fStyle').value=t.name; $('fPal').value=p.name; $('fFont').value=f.name; $('fScreens').value=xOn().map(x=>x.id==='gifts'?giftName():x.name).join(', ')+(edText()?' — '+edText():'');
    const evTxt=e=>e.bg==='scene'?LIEUX.find(x=>x.id===e.lieu).name:'écran simple';
    if($('fFormat')) $('fFormat').value=FMTS.find(f=>f.id===C.fmt).name;
    $('fEvents').value=C.ev.map((e,i)=>`${i+1}. ${e.name} ${hm(e.time)}, ${e.place} (${evTxt(e).toLowerCase()})`).join(' ; ');
    const needTxt=needs.length?(C.plan==='essentiel'?` Essentiel ne comprend pas ${needs.join(', ')} : vous pourrez les retirer, ou passer en Signature.`:` Avec ${needs.join(', ')}, c'est la formule Signature.`):(C.plan==='essentiel'?' Tout est compris dans Essentiel.':'');
    $('cRecap').textContent=needTxt.trim()||(C.plan==='signature'?'Votre lieu peint d’après photo, un lien par famille, français et anglais.':'');
    // récapitulatif, ligne par ligne
    const sum=[['Occasion',OCCS.find(o=>o.id===C.occ).name+(C.occ==='sbou3'?(C.sexe==='fils'?' · un garçon':' · une fille'):'')],['Thème',t.name],['Format',FMTS.find(f=>f.id===C.fmt).name],['Vous',`${whoTxt()} · ${ds}`],[C.fmt==='long'?'Tableau':'Écrans',`${C.fmt==='long'?'Illustration':'Accueil'} → ${C.ev.map((e,i)=>`${e.name||'Événement '+(i+1)}${e.place?' ('+e.place+')':''} · ${evTxt(e).toLowerCase()}`).join(' → ')} → Réponse`],['En plus',xOn().map(x=>x.name).join(', ')||'—'],['Ouverture',OPENS.find(o=>o.id===C.op).name+(C.rvl!=='non'&&C.fmt!=='long'?' · date '+REVEALS.find(o=>o.id===C.rvl).name.toLowerCase():'')]];
    $('cSum').innerHTML=sum.map(([k,v])=>`<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('');
    { const cs=$('cpSum'); if(cs) cs.innerHTML=`<b>${esc(t.name)}</b> · ${esc(FMTS.find(f=>f.id===C.fmt).name)}<br>${esc(whoTxt())} · ${esc(ds)}<br>${C.ev.map(e=>esc(evTxt(e))).join(' → ')}${xOn().length?` · +${xOn().length}`:''}<br>${esc(PLANS[C.plan].name)} · ${esc(PLANS[C.plan].price)}`; } if($('fDate')) $('fDate').value=$('cDate').value;
  }
  ['cN1','cN2','cDate'].forEach(id=>$(id).addEventListener('input',paint));
  /* aperçu du grand tableau : une fiche de faire-part (comme business/invites/*.json) faite des choix du configurateur,
     rendue par le moteur lui-même dans un cadre (srcdoc) : ce qu'on voit est exactement le faire-part. Deux cadres :
     le nouveau se prépare caché et remplace l'ancien à la même hauteur de défilement (pas de clignotement). */
  const lgMeta={};
  function lgInvite(t,p,f,n1,n2,ds){
    const day=$('cDate').value||'2027-06-12', dl=new Date(weddingDate().getTime()-30*864e5).toISOString().slice(0,10);
    return {slug:'apercu',demo:true,layout:'long',theme:C.k,couple:isSolo()?[n1]:[n1,n2],date:day+'T15:00',tz:'Europe/Paris',opening:'cur',music:'none',
      palette:p.c,font:f.id==='theme'?undefined:f.id,countdown:C.cd==='page'?'fin':C.cd,calques:[],anim:[],trans:[],families:{},album:C.x.has('album'),
      intro:{eyebrow:t.scenes[0][0],text:introTxt(),dateText:ds},
      parents:C.x.has('parents')?{eyebrow:famEy(),names:[C.data.parents.n1,C.data.parents.n2].filter(Boolean),text:C.data.parents.text}:null,
      eventsTitle:C.occ==='mariage'?undefined:'',
      events:C.ev.map((e,i)=>({id:'e'+i,eyebrow:e.name||'Événement '+(i+1),title:e.place||e.name||'',start:day+'T'+(e.time||'15:00'),address:e.place||'',lieu:e.bg==='scene'&&!['photo','s2'].includes(e.lieu)?e.lieu:(e.bg!=='scene'&&C.occ==='sbou3'?'fond':undefined),note:e.bg==='scene'&&e.lieu==='photo'?'Ici, votre lieu peint d’après votre photo':undefined})),
      story:C.x.has('story')&&C.occ!=='sbou3'?{title:'Notre histoire',items:C.data.story.filter(x=>x.when||x.title)}:null,
      dress:C.x.has('dress')?{eyebrow:'Dress code',title:C.data.dress.title,text:C.data.dress.text,colors:C.data.dress.colors}:null,
      infos:C.x.has('stay')?C.data.stay.filter(x=>x.title||x.text):[],
      gifts:C.x.has('gifts')?{eyebrow:giftName(),text:C.data.gifts.text,url:C.data.gifts.url||'#',label:'Participer'}:null,
      rsvp:{eyebrow:'Réponse souhaitée',title:'Serez-vous des nôtres ?',deadline:dl}};
  }
  let lgKey='', lgT=null;
  function lgClear(){ lgKey=''; clearTimeout(lgT); $('cpPhone').querySelectorAll('iframe.cp-lg').forEach(x=>x.remove()); }
  function lgRender(inv){
    const key=JSON.stringify(inv); if(key===lgKey) return; lgKey=key; clearTimeout(lgT);
    lgT=setTimeout(async()=>{
      const meta=await (lgMeta[inv.theme]||(lgMeta[inv.theme]=fetch(`/img/long/${inv.theme}/meta.json`).then(r=>r.ok?r.json():null).catch(()=>null)));
      if(key!==lgKey||!meta) return;
      inv.long=Object.assign({},meta,{photos:inv.album?meta.photos:[]});
      const ph=$('cpPhone'), olds=[...ph.querySelectorAll('iframe.cp-lg')], old=olds[olds.length-1];
      let y=0; try{ y=old.contentDocument.getElementById('sc').scrollTop; }catch(e){}
      const fr=document.createElement('iframe'); fr.className='cp-lg'; fr.title='Aperçu de votre faire-part'; fr.setAttribute('aria-label','Aperçu de votre faire-part'); fr.style.opacity=0;
      fr.srcdoc=`<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><base href="${location.origin}/"><link rel="stylesheet" href="/polices/polices.css"><link rel="stylesheet" href="/invite.css"><link rel="stylesheet" href="/reveal.css"><style>#op,#flash,.lg-want,.demo-tag,.snd{display:none!important}</style></head><body><script>window.INVITE=${JSON.stringify(inv).replace(/</g,'\\u003c')};<\/script><script src="/themes.js"><\/script><script src="/reveal.js"><\/script><script src="/invite.js"><\/script><script>document.getElementById('op').click();<\/script></body></html>`;
      fr.onload=()=>setTimeout(()=>{ if(key!==lgKey){ fr.remove(); return; } try{ fr.contentDocument.getElementById('sc').scrollTop=y; }catch(e){} fr.style.opacity=1; olds.forEach(x=>x.remove()); },450);
      ph.insertBefore(fr,$('cpTint'));
    },250);
  }
  // téléphone : l'aperçu réduit collé en haut s'agrandit en plein écran, et se referme
  { const pv=document.querySelector('.comp-prev'), big=$('cpBig'), cl=$('cpClose'), nav=$('wzNav'), side=$('cpMiniSteps'), home=nav.parentNode, mq=matchMedia('(max-width:720px)');
    const place=()=>{ if(mq.matches){ if(nav.parentNode!==side) side.appendChild(nav); } else if(nav.parentNode!==home) home.insertBefore(nav,home.firstChild); };
    place(); mq.addEventListener('change',place);
    const set=on=>{ pv.classList.toggle('big',on); document.body.style.overflow=on?'hidden':''; if(on) requestAnimationFrame(cpLayout); };
    if(big) big.onclick=()=>set(true); if(cl) cl.onclick=()=>set(false);
    addEventListener('keydown',e=>{ if(e.key==='Escape'&&pv.classList.contains('big')) set(false); }); }
  /* étapes : une seule à l'écran (thème, écrans, détails, formule), l'aperçu reste à côté. L'utilisateur trouvait la page
     unique « trop complexe ». Tout reste dans la page (seulement masqué) : paint() continue de tout tenir à jour. */
  { const steps=[...document.querySelectorAll('.wz')], tabs=[...document.querySelectorAll('#wzNav button')], prev=$('wzPrev'), next=$('wzNext');
    let cur=1;
    const go=n=>{ cur=Math.max(1,Math.min(steps.length,n));
      steps.forEach(w=>{ w.hidden=+w.dataset.step!==cur; });
      tabs.forEach(b=>{ const k=+b.dataset.go; b.setAttribute('aria-current',k===cur); b.classList.toggle('done',k<cur); });
      prev.hidden=cur===1; next.hidden=cur===steps.length;
      next.textContent=['','L’ouverture →',C.fmt==='long'?'Mon tableau →':'Mes écrans →','Les détails →','Ma formule →'][cur]||'Suivant →';
      const sc=$('cpScroll'); if(cur===3) showEv(0); else if(cur!==4) sc.scrollTo({top:0,behavior:'smooth'});
      if(cur===2) replayOp(500); // l'onglet de l'ouverture la rejoue
      const top=document.getElementById('composer').getBoundingClientRect().top+scrollY-70; if(scrollY>top+40) scrollTo({top,behavior:'smooth'}); };
    tabs.forEach(b=>b.onclick=()=>go(+b.dataset.go)); prev.onclick=()=>go(cur-1); next.onclick=()=>go(cur+1);
    go(1); }
  /* lecture de l'ouverture : fermee -> 'opening' -> 'gone' */
  const op=$('cpOp'); let opT=null;
  // meme sequence que le faire-part d'Ines & Jad : ouverture, la lumiere monte, la page apparait dessous
  // enveloppe : lumiere a 1 s ; rideau, portes et voile : la lumiere part au toucher (flash:0) et monte avec le mouvement,
  // la page se voit a travers (memes valeurs que invite.js)
  const cpFlash=$('cpFlash'), SEQ={env:{flash:1000,gone:1560},cur:{flash:0,gone:760,cls:'soft'},door:{flash:500,gone:1400,cls:'door'},voile:{flash:400,gone:1500,cls:'door'}}; let opT2=[];
  function closeOp(){ clearTimeout(opT); opT2.forEach(clearTimeout); opT2=[]; op.classList.remove('opening','gone'); cpFlash.classList.remove('bloom','soft','door'); op.dataset.type=C.op;
    op.style.setProperty('--door',`url('/img/open/${C.k}-portes.webp')`); op.style.setProperty('--cur',`url('/img/open/${C.k}-rideau.webp')`);
    const mo=THEMES[C.k].mono; $('opMonoC').style.cssText=mo?`color:${mo[0]};text-shadow:${mo[1]}`:''; void op.offsetWidth; }
  function playOp(){ if(op.classList.contains('opening')) return; op.classList.add('opening'); const q=SEQ[C.op]||SEQ.env; if(q.cls) cpFlash.classList.add(q.cls);
    if(!q.flash) cpFlash.classList.add('bloom');
    opT2=[q.flash?setTimeout(()=>cpFlash.classList.add('bloom'),q.flash):0, setTimeout(()=>{ op.classList.add('gone'); $('cpScroll').scrollTop=0; },q.gone)]; }
  function replayOp(delay){ closeOp(); setTimeout(playOp,delay); }
  op.addEventListener('click',playOp);
  op.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); playOp(); } });
  $('cpReplay').onclick=()=>replayOp(700);
  $('cOpen').addEventListener('click',e=>{ if(e.target.closest('button')) replayOp(700); });
  $('cStyles').addEventListener('click',e=>{ if(e.target.closest('button')&&C.op!=='env') replayOp(500); });
  closeOp();
  if('IntersectionObserver' in window){ const io=new IntersectionObserver(es=>{ es.forEach(en=>{ if(en.isIntersecting){ setTimeout(playOp,900); io.disconnect(); } }); },{threshold:.6}); io.observe(op); }
  $('compForm').addEventListener('submit',e=>e.preventDefault());
  paint();
  }
