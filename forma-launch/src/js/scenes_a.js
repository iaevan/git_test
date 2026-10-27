/* ACT 1 — the problem, then the brand reveal (0:00 – 0:09) */
window.V = (r, l) => (R ? r : l);
window.DUR = 52;
const BLUE = '#3448ed';

// shared light backdrop for the first scenes (so whip-pans never reveal a seam)
const bgL = mk('div', 'fill', world);
bgL.style.background = 'radial-gradient(90% 55% at 50% -8%, #e6e9ff 0%, rgba(230,233,255,0) 70%), radial-gradient(70% 40% at 100% 100%, #fbeee4 0%, rgba(251,238,228,0) 70%), #f7f8fa';
tl.set(bgL, { display: 'none' }, 9.2);

/* ── S1 · "Wrong format." ─────────────────────────────────── */
(function () {
  const s = scene('wrong', 0, 2.4);
  const head = T(s.cam, V(['Wrong', 'format.'], ['Wrong format.']), { size: V(236, 214) });
  place(head.el, W / 2, V(560, 300));
  blurIn(head.words[0], 0, { dur: .95, b: 24, y: 56, s: .9, o0: .55 });
  blurIn(head.words[1], .22, { dur: .95, b: 24, y: 56, s: .9, o0: .4 });
  tl.to(head.words[1], { color: '#e5484d', duration: .25, ease: 'power2.out' }, 1.06);

  const card = Sculpt('png', s.cam);
  const fy = V(1130, 735), fx = V(540, 610);
  place(card, fx, fy, { scale: V(1.85, 1.4), rotation: -5, opacity: 0 });
  tl.fromTo(card, { y: 1100, rotation: -17, opacity: 1 }, { y: 0, rotation: -5, opacity: 1, duration: 1.05, ease: 'forma', immediateRender: false }, .5);
  tl.to(card, { keyframes: { x: [0, -14, 12, -8, 5, 0], rotation: [-5, -6.2, -3.8, -5.6, -4.6, -5] }, duration: .5, ease: 'none' }, 1.1);

  const toast = mk('div', 'toast', s.cam);
  toast.innerHTML = '<span class="ti">' + icon('alert', 22, 2) + '</span><div><b>Can’t upload this file</b><span>Only JPG or WebP files are accepted.</span></div>';
  const tx = V(540, 1330), ty = V(1580, 760);
  place(toast, tx, ty, { scale: V(1.75, 1.6), opacity: 0 });
  tl.fromTo(toast, { opacity: 1, scale: V(1.75, 1.6) * .6, y: 40 }, { scale: V(1.75, 1.6), y: 0, opacity: 1, duration: .55, ease: 'back.out(2.6)', immediateRender: false }, 1.0);
  tl.to(toast, { keyframes: { x: [0, -18, 16, -11, 8, -4, 0] }, duration: .55, ease: 'none' }, 1.12);

  // whip left
  tl.to(s.cam, { x: -W * 1.06, duration: .55, ease: 'io' }, 1.85);
  blurWin(1.85, 2.4, 10, 1);

})();

/* ── S2 · "Upload. Wait. Sign up." (the usual routine) ────── */
(function () {
  const s = scene('routine', 1.8, 4.45);
  gsap.set(s.cam, { x: W * 1.06 });
  tl.to(s.cam, { x: 0, duration: .55, ease: 'io' }, 1.85);

  const kick = T(s.cam, ['Then comes the usual:'], { size: V(62, 56), cls: 'soft', weight: 500 });
  place(kick.el, W / 2, V(560, 215));
  blurIn(kick.words, 2.0, { dur: .7, stagger: .06 });

  const rows = [
    { ic: 'cloudUpload', tx: 'Upload your file.' },
    { ic: 'clock', tx: 'Wait for it…' },
    { ic: 'user', tx: 'Make an account.' },
  ];
  const sc = V(1.6, 1.5), gap = V(250, 205), y0 = V(850, 470);
  rows.forEach((r, i) => {
    const el = mk('div', 'row-pill', s.cam);
    el.innerHTML = '<span class="ri">' + icon(r.ic, 34, 1.8) + '</span><span class="tx">' + r.tx + '</span><i class="strike"></i>';
    place(el, W / 2, y0 + gap * i, { scale: sc, opacity: 0 });
    const st = el.querySelector('.strike');
    gsap.set(st, { scaleX: 0 });
    const t0 = 2.08 + i * .5;
    tl.fromTo(el, { opacity: 0, x: W * .5, filter: 'blur(26px)' }, { opacity: 1, x: 0, filter: 'blur(0px)', duration: .75, ease: 'forma', immediateRender: false }, t0);
    // strike-through, fast, one after another
    const ts = 3.5 + i * .1;
    tl.to(st, { scaleX: 1, duration: .16, ease: 'power3.out' }, ts);
    tl.to(el, { opacity: .5, duration: .2, ease: 'power2.out' }, ts + .05);
  });

  // push up to the next scene
  tl.to(s.cam, { y: -H * 1.06, duration: .55, ease: 'io' }, 3.9);
  blurWin(3.9, 4.45, 10, 1);
})();

/* ── S3 · "There's a better way." → text selection becomes the brand flood ─ */
let FLOOD = { x: W / 2, y: H / 2 };
(function () {
  const s = scene('better', 3.9, 6.15);
  gsap.set(s.cam, { y: H * 1.06 });
  tl.to(s.cam, { y: 0, duration: .55, ease: 'io' }, 3.9);

  const head = T(s.cam, ['There’s an', 'easier way.'], { size: V(184, 200) });
  place(head.el, W / 2, V(900, 520));
  const w = head.words;           // There’s, a, better, way.
  [4.0, 4.25, 4.5, 4.75].forEach((t, i) => {
    blurIn(w[i], t, { dur: .8, b: 22, y: 44 });
  });

  // selection box around "better"
  const r = measure(w[2], 5.2);
  const pad = 16;
  const sel = mk('div', 'sel', s.cam, { left: (r.l - pad) + 'px', top: (r.t - pad * .6) + 'px', width: (r.w + pad * 2) + 'px', height: (r.h + pad * 1.2) + 'px' });
  sel.innerHTML = '<i class="h" style="left:-14px;top:-14px"></i><i class="h" style="right:-14px;bottom:-14px"></i>';
  gsap.set(sel, { opacity: 0 });
  tl.fromTo(sel, { opacity: 0, scaleX: .85, scaleY: .7 }, { opacity: 1, scaleX: 1, scaleY: 1, duration: .4, ease: 'back.out(2)', immediateRender: false }, 5.0);
  tl.to(sel, { backgroundColor: BLUE, duration: .22, ease: 'power2.out' }, 5.5);
  tl.to(w[2], { color: '#fff', duration: .22, ease: 'power2.out' }, 5.5);
  tl.to(sel.querySelectorAll('.h'), { opacity: 0, scale: .4, duration: .2 }, 5.5);
  FLOOD = { x: r.x, y: r.y };
})();

/* ── S4 · logo reveal on brand indigo → iris closes onto the app header ─ */
let APP = null, S5SCENE = null;
(function () {
  // the destination (app header logo) must exist to measure it, so build the app scene first (hidden)
  S5SCENE = scene('app', 8.3, 26.0, '#fff');
  APP = buildApp(S5SCENE.cam);

  const s = scene('reveal', 5.5, 9.1, 'radial-gradient(70% 45% at 50% 28%, #5568ff 0%, rgba(85,104,255,0) 70%), #3448ed');
  world.appendChild(s.el);                      // make sure it stacks above the app scene
  const CLIP = (rad, x, y) => 'circle(' + rad + 'px at ' + x + 'px ' + y + 'px)';
  const MAX = 2500;
  gsap.set(s.el, { clipPath: CLIP(0, FLOOD.x, FLOOD.y) });
  tl.fromTo(s.el, { clipPath: CLIP(0, FLOOD.x, FLOOD.y) }, { clipPath: CLIP(MAX, FLOOD.x, FLOOD.y), duration: .46, ease: 'power3.in', immediateRender: false }, 5.54);

  // shock rings on the hit
  [0, .1].forEach((d, i) => {
    const ring = mk('div', '', s.cam, { position: 'absolute', left: '0', top: '0', width: '360px', height: '360px', borderRadius: '50%', border: (i ? 2 : 3) + 'px solid rgba(255,255,255,.32)' });
    gsap.set(ring, { x: W / 2, y: V(700, 520), xPercent: -50, yPercent: -50, opacity: 0 });
    tl.fromTo(ring, { scale: .25, opacity: .9 }, { scale: 6.5 + i, opacity: 0, duration: 1.5, ease: 'expo.out', immediateRender: false }, 6.0 + d);
  });

  const f = V(196, 214);
  const lg = Logo(s.cam, f, true);
  lg.el.style.position = 'absolute'; lg.el.style.left = '0'; lg.el.style.top = '0';
  const cy0 = V(700, 520);
  gsap.set(lg.el, { x: W / 2, y: cy0, xPercent: -50, yPercent: -50 });
  gsap.set(lg.bars, { scaleY: 0, transformOrigin: '50% 100%' });
  gsap.set(lg.letters, { yPercent: 125 });
  gsap.set(lg.dot, { scale: 0, transformOrigin: '50% 80%' });
  tl.to(lg.bars, { scaleY: 1, duration: .7, ease: 'back.out(2.4)', stagger: .07 }, 5.98);
  tl.fromTo(lg.mark, { rotation: -40 }, { rotation: -10, duration: .9, ease: 'forma', immediateRender: false }, 5.98);
  tl.to(lg.letters, { yPercent: 0, duration: .75, ease: 'forma', stagger: .045 }, 6.16);
  tl.to(lg.dot, { scale: 1, duration: .5, ease: 'back.out(4)' }, 6.55);
  flash(5.98, .18, .35);
  punch(6.0, .02);

  // tagline (mirrors the site's headline)
  const tag = T(s.cam, V(['Convert files.', 'On your', 'own device.'], ['Convert files.', 'On your own device.']), { size: V(158, 150), cls: 'light', ls: '-.055em' });
  place(tag.el, W / 2, V(1110, 700));
  // second sentence reads softer, like the site's grey second line
  tag.words.forEach((wd, i) => { if (i >= 2) wd.style.color = '#bfc7ff'; });
  // lockup lifts + shrinks, tagline arrives
  tl.to(lg.el, { y: V(520, 260), scale: V(.56, .5), duration: .85, ease: 'forma' }, 6.95);
  blurIn(tag.words, 7.2, { stagger: .12, dur: .85, b: 18 });

  // → iris closes onto the header logo location
  const dest = measure(APP.logo.el, 8.9);
  blurOut(tag.words, 8.25, { dur: .4, y: -20 });
  tl.to(lg.el, { x: dest.x, y: dest.y, scale: dest.h / (f * 1.036), duration: .6, ease: 'io' }, 8.3);
  tl.to(s.el, { clipPath: CLIP(0, dest.x, dest.y), duration: .62, ease: 'io' }, 8.4);
  blurWin(8.3, 9.0, 8, .8);
  APP.destLogo = dest;
})();
