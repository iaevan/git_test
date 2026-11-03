// Zavino services — one continuous flight.
// Every beat in short.json is drawn by film(); the beat's scene name ("s1".."s9", or the cutdown's "c3"/"c4"/"c5"/"c9") picks the segment.
// Persistent things (background, the ribbon sweeps that carry us between scenes, the jet) are drawn from GLOBAL time, so the
// frame never hard-cuts: at every boundary the outgoing scene eases out under a ribbon sweep and the next one eases in behind it.
// Layouts adapt to the frame: 16:9 master, 1:1 and 9:16 cutdowns.

const C = {
  forest: "#163524", deep: "#0d2217", mid: "#37634A", leaf: "#4f7d62", sage: "#95b3a1", mist: "#cee0d5", pale: "#e4eee8",
  sand: "#E1D7C1", sandLt: "#ebe4d3", sandDk: "#d3c6aa", card: "#fbf8f1", line: "rgba(22,53,36,0.10)", muted: "#5d6d63",
  stone: "#ece5d5", stoneF: "#ddd2bc", skin: "#c99271", amber: "#d9a441",
};
const FONT = '"Nunito","Helvetica Neue",Arial,sans-serif';

// ───────────── small helpers ─────────────
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
const eio = (x) => { x = clamp01(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const eout = (x) => 1 - Math.pow(1 - clamp01(x), 3);
const ein = (x) => Math.pow(clamp01(x), 3);
/** a gentle overshoot (small bounce on cards) */
const soft = (x) => { x = clamp01(x); const c1 = 1.15, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const hash = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
function rr(g, x, y, w, h, r, fill, stroke, lw) { g.beginPath(); g.roundRect(x, y, w, h, Math.max(0, Math.min(r, w / 2, h / 2))); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw || 2; g.stroke(); } }
function dot(g, x, y, r, fill) { g.beginPath(); g.arc(x, y, Math.max(0, r), 0, Math.PI * 2); g.fillStyle = fill; g.fill(); }
function font(g, size, weight) { g.font = `${weight || 800} ${size}px ${FONT}`; }
function txt(g, s, x, y, size, color, weight, align, base) { font(g, size, weight); g.fillStyle = color; g.textAlign = align || "left"; g.textBaseline = base || "middle"; g.fillText(s, x, y); }
function wrap(g, text, maxW, size, weight) { if (text.includes("\n")) return text.split("\n").flatMap((p) => wrap(g, p, maxW, size, weight)); font(g, size, weight); const out = []; let cur = ""; for (const w of text.split(" ")) { const n = cur ? cur + " " + w : w; if (g.measureText(n).width > maxW && cur) { out.push(cur); cur = w; } else cur = n; } if (cur) out.push(cur); return out; }
/** pop-in: 0 before t0, then a small bouncy scale to 1 */
const popIn = (t, t0, dur) => (t < t0 ? 0 : soft((t - t0) / (dur || 0.45)));
const fadeIn = (t, t0, dur) => ease((t - t0) / (dur || 0.4));

// ───────────── frame + stage layout ─────────────
function FR(k) {
  const W = k.W, H = k.H, a = W / H, m = Math.min(W, H) / 1080;
  if (a > 1.3) return { mode: "land", W, H, m, text: { x: W * 0.07, y: H * 0.5, w: W * 0.34, align: "left", title: 76 * m, sub: 40 * m }, stage: { x: W * 0.45, y: H * 0.07, w: W * 0.51, h: H * 0.86 } };
  if (a < 0.8) return { mode: "port", W, H, m, text: { x: W * 0.5, y: H * 0.19, w: W * 0.86, align: "center", title: 84 * m, sub: 46 * m }, stage: { x: W * 0.05, y: H * 0.33, w: W * 0.9, h: H * 0.6 } };
  return { mode: "sq", W, H, m, text: { x: W * 0.5, y: H * 0.13, w: W * 0.86, align: "center", title: 60 * m, sub: 34 * m }, stage: { x: W * 0.08, y: H * 0.255, w: W * 0.84, h: H * 0.7 } };
}
/** stage space: design coordinates -500..500 in both axes, centred in the stage box */
function ST(F) { const s = F.stage, U = Math.min(s.w, s.h) / 880; return { cx: s.x + s.w / 2, cy: s.y + s.h / 2, U }; }

/** the title + subline block. a = visibility 0..1, t = local time (for the stagger) */
function textBlock(g, F, title, sub, t, t0, a) {
  if (a <= 0.001) return; const T = F.text, tl = wrap(g, title, T.w, T.title, 900), sl = sub ? wrap(g, sub, T.w, T.sub, 700) : [];
  const lh = T.title * 1.08, sh = T.sub * 1.3, gap = sub ? T.title * 0.42 : 0, total = tl.length * lh + gap + sl.length * sh;
  let y = T.y - total / 2 + lh / 2;
  tl.forEach((l, i) => { const e = eout((t - t0 - i * 0.12) / 0.55); g.save(); g.globalAlpha = a * e; txt(g, l, T.x, y + (1 - e) * 26 * F.m, T.title, C.forest, 900, T.align); g.restore(); y += lh; });
  y += gap - lh / 2 + sh / 2;
  sl.forEach((l, i) => { const e = eout((t - t0 - 0.3 - i * 0.1) / 0.55); g.save(); g.globalAlpha = a * e; txt(g, l, T.x, y + (1 - e) * 20 * F.m, T.sub, C.mid, 700, T.align); g.restore(); y += sh; });
}

// ───────────── background ─────────────
function background(k) {
  const g = k.g, W = k.W, H = k.H, gr = g.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, C.sandLt); gr.addColorStop(1, C.sand); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const rg = g.createRadialGradient(W * 0.25, H * 0.15, 0, W * 0.25, H * 0.15, Math.max(W, H) * 0.8); rg.addColorStop(0, "rgba(255,252,244,0.55)"); rg.addColorStop(1, "rgba(255,252,244,0)"); g.fillStyle = rg; g.fillRect(0, 0, W, H);
  const vg = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.45, W / 2, H / 2, Math.max(W, H) * 0.85); vg.addColorStop(0, "rgba(120,100,60,0)"); vg.addColorStop(1, "rgba(120,100,60,0.10)"); g.fillStyle = vg; g.fillRect(0, 0, W, H);
}

// ───────────── the paper ribbon ─────────────
/** a smooth path through points (Catmull–Rom), parameter s in 0..1 */
function spline(pts) {
  const n = pts.length - 1;
  return (s) => {
    const f = clamp01(s) * n, i = Math.min(n - 1, Math.floor(f)), u = f - i;
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n, i + 2)];
    const q = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
    if (s < 0) { const d0 = [pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]]; return [pts[0][0] + d0[0] * s * n, pts[0][1] + d0[1] * s * n]; }
    if (s > 1) { const d1 = [pts[n][0] - pts[n - 1][0], pts[n][1] - pts[n - 1][1]]; return [pts[n][0] + d1[0] * (s - 1) * n, pts[n][1] + d1[1] * (s - 1) * n]; }
    return [q(p0[0], p1[0], p2[0], p3[0]), q(p0[1], p1[1], p2[1], p3[1])];
  };
}
/** draw the ribbon along P from s0 to s1: a flat paper band of width w that twists a little (front mid-forest, back deep forest) */
function ribbon(k, P, s0, s1, w, o) {
  o = o || {}; if (s1 - s0 < 0.001) return; const g = k.g, N = Math.max(12, Math.round((s1 - s0) * (o.n || 90))), pts = [];
  for (let i = 0; i <= N; i++) {
    const s = lerp(s0, s1, i / N), a = P(s), b = P(s + 0.002), dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
    const phi = (o.twist || 0) * Math.PI * 2 * s + (o.phase || 0), c = Math.cos(phi), taper = o.taper ? Math.min(1, (s - s0) / o.taper, (s1 - s) / o.taper + 0.25) : 1;
    pts.push({ x: a[0], y: a[1], nx: -dy / L, ny: dx / L, hw: (w / 2) * Math.max(0.16, Math.abs(c)) * Math.max(0.25, taper), c, up: -dy / L });
  }
  g.save(); if (o.alpha !== undefined) g.globalAlpha = o.alpha;
  if (!o.noShadow) { g.fillStyle = "rgba(22,53,36,0.10)"; g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo : g.moveTo).call(g, p.x + p.nx * p.hw, p.y + p.ny * p.hw + w * 0.18)); for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; g.lineTo(p.x - p.nx * p.hw, p.y - p.ny * p.hw + w * 0.18); } g.closePath(); g.fill(); }
  for (let i = 0; i < pts.length - 1; i++) {
    const p = pts[i], q = pts[i + 1], front = p.c >= 0, lit = clamp01(0.5 + 0.5 * p.up) * Math.abs(p.c);
    const col = front ? k.mix(C.mid, C.leaf, lit * 0.8) : k.mix(C.deep, C.forest, 0.6 + lit * 0.4);
    g.fillStyle = col; g.strokeStyle = col; g.lineWidth = 1;
    g.beginPath(); g.moveTo(p.x + p.nx * p.hw, p.y + p.ny * p.hw); g.lineTo(q.x + q.nx * q.hw, q.y + q.ny * q.hw); g.lineTo(q.x - q.nx * q.hw, q.y - q.ny * q.hw); g.lineTo(p.x - p.nx * p.hw, p.y - p.ny * p.hw); g.closePath(); g.fill(); g.stroke();
  }
  g.strokeStyle = "rgba(255,255,255,0.22)"; g.lineWidth = Math.max(1, w * 0.035); g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo : g.moveTo).call(g, p.x - p.nx * p.hw * 0.92, p.y - p.ny * p.hw * 0.92)); g.stroke();
  g.restore();
}
/** a point on the ribbon's upper face (for the jet to ride on) and the path angle there */
function onRibbon(P, s, lift) { const a = P(s), b = P(s + 0.003), dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1; return { x: a[0] + (dy / L) * lift, y: a[1] - (dx / L) * lift, ang: Math.atan2(dy, dx) }; }

// ───────────── the ivory paper jet (profile, nose to +x; L = length) ─────────────
function jet(k, x, y, ang, L, alpha) {
  const g = k.g; if (alpha !== undefined && alpha <= 0.01) return; g.save(); g.translate(x, y); g.rotate(ang); if (alpha !== undefined) g.globalAlpha = alpha;
  const P = (pts, fill, stroke) => { g.beginPath(); pts.forEach(([px, py], i) => (i ? g.lineTo : g.moveTo).call(g, px * L, py * L)); g.closePath(); g.fillStyle = fill; g.fill(); if (stroke) { g.strokeStyle = stroke; g.lineWidth = Math.max(1, L * 0.006); g.stroke(); } };
  const edge = "rgba(22,53,36,0.28)";
  g.save(); g.globalAlpha *= 0.18; g.fillStyle = C.deep; g.beginPath(); g.ellipse(-0.02 * L, 0.2 * L, 0.42 * L, 0.035 * L, 0, 0, 7); g.fill(); g.restore();   // soft shadow below
  P([[0.06, -0.03], [-0.3, -0.03], [-0.37, -0.1], [-0.22, -0.1]], "#d4cdbd", edge);                                                // far wing
  P([[-0.29, -0.045], [-0.39, -0.21], [-0.46, -0.21], [-0.45, -0.045]], "#d9d2c3", edge);                                          // far tail fin
  const fg = g.createLinearGradient(0, -0.08 * L, 0, 0.07 * L); fg.addColorStop(0, "#fbf8f1"); fg.addColorStop(1, "#d8d1c2");
  g.beginPath(); g.moveTo(0.5 * L, 0.005 * L); g.quadraticCurveTo(0.36 * L, -0.045 * L, 0.2 * L, -0.055 * L); g.lineTo(-0.1 * L, -0.062 * L); g.lineTo(-0.4 * L, -0.05 * L); g.lineTo(-0.49 * L, -0.032 * L); g.lineTo(-0.5 * L, 0.025 * L); g.lineTo(-0.3 * L, 0.058 * L); g.quadraticCurveTo(0.1 * L, 0.065 * L, 0.3 * L, 0.035 * L); g.quadraticCurveTo(0.43 * L, 0.02 * L, 0.5 * L, 0.005 * L); g.closePath();
  g.fillStyle = fg; g.fill(); g.strokeStyle = edge; g.lineWidth = Math.max(1, L * 0.006); g.stroke();                              // fuselage
  P([[0.13, 0.025], [-0.31, 0.03], [-0.42, 0.19], [-0.17, 0.19]], "#ebe5d8", edge);                                                // near wing (delta)
  P([[-0.34, 0.03], [-0.5, 0.03], [-0.51, 0.085], [-0.41, 0.085]], "#e2dbcd", edge);                                               // tailplane
  P([[-0.26, -0.04], [-0.35, -0.225], [-0.42, -0.225], [-0.415, -0.04]], "#f1ece2", edge);                                        // near tail fin
  g.fillStyle = "#334339"; g.beginPath(); g.ellipse(0.17 * L, -0.06 * L, 0.105 * L, 0.03 * L, -0.04, Math.PI, 0); g.fill();         // canopy
  g.strokeStyle = "rgba(255,255,255,0.55)"; g.lineWidth = Math.max(1, L * 0.008); g.beginPath(); g.ellipse(0.17 * L, -0.064 * L, 0.07 * L, 0.016 * L, -0.04, Math.PI * 1.15, Math.PI * 1.6); g.stroke();
  rr(g, -0.535 * L, -0.02 * L, 0.05 * L, 0.04 * L, 0.01 * L, "#6f6c63");                                                              // nozzle
  P([[0.05, 0.035], [-0.07, 0.035], [-0.08, 0.06], [0.03, 0.055]], "#c9c1b0");                                                     // intake
  g.strokeStyle = "rgba(22,53,36,0.12)"; g.lineWidth = Math.max(1, L * 0.004); g.beginPath(); g.moveTo(-0.05 * L, -0.055 * L); g.lineTo(-0.05 * L, 0.055 * L); g.moveTo(-0.22 * L, -0.055 * L); g.lineTo(-0.22 * L, 0.05 * L); g.stroke();
  g.restore();
}

/** a stone plinth (like the homepage's): x,y = centre of the top face's front edge; w = width, h = height */
function plinth(k, x, y, w, h, alpha) {
  const g = k.g, d = w * 0.16; g.save(); if (alpha !== undefined) g.globalAlpha = alpha;
  g.fillStyle = "rgba(22,53,36,0.10)"; g.beginPath(); g.ellipse(x + d * 0.6, y + h + w * 0.04, w * 0.62, w * 0.06, 0, 0, 7); g.fill();
  g.fillStyle = "#cfc3a8"; g.beginPath(); g.moveTo(x + w / 2, y); g.lineTo(x + w / 2 + d, y - d * 0.55); g.lineTo(x + w / 2 + d, y + h - d * 0.55); g.lineTo(x + w / 2, y + h); g.closePath(); g.fill();
  rr(g, x - w / 2, y, w, h, w * 0.02, "#e2d8c3");
  g.fillStyle = "#efe8d8"; g.beginPath(); g.moveTo(x - w / 2, y); g.lineTo(x + w / 2, y); g.lineTo(x + w / 2 + d, y - d * 0.55); g.lineTo(x - w / 2 + d, y - d * 0.55); g.closePath(); g.fill();
  for (let i = 0; i < 26; i++) dot(g, x - w / 2 + hash(i + x) * w, y + hash(i * 3 + 1) * h, w * 0.006 * (0.5 + hash(i * 7)), "rgba(120,104,72,0.25)");
  g.restore();
}

// ───────────── cards, icons ─────────────
function card(k, x, y, w, h, o) {
  o = o || {}; const g = k.g, r = o.r ?? Math.min(w, h) * 0.12;
  g.save(); g.shadowColor = "rgba(22,53,36,0.16)"; g.shadowBlur = o.blur ?? Math.min(w, h) * 0.18; g.shadowOffsetY = Math.min(w, h) * 0.05; rr(g, x, y, w, h, r, o.fill || C.card); g.restore();
  rr(g, x, y, w, h, r, null, o.border || "rgba(22,53,36,0.08)", Math.max(1, Math.min(w, h) * 0.006));
}
/** draws fn inside a transform that pops it in around (cx, cy): scale s, alpha a, tilt rot */
function popped(g, cx, cy, s, a, rot, fn) { if (s <= 0.001 || a <= 0.001) return; g.save(); g.globalAlpha *= Math.min(1, a); g.translate(cx, cy); g.rotate(rot || 0); g.scale(s, s); g.translate(-cx, -cy); fn(); g.restore(); }
function iconCircle(g, x, y, r, fill) { dot(g, x, y, r, fill || C.pale); }
function envelope(g, x, y, s, col) { g.save(); g.strokeStyle = col || C.mid; g.lineWidth = s * 0.12; g.lineJoin = "round"; rr(g, x - s * 0.55, y - s * 0.38, s * 1.1, s * 0.76, s * 0.12, null, col || C.mid, s * 0.12); g.beginPath(); g.moveTo(x - s * 0.5, y - s * 0.3); g.lineTo(x, y + s * 0.06); g.lineTo(x + s * 0.5, y - s * 0.3); g.stroke(); g.restore(); }
function chatIcon(g, x, y, s, col) { g.save(); g.fillStyle = col || C.mid; g.beginPath(); g.roundRect(x - s * 0.55, y - s * 0.42, s * 1.1, s * 0.74, s * 0.24); g.fill(); g.beginPath(); g.moveTo(x - s * 0.2, y + s * 0.3); g.lineTo(x - s * 0.36, y + s * 0.55); g.lineTo(x + s * 0.05, y + s * 0.3); g.fill(); [-0.25, 0, 0.25].forEach((d) => dot(g, x + d * s, y - s * 0.05, s * 0.07, C.card)); g.restore(); }
function docIcon(g, x, y, s, col) { g.save(); rr(g, x - s * 0.4, y - s * 0.5, s * 0.8, s, s * 0.1, null, col || C.mid, s * 0.11); g.strokeStyle = col || C.mid; g.lineWidth = s * 0.09; g.lineCap = "round"; [-0.15, 0.08, 0.3].forEach((d, i) => { g.beginPath(); g.moveTo(x - s * 0.22, y + d * s); g.lineTo(x + s * (i === 2 ? 0.05 : 0.22), y + d * s); g.stroke(); }); g.restore(); }
function syncIcon(g, x, y, r, ang, col) {
  g.save(); g.translate(x, y); g.rotate(ang); g.strokeStyle = col || C.mid; g.lineWidth = r * 0.22; g.lineCap = "round";
  for (const a0 of [0, Math.PI]) { g.beginPath(); g.arc(0, 0, r, a0 + 0.35, a0 + Math.PI - 0.35); g.stroke(); const ex = Math.cos(a0 + Math.PI - 0.35) * r, ey = Math.sin(a0 + Math.PI - 0.35) * r; g.fillStyle = col || C.mid; g.beginPath(); g.moveTo(ex + Math.cos(a0 + Math.PI) * r * 0.28, ey + Math.sin(a0 + Math.PI) * r * 0.28); g.lineTo(ex + Math.cos(a0 + Math.PI * 1.5) * r * 0.36, ey + Math.sin(a0 + Math.PI * 1.5) * r * 0.36); g.lineTo(ex - Math.cos(a0 + Math.PI) * r * 0.28, ey - Math.sin(a0 + Math.PI) * r * 0.28); g.fill(); }
  g.restore();
}
/** a tick in a circle; p = how much of the check mark is drawn (0..1) */
function tick(g, x, y, r, p, fill) {
  if (p <= 0) return; const s = soft(Math.min(1, p * 1.4)); g.save(); g.translate(x, y); g.scale(s, s); dot(g, 0, 0, r, fill || C.mid);
  const q = clamp01(p * 1.6 - 0.3), pts = [[-0.42, 0.02], [-0.12, 0.3], [0.45, -0.32]]; g.strokeStyle = "#fff"; g.lineWidth = r * 0.24; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); g.moveTo(pts[0][0] * r, pts[0][1] * r);
  const seg1 = Math.min(1, q / 0.4); g.lineTo(lerp(pts[0][0], pts[1][0], seg1) * r, lerp(pts[0][1], pts[1][1], seg1) * r); if (q > 0.4) { const seg2 = (q - 0.4) / 0.6; g.lineTo(lerp(pts[1][0], pts[2][0], seg2) * r, lerp(pts[1][1], pts[2][1], seg2) * r); } g.stroke(); g.restore();
}
/** a team member's hand, pointing up-left (index finger at x,y) */
function hand(g, x, y, s) {
  g.save(); g.translate(x, y); g.rotate(-0.55);
  rr(g, -s * 0.22, s * 0.95, s * 0.44, s * 0.9, s * 0.1, C.forest);                       // sleeve
  rr(g, -s * 0.2, s * 0.85, s * 0.4, s * 0.14, s * 0.06, C.mist);                         // cuff
  rr(g, -s * 0.24, s * 0.3, s * 0.48, s * 0.62, s * 0.2, C.skin);                         // palm
  rr(g, -s * 0.07, -s * 0.06, s * 0.15, s * 0.5, s * 0.075, C.skin);                      // index finger
  [0.09, 0.24].forEach((dx) => rr(g, dx - s * 0.07, s * 0.26, s * 0.14, s * 0.22, s * 0.07, "#bb8462"));
  rr(g, -s * 0.36, s * 0.42, s * 0.18, s * 0.3, s * 0.09, C.skin);                         // thumb
  g.restore();
}
const bar = (g, x, y, w, h, col) => rr(g, x, y, w, h, h / 2, col || "rgba(22,53,36,0.12)");
const chip = (g, x, y, label, size, fill, color) => { font(g, size, 800); const w = g.measureText(label).width + size * 1.2, h = size * 1.7; rr(g, x, y - h / 2, w, h, h / 2, fill || C.pale); txt(g, label, x + w / 2, y + size * 0.04, size, color || C.mid, 800, "center"); return w; };
