// ───────────── the flight: transitions + the dispatcher ─────────────
/** the path of the ribbon sweep at boundary i (alternating rise / dip so consecutive sweeps differ) */
function sweepPath(F, i) {
  const W = F.W, H = F.H, up = i % 2 === 1, f = (pts) => spline(pts.map(([x, y]) => [x * W, y * H]));
  if (F.mode === "port") return up ? f([[-0.3, 0.8], [0.25, 0.64], [0.6, 0.5], [0.85, 0.42], [1.3, 0.26]]) : f([[-0.3, 0.3], [0.3, 0.44], [0.62, 0.56], [0.86, 0.6], [1.3, 0.72]]);
  return up ? f([[-0.2, 0.84], [0.22, 0.66], [0.5, 0.48], [0.78, 0.42], [1.2, 0.18]]) : f([[-0.2, 0.22], [0.25, 0.4], [0.52, 0.56], [0.8, 0.54], [1.2, 0.78]]);
}
/** the ribbon sweeps across the frame with the jet at its head: q 0..1 over the transition */
function sweep(k, F, q, i) {
  const mm = Math.min(F.W, F.H), P = sweepPath(F, i), bw = 0.15 * mm, L = 0.17 * mm;
  const sh = lerp(-0.15, 1.2, eio(q)), st = lerp(-0.15, 1.2, eio(clamp01((q - 0.3) / 0.7)));
  ribbon(k, P, st, sh, bw, { twist: 1.0, phase: i * 0.7, n: 110 });
  const r = onRibbon(P, sh, bw * 0.5 + L * 0.07); jet(k, r.x, r.y, r.ang, L);
}
const TW = 0.75;   // half-length of a sweep (s)
function film(k) {
  const g = k.g, F = FR(k), b = k.beat, beats = window.SHORT.beats, idx = beats.indexOf(b), t = k.t, d = b.dur, T = b.start + t;
  background(k);
  const first = idx === 0, last = idx === beats.length - 1;
  const ain = first ? 1 : ease((t - 0.02) / 0.55), aout = last ? 1 : 1 - ease((t - (d - 0.62)) / 0.45), A = Math.min(ain, aout);
  const dx = (first ? 0 : -(1 - eout((t - 0.02) / 0.7)) * 70 * F.m) + (last ? 0 : ein((t - (d - 0.62)) / 0.45) * 100 * F.m);
  const MK = MARKS[b.scene] || [0], lead = idx === 0 ? 0.35 : 0.05, ev = (i, frac) => (MK[i] !== undefined ? lead + MK[i] : frac * d);
  if (SEG[b.scene]) { g.save(); g.translate(dx, 0); SEG[b.scene](k, F, t, d, ev, A); g.restore(); }
  for (let i = 1; i < beats.length; i++) { const B = beats[i].start; if (Math.abs(T - B) < TW) sweep(k, F, (T - B + TW) / (2 * TW), i); }
}
window.SCENES = {}; Object.keys(SEG).forEach((n) => (window.SCENES[n] = film));
