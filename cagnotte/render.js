// Rend l'affiche A4 en PNG (300 dpi) et en PDF : node cagnotte/render.js
// Le QR code (qr-lydia.png) est isolé du PDF Lydia de la cagnotte.
const path = require('path');
const { chromium } = require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright'));

(async () => {
  const dir = __dirname;
  const suffix = '';
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 3.125 });
  await page.goto('file://' + path.join(dir, 'affiche-cagnotte.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(dir, `affiche-cagnotte${suffix}.png`), fullPage: false });
  await page.pdf({ path: path.join(dir, `affiche-cagnotte${suffix}.pdf`), format: 'A4', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  await browser.close();
  console.log('ok');
})();
