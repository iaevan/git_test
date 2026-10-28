/* ACT 2 — the product in motion (0:08 – 0:25): drop → pick on the wheel → convert → "97% smaller" → download */
(function () {
  const app = APP, K = app.K, AL = app.AL, cam = S5SCENE.cam;
  const wheel = app.wheel;
  const BLUE_ = '#3448ed';
  const toStage = (dx, dy) => ({ x: dx * K, y: dy * K });          // design → stage px (camera at rest)
  const hueOf = (f) => { const m = /--format-hue:\s*(\d+)/.exec(FORMAT_ART[f]); return m ? +m[1] : 150; };
  const glowOf = (f) => f === 'webp' ? '#c5e5d0' : f === 'jpeg' ? '#f8d6bd' : f === 'png' ? '#ddd3f4' : 'hsl(' + hueOf(f) + ' 70% 85%)';

  /* ── camera on the app root: focus a design point at a stage point ── */
  function focus(at, dur, z, pd, ts, ease) {
    tl.to(app.root, { scale: K * z, x: ts.x - pd.x * K * z, y: ts.y - pd.y * K * z, duration: dur, ease: ease || 'forma' }, at);
  }

  /* ── 8.5 · build-in ───────────────────────────────────── */
  blurIn(app.kicker[0], 8.6, { y: 14, b: 10, dur: .6 });
  blurIn(app.l1[0], 8.58, { dur: .8 });
  blurIn(app.l2[0], 8.72, { dur: .8 });
  blurIn(app.desc[0], 8.9, { dur: .7, y: 18 });
  blurIn(app.pills, 9.0, { dur: .7, y: 18 });
  popIn(app.src, 8.85, { from: .82, dur: .7, ease: 'back.out(1.8)' });
  blurIn(app.capEmpty, 9.05, { dur: .6, y: 14 });
  blurIn(app.conn, 9.15, { dur: .6, y: 0 });
  blurIn(app.nav, 9.35, { dur: .6, y: 10 });
  blurIn(app.example, 9.4, { dur: .6, y: 12 });
  blurIn(app.subEmpty, 9.5, { dur: .6, y: 12 });
  blurIn(app.foot, 9.5, { dur: .6, y: 8 });
  tl.to(app.glow, { opacity: .55, duration: 1.2, ease: 'power2.out' }, 9.0);
  app.glow.style.setProperty('--glow', glowOf('webp'));

  gsap.set(wheel.el, { opacity: 0 });
  const wp = { p: 4.4 };
  const spin = () => wheel.setPos(wp.p);
  tl.fromTo(wheel.el, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: .9, ease: 'forma', immediateRender: false }, 8.9);
  tl.fromTo(wp, { p: 4.4 }, { p: 2, duration: 1.0, ease: 'forma', onUpdate: spin, immediateRender: false }, 8.9);

  /* ── 9.5 · drag a file in ─────────────────────────────── */
  const chip = mk('div', 'paper', app.root);
  chip.innerHTML = '<span class="paper-fold"></span><img class="pic" src="assets/landscape.svg" style="position:absolute;width:calc(100% - 24px);aspect-ratio:4/3;object-fit:cover;top:34px;left:12px;margin:0;max-width:none">' +
    '<span class="ext">PNG</span><span class="plus"><span class="pl-up" style="display:grid;place-items:center">' + icon('upload', 16, 2.2) + '</span></span>';
  const startD = R ? { x: 520, y: 740 } : { x: 1500, y: 700 };
  const hoverD = { x: AL.src.x + 4, y: AL.src.y - 10 };
  chip.style.left = '0'; chip.style.top = '0';
  gsap.set(chip, { x: startD.x, y: startD.y, xPercent: -50, yPercent: -50, scale: .5, rotation: 9, opacity: 0, zIndex: 20 });
  const CUROFF = { x: 36, y: 40 };                                // cursor grips the chip's lower-right
  const cs = (d, sc) => ({ x: d.x * K + CUROFF.x, y: d.y * K + CUROFF.y });
  cursor.show(9.5, cs(startD).x, cs(startD).y);
  tl.fromTo(chip, { opacity: 0 }, { opacity: 1, duration: .25, ease: 'power2.out', immediateRender: false }, 9.52);
  tl.to(chip, { x: hoverD.x, duration: 1.15, ease: 'power3.inOut' }, 9.6);
  tl.to(chip, { y: hoverD.y, duration: 1.15, ease: 'power2.out' }, 9.6);
  tl.to(chip, { rotation: -3, scale: .72, duration: 1.15, ease: 'power2.out' }, 9.6);
  cursor.move(9.6, cs(hoverD).x, cs(hoverD).y, 1.15);
  // dropzone wakes up as the file nears
  tl.to(app.src, { scale: 1.05, borderColor: BLUE_, boxShadow: '0 0 0 6px #3448ed1f, 0 28px 40px -16px #3448ed44, inset 0 1px #fff', duration: .35, ease: 'forma' }, 10.45);
  tl.to(app.capEmpty, { opacity: 1, duration: .1 }, 10.45);
  // drop
  cursor.click(11.0, cs(hoverD).x, cs(hoverD).y);
  tl.to(chip, { scale: 1.02, opacity: 0, duration: .3, ease: 'power2.in' }, 11.0);
  tl.to(app.src, { scale: 1, borderColor: '#e8eaf0', boxShadow: '0 22px 34px -16px #58658b29, 0 4px 9px -4px #5968871a, inset 0 1px #fff', duration: .6, ease: 'back.out(2.4)' }, 11.0);
  tl.to(app.srcEmpty, { opacity: 0, scale: .85, duration: .25, ease: 'power2.in' }, 11.0);
  tl.fromTo(app.srcPic, { opacity: 0, scale: .9 }, { opacity: 1, scale: 1, duration: .6, ease: 'forma', immediateRender: false }, 11.08);
  tl.fromTo(app.srcExt, { opacity: 0 }, { opacity: 1, duration: .4, immediateRender: false }, 11.2);
  tl.to(app.plusIcon, { opacity: 0, rotation: 90, duration: .25 }, 11.05);
  tl.fromTo(app.upIcon, { opacity: 0, rotation: -90 }, { opacity: 1, rotation: 0, duration: .35, ease: 'back.out(2)', immediateRender: false }, 11.15);
  swap(app.capEmpty, app.capFile, 11.0, { dur: .25 });
  swap(app.l1[0], app.l1[1], 11.1, { stagger: 0 });
  swap(app.example, app.cta, 11.3, { yo: 0, yi: 14 });
  swap(app.subEmpty, app.sub, 11.3, { yo: 0, yi: 10 });
  // the wheel "lights up" — a soft pulse across the cards
  tl.fromTo(wheel.el, { filter: 'brightness(1)' }, { filter: 'brightness(1.05) saturate(1.25)', duration: .3, yoyo: true, repeat: 1, ease: 'power2.out', immediateRender: false }, 11.15);
  tl.fromTo(app.glow, { scale: .9 }, { scale: 1.12, duration: .7, ease: 'forma', immediateRender: false }, 11.1);

  // cursor heads to the wheel
  const wheelD = { x: AL.wheel.x + 10, y: AL.wheel.y + 30 };
  cursor.move(11.7, wheelD.x * K, wheelD.y * K, .9);

  /* ── 12.0 · step 02 — give it a direction (camera pushes into the wheel) ───── */
  swap(app.kicker[0], app.kicker[1], 11.95, { yo: -10, yi: 12 });
  const FZ = V(1.04, 1.12);
  const FT = V({ x: 560, y: 1020 }, { x: 960, y: 640 });
  focus(12.0, 1.0, FZ, V({ x: 240, y: 480 }, { x: 640, y: 436 }), FT, 'quint');

  // the spin: stops on the 8th-note grid, each a flick that settles
  const hasCopy = { 3: 1, 5: 2, 6: 3, 7: 4, 8: 5, 10: 6, 2: 0 };
  const hexOf = { 2: 'webp', 3: 'avif', 5: 'gif', 6: 'bmp', 7: 'tiff', 8: 'ico', 10: 'pdf' };
  let curCopy = 0, lastTick = -1;
  function setCopy(idx, at) {
    if (hasCopy[idx] === undefined) return;
    const n = hasCopy[idx];
    if (n === curCopy) return;
    swap([app.l2[curCopy], app.desc[curCopy]], [app.l2[n], app.desc[n]], at, { dur: .2, dur2: .45, delay: .17, yo: -14, yi: 18 });
    const f = hexOf[idx];
    tl.to(app.glow, { '--glow': glowOf(f), duration: .35 }, at);
    curCopy = n;
  }
  function flick(t0, d, a, b, easeName, o) {
    o = o || {};
    const E = gsap.parseEase(easeName);
    tl.fromTo(wp, { p: a }, { p: b, duration: d, ease: easeName, onUpdate: spin, immediateRender: false }, t0);
    const dir = Math.sign(b - a);
    for (let k = a + dir; dir > 0 ? k <= b : k >= b; k += dir) {
      let lo = 0, hi = 1;
      for (let i = 0; i < 36; i++) { const mid = (lo + hi) / 2; const p = a + (b - a) * E(mid); if ((dir > 0 && p < k) || (dir < 0 && p > k)) lo = mid; else hi = mid; }
      const tc = t0 + d * hi;
      if (tc - lastTick >= .09) { sfx(tc, 'tick', { g: o.g || 1.15 }); lastTick = tc; }   // the app's tick, thinned out so it stays a soft texture
    }
    return t0 + d;
  }
  // 13.0 → each stop: flick (.3s) then hold. AVIF, GIF, BMP, TIFF, ICO, PDF
  const stops = [[13.2, 3], [13.7, 5], [14.2, 6], [14.7, 7], [15.2, 8], [15.95, 10]];
  let prev = 2;
  stops.forEach(([t0, to]) => {
    flick(t0, .32, prev, to, 'quint');
    setCopy(to, t0 + .1);
    // a tiny scroll nudge on the cursor
    tl.fromTo(cursor.el, { rotation: 0 }, { rotation: -4, duration: .14, yoyo: true, repeat: 1, ease: 'power2.out', immediateRender: false }, t0);
    prev = to;
  });
  // the flurry back to WebP — decelerating riffle
  flick(16.7, 1.3, 10, 2, 'power3.out', { g: 1.05 });
  setCopy(2, 17.55);
  // landing: the selected WebP card settles with a lock
  const webp = wheel.cards[2];
  tl.fromTo(webp, { scale: 1.07 }, { scale: 1, duration: .5, ease: 'back.out(3)', immediateRender: false }, 17.95);
  // (wheel.setPos sets scale each update; tween above runs after final update so it wins at the end)

  // slow living camera while the wheel spins
  tl.to(app.rig, { rotation: V(-1, -1.2), duration: 5.5, ease: 'sine.inOut' }, 12.4);
  tl.to(app.rig, { rotation: 0, duration: .8, ease: 'forma' }, 18.2);

  /* ── 18.2 · step 03 — and it's yours to go ───────────── */
  tl.to(app.root, { x: 0, y: 0, scale: K, duration: .9, ease: 'forma' }, 18.2);
  swap(app.kicker[1], app.kicker[2], 18.35, { yo: -10, yi: 12 });

  const ctaD = { x: AL.cta.x, y: AL.cta.y };
  cursor.move(18.6, ctaD.x * K + 18, ctaD.y * K + 8, .75);
  tl.to(cursor.el, { rotation: 0, duration: .1 }, 18.6);
  // click convert
  const pressT = 19.4;
  cursor.click(pressT, ctaD.x * K + 18, ctaD.y * K + 8);
  tl.to(app.ctaBtn, { scale: .95, duration: .08, ease: 'power2.out' }, pressT);
  tl.to(app.ctaBtn, { scale: 1, duration: .4, ease: 'back.out(3)' }, pressT + .08);
  // → "Converting…"
  swap(app.lb[0], app.lb[1], pressT + .05, { yo: 0, yi: 0, dur: .15, dur2: .2, delay: .05, stagger: 0 });
  swap(app.ir.arrow, app.ir.spin, pressT + .05, { yo: 0, yi: 0, dur: .12, dur2: .15, delay: .03, stagger: 0 });
  tl.fromTo(app.ir.spin, { rotation: 0 }, { rotation: 720, duration: .7, ease: 'none', immediateRender: false }, pressT + .1);

  /* ── 20.1 · result ───────────────────────────────────── */
  const rT = 20.05;
  swap([app.l1[1], app.l2[0], app.desc[0]], app.ready, rT, { dur: .25, dur2: .6, delay: .12, yo: -12, yi: 20 });
  blurOut(app.pills, rT, { dur: .3, y: -10 });
  swap(app.cArrow, app.cCheck, rT, { yo: 0, yi: 0, dur: .2, dur2: .35 });
  swap(app.lb[1], app.lb[2], rT + .1, { yo: 0, yi: 0, dur: .15, dur2: .25, delay: .05, stagger: 0 });
  swap(app.ir.spin, [], rT + .1, { yo: 0, yi: 0, dur: .15 });
  tl.to(app.ilWrap, { width: 18, duration: .3, ease: 'forma' }, rT + .1);
  tl.fromTo(app.il, { opacity: 0, scale: .4 }, { opacity: 1, scale: 1, duration: .35, ease: 'back.out(3)', immediateRender: false }, rT + .15);
  blurIn(app.res, rT + .35, { dur: .7, y: 16 });
  blurIn(app.post, rT + .6, { dur: .6, y: 10 });
  blurOut(app.sub, rT, { dur: .25, y: 0 });
  // bar shrinks from full to 3% while the numbers settle
  const BEFORE = 765.1, NOW = 23.2;
  const cnt = { v: 0 };
  tl.fromTo(app.resBar, { scaleX: 1 }, { scaleX: NOW / BEFORE, duration: 1.0, ease: 'power3.inOut', immediateRender: false }, rT + .7);
  tl.fromTo(cnt, { v: 0 }, {
    v: 1, duration: 1.0, ease: 'power3.inOut', immediateRender: false,
    onUpdate: () => {
      app.resNow.textContent = (BEFORE + (NOW - BEFORE) * cnt.v).toFixed(1) + ' KiB';
      app.resPct.textContent = (97.0 * cnt.v).toFixed(1) + '% smaller';
    },
  }, rT + .7);

  /* ── 21.1 · the payoff: "97% smaller" ─────────────────── */
  const veil = mk('div', 'fill', cam, { background: 'rgba(255,255,255,.93)', opacity: 0 });
  const bigSize = V(340, 290);
  const big = T(cam, ['97%'], { size: bigSize, weight: 700, color: BLUE_, ls: '-.06em' });
  const small = T(cam, ['smaller.'], { size: V(116, 100), weight: 600 });
  const note = T(cam, ['765.1 KiB  →  23.2 KiB'], { size: V(46, 36), cls: 'soft', weight: 500 });
  place(big.el, W / 2, V(860, 450)); place(small.el, W / 2, V(1080, 650)); place(note.el, W / 2, V(1200, 760));
  gsap.set(big.el, { opacity: 0 });
  tl.fromTo(veil, { opacity: 0 }, { opacity: 1, duration: .35, ease: 'power2.out', immediateRender: false }, 21.1);
  tl.fromTo(big.el, { opacity: 0, scale: .6, y: 60 }, { opacity: 1, scale: 1, y: 0, duration: .8, ease: 'back.out(1.6)', immediateRender: false }, 21.25);
  const pc = { v: 0 };
  big.words[0].textContent = '0%';
  tl.fromTo(pc, { v: 0 }, { v: 97, duration: .95, ease: 'power3.out', immediateRender: false, onUpdate: () => { big.words[0].textContent = Math.round(pc.v) + '%'; } }, 21.3);
  blurIn(small.words, 22.1, { dur: .7, b: 14 });
  blurIn(note.words, 22.3, { dur: .5, y: 16, b: 10, stagger: .03 });   // done by 22.98, exit starts 23.0
  blurOut([big.el].concat(small.words, note.words), 23.0, { dur: .4, y: -30 });
  tl.to(veil, { opacity: 0, duration: .4, ease: 'power2.in' }, 23.05);

  /* ── 23.1 · download ─────────────────────────────────── */
  const dlD = { x: AL.cta.x, y: AL.cta.y };
  cursor.move(23.2, dlD.x * K + 12, dlD.y * K + 10, .6);
  cursor.click(23.95, dlD.x * K + 12, dlD.y * K + 10);
  tl.to(app.ctaBtn, { scale: .95, duration: .08, ease: 'power2.out' }, 23.95);
  tl.to(app.ctaBtn, { scale: 1, duration: .4, ease: 'back.out(3)' }, 24.03);
  swap(app.lb[2], app.lb[3], 24.0, { yo: 0, yi: 0, dur: .15, dur2: .25, delay: .05, stagger: 0 });
  swap(app.il, app.ir.check, 24.0, { yo: 0, yi: 0, dur: .15, dur2: .25, delay: .05, stagger: 0 });
  // the finished file leaves the button and drops off-screen
  const dl = mk('div', 'chip', cam);
  dl.style.padding = '12px 22px 12px 12px';
  dl.innerHTML = '<span class="ic" style="background:#e5f0e8;color:#2f6b4f;width:44px;height:44px">' + icon('fileImage', 22, 1.8) + '</span><div><strong style="font-size:20px">somewhere-nice.webp</strong><small style="font-size:16px">23.2 KiB</small></div>';
  const dc = { x: dlD.x * K, y: dlD.y * K };
  place(dl, dc.x, dc.y, { scale: V(1.45, 1.1), opacity: 0 });
  tl.fromTo(dl, { opacity: 0, y: 0, scale: .5 }, { opacity: 1, y: -90, scale: V(1.45, 1.1), duration: .35, ease: 'back.out(2)', immediateRender: false }, 24.05);
  tl.to(dl, { y: H + 200 - dc.y, rotation: 6, duration: .7, ease: 'power3.in' }, 24.45);
  tl.to(dl, { opacity: 0, duration: .15 }, 25.0);
  blurWin(24.45, 25.15, 8, .9);
  window.DL_BTN_AT = dc;
})();
