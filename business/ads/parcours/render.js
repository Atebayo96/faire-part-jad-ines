// Filme parcours.html (window.V = etapes | direct | oui). Site servi en local sur 8765, captures faites (captures.js).
//   node business/ads/parcours/render.js preview <V> [t1,t2,…]
//   node business/ads/parcours/render.js full <V> <musique.mp3> <début s>
const {chromium}=require('/opt/node-tools/node_modules/playwright');
const {spawn}=require('child_process'); const fs=require('fs'), path=require('path');
(async()=>{
 const [mode,V]=[process.argv[2],process.argv[3]];
 const taps=JSON.parse(fs.readFileSync(__dirname+'/caps/taps.json'));
 const html=fs.readFileSync(__dirname+'/parcours.html','utf8').replace('<script>',`<script>window.V=${JSON.stringify(V)};window.TAPS=${JSON.stringify(taps)};</script><script>`);
 const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1080,height:1920}});
 await p.route('http://localhost:8765/_p/',r=>r.fulfill({contentType:'text/html; charset=utf-8',body:html}));
 await p.route('http://localhost:8765/_caps/**',r=>r.fulfill({path:__dirname+'/caps/'+path.basename(new URL(r.request().url()).pathname)}));
 await p.goto('http://localhost:8765/_p/'); await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(800);
 if(mode==='preview'){
   for(const t of (process.argv[4]||'1,3,5,6,8.5,10.5,12,14.5').split(',')){ await p.evaluate(t=>render(t),+t); await p.waitForTimeout(50); await p.screenshot({path:`${__dirname}/f-${V}-${t}.jpg`,type:'jpeg',quality:70}); }
 } else {
   const fps=30,N=15*fps;
   const ff=spawn('ffmpeg',['-y','-f','image2pipe','-framerate',''+fps,'-i','-','-ss',process.argv[5]||'0','-i',process.argv[4],
     '-filter_complex','[1:a]asetpts=PTS-STARTPTS,afade=t=in:d=0.4,afade=t=out:st=13.6:d=1.4,volume=0.9[a]',
     '-map','0:v','-map','[a]','-t','15','-c:v','libx264','-pix_fmt','yuv420p','-crf','18','-preset','medium','-r',''+fps,
     '-c:a','aac','-b:a','192k','-movflags','+faststart',`${__dirname}/save-the-oui-${V}-9x16.mp4`],{stdio:['pipe','ignore','inherit']});
   for(let i=0;i<N;i++){ await p.evaluate(t=>render(t),i/fps); const buf=await p.screenshot({type:'jpeg',quality:92}); if(!ff.stdin.write(buf)) await new Promise(r=>ff.stdin.once('drain',r)); }
   ff.stdin.end(); await new Promise(r=>ff.on('close',r));
 }
 await b.close();
})();
