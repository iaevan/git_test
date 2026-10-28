// Behavioural audit: steps through the film like the renderer does and reports elements that have an
// EXIT animation (opacity → 0) yet are still visible afterwards (while their scene is still on screen).
//   node tools/stuck.cjs <reel|land>
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const fmt = process.argv[2] || 'reel';
  const W = fmt === 'reel' ? 1080 : 1920, H = fmt === 'reel' ? 1920 : 1080;
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
  await p.goto('file://' + path.resolve(__dirname, '../src/index.html') + '?fmt=' + fmt + (process.env.INTRO ? '&intro=' + process.env.INTRO : ''));
  await p.waitForFunction('window.__ready === true');
  const report = await p.evaluate(() => {
    // 1) elements with an exit tween, and when that exit last completes
    const exits = new Map();
    const walk = (tw, off) => {
      const start = off + tw.startTime();
      if (tw.getChildren) { tw.getChildren(false, true, true).forEach((c) => walk(c, start)); return; }
      const v = tw.vars || {};
      const toZero = v.opacity === 0 || v.autoAlpha === 0;
      if (!toZero) return;
      (tw.targets() || []).forEach((t) => { if (t instanceof Element) exits.set(t, Math.max(exits.get(t) || 0, start + tw.duration())); });
    };
    tl.getChildren(false, true, true).forEach((c) => walk(c, 0));
    // an element may legitimately re-enter later (swap back to a previous copy): find the LAST opacity tween that ends > 0
    const entries = new Map();
    const walk2 = (tw, off) => {
      const start = off + tw.startTime();
      if (tw.getChildren) { tw.getChildren(false, true, true).forEach((c) => walk2(c, start)); return; }
      const v = tw.vars || {};
      if (v.opacity === undefined && v.autoAlpha === undefined) return;
      const toVal = v.autoAlpha !== undefined ? v.autoAlpha : v.opacity;
      (tw.targets() || []).forEach((t) => { if (!(t instanceof Element)) return; const a = entries.get(t) || []; a.push({ start, end: start + tw.duration(), val: toVal }); entries.set(t, a); });
    };
    tl.getChildren(false, true, true).forEach((c) => walk2(c, 0));
    const vis = (el) => {
      if (getComputedStyle(el).visibility === 'hidden') return false;
      for (let e = el; e && e !== document.body; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === 'none' || parseFloat(cs.opacity) < .02) return false; }
      const r = el.getBoundingClientRect(); return r.width > 1 && r.height > 1 && r.right > 0 && r.bottom > 0 && r.left < innerWidth && r.top < innerHeight;
    };
    const desc = (el) => { const sc = el.closest('.scene'); return (sc ? '[' + sc.dataset.name + '] ' : '') + el.tagName.toLowerCase() + '.' + String(el.className).trim().split(/\s+/).join('.') + ' "' + (el.textContent || '').trim().slice(0, 24) + '"'; };
    const flagged = new Map();
    const T = window.DURATION;
    const tracked = [...exits.keys()];
    for (let t = 0; t <= T; t += 1 / 30) {
      window.__seek(t);
      for (const el of tracked) {
        const ev = entries.get(el) || [];
        // the INTENDED final action is the tween that starts last; if that is an exit, nothing may re-show the element afterwards
        const intent = ev.reduce((m, e) => (e.start > m.start ? e : m), { start: -1, val: 1 });
        if (intent.val !== 0) continue;
        const allDone = ev.reduce((m, e) => Math.max(m, e.end), 0);
        if (t > allDone + .05 && vis(el)) { const f = flagged.get(el) || { first: t, last: t, n: 0 }; f.last = t; f.n++; flagged.set(el, f); }
      }
    }
    // 2) premature visibility: an element whose FIRST opacity tween is an entrance must be invisible just before it
    const early = [];
    for (const [el, ev] of entries) {
      const first = ev.reduce((m, e) => (e.start < m.start ? e : m), { start: 1e9, val: 0 });
      if (first.val === 0 || first.start < .06) continue;
      window.__seek(first.start - .04);
      if (vis(el)) early.push({ el: desc(el), entersAt: +first.start.toFixed(2) });
    }
    window.__early = early;
    return [...flagged.entries()].map(([el, f]) => ({ el: desc(el), exitEnds: +exits.get(el).toFixed(2), visibleFrom: +f.first.toFixed(2), visibleTo: +f.last.toFixed(2), frames: f.n }));
  });
  const early = await p.evaluate('window.__early');
  console.log(`${fmt}: ${early.length} element(s) visible BEFORE their entrance`);
  early.forEach((r) => console.log(`  ${r.el}   (enters at ${r.entersAt}s)`));
  console.log(`${fmt}: ${report.length} element(s) still visible after their exit animation`);
  report.forEach((r) => console.log(`  ${r.el}\n     exit ends ${r.exitEnds}s · still visible ${r.visibleFrom}–${r.visibleTo}s (${r.frames} samples)`));
  await b.close();
})();
