const {chromium}=require('/opt/node-tools/node_modules/playwright');
const {spawn}=require('child_process');
(async()=>{
 const mode=process.argv[2]||'preview';
 const b=await chromium.launch({args:['--allow-file-access-from-files']});
 const p=await b.newPage({viewport:{width:1080,height:1920}});
 await p.goto('file://'+__dirname+'/motion.html'); await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(800);
 if(mode==='preview'){
   for(const t of (process.argv[3]||'0.5,1.7,2.4,3.6,6,8,10,11.4,14.5').split(',')){
     await p.evaluate(t=>render(t),+t); await p.screenshot({path:`f-${t}.jpg`,quality:70,type:'jpeg'});}
 } else {
   const fps=30,N=15*fps;
   const ff=spawn('ffmpeg',['-y','-f','image2pipe','-framerate',''+fps,'-i','-','-i',process.argv[3],
     '-filter_complex','[1:a]atrim=start='+(process.argv[4]||0)+',asetpts=PTS-STARTPTS,afade=t=in:d=0.4,afade=t=out:st=13.6:d=1.4,volume=0.9[a]',
     '-map','0:v','-map','[a]','-t','15','-c:v','libx264','-pix_fmt','yuv420p','-crf','18','-preset','medium','-r',''+fps,
     '-c:a','aac','-b:a','192k','-movflags','+faststart','out.mp4'],{stdio:['pipe','inherit','inherit']});
   for(let i=0;i<N;i++){ await p.evaluate(t=>render(t),i/fps); const buf=await p.screenshot({type:'jpeg',quality:92}); if(!ff.stdin.write(buf)) await new Promise(r=>ff.stdin.once('drain',r)); }
   ff.stdin.end(); await new Promise(r=>ff.on('close',r));
 }
 await b.close();
})();
