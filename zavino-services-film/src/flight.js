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
