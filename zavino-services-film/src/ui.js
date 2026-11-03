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
