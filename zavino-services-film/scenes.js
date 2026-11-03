// ───────────── Zavino services film v2 — the 2D kit ─────────────
// Palette: sand #E1D7C1 base, deep forest #163524 for text/logo, mid forest #37634A for highlights (+ tints of those).
const C = {
  forest: "#163524", deep: "#0d2217", mid: "#37634A", leaf: "#4f7d62", sage: "#95b3a1", mist: "#cee0d5", pale: "#e4eee8",
  sand: "#E1D7C1", sandLt: "#ece5d4", sandDk: "#d3c6aa", paper: "#fdfaf3", paper2: "#f5efe1", ink: "#163524", muted: "#5d6d63", hair: "rgba(22,53,36,0.09)",
  skin: "#c99271", skinDk: "#b17b5b",
};
const FONT = '"Nunito","Helvetica Neue",Arial,sans-serif';

// ── maths / easing ──
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
const eio = (x) => { x = clamp01(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const eout = (x) => 1 - Math.pow(1 - clamp01(x), 3);
const ein = (x) => Math.pow(clamp01(x), 3);
const soft = (x) => { x = clamp01(x); const c1 = 1.1, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };   // gentle overshoot: small bounce on cards
const hash = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const popIn = (t, t0, dur) => (t < t0 ? 0 : soft((t - t0) / (dur || 0.5)));
const fadeIn = (t, t0, dur) => ease((t - t0) / (dur || 0.4));

// ── basic drawing ──
function rr(g, x, y, w, h, r, fill, stroke, lw) { g.beginPath(); g.roundRect(x, y, Math.max(0, w), Math.max(0, h), Math.max(0, Math.min(r, w / 2, h / 2))); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw || 2; g.stroke(); } }
function dot(g, x, y, r, fill) { g.beginPath(); g.arc(x, y, Math.max(0, r), 0, Math.PI * 2); g.fillStyle = fill; g.fill(); }
function font(g, size, weight) { g.font = `${weight || 800} ${size}px ${FONT}`; }
function line(g, x1, y1, x2, y2, col, lw, cap) { g.strokeStyle = col; g.lineWidth = lw; g.lineCap = cap || "round"; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); }
function popped(g, cx, cy, s, a, rot, fn) { if (s <= 0.001 || a <= 0.001) return; g.save(); g.globalAlpha *= Math.min(1, a); g.translate(cx, cy); g.rotate(rot || 0); g.scale(s, s); g.translate(-cx, -cy); fn(); g.restore(); }

// ── text that always fits its box (and says so loudly when it can't) ──
function warn(msg) { console.error("OVERFLOW " + msg); }
function checkFrame(g, x, w, size, align, y) {
  if (g.globalAlpha < 0.92) return; const m = g.getTransform(), W = g.canvas.width, H = g.canvas.height, x0 = align === "center" ? x - w / 2 : align === "right" ? x - w : x, x1 = x0 + w;
  const sx0 = m.a * x0 + m.e, sx1 = m.a * x1 + m.e, sy = m.d * y + m.f;
  if (sx0 < -2 || sx1 > W + 2 || sy - size < -2 || sy + size > H + 2) warn(`text runs off the frame (x ${Math.round(sx0)}–${Math.round(sx1)}, y ${Math.round(sy)})`);
}
/** one line inside maxW: the font shrinks (down to `min` × size) before an ellipsis is used. Returns the width and size used. */
function fit1(g, s, x, y, maxW, size, color, weight, align, o) {
  o = o || {}; let sz = size; font(g, sz, weight); let w = g.measureText(s).width;
  if (w > maxW) { sz = Math.max(size * (o.min || 0.62), (size * maxW) / w); font(g, sz, weight); w = g.measureText(s).width; }
  let str = s;
  if (w > maxW + 0.5) { let n = s.length; while (n > 1 && g.measureText(s.slice(0, n) + "…").width > maxW) n--; str = s.slice(0, n) + "…"; w = g.measureText(str).width; warn(`"${s}" does not fit ${Math.round(maxW)}px (even at ${Math.round(sz)}px)`); }
  g.fillStyle = color; g.textAlign = align || "left"; g.textBaseline = o.base || "middle"; g.fillText(str, x, y); checkFrame(g, x, w, sz, align, y); return { w, size: sz };
}
/** a wrapped paragraph inside the box (x, y, w, h): top-anchored, the font shrinks until every line fits. align: left | center. Returns the height used. */
function para(g, s, x, y, w, h, size, color, weight, align, o) {
  o = o || {}; const lhK = o.lh || 1.22, min = size * (o.min || 0.6); let sz = size, lines = [];
  for (;;) {
    font(g, sz, weight); lines = []; let cur = "";
    for (const wd of String(s).split(" ")) { const n = cur ? cur + " " + wd : wd; if (g.measureText(n).width > w && cur) { lines.push(cur); cur = wd; } else cur = n; }
    if (cur) lines.push(cur);
    const tooWide = lines.some((l) => g.measureText(l).width > w + 0.5);
    if (!tooWide && lines.length * sz * lhK <= h + 0.5) break; if (sz <= min) { warn(`paragraph "${String(s).slice(0, 34)}…" does not fit ${Math.round(w)}×${Math.round(h)}`); break; } sz = Math.max(min, sz - 1);
  }
  g.fillStyle = color; g.textAlign = align || "left"; g.textBaseline = "alphabetic"; const lh = sz * lhK, ax = align === "center" ? x + w / 2 : align === "right" ? x + w : x;
  lines.forEach((l, i) => { g.fillText(l, ax, y + sz * 0.92 + i * lh); checkFrame(g, ax, g.measureText(l).width, sz, align, y + i * lh); }); return lines.length * lh;
}
/** a pill with its label measured: returns the rect. anchor "l" (x = left) | "c" (x = centre) | "r" (x = right). maxW shrinks the label. */
function chip(g, x, cy, label, size, fill, color, o) {
  o = o || {}; const padX = size * (o.pad ?? 0.62); let sz = size; font(g, sz, o.weight || 800); let tw = g.measureText(label).width;
  if (o.maxW && tw + padX * 2 > o.maxW) { sz = Math.max(size * 0.66, size * (o.maxW - padX * 2) / tw); font(g, sz, o.weight || 800); tw = g.measureText(label).width; if (tw + padX * 2 > o.maxW + 0.5) warn(`chip "${label}" does not fit ${Math.round(o.maxW)}px`); }
  const w = tw + padX * 2, h = size * 1.7, x0 = o.anchor === "c" ? x - w / 2 : o.anchor === "r" ? x - w : x;
  rr(g, x0, cy - h / 2, w, h, h / 2, fill, o.stroke, o.lw); g.fillStyle = color; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(label, x0 + w / 2, cy + sz * 0.04); checkFrame(g, x0 + w / 2, tw, sz, "center", cy);
  return { x: x0, y: cy - h / 2, w, h };
}

// ── frame + stage layout ──
function FR(k) {
  const W = k.W, H = k.H, a = W / H, m = Math.min(W, H) / 1080;
  if (a > 1.3) return { mode: "land", W, H, m, text: { x: W * 0.065, y: H * 0.5, w: W * 0.345, align: "left", title: 74 * m, sub: 38 * m }, stage: { x: W * 0.42, y: H * 0.085, w: W * 0.56, h: H * 0.88 } };
  if (a < 0.8) return { mode: "port", W, H, m, text: { x: W * 0.5, y: H * 0.205, w: W * 0.86, align: "center", title: 80 * m, sub: 44 * m }, stage: { x: W * 0.04, y: H * 0.34, w: W * 0.92, h: H * 0.6 } };
  return { mode: "sq", W, H, m, text: { x: W * 0.5, y: H * 0.15, w: W * 0.86, align: "center", title: 58 * m, sub: 33 * m }, stage: { x: W * 0.06, y: H * 0.27, w: W * 0.88, h: H * 0.7 } };
}
/** stage space: design units −440…440 in both axes, centred in the stage box (U = px per unit) */
function ST(F) { const s = F.stage, U = Math.min(s.w, s.h) / 900; return { cx: s.x + s.w / 2, cy: s.y + s.h / 2, U, X: (v) => s.x + s.w / 2 + v * U, Y: (v) => s.y + s.h / 2 + v * U }; }

/** kicker + title + subline, revealed word by word. a = visibility, t0 = when it starts */
function textBlock(g, F, o, t, t0, a) {
  if (a <= 0.001) return; const T = F.text, m = F.m, tsize = o.title || T.title, ssize = T.sub, lines = o.lines || [o.title_text], center = T.align === "center", ax = T.x;
  font(g, tsize, 1000); const lh = tsize * 1.07; const wrapped = [];
  const wrapAt = (str, mw) => { const out = []; let cur = ""; String(str).split(" ").forEach((wd) => { const n = cur ? cur + " " + wd : wd; if (g.measureText(n).width > mw && cur) { out.push(cur); cur = wd; } else cur = n; }); if (cur) out.push(cur); return out; };
  lines.forEach((ln) => { font(g, tsize, 1000); let w0 = wrapAt(ln, T.w); if (w0.length > 1) { let lo = T.w * 0.4, hi = T.w; for (let q = 0; q < 14; q++) { const mid = (lo + hi) / 2; if (wrapAt(ln, mid).length === w0.length) hi = mid; else lo = mid; } w0 = wrapAt(ln, hi + 1); } wrapped.push(...w0); });
  let sz = tsize; font(g, sz, 1000); const wmax = Math.max(...wrapped.map((l) => g.measureText(l).width)); if (wmax > T.w) { sz = tsize * T.w / wmax; }
  const sub = o.sub ? [] : [], kick = o.kicker ? 1 : 0; if (o.sub) { font(g, ssize, 700); let cur = ""; o.sub.split(" ").forEach((wd) => { const n = cur ? cur + " " + wd : wd; if (g.measureText(n).width > T.w && cur) { sub.push(cur); cur = wd; } else cur = n; }); if (cur) sub.push(cur); }
  const kh = kick ? ssize * 1.9 : 0, sh = ssize * 1.32, total = kh + wrapped.length * sz * 1.07 + (sub.length ? sz * 0.34 + sub.length * sh : 0); let y = T.y - total / 2;
  if (kick) { const e = eout((t - t0) / 0.5); g.save(); g.globalAlpha = a * e; const kx = center ? ax : ax; const w = o.kicker.chip ? chip(g, kx, y + ssize * 0.8 + (1 - e) * 14 * m, o.kicker.text, ssize * 0.56, C.mid, "#fff", { anchor: center ? "c" : "l", maxW: T.w }) : null; if (o.kicker.icon && !center) { } g.restore(); y += kh; }
  wrapped.forEach((l, i) => { const e = eout((t - t0 - 0.12 - i * 0.12) / 0.6); g.save(); g.globalAlpha = a * e; fit1(g, l, ax, y + lh * 0.5 + (1 - e) * 28 * m, T.w, sz, C.forest, 1000, center ? "center" : "left"); g.restore(); y += sz * 1.07; });
  if (sub.length) { y += sz * 0.34; sub.forEach((l, i) => { const e = eout((t - t0 - 0.45 - i * 0.1) / 0.6); g.save(); g.globalAlpha = a * e; fit1(g, l, ax, y + sh * 0.5 + (1 - e) * 20 * m, T.w, ssize, C.mid, 700, center ? "center" : "left"); g.restore(); y += sh; }); }
}

// ── background: sand paper, drifting flight lines, soft light, grain, vignette ──
let _grain = null;
function grainPattern(g) { if (_grain) return _grain; const c = document.createElement("canvas"); c.width = c.height = 256; const x = c.getContext("2d"), im = x.createImageData(256, 256); let s = 12345; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647); for (let i = 0; i < 256 * 256; i++) { const v = 120 + rnd() * 120; im.data[i * 4] = im.data[i * 4 + 1] = v * 0.9; im.data[i * 4 + 2] = v * 0.72; im.data[i * 4 + 3] = rnd() * 60; } x.putImageData(im, 0, 0); _grain = g.createPattern(c, "repeat"); return _grain; }
function background(k, T) {
  const g = k.g, W = k.W, H = k.H, m = Math.min(W, H) / 1080, gr = g.createLinearGradient(0, 0, W * 0.3, H); gr.addColorStop(0, C.sandLt); gr.addColorStop(1, C.sand); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  // soft light pools
  [[0.18, 0.12, 0.55, "rgba(255,252,244,0.65)"], [0.9, 0.95, 0.5, "rgba(206,224,213,0.35)"], [0.75, 0.2, 0.4, "rgba(255,248,230,0.35)"]].forEach(([x, y, r, c]) => { const rg = g.createRadialGradient(W * x, H * y, 0, W * x, H * y, Math.max(W, H) * r); rg.addColorStop(0, c); rg.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = rg; g.fillRect(0, 0, W, H); });
  // flight lines: long soft curves that drift (like air currents)
  g.save(); g.lineCap = "round"; for (let i = 0; i < 16; i++) { const y0 = H * (0.08 + i * 0.058), ph = i * 0.9 + T * 0.18, amp = (30 + (i % 4) * 16) * m; g.strokeStyle = `rgba(22,53,36,${0.035 + (i % 3) * 0.012})`; g.lineWidth = (1.4 + (i % 2)) * m; g.beginPath(); for (let x = -20; x <= W + 20; x += 24) { const yy = y0 + Math.sin(x * 0.0042 + ph) * amp + Math.sin(x * 0.0017 + ph * 0.6) * amp * 0.8; x < 0 ? g.moveTo(x, yy) : g.lineTo(x, yy); } g.stroke(); } g.restore();
  // dust motes
  for (let i = 0; i < 26; i++) { const sp = 6 + hash(i) * 14, x = ((hash(i + 3) * W + T * sp * m) % (W + 40)) - 20, y = (hash(i + 9) * H + Math.sin(T * 0.4 + i) * 12 * m) % H, r = (1 + hash(i + 5) * 2.4) * m; dot(g, x, y, r, `rgba(255,251,240,${0.25 + hash(i + 1) * 0.35})`); }
  g.save(); g.globalAlpha = 0.9; g.globalCompositeOperation = "multiply"; g.fillStyle = grainPattern(g); g.fillRect(0, 0, W, H); g.restore();
  const vg = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.4, W / 2, H / 2, Math.max(W, H) * 0.82); vg.addColorStop(0, "rgba(120,100,60,0)"); vg.addColorStop(1, "rgba(120,100,60,0.12)"); g.fillStyle = vg; g.fillRect(0, 0, W, H);
}
/** the logo mark + a thin flight-progress line, always on screen (except under the hero logo at the end) */
function hud(k, F, T, total, a) {
  if (a <= 0.01) return; const g = k.g, m = F.m, W = F.W, pad = 46 * m; g.save(); g.globalAlpha *= a;
  drawLogo(g, pad + 21 * m, pad + 22 * m, 44 * m, C.forest); font(g, 34 * m, 1000); g.fillStyle = C.forest; g.textAlign = "left"; g.textBaseline = "alphabetic"; g.fillText("zavino", pad + 52 * m, pad + 35 * m); const wz = g.measureText("zavino").width; g.fillStyle = C.mid; g.fillText(".", pad + 52 * m + wz, pad + 35 * m);
  const tw = 150 * m, tx = W - pad - tw, ty = pad + 22 * m, p = clamp01(T / total); rr(g, tx, ty - 2 * m, tw, 4 * m, 2 * m, "rgba(22,53,36,0.14)"); rr(g, tx, ty - 2 * m, tw * p, 4 * m, 2 * m, C.mid); dot(g, tx + tw * p, ty, 7 * m, C.forest); dot(g, tx + tw * p, ty, 3 * m, C.paper);
  g.restore();
}

// ── cards ──
function card(k, x, y, w, h, o) {
  o = o || {}; const g = k.g, r = o.r ?? Math.min(w, h) * 0.12, s = Math.min(w, h);
  g.save(); g.shadowColor = "rgba(22,53,36,0.07)"; g.shadowBlur = s * 0.34; g.shadowOffsetY = s * 0.16; rr(g, x, y, w, h, r, o.fill || C.paper); g.restore();
  g.save(); g.shadowColor = "rgba(22,53,36,0.14)"; g.shadowBlur = s * 0.06; g.shadowOffsetY = s * 0.022; const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, o.fill || "#fffefa"); gr.addColorStop(1, o.fill2 || C.paper2); rr(g, x, y, w, h, r, gr); g.restore();
  rr(g, x + 0.5, y + 0.5, w - 1, h - 1, r, null, "rgba(255,255,255,0.8)", 1.4); rr(g, x, y, w, h, r, null, o.border || "rgba(22,53,36,0.075)", Math.max(1, s * 0.005));
}
const bar = (g, x, y, w, h, col) => rr(g, x, y, Math.max(0, w), h, h / 2, col || "rgba(22,53,36,0.11)");
/** an avatar circle with initials */
function avatar(g, x, y, r, label, fill, color) { dot(g, x, y, r, fill || C.mist); fit1(g, label, x, y + r * 0.04, r * 1.3, r * 0.86, color || C.mid, 900, "center"); }

// ── icons (line icons in a −1…1 box, drawn at (x, y) with size s) ──
function icon(g, name, x, y, s, col, lw) {
  g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = col || C.mid; g.fillStyle = col || C.mid; g.lineWidth = (lw || 2.2) / s * 1; g.lineCap = "round"; g.lineJoin = "round"; const L = (lw || 2.2) / s;
  const P = (fn) => { g.beginPath(); fn(); g.stroke(); };
  switch (name) {
    case "mail": rr(g, -0.8, -0.56, 1.6, 1.12, 0.18, null, col || C.mid, L); P(() => { g.moveTo(-0.74, -0.46); g.lineTo(0, 0.1); g.lineTo(0.74, -0.46); }); break;
    case "chat": rr(g, -0.8, -0.62, 1.6, 1.08, 0.3, null, col || C.mid, L); P(() => { g.moveTo(-0.3, 0.46); g.lineTo(-0.48, 0.82); g.lineTo(0.1, 0.46); }); [-0.34, 0, 0.34].forEach((d) => dot(g, d, -0.08, 0.075, col || C.mid)); break;
    case "doc": rr(g, -0.58, -0.78, 1.16, 1.56, 0.16, null, col || C.mid, L); [-0.34, -0.02, 0.3].forEach((d, i) => P(() => { g.moveTo(-0.3, d); g.lineTo(i === 2 ? 0.08 : 0.3, d); })); break;
    case "sync": [0, Math.PI].forEach((a0) => { P(() => g.arc(0, 0, 0.62, a0 + 0.5, a0 + Math.PI - 0.35)); const ex = Math.cos(a0 + Math.PI - 0.35) * 0.62, ey = Math.sin(a0 + Math.PI - 0.35) * 0.62; g.beginPath(); g.moveTo(ex + Math.cos(a0 + Math.PI * 1.05) * 0.3, ey + Math.sin(a0 + Math.PI * 1.05) * 0.3); g.lineTo(ex, ey); g.lineTo(ex + Math.cos(a0 + Math.PI * 1.55) * 0.34, ey + Math.sin(a0 + Math.PI * 1.55) * 0.34); g.stroke(); }); break;
    case "spark": g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 - Math.PI / 2, r = i % 2 ? 0.22 : 0.85; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill(); break;
    case "funnel": g.beginPath(); g.moveTo(-0.8, -0.62); g.lineTo(0.8, -0.62); g.lineTo(0.16, 0.12); g.lineTo(0.16, 0.7); g.lineTo(-0.16, 0.52); g.lineTo(-0.16, 0.12); g.closePath(); g.stroke(); break;
    case "pen": P(() => { g.moveTo(-0.7, 0.7); g.lineTo(-0.58, 0.24); g.lineTo(0.42, -0.76); g.lineTo(0.76, -0.42); g.lineTo(-0.24, 0.58); g.closePath(); }); P(() => { g.moveTo(0.2, -0.54); g.lineTo(0.54, -0.2); }); break;
    case "window": rr(g, -0.82, -0.66, 1.64, 1.32, 0.16, null, col || C.mid, L); P(() => { g.moveTo(-0.82, -0.28); g.lineTo(0.82, -0.28); }); dot(g, -0.6, -0.47, 0.06, col || C.mid); dot(g, -0.42, -0.47, 0.06, col || C.mid); break;
    case "search": P(() => g.arc(-0.1, -0.1, 0.5, 0, Math.PI * 2)); P(() => { g.moveTo(0.28, 0.28); g.lineTo(0.74, 0.74); }); break;
    case "route": dot(g, -0.55, 0.5, 0.17, col || C.mid); P(() => { g.moveTo(0.52, -0.62); g.bezierCurveTo(0.9, -0.62, 0.9, -0.1, 0.52, 0.5); g.bezierCurveTo(0.14, -0.1, 0.14, -0.62, 0.52, -0.62); }); dot(g, 0.52, -0.38, 0.1, col || C.mid); P(() => { g.setLineDash([0.16, 0.2]); g.moveTo(-0.55, 0.5); g.bezierCurveTo(-0.3, 0.9, 0.1, 0.9, 0.3, 0.55); g.setLineDash([]); }); break;
    case "launch": P(() => { g.moveTo(0, -0.84); g.bezierCurveTo(0.5, -0.4, 0.5, 0.2, 0.28, 0.5); g.lineTo(-0.28, 0.5); g.bezierCurveTo(-0.5, 0.2, -0.5, -0.4, 0, -0.84); }); dot(g, 0, -0.18, 0.15, col || C.mid); P(() => { g.moveTo(-0.28, 0.2); g.lineTo(-0.62, 0.6); g.lineTo(-0.28, 0.5); }); P(() => { g.moveTo(0.28, 0.2); g.lineTo(0.62, 0.6); g.lineTo(0.28, 0.5); }); break;
    case "loop": P(() => g.arc(0, 0, 0.62, Math.PI * 0.15, Math.PI * 1.75)); g.beginPath(); g.moveTo(0.18, -0.9); g.lineTo(0.66, -0.62); g.lineTo(0.2, -0.3); g.stroke(); break;
    case "user": P(() => g.arc(0, -0.28, 0.34, 0, Math.PI * 2)); P(() => { g.moveTo(-0.72, 0.8); g.bezierCurveTo(-0.72, 0.26, 0.72, 0.26, 0.72, 0.8); }); break;
    case "link": P(() => { g.moveTo(-0.2, 0.2); g.lineTo(0.2, -0.2); }); rr(g, -0.86, -0.1, 0.84, 0.5, 0.25, null, col || C.mid, L); rr(g, 0.02, -0.4, 0.84, 0.5, 0.25, null, col || C.mid, L); break;
    case "bolt": g.beginPath(); g.moveTo(0.2, -0.9); g.lineTo(-0.5, 0.1); g.lineTo(-0.04, 0.1); g.lineTo(-0.2, 0.9); g.lineTo(0.5, -0.12); g.lineTo(0.04, -0.12); g.closePath(); g.fill(); break;
    case "calendar": rr(g, -0.78, -0.6, 1.56, 1.4, 0.18, null, col || C.mid, L); P(() => { g.moveTo(-0.78, -0.2); g.lineTo(0.78, -0.2); g.moveTo(-0.4, -0.84); g.lineTo(-0.4, -0.4); g.moveTo(0.4, -0.84); g.lineTo(0.4, -0.4); }); break;
    case "heart": g.beginPath(); g.moveTo(0, 0.72); g.bezierCurveTo(-1, 0.1, -0.7, -0.7, 0, -0.26); g.bezierCurveTo(0.7, -0.7, 1, 0.1, 0, 0.72); g.stroke(); break;
    case "share": dot(g, -0.5, 0, 0.17, col || C.mid); dot(g, 0.5, -0.5, 0.17, col || C.mid); dot(g, 0.5, 0.5, 0.17, col || C.mid); P(() => { g.moveTo(-0.5, 0); g.lineTo(0.5, -0.5); g.moveTo(-0.5, 0); g.lineTo(0.5, 0.5); }); break;
    case "image": rr(g, -0.8, -0.64, 1.6, 1.28, 0.16, null, col || C.mid, L); dot(g, -0.4, -0.2, 0.15, col || C.mid); g.beginPath(); g.moveTo(-0.8, 0.5); g.lineTo(-0.2, 0.0); g.lineTo(0.2, 0.36); g.lineTo(0.5, 0.1); g.lineTo(0.8, 0.42); g.stroke(); break;
    case "toggle": rr(g, -0.8, -0.4, 1.6, 0.8, 0.4, col || C.mid); dot(g, 0.4, 0, 0.28, C.paper); break;
  }
  g.restore();
}
/** a tick in a filled circle; p = how much of it is drawn 0..1 (with a small pop) */
function tick(g, x, y, r, p, fill) {
  if (p <= 0) return; const sc = soft(Math.min(1, p * 1.5)); g.save(); g.translate(x, y); g.scale(sc, sc); g.shadowColor = "rgba(22,53,36,0.25)"; g.shadowBlur = r * 0.5; g.shadowOffsetY = r * 0.16; dot(g, 0, 0, r, fill || C.mid); g.restore();
  g.save(); g.translate(x, y); g.scale(sc, sc); const q = clamp01(p * 1.7 - 0.35), pts = [[-0.44, 0.04], [-0.12, 0.34], [0.46, -0.32]]; g.strokeStyle = "#fff"; g.lineWidth = r * 0.26; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); g.moveTo(pts[0][0] * r, pts[0][1] * r);
  const s1 = Math.min(1, q / 0.4); g.lineTo(lerp(pts[0][0], pts[1][0], s1) * r, lerp(pts[0][1], pts[1][1], s1) * r); if (q > 0.4) { const s2 = (q - 0.4) / 0.6; g.lineTo(lerp(pts[1][0], pts[2][0], s2) * r, lerp(pts[1][1], pts[2][1], s2) * r); } g.stroke(); g.restore();
  if (p > 0.4 && p < 1.0) { const e = (p - 0.4) / 0.6; g.save(); g.globalAlpha *= (1 - e) * 0.5; g.strokeStyle = fill || C.mid; g.lineWidth = r * 0.12; g.beginPath(); g.arc(x, y, r * (1.1 + e * 0.9), 0, 7); g.stroke(); g.restore(); }
}
/** a team member's hand + sleeve, index finger tip at (x,y) pointing up-left; s = size */
function hand(g, x, y, s, press) {
  g.save(); g.translate(x, y); g.rotate(-0.5); const k = 1 - 0.06 * (press || 0);
  g.shadowColor = "rgba(22,53,36,0.22)"; g.shadowBlur = s * 0.2; g.shadowOffsetY = s * 0.12;
  g.fillStyle = C.forest; g.beginPath(); g.roundRect(-s * 0.3, s * 1.06, s * 0.6, s * 1.1, s * 0.12); g.fill(); g.shadowColor = "transparent";
  g.fillStyle = C.mist; g.beginPath(); g.roundRect(-s * 0.28, s * 0.98, s * 0.56, s * 0.16, s * 0.07); g.fill();
  g.fillStyle = C.skin; g.beginPath(); g.moveTo(-s * 0.26, s * 1.0); g.bezierCurveTo(-s * 0.36, s * 0.62, -s * 0.34, s * 0.34, -s * 0.2, s * 0.26); g.lineTo(-s * 0.1, s * 0.0 * k); g.bezierCurveTo(-s * 0.1, -s * 0.12, s * 0.12, -s * 0.12, s * 0.12, s * 0.0); g.lineTo(s * 0.14, s * 0.26); g.bezierCurveTo(s * 0.3, s * 0.24, s * 0.42, s * 0.34, s * 0.4, s * 0.52); g.bezierCurveTo(s * 0.4, s * 0.78, s * 0.3, s * 0.92, s * 0.26, s * 1.0); g.closePath(); g.fill();
  g.strokeStyle = C.skinDk; g.lineWidth = s * 0.03; g.lineCap = "round"; [[0.14, 0.38, 0.14, 0.5], [0.26, 0.4, 0.26, 0.52]].forEach(([a, b, c, d]) => { g.beginPath(); g.moveTo(s * a, s * b); g.lineTo(s * c, s * d); g.stroke(); });
  g.restore();
}
// ───────────── the zavino. symbol (the exact SVG path from the brand file, viewBox 249 252 520 520) ─────────────
const LOGO_D = "M447.5 260.6c-35.4 19.8-183.9 106.5-186.3 108.7-1.8 1.7-3.7 4.7-4.3 6.7-.6 2.3-.9 30.6-.7 82.1l.3 78.5 2.5 3.7c1.4 2.1 4.4 4.7 6.8 5.8 7.6 3.7 10.2 2.8 37.4-12.9 13.4-7.7 83.7-48.3 156.3-90.3l132-76.4h6.5c7.9 0 12.2 2.6 15.1 8.9 3.3 7.2 1.6 18.3-3.5 22.5-.9.8-79.4 46.3-174.4 101.1-135.5 78.3-173.3 100.6-175.7 103.5l-3 3.7-.2 73.1-.3 73.2 2.3 3.9c3.9 6.9 11 10.2 18.1 8.6 1.9-.4 34.7-18.8 73-40.9 38.2-22.1 71.2-40.9 73.2-41.7 7.5-3.1 1.5-6.3 90.3 48 29.3 17.9 55 33 57 33.6 2 .5 5.1.6 7.1.1 1.9-.4 23.8-12.5 48.5-26.8 24.8-14.3 64.4-37.2 88-50.8 53.2-30.7 50.1-28.7 52.5-33.5 2-3.8 2-5.6 2-80.9 0-52.1-.3-77.9-1.1-79.8-2.4-6.4-8.7-10.5-16-10.5-5.3 0 17.4-12.9-218.1 123.1-91.7 52.9-93.8 54.1-99 54.1-4.1 0-6.2-.6-9.1-2.5-4.3-3-7.7-9-7.7-13.7.1-4.6 3.2-11.1 6.6-13.5 2.6-1.8 69.3-40.4 266.9-154.3 37.4-21.6 69.4-40.3 71.1-41.6 6.7-5 6.4-1.4 6.4-83.3 0-60.4-.3-74.8-1.4-77.4-2.8-6.9-12.2-11.7-19-9.9-1.8.5-32.5 17.8-68.2 38.4s-66.8 38.5-69.1 39.7c-5.4 2.7-9.9 2.7-15.4-.2-2.4-1.3-33.4-20-68.9-41.7-62.1-38-64.6-39.4-70-39.7-3.8-.2-6.4.2-8.5 1.3";
const LOGO_VB = { x: 249, y: 252, w: 520, h: 520 };
let _logoP2D = null;
/** draw the symbol (2D) centred on (cx, cy); size = px for the 520-unit box. fill = colour or gradient */
function drawLogo(g, cx, cy, size, fill) {
  if (!_logoP2D) _logoP2D = new Path2D(LOGO_D);
  g.save(); g.translate(cx, cy); const s = size / LOGO_VB.w; g.scale(s, s); g.translate(-(LOGO_VB.x + LOGO_VB.w / 2), -(LOGO_VB.y + LOGO_VB.h / 2));
  g.fillStyle = fill || "#163524"; g.fill(_logoP2D); g.restore();
}
/** the path as absolute segments: [["M",x,y],["C",x1,y1,x2,y2,x,y],["L",x,y]] (supports M c l h v s — all the symbol uses) */
function parseLogo(d) {
  const tok = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e-?\d+)?/g); let i = 0, cx = 0, cy = 0, lx = 0, ly = 0, cmd = "", out = [];
  const num = () => parseFloat(tok[i++]);
  while (i < tok.length) {
    if (/[a-zA-Z]/.test(tok[i])) cmd = tok[i++];
    const rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase();
    if (C === "M") { let x = num(), y = num(); if (rel) { x += cx; y += cy; } out.push(["M", x, y]); cx = x; cy = y; cmd = rel ? "l" : "L"; lx = cx; ly = cy; }
    else if (C === "L") { let x = num(), y = num(); if (rel) { x += cx; y += cy; } out.push(["L", x, y]); cx = x; cy = y; lx = cx; ly = cy; }
    else if (C === "H") { let x = num(); if (rel) x += cx; out.push(["L", x, cy]); cx = x; }
    else if (C === "V") { let y = num(); if (rel) y += cy; out.push(["L", cx, y]); cy = y; }
    else if (C === "C") { let a = [num(), num(), num(), num(), num(), num()]; if (rel) a = a.map((v, j) => v + (j % 2 ? cy : cx)); out.push(["C", ...a]); lx = a[2]; ly = a[3]; cx = a[4]; cy = a[5]; }
    else if (C === "S") { let a = [num(), num(), num(), num()]; if (rel) a = a.map((v, j) => v + (j % 2 ? cy : cx)); const x1 = 2 * cx - lx, y1 = 2 * cy - ly; out.push(["C", x1, y1, a[0], a[1], a[2], a[3]]); lx = a[0]; ly = a[1]; cx = a[2]; cy = a[3]; }
    else { i++; }
  }
  return out;
}
// ───────────── the 2D paper ribbon (for loops, branches and lifts that must pass under/over flat cards) ─────────────
function spline(pts) {
  const n = pts.length - 1;
  return (s) => {
    const f = clamp01(s) * n, i = Math.min(n - 1, Math.floor(f)), u = f - i, p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n, i + 2)];
    const q = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
    return [q(p0[0], p1[0], p2[0], p3[0]), q(p0[1], p1[1], p2[1], p3[1])];
  };
}
/** a band along P(s) from s0 to s1: front mid-forest, back deep forest, twisting; width w px */
function ribbon2D(k, P, s0, s1, w, o) {
  o = o || {}; if (s1 - s0 < 0.002) return; const g = k.g, N = Math.max(14, Math.round((s1 - s0) * (o.n || 100))), pts = [];
  for (let i = 0; i <= N; i++) {
    const s = lerp(s0, s1, i / N), a = P(Math.max(0, Math.min(1, s))), b = P(Math.max(0, Math.min(1, s + 0.002))), dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, phi = (o.twist || 0) * Math.PI * 2 * s + (o.phase || 0), c = Math.cos(phi);
    const ends = Math.min(1, o.flatStart ? 1 : (i / N) / (o.tapeIn ?? 0.05) + 0.1, o.flatEnd ? 1 : (1 - i / N) / (o.tapeOut ?? 0.05) + 0.1);
    pts.push({ x: a[0], y: a[1], nx: -dy / L, ny: dx / L, hw: (w / 2) * Math.max(0.14, Math.abs(c)) * Math.max(0.3, ends), c, up: -dy / L });
  }
  g.save(); if (o.alpha !== undefined) g.globalAlpha *= o.alpha;
  if (!o.noShadow) { g.fillStyle = "rgba(22,53,36,0.1)"; g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo : g.moveTo).call(g, p.x + p.nx * p.hw + w * 0.05, p.y + p.ny * p.hw + w * 0.2)); for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; g.lineTo(p.x - p.nx * p.hw + w * 0.05, p.y - p.ny * p.hw + w * 0.2); } g.closePath(); g.fill(); }
  for (let i = 0; i < pts.length - 1; i++) {
    const p = pts[i], q = pts[i + 1], front = p.c >= 0, lit = clamp01(0.5 + 0.5 * p.up) * Math.abs(p.c), col = front ? k.mix("#2f5a43", "#4f8466", lit * 0.9) : k.mix("#0d2217", "#163524", 0.5 + lit * 0.5);
    g.fillStyle = col; g.strokeStyle = col; g.lineWidth = 1; g.beginPath(); g.moveTo(p.x + p.nx * p.hw, p.y + p.ny * p.hw); g.lineTo(q.x + q.nx * q.hw, q.y + q.ny * q.hw); g.lineTo(q.x - q.nx * q.hw, q.y - q.ny * q.hw); g.lineTo(p.x - p.nx * p.hw, p.y - p.ny * p.hw); g.closePath(); g.fill(); g.stroke();
  }
  g.strokeStyle = "rgba(255,255,255,0.2)"; g.lineWidth = Math.max(1, w * 0.03); g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo : g.moveTo).call(g, p.x - p.nx * p.hw * 0.9, p.y - p.ny * p.hw * 0.9)); g.stroke(); g.restore();
}
/** dotted data-flow line from a to b via control point; moving dots (t drives them) */
function flowLine(g, ax, ay, bx, by, bend, t, p, col, U) {
  if (p <= 0) return; const cx = (ax + bx) / 2 + bend * U, cy = (ay + by) / 2; g.save(); g.strokeStyle = col || C.mid; g.lineWidth = 3.2 * U; g.lineCap = "round"; g.setLineDash([2, 12 * U]); g.beginPath(); g.moveTo(ax, ay);
  const n = 40; for (let i = 1; i <= n * p; i++) { const u = i / n, x = (1 - u) * (1 - u) * ax + 2 * (1 - u) * u * cx + u * u * bx, y = (1 - u) * (1 - u) * ay + 2 * (1 - u) * u * cy + u * u * by; g.lineTo(x, y); } g.stroke(); g.setLineDash([]);
  if (p >= 1) for (let j = 0; j < 3; j++) { const u = ((t * 0.5 + j / 3) % 1), x = (1 - u) * (1 - u) * ax + 2 * (1 - u) * u * cx + u * u * bx, y = (1 - u) * (1 - u) * ay + 2 * (1 - u) * u * cy + u * u * by; dot(g, x, y, 6 * U, col || C.mid); }
  g.restore();
}
// ───────────── paper-craft parts shared by the scenes ─────────────

/** the symbol cut from paper: pale fill with a soft drop shadow (used as a quiet watermark behind scenes) */
function paperLogo(g, x, y, size, rot, a, fill) {
  if (a <= 0.005) return; g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(rot || 0);
  g.shadowColor = "rgba(22,53,36,0.17)"; g.shadowBlur = size * 0.05; g.shadowOffsetY = size * 0.028; drawLogo(g, 0, 0, size, fill || C.sandLt); g.restore();
}
/** a disc carrying the symbol — the assistant's avatar, buttons, badges */
function logoDisc(g, x, y, r, bg, mark) { dot(g, x, y, r, bg || C.forest); drawLogo(g, x, y, r * 1.22, mark || C.sand); }

/** three layers of paper hills along the bottom edge */
function strata(k, T, a) {
  if (a <= 0.01) return; const g = k.g, W = k.W, H = k.H, m = Math.min(W, H) / 1080;
  [["#dacfb4", 0.93, 0.016, 0.0021, 0], ["#d0d9c6", 0.962, 0.013, 0.0027, 1.7], ["#bfd0c0", 0.99, 0.011, 0.0034, 3.1]].forEach(([col, base, amp, fr, ph]) => {
    g.save(); g.globalAlpha *= a; g.shadowColor = "rgba(22,53,36,0.16)"; g.shadowBlur = 16 * m; g.shadowOffsetY = -5 * m; g.fillStyle = col; g.beginPath(); g.moveTo(-10, H + 10);
    for (let x = -10; x <= W + 12; x += 16) g.lineTo(x, H * base + Math.sin(x * fr + ph + T * 0.12) * H * amp + Math.sin(x * fr * 2.3 + ph) * H * amp * 0.4);
    g.lineTo(W + 12, H + 10); g.closePath(); g.fill(); g.restore();
  });
}

/** text on a circle (clockwise from the top); the font is sized so the string closes the ring. Returns the font size */
function ringText(g, s, x, y, r, col, weight) {
  const ch = [...s]; font(g, 100, weight || 1000); const ws = ch.map((c) => g.measureText(c).width), tot = ws.reduce((a, b) => a + b, 0), size = (100 * 2 * Math.PI * r * 0.992) / tot;
  font(g, size, weight || 1000); g.fillStyle = col; g.textAlign = "center"; g.textBaseline = "alphabetic"; let a = -Math.PI / 2;
  ch.forEach((c, i) => { const da = (ws[i] * size) / 100 / r; g.save(); g.translate(x, y); g.rotate(a + da / 2 + Math.PI / 2); g.fillText(c, 0, -r); g.restore(); a += da; });
  return size;
}
/** the "final say" seal: forest disc, sand rings, ring text, the symbol in the middle. p = ink 0..1 */
function seal(g, x, y, R, rot, p) {
  if (p <= 0.003) return; g.save(); g.translate(x, y); g.rotate(rot); g.globalAlpha *= clamp01(p * 1.4);
  g.shadowColor = "rgba(13,34,23,0.38)"; g.shadowBlur = R * 0.22; g.shadowOffsetY = R * 0.09; dot(g, 0, 0, R, C.forest); g.shadowColor = "transparent";
  const gr = g.createRadialGradient(-R * 0.3, -R * 0.35, 0, 0, 0, R); gr.addColorStop(0, "rgba(255,255,255,0.13)"); gr.addColorStop(1, "rgba(255,255,255,0)"); dot(g, 0, 0, R, gr);
  g.strokeStyle = C.sand; g.lineWidth = R * 0.028; g.beginPath(); g.arc(0, 0, R * 0.9, 0, 7); g.stroke(); g.lineWidth = R * 0.012; g.beginPath(); g.arc(0, 0, R * 0.52, 0, 7); g.stroke(); g.beginPath(); g.arc(0, 0, R * 0.62, 0, 7); g.stroke();
  ringText(g, "YOUR TEAM HAS THE FINAL SAY  ·  ", 0, 0, R * 0.665, C.sand, 1000);
  drawLogo(g, 0, 0, R * 0.78, C.sand);
  for (let i = 0; i < 70; i++) { const a = hash(i) * 7, rr_ = Math.sqrt(hash(i + 50)) * R * 0.98; dot(g, Math.cos(a) * rr_, Math.sin(a) * rr_, R * (0.004 + hash(i + 90) * 0.009), "rgba(225,215,193,0.16)"); }
  g.restore();
}

/** arrow pointer */
function cursor(g, x, y, s, press) {
  g.save(); g.translate(x, y); g.scale(s * (1 - 0.1 * (press || 0)), s * (1 - 0.1 * (press || 0))); g.shadowColor = "rgba(22,53,36,0.3)"; g.shadowBlur = s * 0.2; g.shadowOffsetY = s * 0.1;
  g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 1.05); g.lineTo(0.26, 0.82); g.lineTo(0.43, 1.2); g.lineTo(0.6, 1.12); g.lineTo(0.44, 0.76); g.lineTo(0.78, 0.76); g.closePath(); g.fillStyle = "#fff"; g.fill(); g.shadowColor = "transparent"; g.strokeStyle = C.forest; g.lineWidth = 0.075; g.lineJoin = "round"; g.stroke(); g.restore();
}
/** an expanding ring (click, arrival, approval). p 0..1 */
function ripple(g, x, y, r, p, col, lw) { if (p <= 0 || p >= 1) return; g.save(); g.globalAlpha *= (1 - p) * 0.7; g.strokeStyle = col || C.mid; g.lineWidth = lw || 4; g.beginPath(); g.arc(x, y, r * (0.35 + p * 0.9), 0, 7); g.stroke(); g.restore(); }
/** a count badge */
function badge(g, x, y, r, label, fill, color) { dot(g, x, y, r, fill || C.forest); fit1(g, label, x, y + r * 0.05, r * 1.5, r * 1.05, color || C.sand, 900, "center"); }
/** typing indicator (three bouncing dots) */
function typingDots(g, x, y, r, t, col) { for (let i = 0; i < 3; i++) dot(g, x + (i - 1) * r * 2.5, y - Math.max(0, Math.sin(t * 7 - i * 0.9)) * r * 1.1, r, col || C.sage); }
/** a small round token with an icon on it (floating noise, tools, channels) */
function token(g, x, y, r, name, bg, col) { g.save(); g.shadowColor = "rgba(22,53,36,0.18)"; g.shadowBlur = r * 0.5; g.shadowOffsetY = r * 0.2; dot(g, x, y, r, bg || C.paper); g.restore(); icon(g, name, x, y, r * 0.52, col || C.mid, 2.4); }
/** soft paper shape (rounded blob tile) used as an icon plate */
function plate(g, x, y, w, h, r, fill) { g.save(); g.shadowColor = "rgba(22,53,36,0.14)"; g.shadowBlur = Math.min(w, h) * 0.18; g.shadowOffsetY = Math.min(w, h) * 0.07; rr(g, x, y, w, h, r, fill || C.pale); g.restore(); }
/** progress rail with numbered nodes: lit[i] = 0..1 */
function rail(g, x0, x1, y, lit, labels, U, size) {
  const n = lit.length, xs = lit.map((_, i) => lerp(x0, x1, i / (n - 1)));
  g.save(); g.lineCap = "round"; g.strokeStyle = "rgba(22,53,36,0.14)"; g.lineWidth = 6 * U; g.beginPath(); g.moveTo(xs[0], y); g.lineTo(xs[n - 1], y); g.stroke();
  for (let i = 0; i < n - 1; i++) if (lit[i] > 0) { g.strokeStyle = C.mid; g.lineWidth = 6 * U; g.beginPath(); g.moveTo(xs[i], y); g.lineTo(lerp(xs[i], xs[i + 1], clamp01(lit[i + 1] > 0 ? 1 : lit[i] * 0.5)), y); g.stroke(); }
  g.restore();
  xs.forEach((x, i) => { const on = lit[i]; ripple(g, x, y, 34 * U, clamp01((on - 0.0) * 1.0) < 1 && on > 0 ? on : 1, C.mid, 3 * U); dot(g, x, y, 17 * U * (1 + 0.12 * soft(on)), on > 0.3 ? C.forest : C.paper); g.strokeStyle = on > 0.3 ? C.forest : "rgba(22,53,36,0.3)"; g.lineWidth = 3 * U; g.beginPath(); g.arc(x, y, 17 * U * (1 + 0.12 * soft(on)), 0, 7); g.stroke();
    fit1(g, String(i + 1), x, y + 1, 26 * U, 19 * U, on > 0.3 ? C.sand : C.forest, 1000, "center"); if (labels) fit1(g, labels[i], x, y + 40 * U, (xs[1] - xs[0]) * 0.92, (size || 21) * U, on > 0.3 ? C.forest : C.muted, 800, "center"); });
}
// ───────────── the 3D hero layer (Three.js): a lit paper ribbon, the ivory paper jet, stone plinths, the extruded logo ─────────────
// Objects are placed with SCREEN fractions (xf, yf of the frame) at a depth z, so the 2D layout and the 3D layer line up in every aspect ratio.
// The camera drifts a little in time; objects keep their world positions, so the depth layers shift against each other (parallax).
const H3 = (() => {
  let R, S, CAM, BASE, cv, W = 0, H = 0, ready = false, FOV = 28, DIST = 15, used = false;
  const slots = [], plinths = [], P = {};
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const paperTex = (seed, size, strength) => { const c = document.createElement("canvas"); c.width = c.height = size; const x = c.getContext("2d"), im = x.createImageData(size, size); let s = seed; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < size * size; i++) { const v = 128 + (rnd() - 0.5) * strength; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; } x.putImageData(im, 0, 0); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };

  function buildJet() {
    const g = new THREE.Group(), ivory = new THREE.MeshStandardMaterial({ color: 0xf5f0e4, roughness: 0.82, metalness: 0, side: THREE.DoubleSide }), shade = new THREE.MeshStandardMaterial({ color: 0xe3dccb, roughness: 0.9, side: THREE.DoubleSide }), dark = new THREE.MeshStandardMaterial({ color: 0x2b3a31, roughness: 0.35, metalness: 0.2 });
    // fuselage: a lofted body, nose to +x (length 2)
    const prof = [[1.02, 0], [0.96, 0.025], [0.8, 0.075], [0.5, 0.12], [0.1, 0.15], [-0.35, 0.15], [-0.75, 0.125], [-0.98, 0.09], [-1.0, 0.0]].map(([x, r]) => new THREE.Vector2(r, x));
    const fus = new THREE.Mesh(new THREE.LatheGeometry(prof, 28), ivory); fus.rotation.z = -Math.PI / 2; fus.scale.set(1, 1, 0.78); fus.castShadow = true; g.add(fus);
    const wingShape = (pts, depth) => { const sh = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? sh.lineTo(x, y) : sh.moveTo(x, y))); sh.closePath(); const m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false }), ivory); m.castShadow = true; return m; };
    // delta wings, tailplanes (flat sheets in the x–z plane) and canted tail fins, mirrored left/right
    for (const sgn of [1, -1]) {
      const rx = sgn > 0 ? -Math.PI / 2 : Math.PI / 2;
      const w = wingShape([[0.4, 0], [-0.55, 0], [-0.62, 0.72], [-0.12, 0.6]], 0.018); w.rotation.x = rx; w.position.y = -0.015; g.add(w);
      const tail = wingShape([[-0.7, 0], [-1.02, 0], [-1.08, 0.3], [-0.84, 0.28]], 0.014); tail.rotation.x = rx; tail.position.y = -0.012; g.add(tail);
      const fin = wingShape([[-0.5, 0], [-0.98, 0], [-0.96, 0.5], [-0.7, 0.5]], 0.014); fin.position.set(0, 0.07, sgn * 0.1); fin.rotation.x = sgn * 0.42; g.add(fin);
    }
    const can = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), dark); can.scale.set(1.5, 0.72, 0.7); can.position.set(0.34, 0.1, 0); can.castShadow = true; g.add(can);
    const noz = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.09, 0.12, 14), new THREE.MeshStandardMaterial({ color: 0x6f6c63, roughness: 0.6 })); noz.rotation.z = Math.PI / 2; noz.position.set(-1.03, 0, 0); g.add(noz);
    const keel = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.03, 0.2), shade); keel.position.set(0.15, -0.14, 0); g.add(keel);
    // folded-paper edges
    g.traverse((o) => { if (o.isMesh && o.geometry && o !== can && o !== noz) { const e = new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry, 38), new THREE.LineBasicMaterial({ color: 0x163524, transparent: true, opacity: 0.28 })); o.add(e); } });
    return g;
  }
  function ribbonSlot(front, back) {
    const N = 240, geo = new THREE.BufferGeometry(), pos = new Float32Array((N + 1) * 2 * 3), uv = new Float32Array((N + 1) * 2 * 2), idx = [];
    for (let i = 0; i <= N; i++) { uv.set([i / N * 8, 0, i / N * 8, 1], i * 4); if (i < N) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); geo.setIndex(idx);
    const mf = new THREE.Mesh(geo, front), mb = new THREE.Mesh(geo, back); mf.castShadow = mb.castShadow = true; mf.receiveShadow = true; mf.frustumCulled = mb.frustumCulled = false; mf.visible = mb.visible = false;
    S.add(mf); S.add(mb); return { geo, N, mf, mb, frame: null, curve: null };
  }
  function init(w, h) {
    W = w; H = h; cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    R = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true, preserveDrawingBuffer: true }); R.setPixelRatio(1); R.setSize(W, H, false); R.setClearColor(0x000000, 0);
    R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap; R.outputEncoding = THREE.LinearEncoding; R.toneMapping = THREE.NoToneMapping;
    S = new THREE.Scene(); BASE = new THREE.PerspectiveCamera(FOV, W / H, 0.1, 200); BASE.position.set(0, 1.2, DIST); BASE.lookAt(0, 0, 0); BASE.updateMatrixWorld(); BASE.updateProjectionMatrix();
    CAM = BASE.clone();
    const key = new THREE.DirectionalLight(0xfff1d8, 1.25); key.position.set(-4.5, 8, 13); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); const sc = key.shadow.camera; sc.left = -14; sc.right = 14; sc.top = 9; sc.bottom = -9; sc.near = 1; sc.far = 40; key.shadow.bias = -0.0004; key.shadow.radius = 5; key.shadow.normalBias = 0.02; S.add(key); P.key = key;
    S.add(new THREE.HemisphereLight(0xfffaf0, 0xb9a98a, 0.62));
    const back = new THREE.DirectionalLight(0xdfe9e2, 0.3); back.position.set(6, 2, -4); S.add(back);
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(80, 50), new THREE.ShadowMaterial({ color: 0x3a2f1a, opacity: 0.14 })); wall.position.z = -1.1; wall.receiveShadow = true; S.add(wall); P.wall = wall;
    const bump = paperTex(7, 256, 70); bump.repeat.set(3, 1);
    const front = new THREE.MeshStandardMaterial({ color: 0x2f5a43, roughness: 0.78, metalness: 0, bumpMap: bump, bumpScale: 0.28 }), backM = new THREE.MeshStandardMaterial({ color: 0x10281b, roughness: 0.85, metalness: 0, side: THREE.BackSide, bumpMap: bump, bumpScale: 0.28 });
    for (let i = 0; i < 3; i++) slots.push(ribbonSlot(front, backM));
    P.jet = buildJet(); P.jet.visible = false; S.add(P.jet);
    const stone = new THREE.MeshStandardMaterial({ color: 0xefe6d2, roughness: 1, bumpMap: paperTex(11, 256, 40), bumpScale: 0.12 });
    for (let i = 0; i < 5; i++) { const sh = new THREE.Shape(), r = 0.06, w2 = 0.5, h2 = 0.5; sh.moveTo(-w2 + r, -h2); sh.lineTo(w2 - r, -h2); sh.quadraticCurveTo(w2, -h2, w2, -h2 + r); sh.lineTo(w2, h2 - r); sh.quadraticCurveTo(w2, h2, w2 - r, h2); sh.lineTo(-w2 + r, h2); sh.quadraticCurveTo(-w2, h2, -w2, h2 - r); sh.lineTo(-w2, -h2 + r); sh.quadraticCurveTo(-w2, -h2, -w2 + r, -h2);
      const m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 1, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2 }), stone); m.castShadow = m.receiveShadow = true; m.visible = false; m.geometry.translate(0, 0, -0.5); S.add(m); plinths.push(m); }
    // the logo, extruded
    const segs = parseLogo(LOGO_D), shape = new THREE.Shape(), cx = LOGO_VB.x + LOGO_VB.w / 2, cy = LOGO_VB.y + LOGO_VB.h / 2, fx = (x) => x - cx, fy = (y) => -(y - cy);
    segs.forEach((sg) => { if (sg[0] === "M") shape.moveTo(fx(sg[1]), fy(sg[2])); else if (sg[0] === "L") shape.lineTo(fx(sg[1]), fy(sg[2])); else shape.bezierCurveTo(fx(sg[1]), fy(sg[2]), fx(sg[3]), fy(sg[4]), fx(sg[5]), fy(sg[6])); });
    shape.closePath();
    const lg = new THREE.ExtrudeGeometry(shape, { depth: 34, bevelEnabled: true, bevelThickness: 7, bevelSize: 6, bevelSegments: 4, curveSegments: 24 }); lg.translate(0, 0, -17); lg.scale(1 / 520, 1 / 520, 1 / 520);
    P.logo = new THREE.Mesh(lg, new THREE.MeshStandardMaterial({ color: 0x0f2a1b, roughness: 0.6, metalness: 0.02, bumpMap: bump, bumpScale: 0.5 })); P.logo.castShadow = true; P.logo.visible = false; S.add(P.logo);
    ready = true;
  }
  /** screen fraction → world position at depth z (using the static base camera) */
  function world(xf, yf, z) { const v = V(xf * 2 - 1, 1 - yf * 2, 0.5).unproject(BASE), d = v.sub(BASE.position).normalize(), t = (z - BASE.position.z) / d.z; return BASE.position.clone().add(d.multiplyScalar(t)); }
  /** units: how many world units is one "unit" of min(W,H)=1 at depth z (for sizes) */
  function unit(z) { const hh = 2 * (DIST - z) * Math.tan((FOV * Math.PI) / 360); return hh / (H) * Math.min(W, H); }
  function begin(k, t, drift) {
    if (!ready || W !== k.W || H !== k.H) { if (!ready) init(k.W, k.H); }
    slots.forEach((s) => (s.mf.visible = s.mb.visible = false)); plinths.forEach((p) => (p.visible = false)); P.jet.visible = false; P.logo.visible = false; used = false;
    setDrift(t, drift === undefined ? 1 : drift); P.wall.visible = true; P.key.castShadow = true;
  }
  /** the render camera drifts a little (parallax); drift 0 = exactly the static base camera, so 2D and 3D line up */
  function setDrift(t, dr) { CAM.position.set(Math.sin(t * 0.35) * 0.55 * dr, 1.2 + Math.cos(t * 0.28) * 0.25 * dr, DIST + Math.sin(t * 0.2) * 0.3 * dr); CAM.lookAt(0, 0, 0); CAM.updateMatrixWorld(); }
  /** arc-length fraction of the ribbon at waypoints idxs of pts (so a scene can park things on the stops) */
  function stops(pts, idxs) {
    if (!ready) return idxs.map((j) => j / (pts.length - 1));
    const w = pts.map(([xf, yf, z]) => world(xf, yf, z || 0)), curve = new THREE.CatmullRomCurve3(w, false, "centripetal"), n = 800, samp = curve.getSpacedPoints(n);
    return idxs.map((j) => { let best = 0, bd = 1e9; samp.forEach((p, i) => { const dd = p.distanceToSquared(w[j]); if (dd < bd) { bd = dd; best = i; } }); return best / n; });
  }
  /** a ribbon along waypoints [[xf,yf,z],…] from fraction s0 to s1 of its length; width in units of min(W,H) */
  function ribbon(i, o) {
    const sl = slots[i]; if (!sl || o.s1 - o.s0 < 0.002) return; used = true;
    const pts = o.pts.map(([xf, yf, z]) => world(xf, yf, z || 0)); const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal"); sl.curve = curve;
    const wz = unit(o.pts[Math.floor(o.pts.length / 2)][2] || 0), width = o.width * wz, N = sl.N, pos = sl.geo.attributes.position.array, frames = [], tw = o.twist ?? 0.6, ph = o.phase ?? 0;
    for (let n = 0; n <= N; n++) {
      const u = n / N, s = o.s0 + (o.s1 - o.s0) * u, c = curve.getPointAt(Math.max(0, Math.min(1, s))), T = curve.getTangentAt(Math.max(0, Math.min(1, s))).normalize();
      let nrm = V(0, 0.28, 1); nrm.sub(T.clone().multiplyScalar(nrm.dot(T))).normalize(); const side = V().crossVectors(T, nrm).normalize();
      const head = o.curl ? THREE.MathUtils.smoothstep(u, 0.82, 1) : 0, tail = o.curl ? THREE.MathUtils.smoothstep(1 - u, 0.9, 1) * 0 : 0;
      const phi = tw * Math.PI * 2 * s + ph + head * 2.2, cp = Math.cos(phi), sp = Math.sin(phi);
      const sd = side.clone().multiplyScalar(cp).add(nrm.clone().multiplyScalar(sp)), nn = nrm.clone().multiplyScalar(cp).sub(side.clone().multiplyScalar(sp));
      const taper = Math.min(1, u / (o.tapeIn ?? 0.06) + 0.1, (1 - u) / (o.tapeOut ?? 0.04) + 0.18), hw = (width / 2) * Math.max(0.12, taper), rip = Math.sin(s * 40 + ph) * width * 0.012;
      const p = c.clone().add(nn.clone().multiplyScalar(rip)); frames.push({ p, T, n: nn, s });
      const a = p.clone().add(sd.clone().multiplyScalar(hw)), b = p.clone().sub(sd.clone().multiplyScalar(hw)); pos.set([a.x, a.y, a.z, b.x, b.y, b.z], n * 6);
    }
    sl.frame = frames; sl.geo.attributes.position.needsUpdate = true; sl.geo.computeVertexNormals(); sl.mf.visible = sl.mb.visible = true;
  }
  /** the jet riding a ribbon's frame at ribbon-fraction f (0..1 of the drawn part), lifted off the face by `lift` (units), with pitch/roll offsets */
  function jetOn(i, o) {
    const sl = slots[i]; if (!sl || !sl.frame) return; const n = Math.max(0, Math.min(sl.N, Math.round(o.f * sl.N))), fr = sl.frame[n], wz = unit(0), L = o.size * wz;
    const T = fr.T, N = fr.n.clone(); const X = T.clone(), Y = N.clone().sub(X.clone().multiplyScalar(N.dot(X))).normalize(), Z = V().crossVectors(X, Y).normalize();
    const m = new THREE.Matrix4().makeBasis(X, Y, Z), q = new THREE.Quaternion().setFromRotationMatrix(m); const adj = new THREE.Quaternion().setFromEuler(new THREE.Euler(o.roll || 0, o.yaw || 0, o.pitch || 0)); q.multiply(adj);
    P.jet.position.copy(fr.p).add(N.multiplyScalar((o.lift || 0) * wz)); P.jet.quaternion.copy(q); P.jet.scale.setScalar(L / 2); P.jet.visible = true; used = true; return { x: P.jet.position.x, y: P.jet.position.y, z: P.jet.position.z };
  }
  function jetAt(xf, yf, z, o) { P.jet.position.copy(world(xf, yf, z)); P.jet.quaternion.setFromEuler(new THREE.Euler(o.roll || 0, o.yaw || 0, o.pitch || 0)); P.jet.scale.setScalar((o.size * unit(z)) / 2); P.jet.visible = true; used = true; }
  function plinth(i, xf, yf, wu, hu, z, depthU, sc) { const p = plinths[i]; if (!p || (sc !== undefined && sc <= 0.01)) return; const f = sc === undefined ? 1 : sc, u = unit(z || 0), c = world(xf, yf, z || 0); p.position.set(c.x, c.y - (hu * u * f) / 2, c.z); p.scale.set(wu * u * f, hu * u * f, (depthU || wu * 0.7) * u * f); p.visible = true; used = true; }
  function logo(xf, yf, z, sizeU, o) { const c = world(xf, yf, z || 0), u = unit(z || 0); P.logo.position.copy(c); P.logo.scale.setScalar(sizeU * u * (o.scale ?? 1)); P.logo.rotation.set(o.rx || 0, o.ry || 0, o.rz || 0); P.logo.visible = (o.scale ?? 1) > 0.01; used = P.logo.visible || used; }
  function wall(on) { P.wall.visible = on; }
  /** render and composite onto g (at its current transform); returns false when nothing was drawn */
  function draw(g, W2, H2, alpha) { if (!ready || !used) return false; R.render(S, CAM); g.save(); if (alpha !== undefined) g.globalAlpha *= alpha; g.drawImage(cv, 0, 0, W2, H2); g.restore(); return true; }
  /** a world point → screen px (with the drifting camera) */
  function project(v) { const p = v.clone().project(CAM); return [(p.x + 1) / 2 * W, (1 - p.y) / 2 * H]; }
  function frameAt(i, f) { const sl = slots[i]; if (!sl || !sl.frame) return null; return sl.frame[Math.max(0, Math.min(sl.N, Math.round(f * sl.N)))]; }
  return { begin, setDrift, stops, ribbon, jetOn, jetAt, plinth, logo, wall, draw, project, world, unit, frameAt, get ready() { return ready; }, P };
})();
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
const MARKS = {
 "s1": [
  0.0
 ],
 "s2": [
  0.0,
  1.597,
  4.14
 ],
 "s3": [
  0.0,
  3.059,
  4.34,
  6.12
 ],
 "s4": [
  0.0,
  1.62,
  3.98,
  5.58,
  7.22
 ],
 "s5": [
  0.0,
  1.26,
  2.88,
  5.52
 ],
 "s6": [
  0.0,
  2.28,
  4.78
 ],
 "s7": [
  0.0
 ],
 "s8": [
  0.0,
  1.34,
  2.86,
  4.3,
  6.02
 ],
 "s9": [
  0.0,
  1.66,
  2.8,
  5.44,
  6.5
 ],
 "c3": [
  0.0
 ],
 "c4": [
  0.0,
  1.72
 ],
 "c5": [
  0.0,
  1.22,
  2.8
 ],
 "c9": [
  0.0,
  1.56,
  3.22,
  4.22
 ]
};
// ───────────── the flight: 3D ribbon sweeps between scenes, the HUD, and the dispatcher that draws every beat from global time ─────────────
/** waypoints of the ribbon that sweeps across the frame at boundary i (alternating rise / dip so consecutive sweeps differ) */
function sweepPts(F, i) {
  const up = i % 2 === 1;
  if (F.mode === "port") return up ? [[-0.4, 0.86, 0.4], [0.18, 0.7, 0.9], [0.5, 0.54, 0.2], [0.82, 0.44, -0.4], [1.4, 0.22, 0.5]] : [[-0.4, 0.2, 0.2], [0.2, 0.36, 0.8], [0.52, 0.5, 0.1], [0.84, 0.6, -0.4], [1.4, 0.8, 0.5]];
  return up ? [[-0.3, 0.9, 0.3], [0.2, 0.7, 0.9], [0.5, 0.5, 0.2], [0.8, 0.42, -0.4], [1.3, 0.12, 0.5]] : [[-0.3, 0.14, 0.2], [0.22, 0.38, 0.8], [0.5, 0.58, 0.1], [0.82, 0.54, -0.4], [1.3, 0.88, 0.5]];
}
const TW = 0.75;   // half-length of a sweep (s)
function sweep3(F, q, i) {
  const s1 = eio(q), s0 = eio(clamp01((q - 0.3) / 0.7)) * 0.985; if (s1 - s0 < 0.004 || q <= 0 || q >= 1) return;
  H3.ribbon(2, { pts: sweepPts(F, i), s0, s1, width: 0.105, twist: 0.14, phase: ((i % 3) - 1) * 0.3, tapeIn: 0.12, tapeOut: 0.03 });
  H3.jetOn(2, { f: 0.93, lift: 0.07, size: 0.23, pitch: 0.12 });
}
const STATIC = { s1: 1, s8: 1, s9: 1, c9: 1 };   // scenes that carry 3D objects do not slide with the 2D entrance
function film(k) {
  const g = k.g, F = FR(k), b = k.beat, beats = window.SHORT.beats, idx = beats.indexOf(b), t = k.t, d = b.dur, T = b.start + t, first = idx === 0, last = idx === beats.length - 1;
  const total = beats[beats.length - 1].start + beats[beats.length - 1].dur, ain = first ? 1 : ease((t - 0.02) / 0.55), aout = last ? 1 : 1 - ease((t - (d - 0.62)) / 0.45), A = Math.min(ain, aout), ex = last ? 0 : eio((t - (d - 0.7)) / 0.5);
  const st = STATIC[b.scene], dx = st ? 0 : (first ? 0 : -(1 - eout((t - 0.02) / 0.7)) * 70 * F.m) + (last ? 0 : ein((t - (d - 0.62)) / 0.45) * 100 * F.m);
  const MK = MARKS[b.scene] || [0], lead = first ? 0.35 : 0.05, ev = (i, frac) => (MK[i] !== undefined ? lead + MK[i] : frac * d);
  H3.begin(k, T, 1); background(k, T); strata(k, T, 0.9 * A);
  g.save(); g.translate(dx, 0); const hv = SEG[b.scene](k, F, t, d, ev, A, T, ex); g.restore();
  hud(k, F, T, total, (typeof hv === "number" ? hv : 1) * (first ? ease((t - 1.3) / 0.6) : 1));
  for (let i = 1; i < beats.length; i++) { const B = beats[i].start; if (Math.abs(T - B) < TW) sweep3(F, (T - B + TW) / (2 * TW), i); }
  H3.draw(g, k.W, k.H);
}
window.SCENES = {}; Object.keys(SEG).forEach((n) => (window.SCENES[n] = film));
