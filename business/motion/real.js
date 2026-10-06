const {chromium}=require('/opt/node-tools/node_modules/playwright');
const inv=require('/home/user/faire-part-jad-ines/business/invites/giulia-hugo.json');
Object.assign(inv,{demo:false,opening:'env',reveal:null,music:null,countdown:null});
const page=i=>`<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/polices/polices.css"><link rel="stylesheet" href="/invite.css"><link rel="stylesheet" href="/reveal.css"><style>.snd,.demo-tag{display:none!important}</style></head><body><script>window.INVITE=${JSON.stringify(i).replace(/</g,'\\u003c')};</script><script src="/themes.js"></script><script src="/reveal.js"></script><script src="/invite.js"></script></body></html>`;
(async()=>{
 const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:390,height:867},deviceScaleFactor:608/390});
 await ctx.clock.install({time:new Date('2026-10-06T12:00:00')});
 const p=await ctx.newPage(); p.on('pageerror',e=>console.log('ERR',e.message));
 await p.route('http://localhost:8765/_m/',r=>r.fulfill({contentType:'text/html; charset=utf-8',body:page(inv)}));
 await p.goto('http://localhost:8765/_m/');
 const step=async ms=>{await p.clock.runFor(ms); await p.evaluate(()=>{const n=performance.now();for(const a of document.getAnimations()){if(a._b===undefined){a._b=n;a.pause();}a.currentTime=n-a._b;}});};
 await p.waitForTimeout(3000);   // chargement
 await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(1500);
 await p.clock.pauseAt(new Date('2026-10-06T12:05:00'));
 await step(1000);
 await p.screenshot({path:__dirname+'/real/pre.jpg',type:'jpeg',quality:92});
 const box=await p.locator('.op-seal').boundingBox(); console.log('seal',JSON.stringify(box));
 await p.evaluate(()=>{const s=document.querySelector('.op-seal');s.click();});
 const N=+(process.argv[2]||126);
 const dbg=()=>p.evaluate(()=>{const o=document.querySelector('.op');return (o?o.className+' '+getComputedStyle(o).opacity:'none')+' | '+document.getAnimations().map(a=>(a.animationName||a.transitionProperty)+':'+Math.round(a.currentTime)+':'+a.playState).join(',')+' app:'+document.getElementById('app').className});
 for(let i=0;i<N;i++){ await step(1000/30); await p.waitForTimeout(i%10==0?60:5); if(process.env.DBG&&(i<12||i%10==0)) console.log(i,await dbg()); await p.screenshot({path:`${__dirname}/real/r${String(i).padStart(3,'0')}.jpg`,type:'jpeg',quality:92}); }
 await b.close();
})();
