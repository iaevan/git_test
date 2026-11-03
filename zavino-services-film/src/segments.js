// ───────────── the scenes ─────────────
// seg(k, F, t, d, ev, A): t = seconds into the scene, d = its length, ev(i, frac) = when the i-th phrase of its line is spoken
// (falls back to frac·d when the line has fewer phrases, e.g. in the 30 s cut), A = the scene's visibility (eases in/out at the sweeps).

const SERVICES = [
  { name: "AI Revenue", icon: "revenue" }, { name: "AI Operations & Agents", icon: "ops" },
  { name: "SaaS & Custom Web Apps", icon: "saas" }, { name: "AI Content Workflow", icon: "content" },
];
function serviceIcon(g, kind, x, y, s) {
  if (kind === "revenue") { envelope(g, x - s * 0.18, y + s * 0.05, s * 0.62); g.strokeStyle = C.mid; g.lineWidth = s * 0.09; g.lineCap = "round"; g.beginPath(); g.moveTo(x + s * 0.18, y + s * 0.32); g.lineTo(x + s * 0.48, y + s * 0.02); g.lineTo(x + s * 0.62, y + s * 0.14); g.stroke(); }
  else if (kind === "ops") { chatIcon(g, x - s * 0.1, y - s * 0.02, s * 0.75); tick(g, x + s * 0.42, y + s * 0.3, s * 0.2, 1, C.forest); }
  else if (kind === "saas") { rr(g, x - s * 0.55, y - s * 0.4, s * 1.1, s * 0.8, s * 0.1, null, C.mid, s * 0.09); g.fillStyle = C.mid; g.fillRect(x - s * 0.55, y - s * 0.4, s * 1.1, s * 0.16); bar(g, x - s * 0.38, y - s * 0.05, s * 0.5, s * 0.1, C.mid); bar(g, x - s * 0.38, y + s * 0.13, s * 0.75, s * 0.08, "rgba(55,99,74,0.45)"); }
  else { docIcon(g, x - s * 0.18, y, s * 0.78); g.strokeStyle = C.forest; g.lineWidth = s * 0.1; g.lineCap = "round"; g.beginPath(); g.moveTo(x + s * 0.2, y + s * 0.36); g.lineTo(x + s * 0.6, y - s * 0.12); g.stroke(); dot(g, x + s * 0.18, y + s * 0.4, s * 0.06, C.forest); }
}

const SEG = {
  // 1 — Takeoff: the jet slides up the ribbon ramp and launches; the ribbon unrolls across the frame.
  s1(k, F, t, d, ev, A) {
    const g = k.g, W = F.W, H = F.H, m = F.m, mm = Math.min(W, H);
    const pts = F.mode === "land" ? [[0.05, 0.8], [0.21, 0.8], [0.37, 0.6], [0.51, 0.5], [0.65, 0.6], [0.8, 0.52], [0.93, 0.34], [1.12, 0.2]]
      : F.mode === "port" ? [[0.03, 0.86], [0.3, 0.86], [0.5, 0.78], [0.66, 0.68], [0.78, 0.62], [0.9, 0.5], [1.2, 0.38]]
        : [[0.04, 0.84], [0.28, 0.84], [0.47, 0.71], [0.63, 0.62], [0.8, 0.67], [0.95, 0.52], [1.2, 0.4]];
    const P = spline(pts.map(([x, y]) => [x * W, y * H])), bw = 0.085 * mm, L = 0.17 * mm;
    const pw = (pts[1][0] - pts[0][0]) * W * 1.25;
    plinth(k, (pts[0][0] + pts[1][0]) / 2 * W, pts[0][1] * H + bw * 0.42, pw, 0.11 * H, A);
    const u = clamp01((t - 0.7) / 3.1), sj = lerp(0.075, 1.12, u * u * (0.55 + 0.45 * u)), launch = clamp01((sj - 0.3) / 0.3);
    ribbon(k, P, 0, Math.min(1, Math.max(0.3, sj - 0.01)), bw, { twist: 0.6, phase: -0.2, alpha: A, n: 140 });
    const r = onRibbon(P, sj, bw * 0.5 + L * 0.075 + launch * launch * 0.12 * H);
    jet(k, r.x, r.y, r.ang - 0.18 * launch, L, A);
    const T = F.mode === "land" ? { ...F.text, y: H * 0.22, w: W * 0.7, title: 92 * m } : F.mode === "port" ? { ...F.text, y: H * 0.2, title: 86 * m } : { ...F.text, y: H * 0.17, title: 76 * m };
    textBlock(g, { ...F, text: T }, "Grow your business.\nSimplify the work.", null, t, 1.0, A);
  },

  // 2 — The weight: an inquiry, the same question again, a half-finished post pile up; the ribbon loops them and lifts them away.
  s2(k, F, t, d, ev, A) {
    const g = k.g, s = ST(F), U = s.U, X = (v) => s.cx + v * U, Y = (v) => s.cy + v * U;
    const tl0 = ev(2, 0.7) + 0.55, tL = Math.max(tl0 + 0.9, d - 1.25), lift = ein((t - tL) / 0.7) * F.H * 1.15;
    const words = [["Leads.", ev(0, 0) + 0.15], ["Questions.", ev(1, 0.35)], ["Content.", ev(2, 0.7)]], T = F.text;
    font(g, T.title, 900); const row = words.map((w) => w[0]).join(" "), oneLine = F.mode !== "land" && g.measureText(row).width < T.w;
    if (oneLine) { let x = T.x - g.measureText(row).width / 2; words.forEach(([w, t0]) => { const e = eout((t - t0) / 0.5); g.save(); g.globalAlpha = A * e; txt(g, w, x, T.y + (1 - e) * 24 * F.m, T.title, C.forest, 900, "left"); g.restore(); x += g.measureText(w + " ").width; }); }
    else { const lh = T.title * 1.12; words.forEach(([w, t0], i) => { const e = eout((t - t0) / 0.5); g.save(); g.globalAlpha = A * e; txt(g, w, T.x, T.y + (i - 1) * lh + (1 - e) * 24 * F.m, T.title, i === 2 ? C.mid : C.forest, 900, T.align); g.restore(); }); }
    g.save(); g.translate(0, -lift);
    const cw = 470, ch = 150, sway = Math.sin(t * 2.6) * 0.012 * clamp01((t - ev(2, 0.7)) / 0.6);
    const pile = [
      { at: ev(0, 0) + 0.25, from: [-950, 160], to: [-25, 165], rot: -0.05, draw: (x, y) => { iconCircle(g, x + 70 * U, y + 75 * U, 42 * U); envelope(g, x + 70 * U, y + 75 * U, 40 * U); txt(g, "New inquiry", x + 130 * U, y + 58 * U, 34 * U, C.forest, 900); bar(g, x + 130 * U, y + 88 * U, 220 * U, 14 * U); bar(g, x + 130 * U, y + 112 * U, 150 * U, 14 * U); } },
      { at: ev(1, 0.35) + 0.05, from: [800, -620], to: [30, 50], rot: 0.04, draw: (x, y) => { iconCircle(g, x + 70 * U, y + 75 * U, 42 * U); chatIcon(g, x + 70 * U, y + 72 * U, 46 * U); txt(g, "Do you deliver on weekends?", x + 130 * U, y + 75 * U, 27 * U, C.forest, 800); } },
      { at: ev(1, 0.35) + 0.85, from: [950, -80], to: [-15, -62], rot: -0.035, draw: (x, y) => { iconCircle(g, x + 70 * U, y + 75 * U, 42 * U); chatIcon(g, x + 70 * U, y + 72 * U, 46 * U); txt(g, "Do you deliver on weekends?", x + 130 * U, y + 75 * U, 27 * U, C.forest, 800); chip(g, x + cw * U - 128 * U, y + 30 * U, "again", 20 * U, C.forest, C.card); } },
      { at: ev(2, 0.7) + 0.1, from: [-850, -700], to: [22, -176], rot: 0.05, draw: (x, y) => { rr(g, x + 28 * U, y + 26 * U, 98 * U, 98 * U, 14 * U, C.mist); dot(g, x + 58 * U, y + 56 * U, 12 * U, C.sage); g.fillStyle = C.sage; g.beginPath(); g.moveTo(x + 36 * U, y + 116 * U); g.lineTo(x + 76 * U, y + 72 * U); g.lineTo(x + 118 * U, y + 116 * U); g.fill(); txt(g, "Post draft", x + 150 * U, y + 48 * U, 32 * U, C.forest, 900); bar(g, x + 150 * U, y + 80 * U, 230 * U, 13 * U); bar(g, x + 150 * U, y + 80 * U, 95 * U, 13 * U, C.mid); txt(g, "40% done", x + 150 * U, y + 115 * U, 22 * U, C.muted, 700); } },
    ];
    pile.forEach((c, i) => { if (t < c.at) return; const e = eout((t - c.at) / 0.6), p = soft((t - c.at) / 0.6), x = X(lerp(c.from[0], c.to[0], e)) - (cw / 2) * U, y = Y(lerp(c.from[1], c.to[1], e)) - (ch / 2) * U;
      popped(g, x + (cw / 2) * U, y + (ch / 2) * U, 0.92 + 0.08 * p, A * clamp01((t - c.at) / 0.2), c.rot + sway * (i % 2 ? 1 : -1), () => { card(k, x, y, cw * U, ch * U); c.draw(x, y); }); });
    const lp = eio((t - tl0) / 0.8);
    if (lp > 0) { const Pl = (q) => { const a = -Math.PI / 2 - q * Math.PI * 2 * 1.12; return [X(Math.cos(a) * 335), Y(-5 + Math.sin(a) * 345)]; }; ribbon(k, Pl, 0, lp, 44 * U, { twist: 1.4, phase: 0.4, alpha: A, n: 120 }); }
    const up = ein((t - tL + 0.35) / 0.55); if (up > 0) { const Pu = (q) => [X(Math.sin(q * 5) * 30), Y(-350 - q * 1600)]; ribbon(k, Pu, 0, up, 44 * U, { twist: 0.8, alpha: A, noShadow: true }); }
    g.restore();
  },

  // 3 — AI Revenue: a new inquiry → a follow-up draft builds → "Review the follow-up" gets its tick → synced to the sales tool.
  s3(k, F, t, d, ev, A) {
    const g = k.g, s = ST(F), U = s.U, X = (v) => s.cx + v * U, Y = (v) => s.cy + v * U;
    textBlock(g, F, "AI Revenue", "Every lead has a next step.", t, 0.3, A);
    const t1 = 0.35, t2 = Math.max(t1 + 0.7, ev(1, 0.4) - 0.2), t3 = ev(2, 0.6), t4 = ev(3, 0.78);
    let p = popIn(t, t1); popped(g, X(-200), Y(-360), p, A * p, -0.015, () => { const x = X(-470), y = Y(-455); card(k, x, y, 560 * U, 190 * U); iconCircle(g, x + 72 * U, y + 95 * U, 44 * U); envelope(g, x + 72 * U, y + 95 * U, 42 * U); txt(g, "A new sales inquiry", x + 136 * U, y + 66 * U, 32 * U, C.forest, 900); txt(g, "“I'd like to learn about", x + 136 * U, y + 108 * U, 25 * U, C.muted, 700); txt(g, "your service.”", x + 136 * U, y + 140 * U, 25 * U, C.muted, 700); });
    p = popIn(t, t2); popped(g, X(90), Y(30), p, A * p, 0.01, () => {
      const x = X(-280), y = Y(-200), w = 750 * U, h = 450 * U; card(k, x, y, w, h); txt(g, "Sales follow-up", x + 36 * U, y + 52 * U, 34 * U, C.forest, 900); chip(g, x + w - 150 * U, y + 52 * U, "Draft", 21 * U);
      [["Customer interest", "Your service"], ["Assigned to", "Your sales team"], ["Next step", "Review the follow-up"]].forEach(([a, b], i) => { const e = fadeIn(t, t2 + 0.35 + i * 0.28, 0.35), yy = y + (118 + i * 74) * U; g.save(); g.globalAlpha *= e; rr(g, x + 26 * U, yy - 30 * U, w - 52 * U, 62 * U, 16 * U, C.pale); txt(g, a, x + 48 * U, yy, 23 * U, C.muted, 700); txt(g, b, x + 300 * U, yy, 25 * U, C.forest, 900); g.restore(); });
      const typed = clamp01((t - t3) / 1.1); [560, 600, 420].forEach((bw_, i) => bar(g, x + 40 * U, y + (352 + i * 30) * U, bw_ * U * clamp01(typed * 3 - i), 14 * U));
      tick(g, x + w - 62 * U, y + 266 * U, 26 * U, clamp01((t - t3 - 1.0) / 0.5), C.mid);
    });
    p = popIn(t, t4); popped(g, X(-300), Y(390), p, A * p, -0.01, () => { const x = X(-470), y = Y(320), w = 340 * U, h = 140 * U; card(k, x, y, w, h); rr(g, x + 26 * U, y + 34 * U, 74 * U, 74 * U, 18 * U, C.forest); [0, 1, 2].forEach((i) => rr(g, x + (40 + i * 18) * U, y + (86 - i * 14) * U, 12 * U, (18 + i * 14) * U, 4 * U, C.mist)); txt(g, "Sales tool", x + 120 * U, y + 56 * U, 28 * U, C.forest, 900); const sy = fadeIn(t, t4 + 0.9, 0.3); g.save(); g.globalAlpha *= sy; dot(g, x + 128 * U, y + 96 * U, 8 * U, C.mid); txt(g, "In sync", x + 146 * U, y + 96 * U, 22 * U, C.mid, 800); g.restore(); });
    const lk = clamp01((t - t4 - 0.25) / 0.5); if (lk > 0) { g.save(); g.globalAlpha *= A; g.setLineDash([12 * U, 10 * U]); g.strokeStyle = C.mid; g.lineWidth = 5 * U; g.beginPath(); g.moveTo(X(-130), Y(390)); g.lineTo(X(lerp(-130, 60, lk)), Y(lerp(390, 250, lk))); g.stroke(); g.restore(); g.save(); g.globalAlpha *= A; syncIcon(g, X(-10), Y(330), 34 * U * soft(lk), (t - t4) * 3, C.mid); g.restore(); }
  },

  // 4 — AI Operations and Agents: a question → answered from approved documents → the team reviews and ticks it.
  s4(k, F, t, d, ev, A) {
    const g = k.g, s = ST(F), U = s.U, X = (v) => s.cx + v * U, Y = (v) => s.cy + v * U;
    textBlock(g, F, "AI Operations and Agents", "An answer, ready to review.", t, 0.3, A);
    const t1 = 0.35, t2 = Math.max(t1 + 0.6, ev(1, 0.35) - 0.2), t3 = ev(2, 0.55), t4 = ev(3, 0.7), t5 = ev(4, 0.85);
    let p = popIn(t, t1); popped(g, X(-180), Y(-410), p, A * p, 0, () => { const x = X(-470), y = Y(-470), w = 600 * U, h = 120 * U; rr(g, x, y, w, h, 40 * U, C.forest); g.fillStyle = C.forest; g.beginPath(); g.moveTo(x + 60 * U, y + h - 2); g.lineTo(x + 40 * U, y + h + 34 * U); g.lineTo(x + 110 * U, y + h - 2); g.fill(); txt(g, "Where can I find your return policy?", x + 36 * U, y + h / 2, 27 * U, C.card, 800); });
    [0, 1, 2].forEach((i) => { const pp = popIn(t, t2 + i * 0.15); popped(g, X(330), Y(-180 + i * 16), pp, A * pp, 0.04 * (i - 1), () => { const x = X(185 - i * 14), y = Y(-300 + i * 22), w = 290 * U, h = 230 * U; card(k, x, y, w, h); docIcon(g, x + 60 * U, y + 70 * U, 64 * U); bar(g, x + 110 * U, y + 52 * U, 140 * U, 14 * U); bar(g, x + 110 * U, y + 80 * U, 100 * U, 14 * U); bar(g, x + 32 * U, y + 132 * U, 220 * U, 12 * U); chip(g, x + 32 * U, y + 190 * U, "Approved", 19 * U, C.pale, C.mid); }); });
    const lk = clamp01((t - t2 - 0.45) / 0.55); if (lk > 0) { const Pc = spline([[X(190), Y(-130)], [X(120), Y(-60)], [X(40), Y(10)], [X(-20), Y(40)]]); ribbon(k, Pc, 0, lk, 26 * U, { twist: 0.5, alpha: A, noShadow: true }); }
    p = popIn(t, t2 + 0.7); popped(g, X(-200), Y(110), p, A * p, 0, () => {
      const x = X(-470), y = Y(-10), w = 560 * U, h = 260 * U; card(k, x, y, w, h); chip(g, x + 30 * U, y + 44 * U, "Draft answer", 20 * U);
      const ty = clamp01((t - t2 - 0.9) / 0.9); bar(g, x + 32 * U, y + 96 * U, 470 * U * clamp01(ty * 2), 15 * U); bar(g, x + 32 * U, y + 128 * U, 380 * U * clamp01(ty * 2 - 1), 15 * U);
      const lkc = fadeIn(t, t2 + 1.6, 0.3); g.save(); g.globalAlpha *= lkc; chip(g, x + 32 * U, y + 178 * U, "Return policy  ↗", 20 * U, C.forest, C.card); txt(g, "from approved help docs", x + 262 * U, y + 178 * U, 19 * U, C.muted, 700); g.restore();
      const ap = t > t5 + 0.62; rr(g, x + w - 170 * U, y + h - 70 * U, 140 * U, 50 * U, 25 * U, ap ? C.mid : C.pale); txt(g, ap ? "Approved" : "Approve", x + w - 100 * U, y + h - 45 * U, 20 * U, ap ? C.card : C.mid, 900, "center");
      tick(g, x + w - 22 * U, y + 22 * U, 30 * U, clamp01((t - t5 - 0.6) / 0.5), C.mid);
    });
    const tasks = [["Order status", t3], ["Bookings", t3 + 0.3]]; tasks.forEach(([lab, t0], i) => { const pp = popIn(t, t0); popped(g, X(-320 + i * 270), Y(345), pp, A * pp, 0, () => { const x = X(-450 + i * 270), y = Y(310), w = 250 * U, h = 70 * U; card(k, x, y, w, h, { r: 35 * U }); tick(g, x + 36 * U, y + 35 * U, 18 * U, 1, C.mid); txt(g, lab, x + 66 * U, y + 36 * U, 22 * U, C.forest, 800); }); });
    [0, 1, 2].forEach((i) => { const pp = popIn(t, t4 + i * 0.15); popped(g, X(160 + i * 110), Y(345), pp, A * pp, 0, () => { dot(g, X(160 + i * 110), Y(345), 44 * U, C.pale); if (i === 0) envelope(g, X(160), Y(345), 34 * U); else if (i === 1) { rr(g, X(270) - 24 * U, Y(345) - 22 * U, 48 * U, 46 * U, 8 * U, null, C.mid, 6 * U); g.fillStyle = C.mid; g.fillRect(X(270) - 24 * U, Y(345) - 22 * U, 48 * U, 12 * U); } else docIcon(g, X(380), Y(345), 40 * U); }); if (i < 2 && pp > 0.5) { g.save(); g.globalAlpha *= A; g.strokeStyle = C.sage; g.lineWidth = 4 * U; g.setLineDash([6 * U, 7 * U]); g.beginPath(); g.moveTo(X(204 + i * 110), Y(345)); g.lineTo(X(226 + i * 110), Y(345)); g.stroke(); g.restore(); } });
    if (t > t5 - 0.1) { const q = clamp01((t - t5 + 0.1) / 0.7), hx = X(lerp(420, 60, eout(q))), hy = Y(lerp(560, 240, eout(q))) + Math.sin(clamp01((t - t5 - 0.55) / 0.25) * Math.PI) * 12 * U; g.save(); g.globalAlpha *= A; hand(g, hx, hy, 120 * U); g.restore(); }
  },

  // 5 — SaaS and custom web apps: one product screen, three views (customer, team, owner).
  s5(k, F, t, d, ev, A) {
    const g = k.g, s = ST(F), U = s.U, X = (v) => s.cx + v * U, Y = (v) => s.cy + v * U;
    textBlock(g, F, "SaaS and Custom Web Apps", "Big ideas. A useful first step.", t, 0.3, A);
    const sw = [Math.max(1.0, ev(1, 0.2) + 0.2), Math.max(2.2, ev(2, 0.45) + 0.2), Math.max(3.4, ev(3, 0.72))];
    const view = t < sw[1] ? 0 : t < sw[2] ? 1 : 2, fl = [sw[1], sw[2]].map((x) => clamp01((t - x + 0.25) / 0.5)), flip = Math.max(...fl.map((f) => Math.abs(Math.sin(f * Math.PI))));
    const p = popIn(t, 0.35, 0.5); const views = [["Customer", "One clear place to start."], ["Team", "Everyone in sync."], ["Owner", "Room to run it."]];
    popped(g, X(0), Y(-30), p, A * p, 0, () => {
      g.save(); g.translate(X(0), Y(-30)); g.scale(Math.max(0.04, 1 - flip * 0.96), 1); g.translate(-X(0), -Y(-30));
      const x = X(-430), y = Y(-330), w = 860 * U, h = 600 * U; card(k, x, y, w, h, { r: 30 * U }); g.save(); g.beginPath(); g.roundRect(x, y, w, h, 30 * U); g.clip(); g.fillStyle = C.pale; g.fillRect(x, y, w, 64 * U); g.restore();
      [0, 1, 2].forEach((i) => dot(g, x + (36 + i * 28) * U, y + 32 * U, 9 * U, [C.sage, C.mist, C.mist][i])); rr(g, x + 150 * U, y + 18 * U, 420 * U, 28 * U, 14 * U, C.card);
      const ix = x + 40 * U, iy = y + 100 * U;
      if (view === 0) { txt(g, "Welcome", ix, iy + 34 * U, 40 * U, C.forest, 900); bar(g, ix, iy + 84 * U, 420 * U, 16 * U); bar(g, ix, iy + 114 * U, 300 * U, 16 * U); rr(g, ix, iy + 160 * U, 230 * U, 70 * U, 35 * U, C.mid); txt(g, "Start here", ix + 115 * U, iy + 196 * U, 26 * U, C.card, 900, "center"); [0, 1, 2].forEach((i) => { const bx = ix + i * 260 * U; rr(g, bx, iy + 280 * U, 236 * U, 170 * U, 20 * U, C.pale); dot(g, bx + 46 * U, iy + 330 * U, 22 * U, C.card); txt(g, String(i + 1), bx + 46 * U, iy + 332 * U, 22 * U, C.mid, 900, "center"); bar(g, bx + 26 * U, iy + 390 * U, 180 * U, 13 * U); bar(g, bx + 26 * U, iy + 414 * U, 120 * U, 13 * U); }); }
      else if (view === 1) { ["To do", "Doing", "Done"].forEach((c, i) => { const bx = ix + i * 262 * U; rr(g, bx, iy, 240 * U, 450 * U, 20 * U, C.pale); txt(g, c, bx + 20 * U, iy + 34 * U, 24 * U, C.forest, 900); [0, 1, 2 - (i === 2 ? 1 : 0)].slice(0, 3 - (i === 2 ? 1 : 0)).forEach((j) => { rr(g, bx + 16 * U, iy + (66 + j * 120) * U, 208 * U, 100 * U, 14 * U, C.card); bar(g, bx + 34 * U, iy + (92 + j * 120) * U, 150 * U, 12 * U); dot(g, bx + 50 * U, iy + (134 + j * 120) * U, 15 * U, [C.mid, C.sage, C.amber][(i + j) % 3]); dot(g, bx + 76 * U, iy + (134 + j * 120) * U, 15 * U, [C.sage, C.amber, C.mid][(i + j) % 3]); }); }); }
      else { txt(g, "This month", ix, iy + 30 * U, 30 * U, C.forest, 900); g.strokeStyle = C.mid; g.lineWidth = 7 * U; g.lineJoin = "round"; g.beginPath(); [0, 0.2, 0.15, 0.42, 0.38, 0.62, 0.78].forEach((v, i) => { const px = ix + i * 80 * U, py = iy + 250 * U - v * 170 * U; i ? g.lineTo(px, py) : g.moveTo(px, py); }); g.stroke(); [0, 1].forEach((i) => { rr(g, ix + 540 * U, iy + i * 130 * U, 240 * U, 110 * U, 18 * U, C.pale); bar(g, ix + 562 * U, iy + (32 + i * 130) * U, 120 * U, 12 * U); txt(g, i ? "Team" : "Orders", ix + 562 * U, iy + (74 + i * 130) * U, 26 * U, C.forest, 900); }); [0, 1, 2].forEach((i) => { const yy = iy + (318 + i * 46) * U; bar(g, ix, yy - 7 * U, 300 * U, 14 * U); rr(g, ix + 680 * U, yy - 15 * U, 60 * U, 30 * U, 15 * U, i === 1 ? C.sage : C.mid); dot(g, ix + (i === 1 ? 696 : 724) * U, yy, 11 * U, C.card); }); }
      g.restore();
    });
    const [who, line] = views[view], cp = popIn(t, view === 0 ? 0.6 : [sw[1], sw[2]][view - 1] + 0.05, 0.4); popped(g, X(0), Y(340), cp, A * cp, 0, () => { font(g, 30 * U, 900); const wl = g.measureText(line).width; const tw = 150 * U + wl, x0 = X(0) - tw / 2; chip(g, x0, Y(345), who, 22 * U, C.forest, C.card); txt(g, line, x0 + 150 * U, Y(347), 30 * U, C.forest, 900); });
  },

  // 6 — AI Content Workflow: one brief splits along the ribbon into an email draft and a social post; each gets a reviewer's tick.
  s6(k, F, t, d, ev, A) {
    const g = k.g, s = ST(F), U = s.U, X = (v) => s.cx + v * U, Y = (v) => s.cy + v * U;
    textBlock(g, F, "AI Content Workflow", "One brief. Content for each channel.", t, 0.3, A);
    const t1 = 0.35, t2 = Math.max(1.2, ev(1, 0.4) - 0.1), t3 = ev(2, 0.75);
    let p = popIn(t, t1); popped(g, X(0), Y(-350), p, A * p, -0.01, () => { const x = X(-260), y = Y(-450), w = 520 * U, h = 190 * U; card(k, x, y, w, h); chip(g, x + 30 * U, y + 46 * U, "Brief", 20 * U, C.forest, C.card); txt(g, "“Let's share our", x + 30 * U, y + 104 * U, 30 * U, C.forest, 900); txt(g, "new product”", x + 30 * U, y + 144 * U, 30 * U, C.forest, 900); });
    const sp = eio((t - t2) / 0.9);
    if (sp > 0) { const Pa = spline([[X(-40), Y(-262)], [X(-140), Y(-160)], [X(-250), Y(-60)], [X(-250), Y(10)]]), Pb = spline([[X(40), Y(-262)], [X(150), Y(-170)], [X(250), Y(-80)], [X(250), Y(-20)]]); ribbon(k, Pa, 0, sp, 34 * U, { twist: 0.7, alpha: A, noShadow: true }); ribbon(k, Pb, 0, sp, 34 * U, { twist: 0.7, phase: 1, alpha: A, noShadow: true }); }
    p = popIn(t, t2 + 0.7); popped(g, X(-250), Y(160), p, A * p, -0.02, () => { const x = X(-470), y = Y(20), w = 440 * U, h = 300 * U; card(k, x, y, w, h); iconCircle(g, x + 62 * U, y + 62 * U, 36 * U); envelope(g, x + 62 * U, y + 62 * U, 34 * U); txt(g, "Email draft", x + 112 * U, y + 62 * U, 28 * U, C.forest, 900); txt(g, "Subject: Meet our new product", x + 32 * U, y + 130 * U, 21 * U, C.muted, 800); [360, 380, 250].forEach((bw_, i) => bar(g, x + 32 * U, y + (170 + i * 32) * U, bw_ * U, 13 * U)); tick(g, x + w - 26 * U, y + 24 * U, 30 * U, clamp01((t - t3) / 0.5), C.mid); });
    p = popIn(t, t2 + 0.85); popped(g, X(250), Y(170), p, A * p, 0.02, () => { const x = X(40), y = Y(0), w = 430 * U, h = 360 * U; card(k, x, y, w, h); dot(g, x + 46 * U, y + 44 * U, 20 * U, C.sage); bar(g, x + 80 * U, y + 38 * U, 140 * U, 13 * U); rr(g, x + 26 * U, y + 80 * U, w - 52 * U, 160 * U, 16 * U, C.mist); dot(g, x + 90 * U, y + 130 * U, 22 * U, C.card); g.fillStyle = C.sage; g.beginPath(); g.moveTo(x + 50 * U, y + 236 * U); g.lineTo(x + 170 * U, y + 140 * U); g.lineTo(x + 290 * U, y + 236 * U); g.fill(); txt(g, "Social post", x + 26 * U, y + 278 * U, 26 * U, C.forest, 900); bar(g, x + 26 * U, y + 318 * U, 280 * U, 13 * U); tick(g, x + w - 26 * U, y + 24 * U, 30 * U, clamp01((t - t3 - 0.35) / 0.5), C.mid); });
  },

  // 7 — The promise: the four services side by side; a bold stamp lands across all four.
  s7(k, F, t, d, ev, A) {
    const g = k.g, W = F.W, H = F.H, m = F.m, land = F.mode === "land";
    const cols = land ? 4 : 2, cw = land ? W * 0.205 : W * 0.4, ch = land ? H * 0.34 : (F.mode === "port" ? H * 0.2 : H * 0.3), gap = land ? W * 0.022 : W * 0.035;
    const gw = cols * cw + (cols - 1) * gap, gh = (4 / cols) * ch + (4 / cols - 1) * gap, x0 = (W - gw) / 2, y0 = (land ? H * 0.53 : H * 0.53) - gh / 2;
    const tS = Math.max(1.0, ev(0, 0) + Math.min(2.3, d * 0.42)), hit = clamp01((t - tS) / 0.12), bump = Math.sin(clamp01((t - tS - 0.05) / 0.3) * Math.PI) * 10 * m;
    SERVICES.forEach((sv, i) => { const c = i % cols, r = Math.floor(i / cols), x = x0 + c * (cw + gap), y = y0 + r * (ch + gap) + bump * (1 - Math.abs(c - (cols - 1) / 2) * 0.25), p = popIn(t, 0.3 + i * 0.13);
      popped(g, x + cw / 2, y + ch / 2, p, A * p, 0, () => { card(k, x, y, cw, ch, { r: 28 * m }); const ic = Math.min(cw, ch) * 0.22; dot(g, x + cw / 2, y + ch * 0.36, ic * 1.05, C.pale); serviceIcon(g, sv.icon, x + cw / 2, y + ch * 0.36, ic); const ln = wrap(g, sv.name, cw * 0.84, 30 * m, 900); ln.forEach((l, j) => txt(g, l, x + cw / 2, y + ch * 0.7 + (j - (ln.length - 1) / 2) * 36 * m, 30 * m, C.forest, 900, "center")); }); });
    if (t > tS - 0.3) {
      const q = clamp01((t - tS + 0.3) / 0.3), sc = lerp(1.7, 1, eout(q)), al = clamp01(q * 1.6) * A, sw = Math.min(W * 0.9, gw * 1.04), shh = (land ? 0.15 : 0.09) * H, cx = W / 2, cy = y0 + gh / 2 + (land ? ch * 0.16 : 0);
      g.save(); g.globalAlpha = al; g.translate(cx, cy); g.rotate(-0.06); g.scale(sc, sc);
      g.shadowColor = "rgba(22,53,36,0.25)"; g.shadowBlur = 30 * m; g.shadowOffsetY = 10 * m; rr(g, -sw / 2, -shh / 2, sw, shh, 26 * m, "rgba(251,248,241,0.86)"); g.shadowColor = "transparent";
      rr(g, -sw / 2 + 12 * m, -shh / 2 + 12 * m, sw - 24 * m, shh - 24 * m, 18 * m, null, C.forest, 7 * m);
      const fs = Math.min(shh * 0.36, sw * 0.062); const lines = wrap(g, "Your team has the final say.", sw * 0.86, fs, 1000);
      lines.forEach((l, j) => txt(g, l, 0, (j - (lines.length - 1) / 2) * fs * 1.1 + fs * 0.04, fs, C.forest, 1000, "center"));
      g.restore();
    }
  },

  // 8 — How we work: four stops along the ribbon light up in turn; the jet hops from stop to stop.
  s8(k, F, t, d, ev, A) {
    const g = k.g, W = F.W, H = F.H, m = F.m, mm = Math.min(W, H), land = F.mode === "land", port = F.mode === "port";
    const T = land ? { ...F.text, x: W * 0.5, align: "center", y: H * 0.16, w: W * 0.8 } : { ...F.text, y: port ? H * 0.12 : H * 0.12 };
    textBlock(g, { ...F, text: T }, "Simple from the start.", null, t, 0.3, A);
    const pts = land ? [[-0.05, 0.6], [0.17, 0.58], [0.39, 0.64], [0.61, 0.56], [0.83, 0.62], [1.05, 0.55]]
      : port ? [[0.5, 0.24], [0.28, 0.33], [0.72, 0.5], [0.28, 0.66], [0.72, 0.82], [0.5, 0.98]] : [[-0.05, 0.56], [0.14, 0.52], [0.38, 0.62], [0.62, 0.5], [0.86, 0.6], [1.05, 0.5]];
    const P = spline(pts.map(([x, y]) => [x * W, y * H])), stopS = [0.2, 0.4, 0.6, 0.8], bw = (port ? 0.06 : 0.055) * mm;
    const names = ["Understand", "Plan", "Build and launch", "Improve"], tOn = [0, 1, 2, 3].map((i) => ev(i + 1, 0.2 + i * 0.2));
    const draw = eio((t - 0.25) / 0.9);
    stopS.forEach((sv, i) => { const a = P(sv); plinth(k, a[0], a[1] + bw * 0.45, (port ? 0.22 : 0.12) * mm, (port ? 0.05 : 0.07) * H, A * clamp01(draw * 4 - i * 0.6)); });
    ribbon(k, P, 0, draw, bw, { twist: 0.9, phase: 0.3, alpha: A, n: 140 });
    stopS.forEach((sv, i) => { const a = P(sv), on = clamp01((t - tOn[i]) / 0.35), r = 0.028 * mm, vis = clamp01(draw * 1.25 - sv + 0.1);
      g.save(); g.globalAlpha = A * vis; if (on > 0) { g.globalAlpha = A * vis * 0.35 * (1 - clamp01((t - tOn[i] - 0.35) / 0.6)); dot(g, a[0], a[1] - bw * 0.05, r * (1.6 + on * 1.6), C.mid); g.globalAlpha = A * vis; }
      dot(g, a[0], a[1] - bw * 0.05, r * (1 + 0.15 * soft(on)), on > 0 ? C.forest : C.card); g.strokeStyle = C.forest; g.lineWidth = 5 * m; g.beginPath(); g.arc(a[0], a[1] - bw * 0.05, r * (1 + 0.15 * soft(on)), 0, 7); g.stroke(); txt(g, String(i + 1), a[0], a[1] - bw * 0.05 + 1, r * 0.95, on > 0 ? C.card : C.forest, 900, "center");
      const below = land || F.mode === "sq" ? (F.mode === "sq" && i % 2 ? -1 : 1) : 0, lx = port ? a[0] + (a[0] < W / 2 ? 1 : -1) * 0.2 * W : a[0], ly = port ? a[1] - 0.04 * H : a[1] + below * (0.15 * H), al = port ? (a[0] < W / 2 ? "left" : "right") : "center";
      const e = eout((t - tOn[i]) / 0.45); g.globalAlpha = A * (0.35 + 0.65 * e) * vis; txt(g, "0" + (i + 1), port ? lx : lx, ly - 30 * m, 26 * m, C.mid, 900, port ? al : "center"); txt(g, names[i], lx, ly + 10 * m, (port ? 46 : 38) * m, on > 0 ? C.forest : "rgba(22,53,36,0.45)", 900, port ? al : "center"); g.restore(); });
    let sj = 0.02; for (let i = 0; i < 4; i++) { const st = tOn[i] - 0.55, e = eio((t - st) / 0.55); if (t > st) sj = lerp(i ? stopS[i - 1] : 0.02, stopS[i], e); }
    if (t > tOn[3] + 0.4) sj = lerp(stopS[3], 1.15, ein((t - tOn[3] - 0.4) / 1.0));
    const r = onRibbon(P, sj, bw * 0.5 + 0.11 * mm * 0.09 + (0.028 * mm) * 1.1); jet(k, r.x, r.y, r.ang, 0.11 * mm, A * clamp01(draw * 2));
  },

  // 9 — Close: the CTA; then the ribbon carries the jet across, and the jet becomes the period of "zavino."
  s9(k, F, t, d, ev, A) {
    const g = k.g, W = F.W, H = F.H, m = F.m, mm = Math.min(W, H), port = F.mode === "port";
    const tB = ev(1, 0.2), tWm = ev(3, 0.62) - 0.15, tTag = ev(4, 0.78), out = eio((t - tWm + 0.65) / 0.5);
    // phase A — the call to action
    const ta = 1 - out; if (ta > 0.01) {
      g.save(); g.translate(0, -out * 60 * m);
      const T = { ...F.text, x: W * 0.5, y: H * (port ? 0.38 : 0.36), w: W * (port ? 0.86 : 0.7), align: "center", title: (port ? 96 : 84) * m };
      textBlock(g, { ...F, text: T }, "Have a project in mind?", null, t, 0.25, A * ta);
      const bp = popIn(t, tB); popped(g, W / 2, H * (port ? 0.5 : 0.53), bp, A * ta * bp, 0, () => { font(g, 40 * m, 900); const tw = g.measureText("Book an AI audit").width + 120 * m, bh = 96 * m; rr(g, W / 2 - tw / 2, H * (port ? 0.5 : 0.53) - bh / 2, tw, bh, bh / 2, C.forest); txt(g, "Book an AI audit", W / 2, H * (port ? 0.5 : 0.53) + 2 * m, 40 * m, C.card, 900, "center"); });
      const sp = fadeIn(t, ev(2, 0.35), 0.5); g.save(); g.globalAlpha = A * ta * sp; txt(g, "We'll help you find a clear first step.", W / 2, H * (port ? 0.6 : 0.66), (port ? 42 : 38) * m, C.mid, 800, "center"); g.restore();
      g.restore();
    }
    // phase B — the wordmark; the jet lands as its period
    const ws = (port ? 0.21 : F.mode === "sq" ? 0.2 : 0.2) * (port ? W : H) * (port ? 1 : 1), wy = H * (port ? 0.44 : 0.42);
    font(g, ws, 1000); const ww = g.measureText("zavino").width, pr = ws * 0.105, x0 = W / 2 - (ww + pr * 3) / 2, yb = wy + ws * 0.36, px = x0 + ww + pr * 1.55, py = yb - pr;
    const fly = clamp01((t - tWm + 0.7) / 1.1), arrive = eio(fly);
    if (fly > 0) {
      const P = spline([[-0.15 * W, H * (port ? 0.72 : 0.78)], [0.25 * W, H * (port ? 0.66 : 0.7)], [0.5 * W, H * (port ? 0.6 : 0.62)], [px - 0.06 * W, py + 0.04 * H], [px, py]]);
      const sh = lerp(-0.05, 1, arrive), stl = lerp(-0.05, 1, eio((t - tWm + 0.15) / 0.8));
      ribbon(k, P, Math.max(0, stl), Math.min(1, sh), 0.05 * mm, { twist: 0.7, alpha: A, noShadow: true, taper: 0.25 });
      const r = onRibbon(P, Math.min(1, sh), 0.004 * mm), L = lerp(0.13 * mm, pr * 2.2, ein(clamp01((fly - 0.62) / 0.38))), morph = clamp01((fly - 0.84) / 0.16);
      jet(k, r.x, r.y, r.ang * (1 - morph), L, A * (1 - morph));
      if (morph > 0) dot(g, px, py, pr * soft(morph), C.mid);
    }
    "zavino".split("").forEach((ch, i) => { const tt = tWm - 0.25 + i * 0.07, e = eout((t - tt) / 0.5); if (e <= 0) return; font(g, ws, 1000); const xo = g.measureText("zavino".slice(0, i)).width; g.save(); g.globalAlpha = A * e; txt(g, ch, x0 + xo, yb + (1 - e) * 30 * m, ws, C.forest, 1000, "left", "alphabetic"); g.restore(); });
    const tg = fadeIn(t, tTag, 0.6); g.save(); g.globalAlpha = A * tg; txt(g, "Where vision takes flight.", W / 2, wy + ws * 0.72 + (1 - tg) * 14 * m, (port ? 50 : 46) * m, C.mid, 800, "center"); g.restore();
    const wb = fadeIn(t, tTag + 0.8, 0.6); g.save(); g.globalAlpha = A * wb; const yc = wy + ws * 0.72 + (port ? 130 : 112) * m; font(g, 30 * m, 900); const l1 = "Book an AI audit", l2 = "thezavino.com", sep = 46 * m, w1 = g.measureText(l1).width, w2 = g.measureText(l2).width, xs = W / 2 - (w1 + sep + w2) / 2;
    txt(g, l1, xs, yc, 30 * m, C.forest, 900, "left"); dot(g, xs + w1 + sep / 2, yc, 5 * m, C.mid); txt(g, l2, xs + w1 + sep, yc, 30 * m, C.forest, 900, "left"); g.restore();
  },
};
// the 30 s cut reuses scenes 3, 4, 5 and 9 with shorter lines
SEG.c3 = SEG.s3; SEG.c4 = SEG.s4; SEG.c5 = SEG.s5; SEG.c9 = SEG.s9;
