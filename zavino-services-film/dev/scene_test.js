// dev scenes: check the 3D layer (ribbon, jet, plinth, logo) in the skill's page
function bg(k) { const g = k.g; const gr = g.createLinearGradient(0, 0, 0, k.H); gr.addColorStop(0, "#ebe4d3"); gr.addColorStop(1, "#E1D7C1"); g.fillStyle = gr; g.fillRect(0, 0, k.W, k.H); }
window.SCENES = {
  t1(k) { bg(k); const T = k.t; H3.begin(k, T);
    H3.plinth(0, 0.17, 0.84, 0.3, 0.12, 0, 0.22);
    const pts = [[0.08, 0.76, 0], [0.26, 0.74, 0.3], [0.44, 0.56, 0.9], [0.6, 0.42, 0.2], [0.78, 0.52, -0.6], [0.95, 0.3, 0.2], [1.12, 0.16, 0.8]];
    const u = Math.min(1, T / 2.2); H3.ribbon(0, { pts, s0: 0, s1: 0.2 + 0.8 * u, width: 0.11, twist: 0.22, phase: 0.0, curl: true });
    H3.jetOn(0, { f: 0.15 + 0.7 * u * u, lift: 0.045, size: 0.2, pitch: 0 });
    H3.draw(k.g, k.W, k.H); },
  t2(k) { bg(k); H3.begin(k, k.t); H3.jetAt(0.5, 0.5, 0, { size: 0.5, yaw: -0.5, roll: 0.35, pitch: 0.1 }); H3.draw(k.g, k.W, k.H); },
};
