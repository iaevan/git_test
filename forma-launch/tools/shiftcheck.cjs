// Proves the intro-stretch is a pure time shift:
//   node tools/shiftcheck.cjs <reel|land> <headSrcIndex.html>
//   (a) default timing == a reference build (e.g. git HEAD) at the same times
//   (b) ?intro=6 at t+6 == default at t, from the "easier way" scene onward
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const fmt = process.argv[2] || 'reel', ref = process.argv[3];
  const W = fmt === 'reel' ? 1080 : 1920, H = fmt === 'reel' ? 1920 : 1080, SH = 6;
  const b = await chromium.launch({ args: ['--force-color-profile=srgb', '--font-render-hinting=none', '--allow-file-access-from-files', '--disable-lcd-text'] });
  const open = async (url) => { const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage(); p.on('pageerror', e => console.log('[pageerror]', e.message)); await p.goto(url); await p.waitForFunction('window.__ready === true'); return p; };
  const cur = 'file://' + path.resolve(__dirname, '../src/index.html');
  const A = await open(cur + '?fmt=' + fmt), L = await open(cur + '?fmt=' + fmt + '&intro=' + SH);
  const R0 = ref ? await open('file://' + path.resolve(ref) + '?fmt=' + fmt) : null;
  const shot = async (p, t) => { await p.evaluate((t) => __seek(t), t); return p.screenshot({ type: 'png' }); };
  const ts = []; for (let t = 0.2; t < 51.9; t += 1.37) ts.push(+t.toFixed(2));
  let bad = 0;
  for (const t of ts) {
    const a = await shot(A, t);
    if (R0) { const r = await shot(R0, t); if (!a.equals(r)) { bad++; console.log('DIFF default vs reference @', t); } }
    if (t >= 4.6) { const l = await shot(L, t + SH); if (!a.equals(l)) { bad++; console.log('DIFF intro=6 @', t + SH, 'vs default @', t); } }
  }
  const dA = await A.evaluate('DURATION'), dL = await L.evaluate('DURATION');
  console.log(`${fmt}: ${ts.length} times checked, ${bad} differences.  duration ${dA} → ${dL}`);
  await b.close();
})();
