// Captures d'écran du vrai faire-part (démo Giulia & Hugo) pour le post « 5 choses » : node captures.js
// Site servi en local : python3 -m http.server 8765 -d business/site. Sorties dans caps/ (1170 × 2532, iPhone ×3).
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
(async () => {
  const out = path.join(__dirname, 'caps'); fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  const pg = await ctx.newPage();
  await pg.goto('http://localhost:8765/d/giulia-hugo/'); await pg.waitForTimeout(1500);
  await pg.addStyleTag({ content: '.demo-tag,.snd{display:none!important}' });
  await pg.mouse.click(202, 420); await pg.waitForTimeout(3500);
  const hub = await pg.$('.rvl-hub'); if (hub) { await hub.click(); await pg.waitForTimeout(5000); }
  const down = async (n) => { for (let i = 0; i < n; i++) { await pg.keyboard.press('ArrowDown'); await pg.waitForTimeout(1300); } };
  await down(1); await pg.screenshot({ path: path.join(out, 'itineraire.png') });   // la cérémonie : Itinéraire · Calendrier
  await down(2); await pg.screenshot({ path: path.join(out, 'programme.png') });    // le programme
  await down(3); await pg.screenshot({ path: path.join(out, 'deadline.png') });     // réponse souhaitée avant le 1er juillet
  await pg.click('[data-rsvp]'); await pg.waitForTimeout(1500);
  await pg.evaluate(() => { document.querySelectorAll('.note').forEach(n => { if (/Ceci est une démo/.test(n.textContent)) n.innerHTML = n.innerHTML.replace(/Ceci est une démo[^.]*\.\s*/, ''); }); });
  await pg.fill('#rf input[name="name"]', 'Sarah Martin');
  for (const id of ['ceremonie', 'diner']) { const r = await pg.$(`#rf input[name="ev-${id}"][value="1"]`); if (r) await r.evaluate(e => { e.checked = true; e.dispatchEvent(new Event('change', { bubbles: true })); }); }
  await pg.waitForTimeout(400);
  await pg.evaluate(() => { const s = document.querySelector('#rf select'); if (s) { s.selectedIndex = 1; s.dispatchEvent(new Event('change', { bubbles: true })); } });
  const scrollTo = async (sel) => pg.evaluate((sel) => { const el = document.querySelector(sel); let s = el; while (s && !(s.scrollHeight > s.clientHeight + 20 && /auto|scroll/.test(getComputedStyle(s).overflowY))) s = s.parentElement; if (s) s.scrollTop = el.offsetTop - 120; }, sel);
  await scrollTo('#ppl'); await pg.waitForTimeout(500); await pg.screenshot({ path: path.join(out, 'menu.png') });
  await scrollTo('#waLink'); await pg.waitForTimeout(500); await pg.screenshot({ path: path.join(out, 'whatsapp.png') });
  await b.close(); console.log('caps ok');
})();
