// Filme carrousel.html image par image. Il faut le site servi en local :
//   python3 -m http.server 8765 -d business/site
//   node business/ads/carrousel/render.js preview [t1,t2,…] [H]   (captures)
//   node business/ads/carrousel/render.js full <musique.mp3> <début s> [H]   (H = 1920 pour 9:16, 1350 pour 4:5)
const {chromium}=require('/opt/node-tools/node_modules/playwright');
const {spawn}=require('child_process'); const fs=require('fs');
const TH=require(__dirname+'/themes.json');
(async()=>{
 const mode=process.argv[2]||'preview', H=+(mode==='full'?process.argv[5]:process.argv[4])||1920;
 const html=fs.readFileSync(__dirname+'/carrousel.html','utf8').replace('<script>',`<script>window.TH=${JSON.stringify(TH)};window.H=${H};</script><script>`);
 const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1080,height:H}});
 await p.route('http://localhost:8765/_ads/',r=>r.fulfill({contentType:'text/html; charset=utf-8',body:html}));
 await p.goto('http://localhost:8765/_ads/'); await p.evaluate(()=>document.fonts.ready);
 await p.evaluate(()=>Promise.all([...document.images].map(i=>i.decode().catch(()=>{})))); await p.waitForTimeout(800);
 const tag=H===1920?'9x16':'4x5';
 if(mode==='preview'){
   for(const t of (process.argv[3]||'0.5,1.2,1.6,3,6,12,14.5').split(',')){ await p.evaluate(t=>render(t),+t); await p.screenshot({path:`${__dirname}/f-${tag}-${t}.jpg`,type:'jpeg',quality:75}); }
 } else {
   const fps=30,N=15*fps;
   const ff=spawn('ffmpeg',['-y','-f','image2pipe','-framerate',''+fps,'-i','-','-ss',process.argv[4]||'0','-i',process.argv[3],
     '-filter_complex','[1:a]asetpts=PTS-STARTPTS,afade=t=in:d=0.4,afade=t=out:st=13.6:d=1.4,volume=0.9[a]',
     '-map','0:v','-map','[a]','-t','15','-c:v','libx264','-pix_fmt','yuv420p','-crf','18','-preset','medium','-r',''+fps,
     '-c:a','aac','-b:a','192k','-movflags','+faststart',`${__dirname}/save-the-oui-carrousel-${tag}.mp4`],{stdio:['pipe','ignore','inherit']});
   for(let i=0;i<N;i++){ await p.evaluate(t=>render(t),i/fps); const buf=await p.screenshot({type:'jpeg',quality:92}); if(!ff.stdin.write(buf)) await new Promise(r=>ff.stdin.once('drain',r)); }
   ff.stdin.end(); await new Promise(r=>ff.on('close',r));
 }
 await b.close();
})();
