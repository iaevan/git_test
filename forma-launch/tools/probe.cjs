const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const [fmt, t, sel] = process.argv.slice(2);
  const W = fmt === 'reel' ? 1080 : 1920, H = fmt === 'reel' ? 1920 : 1080;
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
  p.on('console', m => console.log('[page]', m.type(), m.text()));
  p.on('pageerror', e => console.log('[pageerror]', e.message));
  await p.goto('file://' + path.resolve(__dirname, '../src/index.html') + '?fmt=' + fmt);
  await p.waitForFunction('window.__ready === true');
  await p.evaluate(t => window.__seek(+t), t);
  console.log(JSON.stringify(await p.evaluate(sel => [...document.querySelectorAll(sel)].map(e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return { cls: e.className, op: cs.opacity, vis: cs.visibility, tr: cs.transform.slice(0, 60), rect: [r.left | 0, r.top | 0, r.width | 0, r.height | 0] } }), sel), null, 1));
  await b.close();
})();
