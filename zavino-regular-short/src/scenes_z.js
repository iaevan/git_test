// ───────────────────────────── post-processing of the scene table ─────────────────────────────
// 1) the café shots are zoomed in a little so people fill the vertical frame (less floor, bigger faces)
["open-sign", "early-names", "early-orders", "crowd-count", "lineup", "nila-blank", "unhappy-sip", "quiet-exit", "door-close", "nila-closing", "table-qr", "rafi-scan", "code-show", "bill-entry", "low-alert", "make-it-right", "morning-door", "usual", "remembered", "end-name"].forEach((n) => {
  const f = window.SCENES[n]; if (!f) return; window.SCENES[n] = (k) => { const g = k.g; g.save(); g.translate(k.W / 2, k.Y(0.12)); g.scale(1.12, 1.12); g.translate(-k.W / 2, -k.Y(0.12)); f(k); g.restore(); };
});
// 2) scenes authored for a shorter shot (AUTH, seconds — see auth.json) play on their own progress, so a longer shot stretches the animation instead of freezing at the end
Object.keys(AUTH).forEach((n) => {
  const f = window.SCENES[n], d = AUTH[n]; if (!f) return;
  window.SCENES[n] = (k) => { const kk = Object.create(k); kk.t = k.p * d; f(kk); };
});
