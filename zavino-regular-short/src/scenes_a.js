// ───────────────────────────── scenes, part A: the pain, the reveal, the scan ─────────────────────────────
const NILA = { skin: "#c68a62", hair: "bun", hairC: "#2a1b15", top: Z.sand, apron: Z.f800, pants: Z.f900 };
const RAFI = { skin: "#b97d57", hair: "cap", hairC: "#241913", capC: Z.terra, top: "#e08a62", hood: true, pants: Z.f900 };
const TANIA = { skin: "#d1976f", hair: "bob", hairC: "#1f1713", top: "#6c8fb8", pants: Z.f900 };
const GHOST = [Z.f300, Z.sand2, Z.f400, Z.sand, Z.f200, "#d9b9a1", Z.f500];
const soft = (k, a, b) => { k.sky({ stops: [a || Z.f100, b || Z.linen] }); const g = k.g; [[0.15, 0.2, 330, Z.f200], [0.86, 0.46, 380, Z.sand], [0.3, 0.88, 300, Z.f200]].forEach(([x, y, r, c], i) => circle(g, k.X(x) + Math.sin(k.t * 0.5 + i * 2) * 30 * k.u, k.Y(y) + Math.cos(k.t * 0.4 + i) * 24 * k.u, r * k.u, k.alpha(c, 0.55))); };
const tagCard = (k, x, y, w, label, a) => { if (a <= 0) return; const g = k.g; g.save(); g.globalAlpha = a; rr(g, x - w / 2, y, w, 54 * k.u, 14 * k.u, Z.white, "rgba(22,53,36,0.15)", 3 * k.u); txt(g, label, x, y + 28 * k.u, 28 * k.u, Z.grey, 700); g.restore(); };
const tableCloth = (k, x, topY, w, floorY, col) => { const g = k.g; g.beginPath(); g.moveTo(x - w / 2, topY); g.lineTo(x + w / 2, topY); g.lineTo(x + w * 0.58, floorY); g.lineTo(x - w * 0.58, floorY); g.closePath(); g.fillStyle = col || Z.f700; g.fill(); rr(g, x - w / 2 - 8 * k.u, topY - 22 * k.u, w + 16 * k.u, 30 * k.u, 12 * k.u, Z.woodLt); g.fillStyle = "rgba(255,255,255,0.08)"; g.fillRect(x - w * 0.5, topY + 40 * k.u, w, 10 * k.u); };
const chairBack = (k, x, y, w, h) => { const g = k.g; rr(g, x - w / 2, y - h, w, h, w * 0.3, Z.woodDk); rr(g, x - w * 0.38, y - h * 0.9, w * 0.76, h * 0.55, w * 0.22, Z.wood); };

window.SCENES = {
  // 1 — "Every week, hundreds of people"
  "crowd-count": (k) => {
    cafe(k); const g = k.g, t = k.t, fy = k.Y(0.745);
    const seq = [[-0.15, 0.45, 520], [-0.3, 0.38, 470], [-0.5, 0.55, 560], [-0.72, 0.47, 500], [-0.9, 0.4, 480], [-1.1, 0.52, 540]];
    seq.forEach(([x0, sp, h], i) => { const x = x0 + t * sp * 0.9; person(k, { x: k.X(x), y: fy + (i % 3) * 18 * k.u, h, ghost: true, ghostColor: GHOST[i % GHOST.length], walk: 1.7 + i * 0.1, ph: i, arms: "down" }); });
    shadow(k, k.X(0.86), k.Y(0.77), 420 * k.u, 0.1);
    person(k, { x: k.X(0.86), y: k.Y(0.7), h: 600, ...NILA, mood: "happy", arms: "wipe" });
    counter(k, { x0: 0.6, x1: 1.04, top: 0.64, bottom: 0.77, props: false });
    const n = Math.round(lerp(0, 312, ease(t / 1.5))); const pw = 640 * k.u, px = k.X(0.5) - pw / 2, py = k.Y(0.14); const sc = 1 + 0.04 * Math.sin(t * 14) * (t < 1.5 ? 1 : 0);
    g.save(); g.translate(k.X(0.5), py + 70 * k.u); g.scale(sc, sc); g.translate(-k.X(0.5), -(py + 70 * k.u)); card(k, { x: px, y: py, w: pw, h: 140 * k.u, r: 70 * k.u, fill: Z.f900 });
    txt(g, String(n), px + 190 * k.u, py + 72 * k.u, 100 * k.u, Z.amberLt, 800); txt(g, "customers", px + 480 * k.u, py + 52 * k.u, 38 * k.u, Z.f200, 700); txt(g, "this week", px + 480 * k.u, py + 96 * k.u, 38 * k.u, Z.f300, 600); g.restore();
  },
  // 2 — "walk into your café."
  "door-stream": (k) => {
    cafe(k); const g = k.g, t = k.t, fy = k.Y(0.745), dx = k.X(0.5);
    door(k, { x: dx, y: k.Y(0.7), w: 380, h: 800, open: ease(t / 0.2) * 0.95 });
    const ring = Math.sin(t * 22) * Math.max(0, 1 - t * 0.9) * 0.5; bell(k, dx + 150 * k.u, k.Y(0.7) - 840 * k.u, 70, ring); txt(g, "ding!", dx + 150 * k.u, k.Y(0.7) - 960 * k.u, 46 * k.u, Z.f800, 800);
    for (let i = 0; i < 7; i++) { const t0 = i * 0.2, tt = t - t0; if (tt < 0) continue; const side = i % 2 ? 1 : -1, tx = dx + side * (260 + (i % 4) * 110 + Math.floor(i / 2) * 20) * k.u, p = outCubic(tt / 1.1), x = lerp(dx, tx, p), sc = lerp(0.55, 1, p), h = 520 * sc;
      person(k, { x, y: fy - (1 - p) * 70 * k.u, h, ghost: true, ghostColor: GHOST[i % GHOST.length], walk: tt < 1.1 ? 2.2 : 0, ph: i, flip: side < 0, alpha: clamp01(tt / 0.12) }); }
  },
  // 3 — "And you don't know"
  "nila-blank": (k) => {
    cafe(k, { dim: 0.1 }); const g = k.g, t = k.t;
    const p = person(k, { x: k.X(0.5), y: k.Y(0.72), h: 800, ...NILA, mood: "worried", arms: "think", look: [Math.sin(t * 1.5) * 0.8, -0.2], sq: 1 + Math.sin(t * 2) * 0.005 });
    counter(k, { x0: -0.05, x1: 1.05, top: 0.64, bottom: 0.78, props: false });
    // a blank notebook on the counter
    const nx = k.X(0.5), ny = k.Y(0.64) - 30 * k.u; g.save(); g.translate(nx, ny); g.rotate(-0.04); rr(g, -230 * k.u, -26 * k.u, 460 * k.u, 70 * k.u, 10 * k.u, Z.white, "rgba(22,53,36,0.2)", 3 * k.u);
    g.strokeStyle = "rgba(22,53,36,0.18)"; g.lineWidth = 3 * k.u; for (let i = 0; i < 2; i++) { g.beginPath(); g.moveTo(-190 * k.u, -2 * k.u + i * 28 * k.u); g.lineTo(190 * k.u, -2 * k.u + i * 28 * k.u); g.stroke(); } txt(g, "customers:", -130 * k.u, 6 * k.u, 30 * k.u, Z.grey, 700); g.restore();
    [[-0.28, 0.05], [0.3, 0.02], [0.02, -0.06]].forEach(([dx, dy], i) => qmark(k, k.X(0.5 + dx), p.top - 40 * k.u + dy * k.H - i * 20 * k.u, 150, 0.25 + i * 0.3));
  },
  // 4 — "a single one."
  "ghost-lineup": (k) => {
    cafe(k); const g = k.g, t = k.t, fy = k.Y(0.745);
    const ps = []; for (let i = 0; i < 5; i++) { const x = k.X(0.12 + i * 0.19); shadow(k, x, fy + 6 * k.u, 230 * k.u, 0.1); ps.push([x, person(k, { x, y: fy, h: 620, ghost: true, ghostColor: GHOST[i], ph: i * 0.8, sq: 1 + Math.sin(t * 2 + i) * 0.006 })]); }
    ps.forEach(([x, p], i) => { qmark(k, x, p.top - 110 * k.u, 110, 0.15 + i * 0.22); tagCard(k, x, fy - 330 * k.u, 170 * k.u, "no name", ease((t - 0.3 - i * 0.2) / 0.2)); });
  },
  // 5 — "Who's a regular?"
  "who-regular": (k) => {
    cafe(k); const g = k.g, t = k.t, fy = k.Y(0.72);
    for (let i = 0; i < 4; i++) { const x = k.X(0.15 + i * 0.235); person(k, { x, y: fy, h: 680, ghost: true, ghostColor: GHOST[(i + 1) % 5], ph: i }); shadow(k, x, fy + 6 * k.u, 250 * k.u, 0.1); }
    const mx = lerp(k.X(0.1), k.X(0.9), ease((t - 0.1) / 1.3)), my = k.Y(0.42) + Math.sin(t * 5) * 14 * k.u; g.save(); g.translate(mx, my); g.strokeStyle = Z.f800; g.lineWidth = 22 * k.u; g.lineCap = "round"; g.beginPath(); g.arc(0, 0, 150 * k.u, 0, 7); g.stroke(); g.fillStyle = "rgba(206,224,213,0.35)"; g.fill(); g.beginPath(); g.moveTo(106 * k.u, 106 * k.u); g.lineTo(250 * k.u, 250 * k.u); g.stroke(); txt(g, "?", 0, 4 * k.u, 170 * k.u, Z.f800, 800); g.restore();
    const b = pop(k, 0.05, 0.3); g.save(); g.translate(k.X(0.5), k.Y(0.14)); g.scale(b, b); pill(g, -270 * k.u, -62 * k.u, 540 * k.u, 124 * k.u, Z.f900, "a regular?", Z.linen, 62 * k.u, 800); g.restore();
  },
  // 6 — "Who spends the most?"
  "who-spender": (k) => {
    cafe(k); const g = k.g, t = k.t, fy = k.Y(0.72);
    [[0.2, 560, 0], [0.5, 700, 1], [0.8, 600, 2]].forEach(([fx, h, i]) => { const x = k.X(fx); person(k, { x, y: fy, h, ghost: true, ghostColor: GHOST[i + 2], ph: i }); shadow(k, x, fy + 6 * k.u, 250 * k.u, 0.1);
      const s = pop(k, 0.12 + i * 0.3, 0.3), y = fy - h - 120 * k.u; g.save(); g.translate(x, y); g.scale(s, s); card(k, { x: -150 * k.u, y: -62 * k.u, w: 300 * k.u, h: 124 * k.u, r: 62 * k.u, fill: Z.white }); txt(g, "৳ ???", 0, 3 * k.u, 62 * k.u, Z.f800, 800); g.restore(); });
    for (let i = 0; i < 7; i++) { const tt = (t * 0.5 + i * 0.21) % 1; g.save(); g.globalAlpha = Math.sin(tt * Math.PI) * 0.8; txt(g, "৳", k.X(0.08 + hash(i) * 0.84), k.Y(0.3) - tt * 260 * k.u, 70 * k.u, Z.amber, 800); g.restore(); }
  },
  // 7 — "And when someone's unhappy,"
  "unhappy-sip": (k) => {
    cafe(k, { dim: 0.16 }); const g = k.g, t = k.t, fy = k.Y(0.73);
    person(k, { x: k.X(0.84), y: k.Y(0.62), h: 400, ...NILA, mood: "happy", arms: "wipe", look: [-1, 0] });
    counter(k, { x0: 0.62, x1: 1.04, top: 0.55, bottom: 0.64, props: false });
    chairBack(k, k.X(0.4), fy, 260 * k.u, 520 * k.u);
    person(k, { x: k.X(0.4), y: fy, h: 760, ...TANIA, mood: t > 0.45 ? "angry" : "sad", arms: "hold", look: [0.2, 0.7], tear: false, sq: 1 + Math.sin(t * 2) * 0.004 });
    tableCloth(k, k.X(0.4), k.Y(0.575), 560 * k.u, fy);
    // a cold coffee: ice-cube glass, no steam
    const cx = k.X(0.4) + 190 * k.u, cy = k.Y(0.575) - 22 * k.u; g.save(); g.beginPath(); g.moveTo(cx - 70 * k.u, cy - 190 * k.u); g.lineTo(cx + 70 * k.u, cy - 190 * k.u); g.lineTo(cx + 54 * k.u, cy); g.lineTo(cx - 54 * k.u, cy); g.closePath(); g.fillStyle = "rgba(125,86,54,0.9)"; g.fill(); g.strokeStyle = "rgba(255,255,255,0.7)"; g.lineWidth = 6 * k.u; g.stroke();
    rr(g, cx - 40 * k.u, cy - 168 * k.u, 44 * k.u, 44 * k.u, 8 * k.u, "rgba(255,255,255,0.5)"); rr(g, cx + 6 * k.u, cy - 120 * k.u, 40 * k.u, 40 * k.u, 8 * k.u, "rgba(255,255,255,0.4)"); g.strokeStyle = Z.amber; g.lineWidth = 9 * k.u; g.beginPath(); g.moveTo(cx + 24 * k.u, cy - 190 * k.u); g.lineTo(cx + 70 * k.u, cy - 300 * k.u); g.stroke(); g.restore();
    const s = pop(k, 0.35, 0.3); g.save(); g.translate(k.X(0.4) + 330 * k.u, k.Y(0.2)); g.scale(s, s); card(k, { x: -150 * k.u, y: -66 * k.u, w: 300 * k.u, h: 132 * k.u, r: 66 * k.u, fill: Z.white }); txt(g, "…", 0, -4 * k.u, 90 * k.u, Z.muted, 800); g.restore();
  },
  // 8 — "they don't tell you."
  "quiet-exit": (k) => {
    cafe(k, { dim: 0.16 }); const g = k.g, t = k.t, fy = k.Y(0.73), dx = k.X(0.84);
    door(k, { x: dx, y: k.Y(0.7), w: 340, h: 760, open: ease((t - 0.55) / 0.35) * 0.95 });
    const ring = t > 0.9 ? Math.sin((t - 0.9) * 22) * Math.max(0, 1 - (t - 0.9) * 0.9) * 0.55 : 0; bell(k, dx + 140 * k.u, k.Y(0.7) - 800 * k.u, 66, ring);
    const wp = ease((t - 0.1) / 1.2); const x = lerp(k.X(0.34), k.X(0.88), wp), moving = wp > 0 && wp < 1;
    person(k, { x: k.X(0.2), y: k.Y(0.62), h: 400, ...NILA, mood: "happy", arms: "wipe", look: [-1, 0.1] });
    counter(k, { x0: -0.05, x1: 0.42, top: 0.55, bottom: 0.64, props: false });
    person(k, { x, y: fy, h: 700, ...TANIA, mood: "sad", walk: moving ? 2.4 : 0, arms: "down", look: [1, 0.2], alpha: 1 - clamp01((wp - 0.86) / 0.14) });
    cup(k, k.X(0.34), k.Y(0.72), 120, Z.f700);
    if (t > 0.92) { const a = Math.sin(clamp01((t - 0.92) / 0.8) * Math.PI); g.save(); g.globalAlpha = a; txt(g, "ding", dx + 150 * k.u, k.Y(0.7) - 930 * k.u, 46 * k.u, Z.f800, 800); g.restore(); }
  },
  // 9 — "They just leave."
  "door-close": (k) => {
    cafe(k, { dim: 0.22 }); const g = k.g, t = k.t, fy = k.Y(0.73), dx = k.X(0.5);
    door(k, { x: dx, y: k.Y(0.7), w: 420, h: 860, open: 1 - ease(t / 0.55), out1: "#e8dcc0", out2: "#f1e8d2" });
    const wx = lerp(dx - 110 * k.u, dx + 40 * k.u, clamp01(t / 1.6)); g.save(); g.beginPath(); g.rect(dx - 210 * k.u, k.Y(0.7) - 860 * k.u, 420 * k.u, 860 * k.u); g.clip(); g.globalAlpha = 0.92 * clamp01(t / 0.5); person(k, { x: wx, y: k.Y(0.7), h: 340, ghost: true, ghostColor: Z.f700, walk: 2.2, flip: false }); g.restore();
    const ring = Math.sin(t * 20) * Math.max(0, 1 - t * 0.8) * 0.55; bell(k, dx + 180 * k.u, k.Y(0.7) - 920 * k.u, 70, ring);
    chairBack(k, k.X(0.2), fy, 220 * k.u, 440 * k.u); tableCloth(k, k.X(0.2), k.Y(0.6), 420 * k.u, fy);
    cup(k, k.X(0.2), k.Y(0.6) - 80 * k.u, 130, Z.f700);
    const a = clamp01((t - 0.6) / 0.4); g.save(); g.globalAlpha = a; g.translate(k.X(0.81), k.Y(0.4)); g.rotate(0.08); txt(g, "gone.", 0, 0, 76 * k.u, Z.f800, 800); g.restore();
  },
  // 10 — "Then post one star."
  "one-star": (k) => {
    soft(k, "#efe7d6", "#e4dac4"); const g = k.g, t = k.t; previewTag(k);
    const ph = phone(k, { x: k.X(0.5), y: k.Y(0.43), h: 1140, bg: Z.white });
    clipScreen(g, ph, () => {
      const x0 = ph.x, y0 = ph.y, w = ph.w, u = ph.u; g.fillStyle = Z.linen; g.fillRect(x0, y0, w, 150 * u * 1.2);
      txt(g, "Café 27 · Dhanmondi", x0 + w / 2, y0 + 80 * u, 36 * u, Z.f800, 800); txt(g, "Reviews", x0 + w / 2, y0 + 128 * u, 28 * u, Z.muted, 600);
      const fall = t < 0.6 ? 1 - outBack(t / 0.6) * 0 : 0; // review card drops in
      const cy = y0 + 260 * u + (1 - clamp01(t / 0.45) ** 0.5) * -300 * u; g.globalAlpha = clamp01(t / 0.2);
      rr(g, x0 + 36 * u, cy, w - 72 * u, 520 * u, 30 * u, Z.f50, "rgba(22,53,36,0.12)", 3 * u); circle(g, x0 + 110 * u, cy + 90 * u, 44 * u, Z.sand2); txt(g, "T", x0 + 110 * u, cy + 92 * u, 44 * u, Z.f800, 800); txt(g, "Tania", x0 + 180 * u, cy + 76 * u, 38 * u, Z.ink, 800, "left"); txt(g, "just now", x0 + 180 * u, cy + 120 * u, 28 * u, Z.grey, 600, "left");
      const sp = t > 0.4 ? 1 : 0; stars(k, { x: x0 + 88 * u + 2.36 * 62 * u, y: cy + 218 * u, size: 62 * u / k.u, n: sp ? 1 : 0, popT: 0.4 });
      g.globalAlpha = clamp01((t - 0.55) / 0.25); txt(g, "Cold coffee.", x0 + 80 * u, cy + 330 * u, 44 * u, Z.ink, 700, "left"); txt(g, "Never coming back.", x0 + 80 * u, cy + 396 * u, 44 * u, Z.ink, 700, "left");
      g.globalAlpha = 1;
      const drop = clamp01((t - 0.9) / 0.35); if (drop > 0) { rr(g, x0 + 36 * u, y0 + 840 * u, w - 72 * u, 150 * u, 30 * u, Z.f100); txt(g, "Café 27 rating", x0 + 80 * u, y0 + 892 * u, 32 * u, Z.muted, 700, "left"); txt(g, lerp(4.6, 4.2, ease(drop)).toFixed(1), x0 + 120 * u, y0 + 944 * u, 54 * u, Z.coral, 800, "left"); star(g, x0 + 230 * u, y0 + 944 * u, 26 * u, Z.amber); txt(g, "▼", x0 + w - 110 * u, y0 + 920 * u, 50 * u, Z.coral, 800); }
    });
    if (t > 0.4 && t < 0.62) { glowSpot(k, ph.cx - 180 * k.u, k.Y(0.43) - 210 * k.u, 200 * k.u, Z.amber, 0.4 * Math.sin((t - 0.4) / 0.22 * Math.PI)); }
  },
  // 11 — "So we're building something"
  "labs-build": (k) => {
    const g = k.g, t = k.t; k.sky({ stops: [Z.f950, Z.f900] });
    g.strokeStyle = "rgba(179,203,188,0.09)"; g.lineWidth = 2 * k.u; for (let i = 0; i < 14; i++) { g.beginPath(); g.moveTo(i * k.W / 13, 0); g.lineTo(i * k.W / 13, k.H); g.stroke(); } for (let j = 0; j < 24; j++) { g.beginPath(); g.moveTo(0, j * k.H / 23); g.lineTo(k.W, j * k.H / 23); g.stroke(); }
    const s = 640 * k.u, c = s / 21, x0 = k.X(0.5) - s / 2, y0 = k.Y(0.4) - s / 2; glowSpot(k, k.X(0.5), k.Y(0.4), 620 * k.u, Z.f600, 0.4);
    const pr = clamp01(t / 1.35); rr(g, x0 - c * 1.4, y0 - c * 1.4, s + c * 2.8, s + c * 2.8, c * 1.4, k.alpha(Z.white, 0.08 + 0.92 * ease((pr - 0.8) / 0.2)));
    const fin = (fx, fy, d) => { const a = clamp01(pr * 2.2 - d); if (a <= 0) return; g.save(); g.translate(x0 + (fx + 3.5) * c, y0 + (fy + 3.5) * c); g.scale(a, a); rr(g, -3.5 * c, -3.5 * c, 7 * c, 7 * c, c * 1.2, Z.linen); rr(g, -2.5 * c, -2.5 * c, 5 * c, 5 * c, c * 0.8, Z.f900); rr(g, -1.5 * c, -1.5 * c, 3 * c, 3 * c, c * 0.6, Z.linen); g.restore(); };
    fin(0, 0, 0); fin(14, 0, 0.3); fin(0, 14, 0.6);
    for (let i = 0; i < 21; i++) for (let j = 0; j < 21; j++) { if ((i < 8 && j < 8) || (i > 12 && j < 8) || (i < 8 && j > 12)) continue; if (hash(i * 31 + j * 7 + 5) > 0.52) { const a = clamp01(pr * 3 - hash(i * 13 + j) * 2); if (a > 0) { g.save(); g.translate(x0 + (i + 0.5) * c, y0 + (j + 0.5) * c); g.scale(a, a); rr(g, -c * 0.42, -c * 0.42, c * 0.84, c * 0.84, c * 0.2, ease(pr * 2 - 0.8) > 0.5 ? Z.f900 : Z.linen); g.restore(); } } }
    // flask, bubbling
    const fx = k.X(0.16), fy = k.Y(0.74); g.save(); g.translate(fx, fy); g.lineWidth = 9 * k.u; g.strokeStyle = Z.f300; g.beginPath(); g.moveTo(-34 * k.u, -170 * k.u); g.lineTo(-34 * k.u, -70 * k.u); g.lineTo(-100 * k.u, 40 * k.u); g.quadraticCurveTo(-110 * k.u, 70 * k.u, -80 * k.u, 70 * k.u); g.lineTo(80 * k.u, 70 * k.u); g.quadraticCurveTo(110 * k.u, 70 * k.u, 100 * k.u, 40 * k.u); g.lineTo(34 * k.u, -70 * k.u); g.lineTo(34 * k.u, -170 * k.u); g.stroke();
    g.beginPath(); g.moveTo(-76 * k.u, 6 * k.u); g.lineTo(76 * k.u, 6 * k.u); g.lineTo(100 * k.u, 40 * k.u); g.quadraticCurveTo(110 * k.u, 70 * k.u, 80 * k.u, 70 * k.u); g.lineTo(-80 * k.u, 70 * k.u); g.quadraticCurveTo(-110 * k.u, 70 * k.u, -100 * k.u, 40 * k.u); g.closePath(); g.fillStyle = Z.f500; g.fill();
    for (let i = 0; i < 4; i++) { const tt = (t * 0.8 + i * 0.27) % 1; circle(g, (hash(i) - 0.5) * 70 * k.u, -tt * 220 * k.u, (12 + hash(i + 3) * 10) * k.u * (1 - tt * 0.4), k.alpha(Z.f300, 0.8 * (1 - tt))); } g.restore();
    // "in the works"
    const b = pop(k, 0.5, 0.35); g.save(); g.translate(k.X(0.5), k.Y(0.7)); g.rotate(-0.03); g.scale(b, b); pill(g, -330 * k.u, -62 * k.u, 660 * k.u, 124 * k.u, Z.amber, "Work in progress", Z.f950, 62 * k.u, 800); g.restore();
    g.save(); g.translate(k.X(0.5), k.Y(0.66)); g.restore(); previewTag(k, true);
  },
  // 12 — "at Zavino Labs."
  "labs-brand": (k) => {
    const g = k.g, t = k.t; k.sky({ stops: [Z.f950, Z.f900, Z.f800] }); glowSpot(k, k.X(0.5), k.Y(0.34), 800 * k.u, Z.f600, 0.35);
    const a1 = ease(t / 0.4), sy = k.Y(0.2) + (1 - a1) * 40 * k.u; g.save(); g.globalAlpha = a1; if (IMAGES["zavino-symbol-light"]) g.drawImage(IMAGES["zavino-symbol-light"], k.X(0.5) - 190 * k.u, sy - 190 * k.u, 380 * k.u, 380 * k.u); g.restore();
    const a2 = ease((t - 0.2) / 0.4); g.save(); g.globalAlpha = a2; g.font = `800 ${190 * k.u}px ${FONT}`; const w1 = g.measureText("zavino.").width; g.font = `500 ${96 * k.u}px ${FONT}`; const w2 = g.measureText(" labs").width, x0 = k.X(0.5) - (w1 + w2) / 2;
    txt(g, "zavino.", x0, k.Y(0.375), 190 * k.u, Z.linen, 800, "left"); txt(g, " labs", x0 + w1, k.Y(0.375) + 30 * k.u, 96 * k.u, Z.f300, 500, "left"); txt(g, "Our ideas. Built and put to work.", k.X(0.5), k.Y(0.45), 46 * k.u, Z.f200, 600); g.restore();
    const chips = [["forma.", "Available to try", Z.f700, Z.linen], ["outbid.bd", "Work in progress", Z.f800, Z.linen]];
    chips.forEach(([n, s, bg, c], i) => { const p = pop(k, 0.5 + i * 0.18, 0.3), cx = k.X(0.5), cy = k.Y(0.545) + i * 138 * k.u; g.save(); g.translate(cx, cy); g.scale(p, p); rr(g, -400 * k.u, -62 * k.u, 800 * k.u, 124 * k.u, 62 * k.u, bg, "rgba(206,224,213,0.35)", 3 * k.u); txt(g, n, -340 * k.u, 2 * k.u, 54 * k.u, c, 800, "left"); txt(g, s, 360 * k.u, 2 * k.u, 36 * k.u, Z.f300, 600, "right"); g.restore(); });
    const p3 = pop(k, 0.9, 0.3), pulse = 0.55 + 0.45 * Math.sin(t * 5); g.save(); g.translate(k.X(0.5), k.Y(0.545) + 276 * k.u); g.scale(p3, p3); g.setLineDash([16 * k.u, 12 * k.u]); rr(g, -400 * k.u, -62 * k.u, 800 * k.u, 124 * k.u, 62 * k.u, "rgba(232,163,61,0.08)", k.alpha(Z.amber, 0.5 + 0.5 * pulse), 4 * k.u); g.setLineDash([]); txt(g, "something new…", 0, 2 * k.u, 48 * k.u, Z.amberLt, 700); g.restore();
  },
  // 13 — "A QR code on every table."
  "table-qr": (k) => {
    cafe(k); const g = k.g, t = k.t, fy = k.Y(0.76);
    [[0.22, 0.62, 0], [0.78, 0.62, 2], [0.5, 0.68, 1]].forEach(([fx, ty, i]) => { const x = k.X(fx), top = table(k, { x, y: k.Y(ty), w: 380, leg: 330 * (fx === 0.5 ? 1.2 : 1) }), p = pop(k, 0.1 + i * 0.28, 0.35); g.save(); g.translate(x, top); g.scale(p * 1.3, p * 1.3);
      g.beginPath(); g.moveTo(-110 * k.u, 0); g.lineTo(110 * k.u, 0); g.lineTo(84 * k.u, -240 * k.u); g.lineTo(-84 * k.u, -240 * k.u); g.closePath(); g.fillStyle = Z.white; g.shadowColor = "rgba(13,34,23,0.2)"; g.shadowBlur = 20 * k.u; g.fill(); g.shadowColor = "transparent";
      rr(g, -84 * k.u, -240 * k.u, 168 * k.u, 44 * k.u, 6 * k.u, Z.f900); txt(g, "SCAN", 0, -218 * k.u, 26 * k.u, Z.linen, 800); qr(k, { x: 0, y: -108 * k.u, s: 120, seed: 3 + i }); g.restore(); if (t > 0.1 + i * 0.28 && t < 0.6 + i * 0.28) sparkle(k, x + 130 * k.u, top - 330 * k.u, 44 * k.u, Z.amber, t * 3); });
  },
  // 14 — "An offer worth scanning."
  "offer-card": (k) => {
    soft(k); const g = k.g, t = k.t; const s = pop(k, 0, 0.4), cx = k.X(0.5), cy = k.Y(0.45); glowSpot(k, cx, cy, 760 * k.u, Z.amber, 0.22);
    g.save(); g.translate(cx, cy + Math.sin(t * 2) * 8 * k.u); g.scale(s, s); g.rotate(-0.025);
    g.beginPath(); g.moveTo(-340 * k.u, 520 * k.u); g.lineTo(340 * k.u, 520 * k.u); g.lineTo(290 * k.u, -520 * k.u); g.lineTo(-290 * k.u, -520 * k.u); g.closePath(); g.fillStyle = Z.white; g.shadowColor = "rgba(13,34,23,0.25)"; g.shadowBlur = 50 * k.u; g.shadowOffsetY = 20 * k.u; g.fill(); g.shadowColor = "transparent";
    rr(g, -290 * k.u, -520 * k.u, 580 * k.u, 270 * k.u, 24 * k.u, Z.f900); txt(g, "Café 27", 0, -470 * k.u, 40 * k.u, Z.f300, 700); txt(g, "10% off", 0, -385 * k.u, 124 * k.u, Z.amberLt, 800); txt(g, "your first order", 0, -300 * k.u, 44 * k.u, Z.linen, 600);
    qr(k, { x: 0, y: 10 * k.u, s: 400, seed: 9 }); txt(g, "Scan to claim", 0, 300 * k.u, 54 * k.u, Z.f800, 800);
    pill(g, -150 * k.u, 370 * k.u, 300 * k.u, 80 * k.u, Z.amber, "one-time offer", Z.f950, 34 * k.u, 800);
    g.restore();
    for (let i = 0; i < 6; i++) sparkle(k, cx + Math.cos(i * 1.05 + t * 1.5) * 470 * k.u, cy + Math.sin(i * 1.05 + t * 1.5) * 560 * k.u, (16 + 14 * Math.sin(t * 4 + i)) * k.u, i % 2 ? Z.amber : Z.f500, t + i);
  },
  // 15 — "Rafi scans,"
  "rafi-scan": (k) => {
    cafe(k); const g = k.g, t = k.t, fy = k.Y(0.76), tx = k.X(0.7), ty = k.Y(0.6);
    chairBack(k, k.X(0.26), fy, 260 * k.u, 540 * k.u);
    person(k, { x: k.X(0.26), y: fy, h: 800, ...RAFI, mood: t > 0.7 ? "happy" : "neutral", arms: "hold", look: [0.9, 0.2], sq: 1 + Math.sin(t * 2) * 0.004 });
    tableCloth(k, k.X(0.5), ty, 880 * k.u, fy, Z.f700);
    // tent card on the table
    g.save(); g.translate(tx, ty - 22 * k.u); g.beginPath(); g.moveTo(-96 * k.u, 0); g.lineTo(96 * k.u, 0); g.lineTo(74 * k.u, -230 * k.u); g.lineTo(-74 * k.u, -230 * k.u); g.closePath(); g.fillStyle = Z.white; g.fill(); rr(g, -74 * k.u, -230 * k.u, 148 * k.u, 40 * k.u, 6 * k.u, Z.f900); qr(k, { x: 0, y: -110 * k.u, s: 110, seed: 9 }); g.restore();
    // a phone in Rafi's hand, a scan beam to the card
    const px = k.X(0.41), py = k.Y(0.535); phone(k, { x: px, y: py, h: 300, rot: 0.38, bg: Z.f900 });
    const beam = clamp01((t - 0.15) / 0.3), fl = t > 0.45 ? Math.max(0, 1 - (t - 0.45) * 4) : 0; g.save(); g.globalAlpha = 0.55 * beam * (1 - clamp01((t - 0.9) / 0.3)); g.fillStyle = Z.amberLt; g.beginPath(); g.moveTo(px + 40 * k.u, py - 80 * k.u); g.lineTo(tx - 110 * k.u, ty - 330 * k.u); g.lineTo(tx - 110 * k.u, ty - 40 * k.u); g.closePath(); g.fill(); g.restore();
    if (fl > 0) glowSpot(k, tx, ty - 130 * k.u, 300 * k.u, "#ffffff", fl * 0.8);
    // brackets snapping on the QR
    const sn = ease((t - 0.3) / 0.25), d = lerp(190, 110, sn) * k.u; g.save(); g.strokeStyle = Z.green || "#3a9d6b"; g.lineWidth = 12 * k.u; g.lineCap = "round"; [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => { g.beginPath(); g.moveTo(tx + sx * d, ty - 130 * k.u + sy * (d - 50 * k.u)); g.lineTo(tx + sx * d, ty - 130 * k.u + sy * d); g.lineTo(tx + sx * (d - 50 * k.u), ty - 130 * k.u + sy * d); g.stroke(); }); g.restore();
    const b = pop(k, 0.55, 0.3); g.save(); g.translate(k.X(0.5), k.Y(0.2)); g.scale(b, b); card(k, { x: -380 * k.u, y: -90 * k.u, w: 760 * k.u, h: 180 * k.u, r: 90 * k.u, fill: Z.white }); circle(g, -290 * k.u, 0, 52 * k.u, Z.chat); txt(g, "✓", -290 * k.u, 4 * k.u, 62 * k.u, "#fff", 800); txt(g, "Offer found", -200 * k.u, -26 * k.u, 46 * k.u, Z.ink, 800, "left"); txt(g, "10% off at Café 27", -200 * k.u, 34 * k.u, 36 * k.u, Z.muted, 600, "left"); g.restore();
  },
  // 16 — "verifies,"
  "otp": (k) => {
    soft(k); const g = k.g, t = k.t; previewTag(k);
    const ph = phone(k, { x: k.X(0.5), y: k.Y(0.43), h: 1140 });
    clipScreen(g, ph, () => { const x0 = ph.x, y0 = ph.y, w = ph.w, u = ph.u; g.fillStyle = Z.f50; g.fillRect(x0, y0, w, ph.h);
      txt(g, "Café 27", x0 + w / 2, y0 + 110 * u, 36 * u, Z.f700, 800); txt(g, "Verify your number", x0 + w / 2, y0 + 220 * u, 52 * u, Z.ink, 800);
      rr(g, x0 + 50 * u, y0 + 300 * u, w - 100 * u, 110 * u, 22 * u, Z.white, "rgba(22,53,36,0.15)", 3 * u); txt(g, "+880 17•• ••• 821", x0 + w / 2, y0 + 357 * u, 40 * u, Z.ink, 700);
      txt(g, "Enter the 4-digit code we sent", x0 + w / 2, y0 + 480 * u, 30 * u, Z.muted, 600);
      const digs = ["4", "7", "2", "9"], bw = 104 * u, gap = 22 * u, bx = x0 + w / 2 - (bw * 4 + gap * 3) / 2;
      digs.forEach((d, i) => { const on = t > 0.08 + i * 0.15, p = on ? outBack((t - 0.08 - i * 0.15) / 0.15) : 0, ok = t > 0.68; rr(g, bx + i * (bw + gap), y0 + 540 * u, bw, 130 * u, 22 * u, ok ? "#e1f2e8" : Z.white, ok ? Z.chat : (on ? Z.f700 : "rgba(22,53,36,0.18)"), 4 * u); if (on) txt(g, d, bx + i * (bw + gap) + bw / 2, y0 + 606 * u + (1 - p) * -30 * u, 70 * u * Math.min(1, p + 0.2), Z.ink, 800); });
      const v = pop(k, 0.68, 0.25); g.save(); g.translate(x0 + w / 2, y0 + 840 * u); g.scale(v, v); rr(g, -250 * u, -60 * u, 500 * u, 120 * u, 60 * u, Z.chat); txt(g, "✓  Verified", 0, 3 * u, 50 * u, "#fff", 800); g.restore(); });
    if (t > 0.68) for (let i = 0; i < 6; i++) sparkle(k, ph.cx + Math.cos(i * 1.05) * (200 + (t - 0.68) * 300) * k.u, k.Y(0.43) + 300 * k.u + Math.sin(i * 1.05) * (120 + (t - 0.68) * 260) * k.u, 26 * k.u * Math.max(0, 1 - (t - 0.68) * 2.5), Z.amber, t * 3);
  },
  // 17 — "picks his order."
  "menu-pick": (k) => {
    soft(k); const g = k.g, t = k.t; previewTag(k);
    const ph = phone(k, { x: k.X(0.5), y: k.Y(0.43), h: 1140 });
    clipScreen(g, ph, () => { const x0 = ph.x, y0 = ph.y, w = ph.w, u = ph.u; g.fillStyle = Z.f50; g.fillRect(x0, y0, w, ph.h);
      txt(g, "What did you order?", x0 + w / 2, y0 + 130 * u, 50 * u, Z.ink, 800);
      const items = [["Chicken burger", "৳550", 0.3, "b"], ["Cold coffee", "৳300", 0.75, "c"], ["Fries", "৳220", 99, "f"], ["Brownie", "৳180", 99, "w"]];
      items.forEach(([n, pr, tc, ic], i) => { const y = y0 + 230 * u + i * 170 * u, on = t > tc, p = on ? outBack((t - tc) / 0.25) : 0; rr(g, x0 + 36 * u, y, w - 72 * u, 140 * u, 28 * u, on ? "#e8f3ec" : Z.white, on ? Z.chat : "rgba(22,53,36,0.12)", on ? 4 * u : 3 * u);
        circle(g, x0 + 112 * u, y + 70 * u, 44 * u, Z.f100); if (ic === "b") burger(k, x0 + 112 * u, y + 76 * u, 64 * u / k.u); else if (ic === "c") cup(k, x0 + 112 * u, y + 70 * u, 64 * u / k.u, Z.terra); else circle(g, x0 + 112 * u, y + 70 * u, 20 * u, Z.sand2);
        txt(g, n, x0 + 172 * u, y + 52 * u, 31 * u, Z.ink, 800, "left"); txt(g, pr, x0 + 172 * u, y + 98 * u, 28 * u, Z.muted, 700, "left");
        circle(g, x0 + w - 98 * u, y + 70 * u, 28 * u, on ? Z.chat : Z.f100); if (on) { g.save(); g.translate(x0 + w - 98 * u, y + 70 * u); g.scale(p, p); txt(g, "✓", 0, 3 * u, 40 * u, "#fff", 800); g.restore(); } });
      const bp = ease((t - 1.0) / 0.25); g.save(); g.globalAlpha = bp; rr(g, x0 + 50 * u, y0 + 930 * u, w - 100 * u, 120 * u, 60 * u, Z.f800); txt(g, "Continue", x0 + w / 2, y0 + 992 * u, 46 * u, Z.linen, 800); g.restore(); });
    const tp = pop(k, 0.7, 0.3); g.save(); g.translate(k.X(0.86), k.Y(0.17)); g.rotate(0.06); g.scale(tp, tp); rr(g, -150 * k.u, -52 * k.u, 300 * k.u, 104 * k.u, 52 * k.u, Z.amber); txt(g, "৳850", 0, 3 * k.u, 58 * k.u, Z.f950, 800); g.restore();
  },
};
