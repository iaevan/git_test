// ───────────── the scenes, part 1: takeoff, the weight, AI Revenue, AI Operations ─────────────
// seg(k, F, t, d, ev, A, T, ex): t = seconds into the scene, d = its length, ev(i, frac) = when the i-th phrase of its line is spoken
// (falls back to frac·d when the line has fewer phrases, e.g. in the 30 s cut), A = visibility (eases at the sweeps), T = global time,
// ex = 0..1 exit progress (3D parts retract themselves). A scene may return a number: the HUD's visibility.
// Every string goes through fit1 / para / chip so it can never leave its box.

const SEG = {
  // 1 — Takeoff: the jet slides up the paper ribbon ramp and launches; the symbol, cut from paper, sits behind.
  s1(k, F, t, d, ev, A, T, ex) {
    const g = k.g, W = F.W, H = F.H, m = F.m, mm = Math.min(W, H), land = F.mode === "land", port = F.mode === "port";
    paperLogo(g, land ? W * 0.72 : W * 0.6, land ? H * 0.44 : H * 0.42, land ? mm * 0.78 : mm * 0.95, 0.08 + Math.sin(T * 0.3) * 0.015, 0.95 * eout((t - 0.1) / 1.3) * (1 - ex));
    const pts = land ? [[0.07, 0.8, 0], [0.2, 0.79, 0.2], [0.36, 0.62, 0.8], [0.5, 0.54, 0.1], [0.66, 0.62, -0.5], [0.82, 0.5, 0.3], [0.98, 0.3, 0.6], [1.15, 0.16, 1.0]]
      : port ? [[0.06, 0.88, 0], [0.26, 0.87, 0.2], [0.45, 0.78, 0.7], [0.62, 0.7, 0], [0.8, 0.6, 0.3], [1.15, 0.36, 0.9]]
        : [[0.07, 0.86, 0], [0.27, 0.85, 0.2], [0.45, 0.74, 0.7], [0.62, 0.68, 0], [0.82, 0.66, 0.3], [1.15, 0.4, 0.9]];
    const u = clamp01((t - 0.7) / 3.2), sj = lerp(0.03, 1.0, u * u * (0.55 + 0.45 * u)), launch = clamp01((sj - 0.32) / 0.34), s1 = Math.min(1, sj + 0.13);
    H3.plinth(0, (pts[0][0] + pts[1][0]) / 2, pts[0][1] + 0.05, land ? 0.34 : 0.4, land ? 0.14 : 0.1, 0, 0.24, 1 - ex);
    H3.ribbon(0, { pts, s0: ex * 0.97 * s1, s1: Math.max(s1, ex * 0.97 * s1 + 0.01), width: land ? 0.1 : 0.095, twist: 0.22, phase: 0, curl: true });
    if (ex < 0.9) H3.jetOn(0, { f: sj / s1, lift: 0.035 + launch * launch * 0.07, size: land ? 0.2 : 0.19, pitch: 0.28 * launch });
    const Tx = land ? { ...F.text, x: W * 0.07, y: H * 0.25, w: W * 0.62, title: 96 * m } : port ? { ...F.text, y: H * 0.2, title: 84 * m } : { ...F.text, y: H * 0.19, title: 74 * m };
    textBlock(g, { ...F, text: Tx }, { lines: ["Grow your business.", "Simplify the work."], title: Tx.title }, t, 1.0, A);
  },

  // 2 — The weight: leads, the same question again, a half-finished post pile up; the ribbon wraps the pile and lifts it away.
  s2(k, F, t, d, ev, A, T) {
    const g = k.g, s = ST(F), U = s.U, X = s.X, Y = s.Y, m = F.m, Tx = F.text;
    const t0 = ev(0, 0) + 0.15, t1 = ev(1, 0.35), t2 = ev(2, 0.7), tl0 = t2 + 0.6, tL = Math.max(tl0 + 0.9, d - 1.3), lift = ein((t - tL) / 0.7) * F.H * 1.2;
    const tsz = F.mode === "land" ? 96 * m : F.mode === "port" ? 100 * m : 66 * m, lh = tsz * 1.1;
    [["Leads.", t0], ["Questions.", t1], ["Content.", t2]].forEach(([w, tw], i) => { const e = eout((t - tw) / 0.5); if (e <= 0) return; g.save(); g.globalAlpha = A * e; fit1(g, w, Tx.x, Tx.y + (i - 1) * lh + (1 - e) * 26 * m, Tx.w, tsz, i === 2 ? C.mid : C.forest, 1000, Tx.align); g.restore(); });
    g.save(); g.translate(0, -lift);
    // noise tokens that keep arriving
    [["calendar", -392, 130, t0 + 0.7], ["link", 396, 215, t1 + 0.5], ["image", -388, -110, t2 + 0.2], ["share", 400, -50, t2 + 0.6], ["chat", -396, 300, t1 + 0.1], ["doc", 392, -250, t0 + 0.3]].forEach(([nm, x, y, ta], i) => {
      const e = popIn(t, ta, 0.55); if (e <= 0) return; popped(g, X(x), Y(y), e, A * e, 0, () => token(g, X(x), Y(y + Math.sin(T * 1.6 + i * 1.3) * 7), 38 * U, nm)); });
    // the inbox badge counts up, a clock runs
    const cnt = Math.min(9, 1 + Math.floor(Math.max(0, t - t0) / 0.55)), pb = popIn(t, t0 - 0.05, 0.5);
    popped(g, X(-340), Y(-348), pb, A * pb, 0, () => { token(g, X(-340), Y(-348), 46 * U, "mail"); badge(g, X(-310), Y(-382), 20 * U, cnt >= 9 ? "9+" : String(cnt)); });
    const pc = popIn(t, t0 + 0.9, 0.5); popped(g, X(340), Y(-348), pc, A * pc, 0, () => { const cx = X(340), cy = Y(-348), r = 46 * U; g.save(); g.shadowColor = "rgba(22,53,36,0.18)"; g.shadowBlur = r * 0.5; g.shadowOffsetY = r * 0.2; dot(g, cx, cy, r, C.paper); g.restore(); g.strokeStyle = C.mid; g.lineWidth = 3.4 * U; g.lineCap = "round"; g.beginPath(); g.arc(cx, cy, r * 0.62, 0, 7); g.stroke(); const a1 = T * 5.5; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a1) * r * 0.46, cy + Math.sin(a1) * r * 0.46); g.moveTo(cx, cy); g.lineTo(cx, cy - r * 0.32); g.stroke(); });
    // the ribbon ring: its far side goes behind the cards, its near side in front
    const lp = eio((t - tl0) / 0.9), Pl = (q) => { const a = -Math.PI / 2 - q * Math.PI * 2 * 1.12; return [X(Math.cos(a) * 380), Y(-10 + Math.sin(a) * 350)]; };
    const rw = 46 * U, ro = { twist: 1.4, phase: 0.4, alpha: A, n: 130 };
    if (lp > 0) { ribbon2D(k, Pl, 0, Math.min(lp, 0.25), rw, { ...ro, flatEnd: lp > 0.25 }); ribbon2D(k, Pl, 0.75, lp, rw, { ...ro, flatStart: true }); }
    // the pile
    const cw = 530, ch = 150, sway = Math.sin(t * 2.6) * 0.012 * clamp01((t - t2) / 0.6);
    const pile = [
      { at: t0 + 0.1, from: [-950, 240], to: [-20, 235], rot: -0.045, draw: (x, y, w) => { avatar(g, x + 76 * U, y + 75 * U, 38 * U, "JM", C.mist, C.mid); fit1(g, "New inquiry", x + 134 * U, y + 50 * U, w - 134 * U - 84 * U, 31 * U, C.forest, 900); fit1(g, "Jordan M.  ·  9:14", x + 134 * U, y + 84 * U, w - 134 * U - 40 * U, 20 * U, C.muted, 700); bar(g, x + 134 * U, y + 112 * U, 250 * U, 13 * U); dot(g, x + w - 40 * U, y + 40 * U, 11 * U, C.forest); icon(g, "mail", x + w - 44 * U, y + 104 * U, 22 * U, C.mid); } },
      { at: t1 + 0.05, from: [800, -620], to: [26, 88], rot: 0.04, draw: (x, y, w) => { avatar(g, x + 76 * U, y + 75 * U, 38 * U, "AL", C.mist, C.mid); fit1(g, "Do you deliver on weekends?", x + 134 * U, y + 62 * U, w - 134 * U - 30 * U, 28 * U, C.forest, 800); fit1(g, "2 min ago", x + 134 * U, y + 100 * U, 200 * U, 19 * U, C.muted, 700); icon(g, "chat", x + w - 44 * U, y + 104 * U, 22 * U, C.mid); } },
      { at: t1 + 0.85, from: [950, -80], to: [-14, -64], rot: -0.035, draw: (x, y, w) => { avatar(g, x + 76 * U, y + 75 * U, 38 * U, "MK", C.mist, C.mid); fit1(g, "Do you deliver on weekends?", x + 134 * U, y + 62 * U, w - 134 * U - 30 * U, 28 * U, C.forest, 800); chip(g, x + 134 * U, y + 104 * U, "asked again", 18 * U, C.forest, C.sand, { maxW: 190 * U }); } },
      { at: t2 + 0.1, from: [-850, -700], to: [22, -218], rot: 0.05, h: 170, draw: (x, y, w, h) => { rr(g, x + 28 * U, y + 28 * U, 110 * U, 110 * U, 16 * U, C.mist); dot(g, x + 62 * U, y + 62 * U, 13 * U, C.sage); g.fillStyle = C.sage; g.beginPath(); g.moveTo(x + 38 * U, y + 128 * U); g.lineTo(x + 82 * U, y + 82 * U); g.lineTo(x + 128 * U, y + 128 * U); g.fill(); fit1(g, "Post draft", x + 160 * U, y + 52 * U, w - 160 * U - 40 * U, 32 * U, C.forest, 900); bar(g, x + 160 * U, y + 86 * U, 250 * U, 13 * U); bar(g, x + 160 * U, y + 86 * U, 100 * U, 13 * U, C.mid); fit1(g, "still a draft", x + 160 * U, y + 122 * U, 200 * U, 21 * U, C.muted, 700); } },
    ];
    pile.forEach((c, i) => { if (t < c.at) return; const e = eout((t - c.at) / 0.6), p = soft((t - c.at) / 0.6), hh = c.h || ch, x = X(lerp(c.from[0], c.to[0], e)) - (cw / 2) * U, y = Y(lerp(c.from[1], c.to[1], e)) - (hh / 2) * U;
      popped(g, x + (cw / 2) * U, y + (hh / 2) * U, 0.92 + 0.08 * p, A * clamp01((t - c.at) / 0.2), c.rot + sway * (i % 2 ? 1 : -1), () => { card(k, x, y, cw * U, hh * U); c.draw(x, y, cw * U, hh * U); }); });
    if (lp > 0.25) ribbon2D(k, Pl, 0.25, Math.min(lp, 0.75), rw, { ...ro, flatStart: true, flatEnd: lp > 0.75 });
    const up = ein((t - tL + 0.35) / 0.55); if (up > 0) { const Pu = (q) => [X(Math.sin(q * 5) * 30), Y(-350 - q * 1700)]; ribbon2D(k, Pu, 0, up, rw, { twist: 0.8, alpha: A, noShadow: true }); }
    g.restore();
  },

  // 3 — AI Revenue: an inquiry arrives → the follow-up is prepared → it lands in the sales tool, in sync.
  s3(k, F, t, d, ev, A, T) {
    const g = k.g, s = ST(F), U = s.U, X = s.X, Y = s.Y;
    textBlock(g, F, { lines: ["AI Revenue"], sub: "Every lead has a next step.", kicker: { text: "01 / 04", chip: true } }, t, 0.3, A);
    const p1 = 0.35, p2 = Math.max(p1 + 0.95, ev(1, 0.28) - 0.1), p3 = ev(2, 0.4), p4 = ev(3, 0.5);
    const lit = [fadeIn(t, p1 + 0.3, 0.4), fadeIn(t, p2 + 0.6, 0.4), fadeIn(t, p4 + 0.7, 0.4)]; g.save(); g.globalAlpha *= A * fadeIn(t, 0.3, 0.4); rail(g, X(-300), X(300), Y(-404), lit, ["Captured", "Prepared", "In sync"], U, 21); g.restore();
    // inquiry
    let p = popIn(t, p1); popped(g, X(-240), Y(-262), p, A * p, -0.015, () => { const x = X(-440), y = Y(-330), w = 400 * U, h = 140 * U; card(k, x, y, w, h); avatar(g, x + 58 * U, y + 52 * U, 30 * U, "JM", C.mist, C.mid); fit1(g, "A new sales inquiry", x + 104 * U, y + 38 * U, w - 104 * U - 100 * U, 27 * U, C.forest, 900); fit1(g, "Jordan M.", x + 104 * U, y + 66 * U, 160 * U, 18 * U, C.muted, 700); chip(g, x + w - 24 * U, y + 38 * U, "New", 17 * U, C.mid, "#fff", { anchor: "r", maxW: 86 * U }); para(g, "“I'd like to learn about your service.”", x + 28 * U, y + 90 * U, w - 56 * U, 42 * U, 22 * U, C.muted, 700, "left"); });
    // flow 1 + the follow-up
    const f1 = clamp01((t - p2 + 0.5) / 0.6); flowLine(g, X(-200), Y(-190), X(-100), Y(-92), 0, T, f1, C.mid, U);
    p = popIn(t, p2 + 0.2); popped(g, X(-30), Y(40), p, A * p, 0.008, () => {
      const x = X(-190), y = Y(-90), w = 630 * U, h = 330 * U; card(k, x, y, w, h); plate(g, x + 24 * U, y + 22 * U, 52 * U, 52 * U, 15 * U, C.pale); icon(g, "pen", x + 50 * U, y + 48 * U, 20 * U, C.mid); fit1(g, "Sales follow-up", x + 92 * U, y + 48 * U, w - 92 * U - 170 * U, 32 * U, C.forest, 900);
      const ready = t > p3 + 1.15; chip(g, x + w - 26 * U, y + 48 * U, ready ? "Ready" : "Draft", 19 * U, ready ? C.mid : C.pale, ready ? "#fff" : C.mid, { anchor: "r", maxW: 130 * U });
      [["Customer interest", "Your service"], ["Assigned to", "Your sales team"], ["Next step", "Review the follow-up"]].forEach(([a, b], i) => { const e = fadeIn(t, p2 + 0.55 + i * 0.28, 0.35), yy = y + (112 + i * 66) * U; g.save(); g.globalAlpha *= e; rr(g, x + 24 * U, yy - 26 * U, w - 48 * U, 54 * U, 15 * U, C.pale); fit1(g, a, x + 44 * U, yy, 210 * U, 21 * U, C.muted, 700); fit1(g, b, x + 262 * U, yy, w - 262 * U - 72 * U, 24 * U, C.forest, 900); g.restore(); });
      const typed = clamp01((t - p3) / 1.0);
      [470, 420].forEach((bw_, i) => bar(g, x + 28 * U, y + (298 + i * 26) * U - 6 * U, bw_ * U * clamp01(typed * 2.2 - i * 0.9), 13 * U, C.sage));
      tick(g, x + w - 52 * U, y + 296 * U, 26 * U, clamp01((t - p3 - 1.0) / 0.5), C.mid);
    });
    // flow 2 + the sales tool
    const f2 = clamp01((t - p4 + 0.4) / 0.6); flowLine(g, X(-60), Y(240), X(-120), Y(318), 0, T, f2, C.mid, U);
    p = popIn(t, p4); popped(g, X(-190), Y(375), p, A * p, -0.01, () => { const x = X(-440), y = Y(310), w = 560 * U, h = 128 * U; card(k, x, y, w, h); plate(g, x + 24 * U, y + 26 * U, 76 * U, 76 * U, 20 * U, C.forest); [0, 1, 2].forEach((i) => rr(g, x + (40 + i * 20) * U, y + (86 - i * 16) * U, 13 * U, (18 + i * 16) * U, 4 * U, C.sand)); fit1(g, "Sales tool", x + 122 * U, y + 44 * U, 200 * U, 30 * U, C.forest, 900);
      const e = fadeIn(t, p4 + 0.5, 0.3); g.save(); g.globalAlpha *= e; rr(g, x + 122 * U, y + 70 * U, w - 122 * U - 26 * U, 42 * U, 14 * U, C.pale); fit1(g, "Jordan M.  ·  follow-up ready", x + 140 * U, y + 91 * U, w - 122 * U - 26 * U - 150 * U, 19 * U, C.forest, 800); const sy = clamp01((t - p4 - 0.9) / 0.4); icon(g, "sync", x + w - 124 * U, y + 91 * U, 15 * U, C.mid, 2.6); fit1(g, sy > 0 ? "In sync" : "Syncing", x + w - 40 * U, y + 91 * U, 84 * U, 18 * U, C.mid, 900, "right"); g.restore();
      tick(g, x + w - 18 * U, y + 14 * U, 22 * U, clamp01((t - p4 - 1.0) / 0.5), C.mid); });
    const tk = token; p = popIn(t, p2 + 0.1, 0.4); popped(g, X(-100), Y(-142), p, A * p, 0, () => tk(g, X(-100), Y(-142), 24 * U, "route")); p = popIn(t, p4 - 0.1, 0.4); popped(g, X(-90), Y(280), p, A * p, 0, () => tk(g, X(-90), Y(280), 24 * U, "sync"));
  },

  // 4 — AI Operations and Agents: a question → answered from approved documents → routine tasks → connected tools → the team reviews.
  s4(k, F, t, d, ev, A, T) {
    const g = k.g, s = ST(F), U = s.U, X = s.X, Y = s.Y;
    textBlock(g, F, { lines: ["AI Operations and Agents"], sub: "An answer, ready to review.", kicker: { text: "02 / 04", chip: true } }, t, 0.3, A);
    const kk = k.beat.scene === "c4" ? 0.5 : 1, q1 = 0.35, q2 = Math.max(q1 + 0.8, ev(1, 0.26) - 0.1), q3 = ev(2, 0.5), q4 = ev(3, 0.62), q5 = Math.min(ev(4, 0.72), d - (kk < 1 ? 2.0 : 2.3)), qAns = q2 + 0.6 * kk, qType = q2 + 1.2 * kk, qCite = q2 + 2.1 * kk, qBtn = Math.min(q2 + 3.2 * kk, q5 - 0.35);
    // the assistant card
    let p = popIn(t, q1); popped(g, X(-190), Y(-170), p, A * p, 0, () => {
      const x = X(-440), y = Y(-400), w = 500 * U, h = 450 * U; card(k, x, y, w, h);
      logoDisc(g, x + 52 * U, y + 50 * U, 29 * U); fit1(g, "Assistant", x + 96 * U, y + 40 * U, 200 * U, 27 * U, C.forest, 900); dot(g, x + 100 * U, y + 66 * U, 6 * U, C.mid); fit1(g, "ready to help", x + 114 * U, y + 66 * U, 200 * U, 17 * U, C.muted, 700);
      const qa = popIn(t, q1 + 0.45, 0.45); popped(g, x + w - 24 * U - 150 * U, y + 130 * U, qa, qa, 0, () => { const bw_ = 320 * U, bh = 84 * U, bx = x + w - 24 * U - bw_, by = y + 96 * U; rr(g, bx, by, bw_, bh, 26 * U, C.forest); g.fillStyle = C.forest; g.beginPath(); g.moveTo(bx + bw_ - 40 * U, by + bh - 2); g.lineTo(bx + bw_ - 22 * U, by + bh + 22 * U); g.lineTo(bx + bw_ - 80 * U, by + bh - 2); g.fill(); para(g, "Where can I find your return policy?", bx + 24 * U, by + 14 * U, bw_ - 48 * U, bh - 28 * U, 25 * U, C.sand, 800, "left", { lh: 1.18 }); });
      const ar = popIn(t, qAns, 0.45); if (ar > 0) { const dots = t < qType; popped(g, x + 40 * U, y + 250 * U, ar, ar, 0, () => { const bw_ = 420 * U, bh = 150 * U, bx = x + 24 * U, by = y + 200 * U; rr(g, bx, by, bw_, bh, 26 * U, C.pale); logoDisc(g, bx + 22 * U, by + 22 * U, 15 * U);
        if (dots) typingDots(g, bx + 70 * U, by + 74 * U, 6 * U, T); else { const ty = clamp01((t - qType) / (0.9 * kk)); bar(g, bx + 28 * U, by + 56 * U, 360 * U * clamp01(ty * 2), 13 * U, C.sage); bar(g, bx + 28 * U, by + 82 * U, 290 * U * clamp01(ty * 2 - 1), 13 * U, C.sage); const cc = popIn(t, qCite, 0.4); popped(g, bx + 28 * U + 90 * U, by + 118 * U, cc, cc, 0, () => chip(g, bx + 28 * U, by + 118 * U, "Return policy  ↗", 17 * U, C.forest, C.sand, { maxW: 210 * U })); const tc = fadeIn(t, qCite + 0.2 * kk, 0.3); g.save(); g.globalAlpha *= tc; fit1(g, "from approved docs", bx + 250 * U, by + 118 * U, 160 * U, 16 * U, C.muted, 700); g.restore(); } }); }
      const ok = t > q5 + 0.62; const ap = popIn(t, qBtn, 0.4); popped(g, x + w - 100 * U, y + h - 40 * U, ap, ap, 0, () => { rr(g, x + w - 24 * U - 168 * U, y + h - 66 * U, 168 * U, 46 * U, 23 * U, ok ? C.mid : C.pale); fit1(g, ok ? "Approved" : "Approve", x + w - 24 * U - 84 * U, y + h - 43 * U, 140 * U, 20 * U, ok ? "#fff" : C.mid, 900, "center"); });
      tick(g, x + w - 26 * U, y + 26 * U, 26 * U, clamp01((t - q5 - 0.6) / 0.5), C.mid);
    });
    // approved documents fan
    { const e = popIn(t, q2, 0.4); g.save(); g.globalAlpha *= A * clamp01(e); fit1(g, "Approved documents", X(110), Y(-412), 300 * U, 19 * U, C.muted, 800, "left"); g.restore(); }
    [0, 2, 1].forEach((i) => { const pp = popIn(t, q2 + i * 0.13); popped(g, X(278 + (i - 1) * 46), Y(-232), pp, A * pp, 0, () => { const cx = X(278 + (i - 1) * 46), cy = Y(-232), hit = i === 1 && t > q2 + 1.9 * kk; g.save(); g.translate(cx, cy); g.rotate((i - 1) * 0.15); const w = 200 * U, h = 250 * U; card(k, -w / 2, -h / 2, w, h, { r: 22 * U, border: hit ? C.forest : undefined }); icon(g, "doc", -w / 2 + 40 * U, -h / 2 + 46 * U, 22 * U, C.mid); fit1(g, ["Help centre", "Return policy", "Shipping"][i], -w / 2 + 70 * U, -h / 2 + 46 * U, w - 90 * U, 21 * U, C.forest, 900); bar(g, -w / 2 + 24 * U, -h / 2 + 86 * U, 150 * U, 11 * U); bar(g, -w / 2 + 24 * U, -h / 2 + 108 * U, 110 * U, 11 * U); bar(g, -w / 2 + 24 * U, -h / 2 + 130 * U, 140 * U, 11 * U); chip(g, -w / 2 + 24 * U, h / 2 - 34 * U, "Approved", 16 * U, C.pale, C.mid, { maxW: 150 * U }); g.restore(); }); });
    const lk = clamp01((t - q2 - 1.9 * kk) / 0.6); if (lk > 0) { const Pc = spline([[X(250), Y(-150)], [X(150), Y(-80)], [X(40), Y(-30)], [X(-108), Y(-40)]]); ribbon2D(k, Pc, 0, lk, 24 * U, { twist: 0.5, alpha: A, noShadow: true }); }
    // routine tasks
    p = popIn(t, q3); popped(g, X(278), Y(70), p, A * p, 0, () => { const x = X(110), y = Y(-18), w = 330 * U, h = 205 * U; card(k, x, y, w, h); fit1(g, "Routine tasks", x + 24 * U, y + 32 * U, w - 48 * U, 22 * U, C.forest, 900);
      ["Order status", "Bookings", "Reminders"].forEach((lab, i) => { const yy = y + (74 + i * 44) * U, on = clamp01((t - q3 - 0.25 - i * 0.28) / 0.35); dot(g, x + 38 * U, yy, 14 * U, C.pale); tick(g, x + 38 * U, yy, 14 * U, on, C.mid); fit1(g, lab, x + 66 * U, yy, w - 90 * U, 21 * U, C.forest, 800); }); });
    // connected tools
    p = popIn(t, q4); popped(g, X(0), Y(325), p, A * p, 0, () => { const x = X(-440), y = Y(222), w = 880 * U, h = 214 * U; card(k, x, y, w, h); fit1(g, "Connected tools", x + 28 * U, y + 30 * U, 300 * U, 21 * U, C.forest, 900);
      const hx = X(-345), hy = Y(338); [["mail", -110, "Email"], ["calendar", 100, "Calendar"], ["doc", 300, "Documents"]].forEach(([nm, vx, lab], i) => { const tx = X(vx), ty = Y(338), pp = popIn(t, q4 + 0.25 + i * 0.18, 0.4); flowLine(g, hx + 56 * U, hy, tx - 52 * U, ty, 0, T, clamp01((t - q4 - 0.15 - i * 0.18) / 0.5), C.mid, U);
        popped(g, tx, ty, pp, pp, 0, () => { token(g, tx, ty, 44 * U, nm); fit1(g, lab, tx, ty + 66 * U, 170 * U, 19 * U, C.muted, 800, "center"); }); });
      logoDisc(g, hx, hy, 50 * U); ripple(g, hx, hy, 70 * U, ((T * 0.7) % 1), C.mid, 3 * U); });
    // the team reviews
    if (t > q5 - 0.1) { const q = clamp01((t - q5 + 0.1) / 0.7), hx = X(lerp(420, -48, eout(q))), hy = Y(lerp(560, 8, eout(q))) + Math.sin(clamp01((t - q5 - 0.55) / 0.25) * Math.PI) * 12 * U; const hout = clamp01((t - q5 - 1.0) / 0.4); g.save(); g.globalAlpha *= A * (1 - hout); hand(g, hx + hout * 60 * U, hy + hout * 160 * U, 110 * U); g.restore(); ripple(g, X(-48), Y(8), 60 * U, clamp01((t - q5 - 0.55) / 0.6), C.mid, 4 * U); }
  },
};
