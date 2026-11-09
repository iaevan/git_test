/* Slide 1 illustration: flat, minimal isometric café floor (pure SVG, no raster art).
   Grid: 12x12 floor, 2:1 isometric projection. P(x,y,z) -> screen. */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const root = document.getElementById('art');
  const e = (p, t, a = {}, txt) => {
    const n = document.createElementNS(NS, t);
    for (const k in a) n.setAttribute(k, a[k]);
    if (txt != null) n.textContent = txt;
    p.appendChild(n);
    return n;
  };
  const g = (p, tr) => e(p, 'g', tr ? { transform: tr } : {});

  const A = 48, OX = 540, OY = 590, N = 12, TH = 44;
  const P = (x, y, z = 0) => [OX + (x - y) * A, OY + (x + y) * A / 2 - z];
  const pts = (a) => a.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  const R2 = Math.SQRT2;

  const INK = '#2A1A12';
  const CREAM = '#FFF3DC';
  const TOMATO = '#E4482A';
  const TEAL = '#1B8A7A';
  const GREEN = '#16513C';
  const SUN = '#F7A81B';

  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  /* ---------- defs ---------- */
  const defs = e(root, 'defs');
  const halo = e(defs, 'radialGradient', { id: 'halo' });
  e(halo, 'stop', { offset: '0%', 'stop-color': '#FFFBD6', 'stop-opacity': 1 });
  e(halo, 'stop', { offset: '45%', 'stop-color': '#FFF1A0', 'stop-opacity': 0.8 });
  e(halo, 'stop', { offset: '100%', 'stop-color': '#FFE066', 'stop-opacity': 0 });
  const blazer = e(defs, 'linearGradient', { id: 'blazer', x1: 0, y1: 0, x2: 1, y2: 0 });
  e(blazer, 'stop', { offset: '0%', 'stop-color': '#34588C' });
  e(blazer, 'stop', { offset: '55%', 'stop-color': '#2B4C7E' });
  e(blazer, 'stop', { offset: '100%', 'stop-color': '#213F6B' });
  const blur = e(defs, 'filter', { id: 'blur8', x: '-60%', y: '-60%', width: '220%', height: '220%' });
  e(blur, 'feGaussianBlur', { stdDeviation: 9 });

  /* ---------- floor slab ---------- */
  const floor = g(root);
  e(floor, 'polygon', {
    points: pts([P(0, 0, -TH), P(N, 0, -TH), P(N, N, -TH), P(0, N, -TH)].map((p) => [p[0], p[1] + 40])),
    fill: '#DF8E12', opacity: 0.5,
  });
  e(floor, 'polygon', { points: pts([P(0, N, 0), P(N, N, 0), P(N, N, -TH), P(0, N, -TH)]), fill: '#D93E22' });
  e(floor, 'polygon', { points: pts([P(N, 0, 0), P(N, N, 0), P(N, N, -TH), P(N, 0, -TH)]), fill: '#A92F18' });
  e(floor, 'polygon', { points: pts([P(0, N, 0), P(N, N, 0), P(N, N, -12), P(0, N, -12)]), fill: '#F2603E' });
  e(floor, 'polygon', { points: pts([P(N, 0, 0), P(N, N, 0), P(N, N, -12), P(N, 0, -12)]), fill: '#CB4527' });
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      e(floor, 'polygon', {
        points: pts([P(i, j), P(i + 1, j), P(i + 1, j + 1), P(i, j + 1)]),
        fill: (i + j) % 2 ? '#FCE5BC' : '#FFF4DE',
      });
    }
  }

  /* calm halo around the QR table (drawn on the floor, under everything) */
  const [hx, hy] = P(6, 6, 0);
  e(floor, 'ellipse', { cx: hx, cy: hy, rx: 250, ry: 125, fill: 'url(#halo)' });

  /* tiny paper scraps on the floor = mess */
  const scraps = [[3.2, 4.6, 14], [8.6, 5.2, -24], [4.2, 9.2, 38], [8.3, 9.0, -8], [1.7, 1.1, 20], [10.2, 3.9, -40]];
  scraps.forEach(([x, y, r]) => {
    const [sx, sy] = P(x, y);
    const s = g(floor, `translate(${sx} ${sy}) matrix(1 .5 -1 .5 0 0) rotate(${r})`);
    e(s, 'rect', { x: -9, y: -6, width: 18, height: 12, fill: '#fff', stroke: '#E7D3A8', 'stroke-width': 1.2 });
    e(s, 'line', { x1: -5, y1: -1, x2: 5, y2: -1, stroke: '#E4482A', 'stroke-width': 1.5 });
    e(s, 'line', { x1: -5, y1: 3, x2: 2, y2: 3, stroke: '#C9B58A', 'stroke-width': 1.2 });
  });

  /* ---------- depth-sorted drawables ---------- */
  const layer = g(root);
  const D = [];
  const add = (k, fn) => D.push({ k, fn });

  function box(p, x0, y0, x1, y1, z0, z1, top, left, right) {
    e(p, 'polygon', { points: pts([P(x0, y1, z0), P(x1, y1, z0), P(x1, y1, z1), P(x0, y1, z1)]), fill: left });
    e(p, 'polygon', { points: pts([P(x1, y0, z0), P(x1, y1, z0), P(x1, y1, z1), P(x1, y0, z1)]), fill: right });
    e(p, 'polygon', { points: pts([P(x0, y0, z1), P(x1, y0, z1), P(x1, y1, z1), P(x0, y1, z1)]), fill: top });
  }

  const ell = (p, cx, cy, rx, ry, fill, extra = {}) => e(p, 'ellipse', { cx, cy, rx, ry, fill, ...extra });

  /* cup + plate */
  function cup(p, x, y) {
    ell(p, x, y + 6, 8, 4, '#E5D4B0');
    e(p, 'rect', { x: x - 8, y: y, width: 16, height: 6, fill: '#F3E8D0' });
    ell(p, x, y, 8, 4, '#fff');
    ell(p, x, y, 5.5, 2.7, '#6B3B1F');
    e(p, 'path', { d: `M${x + 8} ${y + 1} q6 0 5 4 q-1 3 -6 2`, fill: 'none', stroke: '#F3E8D0', 'stroke-width': 2 });
  }
  function plate(p, x, y, food) {
    ell(p, x, y, 15, 7.5, '#fff');
    ell(p, x, y, 10.5, 5, '#EFE3C8');
    if (food) ell(p, x, y - 1, 6, 3, food);
  }

  /* ---- stools + people ---- */
  const SKIN = ['#F3C9A5', '#E2A877', '#B97C52', '#8A5A3A'];
  const HAIR = ['#2A1A12', '#4A2C1A', '#7A3E1D', '#1A1A1A', '#C9893A'];

  function stool(p, x, y) {
    ell(p, x + 6, y + 31, 22, 11, '#8A4B1F', { opacity: 0.18 });
    ell(p, x, y + 31, 15, 7.5, '#5B3A29');
    e(p, 'rect', { x: x - 4, y: y + 8, width: 8, height: 24, fill: '#7A4A2B' });
    ell(p, x, y + 8, 21, 10.5, '#A8642F');
    e(p, 'rect', { x: x - 21, y: y, width: 42, height: 8, fill: '#A8642F' });
    ell(p, x, y, 21, 10.5, '#D9904A');
  }

  function person(p, x, y, o) {
    const { shirt, skin = SKIN[0], hair = HAIR[0], style = 'short', mood = 'neutral', toward = true, cap } = o;
    const gp = g(p);
    const hy = y - 53;
    if (style === 'long') e(gp, 'rect', { x: x - 15, y: hy - 6, width: 30, height: 40, rx: 14, fill: hair });
    // torso
    e(gp, 'path', {
      d: `M${x - 15} ${y + 1} L${x - 15} ${y - 22} Q${x - 15} ${y - 37} ${x} ${y - 37} Q${x + 15} ${y - 37} ${x + 15} ${y - 22} L${x + 15} ${y + 1} Z`,
      fill: shirt,
    });
    e(gp, 'path', {
      d: `M${x + 4} ${y - 36.8} Q${x + 15} ${y - 37} ${x + 15} ${y - 22} L${x + 15} ${y + 1} L${x + 4} ${y + 1} Z`,
      fill: '#000', opacity: 0.12,
    });
    e(gp, 'rect', { x: x - 4.5, y: y - 44, width: 9, height: 10, rx: 3, fill: skin });
    // raised arm / phone
    if (mood === 'wave' || mood === 'bill') {
      e(gp, 'path', { d: `M${x + 11} ${y - 30} L${x + 25} ${y - 50} L${x + 22} ${y - 78}`, fill: 'none', stroke: shirt, 'stroke-width': 9, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
      ell(gp, x + 22, y - 83, 5.6, 5.6, skin);
      if (mood === 'bill') {
        const b = g(gp, `translate(${x + 24} ${y - 104}) rotate(8)`);
        e(b, 'rect', { x: -9, y: -13, width: 18, height: 26, rx: 2, fill: '#fff', stroke: INK, 'stroke-width': 1.6 });
        [-7, -2, 3].forEach((yy) => e(b, 'line', { x1: -5, y1: yy, x2: 5, y2: yy, stroke: '#B9A57F', 'stroke-width': 1.4 }));
        e(b, 'line', { x1: -5, y1: 8, x2: 3, y2: 8, stroke: TOMATO, 'stroke-width': 1.8 });
      }
    }
    if (mood === 'phone') {
      e(gp, 'path', { d: `M${x + 12} ${y - 28} L${x + 20} ${y - 40}`, fill: 'none', stroke: shirt, 'stroke-width': 9, 'stroke-linecap': 'round' });
      const ph = g(gp, `translate(${x + 21} ${y - 49}) rotate(14)`);
      e(ph, 'rect', { x: -5, y: -9, width: 10, height: 18, rx: 2.5, fill: INK });
      e(ph, 'rect', { x: -3.4, y: -7, width: 6.8, height: 13, rx: 1.2, fill: '#7FD1FF' });
      ell(gp, x + 20, y - 41, 4.6, 4.6, skin);
    }
    // head
    e(gp, 'circle', { cx: x, cy: hy, r: 13.2, fill: hair });
    if (toward) {
      e(gp, 'ellipse', { cx: x, cy: hy + 2.6, rx: 11, ry: 10.6, fill: skin });
      const ex = 4.6, ey = hy + 1;
      const dot = (cx) => e(gp, 'circle', { cx, cy: ey, r: 1.7, fill: INK });
      if (mood === 'calm') {
        [-1, 1].forEach((s) => e(gp, 'path', { d: `M${x + s * ex - 2.6} ${ey + 0.6} q2.6 -3 5.2 0`, fill: 'none', stroke: INK, 'stroke-width': 1.6, 'stroke-linecap': 'round' }));
        e(gp, 'path', { d: `M${x - 4} ${hy + 7} q4 4 8 0`, fill: 'none', stroke: INK, 'stroke-width': 1.7, 'stroke-linecap': 'round' });
        ell(gp, x - 8, hy + 6, 2.4, 1.8, '#F28B82', { opacity: 0.7 });
        ell(gp, x + 8, hy + 6, 2.4, 1.8, '#F28B82', { opacity: 0.7 });
      } else if (mood === 'phone') {
        dot(x - ex); dot(x + ex);
        e(gp, 'path', { d: `M${x - 8} ${hy - 4} l5 2 M${x + 8} ${hy - 4} l-5 2`, stroke: INK, 'stroke-width': 1.5, 'stroke-linecap': 'round' });
        e(gp, 'line', { x1: x - 3.5, y1: hy + 8, x2: x + 3.5, y2: hy + 8, stroke: INK, 'stroke-width': 1.7, 'stroke-linecap': 'round' });
      } else {
        dot(x - ex); dot(x + ex);
        e(gp, 'path', { d: `M${x - 8} ${hy - 3.5} l5 1.4 M${x + 8} ${hy - 3.5} l-5 1.4`, stroke: INK, 'stroke-width': 1.5, 'stroke-linecap': 'round' });
        ell(gp, x, hy + 8, 3.2, mood === 'shout' ? 4.2 : 3, INK);
      }
      if (style === 'beard') e(gp, 'path', { d: `M${x - 11} ${hy + 3} Q${x} ${hy + 22} ${x + 11} ${hy + 3} Q${x} ${hy + 9} ${x - 11} ${hy + 3}Z`, fill: hair });
      if (style === 'glasses') {
        e(gp, 'circle', { cx: x - ex, cy: ey, r: 4.2, fill: 'none', stroke: INK, 'stroke-width': 1.3 });
        e(gp, 'circle', { cx: x + ex, cy: ey, r: 4.2, fill: 'none', stroke: INK, 'stroke-width': 1.3 });
      }
    } else {
      ell(gp, x - 13, hy + 2, 2.6, 3.4, skin);
      ell(gp, x + 13, hy + 2, 2.6, 3.4, skin);
    }
    if (style === 'bun') e(gp, 'circle', { cx: x, cy: hy - 14, r: 6.5, fill: hair });
    if (style === 'curly') [-9, -3, 3, 9].forEach((dx, i) => e(gp, 'circle', { cx: x + dx, cy: hy - 10 - (i % 2) * 2, r: 5.5, fill: hair }));
    if (cap) {
      e(gp, 'path', { d: `M${x - 13.6} ${hy - 1} A13.6 13.6 0 0 1 ${x + 13.6} ${hy - 1} Z`, fill: cap });
      if (toward) e(gp, 'path', { d: `M${x - 13} ${hy - 1} L${x + 17} ${hy - 1} Q${x + 17} ${hy + 3} ${x + 12} ${hy + 3} L${x - 13} ${hy + 3} Z`, fill: cap, opacity: 0.9 });
    }
  }

  /* a table with its guests. guests: [{at:'-x'|'+x'|'-y'|'+y', ...person opts}] */
  function table(gx, gy, topCol, bandCol, guests, items) {
    const dist = 2.0;
    const off = { '-x': [-dist, 0], '+x': [dist, 0], '-y': [0, -dist], '+y': [0, dist] };
    const [tx, ty] = P(gx, gy, 0);
    guests.forEach((gu) => {
      const [dx, dy] = off[gu.at];
      const cx = gx + dx, cy = gy + dy;
      const [sx, sy] = P(cx, cy, 31);
      add(cx + cy, () => {
        const s = g(layer, `translate(${sx} ${sy}) scale(1.28) translate(${-sx} ${-sy})`);
        stool(s, sx, sy);
        person(s, sx, sy + 1, { ...gu, toward: gu.at === '-x' || gu.at === '-y' });
      });
    });
    add(gx + gy, () => {
      const s = g(layer);
      const zt = 70, th = 10, rx = 1.2 * A * R2, ry = 1.2 * A * R2 / 2;
      const ytop = ty - zt;
      ell(s, tx + 16, ty + 10, rx * 1.05, ry * 1.05, '#8A4B1F', { opacity: 0.16 });
      ell(s, tx, ty, 30, 15, '#4A2C1A');
      e(s, 'rect', { x: tx - 7.5, y: ytop, width: 15, height: zt, fill: '#6B4128' });
      ell(s, tx, ytop + th, rx, ry, bandCol);
      e(s, 'rect', { x: tx - rx, y: ytop, width: rx * 2, height: th, fill: bandCol });
      ell(s, tx, ytop, rx, ry, topCol);
      ell(s, tx, ytop, rx * 0.82, ry * 0.82, '#fff', { opacity: 0.14 });
      const ig = g(s, `translate(${tx} ${ytop}) scale(1.18) translate(${-tx} ${-ytop})`);
      (items || []).forEach((it) => it(ig, tx, ytop));
    });
  }

  const cupAt = (dx, dy) => (s, tx, ty) => cup(s, tx + dx, ty + dy);
  const plateAt = (dx, dy, f) => (s, tx, ty) => plate(s, tx + dx, ty + dy, f);
  const spill = (dx, dy) => (s, tx, ty) => {
    const x = tx + dx, y = ty + dy;
    e(s, 'path', { d: `M${x - 14} ${y} q4 -7 12 -4 q8 -4 14 2 q5 5 -3 8 q-9 4 -16 1 q-8 -1 -7 -7Z`, fill: '#8C5230', opacity: 0.85 });
    ell(s, x + 20, y + 2, 5, 2.4, '#EAF6FF', { opacity: 0.9 });
  };

  /* ---- the tables ---- */
  // A (back-left): chaos
  table(2.2, 2.2, TEAL, '#12665A', [
    { at: '-x', shirt: TEAL, skin: SKIN[1], hair: HAIR[0], style: 'beard', mood: 'wave' },
    { at: '-y', shirt: SUN, skin: SKIN[2], hair: HAIR[0], style: 'bun', mood: 'bill' },
  ], [cupAt(-22, 2), plateAt(14, 8, '#F2A33A'), cupAt(24, -6)]);
  // B (back-centre)
  table(6.2, 2.2, TOMATO, '#B93A1E', [
    { at: '-y', shirt: '#8E5BD0', skin: SKIN[0], hair: HAIR[2], style: 'curly', mood: 'shout' },
    { at: '+x', shirt: TOMATO, skin: SKIN[1], hair: HAIR[0], style: 'short', mood: 'wave', cap: '#1B8A7A' },
  ], [plateAt(-14, 2, '#F7A81B'), spill(14, 8), cupAt(2, -8)]);
  // D (right)
  table(9.6, 6.2, GREEN, '#0E3A2A', [
    { at: '-y', shirt: '#F27BA5', skin: SKIN[2], hair: HAIR[0], style: 'long', mood: 'wave' },
    { at: '+x', shirt: SUN, skin: SKIN[0], hair: HAIR[4], style: 'short', mood: 'phone' },
  ], [cupAt(-16, 4), plateAt(14, 6, '#F7A81B')]);
  // E (front)
  table(10, 9.6, '#2B4C7E', '#1F3A63', [
    { at: '-x', shirt: SUN, skin: SKIN[1], hair: HAIR[0], style: 'glasses', mood: 'shout' },
    { at: '+x', shirt: TEAL, skin: SKIN[3], hair: HAIR[3], style: 'bun', mood: 'wave' },
    { at: '+y', shirt: '#3C74C9', skin: SKIN[0], hair: HAIR[2], style: 'short', mood: 'neutral' },
  ], [spill(-12, 6), cupAt(14, 0)]);

  /* ---- the calm QR table ---- */
  function qrMatrix(n) {
    const m = Array.from({ length: n }, () => Array(n).fill(0));
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) m[y][x] = rnd() > 0.52 ? 1 : 0;
    const finder = (ox, oy) => {
      for (let y = -1; y <= 7; y++) for (let x = -1; x <= 7; x++) {
        const xx = ox + x, yy = oy + y;
        if (xx < 0 || yy < 0 || xx >= n || yy >= n) continue;
        let v = 0;
        if (x >= 0 && y >= 0 && x <= 6 && y <= 6) {
          const ring = Math.max(Math.abs(x - 3), Math.abs(y - 3));
          v = ring === 3 || ring <= 1 ? 1 : 0;
        }
        m[yy][xx] = v;
      }
    };
    finder(0, 0); finder(n - 7, 0); finder(0, n - 7);
    for (let i = 8; i < n - 8; i++) { m[6][i] = i % 2 ? 0 : 1; m[i][6] = i % 2 ? 0 : 1; }
    return m;
  }
  const QR = qrMatrix(21);

  table(6, 6, '#CFEFE0', '#8FCDB3', [
    { at: '-x', shirt: '#F27BA5', skin: SKIN[1], hair: HAIR[0], style: 'bun', mood: 'calm' },
    { at: '-y', shirt: TEAL, skin: SKIN[0], hair: HAIR[1], style: 'short', mood: 'calm' },
  ], [
    cupAt(-56, 16), plateAt(54, 20, '#F7A81B'),
  ]);
  // QR standee sits just above the table (drawn after the table)
  add(12.05, () => {
    const [tx, ty] = P(6, 6, 70);
    const s = g(layer);
    ell(s, tx + 2, ty + 6, 50, 11, '#5B8F7C', { opacity: 0.28 });
    // glow behind card
    e(s, 'ellipse', { cx: tx, cy: ty - 62, rx: 92, ry: 92, fill: '#FFE46A', opacity: 0.8, filter: 'url(#blur8)' });
    const w = 100, h = 112;
    const c = g(s, `translate(${tx} ${ty + 2}) matrix(1 .5 0 1 0 0)`);
    e(c, 'rect', { x: -w / 2 - 4, y: -h - 4, width: w + 8, height: h + 8, rx: 10, fill: '#FFF8C8' });
    e(c, 'rect', { x: -w / 2, y: -h, width: w, height: h, rx: 7, fill: '#fff' });
    const n = 21, mw = (w - 14) / n, mh = (h - 14) / n;
    for (let r = 0; r < n; r++) for (let q = 0; q < n; q++) {
      if (QR[r][q]) e(c, 'rect', { x: -w / 2 + 7 + q * mw, y: -h + 7 + r * mh, width: mw + 0.35, height: mh + 0.35, fill: GREEN });
    }
    // sparkles + rays
    [[-66, -134, 9], [68, -128, 11], [-26, -160, 6], [32, -166, 7]].forEach(([dx, dy, r]) => {
      e(s, 'path', {
        d: `M${tx + dx} ${ty + dy - r} Q${tx + dx} ${ty + dy} ${tx + dx + r} ${ty + dy} Q${tx + dx} ${ty + dy} ${tx + dx} ${ty + dy + r} Q${tx + dx} ${ty + dy} ${tx + dx - r} ${ty + dy} Q${tx + dx} ${ty + dy} ${tx + dx} ${ty + dy - r}Z`,
        fill: '#fff', stroke: '#F0B400', 'stroke-width': 2, 'stroke-linejoin': 'round',
      });
    });
  });

  /* ---- counter along the left edge ---- */
  add(5, () => {
    const s = g(layer);
    box(s, 0, 4.4, 1.3, 8.4, 0, 54, '#FFF8EA', '#C07A45', '#A9653A');
    // panel lines on the long face
    for (let i = 1; i < 4; i++) {
      const y = 4.4 + i * 1.0;
      e(s, 'line', { x1: P(1.3, y, 6)[0], y1: P(1.3, y, 6)[1], x2: P(1.3, y, 44)[0], y2: P(1.3, y, 44)[1], stroke: '#8E522C', 'stroke-width': 3, opacity: 0.55 });
    }
    // espresso machine
    box(s, 0.25, 4.9, 1.05, 6.2, 54, 98, '#FF7A5C', '#E4482A', '#B93A1E');
    box(s, 0.45, 5.15, 0.85, 5.55, 98, 112, '#B8C0C8', '#98A1AA', '#7C858F');
    box(s, 0.28, 4.98, 1.02, 6.12, 66, 70, '#2A1A12', '#2A1A12', '#2A1A12');
    // cups
    [[0.55, 6.7], [0.55, 7.05], [0.55, 7.4]].forEach(([x, y]) => { const [cx, cy] = P(x, y, 62); cup(s, cx, cy); });
    // till
    box(s, 0.3, 7.7, 1.0, 8.3, 54, 68, '#3A3A4E', '#2C2C3E', '#20202E');
    const t = [P(0.3, 7.7, 68), P(1.0, 7.7, 68), P(1.0, 7.7, 90), P(0.3, 7.7, 90)];
    e(s, 'polygon', { points: pts(t), fill: '#3A3A4E' });
    const t2 = [P(0.38, 7.7, 71), P(0.92, 7.7, 71), P(0.92, 7.7, 86), P(0.38, 7.7, 86)];
    e(s, 'polygon', { points: pts(t2), fill: '#7FD1FF' });
  });

  /* ---- menu stack (top-right corner) ---- */
  add(10.6 + 1.7, () => {
    const [bx, by] = P(10.2, 1.8, 0);
    const s = g(layer);
    const sheets = 17, step = 11;
    // shadow
    const sh = g(s, `translate(${bx + 20} ${by + 12}) matrix(1 .5 -1 .5 0 0)`);
    e(sh, 'rect', { x: -34, y: -46, width: 68, height: 92, fill: '#8A4B1F', opacity: 0.16 });
    for (let i = 0; i < sheets; i++) {
      const lean = i * i * 0.07;
      const du = Math.sin(i * 1.7) * 7 + lean * 0.5;
      const dv = Math.cos(i * 1.1) * 6 - lean * 0.3;
      const ang = Math.sin(i * 2.3) * 5;
      const z = i * step;
      const X = bx, Y = by - z;
      const tr = `translate(${X} ${Y}) matrix(1 .5 -1 .5 0 0) translate(${du} ${dv}) rotate(${ang})`;
      const gd = g(s, `translate(${X} ${Y + 8}) matrix(1 .5 -1 .5 0 0) translate(${du} ${dv}) rotate(${ang})`);
      e(gd, 'rect', { x: -34, y: -46, width: 68, height: 92, fill: '#D9C69A' });
      const gt = g(s, tr);
      e(gt, 'rect', { x: -34, y: -46, width: 68, height: 92, fill: i % 2 ? '#FFFFFF' : '#FFF6E2' });
      // grey rows + one red strike per sheet
      for (let r = 0; r < 4; r++) {
        e(gt, 'rect', { x: -26, y: -32 + r * 18, width: 28 + ((i + r) % 3) * 4, height: 4, rx: 2, fill: '#CFC2A3' });
        e(gt, 'rect', { x: 14, y: -32 + r * 18, width: 12, height: 4, rx: 2, fill: '#CFC2A3' });
      }
      const sr = (i * 5) % 4;
      e(gt, 'line', { x1: 8, y1: -30 + sr * 18, x2: 29, y2: -34 + sr * 18, stroke: '#E01E1E', 'stroke-width': 3, 'stroke-linecap': 'round' });
      if (i === sheets - 1) {
        // top sheet: real text
        e(gt, 'rect', { x: -34, y: -46, width: 68, height: 92, fill: '#FFFDF6' });
        e(gt, 'text', { x: 0, y: -28, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 900, fill: INK, 'font-family': 'Inter, sans-serif' }, 'MENU');
        [['Latte', '৳350'], ['Burger', '৳420'], ['Club', '৳380']].forEach(([n, p], r) => {
          const yy = -8 + r * 20;
          e(gt, 'text', { x: -28, y: yy, 'font-size': 9.5, 'font-weight': 700, fill: INK, 'font-family': 'Inter, sans-serif' }, n);
          e(gt, 'text', { x: 28, y: yy, 'text-anchor': 'end', 'font-size': 9.5, 'font-weight': 800, fill: INK, 'font-family': 'Inter, FreeSans, sans-serif' }, p);
          e(gt, 'line', { x1: 3, y1: yy - 3.5, x2: 30, y2: yy - 4, stroke: '#E01E1E', 'stroke-width': 2.2, 'stroke-linecap': 'round' });
        });
      }
    }
    // wobble marks
    const [tx, ty] = [bx, by - sheets * step];
    [[-60, 6, -1], [64, 4, 1]].forEach(([dx, dy, sg]) => {
      e(s, 'path', { d: `M${tx + dx} ${ty + dy} q${sg * 10} -12 0 -24`, fill: 'none', stroke: INK, 'stroke-width': 4, 'stroke-linecap': 'round' });
      e(s, 'path', { d: `M${tx + dx + sg * 14} ${ty + dy + 8} q${sg * 12} -20 0 -38`, fill: 'none', stroke: INK, 'stroke-width': 4, 'stroke-linecap': 'round' });
    });
  });
  // two fallen menus on the floor
  add(9.6, () => {
    const s = g(layer);
    [[8.7, 0.8, 24], [10.8, 4.2, -18]].forEach(([x, y, r]) => {
      const [sx, sy] = P(x, y);
      const m = g(s, `translate(${sx} ${sy}) matrix(1 .5 -1 .5 0 0) rotate(${r})`);
      e(m, 'rect', { x: -30, y: -40, width: 60, height: 80, fill: '#FFF8E8', stroke: '#E3D1A8', 'stroke-width': 2 });
      for (let q = 0; q < 4; q++) e(m, 'rect', { x: -22, y: -28 + q * 17, width: 30, height: 4, rx: 2, fill: '#CFC2A3' });
      e(m, 'line', { x1: -24, y1: -20, x2: 24, y2: -28, stroke: '#E01E1E', 'stroke-width': 3, 'stroke-linecap': 'round' });
    });
  });

  /* ---- a plant by the back corner ---- */
  function plant(gx, gy) {
    add(gx + gy, () => {
      const [x, y] = P(gx, gy);
      const s = g(layer);
      ell(s, x + 8, y + 4, 26, 12, '#8A4B1F', { opacity: 0.18 });
      ell(s, x, y, 22, 11, '#B5522C');
      e(s, 'path', { d: `M${x - 22} ${y - 34} L${x - 17} ${y} Q${x} ${y + 12} ${x + 17} ${y} L${x + 22} ${y - 34}Z`, fill: '#D0623A' });
      ell(s, x, y - 34, 22, 11, '#A24726');
      const leaf = (dx, dy, rot, c) => e(s, 'ellipse', { cx: x + dx, cy: y - 34 + dy, rx: 10, ry: 26, fill: c, transform: `rotate(${rot} ${x + dx} ${y - 34 + dy + 20})` });
      leaf(0, -34, 0, '#2E9D5B'); leaf(-14, -26, -32, '#238A4B'); leaf(14, -26, 32, '#238A4B'); leaf(-24, -12, -62, '#2E9D5B'); leaf(24, -12, 62, '#2E9D5B');
    });
  }

  D.sort((a, b) => a.k - b.k).forEach((d) => d.fn());

  /* ---------- foreground: the owner, from behind ---------- */
  (function owner() {
    const cx = 246, og = g(root);
    // stamp card in the air
    const sc = g(og, `translate(${cx + 2} 826) rotate(-10)`);
    e(sc, 'path', { d: 'M-66 -38 Q-20 -46 24 -40 Q50 -37 66 -42 L62 -4 Q70 18 62 40 Q22 46 -24 38 Q-48 34 -64 42 Q-72 4 -66 -38Z', fill: '#F6E9C6', stroke: INK, 'stroke-width': 4.5, 'stroke-linejoin': 'round' });
    e(sc, 'path', { d: 'M-65 -37 Q-20 -45 24 -39 Q50 -36 65 -41 L64 -24 Q22 -22 -24 -26 Q-48 -28 -66 -22Z', fill: TOMATO });
    e(sc, 'path', { d: 'M-12 -44 Q-4 -2 -16 38 M32 -40 Q24 4 34 42', stroke: '#CDB98A', 'stroke-width': 2.6, fill: 'none', 'stroke-linecap': 'round' });
    e(sc, 'path', { d: 'M48 40 L66 18 L66 42Z', fill: '#E2CF9F', stroke: INK, 'stroke-width': 3, 'stroke-linejoin': 'round' });
    [-34, 0, 34].forEach((x, i) => {
      e(sc, 'circle', { cx: x, cy: -4, r: 10, fill: i < 2 ? TOMATO : 'none', stroke: INK, 'stroke-width': 2.4 });
      e(sc, 'circle', { cx: x, cy: 22, r: 10, fill: 'none', stroke: INK, 'stroke-width': 2.4, 'stroke-dasharray': '4 3' });
      if (i < 2) e(sc, 'path', { d: `M${x - 4.5} -3.5 l3.5 4 l6 -8`, fill: 'none', stroke: '#fff', 'stroke-width': 2.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    });
    // arcs around the card (tossed)
    e(og, 'path', { d: `M${cx - 96} 836 q-14 -26 8 -44 M${cx - 112} 852 q-20 -34 6 -62`, fill: 'none', stroke: INK, 'stroke-width': 4.5, 'stroke-linecap': 'round' });
    e(og, 'path', { d: `M${cx + 104} 832 q14 -26 -8 -44 M${cx + 120} 850 q20 -34 -6 -62`, fill: 'none', stroke: INK, 'stroke-width': 4.5, 'stroke-linecap': 'round' });

    // notebook (left hand)
    const nb = g(og, `translate(${cx - 158} 882) rotate(-12)`);
    e(nb, 'rect', { x: -66, y: -80, width: 132, height: 160, rx: 10, fill: '#fff', stroke: INK, 'stroke-width': 5 });
    e(nb, 'rect', { x: -66, y: -80, width: 22, height: 160, rx: 10, fill: TOMATO, stroke: INK, 'stroke-width': 5 });
    for (let i = 0; i < 6; i++) e(nb, 'circle', { cx: -55, cy: -58 + i * 24, r: 4.5, fill: '#FFF3DC' });
    e(nb, 'text', { x: 14, y: -14, 'text-anchor': 'middle', 'font-size': 28, 'font-weight': 900, 'font-style': 'italic', fill: INK, 'font-family': 'Inter, sans-serif' }, 'Best');
    e(nb, 'text', { x: 14, y: 22, 'text-anchor': 'middle', 'font-size': 21, 'font-weight': 900, 'font-style': 'italic', fill: TOMATO, 'font-family': 'Inter, sans-serif' }, 'seller???');
    e(nb, 'path', { d: 'M-18 38 q30 -8 64 0', stroke: TOMATO, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' });

    // phone (right hand)
    const pn = g(og, `translate(${cx + 158} 892) rotate(11)`);
    e(pn, 'rect', { x: -36, y: -66, width: 72, height: 132, rx: 14, fill: INK });
    e(pn, 'rect', { x: -30, y: -58, width: 60, height: 112, rx: 8, fill: '#7FD1FF' });
    e(pn, 'rect', { x: -12, y: -62, width: 24, height: 5, rx: 2.5, fill: INK });
    [[-4, -30, 'Bill?'], [0, -4, 'Order?'], [4, 22, 'Menu?']].forEach(([dx, y, t]) => {
      e(pn, 'rect', { x: -24 + dx * 0, y: y - 12, width: 48, height: 20, rx: 6, fill: '#fff' });
      e(pn, 'text', { x: 0, y: y + 3, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 800, fill: INK, 'font-family': 'Inter, sans-serif' }, t);
    });
    e(pn, 'circle', { cx: 30, cy: -58, r: 15, fill: '#E01E1E', stroke: '#fff', 'stroke-width': 3 });
    e(pn, 'text', { x: 30, y: -52.5, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 900, fill: '#fff', 'font-family': 'Inter, sans-serif' }, '9+');

    // body
    const skin = '#E6AE84', hair = '#2A1A12';
    e(og, 'path', { d: `M${cx - 132} 1360 L${cx - 126} 1196 Q${cx - 122} 1130 ${cx - 62} 1110 L${cx + 62} 1110 Q${cx + 122} 1130 ${cx + 126} 1196 L${cx + 132} 1360Z`, fill: 'url(#blazer)' });
    e(og, 'path', { d: `M${cx} 1140 L${cx} 1360`, stroke: '#1F3A63', 'stroke-width': 4 });
    e(og, 'path', { d: `M${cx - 126} 1196 Q${cx - 100} 1224 ${cx - 92} 1262`, stroke: '#1F3A63', 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round', opacity: 0.8 });
    e(og, 'path', { d: `M${cx + 126} 1196 Q${cx + 100} 1224 ${cx + 92} 1262`, stroke: '#1F3A63', 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round', opacity: 0.8 });
    // arms
    const arm = (sx, ex, wx) => {
      e(og, 'path', { d: `M${cx + sx * 98} 1164 L${cx + sx * 170} 1090 L${cx + sx * 150} 990`, fill: 'none', stroke: '#2B4C7E', 'stroke-width': 54, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
      e(og, 'path', { d: `M${cx + sx * 170} 1090 L${cx + sx * 150} 990`, fill: 'none', stroke: '#34588C', 'stroke-width': 18, 'stroke-linecap': 'round', opacity: 0.5 });
      e(og, 'line', { x1: cx + sx * 151, y1: 996, x2: cx + sx * 149, y2: 974, stroke: '#FFF6E6', 'stroke-width': 56 });
      ell(og, cx + sx * 148, 950, 27, 25, skin);
      ell(og, cx + sx * (148 - sx * 22), 944, 9, 14, skin, { transform: `rotate(${-sx * 20} ${cx + sx * 126} 944)` });
    };
    arm(-1); arm(1);
    // neck + collar
    e(og, 'rect', { x: cx - 24, y: 1030, width: 48, height: 80, rx: 14, fill: skin });
    e(og, 'rect', { x: cx - 24, y: 1030, width: 48, height: 24, rx: 10, fill: '#CF976E', opacity: 0.7 });
    e(og, 'path', { d: `M${cx - 34} 1086 Q${cx} 1112 ${cx + 34} 1086 L${cx + 42} 1112 Q${cx} 1136 ${cx - 42} 1112Z`, fill: '#FFF6E6' });
    e(og, 'path', { d: `M${cx - 66} 1114 Q${cx} 1160 ${cx + 66} 1114 L${cx + 54} 1102 Q${cx} 1136 ${cx - 54} 1102Z`, fill: '#223F6B' });
    // head (hair only: seen from behind)
    ell(og, cx - 61, 1004, 10, 15, skin);
    ell(og, cx + 61, 1004, 10, 15, skin);
    e(og, 'circle', { cx, cy: 985, r: 62, fill: hair });
    e(og, 'path', { d: `M${cx - 44} 950 Q${cx} 918 ${cx + 44} 950`, fill: 'none', stroke: '#4A3324', 'stroke-width': 9, 'stroke-linecap': 'round' });
    e(og, 'path', { d: `M${cx - 50} 1020 Q${cx} 1052 ${cx + 50} 1020`, fill: 'none', stroke: '#1A0F09', 'stroke-width': 7, 'stroke-linecap': 'round' });
    // sweat + stress marks
    const drop = (x, y, s) => e(og, 'path', { d: `M${x} ${y - 16 * s} C${x + 11 * s} ${y - 2 * s} ${x + 12 * s} ${y + 8 * s} ${x} ${y + 13 * s} C${x - 12 * s} ${y + 8 * s} ${x - 11 * s} ${y - 2 * s} ${x} ${y - 16 * s}Z`, fill: '#9EDCFF', stroke: INK, 'stroke-width': 3 });
    drop(cx - 96, 958, 1.1); drop(cx + 98, 940, 0.9);
    e(og, 'path', { d: `M${cx - 44} 906 l-10 -18 M${cx} 898 l0 -22 M${cx + 44} 906 l10 -18`, stroke: INK, 'stroke-width': 5, 'stroke-linecap': 'round' });
  })();

  /* ---------- speech bubbles (all at once, playful mess) ---------- */
  function bubble(x, y, w, lines, fill, rot, tipG, fs = 31) {
    lines = [].concat(lines);
    const h = lines.length > 1 ? 104 : 70;
    const b = g(root, `translate(${x} ${y}) rotate(${rot})`);
    const th = (rot * Math.PI) / 180, dx = tipG[0] - x, dy = tipG[1] - y;
    const tx = dx * Math.cos(th) + dy * Math.sin(th), ty = -dx * Math.sin(th) + dy * Math.cos(th);
    const bx = Math.max(44, Math.min(w - 44, tx));
    e(b, 'path', { d: `M${bx - 20} ${h - 4} L${tx} ${ty} L${bx + 16} ${h - 4}`, fill, stroke: INK, 'stroke-width': 4.5, 'stroke-linejoin': 'round' });
    e(b, 'rect', { x: 0, y: 0, width: w, height: h, rx: Math.min(35, h / 2), fill, stroke: INK, 'stroke-width': 4.5 });
    e(b, 'path', { d: `M${bx - 17} ${h - 2.5} L${bx + 13} ${h - 2.5}`, stroke: fill, 'stroke-width': 7 });
    lines.forEach((t, i) => e(b, 'text', { x: w / 2, y: (lines.length > 1 ? 44 : 46) + i * 36, 'text-anchor': 'middle', 'font-size': fs, 'font-weight': 900, fill: INK, 'font-family': 'Inter, FreeSans, sans-serif' }, t));
  }
  // tails point at the speaker below
  bubble(56, 398, 372, 'Where’s our order?', '#FF8A6B', -4, [440, 520]);
  bubble(452, 350, 268, 'Bill please!', '#FFFFFF', -5, [662, 466]);
  bubble(676, 428, 196, ['Can I get', 'a waiter?'], '#FFFFFF', 3, [822, 622], 29);
  bubble(884, 512, 192, ['Is this', 'still ৳380?'], '#FFE45C', 5, [958, 658], 28);
})();
