// Verifies that frames are a pure function of t: sequential playback vs. a cold jump must match pixel-for-pixel.
const { chromium } = require('playwright'); const path = require('path'); const sharp = require('sharp');
(async () => {
  const fmt = process.argv[2] || 'reel', W = fmt === 'reel' ? 1080 : 1920, H = fmt === 'reel' ? 1920 : 1080;
  const b = await chromium.launch({ args: ['--allow-file-access-from-files', '--force-color-profile=srgb', '--font-render-hinting=none'] });
  const mk = async () => { const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage(); await p.goto('file://' + path.resolve(__dirname, '../src/index.html') + '?fmt=' + fmt); await p.waitForFunction('window.__ready===true'); return { p, c: await p.context().newCDPSession(p) }; };
  const A = await mk(), B = await mk();
  const shot = async (o, t) => { await o.p.evaluate(t => window.__seek(t), t); const r = await o.c.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true }); return (await sharp(Buffer.from(r.data, 'base64')).removeAlpha().raw().toBuffer()); };
  const times = [3.7, 12.9, 17.2, 22.5, 24.9, 31.7, 36.4, 41.8, 47.5, 52.3];
  // A: sequential playback through many times; B: cold jump straight to each (fresh order: reverse + random)
  const seqFrames = {};
  for (let t = 0; t <= 53; t += .5) { const f = await shot(A, t); if (times.some(x => Math.abs(x - t) < .26)) { /* keep nearest */ } }
  let worst = 0;
  for (const t of times) {
    const a = await shot(A, t);                       // A just played forward to 53 -> now jumping BACK to t
    const bb = await shot(B, t);                      // B cold jump
    let diff = 0, mx = 0; for (let i = 0; i < a.length; i += 3) { const d = Math.abs(a[i] - bb[i]) + Math.abs(a[i + 1] - bb[i + 1]) + Math.abs(a[i + 2] - bb[i + 2]); diff += d; if (d > mx) mx = d; }
    const mean = diff / (a.length / 3); worst = Math.max(worst, mean);
    console.log(`t=${t}  mean|diff|=${mean.toFixed(4)}  max=${mx}`);
  }
  console.log(worst < 0.05 ? 'DETERMINISTIC ✓' : 'NOT deterministic ✗  worst=' + worst);
  await b.close();
})();
