/* Remade Forma components — built in code, animated by the timeline. */
(function () {
  let uid = 0;

  /** brand lockup: three rotated bars + wordmark (letters are separate spans for reveals) */
  window.Logo = function (parent, size, onBlue) {
    const d = mk('div', 'logo' + (onBlue ? ' on-blue' : ''), parent, { fontSize: size + 'px' });
    d.innerHTML = '<span class="mark"><i></i><i></i><i></i></span><span class="wm">' +
      'forma'.split('').map((c) => '<span>' + c + '</span>').join('') + '<span class="dot">.</span></span>';
    return {
      el: d,
      bars: qa(d, '.mark i'),
      mark: d.querySelector('.mark'),
      letters: qa(d, '.wm span:not(.dot)'),
      dot: d.querySelector('.dot'),
      wm: d.querySelector('.wm'),
    };
  };

  /** a format file card (the wheel's building block) */
  const IMAGE_TARGETS = new Set(['png', 'jpeg', 'webp', 'avif', 'gif', 'bmp', 'tiff', 'ico', 'pdf']);
  window.IMAGE_TARGETS = IMAGE_TARGETS;
  window.FormatCard = function (f, parent, o) {
    o = o || {};
    const c = mk('div', 'fcard' + (o.off ? ' off' : ''), parent);
    c.dataset.f = f;
    const id = 'u' + (uid++);
    c.innerHTML = FORMAT_ART[f].replace(/__ID__/g, id).replace('format-artwork', 'fa');
    return c;
  };

  /**
   * The format wheel, using the app's own transform math:
   *   n = index − position
   *   x = n²·24, y = step·n, rotate = −n·12°, scale = 1 − min(|n|·.29, .55)
   *   opacity = clamp((2 − |n|)·1.25), visible while |n| < 2.4
   */
  window.Wheel = function (parent, o) {
    o = Object.assign({ step: 145, xk: 24, order: FORMAT_ORDER }, o || {});
    const root = mk('div', 'abs', parent);
    const cards = o.order.map((f, i) => {
      const c = FormatCard(f, root, { off: !IMAGE_TARGETS.has(f) });
      c.style.visibility = 'hidden';
      gsap.set(c, { xPercent: -50, yPercent: -50, opacity: 0 });
      return c;
    });
    let p0 = null;
    function setPos(p) {
      p0 = p;
      cards.forEach((c, i) => {
        const d = i - p, ad = Math.abs(d);
        if (ad >= 2.4) {
          if (c._v !== 0) { gsap.set(c, { visibility: 'hidden', opacity: 0 }); c._v = 0; }
          return;
        }
        const n = Math.max(-3, Math.min(3, d));
        gsap.set(c, {
          visibility: 'inherit',               // NOT 'visible': an explicit 'visible' child still draws inside a hidden scene
          x: n * n * o.xk,
          y: o.step * n,
          rotation: -n * 12,
          scale: 1 - Math.min(Math.abs(n) * .29, .55),
          opacity: Math.max(0, Math.min(1, (2 - ad) * 1.25)),
          zIndex: Math.round(10 - ad * 5),
        });
        c._v = 1;
      });
    }
    return { el: root, cards, setPos, pos: () => p0 };
  };

  /** hero "sculpture" card (landing page): kind = 'png' | 'webp' */
  window.Sculpt = function (kind, parent) {
    const d = mk('div', 'sculpt', parent);
    const img = '<img src="assets/landscape.svg" alt="">';
    d.innerHTML = kind === 'png'
      ? '<div class="lab"><span class="fmt png">PNG</span><span class="menu">•••</span></div><div class="art">' + img + '</div><div class="foot">somewhere-nice.png<span>Original</span></div>'
      : '<div class="lab"><span class="fmt webp">WebP</span><span class="ok">' + icon('check', 15, 2.4) + '</span></div><div class="art">' + img + '</div><div class="foot">A fresh format.<span>Same possibility.</span></div>';
    return d;
  };

  /** accent token with the wand glyph */
  window.Token = function (parent, size) {
    const d = mk('div', 'token', parent);
    if (size) { d.style.width = size + 'px'; d.style.height = size + 'px'; }
    d.innerHTML = icon('wand', 28, 1.6);
    return d;
  };

  /** floating white note chip */
  window.Chip = function (parent, iconName, title, sub, cls) {
    const d = mk('div', 'chip ' + (cls || ''), parent);
    d.style.padding = sub ? '14px 28px 14px 14px' : '14px 22px 14px 18px';
    d.innerHTML = '<span class="ic">' + icon(iconName, 17, 2) + '</span><div><strong>' + title + '</strong>' + (sub ? '<small>' + sub + '</small>' : '') + '</div>';
    return d;
  };
})();
