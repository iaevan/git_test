// Leak audit: finds elements that are still being DRAWN while the scene that owns them is hidden
// (CSS: an explicitly `visibility:visible` child renders even inside a `visibility:hidden` parent).
//   node tools/leaks.cjs <reel|land>
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const fmt = process.argv[2] || 'reel';
  const W = fmt === 'reel' ? 1080 : 1920, H = fmt === 'reel' ? 1920 : 1080;
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
  await p.goto('file://' + path.resolve(__dirname, '../src/index.html') + '?fmt=' + fmt + (process.env.INTRO ? '&intro=' + process.env.INTRO : ''));
  await p.waitForFunction('window.__ready === true');
  const leaks = await p.evaluate(() => {
    const scenes = [...document.querySelectorAll('.scene')];
    const els = [];
    scenes.forEach((s) => s.querySelectorAll('*').forEach((e) => els.push([s, e])));
    const out = new Map();
    for (let t = 0; t <= window.DURATION; t += 1 / 20) {
      window.__seek(t);
      for (const [s, e] of els) {
        if (getComputedStyle(s).visibility !== 'hidden') continue;            // scene is on screen — fine
        const cs = getComputedStyle(e);
        if (cs.visibility !== 'visible' || cs.display === 'none') continue;   // inherits hidden → not drawn
        let op = 1; for (let a = e; a && a !== document.body; a = a.parentElement) op *= parseFloat(getComputedStyle(a).opacity);
        const r = e.getBoundingClientRect();
        if (op < .03 || r.width < 2 || r.height < 2 || r.right <= 0 || r.bottom <= 0 || r.left >= innerWidth || r.top >= innerHeight) continue;
        const key = s.dataset.name + ' · ' + e.tagName.toLowerCase() + '.' + String(e.className).trim().split(/\s+/).join('.') + ' "' + (e.textContent || '').trim().slice(0, 14) + '"';
        const f = out.get(key) || { from: t, to: t, n: 0 }; f.to = t; f.n++; out.set(key, f);
      }
    }
    return [...out.entries()].map(([k, f]) => ({ k, from: +f.from.toFixed(2), to: +f.to.toFixed(2), n: f.n }));
  });
  console.log(`${fmt}: ${leaks.length} element(s) drawn while their scene is hidden`);
  leaks.slice(0, 40).forEach((l) => console.log(`  ${l.k}   ${l.from}–${l.to}s`));
  if (leaks.length > 40) console.log(`  … +${leaks.length - 40} more`);
  await b.close();
})();
