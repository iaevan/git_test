// ───────────── the scenes, part 2: web apps, content workflow, the promise, how we work, the close ─────────────

// a tiny app UI that can be drawn as a dashed wireframe, then "designed", then built, block by block
const VIEWS = {
  saas: [[0, 0, 0.15, 1, "side"], [0.18, 0, 0.82, 0.12, "head"], [0.18, 0.17, 0.26, 0.2, "tile"], [0.47, 0.17, 0.26, 0.2, "tile"], [0.76, 0.17, 0.24, 0.2, "tile"], [0.18, 0.42, 0.55, 0.58, "chart"], [0.76, 0.42, 0.24, 0.58, "list"]],
  site: [[0, 0, 1, 0.52, "hero"], [0, 0.58, 0.31, 0.42, "tile"], [0.345, 0.58, 0.31, 0.42, "tile"], [0.69, 0.58, 0.31, 0.42, "tile"]],
  app: [[0, 0, 0.31, 1, "col"], [0.345, 0, 0.31, 1, "col"], [0.69, 0, 0.31, 1, "col"]],
};
function paintBlock(g, ty, w, h, U, T, i) {
  const u = Math.min(w, h);
  switch (ty) {
    case "side": rr(g, 0, 0, w, h, 12 * U, C.forest); drawLogo(g, w / 2, 34 * U, Math.min(w * 0.6, 34 * U), C.sand); [0, 1, 2, 3].forEach((j) => { rr(g, w * 0.22, (70 + j * 36) * U, w * 0.56, 12 * U, 6 * U, j === 0 ? C.sand : "rgba(225,215,193,0.35)"); }); break;
    case "head": rr(g, 0, 0, w, h, 12 * U, C.pale); bar(g, 18 * U, h / 2 - 6 * U, Math.min(w * 0.3, 160 * U), 12 * U, C.sage); dot(g, w - 28 * U, h / 2, Math.min(h * 0.3, 16 * U), C.mist); break;
    case "tile": rr(g, 0, 0, w, h, 12 * U, C.pale); bar(g, 16 * U, h * 0.2, w * 0.4, 10 * U, C.sage); bar(g, 16 * U, h * 0.2 + 22 * U, w * 0.7, Math.min(22 * U, h * 0.2), C.mid); dot(g, w - 26 * U, 26 * U, 10 * U, C.mist); break;
    case "chart": { rr(g, 0, 0, w, h, 12 * U, C.pale); const pts = [0.15, 0.3, 0.22, 0.5, 0.42, 0.66, 0.6, 0.82], n = pts.length, x0 = 22 * U, x1 = w - 22 * U, y1 = h - 26 * U, y0 = 36 * U; g.beginPath(); pts.forEach((v, j) => { const px = lerp(x0, x1, j / (n - 1)), py = lerp(y1, y0, v); j ? g.lineTo(px, py) : g.moveTo(px, py); }); g.lineTo(x1, y1); g.lineTo(x0, y1); g.closePath(); const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, "rgba(55,99,74,0.32)"); gr.addColorStop(1, "rgba(55,99,74,0)"); g.fillStyle = gr; g.fill();
      g.strokeStyle = C.mid; g.lineWidth = 4.5 * U; g.lineJoin = "round"; g.lineCap = "round"; g.beginPath(); pts.forEach((v, j) => { const px = lerp(x0, x1, j / (n - 1)), py = lerp(y1, y0, v); j ? g.lineTo(px, py) : g.moveTo(px, py); }); g.stroke(); bar(g, 22 * U, 14 * U, w * 0.25, 9 * U, C.sage); break; }
    case "list": rr(g, 0, 0, w, h, 12 * U, C.pale); [0, 1, 2, 3].forEach((j) => { const yy = 34 * U + j * Math.min(54 * U, (h - 50 * U) / 4); dot(g, 22 * U, yy, 8 * U, j % 2 ? C.sage : C.mid); bar(g, 40 * U, yy - 5 * U, w - 62 * U, 10 * U, C.sage); }); break;
    case "hero": rr(g, 0, 0, w, h, 14 * U, C.mist); bar(g, 24 * U, h * 0.2, w * 0.5, 18 * U, C.forest); bar(g, 24 * U, h * 0.2 + 32 * U, w * 0.38, 12 * U, C.sage); rr(g, 24 * U, h * 0.62, Math.min(w * 0.32, 150 * U), 38 * U, 19 * U, C.mid); fit1(g, "Start here", 24 * U + Math.min(w * 0.32, 150 * U) / 2, h * 0.62 + 20 * U, Math.min(w * 0.32, 150 * U) - 20 * U, 17 * U, "#fff", 900, "center"); drawLogo(g, w - 0.2 * w, h / 2, Math.min(h * 0.7, w * 0.26), "rgba(255,255,255,0.7)"); break;
    case "col": rr(g, 0, 0, w, h, 12 * U, C.pale); bar(g, 14 * U, 16 * U, w * 0.4, 10 * U, C.sage); [0, 1, 2].slice(0, i === 2 ? 2 : 3).forEach((j) => { const yy = 40 * U + j * (h - 52 * U) / 3; rr(g, 10 * U, yy, w - 20 * U, (h - 52 * U) / 3 - 8 * U, 10 * U, C.paper); bar(g, 22 * U, yy + 14 * U, w * 0.5, 9 * U, C.sage); dot(g, 30 * U, yy + 44 * U, 8 * U, [C.mid, C.sage, C.leaf][(i + j) % 3]); dot(g, 50 * U, yy + 44 * U, 8 * U, [C.sage, C.leaf, C.mid][(i + j) % 3]); }); break;
  }
}
function appView(g, kind, x, y, w, h, U, build, T) {
  const L = VIEWS[kind], n = L.length;
  L.forEach(([fx, fy, fw, fh, ty], i) => {
    const e = clamp01(build * (n + 1) - i), ex = x + fx * w, ey = y + fy * h, ew = fw * w - 8 * U, eh = fh * h - 8 * U;
    g.save(); g.globalAlpha *= 1 - e * 0.92; g.setLineDash([8 * U, 7 * U]); rr(g, ex, ey, ew, eh, 12 * U, null, "rgba(22,53,36,0.35)", 2.2 * U); g.restore();
    if (e <= 0) return; const sc = 0.9 + 0.1 * soft(e); g.save(); g.globalAlpha *= clamp01(e * 1.4); g.translate(ex + ew / 2, ey + eh / 2); g.scale(sc, sc); g.translate(-ew / 2, -eh / 2); paintBlock(g, ty, ew, eh, U, T, i); g.restore();
  });
}
const SERVICES = [
  { name: "AI Revenue", line: "Every lead has a next step.", icon: "funnel" }, { name: "AI Operations and Agents", line: "An answer, ready to review.", icon: "chat" },
  { name: "SaaS and Custom Web Apps", line: "Big ideas. A useful first step.", icon: "window" }, { name: "AI Content Workflow", line: "One brief. Content for each channel.", icon: "pen" },
];

Object.assign(SEG, {
  // 5 — SaaS and custom web apps: wireframe → designed → built → launched; products, websites, web apps; customer and team views.
  s5(k, F, t, d, ev, A, T) {
    const g = k.g, s = ST(F), U = s.U, X = s.X, Y = s.Y;
    textBlock(g, F, { lines: ["SaaS and Custom Web Apps"], sub: "Big ideas. A useful first step.", kicker: { text: "03 / 04", chip: true } }, t, 0.3, A);
    const b0 = 0.35, b1 = Math.max(1.0, ev(1, 0.2) + 0.1), b2 = ev(2, 0.42), b3 = ev(3, 0.62), tSw = b3 + Math.min(1.5, Math.max(0.6, (d - 0.9 - b3) * 0.55));
    const lit = [fadeIn(t, b1, 0.4), fadeIn(t, b1 + 0.55, 0.4), fadeIn(t, b1 + 1.1, 0.4)]; g.save(); g.globalAlpha *= A * fadeIn(t, 0.3, 0.4); rail(g, X(-340), X(-60), Y(-404), lit, ["Design", "Build", "Launch"], U, 20); g.restore();
    // which screen, when
    const tabT = [b2, b2 + 0.85, b2 + 1.65]; const role = t >= tSw ? 1 : 0;
    let kind = "saas", tab = 0; if (t >= b3) { kind = role ? "app" : "site"; tab = role ? 2 : 1; } else if (t >= tabT[2]) { kind = "app"; tab = 2; } else if (t >= tabT[1]) { kind = "site"; tab = 1; }
    const changes = [tabT[1], tabT[2], b3, tSw].filter((x) => x <= d), flip = Math.max(0, ...changes.map((c) => Math.sin(clamp01((t - c + 0.2) / 0.4) * Math.PI)));
    const build = clamp01((t - b1) / 1.1) * (t >= b1 ? 1 : 0), p = popIn(t, b0, 0.5), cx = X(-60), cy = Y(-80);
    popped(g, cx, cy, p, A * p, 0, () => {
      g.save(); g.translate(cx, cy); g.scale(Math.max(0.05, 1 - flip * 0.95), 1); g.translate(-cx, -cy);
      const x = X(-380), y = Y(-295), w = 640 * U, h = 430 * U; card(k, x, y, w, h, { r: 26 * U });
      g.save(); g.beginPath(); g.roundRect(x, y, w, h, 26 * U); g.clip(); g.fillStyle = C.pale; g.fillRect(x, y, w, 56 * U); g.restore();
      [0, 1, 2].forEach((i) => dot(g, x + (30 + i * 24) * U, y + 28 * U, 7 * U, [C.sage, C.mist, C.mist][i]));
      ["SaaS product", "Website", "Web app"].forEach((nm, i) => { const tx = x + (130 + i * 164) * U, on = tab === i && t >= tabT[0]; rr(g, tx, y + 11 * U, 154 * U, 40 * U, 14 * U, on ? C.paper : "rgba(255,255,255,0)"); fit1(g, nm, tx + 77 * U, y + 32 * U, 130 * U, 18 * U, on ? C.forest : C.muted, 800, "center"); });
      appView(g, kind, x + 22 * U, y + 74 * U, w - 44 * U, h - 96 * U, U, build, T);
      const pen = fadeIn(t, b0 + 0.3, 0.3) * (1 - clamp01((t - b1) / 0.4)); if (pen > 0) { g.save(); g.globalAlpha *= pen; icon(g, "pen", x + w - 70 * U + Math.sin(T * 5) * 8 * U, y + h - 70 * U + Math.cos(T * 5) * 5 * U, 26 * U, C.forest, 2.6); g.restore(); }
      g.restore();
    });
    // launch
    const pl = popIn(t, b1 + 1.15, 0.5); popped(g, X(240), Y(-300), pl, A * pl, 0, () => { chip(g, X(240), Y(-300), "● Live", 20 * U, C.forest, C.sand, { anchor: "r", maxW: 130 * U }); }); ripple(g, X(150), Y(-300), 70 * U, clamp01((t - b1 - 1.15) / 0.7), C.mid, 4 * U);
    // the phone
    const pp = popIn(t, b2 + 0.3, 0.6); if (pp > 0) { const px = X(315), py = Y(50) + (1 - eout((t - b2 - 0.3) / 0.7)) * 120 * U; popped(g, px, py, 0.9 + 0.1 * pp, A * clamp01(pp * 1.5), 0.04, () => {
      const w = 190 * U, h = 390 * U, x = px - w / 2, y = py - h / 2; g.save(); g.shadowColor = "rgba(22,53,36,0.3)"; g.shadowBlur = 34 * U; g.shadowOffsetY = 18 * U; rr(g, x, y, w, h, 34 * U, C.forest); g.restore(); rr(g, x + 8 * U, y + 8 * U, w - 16 * U, h - 16 * U, 27 * U, C.paper); rr(g, x + w / 2 - 28 * U, y + 14 * U, 56 * U, 12 * U, 6 * U, C.forest);
      logoDisc(g, x + 38 * U, y + 62 * U, 17 * U); bar(g, x + 64 * U, y + 56 * U, 90 * U, 10 * U, C.sage);
      rr(g, x + 22 * U, y + 94 * U, w - 44 * U, 110 * U, 18 * U, role ? C.pale : C.mist); bar(g, x + 36 * U, y + 114 * U, 80 * U, 12 * U, C.forest); bar(g, x + 36 * U, y + 138 * U, 56 * U, 9 * U, C.sage); rr(g, x + 36 * U, y + 160 * U, 74 * U, 28 * U, 14 * U, C.mid);
      [0, 1, 2].forEach((j) => { const yy = y + 226 * U + j * 44 * U; rr(g, x + 22 * U, yy, w - 44 * U, 34 * U, 12 * U, C.pale); dot(g, x + 40 * U, yy + 17 * U, 7 * U, j === (Math.floor(T * 1.4) % 3) ? C.mid : C.sage); bar(g, x + 56 * U, yy + 12 * U, 70 * U, 9 * U, C.sage); }); }); }
    // roles + the features each one needs
    const pr = popIn(t, b3, 0.5); popped(g, X(-60), Y(185), pr, A * pr, 0, () => { const w = 330 * U, h = 56 * U, x = X(-60) - w / 2, y = Y(185) - h / 2; rr(g, x, y, w, h, h / 2, "rgba(22,53,36,0.1)"); const th = role ? 1 : 0, ts = eio((t - tSw) / 0.35); const tp = role ? ts : 0; rr(g, x + 5 * U + tp * (w / 2 - 5 * U), y + 5 * U, w / 2 - 5 * U, h - 10 * U, (h - 10 * U) / 2, C.forest);
      ["Customer", "Team"].forEach((nm, i) => fit1(g, nm, x + w * (0.25 + i * 0.5), y + h / 2 + 1, w / 2 - 30 * U, 22 * U, (i === role ? (ts > 0.5 || !role ? C.sand : C.forest) : C.forest), 900, "center")); void th; });
    const feats = [["route", "Start here"], ["calendar", "Book or order"], ["chat", "Get help"]], featT = [["mail", "Inbox"], ["toggle", "Tasks"], ["window", "Overview"]];
    [0, 1, 2].forEach((i) => { const pf = popIn(t, b3 + 0.25 + i * 0.18, 0.5), sw = clamp01((t - tSw) / 0.3), cur = sw > 0.5 ? featT[i] : feats[i]; popped(g, X(-300 + i * 240), Y(335), pf, A * pf, 0, () => { const x = X(-380 + i * 240), y = Y(258), w = 210 * U, h = 150 * U; card(k, x, y, w, h, { r: 22 * U }); plate(g, x + 20 * U, y + 22 * U, 52 * U, 52 * U, 15 * U, C.pale); icon(g, cur[0], x + 46 * U, y + 48 * U, 20 * U, C.mid); fit1(g, cur[1], x + 20 * U, y + 108 * U, w - 36 * U, 24 * U, C.forest, 900); bar(g, x + 20 * U, y + 130 * U, 90 * U, 8 * U); }); });
  },

  // 6 — AI Content Workflow: one brief; the ribbon branches into content for each channel; the team approves each one.
  s6(k, F, t, d, ev, A, T) {
    const g = k.g, s = ST(F), U = s.U, X = s.X, Y = (v) => s.Y(v + 40);
    textBlock(g, F, { lines: ["AI Content Workflow"], sub: "One brief. Content for each channel.", kicker: { text: "04 / 04", chip: true } }, t, 0.3, A);
    const c1 = 0.35, c2 = Math.max(1.3, ev(1, 0.4) - 0.2), c3 = ev(2, 0.7);
    let p = popIn(t, c1); popped(g, X(0), Y(-335), p, A * p, -0.01, () => { const x = X(-270), y = Y(-420), w = 540 * U, h = 170 * U; card(k, x, y, w, h); chip(g, x + 28 * U, y + 38 * U, "Brief", 18 * U, C.forest, C.sand, { maxW: 130 * U }); icon(g, "spark", x + w - 46 * U, y + 40 * U, 17 * U, C.mid); para(g, "“Let's share our new product.”", x + 28 * U, y + 72 * U, w - 56 * U, 58 * U, 34 * U, C.forest, 900, "left", { lh: 1.12 }); });
    const sp = eio((t - c2) / 0.9), xs = [-290, 0, 290];
    if (sp > 0) xs.forEach((tx, i) => { const Pb = spline([[X(0), Y(-250)], [X(tx * 0.35), Y(-190)], [X(tx * 0.9), Y(-120)], [X(tx), Y(-50)]]); ribbon2D(k, Pb, 0, sp, 34 * U, { twist: 0.7, phase: i, alpha: A, noShadow: true }); });
    const hub = popIn(t, c2 - 0.1, 0.5); popped(g, X(0), Y(-250), hub, A * hub, 0, () => { g.save(); g.shadowColor = "rgba(22,53,36,0.25)"; g.shadowBlur = 18 * U; g.shadowOffsetY = 6 * U; logoDisc(g, X(0), Y(-250), 36 * U); g.restore(); ripple(g, X(0), Y(-250), 60 * U, (T * 0.8) % 1, C.mid, 3 * U); });
    const defs = [
      { nm: "Email", ic: "mail", draw: (x, y, w, h) => { fit1(g, "Meet our new product", x + 22 * U, y + 92 * U, w - 44 * U, 22 * U, C.forest, 900); [210, 200, 130].forEach((bw_, j) => bar(g, x + 22 * U, y + (126 + j * 24) * U, bw_ * U, 11 * U)); rr(g, x + 22 * U, y + 216 * U, 120 * U, 36 * U, 18 * U, C.mid); fit1(g, "Learn more", x + 82 * U, y + 235 * U, 100 * U, 16 * U, "#fff", 900, "center"); } },
      { nm: "Social", ic: "share", draw: (x, y, w, h) => { rr(g, x + 20 * U, y + 84 * U, w - 40 * U, 120 * U, 16 * U, C.mist); dot(g, x + 70 * U, y + 126 * U, 18 * U, C.paper); g.fillStyle = C.sage; g.beginPath(); g.moveTo(x + 34 * U, y + 204 * U); g.lineTo(x + 104 * U, y + 144 * U); g.lineTo(x + 174 * U, y + 204 * U); g.fill(); icon(g, "heart", x + 36 * U, y + 232 * U, 14 * U, C.mid, 2.4); icon(g, "chat", x + 74 * U, y + 232 * U, 14 * U, C.mid, 2.4); bar(g, x + 100 * U, y + 228 * U, 110 * U, 9 * U); } },
      { nm: "Web page", ic: "window", draw: (x, y, w, h) => { rr(g, x + 20 * U, y + 84 * U, w - 40 * U, 90 * U, 14 * U, C.mist); bar(g, x + 34 * U, y + 104 * U, 130 * U, 14 * U, C.forest); bar(g, x + 34 * U, y + 130 * U, 90 * U, 9 * U, C.sage); [0, 1, 2].forEach((j) => rr(g, x + (20 + j * 66) * U, y + 186 * U, 58 * U, 66 * U, 12 * U, C.pale)); } },
    ];
    defs.forEach((df, i) => { const tt = c2 + 0.7 + i * 0.18, pc = popIn(t, tt), x = X(xs[i] - 135), y = Y(-60), w = 270 * U, h = 330 * U, ok = clamp01((t - c3 - 0.5 - i * 0.6) / 0.5);
      popped(g, x + w / 2, y + h / 2, pc, A * pc, (i - 1) * 0.015, () => { card(k, x, y, w, h); plate(g, x + 18 * U, y + 18 * U, 46 * U, 46 * U, 14 * U, C.pale); icon(g, df.ic, x + 41 * U, y + 41 * U, 18 * U, C.mid); fit1(g, df.nm, x + 76 * U, y + 42 * U, w - 76 * U - 60 * U, 26 * U, C.forest, 900); df.draw(x, y, w, h);
        tick(g, x + w - 30 * U, y + 38 * U, 20 * U, ok, C.mid);
        const done = ok > 0.5; rr(g, x + 22 * U, y + h - 52 * U, w - 44 * U, 36 * U, 18 * U, done ? C.mid : C.pale); fit1(g, done ? "Approved" : "Needs review", x + w / 2, y + h - 34 * U, w - 70 * U, 17 * U, done ? "#fff" : C.mid, 900, "center"); }); });
    const hq = c3 + 0.1; if (t > hq) { const seg = Math.min(2, Math.floor((t - hq) / 0.6)), fr = ((t - hq) % 0.6) / 0.6, tx = [-250, 40, 330][seg], hx = X(lerp(seg === 0 ? 430 : [-250, 40, 330][seg - 1], tx, eout(clamp01(fr * 1.6)))) + 0, hy = Y(255 + Math.sin(clamp01((fr - 0.55) / 0.3) * Math.PI) * 10);
      const out = ein((t - (c3 + 2.2)) / 0.5); g.save(); g.globalAlpha *= A * (1 - out); hand(g, hx, hy + (seg === 0 && t - hq < 0.4 ? (1 - eout((t - hq) / 0.4)) * 200 * U : 0), 100 * U); g.restore(); }
  },

  // 7 — The promise: the four services; a seal with the symbol lands across all four.
  s7(k, F, t, d, ev, A, T) {
    const g = k.g, s = ST(F), U = s.U, X = s.X, Y = s.Y, m = F.m;
    textBlock(g, F, { lines: ["Your team", "has the final say."], sub: "In every system.", kicker: { text: "The promise", chip: true } }, t, 0.3, A);
    const tS = Math.max(1.0, ev(0, 0) + Math.min(2.2, d * 0.42)), hit = clamp01((t - tS) / 0.14), bump = Math.sin(clamp01((t - tS - 0.04) / 0.32) * Math.PI) * 9 * U;
    SERVICES.forEach((sv, i) => { const c = i % 2, r = Math.floor(i / 2), x0 = -425 + c * 440, y0 = -315 + r * 330, pp = popIn(t, 0.3 + i * 0.13), x = X(x0), y = Y(y0) + bump * (1 - Math.abs(c - 0.5)), w = 410 * U, h = 300 * U, right = c === 1, ix = right ? x + w - 28 * U : x + 28 * U, al = right ? "right" : "left", tw_ = w - 56 * U - 95 * U, tx0 = right ? x + w - 28 * U - tw_ : x + 28 * U;
      popped(g, x + w / 2, y + h / 2, pp, A * pp, 0, () => { card(k, x, y, w, h, { r: 30 * U }); plate(g, right ? x + w - 28 * U - 84 * U : x + 28 * U, y + 28 * U, 84 * U, 84 * U, 24 * U, C.pale); icon(g, sv.icon, right ? x + w - 28 * U - 42 * U : x + 70 * U, y + 70 * U, 32 * U, C.mid, 2.8); para(g, sv.name, tx0, y + 138 * U, tw_, 76 * U, 33 * U, C.forest, 1000, al, { lh: 1.08 }); para(g, sv.line, tx0, y + 218 * U, tw_, 56 * U, 22 * U, C.muted, 700, al, { lh: 1.2 });
        tick(g, right ? x + 44 * U : x + w - 44 * U, y + 44 * U, 22 * U, clamp01((t - tS - 0.15 - i * 0.12) / 0.5), C.mid); }); });
    if (t > tS - 0.35) { const q = clamp01((t - tS + 0.35) / 0.35), sc = lerp(2.2, 1, eout(q)), p = clamp01(q * 1.5) * A; seal(g, X(0), Y(0), 138 * U * sc, lerp(-0.7, -0.2, eout(q)), p);
      ripple(g, X(0), Y(0), 300 * U, clamp01((t - tS) / 0.8), C.forest, 5 * U); for (let j = 0; j < 12; j++) { const a = j * 0.5236 + 0.2, e = clamp01((t - tS) / 0.6); if (e > 0 && e < 1) dot(g, X(0) + Math.cos(a) * 190 * U * (1 + e * 0.9), Y(0) + Math.sin(a) * 190 * U * (1 + e * 0.9), 5 * U * (1 - e), "rgba(22,53,36," + (0.5 * (1 - e)) + ")"); } }
    void hit; void m;
  },

  // 8 — How we work: four stops along the paper ribbon; the jet hops from stop to stop; each step lights up as it is spoken.
  s8(k, F, t, d, ev, A, T, ex) {
    const g = k.g, W = F.W, H = F.H, m = F.m, mm = Math.min(W, H), land = F.mode === "land", port = F.mode === "port";
    H3.setDrift(T, 0.2);
    const Tx = land ? { ...F.text, x: W * 0.5, align: "center", y: H * 0.13, w: W * 0.8 } : { ...F.text, y: H * 0.105, w: W * 0.86 };
    textBlock(g, { ...F, text: Tx }, { lines: ["Simple from the start."], kicker: { text: "How we work", chip: true } }, t, 0.3, A);
    const pts = land ? [[-0.06, 0.72, 0], [0.15, 0.7, 0.3], [0.38, 0.76, 0.2], [0.62, 0.68, 0.3], [0.85, 0.74, 0.2], [1.12, 0.62, 0.5]]
      : port ? [[0.26, 0.2, 0], [0.2, 0.3, 0.3], [0.3, 0.47, 0.2], [0.2, 0.64, 0.3], [0.3, 0.81, 0.2], [0.24, 1.06, 0.4]]
        : [[0.26, 0.22, 0], [0.2, 0.34, 0.3], [0.3, 0.51, 0.2], [0.2, 0.68, 0.3], [0.3, 0.85, 0.2], [0.24, 1.08, 0.4]];
    const stopI = [1, 2, 3, 4], S = H3.stops(pts, stopI), tOn = [0, 1, 2, 3].map((i) => ev(i + 1, 0.2 + i * 0.2));
    const draw = eio((t - 0.25) / 1.0), bw = port ? 0.075 : land ? 0.08 : 0.078;
    stopI.forEach((j, i) => H3.plinth(i, pts[j][0], pts[j][1] + 0.02, port ? 0.17 : land ? 0.14 : 0.15, port ? 0.06 : land ? 0.12 : 0.07, pts[j][2], 0.12, clamp01(draw * 4 - i * 0.6) * (1 - ex)));
    let sj = S[0] - 0.07, hop = 0;
    for (let i = 0; i < 4; i++) { const st = tOn[i] - 0.6, e = eio((t - st) / 0.6); if (t > st) { sj = lerp(i ? S[i - 1] : S[0] - 0.07, S[i], e); hop = Math.sin(clamp01((t - st) / 0.6) * Math.PI); } }
    const dep = t > tOn[3] + 0.5 ? ein((t - tOn[3] - 0.5) / 0.9) : 0; if (dep > 0) sj = lerp(S[3], 1, dep);
    const s1 = Math.max(0.01, draw), s0 = ex * 0.97 * s1;
    H3.ribbon(0, { pts, s0, s1: Math.max(s1, s0 + 0.01), width: bw, twist: 0.2, phase: 0.3 });
    if (draw > 0.3 && ex < 0.9) H3.jetOn(0, { f: clamp01(sj / s1), lift: 0.05 + hop * 0.05, size: port ? 0.15 : 0.13, pitch: 0.15 * hop });
    const names = [["Understand", "the problem"], ["Plan", "the first version"], ["Build and", "launch it"], ["Keep", "improving"]], icons = ["search", "route", "launch", "loop"];
    stopI.forEach((j, i) => { const on = clamp01((t - tOn[i]) / 0.4), vis = clamp01(draw * 1.4 - S[i] + 0.15), sx = pts[j][0] * W, sy = pts[j][1] * H;
      const cw = land ? W * 0.205 : W * 0.56, ch = land ? H * 0.23 : H * (port ? 0.115 : 0.135), cx = land ? sx - cw / 2 : W * 0.96 - cw, cy = land ? H * 0.27 : sy - ch / 2;
      const pp = vis * eout((t - 0.3 - i * 0.1) / 0.5), lift2 = (1 - eout((t - 0.3 - i * 0.1) / 0.6)) * 30 * m;
      g.save(); g.globalAlpha = A * pp * (1 - ex); g.translate(0, lift2);
      g.save(); g.shadowColor = "rgba(22,53,36,0.1)"; g.shadowBlur = 24 * m; g.shadowOffsetY = 10 * m; rr(g, cx, cy, cw, ch, 26 * m, on > 0.4 ? C.forest : C.paper); g.restore(); rr(g, cx, cy, cw, ch, 26 * m, null, "rgba(22,53,36,0.08)", 1.5 * m);
      const dk = on > 0.4, num = (land ? 34 : 38) * m;
      if (land) { const ic = Math.min(ch * 0.34, 54 * m); plate(g, cx + 22 * m, cy + 22 * m, ic * 1.5, ic * 1.5, ic * 0.42, dk ? "rgba(225,215,193,0.18)" : C.pale); icon(g, icons[i], cx + 22 * m + ic * 0.75, cy + 22 * m + ic * 0.75, ic * 0.52, dk ? C.sand : C.mid, 2.6);
        fit1(g, "0" + (i + 1), cx + cw - 22 * m, cy + 38 * m, cw * 0.3, num, dk ? C.sage : "rgba(55,99,74,0.55)", 1000, "right");
        const ty = cy + 22 * m + ic * 1.5 + 30 * m; fit1(g, names[i][0], cx + 22 * m, ty, cw - 44 * m, 32 * m, dk ? C.sand : C.forest, 1000); fit1(g, names[i][1], cx + 22 * m, ty + 34 * m, cw - 44 * m, 24 * m, dk ? C.mist : C.muted, 700); }
      else { const pl = Math.min(ch * 0.58, 84 * m), px0 = cx + 22 * m, tx = px0 + pl + 20 * m, tw = cx + cw - 22 * m - tx - num * 1.6; plate(g, px0, cy + (ch - pl) / 2, pl, pl, pl * 0.3, dk ? "rgba(225,215,193,0.18)" : C.pale); icon(g, icons[i], px0 + pl / 2, cy + ch / 2, pl * 0.3, dk ? C.sand : C.mid, 2.6);
        fit1(g, "0" + (i + 1), cx + cw - 22 * m, cy + ch / 2, num * 1.6, num, dk ? C.sage : "rgba(55,99,74,0.55)", 1000, "right");
        fit1(g, names[i][0], tx, cy + ch / 2 - 18 * m, tw, 33 * m, dk ? C.sand : C.forest, 1000); fit1(g, names[i][1], tx, cy + ch / 2 + 20 * m, tw, 25 * m, dk ? C.mist : C.muted, 700); }
      g.restore();
      if (land) { g.save(); g.globalAlpha = A * pp * (1 - ex) * 0.7; g.setLineDash([2, 10 * m]); g.strokeStyle = on > 0.4 ? C.forest : C.sage; g.lineWidth = 3.5 * m; g.lineCap = "round"; g.beginPath(); g.moveTo(sx, cy + ch + 6 * m); g.lineTo(sx, sy - 0.1 * H); g.stroke(); g.restore(); }
      ripple(g, sx, sy - 0.02 * H, 60 * m, clamp01((t - tOn[i]) / 0.7), C.mid, 4 * m); });
  },

  // 9 — Close: the call to action; then the symbol rises in 3D, the ribbon carries the jet in, and the jet lands as the period of "zavino.".
  s9(k, F, t, d, ev, A, T, ex) {
    const g = k.g, W = F.W, H = F.H, m = F.m, mm = Math.min(W, H), port = F.mode === "port", land = F.mode === "land", sh = k.beat.scene === "c9";
    const tB = ev(1, 0.2), tHelp = sh ? 1e9 : ev(2, 0.35), tWm = (sh ? ev(2, 0.5) : ev(3, 0.62)) - 0.15, tTag = sh ? ev(3, 0.7) : ev(4, 0.78), out = eio((t - tWm + 0.65) / 0.5);
    // layout of the lockup
    const lg = { x: 0.5, y: land ? 0.36 : port ? 0.37 : 0.33, s: land ? 0.31 : port ? 0.52 : 0.3 }, ws = (land ? 0.2 * H : port ? 0.215 * W : 0.19 * H), yb = H * (land ? 0.74 : port ? 0.66 : 0.72);
    font(g, ws, 1000); const ww = g.measureText("zavino").width, pr = ws * 0.105, x0 = W / 2 - (ww + pr * 3) / 2, px = x0 + ww + pr * 1.55, py = yb - pr;
    // phase A — a paper-cut symbol behind the call to action
    paperLogo(g, W * 0.5, H * 0.5, mm * 0.95, -0.06, 0.9 * eout((t - 0.1) / 1.0) * (1 - out) * (1 - ex));
    const ta = 1 - out; if (ta > 0.01) {
      g.save(); g.translate(0, -out * 60 * m);
      const Tx = { ...F.text, x: W * 0.5, y: H * (port ? 0.38 : 0.34), w: W * (port ? 0.88 : 0.72), align: "center", title: (port ? 96 : land ? 92 : 70) * m };
      textBlock(g, { ...F, text: Tx }, { lines: ["Have a project in mind?"], title: Tx.title }, t, 0.25, A * ta);
      const by = H * (port ? 0.5 : land ? 0.52 : 0.53), bp = popIn(t, tB); popped(g, W / 2, by, bp, A * ta * bp, 0, () => { const bh = 96 * m; font(g, 40 * m, 900); const tw = Math.min(W * 0.8, g.measureText("Book an AI audit").width + 150 * m); g.save(); g.shadowColor = "rgba(22,53,36,0.3)"; g.shadowBlur = 26 * m; g.shadowOffsetY = 12 * m; rr(g, W / 2 - tw / 2, by - bh / 2, tw, bh, bh / 2, C.forest); g.restore(); logoDisc(g, W / 2 - tw / 2 + bh * 0.5, by, bh * 0.3, C.sand, C.forest); fit1(g, "Book an AI audit", W / 2 + bh * 0.2, by + 2 * m, tw - bh - 40 * m, 40 * m, C.sand, 900, "center"); });
      if (tB + 0.55 > 0 && t > tB + 0.2) { const q = clamp01((t - tB - 0.2) / 0.6); g.save(); g.globalAlpha *= A * ta; cursor(g, lerp(W * 0.66, W / 2 + 90 * m, eout(q)), lerp(by + 140 * m, by + 8 * m, eout(q)), 40 * m, Math.sin(clamp01((t - tB - 0.8) / 0.2) * Math.PI)); g.restore(); ripple(g, W / 2 + 90 * m, by + 12 * m, 70 * m, clamp01((t - tB - 0.85) / 0.6), C.mist, 4 * m); }
      const sp = fadeIn(t, tHelp, 0.5); g.save(); g.globalAlpha = A * ta * sp; fit1(g, "We'll help you find a clear first step.", W / 2, H * (port ? 0.61 : land ? 0.67 : 0.68), W * 0.86, (port ? 42 : 38) * m, C.mid, 800, "center"); g.restore();
      g.restore();
    }
    // phase B — the symbol rises in 3D, the wordmark spells out, the jet lands as the period
    const tl = tWm - 0.35, dr = 1 - ease((t - tWm + 1.0) / 1.0); H3.setDrift(T, dr);
    if (t > tl) { const e = soft((t - tl) / 1.0); H3.logo(lg.x, lg.y, 0, lg.s, { scale: e, ry: (1 - eout((t - tl) / 1.6)) * 2.6 + Math.sin(T * 0.8) * 0.16, rx: Math.sin(T * 0.55) * 0.07 - 0.04, rz: 0 }); }
    const fly = clamp01((t - tWm + 0.7) / 1.15), arrive = eio(fly);
    if (fly > 0) {
      const ppts = [[-0.14, land ? 0.88 : port ? 0.8 : 0.9, 0.6], [0.2, land ? 0.84 : 0.8, 0.9], [0.45, (py / H) + 0.1, 0.4], [(px - 0.07 * W) / W, py / H + 0.05, 0.1], [px / W, py / H, 0]];
      const h1 = Math.max(0.02, arrive), h0 = ein(clamp01((t - tWm + 0.2) / 0.8));
      if (h1 - h0 > 0.006) H3.ribbon(0, { pts: ppts, s0: h0, s1: h1, width: 0.055, twist: 0.4, phase: 0.5, tapeIn: 0.2, tapeOut: 0.03 });
      const morph = clamp01((fly - 0.84) / 0.16), L = lerp(0.13, (pr * 2.2) / mm, ein(clamp01((fly - 0.6) / 0.4)));
      if (morph < 1) H3.jetOn(0, { f: 0.99, lift: 0.004 * (1 - morph), size: L, pitch: 0 }); if (morph > 0) dot(g, px, py, pr * soft(morph), C.mid);
    }
    "zavino".split("").forEach((c, i) => { const tt = tWm - 0.25 + i * 0.07, e = eout((t - tt) / 0.5); if (e <= 0) return; font(g, ws, 1000); const xo = g.measureText("zavino".slice(0, i)).width; g.save(); g.globalAlpha = A * e; g.fillStyle = C.forest; g.textAlign = "left"; g.textBaseline = "alphabetic"; g.fillText(c, x0 + xo, yb + (1 - e) * 30 * m); g.restore(); });
    if (t > tWm + 1.1) dot(g, px, py, pr, C.mid);
    const tg = fadeIn(t, tTag, 0.6); g.save(); g.globalAlpha = A * tg; fit1(g, "Where vision takes flight.", W / 2, yb + (port ? 0.07 : 0.078) * H + (1 - tg) * 14 * m, W * 0.9, (port ? 54 : land ? 50 : 46) * m, C.mid, 800, "center"); g.restore();
    const wb = fadeIn(t, tTag + 0.8, 0.6); g.save(); g.globalAlpha = A * wb; const yc = yb + (port ? 0.07 : 0.078) * H + (port ? 112 : land ? 92 : 84) * m; font(g, 30 * m, 900); const l1 = "Book an AI audit", l2 = "thezavino.com", sep = 46 * m, w1 = g.measureText(l1).width, w2 = g.measureText(l2).width, xs = W / 2 - (w1 + sep + w2) / 2;
    fit1(g, l1, xs, yc, w1 + 4, 30 * m, C.forest, 900, "left"); dot(g, xs + w1 + sep / 2, yc, 5 * m, C.mid); fit1(g, l2, xs + w1 + sep, yc, w2 + 4, 30 * m, C.forest, 900, "left"); g.restore();
    return 1 - ease((t - tWm + 0.5) / 0.4);
  },
});
// the 30 s cut reuses scenes 3, 4, 5 and 9 with shorter lines
SEG.c3 = SEG.s3; SEG.c4 = SEG.s4; SEG.c5 = SEG.s5; SEG.c9 = SEG.s9;
