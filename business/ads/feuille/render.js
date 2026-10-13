// Filme feuille.html (window.V = univers | details | mamie) et mixe le son (window.AUDIO : musique + voix off, audio/).
// Site servi en local sur 8765 (python3 -m http.server 8765 -d business/site) ; caps/tb.png vient de caps.js.
//   node business/ads/feuille/render.js preview <V> [t1,t2,…]
//   node business/ads/feuille/render.js full <V>
const {chromium}=require('/opt/node-tools/node_modules/playwright');
const {spawn}=require('child_process'); const fs=require('fs'), path=require('path');
(async()=>{
 const [mode,V]=[process.argv[2],process.argv[3]];
 const inv=path.join(__dirname,'../../invites'), F={};
 for(const s of ['page-emma-louis','carte-camille-antoine','page-victoire-charles','page-nour-ilyes','page-leila-mehdi']) F[s]=JSON.parse(fs.readFileSync(`${inv}/${s}.json`,'utf8'));
 const html=fs.readFileSync(__dirname+(V==='collage'?'/collage.html':'/feuille.html'),'utf8').replace('<script>',`<script>window.V=${JSON.stringify(V)};window.FICHES=${JSON.stringify(F)};</script><script>`);
 const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1080,height:1920}});
 p.on('pageerror',e=>console.error('page:',e.message));
 await p.route('http://localhost:8765/_f/',r=>r.fulfill({contentType:'text/html; charset=utf-8',body:html}));
 await p.route('http://localhost:8765/_caps/**',r=>r.fulfill({path:__dirname+'/caps/'+path.basename(new URL(r.request().url()).pathname)}));
 await p.goto('http://localhost:8765/_f/'); await p.evaluate(()=>window.ready()); await p.waitForTimeout(500);
 const A=await p.evaluate(()=>window.AUDIO);
 if(mode==='preview'){
   for(const t of (process.argv[4]||'1,3,5,7,9,11,13,15').split(',')){ await p.evaluate(t=>render(t),+t); await p.waitForTimeout(60); await p.screenshot({path:`${__dirname}/f-${V}-${t}.jpg`,type:'jpeg',quality:70}); }
 } else {
   const fps=30,N=Math.round(A.d*fps), au=n=>`${__dirname}/audio/${n}.mp3`;
   // musique sous la voix (baissée quand on parle, sidechain), fondu de sortie
   const ins=['-i',au(A.music)], fl=[`[1:a]atrim=0:${A.d},asetpts=PTS-STARTPTS,afade=t=in:d=0.3,afade=t=out:st=${(A.d-1.5).toFixed(2)}:d=1.5,volume=0.55[mu]`];
   A.vo.forEach(([f,at,a,z],i)=>{ ins.push('-i',au(f)); fl.push(`[${i+2}:a]atrim=${a}:${z},asetpts=PTS-STARTPTS,afade=t=out:st=${Math.max(0,z-a-.08).toFixed(3)}:d=0.08,adelay=${Math.round(at*1000)}|${Math.round(at*1000)},volume=1.6[v${i}]`); });
   fl.push(`${A.vo.map((_,i)=>`[v${i}]`).join('')}amix=inputs=${A.vo.length}:normalize=0[vo]`,'[vo]asplit[vo1][vo2]',
     '[mu][vo1]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=400[duck]','[duck][vo2]amix=inputs=2:normalize=0,alimiter=limit=0.95[a]');
   const ff=spawn('ffmpeg',['-y','-f','image2pipe','-framerate',''+fps,'-i','-',...ins,'-filter_complex',fl.join(';'),
     '-map','0:v','-map','[a]','-t',''+A.d,'-c:v','libx264','-pix_fmt','yuv420p','-crf','18','-preset','medium','-r',''+fps,
     '-c:a','aac','-b:a','192k','-movflags','+faststart',`${__dirname}/save-the-oui-feuille-${V}-9x16.mp4`],{stdio:['pipe','ignore','inherit']});
   let dead=false; ff.on('close',c=>{ if(c) { dead=true; console.error('ffmpeg a échoué ('+c+')'); } }); ff.stdin.on('error',()=>{ dead=true; });
   for(let i=0;i<N&&!dead;i++){ await p.evaluate(t=>render(t),i/fps); const buf=await p.screenshot({type:'jpeg',quality:92}); if(!ff.stdin.write(buf)) await new Promise(r=>{ ff.stdin.once('drain',r); ff.once('close',r); }); }
   if(!dead){ ff.stdin.end(); await new Promise(r=>ff.on('close',r)); }
 }
 await b.close();
})();
