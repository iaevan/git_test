// ───────────── the zavino. symbol (the exact SVG path from the brand file, viewBox 249 252 520 520) ─────────────
const LOGO_D = "M447.5 260.6c-35.4 19.8-183.9 106.5-186.3 108.7-1.8 1.7-3.7 4.7-4.3 6.7-.6 2.3-.9 30.6-.7 82.1l.3 78.5 2.5 3.7c1.4 2.1 4.4 4.7 6.8 5.8 7.6 3.7 10.2 2.8 37.4-12.9 13.4-7.7 83.7-48.3 156.3-90.3l132-76.4h6.5c7.9 0 12.2 2.6 15.1 8.9 3.3 7.2 1.6 18.3-3.5 22.5-.9.8-79.4 46.3-174.4 101.1-135.5 78.3-173.3 100.6-175.7 103.5l-3 3.7-.2 73.1-.3 73.2 2.3 3.9c3.9 6.9 11 10.2 18.1 8.6 1.9-.4 34.7-18.8 73-40.9 38.2-22.1 71.2-40.9 73.2-41.7 7.5-3.1 1.5-6.3 90.3 48 29.3 17.9 55 33 57 33.6 2 .5 5.1.6 7.1.1 1.9-.4 23.8-12.5 48.5-26.8 24.8-14.3 64.4-37.2 88-50.8 53.2-30.7 50.1-28.7 52.5-33.5 2-3.8 2-5.6 2-80.9 0-52.1-.3-77.9-1.1-79.8-2.4-6.4-8.7-10.5-16-10.5-5.3 0 17.4-12.9-218.1 123.1-91.7 52.9-93.8 54.1-99 54.1-4.1 0-6.2-.6-9.1-2.5-4.3-3-7.7-9-7.7-13.7.1-4.6 3.2-11.1 6.6-13.5 2.6-1.8 69.3-40.4 266.9-154.3 37.4-21.6 69.4-40.3 71.1-41.6 6.7-5 6.4-1.4 6.4-83.3 0-60.4-.3-74.8-1.4-77.4-2.8-6.9-12.2-11.7-19-9.9-1.8.5-32.5 17.8-68.2 38.4s-66.8 38.5-69.1 39.7c-5.4 2.7-9.9 2.7-15.4-.2-2.4-1.3-33.4-20-68.9-41.7-62.1-38-64.6-39.4-70-39.7-3.8-.2-6.4.2-8.5 1.3";
const LOGO_VB = { x: 249, y: 252, w: 520, h: 520 };
let _logoP2D = null;
/** draw the symbol (2D) centred on (cx, cy); size = px for the 520-unit box. fill = colour or gradient */
function drawLogo(g, cx, cy, size, fill) {
  if (!_logoP2D) _logoP2D = new Path2D(LOGO_D);
  g.save(); g.translate(cx, cy); const s = size / LOGO_VB.w; g.scale(s, s); g.translate(-(LOGO_VB.x + LOGO_VB.w / 2), -(LOGO_VB.y + LOGO_VB.h / 2));
  g.fillStyle = fill || "#163524"; g.fill(_logoP2D); g.restore();
}
/** the path as absolute segments: [["M",x,y],["C",x1,y1,x2,y2,x,y],["L",x,y]] (supports M c l h v s — all the symbol uses) */
function parseLogo(d) {
  const tok = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e-?\d+)?/g); let i = 0, cx = 0, cy = 0, lx = 0, ly = 0, cmd = "", out = [];
  const num = () => parseFloat(tok[i++]);
  while (i < tok.length) {
    if (/[a-zA-Z]/.test(tok[i])) cmd = tok[i++];
    const rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase();
    if (C === "M") { let x = num(), y = num(); if (rel) { x += cx; y += cy; } out.push(["M", x, y]); cx = x; cy = y; cmd = rel ? "l" : "L"; lx = cx; ly = cy; }
    else if (C === "L") { let x = num(), y = num(); if (rel) { x += cx; y += cy; } out.push(["L", x, y]); cx = x; cy = y; lx = cx; ly = cy; }
    else if (C === "H") { let x = num(); if (rel) x += cx; out.push(["L", x, cy]); cx = x; }
    else if (C === "V") { let y = num(); if (rel) y += cy; out.push(["L", cx, y]); cy = y; }
    else if (C === "C") { let a = [num(), num(), num(), num(), num(), num()]; if (rel) a = a.map((v, j) => v + (j % 2 ? cy : cx)); out.push(["C", ...a]); lx = a[2]; ly = a[3]; cx = a[4]; cy = a[5]; }
    else if (C === "S") { let a = [num(), num(), num(), num()]; if (rel) a = a.map((v, j) => v + (j % 2 ? cy : cx)); const x1 = 2 * cx - lx, y1 = 2 * cy - ly; out.push(["C", x1, y1, a[0], a[1], a[2], a[3]]); lx = a[0]; ly = a[1]; cx = a[2]; cy = a[3]; }
    else { i++; }
  }
  return out;
}
