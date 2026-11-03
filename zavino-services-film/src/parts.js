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
