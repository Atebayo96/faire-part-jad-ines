// Filme feuille.html (window.V = prix | univers | mamie). Site servi en local sur 8765 (python3 -m http.server 8765 -d business/site).
//   node business/ads/feuille/render.js preview <V> [t1,t2,…]
//   node business/ads/feuille/render.js full <V> <musique.mp3> <début s>
const {chromium}=require('/opt/node-tools/node_modules/playwright');
const {spawn}=require('child_process'); const fs=require('fs'), path=require('path');
const D=18;
(async()=>{
 const [mode,V]=[process.argv[2],process.argv[3]];
 const inv=path.join(__dirname,'../../invites'), F={};
 for(const s of ['page-emma-louis','carte-camille-antoine','page-victoire-charles','page-nour-ilyes','page-leila-mehdi']) F[s]=JSON.parse(fs.readFileSync(`${inv}/${s}.json`,'utf8'));
 const html=fs.readFileSync(__dirname+'/feuille.html','utf8').replace('<script>',`<script>window.V=${JSON.stringify(V)};window.FICHES=${JSON.stringify(F)};</script><script>`);
 const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1080,height:1920}});
 p.on('pageerror',e=>console.error('page:',e.message));
 await p.route('http://localhost:8765/_f/',r=>r.fulfill({contentType:'text/html; charset=utf-8',body:html}));
 await p.goto('http://localhost:8765/_f/'); await p.evaluate(()=>window.ready()); await p.waitForTimeout(500);
 if(mode==='preview'){
   for(const t of (process.argv[4]||'1,2.5,3.5,6,9,11,13,14,16.5').split(',')){ await p.evaluate(t=>render(t),+t); await p.waitForTimeout(60); await p.screenshot({path:`${__dirname}/f-${V}-${t}.jpg`,type:'jpeg',quality:70}); }
 } else {
   const fps=30,N=D*fps;
   const ff=spawn('ffmpeg',['-y','-f','image2pipe','-framerate',''+fps,'-i','-','-ss',process.argv[5]||'0','-i',process.argv[4],
     '-filter_complex',`[1:a]asetpts=PTS-STARTPTS,afade=t=in:d=0.4,afade=t=out:st=${D-1.6}:d=1.6,volume=0.9[a]`,
     '-map','0:v','-map','[a]','-t',''+D,'-c:v','libx264','-pix_fmt','yuv420p','-crf','18','-preset','medium','-r',''+fps,
     '-c:a','aac','-b:a','192k','-movflags','+faststart',`${__dirname}/save-the-oui-feuille-${V}-9x16.mp4`],{stdio:['pipe','ignore','inherit']});
   for(let i=0;i<N;i++){ await p.evaluate(t=>render(t),i/fps); const buf=await p.screenshot({type:'jpeg',quality:92}); if(!ff.stdin.write(buf)) await new Promise(r=>ff.stdin.once('drain',r)); }
   ff.stdin.end(); await new Promise(r=>ff.on('close',r));
 }
 await b.close();
})();
