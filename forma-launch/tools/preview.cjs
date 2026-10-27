// Usage: node tools/preview.cjs <reel|land> <outDir> t1 t2 t3 ...
// Renders still frames at the given timestamps for visual QA.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const [fmt, outDir, ...ts] = process.argv.slice(2);
  const W = fmt === 'reel' ? 1080 : 1920, H = fmt === 'reel' ? 1920 : 1080;
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ args: ['--force-color-profile=srgb', '--font-render-hinting=none', '--allow-file-access-from-files'] });
  const page = await (await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })).newPage();
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('[page]', m.text()); });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  const url = 'file://' + path.resolve(__dirname, '../src/index.html') + '?fmt=' + fmt;
  await page.goto(url);
  await page.waitForFunction('window.__ready === true', null, { timeout: 30000 });
  const dur = await page.evaluate('window.DURATION');
  console.log('duration', dur, 'cues', await page.evaluate('CUES.length'));
  const cdp = await page.context().newCDPSession(page);
  for (const t of ts) {
    await page.evaluate((t) => window.__seek(t), +t);
    const r = await cdp.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true });
    const f = path.join(outDir, 't' + (+t).toFixed(2).padStart(6, '0') + '.png');
    fs.writeFileSync(f, Buffer.from(r.data, 'base64'));
  }
  await browser.close();
})();
