// moteur réel (invite.js) avec une fiche construite à la volée, sur la même origine que le site
const base=require('/home/user/faire-part-jad-ines/business/invites/salma-rayan.json');
function page(inv){ return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/polices/polices.css"><link rel="stylesheet" href="/invite.css"><link rel="stylesheet" href="/reveal.css"></head><body><script>window.INVITE=${JSON.stringify(inv).replace(/</g,'\\u003c')};</script><script src="/themes.js"></script><script src="/reveal.js"></script><script src="/invite.js"></script></body></html>`; }
async function open(b,inv,w,h){ const p=await b.newPage({viewport:{width:w,height:h}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.route('http://localhost:8765/_recette/',r=>r.fulfill({contentType:'text/html; charset=utf-8',body:page(inv)})); await p.goto('http://localhost:8765/_recette/');
  await p.waitForTimeout(900); await p.click('#op'); await p.waitForTimeout(2600); return {p,errs}; }
module.exports={base,open};
