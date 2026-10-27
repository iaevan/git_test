/* The Forma workspace, remade. Built once in "design px" (the product's native
   size) and scaled by K so both layouts share one faithful component. */
window.buildApp = function (parent) {
  const AL = R ? {
    DW: 450, DH: 800, logo: { x: 20, y: 64, fs: 26 }, acct: { x: 430, y: 64 },
    kicker: { y: 112 }, h1: { y: 178, fs: 46 }, h1one: { y: 156 }, desc: { y: 250, fs: 14 }, pills: { y: 288 },
    res: { y: 214 }, src: { x: 110, y: 486 }, conn: { x: 219, y: 506 }, wheel: { x: 322, y: 486 }, nav: { x: 322, y: 650 },
    cta: { x: 225, y: 712 }, sub: { y: 752 }, foot: { y: 784 }, step: 138, noPills: true,
  } : {
    DW: 1280, DH: 720, logo: { x: 36, y: 32, fs: 25 }, acct: { x: 1244, y: 32 },
    kicker: { y: 66 }, h1: { y: 150, fs: 62 }, h1one: { y: 128 }, desc: { y: 240, fs: 15 }, pills: { y: 278 },
    res: { y: 200 }, src: { x: 460, y: 436 }, conn: { x: 642, y: 456 }, wheel: { x: 810, y: 436 }, nav: { x: 810, y: 596 },
    cta: { x: 640, y: 652 }, sub: { y: 690 }, foot: { y: 710 }, step: 130,
  };
  const K = W / AL.DW;
  const rig = mk('div', 'fill', parent);             // rig: rotation / dolly pivot (stage centre)
  const root = mk('div', 'app', rig, { width: AL.DW + 'px', height: AL.DH + 'px' });
  gsap.set(root, { scale: K, transformOrigin: '0 0' });
  const app = { root, rig, K, AL };

  const ctr = (el, x, y, extra) => { el.style.left = x + 'px'; el.style.top = y + 'px'; gsap.set(el, Object.assign({ xPercent: -50, yPercent: -50 }, extra || {})); return el; };
  app.ctr = ctr;

  // header
  const lg = Logo(root, AL.logo.fs, false);
  lg.el.style.position = 'absolute'; lg.el.style.left = AL.logo.x + 'px'; lg.el.style.top = AL.logo.y + 'px';
  gsap.set(lg.el, { yPercent: -50 });
  app.logo = lg;

  const acct = mk('div', 'pill', root, { position: 'absolute', background: 'transparent', boxShadow: 'none', gap: '10px', fontSize: '13px', color: '#3b4452', padding: '0' });
  acct.innerHTML = '<span style="width:32px;height:32px;border-radius:50%;background:#f0f1f4;display:grid;place-items:center;color:#6a7280">' + icon('user', 16, 1.8) + '</span>Your space' + icon('chevDown', 14, 2);
  acct.style.left = AL.acct.x + 'px'; acct.style.top = AL.acct.y + 'px';
  gsap.set(acct, { xPercent: -100, yPercent: -50 });
  app.acct = acct;

  // kicker + headline stacks (each variant is its own absolutely positioned node)
  function stack(variants, y, cls, fs, mkHtml) {
    const els = variants.map((v) => {
      const e = mk('div', cls, root, { position: 'absolute' });
      if (fs) e.style.fontSize = fs + 'px';
      e.innerHTML = mkHtml(v);
      ctr(e, AL.DW / 2, y);
      gsap.set(e, { opacity: 0 });
      // fit: never let a no-wrap line run past the frame
      const maxW = AL.DW - (R ? 72 : 140);
      if (e.offsetWidth > maxW && fs) e.style.fontSize = (fs * maxW / e.offsetWidth) + 'px';
      return e;
    });
    return els;
  }
  app.kicker = stack(['<b>01</b>Drop something in.', '<b>02</b>Give it a direction.', '<b>03</b>And it’s yours to go.'], AL.kicker.y, 'a-step', R ? 15 : 16, (v) => v);
  app.l1 = stack([['Your file.'], ['Your image.']], AL.h1.y - (AL.h1.fs * 1.06) / 2, 'a-h1', AL.h1.fs, (v) => v[0]);
  const L2 = ['Made for the web.', 'A little more modern.', 'A little retro looks good.', 'Keep it old school.', 'Room for every pixel.', 'Small file. Big identity.', 'Give your image a page.'];
  app.l2 = stack(L2, AL.h1.y + (AL.h1.fs * 1.06) / 2, 'a-h1', AL.h1.fs, (v) => '<span class="l2">' + v + '</span>');
  app.ready = stack(['x'], AL.h1one.y, 'a-h1', AL.h1.fs, () => 'Your WebP <span class="l2">is ready.</span>')[0];
  const D = ['A modern WebP, ready for its next page.', 'An AVIF for places that welcome a newer image format.', 'A still GIF with a 256-color palette.', 'A straightforward bitmap for software that asks for BMP.', 'An uncompressed TIFF. Make a little space for it.', 'One icon, ready for a tab, shortcut or desktop.', 'One image on one PDF page. Ready to pass along.'];
  const Dshort = ['WebP · Converted on your device.', 'AVIF · Converted on your device.', 'GIF · Converted on your device.', 'BMP · Converted on your device.', 'TIFF · Converted on your device.', 'ICO · Converted on your device.', 'PDF · Converted on your device.'];
  app.desc = stack(R ? Dshort : D, AL.desc.y, 'a-desc', AL.desc.fs, (v) => v);
  if (AL.noPills) app.noPills = true;

  // pills row
  const pills = mk('div', '', root, { position: 'absolute', display: 'flex', gap: '6px', alignItems: 'center' });
  pills.innerHTML = '<span class="pill">' + icon('sliders', 14, 1.8) + 'More details' + icon('plus', 13, 2) + '</span><span class="sound">' + icon('volume', 16, 1.8) + '</span>';
  ctr(pills, AL.DW / 2, AL.pills.y); gsap.set(pills, { opacity: 0 });
  if (AL.noPills) pills.style.display = 'none';
  app.pills = pills; app.sound = pills.querySelector('.sound');

  // result block
  const res = mk('div', 'res', root);
  res.innerHTML = '<div class="row"><span>Before<b>765.1 KiB</b></span><span>Now<b class="now">23.2 KiB</b></span></div><div class="bar"><i></i></div><div class="pct">97.0% smaller</div>';
  ctr(res, AL.DW / 2, AL.res.y, { opacity: 0 });
  app.res = res; app.resBar = res.querySelector('.bar i'); app.resNow = res.querySelector('.now'); app.resPct = res.querySelector('.pct'); app.resBefore = res.querySelector('b');

  // source file (empty -> image)
  const src = mk('div', 'paper', root);
  src.innerHTML = '<span class="paper-fold"></span>' +
    '<span class="empty-tile">' + icon('filePlus', 38, 1.4) + '</span><span class="lines"><i></i><i></i></span>' +
    '<img class="pic" src="assets/landscape.svg" style="opacity:0;position:absolute;width:calc(100% - 24px);height:auto;top:34px;left:12px;max-width:none;margin:0;aspect-ratio:4/3;object-fit:cover">' +
    '<span class="ext" style="opacity:0">PNG</span>' +
    '<span class="plus"><span class="pl-plus">' + icon('plus', 16, 2.6) + '</span><span class="pl-up" style="position:absolute;opacity:0">' + icon('upload', 16, 2.2) + '</span></span>';
  ctr(src, AL.src.x, AL.src.y); gsap.set(src, { opacity: 0 });
  app.src = src;
  app.srcEmpty = qa(src, '.empty-tile, .lines');
  app.srcPic = src.querySelector('.pic');
  app.srcExt = src.querySelector('.ext');
  app.srcPlus = src.querySelector('.plus');
  app.plusIcon = src.querySelector('.pl-plus'); app.upIcon = src.querySelector('.pl-up');

  const capEmpty = mk('div', 'cap', root);
  capEmpty.innerHTML = '<strong>Choose a file</strong><span style="margin-top:2px">or drop it here</span><small>Up to 64 MiB</small>';
  const capFile = mk('div', 'cap', root);
  capFile.innerHTML = '<strong>somewhere-nice.png</strong><span>1200 × 900</span><small>' + icon('x', 10, 2) + 'Remove</small>';
  [capEmpty, capFile].forEach((c) => { ctr(c, AL.src.x, AL.src.y + 109 + 40); gsap.set(c, { opacity: 0 }); });
  app.capEmpty = capEmpty; app.capFile = capFile;

  const conn = mk('div', 'conn', root);
  conn.innerHTML = '<s></s><span class="c-arrow">' + icon('arrowRight', 19, 1.5) + '</span><span class="c-check" style="display:none;color:#538168">' + icon('check', 19, 2) + '</span><s></s>';
  ctr(conn, AL.conn.x, AL.conn.y); gsap.set(conn, { opacity: 0 });
  app.conn = conn; app.cArrow = conn.querySelector('.c-arrow'); app.cCheck = conn.querySelector('.c-check');
  gsap.set(app.cCheck, { display: 'block', opacity: 0, position: 'absolute', left: '50%', xPercent: -50 });
  conn.style.position = 'absolute';

  // wheel
  const wheel = Wheel(root, { step: AL.step, xk: 24 });
  wheel.el.style.left = AL.wheel.x + 'px'; wheel.el.style.top = AL.wheel.y + 'px';
  wheel.setPos(2);
  app.wheel = wheel;
  gsap.set(wheel.cards, { opacity: 0 }); wheel.cards.forEach((c) => { c._v = 0; });
  wheel.hide = () => { wheel.cards.forEach((c) => { gsap.set(c, { visibility: 'hidden', opacity: 0 }); c._v = 0; }); };

  const nav = mk('div', 'browse', root);
  nav.innerHTML = icon('chevUp', 14, 2) + '<span class="mid">' + icon('search', 13, 2) + 'All 53 formats</span>' + icon('chevDown', 14, 2);
  ctr(nav, AL.nav.x, AL.nav.y); gsap.set(nav, { opacity: 0 });
  app.nav = nav;

  // CTA
  const cta = mk('div', 'a-cta', root);
  cta.innerHTML = '<div class="btn" style="font-size:13px;height:48px;padding:0 26px;border-radius:25px;gap:10px">' +
    '<span class="stk il">' + '<span class="il1" style="opacity:0">' + icon('download', 16, 2) + '</span>' + '</span>' +
    '<span class="stk lb"><span class="lb1">Convert to WebP</span><span class="lb2" style="opacity:0">Converting…</span><span class="lb3" style="opacity:0">Download WebP</span><span class="lb4" style="opacity:0">Downloaded</span></span>' +
    '<span class="stk ir"><span class="ir1">' + icon('arrowRight', 16, 2.2) + '</span><span class="ir2" style="opacity:0">' + icon('loader', 16, 2.4) + '</span><span class="ir4" style="opacity:0">' + icon('check', 16, 2.6) + '</span></span></div>';
  ctr(cta, AL.cta.x, AL.cta.y); gsap.set(cta, { opacity: 0 });
  app.cta = cta; app.ctaBtn = cta.firstChild;
  app.lb = ['.lb1', '.lb2', '.lb3', '.lb4'].map((q) => cta.querySelector(q));
  app.ir = { arrow: cta.querySelector('.ir1'), spin: cta.querySelector('.ir2'), check: cta.querySelector('.ir4') };
  app.il = cta.querySelector('.il1'); app.ilWrap = cta.querySelector('.il');
  const sub = mk('div', 'a-sub', root);
  sub.innerHTML = '<span class="s-a">9 available formats. Your original stays untouched.</span>';
  ctr(sub, AL.cta.x, AL.sub.y); gsap.set(sub, { opacity: 0 });
  app.sub = sub;
  const subEmpty = mk('div', 'a-sub', root);
  subEmpty.innerHTML = 'Drop a file. Watch its possibilities light up.';
  ctr(subEmpty, AL.cta.x, AL.sub.y); gsap.set(subEmpty, { opacity: 0 });
  app.subEmpty = subEmpty;
  const ex = mk('div', 'a-link', root);
  ex.innerHTML = 'Try an example' + icon('arrowUpRight', 13, 1.8);
  ctr(ex, AL.cta.x, AL.cta.y); gsap.set(ex, { opacity: 0 });
  app.example = ex;
  // result row under the download button
  const post = mk('div', 'a-post', root);
  post.innerHTML = '<span>' + icon('eye', 14, 1.8) + 'Preview</span><i></i><span>Convert another' + icon('arrowUpRight', 12, 1.8) + '</span>';
  ctr(post, AL.cta.x, AL.sub.y); gsap.set(post, { opacity: 0 });
  app.post = post;
  // glow that tracks the selected format's hue
  const glow = mk('div', '', root, { position: 'absolute', left: '0', top: '0', width: '520px', height: '520px', borderRadius: '50%', pointerEvents: 'none', background: 'radial-gradient(closest-side, var(--glow, #cfe8d8) 0%, rgba(255,255,255,0) 100%)', opacity: 0 });
  glow.style.left = AL.wheel.x + 'px'; glow.style.top = AL.wheel.y + 'px';
  gsap.set(glow, { xPercent: -50, yPercent: -50 });
  root.insertBefore(glow, root.firstChild);
  app.glow = glow;

  if (!R) {
    const foot = mk('div', 'a-foot', root);
    foot.innerHTML = icon('lock', 12, 1.8) + 'Your files stay on your device.';
    foot.style.left = '40px'; foot.style.top = AL.foot.y + 'px';
    gsap.set(foot, { yPercent: -50, opacity: 0 });
    const help = mk('div', 'a-foot', root);
    help.innerHTML = 'A little help' + icon('arrowUpRight', 12, 1.8);
    help.style.left = (AL.DW - 40) + 'px'; help.style.top = AL.foot.y + 'px';
    gsap.set(help, { xPercent: -100, yPercent: -50, opacity: 0 });
    app.foot = [foot, help];
  } else {
    const foot = mk('div', 'a-foot', root);
    foot.innerHTML = icon('lock', 12, 1.8) + 'Your files stay on your device.';
    ctr(foot, AL.DW / 2, AL.foot.y); gsap.set(foot, { opacity: 0 });
    app.foot = [foot];
  }
  return app;
};
