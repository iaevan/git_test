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
 * mood: happy | neutral | sad | angry | wow | proud | worried | sleepy      ghost:true → faceless silhouette (ghostColor)
 * hair: bun | short | cap | bob | none     apron: colour     hood: true     arms: down | wave | up | hold | think | cross | point
 */
function person(k, o) {
  const g = k.g, mood = o.mood || "happy", ghost = !!o.ghost, H = (o.h || 520) * k.u, S = H / 0.92, tt = k.t + (o.ph || 0);
  const skin = ghost ? (o.ghostColor || Z.sand2) : (o.skin || "#c68a62"), hairC = o.hairC || "#2b1d17", top = ghost ? (o.ghostColor || Z.sand2) : (o.top || Z.sand2), pants = ghost ? k.mix(o.ghostColor || Z.sand2, "#000000", 0.18) : (o.pants || Z.f800), shoe = "#1c211e";
  const W = S * 0.27, R = S * 0.2, legH = S * 0.2, torsoH = S * 0.36, B = -legH, T = B - torsoH, hy = T - R * 0.78;
  const ph = o.walk ? tt * o.walk * Math.PI * 2 : 0, bounce = o.walk ? Math.abs(Math.sin(ph)) * S * 0.018 : 0;
  g.save(); g.translate(o.x, o.y - bounce); if (o.flip) g.scale(-1, 1); if (o.rot) g.rotate(o.rot); if (o.sq) g.scale(1 / Math.sqrt(o.sq), o.sq); if (o.alpha !== undefined) g.globalAlpha = o.alpha;
  const shake = o.shake ? Math.sin(tt * 55) * S * 0.008 : 0; g.translate(shake, 0);
  // legs
  [-1, 1].forEach((d) => { const lift = o.walk ? Math.max(0, Math.sin(ph + (d > 0 ? Math.PI : 0))) * S * 0.07 : 0, lx = d * W * 0.45;
    rr(g, lx - S * 0.055, B - S * 0.02, S * 0.11, legH + S * 0.02 - lift, S * 0.05, pants); g.fillStyle = shoe; g.beginPath(); g.ellipse(lx + d * S * 0.02, -lift, S * 0.075, S * 0.04, 0, 0, 7); g.fill(); });
  // arms: angle 0 = hanging, 90 = out to the side, 180 = straight up; or a target point (px, figure coordinates)
  const shY = T + torsoH * 0.2, armLen = S * 0.27, A = o.arms || "down", sw = Math.sin(tt * 9);
  const polar = (side, deg) => { const a = deg * Math.PI / 180; return [side * (W * 0.92 + Math.sin(a) * armLen), shY + Math.cos(a) * armLen]; };
  const tgt = { L: null, R: null };
  if (A === "down") { const s2 = o.walk ? Math.sin(ph) * 22 : 0; tgt.L = polar(-1, 10 + s2); tgt.R = polar(1, 10 - s2); }
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
  // hood (behind the head)
  if (o.hood && !ghost) { g.fillStyle = k.mix(top, "#000", 0.1); g.beginPath(); g.ellipse(0, T + S * 0.02, W * 1.05, S * 0.14, 0, 0, 7); g.fill(); }
  // torso
  g.save(); g.shadowColor = "rgba(13,34,23,0.12)"; g.shadowBlur = S * 0.03; g.shadowOffsetY = S * 0.012; rr(g, -W, T, W * 2, torsoH, W * 0.6, top); g.restore();
  if (o.apron && !ghost) { rr(g, -W * 0.8, T + torsoH * 0.3, W * 1.6, torsoH * 0.72, W * 0.4, o.apron); rr(g, -W * 0.52, T + torsoH * 0.1, W * 1.04, torsoH * 0.34, W * 0.14, o.apron);
    g.strokeStyle = o.apron; g.lineWidth = S * 0.03; g.lineCap = "round"; g.beginPath(); g.moveTo(-W * 0.42, T + torsoH * 0.14); g.lineTo(-W * 0.62, T + S * 0.01); g.moveTo(W * 0.42, T + torsoH * 0.14); g.lineTo(W * 0.62, T + S * 0.01); g.stroke();
    rr(g, -W * 0.38, T + torsoH * 0.6, W * 0.76, torsoH * 0.22, W * 0.1, "rgba(255,255,255,0.18)"); }
  if (o.hood && !ghost) { rr(g, -W * 0.5, T + torsoH * 0.62, W * 1.0, torsoH * 0.26, W * 0.16, "rgba(0,0,0,0.12)"); g.strokeStyle = Z.linen; g.lineWidth = S * 0.012; g.beginPath(); g.moveTo(-W * 0.16, T + S * 0.01); g.lineTo(-W * 0.16, T + torsoH * 0.34); g.moveTo(W * 0.16, T + S * 0.01); g.lineTo(W * 0.16, T + torsoH * 0.34); g.stroke(); }
  if (front) { drawArm(-1); drawArm(1); }
  // hair at the back
  if (!ghost && (o.hair === "bun")) circle(g, 0, hy - R * 0.98, R * 0.34, hairC);
  if (!ghost && (o.hair === "bob")) rr(g, -R * 1.12, hy - R * 0.7, R * 2.24, R * 1.9, R * 0.8, hairC);
  // head
  [-1, 1].forEach((d) => circle(g, d * R * 0.98, hy + R * 0.12, R * 0.17, skin)); circle(g, 0, hy, R, skin);
  if (!ghost) {
    const hc = hairC;
    if (o.hair === "bun" || o.hair === "bob" || o.hair === "short") {
      g.fillStyle = hc; g.beginPath(); g.arc(0, hy, R * 1.04, Math.PI * 1.04, Math.PI * 1.96); g.quadraticCurveTo(R * 0.7, hy - R * 0.52, R * 0.1, hy - R * 0.42); g.quadraticCurveTo(-R * 0.55, hy - R * 0.36, -R * 1.0, hy - R * 0.1); g.closePath(); g.fill();
    } else if (o.hair === "cap") {
      g.fillStyle = hc; g.beginPath(); g.arc(0, hy, R * 1.02, Math.PI * 1.0, Math.PI * 2); g.lineTo(R * 1.0, hy - R * 0.2); g.lineTo(-R * 1.0, hy - R * 0.2); g.closePath(); g.fill();
      const cc = o.capC || Z.terra; g.fillStyle = cc; g.beginPath(); g.arc(0, hy - R * 0.1, R * 1.06, Math.PI * 1.02, Math.PI * 1.98); g.closePath(); g.fill();
      g.beginPath(); g.ellipse(R * 0.18, hy - R * 0.14, R * 1.14, R * 0.2, 0, 0, 7); g.fillStyle = k.mix(cc, "#000", 0.18); g.fill();
    }
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
    g.strokeStyle = INK; g.lineWidth = R * 0.07; g.lineCap = "round";
    // tilt > 0 : inner end up (sad / worried) ; tilt < 0 : inner end down (angry)
    const browT = (side, tilt, lift) => { const x = side * ex, y = by - (lift || 0) * R; g.beginPath(); g.moveTo(x + side * R * 0.2, y + tilt * R * 0.16); g.lineTo(x - side * R * 0.2, y - tilt * R * 0.16); g.stroke(); };
    if (mood === "sad" || mood === "worried") { browT(-1, 0.9, 0.04); browT(1, 0.9, 0.04); } else if (mood === "angry") { browT(-1, -0.9, 0); browT(1, -0.9, 0); } else if (mood === "wow") { browT(-1, 0, 0.25); browT(1, 0, 0.25); } else if (mood === "neutral") { browT(-1, 0, 0); browT(1, 0, 0); } else if (mood === "sleepy") { browT(-1, 0.3, -0.06); browT(1, 0.3, -0.06); }
    const my = hy + R * 0.54; g.lineWidth = R * 0.075;
    if (mood === "happy") { g.beginPath(); g.arc(0, my - R * 0.14, R * 0.27, Math.PI * 0.14, Math.PI * 0.86); g.stroke(); }
    else if (mood === "proud") { g.fillStyle = INK; g.beginPath(); g.moveTo(-R * 0.3, my - R * 0.12); g.quadraticCurveTo(0, my + R * 0.5, R * 0.3, my - R * 0.12); g.closePath(); g.fill(); g.fillStyle = Z.coral; g.beginPath(); g.ellipse(0, my + R * 0.13, R * 0.14, R * 0.07, 0, 0, 7); g.fill(); }
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
  const bandY = k.Y(0.46), bandH = fy - bandY; g.fillStyle = Z.f200; g.fillRect(0, bandY, W, bandH);
  g.strokeStyle = "rgba(22,53,36,0.1)"; g.lineWidth = 3 * k.u; for (let i = 0; i < 12; i++) { g.beginPath(); g.moveTo(i * W / 11, bandY); g.lineTo(i * W / 11, fy); g.stroke(); } for (let j = 1; j < 5; j++) { g.beginPath(); g.moveTo(0, bandY + j * bandH / 5); g.lineTo(W, bandY + j * bandH / 5); g.stroke(); }
  rr(g, -20, bandY - 14 * k.u, W + 40, 18 * k.u, 6, Z.woodDk);
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
  rr(g, x + (fx - x) * 0.72, o.y - h * 0.48, 10 * k.u * sx, 90 * k.u, 5 * k.u, Z.amber);
  return { x, y, w, h };
}
