// Capture chaque page de html/ en JPG 1080 × 1920 dans out/<slug>/<slug>-<i>.jpg : node render.js [slug]
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
(async () => {
  const here = __dirname, only = process.argv[2];
  const files = fs.readdirSync(path.join(here, 'html')).filter(f => f.endsWith('.html') && (!only || f.startsWith(only))).sort();
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  for (const f of files) {
    await pg.goto('file://' + path.join(here, 'html', f)); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(150);
    // titre d'accroche : chaque ligne voulue (<br>) doit tenir sur une ligne, on réduit la police jusqu'à ce que ce soit le cas
    await pg.evaluate(() => { const h = document.querySelector('.hook h1'); if (!h || !h.querySelector('br')) return; h.style.whiteSpace = 'nowrap';
      let fs = parseFloat(getComputedStyle(h).fontSize); while (h.scrollWidth > h.clientWidth && fs > 60) { fs -= 2; h.style.fontSize = fs + 'px'; }
      h.style.whiteSpace = ''; });
    const slug = f.replace(/-\d+\.html$/, ''); fs.mkdirSync(path.join(here, 'out', slug), { recursive: true });
    const over = await pg.evaluate(() => { const i = document.querySelector('.in'); return i.scrollHeight - i.clientHeight; });
    await pg.screenshot({ path: path.join(here, 'out', slug, f.replace('.html', '.jpg')), type: 'jpeg', quality: 86 });
    console.log(f, over > 0 ? `DÉBORDE de ${over}px` : 'ok');
  }
  await b.close();
})();
