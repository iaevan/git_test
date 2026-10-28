/* ACT 3b — control, free, call to action, end card (0:33 – 0:54) */

/* ── S10 · "A little more control." ───────────────────────── */
let CONTROL;
(function () {
  const s = CONTROL = scene('control', 33.65, 37.95,
    'radial-gradient(80% 50% at 85% 0%, #dde1ff 0%, rgba(221,225,255,0) 70%), radial-gradient(60% 40% at 0% 100%, #f4e7ff 0%, rgba(244,231,255,0) 70%), #eeeff9');
  whipIn(s, 33.7, 'x', 1);

  const head = T(s.cam, ['A little more', 'control.'], { size: V(150, 140), cls: R ? '' : 'l' });
  place(head.el, V(540, 520), V(330, 430));
  head.words.slice(3).forEach((w) => { w.style.color = '#858790'; });
  blurIn(head.words.slice(0, 3), 33.95, { dur: .8, stagger: .1 });
  blurIn(head.words.slice(3), 34.2, { dur: .8 });
  const sub = T(s.cam, ['Just the adjustments', 'you choose.'], { size: V(64, 50), cls: 'soft', weight: 450 });
  place(sub.el, V(540, 520), V(580, 650));
  if (R) sub.el.style.display = 'none';      // the sheet repeats this line; keep the reel clean
  else blurIn(sub.words, 34.5, { dur: .7, stagger: .05, y: 18, b: 10 });

  // the details sheet (remade from the real app)
  const SX = V(540, 1340), SY = V(1135, 540), SS = V(1.8, 1.5);
  const sheet = mk('div', 'sheet', s.cam);
  sheet.innerHTML =
    '<div class="kick">A little more control</div><h3>In the details.</h3><div class="sub">Just the adjustments you choose.</div>' +
    '<div class="opts">' +
    '<div class="opt"><div><b>Resize image</b><small>A smaller size, with the same proportions.</small></div><div class="tg"><i></i></div></div>' +
    '<div class="field f1"><div class="fl">Width</div><div class="fi"><span class="v1">1200</span><span style="color:#9aa0ad;font-size:12px">▲▼</span></div><div class="fh">Original: 1200 × 900 pixels</div></div>' +
    '<div class="opt"><div><b>Adjust quality</b><small>Choose the encoder quality for JPEG, WebP or AVIF.</small></div><div class="tg"><i></i></div></div>' +
    '<div class="field f2"><div class="fl">Encoder quality</div><div class="fi"><span class="v2">90</span></div></div>' +
    '</div><div class="done">Done ' + icon('check', 17, 2.2) + '</div>';
  place(sheet, SX, SY, { scale: SS, opacity: 0 });
  tl.fromTo(sheet, { y: 520, opacity: 0, rotation: 4, scale: SS * .9 }, { y: 0, opacity: 1, rotation: 0, scale: SS, duration: .95, ease: 'forma', immediateRender: false }, 33.95);

  const tg = qa(sheet, '.tg'), knobs = tg.map((t) => t.firstChild);
  const f1 = sheet.querySelector('.f1'), f2 = sheet.querySelector('.f2');
  const h1 = f1.scrollHeight, h2 = f2.scrollHeight;
  const v1 = sheet.querySelector('.v1'), v2 = sheet.querySelector('.v2');
  const done = sheet.querySelector('.done');

  const startC = V({ x: 960, y: 1720 }, { x: 1800, y: 980 });
  cursor.show(34.1, startC.x, startC.y);
  function toggle(i, tc, field, hh) {
    const m = measure(tg[i], tc);
    cursor.move(tc - .6, m.x, m.y, .55);
    cursor.click(tc, m.x, m.y);
    tl.to(knobs[i], { x: 20, duration: .32, ease: 'back.out(2.6)' }, tc + .03);
    tl.to(tg[i], { backgroundColor: '#4f5bd5', duration: .2 }, tc + .03);
    tl.to(field, { height: hh, opacity: 1, duration: .6, ease: 'forma' }, tc + .12);
  }
  function roll(el, from, to, t) {
    const o = { v: from };
    tl.fromTo(o, { v: from }, { v: to, duration: .4, ease: 'power2.out', immediateRender: false, onUpdate: () => { el.textContent = Math.round(o.v); } }, t);
    tl.fromTo(el.parentNode, { borderColor: '#dfe2ea' }, { borderColor: '#4f5bd5', duration: .15, yoyo: true, repeat: 1, repeatDelay: .45, immediateRender: false }, t - .05);
  }
  toggle(0, 34.7, f1, h1);
  roll(v1, 1200, 800, 35.3);
  toggle(1, 35.7, f2, h2);
  roll(v2, 90, 80, 36.3);

  // "A suggestion, not a decision."
  const chip = Chip(s.cam, 'sparkles', 'A suggestion, not a decision.', null);
  chip.querySelector('.ic').style.background = '#e9eafd'; chip.querySelector('.ic').style.color = '#4a56c9';
  place(chip, V(760, 1030), V(700, 840), { scale: V(1.6, 1.3), opacity: 0 });
  popIn(chip, 36.55, { from: .6, to: V(1.6, 1.3), y: 30, dur: .7, ease: 'back.out(2)' });
  chip.style.zIndex = 5;

  // Done
  const dm = measure(done, 37.0);
  cursor.move(36.5, dm.x, dm.y, .45);
  cursor.click(37.0, dm.x, dm.y);
  tl.to(done, { scale: .95, duration: .08 }, 37.0); tl.to(done, { scale: 1, duration: .35, ease: 'back.out(3)' }, 37.08);
  cursor.hide(37.2);

  whipOut(s, 37.3, 'y', 1);
})();

/* ── S11 · Free, no account ───────────────────────────────── */
let FREE;
(function () {
  const s = FREE = scene('free', 37.25, 41.15, 'radial-gradient(70% 50% at 20% 100%, #fbece0 0%, rgba(251,236,224,0) 70%), radial-gradient(70% 50% at 90% 0%, #e6e9ff 0%, rgba(230,233,255,0) 70%), #f7f8fa');
  whipIn(s, 37.3, 'y', -1);

  const head = T(s.cam, ['Free to use.'], { size: V(176, 150), cls: R ? '' : 'l' });
  place(head.el, V(540, 560), V(330, 400));
  blurIn(head.words, 37.6, { dur: .8, stagger: .1 });
  const sub = T(s.cam, ['No account needed.'], { size: V(82, 70), cls: 'soft', weight: 500 });
  place(sub.el, V(540, 560), V(490, 560));
  blurIn(sub.words, 37.95, { dur: .7, stagger: .08, y: 22, b: 12 });

  const card = mk('div', 'price', s.cam);
  const items = ['Image, document, data & media conversion', 'Resize and quality controls', 'Real output previews', 'Local presets and session activity', 'Your files stay on your device'];
  card.innerHTML =
    '<div class="pt"><span>Forma Free</span><span class="badge">Ready now</span></div>' +
    '<div class="amt"><span class="usd">$0</span><small>for the current tools</small></div>' +
    '<ul>' + items.map((t) => '<li><span class="ck">' + icon('check', 19, 2) + '</span><span class="lt">' + t + '</span></li>').join('') + '</ul>' +
    '<div class="pbtn">Open your workspace ' + icon('arrowUpRight', 19, 2) + '</div>' +
    '<div class="later">' + icon('sparkles', 20, 1.6) + '<div>More possibilities, later.<small>A Pro plan is on the horizon. Payments aren’t open yet.</small></div></div>';
  const CS = V(1.62, 1.38);
  place(card, V(540, 1390), V(1190, 540), { scale: CS, opacity: 0 });
  tl.fromTo(card, { y: 700, rotation: 6, opacity: 0, scale: CS * .92 }, { y: 0, rotation: 0, opacity: 1, scale: CS, duration: 1.0, ease: 'forma', immediateRender: false }, 37.65);
  const usd = card.querySelector('.usd');
  gsap.set(usd, { opacity: 0 });                    // hidden until its own pop-in (no flash when the card arrives)
  tl.fromTo(usd, { scale: .6, opacity: 0, transformOrigin: '0% 80%' }, { scale: 1, opacity: 1, duration: .6, ease: 'back.out(2.4)', immediateRender: false }, 38.1);
  qa(card, 'li').forEach((li, i) => {
    const t = 38.45 + i * .2;
    const ck = li.querySelector('.ck'), lt = li.querySelector('.lt');
    gsap.set(li, { opacity: .35 }); gsap.set(ck, { scale: 0 });
    tl.to(li, { opacity: 1, duration: .25 }, t);
    tl.to(ck, { scale: 1, duration: .4, ease: 'back.out(3)' }, t);
    tl.to(ck, { color: '#2f8a5b', duration: .25 }, t);
  });
  const badge = card.querySelector('.badge');
  tl.fromTo(badge, { scale: 1 }, { scale: 1.14, duration: .25, yoyo: true, repeat: 1, ease: 'power2.out', immediateRender: false }, 38.3);
  tl.fromTo(card, { y: 0 }, { y: -12, duration: 1.2, ease: 'sine.inOut', yoyo: true, repeat: 1, immediateRender: false }, 39.5);

  whipOut(s, 40.55, 'x', -1);
})();

/* ── S12 · A fresh start is one file away → click floods back to brand indigo ─ */
let CTA;
(function () {
  const s = CTA = scene('cta', 40.5, 46.05, 'radial-gradient(70% 50% at 50% 0%, #dfe2ff 0%, rgba(223,226,255,0) 70%), #eeeff9');
  whipIn(s, 40.55, 'x', 1);

  const wand = mk('div', 'wandtile', s.cam); wand.innerHTML = icon('wand', 50, 1.5);
  place(wand, V(540, 960), V(380, 205), { rotation: -6, opacity: 0 });
  popIn(wand, 41.0, { from: .3, rot0: -40, rot1: -6, dur: .8 });
  const head = T(s.cam, ['Convert your', 'first file.'], { size: V(138, 150) });
  place(head.el, V(540, 960), V(640, 470));
  blurIn(head.words.slice(0, 2), 41.15, { dur: .8, stagger: .1 });
  blurIn(head.words.slice(2), 41.55, { dur: .8, stagger: .1 });

  const png = mk('div', 'ftile', s.cam, { color: '#5e5a8a' }); png.textContent = '.png';
  const webp = mk('div', 'ftile', s.cam, { color: '#566a5e' }); webp.textContent = '.webp';
  place(png, V(250, 330), V(1010, 540), { rotation: -12, opacity: 0, scale: V(1, 1.3) });
  place(webp, V(830, 1590), V(1010, 540), { rotation: 10, opacity: 0, scale: V(1, 1.3) });
  tl.fromTo(png, { x: -W * .6, opacity: 0, rotation: -40 }, { x: 0, opacity: 1, rotation: -12, duration: 1.0, ease: 'forma', immediateRender: false }, 41.35);
  tl.fromTo(webp, { x: W * .6, opacity: 0, rotation: 40 }, { x: 0, opacity: 1, rotation: 10, duration: 1.0, ease: 'forma', immediateRender: false }, 41.5);
  tl.to(png, { y: -14, rotation: -9, duration: 1.3, ease: 'sine.inOut', yoyo: true, repeat: 2 }, 42.5);
  tl.to(webp, { y: 14, rotation: 13, duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: 2 }, 42.5);
  if (R) {
    const arr = mk('div', '', s.cam, { position: 'absolute', color: '#7b82d6' }); arr.innerHTML = icon('arrowRight', 90, 1.6);
    place(arr, 540, 1010, { opacity: 0 });
    blurIn(arr, 41.9, { dur: .6, x: -30, y: 0 });
  }

  const btn = mk('div', 'btn', s.cam);
  btn.style.fontSize = '13px'; btn.style.height = '48px'; btn.style.padding = '0 26px'; btn.style.borderRadius = '25px';
  btn.innerHTML = 'Open Forma' + icon('arrowUpRight', 16, 2.2);
  btn.style.position = 'absolute';
  const BS = V(2.35, 2.5), BX = V(540, 960), BY = V(1290, 740);
  place(btn, BX, BY, { scale: BS, opacity: 0 });
  popIn(btn, 42.35, { from: BS * .6, to: BS, y: 40, dur: .7, ease: 'back.out(2)' });
  const note = mk('div', '', s.cam, { position: 'absolute', display: 'flex', alignItems: 'center', gap: '12px', color: '#5f6671', fontFamily: 'var(--font)', fontSize: V(32, 26) + 'px', whiteSpace: 'nowrap' });
  note.innerHTML = icon('lock', V(32, 26), 1.8) + 'Files stay on your device';
  place(note, V(540, 960), V(1460, 880), { opacity: 0 });
  blurIn(note, 42.8, { dur: .6, y: 14 });

  // cursor lands on the button and clicks
  const bm = measure(btn, 45.2);
  cursor.show(43.7, V(900, 1700), V(1700, 980));
  cursor.move(43.8, bm.x + 40, bm.y + 14, 1.3);
  tl.to(btn, { scale: BS * 1.05, duration: .3, ease: 'forma' }, 45.0);
  cursor.click(45.3, bm.x + 40, bm.y + 14);
  tl.to(btn, { scale: BS * .95, duration: .08, ease: 'power2.out' }, 45.3);
  tl.to(btn, { scale: BS, duration: .4, ease: 'back.out(3)' }, 45.38);
  cursor.hide(45.5);

  window.CTA_BTN = { x: bm.x, y: bm.y };
})();

/* ── End card ─────────────────────────────────────────────── */
(function () {
  const B = window.CTA_BTN;
  const s = scene('end', 45.25, 52.0, 'radial-gradient(70% 46% at 50% 30%, #5568ff 0%, rgba(85,104,255,0) 70%), #3448ed');
  gsap.set(s.el, { clipPath: CLIPC(0, B.x, B.y) });
  tl.fromTo(s.el, { clipPath: CLIPC(0, B.x, B.y) }, { clipPath: CLIPC(2600, B.x, B.y), duration: .68, ease: 'power3.in', immediateRender: false }, 45.32);
  const T0 = 46.0;
  [0, .12].forEach((d, i) => {
    const ring = mk('div', '', s.cam, { position: 'absolute', width: '360px', height: '360px', borderRadius: '50%', border: (i ? 2 : 3) + 'px solid rgba(255,255,255,.32)' });
    place(ring, W / 2, V(720, 430), { opacity: 0 });
    tl.fromTo(ring, { scale: .25, opacity: .9 }, { scale: 6.5 + i, opacity: 0, duration: 1.6, ease: 'expo.out', immediateRender: false }, T0 + d);
  });
  const f = V(200, 230);
  const lg = Logo(s.cam, f, true);
  lg.el.style.position = 'absolute';
  place(lg.el, W / 2, V(730, 420));
  gsap.set(lg.bars, { scaleY: 0, transformOrigin: '50% 100%' });
  gsap.set(lg.letters, { yPercent: 125 });
  gsap.set(lg.dot, { scale: 0, transformOrigin: '50% 80%' });
  tl.to(lg.bars, { scaleY: 1, duration: .7, ease: 'back.out(2.4)', stagger: .07 }, T0 - .02);
  tl.fromTo(lg.mark, { rotation: -40 }, { rotation: -10, duration: .9, ease: 'forma', immediateRender: false }, T0 - .02);
  tl.to(lg.letters, { yPercent: 0, duration: .75, ease: 'forma', stagger: .045 }, T0 + .16);
  tl.to(lg.dot, { scale: 1, duration: .5, ease: 'back.out(4)' }, T0 + .55);
  flash(T0 - .02, .18, .35);
  punch(T0, .02);

  const tag = T(s.cam, ['Convert files', 'on your own device.'], { size: V(84, 74), cls: 'light', weight: 500 });
  place(tag.el, W / 2, V(1060, 640));
  tag.words.forEach((w, i) => { if (i >= 2) w.style.color = '#bfc7ff'; });
  blurIn(tag.words.slice(0, 2), 47.1, { dur: .8, stagger: .1, y: 26, b: 14 });
  blurIn(tag.words.slice(2), 47.55, { dur: .8, stagger: .1, y: 26, b: 14 });

  const url = mk('div', 'urlpill', s.cam);
  url.innerHTML = 'forma.thezavino.com' + icon('arrowUpRight', 44, 2);
  place(url, W / 2, V(1330, 830), { opacity: 0 });
  popIn(url, 48.3, { from: .7, dur: .7, y: 30, ease: 'back.out(2)' });
  const rs = rng(99);
  for (let i = 0; i < 3; i++) sparkleAt(s.cam, 120 + rs() * (W - 240), V(300, 120) + rs() * V(1300, 800), 46.7 + i * .45, 26 + rs() * 24, '#fff');
  tl.fromTo(s.cam, { scale: 1 }, { scale: 1.05, duration: 6, ease: 'none', immediateRender: false }, 46.0);
  // the lockup breathes on the beat (every second beat)
  [48.0, 49.0, 50.0, 51.0].forEach((t) => { tl.fromTo(lg.el, { scale: 1.04 }, { scale: 1, duration: .55, ease: 'expo.out', immediateRender: false }, t); });
  tl.to(url, { y: -10, duration: 1.3, ease: 'sine.inOut', yoyo: true, repeat: 3 }, 49.0);
})();
