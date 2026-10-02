/* Sceau : moteur de faire-part.
   Lit window.INVITE (fiche du couple, voir business/invites/*.json) et window.SCEAU_THEMES (themes.js),
   puis construit : ouverture, pages animées, musique, compte à rebours, itinéraires, calendrier, réponses. */
(function(){
  const I=window.INVITE, T=window.SCEAU_THEMES[I.theme];
  const $=s=>document.querySelector(s);
  const esc=t=>String(t==null?'':t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const L=(I.lang||'fr')==='en'?'en':'fr';
  const S={
    fr:{tap:'Touchez pour ouvrir',tapSeal:'Touchez le sceau pour ouvrir',scroll:'Faites défiler',route:'Itinéraire',cal:'Calendrier',reply:'Répondre',days:'jours',hours:'heures',min:'min',sec:'sec',
      soon:'Le grand jour approche',left:'Plus que',infos:'Infos pratiques',joy:'Ont la joie de vous convier à leur mariage',
      rsvpT:'Votre réponse',rsvpSub:'Une réponse par foyer suffit.',name:'Vos prénoms et nom',present:'Présent',absent:'Absent',guests:'Nombre de personnes',
      diet:'Allergies ou régime (facultatif)',msg:'Un mot pour les mariés (facultatif)',send:'Envoyer ma réponse',sending:'Envoi…',thanks:'Merci !',
      saved:'Votre réponse est bien enregistrée. Vous pouvez la modifier en répondant à nouveau.',again:'Modifier ma réponse',
      demoNote:'Ceci est une démo : votre réponse n’est pas enregistrée.',demoDash:'Voir le tableau de bord des mariés',
      fail:'L’envoi n’a pas fonctionné. Vérifiez votre connexion et réessayez.',need:'Indiquez votre nom et votre réponse pour chaque événement.',
      privacy:'Vos réponses ne sont visibles que par les mariés et sont supprimées après le mariage.',
      calT:'Ajouter au calendrier',gcal:'Google Agenda',ical:'Apple, Outlook (.ics)',made:'Faire-part créé avec',demo:'Démo',before:'Avant le',celebr:'Les célébrations',know:'Bon à savoir',cdEnd:'Le compte à rebours a commencé',want:'Je veux ce faire-part',already:'Vous avez déjà répondu. Vous pouvez modifier votre réponse ci-dessous.',editT:'Pour modifier votre réponse depuis un autre téléphone, gardez ce lien :',copy:'Copier le lien',copied:'Lien copié',
      demoLink:'Dans votre faire-part, ce bouton ouvre votre propre lien : liste de mariage, cagnotte, album photo ou réservation d’hôtel.',
      parents:'Avec la bénédiction de leurs familles',story:'Notre histoire',program:'Le programme',dress:'Dress code',stay:'Hébergement et accès',faq:'Vos questions',
      gifts:'Liste de mariage',giftsBtn:'Voir la liste',photos:'Vos photos',photosBtn:'Partager mes photos',dayJ:'Le jour J',table:'Votre table',tableTx:'Le plan de salle sera aussi affiché à l’entrée.',site:'Ouvrir'},
    en:{tap:'Tap to open',tapSeal:'Tap the seal to open',scroll:'Scroll down',route:'Directions',cal:'Calendar',reply:'RSVP',days:'days',hours:'hours',min:'min',sec:'sec',
      soon:'The big day is coming',left:'Only',infos:'Good to know',joy:'Request the pleasure of your company at their wedding',
      rsvpT:'Your reply',rsvpSub:'One reply per household is enough.',name:'Your full name(s)',present:'Attending',absent:'Not attending',guests:'Number of guests',
      diet:'Allergies or dietary needs (optional)',msg:'A note for the couple (optional)',send:'Send my reply',sending:'Sending…',thanks:'Thank you!',
      saved:'Your reply has been saved. You can change it by replying again.',again:'Change my reply',
      demoNote:'This is a demo: your reply is not saved.',demoDash:'See the couple’s dashboard',
      fail:'Sending failed. Please check your connection and try again.',need:'Please enter your name and a reply for each event.',
      privacy:'Only the couple can see your reply, and it is deleted after the wedding.',
      calT:'Add to calendar',gcal:'Google Calendar',ical:'Apple, Outlook (.ics)',made:'Invitation made with',demo:'Demo',before:'Before',celebr:'The celebrations',know:'Good to know',cdEnd:'The countdown has begun',want:'I want this invitation',already:'You have already replied. You can change your reply below.',editT:'To change your reply from another phone, keep this link:',copy:'Copy link',copied:'Link copied',
      demoLink:'In your invitation, this button opens your own link: gift list, honeymoon fund, photo album or hotel booking.',
      parents:'Together with their families',story:'Our story',program:'The day',dress:'Dress code',stay:'Where to stay',faq:'Questions',
      gifts:'Gift list',giftsBtn:'View the list',photos:'Your photos',photosBtn:'Share my photos',dayJ:'On the day',table:'Your table',tableTx:'The seating plan will also be displayed at the entrance.',site:'Open'}
  }[L];
  const TZ=I.tz||'Europe/Paris', LOC=L==='en'?'en-GB':'fr-FR';
  const FONTS={script:{css:'"Great Vibes",cursive'},classique:{css:'"Playfair Display",Georgia,serif',italic:true},moderne:{css:'"Jost",sans-serif',upper:true},deco:{css:'"Limelight",serif'}};

  /* ---------- dates ---------- */
  // "2027-06-05T15:00" interprété dans le fuseau du mariage -> Date
  function zoned(s,tz){
    const [d,t='12:00']=s.split('T'); const [y,mo,da]=d.split('-').map(Number); const [h,mi]=t.split(':').map(Number);
    const guess=Date.UTC(y,mo-1,da,h,mi);
    const p=new Intl.DateTimeFormat('en-US',{timeZone:tz||TZ,hourCycle:'h23',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).formatToParts(new Date(guess));
    const g=k=>+p.find(x=>x.type===k).value;
    const asTz=Date.UTC(g('year'),g('month')-1,g('day'),g('hour'),g('minute'));
    return new Date(guess-(asTz-guess));
  }
  const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
  const er=s=>L==='fr'?s.replace(/(^|\s)1 (?=\D)/,'$11er '):s;
  const fmtDay=(d,tz)=>er(cap(d.toLocaleDateString(LOC,{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:tz||TZ})));
  const fmtDayShort=(d,tz)=>er(cap(d.toLocaleDateString(LOC,{weekday:'long',day:'numeric',month:'long',timeZone:tz||TZ})));
  const fmtTime=(d,tz)=>{ const s=d.toLocaleTimeString(LOC,{hour:'2-digit',minute:'2-digit',timeZone:tz||TZ}); return L==='fr'?s.replace(':','h'):s; };

  /* ---------- données ---------- */
  const fid=new URLSearchParams(location.search).get('f');
  const fam=fid&&I.families&&I.families[fid]?I.families[fid]:null;
  const events=(I.events||[]).filter(e=>!fam||!fam.events||fam.events.includes(e.id));
  const main=zoned(I.date,TZ);
  const multiDay=new Set(events.map(e=>e.start.slice(0,10))).size>1;
  const n1=I.couple[0], n2=I.couple[1];
  const pal=I.palette||'#b8975a';
  // sceau de cire (enveloppe et accueil) : la couleur de cire la plus proche de la palette du couple (ou I.seal), initiales gravées dans la cire
  // dégradé du relief des initiales (clair, moyen, sombre) pour chaque cire
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
  const sealName=SEALS[I.seal]?I.seal:sealOf(pal), [sealL,sealM,sealD]=SEALS[sealName];
  const F=FONTS[I.font]||null, fam1=F?F.css:T.font, ital=F?!!F.italic:!!T.italic, up=F?!!F.upper:!!T.upper;
  const base=up?30:/Limelight|Cinzel/.test(fam1)?38:52;
  const nmCss=(k,col)=>`font-family:${fam1};font-style:${ital?'italic':'normal'};text-transform:${up?'uppercase':'none'};letter-spacing:${up?'.12em':'0'};font-weight:${up?300:400};font-size:clamp(${Math.round(base*k*.72)}px,${(base*k/16.5).toFixed(2)}vh,${Math.round(base*k*1.1)}px);color:${col}`;
  const img=n=>`/img/hd/${I.theme}-${n}.webp`;
  const isDark=n=>(T.scenes[n-1]||[])[4]==='dark';

  /* ---------- icônes ---------- */
  const ic={
    pin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    cal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/></svg>',
    mail:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5.5" width="18" height="13" rx="1.5"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/></svg>',
    dress:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 3h6l-1 4 4 13H6l4-13z"/></svg>',
    hotel:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 19V7M21 19v-6a3 3 0 0 0-3-3h-7v6M3 14h18"/><circle cx="7" cy="11" r="1.8"/></svg>',
    gift:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="9" width="16" height="11" rx="1"/><path d="M3 9h18M12 9v11M12 9c-2-4-6-4-6-1.5S10 9 12 9zm0 0c2-4 6-4 6-1.5S14 9 12 9z"/></svg>',
    car:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 16V11l2-5h10l2 5v5M3 16h18v2H3z"/><circle cx="7.5" cy="13" r="1"/><circle cx="16.5" cy="13" r="1"/></svg>',
    kids:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="7" r="3"/><path d="M6 21v-3a6 6 0 0 1 12 0v3"/></svg>',
    info:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>',
    cam:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
    note:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 17.5V5l11-2v12.5"/><circle cx="6.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="15.5" r="2.5"/></svg>',
    mute:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 17.5V5l11-2v8M3 3l18 18"/><circle cx="6.5" cy="17.5" r="2.5"/></svg>'
  };

  /* ---------- pages ---------- */
  const pages=[];
  let rvI=0;
  function page(n,inner,opts={}){
    rvI=0;
    const dark=opts.dark!=null?opts.dark:isDark(n), lt=T.light&&!dark;
    const c={nm:lt?T.color:'#fff',ey:lt?(T.ey||T.color):'#fff',tx:lt?(T.tx||T.color):'#fff'};
    const body=inner(c,lt);
    // le décor n'est pas dans la page : un calque fixe par scène (plusieurs pages d'affilée peuvent partager la même scène,
    // le décor reste alors en place : aucune coupure). Pas de voile sombre sous le texte : il « apparaissait » au swipe
    // sans que l'image change, l'utilisateur l'a fait retirer (voir CLAUDE.md).
    pages.push({n,lt,
      html:`<section class="pg${lt?' light':''}${opts.cls?' '+opts.cls:''}" data-img="${img(n)}" style="${esc(opts.style||'')}">${body}</section>`});
  }
  const cdHtml=(big,col)=>`<div class="cd${big?' big':''}" style="color:${col}">${['d','h','m','s'].map((u,i)=>`<div><b data-u="${u}">0</b><span>${[S.days,S.hours,S.min,S.sec][i]}</span></div>`).join('')}</div>`;
  const oval=!!T.top1, compact=!!T.compact;
  // chapeau de l'accueil : « Bismillah » s'écrit en arabe, en calligraphie (ligature basmala, voir themes.js), de droite à gauche
  const eyHtml=(cls,t,st)=>{ const e=window.sceauEy(t); return `<div class="${cls}${e.ar?' ar':''}"${e.ar?` lang="ar" dir="rtl" aria-label="${esc(window.SCEAU_BASMALA_LABEL)}"`:''} style="${st}">${esc(e.text)}</div>`; };

  // 1. accueil
  page(1,(c)=>{
    const names=T.stack?`${esc(n1)}<br>&amp; ${esc(n2)}`:`${esc(n1)} &amp; ${esc(n2)}`;
    return (fam&&fam.label?`<div class="rv greet" style="--i:${rvI++};color:${c.tx}">${esc(fam.label)}</div>`:'')+
      (oval||compact?'':`<div class="rv seal" style="--i:${rvI++};background-image:url('/img/seals/${sealName}.webp')"><b style="--l:${sealL};--m:${sealM};--d:${sealD}">${esc(n1[0].toUpperCase())}<i>&amp;</i>${esc(n2[0].toUpperCase())}</b></div>`)+
      eyHtml('rv ey',I.intro&&I.intro.eyebrow||T.scenes[0][0],`--i:${rvI++};color:${c.ey}`)+
      `<div class="rv nm" style="--i:${rvI++};${esc(nmCss(T.stack?.82:1,c.nm))}">${names}</div>`+
      (oval||compact?'':`<div class="rv tx" style="--i:${rvI++};color:${c.tx}">${esc(I.intro&&I.intro.text||S.joy)}</div>`)+
      `<div class="rv dl" style="--i:${rvI++};color:${T.light?pal:'#fff'}"><i></i><span>${esc(I.intro&&I.intro.dateText||fmtDay(main))}</span><i></i></div>`+
      (I.countdown==='debut'?`<div class="rv" style="--i:${rvI++}">${cdHtml(false,c.tx)}</div>`:'')+
      `<div class="hint" style="color:${c.ey}">${S.scroll} ↓</div>`;
  },{style:oval?'padding-top:'+T.top1:''});

  const evImg=(e,i)=>e.scene||[2,3][i%2];
  const rv=(cls,col,inner,st='')=>`<div class="rv ${cls}" style="--i:${rvI++};${col?'color:'+col+';':''}${st}">${inner}</div>`;
  const head=(c,ey,title,k=.74)=>rv('ey',c.ey,esc(ey))+(title?rv('nm',null,esc(title),esc(nmCss(k,c.nm))):'');
  // dans les démos, les liens externes (liste, album, hôtel) ouvrent une explication au lieu d'un faux site
  const lnk=u=>u==='demo'?'href="#" data-demo':`href="${esc(u)}" target="_blank" rel="noopener"`;
  const cardBg=lt=>lt?'rgba(255,255,255,.55)':'rgba(0,0,0,.28)';
  const lastScene=events.length?evImg(events[events.length-1],events.length-1):2;

  // 2. le mot des familles (scène 1 : le décor de l'accueil reste en place)
  const P=I.parents;
  if(P) page(1,(c)=>
    head(c,P.eyebrow||S.parents,'')+
    (P.names&&P.names.length?rv('fams',c.tx,P.names.map(x=>`<span>${esc(x)}</span>`).join('<i>&amp;</i>')):'')+
    rv('tx',c.tx,esc(P.text||''))+
    rv('nm',null,`${esc(n1)} &amp; ${esc(n2)}`,esc(nmCss(.7,c.nm))),{});

  // 3. notre histoire
  const ST=I.story;
  if(ST) page(1,(c,lt)=>
    head(c,ST.eyebrow||S.story,ST.title||'',.6)+
    (ST.photos&&ST.photos.length?rv('ph',null,ST.photos.slice(0,3).map((u,k)=>`<img src="${esc(u)}" alt="" loading="lazy" style="--r:${[-4,3,-2][k]}deg">`).join('')):'')+
    rv('st',c.tx,(ST.items||[]).map(x=>`<div><b>${esc(x.when)}</b><h4>${esc(x.title)}</h4>${x.text?`<p>${esc(x.text)}</p>`:''}</div>`).join('')),{cls:'tall'});

  // 4. compte à rebours sur une page
  if(I.countdown==='page') page(1,(c)=>
    head(c,S.soon,S.left,.8)+rv('',null,cdHtml(true,c.tx))+rv('dl',c.tx,`<i></i><span>${esc(fmtDay(main))}</span><i></i>`),{});

  // 5. événements
  events.forEach((e,i)=>{
    const d=zoned(e.start,e.tz);
    page(evImg(e,i),(c)=>{
      const when=(multiDay||e.showDate?fmtDayShort(d,e.tz)+' · ':'')+fmtTime(d,e.tz);
      return head(c,e.eyebrow||'',e.title)+rv('when',c.tx,esc(when))+
        (e.place?rv('tx',c.tx,esc(e.place)):'')+
        (e.note?rv('tx',c.tx,esc(e.note),'font-size:15px;opacity:.9'):'')+
        rv('acts',c.tx,(e.address?`<a class="b" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.address)}" target="_blank" rel="noopener">${ic.pin}${S.route}</a>`:'')+
          `<button type="button" class="b" data-cal="${esc(e.id)}">${ic.cal}${S.cal}</button>`);
    });
  });

  // 6. le programme du jour (sur le décor du dernier événement)
  const PR=I.program;
  if(PR) page(lastScene,(c,lt)=>
    head(c,PR.eyebrow||S.program,PR.title||'',.6)+
    rv('card tl',c.tx,(PR.items||[]).map(x=>`<div class="it"><b>${esc(x.time)}</b><div><h4>${esc(x.title)}</h4>${x.text?`<p>${esc(x.text)}</p>`:''}</div></div>`).join(''),'background:'+cardBg(lt)),{cls:'tall'});

  // 7. infos pratiques, dress code, hébergement, questions, liste, photos, table : sur le décor de la réponse
  if(I.infos&&I.infos.length) page(4,(c,lt)=>
    head(c,I.infosTitle||S.infos,'')+
    rv('card',c.tx,I.infos.map(x=>`<div class="it">${ic[x.icon]||ic.info}<div><h4>${esc(x.title)}</h4><p>${esc(x.text)}</p></div></div>`).join(''),'background:'+cardBg(lt)),{cls:'tall'});

  const DR=I.dress;
  if(DR) page(4,(c)=>
    head(c,DR.eyebrow||S.dress,DR.title||'',.7)+
    (DR.colors&&DR.colors.length?rv('sw',null,DR.colors.map(x=>`<i style="background:${esc(x)}"></i>`).join('')):'')+
    rv('tx',c.tx,esc(DR.text||'')),{});

  const SY=I.stay;
  if(SY) page(4,(c,lt)=>
    head(c,SY.eyebrow||S.stay,SY.title||'',.6)+
    rv('card',c.tx,(SY.items||[]).map(x=>`<div class="it">${ic[x.icon]||ic.hotel}<div><h4>${esc(x.title)}</h4><p>${esc(x.text)}</p>${x.url?`<a class="lk" ${lnk(x.url)}>${esc(x.link||S.site)} →</a>`:''}</div></div>`).join(''),'background:'+cardBg(lt)),{cls:'tall'});

  const FQ=I.faq;
  if(FQ) page(4,(c,lt)=>
    head(c,FQ.eyebrow||S.faq,FQ.title||'',.6)+
    rv('card qa',c.tx,(FQ.items||[]).map(x=>`<div class="it"><div><h4>${esc(x.q)}</h4><p>${esc(x.a)}</p></div></div>`).join(''),'background:'+cardBg(lt)),{cls:'tall'});

  const GF=I.gifts;
  if(GF) page(4,(c)=>
    head(c,GF.eyebrow||S.gifts,GF.title||'',.7)+rv('tx',c.tx,esc(GF.text||''))+
    (GF.url?rv('acts',c.tx,`<a class="b" ${lnk(GF.url)}>${ic.gift}${esc(GF.label||S.giftsBtn)}</a>`):''),{});

  const PH=I.photos;
  if(PH) page(4,(c)=>
    head(c,PH.eyebrow||S.photos,PH.title||'',.7)+rv('tx',c.tx,esc(PH.text||''))+
    (PH.url?rv('acts',c.tx,`<a class="b" ${lnk(PH.url)}>${ic.cam}${esc(PH.label||S.photosBtn)}</a>`):''),{});

  // la table n'apparaît que sur le lien personnel d'une famille qui a une table
  if(fam&&fam.table) page(4,(c)=>
    head(c,S.dayJ,S.table,.7)+rv('tbl',c.tx,esc(fam.table))+rv('tx',c.tx,esc(I.tableText||S.tableTx)),{});

  // 8. réponse
  const R=I.rsvp||{};
  const deadline=R.deadline?zoned(R.deadline+'T23:59',TZ):null;
  page(4,(c)=>
    `<div class="rv ey" style="--i:${rvI++};color:${c.ey}">${esc(R.eyebrow||T.scenes[3][0])}</div>`+
    `<div class="rv nm" style="--i:${rvI++};${esc(nmCss(.74,c.nm))}">${esc(R.title||T.scenes[3][1])}</div>`+
    (deadline?`<div class="rv tx" style="--i:${rvI++};color:${c.tx}">${S.before} ${esc(er(deadline.toLocaleDateString(LOC,{day:'numeric',month:'long',timeZone:TZ})))}</div>`:'')+
    (I.countdown==='fin'?`<div class="rv" style="--i:${rvI++}">${cdHtml(false,c.tx)}</div>`:'')+
    `<div class="rv acts" style="--i:${rvI++};color:${c.tx}"><button type="button" class="b" data-rsvp style="color:${c.tx}">${ic.mail}${S.reply}</button></div>`+
    `<a class="made" href="/" target="_blank" rel="noopener" style="color:${c.ey}">${S.made} <b>SCEAU</b></a>`);

  /* ---------- mise en page continue (comme un long rouleau peint) ----------
     une grande illustration qu'on descend, qui se fond dans des fonds texturés aux couleurs du thème ;
     entre deux parties, une guirlande à cheval sur la limite cache le changement de fond (aucune coupure) */
  const LG=I.layout==='long'&&I.long?I.long:null;
  function longHtml(){
    const X=LG, sec=X.sec, R0=I.rsvp||{};
    const nm=(k,col)=>esc(nmCss(k,col));
    const blk=(i,inner,cls='')=>`<section class="lg-s${cls?' '+cls:''}" style="--ink:${sec[i].ink};--ac:${sec[i].accent};background-image:url('${X.base}/${sec[i].tex}')">${inner}</section>`;
    const band=(i)=>`<div class="lg-band" aria-hidden="true"><img src="${X.base}/${X.bands[i]}" alt="" data-sp="-.10"></div>`;
    const ttl=(t,i)=>`<h2 class="rv lg-h" style="${nm(.62,sec[i].accent)}">${esc(t)}</h2>`;
    // 1. l'illustration d'ouverture et l'invitation
    const P0=I.parents||null, names=`${esc(n1)} <i>&amp;</i> ${esc(n2)}`;
    const hero=`<div class="lg-hero"><img class="lg-hero-img" src="${X.base}/${X.hero.src}" alt="" style="aspect-ratio:${X.hero.w}/${X.hero.h}">
      <div class="lg-hero-txt" data-sp=".35" style="color:${X.hero.ink};--sh:${X.hero.shadow||'none'};--top:${X.hero.top||'14%'}">
        ${fam&&fam.label?`<div class="greet">${esc(fam.label)}</div>`:''}
        ${eyHtml('ey',I.intro&&I.intro.eyebrow||T.scenes[0][0],'')}
        <div class="lg-names" style="${nm(1.05,X.hero.ink)}">${names}</div>
        <div class="dl"><i></i><span>${esc(I.intro&&I.intro.dateText||fmtDay(main))}</span><i></i></div>
        <div class="lg-hint">${S.scroll} ↓</div>
      </div></div>`;
    const evs=events.map((e,i)=>{ const d=zoned(e.start,e.tz), inner=X.ev[(I.events||[]).indexOf(e)]||X.ev[i%X.ev.length];
      const when=fmtDayShort(d,e.tz)+' · '+fmtTime(d,e.tz);
      return `<article class="lg-ev rv">
        <div class="lg-fr" style="aspect-ratio:${X.frame.w}/${X.frame.h}"><img class="in" src="${X.base}/${inner}" alt="" style="-webkit-mask-image:url('${X.base}/${X.frame.mask}');mask-image:url('${X.base}/${X.frame.mask}')"><img class="fr" src="${X.base}/${X.frame.src}" alt=""></div>
        <div class="ey">${esc(e.eyebrow||'')}</div><div class="lg-evt" style="${nm(.62,sec[0].ink)}">${esc(e.title)}</div>
        <div class="when">${esc(when)}</div>${e.place?`<div class="tx">${esc(e.place)}</div>`:''}${e.note?`<div class="tx small">${esc(e.note)}</div>`:''}
        <div class="acts">${e.address?`<a class="b" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.address)}" target="_blank" rel="noopener">${ic.pin}${S.route}</a>`:''}<button type="button" class="b" data-cal="${esc(e.id)}">${ic.cal}${S.cal}</button></div>
      </article>`; }).join('');
    const s1=`<div class="lg-a" style="background-image:url('${X.base}/${sec[0].tex}');--ink:${sec[0].ink};--ac:${sec[0].accent}">${hero}
      <div class="lg-in">
        ${P0?`<div class="rv ey">${esc(P0.eyebrow||S.parents)}</div><div class="rv lg-fams">${(P0.names||[]).map(x=>`<span>${esc(x)}</span>`).join('<i>&amp;</i>')}</div><p class="rv tx">${esc(P0.text||'')}</p>`:''}
        <div class="rv lg-names2" style="${nm(.8,sec[0].accent)}">${names}</div>
        <p class="rv tx">${esc(I.intro&&I.intro.text||S.joy)}</p>
        ${I.countdown==='debut'?`<div class="rv">${cdHtml(false,sec[0].ink)}</div>`:''}
        ${ttl(S.celebr,0)}${evs}
      </div></div>`;
    // 2. notre histoire, photos, dress code
    const ST0=I.story, DR0=I.dress, phs=X.photos||[];
    const s2=blk(1,`<div class="lg-in">${ttl(ST0&&ST0.title||S.story,1)}
        ${ST0&&ST0.items?`<div class="rv st lg-st">${ST0.items.map(x=>`<div><b>${esc(x.when)}</b><h4>${esc(x.title)}</h4>${x.text?`<p>${esc(x.text)}</p>`:''}</div>`).join('')}</div>`:''}
      </div>
      ${phs.length?`<div class="rv lg-ph" aria-hidden="true"><div class="lg-ph-in">${[...phs,...phs].map((u,k)=>`<img src="${X.base}/${u}" alt="" loading="lazy" style="--r:${[-3,2,-1.5,3][k%4]}deg">`).join('')}</div></div>`:''}
      ${DR0?`<div class="lg-in">${ttl(DR0.eyebrow||S.dress,1)}${DR0.title?`<div class="rv lg-sub">${esc(DR0.title)}</div>`:''}${DR0.colors?`<div class="rv sw">${DR0.colors.map(c=>`<i style="background:${esc(c)}"></i>`).join('')}</div>`:''}<p class="rv tx">${esc(DR0.text||'')}</p></div>`:''}`);
    // 3. bon à savoir, liste, réponse, compte à rebours
    const infos=[...(I.infos||[]),...((I.stay&&I.stay.items)||[])];
    const GF0=I.gifts;
    const s3=blk(2,`<div class="lg-in">
        ${infos.length?ttl(S.know,2)+`<div class="lg-grid">${infos.map(x=>`<div class="rv lg-it">${ic[x.icon]||ic.info}<h4>${esc(x.title)}</h4><p>${esc(x.text)}</p>${x.url?`<a class="lk" ${lnk(x.url)}>${esc(x.link||S.site)} →</a>`:''}</div>`).join('')}</div>`:''}
        ${GF0?ttl(GF0.eyebrow||S.gifts,2)+`<p class="rv tx">${esc(GF0.text||'')}</p>${GF0.url?`<div class="rv acts"><a class="b" ${lnk(GF0.url)}>${ic.gift}${esc(GF0.label||S.giftsBtn)}</a></div>`:''}`:''}
        <div class="rv ey lg-gap">${esc(R0.eyebrow||S.rsvpT)}</div><div class="rv lg-sub" style="${nm(.7,sec[2].accent)}">${esc(R0.title||T.scenes[3][1])}</div>
        ${R0.deadline?`<p class="rv tx">${S.before} ${esc(er(zoned(R0.deadline+'T23:59',TZ).toLocaleDateString(LOC,{day:'numeric',month:'long',timeZone:TZ})))}</p>`:''}
        <div class="rv acts"><button type="button" class="b solid" data-rsvp>${ic.mail}${S.reply}</button></div>
        ${I.countdown!=='non'?`<div class="rv ey lg-gap">${S.cdEnd}</div><div class="rv">${cdHtml(true,sec[2].ink)}</div>`:''}
        <a class="lg-made" href="/" target="_blank" rel="noopener">${S.made} <b>SCEAU</b></a>
      </div>`,'lg-end');
    return `<div class="lg">${s1}${band(0)}${s2}${band(1)}${s3}</div>`;
  }

  /* ---------- montage ---------- */
  const runs=[], runOf=[];
  pages.forEach((p,i)=>{ const r=runs[runs.length-1]; if(r&&r.n===p.n) r.b=i; else runs.push({n:p.n,lt:p.lt,a:i,b:i}); runOf[i]=runs.length-1; });
  document.title=I.title||`${n1} & ${n2}`;
  const mu=I.music||T.music;
  const app=document.createElement('div'); app.id='app';
  app.innerHTML=`
    <div class="bgs" id="bgs">${LG?'':runs.map(r=>`<div class="bgl${r.lt?' light':''}"><div class="bg" style="background-image:url('${img(r.n)}')"></div></div>`).join('')}<div class="film" id="film"></div></div>
    <div class="sc${LG?' sc-long':''}" id="sc">${LG?longHtml():pages.map(p=>p.html).join('')}</div>
    ${LG&&I.demo?`<a class="lg-want" href="/#prix">${S.want}</a>`:''}
    <canvas id="fx"></canvas>
    ${I.demo?`<a class="demo-tag" href="/#demos">${S.demo} · Sceau</a>`:''}
    ${mu&&mu!=='none'?`<button type="button" class="snd" id="snd" aria-label="Musique">${ic.note.replace('<svg','<svg class="on"')}${ic.mute.replace('<svg','<svg class="off"')}</button><audio id="bgm" src="${esc(I.musicUrl||'/music/'+mu+'.mp3')}" loop preload="none"></audio>`:''}
    <div class="op" id="op" data-type="${esc(I.opening||'env')}" role="button" tabindex="0" aria-label="${S.tap}" style="--door:url('/img/open/${I.theme}-portes.webp');--cur:url('/img/open/${I.theme}-rideau.webp');--pal:${pal}${I.doormen?`;--man:url('/img/open/${I.theme}-portier.webp')`:''}">
      <div class="op-env"><div class="op-vig"></div><div class="op-env-in"><div class="op-body"></div><div class="op-fshadow"></div><div class="op-flap"><img src="/img/open/env-flap.webp" alt=""><div class="op-seal" style="background-image:url('/img/seals/${sealName}.webp')"><b style="--l:${sealL};--m:${sealM};--d:${sealD}">${esc(n1[0].toUpperCase())}<i>&amp;</i>${esc(n2[0].toUpperCase())}</b></div></div></div></div>
      <div class="op-cur"><div class="op-mono" style="${T.mono?`color:${T.mono[0]};text-shadow:${T.mono[1]}`:''}">${esc(n1[0])} &amp; ${esc(n2[0])}</div><div class="op-cur-edge"></div></div>
      <div class="op-doors"><div class="op-room"></div><div class="op-glow"></div><div class="op-doors-in"><div class="op-leaf l">${I.doormen?'<div class="op-man"></div>':''}</div><div class="op-leaf r">${I.doormen?'<div class="op-man"></div>':''}</div><div class="op-seam"></div></div></div>
      <div class="op-voile"><div class="op-sheer l"></div><div class="op-sheer r"></div><div class="op-mono" style="${T.mono?`color:${T.mono[0]};text-shadow:${T.mono[1]}`:''}">${esc(n1[0])} &amp; ${esc(n2[0])}</div></div>
      ${fam&&fam.label?`<div class="op-to">${esc(fam.label)}</div>`:''}
      <div class="op-tap">${(I.opening||'env')==='env'?S.tapSeal:S.tap}</div>
    </div>
    <div class="flash" id="flash" aria-hidden="true"></div>
    <div class="sheet" id="sheet" aria-hidden="true"><div class="sheet-in" role="dialog" aria-modal="true"><button type="button" class="x" aria-label="Fermer">×</button><div id="sheetBody"></div></div></div>`;
  const bd=document.createElement('div'); bd.className='bd'; bd.style.backgroundImage=`url('${LG?LG.base+'/'+LG.hero.src:img(1)}')`;
  document.body.append(bd,app);
  const sc=$('#sc'), secs=[...sc.querySelectorAll('.pg')], layers=[...$('#bgs').querySelectorAll('.bgl')], film=$('#film');

  /* ---------- apparition + parallaxe ---------- */
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let opened=false;
  const io=new IntersectionObserver(es=>es.forEach(en=>{
    if(en.isIntersecting&&en.intersectionRatio>.45){ const i=secs.indexOf(en.target); if(opened){ en.target.classList.add('on'); layers[runOf[i]].classList.add('on'); } bd.style.backgroundImage=`url('${en.target.dataset.img}')`; }
  }),{root:sc,threshold:[.45,.8]});
  secs.forEach(s=>io.observe(s));
  // comme le faire-part d'Inès & Jad : pendant le glissement d'une page à l'autre,
  // le décor suivant apparaît en fondu PAR-DESSUS le précédent (jamais de trait ni de trou noir),
  // les textes de la page se fondent et glissent doucement selon sa position
  const ease=x=>x*x*(3-2*x);
  // décors animés au défilement, comme notre faire-part : 24 images tirées d'une courte vidéo de chaque scène,
  // qui avancent et reculent avec le doigt. Chargées juste avant d'arriver sur la scène.
  const ANIM=new Set(I.anim||[]), FR=24, frames={};
  const frameUrl=(n,k)=>`/img/frames/${I.theme}-${n}/f${String(k+1).padStart(2,'0')}.webp`;
  function preload(key,count,url){
    if(frames[key]) return; const f=frames[key]={ready:false}; let ok=0;
    for(let k=0;k<count;k++){ const im=new Image(); im.onload=im.onerror=()=>{ if(++ok===count) f.ready=true; }; im.src=url(k); }
  }
  // transitions filmées d'une scène à la suivante : la caméra passe d'un décor à l'autre pendant le glissement,
  // sans fondu ni coupure. Au repos, c'est toujours l'image d'origine en pleine définition qui est affichée.
  const TRANS=new Set(I.trans||[]), FT=32;
  const transUrl=(key,k)=>`/img/trans/${I.theme}-${key}/f${String(k+1).padStart(2,'0')}.webp`;
  const transOf=(a,b)=>TRANS.has(a+'-'+b)?{key:a+'-'+b,rev:false}:TRANS.has(b+'-'+a)?{key:b+'-'+a,rev:true}:null;
  const setBg=(L,u)=>{ if(L._u!==u){ L._u=u; L.firstElementChild.style.backgroundImage=`url('${u}')`; } };
  let ticking=false, filmOn=false;
  function frame(){
    ticking=false; if(LG) return;
    const h=sc.clientHeight, mid=sc.scrollTop+h/2;
    const D=secs.map(s=>(mid-(s.offsetTop+Math.min(s.offsetHeight,h)/2))/h);   // 0 = page centrée, <0 = page encore en dessous
    let film_=null;
    runs.forEach((r,ri)=>{
      const L=layers[ri], d0=D[r.a], d1=D[r.b], nx=runs[ri+1];
      L.style.opacity=ri===0?1:ease(Math.max(0,Math.min(1,1+d0*1.15))).toFixed(3);
      if(!reduce&&d0>-1.3&&d1<1.3) L.style.transform=`translate3d(0,${(-(d0<0?d0:d1>0?d1:0)*3).toFixed(2)}%,0)`;
      const tr=nx&&opened&&!reduce?transOf(r.n,nx.n):null;
      if(tr){
        if(d0>-2.2&&d1<1.2) preload('t'+tr.key,FT,k=>transUrl(tr.key,k));
        if(d1>0&&d1<1) film_={tr,f:d1};
      }
      // sans transition filmée : la scène s'anime en partant (au repos, l'image d'origine reste nette)
      if(!tr&&ANIM.has(r.n)&&opened&&!reduce){
        if(d0>-2.2&&d1<1.2) preload(r.n,FR,k=>frameUrl(r.n,k));
        const pr=Math.max(0,Math.min(1,d1/.9));
        setBg(L,frames[r.n]&&frames[r.n].ready&&pr>0?frameUrl(r.n,Math.round(pr*(FR-1))):img(r.n));
      }
    });
    // la pellicule couvre l'écran pendant le passage, et s'efface aux deux bouts sur l'image d'origine (identique)
    const fr=film_&&frames['t'+film_.tr.key];
    if(fr&&fr.ready){
      const f=film_.tr.rev?1-film_.f:film_.f, k=Math.round(f*(FT-1));
      const u=transUrl(film_.tr.key,k); if(film._u!==u){ film._u=u; film.style.backgroundImage=`url('${u}')`; }
      film.style.opacity=Math.min(1,film_.f/.08,(1-film_.f)/.08).toFixed(3); filmOn=true;
    } else if(filmOn){ film.style.opacity=0; filmOn=false; }
    // les textes restent lisibles pendant la plus grande partie du glissement et ne s'estompent que près du bord :
    // on ne doit pas sentir un « changement de page », seulement le décor qui change
    secs.forEach((s,i)=>{
      const d=D[i];
      if(s.offsetHeight<=h*1.05){ const a=Math.max(0,Math.min(1,1-(Math.abs(d)-.35)*2.2)); s.style.opacity=a.toFixed(3); if(!reduce) s.style.transform=`translate3d(0,${(-d*28).toFixed(1)}px,0)`; }
    });
  }
  sc.addEventListener('scroll',()=>{ if(!ticking){ ticking=true; requestAnimationFrame(frame); } },{passive:true});
  frame();

  /* ---------- pagination ----------
     Tactile : défilement natif, CONTINU. Le doigt entraîne la page, l'élan la porte, et elle se cale doucement en
     plein écran grâce au scroll-snap « proximity » (invite.css). Le geste n'est jamais bloqué ni remplacé par un saut
     animé : l'utilisateur a refusé le swipe brusque (« comme si c'était en continu, avec des changements de décor »).
     Molette et clavier : un cran = la scène suivante, en un glissement lent qui démarre et finit en douceur ;
     une page plus haute que l'écran se lit en plusieurs crans */
  const PAGE_DUR=1100, PAGE_DUR_FILM=1600, easePage=t=>.5-Math.cos(Math.PI*t)/2, easeFilm=t=>.5-Math.cos(Math.PI*t)/2;
  let paging=false;
  function stops(){
    const h=sc.clientHeight, max=sc.scrollHeight-h, out=[];
    secs.forEach(s=>{ const t=s.offsetTop, H=s.offsetHeight; out.push(t);
      if(H>h*1.05){ for(let y=t+h*.85;y<t+H-h;y+=h*.85) out.push(Math.round(y)); out.push(t+H-h); } });
    return [...new Set(out.map(y=>Math.max(0,Math.min(max,Math.round(y)))))].sort((a,b)=>a-b);
  }
  function glide(to,slow){
    const from=sc.scrollTop; if(Math.abs(to-from)<2) return;
    // un passage filmé d'un décor à l'autre prend un peu plus de temps, pour qu'on voie le voyage.
    // Pendant le glissement, le snap natif est coupé : sinon il « saute » sur la page dès qu'on s'en approche
    paging=true; sc.style.scrollSnapType='none'; const t0=performance.now(), dur=reduce?1:slow?PAGE_DUR_FILM:PAGE_DUR;
    const ez=slow?easeFilm:easePage;
    (function step(now){ const p=Math.min(1,(now-t0)/dur); sc.scrollTop=from+(to-from)*ez(p);
      if(p<1) requestAnimationFrame(step); else { paging=false; sc.style.scrollSnapType=''; } })(t0);
  }
  function go(dir){
    if(!opened||paging) return;
    const cur=sc.scrollTop, st=stops();
    const to=dir>0?st.find(y=>y>cur+4):st.slice().reverse().find(y=>y<cur-4);
    if(to===undefined) return;
    const at=y=>{ let k=0; secs.forEach((s,i)=>{ if(s.offsetTop<=y+4) k=i; }); return runOf[k]; };
    const ra=at(cur), rb=at(to);
    glide(to,ra!==rb&&!!transOf(runs[ra].n,runs[rb].n));
  }
  // calage : on termine le mouvement dans le sens du geste (dès 12 % de chemin parcouru), sinon vers la page la plus proche
  let lastTop=0, dir=1;
  function settle(){
    if(!opened||paging||LG) return; const cur=sc.scrollTop, st=stops();
    const prev=st.slice().reverse().find(y=>y<=cur+2), next=st.find(y=>y>cur+2); let to;
    if(prev==null) to=next; else if(next==null) to=prev; else { const f=(cur-prev)/(next-prev); to=dir>0?(f>.12?next:prev):(f<.88?prev:next); }
    if(to!=null) glide(to);
  }
  // tactile : le défilement natif fait le travail (le doigt entraîne la page, l'élan la porte, le snap « proximity »
  // la cale quand elle est proche d'une page). Si le geste s'arrête entre deux pages, un calage doux (le même
  // glissement lent que la molette) termine le mouvement une fois le doigt levé et l'élan fini : jamais de page
  // à moitié. Avant l'ouverture, on ne défile pas.
  let touching=false, settleT=null;
  const armSettle=()=>{ clearTimeout(settleT); settleT=setTimeout(()=>{ if(!touching&&!paging&&opened&&!LG) settle(); },160); };
  sc.addEventListener('touchstart',()=>{ touching=true; clearTimeout(settleT); },{passive:true});
  sc.addEventListener('touchmove',e=>{ if(!opened) e.preventDefault(); },{passive:false});
  sc.addEventListener('touchend',()=>{ touching=false; armSettle(); },{passive:true});
  sc.addEventListener('touchcancel',()=>{ touching=false; armSettle(); },{passive:true});
  sc.addEventListener('scroll',()=>{ const t=sc.scrollTop; if(t!==lastTop) dir=t>lastTop?1:-1; lastTop=t; if(!touching&&!paging) armSettle(); },{passive:true});
  // molette / trackpad : un geste = une page (l'inertie du trackpad ne fait pas sauter plusieurs pages)
  let lastWheel=0, wheelUsed=false;
  sc.addEventListener('wheel',e=>{
    if(!opened||LG) return; e.preventDefault();
    const now=performance.now(); if(now-lastWheel>220) wheelUsed=false; lastWheel=now;
    if(wheelUsed||paging||Math.abs(e.deltaY)<6) return;
    wheelUsed=true; go(e.deltaY>0?1:-1);
  },{passive:false});
  addEventListener('keydown',e=>{
    if(!opened||LG||sheet.classList.contains('on')||/INPUT|TEXTAREA|SELECT/.test((document.activeElement||{}).tagName||'')) return;
    if(['ArrowDown','PageDown',' '].includes(e.key)){ e.preventDefault(); go(1); }
    else if(['ArrowUp','PageUp'].includes(e.key)){ e.preventDefault(); go(-1); }
  });
  addEventListener('resize',()=>{ frame(); settle(); });
  // précharge les images des pages suivantes
  [...new Set(pages.map(p=>p.n))].forEach(n=>{ const im=new Image(); im.src=img(n); });

  function longStart(){
    const rio=new IntersectionObserver(es=>es.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add('on'); rio.unobserve(en.target); } }),{root:sc,threshold:.18});
    sc.querySelectorAll('.lg .rv').forEach(el=>rio.observe(el));
    const sp=[...sc.querySelectorAll('[data-sp]')]; let tk=false;
    const par=()=>{ tk=false; if(reduce) return; const vh=sc.clientHeight;
      sp.forEach(el=>{ const r=el.parentNode.getBoundingClientRect(); if(r.bottom<-vh||r.top>2*vh) return;
        const k=+el.dataset.sp, off=el.classList.contains('lg-hero-txt')?sc.scrollTop*k:((r.top+r.height/2)-vh/2)*k;
        el.style.transform=el.closest('.lg-band')?`translate3d(0,calc(-50% + ${off.toFixed(1)}px),0)`:`translate3d(0,${off.toFixed(1)}px,0)`; }); };
    sc.addEventListener('scroll',()=>{ if(!tk){ tk=true; requestAnimationFrame(par); } },{passive:true}); par();
  }

  /* ---------- compte à rebours ---------- */
  function tick(){
    const ms=Math.max(0,main-Date.now()), v={d:Math.floor(ms/864e5),h:Math.floor(ms/36e5)%24,m:Math.floor(ms/6e4)%60,s:Math.floor(ms/1e3)%60};
    sc.querySelectorAll('.cd b').forEach(b=>{ b.textContent=String(v[b.dataset.u]).padStart(b.dataset.u==='d'?1:2,'0'); });
  }
  tick(); setInterval(tick,1000);

  /* ---------- musique ---------- */
  const bgm=$('#bgm'), snd=$('#snd');
  let wantMusic=true;
  function syncSnd(){ if(snd) snd.classList.toggle('muted',!bgm||bgm.paused); }
  function playMusic(){ if(!bgm||!wantMusic) return; bgm.volume=.75; bgm.play().then(syncSnd).catch(syncSnd); }
  if(snd) snd.onclick=()=>{ if(bgm.paused){ wantMusic=true; playMusic(); } else { wantMusic=false; bgm.pause(); syncSnd(); } };
  document.addEventListener('visibilitychange',()=>{ if(!bgm) return; if(document.hidden) bgm.pause(); else if(wantMusic&&opened) playMusic(); });

  /* ---------- ouverture ---------- */
  const op=$('#op');
  // une seule arche continue, comme le faire-part d'Inès & Jad : l'ouverture commence, la lumière monte,
  // le passage vers la première page se fait sous le pic blanc, puis la lumière se retire et dévoile la page déjà nette
  // enveloppe : la lumière monte à 1 s et la page apparaît sous le pic, comme le faire-part d'Inès & Jad.
  // rideau, portes et voile : la lumière part AU TOUCHER (flash:0), en même temps que le mouvement, et monte
  // doucement avec lui (jamais de plein écran blanc) ; la page est déjà vivante derrière (on la voit à travers
  // l'entrebâillement, ou dès que les pans s'écartent), et le rideau / les battants s'effacent en fondu alors
  // qu'ils finissent de s'ouvrir : tout s'enchaîne, aucun temps mort sur de la lumière (voir CLAUDE.md, règle 15).
  const SEQ={env:{flash:1000,on:1530,gone:1560},cur:{flash:0,on:320,gone:760,cls:'soft'},door:{flash:0,on:200,gone:1750,cls:'door'},voile:{flash:0,on:150,gone:1500,cls:'door'}};
  function open(){
    if(op.classList.contains('opening')) return;
    op.classList.add('opening'); playMusic();
    const q=SEQ[op.dataset.type]||SEQ.env, flash=$('#flash');
    if(q.cls) flash.classList.add(q.cls);
    if(q.flash) setTimeout(()=>flash.classList.add('bloom'),q.flash); else flash.classList.add('bloom');
    setTimeout(()=>{ app.classList.add('opened'); opened=true; sc.scrollTop=0; if(secs[0]) secs[0].classList.add('on'); if(layers[0]) layers[0].classList.add('on'); startFx(); setTimeout(frame,1500); if(LG) longStart(); },q.on);
    setTimeout(()=>op.classList.add('gone'),q.gone);
    setTimeout(()=>{ op.remove(); flash.remove(); },Math.max((q.flash||0)+1800,q.gone+1400));
  }
  op.addEventListener('click',open);
  op.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); open(); } });

  /* ---------- particules ----------
     Des choses peintes qui tombent (ou montent) : pétales, feuilles, confettis d'or, œillets d'Inde, fleurs,
     graines de pissenlit, lanternes. Chaque particule est un vrai sprite peint (img/fx/<famille>-<i>.webp,
     découpés par business/tools/fx-sprites.py à partir d'une planche gemini.py), posé avec de la profondeur
     (les lointains sont plus petits, plus pâles et plus lents), une culbute (le sprite se retourne sur lui-même),
     un balancement propre et un vent commun qui va et vient. Le mouvement est en temps réel (indépendant du
     nombre d'images par seconde). */
  function startFx(){
    const kind=I.particles||T.particles||'none'; if(kind==='none'||reduce) return;
    const cv=$('#fx'), cx=cv.getContext('2d'); let W=0,H=0,dpr=1;
    function size(){ dpr=Math.min(2,devicePixelRatio||1); W=cv.clientWidth; H=cv.clientHeight; cv.width=W*dpr; cv.height=H*dpr; cx.setTransform(dpr,0,0,dpr,0,0); }
    size(); addEventListener('resize',size);
    // réglages par famille : nombre, taille (px, au premier plan), vitesse verticale (px/s, négatif = monte),
    // balancement, culbute (vitesse de retournement), lumineux (scintillement, halo dans le sprite)
    const P={
      petals:  {n:14,sz:[22,44],sp:[26,58],sway:1,  tumble:1},
      roses:   {n:12,sz:[26,52],sp:[30,64],sway:.9, tumble:1},
      confetti:{n:22,sz:[10,20],sp:[45,95],sway:.8, tumble:1.7},
      marigold:{n:12,sz:[24,52],sp:[34,74],sway:.7, tumble:.8,flipMin:.5},
      seeds:   {n:9, sz:[36,64],sp:[-9,-24],sway:1.6,tumble:.25,flipMin:.8},
      leaves:  {n:10,sz:[30,60],sp:[30,68],sway:1.3,tumble:1.1},
      daisies: {n:12,sz:[26,54],sp:[34,70],sway:.7, tumble:.7,flipMin:.55},
      blossoms:{n:11,sz:[22,48],sp:[26,58],sway:.9, tumble:.8,flipMin:.4},
      lanterns:{n:7, sz:[42,96],sp:[-7,-20],sway:.5,tumble:0,flipMin:1,glow:true}
    }[kind]; if(!P) return;
    const R=(a,b)=>a+Math.random()*(b-a);
    // les sprites : index.json dit combien il y en a par famille ; on les charge et on dessine ceux qui sont prêts
    let imgs=[];
    fetch('/img/fx/index.json').then(r=>r.json()).then(idx=>{
      const n=idx[kind]||0; imgs=Array.from({length:n},(_,i)=>{ const im=new Image(); im.src=`/img/fx/${kind}-${i}.webp`; return im; });
    }).catch(()=>{});
    const up=P.sp[0]<0;
    const mk=(init)=>{
      const z=R(0,1);                                   // profondeur : 0 = lointain, 1 = premier plan
      const s=R(...P.sz)*(.45+.55*z);
      return {z,s,x:R(-s,W+s),y:init?R(-s,H+s):(up?H+s:-s),v:R(...P.sp)*(.5+.5*z),
        a:R(0,6.28),va:R(-.9,.9)*(P.tumble||.4),             // rotation dans le plan (rad/s)
        tp:R(0,6.28),tv:R(.6,1.6)*P.tumble,                   // culbute : le sprite se retourne autour de son axe
        wp:R(0,6.28),wf:R(.5,1.1),                            // balancement propre (phase, fréquence)
        i:Math.floor(R(0,999)),o:P.glow?1:(.55+.45*z),born:0,age:0};
    };
    const ps=Array.from({length:P.n},()=>mk(true)).sort((a,b)=>a.z-b.z);   // les lointains se dessinent sous les proches
    let run=true, last=performance.now(), t=0;
    document.addEventListener('visibilitychange',()=>{ run=!document.hidden; if(run){ last=performance.now(); requestAnimationFrame(loop); } });
    function loop(now){
      if(!run) return;
      const dt=Math.min(.05,(now-last)/1000); last=now; t+=dt;
      const wind=Math.sin(t*.21)*14+Math.sin(t*.07)*10;      // vent commun, qui va et vient lentement (px/s)
      cx.clearRect(0,0,W,H);
      for(let k=0;k<ps.length;k++){
        const p=ps[k]; p.age+=dt;
        p.y+=p.v*dt;
        p.x+=(wind*(.4+.6*p.z)+Math.sin(t*p.wf*1.9+p.wp)*22*P.sway*p.z)*dt;
        p.a+=p.va*dt; p.tp+=p.tv*dt;
        if(up?p.y<-p.s*1.2:p.y>H+p.s*1.2){ ps[k]=mk(false); continue; }
        if(p.x<-p.s*1.5) p.x=W+p.s; else if(p.x>W+p.s*1.5) p.x=-p.s;
        const n=imgs.length; if(!n) continue;
        const im=imgs[p.i%n]; if(!im.complete||!im.naturalWidth) continue;
        const w=p.s, h=p.s*im.naturalHeight/im.naturalWidth;
        // culbute : de profil, un pétale n'est plus qu'un fil (.18) ; une fleur ou une lanterne ne s'aplatit pas autant (flipMin)
        let flip=Math.cos(p.tp); const fm=P.flipMin||.18; if(Math.abs(flip)<fm) flip=flip<0?-fm:fm;
        let o=p.o*Math.min(1,p.age/.9);                                        // apparition en fondu
        if(P.glow) o*=.78+.22*Math.sin(t*2.1+p.wp);                            // scintillement des lanternes
        cx.save(); cx.translate(p.x,p.y); cx.rotate(p.a); cx.scale(flip,1); cx.globalAlpha=o;
        // thèmes clairs : une ombre portée douce, sinon une graine blanche ou un pétale pâle se perd sur le papier
        if(T.light&&!P.glow){ cx.shadowColor='rgba(70,45,20,.38)'; cx.shadowBlur=3+7*p.z; cx.shadowOffsetY=2+3*p.z; }
        cx.drawImage(im,-w/2,-h/2,w,h); cx.restore();
      }
      cx.globalAlpha=1;
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  /* ---------- feuilles ---------- */
  const sheet=$('#sheet'), sheetBody=$('#sheetBody');
  function openSheet(html){ sheetBody.innerHTML=html; sheet.classList.add('on'); sheet.setAttribute('aria-hidden','false'); }
  function closeSheet(){ sheet.classList.remove('on'); sheet.setAttribute('aria-hidden','true'); }
  sheet.addEventListener('click',e=>{ if(e.target===sheet||e.target.closest('.x')) closeSheet(); });
  addEventListener('keydown',e=>{ if(e.key==='Escape') closeSheet(); });

  /* ---------- calendrier ---------- */
  const stamp=d=>d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
  function calSheet(id){
    const e=events.find(x=>x.id===id), d=zoned(e.start,e.tz), end=e.end?zoned(e.end,e.tz):new Date(+d+3*36e5);
    const title=`${e.calTitle||e.eyebrow||e.title} · ${n1} & ${n2}`, loc=e.address||e.place||'';
    const g=`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${stamp(d)}/${stamp(end)}&location=${encodeURIComponent(loc)}&details=${encodeURIComponent(location.href.split('#')[0])}`;
    const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Sceau//FR','CALSCALE:GREGORIAN','BEGIN:VEVENT',`UID:${I.slug}-${e.id}@sceau`,`DTSTAMP:${stamp(new Date())}`,`DTSTART:${stamp(d)}`,`DTEND:${stamp(end)}`,
      `SUMMARY:${title.replace(/[,;]/g,'\\$&')}`,`LOCATION:${loc.replace(/[,;]/g,'\\$&')}`,`URL:${location.href.split('#')[0]}`,'END:VEVENT','END:VCALENDAR'].join('\r\n');
    const href=URL.createObjectURL(new Blob([ics],{type:'text/calendar'}));
    openSheet(`<h3>${S.calT}</h3><p class="sub">${esc(e.title)} · ${esc(fmtDayShort(d,e.tz))}, ${esc(fmtTime(d,e.tz))}</p><div class="cal"><a href="${g}" target="_blank" rel="noopener">${S.gcal}<span>→</span></a><a href="${href}" download="${esc(I.slug+'-'+e.id)}.ics">${S.ical}<span>→</span></a></div>`);
  }

  /* ---------- réponse (RSVP) ---------- */
  const KEY='sceau-rsvp-'+I.slug+(fid?'-'+fid:'');
  // lien personnel d'un invité (?r=identifiant.clé) : on récupère sa réponse pour la pré-remplir sur ce téléphone
  const rParam=new URLSearchParams(location.search).get('r');
  if(rParam&&!I.demo) fetch(`/api/rsvp?invite=${encodeURIComponent(I.slug)}&r=${encodeURIComponent(rParam)}`).then(r=>r.ok?r.json():null).then(j=>{
    if(!j||!j.reply) return; const [rid,rkey]=rParam.split('.');
    try{ localStorage.setItem(KEY,JSON.stringify(Object.assign({},j.reply,{rid,rkey}))); }catch(e){}
  }).catch(()=>{});
  const editUrl=p=>{ const u=new URL(location.href); u.search=''; u.hash=''; if(fid) u.searchParams.set('f',fid); u.searchParams.set('r',p.rid+'.'+p.rkey); return u.toString(); };
  function rsvpSheet(){
    let prev=null; try{ prev=JSON.parse(localStorage.getItem(KEY)||'null'); }catch(e){}
    const max=(fam&&fam.seats)||R.maxGuests||6;
    const evRows=events.map(e=>{ const d=zoned(e.start,e.tz); return `<div class="ev"><b>${esc(e.eyebrow||e.title)}</b><small>${esc(e.title)} · ${esc(fmtDayShort(d,e.tz))}</small><div class="yn">`+
      `<label><input type="radio" name="ev-${esc(e.id)}" value="1" ${prev&&prev.events&&prev.events[e.id]===true?'checked':''}><span>${S.present}</span></label>`+
      `<label><input type="radio" name="ev-${esc(e.id)}" value="0" ${prev&&prev.events&&prev.events[e.id]===false?'checked':''}><span>${S.absent}</span></label></div></div>`; }).join('');
    openSheet(`<h3>${S.rsvpT}</h3><p class="sub">${esc(prev&&prev.name?S.already:(R.subtitle||S.rsvpSub))}</p>
      <form id="rf" novalidate>
        <label class="f"><span>${S.name}</span><input name="name" autocomplete="name" required maxlength="120" value="${esc(prev?prev.name:(fam&&fam.name)||'')}"></label>
        ${evRows}
        <label class="f"><span>${S.guests}</span><select name="guests">${Array.from({length:max},(_,i)=>`<option ${prev&&+prev.guests===i+1?'selected':''}>${i+1}</option>`).join('')}</select></label>
        ${R.diet!==false?`<label class="f"><span>${S.diet}</span><input name="diet" maxlength="200" value="${esc(prev?prev.diet||'':'')}"></label>`:''}
        <label class="f"><span>${S.msg}</span><textarea name="message" maxlength="1000">${esc(prev?prev.message||'':'')}</textarea></label>
        <label class="hp" aria-hidden="true">Site<input name="website" tabindex="-1" autocomplete="off"></label>
        <button class="go" type="submit">${S.send}</button>
        <p class="err" id="rerr" hidden></p>
        <p class="note">${I.demo?S.demoNote+' ':''}${S.privacy} <a href="/confidentialite/" target="_blank" rel="noopener">${L==='en'?'Privacy':'Confidentialité'}</a></p>
      </form>`);
    $('#rf').addEventListener('submit',async ev=>{
      ev.preventDefault();
      const f=ev.currentTarget, fd=new FormData(f), err=$('#rerr');
      const data={invite:I.slug,rid:prev&&prev.rid||undefined,rkey:prev&&prev.rkey||undefined,family:fid||null,name:(fd.get('name')||'').trim(),guests:+fd.get('guests')||1,diet:(fd.get('diet')||'').trim(),message:(fd.get('message')||'').trim(),website:fd.get('website')||'',events:{}};
      let ok=!!data.name; events.forEach(e=>{ const v=fd.get('ev-'+e.id); if(v==null) ok=false; else data.events[e.id]=v==='1'; });
      if(!ok){ err.textContent=S.need; err.hidden=false; return; }
      const btn=f.querySelector('.go'); btn.disabled=true; btn.textContent=S.sending; err.hidden=true;
      try{
        if(!I.demo){ const r=await fetch('/api/rsvp',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}); if(!r.ok) throw new Error(r.status);
          const j=await r.json().catch(()=>({})); if(j.rid){ data.rid=j.rid; data.rkey=j.rkey; } }
        delete data.website; try{ localStorage.setItem(KEY,JSON.stringify(data)); }catch(e){}
        const yes=Object.values(data.events).some(Boolean);
        sheetBody.innerHTML=`<div class="done-msg"><div class="big">${S.thanks}</div><p>${esc(yes?(R.yesText||''):(R.noText||''))}</p><p class="note">${S.saved}</p>${data.rid?`<div class="edit-link"><p class="note">${S.editT}</p><input readonly value="${esc(editUrl(data))}" aria-label="Lien"><button type="button" class="b" data-copy style="color:#2a2620">${S.copy}</button></div>`:''}${I.demo?`<p class="note">${S.demoNote}</p><p><a class="b" style="color:#2a2620" href="/tableau/?demo=${esc(I.slug)}" target="_blank" rel="noopener">${S.demoDash}</a></p>`:''}</div>`;
      }catch(e){ btn.disabled=false; btn.textContent=S.send; err.textContent=S.fail; err.hidden=false; }
    });
  }
  // lien de modification de la réponse : bouton « Copier » dans la fenêtre de réponse
  sheetBody.addEventListener('click',e=>{ const b=e.target.closest('[data-copy]'); if(!b) return; const inp=b.parentNode.querySelector('input');
    (navigator.clipboard?navigator.clipboard.writeText(inp.value):Promise.reject()).catch(()=>{ inp.select(); document.execCommand('copy'); }).finally(()=>{ b.textContent=S.copied; }); });
  sc.addEventListener('click',e=>{
    const c=e.target.closest('[data-cal]'); if(c){ calSheet(c.dataset.cal); return; }
    if(e.target.closest('[data-rsvp]')) rsvpSheet();
    if(e.target.closest('[data-demo]')){ e.preventDefault(); openSheet(`<h3>${S.demo}</h3><p class="sub">${S.demoLink}</p>`); }
  });
  if(location.hash==='#rsvp'){ open(); setTimeout(()=>{ sc.scrollTop=sc.scrollHeight; },400); }
})();
