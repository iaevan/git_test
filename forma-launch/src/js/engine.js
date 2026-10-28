/* ───────────────────────────────────────────────────────────
   Engine — one deterministic, seekable GSAP master timeline.
   The renderer calls __seek(t) for any t (and any sub-frame time
   for motion blur); every pixel is a pure function of t.
   Sound cues are authored right next to the animation they belong
   to and exported (window.CUES) so audio is frame-locked.
   ─────────────────────────────────────────────────────────── */
(function () {
  const P = new URLSearchParams(location.search);
  const FMT = P.get('fmt') === 'land' ? 'land' : 'reel';
  window.FMT = FMT;
  window.R = FMT === 'reel';
  window.W = R ? 1080 : 1920;
  window.H = R ? 1920 : 1080;
  window.BPM = 120;
  window.BEAT = 60 / BPM;           // 0.5 s
  window.BAR = BEAT * 4;            // 2.0 s

  const stage = document.getElementById('stage');
  stage.style.width = W + 'px';
  stage.style.height = H + 'px';
  document.documentElement.style.width = W + 'px';
  document.documentElement.style.height = H + 'px';

  gsap.registerPlugin(CustomEase);
  CustomEase.create('forma', 'M0,0 C0.16,1 0.3,1 1,1');          // the product's own easing
  CustomEase.create('quint', 'M0,0 C0.22,1 0.36,1 1,1');
  CustomEase.create('io', 'M0,0 C0.65,0 0.35,1 1,1');
  CustomEase.create('whip', 'M0,0 C0.7,0 0.2,1 1,1');
  CustomEase.create('settle', 'M0,0 C0.34,1.56 0.64,1 1,1');      // gentle overshoot

  const tl = gsap.timeline({ paused: true });
  window.tl = tl;
  window.CUES = [];
  window.BLURS = [];

  // ── optional intro stretch ───────────────────────────────
  // ?intro=6 pushes everything after the "problem" scenes 6 s later (3 bars at 120 BPM) so the pain gets room to breathe.
  // Scenes authored AFTER ripple() keep their original times; every timeline/cue/blur/measure call is mapped through TM.
  window.SHIFT = +(P.get('intro') || 0);
  window.LONG = SHIFT > 0;
  const TSH = { t0: Infinity, d: 0 };
  window.TM = function (t) { return t >= TSH.t0 - 1e-9 ? t + TSH.d : t; };
  window.ripple = function (t0, d) {
    if (!d) return;
    TSH.t0 = t0; TSH.d = d;
    [['to', 2], ['set', 2], ['fromTo', 3]].forEach(function (m) {
      const orig = tl[m[0]].bind(tl);
      tl[m[0]] = function () {
        const a = Array.prototype.slice.call(arguments);
        if (typeof a[m[1]] === 'number') a[m[1]] = TM(a[m[1]]);
        return orig.apply(null, a);
      };
    });
  };

  /** register a sound cue at time t */
  window.sfx = function (t, name, o) { CUES.push(Object.assign({ t: +TM(t).toFixed(4), name }, o || {})); };
  /** ask the renderer for extra sub-frames (motion blur) in a window */
  window.blurWin = function (t0, t1, n, shutter) { BLURS.push({ t0: TM(t0), t1: TM(t1), n: n || 8, shutter: shutter || 1 }); };

  // ── DOM helpers ──────────────────────────────────────────
  window.mk = function (tag, cls, parent, css) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (css) Object.assign(e.style, css);
    if (parent) parent.appendChild(e);
    return e;
  };
  window.html = function (parent, s) { parent.insertAdjacentHTML('beforeend', s); return parent.lastElementChild; };
  window.qa = function (root, sel) { return Array.from(root.querySelectorAll(sel)); };

  const world = mk('div', 'fill', stage); world.id = 'world';
  window.world = world;

  /** a full-canvas scene, visible only during [t0,t1] */
  window.scene = function (name, t0, t1, bg) {
    const el = mk('div', 'scene', world);
    el.dataset.name = name;
    if (bg) el.style.background = bg;
    const cam = mk('div', 'cam', el);
    tl.set(el, { visibility: 'visible' }, t0);
    tl.set(el, { visibility: 'hidden' }, t1);
    return { el, cam, t0, t1, name };
  };

  /** center an element's anchor at (x,y) in its parent's pixel space.
      Convention: position lives in CSS left/top; GSAP x/y are animation OFFSETS from that home. */
  window.place = function (el, x, y, extra) {
    el.style.left = x + 'px'; el.style.top = y + 'px';
    gsap.set(el, Object.assign({ xPercent: -50, yPercent: -50 }, extra || {}));
    return el;
  };

  // ── Kinetic text ─────────────────────────────────────────
  // lines: ['Your files.', 'Your business.'] ; use "word|cls" to tag words
  window.T = function (parent, lines, o) {
    o = o || {};
    const d = mk('div', 't ' + (o.cls || ''), parent, {
      fontSize: (o.size || 100) + 'px',
      lineHeight: o.lh || '',
      color: o.color || '',
      fontWeight: o.weight || '',
      letterSpacing: o.ls || '',
    });
    if (typeof lines === 'string') lines = [lines];
    const words = [];
    const lineEls = [];
    lines.forEach((ln) => {
      const l = mk('span', 'ln', d);
      lineEls.push(l);
      ln.split(' ').forEach((wd, i, arr) => {
        const [txt, cls] = wd.split('|');
        const w = mk('span', 'w', l);
        const wi = mk('span', 'wi' + (cls ? ' ' + cls : ''), w);
        wi.innerHTML = txt.replace(/_/g, '&nbsp;');
        words.push(wi);
        if (i < arr.length - 1) l.appendChild(document.createTextNode(' '));
      });
    });
    return { el: d, words, lines: lineEls };
  };

  /** deblur + rise entrance for a set of targets */
  window.blurIn = function (targets, at, o) {
    o = o || {};
    gsap.set(targets, { opacity: o.o0 || 0 });
    return tl.fromTo(targets,
      { opacity: o.o0 || 0, y: o.y === undefined ? 34 : o.y, x: o.x || 0, scale: o.s === undefined ? .94 : o.s, filter: 'blur(' + (o.b === undefined ? 16 : o.b) + 'px)' },
      { opacity: 1, y: 0, x: 0, scale: o.to === undefined ? 1 : o.to, filter: 'blur(0px)', duration: o.dur || .8, ease: o.ease || 'forma', stagger: o.stagger === undefined ? .07 : o.stagger, immediateRender: false },
      at);
  };
  /** deblur + drift exit */
  window.blurOut = function (targets, at, o) {
    o = o || {};
    return tl.to(targets,
      { opacity: 0, y: o.y === undefined ? -26 : o.y, x: o.x || 0, scale: o.sc === undefined ? (o.s === undefined ? 1.03 : o.s) : o.sc, filter: 'blur(' + (o.b === undefined ? 14 : o.b) + 'px)', duration: o.dur || .45, ease: o.ease || 'power3.in', stagger: o.stagger || 0 },
      at);
  };
  /** hard pop-in with a little overshoot (UI objects) */
  window.popIn = function (targets, at, o) {
    o = o || {};
    gsap.set(targets, { opacity: 0 });
    return tl.fromTo(targets,
      { opacity: 0, scale: o.from === undefined ? .6 : o.from, y: o.y || 0, x: o.x || 0, rotation: o.rot0 || 0 },
      { opacity: 1, scale: o.to || 1, y: 0, x: 0, rotation: o.rot1 === undefined ? (o.rot0 || 0) : o.rot1, duration: o.dur || .6, ease: o.ease || 'back.out(2.2)', stagger: o.stagger || 0, immediateRender: false },
      at);
  };
  /** camera "punch" on the whole world — pairs with an impact sound */
  window.punch = function (at, amt) {
    amt = amt || .035;
    tl.fromTo(world, { scale: 1 + amt }, { scale: 1, duration: .55, ease: 'expo.out', immediateRender: false }, at);
  };
  /** swap helper: crossfade between stacked text variants */
  window.swap = function (outEls, inEls, at, o) {
    o = o || {};
    const empty = (x) => !x || (Array.isArray(x) && x.length === 0);
    if (!empty(outEls)) blurOut(outEls, at, { dur: o.dur || .22, y: o.yo === undefined ? -18 : o.yo, b: 10, ease: 'power2.in' });
    if (!empty(inEls)) blurIn(inEls, at + (o.delay === undefined ? .12 : o.delay), { dur: o.dur2 || .55, y: o.yi === undefined ? 22 : o.yi, b: 12, stagger: o.stagger === undefined ? .03 : o.stagger });
  };

  // ── Cursor ───────────────────────────────────────────────
  const cursor = mk('div', '', stage); cursor.id = 'cursor';
  cursor.innerHTML = CURSOR_SVG;
  cursor.firstChild.style.margin = '-3px 0 0 -5px';
  gsap.set(cursor, { x: -200, y: -200, opacity: 0 });
  window.cursor = {
    el: cursor,
    show(at, x, y) { tl.set(cursor, { x: x, y: y }, at); tl.to(cursor, { opacity: 1, duration: .25, ease: 'power2.out' }, at); },
    hide(at) { tl.to(cursor, { opacity: 0, duration: .3, ease: 'power2.in' }, at); },
    move(at, x, y, dur, o) {
      o = o || {};
      // slightly curved path: x and y use different eases
      tl.to(cursor, { x: x, duration: dur, ease: o.ex || 'power3.inOut' }, at);
      tl.to(cursor, { y: y, duration: dur, ease: o.ey || 'power2.inOut' }, at);
    },
    click(at, x, y) {
      tl.to(cursor, { scale: .82, duration: .07, ease: 'power2.out' }, at);
      tl.to(cursor, { scale: 1, duration: .32, ease: 'back.out(3)' }, at + .07);
      const rp = mk('div', 'ripple', stage);
      gsap.set(rp, { x: x, y: y, opacity: 0 });
      tl.fromTo(rp, { scale: .3, opacity: .75 }, { scale: 4.2, opacity: 0, duration: .7, ease: 'power2.out', immediateRender: false }, at);
    },
  };

  /** measure an element's center in stage px at timeline time t */
  window.measure = function (el, t) {
    const prev = tl.time();
    tl.time(TM(t), true);
    const r = el.getBoundingClientRect();
    tl.time(prev, true);
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, l: r.left, t: r.top };
  };

  // ── overlays ─────────────────────────────────────────────
  const flash = mk('div', '', stage); flash.id = 'flash';
  window.flash = function (at, a, d) {
    tl.fromTo(flash, { opacity: a === undefined ? .9 : a }, { opacity: 0, duration: d || .5, ease: 'power2.out', immediateRender: false }, at);
  };
  mk('div', '', stage).id = 'vignette';

  // ── seek API for the renderer ───────────────────────────
  window.__seek = function (t) { tl.time(Math.max(0, t), false); return true; };
  window.__ready = false;
  window.__finish = function (duration) {
    window.DURATION = duration;
    tl.time(0, true);
    window.__ready = true;
  };
})();
