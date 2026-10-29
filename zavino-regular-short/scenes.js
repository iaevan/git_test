// "regular." — a Zavino Labs teaser · every shot drawn in code (Shorts Animator kit).
// Portrait 1080×1920. Positions are fractions of the frame; px sizes are for a 1920-tall frame (scaled by k.u).
// Brand: forest greens + linen + sand (thezavino.com), Manrope. Warm accents: amber (stars, offers), coral (alerts).

const NAME = "regular.";
const Z = {
  f950: "#0d2217", f900: "#163524", f800: "#254c36", f700: "#37634a", f600: "#53715f", f500: "#6e907b", f400: "#95b3a1", f300: "#b3cbbc", f200: "#cee0d5", f100: "#e4eee8", f50: "#f4f8f5",
  linen: "#f5f2e7", sand: "#e1d7c1", sand2: "#cdbf9f", ivory: "#fbf9f1", white: "#fdfdfc",
  amber: "#e8a33d", amberLt: "#f6d58a", coral: "#e2574c", coralLt: "#f6b2ab", terra: "#d9774f", wood: "#a9794f", woodDk: "#7d5636", woodLt: "#c79a68",
  ink: "#10241a", muted: "#4f6055", grey: "#9aa59d", greyLt: "#d8ded9", chat: "#3a9d6b",
};
const INK = Z.ink;
const FONT = '"Manrope","Inter","Helvetica Neue",Arial,sans-serif';

// ───────────────────────────── small helpers ─────────────────────────────
function rr(g, x, y, w, h, r, fill, stroke, lw) {
  g.beginPath(); g.roundRect(x, y, w, h, r);
  if (fill) { g.fillStyle = fill; g.fill(); }
  if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw || 6; g.stroke(); }
}
function circle(g, x, y, r, fill) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = fill; g.fill(); }
function txt(g, s, x, y, size, color, weight, align) {
  g.font = `${weight || 700} ${size}px ${FONT}`; g.fillStyle = color; g.textAlign = align || "center"; g.textBaseline = "middle"; g.fillText(s, x, y);
}
const ease = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const lerp = (a, b, t) => a + (b - a) * t;
const outBack = (x) => { x = clamp01(x); const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const outCubic = (x) => 1 - Math.pow(1 - clamp01(x), 3);
const hash = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
/** pop-in scale: 0 before t0, overshoots to 1 over dur */
const pop = (k, t0, dur) => outBack((k.t - t0) / (dur || 0.32));
const fmt = (n) => Math.round(n).toLocaleString("en-US");

function shadow(k, x, y, w, a) { const g = k.g; g.save(); g.fillStyle = `rgba(13,34,23,${a ?? 0.16})`; g.beginPath(); g.ellipse(x, y, w * 0.5, w * 0.075, 0, 0, 7); g.fill(); g.restore(); }
function glowSpot(k, x, y, r, color, a) {
  const g = k.g, gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, k.alpha(color, a)); gr.addColorStop(1, k.alpha(color, 0));
  g.save(); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); g.restore();
}
function sparkle(k, x, y, r, col, rot) {
  const g = k.g; if (r <= 0.5) return; g.save(); g.translate(x, y); g.rotate(rot || 0); g.fillStyle = col || Z.amberLt;
  g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, q = i % 2 ? r * 0.28 : r; g.lineTo(Math.cos(a) * q, Math.sin(a) * q); } g.closePath(); g.fill(); g.restore();
}
function confetti(k, n, speed, t0, cols) {
  const g = k.g, C = cols || [Z.amber, Z.coral, Z.f500, Z.terra, Z.amberLt, Z.f300]; const t = k.t - (t0 || 0); if (t < 0) return;
  for (let i = 0; i < n; i++) {
    const x = hash(i) * k.W, y = ((t * speed + hash(i + 50)) % 1.15) * k.H * 1.1 - k.H * 0.1;
    g.save(); g.translate(x + Math.sin(t * 3 + i) * 30 * k.u, y); g.rotate(t * (2 + hash(i) * 4) + i); g.fillStyle = C[i % C.length];
    g.fillRect(-9 * k.u, -5 * k.u, 18 * k.u, 10 * k.u); g.restore();
  }
}
/** a concept-preview tag: the product is not built yet, so every UI shot says so */
function previewTag(k, light) {
  const g = k.g, a = ease(k.t / 0.3) * 0.9; if (a <= 0) return; g.save(); g.globalAlpha = a;
  const w = 330 * k.u, h = 58 * k.u, x = k.X(0.5) - w / 2, y = k.Y(0.045);
  rr(g, x, y, w, h, h / 2, light ? "rgba(253,253,252,0.16)" : "rgba(22,53,36,0.1)", light ? "rgba(253,253,252,0.5)" : "rgba(22,53,36,0.28)", 3 * k.u);
  circle(g, x + 34 * k.u, y + h / 2, 7 * k.u, Z.amber); txt(g, "Concept preview", x + 54 * k.u, y + h / 2 + 1 * k.u, 28 * k.u, light ? "#f5f2e7" : Z.f800, 700, "left"); g.restore();
}
function star(g, x, y, r, fill, rot) {
  g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5 + (rot || 0), q = i % 2 ? r * 0.46 : r; i ? g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q) : g.moveTo(x + Math.cos(a) * q, y + Math.sin(a) * q); }
  g.closePath(); g.fillStyle = fill; g.fill();
}
/** five stars; n = how many are filled (0..5, may be mid-animation); size px */
function stars(k, o) {
  const g = k.g, s = o.size * k.u, gap = s * 1.18;
  for (let i = 0; i < 5; i++) {
    const f = clamp01((o.n ?? 5) - i), x = o.x + (i - 2) * gap; let sc = 1;
    if (o.popT !== undefined) sc = f > 0 ? 1 + 0.35 * Math.max(0, Math.sin(clamp01((k.t - (o.popT + i * 0.12)) / 0.3) * Math.PI)) : 1;
    star(g, x, o.y, s * 0.5 * sc, f > 0.5 ? (o.fill || Z.amber) : (o.empty || "#c9d1cb"));
  }
}
function qr(k, o) { // a QR-like code. (x,y) = centre; s = px; seed varies the pattern
  const g = k.g, s = o.s * k.u, n = 21, c = s / n, x0 = o.x - s / 2, y0 = o.y - s / 2;
  rr(g, x0 - c * 1.2, y0 - c * 1.2, s + c * 2.4, s + c * 2.4, c * 1.2, Z.white);
  const fin = (fx, fy) => { rr(g, x0 + fx * c, y0 + fy * c, c * 7, c * 7, c * 1.2, o.ink || Z.f900); rr(g, x0 + (fx + 1) * c, y0 + (fy + 1) * c, c * 5, c * 5, c * 0.8, Z.white); rr(g, x0 + (fx + 2) * c, y0 + (fy + 2) * c, c * 3, c * 3, c * 0.6, o.ink || Z.f900); };
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    if ((i < 8 && j < 8) || (i > n - 9 && j < 8) || (i < 8 && j > n - 9)) continue;
    if (hash(i * 31 + j * 7 + (o.seed || 1)) > 0.52) rr(g, x0 + i * c + c * 0.08, y0 + j * c + c * 0.08, c * 0.84, c * 0.84, c * 0.2, o.ink || Z.f900);
  }
  fin(0, 0); fin(n - 7, 0); fin(0, n - 7);
}
/** a phone, front view. (x,y) = centre; h = height px. Returns the screen rect */
function phone(k, o) {
  const g = k.g, h = o.h * k.u, w = h * 0.49, x = o.x - w / 2, y = o.y - h / 2;
  g.save(); g.translate(o.x, o.y); if (o.rot) g.rotate(o.rot); if (o.scale) g.scale(o.scale, o.scale); g.translate(-o.x, -o.y);
  g.shadowColor = "rgba(13,34,23,0.35)"; g.shadowBlur = h * 0.05; g.shadowOffsetY = h * 0.025; rr(g, x, y, w, h, w * 0.17, o.shell || Z.f950); g.shadowColor = "transparent";
  const sx = x + w * 0.04, sy = y + w * 0.04, sw = w * 0.92, sh = h - w * 0.08;
  rr(g, sx, sy, sw, sh, w * 0.14, o.bg || Z.white);
  g.restore(); return { x: sx, y: sy, w: sw, h: sh, cx: o.x, cy: o.y, u: sw / 540 };
}
const clipScreen = (g, s, fn) => { g.save(); g.beginPath(); g.roundRect(s.x, s.y, s.w, s.h, s.w * 0.14); g.clip(); fn(); g.restore(); };
const pill = (g, x, y, w, h, fill, label, color, size, weight) => { rr(g, x, y, w, h, h / 2, fill); if (label) txt(g, label, x + w / 2, y + h / 2 + 1, size || h * 0.45, color || "#fff", weight || 800); };
/** a soft card. (x,y) = top-left */
function card(k, o) { const g = k.g; g.save(); g.shadowColor = o.sh || "rgba(13,34,23,0.18)"; g.shadowBlur = 36 * k.u; g.shadowOffsetY = 14 * k.u; rr(g, o.x, o.y, o.w, o.h, o.r ?? 40 * k.u, o.fill || Z.white); g.restore(); }
/** a little cup icon. (x,y) = centre */
function cup(k, x, y, s, col, lid) {
  const g = k.g; s *= k.u; rr(g, x - s * 0.42, y - s * 0.38, s * 0.84, s * 0.12, s * 0.05, lid || Z.white);
  g.beginPath(); g.moveTo(x - s * 0.38, y - s * 0.26); g.lineTo(x + s * 0.38, y - s * 0.26); g.lineTo(x + s * 0.28, y + s * 0.44); g.lineTo(x - s * 0.28, y + s * 0.44); g.closePath(); g.fillStyle = col || Z.amber; g.fill();
  rr(g, x - s * 0.34, y - s * 0.02, s * 0.68, s * 0.22, s * 0.05, "rgba(255,255,255,0.28)");
}
function burger(k, x, y, s) {
  const g = k.g; s *= k.u; const bun = "#c9792b"; g.beginPath(); g.ellipse(x, y - s * 0.16, s * 0.46, s * 0.3, 0, Math.PI, 0); g.fillStyle = bun; g.fill();
  [[-0.2, -0.3], [0.02, -0.38], [0.22, -0.29], [-0.06, -0.24]].forEach(([dx, dy]) => { g.beginPath(); g.ellipse(x + dx * s, y + dy * s, s * 0.035, s * 0.02, 0.4, 0, 7); g.fillStyle = Z.amberLt; g.fill(); });
  rr(g, x - s * 0.5, y - s * 0.12, s, s * 0.1, s * 0.05, Z.f600); rr(g, x - s * 0.46, y - s * 0.03, s * 0.92, s * 0.12, s * 0.06, Z.woodDk); rr(g, x - s * 0.44, y + s * 0.08, s * 0.88, s * 0.08, s * 0.04, Z.amberLt);
  g.beginPath(); g.ellipse(x, y + s * 0.2, s * 0.46, s * 0.16, 0, 0, Math.PI); g.fillStyle = bun; g.fill();
}
function bell(k, x, y, s, rot) { const g = k.g; s *= k.u; g.save(); g.translate(x, y); g.rotate(rot || 0); g.beginPath(); g.moveTo(-s * 0.4, s * 0.3); g.quadraticCurveTo(-s * 0.4, -s * 0.5, 0, -s * 0.5); g.quadraticCurveTo(s * 0.4, -s * 0.5, s * 0.4, s * 0.3); g.closePath(); g.fillStyle = Z.amber; g.fill(); circle(g, 0, s * 0.42, s * 0.1, Z.woodDk); g.restore(); }

// ───────────────────────────── people ─────────────────────────────
/**
 * A person: round head, bean body. (x,y) = bottom of the feet; h = total height px.
 * mood: happy | neutral | sad | angry | wow | proud | worried | sleepy
 * hair: bun | short | cap | bob | long | ponytail | curly | hijab | beanie | bald      (hijab/cap/beanie colour: capC, hair colour: hairC)
 * outfit: tee | shirt | kurta | dress | jacket (inner: shirt colour)    apron: colour    hood: true    glasses / beard: true    bag: tote | backpack
 * arms: down | wave | up | hold | think | cross | point | shrug | wipe        sil: "#colour" → a flat silhouette (seen through glass)
 */
function person(k, o) {
  const g = k.g, mood = o.mood || "happy", H = (o.h || 520) * k.u, S = H / 0.92, tt = k.t + (o.ph || 0), sil = o.sil;
  const skin = sil || o.skin || "#c68a62", hairC = sil || o.hairC || "#2b1d17", top = sil || o.top || Z.sand2, pants = sil || o.pants || Z.f800, shoe = sil || "#1c211e", outfit = o.outfit || "tee", hair = o.hair || "short";
  const W = S * 0.27, R = S * 0.2, legH = S * 0.2, torsoH = S * 0.36, B = -legH, T = B - torsoH, hy = T - R * 0.78;
  const ph = o.walk ? tt * o.walk * Math.PI * 2 : 0, bounce = o.walk ? Math.abs(Math.sin(ph)) * S * 0.018 : 0;
  g.save(); g.translate(o.x, o.y - bounce); if (o.flip) g.scale(-1, 1); if (o.rot) g.rotate(o.rot); if (o.sq) g.scale(1 / Math.sqrt(o.sq), o.sq); if (o.alpha !== undefined) g.globalAlpha = o.alpha;
  const shake = o.shake ? Math.sin(tt * 55) * S * 0.008 : 0; g.translate(shake, 0);
  const dark = (c, a) => k.mix(c, "#000000", a);
  if (o.bag === "backpack" && !sil) rr(g, -W * 1.08, T + torsoH * 0.06, W * 2.16, torsoH * 0.92, W * 0.5, dark(o.bagC || Z.f700, 0.25));
  // legs
  [-1, 1].forEach((d) => { const lift = o.walk ? Math.max(0, Math.sin(ph + (d > 0 ? Math.PI : 0))) * S * 0.07 : 0, lx = d * W * 0.45;
    rr(g, lx - S * 0.055, B - S * 0.02, S * 0.11, legH + S * 0.02 - lift, S * 0.05, pants); g.fillStyle = shoe; g.beginPath(); g.ellipse(lx + d * S * 0.02, -lift, S * 0.075, S * 0.04, 0, 0, 7); g.fill(); });
  // arms: angle 0 = hanging, 90 = out to the side, 180 = straight up; or a target point (px, figure coordinates)
  const shY = T + torsoH * 0.2, armLen = S * 0.27, A = o.arms || "down", sw = Math.sin(tt * 9);
  const polar = (side, deg) => { const a = deg * Math.PI / 180; return [side * (W * 0.92 + Math.sin(a) * armLen), shY + Math.cos(a) * armLen]; };
  const tgt = { L: null, R: null };
  if (A === "down") { const s2 = o.walk ? Math.sin(ph) * 24 : 0; tgt.L = polar(-1, 10 + s2); tgt.R = polar(1, 10 - s2); }
  else if (A === "wave") { tgt.L = polar(-1, 10); tgt.R = polar(1, 150 + sw * 22); }
  else if (A === "up") { tgt.L = polar(-1, 155 + sw * 8); tgt.R = polar(1, 155 - sw * 8); }
  else if (A === "hold") { tgt.L = [-S * 0.1, T + torsoH * 0.5]; tgt.R = [S * 0.1, T + torsoH * 0.5]; }
  else if (A === "think") { tgt.L = polar(-1, 10); tgt.R = [S * 0.12, hy + R * 0.85]; }
  else if (A === "cross") { tgt.L = [S * 0.2, T + torsoH * 0.55]; tgt.R = [-S * 0.2, T + torsoH * 0.5]; }
  else if (A === "point") { tgt.L = polar(-1, 10); tgt.R = polar(1, 100); }
  else if (A === "shrug") { tgt.L = polar(-1, 80 + sw * 4); tgt.R = polar(1, 80 - sw * 4); }
  else if (A === "wipe") { tgt.L = polar(-1, 10); tgt.R = [S * 0.46 + Math.sin(tt * 7) * S * 0.07, T + torsoH * 0.62]; }
  if (o.armL) tgt.L = o.armL; if (o.armR) tgt.R = o.armR;
  const drawArm = (side) => { const t = side < 0 ? tgt.L : tgt.R; g.strokeStyle = top; g.lineWidth = S * 0.085; g.lineCap = "round"; g.beginPath(); g.moveTo(side * W * 0.92, shY); g.lineTo(t[0], t[1]); g.stroke(); circle(g, t[0], t[1], S * 0.05, skin); };
  const front = A === "hold" || A === "think" || A === "cross" || A === "wipe" || o.armsFront;
  if (!front) { drawArm(-1); drawArm(1); }
  if (o.hood && !sil) { g.fillStyle = dark(top, 0.1); g.beginPath(); g.ellipse(0, T + S * 0.02, W * 1.05, S * 0.14, 0, 0, 7); g.fill(); }
  // torso (by outfit)
  g.save(); g.shadowColor = "rgba(13,34,23,0.12)"; g.shadowBlur = S * 0.03; g.shadowOffsetY = S * 0.012;
  if (outfit === "kurta") { rr(g, -W * 1.02, T, W * 2.04, torsoH * 1.62, W * 0.6, top); }
  else if (outfit === "jacket" && !sil) { rr(g, -W, T, W * 2, torsoH, W * 0.6, o.inner || Z.linen); }
  else rr(g, -W, T, W * 2, torsoH, W * 0.6, top);
  g.restore();
  if (outfit === "dress") { g.fillStyle = top; g.beginPath(); g.moveTo(-W * 0.86, T + torsoH * 0.55); g.lineTo(W * 0.86, T + torsoH * 0.55); g.lineTo(W * 1.45, B + legH * 0.42); g.quadraticCurveTo(0, B + legH * 0.55, -W * 1.45, B + legH * 0.42); g.closePath(); g.fill(); if (!sil) rr(g, -W * 0.9, T + torsoH * 0.5, W * 1.8, torsoH * 0.12, W * 0.06, dark(top, 0.2)); }
  if (outfit === "kurta" && !sil) { g.strokeStyle = dark(top, 0.2); g.lineWidth = S * 0.012; g.beginPath(); g.moveTo(0, T + torsoH * 0.12); g.lineTo(0, T + torsoH * 1.5); g.moveTo(-W * 1.0, T + torsoH * 1.35); g.lineTo(-W * 1.0, T + torsoH * 1.62); g.moveTo(W * 1.0, T + torsoH * 1.35); g.lineTo(W * 1.0, T + torsoH * 1.62); g.stroke(); for (let q = 0; q < 3; q++) circle(g, 0, T + torsoH * (0.28 + q * 0.17), S * 0.012, dark(top, 0.3)); }
  if (outfit === "jacket" && !sil) { rr(g, -W, T, W * 0.72, torsoH, W * 0.5, top); rr(g, W * 0.28, T, W * 0.72, torsoH, W * 0.5, top); g.strokeStyle = dark(top, 0.25); g.lineWidth = S * 0.012; g.beginPath(); g.moveTo(-W * 0.28, T + S * 0.02); g.lineTo(-W * 0.12, T + torsoH * 0.55); g.moveTo(W * 0.28, T + S * 0.02); g.lineTo(W * 0.12, T + torsoH * 0.55); g.stroke(); }
  if (outfit === "shirt" && !sil) { g.fillStyle = "#fdfdfc"; g.beginPath(); g.moveTo(-W * 0.3, T); g.lineTo(0, T + S * 0.07); g.lineTo(W * 0.3, T); g.closePath(); g.fill(); g.strokeStyle = dark(top, 0.2); g.lineWidth = S * 0.01; g.beginPath(); g.moveTo(0, T + S * 0.07); g.lineTo(0, T + torsoH * 0.95); g.stroke(); }
  if (o.apron && !sil) { rr(g, -W * 0.8, T + torsoH * 0.3, W * 1.6, torsoH * 0.72, W * 0.4, o.apron); rr(g, -W * 0.52, T + torsoH * 0.1, W * 1.04, torsoH * 0.34, W * 0.14, o.apron);
    g.strokeStyle = o.apron; g.lineWidth = S * 0.03; g.lineCap = "round"; g.beginPath(); g.moveTo(-W * 0.42, T + torsoH * 0.14); g.lineTo(-W * 0.62, T + S * 0.01); g.moveTo(W * 0.42, T + torsoH * 0.14); g.lineTo(W * 0.62, T + S * 0.01); g.stroke();
    rr(g, -W * 0.38, T + torsoH * 0.6, W * 0.76, torsoH * 0.22, W * 0.1, "rgba(255,255,255,0.18)"); }
  if (o.hood && !sil) { rr(g, -W * 0.5, T + torsoH * 0.62, W * 1.0, torsoH * 0.26, W * 0.16, "rgba(0,0,0,0.12)"); g.strokeStyle = Z.linen; g.lineWidth = S * 0.012; g.beginPath(); g.moveTo(-W * 0.16, T + S * 0.01); g.lineTo(-W * 0.16, T + torsoH * 0.34); g.moveTo(W * 0.16, T + S * 0.01); g.lineTo(W * 0.16, T + torsoH * 0.34); g.stroke(); }
  if (o.bag === "backpack" && !sil) { g.strokeStyle = dark(o.bagC || Z.f700, 0.1); g.lineWidth = S * 0.035; g.lineCap = "round"; g.beginPath(); g.moveTo(-W * 0.55, T + S * 0.01); g.lineTo(-W * 0.62, T + torsoH * 0.8); g.moveTo(W * 0.55, T + S * 0.01); g.lineTo(W * 0.62, T + torsoH * 0.8); g.stroke(); }
  if (o.bag === "tote" && !sil) { g.strokeStyle = dark(o.bagC || Z.terra, 0.1); g.lineWidth = S * 0.025; g.lineCap = "round"; g.beginPath(); g.moveTo(-W * 0.7, T + S * 0.01); g.lineTo(W * 0.95, T + torsoH * 0.78); g.stroke(); rr(g, W * 0.6, T + torsoH * 0.7, W * 0.9, torsoH * 0.5, W * 0.14, o.bagC || Z.terra); }
  if (front) { drawArm(-1); drawArm(1); }
  // hair behind the head
  if (!sil) {
    if (hair === "bun") circle(g, 0, hy - R * 0.98, R * 0.34, hairC);
    if (hair === "ponytail") { g.fillStyle = hairC; g.beginPath(); g.ellipse(R * 1.08, hy + R * 0.3 + Math.sin(tt * 3) * R * 0.04, R * 0.3, R * 0.62, -0.3, 0, 7); g.fill(); }
    if (hair === "bob") rr(g, -R * 1.12, hy - R * 0.7, R * 2.24, R * 1.9, R * 0.8, hairC);
    if (hair === "long") rr(g, -R * 1.12, hy - R * 0.5, R * 2.24, R * 2.6, R * 0.9, hairC);
    if (hair === "curly") for (let q = 0; q < 11; q++) { const a = Math.PI * (1.02 + q * 0.096); circle(g, Math.cos(a) * R * 0.98, hy + Math.sin(a) * R * 0.92, R * 0.38, hairC); }
    if (hair === "hijab") { g.fillStyle = hairC; g.beginPath(); g.ellipse(0, hy + R * 0.12, R * 1.3, R * 1.34, 0, 0, 7); g.fill(); rr(g, -W * 1.0, T - S * 0.01, W * 2.0, torsoH * 0.5, W * 0.5, hairC); }
  }
  // head
  if (hair !== "bald" || true) [-1, 1].forEach((d) => { if (hair !== "hijab") circle(g, d * R * 0.98, hy + R * 0.12, R * 0.17, skin); }); circle(g, 0, hy, R, skin);
  if (!sil) {
    const hc = hairC;
    if (hair === "bun" || hair === "bob" || hair === "short" || hair === "long" || hair === "ponytail" || hair === "curly") {
      g.fillStyle = hc; g.beginPath(); g.arc(0, hy, R * 1.04, Math.PI * 1.04, Math.PI * 1.96); g.quadraticCurveTo(R * 0.7, hy - R * 0.52, R * 0.1, hy - R * 0.42); g.quadraticCurveTo(-R * 0.55, hy - R * 0.36, -R * 1.0, hy - R * 0.1); g.closePath(); g.fill();
    } else if (hair === "cap" || hair === "beanie") {
      g.fillStyle = hc; g.beginPath(); g.arc(0, hy, R * 1.02, Math.PI * 1.0, Math.PI * 2); g.lineTo(R * 1.0, hy - R * 0.2); g.lineTo(-R * 1.0, hy - R * 0.2); g.closePath(); g.fill();
      const cc = o.capC || Z.terra; g.fillStyle = cc; g.beginPath(); g.arc(0, hy - R * 0.1, R * 1.06, Math.PI * 1.02, Math.PI * 1.98); g.closePath(); g.fill();
      if (hair === "cap") { g.beginPath(); g.ellipse(R * 0.18, hy - R * 0.14, R * 1.14, R * 0.2, 0, 0, 7); g.fillStyle = dark(cc, 0.18); g.fill(); }
      else { rr(g, -R * 1.08, hy - R * 0.36, R * 2.16, R * 0.3, R * 0.14, dark(cc, 0.15)); circle(g, 0, hy - R * 1.12, R * 0.16, dark(cc, 0.1)); }
    } else if (hair === "hijab") {
      g.fillStyle = hairC; g.beginPath(); g.ellipse(0, hy + R * 0.1, R * 1.3, R * 1.34, 0, 0, Math.PI * 2); g.ellipse(0, hy + R * 0.16, R * 0.9, R * 0.96, 0, 0, Math.PI * 2, true); g.fill("evenodd");
    }
    if (o.beard) { g.fillStyle = hc; g.beginPath(); g.arc(0, hy, R * 1.0, Math.PI * 0.1, Math.PI * 0.9); g.quadraticCurveTo(-R * 0.5, hy + R * 0.4, 0, hy + R * 0.38); g.quadraticCurveTo(R * 0.5, hy + R * 0.4, R * Math.cos(Math.PI * 0.1), hy + R * Math.sin(Math.PI * 0.1)); g.closePath(); g.fill(); }
    // face
    const ey = hy + R * 0.1, ex = R * 0.4, er = R * 0.11, lk = o.look || [0, 0], by = ey - R * 0.36;
    const blink = ((tt + 0.7) % 3.4) < 0.12 && mood !== "proud" && mood !== "sleepy";
    const eye = (side) => { const x = side * ex;
      if (mood === "proud") { g.strokeStyle = INK; g.lineWidth = R * 0.075; g.lineCap = "round"; g.beginPath(); g.arc(x, ey + R * 0.08, er * 1.5, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); return; }
      g.save(); g.translate(x, ey); if (blink) g.scale(1, 0.12);
      if (mood === "wow") { circle(g, 0, 0, er * 1.9, "#fff"); g.strokeStyle = INK; g.lineWidth = R * 0.03; g.beginPath(); g.arc(0, 0, er * 1.9, 0, 7); g.stroke(); circle(g, lk[0] * er * 0.7, lk[1] * er * 0.7, er * 0.95, INK); }
      else { g.fillStyle = INK; g.beginPath(); g.ellipse(lk[0] * er * 0.5, lk[1] * er * 0.5, er, er * 1.25, 0, 0, 7); g.fill(); circle(g, lk[0] * er * 0.5 + er * 0.32, lk[1] * er * 0.5 - er * 0.4, er * 0.3, "#fff"); }
      if (mood === "sleepy") { g.fillStyle = skin; g.fillRect(-er * 1.6, -er * 1.7, er * 3.2, er * 1.85); g.strokeStyle = INK; g.lineWidth = R * 0.05; g.lineCap = "round"; g.beginPath(); g.moveTo(-er * 1.3, 0.15 * er); g.lineTo(er * 1.3, 0.15 * er); g.stroke(); }
      g.restore(); };
    eye(-1); eye(1);
    if (o.glasses) { g.strokeStyle = INK; g.lineWidth = R * 0.055; [-1, 1].forEach((d) => { g.beginPath(); g.arc(d * ex, ey, R * 0.27, 0, 7); g.stroke(); }); g.beginPath(); g.moveTo(-ex + R * 0.27, ey); g.lineTo(ex - R * 0.27, ey); g.moveTo(-ex - R * 0.27, ey); g.lineTo(-R * 0.97, ey - R * 0.05); g.moveTo(ex + R * 0.27, ey); g.lineTo(R * 0.97, ey - R * 0.05); g.stroke(); }
    g.strokeStyle = INK; g.lineWidth = R * 0.07; g.lineCap = "round";
    const browT = (side, tilt, lift) => { const x = side * ex, y = by - (lift || 0) * R; g.beginPath(); g.moveTo(x + side * R * 0.2, y + tilt * R * 0.16); g.lineTo(x - side * R * 0.2, y - tilt * R * 0.16); g.stroke(); };
    if (mood === "sad" || mood === "worried") { browT(-1, 0.9, 0.04); browT(1, 0.9, 0.04); } else if (mood === "angry") { browT(-1, -0.9, 0); browT(1, -0.9, 0); } else if (mood === "wow") { browT(-1, 0, 0.25); browT(1, 0, 0.25); } else if (mood === "neutral") { browT(-1, 0, 0); browT(1, 0, 0); } else if (mood === "sleepy") { browT(-1, 0.3, -0.06); browT(1, 0.3, -0.06); }
    const my = hy + R * 0.54; g.lineWidth = R * 0.075; if (o.beard) g.strokeStyle = "#f3e3d3";
    if (mood === "happy") { g.beginPath(); g.arc(0, my - R * 0.14, R * 0.27, Math.PI * 0.14, Math.PI * 0.86); g.stroke(); }
    else if (mood === "proud") { g.fillStyle = o.beard ? "#3a1f1a" : INK; g.beginPath(); g.moveTo(-R * 0.3, my - R * 0.12); g.quadraticCurveTo(0, my + R * 0.5, R * 0.3, my - R * 0.12); g.closePath(); g.fill(); g.fillStyle = Z.coral; g.beginPath(); g.ellipse(0, my + R * 0.13, R * 0.14, R * 0.07, 0, 0, 7); g.fill(); }
    else if (mood === "wow") { g.fillStyle = INK; g.beginPath(); g.ellipse(0, my + R * 0.04, R * 0.12, R * 0.17, 0, 0, 7); g.fill(); }
    else if (mood === "sad") { g.beginPath(); g.arc(0, my + R * 0.24, R * 0.22, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); }
    else if (mood === "angry") { g.beginPath(); g.moveTo(-R * 0.2, my + R * 0.06); g.quadraticCurveTo(0, my - R * 0.06, R * 0.2, my + R * 0.06); g.stroke(); }
    else if (mood === "worried") { g.beginPath(); for (let i = 0; i <= 12; i++) { const x = -R * 0.2 + (i / 12) * R * 0.4, y = my + Math.sin(i * 1.6 + tt * 8) * R * 0.03; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
    else { g.beginPath(); g.moveTo(-R * 0.15, my); g.lineTo(R * 0.15, my); g.stroke(); }
    if (mood === "happy" || mood === "proud" || mood === "wow") { g.fillStyle = "rgba(226,87,76,0.28)"; [-1, 1].forEach((d) => { g.beginPath(); g.ellipse(d * R * 0.62, ey + R * 0.36, R * 0.15, R * 0.09, 0, 0, 7); g.fill(); }); }
    if (mood === "worried" || o.sweat) { const tq = (tt * 1.3) % 1, sx = R * 1.12, sy = hy - R * 0.5 + tq * R * 0.9; g.save(); g.globalAlpha = 1 - tq * 0.6; g.fillStyle = "#8fd3ff"; g.beginPath(); g.moveTo(sx, sy - R * 0.2); g.quadraticCurveTo(sx + R * 0.15, sy + R * 0.04, sx, sy + R * 0.1); g.quadraticCurveTo(sx - R * 0.15, sy + R * 0.04, sx, sy - R * 0.2); g.fill(); g.restore(); }
    if (mood === "sad" && o.tear) { const tq = (tt * 0.9) % 1; g.save(); g.globalAlpha = 1 - tq * 0.5; g.fillStyle = "#8fd3ff"; g.beginPath(); g.ellipse(-ex, ey + R * 0.3 + tq * R * 0.6, R * 0.06, R * 0.1, 0, 0, 7); g.fill(); g.restore(); }
  }
  g.restore();
  return { top: o.y - bounce - H, cx: o.x, mid: o.y - bounce - H * 0.55, R: R };
}
/** a cast of extras: varied skin, hair, outfits — so a crowd reads as people, not blobs */
const CROWD = [
  { skin: "#c68a62", hair: "short", hairC: "#1f1713", top: "#6c8fb8", pants: "#2d3b4f", glasses: true, outfit: "shirt" },
  { skin: "#8d5a3b", hair: "curly", hairC: "#1a120e", top: "#d9a441", pants: "#3a2d25", outfit: "tee" },
  { skin: "#d9a37c", hair: "hijab", hairC: "#6f8f86", top: "#b3cbbc", outfit: "kurta", pants: "#cdbf9f" },
  { skin: "#b97d57", hair: "cap", capC: "#37634a", hairC: "#241913", top: "#d9574c", pants: "#254c36", bag: "backpack", bagC: "#53715f" },
  { skin: "#e0b08c", hair: "long", hairC: "#2a1c16", top: "#f0c75e", outfit: "dress" },
  { skin: "#a86b45", hair: "bald", beard: true, hairC: "#1c1410", top: "#37634a", outfit: "jacket", inner: "#f5f2e7", pants: "#1f2a24" },
  { skin: "#c68a62", hair: "ponytail", hairC: "#2b1d17", top: "#cee0d5", pants: "#53715f", bag: "tote", bagC: "#d9774f" },
  { skin: "#7d4e33", hair: "beanie", capC: "#d9774f", hairC: "#1a120e", top: "#95b3a1", outfit: "jacket", inner: "#fbf9f1", pants: "#2d3b4f" },
  { skin: "#d1976f", hair: "bob", hairC: "#1f1713", top: "#7d5a7b", pants: "#2d3b4f", outfit: "tee" },
  { skin: "#b97d57", hair: "short", hairC: "#241913", top: "#efe6d2", outfit: "kurta", pants: "#254c36", beard: true, glasses: true },
  { skin: "#e0b08c", hair: "hijab", hairC: "#c98f7a", top: "#7d5a7b", outfit: "dress" },
  { skin: "#9a6240", hair: "short", hairC: "#17100c", top: "#e08a62", pants: "#3a4a5e", outfit: "shirt", bag: "backpack", bagC: "#254c36" },
];
/** draw a list of extras back to front. each: {c: index into CROWD, x, y (feet px), h, mood, walk, flip, ph, arms, look, alpha, shadow} */
function crowd(k, list) {
  list.slice().sort((a, b) => a.y - b.y).forEach((p) => {
    if (p.shadow !== false) shadow(k, p.x, p.y + 4 * k.u, p.h * 0.5 * k.u, 0.12);
    person(k, { ...CROWD[p.c % CROWD.length], x: p.x, y: p.y, h: p.h, mood: p.mood || "neutral", walk: p.walk || 0, flip: p.flip, ph: p.ph || p.c, arms: p.arms || "down", look: p.look, alpha: p.alpha });
  });
}

/** "?" bubble over a head. (x,y) = centre of the bubble */
function qmark(k, x, y, s, t0, col) {
  const g = k.g, p = outBack((k.t - (t0 || 0)) / 0.3); if (p <= 0.01) return; s *= k.u; g.save(); g.translate(x, y + Math.sin(k.t * 3 + x) * 4 * k.u); g.scale(p, p);
  circle(g, 0, 0, s * 0.5, col || Z.f800); g.beginPath(); g.moveTo(-s * 0.1, s * 0.44); g.lineTo(s * 0.1, s * 0.44); g.lineTo(0, s * 0.68); g.closePath(); g.fillStyle = col || Z.f800; g.fill(); txt(g, "?", 0, 2 * k.u, s * 0.66, Z.linen, 800); g.restore();
}
const speech = (k, o) => { // pill bubble with a tail. (x,y) = centre of the pill
  const g = k.g, s = outBack((k.t - (o.t0 || 0)) / 0.3); if (s <= 0.01) return; const h = (o.h || 120) * k.u, w = (o.w || 420) * k.u;
  g.save(); g.translate(o.x, o.y); g.scale(s, s); g.shadowColor = "rgba(13,34,23,0.2)"; g.shadowBlur = 20 * k.u; g.shadowOffsetY = 8 * k.u;
  rr(g, -w / 2, -h / 2, w, h, h / 2, o.fill || "#fff"); const tx = (o.tailX ?? -0.25) * w, dir = o.tailDir || 1;
  g.beginPath(); g.moveTo(tx - 18 * k.u, dir * (h / 2 - 2)); g.lineTo(tx + 18 * k.u, dir * (h / 2 - 2)); g.lineTo(tx - 10 * k.u * Math.sign(o.tailX ?? -1), dir * (h / 2 + 46 * k.u)); g.closePath(); g.fill(); g.shadowColor = "transparent";
  txt(g, o.text, 0, 3 * k.u, h * 0.42, o.color || INK, 800); g.restore();
};

// ───────────────────────────── the café ─────────────────────────────
/** the café behind everything. o.dim 0..1 greys it down for the pain scenes; returns the counter-top y (px) */
function cafe(k, o) {
  o = o || {}; const g = k.g, W = k.W, H = k.H, fy = k.Y(o.floor ?? 0.7);
  k.sky({ stops: [Z.f50, Z.linen, Z.sand] });
  // tiled band
  const bandY = k.Y((o.floor ?? 0.7) - 0.24), bandH = fy - bandY; g.fillStyle = Z.f200; g.fillRect(0, bandY, W, bandH);
  g.strokeStyle = "rgba(22,53,36,0.1)"; g.lineWidth = 3 * k.u; for (let i = 0; i < 12; i++) { g.beginPath(); g.moveTo(i * W / 11, bandY); g.lineTo(i * W / 11, fy); g.stroke(); } for (let j = 1; j < 5; j++) { g.beginPath(); g.moveTo(0, bandY + j * bandH / 5); g.lineTo(W, bandY + j * bandH / 5); g.stroke(); }
  rr(g, -20, bandY - 14 * k.u, W + 40, 18 * k.u, 6, Z.woodDk);
  // chalkboard menu on the left wall (the prices are the ones in the story)
  if (!o.noBoard) { const bx = k.X(0.075), by = k.Y(0.19), bw = k.X(0.23), bh = k.Y(0.205) - k.Y(0.0); rr(g, bx - 10 * k.u, by - 10 * k.u, bw + 20 * k.u, bh + 20 * k.u, 16 * k.u, Z.woodDk); rr(g, bx, by, bw, bh, 10 * k.u, Z.f900);
    txt(g, "Café 27", bx + bw / 2, by + 50 * k.u, 40 * k.u, Z.amberLt, 800); g.strokeStyle = "rgba(245,242,231,0.35)"; g.lineWidth = 3 * k.u; g.beginPath(); g.moveTo(bx + 24 * k.u, by + 92 * k.u); g.lineTo(bx + bw - 24 * k.u, by + 92 * k.u); g.stroke();
    [["Burger", "৳550"], ["Coffee", "৳300"], ["Fries", "৳220"]].forEach(([n, pr], i) => { txt(g, n, bx + 24 * k.u, by + 128 * k.u + i * 48 * k.u, 28 * k.u, Z.linen, 600, "left"); txt(g, pr, bx + bw - 24 * k.u, by + 128 * k.u + i * 48 * k.u, 28 * k.u, Z.amberLt, 700, "right"); }); }
  // shelf with cups and jars
  const shY = k.Y(0.26); rr(g, k.X(0.34), shY, k.X(0.56), 16 * k.u, 6, Z.woodDk);
  for (let i = 0; i < 7; i++) { const x = k.X(0.37 + i * 0.075), c = [Z.f700, Z.amber, Z.f400, Z.terra, Z.f600, Z.amberLt, Z.f800][i]; if (i % 3 === 1) { rr(g, x - 26 * k.u, shY - 78 * k.u, 52 * k.u, 78 * k.u, 12 * k.u, c); rr(g, x - 30 * k.u, shY - 92 * k.u, 60 * k.u, 18 * k.u, 6 * k.u, Z.woodDk); } else { cup(k, x, shY - 36 * k.u, 70, c); } }
  // pendant lamps
  [0.18, 0.52, 0.86].forEach((lx, i) => { const x = k.X(lx), sw = Math.sin(k.t * 0.9 + i * 1.3) * 5 * k.u; g.strokeStyle = Z.f800; g.lineWidth = 4 * k.u; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + sw, k.Y(0.1)); g.stroke(); glowSpot(k, x + sw, k.Y(0.13), 220 * k.u, "#fff1c8", 0.5); g.fillStyle = Z.amber; g.beginPath(); g.moveTo(x + sw - 52 * k.u, k.Y(0.13)); g.quadraticCurveTo(x + sw, k.Y(0.085), x + sw + 52 * k.u, k.Y(0.13)); g.closePath(); g.fill(); circle(g, x + sw, k.Y(0.133), 14 * k.u, "#fff7da"); });
  // floor
  const gr = g.createLinearGradient(0, fy, 0, H); gr.addColorStop(0, Z.woodLt); gr.addColorStop(1, Z.wood); g.fillStyle = gr; g.fillRect(0, fy, W, H - fy);
  g.strokeStyle = "rgba(60,36,16,0.18)"; g.lineWidth = 3 * k.u; for (let i = 1; i < 6; i++) { const y = fy + (H - fy) * (i / 6) ** 1.4; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  if (o.dim) { g.fillStyle = `rgba(110,118,112,${o.dim})`; g.fillRect(0, 0, W, H); }
}
/** counter in front: panel + wood top + a few props. (x0,x1) fractions; returns the top y */
function counter(k, o) {
  const g = k.g, x0 = k.X(o.x0 ?? 0), x1 = k.X(o.x1 ?? 1), topY = k.Y(o.top ?? 0.6), botY = k.Y(o.bottom ?? 0.76), th = 30 * k.u;
  rr(g, x0, topY, x1 - x0, botY - topY, 0, Z.f800); g.fillStyle = "rgba(255,255,255,0.05)"; for (let i = 0; i < 9; i++) g.fillRect(x0 + i * (x1 - x0) / 9, topY, 5 * k.u, botY - topY);
  rr(g, x0 - 14 * k.u, topY - th, x1 - x0 + 28 * k.u, th, 10 * k.u, Z.woodLt); rr(g, x0 - 14 * k.u, topY - th, x1 - x0 + 28 * k.u, 8 * k.u, 6 * k.u, "rgba(255,255,255,0.3)");
  if (o.props !== false) { // espresso machine + cups on the counter
    const mx = x1 - 190 * k.u, my = topY - th; rr(g, mx - 120 * k.u, my - 190 * k.u, 240 * k.u, 190 * k.u, 22 * k.u, "#c5ccc8"); rr(g, mx - 120 * k.u, my - 190 * k.u, 240 * k.u, 50 * k.u, 22 * k.u, Z.f900); circle(g, mx - 50 * k.u, my - 100 * k.u, 22 * k.u, Z.f700); circle(g, mx + 50 * k.u, my - 100 * k.u, 22 * k.u, Z.f700); rr(g, mx - 30 * k.u, my - 60 * k.u, 60 * k.u, 14 * k.u, 6, Z.f900); cup(k, mx, my - 22 * k.u, 54, Z.white);
    for (let i = 0; i < 3; i++) { const t = (k.t * 0.6 + i * 0.33) % 1; g.save(); g.globalAlpha = (1 - t) * 0.5; g.strokeStyle = "#fff"; g.lineWidth = 6 * k.u; g.beginPath(); g.moveTo(mx - 40 * k.u + i * 30 * k.u, my - 110 * k.u); g.quadraticCurveTo(mx - 20 * k.u + i * 30 * k.u + Math.sin(k.t * 3 + i) * 10 * k.u, my - 150 * k.u - t * 60 * k.u, mx - 40 * k.u + i * 30 * k.u, my - 190 * k.u - t * 80 * k.u); g.stroke(); g.restore(); } }
  return topY - th;
}
/** a table (side view): top + one leg + base. (x,y) = centre of the top surface; w px */
function table(k, o) { const g = k.g, w = o.w * k.u, th = 26 * k.u; shadow(k, o.x, o.y + (o.leg || 260) * k.u, w * 0.8, 0.14); rr(g, o.x - 16 * k.u, o.y, 32 * k.u, (o.leg || 260) * k.u, 10 * k.u, Z.f700); rr(g, o.x - w * 0.22, o.y + (o.leg || 260) * k.u - 16 * k.u, w * 0.44, 18 * k.u, 9 * k.u, Z.f800); rr(g, o.x - w / 2, o.y - th, w, th, 12 * k.u, o.color || Z.woodLt); rr(g, o.x - w / 2, o.y - th, w, 8 * k.u, 8 * k.u, "rgba(255,255,255,0.3)"); return o.y - th; }
function door(k, o) { // a glass café door seen from inside; (x,y) = bottom centre; open 0..1
  const g = k.g, w = o.w * k.u, h = o.h * k.u, x = o.x - w / 2, y = o.y - h, op = clamp01(o.open || 0);
  rr(g, x - 20 * k.u, y - 20 * k.u, w + 40 * k.u, h + 20 * k.u, 22 * k.u, Z.f900);
  const gr = g.createLinearGradient(0, y, 0, o.y); gr.addColorStop(0, o.out1 || "#ffe9b0"); gr.addColorStop(1, o.out2 || "#fff6dc"); rr(g, x, y, w, h, 10 * k.u, gr);
  const sx = Math.max(0.1, 1 - 0.9 * op), fx = x + w * sx, dr = h * 0.05 * op;
  g.beginPath(); g.moveTo(x, o.y); g.lineTo(x, y); g.lineTo(fx, y + dr); g.lineTo(fx, o.y - dr); g.closePath(); g.fillStyle = "rgba(206,224,213,0.55)"; g.fill(); g.strokeStyle = Z.f800; g.lineWidth = 10 * k.u; g.stroke();
  rr(g, x + (fx - x) * 0.9, o.y - h * 0.46, 10 * k.u * sx, 90 * k.u, 5 * k.u, Z.amber);
  return { x, y, w, h };
}

/** the zavino. labs lockup (symbol + wordmark + "labs"), centred on (cx, cy) by measuring its real width. s = wordmark size px */
function zavinoLockup(k, cx, cy, s) {
  const g = k.g; s *= k.u; const sym = s * 1.2, gap = s * 0.26;
  g.save(); g.font = `800 ${s}px ${FONT}`; const w1 = g.measureText("zavino.").width; g.font = `500 ${s * 0.5}px ${FONT}`; const w2 = g.measureText(" labs").width; g.restore();
  const tw = sym + gap + w1 + w2, x0 = cx - tw / 2;
  if (IMAGES["zavino-symbol-light"]) g.drawImage(IMAGES["zavino-symbol-light"], x0, cy - sym / 2, sym, sym);
  txt(g, "zavino.", x0 + sym + gap, cy, s, Z.linen, 800, "left"); txt(g, " labs", x0 + sym + gap + w1, cy + s * 0.13, s * 0.5, Z.f300, 500, "left");
}
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
};
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
    cafe(k, { dim: 0.08, noBoard: true }); const g = k.g, t = k.t, fy = k.Y(0.745), buzz = t > 0.35 && t < 1.2 ? Math.sin(t * 70) * 5 * k.u : 0;
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
    faceAvatar(k, 0, -285 * k.u, 105 * k.u, RAFI, t > 0.7 ? "proud" : "happy"); txt(g, "Rafi", 0, -122 * k.u, 70 * k.u, Z.ink, 800);
    const st = clamp01((t - 0.35) / 0.2); if (st > 0) { const sc = lerp(3, 1, outCubic(st)); g.save(); g.translate(0, -22 * k.u); g.rotate(-0.06); g.scale(sc, sc); g.globalAlpha = Math.min(1, st * 3); rr(g, -200 * k.u, -54 * k.u, 400 * k.u, 108 * k.u, 54 * k.u, Z.amber); star(g, -130 * k.u, 0, 30 * k.u, Z.f950); txt(g, "REGULAR", 30 * k.u, 4 * k.u, 54 * k.u, Z.f950, 800); g.restore(); }
    [["5", "visits"], ["৳4,250", "spent"], ["4.8", "avg rating"]].forEach(([v, l], i) => { const a = pop(k, 0.6 + i * 0.12, 0.28), x = (i - 1) * 250 * k.u; g.save(); g.translate(x, 110 * k.u); g.scale(a, a); rr(g, -112 * k.u, -62 * k.u, 224 * k.u, 124 * k.u, 26 * k.u, Z.f50); txt(g, v, 0, -10 * k.u, 46 * k.u, Z.f800, 800); txt(g, l, 0, 38 * k.u, 26 * k.u, Z.muted, 600); g.restore(); });
    const fv = pop(k, 1.0, 0.3); g.save(); g.translate(0, 290 * k.u); g.scale(fv, fv); rr(g, -330 * k.u, -52 * k.u, 660 * k.u, 104 * k.u, 28 * k.u, Z.f50); burger(k, -260 * k.u, 6 * k.u, 70 * k.u / k.u * k.u); txt(g, "Favourite: Chicken burger", 20 * k.u, 3 * k.u, 34 * k.u, Z.ink, 700); g.restore(); g.restore();
    if (t > 0.4 && t < 1.1) sparkle(k, cx + 210 * k.u, cy - 100 * k.u, 40 * k.u * Math.sin((t - 0.4) * 4.5), Z.amber, t * 4);
  },
  // 27 — "Now she knows her regulars,"
  "usual": (k) => {
    cafe(k, { noBoard: true }); const g = k.g, t = k.t, fy = k.Y(0.745), dx = k.X(0.86);
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
    const m = pop(k, 0.85, 0.35); g.save(); g.translate(k.X(0.5), k.Y(0.1) + 960 * k.u); g.scale(m, m); rr(g, -340 * k.u, -62 * k.u, 680 * k.u, 124 * k.u, 62 * k.u, Z.f800); txt(g, "Send a nudge · 15% off", 0, 3 * k.u, 42 * k.u, Z.linen, 800); g.restore();
    if (t > 1.1) for (let i = 0; i < 3; i++) { const tt = clamp01((t - 1.1 - i * 0.1) / 0.6); g.save(); g.globalAlpha = Math.sin(tt * Math.PI); txt(g, "♥", k.X(0.5) - 120 * k.u + i * 120 * k.u, k.Y(0.1) + 880 * k.u - tt * 260 * k.u, 54 * k.u, Z.coral, 800); g.restore(); }
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
    const a3 = ease((t - 0.7) / 0.4); g.save(); g.globalAlpha = a3; zavinoLockup(k, k.X(0.5), k.Y(0.915), 76); g.restore();
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
    const a = clamp01((t - 0.7) / 0.4); g.save(); g.globalAlpha = a; g.translate(k.X(0.845), k.Y(0.4)); g.rotate(0.08); txt(g, "gone.", 0, 0, 62 * k.u, Z.f800, 800); g.restore();
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
    const n = t < 0.3 ? 0 : t < 0.65 ? 1 : t < 1.0 ? 2 : 3, shown = "৳ " + ["8", "5", "0"].slice(0, n).join("") + (n < 3 && Math.floor(t * 4) % 2 ? "_" : ""); txt(g, shown, tx + 80 * k.u, ty + 224 * k.u, 70 * k.u, Z.ink, 800, "left");
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
const AUTH = {"nila-blank": 1.19, "unhappy-sip": 1.59, "quiet-exit": 1.39, "one-star": 1.85, "labs-build": 1.87, "labs-brand": 1.32, "table-qr": 2.13, "offer-card": 2.21, "verified": 2.42, "hour-later": 1.19, "five-star": 1.96, "low-alert": 2.31, "visit-stamps": 1.42, "regular-badge": 1.51, "usual": 1.8, "spenders": 1.19, "gone-quiet": 1.39, "campaign-burger": 1.17, "campaign-eid": 0.8, "campaign-boishakh": 1.49, "approve": 2.21, "offer-result": 2.01, "monthly-report": 2.31, "end-name": 0.95, "end-card": 3.48};
// ───────────────────────────── post-processing of the scene table ─────────────────────────────
// 1) the café shots are zoomed in a little so people fill the vertical frame (less floor, bigger faces)
["crowd-count", "door-stream", "nila-blank", "lineup", "who-regular", "who-spender", "unhappy-sip", "quiet-exit", "door-close", "table-qr", "rafi-scan", "code-show", "bill-entry", "low-alert", "usual", "end-name"].forEach((n) => {
  const f = window.SCENES[n]; window.SCENES[n] = (k) => { const g = k.g; g.save(); g.translate(k.W / 2, k.Y(0.12)); g.scale(1.12, 1.12); g.translate(-k.W / 2, -k.Y(0.12)); f(k); g.restore(); };
});
// 2) scenes authored for a shorter shot (AUTH, seconds — see auth.json) play on their own progress, so a longer shot stretches the animation instead of freezing at the end
Object.keys(AUTH).forEach((n) => {
  const f = window.SCENES[n], d = AUTH[n]; if (!f) return;
  window.SCENES[n] = (k) => { const kk = Object.create(k); kk.t = k.p * d; f(kk); };
});
