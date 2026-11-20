/* Mesure maison des visites (20 novembre 2026 : « tout traquer pour avoir le maximum de data »).
   Chargé sur toutes les pages (build-site.py, analytics_tags). Envoie à /api/t, par paquets, ce que fait chaque visite :
   vue (page), clic (mot du bouton ou du lien), defile (25/50/75/100 %), champ (quel champ est touché, jamais ce qui est
   écrit), quitte (secondes actives sur la page), erreur, et les événements nommés (window.stoTrack : jeu, etape,
   commander, paiement…). Sans cookie ; un identifiant de visite (sessionStorage) et un de visiteur (localStorage), au
   hasard, propres à ce site ; ni adresse IP ni empreinte. Rien n'est lu dans les champs. Pas de mesure sur /admin/ et
   /tableau/ ; ?moi=1 marque ce navigateur comme le nôtre (visites gardées mais hors des chiffres), ?moi=0 l'annule. */
(function(){
  try{
    var L=location, P=L.pathname, N=navigator;
    if(/^\/(admin|tableau)(\/|$)/.test(P)||N.webdriver) return;
    var st=function(S,k,v){ try{ if(v===undefined) return S.getItem(k); S.setItem(k,v); }catch(e){} return null; };
    var q=new URLSearchParams(L.search);
    if(q.get('moi')==='1') st(localStorage,'sto_moi','1');
    if(q.get('moi')==='0'){ try{ localStorage.removeItem('sto_moi'); }catch(e){} }
    var own=st(localStorage,'sto_moi')==='1';
    var rid=function(){ return (Math.random().toString(36).slice(2,10)+Date.now().toString(36)).slice(0,18); };
    var sid=st(sessionStorage,'sto_s'), first=!sid; if(first){ sid=rid(); st(sessionStorage,'sto_s',sid); }
    var vid=st(localStorage,'sto_v'), neu=!vid; if(neu){ vid=rid(); st(localStorage,'sto_v',vid); }
    var seq=+(st(sessionStorage,'sto_n')||0);
    // de l'adresse, on ne garde que ces réglages (jamais un lien de modification ni une clé)
    var KEEP=['theme','anim','plan','utm_source','utm_medium','utm_campaign','utm_content','utm_term'], qs={};
    KEEP.forEach(function(k){ var v=q.get(k); if(v) qs[k]=String(v).slice(0,60); });
    var ref=''; try{ if(document.referrer){ var r=new URL(document.referrer); if(r.host!==L.host) ref=(r.host+r.pathname).slice(0,120); } }catch(e){}
    var ctx=first?{ref:ref,qs:qs,lp:P,w:innerWidth,h:innerHeight,lang:(N.language||'').slice(0,8),neu:neu?1:0,
      clid:q.get('ttclid')?'tiktok':q.get('fbclid')?'meta':q.get('gclid')?'google':''}:null;

    var Q=[];
    function flush(beacon){
      if(!Q.length) return;
      var body=JSON.stringify({s:sid,v:vid,o:own?1:0,q:seq++,c:ctx,e:Q.splice(0)}); ctx=null; st(sessionStorage,'sto_n',String(seq));
      try{
        if(beacon&&N.sendBeacon&&N.sendBeacon('/api/t',new Blob([body],{type:'application/json'}))) return;
        fetch('/api/t',{method:'POST',headers:{'Content-Type':'application/json'},body:body,keepalive:true}).catch(function(){});
      }catch(e){}
    }
    function push(n,d,a){ Q.push({a:a||Date.now(),n:n,p:P,d:d}); if(Q.length>=25) flush(); }
    push('vue',{t:document.title.slice(0,80),qs:Object.keys(qs).length?qs:undefined});
    // les événements nommés ; ceux partis avant le chargement de ce fichier attendent dans stoQ (balise de build-site.py)
    var named=function(n,d,a){ try{ push(String(n).toLowerCase().replace(/[^a-z_]/g,'').slice(0,20)||'evt',d&&typeof d==='object'?d:undefined,a); }catch(e){} };
    (window.stoQ||[]).forEach(function(x){ named(x[0],x[1],x[2]); }); window.stoQ=null;
    window.stoTrack=function(n,d){ named(n,d); };
    // le premier paquet part tout de suite (il porte la provenance), les suivants toutes les 5 s : dans le navigateur
    // interne de TikTok ou d'Instagram, l'envoi au départ de la page n'est pas sûr
    setTimeout(function(){ flush(); },700);

    // temps actif (onglet visible) et profondeur de défilement
    var act=0, since=document.visibilityState==='visible'?Date.now():0, maxS=0, marks=[25,50,75,100];
    function depth(){ var d=document.documentElement, h=d.scrollHeight-innerHeight; var p=h<40?100:Math.min(100,Math.round((scrollY||d.scrollTop)/h*100));
      if(p>maxS){ maxS=p; while(marks.length&&maxS>=marks[0]) push('defile',{pct:marks.shift()}); } }
    var tk=0; addEventListener('scroll',function(){ if(tk) return; tk=setTimeout(function(){ tk=0; depth(); },400); },{passive:true});
    function leave(){ if(since){ act+=Date.now()-since; since=0; } push('quitte',{s:Math.round(act/1000),max:maxS}); flush(true); }
    document.addEventListener('visibilitychange',function(){ if(document.visibilityState==='hidden') leave(); else since=Date.now(); });
    addEventListener('pagehide',function(){ if(since) leave(); });
    // toutes les 15 s de lecture, le temps actif part aussi (« actif ») : le « quitte » du départ n'arrive pas toujours
    var beat=0; setInterval(function(){ if(since&&++beat%3===0) push('actif',{s:Math.round((act+Date.now()-since)/1000),max:maxS}); flush(); },5000);

    // les faire-part des clients (/d/…) : pas de clics ni de champs (des noms d'invités peuvent s'y trouver)
    if(!/^\/d\//.test(P)){
      document.addEventListener('click',function(e){
        var el=e.target&&e.target.closest&&e.target.closest('a,button,[role=button],summary,[data-t]'); if(!el) return;
        var tx=(el.getAttribute('data-t')||el.getAttribute('aria-label')||el.innerText||el.title||'').replace(/\s+/g,' ').trim().slice(0,60);
        var d={tx:tx}, h=el.getAttribute('href');
        if(h){ try{ var u=new URL(h,L.href); d.to=u.host===L.host?(u.pathname+(u.hash&&u.pathname===P?u.hash:'')).slice(0,80):u.host; }catch(x){} }
        var z=el.closest('section[id],[id]'); if(z&&z.id) d.z=z.id.slice(0,30);
        push('clic',d);
      },true);
      var seen={};
      document.addEventListener('focusin',function(e){ var el=e.target; if(!el||!/^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName)) return;
        var k=(el.id||el.name||el.type||'').slice(0,30); if(!k||seen[k]) return; seen[k]=1; push('champ',{f:k}); });
    }
    var errs=0; addEventListener('error',function(e){ if(errs++>4||!e.message) return; push('erreur',{m:String(e.message).slice(0,120),f:String(e.filename||'').split('/').pop().slice(0,40),l:e.lineno}); });
  }catch(e){}
})();
