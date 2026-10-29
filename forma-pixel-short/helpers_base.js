// Forma — "No upload. One input." · every shot drawn in code (Shorts Animator kit + a few Forma props).
// Portrait 1080×1920. Positions are fractions of the frame; sizes are px at 1920 tall (scaled by k.u).
// Pain scenes: cluttered, warm-grey, red/yellow.  Forma scenes: clean, indigo / cream / sky.

const P = {
  indigo: "#3448ed", indigo2: "#6b7afa", lav: "#c9cfff", mist: "#e9ecff", ink: "#1b2030", paper: "#fbf7ee", cream: "#f4ead7",
  warm: "#f3d9b5", wood: "#b98b5e", woodDark: "#8a6240", red: "#e5484d", redDeep: "#b3262c", yellow: "#f7c948", orange: "#f2884b",
  green: "#3fae6b", mint: "#bfe8cf", night: "#12152e", night2: "#222a5a", grey: "#8b90a0", greyLight: "#d9dce6", steel: "#59627a", white: "#ffffff",
  sky: "#bcd6ff", skyTop: "#8fb4f5",
};
const FONT = '"Inter","Helvetica Neue",Helvetica,Arial,sans-serif';

// ───────────────────────────── drawing helpers ─────────────────────────────
function rr(g, x, y, w, h, r, fill, stroke, lw) {
  g.beginPath(); g.roundRect(x, y, w, h, r);
  if (fill) { g.fillStyle = fill; g.fill(); }
  if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw || 6; g.stroke(); }
}
function circle(g, x, y, r, fill) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = fill; g.fill(); }
function txt(g, s, x, y, size, color, weight, align) {
  g.font = `${weight || 700} ${size}px ${FONT}`; g.fillStyle = color; g.textAlign = align || "center"; g.textBaseline = "middle"; g.fillText(s, x, y);
}
const bob = (k, a, f, ph) => Math.sin(k.t * (f || 2) + (ph || 0)) * a * k.u;
const ease = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const ext = { PNG: "#3448ed", JPG: "#f2884b", WEBP: "#3fae6b", PDF: "#e5484d", GIF: "#a05be0", MP4: "#e0457b", MP3: "#1ba5b8", DOCX: "#2f6fe0", HEIC: "#c46a1a", SVG: "#d9a300", TIFF: "#7a5af8", AVIF: "#14a37f" };

/** a Forma file card: white sheet, folded corner, coloured label. (x,y) = centre, s = width in px */
function fileCard(k, o) {
  const g = k.g, s = (o.s || 200) * k.u, h = s * 1.28, label = o.label || "PNG", col = o.color || ext[label] || P.indigo;
  g.save(); g.translate(o.x, o.y); g.rotate(o.rot || 0); if (o.scale) g.scale(o.scale, o.scale);
  g.shadowColor = "rgba(30,36,70,0.28)"; g.shadowBlur = s * 0.12; g.shadowOffsetY = s * 0.06;
  g.beginPath(); g.roundRect(-s / 2, -h / 2, s, h, s * 0.1); g.fillStyle = o.paper || P.white; g.fill();
  g.shadowColor = "transparent";
  g.beginPath(); g.moveTo(s / 2 - s * 0.26, -h / 2); g.lineTo(s / 2, -h / 2 + s * 0.26); g.lineTo(s / 2 - s * 0.26, -h / 2 + s * 0.26); g.closePath(); g.fillStyle = P.greyLight; g.fill();
  if (o.photo) { // a little landscape
    rr(g, -s * 0.36, -h * 0.3, s * 0.72, h * 0.4, s * 0.05, "#a8c8ff");
    g.beginPath(); g.moveTo(-s * 0.36, h * 0.1); g.lineTo(-s * 0.1, -h * 0.12); g.lineTo(s * 0.1, h * 0.04); g.lineTo(s * 0.24, -h * 0.06); g.lineTo(s * 0.36, h * 0.1); g.closePath(); g.fillStyle = "#3b7a5a"; g.fill();
    circle(g, s * 0.2, -h * 0.2, s * 0.06, P.yellow);
  } else { for (let i = 0; i < 3; i++) rr(g, -s * 0.32, -h * 0.28 + i * h * 0.12, s * (0.64 - i * 0.14), h * 0.045, h * 0.02, P.greyLight); }
  rr(g, -s * 0.38, h * 0.2, s * 0.76, h * 0.2, s * 0.06, col);
  txt(g, label, 0, h * 0.3, s * (label.length > 3 ? 0.2 : 0.25), "#fff", 800);
  g.restore();
}
/** the Forma mark (three leaning bars). (x,y) = centre; s = size in px */
function mark(k, o) {
  const g = k.g, s = o.s * k.u, c = o.colors || [P.indigo, P.indigo2, "#b8c0ff"];
  g.save(); g.translate(o.x, o.y); g.rotate((o.rot ?? -10) * Math.PI / 180); g.translate(-s / 2, -s * 1.036 / 2);
  const bars = [[0.071, 0.179, 0.821], [0.357, 0.071, 0.643], [0.643, 0, 0.393]];
  bars.forEach(([l, t, h], i) => rr(g, l * s, t * s, 0.393 * s, h * s * (o.grow === undefined ? 1 : clamp01(o.grow * 3 - i * 0.6)), 0.143 * s, c[i]));
  g.restore();
}
function laptop(k, o) { // front view. (x,y) = centre of the screen; w = screen width px. returns the screen rect
  const g = k.g, w = o.w * k.u, h = w * 0.64, x = o.x - w / 2, y = o.y - h / 2;
  g.save(); g.shadowColor = "rgba(20,24,50,0.35)"; g.shadowBlur = w * 0.05; g.shadowOffsetY = w * 0.03;
  rr(g, x - w * 0.03, y - w * 0.03, w * 1.06, h + w * 0.06, w * 0.045, o.shell || "#2a2f45"); g.restore();
  rr(g, x, y, w, h, w * 0.02, o.bg || P.paper);
  // base
  g.beginPath(); g.moveTo(x - w * 0.12, y + h + w * 0.03); g.lineTo(x + w * 1.12, y + h + w * 0.03); g.lineTo(x + w * 1.07, y + h + w * 0.1); g.lineTo(x - w * 0.07, y + h + w * 0.1); g.closePath(); g.fillStyle = o.base || "#c9cdda"; g.fill();
  if (o.glow) { const gr = g.createRadialGradient(o.x, o.y, w * 0.1, o.x, o.y, w * 1.2); gr.addColorStop(0, o.glow); gr.addColorStop(1, "rgba(0,0,0,0)"); g.save(); g.globalCompositeOperation = "lighter"; g.fillStyle = gr; g.fillRect(o.x - w * 1.3, o.y - w * 1.3, w * 2.6, w * 2.6); g.restore(); }
  return { x, y, w, h };
}
function phone(k, o) { // front view. (x,y) = centre; h = height px
  const g = k.g, h = o.h * k.u, w = h * 0.5, x = o.x - w / 2, y = o.y - h / 2;
  g.save(); g.shadowColor = "rgba(20,24,50,0.4)"; g.shadowBlur = h * 0.05; g.shadowOffsetY = h * 0.03;
  rr(g, x, y, w, h, w * 0.18, o.shell || "#23283d"); g.restore();
  rr(g, x + w * 0.04, y + w * 0.04, w * 0.92, h - w * 0.08, w * 0.15, o.bg || P.paper);
  rr(g, o.x - w * 0.14, y + w * 0.075, w * 0.28, w * 0.05, w * 0.03, "#23283d");
  return { x: x + w * 0.04, y: y + w * 0.04, w: w * 0.92, h: h - w * 0.08 };
}
function browser(k, o) { // (x,y) = centre; w,h px
  const g = k.g, w = o.w * k.u, h = o.h * k.u, x = o.x - w / 2, y = o.y - h / 2, bar = w * 0.085;
  g.save(); g.shadowColor = "rgba(20,24,50,0.32)"; g.shadowBlur = w * 0.04; g.shadowOffsetY = w * 0.025;
  rr(g, x, y, w, h, w * 0.025, o.bg || P.white); g.restore();
  g.save(); g.beginPath(); g.roundRect(x, y, w, h, w * 0.025); g.clip();
  g.fillStyle = o.barColor || "#dfe2ee"; g.fillRect(x, y, w, bar);
  [0, 1, 2].forEach((i) => circle(g, x + bar * (0.55 + i * 0.5), y + bar / 2, bar * 0.14, ["#e5484d", "#f7c948", "#3fae6b"][i]));
  rr(g, x + bar * 2.3, y + bar * 0.2, w - bar * 2.7, bar * 0.6, bar * 0.3, P.white);
  if (o.url) txt(g, o.url, x + bar * 2.6, y + bar / 2, bar * 0.34, P.steel, 600, "left");
  g.restore();
  return { x, y: y + bar, w, h: h - bar, top: y };
}
function ad(k, o) { // a pop-up ad. (x,y) = centre
  const g = k.g, w = (o.w || 420) * k.u, h = (o.h || 300) * k.u;
  const pop = o.pop === undefined ? 1 : o.pop; if (pop <= 0.001) return;
  g.save(); g.translate(o.x, o.y); g.rotate(o.rot || 0); g.scale(pop, pop);
  g.shadowColor = "rgba(20,20,40,0.38)"; g.shadowBlur = w * 0.06; g.shadowOffsetY = w * 0.035;
  rr(g, -w / 2, -h / 2, w, h, w * 0.05, o.color || P.yellow); g.shadowColor = "transparent";
  rr(g, -w / 2, -h / 2, w, h * 0.2, w * 0.05, P.ink);
  txt(g, "AD", -w / 2 + w * 0.08, -h / 2 + h * 0.1, h * 0.12, P.yellow, 800, "left");
  rr(g, w / 2 - w * 0.13, -h / 2 + h * 0.03, w * 0.1, h * 0.14, w * 0.02, P.red);
  txt(g, "×", w / 2 - w * 0.08, -h / 2 + h * 0.095, h * 0.15, "#fff", 800);
  txt(g, o.text || "FREE!!", 0, -h * 0.02, h * (o.size || 0.3), o.ink || P.ink, 900);
  rr(g, -w * 0.3, h * 0.18, w * 0.6, h * 0.2, h * 0.06, o.btn || P.red);
  txt(g, o.cta || "CLICK", 0, h * 0.28, h * 0.12, "#fff", 800);
  g.restore();
}
function server(k, o) { // a rack. (x,y) = centre; w,h px
  const g = k.g, w = o.w * k.u, h = o.h * k.u, x = o.x - w / 2, y = o.y - h / 2;
  g.save(); g.shadowColor = "rgba(0,0,0,0.4)"; g.shadowBlur = w * 0.06; rr(g, x, y, w, h, w * 0.05, o.body || "#2a3050"); g.restore();
  const n = o.units || 5, uh = (h - w * 0.12) / n;
  for (let i = 0; i < n; i++) {
    const uy = y + w * 0.06 + i * uh;
    rr(g, x + w * 0.07, uy + uh * 0.1, w * 0.86, uh * 0.8, w * 0.025, "#3a4268");
    for (let j = 0; j < 4; j++) rr(g, x + w * 0.12 + j * w * 0.09, uy + uh * 0.32, w * 0.06, uh * 0.36, w * 0.01, "#1c2140");
    const on = Math.sin(k.t * (3 + i) + i * 1.7 + (o.ph || 0)) > -0.2;
    circle(g, x + w * 0.86, uy + uh * 0.5, uh * 0.11, on ? (o.led || P.green) : "#44506e");
    circle(g, x + w * 0.76, uy + uh * 0.5, uh * 0.11, (Math.sin(k.t * 5 + i * 2.3) > 0.4) ? (o.led2 || P.yellow) : "#44506e");
  }
}
function cloud(k, o) { // (x,y) centre; s width px
  const g = k.g, s = o.s * k.u; g.fillStyle = o.color || "#fff";
  g.beginPath(); g.arc(o.x - s * 0.22, o.y + s * 0.04, s * 0.2, 0, 7); g.arc(o.x, o.y - s * 0.08, s * 0.26, 0, 7); g.arc(o.x + s * 0.25, o.y + s * 0.03, s * 0.21, 0, 7); g.fill();
  rr(g, o.x - s * 0.42, o.y + s * 0.02, s * 0.86, s * 0.23, s * 0.115, o.color || "#fff");
}
function lock(k, o) { // padlock. (x,y) = centre of the body's top edge area; s = body width px
  const g = k.g, s = o.s * k.u, col = o.color || P.red, sh = o.shackle || "#c3c8d8", top = -s * 0.3, rad = s * 0.3, lw = s * 0.16;
  g.save(); g.translate(o.x, o.y);
  g.lineWidth = lw; g.lineCap = "round"; g.lineJoin = "round"; g.strokeStyle = sh;
  g.beginPath();
  if (o.open) {                                  // lifted off the body: the left leg stays seated, the right leg hangs free
    const cy = top - s * 0.62;
    g.moveTo(-rad, top + s * 0.06); g.lineTo(-rad, cy); g.arc(0, cy, rad, Math.PI, 0); g.lineTo(rad, cy + s * 0.2);
  } else {                                       // closed: both legs seated in the body
    const cy = top - s * 0.28;
    g.moveTo(-rad, top + s * 0.06); g.lineTo(-rad, cy); g.arc(0, cy, rad, Math.PI, 0); g.lineTo(rad, top + s * 0.06);
  }
  g.stroke();
  rr(g, -s / 2, top, s, s * 0.8, s * 0.14, col);
  rr(g, -s * 0.43, top + s * 0.06, s * 0.86, s * 0.07, s * 0.035, "rgba(255,255,255,0.2)");
  circle(g, 0, s * 0.06, s * 0.095, P.ink); rr(g, -s * 0.037, s * 0.08, s * 0.074, s * 0.21, s * 0.03, P.ink);
  g.restore();
}
function magnifier(k, o) {
  const g = k.g, s = o.s * k.u; g.save(); g.translate(o.x, o.y); g.rotate(o.rot || 0);
  g.strokeStyle = o.color || P.ink; g.lineWidth = s * 0.12; g.lineCap = "round";
  g.beginPath(); g.arc(0, 0, s * 0.34, 0, 7); g.stroke(); g.beginPath(); g.moveTo(s * 0.24, s * 0.24); g.lineTo(s * 0.55, s * 0.55); g.stroke();
  g.restore();
}
function cursor(k, x, y, s) {
  const g = k.g; s = s * k.u; g.save(); g.translate(x, y); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, s); g.lineTo(s * 0.28, s * 0.76); g.lineTo(s * 0.5, s * 1.15); g.lineTo(s * 0.65, s * 1.07); g.lineTo(s * 0.43, s * 0.7); g.lineTo(s * 0.78, s * 0.66); g.closePath();
  g.fillStyle = P.ink; g.fill(); g.lineWidth = s * 0.07; g.strokeStyle = "#fff"; g.stroke(); g.restore();
}
function glowSpot(k, x, y, r, color, a) {
  const g = k.g, gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, k.alpha(color, a)); gr.addColorStop(1, k.alpha(color, 0));
  g.save(); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); g.restore();
}
/** the Forma "drop something in" card. (x,y) centre; w px */
function dropCard(k, o) {
  const g = k.g, w = o.w * k.u, h = w * (o.ratio || 0.82), x = o.x - w / 2, y = o.y - h / 2;
  g.save(); g.shadowColor = "rgba(52,72,237,0.28)"; g.shadowBlur = w * 0.08; g.shadowOffsetY = w * 0.04; rr(g, x, y, w, h, w * 0.07, P.white); g.restore();
  g.save(); g.setLineDash([w * 0.035, w * 0.03]); rr(g, x + w * 0.06, y + w * 0.06, w * 0.88, h - w * 0.12, w * 0.05, o.fill || P.mist, o.dash || P.indigo2, w * 0.012); g.restore();
  if (!o.noPlus) { circle(g, o.x, o.y - h * 0.08, w * 0.12, P.indigo); rr(g, o.x - w * 0.055, o.y - h * 0.08 - w * 0.012, w * 0.11, w * 0.024, w * 0.012, "#fff"); rr(g, o.x - w * 0.012, o.y - h * 0.08 - w * 0.055, w * 0.024, w * 0.11, w * 0.012, "#fff"); }
  if (!o.noText) txt(g, o.text || "Drop something in", o.x, o.y + h * 0.22, w * 0.085, P.ink, 700);
  return { x, y, w, h };
}

/** easeOutBack 0→1 (with a little overshoot) from time ta over dur seconds; 0 before ta */
const popS = (k, ta, dur) => { const x = clamp01((k.t - ta) / (dur || 0.3)); if (x <= 0) return 0; const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
/** a person seen from behind (over-the-shoulder): (x,y) = where the shoulders meet the frame bottom; s = head radius px */
function viewer(k, o) {
  const g = k.g, s = (o.s || 125) * k.u, body = o.body || P.indigo, hair = o.hair || "#2b1f1a", skin = "#c08a63", rim = o.rim || "rgba(255,255,255,0.35)";
  g.save(); g.translate(o.x, o.y);
  if (o.style === "long") rr(g, -s * 1.05, -s * 2.3, s * 2.1, s * 3.6, s * 0.9, hair);
  // shoulders
  g.fillStyle = body; g.beginPath(); g.moveTo(-s * 2.9, s * 3.2); g.quadraticCurveTo(-s * 2.9, -s * 0.1, -s * 1.3, -s * 0.5); g.lineTo(s * 1.3, -s * 0.5); g.quadraticCurveTo(s * 2.9, -s * 0.1, s * 2.9, s * 3.2); g.closePath(); g.fill();
  g.strokeStyle = rim; g.lineWidth = 5 * k.u; g.beginPath(); g.moveTo(-s * 2.9, s * 2.0); g.quadraticCurveTo(-s * 2.9, -s * 0.1, -s * 1.3, -s * 0.5); g.stroke();
  // neck + head (back of the head is hair)
  rr(g, -s * 0.4, -s * 1.05, s * 0.8, s * 0.8, s * 0.22, skin);
  if (o.hood) { g.fillStyle = body; g.beginPath(); g.ellipse(0, -s * 1.75, s * 1.22, s * 1.4, 0, 0, 7); g.fill(); g.strokeStyle = rim; g.beginPath(); g.ellipse(0, -s * 1.75, s * 1.22, s * 1.4, 0, Math.PI * 1.08, Math.PI * 1.5); g.stroke(); }
  else {
    g.fillStyle = hair; g.beginPath(); g.ellipse(0, -s * 1.75, s * 1.02, s * 1.18, 0, 0, 7); g.fill();
    if (o.style === "bun") circle(g, 0, -s * 3.0, s * 0.5, hair);
    g.strokeStyle = rim; g.lineWidth = 5 * k.u; g.beginPath(); g.ellipse(0, -s * 1.75, s * 1.02, s * 1.18, 0, Math.PI * 1.1, Math.PI * 1.55); g.stroke();
  }
  g.restore();
}
/** a couple of big, soft, slowly drifting discs behind light scenes */
function blobs(k, cols) {
  const g = k.g; cols.forEach((c, i) => { const x = k.X(0.15 + i * 0.35) + Math.sin(k.t * 0.5 + i * 2) * 40 * k.u, y = k.Y(0.18 + (i % 2) * 0.5) + Math.cos(k.t * 0.4 + i) * 30 * k.u; circle(g, x, y, (300 + i * 60) * k.u, k.alpha(c, 0.35)); });
}

const bgRoom = (k, top, bottom, deskY, desk) => { k.sky({ stops: [top, bottom] }); k.g.fillStyle = desk; k.g.fillRect(0, k.Y(deskY), k.W, k.H - k.Y(deskY)); k.g.fillStyle = "rgba(0,0,0,0.12)"; k.g.fillRect(0, k.Y(deskY), k.W, 10 * k.u); };
/** over-the-shoulder: a back-view head and shoulders at the bottom of the frame */
const overShoulder = (k, o) => k.person({ x: o.x ?? 0.5, y: o.y ?? 1.86, h: o.h ?? 1.0, facing: "back", pose: "stand", hair: o.hair || "long", top: o.top || P.indigo, hairColor: o.hairColor || "#2a1d16", skin: "#b9825a", silhouette: o.silhouette || null, rim: o.rim || null });

