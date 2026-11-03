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
