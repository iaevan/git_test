// Timeline audit: finds tweens that fight over the same element+property (the cause of "stuck" leftovers).
//   node tools/audit.cjs <reel|land>
// A conflict is two tweens on one element animating one property whose time ranges overlap — in particular
// when the earlier-created tween finishes LAST, so it re-asserts its end value after the later one has finished.
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const fmt = process.argv[2] || 'reel';
  const W = fmt === 'reel' ? 1080 : 1920, H = fmt === 'reel' ? 1920 : 1080;
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
  p.on('pageerror', e => console.log('[pageerror]', e.message));
  await p.goto('file://' + path.resolve(__dirname, '../src/index.html') + '?fmt=' + fmt);
  await p.waitForFunction('window.__ready === true');
  const res = await p.evaluate(() => {
    const PROPS = ['opacity', 'autoAlpha', 'visibility', 'scale', 'scaleX', 'scaleY', 'x', 'y', 'rotation', 'filter', 'clipPath', 'color', 'backgroundColor', 'height', 'width'];
    const describe = (el) => {
      if (!(el instanceof Element)) return String(el);
      let s = el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : '');
      const txt = (el.textContent || '').trim().slice(0, 22); if (txt) s += ' "' + txt + '"';
      const sc = el.closest('.scene'); if (sc) s = '[' + sc.dataset.name + '] ' + s;
      return s;
    };
    const leaves = [];
    const walk = (tw, off) => {
      const start = off + tw.startTime();
      if (tw.getChildren) { tw.getChildren(false, true, true).forEach((c) => walk(c, start)); }
      else {
        const v = tw.vars || {};
        const keys = Object.keys(v).filter((k) => PROPS.includes(k));
        const kf = v.keyframes ? Object.keys(v.keyframes).filter((k) => PROPS.includes(k)) : [];
        const props = keys.concat(kf);
        if (!props.length) return;
        const dur = tw.duration() / (tw.timeScale ? tw.timeScale() : 1);
        (tw.targets() || []).forEach((t) => { if (t instanceof Element) leaves.push({ el: t, props, start, end: start + tw.duration(), id: leaves.length }); });
      }
    };
    tl.getChildren(false, true, true).forEach((c) => walk(c, 0));
    const byEl = new Map();
    leaves.forEach((l) => { if (!byEl.has(l.el)) byEl.set(l.el, []); byEl.get(l.el).push(l); });
    const out = [];
    byEl.forEach((arr, el) => {
      arr.sort((a, b) => a.start - b.start || a.id - b.id);
      for (let i = 0; i < arr.length; i++) for (let j = i + 1; j < arr.length; j++) {
        const A = arr[i], B = arr[j];
        if (B.start >= A.end - 1e-6) break;                  // no overlap (sorted by start)
        const shared = A.props.filter((p) => B.props.includes(p) || (p === 'opacity' && B.props.includes('autoAlpha')) || (p === 'autoAlpha' && B.props.includes('opacity')));
        if (!shared.length) continue;
        out.push({ el: describe(el), props: shared.join(','), A: [+A.start.toFixed(3), +A.end.toFixed(3)], B: [+B.start.toFixed(3), +B.end.toFixed(3)], aCreatedFirst: A.id < B.id, harmful: (A.end > B.end + 1e-6 && A.id < B.id) || (B.end > A.end + 1e-6 && B.id < A.id) });
      }
    });
    return out;
  });
  const harmful = res.filter((r) => r.harmful);
  console.log(`${fmt}: ${res.length} overlapping tween pairs, ${harmful.length} where the earlier-created tween finishes last (stuck-state risk)`);
  const show = process.argv.includes('--all') ? res : harmful;
  show.forEach((r) => console.log(` ${r.harmful ? '!!' : '  '} ${r.el}\n      ${r.props}   A ${r.A[0]}→${r.A[1]}   B ${r.B[0]}→${r.B[1]}`));
  await b.close();
})();
