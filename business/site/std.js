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
    {k:'gratter',ico:'🎟️',name:'Le ticket à gratter',tx:'Un vrai ticket : le latex argenté s’écaille sous le doigt, les copeaux tombent, la date apparaît.'},
    {k:'jackpot',ico:'🎰',name:'Le jackpot',tx:'Une vraie machine : on tire le levier, les trois rouleaux tournent et s’arrêtent un à un sur votre date.'},
    {k:'billet',off:true,ico:'✈️',name:'La carte d’embarquement',tx:'On déchire le talon, on fait décoller l’avion : la date s’affiche comme au tableau des départs.'},
    {k:'cadenas',ico:'🔒',off:true,name:'Le cadenas à code',tx:'On tourne la molette d’un coffre : elle chauffe quand on approche du jour, puis du mois.'},
    {k:'sms',off:true,ico:'💬',name:'Le message',tx:'Une conversation s’écrit toute seule, jusqu’à « On se marie ! ».'},
    {k:'fuit',off:true,ico:'🏃',name:'Le bouton qui fuit',tx:'Le bouton « Oui » s’échappe, et à chaque fois une info de plus apparaît.'},
    {k:'calendrier',off:true,ico:'📅',name:'Le calendrier',tx:'La date d’aujourd’hui se met à rouler et s’arrête sur le grand jour.'},
    {k:'coeurs',off:true,ico:'❤️',name:'La pluie de cœurs',tx:'Un bocal se remplit de cœurs, et seule votre date reste en blanc.'}
  ];
  const KEYS=ANIMS.map(a=>a.k);
  // 15 novembre 2026 : « on va se focus sur le ticket à gratter et le jackpot, proposer que ça » : les autres jeux sont mis de
  // côté (off) comme le cadenas ; ils marchent encore pour une fiche ou une démo qui les a, mais ne se proposent plus
  // le cadenas est mis de côté (2 novembre 2026 : « pas ouf ») : il marche encore pour une fiche qui l'a, mais ne se propose plus
  const LIST=ANIMS.filter(a=>!a.off);
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
      art:C.artOf?C.artOf(inv.theme):'',ini:n2?`${n1.charAt(0)}&${n2.charAt(0)}`.toUpperCase():n1.charAt(0).toUpperCase(),city:(inv.std||{}).city||'',seal:C.sealFor(inv)};
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

  /* ---------- 1. ticket à gratter et 2. jackpot, refaits pour le save-the-date (15 novembre 2026 : « améliorer les effets du
     ticket à gratter et du jackpot pour que ce soit le plus réaliste possible »). Ils ne passent plus par reveal.js (qui reste
     le composant du faire-part) : ici le jeu prend l'écran. Réalisme : la matière (latex argenté qui s'écaille, copeaux qui
     tombent, rouleaux cylindriques, chrome), le poids (élan, vitesse, arrêt sec et rebond de chaque rouleau, levier qu'on tire
     et qui revient), le son (frottement, cliquetis, « clac » d'arrêt, carillon) et la vibration du téléphone. ---------- */
  // le son : un petit synthé WebAudio, créé au premier toucher seulement (jamais avant un geste) ; muet si le téléphone l'est
  let AC=null, NB_=null;
  const ac=()=>{ try{ AC=AC||new (window.AudioContext||window.webkitAudioContext)(); if(AC.state==='suspended') AC.resume(); }catch(e){ AC=null; } return AC; };
  const noise=()=>{ if(NB_||!AC) return NB_; NB_=AC.createBuffer(1,AC.sampleRate,AC.sampleRate); const d=NB_.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1; return NB_; };
  function tone(f,dur,type,vol,dl){ const A=ac(); if(!A) return; try{ const t=A.currentTime+(dl||0), o=A.createOscillator(), g=A.createGain();
    o.type=type||'sine'; o.frequency.setValueAtTime(f,t); g.gain.setValueAtTime(vol||.08,t); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g); g.connect(A.destination); o.start(t); o.stop(t+dur+.02); }catch(e){} }
  function thud(vol,freq,dur){ const A=ac(); if(!A) return; try{ const t=A.currentTime, n=A.createBufferSource(), f=A.createBiquadFilter(), g=A.createGain();
    n.buffer=noise(); f.type='lowpass'; f.frequency.value=freq||900; g.gain.setValueAtTime(vol||.2,t); g.gain.exponentialRampToValueAtTime(.0001,t+(dur||.09));
    n.connect(f); f.connect(g); g.connect(A.destination); n.start(t); n.stop(t+(dur||.09)+.02); }catch(e){} }
  const chime=()=>[523,659,784,1047,1319].forEach((f,i)=>{ tone(f,.5,'triangle',.07,i*.09); tone(f*2,.3,'sine',.025,i*.09); });
  const buzz=p=>{ try{ if(navigator.vibrate) navigator.vibrate(p); }catch(e){} };
  // le jeu est dessiné pour 328 px de large : il se met à l'échelle de l'écran (de 0,8 à 1,2)
  function fitGame(st,el,w,h){ const f=()=>{ if(!el.isConnected) return removeEventListener('resize',f); const W=st.clientWidth-24, H=st.clientHeight-110; if(W>0&&H>0) el.style.setProperty('--z',Math.max(.72,Math.min(1.2,W/w,H/h)).toFixed(3)); };
    f(); addEventListener('resize',f); requestAnimationFrame(f); }
  // pluie de pièces et de confettis dorés, plus fournie que burst()
  function gold(root,pal){ if(reduce) return; const b=document.createElement('div'); b.className='rvl-burst std-gold';
    const cols=['#e7c15a','#f6e39a','#c9972f','#fff6d6',pal];
    b.innerHTML=Array.from({length:70},()=>{ const a=-Math.PI/2+(Math.random()-.5)*2.6, r=90+Math.random()*190;
      return `<i style="--c:${cols[Math.floor(Math.random()*cols.length)]};--x:${(Math.cos(a)*r).toFixed(0)}px;--y:${(Math.sin(a)*r*.7+170+Math.random()*120).toFixed(0)}px;--r:${(Math.random()*900-450).toFixed(0)}deg;--dl:${(Math.random()*.25).toFixed(2)}s;--w:${(5+Math.random()*5).toFixed(1)}px"></i>`; }).join('');
    root.appendChild(b); setTimeout(()=>b.remove(),2400); }

  /* les objets peints (15 novembre 2026 : « ça fait cheap, ça se voit que c'est des objets déposés ; un vrai truc dessiné, et
     derrière des vrais chiffres qui tournent ») : par thème, une machine et un ticket peints (tools/jeux-art.py,
     img/jeux/<thème>-machine|levier|ticket.webp), la vitre et la zone à gratter sont des trous : nos rouleaux et notre film
     se posent DERRIÈRE la peinture. win = le trou [x, y, l, h] en fractions de l'image (img/jeux/meta.json) ; les autres
     cases (fronton, bandeaux) sont les panneaux crème laissés vides par la peinture, mesurés sur l'image.
     Un thème sans peinture garde les objets dessinés en CSS. */
  const JV=1, JEUX={
    dolcevita:{m:{r:'900/1727',win:[.2126,.4068,.5756,.1441]},t:{r:'900/1239',win:[.1636,.3485,.6727,.4678]}}
  };
  const jeu=inv=>JEUX[inv.theme]||JEUX[String(inv.theme).replace(/jour$/,'')]||null;
  const pos=(b,m)=>`left:${((b[0]-m)*100).toFixed(2)}%;top:${((b[1]-m)*100).toFixed(2)}%;width:${((b[2]+2*m)*100).toFixed(2)}%;height:${((b[3]+2*m)*100).toFixed(2)}%`;
  // les prénoms tiennent sur une ligne dans leur panneau : on réduit la police s'il le faut (jamais sous 16 px)
  const fitNm=el=>{ if(!el) return; el.style.whiteSpace='nowrap'; let f=parseFloat(getComputedStyle(el).fontSize); while(el.scrollWidth>el.clientWidth+1&&f>16){ f-=1; el.style.fontSize=f+'px'; } };

  /* 1. le ticket à gratter : un vrai ticket (souche de couleur, perforation, zone de latex argenté, numéro et code-barres).
     Le latex s'écaille sous le doigt avec un bord irrégulier, des copeaux tombent, le frottement s'entend ; une pièce montre
     le geste tant qu'on n'a pas touché. À moitié gratté, le reste se détache et la date bat. */
  GAMES.gratter=(st,c,done)=>{
    const P=c.P, no=String(P.d).padStart(2,'0')+String(P.m+1).padStart(2,'0')+String(P.y).slice(2);
    const dm=P.dd+NB+MO[P.m], J=jeu(c.inv), key=c.inv.theme.replace(/jour$/,'');
    const zoneH=`<div class="tk-under"><small>${esc(cap(WD[P.wd]))}</small><b${dm.length>10?' class="lg"':''}>${esc(dm)}</b><span>${P.y}</span></div>
          <canvas class="tk-foil" tabindex="0" role="button" aria-label="Gratter pour découvrir la date"></canvas><i class="tk-coin" aria-hidden="true"></i>`;
    if(J) st.innerHTML=`<div class="std-game std-tkw"><div class="std-tk art" style="aspect-ratio:${J.t.r}">
      <div class="tk-zone" style="${pos(J.t.win,.008)}">${zoneH}</div>
      <img class="tk-img" src="/img/jeux/${key}-ticket.webp?v=${JV}" alt="">
      <div class="tk-top"><p class="tk-ey">Save the date</p><h2 class="std-nm">${esc(c.names)}</h2></div>
      <div class="tk-strip"><p class="tk-call">Grattez pour découvrir la date</p><p class="tk-city">${esc(c.city||'Notez bien la date')}</p></div>
    </div></div><canvas class="tk-dust" aria-hidden="true"></canvas><div class="std-sr" aria-live="polite"></div>`;
    else st.innerHTML=`<div class="std-game std-tkw ct-p-coton"><div class="std-tk">
      <div class="tk-top"><p class="tk-ey">Save the date</p><h2 class="std-nm">${esc(c.names)}</h2></div>
      <div class="tk-perf" aria-hidden="true"></div>
      <div class="tk-body"><p class="tk-call">Grattez pour découvrir la date</p>
        <div class="tk-zone"><div class="tk-under"><small>${esc(cap(WD[P.wd]))}</small><b${dm.length>10?' class="lg"':''}>${esc(dm)}</b><span>${P.y}</span></div>
          <canvas class="tk-foil" tabindex="0" role="button" aria-label="Gratter pour découvrir la date"></canvas><i class="tk-coin" aria-hidden="true"></i></div></div>
      <div class="tk-foot"><p class="tk-city">${esc(c.city||'Notez bien la date')}</p></div>
    </div>${c.art?`<img class="std-art" src="${c.art}" alt="">`:''}</div><canvas class="tk-dust" aria-hidden="true"></canvas><div class="std-sr" aria-live="polite"></div>`;
    const wrap=st.firstElementChild, tk=wrap.firstElementChild, cv=st.querySelector('.tk-foil'), zone=cv.parentNode, dust=st.querySelector('.tk-dust');
    fitGame(st,wrap,336,J?470:500); if(J) st.parentNode.classList.add('std-dim'); fitNm(st.querySelector('.std-nm')); if(document.fonts&&document.fonts.ready) document.fonts.ready.then(()=>fitNm(st.querySelector('.std-nm')));
    let cx, W=0, H=0, down=false, last=null, over=false, lastCheck=0, tries=0, alive=true, src=null, sg=null, lastT=0;
    st._stop=()=>{ alive=false; hush(true); };
    (function foil(){
      W=zone.clientWidth; H=zone.clientHeight; if(!alive) return;
      if(!W||!H){ if(tries++<120) requestAnimationFrame(foil); return; }
      const dpr=Math.min(2,devicePixelRatio||1); cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr);
      cx=cv.getContext('2d',{willReadFrequently:true}); cx.setTransform(dpr,0,0,dpr,0,0);
      // le film à gratter : la couleur du couple, satinée (un reflet en biais), semée de petits motifs, et une grande étiquette
      // crème « Grattez ici » en Cormorant ; sobre, pour aller avec les cinq thèmes
      cx.fillStyle=c.ink; cx.fillRect(0,0,W,H);
      const g=cx.createLinearGradient(0,0,W,H); [[0,.16],[.3,0],[.46,.26],[.6,0],[1,.1]].forEach(([p,a])=>g.addColorStop(p,`rgba(255,255,255,${a})`)); cx.fillStyle=g; cx.fillRect(0,0,W,H);
      for(let i=0;i<W*H/9;i++){ cx.fillStyle=Math.random()<.5?'rgba(255,255,255,.07)':'rgba(0,0,0,.07)'; cx.fillRect(Math.random()*W,Math.random()*H,1,1); }
      cx.font='15px Georgia,serif'; cx.textAlign='center'; cx.textBaseline='middle'; cx.fillStyle='rgba(243,220,155,.5)';
      for(let y=22;y<H;y+=44) for(let x=((y-22)/44%2?44:22);x<W;x+=44) cx.fillText('✦',x,y);
      cx.strokeStyle='rgba(243,220,155,.85)'; cx.lineWidth=1.2; cx.setLineDash([3,5]); cx.strokeRect(9.5,9.5,W-19,H-19); cx.setLineDash([]);
      cx.font='600 26px "Cormorant Garamond",Georgia,serif'; const lb='Grattez ici', tw=cx.measureText(lb).width+52;
      cx.fillStyle='#fbf7f0'; cx.beginPath(); cx.roundRect?cx.roundRect(W/2-tw/2,H/2-28,tw,56,28):cx.rect(W/2-tw/2,H/2-28,tw,56); cx.fill();
      cx.fillStyle='#2b2621'; cx.fillText(lb,W/2,H/2+1);
      cx.globalCompositeOperation='destination-out';
    })();
    // les copeaux de latex : ils partent du doigt, tombent et s'effacent
    const dx=dust.getContext('2d'), bits=[]; let raf=0;
    function sizeDust(){ const d=Math.min(2,devicePixelRatio||1); dust.width=st.clientWidth*d; dust.height=st.clientHeight*d; dx.setTransform(d,0,0,d,0,0); }
    function loop(){ raf=0; if(!alive) return; dx.clearRect(0,0,dust.width,dust.height); const now=performance.now();
      for(let i=bits.length-1;i>=0;i--){ const b=bits[i], a=1-(now-b.t)/b.life; if(a<=0){ bits.splice(i,1); continue; }
        b.vy+=.32; b.x+=b.vx; b.y+=b.vy; b.r+=b.vr; dx.save(); dx.translate(b.x,b.y); dx.rotate(b.r); dx.globalAlpha=Math.min(1,a*1.6); dx.fillStyle=b.c; dx.fillRect(-b.w/2,-b.h/2,b.w,b.h); dx.restore(); }
      if(bits.length) raf=requestAnimationFrame(loop); }
    function flake(e,n){ if(reduce) return; const r=st.getBoundingClientRect(), k=st.clientWidth/r.width, x=(e.clientX-r.left)*k, y=(e.clientY-r.top)*k;
      for(let i=0;i<n;i++) bits.push({x:x+(Math.random()-.5)*20,y:y+(Math.random()-.5)*14,vx:(Math.random()-.5)*3.4,vy:-Math.random()*2.2,r:Math.random()*6,vr:(Math.random()-.5)*.5,
        w:2+Math.random()*5,h:1.5+Math.random()*3,c:[c.ink,c.ink,c.pal,'#e9dfcc'][Math.floor(Math.random()*4)],t:performance.now(),life:650+Math.random()*600});
      if(bits.length>260) bits.splice(0,bits.length-260); if(!raf) raf=requestAnimationFrame(loop); }
    // le bruit du grattage : un souffle filtré dont le volume suit la vitesse du doigt
    function rasp(v){ const A=ac(); if(!A) return; try{ if(!src){ src=A.createBufferSource(); src.buffer=noise(); src.loop=true; const f=A.createBiquadFilter(); f.type='bandpass'; f.frequency.value=3400; f.Q.value=.6;
        sg=A.createGain(); sg.gain.value=0; src.connect(f); f.connect(sg); sg.connect(A.destination); src.start(); }
      sg.gain.setTargetAtTime(Math.min(.11,v*.05),A.currentTime,.02); }catch(e){} }
    function hush(kill){ try{ if(sg&&AC) sg.gain.setTargetAtTime(0,AC.currentTime,.03); if(kill&&src){ const s=src; src=null; setTimeout(()=>{ try{ s.stop(); }catch(e){} },200); } }catch(e){} }
    const at=e=>{ const r=cv.getBoundingClientRect(); return {x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height}; };
    // un coup de pièce : des pastilles de taille inégale le long du trait, pour un bord déchiqueté
    function rub(a,b){ const d=Math.hypot(b.x-a.x,b.y-a.y), n=Math.max(1,Math.ceil(d/4));
      for(let i=0;i<=n;i++){ const x=a.x+(b.x-a.x)*i/n, y=a.y+(b.y-a.y)*i/n;
        cx.beginPath(); cx.arc(x,y,21,0,7); cx.fill();
        for(let j=0;j<3;j++){ const an=Math.random()*7, rr=19+Math.random()*8; cx.beginPath(); cx.arc(x+Math.cos(an)*rr,y+Math.sin(an)*rr,2+Math.random()*5,0,7); cx.fill(); } }
      return d; }
    function cleared(){ const d=cx.getImageData(0,0,cv.width,cv.height).data; let n=0, z=0; for(let i=3;i<d.length;i+=96){ n++; if(d[i]<40) z++; } return z/n; }
    function finish(){
      if(over) return; over=true; down=false; hush(true); cv.classList.add('gone'); tk.classList.add('won');
      if(!J) st.querySelector('.tk-call').textContent='Notez bien la date !'; st.querySelector('.std-sr').textContent=c.P.full;
      buzz([25,50,25,50,70]); chime(); burst(wrap,c.pal); setTimeout(()=>{ if(alive) gold(wrap,c.pal); },180);
      setTimeout(()=>{ cv.remove(); },700); setTimeout(()=>{ if(alive) done(); },reduce?300:2300);
    }
    cv.addEventListener('pointerdown',e=>{ if(!cx||over) return; down=true; tk.classList.add('touched'); if(!dust.width) sizeDust(); try{ cv.setPointerCapture(e.pointerId); }catch(x){} last=at(e); lastT=performance.now(); rub(last,last); flake(e,5); rasp(.6); buzz(6); });
    cv.addEventListener('pointermove',e=>{ if(!down||over) return; const p=at(e), d=rub(last,p), now=performance.now(), v=d/Math.max(8,now-lastT); last=p; lastT=now;
      if(d>2){ flake(e,Math.min(6,1+Math.round(d/7))); rasp(v); }
      if(now-lastCheck>140){ lastCheck=now; if(d>6) buzz(4); if(cleared()>.5) finish(); } });
    const up=()=>{ if(!down) return; down=false; hush(); if(!over&&cleared()>.52) finish(); };
    cv.addEventListener('pointerup',up); cv.addEventListener('pointercancel',up);
    cv.addEventListener('touchstart',e=>e.stopPropagation(),{passive:true});
    cv.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); finish(); } });
  };

  /* 2. le jackpot : une vraie machine à sous (fronton aux ampoules, vitre chromée, trois rouleaux cylindriques, levier).
     On tire le levier vers le bas (ou on touche la machine) : il revient d'un coup, les rouleaux prennent leur élan, tournent
     flous (au départ ils montrent « ? » : une date au hasard se lisait comme la vraie), puis s'arrêtent l'un après l'autre, sec, avec un rebond et un « clac » ; jour, mois, année ; les ampoules
     s'affolent et les pièces tombent. Les rouleaux sont de vrais rubans sans fin, dans l'ordre (1, 2, 3… ; janvier, février…). */
  GAMES.jackpot=(st,c,done)=>{
    const P=c.P, J=jeu(c.inv), key=c.inv.theme.replace(/jour$/,''), MW=290, IH=J?Math.round(MW*1727/900*(J.m.win[3]+.012)/1.5):80;
    const LST=[Array.from({length:31},(_,i)=>i===0?'1er':String(i+1)),MO,Array.from({length:6},(_,i)=>String(P.y-2+i))], TGT=[P.d-1,P.m,2];
    const strip=l=>[...l,...l,...l].map(v=>`<div>${esc(v)}</div>`).join('');
    const reels=`${['d','m','y'].map((k,i)=>`<div class="jp-reel ${k}"><div class="jp-strip">${strip(LST[i])}</div><div class="jp-q">?</div></div>`).join('')}<i class="jp-line" aria-hidden="true"></i>`;
    if(J) st.innerHTML=`<div class="std-game std-jp art" style="--ih:${IH}px">
      <div class="jp-lever" role="button" tabindex="-1" aria-label="Tirer le levier"><div class="lv-clip"><i class="jp-arm"><img src="/img/jeux/${key}-levier.webp?v=${JV}" alt=""></i></div><img class="lv-base" src="/img/jeux/${key}-levier.webp?v=${JV}" alt=""><p class="jp-pull">Tirez</p></div>
      <div class="jp-cab" style="aspect-ratio:${J.m.r}">
        <div class="jp-win" role="button" tabindex="0" aria-label="Lancer les rouleaux" style="${pos(J.m.win,.006)}">${reels}</div>
        <img class="jp-img" src="/img/jeux/${key}-machine.webp?v=${JV}" alt="">
        <div class="jp-sign"><p class="jp-ey">Save the date</p><h2 class="std-nm">${esc(c.names)}</h2></div>
        <p class="jp-call">Tirez le levier</p>
        <p class="jp-res">${esc(cap(WD[P.wd]))}${c.city?' · '+esc(c.city):''}</p>
      </div>
    </div><div class="std-sr" aria-live="polite"></div>`;
    else st.innerHTML=`<div class="std-game std-jp ct-p-coton">
      <div class="jp-cab">
        <div class="jp-sign"><i class="jp-bulbs" aria-hidden="true">${'<b></b>'.repeat(9)}</i><p class="jp-ey">Save the date</p><h2 class="std-nm">${esc(c.names)}</h2></div>
        <div class="jp-body"><p class="jp-call">Tirez le levier</p>
          <div class="jp-win" role="button" tabindex="0" aria-label="Lancer les rouleaux">${['d','m','y'].map((k,i)=>`<div class="jp-reel ${k}"><div class="jp-strip">${strip(LST[i])}</div><div class="jp-q">?</div></div>`).join('')}<i class="jp-line" aria-hidden="true"></i></div>
          <p class="jp-res">${esc(cap(WD[P.wd]))}${c.city?' · '+esc(c.city):''}</p>
          <div class="jp-tray" aria-hidden="true"></div></div>
      </div>
      <div class="jp-lever" role="button" tabindex="-1" aria-label="Tirer le levier"><i class="jp-base"></i><i class="jp-arm"><b></b></i><p class="jp-pull">Tirez</p></div>${c.art?`<img class="std-art" src="${c.art}" alt="">`:''}
    </div><div class="std-sr" aria-live="polite"></div>`;
    const jp=st.firstElementChild, win=jp.querySelector('.jp-win'), lever=jp.querySelector('.jp-lever'), arm=jp.querySelector('.jp-arm');
    fitGame(st,jp,J?368:336,J?572:510); if(J) st.parentNode.classList.add('std-dim'); fitNm(jp.querySelector('.std-nm')); if(document.fonts&&document.fonts.ready) document.fonts.ready.then(()=>fitNm(jp.querySelector('.std-nm')));
    let alive=true, spun=false; st._stop=()=>{ alive=false; };
    // chaque rouleau : sa position en cases (flottante), posée sur le ruban du milieu
    const R=[...jp.querySelectorAll('.jp-strip')].map((el,i)=>{ const n=LST[i].length; let p=(TGT[i]+3+Math.floor(Math.random()*(n-5)))%n; return {el,n,p,i}; });
    const put=(r,p,v)=>{ const m=((p%r.n)+r.n)%r.n; r.el.style.transform=`translateY(${(IH*.25-(r.n+m)*IH).toFixed(1)}px)`; r.el.style.filter=v>6?`blur(${Math.min(2.6,v*.09).toFixed(2)}px)`:''; };
    R.forEach(r=>put(r,r.p,0));
    let lastTick=0;
    function go(){
      if(spun||!alive) return; spun=true; jp.classList.add('touched','spin'); win.removeAttribute('tabindex'); win.setAttribute('aria-disabled','true');
      ac(); thud(.22,500,.12); buzz(18);
      const t0=performance.now();
      R.forEach(r=>{ const turns=reduce?0:(r.n>20?1:r.n>8?3:6)+r.i*(r.n>20?1:r.n>8?2:4), need=((TGT[r.i]-r.p)%r.n+r.n)%r.n;
        r.p0=r.p; r.D=turns*r.n+need; r.T=reduce?300:1500+r.i*850; r.stopped=false; r.cell=Math.floor(r.p); });
      (function frame(now){ if(!alive) return; const t=now-t0; let all=true;
        R.forEach(r=>{ if(r.stopped&&t>r.T+420) return; all=false; let p, v=0;
          if(t<110&&!reduce){ p=r.p0-.28*Math.sin(t/110*Math.PI/2); }                       // l'élan : un petit recul
          else if(t<r.T){ const u=Math.max(0,(t-110)/(r.T-110)), e=.72*u+.28*(1-Math.pow(1-u,3)); p=r.p0-.28*(1-Math.min(1,u*8))+r.D*e; v=r.D/((r.T-110)/1000)*(.72+.84*Math.pow(1-u,2)); }
          else { const w=(t-r.T)/1000; p=r.p0+r.D+(reduce?0:.2*Math.exp(-9*w)*Math.sin(26*w));                                           // l'arrêt sec, puis le rebond
            if(!r.stopped){ r.stopped=true; thud(.3,700,.1); tone(180,.12,'square',.05); buzz(22); r.el.parentNode.classList.add('hit'); } }
          const cell=Math.floor(p); if(cell!==r.cell&&!r.stopped){ r.cell=cell; if(now-lastTick>38){ lastTick=now; tone(1500+r.i*250,.018,'square',.022); } }
          put(r,p,v); });
        if(all){ R.forEach(r=>{ r.p=TGT[r.i]; put(r,r.p,0); }); return won(); }
        requestAnimationFrame(frame); })(t0);
    }
    function won(){ if(!alive) return; jp.classList.remove('spin'); jp.classList.add('won'); jp.querySelector('.jp-call').textContent=J?'Jackpot !':'Jackpot ! Notez bien la date';
      st.querySelector('.std-sr').textContent=c.P.full; chime(); buzz([30,60,30,60,90]); gold(jp,c.pal); setTimeout(()=>{ if(alive) burst(jp,c.pal); },250);
      setTimeout(()=>{ if(alive) done(); },reduce?300:2600); }
    // le levier : on le tire vers le bas, il résiste, et lâché assez bas il lance les rouleaux en revenant d'un coup
    let y0=null, pull=0, notch=0;
    // la tige se raccourcit puis s'inverse (elle bascule vers nous) ; la boule garde sa taille
    const setArm=k=>{ pull=k; let s=1-1.7*k; if(Math.abs(s)<.14) s=s<0?-.14:.14; arm.style.setProperty('--s',s.toFixed(3)); arm.style.setProperty('--ks',(1/Math.abs(s)).toFixed(3)); arm.style.setProperty('--k',k.toFixed(3)); };
    lever.addEventListener('pointerdown',e=>{ if(spun) return; y0=e.clientY; jp.classList.add('held'); arm.classList.remove('back'); try{ lever.setPointerCapture(e.pointerId); }catch(x){} ac(); });
    lever.addEventListener('pointermove',e=>{ if(y0==null||spun) return; const r=jp.getBoundingClientRect().width/jp.offsetWidth||1, k=Math.max(0,Math.min(1,(e.clientY-y0)/(150*r))); setArm(k);
      const n=Math.floor(k*6); if(n!==notch){ notch=n; tone(700,.02,'square',.03); buzz(5); } });
    const release=()=>{ if(y0==null) return; y0=null; const k=pull; arm.classList.add('back'); setArm(0); if(k>.5) go(); };
    lever.addEventListener('click',()=>{ if(!spun&&y0==null&&pull===0) auto(); });
    lever.addEventListener('pointerup',release); lever.addEventListener('pointercancel',release);
    lever.addEventListener('touchstart',e=>e.stopPropagation(),{passive:true});
    // un simple toucher (levier ou vitre) : le levier descend et remonte tout seul
    function auto(){ if(spun) return; ac(); arm.classList.remove('back'); arm.classList.add('auto'); setArm(1); tone(700,.02,'square',.03); setTimeout(()=>{ arm.classList.remove('auto'); arm.classList.add('back'); setArm(0); go(); },reduce?0:260); }
    win.addEventListener('click',auto);
    win.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); auto(); } });
  };

  /* ---------- 3. la carte d'embarquement, en deux gestes (2 novembre 2026 : « c'est très bien mais faut un effet plus
     interactif ») : on tire le talon vers le bas (« Embarquement confirmé »), puis on fait glisser l'avion le long de la route
     jusqu'à la ville ; il décolle et la date s'affiche lettre à lettre, comme sur un tableau des départs ---------- */
  GAMES.billet=(st,c,done)=>{
    const code=(c.city.normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z]/gi,'').slice(0,3).toUpperCase())||'OUI';
    const plane='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15.5v-1.8l-7.6-4.7V3.8a1.4 1.4 0 0 0-2.8 0V9L3 13.7v1.8l7.6-2.3v5.2l-2.1 1.5V21l3.5-1 3.5 1v-1.1l-2.1-1.5v-5.2z"/></svg>';
    // la date en cases de tableau des départs, mot par mot (un mot ne se coupe jamais)
    const board=c.P.full.toUpperCase().split(' ').map(w=>`<span class="bp-w">${[...w].map(ch=>`<i data-c="${esc(ch)}">&nbsp;</i>`).join('')}</span>`).join('');
    st.innerHTML=`<div class="std-bp">
      <div class="bp-main">
        <p class="bp-hd"><span>Carte d’embarquement</span>${plane}</p>
        <div class="bp-route"><div><small>Départ</small><b>ICI</b><span>Chez vous</span></div>
          <div class="bp-trk"><span class="bp-dash" aria-hidden="true"></span><span class="bp-trail" aria-hidden="true"></span><span class="bp-pl" role="button" tabindex="-1" aria-label="Faire décoller l’avion">${plane}</span></div>
          <div><small>Arrivée</small><b>${esc(code)}</b><span>${esc(c.city||'Notre mariage')}</span></div></div>
        <p class="bp-go">Faites glisser l’avion jusqu’à ${esc(code)}</p>
        <div class="bp-grid"><div><small>Passager</small><b>Vous</b></div><div><small>Vol</small><b>${esc(c.ini.replace('&',''))} ${String(c.P.y).slice(2)}</b></div><div><small>Porte</small><b>Amour</b></div><div><small>Siège</small><b>1er rang</b></div></div>
        <div class="bp-date"><small>Date du vol</small><b class="bp-x" aria-hidden="true">●●&nbsp;●●●●●&nbsp;●●●●</b><div class="bp-fl" role="img" aria-label="${esc(c.P.full)}">${board}</div><em class="bp-stamp" aria-hidden="true">Embarquement confirmé</em></div>
      </div>
      <div class="bp-stub" role="button" tabindex="0" aria-label="Déchirer le billet pour embarquer">
        <p><small>Mariage de</small><b>${esc(c.names)}</b></p><span class="bp-bar" aria-hidden="true"></span>
        <em>Tirez le talon vers le bas pour embarquer</em>
      </div>
    </div>`;
    const bp=st.firstChild, stub=bp.querySelector('.bp-stub'), trk=bp.querySelector('.bp-trk'), pl=bp.querySelector('.bp-pl');
    let y0=null, dy=0, t0=0, torn=false, flown=false, alive=true, tm=[]; st._stop=()=>{ alive=false; tm.forEach(clearInterval); };
    // le tableau des départs : chaque case fait défiler des lettres puis se pose, de gauche à droite
    const flap=()=>{ const cs=[...bp.querySelectorAll('.bp-fl i')], A='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      if(reduce){ cs.forEach(x=>x.textContent=x.dataset.c); return; }
      cs.forEach((x,i)=>{ let n=6+i*2+Math.floor(Math.random()*4); const iv=setInterval(()=>{ if(!alive){ clearInterval(iv); return; }
        if(--n<=0){ clearInterval(iv); x.textContent=x.dataset.c; x.classList.add('set'); return; }
        x.textContent=A[Math.floor(Math.random()*A.length)]; x.classList.remove('f'); void x.offsetWidth; x.classList.add('f'); },55); tm.push(iv); }); };
    const fly=()=>{ if(flown||!torn) return; flown=true; trk.style.setProperty('--p',1); bp.classList.add('flown'); if(navigator.vibrate) try{ navigator.vibrate(30); }catch(e){}
      setTimeout(()=>{ if(!alive) return; flap(); },reduce?0:500);
      setTimeout(()=>{ if(alive) burst(bp.querySelector('.bp-date'),c.pal); },reduce?0:2300);
      setTimeout(()=>{ if(alive) done(); },reduce?200:4200); };
    // l'avion suit le doigt le long de la route ; au bout, il décolle (un simple toucher le fait décoller aussi)
    let px=null, pm=false;
    pl.addEventListener('pointerdown',e=>{ if(!torn||flown) return; px=e.clientX; pm=false; pl.setPointerCapture(e.pointerId); trk.classList.add('drag'); });
    pl.addEventListener('pointermove',e=>{ if(px==null||flown) return; const R=trk.getBoundingClientRect(); if(Math.abs(e.clientX-px)>4) pm=true;
      const p=Math.max(0,Math.min(1,(e.clientX-R.left)/R.width)); trk.style.setProperty('--p',p.toFixed(3)); if(p>.86) fly(); });
    const pup=()=>{ if(px==null) return; px=null; trk.classList.remove('drag'); if(flown) return; if(!pm) fly(); else trk.style.setProperty('--p',0); };
    pl.addEventListener('pointerup',pup); pl.addEventListener('pointercancel',pup);
    pl.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); fly(); } });
    const tear=()=>{ if(torn) return; torn=true; stub.style.transform=''; bp.classList.add('torn'); pl.tabIndex=0; if(navigator.vibrate) try{ navigator.vibrate(12); }catch(e){}
      setTimeout(()=>{ if(alive&&!flown) pl.focus({preventScroll:true}); },900); };
    stub.addEventListener('pointerdown',e=>{ y0=e.clientY; dy=0; t0=Date.now(); stub.setPointerCapture(e.pointerId); stub.classList.add('drag'); });
    stub.addEventListener('pointermove',e=>{ if(y0==null||torn) return; dy=Math.max(0,e.clientY-y0); stub.style.transform=`translateY(${Math.min(dy,90)}px) rotate(${Math.min(dy,90)*.06}deg)`; if(dy>70) tear(); });
    const up=()=>{ if(y0==null) return; y0=null; stub.classList.remove('drag'); if(torn) return; if(dy>36||(dy<8&&Date.now()-t0<400)) tear(); else stub.style.transform=''; };
    stub.addEventListener('pointerup',up); stub.addEventListener('pointercancel',up);
    stub.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); tear(); } });
  };

  /* ---------- 4. le cadenas, en coffre-fort (2 novembre 2026 : « on clique et on attend, c'est juste du tâtonnement ») :
     on tourne une molette au doigt, comme un perceur de coffre ; un indice guide (le jour est « entre 10 et 14 », le mois
     est « en été »), et la molette chauffe à mesure qu'on approche (froid, tiède, chaud, ça brûle) ; on relâche sur le bon
     chiffre, il se verrouille avec un déclic. D'abord le jour, puis le mois ; le cadenas s'ouvre. ---------- */
  const MOS=['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
  const SEASON=m=>[11,0,1].includes(m)?'en hiver ❄️':m<5?'au printemps 🌸':m<8?'en été ☀️':'en automne 🍂';
  GAMES.cadenas=(st,c,done)=>{
    const lo=Math.max(1,Math.min(27,c.P.d-1-Math.floor(Math.random()*3)));
    const STEPS=[
      {n:31,t:c.P.d-1,lab:i=>String(i+1),q:'Le jour',hint:`Indice : entre le ${lo} et le ${lo+4}`,show:i=>String(i+1).padStart(2,'0'),say:i=>String(i+1)},
      {n:12,t:c.P.m,lab:i=>MOS[i],q:'Le mois',hint:`Indice : ${SEASON(c.P.m)}`,show:i=>String(i+1).padStart(2,'0'),say:i=>MO[i]}
    ];
    st.innerHTML=`<div class="std-lock">
      <svg class="lk-sh" viewBox="0 0 120 92" aria-hidden="true"><defs><linearGradient id="lkg" x1="0" x2="1"><stop offset="0" stop-color="#8d8a84"/><stop offset=".35" stop-color="#f1efe9"/><stop offset=".6" stop-color="#b4b0a8"/><stop offset="1" stop-color="#6f6b64"/></linearGradient></defs><path d="M24 92V50a36 36 0 0 1 72 0v42" fill="none" stroke="url(#lkg)" stroke-width="15" stroke-linecap="round"/></svg>
      <div class="lk-body">
        ${head(c)}
        <div class="lk-sl" aria-hidden="true"><span>?</span><i>·</i><span>?</span></div>
        <p class="lk-q"></p>
        <div class="lk-dial" role="slider" tabindex="0"><span class="lk-ptr" aria-hidden="true"></span><svg viewBox="-120 -120 240 240" aria-hidden="true"><circle class="lk-ring" r="114"/><g class="lk-g"></g><circle class="lk-knob" r="50"/><circle class="lk-knob2" r="40"/><text class="lk-cur" y="2"></text></svg></div>
        <p class="lk-heat" aria-live="polite"></p>
        <p class="lk-tip"></p>
        <p class="lk-date" aria-live="polite"></p>
        <button type="button" class="lk-help" hidden>Je donne ma langue au chat</button>
      </div>
    </div>`;
    const L=st.firstChild, dial=L.querySelector('.lk-dial'), g=L.querySelector('.lk-g'), help=L.querySelector('.lk-help'), heatP=L.querySelector('.lk-heat'),
      sl=[...L.querySelectorAll('.lk-sl span')];
    let k=0, S=null, rot=0, cur=0, open=false, alive=true, busy=false, ht=0;
    st._stop=()=>{ alive=false; clearTimeout(ht); };
    const step=()=>360/S.n;
    const setRot=(r,anim)=>{ rot=r; g.style.transition=anim?`transform ${anim}ms cubic-bezier(.3,1.25,.5,1)`:'none'; g.style.transform=`rotate(${rot}deg)`; };
    const idxOf=r=>((Math.round(-r/step())%S.n)+S.n)%S.n;
    const heat=()=>{ const d=Math.min(Math.abs(cur-S.t),S.n-Math.abs(cur-S.t)), h=1-d/(S.n/2);
      L.style.setProperty('--heat',h.toFixed(3)); L.style.setProperty('--hc',`hsl(${Math.round(212+146*h)} ${Math.round(55+25*h)}% ${Math.round(48-4*h)}%)`); L.querySelector('.lk-cur').textContent=S.lab(cur);
      heatP.textContent=d===0?'Ça brûle ! Relâchez 🔥':h>.8?'Chaud 🔥':h>.55?'Tiède':'Froid ❄️'; heatP.classList.toggle('hot',d===0);
      dial.setAttribute('aria-valuenow',cur+1); dial.setAttribute('aria-valuetext',S.say(cur)); return d; };
    const tick=()=>{ const i=idxOf(rot); if(i===cur) return; cur=i; const d=heat(); if(navigator.vibrate) try{ navigator.vibrate(d===0?28:d<3?10:4); }catch(e){} };
    const load=()=>{ S=STEPS[k]; L.querySelector('.lk-q').textContent=`${S.q} : tournez la molette`; L.querySelector('.lk-tip').textContent=S.hint;
      g.innerHTML=Array.from({length:S.n},(_,i)=>`<g transform="rotate(${(i*360/S.n).toFixed(2)})"><line y1="-112" y2="${S.n<=12||i===0||(i+1)%5===0?-100:-106}"/>${S.n<=12||i===0||(i+1)%5===0?`<text y="-84">${esc(S.lab(i))}</text>`:''}</g>`).join('');
      L.dataset.k=S.n>12?'d':'m';
      dial.setAttribute('aria-label',`${S.q}, ${S.hint}`); dial.setAttribute('aria-valuemin',1); dial.setAttribute('aria-valuemax',S.n);
      // la molette part loin du bon chiffre
      cur=(S.t+Math.round(S.n/2)+Math.floor(Math.random()*5)-2+S.n)%S.n; setRot(-cur*step(),0); heat(); };
    const lock=()=>{ if(busy) return; busy=true; setRot(-S.t*step(),300); cur=S.t; heat();
      sl[k].textContent=S.show(S.t); sl[k].classList.add('ok'); L.classList.add('click'); setTimeout(()=>L.classList.remove('click'),400);
      if(navigator.vibrate) try{ navigator.vibrate([20,40,20]); }catch(e){}
      setTimeout(()=>{ if(!alive) return; busy=false; k++;
        if(k<STEPS.length){ load(); dial.classList.remove('in'); void dial.offsetWidth; dial.classList.add('in'); return; }
        open=true; clearTimeout(ht); help.hidden=true; L.classList.add('open'); heatP.textContent=''; L.querySelector('.lk-q').textContent='';
        L.querySelector('.lk-tip').textContent=''; L.querySelector('.lk-date').textContent=c.P.full+(c.city?` · ${c.city}`:'');
        burst(L.querySelector('.lk-body'),c.pal); setTimeout(()=>{ if(alive) done(); },reduce?200:2400); },reduce?50:750); };
    // la molette suit le doigt en tournant autour de son centre
    let a0=null;
    const ang=e=>{ const R=dial.getBoundingClientRect(); return Math.atan2(e.clientX-(R.left+R.width/2),-(e.clientY-(R.top+R.height/2)))*180/Math.PI; };
    dial.addEventListener('pointerdown',e=>{ if(open||busy) return; e.preventDefault(); a0=ang(e); dial.setPointerCapture(e.pointerId); dial.classList.add('drag'); });
    dial.addEventListener('pointermove',e=>{ if(a0==null) return; const a=ang(e); let da=a-a0; if(da>180) da-=360; if(da<-180) da+=360; a0=a; setRot(rot+da,0); tick(); });
    const up=()=>{ if(a0==null) return; a0=null; dial.classList.remove('drag'); if(open||busy) return; const i=idxOf(rot); cur=i; setRot(-i*step(),220); heat(); if(i===S.t) setTimeout(lock,180); };
    dial.addEventListener('pointerup',up); dial.addEventListener('pointercancel',up);
    dial.addEventListener('keydown',e=>{ if(open||busy) return; const dir=e.key==='ArrowRight'||e.key==='ArrowUp'?1:e.key==='ArrowLeft'||e.key==='ArrowDown'?-1:0;
      if(dir){ e.preventDefault(); cur=(cur+dir+S.n)%S.n; setRot(-cur*step(),160); heat(); }
      else if(e.key==='Enter'||e.key===' '){ e.preventDefault(); if(cur===S.t) lock(); else { dial.classList.remove('no'); void dial.offsetWidth; dial.classList.add('no'); } } });
    ht=setTimeout(()=>{ if(!open&&alive) help.hidden=false; },10000);
    help.addEventListener('click',()=>{ help.hidden=true; const go=()=>{ if(!alive||open) return; cur=S.t; setRot(-S.t*step(),900); heat(); setTimeout(()=>{ if(!alive) return; lock(); setTimeout(()=>{ if(!open) go(); },reduce?60:820); },reduce?0:950); }; go(); });
    load();
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

  /* ---------- 6. le bouton qui fuit, à l'envers (2 novembre 2026 : « c'est le bouton Oui qui doit fuir plusieurs fois, et à
     chaque clic on a des infos en plus ») : « Serez-vous des nôtres ? » ; « Oui ! » s'échappe, et à chaque fois une info
     s'ajoute à la carte (la date, la ville, dans combien de jours, le faire-part qui suit). Quand tout est dit, il se laisse
     attraper : « Bon… oui ! ». Pas de bouton « Non » (« faut même pas mettre le non »). ---------- */
  GAMES.fuit=(st,c,done)=>{
    const days=Math.round((c.P.D-Date.now())/864e5);
    const INFO=[['Pas si vite ! D’abord, la date',`${c.P.full} 📅`],c.city?['Et c’est où ?',`À ${c.city} 📍`]:null,
      days>1?['C’est dans',`${days} jours ⏳`]:null,['Et ensuite ?','Le faire-part suit, avec tous les détails ✉️']].filter(Boolean);
    const LAB=['Oui !','Attendez…','Encore une chose…','Presque…','Une dernière…'];
    st.innerHTML=`<div class="std-card std-run">${head(c)}
      <p class="rn-q">Une grande nouvelle… Serez-vous des nôtres ?</p>
      <ul class="rn-info" aria-live="polite"></ul>
      <div class="rn-acts"><button type="button" class="rn-yes">Oui !</button></div>
      <p class="rn-msg" aria-live="polite"></p></div>`;
    const card=st.firstChild, yes=card.querySelector('.rn-yes'), msg=card.querySelector('.rn-msg'), info=card.querySelector('.rn-info'), acts=card.querySelector('.rn-acts');
    let n=0, fin=false, gave=0;
    const run=e=>{ if(fin||gave) return; if(e) e.preventDefault();
      const [a,b]=INFO[n++]; const li=document.createElement('li'); li.innerHTML=`<small>${esc(a)}</small><b>${esc(b)}</b>`; info.appendChild(li);
      if(navigator.vibrate) try{ navigator.vibrate(8); }catch(e){}
      if(n>=INFO.length){ gave=Date.now(); yes.textContent='Bon… oui ! 🥂'; yes.classList.remove('away'); yes.classList.add('gave'); yes.style.left=''; yes.style.top=''; acts.appendChild(yes); return; }
      yes.textContent=LAB[n]||LAB[LAB.length-1];
      if(yes.parentNode!==st){ st.appendChild(yes); yes.classList.add('away'); }
      // il saute au-dessus ou au-dessous de la carte, jamais sur le texte
      const R=st.getBoundingClientRect(), z=st.offsetWidth?R.width/st.offsetWidth:1, b0=yes.getBoundingClientRect(), K=card.getBoundingClientRect();
      const bw=b0.width/z, bh=b0.height/z, W=R.width/z, top=(K.top-R.top)/z, bot=(K.bottom-R.top)/z, H=R.height/z-72;
      const bands=[[10,top-bh-10],[bot+10,H-bh]].filter(([u,v])=>v>=u);
      let x=10+Math.random()*Math.max(0,W-bw-20), y;
      if(bands.length){ const [u,v]=bands[Math.floor(Math.random()*bands.length)]; y=u+Math.random()*(v-u); } else y=Math.random()*Math.max(0,H-bh);
      yes.style.left=x+'px'; yes.style.top=y+'px'; };
    yes.addEventListener('pointerenter',e=>{ if(e.pointerType==='mouse') run(); });
    yes.addEventListener('pointerdown',e=>{ if(!gave) run(e); });
    yes.addEventListener('keydown',e=>{ if((e.key==='Enter'||e.key===' ')&&!gave) run(e); });
    const ok=()=>{ if(fin) return; fin=true; msg.textContent='On le savait ! 🥂'; card.classList.add('yes'); burst(card,c.pal); setTimeout(done,reduce?200:2200); };
    yes.addEventListener('click',e=>{ if(gave&&Date.now()-gave>450) ok(); else e.preventDefault(); });
  };

  /* ---------- 7. le calendrier : les pages s'arrachent et s'envolent de plus en plus vite (30 octobre 2026 : « j'aime bien
     l'idée du calendrier, faut que ce soit plus dynamique »), ralentissent sur les derniers mois, puis le mois du mariage
     arrive en grand : le jour entouré au feutre, des confettis. Il démarre seul si l'on ne touche pas. ---------- */
  /* 2 novembre 2026 (« améliore l'effet ; la date du jour s'affiche et après, sur la même ligne, tout roule jusqu'à s'arrêter
     sur la bonne date ») : un éphéméride montre la date d'aujourd'hui sur une ligne (« Lundi 2 novembre 2026 ») ; chaque mot
     est un rouleau qui se met à tourner, l'année s'arrête d'abord, puis le mois, puis le jour et son nom : le grand jour.
     Le jour est entouré au feutre, « Aujourd'hui » devient « Le grand jour », puis les prénoms et la ville. */
  GAMES.calendrier=(st,c,done)=>{
    const now=new Date(), N={wd:now.getDay(),d:now.getDate(),m:now.getMonth(),y:now.getFullYear()};
    const dl=d=>d===1?'1er':String(d);
    // chaque rouleau : de la valeur d'aujourd'hui à celle du mariage, avec quelques tours de plus pour l'élan
    const nd=2*31+(((c.P.d-N.d)%31)+31)%31, nw=14+(((c.P.wd-N.wd)%7)+7)%7;
    let nm=(c.P.y-N.y)*12+c.P.m-N.m; if(nm<6) nm=(((nm%12)+12)%12)+12;
    const R={
      wd:Array.from({length:nw+1},(_,i)=>cap(WD[(N.wd+i)%7])),
      d:Array.from({length:nd+1},(_,i)=>dl(((N.d-1+i)%31)+1)),
      m:Array.from({length:nm+1},(_,i)=>MO[(N.m+i)%12]),
      y:c.P.y>N.y?Array.from({length:c.P.y-N.y+1},(_,i)=>String(N.y+i)):[String(c.P.y)]
    };
    const reel=k=>`<span class="cr-w cr-${k}"><span class="cr-r"><span class="cr-s">${R[k].map(t=>`<i>${esc(t)}</i>`).join('')}</span></span>${k==='d'?'<svg viewBox="0 0 60 50" aria-hidden="true"><path d="M33 6C17 4 5 13 5 26c0 12 12 19 27 18 15-1 24-10 23-21C54 11 41 4 26 6"/></svg>':''}</span>`;
    st.innerHTML=`<div class="std-cal">
      <div class="cl-pad"><div class="cl-rings" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
        <div class="cl-pg"><p class="cl-ey"><span>Aujourd’hui</span><span>Le grand jour</span></p>
          <div class="cl-line" role="img" aria-label="${esc(c.P.full)}">${reel('wd')}${reel('d')}${reel('m')}${reel('y')}</div>
          <div class="cl-more"><div class="cl-more-in">${head(c)}${c.city?`<p class="std-city">${esc(c.city)}</p>`:''}</div></div></div></div>
      <button type="button" class="cl-go">Touchez pour lancer</button>
    </div>`;
    const C=st.firstChild, pad=C.querySelector('.cl-pad'), go=C.querySelector('.cl-go'), line=C.querySelector('.cl-line');
    const W=[...C.querySelectorAll('.cr-w')].map(w=>({w,r:w.querySelector('.cr-r'),s:w.querySelector('.cr-s'),it:[...w.querySelectorAll('i')]}));
    // la ligne tient dans la carte : la police se réduit si le plus long des mots ne tient pas
    const fit=()=>{ line.style.fontSize=''; const max=W.reduce((a,x)=>a+x.s.offsetWidth,0)+line.offsetHeight*.25*3, av=line.parentNode.clientWidth-8;
      if(max>av) line.style.fontSize=Math.max(18,parseFloat(getComputedStyle(line).fontSize)*av/max)+'px'; };
    fit();
    /* chaque rouleau a, du début à la fin, la largeur de son plus long mot (2 novembre 2026 : « les jours, l'année bougent
       sur x, y, pourquoi ? faut que ce soit figé, juste ça tourne ») : rien ne se déplace, ne rebondit ni ne grandit */
    W.forEach(x=>{ x.r.style.width=x.s.offsetWidth+'px'; });
    let busy=false, alive=true; const auto=setTimeout(()=>run(),1500), tm=[]; st._stop=()=>{ alive=false; clearTimeout(auto); tm.forEach(clearTimeout); };
    const later=(f,ms)=>tm.push(setTimeout(()=>{ if(alive) f(); },reduce?0:ms));
    function run(){ if(busy||!alive) return; busy=true; clearTimeout(auto); go.hidden=true; C.classList.add('run');
      // l'année s'arrête d'abord, puis le mois, puis le jour et son nom ensemble
      const T={y:2600,m:4200,d:5800,wd:5800};
      W.forEach((x,j)=>{ const k=['wd','d','m','y'][j], last=x.it.length-1, ms=reduce?10:T[k];
        if(last>0) x.w.classList.add('spin');
        x.s.style.transition=`transform ${ms}ms cubic-bezier(.22,.61,.24,1)`;
        x.s.style.transform=`translateY(${-last*1.2}em)`;
        later(()=>{ x.w.classList.remove('spin'); x.w.classList.add('stop'); if(navigator.vibrate) try{ navigator.vibrate(k==='d'?24:10); }catch(e){} },ms); });
      later(()=>{ C.classList.add('hit'); },6000);
      later(()=>{ burst(C.querySelector('.cr-d'),c.pal); },6700);
      later(()=>{ C.classList.add('end'); },7300);
      later(()=>done(),10000); }
    go.addEventListener('click',run); pad.addEventListener('click',run);
  };

  /* ---------- 8. la pluie de cœurs : une averse d'emojis cœurs sur tout l'écran (30 octobre 2026 : « une pluie torrentielle
     d'emojis, et après, ceux qui restent, c'est la date ») ; au milieu de l'averse, certains cœurs se posent et restent : ils
     écrivent la date en chiffres de 3 × 5 cœurs (« 12·06 », puis « 2027 »), puis la date en toutes lettres ---------- */
  const RAIN=['❤️','❤️','❤️','❤️','💖','💕','💗','💘','💞','💓','🩷'];
  GAMES.coeurs=(st,c,done)=>{
    /* un bocal qui se remplit de cœurs et laisse la date en blanc (2 novembre 2026 : après les chiffres en pixels de cœurs,
       « très alphanumérique », puis un grand cœur : « on fait l'inverse, c'est comme un bocal qui se remplit de cœurs et ça
       laisse vide en blanc que la date ») : pendant l'averse, les cœurs tombent dans le bocal et s'empilent rangée par rangée,
       du fond vers le haut ; la date est découpée dans le tas, en lettres de papier, et apparaît à mesure que le niveau monte.
       Seuls les cœurs rouges, assombris (filter) : le papier crème des lettres s'y lit à plus de 4,5:1. */
    const COLS=11, ROWS=13, R=Math.random;
    let cells='';
    for(let r=ROWS-1;r>=0;r--){ const off=r%2?.5:0;
      for(let k=0;k<=COLS;k++){ const cx=k+off; if(cx>COLS+.3) continue;
        const dl=.4+(ROWS-1-r)*.27+R()*.18;
        cells+=`<span class="h" style="left:${(cx/COLS*100).toFixed(2)}%;top:${((r+.5)/ROWS*100).toFixed(2)}%;--rt:${(R()*40-20).toFixed(0)}deg;--sz:${(.96+R()*.16).toFixed(2)};--dl:${dl.toFixed(2)}s">❤️</span>`; } }
    const date=`<p class="hz-full">${esc(c.P.full)}</p>`;
    // toute la date en creux (« y'a que le 12 qui s'affiche, moi je voulais toute la date ») : trois lignes, chacune à la
    // largeur du bocal (taille d'après son nombre de lettres), « Samedi », « 12 juin », « 2027 »
    const kl=t=>`<span style="font-size:${Math.min(30,88/(t.length*.66)).toFixed(1)}cqw">${esc(t)}</span>`;
    const ko=`<p class="hz-ko" aria-hidden="true">${kl(cap(WD[c.P.wd]))}${kl(c.P.dd+NB+MO[c.P.m])}${kl(String(c.P.y))}</p>`;
    // l'averse : 300 cœurs qui traversent tout l'écran, de plus en plus rares vers la fin
    const drops=reduce?'':Array.from({length:300},()=>{ const z=R(), sz=16+z*30;
      return `<i style="--x:${(R()*104-4).toFixed(1)}%;--s:${sz.toFixed(0)}px;--o:${(.55+z*.45).toFixed(2)};--d:${(1.7-z*.7).toFixed(2)}s;--dl:${(3.7*Math.pow(R(),1.35)).toFixed(2)}s;--r0:${(R()*60-30).toFixed(0)}deg;--r1:${(R()*160-80).toFixed(0)}deg">${RAIN[Math.floor(R()*RAIN.length)]}</i>`; }).join('');
    st.innerHTML=`<div class="std-card std-hz">${head(c)}<div class="hz-b"><i class="hz-lid" aria-hidden="true"></i><div class="hz-g" role="img" aria-label="${esc(c.P.full)}" style="--cols:${COLS};--rows:${ROWS}">${cells}${ko}</div></div>
      ${date}${c.city?`<p class="std-city">${esc(c.city)}</p>`:''}</div><div class="hz-rain" aria-hidden="true">${drops}</div>`;
    const card=st.firstChild, rain=st.querySelector('.hz-rain'); rain.style.setProperty('--H',st.clientHeight+'px');
    let alive=true; st._stop=()=>{ alive=false; };
    setTimeout(()=>{ if(!alive) return; card.classList.add('on'); burst(card,c.pal); setTimeout(()=>{ if(alive) done(); },reduce?200:2400); },reduce?0:5000);
    setTimeout(()=>rain.remove(),reduce?0:6200);
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
    S.classList.remove('std-done','std-gone'); play.hidden=false; play.classList.remove('std-dim');
    let fin=false;
    const done=()=>{ if(fin) return; fin=true; if(st._stop) st._stop(); S.classList.add('std-done');
      S._t=setTimeout(()=>{ S.classList.add('std-gone'); play.hidden=true; if(o.onDone) o.onDone(); },reduce?0:750); };
    S.querySelector('.std-skip').onclick=done;
    (GAMES[k]||GAMES.gratter)(st,ctx(inv),()=>{ if(!fin) done(); });
  }
  window.SceauSTD={ANIMS:LIST,html,start};
})();
