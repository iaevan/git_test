// Visibility event log: when does every visible element (text, cards, buttons, images) appear / disappear?
//   node tools/vislog.cjs <reel|land> [step=0.1]
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const fmt = process.argv[2] || 'reel', step = +(process.argv[3] || .1);
  const W = fmt === 'reel' ? 1080 : 1920, H = fmt === 'reel' ? 1920 : 1080;
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
  await p.goto('file://' + path.resolve(__dirname, '../src/index.html') + '?fmt=' + fmt + (process.env.INTRO ? '&intro=' + process.env.INTRO : ''));
  await p.waitForFunction('window.__ready === true');
  const log = await p.evaluate((step) => {
    const sel = '.wi, .a-step, .a-pair, .a-desc, .a-sub, .a-link, .a-post, .a-foot, .res, .cap, .fcard, .paper, .sculpt, .toast, .row-pill, .chip, .btn, .sheet, .price, .gtile, .ftile, .wandtile, .urlpill, .logo, .sel, .token, .pill, .conn, .browse, img, #cursor, .ripple, #flash';
    const els = [...document.querySelectorAll(sel)];
    const vis = (el) => {
      let op = 1;
      if (getComputedStyle(el).visibility === 'hidden') return 0;
      for (let e = el; e && e !== document.body; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === 'none') return 0; op *= parseFloat(cs.opacity); }
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2 || r.right <= 0 || r.bottom <= 0 || r.left >= innerWidth || r.top >= innerHeight) return 0;
      return op;
    };
    const name = (el) => {
      const sc = el.closest('.scene'); let s = sc ? sc.dataset.name : 'stage';
      let t = (el.querySelector && el.matches('.fcard') ? el.dataset.f : (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 26));
      return s + ' · ' + (el.id ? '#' + el.id : String(el.className).trim().split(/\s+/)[0]) + (t ? ' "' + t + '"' : '');
    };
    const prev = new Map(); const events = [];
    for (let t = 0; t <= window.DURATION + 1e-6; t += step) {
      window.__seek(t);
      for (const el of els) {
        const v = vis(el) > .12; const was = prev.get(el) || false;
        if (v !== was) { events.push([+t.toFixed(2), v ? '+' : '-', name(el)]); prev.set(el, v); }
      }
    }
    return events;
  }, step);
  console.log(log.map((e) => `${String(e[0]).padStart(6)}s ${e[1]} ${e[2]}`).join('\n'));
  await b.close();
})();
