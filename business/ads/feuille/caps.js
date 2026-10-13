// Capture le vrai tableau de bord (démo Leïla & Mehdi) pour la pub « mamie » : caps/tb.png (écran de téléphone, 540 px de large, page entière).
const {chromium}=require('/opt/node-tools/node_modules/playwright');
(async()=>{ const b=await chromium.launch(); const p=await b.newPage({viewport:{width:360,height:740},deviceScaleFactor:1.5});
  await p.goto('http://localhost:8765/tableau/?demo=page-leila-mehdi'); await p.waitForTimeout(3000);
  require('fs').mkdirSync(__dirname+'/caps',{recursive:true}); await p.screenshot({path:__dirname+'/caps/tb.png',fullPage:true}); await b.close(); })();
