/* Sceau : ouvertures en vrais objets 3D (three.js, hébergé dans vendor/).
   Portes, rideau et voile ne sont plus des images plates déformées en CSS : ce sont des objets construits une fois,
   dont le mouvement vient d'une petite physique (ressort amorti : inertie au départ, accélération, léger dépassement,
   repos) et, pour les tissus, de plis calculés sommet par sommet (le tissu se ramasse, ondule, l'ourlet traîne),
   éclairés par une lumière qui fait vivre les plis. Tout est paramétrable (PARAMS, et doorBox par thème dans themes.js).
   Le module s'annonce par l'événement « sceau3d » ; invite.js et le configurateur l'appellent :
     window.SceauOpen3D.mount({op, type:'door'|'cur'|'voile', doorUrl, curUrl, doorBox}) -> {play(), dispose(), ready}
   Sans WebGL (ou avec prefers-reduced-motion), rien n'est monté : la version CSS reste. */
import * as THREE from './vendor/three.module.min.js';

export const PARAMS={
  camera:{fov:38,dolly:.9,dollyDur:3.2},
  light:{ambient:.72,key:.28,keyDir:[.18,.32,1]},
  // ressort : raideur k, amortissement c (ζ = c / 2√k : 0,68 porte, 0,6 voile = léger dépassement), montée en charge ramp (s)
  door:{angle:100,k:5.5,c:3.2,ramp:.55,delayRight:.06,depth:.035,wood:'#5a3a1c',woodEdge:'#8a5a2c',roomColor:'#fff3d8',roomFadeFrom:.45,roomFadeTo:1.9,settle:3.4},
  cur:{k:3.0,c:2.5,ramp:.45,lift:1.08,gather:.3,pleats:9,amp:26,lag:.12,settle:3.0},   // monte en ~1,7 s, comme la version CSS appréciée
  voile:{k:4.0,c:2.4,ramp:.5,min:.14,pleats:14,amp:34,lag:.12,sway:14,settle:3.0}
};

const texCache=new Map();
function loadTex(url){
  if(!texCache.has(url)) texCache.set(url,new Promise((res,rej)=>new THREE.TextureLoader().load(url,t=>{ t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; res(t); },undefined,rej)));
  return texCache.get(url);
}
// fenêtre UV d'une image posée en « cover » dans une boîte (comme background-size: cover)
function coverUV(iw,ih,bw,bh){ const ia=iw/ih, ba=bw/bh; if(ia>ba){ const s=ba/ia; return {u0:(1-s)/2,u1:(1+s)/2,v0:0,v1:1}; } const s=ia/ba; return {u0:0,u1:1,v0:(1-s)/2,v1:(1+s)/2}; }
function subTex(tex,u0,v0,u1,v1){ const t=tex.clone(); t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping; t.repeat.set(u1-u0,v1-v0); t.offset.set(u0,v0); t.needsUpdate=true; return t; }

/* ressort amorti avec montée en charge : x part de 0 vers target ; la raideur monte de 0 à k pendant ramp (inertie) */
class Spring{
  constructor(k,c,ramp){ this.k=k; this.c=c; this.ramp=ramp; this.x=0; this.v=0; this.t=0; this.hist=[[0,0]]; }
  step(dt,target){ this.t+=dt; const kk=this.k*Math.min(1,this.t/this.ramp); const a=kk*(target-this.x)-this.c*this.v; this.v+=a*dt; this.x+=this.v*dt; this.hist.push([this.t,this.x]); if(this.hist.length>400) this.hist.shift(); return this.x; }
  // valeur il y a `delay` secondes (pour l'ourlet qui traîne)
  at(delay){ const tt=this.t-delay; if(tt<=0) return 0; const h=this.hist; for(let i=h.length-1;i>0;i--){ if(h[i-1][0]<=tt){ const [t0,x0]=h[i-1],[t1,x1]=h[i]; return x0+(x1-x0)*((tt-t0)/Math.max(1e-6,t1-t0)); } } return h[0][1]; }
}
const smooth=x=>x<0?0:x>1?1:x*x*(3-2*x);

// réglages effectifs : PARAMS, surchargés par ceux du thème (themes.js, clé open3d : {door:{...},cur:{...},voile:{...}})
function withOverrides(ov){ const P={}; for(const k in PARAMS) P[k]=Object.assign({},PARAMS[k],ov&&ov[k]||{}); return P; }

export function mount(o){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
  const op=o.op, type=o.type; if(!['door','cur','voile'].includes(type)) return null;
  const PARAMS=withOverrides(o.params);
  const canvas=document.createElement('canvas'); canvas.className='op-3d'; op.prepend(canvas);
  let renderer; try{ renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'}); }catch(e){ canvas.remove(); return null; }
  renderer.setClearColor(0x000000,0);
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(PARAMS.camera.fov,1,1,8000);
  scene.add(new THREE.AmbientLight(0xffffff,PARAMS.light.ambient));
  const key=new THREE.DirectionalLight(0xffffff,PARAMS.light.key); key.position.set(...PARAMS.light.keyDir); scene.add(key);
  let W=0,H=0,dist=0, parts=null, playing=false, t0=0, last=0, raf=0, disposed=false;

  function size(){
    W=op.clientWidth||390; H=op.clientHeight||844;
    renderer.setPixelRatio(Math.min(2,devicePixelRatio||1)); renderer.setSize(W,H,false);
    camera.aspect=W/H; dist=(H/2)/Math.tan(THREE.MathUtils.degToRad(camera.fov/2)); camera.position.set(0,0,dist); camera.lookAt(0,0,0); camera.updateProjectionMatrix();
  }
  const clear=()=>{ if(parts){ parts.objs.forEach(m=>{ scene.remove(m); m.traverse&&m.traverse(x=>{ if(x.geometry) x.geometry.dispose(); if(x.material){ [].concat(x.material).forEach(mm=>mm.dispose()); } }); }); parts=null; } };

  /* ---------- portes : un mur troué, deux battants épais sur leurs gonds, la lumière de la salle derrière ---------- */
  function buildDoor(tex){
    const P=PARAMS.door, img=tex.image, uv=coverUV(img.width,img.height,W,H);
    const bx=o.doorBox||[0,0,1,1];  // zone des battants dans l'image (fractions, haut-gauche -> bas-droite)
    // zone des battants en pixels écran (l'image est en cover, v=1 en haut)
    const fx=u=>(-.5+(u-uv.u0)/(uv.u1-uv.u0))*W, fy=v=>(.5-(uv.v1-v)/(uv.v1-uv.v0))*H;
    let X0=fx(bx[0]), X1=fx(bx[2]), Y1=fy(1-bx[1]), Y0=fy(1-bx[3]);
    X0=Math.max(-W/2,X0); X1=Math.min(W/2,X1); Y0=Math.max(-H/2,Y0); Y1=Math.min(H/2,Y1);
    const objs=[];
    // le mur : un rectangle avec un trou, UV posées en cover
    const shape=new THREE.Shape([new THREE.Vector2(-W/2,-H/2),new THREE.Vector2(W/2,-H/2),new THREE.Vector2(W/2,H/2),new THREE.Vector2(-W/2,H/2)]);
    const hole=new THREE.Path([new THREE.Vector2(X0,Y0),new THREE.Vector2(X1,Y0),new THREE.Vector2(X1,Y1),new THREE.Vector2(X0,Y1)]); shape.holes.push(hole);
    const wg=new THREE.ShapeGeometry(shape); const pos=wg.attributes.position, uva=wg.attributes.uv;
    for(let i=0;i<pos.count;i++){ uva.setXY(i,uv.u0+(pos.getX(i)/W+.5)*(uv.u1-uv.u0),uv.v0+(pos.getY(i)/H+.5)*(uv.v1-uv.v0)); }
    const wall=new THREE.Mesh(wg,new THREE.MeshBasicMaterial({map:tex})); wall.position.z=-1; scene.add(wall); objs.push(wall);
    // la salle derrière : une lumière chaude qui s'efface pendant l'ouverture et laisse voir la page
    const room=new THREE.Mesh(new THREE.PlaneGeometry(X1-X0,Y1-Y0),new THREE.MeshBasicMaterial({color:new THREE.Color(P.roomColor),transparent:true,opacity:1}));
    room.position.set((X0+X1)/2,(Y0+Y1)/2,-60); scene.add(room); objs.push(room);
    // les battants : des boîtes épaisses, face avant = la moitié de l'image, chants et dos en bois sombre
    const depth=Math.max(10,W*P.depth), lw=(X1-X0)/2, lh=Y1-Y0;
    const u=(x)=>uv.u0+(x/W+.5)*(uv.u1-uv.u0), v=(y)=>uv.v0+(y/H+.5)*(uv.v1-uv.v0);
    const wood=new THREE.MeshLambertMaterial({color:new THREE.Color(P.wood)}), edge=new THREE.MeshLambertMaterial({color:new THREE.Color(P.woodEdge)});
    const leaf=(x0,x1,hingeX,sign)=>{
      const front=new THREE.MeshLambertMaterial({map:subTex(tex,u(x0),v(Y0),u(x1),v(Y1))});
      const m=new THREE.Mesh(new THREE.BoxGeometry(x1-x0,lh,depth),[edge,edge,edge,edge,front,wood]);
      const g=new THREE.Group(); g.position.set(hingeX,(Y0+Y1)/2,0); m.position.set(sign*(x1-x0)/2,0,-depth/2); g.add(m); scene.add(g); objs.push(g); return g; };
    const L=leaf(X0,X0+lw,X0,1), R=leaf(X0+lw,X1,X1,-1);
    const sL=new Spring(P.k,P.c,P.ramp), sR=new Spring(P.k,P.c,P.ramp);
    parts={objs,update:(t,dt)=>{
      const a=THREE.MathUtils.degToRad(P.angle);
      L.rotation.y=-sL.step(dt,a); R.rotation.y=t>P.delayRight?sR.step(dt,a):0;
      room.material.opacity=1-smooth((t-P.roomFadeFrom)/(P.roomFadeTo-P.roomFadeFrom));
      camera.position.z=dist*(1-(1-PARAMS.camera.dolly)*smooth(t/PARAMS.camera.dollyDur));
      return t<P.settle; }};
  }

  /* ---------- tissus : un plan finement maillé, déformé sommet par sommet, normales recalculées (plis éclairés) ---------- */
  function cloth(w,h,nx,ny,tex,uvw,cx){
    const g=new THREE.PlaneGeometry(w,h,nx,ny); const uva=g.attributes.uv;
    for(let i=0;i<uva.count;i++){ uva.setXY(i,uvw.u0+uva.getX(i)*(uvw.u1-uvw.u0),uvw.v0+uva.getY(i)*(uvw.v1-uvw.v0)); }
    const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({map:tex,side:THREE.DoubleSide})); m.position.x=cx; scene.add(m);
    return {mesh:m,geo:g,base:Float32Array.from(g.attributes.position.array)};
  }
  // rideau : il monte d'un seul geste, se ramasse vers le haut (plis de plus en plus marqués), l'ourlet traîne un peu
  function buildCur(tex){
    const P=PARAMS.cur, img=tex.image, uv=coverUV(img.width,img.height,W*1.04,H*1.04);
    const c=cloth(W*1.04,H*1.04,36,54,tex,uv,0), s=new Spring(P.k,P.c,P.ramp), pos=c.geo.attributes.position, b=c.base;
    parts={objs:[c.mesh],update:(t,dt)=>{
      s.step(dt,1);
      for(let i=0;i<pos.count;i++){ const x0=b[i*3], y0=b[i*3+1], yn=(y0/(H*1.04))+.5;   // yn : 0 en bas, 1 en haut
        const pe=s.at(P.lag*(1-yn)), lift=pe*H*P.lift, gather=(H*1.04/2-y0)*P.gather*pe;
        const z=P.amp*pe*(0.35+.65*(1-yn))*Math.sin(x0/(W/P.pleats)*Math.PI*2+.5*Math.sin(t*2.2+yn*3));
        pos.setXYZ(i,x0,y0+lift+gather,z); }
      pos.needsUpdate=true; c.geo.computeVertexNormals();
      return t<P.settle; }};
  }
  // voile : deux pans qui se ramassent chacun vers son bord ; les plis se resserrent à mesure, l'ourlet traîne et ondule
  function buildVoile(tex){
    const P=PARAMS.voile, img=tex.image, uv=coverUV(img.width,img.height,W,H), um=(uv.u0+uv.u1)/2;
    const pw=W/2*1.02;
    const Lc=cloth(pw,H*1.02,26,54,tex,{u0:uv.u0,u1:um,v0:uv.v0,v1:uv.v1},-W/4), Rc=cloth(pw,H*1.02,26,54,tex,{u0:um,u1:uv.u1,v0:uv.v0,v1:uv.v1},W/4);
    const s=new Spring(P.k,P.c,P.ramp);
    const upd=(c,side,t)=>{ const pos=c.geo.attributes.position, b=c.base;
      for(let i=0;i<pos.count;i++){ const x0=b[i*3], y0=b[i*3+1], yn=(y0/(H*1.02))+.5;
        const pe=s.at(P.lag*(1-yn)), g=1-(1-P.min)*pe*(1+.06*yn*pe);           // g : 1 étalé -> min ramassé (un peu plus en haut, aux anneaux)
        const edge=side*pw/2;                                                 // le bord fixe du pan (côté mur), dans le repère du pan
        const x=edge+(x0-edge)*g+side*P.sway*(1-yn)*(1-g)*Math.sin(t*5.5)*Math.exp(-t*1.1);
        const z=P.amp*(1-g)*Math.sin(x0/(pw/P.pleats)*Math.PI*2+.9*Math.sin(yn*3))*(.6+.4*(1-yn));
        pos.setXYZ(i,x,y0,z); }
      pos.needsUpdate=true; c.geo.computeVertexNormals(); };
    parts={objs:[Lc.mesh,Rc.mesh],update:(t,dt)=>{ s.step(dt,1); upd(Lc,-1,t); upd(Rc,1,t); return t<P.settle; }};
  }

  function build(tex){ clear(); if(type==='door') buildDoor(tex); else if(type==='cur') buildCur(tex); else buildVoile(tex); renderer.render(scene,camera); op.classList.add('three'); }
  let tex=null;
  const ready=loadTex(type==='door'?o.doorUrl:o.curUrl).then(t=>{ if(disposed) return; tex=t; size(); build(t); }).catch(()=>{ canvas.remove(); });
  function loop(now){ if(!playing||disposed) return; const t=(now-t0)/1000, dt=Math.min(.05,(now-last)/1000); last=now;
    const more=parts.update(t,dt); renderer.render(scene,camera); if(more) raf=requestAnimationFrame(loop); else playing=false; }
  const ctl={ready,
    play(){ if(playing||disposed) return; const go=()=>{ if(!parts||disposed) return; playing=true; t0=last=performance.now(); raf=requestAnimationFrame(loop); }; parts?go():ready.then(go); },
    dispose(){ disposed=true; playing=false; cancelAnimationFrame(raf); clear(); renderer.dispose(); canvas.remove(); op.classList.remove('three'); removeEventListener('resize',onResize); } };
  const onResize=()=>{ if(disposed||playing||!tex) return; size(); build(tex); };
  addEventListener('resize',onResize);
  return ctl;
}
window.SceauOpen3D={mount,PARAMS};
document.dispatchEvent(new Event('sceau3d'));
