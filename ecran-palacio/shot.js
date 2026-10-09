const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
for(const n of ['1-accueil','1-grotte-fairepart','2-soiree','3-fin']){await p.goto('file://'+__dirname+'/'+n+'.html');await p.waitForTimeout(600);await p.screenshot({path:__dirname+'/'+n+'.png'});
 await p.goto('file://'+__dirname+'/maquette.html#'+n+'.png');await p.waitForTimeout(400);await p.screenshot({path:__dirname+'/maquette-'+n+'.jpg',type:'jpeg',quality:85});}
await b.close();})();
