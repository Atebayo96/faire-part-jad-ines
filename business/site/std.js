/* Save The Oui : le save-the-date (formule « Save the date », 19 €, 30 octobre 2026 : « vas-y, 19 € pour le save-the-date,
   avec toutes les animations que tu m'as proposées »).
   Un seul écran, en deux temps :
   1. un petit jeu qui annonce la date, au choix parmi sept (ANIMS) : ticket à gratter, jackpot, carte d'embarquement,
      cadenas à code, message, bouton qui fuit, calendrier, et (même jour : « des cœurs emoji qui tombent du haut du
   téléphone et s'empilent en formant la date ») la pluie de cœurs ;
   2. la feuille de la carte (carte.js, inv.format === "std") : les prénoms, la date, la ville, Agenda et « Je serai là ».
   Les jeux se posent sur le fond peint du thème, dans des cartes claires et unies au texte foncé (le contraste ne dépend
   jamais de l'image, règles 1 et 7 de CLAUDE.md). « Voir directement » passe le jeu à tout moment.
   Partagé par le faire-part en ligne (invite.js) et la page /save-the-date/ (aperçu du configurateur).
   SceauSTD.html(inv,{live}) : le HTML ; SceauSTD.start(el,inv,{onDone}) : (re)lance le jeu ; SceauSTD.ANIMS : la liste. */
(function(){
  const ANIMS=[
    {k:'gratter',name:'Le ticket à gratter',tx:'On gratte, la date apparaît.'},
    {k:'jackpot',name:'Le jackpot',tx:'On tire le levier, les rouleaux tombent sur votre date.'},
    {k:'billet',name:'La carte d’embarquement',tx:'Un billet pour votre mariage, qu’on déchire pour embarquer.'},
    {k:'cadenas',name:'Le cadenas à code',tx:'Le code, c’est votre date : chaque chiffre trouvé se verrouille.'},
    {k:'sms',name:'Le message',tx:'Une conversation s’écrit toute seule, jusqu’à « On se marie ! ».'},
    {k:'fuit',name:'Le bouton qui fuit',tx:'« Non » s’échappe dès qu’on veut appuyer dessus.'},
    {k:'calendrier',name:'Le calendrier',tx:'Les pages se tournent jusqu’au grand jour, entouré au feutre.'},
    {k:'coeurs',name:'La pluie de cœurs',tx:'Des cœurs tombent du ciel et s’empilent pour écrire votre date.'}
  ];
  const KEYS=ANIMS.map(a=>a.k);
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc=t=>String(t==null?'':t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
  const wait=ms=>new Promise(r=>setTimeout(r,reduce?Math.min(ms,120):ms));
  const MO=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
  const WD=['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
  const NB=' ';
  // la carte des jeux est crème (#fbf7f0) ; l'encre du couple y est mesurée contre son point le plus sombre
  const CARD_LOW='#ece4d6';

  // la date telle qu'écrite dans la fiche ("2027-06-12T12:00"), sans fuseau
  function dateOf(inv){
    const [y,m,d]=String(inv.date||'2027-06-12').slice(0,10).split('-').map(Number), D=new Date(Date.UTC(y,m-1,d,12));
    const dd=d===1?'1er':String(d);
    return {D,y,m:m-1,d,wd:D.getUTCDay(),dd,full:`${cap(WD[D.getUTCDay()])} ${dd}${NB}${MO[m-1]} ${y}`,short:`${dd}${NB}${MO[m-1]} ${y}`};
  }
  function ctx(inv){
    const pal=/^#[0-9a-f]{6}$/i.test(inv.palette||'')?inv.palette:'#b8975a', C=window.SceauCarte;
    const n1=(inv.couple||[])[0]||'', n2=(inv.couple||[])[1]||'';
    return {inv,pal,ink:C.inkOf(pal,4.6,CARD_LOW),P:dateOf(inv),n1,n2,names:n2?`${n1} & ${n2}`:n1,
      ini:n2?`${n1.charAt(0)}&${n2.charAt(0)}`.toUpperCase():n1.charAt(0).toUpperCase(),city:(inv.std||{}).city||'',seal:C.sealFor(inv)};
  }
  const head=c=>`<p class="std-ey">Save the date</p><h2 class="std-nm">${esc(c.names)}</h2>`;

  // pluie de confettis aux couleurs du couple (mêmes confettis que reveal.css, .rvl-burst)
  function burst(root,pal){
    if(reduce) return; const b=document.createElement('div'); b.className='rvl-burst';
    const cols=[pal,'#ffffff','#f3dc9b',pal,'#e9d5b5'];
    b.innerHTML=Array.from({length:40},()=>{ const a=Math.random()*Math.PI*2, r=70+Math.random()*110;
      return `<i style="--c:${cols[Math.floor(Math.random()*cols.length)]};--x:${(Math.cos(a)*r).toFixed(0)}px;--y:${(Math.sin(a)*r*.8+40).toFixed(0)}px;--r:${(Math.random()*720-360).toFixed(0)}deg;--dl:${(Math.random()*.12).toFixed(2)}s;--w:${(4+Math.random()*4).toFixed(1)}px"></i>`; }).join('');
    root.appendChild(b); setTimeout(()=>b.remove(),1900);
  }

  const GAMES={};

  /* ---------- 1. ticket à gratter et 2. jackpot : le vrai composant de la révélation (reveal.js) ---------- */
  function reveal(kind){
    return (st,c,done)=>{
      st.innerHTML=`<div class="std-card">${head(c)}<div class="std-rvl"></div>${c.city?`<p class="std-city rvl-later">${esc(c.city)}</p>`:''}</div>`;
      const card=st.firstChild;
      if(!window.SceauReveal){ done(); return; }
      SceauReveal.mount(card.querySelector('.std-rvl'),{kind,date:c.P.D,tz:'UTC',lang:'fr',pal:c.pal,light:true,scope:card,onDone:()=>setTimeout(done,reduce?200:1300)});
    };
  }
  GAMES.gratter=reveal('scratch');
  GAMES.jackpot=reveal('slot');

  /* ---------- 3. la carte d'embarquement : on tire le talon vers le bas pour le déchirer ---------- */
  GAMES.billet=(st,c,done)=>{
    const code=(c.city.normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z]/gi,'').slice(0,3).toUpperCase())||'OUI';
    const plane='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15.5v-1.8l-7.6-4.7V3.8a1.4 1.4 0 0 0-2.8 0V9L3 13.7v1.8l7.6-2.3v5.2l-2.1 1.5V21l3.5-1 3.5 1v-1.1l-2.1-1.5v-5.2z"/></svg>';
    st.innerHTML=`<div class="std-bp">
      <div class="bp-main">
        <p class="bp-hd"><span>Carte d’embarquement</span>${plane}</p>
        <div class="bp-route"><div><small>Départ</small><b>ICI</b><span>Chez vous</span></div><i aria-hidden="true">${plane}</i><div><small>Arrivée</small><b>${esc(code)}</b><span>${esc(c.city||'Notre mariage')}</span></div></div>
        <div class="bp-grid"><div><small>Passager</small><b>Vous</b></div><div><small>Vol</small><b>${esc(c.ini.replace('&',''))} ${String(c.P.y).slice(2)}</b></div><div><small>Porte</small><b>Amour</b></div><div><small>Siège</small><b>1er rang</b></div></div>
        <div class="bp-date"><small>Date du vol</small><b class="bp-x" aria-hidden="true">●●&nbsp;●●●●●&nbsp;●●●●</b><b class="bp-ok">${esc(c.P.full)}</b><em class="bp-stamp" aria-hidden="true">Embarquement confirmé</em></div>
      </div>
      <div class="bp-stub" role="button" tabindex="0" aria-label="Déchirer le billet pour découvrir la date">
        <p><small>Mariage de</small><b>${esc(c.names)}</b></p><span class="bp-bar" aria-hidden="true"></span>
        <em>Tirez le talon vers le bas pour embarquer</em>
      </div>
    </div>`;
    const bp=st.firstChild, stub=bp.querySelector('.bp-stub');
    let y0=null, dy=0, t0=0, torn=false;
    const tear=()=>{ if(torn) return; torn=true; stub.style.transform=''; bp.classList.add('torn'); burst(bp.querySelector('.bp-date'),c.pal); setTimeout(done,reduce?200:2000); };
    stub.addEventListener('pointerdown',e=>{ y0=e.clientY; dy=0; t0=Date.now(); stub.setPointerCapture(e.pointerId); stub.classList.add('drag'); });
    stub.addEventListener('pointermove',e=>{ if(y0==null||torn) return; dy=Math.max(0,e.clientY-y0); stub.style.transform=`translateY(${Math.min(dy,90)}px) rotate(${Math.min(dy,90)*.06}deg)`; if(dy>70) tear(); });
    const up=()=>{ if(y0==null) return; y0=null; stub.classList.remove('drag'); if(torn) return; if(dy>36||(dy<8&&Date.now()-t0<400)) tear(); else stub.style.transform=''; };
    stub.addEventListener('pointerup',up); stub.addEventListener('pointercancel',up);
    stub.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); tear(); } });
  };

  /* ---------- 4. le cadenas : le code est la date (JJ MM) ; chaque chiffre juste se verrouille ---------- */
  GAMES.cadenas=(st,c,done)=>{
    const code=(String(c.P.d).padStart(2,'0')+String(c.P.m+1).padStart(2,'0')).split('').map(Number);
    const cur=code.map(n=>(n+1+Math.floor(Math.random()*8))%10);
    const wheel=i=>`<button type="button" class="lk-w" data-i="${i}" aria-label="Chiffre ${i+1}"><b>${cur[i]}</b></button>`;
    st.innerHTML=`<div class="std-lock">
      <svg class="lk-sh" viewBox="0 0 120 92" aria-hidden="true"><defs><linearGradient id="lkg" x1="0" x2="1"><stop offset="0" stop-color="#8d8a84"/><stop offset=".35" stop-color="#f1efe9"/><stop offset=".6" stop-color="#b4b0a8"/><stop offset="1" stop-color="#6f6b64"/></linearGradient></defs><path d="M24 92V50a36 36 0 0 1 72 0v42" fill="none" stroke="url(#lkg)" stroke-width="15" stroke-linecap="round"/></svg>
      <div class="lk-body">
        ${head(c)}
        <p class="lk-q">Trouvez le code pour ouvrir</p>
        <div class="lk-ws">${wheel(0)}${wheel(1)}<span aria-hidden="true">·</span>${wheel(2)}${wheel(3)}</div>
        <p class="lk-tip">Touchez les chiffres. Indice : c’est le jour et le mois de notre mariage.</p>
        <p class="lk-date" aria-live="polite"></p>
        <button type="button" class="lk-help" hidden>Je donne ma langue au chat</button>
      </div>
    </div>`;
    const L=st.firstChild, ws=[...L.querySelectorAll('.lk-w')], help=L.querySelector('.lk-help');
    let open=false;
    const check=()=>{ ws.forEach((w,i)=>{ if(cur[i]===code[i]&&!w.classList.contains('ok')){ w.classList.add('ok'); w.disabled=true; w.setAttribute('aria-label',`Chiffre ${i+1} trouvé : ${cur[i]}`); } });
      if(!open&&cur.every((n,i)=>n===code[i])){ open=true; help.hidden=true; L.querySelector('.lk-tip').hidden=true;
        setTimeout(()=>{ L.classList.add('open'); L.querySelector('.lk-date').textContent=c.P.full+(c.city?` · ${c.city}`:''); burst(L.querySelector('.lk-body'),c.pal); setTimeout(done,reduce?200:2100); },350); } };
    const turn=i=>{ if(open||cur[i]===code[i]) return; cur[i]=(cur[i]+1)%10; const b=ws[i].querySelector('b'); b.textContent=cur[i]; ws[i].classList.remove('roll'); void ws[i].offsetWidth; ws[i].classList.add('roll'); check(); };
    ws.forEach((w,i)=>w.addEventListener('click',()=>turn(i)));
    const ht=setTimeout(()=>{ if(!open) help.hidden=false; },9000);
    help.addEventListener('click',()=>{ clearTimeout(ht); help.hidden=true; const go=()=>{ const i=cur.findIndex((n,j)=>n!==code[j]); if(i<0) return; turn(i); setTimeout(go,reduce?0:110); }; go(); });
    check();
  };

  /* ---------- 5. le message : une conversation qui s'écrit toute seule ---------- */
  GAMES.sms=(st,c,done)=>{
    const [sn,sl,sm,sd]=c.seal;
    st.innerHTML=`<div class="std-sms">
      <div class="sm-hd"><span class="sm-av" style="background-image:url('/img/seals/${esc(sn)}.webp')"><b style="--l:${sl};--m:${sm};--d:${sd}">${esc(c.ini)}</b></span><p><b>${esc(c.names)}</b><small>en ligne</small></p></div>
      <div class="sm-list" aria-live="polite"></div>
      <div class="sm-rep"></div>
    </div>`;
    const S=st.firstChild, list=S.querySelector('.sm-list'), rep=S.querySelector('.sm-rep');
    let alive=true; st._stop=()=>{ alive=false; };
    const add=(t,me)=>{ const p=document.createElement('p'); p.className='sm-m'+(me?' me':''); p.innerHTML=t; list.appendChild(p); list.scrollTop=list.scrollHeight; return p; };
    const say=async(t,ms)=>{ if(!alive) return; const ty=add('<i></i><i></i><i></i>'); ty.classList.add('ty'); await wait(ms||1100); if(!alive) return; ty.remove(); add(t); await wait(450); };
    const ask=opts=>new Promise(ok=>{ rep.innerHTML=opts.map((o,i)=>`<button type="button" data-i="${i}">${esc(o)}</button>`).join(''); rep.classList.add('on');
      rep.querySelectorAll('button').forEach(b=>b.onclick=()=>{ rep.classList.remove('on'); rep.innerHTML=''; add(esc(opts[+b.dataset.i]),true); ok(+b.dataset.i); }); });
    (async()=>{
      await wait(500);
      await say('Coucou 👋',900);
      await say(`Tu fais quoi le <b>${esc(c.P.full.toLowerCase())}</b> ?`,1300);
      if(!alive) return;
      const a=await ask(['Rien, pourquoi ?','Ça dépend… 👀']);
      await wait(500);
      await say(a?'Alors annule tout 😄':'Parfait 😄',1000);
      await say(`On se marie !!! 💍${c.city?`<br>À ${esc(c.city)}`:''}`,1500);
      if(!alive) return; burst(S,c.pal);
      await say('Garde ta journée, le faire-part suit 😘',1200);
      if(alive) setTimeout(done,reduce?200:1800);
    })();
  };

  /* ---------- 6. le bouton qui fuit : « Non » s'échappe ---------- */
  GAMES.fuit=(st,c,done)=>{
    st.innerHTML=`<div class="std-card std-run">${head(c)}
      <p class="rn-q">Serez-vous libres le</p><p class="rn-d">${esc(c.P.full)}</p>${c.city?`<p class="std-city">à ${esc(c.city)} ?</p>`:'<p class="std-city">?</p>'}
      <div class="rn-acts"><button type="button" class="rn-yes">Oui, avec joie !</button><button type="button" class="rn-no">Non</button></div>
      <p class="rn-msg" aria-live="polite"></p></div>`;
    const card=st.firstChild, no=card.querySelector('.rn-no'), yes=card.querySelector('.rn-yes'), msg=card.querySelector('.rn-msg');
    const WORDS=['Non','Sûrs ?','Vraiment ?','Raté !','Presque…','Impossible 😄'];
    let n=0, fin=false;
    const run=e=>{ if(fin) return; if(e){ e.preventDefault(); }
      n++; if(n>=WORDS.length){ no._t=Date.now(); no.textContent='Bon… oui ! 🙂'; no.classList.add('gave'); no.style.left=''; no.style.top=''; card.querySelector('.rn-acts').appendChild(no); return; }
      no.textContent=WORDS[n];
      const R=st.getBoundingClientRect(), b=no.getBoundingClientRect(), Y=yes.getBoundingClientRect(), z=st.offsetWidth?R.width/st.offsetWidth:1;
      if(no.parentNode!==st){ st.appendChild(no); no.classList.add('away'); }
      let x=0,y=0;
      for(let k=0;k<12;k++){ x=Math.random()*(R.width-b.width-16)+8; y=Math.random()*(R.height-b.height-16)+8;
        const ax=R.left+x, ay=R.top+y; if(!(ax<Y.right+12&&ax+b.width>Y.left-12&&ay<Y.bottom+12&&ay+b.height>Y.top-12)) break; }
      no.style.left=(x/z)+'px'; no.style.top=(y/z)+'px'; };
    no.addEventListener('pointerenter',e=>{ if(e.pointerType==='mouse'&&!no.classList.contains('gave')) run(); });
    no.addEventListener('pointerdown',e=>{ if(!no.classList.contains('gave')) run(e); });
    no.addEventListener('keydown',e=>{ if((e.key==='Enter'||e.key===' ')&&!no.classList.contains('gave')) run(e); });
    const ok=()=>{ if(fin) return; fin=true; msg.textContent='On le savait ! 🥂'; card.classList.add('yes'); no.remove(); burst(card,c.pal); setTimeout(done,reduce?200:1700); };
    yes.addEventListener('click',ok);
    no.addEventListener('click',e=>{ if(no.classList.contains('gave')&&Date.now()-(no._t||0)>450) ok(); else e.preventDefault(); });
  };

  /* ---------- 7. le calendrier : les pages se tournent jusqu'au mois du mariage, le jour entouré au feutre ---------- */
  GAMES.calendrier=(st,c,done)=>{
    const now=new Date(), T=c.P.y*12+c.P.m;
    let s=now.getFullYear()*12+now.getMonth(); if(s>=T) s=T-6; if(T-s>14) s=T-14;
    const page=(ym,final)=>{ const y=Math.floor(ym/12), m=ym%12, first=(new Date(Date.UTC(y,m,1)).getUTCDay()+6)%7, n=new Date(Date.UTC(y,m+1,0)).getUTCDate();
      let cells='<i>L</i><i>M</i><i>M</i><i>J</i><i>V</i><i>S</i><i>D</i>'+'<span></span>'.repeat(first);
      for(let d=1;d<=n;d++) cells+=final&&d===c.P.d?`<span class="hit"><b>${d}</b><svg viewBox="0 0 60 50" aria-hidden="true"><path d="M33 6C17 4 5 13 5 26c0 12 12 19 27 18 15-1 24-10 23-21C54 11 41 4 26 6"/></svg></span>`:`<span>${d}</span>`;
      return `<p class="cl-m">${cap(MO[m])}</p><p class="cl-y">${y}</p><div class="cl-g">${cells}</div>`; };
    st.innerHTML=`<div class="std-cal">
      <div class="cl-pad"><div class="cl-rings" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div class="cl-pg">${page(s)}</div></div>
      <button type="button" class="cl-go">Tournez les pages jusqu’au grand jour</button>
      <div class="cl-end">${head(c)}<p class="cl-full">${esc(c.P.full)}</p>${c.city?`<p class="std-city">${esc(c.city)}</p>`:''}</div>
    </div>`;
    const C=st.firstChild, pad=C.querySelector('.cl-pad'), pg=C.querySelector('.cl-pg'), go=C.querySelector('.cl-go');
    let busy=false;
    const flip=(ym,final,ms)=>new Promise(ok=>{ const f=pg.cloneNode(true); f.classList.add('fly'); f.style.animationDuration=ms+'ms'; pad.appendChild(f); pg.innerHTML=page(ym,final);
      setTimeout(()=>{ f.remove(); ok(); },reduce?0:ms); });
    const run=async()=>{ if(busy) return; busy=true; go.hidden=true;
      const steps=T-s; for(let k=1;k<=steps;k++){ const ms=Math.max(110,420-k*45); await flip(s+k,k===steps,ms); if(!reduce) await new Promise(r=>setTimeout(r,ms*.35)); }
      if(steps<=0) pg.innerHTML=page(T,true);
      C.classList.add('hit'); await wait(1300); C.classList.add('end'); burst(C.querySelector('.cl-end'),c.pal); setTimeout(done,reduce?200:2200); };
    go.addEventListener('click',run); pad.addEventListener('click',run);
  };

  /* ---------- 8. la pluie de cœurs : des ❤️ tombent du haut de l'écran et s'empilent, du bas vers le haut, pour écrire
     la date en chiffres de 3 × 5 cœurs (« 12·06 », puis « 2027 ») ; la date en toutes lettres suit ---------- */
  const DIG=['111101101101111','010110010010111','111001111100111','111001111001111','101101111001001','111100111001111','111100111101111','111001010010010','111101111101111','111101111001111'];
  GAMES.coeurs=(st,c,done)=>{
    const W=17, line=parts=>{ const g=Array.from({length:5},()=>Array(W).fill(0)); let x=0;
      parts.forEach(p=>{ if(p==='.'){ g[4][x+1]=1; x+=3; return; } if(p===' '){ x+=1; return; } if(p==='_'){ x+=1; return; }
        const d=DIG[+p]; for(let r=0;r<5;r++) for(let k=0;k<3;k++) if(d[r*3+k]==='1') g[r][x+k]=1; x+=3; }); return g; };
    const dd=String(c.P.d).padStart(2,'0'), mm=String(c.P.m+1).padStart(2,'0'), yy=String(c.P.y);
    const rows=line([dd[0],' ',dd[1],'.',mm[0],' ',mm[1]]).concat([Array(W).fill(0)],line(['_',yy[0],' ',yy[1],' ',yy[2],' ',yy[3]]));
    let cells='', n=0; const H=rows.length;
    rows.forEach((row,r)=>row.forEach(v=>{ if(!v){ cells+='<span></span>'; return; }
      // le bas de chaque ligne de chiffres tombe d'abord : les cœurs s'empilent
      const base=r<5?(4-r)*.28:(10-r)*.28+1.5, dl=base+Math.random()*.32; n++;
      cells+=`<span class="h" style="--dl:${dl.toFixed(2)}s;--rt:${(Math.random()*40-20).toFixed(0)}deg">❤️</span>`; }));
    st.innerHTML=`<div class="std-card std-hz">${head(c)}<div class="hz-g" role="img" aria-label="${esc(c.P.full)}" style="--cols:${W};--rows:${H}">${cells}</div>
      <p class="hz-full">${esc(c.P.full)}</p>${c.city?`<p class="std-city">${esc(c.city)}</p>`:''}</div>`;
    const card=st.firstChild, T=reduce?0:1.5+2.6+.32+1.1;
    setTimeout(()=>{ card.classList.add('on'); burst(card,c.pal); setTimeout(done,reduce?200:2300); },T*1000);
  };

  /* ---------- le save-the-date ---------- */
  function html(inv,o){
    o=o||{}; const C=window.SceauCarte, k=KEYS.includes((inv.std||{}).anim)?inv.std.anim:'gratter', c=ctx(inv), F=C.fontOf(inv);
    return `<div class="std std-a-${k}" data-anim="${k}" style="--pal:${c.pal};--sink:${c.ink};--snf:${esc(F.ff)};--sni:${F.it?'italic':'normal'};--snu:${F.up?'uppercase':'none'};--snl:${F.up?'.1em':'0'}">`+
      `<div class="std-sheet">${C.html(inv,Object.assign({fit:true},o))}</div>`+
      `<div class="std-play" role="region" aria-label="Save the date" style="background-image:url('${C.fondOf(inv.theme)}')"><div class="std-stage"></div>`+
      `<button type="button" class="std-skip">Voir directement</button></div></div>`;
  }
  // (re)lance le jeu : el est l'élément .std ou un de ses parents
  function start(el,inv,o){
    o=o||{}; const S=el.matches&&el.matches('.std')?el:el.querySelector('.std'); if(!S) return;
    const st=S.querySelector('.std-stage'), play=S.querySelector('.std-play'), k=S.dataset.anim;
    if(st._stop) st._stop(); st._stop=null; clearTimeout(S._t);
    S.classList.remove('std-done','std-gone'); play.hidden=false;
    let fin=false;
    const done=()=>{ if(fin) return; fin=true; if(st._stop) st._stop(); S.classList.add('std-done');
      S._t=setTimeout(()=>{ S.classList.add('std-gone'); play.hidden=true; if(o.onDone) o.onDone(); },reduce?0:750); };
    S.querySelector('.std-skip').onclick=done;
    (GAMES[k]||GAMES.gratter)(st,ctx(inv),()=>{ if(!fin) done(); });
  }
  window.SceauSTD={ANIMS,html,start};
})();
