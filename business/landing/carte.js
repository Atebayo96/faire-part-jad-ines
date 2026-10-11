/* Save The Oui : la page unique (formule « Page unique ») et la carte (formule « Carte », la même page en image et en PDF).
   Tout le faire-part sur une seule feuille, comme un faire-part papier : la peinture du thème dans une arche, le sceau de
   cire, les prénoms dans la police du thème, la date, chaque moment avec son heure en grand et son lieu, le programme, la
   réponse. Un seul dessin pour trois usages (10 octobre 2026, « la carte, c'est la page unique figée ») :
   - le faire-part en ligne d'une fiche "format": "page" (invite.js),
   - l'aperçu du configurateur,
   - l'image (1080 × 1920, à envoyer sur WhatsApp) et le PDF (A5, à imprimer) de la carte : SceauCarte.png() / .pdf().
   La feuille est claire et unie, le texte foncé : le contraste ne dépend jamais de l'image (règles 1 et 7 de CLAUDE.md).
   Lit window.SCEAU_THEMES (themes.js). */
(function(){
  const TH=()=>window.SCEAU_THEMES||{};
  const CARTEV=1;
  const esc=t=>String(t==null?'':t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const INK='#2b2621';
  // les trois papiers (carte.css, .ct-p-*) : leur teinte, et la plus sombre que prend le relief (pour mesurer l'encre)
  const PAPERS={coton:{c:'#f8f2e7',low:'#ddd3c3'},aquarelle:{c:'#f9f6f0',low:'#d8d3ca'},velin:{c:'#f7f0e2',low:'#e0d6c4'}};
  // cires et relief des initiales gravées (mêmes valeurs que invite.js)
  const SEALS={or:['#fbe3a0','#c99a3a','#6e4a12'],bordeaux:['#d8737b','#8e2430','#3f0b10'],bleu:['#9bb4e8','#2f4f94','#0c1a3d'],
    sauge:['#e4ecd6','#8fa37f','#3f4d36'],terracotta:['#f5b085','#c0643f','#4f1f0c'],rose:['#fff0f2','#d99aa6','#7a4250']};
  function sealOf(hex){
    const n=parseInt(hex.slice(1),16), r=(n>>16&255)/255, g=(n>>8&255)/255, b=(n&255)/255, mx=Math.max(r,g,b), mn=Math.min(r,g,b), l=(mx+mn)/2, d=mx-mn;
    if(d<.08) return 'or';
    let h=mx===r?((g-b)/d)%6:mx===g?(b-r)/d+2:(r-g)/d+4; h=(h*60+360)%360;
    if(h>=280&&h<345) return 'rose';
    if(h>=345||h<12) return l>.6?'rose':'bordeaux';
    if(h<30) return 'terracotta';
    if(h<70) return 'or';
    if(h<170) return 'sauge';
    return 'bleu';
  }
  const FONTS={script:{css:'"Great Vibes",cursive'},classique:{css:'"Playfair Display",Georgia,serif',italic:true},moderne:{css:'"Jost",sans-serif',upper:true},deco:{css:'"Limelight",serif'}};
  // contraste WCAG mesuré : la couleur du couple sert d'encre (prénoms, chapeaux, heures) seulement assombrie jusqu'à 4,5:1 sur la feuille
  const rgb=h=>{ const n=parseInt(String(h).slice(1,7),16); return [n>>16&255,n>>8&255,n&255]; };
  const lum=c=>{ const f=v=>{ v/=255; return v<=.03928?v/12.92:((v+.055)/1.055)**2.4; }; return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2]); };
  const ratio=(a,b)=>{ const x=lum(rgb(a)), y=lum(rgb(b)); return (Math.max(x,y)+.05)/(Math.min(x,y)+.05); };
  const hex=c=>'#'+c.map(v=>Math.round(v).toString(16).padStart(2,'0')).join('');
  function inkOf(pal,min,low){ let c=rgb(pal), k=0; while(ratio(hex(c),low||'#ddd3c3')<(min||4.6)&&k<40){ c=c.map(v=>v*.92); k++; } return hex(c); }

  // dates : "2027-06-12T15:00" telle qu'écrite (heure du lieu), sans conversion de fuseau
  const at=s=>{ const [d,t='12:00']=String(s).split('T'), [y,m,da]=d.split('-').map(Number), [h,mi]=t.split(':').map(Number); return new Date(Date.UTC(y,m-1,da,h||0,mi||0)); };
  const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
  const L10={fr:{loc:'fr-FR',joy:'Ont la joie de vous convier à leur mariage',prog:'Le programme',dress:'Dress code',reply:'Répondre',route:'Y aller',cal:'Agenda',
      rs:'Réponse souhaitée',before:'avant le',by:'au',fams:'Avec leurs familles'},
    en:{loc:'en-GB',joy:'Request the pleasure of your company at their wedding',prog:'The day',dress:'Dress code',reply:'RSVP',route:'Map',cal:'Calendar',
      rs:'Kindly reply',before:'by',by:'on',fams:'Together with their families'}};
  const day=(d,L,year)=>{ const s=cap(d.toLocaleDateString(L.loc,Object.assign({weekday:'long',day:'numeric',month:'long',timeZone:'UTC'},year?{year:'numeric'}:{}))); const t=L.loc==='fr-FR'?s.replace(/(^|\s)1 (?=\D)/,'$11er '):s; return t.replace(/(\d+(?:er)?) (?=\D)/g,'$1\u00a0'); };
  const hour=(d,L)=>{ const s=d.toLocaleTimeString(L.loc,{hour:'2-digit',minute:'2-digit',timeZone:'UTC'}); return L.loc==='fr-FR'?s.replace(':','h'):s; };
  const ic={
    pin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    cal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/></svg>',
    mail:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="5.5" width="18" height="13" rx="1.5"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/></svg>'
  };

  /* chaque thème habille la feuille (11 octobre 2026 : « la différence, c'est pas de mettre des images, mais des symboles,
     des icônes, des illustrations qui viennent habiller la feuille pour en faire une œuvre » ; « de la profondeur et des
     niveaux, que tout n'apparaisse pas sur le même plan »). Plus de photo : cinq plans, du fond vers l'avant :
       1. le fond (.ct-back) à la couleur du thème et à son motif (maïolique, nuit étoilée, zellige, treillis, indienne),
       2. (le passe-partout de couleur a été retiré : « les bordures en plus avec les bordures gaufrées, c'est pas ouf »),
       3. la feuille de papier (.ct-panel), découpée à la forme du thème, posée avec son ombre,
       4. le texte, imprimé dans le papier : chaque ligne est enfoncée (typographie), l'encre prend le grain du papier, les
          prénoms et les heures sont en dorure à chaud (pas de motif gaufré derrière le texte : « c'est pas ça que je voulais »),
       5. les illustrations (.ct-d), posées par-dessus les coins avec leur ombre, et le sceau de cire.
     Fonds et illustrations sont peints (img/carte) ; les illustrations restent dans les coins, jamais sur le texte. */
  const STYLES={dolcevita:'arche',dolcevitajour:'arche',nuits:'ogive',nuitsjour:'ogive',alhambra:'outrepasse',oldmoney:'medaillon',doucefrance:'bandeau'};
  const styleOf=k=>STYLES[k]||(TH()[k]&&TH()[k].family==='nuits'?'ogive':'arche');
  const svg=(vb,body)=>`<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
  /* les illustrations et les fonds sont peints (11 octobre 2026 : « ça fait très digital, faut les générer avec une vraie
     qualité » ; 15 images accordées, business/tools/carte-art.py) : img/carte/<thème>-fond.webp derrière la feuille,
     img/carte/<thème>-<objet>.webp détourés dans les coins. [classe de position, image] */
  const ART=k=>`<img src="/img/carte/${k}.webp?v=${CARTEV}" alt="" decoding="async">`;
  const DECO={
    arche:[['tl',ART('dolcevita-citrons')],['br',ART('dolcevita-bouquet')]],
    ogive:[['lt',ART('nuits-lanternes')],['mo',ART('nuits-lune')]],
    outrepasse:[['tl',ART('alhambra-rosace')],['tr',ART('alhambra-rosace')],['bl',ART('alhambra-jasmin')]],
    medaillon:[['bc',ART('oldmoney-laurier')],['bl',ART('oldmoney-roses')]],
    bandeau:[['bl',ART('doucefrance-lavande')],['tr',ART('doucefrance-olivier')]]
  };
  /* l'icône dorée de chaque moment (11 octobre 2026, « des beaux icônes bien illustrés » : une planche de 8 icônes à la
     dorure gravée, tools/carte-icones.py), choisie d'après le nom du moment, son lieu et l'occasion */
  const ICO=[['henne',/henn/],['berceau',/sbou|naissance|bapt|aqiqa/],['mairie',/mairie|civil|hôtel de ville|hotel de ville/],
    ['cocktail',/cocktail|vin d.honneur|ap[ée]ritif|aperitivo/],['diner',/d[îi]ner|repas|d[ée]jeuner|brunch|banquet/],
    ['alliances',/c[ée]r[ée]monie|[ée]glise|mosqu|religieu|b[ée]n[ée]diction|nikah|kitab|alliance|oui/],['coupes',/f[êe]te|soir[ée]e|r[ée]ception|bal|danse|party/]];
  function icoOf(e,inv){ const t=[e.eyebrow,e.title,e.lieu,inv.kind].filter(Boolean).join(' ').toLowerCase();
    if(inv.kind==='sbou3') return 'berceau'; if(inv.kind==='henne') return 'henne';
    const f=ICO.find(([,re])=>re.test(t)); return f?f[0]:'bouquet'; }
  const FOND={arche:'dolcevita',ogive:'nuits',outrepasse:'alhambra',medaillon:'oldmoney',bandeau:'doucefrance'};
  /* le gaufrage à sec (11 octobre 2026, photo d'un faire-part gaufré : « c'est du papier gaufré, c'est bien ») : une double
     bordure en relief qui suit la découpe de la feuille (dessinée par rim() à la taille réelle de la feuille) et des volutes
     dans les coins, blanc sur blanc (seulement lumière et ombre, carte.css .ct-rim, .ct-sc). Jamais derrière le texte : les
     volutes sont dans les coins, la bordure sur le bord ; les coins du haut seulement quand la feuille a des coins. */
  const SCROLL=svg('0 0 100 100','<path d="M6 62C6 32 16 14 42 8C62 3 80 7 96 5"/><path d="M62 6C32 6 14 16 8 42C3 62 7 80 5 96"/>'+
    '<path d="M30 30C18 30 13 19 21 12C29 6 40 13 35 22C31 28 24 25 26 20"/><path d="M8 46C14 35 24 31 35 35C27 37 18 41 8 46Z" class="f"/><path d="M46 8C35 14 31 24 35 35C37 27 41 18 46 8Z" class="f"/>'+
    '<path d="M35 35C47 47 59 41 61 31C62 25 56 23 53 27"/><path d="M35 35C47 47 41 59 31 61C25 62 23 56 27 53"/><circle cx="52" cy="13" r="2.4" class="f"/><circle cx="13" cy="52" r="2.4" class="f"/>');
  const SCROLLS={arche:['bl','br'],ogive:['bl','br'],outrepasse:['bl','br'],medaillon:['tl','tr','bl','br'],bandeau:['tl','tr','bl','br']};
  // le contour de la feuille, rentré de i px (mêmes formes que .ct-sh dans carte.css)
  function rimPath(st,w,h,i,k,T){ const f=v=>v.toFixed(1);
    if(st==='arche'){ const ry=92*k; return `M${f(i)} ${f(h-i)}V${f(ry)}A${f(w/2-i)} ${f(ry-i)} 0 0 1 ${f(w-i)} ${f(ry)}V${f(h-i)}Z`; }
    if(st==='ogive'||st==='outrepasse'){ const X=x=>f(i+x/100*(w-2*i)), Y=y=>f(i*1.6+y/26*(T-i)); return `M${X(0)} ${f(h-i)}V${Y(20)}C${X(14)} ${Y(15)} ${X(34)} ${Y(11)} ${X(50)} ${Y(0)}C${X(66)} ${Y(11)} ${X(86)} ${Y(15)} ${X(100)} ${Y(20)}V${f(h-i)}Z`; }
    if(st==='medaillon'){ const R=20*k+i; return `M${f(R)} ${f(i)}H${f(w-R)}A${f(R-i)} ${f(R-i)} 0 0 0 ${f(w-i)} ${f(R)}V${f(h-R)}A${f(R-i)} ${f(R-i)} 0 0 0 ${f(w-R)} ${f(h-i)}H${f(R)}A${f(R-i)} ${f(R-i)} 0 0 0 ${f(i)} ${f(h-R)}V${f(R)}A${f(R-i)} ${f(R-i)} 0 0 0 ${f(R)} ${f(i)}Z`; }
    const t=i+8*k; return `M${f(i+6)} ${f(t)}H${f(w-i-6)}Q${f(w-i)} ${f(t)} ${f(w-i)} ${f(t+6)}V${f(h-i-6)}Q${f(w-i)} ${f(h-i)} ${f(w-i-6)} ${f(h-i)}H${f(i+6)}Q${f(i)} ${f(h-i)} ${f(i)} ${f(h-i-6)}V${f(t+6)}Q${f(i)} ${f(t)} ${f(i+6)} ${f(t)}Z`; }
  function rim(root){ const L=root.matches&&root.matches('.ct')?[root]:[...root.querySelectorAll('.ct')];
    L.forEach(el=>{ const sv=el.querySelector('.ct-rim'), pw=el.querySelector('.ct-pw'), sh=el.querySelector('.ct-sheet'); if(!sv||!pw) return;
      const w=pw.clientWidth, h=pw.clientHeight; if(!w||!h) return;
      const st=(el.className.match(/ct-s-(\w+)/)||[])[1], k=parseFloat(getComputedStyle(el).getPropertyValue('--k'))||1, cs=getComputedStyle(sh);
      const T=.24*(sh.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight));
      sv.setAttribute('viewBox',`0 0 ${w} ${h}`); sv.innerHTML=`<path d="${rimPath(st,w,h,7*k,k,T)}"/><path class="in" d="${rimPath(st,w,h,12*k,k,T)}"/>`; }); }
  const decoOf=st=>(DECO[st]||[]).map(([p,s])=>`<div class="ct-d ct-d-${p}">${s}</div>`).join('');

  /* la feuille. o.fit : la feuille a la hauteur de son conteneur (aperçu, en ligne). o.live : le faire-part en ligne (liens Itinéraire et Calendrier, bouton Répondre si inv.reply) ;
     sinon la carte figée (tout est écrit, rien à toucher). o.page : 'story' (9:16), 'a5' (impression) ou rien (écran). */
  function html(inv,o){
    o=o||{}; const T=TH()[inv.theme]||{}, L=L10[inv.lang==='en'?'en':'fr'];
    const pk=PAPERS[inv.paper]?inv.paper:'coton', PP=PAPERS[pk];
    // le grain renforcé de la feuille (.ct-panel::after, multiply à 45 %) fonce le papier jusqu'à 81 % : l'encre est mesurée contre ce pire point
    const low=hex(rgb(PP.low).map(v=>v*.81));
    const pal=inv.palette||'#b8975a', ink=inkOf(pal,4.6,low), soft=inkOf(pal,3.2,low), ink2=hex(rgb(ink).map(v=>v*.62));
    const sealName=SEALS[inv.seal]?inv.seal:sealOf(pal), [sl,sm,sd]=SEALS[sealName];
    const n1=inv.couple[0]||'', n2=inv.couple[1]||'', solo=!n2;
    const F=FONTS[inv.font]||null, ff=F?F.css:(T.font||'"Cormorant Garamond",Georgia,serif'), it=F?!!F.italic:!!T.italic, up=F?!!F.upper:!!T.upper;
    const nmSz=up?.62:/Limelight|Cinzel/.test(ff)?.78:1;
    const ini=solo?esc(n1.charAt(0).toUpperCase()):`${esc(n1.charAt(0).toUpperCase())}<i>&amp;</i>${esc(n2.charAt(0).toUpperCase())}`;
    const evs=inv.events||[], days=new Set(evs.map(e=>String(e.start).slice(0,10)));
    const main=at(inv.date||(evs[0]&&evs[0].start)||'2027-06-12T15:00');
    const ey=window.sceauEy?window.sceauEy(inv.intro&&inv.intro.eyebrow||(T.scenes&&T.scenes[0][0])||''):{text:inv.intro&&inv.intro.eyebrow||''};
    const P=inv.parents, PR=inv.program, DR=inv.dress, R=inv.rsvp||{};
    const live=!!o.live;
    const ev=e=>{ const d=at(e.start), where=[e.place,e.address].find(x=>x&&x!==e.title), ico=icoOf(e,inv);
      const lk=live?`<p class="ct-lk">${e.address?`<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.address)}" target="_blank" rel="noopener" aria-label="${esc(L.route)}">${ic.pin}<span>${L.route}</span></a>`:''}<button type="button" data-cal="${esc(e.id)}" aria-label="${esc(L.cal)}">${ic.cal}<span>${L.cal}</span></button></p>`:'';
      // toujours les mêmes cases, dans le même ordre (vides au besoin) : les colonnes partagent les lignes de la grille
      // (subgrid, carte.css), chapeaux, heures et lieux restent alignés d'un moment à l'autre (« c'est pas aligné »)
      return `<div class="ct-ev"><p class="ct-ic"><img src="/img/carte/ico-${ico}.webp?v=${CARTEV}" alt="" decoding="async"></p><p class="ct-ey">${esc(e.eyebrow||'')}</p>${days.size>1?`<p class="ct-wd">${esc(day(d,L))}</p>`:''}<p class="ct-hr">${esc(hour(d,L))}</p>`+
        `<p class="ct-pl">${esc(e.title||'')}</p><p class="ct-ad">${esc(where||'')}</p>${lk}</div>`; };
    const slots=5+(days.size>1?1:0)+(live?1:0);
    const dl=R.deadline?day(at(R.deadline+'T12:00'),L).replace(/^\S+\s/,''):'';
    const wa=String(R.whatsapp||'').trim();
    let rs;
    if(live&&inv.reply) rs=`<div class="ct-acts"><button type="button" class="ct-b" data-rsvp>${ic.mail}${L.reply}</button></div>${dl?`<p class="ct-rs">${L.rs} ${L.before} ${esc(dl)}</p>`:''}`;
    else rs=(dl||wa)?`<p class="ct-rs">${L.rs}${dl?` ${L.before} ${esc(dl)}`:''}${wa?`<br>${L.by} ${live?`<a href="https://wa.me/${esc(wa.replace(/[^\d+]/g,'').replace(/^\+/,'').replace(/^0/,'33'))}" target="_blank" rel="noopener">${esc(wa)}</a>`:esc(wa)}`:''}</p>`:'';
    const prog=PR&&(PR.items||[]).length?`<div class="ct-pr"><p class="ct-ey">${esc(PR.eyebrow||L.prog)}</p><ul>${PR.items.slice(0,8).map(x=>`<li><b>${esc(x.time||'')}</b><span>${esc(x.title||'')}</span></li>`).join('')}</ul></div>`:'';
    const dress=DR&&(DR.title||DR.text)?`<p class="ct-dr"><b>${esc(DR.eyebrow||L.dress)}</b>${esc([DR.title,DR.text].filter(Boolean).join(' · '))}</p>`:'';
    const st=styleOf(inv.theme);
    const cls=['ct','ct-s-'+st,'ct-p-'+pk,o.page?'ct-'+o.page:'',live?'ct-live':'',live||o.fit?'ct-fit':'',evs.length>1?'ct-n'+Math.min(evs.length,3):''].filter(Boolean).join(' ');
    return `<div class="${cls}" style="--pal:${esc(pal)};--ink:${ink};--ink2:${ink2};--soft:${soft};--paper:${PP.c};--tx:${INK}">`+
      `<div class="ct-sheet">`+
        `<div class="ct-back" aria-hidden="true" style="background-image:url('/img/carte/${FOND[st]}-fond.webp?v=${CARTEV}')"></div>`+
        `<div class="ct-pw" aria-hidden="true"><div class="ct-panel ct-sh"><svg class="ct-rim"></svg>${SCROLLS[st].map(c=>`<i class="ct-sc ct-sc-${c}">${SCROLL}</i>`).join('')}</div></div>`+
        `<div class="ct-deco" aria-hidden="true">${decoOf(st)}</div>`+
        `<div class="ct-seal" style="background-image:url('/img/seals/${sealName}.webp')"><b style="--l:${sl};--m:${sm};--d:${sd}">${ini}</b></div>`+
        (P&&(P.names||[]).filter(Boolean).length?`<p class="ct-fam">${P.names.filter(Boolean).map(esc).join(' &amp; ')}</p>`:'')+
        `<p class="ct-ey ct-top${ey.ar?' ar':''}"${ey.ar?' lang="ar" dir="rtl"':''}>${esc(ey.text)}</p>`+
        `<h1 class="ct-nm" style="font-family:${esc(ff)};font-style:${it?'italic':'normal'};text-transform:${up?'uppercase':'none'};letter-spacing:${up?'.12em':'0'};font-weight:${up?300:400};--nk:${nmSz}">${solo?esc(n1):`${esc(n1)} <i>&amp;</i> ${esc(n2)}`}</h1>`+
        `<p class="ct-tx">${esc(inv.intro&&inv.intro.text||L.joy)}</p>`+
        `<p class="ct-dl"><i></i><span>${esc(inv.intro&&inv.intro.dateText||day(main,L,true))}</span><i></i></p>`+
        `<div class="ct-evs" style="--slots:${slots}">${evs.map(ev).join('')}</div>`+
        prog+dress+rs+
        `<p class="ct-made"><span>Save the</span> <b>Oui</b></p>`+
      `</div></div>`;
  }

  /* les prénoms tiennent sur une ligne : réduits pas à pas (jusqu'à 62 %) s'ils dépassent la largeur de la feuille ;
     sinon (prénoms très longs) ils passent à la ligne. À rappeler quand la police est chargée. */
  function fit(root){ (root||document).querySelectorAll('.ct-nm').forEach(nm=>{ nm.style.whiteSpace='nowrap'; nm.style.fontSize='';
    const P=nm.parentNode, cs=getComputedStyle(P), max=P.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight)-8;
    let fs=parseFloat(getComputedStyle(nm).fontSize); const min=fs*.62; while(nm.scrollWidth>max&&fs>min){ fs-=1; nm.style.fontSize=fs+'px'; }
    if(nm.scrollWidth>max) nm.style.whiteSpace=''; });
    // les pastilles Y aller / Agenda : le mot s'il tient sur la ligne, sinon l'icône seule (classe ico)
    (root||document).querySelectorAll('.ct-lk').forEach(lk=>{ lk.classList.remove('ico'); if(lk.scrollWidth>lk.clientWidth+1) lk.classList.add('ico'); });
    // en ligne : s'il reste de la place sur l'écran, le texte grandit un peu (jusqu'à 106 %) pour composer une vraie page
    (root||document).querySelectorAll('.ct-fit').forEach(el=>{ const sh=el.querySelector('.ct-sheet'), box=el.parentNode; if(!sh||!box) return;
      const H=(box.closest('.sc,.pv-scroll')||box).clientHeight; if(!H) return;
      const need=()=>{ const top=sh.getBoundingClientRect().top; let b=0; [...sh.children].forEach(c=>{ if(!/ct-(made|back|pw|deco|seal)\b/.test(c.className)) b=Math.max(b,c.getBoundingClientRect().bottom); }); return b-top+parseFloat(getComputedStyle(sh).paddingBottom); };
      sh.style.justifyContent='flex-start'; let k=1; el.style.setProperty('--k','1');
      // trop plein (trois moments, programme…) : on réduit d'abord, jusqu'à 74 %, pour que la signature reste sur l'écran
      // (« le Save The Oui n'est pas visible ») ; sinon on agrandit
      if(need()>H) while(k>.74&&need()>H){ k-=.02; el.style.setProperty('--k',k.toFixed(2)); }
      else while(k<1.06){ el.style.setProperty('--k',(k+.03).toFixed(2)); if(need()>H){ el.style.setProperty('--k',k.toFixed(2)); break; } k+=.03; }
      sh.style.justifyContent=''; el.querySelectorAll('.ct-lk').forEach(lk=>{ lk.classList.remove('ico'); if(lk.scrollWidth>lk.clientWidth+1) lk.classList.add('ico'); }); });
    rim(root||document); }

  /* ---------- export : image et PDF ----------
     La feuille est dessinée par le navigateur (html-to-image, MIT, /html-to-image.js, chargé à la demande) à la taille
     exacte du format, puis réduite d'un cran si le contenu dépasse (--k) : jamais de texte coupé. Le PDF est écrit à la
     main (une page A5, l'image en JPEG) : pas de bibliothèque de plus. */
  const FMT={story:{w:360,h:640,px:3},a5:{w:420,h:595,px:4}};
  let lib=null;
  const loadLib=()=>lib||(lib=new Promise((ok,ko)=>{ if(window.htmlToImage) return ok(); const s=document.createElement('script'); s.src='/html-to-image.js'; s.onload=ok; s.onerror=ko; document.head.appendChild(s); }));
  async function render(inv,page){
    await loadLib(); const F=FMT[page];
    const host=document.createElement('div'); host.style.cssText=`position:fixed;left:-10000px;top:0;width:${F.w}px;height:${F.h}px;overflow:hidden`;
    host.innerHTML=html(inv,{page}); document.body.appendChild(host);
    const el=host.firstElementChild, sh=el.querySelector('.ct-sheet');
    await Promise.all([...el.querySelectorAll('img')].map(im=>im.complete?0:new Promise(r=>{ im.onload=im.onerror=r; })));
    if(document.fonts&&document.fonts.ready) await document.fonts.ready;
    // le contenu tient dans la feuille : on réduit l'échelle par petits pas tant qu'il dépasse
    for(let k=1;k>=.66;k-=.04){ el.style.setProperty('--k',k.toFixed(2)); fit(el); if(sh.scrollHeight<=sh.clientHeight+1) break; }
    return {el,host,F};
  }
  const fileName=(inv,ext)=>'faire-part-'+inv.couple.join('-').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')+'.'+ext;
  function save(blob,name){ const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },4000); }
  async function png(inv,dl){
    const {el,host,F}=await render(inv,'story');
    try{ const blob=await htmlToImage.toBlob(el,{width:F.w,height:F.h,pixelRatio:F.px,cacheBust:false,backgroundColor:(PAPERS[inv.paper]||PAPERS.coton).c});
      if(dl!==false) save(blob,fileName(inv,'png')); return blob; } finally{ host.remove(); }
  }
  // une page A5 (419,53 × 595,28 pt), l'image en JPEG (DCTDecode) sur toute la page
  async function pdf(inv,dl){
    const {el,host,F}=await render(inv,'a5');
    let cv; try{ cv=await htmlToImage.toCanvas(el,{width:F.w,height:F.h,pixelRatio:F.px,cacheBust:false,backgroundColor:(PAPERS[inv.paper]||PAPERS.coton).c}); } finally{ host.remove(); }
    const jpg=await new Promise(r=>cv.toBlob(r,'image/jpeg',.92)), bytes=new Uint8Array(await jpg.arrayBuffer());
    const W=419.53, H=595.28, enc=new TextEncoder(), parts=[], offs=[]; let len=0;
    const put=x=>{ const b=typeof x==='string'?enc.encode(x):x; parts.push(b); len+=b.length; };
    const obj=(n,body,stream)=>{ offs[n]=len; put(`${n} 0 obj\n${body}\n`); if(stream){ put('stream\n'); put(stream); put('\nendstream\n'); } put('endobj\n'); };
    put('%PDF-1.4\n%\xe2\xe3\xcf\xd3\n');
    const draw=enc.encode(`q ${W} 0 0 ${H} 0 0 cm /Im0 Do Q`);
    obj(1,'<< /Type /Catalog /Pages 2 0 R >>');
    obj(2,'<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
    obj(3,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`);
    obj(4,`<< /Type /XObject /Subtype /Image /Width ${cv.width} /Height ${cv.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${bytes.length} >>`,bytes);
    obj(5,`<< /Length ${draw.length} >>`,draw);
    const xref=len; put(`xref\n0 6\n0000000000 65535 f \n${[1,2,3,4,5].map(n=>String(offs[n]).padStart(10,'0')+' 00000 n \n').join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
    const blob=new Blob(parts,{type:'application/pdf'}); if(dl!==false) save(blob,fileName(inv,'pdf')); return blob;
  }
  window.SceauCarte={PAPERS,html,fit,png,pdf,inkOf,ratio};
})();
