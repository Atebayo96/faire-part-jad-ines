/* Sceau : moteur de faire-part.
   Lit window.INVITE (fiche du couple, voir business/invites/*.json) et window.SCEAU_THEMES (themes.js),
   puis construit : ouverture, pages animées, date à découvrir (reveal.js), musique, compte à rebours, itinéraires, calendrier, réponses. */
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
      gifts:'Liste de mariage',giftsBtn:'Voir la liste',photos:'Vos photos',photosBtn:'Partager mes photos',dayJ:'Le jour J',table:'Votre table',tableTx:'Le plan de salle sera aussi affiché à l’entrée.',site:'Ouvrir',give:'Je l’offre',given:'Déjà offert',giveT:'Vous offrez',giveName:'Votre prénom',giveGo:'C’est noté',giveOk:'Ce cadeau est réservé à votre nom, personne d’autre ne pourra le choisir.',giveTaken:'Quelqu’un vient de le réserver. Choisissez-en un autre.',giveErr:'Impossible de réserver pour l’instant. Réessayez dans un moment.',copyLink:'Copier le lien',scan:'Scannez ou copiez le lien',kitty:'Participer',
      who:'Qui vous accompagne ?',person:'Prénom et nom',menu:'Menu',addPerson:'+ Une personne',rm:'Retirer',waT:'Vous préférez répondre de vive voix ?',wa:'Répondre sur WhatsApp',waMsg:'Bonjour, c’est {name}. Pour votre mariage : ',
      later:'Pas maintenant ?',remind:'Me rappeler de répondre',remindT:'Répondre au faire-part de {names}',remindTx:'Une réponse par foyer suffit : ',menuPick:'Choisir'},
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
      gifts:'Gift list',giftsBtn:'View the list',photos:'Your photos',photosBtn:'Share my photos',dayJ:'On the day',table:'Your table',tableTx:'The seating plan will also be displayed at the entrance.',site:'Open',give:'I’ll give it',given:'Already taken',giveT:'You are giving',giveName:'Your name',giveGo:'Confirm',giveOk:'This gift is reserved in your name, nobody else can pick it.',giveTaken:'Someone just reserved it. Please choose another one.',giveErr:'Could not reserve right now. Please try again shortly.',copyLink:'Copy the link',scan:'Scan or copy the link',kitty:'Contribute',
      who:'Who is coming with you?',person:'First and last name',menu:'Menu',addPerson:'+ Add a person',rm:'Remove',waT:'Prefer to reply in person?',wa:'Reply on WhatsApp',waMsg:'Hello, it’s {name}. About your wedding: ',
      later:'Not now?',remind:'Remind me to reply',remindT:'Reply to {names}’s invitation',remindTx:'One reply per household is enough: ',menuPick:'Choose'}
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
  const n1=I.couple[0], n2=I.couple[1]||'';
  /* un seul prénom : faire-part d'un seul événement (le sbouâ de l'enfant, le henné de la mariée), voir CLAUDE.md règle 35 */
  const solo=!n2;
  const namesH=(sep='&amp;')=>solo?esc(n1):`${esc(n1)} ${sep} ${esc(n2)}`;
  const iniH=()=>solo?esc(n1[0].toUpperCase()):`${esc(n1[0].toUpperCase())}<i>&amp;</i>${esc(n2[0].toUpperCase())}`;
  const monoT=solo?esc(n1[0]):`${esc(n1[0])} &amp; ${esc(n2[0])}`;
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
  // ?v= : à augmenter quand on remplace des décors, pour que les navigateurs ne gardent pas l'ancienne image
  /* du jour au soir : un thème peut avoir sa version de jour (T.jour, ex. Dolce Vita -> dolcevitajour). Un événement qui
     commence avant 18 h prend le lieu peint en plein jour (s'il existe), après 18 h celui du crépuscule ; l'accueil suit
     le premier événement, les dernières pages (programme, infos, réponse) le dernier. « Le faire-part doit vivre : si le
     mariage commence la journée et que le soir c'est la salle ». Clé de décor : 'j:<scène ou lieu>' pour le jour. */
  const J=T.jour&&window.SCEAU_THEMES[T.jour]||null, SOIR=18;
  const isJ=n=>String(n).startsWith('j:'), jk=n=>String(n).slice(2);
  const hourOf=e=>{ const m=/T(\d{1,2})/.exec(e&&e.start||''); return m?+m[1]:12; };
  const dayKey=(k,day)=>day&&J&&(/^\d+$/.test(String(k))||k==='fond'||(J.lieux||[]).includes(k)||Object.values(J.pageImg||{}).includes(k))?'j:'+k:k;
  const IMGV=19, img=n=>isJ(n)?`/img/hd/${T.jour}-${jk(n)}.webp?v=${IMGV}`:`/img/hd/${I.theme}-${n}.webp?v=${IMGV}`;
  // calques : pour les scènes qui en ont (build-site.py liste img/calques/<thème>-<n>.webp), le décor est le fond calme du
  // thème et le sujet détouré est posé ENTIER en bas de l'écran (plus de rognage selon le téléphone), avec un peu de profondeur
  const CAL=new Set(I.calques||[]), hasCal=n=>CAL.has(String(n)), fond=`/img/hd/${I.theme}-ciel.webp?v=${IMGV}`, cal=n=>`/img/calques/${I.theme}-${n}.webp?v=${IMGV}`;
  // texte blanc : une scène marquée 'dark', ou un lieu sombre de la bibliothèque (darkLieux : le dîner de nuit de « Plein jour »)
  const isDark=n=>{ const t=isJ(n)?J:T, k=isJ(n)?jk(n):n; return /^\d+$/.test(String(k))?(t.scenes[k-1]||[])[4]==='dark':(t.darkLieux||[]).includes(k); };

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

  /* ---------- chaîne continue (6 octobre 2026) ----------
     Le faire-part est UNE peinture verticale (img/chaine/<thème>/strip.webp, tools/chaine.py) : chaque moment est la suite
     du précédent, la lumière tourne du jour à la nuit. Ancres : où se pose l'écran de l'accueil, de chaque événement, des
     infos et de la réponse, avec la couleur de texte qui s'y lit (dark = texte blanc). « Quand je swipe l'image d'après,
     que ce soit comme une seule chaîne. » */
  const CH=I.chain&&I.chain.anchors?I.chain:null;
  const chA=r=>CH?CH.anchors.filter(a=>a.role===r):[];
  let ROLE='home', EVI=0;
  const chDark=()=>{ if(!CH) return null; const ev=chA('event'), pick={home:chA('home')[0],pre:chA('home')[0],event:ev[Math.min(EVI,ev.length-1)],post:chA('info')[0]||chA('rsvp')[0],rsvp:chA('rsvp')[0]}[ROLE]; return pick?!!pick.dark:null; };
  /* ---------- pages ---------- */
  const pages=[];
  let rvI=0;
  function page(n,inner,opts={}){
    rvI=0;
    const Tn=isJ(n)?J:T, cd=chDark(), dark=cd!=null?cd:opts.dark!=null?opts.dark:isDark(n), lt=CH?!dark:Tn.light&&!dark;
    const ink=CH&&CH.ink||{};
    const c=CH?{nm:lt?(ink.nm||'#193f64'):'#fff',ey:lt?(ink.ey||ink.nm||'#193f64'):'#fff',tx:lt?(ink.tx||ink.nm||'#193f64'):'#fff'}:{nm:lt?Tn.color:'#fff',ey:lt?(Tn.ey||Tn.color):'#fff',tx:lt?(Tn.tx||Tn.color):'#fff'};
    const body=inner(c,lt);
    // le décor n'est pas dans la page : un calque fixe par scène (plusieurs pages d'affilée peuvent partager la même scène,
    // le décor reste alors en place : aucune coupure). Pas de voile sombre sous le texte : il « apparaissait » au swipe
    // sans que l'image change, l'utilisateur l'a fait retirer (voir CLAUDE.md).
    pages.push({n,lt,role:ROLE,evi:EVI,
      html:`<section class="pg${lt?' light':''}${opts.cls?' '+opts.cls:''}"${ROLE==='event'?` data-ev="${EVI}"`:''} data-img="${img(n)}" style="${esc(opts.style||'')}">${body}</section>`});
  }
  const cdHtml=(big,col)=>`<div class="cd${big?' big':''}" style="color:${col}">${['d','h','m','s'].map((u,i)=>`<div><b data-u="${u}">0</b><span>${[S.days,S.hours,S.min,S.sec][i]}</span></div>`).join('')}</div>`;
  const oval=!!T.top1, compact=!!T.compact;
  const RVL=window.SceauReveal&&SceauReveal.kinds.includes(I.reveal)?I.reveal:null;
  // chapeau de l'accueil : « Bismillah » s'écrit en arabe, en calligraphie (ligature basmala, voir themes.js), de droite à gauche
  const eyHtml=(cls,t,st)=>{ const e=window.sceauEy(t); return `<div class="${cls}${e.ar?' ar':''}"${e.ar?` lang="ar" dir="rtl" aria-label="${esc(window.SCEAU_BASMALA_LABEL)}"`:''} style="${st}">${esc(e.text)}</div>`; };

  // jour ou soir pour l'accueil (premier événement) et les dernières pages (dernier événement)
  // la date dans la couleur du couple, sauf si elle est trop claire pour un fond clair (de l'or sur un ciel pâle) : l'encre du thème
  const palLum=(h=>{ const n=parseInt((h||'#000').slice(1,7),16), f=v=>{ v/=255; return v<=.03928?v/12.92:((v+.055)/1.055)**2.4; }; return .2126*f(n>>16&255)+.7152*f(n>>8&255)+.0722*f(n&255); })(pal);
  const K1=dayKey(1,events.length&&hourOf(events[0])<SOIR), K4=dayKey(4,events.length&&hourOf(events[events.length-1])<SOIR);
  // 1. accueil
  page(K1,(c,lt)=>{
    const names=T.stack&&!solo?`${esc(n1)}<br>&amp; ${esc(n2)}`:namesH();
    return (fam&&fam.label?`<div class="rv greet" style="--i:${rvI++};color:${c.tx}">${esc(fam.label)}</div>`:'')+
      (oval||compact?'':`<div class="rv seal" style="--i:${rvI++};background-image:url('/img/seals/${sealName}.webp')"><b style="--l:${sealL};--m:${sealM};--d:${sealD}">${iniH()}</b></div>`)+
      eyHtml('rv ey',I.intro&&I.intro.eyebrow||T.scenes[0][0],`--i:${rvI++};color:${c.ey}`)+
      `<div class="rv nm" style="--i:${rvI++};${esc(nmCss(T.stack?.82:1,c.nm))}">${names}</div>`+
      (oval||compact?'':`<div class="rv tx" style="--i:${rvI++};color:${c.tx}">${esc(I.intro&&I.intro.text||S.joy)}</div>`)+
      // date à découvrir (grattage, roue, jackpot) : le compte à rebours et l'invitation à défiler n'apparaissent qu'une fois la date trouvée
      (RVL?`<div class="rv" data-rvl style="--i:${rvI++};width:100%;color:${c.tx}"></div>`:'')+
      (!RVL||RVL==='wheel'?`<div class="rv dl${RVL?' rvl-later':''}" style="--i:${rvI++};color:${lt?(palLum<.3?pal:c.ey):'#fff'}"><i></i><span>${esc(I.intro&&I.intro.dateText||fmtDay(main))}</span><i></i></div>`:'')+
      (I.countdown==='debut'?`<div class="rv${RVL?' rvl-later':''}" style="--i:${rvI++}">${cdHtml(false,c.tx)}</div>`:'')+
      `<div class="hint${RVL?' rvl-later':''}" style="color:${c.ey}">${S.scroll} ↓</div>`;
  },{style:oval?'padding-top:'+T.top1:''});

  // décor d'un événement : un lieu de la bibliothèque du thème (lieu: 'mairie' | 'eglise' | 'salle' | 'jardin' | 'plage'),
  // bg: 'simple' = écran simple, le texte sur le fond du tableau (img/hd/<thème>-fond.webp), ou une scène du thème (scene: 2)
  const evImg=(e,i)=>dayKey(e.bg==='simple'?'fond':(e.lieu||e.scene||[2,3][i%2]),hourOf(e)<SOIR);
  const rv=(cls,col,inner,st='')=>`<div class="rv ${cls}" style="--i:${rvI++};${col?'color:'+col+';':''}${st}">${inner}</div>`;
  const head=(c,ey,title,k=.74)=>rv('ey',c.ey,esc(ey))+(title?rv('nm',null,esc(title),esc(nmCss(k,c.nm))):'');
  // dans les démos, les liens externes (liste, album, hôtel) ouvrent une explication au lieu d'un faux site
  const lnk=u=>u==='demo'?'href="#" data-demo':`href="${esc(u)}" target="_blank" rel="noopener"`;
  /* liste de mariage, trois façons (gifts.mode) :
     'liste'    : la liste est chez nous, chaque cadeau se réserve d'un toucher (prénom), une seule fois (/api/gifts) ;
     'cagnotte' : un QR code à scanner, le lien à copier et le bouton Participer ;
     'lien'     : un bouton vers une liste tenue ailleurs (comportement d'origine, aussi sans mode). */
  function giftBody(G,col,lt){
    if(G.mode==='liste'&&(G.items||[]).length) return rv('card gl',col,G.items.map((x,k)=>{ const id=x.id||'g'+k;
      return `<div class="it gl-it" data-g="${esc(id)}"><div><h4>${esc(x.name)}</h4>${x.price?`<p>${esc(x.price)}${/\d$/.test(String(x.price))?' €':''}</p>`:''}</div><button type="button" class="gl-b" data-give="${esc(id)}" data-gname="${esc(x.name)}">${S.give}</button></div>`; }).join(''),'background:'+cardBg(lt));
    if(!G.url) return '';
    const btn=`<a class="b" ${lnk(G.url)}>${ic.gift}${esc(G.label||(G.mode==='cagnotte'?S.kitty:S.giftsBtn))}</a>`;
    if(G.mode!=='cagnotte'||G.url==='demo') return rv('acts',col,btn);
    return rv('gq',col,`<div class="gq-c" data-qr="${esc(G.url)}" role="img" aria-label="${esc(S.scan)}"></div><div class="gq-r"><p>${S.scan}</p><div class="gq-l"><input readonly value="${esc(G.url)}" aria-label="${esc(S.copyLink)}"><button type="button" data-gcopy>${S.copyLink}</button></div></div>`)+rv('acts',col,btn);
  }
  const cardBg=lt=>lt?'rgba(255,255,255,.55)':'rgba(0,0,0,.28)';
  const lastScene=events.length?evImg(events[events.length-1],events.length-1):2;
  /* une scène propre à chaque écran d'après les événements (T.pageImg : programme, dress code, hébergement, infos), pour
     qu'une même image ne revienne pas sur trois pages ; chaque image ne sert qu'une fois, sinon l'écran garde son décor */
  const PI=T.pageImg||{}, usedPI=new Set(), lastDay=events.length&&hourOf(events[events.length-1])<SOIR;
  const pk=(name,fb)=>{ const k=PI[name]; if(!k||usedPI.has(k)) return fb; usedPI.add(k); return dayKey(k,lastDay); };

  ROLE='pre';
  // 2. le mot des familles (scène 1 : le décor de l'accueil reste en place)
  const P=I.parents;
  if(P) page(pk('parents',K1),(c)=>
    head(c,P.eyebrow||S.parents,'')+
    (P.names&&P.names.length?rv('fams',c.tx,P.names.map(x=>`<span>${esc(x)}</span>`).join('<i>&amp;</i>')):'')+
    rv('tx',c.tx,esc(P.text||''))+
    rv('nm',null,namesH(),esc(nmCss(.7,c.nm))),{});

  // 3. notre histoire
  const ST=I.story;
  if(ST) page(K1,(c,lt)=>
    head(c,ST.eyebrow||S.story,ST.title||'',.6)+
    (ST.photos&&ST.photos.length?rv('ph',null,ST.photos.slice(0,3).map((u,k)=>`<img src="${esc(u)}" alt="" loading="lazy" style="--r:${[-4,3,-2][k]}deg">`).join('')):'')+
    rv('st',c.tx,(ST.items||[]).map(x=>`<div><b>${esc(x.when)}</b><h4>${esc(x.title)}</h4>${x.text?`<p>${esc(x.text)}</p>`:''}</div>`).join('')),{cls:'tall'});

  // 4. compte à rebours sur une page
  if(I.countdown==='page') page(K1,(c)=>
    head(c,S.soon,S.left,.8)+rv('',null,cdHtml(true,c.tx))+rv('dl',c.tx,`<i></i><span>${esc(fmtDay(main))}</span><i></i>`),{});

  // 5. événements
  events.forEach((e,i)=>{
    const d=zoned(e.start,e.tz); ROLE='event'; EVI=i;
    page(evImg(e,i),(c)=>{
      // le jour est toujours écrit (on ne le perd pas), l'heure en grand dessous
      const when=`<span class="wd">${esc(fmtDayShort(d,e.tz))}</span><span class="hr">${esc(fmtTime(d,e.tz))}</span>`;
      return head(c,e.eyebrow||'',e.title)+rv('when when-ev',c.tx,when)+
        (e.place?rv('tx',c.tx,esc(e.place)):'')+
        (e.note?rv('tx',c.tx,esc(e.note),'font-size:15px;opacity:.9'):'')+
        rv('acts',c.tx,(e.address?`<a class="b" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.address)}" target="_blank" rel="noopener">${ic.pin}${S.route}</a>`:'')+
          `<button type="button" class="b" data-cal="${esc(e.id)}">${ic.cal}${S.cal}</button>`);
    });
  });

  ROLE='post';
  // 6. le programme du jour (sur le décor du dernier événement)
  const PR=I.program;
  if(PR) page(pk('program',lastScene),(c,lt)=>
    head(c,PR.eyebrow||S.program,PR.title||'',.6)+
    rv('card tl',c.tx,(PR.items||[]).map(x=>`<div class="it"><b>${esc(x.time)}</b><div><h4>${esc(x.title)}</h4>${x.text?`<p>${esc(x.text)}</p>`:''}</div></div>`).join(''),'background:'+cardBg(lt)),{cls:'tall'});

  // 7. infos pratiques, dress code, hébergement, questions, liste, photos, table : sur le décor de la réponse
  if(I.infos&&I.infos.length) page(pk('infos',K4),(c,lt)=>
    head(c,I.infosTitle||S.infos,'')+
    rv('card',c.tx,I.infos.map(x=>`<div class="it">${ic[x.icon]||ic.info}<div><h4>${esc(x.title)}</h4><p>${esc(x.text)}</p></div></div>`).join(''),'background:'+cardBg(lt)),{cls:'tall'});

  const DR=I.dress;
  if(DR) page(pk('dress',K4),(c)=>
    head(c,DR.eyebrow||S.dress,DR.title||'',.7)+
    (DR.colors&&DR.colors.length?rv('sw',null,DR.colors.map(x=>`<i style="background:${esc(x)}"></i>`).join('')):'')+
    rv('tx',c.tx,esc(DR.text||'')),{});

  const SY=I.stay;
  if(SY) page(pk('stay',K4),(c,lt)=>
    head(c,SY.eyebrow||S.stay,SY.title||'',.6)+
    rv('card',c.tx,(SY.items||[]).map(x=>`<div class="it">${ic[x.icon]||ic.hotel}<div><h4>${esc(x.title)}</h4><p>${esc(x.text)}</p>${x.url?`<a class="lk" ${lnk(x.url)}>${esc(x.link||S.site)} →</a>`:''}</div></div>`).join(''),'background:'+cardBg(lt)),{cls:'tall'});

  const FQ=I.faq;
  if(FQ) page(K4,(c,lt)=>
    head(c,FQ.eyebrow||S.faq,FQ.title||'',.6)+
    rv('card qa',c.tx,(FQ.items||[]).map(x=>`<div class="it"><div><h4>${esc(x.q)}</h4><p>${esc(x.a)}</p></div></div>`).join(''),'background:'+cardBg(lt)),{cls:'tall'});

  const GF=I.gifts;
  if(GF) page(pk('gifts',K4),(c,lt)=>
    head(c,GF.eyebrow||S.gifts,GF.title||'',.7)+rv('tx',c.tx,esc(GF.text||''))+giftBody(GF,c.tx,lt),{cls:GF.mode==='liste'&&(GF.items||[]).length>3?'tall':''});

  const PH=I.photos;
  if(PH) page(K4,(c)=>
    head(c,PH.eyebrow||S.photos,PH.title||'',.7)+rv('tx',c.tx,esc(PH.text||''))+
    (PH.url?rv('acts',c.tx,`<a class="b" ${lnk(PH.url)}>${ic.cam}${esc(PH.label||S.photosBtn)}</a>`):''),{});

  // la table n'apparaît que sur le lien personnel d'une famille qui a une table
  if(fam&&fam.table) page(K4,(c)=>
    head(c,S.dayJ,S.table,.7)+rv('tbl',c.tx,esc(fam.table))+rv('tx',c.tx,esc(I.tableText||S.tableTx)),{});

  // 8. réponse
  ROLE='rsvp';
  const R=I.rsvp||{};
  const deadline=R.deadline?zoned(R.deadline+'T23:59',TZ):null;
  page(pk('rsvp',K4),(c)=>
    `<div class="rv ey" style="--i:${rvI++};color:${c.ey}">${esc(R.eyebrow||T.scenes[3][0])}</div>`+
    `<div class="rv nm" style="--i:${rvI++};${esc(nmCss(.74,c.nm))}">${esc(R.title||T.scenes[3][1])}</div>`+
    (deadline?`<div class="rv tx" style="--i:${rvI++};color:${c.tx}">${S.before} ${esc(er(deadline.toLocaleDateString(LOC,{day:'numeric',month:'long',timeZone:TZ})))}</div>`:'')+
    (I.countdown==='fin'?`<div class="rv" style="--i:${rvI++}">${cdHtml(false,c.tx)}</div>`:'')+
    `<div class="rv acts" style="--i:${rvI++};color:${c.tx}"><button type="button" class="b" data-rsvp style="color:${c.tx}">${ic.mail}${S.reply}</button></div>`+
    `<a class="made" href="/" target="_blank" rel="noopener" style="color:${c.ey}">${S.made} <b>Save the Oui</b></a>`);

  /* ---------- mise en page continue (comme un long rouleau peint) ----------
     une grande illustration qu'on descend, qui se fond dans des fonds texturés aux couleurs du thème ;
     entre deux parties, une guirlande à cheval sur la limite cache le changement de fond (aucune coupure) */
  const LG=I.layout==='long'&&I.long?I.long:null;
  function longHtml(){
    const X=LG, sec=X.sec, R0=I.rsvp||{};
    const nm=(k,col)=>esc(nmCss(k,col));
    // couleur qui se lit sur l'accent (blanc sur un accent sombre, encre sur un accent clair) : médaillons et bouton plein
    const clair=hex=>{ const n=parseInt(hex.slice(1),16); return (.299*(n>>16&255)+.587*(n>>8&255)+.114*(n&255))/255>.62; };
    const onAc=hex=>clair(hex)?'#1b1408':'#fff';
    // verre des boutons : sombre sous une encre claire (section de nuit), blanc sous une encre foncée (papier)
    const glass=ink=>clair(ink)?'rgba(18,15,12,.5)':'rgba(255,255,255,.55)';
    const blk=(i,inner,cls='')=>`<section class="lg-s${cls?' '+cls:''}" style="--ink:${sec[i].ink};--ac:${sec[i].accent};--on:${onAc(sec[i].accent)};--gl:${glass(sec[i].ink)};background-image:url('${X.base}/${sec[i].tex}')">${inner}</section>`;
    const band=(i)=>`<div class="lg-band" aria-hidden="true"><img src="${X.base}/${X.bands[i]}" alt="" data-sp="-.10"></div>`;
    const ttl=(t,i)=>`<h2 class="rv lg-h" style="${nm(.62,sec[i].accent)}">${esc(t)}</h2>`;
    // 1. l'illustration d'ouverture et l'invitation
    const P0=I.parents||null, names=namesH('<i>&amp;</i>');
    const hero=`<div class="lg-hero"><img class="lg-hero-img" src="${X.base}/${X.hero.src}" alt="" style="aspect-ratio:${X.hero.w}/${X.hero.h}${X.hero.fade?';--fade:'+X.hero.fade:''}">
      <div class="lg-hero-txt" data-sp=".35" style="color:${X.hero.ink};--sh:${X.hero.shadow||'none'};--top:${X.hero.top||'14%'}">
        ${fam&&fam.label?`<div class="greet">${esc(fam.label)}</div>`:''}
        ${eyHtml('ey',I.intro&&I.intro.eyebrow||T.scenes[0][0],'')}
        <div class="lg-names" style="${nm(1.05,X.hero.ink)}">${names}</div>
        ${RVL?`<div data-rvl style="width:100%;color:${X.hero.ink}"></div>`:''}
        ${!RVL||RVL==='wheel'?`<div class="dl${RVL?' rvl-later':''}"><i></i><span>${esc(I.intro&&I.intro.dateText||fmtDay(main))}</span><i></i></div>`:''}
        <div class="lg-hint${RVL?' rvl-later':''}">${S.scroll} ↓</div>
      </div></div>`;
    // la bibliothèque de lieux dans le grand tableau : un lieu choisi (lieu) remplit le cadre peint de l'événement
    const evs=events.map((e,i)=>{ const d=zoned(e.start,e.tz), inner=e.lieu?`/img/hd/${I.theme}-${e.lieu}.webp?v=${IMGV}`:X.base+'/'+(X.ev[(I.events||[]).indexOf(e)]||X.ev[i%X.ev.length]);
      const when=fmtDayShort(d,e.tz)+' · '+fmtTime(d,e.tz);
      return `<article class="lg-ev rv">
        <div class="lg-fr" style="aspect-ratio:${X.frame.w}/${X.frame.h}"><img class="in" src="${inner}" alt="" style="-webkit-mask-image:url('${X.base}/${X.frame.mask}');mask-image:url('${X.base}/${X.frame.mask}')"><img class="fr" src="${X.base}/${X.frame.src}" alt=""></div>
        <div class="ey">${esc(e.eyebrow||'')}</div><div class="lg-evt" style="${nm(.62,sec[0].ink)}">${esc(e.title)}</div>
        <div class="when">${esc(when)}</div>${e.place?`<div class="tx">${esc(e.place)}</div>`:''}${e.note?`<div class="tx small">${esc(e.note)}</div>`:''}
        <div class="acts">${e.address?`<a class="b" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.address)}" target="_blank" rel="noopener">${ic.pin}${S.route}</a>`:''}<button type="button" class="b" data-cal="${esc(e.id)}">${ic.cal}${S.cal}</button></div>
      </article>`; }).join('');
    const s1=`<div class="lg-a" style="background-image:url('${X.base}/${sec[0].tex}');--ink:${sec[0].ink};--ac:${sec[0].accent};--on:${onAc(sec[0].accent)};--gl:${glass(sec[0].ink)}">${hero}
      <div class="lg-in">
        ${P0?`<div class="rv ey">${esc(P0.eyebrow||S.parents)}</div><div class="rv lg-fams">${(P0.names||[]).map(x=>`<span>${esc(x)}</span>`).join('<i>&amp;</i>')}</div><p class="rv tx">${esc(P0.text||'')}</p>`:''}
        <div class="rv lg-names2" style="${nm(.8,sec[0].accent)}">${names}</div>
        <p class="rv tx">${esc(I.intro&&I.intro.text||S.joy)}</p>
        ${I.countdown==='debut'?`<div class="rv">${cdHtml(false,sec[0].ink)}</div>`:''}
        ${I.eventsTitle===''?'':ttl(I.eventsTitle||S.celebr,0)}${evs}
      </div></div>`;
    // 2. notre histoire, photos, dress code
    const ST0=I.story, DR0=I.dress, phs=X.photos||[];
    // la deuxième partie n'existe que si elle a quelque chose : le titre « Notre histoire » ne s'affiche qu'avec une histoire
    const s2=!(ST0||phs.length||DR0)?'':blk(1,`<div class="lg-in">${ST0?ttl(ST0.title||S.story,1):''}
        ${ST0&&ST0.items?`<div class="rv st lg-st">${ST0.items.map(x=>`<div><b>${esc(x.when)}</b><h4>${esc(x.title)}</h4>${x.text?`<p>${esc(x.text)}</p>`:''}</div>`).join('')}</div>`:''}
      </div>
      ${phs.length?`<div class="rv lg-ph" aria-hidden="true"><div class="lg-ph-in">${[...phs,...phs].map((u,k)=>`<img src="${X.base}/${u}" alt="" loading="lazy" style="--r:${[-3,2,-1.5,3][k%4]}deg">`).join('')}</div></div>`:''}
      ${DR0?`<div class="lg-in">${ttl(DR0.eyebrow||S.dress,1)}${DR0.title?`<div class="rv lg-sub">${esc(DR0.title)}</div>`:''}${DR0.colors?`<div class="rv sw">${DR0.colors.map(c=>`<i style="background:${esc(c)}"></i>`).join('')}</div>`:''}<p class="rv tx">${esc(DR0.text||'')}</p></div>`:''}`);
    // 3. bon à savoir, liste, réponse, compte à rebours
    const infos=[...(I.infos||[]),...((I.stay&&I.stay.items)||[])];
    const GF0=I.gifts;
    const s3=blk(2,`<div class="lg-in">
        ${infos.length?ttl(S.know,2)+`<div class="lg-grid">${infos.map(x=>`<div class="rv lg-it">${ic[x.icon]||ic.info}<h4>${esc(x.title)}</h4><p>${esc(x.text)}</p>${x.url?`<a class="lk" ${lnk(x.url)}>${esc(x.link||S.site)} →</a>`:''}</div>`).join('')}</div>`:''}
        ${GF0?ttl(GF0.eyebrow||S.gifts,2)+`<p class="rv tx">${esc(GF0.text||'')}</p>${giftBody(GF0,null,true)}`:''}
        <div class="rv ey lg-gap">${esc(R0.eyebrow||S.rsvpT)}</div><div class="rv lg-sub" style="${nm(.7,sec[2].accent)}">${esc(R0.title||T.scenes[3][1])}</div>
        ${R0.deadline?`<p class="rv tx">${S.before} ${esc(er(zoned(R0.deadline+'T23:59',TZ).toLocaleDateString(LOC,{day:'numeric',month:'long',timeZone:TZ})))}</p>`:''}
        <div class="rv acts"><button type="button" class="b solid" data-rsvp>${ic.mail}${S.reply}</button></div>
        ${I.countdown!=='non'?`<div class="rv ey lg-gap">${S.cdEnd}</div><div class="rv">${cdHtml(true,sec[2].ink)}</div>`:''}
        <a class="lg-made" href="/" target="_blank" rel="noopener">${S.made} <b>Save the Oui</b></a>
      </div>`,'lg-end');
    return `<div class="lg">${s1}${band(0)}${s2?s2+band(1):''}${s3}</div>`;
  }

  /* ---------- montage ---------- */
  const runs=[], runOf=[];
  pages.forEach((p,i)=>{ const r=runs[runs.length-1]; if(r&&r.n===p.n) r.b=i; else runs.push({n:p.n,lt:p.lt,a:i,b:i}); runOf[i]=runs.length-1; });
  document.title=I.title||(solo?n1:`${n1} & ${n2}`);
  const mu=I.music||T.music;
  const app=document.createElement('div'); app.id='app'; app.style.setProperty('--pal',pal);
  app.innerHTML=`
    <div class="sc${LG?' sc-long':''}${!LG&&CAL.size?' cal':''}" id="sc"${!LG&&CAL.size?` style="background-image:url('${fond}')"`:''}><div class="bgs" id="bgs">${CH?`<div class="chv"><img class="chs" src="${esc(CH.src)}?v=${IMGV}" alt="" decoding="async"></div>`:LG?'':runs.map(r=>hasCal(r.n)?`<div class="bgl${r.lt?' light':''} cal"><div class="bg"><img class="sub" src="${cal(r.n)}" alt="" decoding="async"></div></div>`:`<div class="bgl${r.lt?' light':''}"><div class="bg" style="background-image:url('${img(r.n)}');--img:url('${img(r.n)}')"></div></div>`).join('')}</div><div class="fxw"><canvas id="fx"></canvas></div>${LG?longHtml():pages.map(p=>p.html).join('')}</div>
    ${LG&&I.demo?`<a class="lg-want" href="/formules/">${S.want}</a>`:''}
    ${I.demo?`<a class="demo-tag" href="/modeles/">${S.demo} · Save the Oui</a>`:''}
    ${mu&&mu!=='none'?`<button type="button" class="snd" id="snd" aria-label="Musique">${ic.note.replace('<svg','<svg class="on"')}${ic.mute.replace('<svg','<svg class="off"')}</button><audio id="bgm" src="${esc(I.musicUrl||'/music/'+mu+'.mp3')}" loop preload="none"></audio>`:''}
    <div class="op" id="op" data-type="${esc(I.opening||'env')}" role="button" tabindex="0" aria-label="${S.tap}" style="--door:url('/img/open/${I.theme}-portes.webp');--cur:url('/img/open/${I.theme}-rideau.webp');--pal:${pal}${I.doormen?`;--man:url('/img/open/${I.theme}-portier.webp')`:''}">
      <div class="op-env"><div class="op-vig"></div><div class="op-env-in"><div class="op-body"></div><div class="op-fshadow"></div><div class="op-flap"><img src="/img/open/env-flap.webp" alt=""><div class="op-seal" style="background-image:url('/img/seals/${sealName}.webp')"><b style="--l:${sealL};--m:${sealM};--d:${sealD}">${iniH()}</b></div></div></div></div>
      <div class="op-cur"><div class="op-mono" style="${T.mono?`color:${T.mono[0]};text-shadow:${T.mono[1]}`:''}">${monoT}</div><div class="op-cur-edge"></div></div>
      <div class="op-doors"><div class="op-room"></div><div class="op-glow"></div><div class="op-wall"></div><div class="op-doors-in"><div class="op-leaf l">${I.doormen?'<div class="op-man"></div>':''}</div><div class="op-leaf r">${I.doormen?'<div class="op-man"></div>':''}</div></div></div>
      <div class="op-voile"><div class="op-sheer l"></div><div class="op-sheer r"></div><div class="op-mono" style="${T.mono?`color:${T.mono[0]};text-shadow:${T.mono[1]}`:''}">${monoT}</div></div>
      ${fam&&fam.label?`<div class="op-to">${esc(fam.label)}</div>`:''}
      <div class="op-tap">${(I.opening||'env')==='env'?S.tapSeal:S.tap}</div>
    </div>
    <div class="flash" id="flash" aria-hidden="true"></div>
    <div class="sheet" id="sheet" aria-hidden="true"><div class="sheet-in" role="dialog" aria-modal="true"><button type="button" class="x" aria-label="Fermer">×</button><div id="sheetBody"></div></div></div>`;
  const bd=document.createElement('div'); bd.className='bd'; bd.style.backgroundImage=`url('${LG?LG.base+'/'+LG.hero.src:img(1)}')`;
  document.body.append(bd,app);
  { const D=$('#op .op-doors'); if(D&&window.sceauDoorFit) sceauDoorFit(D,T.door,D.querySelector('.op-wall'),D.querySelector('.op-leaf.l'),D.querySelector('.op-leaf.r')); }
  const sc=$('#sc'), secs=[...sc.querySelectorAll('.pg')], layers=[...$('#bgs').querySelectorAll('.bgl')], bgs=$('#bgs'), fxc=$('#fx'), chImg=$('#bgs .chs');
  if(CH){ let tk=false; sc.addEventListener('scroll',()=>{ if(!tk){ tk=true; requestAnimationFrame(()=>{ tk=false; chScroll(); }); } },{passive:true}); chImg.addEventListener('load',layoutStrip); }

  /* ---------- date à découvrir ---------- */
  // grand tableau : la date se découvre sur l'illustration d'ouverture (encre foncée = fond clair)
  const rvlHost=LG?sc.querySelector('.lg-hero-txt [data-rvl]'):secs[0]&&secs[0].querySelector('[data-rvl]');
  if(rvlHost) SceauReveal.mount(rvlHost,{kind:RVL,date:main,tz:TZ,lang:L,pal,light:LG?(h=>{ const n=parseInt((h||'#000').slice(1,7),16); return ((n>>16&255)*.299+(n>>8&255)*.587+(n&255)*.114)<128; })(LG.hero.ink):pages[0].lt,scope:LG?rvlHost.parentNode:secs[0],onDone:()=>requestAnimationFrame(layoutStrip)});

  /* ---------- apparition + parallaxe ---------- */
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let opened=false;
  const io=new IntersectionObserver(es=>es.forEach(en=>{
    // la page qui sort de l'écran perd son « on » : à son retour, son texte se révèle de nouveau
    if(!en.isIntersecting||en.intersectionRatio<.08){ en.target.classList.remove('on'); return; }
    if(en.isIntersecting&&en.intersectionRatio>.45){ const i=secs.indexOf(en.target); if(opened){ if(LG) en.target.classList.add('on'); if(layers[runOf[i]]) layers[runOf[i]].classList.add('on'); } bd.style.backgroundImage=`url('${en.target.dataset.img}')`; }
  }),{root:sc,threshold:[0,.05,.45,.8]});
  secs.forEach(s=>io.observe(s));
  /* ---------- fond continu ----------
     Le décor n'est pas fixe derrière des pages qui glissent (l'utilisateur voyait « un changement de page, c'est
     moche »). Il est DANS le conteneur qui défile : une bande (#bgs) avec, pour chaque suite de pages de même scène,
     un cadre (.bgl) de la hauteur de ces pages et dedans l'image (.bg, position: sticky) à la taille d'un écran.
     Tant que ses pages défilent, l'image reste en place ; quand la scène suivante arrive, sa propre image monte
     avec le doigt et vient recouvrir la précédente (qui est poussée au même rythme), son bord haut fondu sur
     OVK = 45 % d'un écran : un long fondu, le décor change sans qu'on sente une page. Aucune image
     n'est étirée sur plusieurs écrans (jamais de zoom). Les positions sont recalculées à chaque changement de
     taille (une page fait un écran, une page « tall » davantage). */
  const OVK=.45;
  // taille du décor : celle de l'écran (cover sur l'écran, pas sur le cadre agrandi de la bande de fondu, sinon l'image
  // apparaît zoomée ~1,8×). Image centrée sur l'écran ; au-dessus, sa première bande étirée remplit la bande de fondu.
  const IR=.566; // largeur / hauteur des décors (1080 × 1909)
  /* la peinture prend toute la largeur de l'écran et se pose en bas : rien n'est coupé sur les côtés (« dans église t'as
     encore le truc coupé ») ; sur un téléphone plus allongé que 9:16, le haut libre est rempli par le ciel de l'image
     étiré (::before, --strip). Avant, elle était agrandie à la hauteur de l'écran et perdait ses bords. */
  // couleur du haut de l'image (moyenne de ses premières lignes) : remplit le haut libre de l'écran sans motif ni trait
  // RT : largeur / hauteur réelle de chaque décor, lue au chargement : une peinture prolongée vers le haut (1080 × 2520,
  // règle 32e) n'a plus le format 9:16 ; elle est posée en bas, toute la largeur, et remplit l'écran sans ciel ajouté
  const SKY={}, RT={}, urlOf=B=>(B.style.backgroundImage.match(/url\(["']?([^"')]+)/)||[])[1];
  function skyOf(B){ const u=urlOf(B); if(!u) return;
    if(SKY[u]){ B.style.setProperty('--sky',SKY[u]); return; }
    const im=new Image(); im.onload=()=>{ const r=im.width/im.height; if(Math.abs(r-IR)>.01&&RT[u]!==r){ RT[u]=r; layoutStrip(); } try{ const cv=document.createElement('canvas'); cv.width=16; cv.height=4; const x=cv.getContext('2d'); x.drawImage(im,0,0,im.width,im.height*.01,0,0,16,4);
      const d=x.getImageData(0,0,16,4).data; let r=0,g=0,b=0; for(let k=0;k<d.length;k+=4){ r+=d[k]; g+=d[k+1]; b+=d[k+2]; } const n=d.length/4;
      SKY[u]=`rgb(${Math.round(r/n)},${Math.round(g/n)},${Math.round(b/n)})`; B.style.setProperty('--sky',SKY[u]); }catch(e){} }; im.src=u; }
  // décors peints pour le plein écran (T.cover) : posés en cover, calés en bas, les bords se perdent sans rien couper d'important
  const COV=new RegExp(`-(${(T.cover||['$^']).join('|')})\\.webp`);
  function fitBg(B,w,h,ov){ skyOf(B);
    const r=RT[urlOf(B)]||IR, bw=COV.test(urlOf(B)||'')?Math.ceil(Math.max(w,h*r)):Math.ceil(w), ih=bw/r, y=Math.round(ov+(h-ih));
    B.style.backgroundSize=bw+'px auto'; B.style.backgroundPosition=`center ${y}px`;
    B.style.setProperty('--bs',`${bw}px ${Math.round(Math.max(1,y)/.015)}px`); B.style.setProperty('--strip',Math.max(0,y)+'px');
  }
  /* chaîne : la peinture descend avec les pages ; quand le haut d'une page est en haut de l'écran, l'écran montre son
     ancre. Entre deux pages, la peinture avance en proportion (elle peut aller un peu moins vite que le texte) : aucune
     coupure, c'est la même image qui continue. Ancres des pages : accueil, événements (dans l'ordre), infos réparties
     entre l'ancre « infos » et la réponse, pages d'avant les événements entre l'accueil et le premier événement. */
  let chP=[], chY=[];
  function chainLayout(){ if(!CH) return; const w=sc.clientWidth, h=sc.clientHeight, k=w/CH.w, maxY=Math.max(0,CH.h*k-h);
    const home=chA('home')[0], ev=chA('event'), info=chA('info')[0], rsvp=chA('rsvp')[0];
    const yOf=a=>a?a.y*k:0, groups={};
    pages.forEach((p,i)=>{ (groups[p.role]=groups[p.role]||[]).push(i); });
    chP=secs.map(x=>x.offsetTop); chY=pages.map(()=>0);
    const spread=(ids,y0,y1)=>(ids||[]).forEach((i,j,a)=>{ chY[i]=y0+(y1-y0)*(a.length>1?j/(a.length-1):0); });
    (groups.home||[]).forEach(i=>chY[i]=yOf(home));
    const evY=i=>ev.length?yOf(ev[Math.min(i,ev.length-1)])+(i>=ev.length?(i-ev.length+1)*h*.35:0):yOf(home);
    (groups.event||[]).forEach(i=>chY[i]=evY(pages[i].evi));
    const firstEv=(groups.event||[]).length?chY[groups.event[0]]:yOf(info||rsvp);
    spread(groups.pre,yOf(home)+(firstEv-yOf(home))*.35,yOf(home)+(firstEv-yOf(home))*.7);
    const lastEv=(groups.event||[]).length?chY[groups.event[groups.event.length-1]]:yOf(home);
    // les pages d'infos restent sur le ciel calme de l'ancre « infos » (la peinture y avance à peine), puis la réponse
    spread(groups.post,Math.max(yOf(info),lastEv+h*.2),Math.max(yOf(info),lastEv+h*.2)+h*.12);
    (groups.rsvp||[]).forEach(i=>chY[i]=yOf(rsvp));
    for(let i=1;i<chY.length;i++) chY[i]=Math.max(chY[i],chY[i-1]);
    chY=chY.map(y=>Math.min(maxY,y)); chScroll(); }
  function chScroll(){ if(!CH||!chP.length) return; const st=sc.scrollTop; let i=0; while(i<chP.length-1&&chP[i+1]<=st) i++;
    const t=i<chP.length-1?Math.min(1,(st-chP[i])/Math.max(1,chP[i+1]-chP[i])):0, y=chY[i]+(i<chP.length-1?(chY[i+1]-chY[i])*t:0);
    chImg.style.transform=`translate3d(0,${(-y).toFixed(1)}px,0)`; }
  function layoutStrip(){
    const h=sc.clientHeight; fxc.style.height=h+'px'; if(CH){ bgs.style.height=sc.scrollHeight+'px'; chainLayout(); return; } if(LG) return;
    const ov=Math.round(h*OVK);
    bgs.style.height=sc.scrollHeight+'px';
    runs.forEach((r,ri)=>{
      const top=secs[r.a].offsetTop, bot=secs[r.b].offsetTop+secs[r.b].offsetHeight, L=layers[ri], B=L.firstElementChild;
      /* peintures entières : fondu enchaîné plein écran. Le cadre de la scène suivante commence un écran plus haut que
         sa page ; son image, collante et à la taille de l'écran, couvre déjà tout l'écran mais invisible, et apparaît
         en fondu pendant qu'on défile (opacité, plus bas). Plus de bande de ciel qui monte avec un bord : « au moment où
         tu défiles, tu vois que c'est pas vraiment continu ». Les calques gardent leur rendu (sujet qui monte). */
      const cal=L.classList.contains('cal'), dz=ri>0&&!cal;
      // la scène reste en place sous la suivante pendant le fondu : son cadre dure un écran de plus
      const nx=runs[ri+1]&&!(layers[ri+1]&&layers[ri+1].classList.contains('cal'))&&!cal?h:0;
      const t=ri>0?(dz?top-h:top-ov):top; L.style.top=t+'px'; L.style.height=(bot-t+nx)+'px';
      B.style.height=(ri>0&&!dz?h+ov:h)+'px'; B.style.top=(ri>0&&!dz?-ov:0)+'px';
      // calque : pas de fond ni de fondu dans le cadre (le fond du thème est derrière tout, sur .sc) ; le sujet détouré
      // monte avec les pages et passe devant le sujet précédent, qui reste en place jusqu'à être poussé
      // (le sol qui part en ligne droite est fondu au défilement, calFade() ci-dessous)
      if(L.classList.contains('cal')){ B.style.webkitMaskImage=B.style.maskImage=''; return; }
      fitBg(B,sc.clientWidth,h,0); B.style.webkitMaskImage=B.style.maskImage='';
    });
  }
  // les textes défilent avec la page, sans fondu ni décalage : rien ne signale un « changement de page »
  layoutStrip(); addEventListener('load',layoutStrip); if(document.fonts&&document.fonts.ready) document.fonts.ready.then(layoutStrip);

  /* ---------- défilement ----------
     Libre et continu, comme la mise en page continue : le doigt, la molette et le clavier font défiler normalement,
     sans calage en plein écran. L'utilisateur ne veut plus sentir de pages : « l'idée c'est que ce soit en continu,
     mais tu ne te rends pas compte que tu changes de page ». Seul le décor change, fondu sur une longue bande.
     Avant l'ouverture, on ne défile pas. */
  /* un geste = une page : le doigt, la molette ou le clavier amènent directement à la scène suivante (ou précédente).
     Une page plus haute que l'écran (programme, infos) se parcourt d'un écran à la fois avant de passer à la suivante. */
  let pgBusy=0;
  function goPage(dir){ if(LG) return; const now=Date.now(); if(now<pgBusy) return; const h=sc.clientHeight, st=sc.scrollTop;
    const tops=secs.map(x=>x.offsetTop), cur=tops.reduce((a,t,i)=>t<=st+4?i:a,0), pg=secs[cur], end=pg.offsetTop+pg.offsetHeight-h;
    let to;
    if(dir>0) to=st<end-4?Math.min(end,st+h):(tops[cur+1]!=null?tops[cur+1]:st);
    else to=st>pg.offsetTop+4?Math.max(pg.offsetTop,st-h):(cur>0?Math.max(tops[cur-1],tops[cur-1]+secs[cur-1].offsetHeight-h):0);
    if(Math.abs(to-st)<2) return; pgBusy=now+(reduce?150:650); sc.scrollTo({top:to,behavior:reduce?'auto':'smooth'}); }
  let ty0=null, wAcc=0, wT=0;
  sc.addEventListener('touchstart',e=>{ ty0=e.touches[0].clientY; },{passive:true});
  sc.addEventListener('touchmove',e=>{ if(!opened||!LG) e.preventDefault(); },{passive:false});
  sc.addEventListener('touchend',e=>{ if(!opened||LG||ty0==null) return; const dy=ty0-e.changedTouches[0].clientY; ty0=null; if(Math.abs(dy)>36) goPage(dy>0?1:-1); },{passive:true});
  sc.addEventListener('wheel',e=>{ if(LG) return; e.preventDefault(); if(!opened) return; const now=Date.now(); if(now-wT>260) wAcc=0; wT=now; wAcc+=e.deltaY;
    if(Math.abs(wAcc)>=40){ goPage(wAcc>0?1:-1); wAcc=0; } },{passive:false});
  addEventListener('keydown',e=>{
    if(!opened||LG||sheet.classList.contains('on')||/INPUT|TEXTAREA|SELECT/.test((document.activeElement||{}).tagName||'')) return;
    const k={ArrowDown:1,ArrowUp:-1,PageDown:1,PageUp:-1,' ':1}[e.key];   // une page à la fois
    if(k){ e.preventDefault(); goPage(k); }
  });
  addEventListener('resize',layoutStrip);
  // pendant le swipe, le texte disparaît ; il apparaît sur la page d'arrivée, avec son animation (il ne « monte » jamais)
  { let tk=false; const vis=()=>{ tk=false; const h=sc.clientHeight, st=sc.scrollTop;
      secs.forEach(x=>{ const d=Math.abs(x.offsetTop-st)/h, tall=x.offsetHeight>h*1.05&&st>=x.offsetTop&&st<=x.offsetTop+x.offsetHeight-h;
        // le texte ne glisse jamais : il est caché dès que la page bouge, et se révèle (.rv) une fois la page posée
        const o=(tall||d<.004)?1:0; if(x._o!==o){ x._o=o; x.style.opacity=o?'':'0'; if(o&&opened) x.classList.add('on'); else if(!o) x.classList.remove('on'); } }); };
    if(!LG){ sc.addEventListener('scroll',()=>{ if(!tk){ tk=true; requestAnimationFrame(vis); } },{passive:true}); addEventListener('resize',vis); } }
  // profondeur des calques : le sujet détouré glisse un peu moins vite que les pages (jamais plus de 6 % d'un écran)
  { const subs=layers.map((L,ri)=>({L,S:L.querySelector('.sub'),ri})).filter(x=>x.S); let tk=false;
    /* en partant, le bas du sujet (le sol) traçait une ligne droite sur le ciel (« des lignes nettes, c'est moche ») :
       dès que le cadre commence à remonter, son bas se fond, d'autant plus qu'il est monté. Rien tant que la page est
       posée, et le cadre ne déborde jamais sur la page suivante (un débord fixe laissait le manoir en haut de la
       dernière page : « deux écrans en un ») */
    const calFade=(L,h,st)=>{ const up=st+h-(L.offsetTop+L.offsetHeight), f=up>0?Math.round(Math.min(up*1.2,h*.35)):0,
      m=f?`linear-gradient(to bottom,#000 calc(100% - ${f}px),transparent)`:''; if(L._f!==f){ L._f=f; L.style.webkitMaskImage=L.style.maskImage=m; } };
    const par=()=>{ tk=false; const h=sc.clientHeight, st=sc.scrollTop; subs.forEach(({L})=>calFade(L,h,st)); if(reduce) return;
      subs.forEach(({L,S})=>{ const t=L.offsetTop, b=t+L.offsetHeight; if(b<st-h||t>st+2*h) return;
        const off=Math.max(-h*.06,Math.min(h*.06,(st-t)*.05)); S.style.transform=`translate3d(0,${off.toFixed(1)}px,0)`; }); };
    if(subs.length){ sc.addEventListener('scroll',()=>{ if(!tk){ tk=true; requestAnimationFrame(par); } },{passive:true}); par(); } }
  /* peintures entières (sans calques) : fondu enchaîné. Posée, une page ne montre que sa propre scène ; en défilant vers
     la suivante, celle-ci apparaît en fondu sur tout l'écran (sur 80 % d'un écran de défilement). */
  { const fr=runs.map((r,ri)=>({ri,a:r.a,B:layers[ri]&&layers[ri].firstElementChild})).filter(x=>x.ri>0&&x.B&&!layers[x.ri].classList.contains('cal')); let tk=false;
    const fade=()=>{ tk=false; const h=sc.clientHeight, st=sc.scrollTop, ov=h*OVK;
      fr.forEach(({a,B})=>{ const q=Math.max(0,Math.min(1,(st-(secs[a].offsetTop-h))/h)), o=q>=1?'':(q*q*(3-2*q)).toFixed(3); if(B._o!==o){ B._o=o; B.style.opacity=o; B.parentNode.style.visibility=o==='0.000'?'hidden':''; } }); }; // invisible : le cadre entier est masqué (son ciel ::before recouvrait le sujet de la page d'avant)
    if(fr.length&&!LG){ sc.addEventListener('scroll',()=>{ if(!tk){ tk=true; requestAnimationFrame(fade); } },{passive:true}); fade(); addEventListener('resize',fade); } }
  // précharge les images des pages suivantes
  if(!LG) [...new Set(pages.map(p=>p.n))].forEach(n=>{ const im=new Image(); im.src=hasCal(n)?cal(n):img(n); });

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
  // enveloppe : pas de lumière ; zoom doux et continu dès le toucher, l'enveloppe s'efface et le faire-part, monté
  // dessous, finit le geste en se posant (morph, `morph` sur #app).
  // rideau, portes et voile : la lumière part AU TOUCHER (flash:0), en même temps que le mouvement, et monte
  // doucement avec lui (jamais de plein écran blanc) ; la page est déjà vivante derrière (on la voit à travers
  // l'entrebâillement, ou dès que les pans s'écartent), et le rideau / les battants s'effacent en fondu alors
  // qu'ils finissent de s'ouvrir : tout s'enchaîne, aucun temps mort sur de la lumière (voir CLAUDE.md, règle 15).
  const SEQ={env:{flash:null,on:700,gone:1000,morph:1},cur:{flash:null,on:320,gone:760,cls:'soft'},door:{flash:null,on:200,gone:2300,cls:'door'},voile:{flash:null,on:150,gone:1500,cls:'door'}};
  function open(){
    if(op.classList.contains('opening')) return;
    op.classList.add('opening'); playMusic();
    const q=SEQ[op.dataset.type]||SEQ.env, flash=$('#flash');
    if(q.cls) flash.classList.add(q.cls);
    if(q.flash) setTimeout(()=>flash.classList.add('bloom'),q.flash); else if(q.flash===0) flash.classList.add('bloom');
    setTimeout(()=>{ if(q.morph){ app.classList.add('morph'); setTimeout(()=>app.classList.remove('morph'),1800); } app.classList.add('opened'); opened=true; sc.scrollTop=0; if(secs[0]) secs[0].classList.add('on'); if(layers[0]) layers[0].classList.add('on'); startFx(); layoutStrip(); if(LG) longStart(); },q.on);
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
  // particules désactivées pour l'instant (« retire les fleurs, pétales, tout ça qui descend, on n'y est pas encore ») :
  // le code reste, PARTICLES_ON passera à true quand les sprites seront au niveau
  const PARTICLES_ON=false;
  function startFx(){
    const kind=I.particles||T.particles||'none'; if(!PARTICLES_ON||kind==='none'||reduce) return;
    const cv=$('#fx'), cx=cv.getContext('2d'); let W=0,H=0,dpr=1;
    function size(){ dpr=Math.min(2,devicePixelRatio||1); cv.style.height=sc.clientHeight+'px'; W=cv.clientWidth; H=cv.clientHeight; cv.width=W*dpr; cv.height=H*dpr; cx.setTransform(dpr,0,0,dpr,0,0); }
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
  // liste de mariage : QR de la cagnotte (bibliothèque chargée à la demande), copie du lien, cadeaux réservés
  { const qrs=document.querySelectorAll('[data-qr]');
    if(qrs.length){ const sc=document.createElement('script'); sc.src='/qrcode.js'; sc.onload=()=>qrs.forEach(el=>{ try{ const q=qrcode(0,'M'); q.addData(el.dataset.qr); q.make(); el.innerHTML=q.createSvgTag({cellSize:4,margin:2,scalable:true}); }catch(e){} }); document.head.appendChild(sc); } }
  document.addEventListener('click',e=>{ const b=e.target.closest('[data-gcopy]'); if(!b) return; const inp=b.parentNode.querySelector('input');
    (navigator.clipboard?navigator.clipboard.writeText(inp.value):Promise.reject()).catch(()=>{ inp.select(); document.execCommand('copy'); }).finally(()=>{ b.textContent=S.copied; setTimeout(()=>{ b.textContent=S.copyLink; },2200); }); });
  const GKEY='sceau-gifts-'+I.slug;
  const markGiven=ids=>ids.forEach(id=>document.querySelectorAll(`[data-g="${CSS.escape(id)}"]`).forEach(r=>{ r.classList.add('taken'); const b=r.querySelector('[data-give]'); if(b){ b.disabled=true; b.textContent=S.given; } }));
  if(document.querySelector('[data-give]')){
    if(I.demo){ try{ markGiven(JSON.parse(localStorage.getItem(GKEY)||'[]')); }catch(e){} }
    else fetch('/api/gifts?invite='+encodeURIComponent(I.slug)).then(r=>r.ok?r.json():null).then(j=>{ if(j&&j.taken) markGiven(j.taken); }).catch(()=>{});
    document.addEventListener('click',e=>{ const b=e.target.closest('[data-give]'); if(!b||b.disabled) return;
      openSheet(`<h3>${S.giveT}</h3><p class="sub">${esc(b.dataset.gname)}</p><form class="gl-f"><label class="f"><span>${S.giveName}</span><input name="name" required maxlength="80" autocomplete="name"></label><button class="go" type="submit">${S.giveGo}</button><p class="err" hidden></p></form>`);
      const f=sheetBody.querySelector('.gl-f'), note=f.querySelector('.err');
      f.onsubmit=async ev=>{ ev.preventDefault(); const name=f.name.value.trim(); if(!name) return; const id=b.dataset.give;
        try{
          if(I.demo){ const t=JSON.parse(localStorage.getItem(GKEY)||'[]'); t.push(id); localStorage.setItem(GKEY,JSON.stringify(t)); }
          else { const r=await fetch('/api/gifts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({invite:I.slug,item:id,name})});
            if(r.status===409){ markGiven([id]); note.hidden=false; note.textContent=S.giveTaken; return; } if(!r.ok) throw new Error(r.status); }
          markGiven([id]); sheetBody.innerHTML=`<div class="done-msg"><div class="big">${S.thanks}</div><p>${S.giveOk}</p></div>`;
        }catch(err){ note.hidden=false; note.textContent=S.giveErr; } }; }); }
  function closeSheet(){ sheet.classList.remove('on'); sheet.setAttribute('aria-hidden','true'); }
  sheet.addEventListener('click',e=>{ if(e.target===sheet||e.target.closest('.x')) closeSheet(); });
  addEventListener('keydown',e=>{ if(e.key==='Escape') closeSheet(); });

  /* ---------- calendrier ---------- */
  const stamp=d=>d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
  const icsTxt=s=>String(s||'').replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/[,;]/g,'\\$&');
  function icsUrl(o){
    const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Save The Oui//FR','CALSCALE:GREGORIAN','BEGIN:VEVENT',`UID:${o.uid}@savetheoui`,`DTSTAMP:${stamp(new Date())}`,`DTSTART:${stamp(o.start)}`,`DTEND:${stamp(o.end)}`,
      `SUMMARY:${icsTxt(o.title)}`,o.loc?`LOCATION:${icsTxt(o.loc)}`:'',o.desc?`DESCRIPTION:${icsTxt(o.desc)}`:'',`URL:${o.url}`,
      o.alarm?'BEGIN:VALARM\r\nACTION:DISPLAY\r\nTRIGGER:PT0S\r\nDESCRIPTION:'+icsTxt(o.title)+'\r\nEND:VALARM':'','END:VEVENT','END:VCALENDAR'].filter(Boolean).join('\r\n');
    return URL.createObjectURL(new Blob([ics],{type:'text/calendar'}));
  }
  function calSheet(id){
    const e=events.find(x=>x.id===id), d=zoned(e.start,e.tz), end=e.end?zoned(e.end,e.tz):new Date(+d+3*36e5);
    const title=`${e.calTitle||e.eyebrow||e.title} · ${solo?n1:n1+' & '+n2}`, loc=e.address||e.place||'';
    // le lieu et le lien du faire-part sont dans l'événement : le jour J, l'itinéraire est à un toucher depuis le calendrier du téléphone
    const link=location.href.split('#')[0], details=[e.place,e.note,link].filter(Boolean).join('\n');
    const g=`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${stamp(d)}/${stamp(end)}&location=${encodeURIComponent(loc)}&details=${encodeURIComponent(details)}`;
    const href=icsUrl({uid:`${I.slug}-${e.id}`,start:d,end,title,loc,desc:details,url:link});
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
  // ouverture d'un lien par famille : on le note (première et dernière fois, nombre) pour que les mariés sachent qui a vu
  // sans répondre, et ne relancent que ceux-là (api/seen.js ; rien dans les démos)
  if(fam&&!I.demo){ try{ fetch('/api/seen',{method:'POST',keepalive:true,headers:{'Content-Type':'application/json'},body:JSON.stringify({invite:I.slug,f:fid})}).catch(()=>{}); }catch(e){} }
  const pageUrl=()=>{ const u=new URL(location.href); u.search=''; u.hash=''; if(fid) u.searchParams.set('f',fid); return u.toString(); };
  // « Me rappeler de répondre » : un rappel dans le calendrier de l'invité (dans 3 jours à 19 h, ou une semaine avant la
  // date limite si elle est plus proche), avec le lien du faire-part : sans numéro à collecter ni SMS payant
  function remindUrl(){
    let d=new Date(); d.setDate(d.getDate()+3); d.setHours(19,0,0,0);
    if(deadline){ const w=new Date(deadline.getTime()-7*864e5); w.setHours(19,0,0,0); if(w<d&&w>Date.now()) d=w; }
    if(d<Date.now()) d=new Date(Date.now()+864e5);
    return icsUrl({uid:I.slug+'-rappel-'+(fid||'x'),start:d,end:new Date(+d+18e5),title:S.remindT.replace('{names}',solo?n1:n1+' & '+n2),desc:S.remindTx+pageUrl(),url:pageUrl(),alarm:true});
  }
  function rsvpSheet(){
    let prev=null; try{ prev=JSON.parse(localStorage.getItem(KEY)||'null'); }catch(e){}
    const max=(fam&&fam.seats)||R.maxGuests||6, menus=Array.isArray(R.menu)?R.menu.filter(Boolean).slice(0,8):[];
    const evRows=events.map(e=>{ const d=zoned(e.start,e.tz); return `<div class="ev"><b>${esc(e.eyebrow||e.title)}</b><small>${esc(e.title)} · ${esc(fmtDayShort(d,e.tz))}</small><div class="yn">`+
      `<label><input type="radio" name="ev-${esc(e.id)}" value="1" ${prev&&prev.events&&prev.events[e.id]===true?'checked':''}><span>${S.present}</span></label>`+
      `<label><input type="radio" name="ev-${esc(e.id)}" value="0" ${prev&&prev.events&&prev.events[e.id]===false?'checked':''}><span>${S.absent}</span></label></div></div>`; }).join('');
    /* qui vient : chaque personne est nommée (le traiteur et le plan de table en ont besoin, pas seulement un nombre) ; si le
       couple a défini des menus, chacun choisit le sien. La première ligne est celui qui répond ; les autres n'apparaissent
       que s'il vient à au moins un événement. Le nombre de personnes en découle. */
    const menuSel=(name,val)=>menus.length?`<select name="${name}" aria-label="${S.menu}"><option value="">${S.menu}…</option>${menus.map(m=>`<option ${m===val?'selected':''}>${esc(m)}</option>`).join('')}</select>`:'';
    const prevP=(prev&&prev.people||[]).slice(1);
    const pRow=(p,i)=>`<div class="pr"><input name="p-name" maxlength="80" placeholder="${S.person}" aria-label="${S.person} ${i+2}" value="${esc(p&&p.name||'')}">${menuSel('p-menu',p&&p.menu)}<button type="button" class="pr-x" data-prm aria-label="${S.rm}">×</button></div>`;
    openSheet(`<h3>${S.rsvpT}</h3><p class="sub">${esc(prev&&prev.name?S.already:(R.subtitle||S.rsvpSub))}</p>
      <form id="rf" novalidate>
        <label class="f"><span>${S.name}</span><input name="name" autocomplete="name" required maxlength="120" value="${esc(prev?prev.name:(fam&&fam.name)||'')}"></label>
        ${evRows}
        <div class="ppl" id="ppl" hidden>
          ${menus.length?`<label class="f"><span>${S.menu} · ${L==='en'?'you':'vous'}</span>${menuSel('menu0',prev&&prev.people&&prev.people[0]&&prev.people[0].menu)}</label>`:''}
          <div class="f"><span>${S.who}</span><div id="prs">${prevP.map(pRow).join('')}</div><button type="button" class="pr-add" id="prAdd">${S.addPerson}</button></div>
        </div>
        ${R.diet!==false?`<label class="f"><span>${S.diet}</span><input name="diet" maxlength="200" value="${esc(prev?prev.diet||'':'')}"></label>`:''}
        ${R.question?`<label class="f"><span>${esc(R.question)}</span><input name="answer" maxlength="300" value="${esc(prev?prev.answer||'':'')}"></label>`:''}
        <label class="f"><span>${S.msg}</span><textarea name="message" maxlength="1000">${esc(prev?prev.message||'':'')}</textarea></label>
        <label class="hp" aria-hidden="true">Site<input name="website" tabindex="-1" autocomplete="off"></label>
        <button class="go" type="submit">${S.send}</button>
        <p class="err" id="rerr" hidden></p>
        <div class="alt">
          ${R.whatsapp?`<p>${S.waT} <a class="wa" id="waLink" href="https://wa.me/${esc(String(R.whatsapp).replace(/\D/g,''))}" target="_blank" rel="noopener">${S.wa}</a></p>`:''}
          <p>${S.later} <a class="rem" href="#" id="remLink" download="${esc(I.slug)}-rappel.ics">${S.remind}</a></p>
        </div>
        <p class="note">${I.demo?S.demoNote+' ':''}${S.privacy} <a href="/confidentialite/" target="_blank" rel="noopener">${L==='en'?'Privacy':'Confidentialité'}</a></p>
      </form>`);
    const f=$('#rf'), ppl=$('#ppl'), prs=$('#prs'), add=$('#prAdd');
    const attending=()=>events.some(e=>f.querySelector(`input[name="ev-${e.id}"][value="1"]`)&&f.querySelector(`input[name="ev-${e.id}"][value="1"]`).checked);
    const syncPpl=()=>{ ppl.hidden=!attending(); add.hidden=prs.children.length>=max-1; };
    f.addEventListener('change',e=>{ if(e.target.type==='radio') syncPpl(); });
    add.onclick=()=>{ if(prs.children.length>=max-1) return; prs.insertAdjacentHTML('beforeend',pRow(null,prs.children.length)); syncPpl(); prs.lastElementChild.querySelector('input').focus(); };
    prs.addEventListener('click',e=>{ const b=e.target.closest('[data-prm]'); if(b){ b.parentNode.remove(); syncPpl(); } });
    syncPpl();
    // WhatsApp : le message commence par le nom tapé, le couple n'a plus qu'à lire
    const wa=$('#waLink'); if(wa){ const base=wa.href; const upd=()=>{ wa.href=base+'?text='+encodeURIComponent(S.waMsg.replace('{name}',f.name.value.trim()||'…')); }; f.name.addEventListener('input',upd); upd(); }
    const rem=$('#remLink'); rem.addEventListener('click',()=>{ rem.href=remindUrl(); });
    f.addEventListener('submit',async ev=>{
      ev.preventDefault();
      const fd=new FormData(f), err=$('#rerr');
      const data={invite:I.slug,rid:prev&&prev.rid||undefined,rkey:prev&&prev.rkey||undefined,family:fid||null,name:(fd.get('name')||'').trim(),guests:1,people:[],diet:(fd.get('diet')||'').trim(),answer:(fd.get('answer')||'').trim(),message:(fd.get('message')||'').trim(),website:fd.get('website')||'',events:{}};
      let ok=!!data.name; events.forEach(e=>{ const v=fd.get('ev-'+e.id); if(v==null) ok=false; else data.events[e.id]=v==='1'; });
      if(!ok){ err.textContent=S.need; err.hidden=false; return; }
      if(attending()){
        data.people=[{name:data.name,menu:fd.get('menu0')||''}];
        const names=fd.getAll('p-name'), ms=fd.getAll('p-menu');
        names.forEach((n,i)=>{ n=String(n).trim(); if(n) data.people.push({name:n,menu:ms[i]||''}); });
        data.guests=Math.min(max,data.people.length);
      }
      const btn=f.querySelector('.go'); btn.disabled=true; btn.textContent=S.sending; err.hidden=true;
      // noms saisis mais pas de menu choisi pour l'un d'eux : on envoie quand même, le menu reste « à préciser » côté mariés
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
