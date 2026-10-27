/* ACT 3a — privacy (dark) and the format wall (0:24 – 0:34) */
const CLIPC = (r, x, y) => 'circle(' + r + 'px at ' + x + 'px ' + y + 'px)';
const WHIP = .55;
/** slide a whole scene (incl. its background) in/out along an axis */
window.whipOut = function (s, at, axis, dir) {
  tl.to(s.el, axis === 'x' ? { x: dir * W * 1.06, duration: WHIP, ease: 'io' } : { y: dir * H * 1.06, duration: WHIP, ease: 'io' }, at);
  blurWin(at, at + WHIP + .05, 10, 1);
};
window.whipIn = function (s, at, axis, dir) {
  gsap.set(s.el, axis === 'x' ? { x: dir * W * 1.06 } : { y: dir * H * 1.06 });
  tl.to(s.el, axis === 'x' ? { x: 0, duration: WHIP, ease: 'io' } : { y: 0, duration: WHIP, ease: 'io' }, at);
};
window.sparkleAt = function (parent, x, y, at, size, color) {
  const d = mk('div', '', parent, { position: 'absolute', left: x + 'px', top: y + 'px', width: size + 'px', height: size + 'px', pointerEvents: 'none' });
  d.innerHTML = '<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M12 1 14.2 9.8 23 12 14.2 14.2 12 23 9.8 14.2 1 12 9.8 9.8Z" fill="' + (color || '#fff') + '"/></svg>';
  gsap.set(d, { xPercent: -50, yPercent: -50, opacity: 0, scale: 0, rotation: -20 });
  tl.to(d, { opacity: 1, scale: 1, rotation: 0, duration: .35, ease: 'back.out(2.4)' }, at);
  tl.to(d, { opacity: 0, scale: .2, rotation: 25, duration: .5, ease: 'power2.in' }, at + .55);
  return d;
};
window.rng = (seed) => { let a = seed >>> 0; return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; }; };

/* ── S8 · Privacy ─────────────────────────────────────────── */
let PRIV;
(function () {
  const D = window.DL_BTN_AT;
  cursor.hide(24.55);
  const s = PRIV = scene('privacy', 24.7, 31.0,
    'radial-gradient(70% 46% at 50% 34%, #28337f 0%, rgba(40,51,127,0) 70%), radial-gradient(60% 40% at 50% 100%, #1a2050 0%, rgba(26,32,80,0) 70%), #0a0e1c');
  gsap.set(s.el, { clipPath: CLIPC(0, D.x, D.y) });
  tl.fromTo(s.el, { clipPath: CLIPC(0, D.x, D.y) }, { clipPath: CLIPC(2600, D.x, D.y), duration: .66, ease: 'power3.in', immediateRender: false }, 24.74);
  sfx(24.74, 'whoosh', { d: .66, dir: 1, g: .55 });
  sfx(25.4, 'boom', { g: .85 });
  flash(25.4, .18, .4);

  const TX = V(540, 520), TY = V(640, 540);
  // radar rings pulsing on the beat
  for (let i = 0; i < 5; i++) {
    const ring = mk('div', 'ring', s.cam, { width: '300px', height: '300px' });
    place(ring, TX, TY, { opacity: 0 });
    const t = 25.5 + i * 1.0;
    tl.fromTo(ring, { scale: .55, opacity: .85 }, { scale: V(3.5, 3.1), opacity: 0, duration: 1.9, ease: 'expo.out', immediateRender: false }, t);
    sfx(t, 'ring', { g: .22 });
  }
  // the fingerprint tile + two orbiting tiles
  const core = mk('div', 'gtile core', s.cam); core.innerHTML = icon('fingerprint', 128, 1.15);
  place(core, TX, TY, { rotation: -8, opacity: 0 });
  popIn(core, 25.45, { from: .45, rot0: -28, rot1: -8, dur: 1.0, ease: 'back.out(1.8)' });
  tl.to(core, { y: -14, duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: 3 }, 26.5);
  const lock = mk('div', 'gtile', s.cam); lock.innerHTML = icon('lock', 52, 1.5);
  const file = mk('div', 'gtile', s.cam); file.innerHTML = icon('fileImage', 52, 1.5);
  place(lock, TX - V(310, 290), TY - V(220, 200), { rotation: -10, opacity: 0 });
  place(file, TX + V(310, 290), TY + V(230, 210), { rotation: 9, opacity: 0 });
  popIn(lock, 25.75, { from: .3, rot0: -40, rot1: -10, dur: .8 });
  popIn(file, 25.9, { from: .3, rot0: 40, rot1: 9, dur: .8 });
  tl.to(lock, { y: -16, duration: 1.2, ease: 'sine.inOut', yoyo: true, repeat: 3 }, 26.6);
  tl.to(file, { y: 16, duration: 1.3, ease: 'sine.inOut', yoyo: true, repeat: 3 }, 26.6);
  sfx(25.45, 'pop', { n: 'A4', g: .8 }); sfx(25.75, 'pop', { n: 'E5', g: .6 }); sfx(25.9, 'pop', { n: 'A5', g: .6 });

  // headline
  const head = T(s.cam, ['Your files.', 'Your business.'], { size: V(176, 150), cls: 'light' + (R ? '' : ' l') });
  place(head.el, V(540, 1320), V(1330, 470));
  head.words.forEach((w, i) => { if (i >= 2) w.style.color = '#aab3ff'; });
  blurIn(head.words.slice(0, 2), 25.95, { dur: .8, stagger: .1 });
  blurIn(head.words.slice(2), 26.35, { dur: .8, stagger: .1 });
  sfx(25.98, 'pop', { n: 'C#5', g: .5 }); sfx(26.38, 'pop', { n: 'E5', g: .5 });

  // then the three "no"s
  blurOut(head.words, 27.3, { dur: .45, y: -40 });
  const rows = [['cloudOff', 'No uploads.'], ['lock', 'No server copies.'], ['check', 'Nothing to delete.']];
  const sc = V(1.3, 1.0), gap = V(206, 164), y0 = V(1130, 330), x0 = V(540, 1330);
  rows.forEach((r, i) => {
    const el = mk('div', 'row-pill dk', s.cam);
    el.innerHTML = '<span class="ri">' + icon(r[0], 34, 1.8) + '</span><span class="tx">' + r[1] + '</span>';
    place(el, x0, y0 + gap * i, { scale: sc, opacity: 0 });
    const t = 27.5 + i * .42;
    blurIn(el, t, { y: 60, dur: .7, s: sc * .9, to: sc });
    sfx(t + .03, 'lock', { g: .7 }); sfx(t + .05, 'pop', { n: ['E5', 'A5', 'C#6'][i], g: .5 });
  });
  const cap = T(s.cam, ['On your device. In your hands.'], { size: V(50, 42), cls: 'light', weight: 500, color: '#aab3ff' });
  place(cap.el, V(540, 520), V(1700, 860));
  blurIn(cap.words, 28.85, { dur: .7, stagger: .05, y: 20, b: 10 });
  sfx(28.9, 'sparkle', { g: .5 });
  const rs = rng(7);
  for (let i = 0; i < 7; i++) sparkleAt(s.cam, V(150, 160) + rs() * (W - V(300, 320)), V(230, 120) + rs() * V(600, 700), 26.2 + i * .35, 26 + rs() * 22, '#c3cbff');

  whipOut(s, 30.0, 'y', -1);
  sfx(30.0, 'whoosh', { d: .55, dir: 1, g: .7 });
})();

/* ── S9 · "53 formats. One little wheel." ─────────────────── */
let WALL;
(function () {
  const s = WALL = scene('wall', 29.95, 34.3, 'radial-gradient(80% 50% at 50% 0%, #e7eaff 0%, rgba(231,234,255,0) 70%), #f7f8fa');
  whipIn(s, 30.0, 'y', 1);
  const grid = mk('div', 'fill', s.cam);
  const cols = V(5, 10), rows = V(9, 5), sx = V(212, 204), sy = V(258, 252);
  const N = Math.min(53, cols * rows);
  const r = rng(2024);
  const fmts = FORMAT_ORDER.slice();
  for (let i = fmts.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [fmts[i], fmts[j]] = [fmts[j], fmts[i]]; }
  const cx = W / 2, cy = H / 2, maxd = Math.hypot(W / 2, H / 2);
  const cards = [];
  for (let k = 0; k < N; k++) {
    const i = k % cols, j = Math.floor(k / cols);
    const x = cx + (i - (cols - 1) / 2) * sx, y = cy + (j - (rows - 1) / 2) * sy;
    const c = FormatCard(fmts[k], grid);
    const rot = (r() - .5) * 9;
    place(c, x, y, { rotation: rot, opacity: 0 });
    const d = Math.hypot(x - cx, y - cy) / maxd;
    cards.push({ c, d, rot });
  }
  cards.sort((a, b) => a.d - b.d);
  let lastT = -1;
  cards.forEach((o, n) => {
    const t = 30.45 + o.d * .95;
    tl.fromTo(o.c, { opacity: 0, scale: .25, y: 110, rotation: o.rot + (r() - .5) * 50, filter: 'blur(10px)' },
      { opacity: 1, scale: 1, y: 0, rotation: o.rot, filter: 'blur(0px)', duration: .75, ease: 'back.out(1.5)', immediateRender: false }, t);
    if (t + .12 - lastT >= .055) { sfx(t + .12, 'tick', { g: .8 }); lastT = t + .12; }
  });
  // the wall sits on a gently tilted plane (3D depth) and drifts while the cards land
  gsap.set(grid, { transformPerspective: 1700, rotationX: V(18, 14), rotationZ: V(-5, -3), scale: V(1.22, 1.16), transformOrigin: '50% 50%' });
  tl.fromTo(grid, { y: 0, rotationX: V(18, 14), rotationZ: V(-5, -3) }, { y: -60, rotationX: V(10, 8), rotationZ: V(-2.5, -1.5), duration: 3.7, ease: 'sine.inOut', immediateRender: false }, 30.45);

  // the headline lives on a clean white panel
  const panel = mk('div', 'panel', s.cam);
  const tt = T(panel, ['53 formats.', 'One little wheel.'], { size: V(104, 130), cls: 'l' });
  tt.el.style.position = 'relative';
  if (R) panel.style.padding = '40px 56px 46px';
  tt.words.slice(2).forEach((w) => { w.style.color = '#858790'; });
  place(panel, W / 2, H / 2, { opacity: 0 });
  popIn(panel, 31.0, { from: .72, dur: .75, ease: 'back.out(1.7)' });
  const cnt = { v: 0 };
  tt.words[0].textContent = '0';
  tl.fromTo(cnt, { v: 0 }, { v: 53, duration: .9, ease: 'power3.out', immediateRender: false, onUpdate: () => { tt.words[0].textContent = Math.round(cnt.v); } }, 31.1);
  for (let i = 0; i < 9; i++) sfx(31.12 + i * .1, 'count', { g: .5, i: i + 3 });
  sfx(31.05, 'swish', { g: .4, dir: 1 });
  sfx(32.1, 'pop', { n: 'A5', g: .5 });
  punch(32.05, .02);
  tl.to(panel, { y: -10, duration: 1.5, ease: 'sine.inOut' }, 32.2);

  whipOut(s, 33.7, 'x', -1);
  sfx(33.7, 'whoosh', { d: .55, dir: -1, g: .7 });
})();
