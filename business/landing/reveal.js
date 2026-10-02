/* Sceau : la date à découvrir. Trois petits jeux pour révéler le grand jour :
   « scratch » (ticket à gratter), « wheel » (roue de la fortune), « slot » (jackpot à trois rouleaux).
   Partagé par le faire-part (invite.js) et la vitrine (index.html).
   SceauReveal.mount(el,{kind,date,tz,lang,pal,light,scope,onDone})
   À la fin du jeu, les éléments .rvl-later de « scope » (par défaut le parent de el) apparaissent :
   compte à rebours, ligne de date, invitation à défiler. */
(function(){
  const STR={
    fr:{scratch:'Grattez pour découvrir la date',here:'Grattez ici',wheel:'Tournez la roue',spin:'Tourner',slot:'Tentez le jackpot',pull:'Lancer',saved:'Notez bien la date !'},
    en:{scratch:'Scratch to reveal the date',here:'Scratch here',wheel:'Spin the wheel',spin:'Spin',slot:'Pull the lever',pull:'Pull',saved:'Save the date!'}
  };
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc=t=>String(t==null?'':t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const rgb=hex=>{ const n=parseInt(hex.slice(1),16); return [n>>16&255,n>>8&255,n&255]; };
  const shade=(hex,f)=>'rgb('+rgb(hex).map(v=>Math.max(0,Math.min(255,Math.round(v*f)))).join(',')+')';
  const tint=(hex,k)=>'rgb('+rgb(hex).map(v=>Math.round(v+(255-v)*k)).join(',')+')';
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);

  // jour, mois, année dans le fuseau du mariage ; « 1er » en français
  function parts(date,tz,lang){
    const loc=lang==='en'?'en-GB':'fr-FR', f=o=>date.toLocaleDateString(loc,Object.assign({timeZone:tz},o));
    const day=+f({day:'numeric'}), month=+f({month:'numeric'})-1, year=+f({year:'numeric'});
    const months=k=>Array.from({length:12},(_,m)=>new Date(Date.UTC(2001,m,15)).toLocaleDateString(loc,{month:k,timeZone:'UTC'}).replace('.',''));
    const dd=d=>lang==='fr'&&d===1?'1er':String(d);
    return {day,month,year,dd,long:months('long'),short:months('short'),weekday:cap(f({weekday:'long'})),
      full:lang==='fr'?`${dd(day)} ${months('long')[month]} ${year}`:`${day} ${months('long')[month]} ${year}`};
  }

  // petite pluie de confettis aux couleurs du couple
  function burst(root,pal){
    if(reduce) return;
    const b=document.createElement('div'); b.className='rvl-burst';
    const cols=[pal,tint(pal,.45),tint(pal,.8),'#ffffff','#f3dc9b'];
    b.innerHTML=Array.from({length:34},()=>{ const a=Math.random()*Math.PI*2, r=60+Math.random()*90;
      return `<i style="--c:${pick(cols)};--x:${(Math.cos(a)*r).toFixed(0)}px;--y:${(Math.sin(a)*r*.8+40).toFixed(0)}px;--r:${(Math.random()*720-360).toFixed(0)}deg;--dl:${(Math.random()*.12).toFixed(2)}s;--w:${(4+Math.random()*4).toFixed(1)}px"></i>`; }).join('');
    root.appendChild(b); setTimeout(()=>b.remove(),1800);
  }

  /* ---------- ticket à gratter ---------- */
  function scratch(root,o,P,S,done){
    root.querySelector('.rvl-game').innerHTML=`<div class="rvl-card"><div class="rvl-under"><small>${esc(P.weekday)}</small><b>${esc(P.full)}</b></div><canvas class="rvl-foil" tabindex="0" role="button" aria-label="${esc(S.scratch)}"></canvas></div>`;
    const cv=root.querySelector('canvas'), card=cv.parentNode;
    let cx, W=0, H=0, down=false, last=null, over=false, lastCheck=0, tries=0;
    (function foil(){
      W=card.clientWidth; H=card.clientHeight;
      if(!W||!H){ if(tries++<120) requestAnimationFrame(foil); return; }
      const dpr=Math.min(2,devicePixelRatio||1); cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr);
      cx=cv.getContext('2d',{willReadFrequently:true}); cx.setTransform(dpr,0,0,dpr,0,0);
      // feuille métallique dans la couleur du couple : reflets, grain, filet pointillé et invitation à gratter
      const g=cx.createLinearGradient(0,0,W,H);
      g.addColorStop(0,tint(o.pal,.5)); g.addColorStop(.3,o.pal); g.addColorStop(.48,tint(o.pal,.62)); g.addColorStop(.62,o.pal); g.addColorStop(1,shade(o.pal,.72));
      cx.fillStyle=g; cx.fillRect(0,0,W,H);
      for(let i=0;i<W*H/10;i++){ cx.fillStyle=Math.random()<.5?'rgba(255,255,255,.12)':'rgba(0,0,0,.08)'; cx.fillRect(Math.random()*W,Math.random()*H,1,1); }
      cx.strokeStyle='rgba(255,255,255,.55)'; cx.lineWidth=1; cx.setLineDash([3,4]); cx.strokeRect(7.5,7.5,W-15,H-15); cx.setLineDash([]);
      cx.fillStyle='rgba(255,255,255,.95)'; cx.textAlign='center'; cx.textBaseline='middle';
      cx.shadowColor='rgba(0,0,0,.25)'; cx.shadowBlur=3;
      cx.font=`600 ${Math.max(10,Math.round(H*.12))}px Inter,Arial,sans-serif`;
      cx.fillText(S.here.toUpperCase().split('').join(' '),W/2,H/2+H*.14);
      cx.font=`${Math.round(H*.28)}px Georgia,serif`; cx.fillText('✦',W/2,H/2-H*.14);
      cx.shadowBlur=0; cx.globalCompositeOperation='destination-out';
      cx.lineCap='round'; cx.lineJoin='round'; cx.lineWidth=Math.max(22,H*.3);
    })();
    const at=e=>{ const r=cv.getBoundingClientRect(); return {x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height}; };
    function rub(a,b){ cx.beginPath(); cx.moveTo(a.x,a.y); cx.lineTo(b.x+.01,b.y); cx.stroke(); }
    // part de la feuille déjà grattée (un pixel sur 24)
    function cleared(){
      const d=cx.getImageData(0,0,cv.width,cv.height).data; let n=0, z=0;
      for(let i=3;i<d.length;i+=96){ n++; if(d[i]<40) z++; }
      return z/n;
    }
    function finish(){
      if(over) return; over=true; cv.classList.add('gone'); done();
      setTimeout(()=>cv.remove(),900);
    }
    cv.addEventListener('pointerdown',e=>{ if(!cx||over) return; down=true; root.classList.add('touched'); try{ cv.setPointerCapture(e.pointerId); }catch(x){} last=at(e); rub(last,last); });
    cv.addEventListener('pointermove',e=>{ if(!down||over) return; const p=at(e); rub(last,p); last=p;
      const now=performance.now(); if(now-lastCheck>140){ lastCheck=now; if(cleared()>.5) finish(); } });
    const up=()=>{ if(!down) return; down=false; if(!over&&cleared()>.5) finish(); };
    cv.addEventListener('pointerup',up); cv.addEventListener('pointercancel',up);
    // le geste de grattage ne doit pas faire changer de page
    cv.addEventListener('touchstart',e=>e.stopPropagation(),{passive:true});
    cv.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); finish(); } });
  }

  /* ---------- roue de la fortune ---------- */
  function wheel(root,o,P,S,done){
    // 8 cases : la vraie date et 7 autres jours du même mois, la roue s'arrête toujours sur la vraie
    const N=8, seg=360/N, days=new Set([P.day]);
    while(days.size<N) days.add(1+Math.floor(Math.random()*28));
    const list=[...days]; for(let i=N-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [list[i],list[j]]=[list[j],list[i]]; }
    const win=list.indexOf(P.day);
    const ivory='#fffaf0', dark=shade(o.pal,.55);
    const pt=(a,r)=>{ const t=(a-90)*Math.PI/180; return `${(Math.cos(t)*r).toFixed(2)},${(Math.sin(t)*r).toFixed(2)}`; };
    const segs=list.map((d,i)=>{ const a0=i*seg-seg/2, a1=i*seg+seg/2, odd=i%2, fill=odd?ivory:o.pal, ink=odd?dark:ivory;
      return `<g class="rvl-seg${i===win?' rvl-win':''}"><path d="M0,0 L${pt(a0,88)} A88,88 0 0,1 ${pt(a1,88)} Z" fill="${fill}"/>`+
        `<g transform="rotate(${i*seg})" fill="${ink}"><text y="-63" class="rvl-d">${esc(P.dd(d))}</text><text y="-46" class="rvl-m">${esc(P.short[P.month])}</text></g></g>`; }).join('');
    const bulbs=Array.from({length:16},(_,i)=>`<circle class="rvl-bulb" cx="${pt(i*22.5,94).split(',')[0]}" cy="${pt(i*22.5,94).split(',')[1]}" r="2.6"/>`).join('');
    root.querySelector('.rvl-game').innerHTML=`<div class="rvl-wheel"><div class="rvl-pin"></div>`+
      `<svg viewBox="-100 -100 200 200" aria-hidden="true"><circle r="99" fill="${shade(o.pal,.62)}"/><circle r="94" fill="none" stroke="${tint(o.pal,.35)}" stroke-width="7"/>${bulbs}<g class="rvl-rot">${segs}</g></svg>`+
      `<button type="button" class="rvl-hub">${esc(S.spin)}</button></div>`;
    const rot=root.querySelector('.rvl-rot'), hub=root.querySelector('.rvl-hub');
    let spun=false;
    hub.addEventListener('click',()=>{
      if(spun) return; spun=true; root.classList.add('touched'); hub.disabled=true;
      const turns=reduce?1:6, jitter=(Math.random()-.5)*seg*.6, end=turns*360-win*seg+jitter, dur=reduce?.6:4.8;
      rot.style.transition=`transform ${dur}s cubic-bezier(.12,.68,.1,1)`;
      requestAnimationFrame(()=>{ rot.style.transform=`rotate(${end}deg)`; });
      setTimeout(()=>{ root.querySelector('.rvl-wheel').classList.add('won'); done(); },dur*1000+80);
    });
  }

  /* ---------- jackpot ---------- */
  function slot(root,o,P,S,done){
    const H=14, reel=(cls,vals,fin)=>`<div class="rvl-reel ${cls}"><div class="rvl-strip">${['?',...Array.from({length:H},()=>pick(vals)),fin].map(v=>`<div>${esc(v)}</div>`).join('')}</div></div>`;
    const yrs=[P.year-2,P.year-1,P.year+1,P.year+2,P.year+3];
    root.querySelector('.rvl-game').innerHTML=`<div class="rvl-slot"><div class="rvl-box"><div class="rvl-reels">`+
      reel('d',Array.from({length:31},(_,i)=>P.dd(i+1)),P.dd(P.day))+reel('m',P.long,P.long[P.month])+reel('y',yrs,P.year)+
      `</div></div><button type="button" class="rvl-lever" aria-label="${esc(S.pull)}"></button></div>`+
      `<button type="button" class="rvl-btn">${esc(S.pull)}</button>`;
    let spun=false;
    const go=()=>{
      if(spun) return; spun=true; root.classList.add('touched');
      root.querySelector('.rvl-lever').classList.add('pull'); root.querySelector('.rvl-btn').disabled=true;
      const strips=[...root.querySelectorAll('.rvl-strip')];
      strips.forEach((s,i)=>{ const dur=reduce?.4:1.7+i*.65;
        s.style.transition=`transform ${dur}s cubic-bezier(.2,.62,.28,1.06) ${reduce?0:.18}s`;
        requestAnimationFrame(()=>{ s.style.transform=`translateY(${(-(H+1)/(H+2)*100).toFixed(4)}%)`; }); });
      setTimeout(()=>{ root.querySelector('.rvl-box').classList.add('won'); done(); },reduce?500:(1.7+2*.65+.18)*1000+120);
    };
    root.querySelector('.rvl-lever').addEventListener('click',go);
    root.querySelector('.rvl-btn').addEventListener('click',go);
  }

  function mount(el,o){
    o=Object.assign({kind:'scratch',lang:'fr',tz:'Europe/Paris',pal:'#b8975a',light:false},o);
    if(!/^#[0-9a-f]{6}$/i.test(o.pal)) o.pal='#b8975a';
    const S=STR[o.lang==='en'?'en':'fr'], P=parts(o.date,o.tz,o.lang), scope=o.scope||el.parentNode;
    // rejouer : on remet en place ce que la partie précédente avait dévoilé
    el.hidden=false; scope.querySelectorAll('.rvl-shown').forEach(x=>{ x.classList.remove('rvl-shown'); x.classList.add('rvl-later'); });
    el.innerHTML=`<div class="rvl rvl-k-${o.kind}${o.light?' light':''}" style="--p:${o.pal};--pl:${tint(o.pal,.55)};--pd:${shade(o.pal,.55)}">`+
      `<div class="rvl-call">${esc(S[o.kind]||S.scratch)}</div><div class="rvl-game"></div><div class="rvl-sr" aria-live="polite"></div></div>`;
    const root=el.firstElementChild;
    let fin=false;
    function done(){
      if(fin) return; fin=true;
      root.classList.add('done'); root.querySelector('.rvl-sr').textContent=P.weekday+' '+P.full;
      root.querySelector('.rvl-call').textContent=S.saved;
      burst(root,o.pal);
      // la roue a fait son office : elle s'efface et laisse la place à la date complète
      const show=()=>{ scope.querySelectorAll('.rvl-later').forEach(x=>{ x.classList.remove('rvl-later'); x.classList.add('rvl-shown'); }); if(o.onDone) o.onDone(); };
      if(o.kind==='wheel') setTimeout(()=>{ root.classList.add('fold'); setTimeout(()=>{ el.hidden=true; show(); },reduce?0:520); },reduce?600:1700);
      else setTimeout(show,reduce?0:700);
    }
    ({scratch,wheel,slot}[o.kind]||scratch)(root,o,P,S,done);
  }
  window.SceauReveal={mount,kinds:['scratch','wheel','slot']};
})();
