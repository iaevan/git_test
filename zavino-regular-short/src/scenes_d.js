// ───────────────────────────── scenes, part D: the story beats of the new script ─────────────────────────────
// Absolute seconds, written for shots of about 1.5–3 s. The regulars Nila used to know: Hasan, Sumi, Arif.
const OLD_REGULARS = [{ c: 9, name: "Hasan", order: "black coffee" }, { c: 6, name: "Sumi", order: "iced latte" }, { c: 0, name: "Arif", order: "2 sugars" }];

/** the early days: three regulars at the counter and Nila knowing their names (phase "names") and their orders (phase "orders") */
function earlyDays(k, phase) {
  cafe(k, { noBoard: true }); const g = k.g, t = k.t, fy = k.Y(0.785);
  person(k, { x: k.X(0.2), y: k.Y(0.69), h: 600, ...NILA, mood: "happy", arms: "wave", look: [0.8, 0.1] });
  counter(k, { x0: -0.05, x1: 1.05, top: 0.62, bottom: 0.745, props: false });
  OLD_REGULARS.forEach((p, i) => {
    const x = k.X(0.4 + i * 0.205), pp = person(k, { ...CROWD[p.c], x, y: fy, h: 540, mood: "happy", ph: i, look: [-0.5, 0.2], sq: 1 + Math.sin(t * 2 + i) * 0.005 });
    shadow(k, x, fy + 4 * k.u, 240 * k.u, 0.1);
    const a = phase === "names" ? pop(k, 0.25 + i * 0.3, 0.3) : 1;
    if (a > 0.01) { g.save(); g.translate(x, pp.top - 62 * k.u); g.scale(a, a); rr(g, -125 * k.u, -38 * k.u, 250 * k.u, 76 * k.u, 38 * k.u, Z.white, Z.amber, 4 * k.u); txt(g, p.name, 0, 3 * k.u, 40 * k.u, Z.f800, 800); g.restore(); }
    if (phase === "orders") { const b = pop(k, 0.25 + i * 0.32, 0.3); if (b > 0.01) { g.save(); g.translate(x, pp.top - 150 * k.u); g.scale(b, b); card(k, { x: -110 * k.u, y: -36 * k.u, w: 220 * k.u, h: 72 * k.u, r: 36 * k.u, fill: Z.f900 }); txt(g, p.order, 0, 3 * k.u, 28 * k.u, Z.amberLt, 700); g.restore(); } }
  });
}

Object.assign(window.SCENES, {
  // 1a — "When Nila opened Café 27,"
  "open-sign": (k) => {
    cafe(k, { noBoard: true }); const g = k.g, t = k.t, dx = k.X(0.66), dy = k.Y(0.7);
    glowSpot(k, dx, k.Y(0.5), 800 * k.u, "#ffd98a", 0.42 * ease(t / 0.8));
    door(k, { x: dx, y: dy, w: 300, h: 640, open: t > 1.35 ? ease((t - 1.35) / 0.3) * 0.9 : 0, out1: "#ffe2a0", out2: "#fff3d2" });
    // the sign on the door flips from CLOSED to OPEN
    const p = clamp01((t - 0.55) / 0.35), sc = Math.max(0.03, Math.abs(Math.cos(p * Math.PI))), isOpen = p >= 0.5;
    g.save(); g.translate(dx, dy - 470 * k.u); g.strokeStyle = Z.f800; g.lineWidth = 4 * k.u; g.beginPath(); g.moveTo(-44 * k.u, -64 * k.u); g.lineTo(0, 0); g.lineTo(44 * k.u, -64 * k.u); g.stroke();
    g.scale(sc, 1); rr(g, -105 * k.u, 0, 210 * k.u, 86 * k.u, 18 * k.u, isOpen ? Z.chat : Z.coral); txt(g, isOpen ? "OPEN" : "CLOSED", 0, 45 * k.u, 40 * k.u, "#fff", 800); g.restore();
    person(k, { x: k.X(0.27), y: k.Y(0.715), h: 640, ...NILA, mood: "happy", arms: t < 0.9 ? "point" : "wave", look: [0.9, -0.1] });
    if (t > 1.35) { const q = clamp01((t - 1.35) / 0.7), e = ease(q); person(k, { ...CROWD[9], x: lerp(dx, k.X(0.52), e), y: lerp(dy, k.Y(0.75), e), h: lerp(380, 540, e), mood: "happy", walk: q < 1 ? 2 : 0, alpha: clamp01((t - 1.35) / 0.15) }); }
    speech(k, { x: k.X(0.3), y: k.Y(0.2), text: "Morning, Hasan!", w: 560, h: 116, t0: 1.55, tailX: -0.1 });
    const ring = t > 1.35 ? Math.sin((t - 1.35) * 22) * Math.max(0, 1 - (t - 1.35) * 1.2) * 0.5 : 0; bell(k, dx + 130 * k.u, dy - 690 * k.u, 62, ring);
  },
  // 1b / 1c — "she knew everyone." · "Every name. Every order."
  "early-names": (k) => earlyDays(k, "names"),
  "early-orders": (k) => earlyDays(k, "orders"),
  // 5 — "Growing shouldn't mean forgetting."
  "nila-closing": (k) => {
    cafe(k, { noBoard: true }); const g = k.g, t = k.t; g.fillStyle = "rgba(10,28,20,0.52)"; g.fillRect(0, 0, k.W, k.H);   // after hours
    person(k, { x: k.X(0.5), y: k.Y(0.745), h: 780, ...NILA, mood: "sad", arms: "hold", look: [0, 0.8], sq: 1 + Math.sin(t * 1.4) * 0.004 });
    counter(k, { x0: -0.05, x1: 1.05, top: 0.67, bottom: 0.8, props: false });
    glowSpot(k, k.X(0.5), k.Y(0.575), 240 * k.u, "#ffffff", 0.35);
    const cx = k.X(0.5), cy = k.Y(0.2), fade = 1 - 0.65 * ease((t - 2.1) / 0.9);
    [[cx + 40 * k.u, k.Y(0.355), 16, 0.1], [cx + 20 * k.u, k.Y(0.32), 26, 0.2], [cx, k.Y(0.283), 38, 0.3]].forEach(([x, y, r, t0]) => { const s = pop(k, t0, 0.25); circle(g, x, y, r * k.u * Math.max(0, s), "rgba(253,253,252,0.9)"); });
    const cp = pop(k, 0.35, 0.4); g.save(); g.translate(cx, cy); g.scale(cp, cp); g.fillStyle = "rgba(253,253,252,0.94)"; rr(g, -340 * k.u, -120 * k.u, 680 * k.u, 240 * k.u, 120 * k.u, "rgba(253,253,252,0.94)"); circle(g, -230 * k.u, -110 * k.u, 70 * k.u, "rgba(253,253,252,0.94)"); circle(g, 20 * k.u, -140 * k.u, 90 * k.u, "rgba(253,253,252,0.94)"); circle(g, 240 * k.u, -105 * k.u, 66 * k.u, "rgba(253,253,252,0.94)"); g.restore();
    OLD_REGULARS.forEach((p, i) => { const fa = pop(k, 0.6 + i * 0.45, 0.3); if (fa <= 0.01) return; const fx = cx + (i - 1) * 215 * k.u; g.save(); g.globalAlpha = Math.min(1, fa) * fade; g.translate(fx, cy); g.scale(fa, fa); g.translate(-fx, -cy); faceAvatar(k, fx, cy - 12 * k.u, 66 * k.u, { ...CROWD[p.c], bg: Z.f100 }, "happy"); txt(g, p.name, fx, cy + 82 * k.u, 28 * k.u, Z.f800, 800); g.restore(); });
  },
  // 10c — "in time to make it right."
  "make-it-right": (k) => {
    cafe(k, { noBoard: true }); const g = k.g, t = k.t, fy = k.Y(0.73);
    chairBack(k, k.X(0.3), fy, 260 * k.u, 520 * k.u);
    person(k, { x: k.X(0.3), y: fy, h: 740, ...TANIA, mood: t > 1.05 ? "happy" : "sad", arms: "hold", look: [0.6, 0.4] });
    tableCloth(k, k.X(0.3), k.Y(0.575), 540 * k.u, fy);
    const nx = lerp(k.X(1.15), k.X(0.75), outCubic(t / 0.65));
    person(k, { x: nx, y: fy, h: 700, ...NILA, mood: "happy", arms: "point", flip: true, walk: t < 0.65 ? 2 : 0 });
    const q = ease((t - 0.6) / 0.4), cx = lerp(nx - 380 * k.u, k.X(0.3) + 170 * k.u, q), cy = lerp(k.Y(0.5), k.Y(0.575) - 26 * k.u, q) - 55 * k.u;
    cup(k, cx, cy, 130, Z.terra);
    if (q >= 1) for (let i = 0; i < 3; i++) { const tt = (t * 0.7 + i * 0.3) % 1; g.save(); g.globalAlpha = (1 - tt) * 0.6; g.strokeStyle = "#fff"; g.lineWidth = 6 * k.u; g.beginPath(); g.moveTo(cx - 20 * k.u + i * 20 * k.u, cy - 70 * k.u); g.quadraticCurveTo(cx + i * 20 * k.u + Math.sin(t * 4 + i) * 8 * k.u, cy - 110 * k.u - tt * 50 * k.u, cx - 20 * k.u + i * 20 * k.u, cy - 150 * k.u - tt * 70 * k.u); g.stroke(); g.restore(); }
    speech(k, { x: k.X(0.58), y: k.Y(0.2), text: "A fresh one. On me.", w: 600, h: 118, t0: 0.5, tailX: 0.3 });
    if (t > 1.2) for (let i = 0; i < 4; i++) { const tt = ((t - 1.2) * 0.9 + i * 0.25) % 1; g.save(); g.globalAlpha = Math.sin(tt * Math.PI); txt(g, "♥", k.X(0.3) - 70 * k.u + i * 50 * k.u, k.Y(0.33) - tt * 140 * k.u, 44 * k.u, Z.coral, 800); g.restore(); }
  },
  // 12a — "And one morning…"
  "morning-door": (k) => {
    cafe(k, { noBoard: true }); const g = k.g, t = k.t, dx = k.X(0.76), dy = k.Y(0.7);
    glowSpot(k, dx, k.Y(0.5), 900 * k.u, "#ffd98a", 0.5);
    door(k, { x: dx, y: dy, w: 300, h: 640, open: ease(t / 0.25) * 0.95, out1: "#ffe2a0", out2: "#fff3d2" });
    const ring = Math.sin(t * 22) * Math.max(0, 1 - t * 0.8) * 0.55; bell(k, dx + 130 * k.u, dy - 690 * k.u, 62, ring);
    person(k, { x: k.X(0.2), y: k.Y(0.69), h: 620, ...NILA, mood: "happy", arms: "wipe", look: [1, 0] });
    counter(k, { x0: -0.05, x1: 0.46, top: 0.62, bottom: 0.745, props: false });
    const q = ease(clamp01((t - 0.25) / 0.9)), rx = lerp(dx, k.X(0.6), q);
    person(k, { ...RAFI, x: rx, y: lerp(dy, k.Y(0.765), q), h: lerp(380, 620, q), mood: "happy", walk: q < 1 ? 2 : 0, arms: q >= 1 ? "wave" : "down", alpha: clamp01((t - 0.25) / 0.12) });
    const b = pop(k, 0.6, 0.3); g.save(); g.translate(k.X(0.5), k.Y(0.12)); g.scale(b, b); pill(g, -170 * k.u, -42 * k.u, 340 * k.u, 84 * k.u, Z.amber, "visit #5", Z.f950, 40 * k.u, 800); g.restore();
  },
  // 12b — "The usual, Rafi?"
  "usual": (k) => {
    cafe(k, { noBoard: true }); const g = k.g, t = k.t, fy = k.Y(0.765);
    person(k, { x: k.X(0.26), y: k.Y(0.7), h: 700, ...NILA, mood: "happy", arms: "wave", look: [0.9, 0] });
    counter(k, { x0: -0.05, x1: 0.52, top: 0.63, bottom: 0.745, props: false });
    person(k, { ...RAFI, x: k.X(0.68), y: fy, h: 700, mood: t > 0.55 ? "wow" : "happy", arms: "down", look: [-0.9, 0] });
    speech(k, { x: k.X(0.48), y: k.Y(0.2), text: "The usual, Rafi?", w: 760, h: 140, t0: 0.15, tailX: -0.3 });
  },
  // 12c — "Oh! You remembered!"
  "remembered": (k) => {
    cafe(k, { noBoard: true }); const g = k.g, t = k.t, fy = k.Y(0.77);
    person(k, { x: k.X(0.2), y: k.Y(0.71), h: 560, ...NILA, mood: "proud", arms: "down", look: [0.9, 0] });
    counter(k, { x0: -0.05, x1: 0.42, top: 0.64, bottom: 0.745, props: false });
    const rp = person(k, { ...RAFI, x: k.X(0.62), y: fy, h: 820, mood: "proud", arms: "up", sq: 1 + Math.sin(t * 6) * 0.008 });
    speech(k, { x: k.X(0.5), y: k.Y(0.17), text: "You remembered!", w: 760, h: 140, t0: 0.12, tailX: 0.18 });
    const tg = pop(k, 0.5, 0.3); g.save(); g.translate(k.X(0.62), rp.top - 50 * k.u); g.scale(tg, tg); pill(g, -150 * k.u, -40 * k.u, 300 * k.u, 80 * k.u, Z.amber, "Regular", Z.f950, 38 * k.u, 800); g.restore();
    for (let i = 0; i < 7; i++) { const tt = ((t - 0.2) * 0.8 + i * 0.15) % 1; if (t < 0.2) break; g.save(); g.globalAlpha = Math.sin(tt * Math.PI); txt(g, "♥", k.X(0.62) - 220 * k.u + i * 75 * k.u, rp.top + 150 * k.u - tt * 260 * k.u, 46 * k.u, Z.coral, 800); g.restore(); }
    confetti(k, 26, 0.45, 0.25);
  },
  // 13a — "Now she sees who's coming back,"
  "regulars": (k) => { soft(k); previewTag(k); dash(k, 0, k.X(0.5) - 440 * k.u, k.Y(0.1), 880 * k.u, 860 * k.u, k.t); },
});
