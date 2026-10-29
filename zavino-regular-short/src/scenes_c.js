// ───────────────────────────── scenes, part C (polish round 2): people who read as people, and a customer flow with room to breathe ─────────────────────────────
// Timings here are absolute seconds and match the real shot lengths (≈ 2 s each); scenes in parts A/B are authored for the lengths in auth.json and stretched by scenes_z.js.
const tallyPill = (k, t) => {
  const g = k.g, n = Math.round(lerp(0, 312, ease(t / 1.7))), pw = 640 * k.u, px = k.X(0.5) - pw / 2, py = k.Y(0.085);
  card(k, { x: px, y: py, w: pw, h: 140 * k.u, r: 70 * k.u, fill: Z.f900 });
  txt(g, String(n), px + 190 * k.u, py + 72 * k.u, 100 * k.u, Z.amberLt, 800); txt(g, "customers", px + 480 * k.u, py + 52 * k.u, 38 * k.u, Z.f200, 700); txt(g, "this week", px + 480 * k.u, py + 96 * k.u, 38 * k.u, Z.f300, 600);
};

Object.assign(window.SCENES, {
  // 1 — "Every week, hundreds of people"
  "crowd-count": (k) => {
    cafe(k, { floor: 0.6 }); const t = k.t;
    person(k, { x: k.X(0.86), y: k.Y(0.665), h: 400, ...NILA, mood: "happy", arms: "wipe" });
    counter(k, { x0: 0.66, x1: 1.04, top: 0.62, bottom: 0.76, props: false });
    // five depth rows: smaller and higher = further away, so a few people read as a lot of people
    const rows = [[0.62, 200, 7], [0.665, 245, 6], [0.71, 300, 5], [0.755, 360, 4], [0.8, 420, 3]], list = [];
    rows.forEach(([ry, h, n], r) => { for (let i = 0; i < n; i++) { const x0 = -0.34 + i * (0.6 / Math.max(1, n - 1)) + (r % 2) * 0.04, sp = 0.09 + r * 0.012 + (i % 3) * 0.015;
      list.push({ c: (i * 3 + r * 5) % 12, x: k.X(x0 + sp * t), y: k.Y(ry), h: h * (0.96 + 0.08 * hash(r * 9 + i)), walk: 1.4 + (i % 3) * 0.25, mood: (i + r) % 3 === 0 ? "happy" : "neutral", ph: r * 3 + i * 0.7 }); } });
    crowd(k, list);
    tallyPill(k, t);
  },
  // 2 — "walk into your café."
  "door-stream": (k) => {
    cafe(k); const g = k.g, t = k.t, dx = k.X(0.5);
    door(k, { x: dx, y: k.Y(0.7), w: 280, h: 560, open: ease(t / 0.2) * 0.95 });
    const ring = Math.sin(t * 22) * Math.max(0, 1 - t * 0.9) * 0.5; bell(k, dx + 110 * k.u, k.Y(0.7) - 600 * k.u, 64, ring); txt(g, "ding!", dx + 110 * k.u, k.Y(0.7) - 700 * k.u, 46 * k.u, Z.f800, 800);
    const list = [];
    for (let i = 0; i < 9; i++) {
      const tt = t - i * 0.17; if (tt < 0) continue; const side = i % 2 ? 1 : -1, p = outCubic(tt / 1.05), tx = dx + side * (210 + (i % 4) * 85 + Math.floor(i / 2) * 10) * k.u;
      list.push({ c: i + 2, x: lerp(dx, tx, p), y: lerp(k.Y(0.7), k.Y(0.735 + (i % 3) * 0.012), p), h: (380 + (i % 3) * 35) * lerp(0.82, 1, p), walk: tt < 1.05 ? 2.2 : 0, flip: side < 0, alpha: clamp01(tt / 0.12), mood: i % 3 === 0 ? "happy" : "neutral", ph: i });
    }
    crowd(k, list);
  },
  // 4 — "a single one."
  "lineup": (k) => {
    cafe(k); const g = k.g, t = k.t, fy = k.Y(0.745), cs = [0, 2, 5, 7, 9], moods = ["neutral", "happy", "neutral", "happy", "neutral"], hs = [500, 480, 530, 490, 510];
    const ps = cs.map((c, i) => { const x = k.X(0.11 + i * 0.195); shadow(k, x, fy + 6 * k.u, 230 * k.u, 0.1); return [x, person(k, { ...CROWD[c], x, y: fy + (i % 2) * 8 * k.u, h: hs[i], mood: moods[i], ph: i * 0.8, sq: 1 + Math.sin(t * 2 + i) * 0.006, look: [Math.sin(t * 0.8 + i) * 0.6, 0] })]; });
    ps.forEach(([x, p], i) => { qmark(k, x, p.top - 100 * k.u, 110, 0.2 + i * 0.22); tagCard(k, x, fy - 270 * k.u, 150 * k.u, "no name", ease((t - 0.35 - i * 0.22) / 0.2)); });
  },
  // 5 — "Who's a regular?"
  "who-regular": (k) => {
    cafe(k); const g = k.g, t = k.t, fy = k.Y(0.72), cs = [3, 1, 10, 6];
    crowd(k, cs.map((c, i) => ({ c, x: k.X(0.14 + i * 0.24), y: fy, h: 520 + (i % 2) * 30, mood: i === 1 ? "happy" : "neutral", ph: i, look: [Math.sin(t * 0.9 + i) * 0.7, 0] })));
    const mx = lerp(k.X(0.1), k.X(0.9), ease((t - 0.1) / 1.45)), my = k.Y(0.42) + Math.sin(t * 5) * 14 * k.u; g.save(); g.translate(mx, my); g.strokeStyle = Z.f800; g.lineWidth = 22 * k.u; g.lineCap = "round"; g.beginPath(); g.arc(0, 0, 150 * k.u, 0, 7); g.stroke(); g.fillStyle = "rgba(206,224,213,0.35)"; g.fill(); g.beginPath(); g.moveTo(106 * k.u, 106 * k.u); g.lineTo(250 * k.u, 250 * k.u); g.stroke(); txt(g, "?", 0, 4 * k.u, 170 * k.u, Z.f800, 800); g.restore();
    const b = pop(k, 0.05, 0.3); g.save(); g.translate(k.X(0.5), k.Y(0.14)); g.scale(b, b); pill(g, -270 * k.u, -62 * k.u, 540 * k.u, 124 * k.u, Z.f900, "a regular?", Z.linen, 62 * k.u, 800); g.restore();
  },
  // 6 — "Who spends the most?"
  "who-spender": (k) => {
    cafe(k); const g = k.g, t = k.t, fy = k.Y(0.72), spec = [[0.2, 520, 4], [0.5, 600, 8], [0.8, 540, 11]];
    crowd(k, spec.map(([fx, h, c], i) => ({ c, x: k.X(fx), y: fy, h, mood: i === 1 ? "wow" : "neutral", ph: i, look: [0, 0.2] })));
    spec.forEach(([fx, h], i) => { const x = k.X(fx), s = pop(k, 0.15 + i * 0.3, 0.3), y = fy - h - 120 * k.u; g.save(); g.translate(x, y); g.scale(s, s); card(k, { x: -150 * k.u, y: -62 * k.u, w: 300 * k.u, h: 124 * k.u, r: 62 * k.u, fill: Z.white }); txt(g, "৳ ???", 0, 3 * k.u, 62 * k.u, Z.f800, 800); g.restore(); });
    for (let i = 0; i < 7; i++) { const tt = (t * 0.5 + i * 0.21) % 1; g.save(); g.globalAlpha = Math.sin(tt * Math.PI) * 0.8; txt(g, "৳", k.X(0.08 + hash(i) * 0.84), k.Y(0.3) - tt * 260 * k.u, 70 * k.u, Z.amber, 800); g.restore(); }
  },
  // 9 — "They just leave."
  "door-close": (k) => {
    cafe(k, { dim: 0.22 }); const g = k.g, t = k.t, fy = k.Y(0.73), dx = k.X(0.5);
    door(k, { x: dx, y: k.Y(0.7), w: 420, h: 860, open: 1 - ease(t / 0.55), out1: "#e8dcc0", out2: "#f1e8d2" });
    const wx = lerp(dx - 110 * k.u, dx + 40 * k.u, clamp01(t / 2.0)); g.save(); g.beginPath(); g.rect(dx - 210 * k.u, k.Y(0.7) - 860 * k.u, 420 * k.u, 860 * k.u); g.clip(); g.globalAlpha = 0.9 * clamp01(t / 0.5); person(k, { x: wx, y: k.Y(0.7), h: 340, sil: Z.f700, walk: 1.8 }); g.restore();
    const ring = Math.sin(t * 20) * Math.max(0, 1 - t * 0.8) * 0.55; bell(k, dx + 180 * k.u, k.Y(0.7) - 920 * k.u, 70, ring);
    chairBack(k, k.X(0.2), fy, 220 * k.u, 440 * k.u); tableCloth(k, k.X(0.2), k.Y(0.6), 420 * k.u, fy); cup(k, k.X(0.2), k.Y(0.6) - 80 * k.u, 130, Z.f700);
    const a = clamp01((t - 0.7) / 0.4); g.save(); g.globalAlpha = a; g.translate(k.X(0.78), k.Y(0.4)); g.rotate(0.08); txt(g, "gone.", 0, 0, 76 * k.u, Z.f800, 800); g.restore();
  },
  // 15 — "Rafi scans,"
  "rafi-scan": (k) => {
    cafe(k, { noBoard: true }); const g = k.g, t = k.t, fy = k.Y(0.76), tx = k.X(0.7), ty = k.Y(0.6);
    chairBack(k, k.X(0.26), fy, 260 * k.u, 540 * k.u);
    person(k, { x: k.X(0.26), y: fy, h: 800, ...RAFI, mood: t > 1.1 ? "happy" : "neutral", arms: "hold", look: [0.9, 0.2], sq: 1 + Math.sin(t * 2) * 0.004 });
    tableCloth(k, k.X(0.5), ty, 880 * k.u, fy, Z.f700);
    g.save(); g.translate(tx, ty - 22 * k.u); g.beginPath(); g.moveTo(-96 * k.u, 0); g.lineTo(96 * k.u, 0); g.lineTo(74 * k.u, -230 * k.u); g.lineTo(-74 * k.u, -230 * k.u); g.closePath(); g.fillStyle = Z.white; g.fill(); rr(g, -74 * k.u, -230 * k.u, 148 * k.u, 40 * k.u, 6 * k.u, Z.f900); qr(k, { x: 0, y: -110 * k.u, s: 110, seed: 9 }); g.restore();
    const px = k.X(0.41), py = k.Y(0.535) + (1 - ease(t / 0.4)) * 90 * k.u; phone(k, { x: px, y: py, h: 300, rot: 0.38, bg: Z.f900 });
    const beam = clamp01((t - 0.3) / 0.35) * (1 - clamp01((t - 1.25) / 0.3)); g.save(); g.globalAlpha = 0.55 * beam; g.fillStyle = Z.amberLt; g.beginPath(); g.moveTo(px + 40 * k.u, py - 80 * k.u); g.lineTo(tx - 110 * k.u, ty - 330 * k.u); g.lineTo(tx - 110 * k.u, ty - 40 * k.u); g.closePath(); g.fill(); g.restore();
    if (t > 0.85 && t < 1.3) glowSpot(k, tx, ty - 130 * k.u, 300 * k.u, "#ffffff", Math.max(0, 1 - (t - 0.85) * 2.4) * 0.8);
    const sn = ease((t - 0.5) / 0.35), d = lerp(190, 110, sn) * k.u; g.save(); g.strokeStyle = Z.chat; g.lineWidth = 12 * k.u; g.lineCap = "round"; [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => { g.beginPath(); g.moveTo(tx + sx * d, ty - 130 * k.u + sy * (d - 50 * k.u)); g.lineTo(tx + sx * d, ty - 130 * k.u + sy * d); g.lineTo(tx + sx * (d - 50 * k.u), ty - 130 * k.u + sy * d); g.stroke(); }); g.restore();
    const b = pop(k, 1.05, 0.3); g.save(); g.translate(k.X(0.5), k.Y(0.2)); g.scale(b, b); card(k, { x: -380 * k.u, y: -90 * k.u, w: 760 * k.u, h: 180 * k.u, r: 90 * k.u, fill: Z.white }); circle(g, -290 * k.u, 0, 52 * k.u, Z.chat); txt(g, "✓", -290 * k.u, 4 * k.u, 62 * k.u, "#fff", 800); txt(g, "Offer found", -200 * k.u, -26 * k.u, 46 * k.u, Z.ink, 800, "left"); txt(g, "10% off at Café 27", -200 * k.u, 34 * k.u, 36 * k.u, Z.muted, 600, "left"); g.restore();
  },
  // 16 — "verifies,"  (send the code → it arrives → type it → verified)
  "otp": (k) => {
    soft(k); const g = k.g, t = k.t; previewTag(k);
    const ph = phone(k, { x: k.X(0.5), y: k.Y(0.43), h: 1140 });
    clipScreen(g, ph, () => { const x0 = ph.x, y0 = ph.y, w = ph.w, u = ph.u; g.fillStyle = Z.f50; g.fillRect(x0, y0, w, ph.h);
      txt(g, "Café 27", x0 + w / 2, y0 + 110 * u, 36 * u, Z.f700, 800); txt(g, "Verify your number", x0 + w / 2, y0 + 220 * u, 52 * u, Z.ink, 800);
      rr(g, x0 + 50 * u, y0 + 300 * u, w - 100 * u, 110 * u, 22 * u, Z.white, "rgba(22,53,36,0.15)", 3 * u); txt(g, "+880 17•• ••• 821", x0 + w / 2, y0 + 357 * u, 40 * u, Z.ink, 700);
      const press = t > 0.35 && t < 0.47, sent = t > 0.8, sending = t > 0.47 && !sent;
      g.save(); g.translate(x0 + w / 2, y0 + 510 * u); const bs = press ? 0.94 : 1; g.scale(bs, bs); rr(g, -(w - 100 * u) / 2, -52 * u, w - 100 * u, 104 * u, 52 * u, sent ? Z.chat : Z.f800);
      txt(g, sent ? "✓  Code sent" : (sending ? "Sending" + ".".repeat(1 + Math.floor(t * 7) % 3) : "Send code"), 0, 3 * u, 38 * u, "#fff", 800); g.restore();
      const bo = ease((t - 0.85) / 0.25); if (bo > 0) { g.save(); g.globalAlpha = bo; txt(g, "Enter the 4-digit code", x0 + w / 2, y0 + 640 * u, 30 * u, Z.muted, 600);
        const digs = ["4", "7", "2", "9"], bw = 104 * u, gap = 22 * u, bx = x0 + w / 2 - (bw * 4 + gap * 3) / 2, ok = t > 1.68;
        digs.forEach((d, i) => { const tc = 1.0 + i * 0.16, on = t > tc, p = on ? outBack((t - tc) / 0.15) : 0; rr(g, bx + i * (bw + gap), y0 + 690 * u, bw, 130 * u, 22 * u, ok ? "#e1f2e8" : Z.white, ok ? Z.chat : (on ? Z.f700 : "rgba(22,53,36,0.18)"), 4 * u); if (on) txt(g, d, bx + i * (bw + gap) + bw / 2, y0 + 756 * u + (1 - p) * -30 * u, 70 * u * Math.min(1, p + 0.2), Z.ink, 800); });
        g.restore(); }
      const v = pop(k, 1.68, 0.25); g.save(); g.translate(x0 + w / 2, y0 + 920 * u); g.scale(v, v); rr(g, -250 * u, -60 * u, 500 * u, 120 * u, 60 * u, Z.chat); txt(g, "✓  Verified", 0, 3 * u, 50 * u, "#fff", 800); g.restore();
      // the text message arrives
      const bn = ease((t - 0.62) / 0.22) - ease((t - 1.62) / 0.2), by = y0 + 16 * u - (1 - bn) * 190 * u;
      if (bn > 0.01) { g.save(); g.shadowColor = "rgba(13,34,23,0.3)"; g.shadowBlur = 24 * u; g.shadowOffsetY = 8 * u; rr(g, x0 + 22 * u, by, w - 44 * u, 140 * u, 30 * u, Z.white); g.restore(); circle(g, x0 + 90 * u, by + 70 * u, 36 * u, Z.chat); txt(g, "✉", x0 + 90 * u, by + 72 * u, 38 * u, "#fff", 800); txt(g, "Messages · now", x0 + 146 * u, by + 44 * u, 24 * u, Z.muted, 700, "left"); txt(g, "Café 27: your code is 4729", x0 + 146 * u, by + 94 * u, 30 * u, Z.ink, 800, "left"); }
    });
    if (t > 1.68) for (let i = 0; i < 6; i++) sparkle(k, ph.cx + Math.cos(i * 1.05) * (200 + (t - 1.68) * 300) * k.u, k.Y(0.43) + 300 * k.u + Math.sin(i * 1.05) * (120 + (t - 1.68) * 260) * k.u, 26 * k.u * Math.max(0, 1 - (t - 1.68) * 2.5), Z.amber, t * 3);
  },
  // 17 — "picks his order."
  "menu-pick": (k) => {
    soft(k); const g = k.g, t = k.t; previewTag(k);
    const ph = phone(k, { x: k.X(0.5), y: k.Y(0.43), h: 1140 });
    clipScreen(g, ph, () => { const x0 = ph.x, y0 = ph.y, w = ph.w, u = ph.u; g.fillStyle = Z.f50; g.fillRect(x0, y0, w, ph.h);
      txt(g, "What did you order?", x0 + w / 2, y0 + 110 * u, 50 * u, Z.ink, 800);
      const items = [["Chicken burger", "৳550", 0.55, "b"], ["Cold coffee", "৳300", 1.0, "c"], ["Fries", "৳220", 99, "f"], ["Brownie", "৳180", 99, "w"]];
      items.forEach(([n, pr, tc, ic], i) => { const y = y0 + 190 * u + i * 160 * u, on = t > tc, p = on ? outBack((t - tc) / 0.25) : 0, a = ease((t - 0.05 - i * 0.1) / 0.2); g.save(); g.globalAlpha = a; g.translate(0, (1 - a) * 30 * u);
        rr(g, x0 + 36 * u, y, w - 72 * u, 140 * u, 28 * u, on ? "#e8f3ec" : Z.white, on ? Z.chat : "rgba(22,53,36,0.12)", on ? 4 * u : 3 * u);
        circle(g, x0 + 112 * u, y + 70 * u, 44 * u, Z.f100); if (ic === "b") burger(k, x0 + 112 * u, y + 76 * u, 64 * u / k.u); else if (ic === "c") cup(k, x0 + 112 * u, y + 70 * u, 64 * u / k.u, Z.terra); else circle(g, x0 + 112 * u, y + 70 * u, 20 * u, Z.sand2);
        txt(g, n, x0 + 172 * u, y + 52 * u, 31 * u, Z.ink, 800, "left"); txt(g, pr, x0 + 172 * u, y + 98 * u, 28 * u, Z.muted, 700, "left");
        circle(g, x0 + w - 98 * u, y + 70 * u, 28 * u, on ? Z.chat : Z.f100); if (on) { g.save(); g.translate(x0 + w - 98 * u, y + 70 * u); g.scale(p, p); txt(g, "✓", 0, 3 * u, 36 * u, "#fff", 800); g.restore(); } g.restore(); });
      const val = t < 0.55 ? 0 : (t < 1.0 ? 550 : lerp(550, 850, ease((t - 1.0) / 0.3)));
      rr(g, x0 + 36 * u, y0 + 850 * u, w - 72 * u, 90 * u, 24 * u, Z.f100); txt(g, "Your order", x0 + 70 * u, y0 + 896 * u, 30 * u, Z.muted, 700, "left"); txt(g, "৳" + fmt(val), x0 + w - 70 * u, y0 + 896 * u, 44 * u, Z.f800, 800, "right");
      const bp = ease((t - 1.35) / 0.2), pr = t > 1.62 && t < 1.74, done = t > 1.74; g.save(); g.translate(x0 + w / 2, y0 + 1020 * u); g.scale(pr ? 0.95 : 1, pr ? 0.95 : 1); g.globalAlpha = 0.35 + 0.65 * bp; rr(g, -(w - 100 * u) / 2, -52 * u, w - 100 * u, 104 * u, 52 * u, done ? Z.chat : Z.f800); txt(g, done ? "✓  Order sent" : "Continue", 0, 3 * u, 40 * u, Z.linen, 800); g.restore(); });
  },
  // 18 — "One code."
  "code-show": (k) => {
    cafe(k); const g = k.g, t = k.t, fy = k.Y(0.745);
    person(k, { x: k.X(0.84), y: k.Y(0.71), h: 660, ...NILA, mood: t > 0.9 ? "happy" : "neutral", arms: "wave", look: [-0.8, 0.1] });
    counter(k, { x0: 0.6, x1: 1.04, top: 0.64, bottom: 0.77 });
    person(k, { x: k.X(0.17), y: fy, h: 740, ...RAFI, mood: "happy", arms: "up", look: [0.8, -0.2] });
    const s = pop(k, 0.25, 0.4); g.save(); g.translate(k.X(0.55), k.Y(0.3)); g.rotate(-0.04 + Math.sin(t * 3) * 0.01); g.scale(s * 0.92, s * 0.92);
    card(k, { x: -270 * k.u, y: -250 * k.u, w: 540 * k.u, h: 500 * k.u, r: 40 * k.u }); rr(g, -270 * k.u, -250 * k.u, 540 * k.u, 150 * k.u, 40 * k.u, Z.f900); rr(g, -270 * k.u, -140 * k.u, 540 * k.u, 40 * k.u, 0, Z.f900);
    txt(g, "10% off", 0, -178 * k.u, 90 * k.u, Z.amberLt, 800); g.setLineDash([14 * k.u, 12 * k.u]); g.strokeStyle = Z.f300; g.lineWidth = 4 * k.u; g.beginPath(); g.moveTo(-250 * k.u, -60 * k.u); g.lineTo(250 * k.u, -60 * k.u); g.stroke(); g.setLineDash([]);
    txt(g, "your code", 0, -20 * k.u, 34 * k.u, Z.muted, 700); txt(g, "ZV-4821", 0, 70 * k.u, 118 * k.u, Z.f800, 800);
    const cp = pop(k, 1.05 - 0.25, 0.3); g.save(); g.translate(0, 185 * k.u); g.scale(cp, cp); pill(g, -170 * k.u, -35 * k.u, 340 * k.u, 70 * k.u, Z.f100, "one-time · valid today", Z.f800, 28 * k.u, 800); g.restore(); g.restore();
    if (t > 0.25 && t < 0.8) sparkle(k, k.X(0.55) + 250 * k.u, k.Y(0.3) - 260 * k.u, 46 * k.u, Z.amber, t * 3);
  },
  // 19 — "One bill."
  "bill-entry": (k) => {
    cafe(k); const g = k.g, t = k.t;
    person(k, { x: k.X(0.5), y: k.Y(0.715), h: 860, ...NILA, mood: t > 1.5 ? "proud" : "happy", arms: "down", look: [0, 0.6] });
    counter(k, { x0: -0.05, x1: 1.05, top: 0.69, bottom: 0.8, props: false });
    const tw = 720 * k.u, th = 410 * k.u, tx = k.X(0.5) - tw / 2, ty = k.Y(0.45); g.save(); g.translate(k.X(0.5), ty + th); g.rotate(-0.02); g.translate(-k.X(0.5), -(ty + th));
    g.shadowColor = "rgba(13,34,23,0.3)"; g.shadowBlur = 40 * k.u; g.shadowOffsetY = 16 * k.u; rr(g, tx, ty, tw, th, 36 * k.u, Z.f950); g.shadowColor = "transparent"; rr(g, tx + 20 * k.u, ty + 20 * k.u, tw - 40 * k.u, th - 40 * k.u, 22 * k.u, Z.f50);
    rr(g, tx + 46 * k.u, ty + 44 * k.u, tw - 92 * k.u, 72 * k.u, 18 * k.u, "#e1f2e8"); txt(g, "✓  ZV-4821 · valid", tx + 80 * k.u, ty + 81 * k.u, 32 * k.u, Z.f800, 800, "left");
    txt(g, "Bill amount", tx + 54 * k.u, ty + 150 * k.u, 26 * k.u, Z.muted, 700, "left"); rr(g, tx + 46 * k.u, ty + 172 * k.u, tw - 92 * k.u, 100 * k.u, 22 * k.u, Z.white, Z.f600, 4 * k.u);
    const n = t < 0.3 ? 0 : t < 0.65 ? 1 : t < 1.0 ? 2 : 3, shown = "৳ " + ["8", "5", "0"].slice(0, n).join("") + (n < 3 && Math.floor(t * 4) % 2 ? "|" : ""); txt(g, shown, tx + 80 * k.u, ty + 224 * k.u, 70 * k.u, Z.ink, 800, "left");
    const press = t > 1.4 && t < 1.5, ok = t > 1.5; g.save(); g.translate(tx + tw / 2, ty + 329 * k.u); g.scale(press ? 0.95 : 1, press ? 0.95 : 1); rr(g, -(tw - 92 * k.u) / 2, -33 * k.u, tw - 92 * k.u, 66 * k.u, 33 * k.u, ok ? Z.chat : Z.f800); txt(g, ok ? "✓  Confirmed" : "Confirm", 0, 1 * k.u, 32 * k.u, "#fff", 800); g.restore(); g.restore();
    if (ok) { const a = clamp01((t - 1.5) / 0.5); for (let i = 0; i < 6; i++) { const ang = i * 1.05 + 0.3; sparkle(k, k.X(0.5) + Math.cos(ang) * (380 + a * 120) * k.u, ty + 100 * k.u + Math.sin(ang) * (170 + a * 80) * k.u, 34 * k.u * (1 - a), i % 2 ? Z.amber : Z.f400, t * 4); } g.save(); g.translate(k.X(0.26), k.Y(0.42)); g.rotate(-0.12); txt(g, "ka-ching!", 0, 0, 56 * k.u * outBack((t - 1.5) / 0.25), Z.f800, 800); g.restore(); }
  },
  // 22 — "how was it?"
  "chat-ask": (k) => {
    soft(k); const g = k.g, t = k.t; previewTag(k);
    const ph = phone(k, { x: k.X(0.5), y: k.Y(0.43), h: 1140 });
    clipScreen(g, ph, () => { const x0 = ph.x, y0 = ph.y, w = ph.w, u = ph.u; g.fillStyle = "#eaf1ec"; g.fillRect(x0, y0, w, ph.h);
      g.fillStyle = Z.f900; g.fillRect(x0, y0, w, 150 * u); circle(g, x0 + 80 * u, y0 + 84 * u, 40 * u, Z.f700); cup(k, x0 + 80 * u, y0 + 84 * u, 46 * u / k.u, Z.amberLt); txt(g, "Café 27", x0 + 140 * u, y0 + 70 * u, 36 * u, Z.linen, 800, "left"); txt(g, "message", x0 + 140 * u, y0 + 112 * u, 24 * u, Z.f300, 600, "left");
      const m1 = pop(k, 0.15, 0.3); g.save(); g.translate(x0 + 40 * u, y0 + 260 * u); g.scale(m1, m1); rr(g, 0, 0, 400 * u, 190 * u, 30 * u, Z.white); txt(g, "Hi Rafi!", 34 * u, 56 * u, 40 * u, Z.ink, 800, "left"); txt(g, "How was your visit", 34 * u, 112 * u, 34 * u, Z.ink, 600, "left"); txt(g, "today?", 34 * u, 154 * u, 34 * u, Z.ink, 600, "left"); g.restore();
      const m2 = pop(k, 0.6, 0.3); g.save(); g.translate(x0 + 40 * u, y0 + 500 * u); g.scale(m2, m2); rr(g, 0, 0, w - 80 * u, 250 * u, 30 * u, Z.white); txt(g, "Tap to rate", (w - 80 * u) / 2, 54 * u, 30 * u, Z.muted, 700);
      const sz = 60 * u; for (let i = 0; i < 5; i++) { const f = clamp01((t - 1.2 - i * 0.08) / 0.08); star(g, (w - 80 * u) / 2 + (i - 2) * sz * 1.45, 150 * u, sz * 0.62, f > 0 ? Z.amber : Z.greyLt); } g.restore();
      if (t > 0.95) { const tp = clamp01((t - 0.95) / 0.3); const fx = lerp(x0 + w * 0.85, x0 + w * 0.5 + 2 * sz * 1.45 - 40 * u, ease(tp)), fy = lerp(y0 + 900 * u, y0 + 650 * u, ease(tp)); g.save(); g.fillStyle = "rgba(22,53,36,0.25)"; g.beginPath(); g.arc(fx, fy, 38 * u, 0, 7); g.fill(); g.restore(); } });
  },
});
