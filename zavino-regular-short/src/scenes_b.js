// ───────────────────────────── scenes, part B: the counter, the review loop, the owner's view, the ask ─────────────────────────────
/** a round avatar with a person's face (clips the character's head into a circle) */
function faceAvatar(k, x, y, r, style, mood) {
  const g = k.g; g.save(); g.beginPath(); g.arc(x, y, r, 0, 7); g.clip(); circle(g, x, y, r, style.bg || Z.f200);
  const H = 2.85 * r / k.u; person(k, { ...style, x, y: y - 0.05 * r + 2.22 * r, h: H, mood: mood || "happy", arms: "down" }); g.restore(); g.save(); g.strokeStyle = "rgba(22,53,36,0.15)"; g.lineWidth = 3 * k.u; g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke(); g.restore();
}
const letterAvatar = (k, x, y, r, ch, bg, fg, a) => { const g = k.g; g.save(); if (a !== undefined) g.globalAlpha = a; circle(g, x, y, r, bg); txt(g, ch, x, y + 2 * k.u, r * 0.95, fg || Z.f900, 800); g.restore(); };
/** the owner's dashboard card. tab: 0 regulars · 1 big spenders · 2 gone quiet. (x,y) = top-left, tt = seconds since the tab appeared */
function dash(k, tab, x, y, w, h, tt) {
  const g = k.g, u = w / 800; card(k, { x, y, w, h, r: 44 * u });
  txt(g, "Customers", x + 48 * u, y + 74 * u, 46 * u, Z.ink, 800, "left"); txt(g, "October", x + w - 48 * u, y + 76 * u, 30 * u, Z.grey, 700, "right");
  const tabs = ["Regulars", "Big spenders", "Gone quiet"], tw = [200, 250, 230]; let tx = x + 40 * u;
  tabs.forEach((t, i) => { const on = i === tab; pill(g, tx, y + 124 * u, tw[i] * u, 70 * u, on ? Z.f800 : Z.f100, t, on ? Z.linen : Z.muted, 28 * u, 800); tx += (tw[i] + 14) * u; });
  const rows = [[["Rafi", "5 visits", "৳4,250", 1], ["Nusrat", "7 visits", "৳3,980", 0.93], ["Arif", "4 visits", "৳3,100", 0.73]], [["Rafi", "৳4,250", "5 visits", 1], ["Sumi", "৳3,900", "3 visits", 0.92], ["Arif", "৳3,100", "4 visits", 0.73]], [["Tania", "34 days ago", "2 visits", 0.2], ["Hasan", "41 days ago", "3 visits", 0.2], ["Mim", "52 days ago", "1 visit", 0.2]]][tab];
  const cols = [Z.terra, Z.f400, Z.amberLt];
  rows.forEach((r, i) => { const a = ease((tt - 0.15 - i * 0.16) / 0.25), ry = y + 240 * u + i * 168 * u; if (a <= 0) return; g.save(); g.globalAlpha = a; g.translate(0, (1 - a) * 24 * u);
    rr(g, x + 36 * u, ry, w - 72 * u, 146 * u, 30 * u, tab === 2 ? Z.f50 : (i === 0 ? "#fbf3e0" : Z.f50));
    if (tab === 0 && r[0] === "Rafi") faceAvatar(k, x + 112 * u, ry + 73 * u, 48 * u, RAFI, "happy"); else letterAvatar(k, x + 112 * u, ry + 73 * u, 48 * u, r[0][0], cols[i], Z.f900, tab === 2 ? 0.55 : 1);
    txt(g, r[0], x + 186 * u, ry + 50 * u, 38 * u, tab === 2 ? Z.muted : Z.ink, 800, "left"); txt(g, tab === 1 ? r[2] : r[1], x + 186 * u, ry + 102 * u, 28 * u, Z.muted, 600, "left");
    const bw = (w - 440 * u) * (tab === 2 ? 0.25 : r[3] * clamp01((tt - 0.3 - i * 0.16) / 0.5)); rr(g, x + w - 56 * u - (w - 440 * u), ry + 62 * u, w - 440 * u, 22 * u, 11 * u, Z.f100); rr(g, x + w - 56 * u - (w - 440 * u), ry + 62 * u, Math.max(0, bw), 22 * u, 11 * u, tab === 2 ? Z.coralLt : (i === 0 ? Z.amber : Z.f500));
    txt(g, tab === 1 ? r[1] : (tab === 2 ? "" : r[2]), x + w - 56 * u, ry + 30 * u, 30 * u, Z.ink, 800, "right"); g.restore(); });
  if (tab === 0) { const p = pop(k, 0.7, 0.3); g.save(); g.translate(x + w - 150 * u, y + 260 * u); g.rotate(0.1); g.scale(p, p); pill(g, -118 * u, -34 * u, 236 * u, 68 * u, Z.amber, "REGULAR", Z.f950, 28 * u, 800); g.restore(); }
  if (tab === 1) { const p = pop(k, 0.5, 0.3); g.save(); g.translate(x + 112 * u, y + 246 * u); g.rotate(-0.1); g.scale(p, p); g.fillStyle = Z.amber; g.beginPath(); g.moveTo(-34 * u, 20 * u); g.lineTo(-40 * u, -22 * u); g.lineTo(-18 * u, -2 * u); g.lineTo(0, -34 * u); g.lineTo(18 * u, -2 * u); g.lineTo(40 * u, -22 * u); g.lineTo(34 * u, 20 * u); g.closePath(); g.fill(); g.restore(); }
}

Object.assign(window.SCENES, {
  // 18 — "One code."
  "code-show": (k) => {
    cafe(k); const g = k.g, t = k.t, fy = k.Y(0.745);
    person(k, { x: k.X(0.84), y: k.Y(0.71), h: 660, ...NILA, mood: t > 0.5 ? "happy" : "neutral", arms: "wave", look: [-0.8, 0.1] });
    counter(k, { x0: 0.6, x1: 1.04, top: 0.64, bottom: 0.77 });
    person(k, { x: k.X(0.17), y: fy, h: 740, ...RAFI, mood: "happy", arms: "up", look: [0.8, -0.2] });
    const s = pop(k, 0.1, 0.4); g.save(); g.translate(k.X(0.55), k.Y(0.3)); g.rotate(-0.04 + Math.sin(t * 3) * 0.01); g.scale(s * 0.92, s * 0.92);
    card(k, { x: -270 * k.u, y: -250 * k.u, w: 540 * k.u, h: 500 * k.u, r: 40 * k.u }); rr(g, -270 * k.u, -250 * k.u, 540 * k.u, 150 * k.u, 40 * k.u, Z.f900); rr(g, -270 * k.u, -140 * k.u, 540 * k.u, 40 * k.u, 0, Z.f900);
    txt(g, "10% off", 0, -178 * k.u, 90 * k.u, Z.amberLt, 800); g.setLineDash([14 * k.u, 12 * k.u]); g.strokeStyle = Z.f300; g.lineWidth = 4 * k.u; g.beginPath(); g.moveTo(-250 * k.u, -60 * k.u); g.lineTo(250 * k.u, -60 * k.u); g.stroke(); g.setLineDash([]);
    txt(g, "your code", 0, -20 * k.u, 34 * k.u, Z.muted, 700); txt(g, "ZV-4821", 0, 70 * k.u, 118 * k.u, Z.f800, 800); pill(g, -170 * k.u, 150 * k.u, 340 * k.u, 70 * k.u, Z.f100, "one-time · valid today", Z.f800, 28 * k.u, 800); g.restore();
    if (t > 0.1 && t < 0.6) sparkle(k, k.X(0.55) + 250 * k.u, k.Y(0.3) - 260 * k.u, 46 * k.u, Z.amber, t * 3);
  },
  // 19 — "One bill."
  "bill-entry": (k) => {
    cafe(k); const g = k.g, t = k.t;
    person(k, { x: k.X(0.5), y: k.Y(0.715), h: 860, ...NILA, mood: t > 0.75 ? "proud" : "happy", arms: "down", look: [0, 0.6] });
    counter(k, { x0: -0.05, x1: 1.05, top: 0.69, bottom: 0.8, props: false });
    const tw = 720 * k.u, th = 410 * k.u, tx = k.X(0.5) - tw / 2, ty = k.Y(0.45); g.save(); g.translate(k.X(0.5), ty + th); g.rotate(-0.02); g.translate(-k.X(0.5), -(ty + th));
    g.shadowColor = "rgba(13,34,23,0.3)"; g.shadowBlur = 40 * k.u; g.shadowOffsetY = 16 * k.u; rr(g, tx, ty, tw, th, 36 * k.u, Z.f950); g.shadowColor = "transparent"; rr(g, tx + 20 * k.u, ty + 20 * k.u, tw - 40 * k.u, th - 40 * k.u, 22 * k.u, Z.f50);
    rr(g, tx + 46 * k.u, ty + 44 * k.u, tw - 92 * k.u, 72 * k.u, 18 * k.u, "#e1f2e8"); txt(g, "✓  ZV-4821 · valid", tx + 80 * k.u, ty + 81 * k.u, 32 * k.u, Z.f800, 800, "left");
    txt(g, "Bill amount", tx + 54 * k.u, ty + 150 * k.u, 26 * k.u, Z.muted, 700, "left"); rr(g, tx + 46 * k.u, ty + 172 * k.u, tw - 92 * k.u, 100 * k.u, 22 * k.u, Z.white, Z.f600, 4 * k.u);
    const d = ["8", "5", "0"], n = Math.floor(clamp01((t - 0.08) / 0.55) * 3.0 + 0.01), shown = "৳ " + d.slice(0, Math.min(3, n)).join("") + (n < 3 && Math.floor(t * 3) % 2 ? "|" : ""); txt(g, shown, tx + 80 * k.u, ty + 224 * k.u, 70 * k.u, Z.ink, 800, "left");
    const ok = t > 0.75; rr(g, tx + 46 * k.u, ty + 296 * k.u, tw - 92 * k.u, 66 * k.u, 33 * k.u, ok ? Z.chat : Z.f800); txt(g, ok ? "✓  Confirmed" : "Confirm", tx + tw / 2, ty + 330 * k.u, 32 * k.u, "#fff", 800); g.restore();
    if (ok) { const a = clamp01((t - 0.75) / 0.5); for (let i = 0; i < 6; i++) { const ang = i * 1.05 + 0.3; sparkle(k, k.X(0.5) + Math.cos(ang) * (380 + a * 120) * k.u, ty + 100 * k.u + Math.sin(ang) * (170 + a * 80) * k.u, 34 * k.u * (1 - a), i % 2 ? Z.amber : Z.f400, t * 4); } g.save(); g.translate(k.X(0.17), k.Y(0.42)); g.rotate(-0.12); txt(g, "ka-ching!", 0, 0, 62 * k.u * outBack((t - 0.75) / 0.25), Z.f800, 800); g.restore(); }
  },
  // 20 — "A real, paying customer."
  "verified": (k) => {
    soft(k); const g = k.g, t = k.t; previewTag(k);
    const s = pop(k, 0, 0.4), cx = k.X(0.5), cy = k.Y(0.4); g.save(); g.translate(cx, cy); g.scale(s, s);
    card(k, { x: -380 * k.u, y: -400 * k.u, w: 760 * k.u, h: 800 * k.u, r: 48 * k.u });
    faceAvatar(k, -230 * k.u, -290 * k.u, 90 * k.u, RAFI, "happy"); txt(g, "Rafi", -110 * k.u, -310 * k.u, 62 * k.u, Z.ink, 800, "left"); txt(g, "+880 17•• ••• 821", -110 * k.u, -250 * k.u, 32 * k.u, Z.muted, 600, "left");
    [["Phone verified", 0.35], ["Chicken burger + cold coffee", 0.6], ["Paid ৳850 at the counter", 0.85]].forEach(([l, tc], i) => { const y = -130 * k.u + i * 126 * k.u, a = pop(k, tc, 0.28); g.save(); g.translate(0, y); g.scale(a, a); rr(g, -330 * k.u, -52 * k.u, 660 * k.u, 104 * k.u, 28 * k.u, Z.f50); circle(g, -270 * k.u, 0, 30 * k.u, Z.chat); txt(g, "✓", -270 * k.u, 3 * k.u, 36 * k.u, "#fff", 800); txt(g, l, -216 * k.u, 3 * k.u, 36 * k.u, Z.ink, 700, "left"); g.restore(); });
    g.restore();
    const st = clamp01((t - 1.0) / 0.22); if (st > 0) { const sc = lerp(3.2, 1, outCubic(st)); g.save(); g.translate(cx + 130 * k.u, cy + 330 * k.u); g.rotate(-0.2); g.scale(sc, sc); g.globalAlpha = Math.min(1, st * 3); g.strokeStyle = Z.chat; g.lineWidth = 10 * k.u; rr(g, -250 * k.u, -76 * k.u, 500 * k.u, 152 * k.u, 24 * k.u, "rgba(58,157,107,0.1)", Z.chat, 10 * k.u); txt(g, "VERIFIED", 0, 4 * k.u, 100 * k.u, Z.chat, 800); g.restore(); if (st >= 1) confetti(k, 36, 0.7, 1.22); }
  },
  // 21 — "An hour later:"
  "hour-later": (k) => {
    const g = k.g, t = k.t, p = ease(t / 1.0); k.sky({ stops: [k.mix("#cfe5f2", "#f6d9a8", p), k.mix("#f1ede0", "#fbe9c8", p)] });
    k.clouds({ y: 0.12, band: 0.5, n: 6, size: 1.2, drift: 14, color: "#ffffff" }); const sx = k.X(lerp(0.2, 0.82, p)), sy = k.Y(0.12) + Math.sin(p * Math.PI) * -60 * k.u; glowSpot(k, sx, sy, 300 * k.u, Z.amberLt, 0.5); circle(g, sx, sy, 70 * k.u, Z.amberLt);
    floorBand(k, 0.74);
    const cx = k.X(0.5), cy = k.Y(0.4), R = 330 * k.u; g.save(); g.shadowColor = "rgba(13,34,23,0.25)"; g.shadowBlur = 40 * k.u; g.shadowOffsetY = 16 * k.u; circle(g, cx, cy, R, Z.white); g.restore(); circle(g, cx, cy, R * 0.93, Z.f50);
    for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2 - Math.PI / 2, major = i % 5 === 0; g.strokeStyle = major ? Z.f800 : Z.grey; g.lineWidth = (major ? 8 : 3) * k.u; g.beginPath(); g.moveTo(cx + Math.cos(a) * R * 0.86, cy + Math.sin(a) * R * 0.86); g.lineTo(cx + Math.cos(a) * R * (major ? 0.74 : 0.8), cy + Math.sin(a) * R * (major ? 0.74 : 0.8)); g.stroke(); }
    const hand = (ang, len, w, col) => { g.strokeStyle = col; g.lineWidth = w * k.u; g.lineCap = "round"; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(ang - Math.PI / 2) * len * R, cy + Math.sin(ang - Math.PI / 2) * len * R); g.stroke(); };
    hand((lerp(0, 30, p) + 120) * Math.PI / 180, 0.5, 20, Z.f900); hand(lerp(0, 360, ease(t / 1.0)) * Math.PI / 180, 0.76, 11, Z.amber); circle(g, cx, cy, 20 * k.u, Z.f900);
    const b = pop(k, 0.2, 0.3); g.save(); g.translate(cx, k.Y(0.125)); g.scale(b, b); pill(g, -230 * k.u, -56 * k.u, 460 * k.u, 112 * k.u, Z.f900, "1 hour later", Z.linen, 52 * k.u, 800); g.restore();
    person(k, { x: lerp(k.X(0.1), k.X(0.9), clamp01(t / 2.2)), y: k.Y(0.745), h: 330, ...RAFI, walk: 2.2, mood: "happy", arms: "down", flip: false });
  },
  // 22 — "how was it?"
  "chat-ask": (k) => {
    soft(k); const g = k.g, t = k.t; previewTag(k);
    const ph = phone(k, { x: k.X(0.5), y: k.Y(0.43), h: 1140 });
    clipScreen(g, ph, () => { const x0 = ph.x, y0 = ph.y, w = ph.w, u = ph.u; g.fillStyle = "#eaf1ec"; g.fillRect(x0, y0, w, ph.h);
      g.fillStyle = Z.f900; g.fillRect(x0, y0, w, 150 * u); circle(g, x0 + 80 * u, y0 + 84 * u, 40 * u, Z.f700); cup(k, x0 + 80 * u, y0 + 84 * u, 46 * u / k.u, Z.amberLt); txt(g, "Café 27", x0 + 140 * u, y0 + 70 * u, 36 * u, Z.linen, 800, "left"); txt(g, "message", x0 + 140 * u, y0 + 112 * u, 24 * u, Z.f300, 600, "left");
      const m1 = pop(k, 0.1, 0.3); g.save(); g.translate(x0 + 40 * u, y0 + 260 * u); g.scale(m1, m1); rr(g, 0, 0, 400 * u, 190 * u, 30 * u, Z.white); txt(g, "Hi Rafi!", 34 * u, 56 * u, 40 * u, Z.ink, 800, "left"); txt(g, "How was your visit", 34 * u, 112 * u, 34 * u, Z.ink, 600, "left"); txt(g, "today?", 34 * u, 154 * u, 34 * u, Z.ink, 600, "left"); g.restore();
      const m2 = pop(k, 0.3, 0.25); g.save(); g.translate(x0 + 40 * u, y0 + 500 * u); g.scale(m2, m2); rr(g, 0, 0, w - 80 * u, 250 * u, 30 * u, Z.white); txt(g, "Tap to rate", (w - 80 * u) / 2, 54 * u, 30 * u, Z.muted, 700);
      const sz = 60 * u; for (let i = 0; i < 5; i++) { const f = clamp01((t - 0.62 - i * 0.09) / 0.08); star(g, (w - 80 * u) / 2 + (i - 2) * sz * 1.45, 150 * u, sz * 0.62, f > 0 ? Z.amber : Z.greyLt); } g.restore();
      if (t > 0.45) { const tp = clamp01((t - 0.4) / 0.25); const fx = lerp(x0 + w * 0.85, x0 + w * 0.5 + 2 * sz * 1.45 - 40 * u, ease(tp)), fy = lerp(y0 + 900 * u, y0 + 650 * u, ease(tp)); g.save(); g.fillStyle = "rgba(22,53,36,0.25)"; g.beginPath(); g.arc(fx, fy, 38 * u, 0, 7); g.fill(); g.restore(); } });
  },
  // 23 — "Loved it? Off to Google."
  "five-star": (k) => {
    soft(k); const g = k.g, t = k.t; previewTag(k);
    const ph = phone(k, { x: k.X(0.5), y: k.Y(0.43), h: 1140 });
    clipScreen(g, ph, () => { const x0 = ph.x, y0 = ph.y, w = ph.w, u = ph.u; g.fillStyle = Z.f50; g.fillRect(x0, y0, w, ph.h);
      txt(g, "Thanks, Rafi!", x0 + w / 2, y0 + 130 * u, 56 * u, Z.ink, 800); stars(k, { x: x0 + w / 2, y: y0 + 270 * u, size: 84 * u, n: 5, popT: 0.05 });
      txt(g, "Your private rating is saved.", x0 + w / 2, y0 + 380 * u, 30 * u, Z.muted, 600);
      const c = ease((t - 0.45) / 0.3); g.save(); g.translate(0, (1 - c) * 160 * u); g.globalAlpha = c; rr(g, x0 + 40 * u, y0 + 470 * u, w - 80 * u, 460 * u, 36 * u, Z.white, "rgba(22,53,36,0.12)", 3 * u);
      txt(g, "Loved it? Tell others", x0 + w / 2, y0 + 560 * u, 42 * u, Z.ink, 800); stars(k, { x: x0 + w / 2, y: y0 + 660 * u, size: 60 * u, n: 5 }); txt(g, "Share it on Google reviews", x0 + w / 2, y0 + 745 * u, 30 * u, Z.muted, 600);
      const bp = 1 + (t > 1.0 && t < 1.15 ? -0.06 : 0); g.translate(x0 + w / 2, y0 + 850 * u); g.scale(bp, bp); rr(g, -190 * u, -48 * u, 380 * u, 96 * u, 48 * u, t > 1.1 ? Z.chat : Z.f800); txt(g, t > 1.1 ? "✓  Posted" : "Post review", 0, 3 * u, 36 * u, "#fff", 800); g.restore(); });
    if (t < 0.9) for (let i = 0; i < 6; i++) sparkle(k, ph.cx + Math.cos(i * 1.05 + t) * 330 * k.u, k.Y(0.18) + Math.sin(i * 1.05 + t) * 90 * k.u, (22 + 12 * Math.sin(t * 6 + i)) * k.u, Z.amber, t * 3 + i);
  },
  // 24 — "Unhappy? You hear it first."
  "low-alert": (k) => {
    cafe(k, { dim: 0.08 }); const g = k.g, t = k.t, fy = k.Y(0.745), buzz = t > 0.35 && t < 1.2 ? Math.sin(t * 70) * 5 * k.u : 0;
    person(k, { x: k.X(0.4), y: fy, h: 820, ...NILA, mood: t > 0.35 ? "wow" : "happy", arms: "hold", look: [0, 0.8], shake: t > 0.35 && t < 1.2 });
    phone(k, { x: k.X(0.4) + buzz, y: k.Y(0.5) + 60 * k.u, h: 230, bg: Z.coralLt, rot: -0.05 });
    const p = ease((t - 0.3) / 0.3); g.save(); g.translate(0, (1 - p) * -260 * k.u); g.globalAlpha = p; card(k, { x: k.X(0.5) - 440 * k.u, y: k.Y(0.1), w: 880 * k.u, h: 270 * k.u, r: 44 * k.u, fill: Z.white, sh: "rgba(226,87,76,0.35)" });
    rr(g, k.X(0.5) - 440 * k.u, k.Y(0.1), 18 * k.u, 270 * k.u, 9 * k.u, Z.coral); circle(g, k.X(0.5) - 350 * k.u, k.Y(0.1) + 90 * k.u, 46 * k.u, Z.coral); txt(g, "!", k.X(0.5) - 350 * k.u, k.Y(0.1) + 94 * k.u, 64 * k.u, "#fff", 800);
    txt(g, "New rating · Table 6", k.X(0.5) - 270 * k.u, k.Y(0.1) + 70 * k.u, 40 * k.u, Z.ink, 800, "left"); stars(k, { x: k.X(0.5) - 120 * k.u, y: k.Y(0.1) + 130 * k.u, size: 46, n: 2 }); txt(g, "“Coffee was cold.”", k.X(0.5) - 270 * k.u, k.Y(0.1) + 206 * k.u, 36 * k.u, Z.muted, 700, "left"); g.restore();
    if (t > 0.9) { speech(k, { x: k.X(0.74), y: k.Y(0.42), text: "On it!", w: 330, h: 110, t0: 0.9, tailX: -0.3, tailDir: 1 }); const c = pop(k, 1.1, 0.3); g.save(); g.translate(k.X(0.78), k.Y(0.6)); g.scale(c, c); cup(k, 0, 0, 160, Z.terra); pill(g, -130 * k.u, 110 * k.u, 260 * k.u, 66 * k.u, Z.amber, "on the house", Z.f950, 28 * k.u, 800); g.restore(); }
  },
  // 25 — "Four visits later,"
  "visit-stamps": (k) => {
    soft(k); const g = k.g, t = k.t; previewTag(k); const cx = k.X(0.5), cy = k.Y(0.4);
    card(k, { x: cx - 460 * k.u, y: cy - 330 * k.u, w: 920 * k.u, h: 660 * k.u, r: 48 * k.u });
    faceAvatar(k, cx - 350 * k.u, cy - 230 * k.u, 70 * k.u, RAFI, "happy"); txt(g, "Rafi's visits", cx - 250 * k.u, cy - 250 * k.u, 56 * k.u, Z.ink, 800, "left"); txt(g, "this month", cx - 250 * k.u, cy - 196 * k.u, 30 * k.u, Z.muted, 600, "left");
    for (let i = 0; i < 5; i++) { const x = cx - 340 * k.u + i * 170 * k.u, y = cy - 20 * k.u, tc = i === 0 ? 0 : 0.2 + (i - 1) * 0.3, on = t >= tc; circle(g, x, y, 68 * k.u, Z.f100); g.save(); g.setLineDash([10 * k.u, 10 * k.u]); g.strokeStyle = Z.f400; g.lineWidth = 4 * k.u; g.beginPath(); g.arc(x, y, 68 * k.u, 0, 7); g.stroke(); g.restore();
      if (on) { const p = outBack((t - tc) / 0.22); g.save(); g.translate(x, y); g.scale(p, p); g.rotate((i - 2) * 0.08); circle(g, 0, 0, 62 * k.u, Z.f800); cup(k, 0, 0, 70, Z.amberLt, Z.linen); g.restore(); }
      txt(g, "#" + (i + 1), x, y + 110 * k.u, 30 * k.u, on ? Z.f800 : Z.grey, 800); }
    const cnt = t < 0.2 ? 1 : Math.min(5, 2 + Math.floor((t - 0.2) / 0.3));
    pill(g, cx - 200 * k.u, cy + 190 * k.u, 400 * k.u, 84 * k.u, cnt >= 5 ? Z.amber : Z.f100, cnt + " visits", cnt >= 5 ? Z.f950 : Z.f800, 40 * k.u, 800);
  },
  // 26 — "Rafi's a regular."
  "regular-badge": (k) => {
    soft(k); const g = k.g, t = k.t; previewTag(k); const cx = k.X(0.5), cy = k.Y(0.4), s = pop(k, 0, 0.35);
    g.save(); g.translate(cx, cy); g.scale(s, s); card(k, { x: -400 * k.u, y: -420 * k.u, w: 800 * k.u, h: 840 * k.u, r: 52 * k.u });
    faceAvatar(k, 0, -270 * k.u, 120 * k.u, RAFI, t > 0.7 ? "proud" : "happy"); txt(g, "Rafi", 0, -128 * k.u, 74 * k.u, Z.ink, 800);
    const st = clamp01((t - 0.35) / 0.2); if (st > 0) { const sc = lerp(3, 1, outCubic(st)); g.save(); g.translate(0, -22 * k.u); g.rotate(-0.06); g.scale(sc, sc); g.globalAlpha = Math.min(1, st * 3); rr(g, -200 * k.u, -54 * k.u, 400 * k.u, 108 * k.u, 54 * k.u, Z.amber); star(g, -130 * k.u, 0, 30 * k.u, Z.f950); txt(g, "REGULAR", 30 * k.u, 4 * k.u, 54 * k.u, Z.f950, 800); g.restore(); }
    [["5", "visits"], ["৳4,250", "spent"], ["4.8", "avg rating"]].forEach(([v, l], i) => { const a = pop(k, 0.6 + i * 0.12, 0.28), x = (i - 1) * 250 * k.u; g.save(); g.translate(x, 110 * k.u); g.scale(a, a); rr(g, -112 * k.u, -62 * k.u, 224 * k.u, 124 * k.u, 26 * k.u, Z.f50); txt(g, v, 0, -10 * k.u, 46 * k.u, Z.f800, 800); txt(g, l, 0, 38 * k.u, 26 * k.u, Z.muted, 600); g.restore(); });
    const fv = pop(k, 1.0, 0.3); g.save(); g.translate(0, 290 * k.u); g.scale(fv, fv); rr(g, -330 * k.u, -52 * k.u, 660 * k.u, 104 * k.u, 28 * k.u, Z.f50); burger(k, -260 * k.u, 6 * k.u, 70 * k.u / k.u * k.u); txt(g, "Favourite: Chicken burger", 20 * k.u, 3 * k.u, 34 * k.u, Z.ink, 700); g.restore(); g.restore();
    if (t > 0.4 && t < 1.1) sparkle(k, cx + 210 * k.u, cy - 100 * k.u, 40 * k.u * Math.sin((t - 0.4) * 4.5), Z.amber, t * 4);
  },
  // 27 — "Now she knows her regulars,"
  "usual": (k) => {
    cafe(k); const g = k.g, t = k.t, fy = k.Y(0.745), dx = k.X(0.86);
    door(k, { x: dx, y: k.Y(0.7), w: 300, h: 740, open: 0.95 });
    person(k, { x: k.X(0.24), y: k.Y(0.71), h: 700, ...NILA, mood: "happy", arms: "wave", look: [0.9, 0] });
    counter(k, { x0: -0.05, x1: 0.5, top: 0.64, bottom: 0.77, props: false });
    const rx = lerp(k.X(1.0), k.X(0.66), outCubic(t / 0.7)); person(k, { x: rx, y: fy, h: 740, ...RAFI, mood: t > 0.9 ? "happy" : "wow", walk: t < 0.7 ? 2.2 : 0, arms: t > 0.9 ? "wave" : "down", look: [-0.9, 0] });
    speech(k, { x: k.X(0.5), y: k.Y(0.2), text: "The usual, Rafi?", w: 760, h: 140, t0: 0.55, tailX: -0.3 });
    const tg = pop(k, 0.9, 0.3); g.save(); g.translate(rx, fy - 800 * k.u); g.scale(tg, tg); pill(g, -150 * k.u, -40 * k.u, 300 * k.u, 80 * k.u, Z.amber, "Regular", Z.f950, 36 * k.u, 800); g.restore();
    if (t > 1.0) for (let i = 0; i < 4; i++) { const tt = ((t - 1.0) * 0.9 + i * 0.25) % 1; g.save(); g.globalAlpha = Math.sin(tt * Math.PI); txt(g, "♥", rx - 60 * k.u + i * 40 * k.u, fy - 820 * k.u - tt * 160 * k.u, 44 * k.u, Z.coral, 800); g.restore(); }
  },
  // 28 — "her big spenders,"
  "spenders": (k) => { soft(k); previewTag(k); dash(k, 1, k.X(0.5) - 440 * k.u, k.Y(0.1), 880 * k.u, 860 * k.u, k.t); },
  // 29 — "who's gone quiet."
  "gone-quiet": (k) => {
    soft(k); const g = k.g, t = k.t; previewTag(k); dash(k, 2, k.X(0.5) - 440 * k.u, k.Y(0.1), 880 * k.u, 860 * k.u, t);
    const m = pop(k, 0.85, 0.35); g.save(); g.translate(k.X(0.5), k.Y(0.1) + 780 * k.u); g.scale(m, m); rr(g, -340 * k.u, -62 * k.u, 680 * k.u, 124 * k.u, 62 * k.u, Z.f800); txt(g, "Send a nudge · 15% off", 0, 3 * k.u, 42 * k.u, Z.linen, 800); g.restore();
    if (t > 1.1) for (let i = 0; i < 3; i++) { const tt = clamp01((t - 1.1 - i * 0.1) / 0.6); g.save(); g.globalAlpha = Math.sin(tt * Math.PI); txt(g, "♥", k.X(0.5) - 120 * k.u + i * 120 * k.u, k.Y(0.1) + 700 * k.u - tt * 260 * k.u, 54 * k.u, Z.coral, 800); g.restore(); }
  },
  // 30 — "New burger?" · "Eid?" · "Pohela Boishakh?"  (one big AI-drafted card per word)
  "campaign-burger": (k) => campaignCard(k, { bg: Z.amber, fg: Z.f950, sub: "rgba(16,36,26,0.7)", h1: "Our new Smoky Chicken", h2: "burger is here.", chan: "WhatsApp · SMS", art: (x, y) => { burger(k, x, y, 330); } }),
  "campaign-eid": (k) => campaignCard(k, { bg: Z.f900, fg: Z.amberLt, sub: Z.f200, h1: "Eid Mubarak", h2: "from all of us at Café 27", chan: "WhatsApp · email", art: (x, y) => { const g = k.g; g.fillStyle = Z.amberLt; g.beginPath(); g.arc(x, y, 150 * k.u, 0.55 * Math.PI, 1.55 * Math.PI, true); g.arc(x + 64 * k.u, y - 8 * k.u, 120 * k.u, 1.5 * Math.PI, 0.6 * Math.PI, false); g.fill(); star(g, x + 190 * k.u, y - 100 * k.u, 46 * k.u, Z.amberLt, k.t); [[-220, 150], [200, 160]].forEach(([dx, dy], i) => sparkle(k, x + dx * k.u, y + dy * k.u, (24 + 10 * Math.sin(k.t * 5 + i)) * k.u, Z.amberLt, k.t * 2)); } }),
  "campaign-boishakh": (k) => campaignCard(k, { bg: "#c8372d", fg: "#ffffff", sub: "rgba(255,255,255,0.85)", h1: "Shubho Noboborsho", h2: "A Pohela Boishakh treat", chan: "SMS · email", art: (x, y) => { const g = k.g; for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + k.t * 0.3; g.fillStyle = "rgba(255,255,255,0.92)"; g.beginPath(); g.ellipse(x + Math.cos(a) * 118 * k.u, y + Math.sin(a) * 118 * k.u, 62 * k.u, 32 * k.u, a, 0, 7); g.fill(); } circle(g, x, y, 52 * k.u, Z.amber); circle(g, x, y, 24 * k.u, "#c8372d"); } }),
  // 31 — "AI writes. You approve."
  "approve": (k) => {
    soft(k); const g = k.g, t = k.t; previewTag(k); const cx = k.X(0.5), s = pop(k, 0, 0.35);
    g.save(); g.translate(cx, k.Y(0.34)); g.scale(s, s); card(k, { x: -440 * k.u, y: -330 * k.u, w: 880 * k.u, h: 660 * k.u, r: 48 * k.u });
    pill(g, -390 * k.u, -290 * k.u, 250 * k.u, 54 * k.u, Z.f100, "AI draft", Z.f800, 26 * k.u, 800); sparkle(k, -362 * k.u, -263 * k.u, 18 * k.u, Z.amber, t * 2); txt(g, "To: Rafi · regular", 390 * k.u, -263 * k.u, 28 * k.u, Z.muted, 700, "right");
    rr(g, -390 * k.u, -200 * k.u, 780 * k.u, 330 * k.u, 32 * k.u, "#eaf1ec");
    ["Hi Rafi! Our new Smoky", "Chicken burger is here.", "15% off for you this week."].forEach((l, i) => { const a = clamp01((t - 0.2 - i * 0.2) / 0.2); g.save(); g.globalAlpha = a; txt(g, l, -350 * k.u, -140 * k.u + i * 86 * k.u, 44 * k.u, Z.ink, i === 2 ? 800 : 600, "left"); g.restore(); });
    const ap = t > 1.25; g.save(); const bs = t > 1.2 && t < 1.32 ? 0.95 : 1; g.translate(0, 230 * k.u); g.scale(bs, bs); rr(g, -330 * k.u, -62 * k.u, 660 * k.u, 124 * k.u, 62 * k.u, ap ? Z.chat : Z.f800); txt(g, ap ? "✓  Approved" : "Approve & send", 0, 3 * k.u, 50 * k.u, "#fff", 800); g.restore(); g.restore();
    const cp = ease((t - 0.7) / 0.5); if (t < 1.5) cursorArrow(k, lerp(cx + 500 * k.u, cx + 90 * k.u, cp), lerp(k.Y(0.7), k.Y(0.34) + 250 * k.u, cp), 100);
    if (ap) { const l = pop(k, 1.35, 0.3); g.save(); g.translate(cx, k.Y(0.62)); g.scale(l, l); rr(g, -400 * k.u, -62 * k.u, 800 * k.u, 124 * k.u, 62 * k.u, Z.f900); txt(g, "Nothing sends without you", 0, 3 * k.u, 44 * k.u, Z.amberLt, 800); g.restore(); }
  },
  // 32 — "Every offer, measured."
  "offer-result": (k) => {
    soft(k); const g = k.g, t = k.t; previewTag(k); const cx = k.X(0.5), cy = k.Y(0.4), s = pop(k, 0, 0.35);
    g.save(); g.translate(cx, cy); g.scale(s, s); card(k, { x: -430 * k.u, y: -400 * k.u, w: 860 * k.u, h: 800 * k.u, r: 52 * k.u });
    txt(g, "Smoky burger offer", -370 * k.u, -330 * k.u, 46 * k.u, Z.ink, 800, "left"); txt(g, "sent to 240 customers", -370 * k.u, -278 * k.u, 30 * k.u, Z.muted, 600, "left");
    const n = Math.round(62 * ease((t - 0.2) / 1.1)); g.save(); g.lineCap = "round"; g.lineWidth = 34 * k.u; g.strokeStyle = Z.f100; g.beginPath(); g.arc(0, -10 * k.u, 190 * k.u, 0, 7); g.stroke(); g.strokeStyle = Z.chat; g.beginPath(); g.arc(0, -10 * k.u, 190 * k.u, -Math.PI / 2, -Math.PI / 2 + (n / 62) * (62 / 240 * 3.4) * Math.PI * 2 * 0.8); g.stroke(); g.restore();
    txt(g, String(n), 0, -30 * k.u, 150 * k.u, Z.f800, 800); txt(g, "came back", 0, 70 * k.u, 40 * k.u, Z.muted, 700);
    [["Sent", "240", 1], ["Opened", "188", 0.78], ["Visited", "62", 0.26]].forEach(([l, v, f], i) => { const y = 250 * k.u + i * 0, x = -370 * k.u + i * 250 * k.u; const a = ease((t - 0.5 - i * 0.2) / 0.3); g.save(); g.globalAlpha = a; rr(g, x, y - 20 * k.u, 230 * k.u, 120 * k.u, 26 * k.u, Z.f50); txt(g, v, x + 115 * k.u, y + 24 * k.u, 54 * k.u, i === 2 ? Z.chat : Z.ink, 800); txt(g, l, x + 115 * k.u, y + 76 * k.u, 26 * k.u, Z.muted, 700); g.restore(); });
    g.restore();
  },
  // 33 — "Every month, one report."
  "monthly-report": (k) => {
    soft(k); const g = k.g, t = k.t; previewTag(k); const cx = k.X(0.5), cy = k.Y(0.4), s = pop(k, 0, 0.35);
    g.save(); g.translate(cx, cy); g.scale(s, s); card(k, { x: -430 * k.u, y: -400 * k.u, w: 860 * k.u, h: 800 * k.u, r: 52 * k.u });
    txt(g, "October report", -370 * k.u, -330 * k.u, 54 * k.u, Z.ink, 800, "left"); pill(g, 150 * k.u, -366 * k.u, 230 * k.u, 66 * k.u, Z.f100, "Café 27", Z.f800, 28 * k.u, 800);
    txt(g, "Visits per week", -370 * k.u, -240 * k.u, 28 * k.u, Z.muted, 700, "left");
    [0.45, 0.62, 0.8, 1].forEach((v, i) => { const h = 250 * k.u * v * ease((t - 0.15 - i * 0.15) / 0.4); rr(g, -370 * k.u + i * 130 * k.u, -190 * k.u + 250 * k.u - h, 96 * k.u, Math.max(2, h), 18 * k.u, i === 3 ? Z.amber : Z.f500); txt(g, "W" + (i + 1), -322 * k.u + i * 130 * k.u, 82 * k.u, 24 * k.u, Z.grey, 700); });
    g.save(); g.translate(170 * k.u, -170 * k.u); rr(g, 0, 0, 200 * k.u, 250 * k.u, 26 * k.u, Z.f50); txt(g, "Rating", 100 * k.u, 50 * k.u, 28 * k.u, Z.muted, 700); txt(g, lerp(4.2, 4.6, ease((t - 0.5) / 0.6)).toFixed(1), 100 * k.u, 130 * k.u, 74 * k.u, Z.f800, 800); star(g, 100 * k.u, 205 * k.u, 24 * k.u, Z.amber); g.restore();
    const r2 = ease((t - 0.7) / 0.3); g.save(); g.globalAlpha = r2; rr(g, -370 * k.u, 150 * k.u, 740 * k.u, 100 * k.u, 28 * k.u, Z.f50); burger(k, -310 * k.u, 156 * k.u + 6 * k.u, 66); txt(g, "Top dish: Chicken burger", -240 * k.u, 202 * k.u, 36 * k.u, Z.ink, 800, "left"); g.restore();
    const r3 = ease((t - 0.9) / 0.3); g.save(); g.globalAlpha = r3; rr(g, -370 * k.u, 270 * k.u, 740 * k.u, 100 * k.u, 28 * k.u, Z.f50); txt(g, "+18 regulars · 62 came back", -330 * k.u, 320 * k.u, 36 * k.u, Z.chat, 800, "left"); g.restore();
    g.restore();
  },
  // 34 — "regular."
  "end-name": (k) => {
    const g = k.g, t = k.t; soft(k, Z.f100, Z.sand); floorBand(k, 0.74); const s = outBack(t / 0.45);
    g.save(); g.translate(k.X(0.5), k.Y(0.3)); g.scale(s, s); g.font = `800 ${300 * k.u}px ${FONT}`; txt(g, NAME, 0, 0, 190 * k.u, Z.f800, 800); g.restore();
    for (let i = 0; i < 6; i++) sparkle(k, k.X(0.5) + Math.cos(i * 1.05 + t) * 480 * k.u, k.Y(0.3) + Math.sin(i * 1.05 + t) * 130 * k.u, (16 + 14 * Math.sin(t * 5 + i)) * k.u * clamp01(t / 0.4), i % 2 ? Z.amber : Z.f500, t + i);
    const fy = k.Y(0.745); shadow(k, k.X(0.3), fy, 360 * k.u, 0.12); shadow(k, k.X(0.7), fy, 360 * k.u, 0.12);
    person(k, { x: k.X(0.3), y: fy - Math.abs(Math.sin(t * 5)) * 18 * k.u, h: 700, ...NILA, mood: "proud", arms: "up" }); person(k, { x: k.X(0.7), y: fy - Math.abs(Math.sin(t * 5 + 1)) * 18 * k.u, h: 700, ...RAFI, mood: "proud", arms: "up", flip: true });
    confetti(k, 40, 0.5, 0.3);
  },
  // 35 — "Coming soon from Zavino Labs."
  "end-card": (k) => {
    const g = k.g, t = k.t; k.sky({ stops: [Z.f950, Z.f900, Z.f800] }); glowSpot(k, k.X(0.5), k.Y(0.34), 900 * k.u, Z.f600, 0.3);
    const a1 = ease(t * 3);
    g.save(); g.globalAlpha = a1; txt(g, NAME, k.X(0.5), k.Y(0.3) + (1 - a1) * 30 * k.u, 230 * k.u, Z.linen, 800); txt(g, "Turn first visits into favourites.", k.X(0.5), k.Y(0.4), 50 * k.u, Z.f200, 600); g.restore();
    const b = pop(k, 0.35, 0.35); g.save(); g.translate(k.X(0.5), k.Y(0.52)); g.scale(b, b); pill(g, -260 * k.u, -62 * k.u, 520 * k.u, 124 * k.u, Z.amber, "Coming soon", Z.f950, 62 * k.u, 800); g.restore();
    const a3 = ease((t - 0.7) / 0.4); g.save(); g.globalAlpha = a3; if (IMAGES["zavino-symbol-light"]) g.drawImage(IMAGES["zavino-symbol-light"], k.X(0.5) - 280 * k.u, k.Y(0.915) - 40 * k.u, 80 * k.u, 80 * k.u);
    g.font = `800 ${74 * k.u}px ${FONT}`; const w1 = g.measureText("zavino.").width; g.font = `500 ${38 * k.u}px ${FONT}`; const w2 = g.measureText(" labs").width, x0 = k.X(0.5) - 180 * k.u;
    txt(g, "zavino.", x0, k.Y(0.915), 74 * k.u, Z.linen, 800, "left"); txt(g, " labs", x0 + w1, k.Y(0.915) + 12 * k.u, 38 * k.u, Z.f300, 500, "left"); g.restore();
    if (t < 1.4) confetti(k, 24, 0.4, 0.2, [Z.amber, Z.f400, Z.amberLt, Z.f300]);
  },
});

function campaignCard(k, c) {
  soft(k); const g = k.g, t = k.t; previewTag(k); const p = pop(k, 0.02, 0.32);
  g.save(); g.translate(k.X(0.5), k.Y(0.4)); g.rotate(-0.02 + (1 - p) * 0.1); g.scale(p, p); card(k, { x: -440 * k.u, y: -440 * k.u, w: 880 * k.u, h: 880 * k.u, r: 56 * k.u, fill: c.bg });
  pill(g, -390 * k.u, -392 * k.u, 270 * k.u, 66 * k.u, "rgba(255,255,255,0.22)", "AI draft", c.fg, 30 * k.u, 800); sparkle(k, -362 * k.u, -359 * k.u, 22 * k.u, c.fg, t * 2);
  c.art(0, -60 * k.u); txt(g, c.h1, 0, 200 * k.u, 70 * k.u, c.fg, 800); txt(g, c.h2, 0, 282 * k.u, 42 * k.u, c.sub, 600); pill(g, -190 * k.u, 340 * k.u, 380 * k.u, 66 * k.u, "rgba(255,255,255,0.22)", c.chan, c.fg, 28 * k.u, 800); g.restore();
}
function floorBand(k, y) { const g = k.g, gr = g.createLinearGradient(0, k.Y(y), 0, k.H); gr.addColorStop(0, Z.woodLt); gr.addColorStop(1, Z.wood); g.fillStyle = gr; g.fillRect(0, k.Y(y), k.W, k.H - k.Y(y)); }
function cursorArrow(k, x, y, s) { const g = k.g; s *= k.u; g.save(); g.translate(x, y); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, s); g.lineTo(s * 0.28, s * 0.76); g.lineTo(s * 0.5, s * 1.15); g.lineTo(s * 0.65, s * 1.07); g.lineTo(s * 0.43, s * 0.7); g.lineTo(s * 0.78, s * 0.66); g.closePath(); g.fillStyle = Z.ink; g.fill(); g.lineWidth = s * 0.07; g.strokeStyle = "#fff"; g.stroke(); g.restore(); }

// the café shots are zoomed in a little so people fill the vertical frame (less floor, bigger faces)
["crowd-count", "door-stream", "nila-blank", "ghost-lineup", "who-regular", "who-spender", "unhappy-sip", "quiet-exit", "door-close", "table-qr", "rafi-scan", "code-show", "bill-entry", "low-alert", "usual", "end-name"].forEach((n) => {
  const f = window.SCENES[n]; window.SCENES[n] = (k) => { const g = k.g; g.save(); g.translate(k.W / 2, k.Y(0.12)); g.scale(1.12, 1.12); g.translate(-k.W / 2, -k.Y(0.12)); f(k); g.restore(); };
});
