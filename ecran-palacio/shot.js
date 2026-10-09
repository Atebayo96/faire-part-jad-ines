const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
for(const n of ['1-accueil','2-soiree','3-fin']){await p.goto('file://'+__dirname+'/'+n+'.html');await p.waitForTimeout(600);await p.screenshot({path:__dirname+'/'+n+'.png'});}
await b.close();})();
