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

// ───────────────────────────── Pixel & friends ─────────────────────────────
const INK = "#1b2030";
const lerp = (a, b, t) => a + (b - a) * t;
const outBack = (x) => { x = clamp01(x); const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const hash = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

function sparkle(k, x, y, r, col, rot) {
  const g = k.g; if (r <= 0.5) return; g.save(); g.translate(x, y); g.rotate(rot || 0); g.fillStyle = col || "#ffd84d";
  g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr_ = i % 2 ? r * 0.28 : r; g.lineTo(Math.cos(a) * rr_, Math.sin(a) * rr_); } g.closePath(); g.fill(); g.restore();
}
function confetti(k, n, speed, t0) {
  const g = k.g, cols = [P.indigo, P.indigo2, P.yellow, P.orange, P.green, "#ff8fb1", P.red];
  const t = k.t - (t0 || 0); if (t < 0) return;
  for (let i = 0; i < n; i++) {
    const x = hash(i) * k.W, y = ((t * speed + hash(i + 50)) % 1.15) * k.H * 1.1 - k.H * 0.1 + Math.min(1, t * 3) * 0;
    if (t * speed < hash(i + 50) * 0.01) continue;
    g.save(); g.translate(x + Math.sin(t * 3 + i) * 30 * k.u, y); g.rotate(t * (2 + hash(i) * 4) + i); g.fillStyle = cols[i % cols.length];
    g.fillRect(-9 * k.u, -5 * k.u, 18 * k.u, 10 * k.u); g.restore();
  }
}
function shadow(k, x, y, w) { const g = k.g; g.save(); g.fillStyle = "rgba(30,36,70,0.16)"; g.beginPath(); g.ellipse(x, y, w * 0.5, w * 0.09, 0, 0, 7); g.fill(); g.restore(); }
function floor(k, y, top, bottom) { const g = k.g, gr = g.createLinearGradient(0, y, 0, k.H); gr.addColorStop(0, top); gr.addColorStop(1, bottom); g.fillStyle = gr; g.fillRect(0, y, k.W, k.H - y); }

/**
 * Pixel — a file with a face. (x,y) = bottom of the feet; s = body width px.
 * mood: happy | worried | scared | annoyed | wow | proud   arms: down | wave | up | cross | push
 */
function pixel(k, o) {
  const g = k.g, s = (o.s || 340) * k.u, h = s * 1.28, label = o.label || "PNG", col = o.color || ext[label] || P.indigo, mood = o.mood || "happy";
  const sq = o.sq || 1, legH = s * 0.17, ph = o.walk ? k.t * o.walk * Math.PI * 2 : 0;
  const shake = mood === "scared" || o.shake ? Math.sin(k.t * 55) * s * 0.012 : 0;
  g.save(); g.translate(o.x + shake, o.y); g.rotate(o.rot || 0); if (o.flip) g.scale(-1, 1); g.scale(1 / Math.sqrt(sq), sq);
  if (o.alpha !== undefined) g.globalAlpha = o.alpha;
  const bodyB = -legH, bodyT = bodyB - h, cx = 0, faceY = bodyB - h * 0.6;
  // legs
  [-1, 1].forEach((d) => { const lift = o.walk ? Math.max(0, Math.sin(ph + (d > 0 ? Math.PI : 0))) * s * 0.12 : 0;
    rr(g, d * s * 0.2 - s * 0.045, bodyB - s * 0.02, s * 0.09, legH + s * 0.02 - lift, s * 0.04, INK); g.fillStyle = INK; g.beginPath(); g.ellipse(d * s * 0.2 + d * s * 0.03, -lift, s * 0.085, s * 0.04, 0, 0, 7); g.fill(); });
  // arms (behind the body)
  const arm = (side, ang, len) => { const x0 = side * s * 0.5, y0 = bodyB - h * 0.38, x1 = x0 + side * Math.cos(ang) * len, y1 = y0 + Math.sin(ang) * len;
    g.strokeStyle = INK; g.lineWidth = s * 0.055; g.lineCap = "round"; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); circle(g, x1, y1, s * 0.058, INK); };
  const A = o.arms || "down", L = s * 0.24, sw = Math.sin(k.t * 9) * 0.35;
  if (A === "down") { arm(-1, 1.0, L); arm(1, 1.0, L); }
  else if (A === "wave") { arm(-1, 1.0, L); arm(1, -1.0 + sw, L); }
  else if (A === "up") { arm(-1, -1.15 + sw * 0.4, L); arm(1, -1.15 - sw * 0.4, L); }
  else if (A === "push") { arm(-1, 0.1, L); arm(1, 0.1, L); }
  else if (A === "cross") { /* drawn after the body */ }
  // body
  g.save(); g.shadowColor = "rgba(30,36,80,0.22)"; g.shadowBlur = s * 0.07; g.shadowOffsetY = s * 0.03;
  rr(g, -s / 2, bodyT, s, h, s * 0.09, o.paper || "#ffffff"); g.restore();
  g.beginPath(); g.moveTo(s / 2 - s * 0.24, bodyT); g.lineTo(s / 2, bodyT + s * 0.24); g.lineTo(s / 2 - s * 0.24, bodyT + s * 0.24); g.closePath(); g.fillStyle = "#e1e4f0"; g.fill();
  // label band
  rr(g, -s * 0.4, bodyB - h * 0.2, s * 0.8, h * 0.14, s * 0.05, col); txt(g, label, 0, bodyB - h * 0.13, s * (label.length > 3 ? 0.13 : 0.16), "#fff", 800);
  // face
  const m = { happy: [0.1, 0.05], worried: [0.1, 0.045], scared: [0.135, 0.03], annoyed: [0.1, 0.05], wow: [0.125, 0.06], proud: [0.1, 0.05] }[mood] || [0.1, 0.05];
  const blink = (k.t % 3.3) < 0.12 && mood !== "scared" && mood !== "proud", er = s * m[0], pr = s * m[1], ex = s * 0.19, lk = o.look || [0, 0];
  const eye = (side) => { const x = cx + side * ex;
    if (mood === "proud") { g.strokeStyle = INK; g.lineWidth = s * 0.03; g.lineCap = "round"; g.beginPath(); g.arc(x, faceY + s * 0.01, er * 0.8, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); return; }
    g.save(); g.translate(x, faceY); if (blink) g.scale(1, 0.12);
    circle(g, 0, 0, er, "#fff"); g.strokeStyle = INK; g.lineWidth = s * 0.012; g.beginPath(); g.arc(0, 0, er, 0, 7); g.stroke();
    circle(g, lk[0] * er * 0.45, lk[1] * er * 0.45, pr, INK); circle(g, lk[0] * er * 0.45 + pr * 0.35, lk[1] * er * 0.45 - pr * 0.35, pr * 0.3, "#fff");
    if (mood === "annoyed") { g.fillStyle = o.paper || "#fff"; g.fillRect(-er * 1.1, -er * 1.1, er * 2.2, er * 1.2); g.strokeStyle = INK; g.lineWidth = s * 0.014; g.beginPath(); g.moveTo(-er, -er * 0.1); g.lineTo(er, -er * 0.1); g.stroke(); }
    g.restore(); };
  eye(-1); eye(1);
  // brows
  g.strokeStyle = INK; g.lineWidth = s * 0.026; g.lineCap = "round";
  const brow = (side, a, dy) => { const x = cx + side * ex, y = faceY - er * 1.5 - dy; g.beginPath(); g.moveTo(x - side * er * 0.7, y + a * er * side * -0.7 * -1); g.lineTo(x + side * er * 0.7, y - a * er * side * -0.7 * -1); g.stroke(); };
  if (mood === "worried") { brow(-1, -0.7, 0); brow(1, -0.7, 0); } else if (mood === "scared") { brow(-1, -0.9, s * 0.03); brow(1, -0.9, s * 0.03); } else if (mood === "annoyed") { brow(-1, 0.8, -s * 0.01); brow(1, 0.8, -s * 0.01); } else if (mood === "wow") { brow(-1, 0, s * 0.03); brow(1, 0, s * 0.03); }
  // mouth
  const my = faceY + s * 0.2; g.lineWidth = s * 0.028; g.strokeStyle = INK;
  if (mood === "happy") { g.beginPath(); g.arc(cx, my - s * 0.05, s * 0.11, Math.PI * 0.12, Math.PI * 0.88); g.stroke(); }
  else if (mood === "proud") { g.fillStyle = INK; g.beginPath(); g.moveTo(cx - s * 0.13, my - s * 0.05); g.quadraticCurveTo(cx, my + s * 0.2, cx + s * 0.13, my - s * 0.05); g.closePath(); g.fill(); g.fillStyle = "#ff8a9a"; g.beginPath(); g.ellipse(cx, my + s * 0.045, s * 0.06, s * 0.03, 0, 0, 7); g.fill(); }
  else if (mood === "wow") { g.fillStyle = INK; g.beginPath(); g.ellipse(cx, my, s * 0.07, s * 0.09, 0, 0, 7); g.fill(); }
  else if (mood === "scared") { g.fillStyle = INK; g.beginPath(); g.ellipse(cx, my + s * 0.01, s * 0.06, s * 0.09 + Math.sin(k.t * 40) * s * 0.01, 0, 0, 7); g.fill(); }
  else if (mood === "worried") { g.beginPath(); for (let i = 0; i <= 12; i++) { const x = cx - s * 0.1 + (i / 12) * s * 0.2, y = my + Math.sin(i * 1.6 + k.t * 8) * s * 0.012; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
  else if (mood === "annoyed") { g.beginPath(); g.moveTo(cx - s * 0.09, my); g.lineTo(cx + s * 0.09, my + s * 0.01); g.stroke(); }
  // blush
  if (mood === "happy" || mood === "proud" || mood === "wow") { g.fillStyle = "rgba(255,120,140,0.35)"; [-1, 1].forEach((d) => { g.beginPath(); g.ellipse(cx + d * s * 0.3, faceY + s * 0.12, s * 0.055, s * 0.035, 0, 0, 7); g.fill(); }); }
  // sweat
  if (o.sweat || mood === "scared" || mood === "worried") {
    for (let i = 0; i < (mood === "scared" ? 3 : 1); i++) { const tt = (k.t * 1.3 + i * 0.37) % 1, sx = (i % 2 ? 1 : -1) * (s * 0.42 + i * s * 0.05), sy = faceY - s * 0.2 + tt * s * 0.45;
      g.save(); g.globalAlpha = 1 - tt * 0.6; g.fillStyle = "#7fd0ff"; g.beginPath(); g.moveTo(sx, sy - s * 0.06); g.quadraticCurveTo(sx + s * 0.045, sy + s * 0.01, sx, sy + s * 0.03); g.quadraticCurveTo(sx - s * 0.045, sy + s * 0.01, sx, sy - s * 0.06); g.fill(); g.restore(); } }
  if (A === "cross") { g.strokeStyle = INK; g.lineWidth = s * 0.055; g.lineCap = "round"; g.beginPath(); g.moveTo(-s * 0.46, bodyB - h * 0.34); g.lineTo(s * 0.3, bodyB - h * 0.27); g.moveTo(s * 0.46, bodyB - h * 0.34); g.lineTo(-s * 0.3, bodyB - h * 0.27); g.stroke(); }
  g.restore();
}
/** another file with a face (a friend): same character, different label/colour */
const buddy = (k, o) => pixel(k, Object.assign({ mood: "happy" }, o));
function doorway(k, o) { // an arched door. (x,y) = bottom centre; w,h px; open 0..1 swings the panel on its left hinge
  const g = k.g, w = o.w * k.u, h = o.h * k.u, x = o.x - w / 2, y = o.y - h, op = clamp01(o.open || 0), r = w / 2;
  const arch = (X, Y2, W2, ex) => { g.beginPath(); g.moveTo(X - ex, Y2); g.lineTo(X - ex, y + r); g.arc(X + W2 / 2, y + r, W2 / 2 + ex, Math.PI, 0); g.lineTo(X + W2 + ex, Y2); g.closePath(); };
  glowSpot(k, o.x, o.y - h * 0.5, w * 1.7, "#fff3c8", 0.5 * (0.3 + op));
  arch(x, o.y, w, 22 * k.u); g.fillStyle = "#2a36b8"; g.fill();                                   // frame
  arch(x, o.y, w, 0); const gr = g.createLinearGradient(0, y, 0, o.y); gr.addColorStop(0, o.inner || "#fffbe8"); gr.addColorStop(1, o.inner || "#ffe2a8"); g.fillStyle = gr; g.fill();   // light inside
  if (op > 0.05) { g.save(); arch(x, o.y, w, 0); g.clip(); for (let i = 0; i < 6; i++) { g.fillStyle = "rgba(255,255,255," + 0.3 * op + ")"; g.beginPath(); g.moveTo(o.x, o.y - h * 0.45); g.lineTo(x - w * 0.8 + i * w * 0.5, y - h * 0.3); g.lineTo(x - w * 0.8 + (i + 0.3) * w * 0.5, y - h * 0.3); g.closePath(); g.fill(); } g.restore(); }
  // the panel swings open on its left hinge: its free edge moves toward the hinge and gets shorter (perspective)
  const sx = Math.max(0.12, 1 - 0.88 * op), fx = x + w * sx, drop = h * 0.075 * op, topY = y + r * 0.0;
  g.beginPath(); g.moveTo(x, o.y); g.lineTo(x, y + r); g.quadraticCurveTo(x + (fx - x) * 0.5, topY - r * 0.28 * (1 - op) + drop * 0.2, fx, y + r + drop); g.lineTo(fx, o.y - drop * 0.8); g.closePath();
  g.fillStyle = o.color || P.indigo; g.fill(); g.strokeStyle = "rgba(255,255,255,0.18)"; g.lineWidth = 5 * k.u; g.stroke();
  if (!o.noMark && op < 0.75) mark(k, { x: x + (fx - x) / 2, y: y + h * 0.4, s: w * 0.42 * sx, colors: ["#fff", "#dfe4ff", "#b8c0ff"] });
  if (!o.noMark) circle(g, x + (fx - x) * 0.82, o.y - h * 0.4, w * 0.03 * sx, P.yellow);
}
function balloon(k, x, y, r, col, sway) {
  const g = k.g; g.strokeStyle = "rgba(60,66,100,0.5)"; g.lineWidth = 4 * k.u; g.beginPath(); g.moveTo(x, y + r * 1.15); g.quadraticCurveTo(x + (sway || 0), y + r * 2.4, x - (sway || 0) * 0.3, y + r * 3.4); g.stroke();
  g.fillStyle = col; g.beginPath(); g.ellipse(x, y, r * 0.86, r, 0, 0, 7); g.fill(); g.fillStyle = "rgba(255,255,255,0.35)"; g.beginPath(); g.ellipse(x - r * 0.3, y - r * 0.35, r * 0.18, r * 0.3, -0.5, 0, 7); g.fill();
  g.fillStyle = col; g.beginPath(); g.moveTo(x, y + r); g.lineTo(x - r * 0.12, y + r * 1.18); g.lineTo(x + r * 0.12, y + r * 1.18); g.fill();
}
const speech = (k, o) => { // pill bubble with a tail. (x,y) = centre of the pill
  const g = k.g, s = outBack((k.t - (o.t0 || 0)) / 0.3); if (s <= 0.01) return; const h = (o.h || 120) * k.u, w = (o.w || 420) * k.u;
  g.save(); g.translate(o.x, o.y); g.scale(s, s); g.shadowColor = "rgba(30,36,80,0.22)"; g.shadowBlur = 20 * k.u; g.shadowOffsetY = 8 * k.u;
  rr(g, -w / 2, -h / 2, w, h, h / 2, "#fff"); g.beginPath(); g.moveTo((o.tailX || -0.25) * w - 18 * k.u, h / 2 - 2); g.lineTo((o.tailX || -0.25) * w + 18 * k.u, h / 2 - 2); g.lineTo((o.tailX || -0.25) * w - 10 * k.u, h / 2 + 46 * k.u); g.closePath(); g.fill(); g.shadowColor = "transparent";
  txt(g, o.text, 0, 4 * k.u, h * 0.46, o.color || INK, 800); g.restore();
};
const pastel = (k) => { k.sky({ stops: ["#eef0ff", "#fdf3e6"] }); blobs(k, ["#c9cfff", "#ffd9e6", "#c9f0e0"]); };
const webgrey = (k) => k.sky({ stops: ["#e9edf7", "#d3d9ec"] });
const night = (k) => k.sky({ stops: ["#0c0f26", "#1b2150"] });

window.SCENES = {
  // 1 — "Meet Pixel."
  "pixel-intro": (k) => {
    pastel(k); floor(k, k.Y(0.72), "#f6e9d6", "#eadbc3");
    const gy = k.Y(0.72), t = k.t, land = 0.5, y = t < land ? lerp(k.H + 700 * k.u, gy, outBack(t / land) > 1 ? 1 : t / land) : gy;
    const hopY = t < land ? y : gy - Math.abs(Math.sin((t - land) * 5)) * 16 * k.u * Math.max(0, 1 - (t - land) * 0.9);
    const sq = t < land ? 1.12 : 1 - 0.18 * Math.max(0, 1 - (t - land) * 7) + 0.03 * Math.sin(t * 6);
    shadow(k, k.X(0.5), gy, 330 * k.u * (t < land ? 0.4 + t / land * 0.6 : 1));
    pixel(k, { x: k.X(0.5), y: hopY, s: 430, label: "PNG", mood: "happy", arms: t > 0.55 ? "wave" : "up", sq, look: [0, -0.2] });
    [[-300, -420, 38], [310, -520, 30], [-380, -250, 24], [380, -320, 28]].forEach(([dx, dy, r], i) => sparkle(k, k.X(0.5) + dx * k.u, gy + dy * k.u, r * k.u * outBack((t - 0.55 - i * 0.08) / 0.3), [P.yellow, P.indigo2, "#ff8fb1", P.green][i], t * 1.5 + i));
  },
  // 2a — "Pixel is a PNG,"
  "pixel-png": (k) => {
    pastel(k); floor(k, k.Y(0.72), "#f6e9d6", "#eadbc3"); const gy = k.Y(0.7);
    shadow(k, k.X(0.4), gy, 330 * k.u); pixel(k, { x: k.X(0.4), y: gy - Math.abs(Math.sin(k.t * 3)) * 10 * k.u, s: 430, label: "PNG", mood: "happy", look: [0.3, -0.2] });
    speech(k, { x: k.X(0.68), y: k.Y(0.28), text: "I'm a PNG!", w: 520, t0: 0.15, tailX: -0.3 });
  },
  // 2b — "who really needs to be a WebP."
  "pixel-todo": (k) => {
    k.sky({ stops: ["#fbf0dc", "#f2e1c3"] }); floor(k, k.Y(0.74), "#e3c79c", "#cfae7d"); const g = k.g, gy = k.Y(0.72);
    const wob = Math.sin(k.t * 2) * 0.02, nt = outBack(k.t / 0.35);
    g.save(); g.translate(k.X(0.64), k.Y(0.3)); g.rotate(-0.07 + wob); g.scale(nt, nt); g.shadowColor = "rgba(60,40,10,0.3)"; g.shadowBlur = 24 * k.u; g.shadowOffsetY = 12 * k.u;
    rr(g, -330 * k.u, -300 * k.u, 660 * k.u, 600 * k.u, 18 * k.u, "#ffe36b"); g.shadowColor = "transparent"; circle(g, 0, -270 * k.u, 22 * k.u, P.red);
    txt(g, "DUE FRIDAY", 0, -140 * k.u, 82 * k.u, INK, 800); txt(g, "PNG → WebP", 0, 10 * k.u, 74 * k.u, P.indigo, 800); rr(g, -230 * k.u, 110 * k.u, 460 * k.u, 10 * k.u, 5 * k.u, "rgba(0,0,0,0.12)"); rr(g, -230 * k.u, 170 * k.u, 360 * k.u, 10 * k.u, 5 * k.u, "rgba(0,0,0,0.12)"); g.restore();
    shadow(k, k.X(0.3), gy, 300 * k.u); pixel(k, { x: k.X(0.3), y: gy, s: 400, label: "PNG", mood: "worried", look: [0.7, -0.9], sweat: true, arms: "down" });
  },
  // 3a — "Googles it."
  "pixel-search": (k) => {
    webgrey(k); const g = k.g, n = Math.floor(clamp01(k.p * 1.3) * 26), q = "free png to webp converter";
    rr(g, k.X(0.08), k.Y(0.17), k.X(0.84), 150 * k.u, 75 * k.u, "#fff", P.indigo2, 6 * k.u); magnifier(k, { x: k.X(0.16), y: k.Y(0.17) + 75 * k.u, s: 100, color: P.indigo });
    txt(g, q.slice(0, n) + (Math.floor(k.t * 3) % 2 ? "|" : ""), k.X(0.23), k.Y(0.17) + 75 * k.u, 54 * k.u, INK, 600, "left");
    const gy = k.Y(0.7); floor(k, gy, "#c9cfe0", "#b6bdd3"); shadow(k, k.X(0.5), gy, 300 * k.u);
    pixel(k, { x: k.X(0.5), y: gy, s: 360, label: "PNG", mood: "happy", look: [0, -0.9] });
  },
  // 3b — results (hopeful)
  "search-results": (k) => {
    webgrey(k); const g = k.g;
    const rows = [["PNG to WebP — FREE!!", P.green], ["Convert PNG online ★ FAST", P.orange], ["Best free converter 2026", P.indigo], ["PNG → WEBP (no limits*)", P.red]];
    rows.forEach(([tx, c], i) => { const a = outBack((k.t - i * 0.12) / 0.3), y = k.Y(0.1 + i * 0.105); if (a <= 0) return; g.save(); g.translate(k.X(0.5), y); g.scale(a, a); g.shadowColor = "rgba(30,36,80,0.2)"; g.shadowBlur = 16 * k.u;
      rr(g, -k.X(0.42), -52 * k.u, k.X(0.84), 108 * k.u, 26 * k.u, "#fff"); g.shadowColor = "transparent"; circle(g, -k.X(0.42) + 62 * k.u, 0, 28 * k.u, c); txt(g, tx, -k.X(0.42) + 115 * k.u, 2 * k.u, 44 * k.u, INK, 700, "left"); g.restore(); });
    const gy = k.Y(0.72); floor(k, gy, "#c9cfe0", "#b6bdd3"); shadow(k, k.X(0.5), gy, 300 * k.u);
    pixel(k, { x: k.X(0.5), y: gy, s: 300, label: "PNG", mood: "wow", look: [0, -0.6], arms: "wave" });
    const e = ease(k.p); cursor(k, k.X(0.7 - 0.12 * e), k.Y(0.5 - 0.3 * e), 80);
  },
  // 4 — "Big mistake."
  "ad-explosion": (k) => {
    webgrey(k); const g = k.g, t = k.t; const sh = Math.max(0, 1 - t * 2.2);
    g.save(); g.translate(Math.sin(t * 70) * 14 * k.u * sh, Math.cos(t * 63) * 12 * k.u * sh);
    const spots = [[0.2, 0.18, -0.12, "FREE!!", P.yellow], [0.78, 0.2, 0.1, "WIN $$$", "#ff8fb1"], [0.18, 0.44, 0.08, "HOT!", "#8ee0c2"], [0.82, 0.5, -0.1, "SALE", "#b9a8ff"], [0.5, 0.12, 0.04, "100%", P.orange], [0.24, 0.66, -0.05, "CLICK", "#7fc4ff"], [0.78, 0.7, 0.1, "NEW!", P.red]];
    spots.forEach(([x, y, r, tx, c], i) => ad(k, { x: lerp(k.X(0.5), k.X(x), outBack((t - 0.04 * i) / 0.35)), y: lerp(k.Y(0.45), k.Y(y), outBack((t - 0.04 * i) / 0.35)), w: 400, h: 290, color: c, text: tx, rot: r + Math.sin(t * 8 + i) * 0.02, pop: outBack((t - 0.04 * i) / 0.3) }));
    const gy = k.Y(0.7); pixel(k, { x: k.X(0.5), y: gy, s: 400, label: "PNG", mood: "scared", arms: "up", look: [0, 0] }); g.restore();
    g.fillStyle = "rgba(255,255,255," + Math.max(0, 0.7 - t * 3) + ")"; g.fillRect(0, 0, k.W, k.H);
  },
  // 5a — "Ads. Pop-ups."
  "pixel-dodge": (k) => {
    webgrey(k); const g = k.g, gy = k.Y(0.72); floor(k, gy, "#c9cfe0", "#b6bdd3");
    const cols = [P.yellow, "#ff8fb1", "#8ee0c2", "#b9a8ff", P.orange], tx = ["FREE!!", "WIN $$$", "HOT!", "SALE", "NEW!"];
    for (let i = 0; i < 5; i++) { const ft = ((k.t * 0.9 + i * 0.23) % 1.3), y = k.Y(-0.15 + ft * 0.85); if (y > gy) { continue; } ad(k, { x: k.X(0.15 + i * 0.175), y, w: 300, h: 220, color: cols[i], text: tx[i], rot: Math.sin(i * 2) * 0.25 + ft * 0.4, size: 0.3 }); }
    const px = k.X(0.5) + Math.sin(k.t * 4.2) * k.X(0.24); shadow(k, px, gy, 280 * k.u);
    pixel(k, { x: px, y: gy - Math.abs(Math.sin(k.t * 8.4)) * 40 * k.u, s: 330, label: "PNG", mood: "scared", arms: "up", walk: 5, look: [Math.cos(k.t * 4.2), -0.6] });
  },
  // 5b — "A sign-up wall."
  "signup-wall": (k) => {
    webgrey(k); const g = k.g, cx = k.X(0.58), cy = k.Y(0.36), w = 820 * k.u, h = 760 * k.u, s = outBack(k.t / 0.35);
    g.save(); g.translate(cx, cy); g.scale(s, s); g.shadowColor = "rgba(30,36,80,0.35)"; g.shadowBlur = 40 * k.u; rr(g, -w / 2, -h / 2, w, h, 40 * k.u, "#fff"); g.shadowColor = "transparent";
    txt(g, "Sign up", 0, -h * 0.34, 92 * k.u, INK, 800); txt(g, "to continue", 0, -h * 0.2, 56 * k.u, P.grey, 600);
    [["Email", -0.03], ["Password", 0.14]].forEach(([l, y]) => { rr(g, -w * 0.38, h * y - 49 * k.u, w * 0.76, 98 * k.u, 22 * k.u, "#eef0f8", P.greyLight, 5 * k.u); txt(g, l, -w * 0.33, h * y, 42 * k.u, P.grey, 500, "left"); });
    rr(g, -w * 0.38, h * 0.26, w * 0.76, 118 * k.u, 30 * k.u, P.orange); txt(g, "Sign up", 0, h * 0.26 + 59 * k.u, 56 * k.u, "#fff", 800); g.restore();
    const gy = k.Y(0.72); floor(k, gy, "#c9cfe0", "#b6bdd3"); shadow(k, k.X(0.2), gy, 300 * k.u);
    pixel(k, { x: k.X(0.2) + Math.sin(k.t * 6) * 6 * k.u, y: gy, s: 340, label: "PNG", mood: "annoyed", arms: "push", walk: 4, rot: 0.06, look: [0.8, 0] });
  },
  // 6a — "Not win a cruise."
  "cruise-ad": (k) => {
    webgrey(k); const g = k.g, w = 900 * k.u, h = 760 * k.u, cx = k.X(0.55), cy = k.Y(0.33), s = outBack(k.t / 0.35);
    g.save(); g.translate(cx, cy); g.rotate(-0.03); g.scale(s, s); g.shadowColor = "rgba(30,36,80,0.35)"; g.shadowBlur = 40 * k.u; rr(g, -w / 2, -h / 2, w, h, 36 * k.u, "#7fd3ff"); g.shadowColor = "transparent";
    rr(g, -w / 2, -h / 2, w, 110 * k.u, 36 * k.u, INK); txt(g, "AD", -w / 2 + 60 * k.u, -h / 2 + 55 * k.u, 54 * k.u, P.yellow, 800, "left"); rr(g, w / 2 - 110 * k.u, -h / 2 + 22 * k.u, 80 * k.u, 66 * k.u, 14 * k.u, P.red); txt(g, "×", w / 2 - 70 * k.u, -h / 2 + 55 * k.u, 70 * k.u, "#fff", 800);
    txt(g, "YOU WON A", 0, -h * 0.28, 76 * k.u, INK, 900); txt(g, "FREE CRUISE!", 0, -h * 0.15, 92 * k.u, P.red, 900);
    // ship + waves
    g.fillStyle = "#fff"; g.beginPath(); g.moveTo(-230 * k.u, 70 * k.u); g.lineTo(230 * k.u, 70 * k.u); g.lineTo(180 * k.u, 150 * k.u); g.lineTo(-180 * k.u, 150 * k.u); g.closePath(); g.fill(); rr(g, -130 * k.u, -10 * k.u, 240 * k.u, 80 * k.u, 10 * k.u, "#fff"); rr(g, -40 * k.u, -80 * k.u, 90 * k.u, 70 * k.u, 10 * k.u, P.red);
    [-90, -20, 50].forEach((x) => circle(g, x * k.u, 30 * k.u, 15 * k.u, "#7fd3ff")); g.fillStyle = "#2a7fd6"; for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(-w / 2 + (i + 0.5) * w / 9, h * 0.36 + Math.sin(k.t * 3 + i) * 8 * k.u, w / 18, Math.PI, 0); g.fill(); }
    rr(g, -w * 0.28, h * 0.28, w * 0.56, 100 * k.u, 50 * k.u, P.red); txt(g, "CLAIM NOW", 0, h * 0.28 + 50 * k.u, 48 * k.u, "#fff", 800); g.restore();
    const gy = k.Y(0.74); floor(k, gy, "#c9cfe0", "#b6bdd3"); shadow(k, k.X(0.2), gy, 300 * k.u); pixel(k, { x: k.X(0.2), y: gy, s: 330, label: "PNG", mood: "worried", look: [0.9, -0.5] });
    txt(g, "?", k.X(0.32), k.Y(0.52) + Math.sin(k.t * 4) * 8 * k.u, 120 * k.u, P.indigo, 800);
  },
  // 6b — Pixel is done.
  "pixel-annoyed": (k) => {
    webgrey(k); const gy = k.Y(0.72); floor(k, gy, "#c9cfe0", "#b6bdd3"); shadow(k, k.X(0.5), gy, 480 * k.u);
    pixel(k, { x: k.X(0.5), y: gy, s: 520, label: "PNG", mood: "annoyed", arms: "cross", walk: 1.6, look: [0, 0.2], rot: Math.sin(k.t * 3.2) * 0.012 });
    ["tap", "tap", "tap"].forEach((t, i) => { const a = clamp01((k.t * 3 - i * 0.6) % 2); k.g.globalAlpha = a < 0.7 ? a : 0; txt(k.g, "tap", k.X(0.76) + i * 40 * k.u, k.Y(0.66) - i * 60 * k.u, 46 * k.u, P.grey, 700); k.g.globalAlpha = 1; });
  },
  // 7 — "Then comes the scary part."
  "dark-hall": (k) => {
    night(k); const g = k.g, gy = k.Y(0.7); floor(k, gy, "#181d44", "#0d1030");
    const fl = 0.55 + 0.45 * (Math.sin(k.t * 9) > -0.7 ? 1 : 0.2);
    g.save(); const gr = g.createLinearGradient(0, 0, 0, gy); gr.addColorStop(0, "rgba(255,244,200," + 0.38 * fl + ")"); gr.addColorStop(1, "rgba(255,244,200,0.02)"); g.fillStyle = gr; g.beginPath(); g.moveTo(k.X(0.4), 0); g.lineTo(k.X(0.6), 0); g.lineTo(k.X(0.78), gy); g.lineTo(k.X(0.22), gy); g.closePath(); g.fill(); g.restore();
    doorway(k, { x: k.X(0.5), y: gy - 20 * k.u, w: 560, h: 880, open: 0, color: "#161b57", noMark: true, inner: "#0d1030" });
    for (let i = 0; i < 4; i++) { const a = clamp01((k.t - 0.5 - i * 0.2) * 4), b = (Math.sin(k.t * 2 + i * 2) > 0.85) ? 0.1 : 1, x = k.X(0.38 + (i % 2) * 0.24) + (i > 1 ? 40 : -20) * k.u, y = k.Y(0.36 + (i >> 1) * 0.1);
      g.save(); g.globalAlpha = a; g.fillStyle = i % 2 ? P.yellow : P.red; [-1, 1].forEach((d) => { g.beginPath(); g.ellipse(x + d * 28 * k.u, y, 15 * k.u, 15 * k.u * b, 0, 0, 7); g.fill(); }); g.restore(); }
    shadow(k, k.X(0.5), gy + 30 * k.u, 240 * k.u); pixel(k, { x: k.X(0.5), y: gy + 30 * k.u, s: 260, label: "PNG", mood: "worried", look: [Math.sin(k.t * 2), -0.2] });
  },
  // 8a — "Just upload your file to our servers."
  "conveyor": (k) => {
    k.sky({ stops: ["#1c2150", "#2b3270"] }); const g = k.g, by = k.Y(0.58);
    rr(g, -20, by, k.W + 40, 70 * k.u, 30 * k.u, "#39407a"); g.save(); g.beginPath(); g.rect(0, by, k.W, 70 * k.u); g.clip(); g.fillStyle = "#2a3068"; for (let i = -2; i < 20; i++) { const x = ((i * 90 + k.t * 260) % (k.W + 180)) - 90; g.fillRect(x * 1, by, 40 * k.u, 70 * k.u); } g.restore();
    for (let i = 0; i < 8; i++) circle(g, 90 * k.u + i * 150 * k.u, by + 105 * k.u, 26 * k.u, "#2b3270");
    // the "SERVER" mouth
    rr(g, k.X(0.72), k.Y(0.3), k.X(0.4), k.Y(0.3), 40 * k.u, "#10132f"); g.fillStyle = P.red; [0, 1].forEach((d) => { g.beginPath(); g.ellipse(k.X(0.82) + d * 120 * k.u, k.Y(0.42), 24 * k.u, 24 * k.u * (Math.sin(k.t * 3) > 0.9 ? 0.15 : 1), 0, 0, 7); g.fill(); });
    rr(g, k.X(0.7), k.Y(0.24), k.X(0.26), 88 * k.u, 18 * k.u, P.red); txt(g, "SERVER →", k.X(0.83), k.Y(0.24) + 44 * k.u, 46 * k.u, "#fff", 800);
    const px = k.X(0.2) + k.p * k.X(0.16); pixel(k, { x: px, y: by + 8 * k.u, s: 340, label: "PNG", mood: "worried", look: [1, 0], sweat: true, arms: "down", rot: Math.sin(k.t * 8) * 0.01 });
  },
  // 8b — "Somewhere."
  "faraway-servers": (k) => {
    night(k); k.stars({ n: 60, y1: 0.5, size: 3 }); const g = k.g, gy = k.Y(0.72);
    floor(k, gy, "#141945", "#0b0e2c");
    for (let i = 0; i < 9; i++) { const x = k.X(0.05 + i * 0.11), h = (150 + hash(i) * 150) * k.u; rr(g, x - 30 * k.u, k.Y(0.44) - h, 60 * k.u, h, 8 * k.u, "#1e2560"); for (let j = 0; j < 4; j++) circle(g, x, k.Y(0.44) - h + 30 * k.u + j * 40 * k.u, 5 * k.u, Math.sin(k.t * 4 + i + j) > 0 ? P.red : "#3a4390"); }
    cloud(k, { x: k.X(0.5), y: k.Y(0.18), s: 900, color: "#2c3578" });
    [-1, 1].forEach((d) => { const ex = k.X(0.5) + d * 120 * k.u, ey = k.Y(0.18); circle(g, ex, ey, 70 * k.u, "#fff"); circle(g, ex + Math.sin(k.t * 1.4) * 22 * k.u, ey + 18 * k.u, 32 * k.u, P.redDeep); circle(g, ex + Math.sin(k.t * 1.4) * 22 * k.u, ey + 18 * k.u, 14 * k.u, INK); });
    txt(g, "somewhere...", k.X(0.5), k.Y(0.5), 64 * k.u, "#8c96d8", 600); txt(g, "?", k.X(0.82), k.Y(0.34) + Math.sin(k.t * 3) * 8 * k.u, 150 * k.u, P.yellow, 800);
    shadow(k, k.X(0.5), gy + 40 * k.u, 240 * k.u); pixel(k, { x: k.X(0.5), y: gy + 40 * k.u, s: 280, label: "PNG", mood: "scared", look: [0, -1], arms: "up" });
  },
  // 9 — "Pixel does not love that plan."
  "pixel-panic": (k) => {
    const flash = Math.sin(k.t * 14) > 0; k.sky({ stops: [flash ? "#ffe3e3" : "#ffd0d0", "#ffc2c2"] }); const g = k.g, gy = k.Y(0.7); floor(k, gy, "#f0b4b4", "#e29c9c");
    const jump = k.t > 1.5 ? ease((k.t - 1.5) / 0.5) : 0, px = lerp(k.X(0.5), k.X(1.3), jump), py = gy - Math.sin(clamp01((k.t - 1.5) / 0.6) * Math.PI) * 120 * k.u;
    shadow(k, px, gy, 440 * k.u); pixel(k, { x: px, y: py, s: 470, label: "PNG", mood: "scared", arms: "up", sq: 1 + Math.sin(k.t * 30) * 0.015 });
    for (let i = 0; i < 4; i++) { const a = outBack((k.t - 0.15 - i * 0.12) / 0.25), x = k.X([0.16, 0.84, 0.24, 0.78][i]), y = k.Y([0.24, 0.2, 0.52, 0.5][i]); txt(g, "!!", x, y + Math.sin(k.t * 20 + i) * 6 * k.u, 130 * k.u * a, P.red, 900); }
  },
  // 10a — "So Pixel runs."
  "pixel-run": (k) => {
    k.sky({ stops: ["#fff0d9", "#ffd9c2"] }); const g = k.g, gy = k.Y(0.7); floor(k, gy, "#f3cfa8", "#e4b987");
    const px = lerp(k.X(0.1), k.X(0.9), clamp01(k.p * 1.05)), by = Math.abs(Math.sin(k.t * 13)) * 36 * k.u;
    for (let i = 0; i < 7; i++) { const y = k.Y(0.3 + i * 0.07), x0 = ((k.t * 1400 + i * 320) % (k.W + 400)) - 200; rr(g, k.W - x0 - 240 * k.u, y, 240 * k.u, 8 * k.u, 4 * k.u, "rgba(255,255,255,0.7)"); }
    for (let i = 0; i < 5; i++) { const t = (k.t * 3 + i * 0.2) % 1; circle(g, px - 150 * k.u - i * 60 * k.u, gy - 10 * k.u - t * 40 * k.u, (30 - t * 22) * k.u, "rgba(200,170,130," + (0.5 - t * 0.5) + ")"); }
    shadow(k, px, gy, 300 * k.u); pixel(k, { x: px, y: gy - by, s: 330, label: "PNG", mood: "scared", arms: "up", walk: 5.5, rot: 0.14, look: [1, 0], sq: 1.05 });
  },
  // 10b — "Straight into Forma."
  "forma-door": (k) => {
    k.sky({ stops: ["#dfe5ff", "#f4f0ff"] }); blobs(k, ["#b8c0ff", "#ffd9e6", "#c9f0e0"]); const g = k.g, gy = k.Y(0.72); floor(k, gy, "#e4e8ff", "#cfd6ff");
    const op = ease((k.t - 0.25) / 0.55); doorway(k, { x: k.X(0.5), y: gy, w: 600, h: 950, open: op });
    const run = clamp01((k.t - 0.7) / 0.9), px = lerp(k.X(-0.1), k.X(0.5), run), sc = lerp(1, 0.35, ease((run - 0.55) / 0.45));
    shadow(k, px, gy, 300 * k.u * sc); if (run < 1) pixel(k, { x: px, y: gy - Math.abs(Math.sin(k.t * 12)) * 26 * k.u * sc, s: 320 * sc, label: "PNG", mood: "happy", arms: "up", walk: 5, rot: 0.08, look: [1, 0] });
    for (let i = 0; i < 6; i++) { const a = clamp01((k.t - 1.3 - i * 0.07) * 3); sparkle(k, k.X(0.5) + Math.cos(i * 1.2) * 300 * k.u, gy - 460 * k.u + Math.sin(i * 1.7) * 220 * k.u, 30 * k.u * a, i % 2 ? P.yellow : "#fff", k.t * 2); }
  },
  // 11a — "Forma converts right on your device."
  "home-bubble": (k) => {
    k.sky({ stops: ["#dfe8ff", "#f4f1ff"] }); blobs(k, ["#b8c0ff", "#ffd9e6", "#c9f0e0"]); const g = k.g, cx = k.X(0.5), cy = k.Y(0.4), R = 480 * k.u;
    const gr = g.createRadialGradient(cx, cy, R * 0.2, cx, cy, R); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(1, "rgba(52,72,237,0.3)"); g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill(); g.strokeStyle = P.indigo; g.lineWidth = 12 * k.u; g.stroke();
    const sc = laptop(k, { x: cx, y: cy + 10 * k.u, w: 520, bg: "#fff8ec" });
    g.save(); g.beginPath(); g.rect(sc.x, sc.y, sc.w, sc.h); g.clip(); g.fillStyle = "#ffe9c7"; g.fillRect(sc.x, sc.y + sc.h * 0.72, sc.w, sc.h * 0.3);
    pixel(k, { x: sc.x + sc.w / 2, y: sc.y + sc.h * 0.9 + Math.abs(Math.sin(k.t * 3)) * -8 * k.u, s: 190, label: "PNG", mood: "happy", arms: "wave", look: [0.2, 0.1] }); g.restore();
    lock(k, { x: cx, y: cy - R - 10 * k.u, s: 150, color: P.indigo, shackle: "#9aa6ff" });
    for (let i = 0; i < 5; i++) { const t = (k.t * 0.5 + i * 0.2) % 1; g.save(); g.globalAlpha = 1 - t; g.fillStyle = "#ff7fa1"; g.font = `${60 * k.u}px ${FONT}`; g.textAlign = "center"; g.fillText("♥", cx + (hash(i) - 0.5) * 520 * k.u, cy + 330 * k.u - t * 560 * k.u); g.restore(); }
  },
  // 11b — "...or phone."
  "phone-laptop": (k) => {
    k.sky({ stops: ["#dfe8ff", "#f4f1ff"] }); blobs(k, ["#b8c0ff", "#ffd9e6", "#c9f0e0"]); const g = k.g, R = 285 * k.u;
    const bub = (cx, cy) => { const gr = g.createRadialGradient(cx, cy, R * 0.2, cx, cy, R); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(1, "rgba(52,72,237,0.28)"); g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill(); g.strokeStyle = P.indigo; g.lineWidth = 10 * k.u; g.stroke(); };
    const L = { x: k.X(0.27), y: k.Y(0.34) }, Pn = { x: k.X(0.72), y: k.Y(0.56) }, A = outBack(k.t / 0.4), B = outBack((k.t - 0.25) / 0.4);
    g.save(); g.translate(L.x, L.y); g.scale(A, A); g.translate(-L.x, -L.y); bub(L.x, L.y); const sc = laptop(k, { x: L.x, y: L.y + 6 * k.u, w: 330, bg: "#fff8ec" });
    pixel(k, { x: sc.x + sc.w / 2, y: sc.y + sc.h * 0.95, s: 125, label: "PNG", mood: "happy", arms: "wave" }); lock(k, { x: L.x, y: L.y - R - 8 * k.u, s: 100, color: P.indigo, shackle: "#9aa6ff" }); g.restore();
    g.save(); g.translate(Pn.x, Pn.y); g.scale(B, B); g.translate(-Pn.x, -Pn.y); bub(Pn.x, Pn.y); const ps = phone(k, { x: Pn.x, y: Pn.y, h: 470, bg: "#fff8ec" });
    pixel(k, { x: ps.x + ps.w / 2, y: ps.y + ps.h * 0.92, s: 130, label: "WEBP", color: P.green, mood: "happy", arms: "wave" }); lock(k, { x: Pn.x, y: Pn.y - R - 8 * k.u, s: 100, color: P.indigo, shackle: "#9aa6ff" }); g.restore();
  },
  // 12a — "One drop."
  "drop": (k) => {
    pastel(k); const g = k.g, c = dropCard(k, { x: k.X(0.5), y: k.Y(0.5), w: 880, noPlus: true, noText: true }), t = k.t;
    const fall = clamp01(t / 0.5), y = lerp(-300 * k.u, c.y + c.h * 0.78, fall * fall), sq = t > 0.5 ? 1 - 0.2 * Math.max(0, 1 - (t - 0.5) * 6) : 1.1;
    if (t > 0.5) { const r = (t - 0.5) * 900 * k.u; g.save(); g.globalAlpha = Math.max(0, 1 - (t - 0.5) * 2.2); g.strokeStyle = P.indigo; g.lineWidth = 10 * k.u; g.beginPath(); g.ellipse(k.X(0.5), c.y + c.h * 0.78, r, r * 0.25, 0, 0, 7); g.stroke(); g.restore(); }
    pixel(k, { x: k.X(0.5), y, s: 300, label: "PNG", mood: t > 0.5 ? "happy" : "wow", arms: "up", sq, look: [0, 0.6] }); txt(g, "Drop something in", k.X(0.5), c.y + c.h * 0.17, 74 * k.u, INK, 700);
  },
  // 12b — "One click."
  "click": (k) => {
    pastel(k); const g = k.g, press = k.t > 0.5 && k.t < 0.62, w = 700 * k.u, h = 200 * k.u, sc = press ? 0.94 : 1 + (k.t > 0.62 ? 0.04 * Math.max(0, 1 - (k.t - 0.62) * 6) : 0);
    g.save(); g.translate(k.X(0.5), k.Y(0.42)); g.scale(sc, sc); g.shadowColor = "rgba(52,72,237,0.4)"; g.shadowBlur = 40 * k.u; g.shadowOffsetY = 14 * k.u; rr(g, -w / 2, -h / 2, w, h, h / 2, P.indigo); g.shadowColor = "transparent"; txt(g, "Convert to WebP  →", 0, 4 * k.u, 66 * k.u, "#fff", 800); g.restore();
    const e = ease(k.t / 0.5); cursor(k, k.X(0.78 - 0.2 * e), k.Y(0.7 - 0.24 * e), 100);
    if (k.t > 0.5) { const r = (k.t - 0.5) * 700 * k.u; g.save(); g.globalAlpha = Math.max(0, 1 - (k.t - 0.5) * 2.4); g.strokeStyle = P.indigo2; g.lineWidth = 10 * k.u; g.beginPath(); g.arc(k.X(0.58), k.Y(0.46), r, 0, 7); g.stroke(); g.restore(); }
    pixel(k, { x: k.X(0.22), y: k.Y(0.76), s: 230, label: "PNG", mood: k.t > 0.5 ? "wow" : "happy", arms: "up", look: [0.8, -0.6] });
  },
  // 13 — "And just like that, Pixel is a WebP!"
  "transform": (k) => {
    const t = k.t; k.sky({ stops: ["#3448ed", "#6b7afa", "#b8c0ff"] }); const g = k.g, gy = k.Y(0.7); k.rays({ x: 0.5, y: 0.45, angle: 270, spread: 180, n: 10, a: 0.08, width: 80 });
    floor(k, gy, "#dfe4ff", "#b8c0ff");
    const spin = ease((t - 0.45) / 1.0), rise = Math.sin(clamp01((t - 0.45) / 1.0) * Math.PI) * 220 * k.u, done = t > 1.45;
    const sq = t < 0.45 ? 1 - 0.12 * (t / 0.45) : (t < 1.45 ? 1.06 : 1 - 0.16 * Math.max(0, 1 - (t - 1.45) * 6));
    const mixv = ease((t - 0.8) / 0.4), label = mixv > 0.5 ? "WEBP" : "PNG", colr = mixv > 0.5 ? P.green : P.indigo;
    const wsc = t < 0.45 || t > 1.45 ? 1 : Math.abs(Math.cos(spin * Math.PI * 2));
    shadow(k, k.X(0.5), gy, 380 * k.u * (1 - rise / (500 * k.u)));
    g.save(); g.translate(k.X(0.5), gy - rise); g.scale(t >= 0.45 && t <= 1.45 ? Math.max(0.3, wsc) : 1, 1); g.translate(-k.X(0.5), -(gy - rise));
    pixel(k, { x: k.X(0.5), y: gy - rise - (done ? Math.abs(Math.sin((t - 1.45) * 6)) * 26 * k.u * Math.max(0, 1 - (t - 1.45)) : 0), s: 440 - 60 * mixv, label, color: colr, mood: done ? "proud" : (t > 0.45 ? "wow" : "worried"), arms: done ? "up" : "down", sq, look: [0, 0] }); g.restore();
    if (t > 1.4) { for (let i = 0; i < 14; i++) { const a = clamp01((t - 1.4) * 2), ang = i / 14 * Math.PI * 2, r = (120 + (t - 1.4) * 520) * k.u; sparkle(k, k.X(0.5) + Math.cos(ang) * r, gy - 300 * k.u + Math.sin(ang) * r * 0.8, 36 * k.u * (1 - clamp01((t - 1.4) / 1.3)) * a, [P.yellow, "#fff", "#ff8fb1", P.mint][i % 4], t * 2 + i); } confetti(k, 60, 0.45, 1.4); }
    if (done) txt(g, "WebP!", k.X(0.5), k.Y(0.2), 150 * k.u * outBack((t - 1.6) / 0.4), "#fff", 900);
  },
  // 14a — "Ninety-seven percent smaller."
  "weigh-in": (k) => {
    pastel(k); const g = k.g, gy = k.Y(0.7), t = k.t, prog = ease((t - 0.35) / 1.1), kib = lerp(765.1, 23.2, prog);
    floor(k, gy, "#f6e9d6", "#eadbc3");
    rr(g, k.X(0.16), gy - 40 * k.u, k.X(0.68), 100 * k.u, 36 * k.u, "#c9cfe0"); rr(g, k.X(0.16), gy - 62 * k.u, k.X(0.68), 50 * k.u, 25 * k.u, "#e3e7f5");   // the scale
    rr(g, k.X(0.14), k.Y(0.1), k.X(0.72), 190 * k.u, 40 * k.u, INK); txt(g, kib.toFixed(1) + " KiB", k.X(0.5), k.Y(0.1) + 95 * k.u, 110 * k.u, prog > 0.98 ? "#7dffb0" : "#ffd36b", 800);
    shadow(k, k.X(0.5), gy - 60 * k.u, 300 * k.u);
    pixel(k, { x: k.X(0.5), y: gy - 62 * k.u, s: 440 - 110 * prog, label: prog > 0.5 ? "WEBP" : "PNG", color: prog > 0.5 ? P.green : P.indigo, mood: prog > 0.98 ? "proud" : (prog > 0.05 ? "wow" : "worried"), arms: prog > 0.98 ? "up" : "down", sweat: prog < 0.3, sq: 1 - 0.1 * (1 - prog) });
    const b = outBack((t - 1.5) / 0.4); if (b > 0) { g.save(); g.translate(k.X(0.78), k.Y(0.3)); g.rotate(-0.08); g.scale(b, b); rr(g, -190 * k.u, -75 * k.u, 380 * k.u, 150 * k.u, 75 * k.u, P.green); txt(g, "−97%", 0, 4 * k.u, 92 * k.u, "#fff", 900); g.restore(); }
  },
  // 14b — "Pixel has never felt lighter."
  "pixel-float": (k) => {
    k.sky({ stops: ["#8fb4f5", "#cfe4ff", "#fff1dc"] }); const g = k.g, t = k.t; k.clouds({ y: 0.08, band: 0.7, n: 14, size: 1.4, drift: 10 });
    const rise = Math.min(1, t / 0.9), py = lerp(k.Y(0.9), k.Y(0.52), ease(rise)) + Math.sin(t * 2) * 14 * k.u, px = k.X(0.5) + Math.sin(t * 1.2) * 20 * k.u;
    [[-110, -420, P.indigo, -30], [0, -520, "#ff8fb1", 0], [110, -430, P.yellow, 30]].forEach(([dx, dy, c, sw], i) => balloon(k, px + dx * k.u, py + dy * k.u + Math.sin(t * 2 + i) * 10 * k.u, 90 * k.u, c, sw * k.u));
    pixel(k, { x: px, y: py + 180 * k.u, s: 300, label: "WEBP", color: P.green, mood: "proud", arms: "up", walk: 0 });
    const b = outBack((t - 0.5) / 0.4); g.save(); g.translate(k.X(0.2), k.Y(0.2)); g.rotate(-0.1); g.scale(b, b); rr(g, -190 * k.u, -75 * k.u, 380 * k.u, 150 * k.u, 75 * k.u, P.green); txt(g, "−97%", 0, 4 * k.u, 92 * k.u, "#fff", 900); g.restore();
  },
  // 15 — "Soon, everyone's lining up."
  "queue": (k) => {
    pastel(k); const g = k.g, gy = k.Y(0.7); floor(k, gy, "#f6e9d6", "#eadbc3");
    doorway(k, { x: k.X(0.9), y: gy, w: 280, h: 560, open: 0.9 });
    const fr = [["PDF", P.red], ["MP3", "#1ba5b8"], ["MP4", "#e0457b"], ["ZIP", "#9a6a3a"], ["Aa", "#7a5af8"]];
    fr.forEach(([l, c], i) => { const x = k.X(0.09 + i * 0.145) + (1 - clamp01(k.t / 0.6)) * -k.X(0.4), y = gy - Math.abs(Math.sin(k.t * 6 + i * 1.1)) * 26 * k.u; shadow(k, x, gy, 150 * k.u); buddy(k, { x, y, s: 150, label: l, color: c, mood: i % 2 ? "happy" : "wow", arms: "up", look: [1, -0.1], walk: 0 }); });
    shadow(k, k.X(0.76), gy, 200 * k.u); pixel(k, { x: k.X(0.76), y: gy, s: 200, label: "WEBP", color: P.green, mood: "proud", arms: "wave" });
    speech(k, { x: k.X(0.4), y: k.Y(0.26), text: "me next!", w: 400, h: 110, t0: 0.5, tailX: -0.2 });
  },
  // 16 — "Images. PDFs. Audio. Video. Even fonts."
  "fmt-1": (k) => fmtPair(k, [["JPG", "#f2884b"], ["PDF", P.red]], ["#fff3e0", "#ffe0e0"], ["#f2884b", P.red]),
  "fmt-2": (k) => fmtPair(k, [["MP3", "#1ba5b8"], ["MP4", "#e0457b"]], ["#e0f7fa", "#ffe0ee"], ["#1ba5b8", "#e0457b"]),
  "fmt-3": (k) => fmtPair(k, [["Aa", "#7a5af8"], ["ZIP", "#9a6a3a"]], ["#ece6ff", "#f3e6d6"], ["#7a5af8", "#9a6a3a"]),
  // 17 — "One door for all of them."
  "one-door": (k) => {
    pastel(k); const g = k.g, gy = k.Y(0.7); floor(k, gy, "#f6e9d6", "#eadbc3"); doorway(k, { x: k.X(0.5), y: gy, w: 520, h: 900, open: 1 });
    const crowd = [["JPG", "#f2884b"], ["PDF", P.red], ["MP3", "#1ba5b8"], ["MP4", "#e0457b"], ["Aa", "#7a5af8"], ["ZIP", "#9a6a3a"]];
    crowd.forEach(([l, c], i) => { const side = i % 2 ? 1 : -1, row = i >> 1, tt = clamp01((k.t - row * 0.2) / 1.0), x = lerp(k.X(0.5) + side * k.X(0.4 - row * 0.03), k.X(0.5), ease(tt)), sc = lerp(1, 0.25, ease((tt - 0.6) / 0.4)), y = gy + 10 * k.u * row - Math.abs(Math.sin(k.t * 7 + i)) * 24 * k.u;
      if (tt < 1) buddy(k, { x, y, s: 200 * sc, label: l, color: c, mood: "happy", arms: "up", look: [-side, 0], walk: 0, rot: side * -0.08 }); });
    shadow(k, k.X(0.5), gy, 260 * k.u); pixel(k, { x: k.X(0.5) - 0, y: gy + 130 * k.u, s: 240, label: "WEBP", color: P.green, mood: "proud", arms: "wave" });
    for (let i = 0; i < 8; i++) sparkle(k, k.X(0.5) + Math.cos(i * 0.8 + k.t) * 300 * k.u, gy - 520 * k.u + Math.sin(i * 1.3) * 160 * k.u, 22 * k.u * (0.6 + 0.4 * Math.sin(k.t * 5 + i)), i % 2 ? P.yellow : "#fff", k.t);
  },
  // 18a — "No sign-ups."
  "no-signup": (k) => {
    pastel(k); const g = k.g, cx = k.X(0.42), cy = k.Y(0.36), w = 640 * k.u, h = 560 * k.u, s = outBack(k.t / 0.3);
    g.save(); g.translate(cx, cy); g.rotate(-0.03); g.scale(s, s); g.shadowColor = "rgba(30,36,80,0.25)"; g.shadowBlur = 30 * k.u; rr(g, -w / 2, -h / 2, w, h, 34 * k.u, "#fff"); g.shadowColor = "transparent";
    txt(g, "Sign up", 0, -h * 0.3, 78 * k.u, INK, 800); [0, 1].forEach((i) => rr(g, -w * 0.36, -h * 0.1 + i * 130 * k.u, w * 0.72, 86 * k.u, 20 * k.u, "#eef0f8")); rr(g, -w * 0.36, h * 0.28, w * 0.72, 100 * k.u, 26 * k.u, P.orange);
    const x = clamp01((k.t - 0.45) / 0.35); g.strokeStyle = P.red; g.lineWidth = 34 * k.u; g.lineCap = "round"; g.beginPath(); g.moveTo(-w * 0.45, -h * 0.45); g.lineTo(-w * 0.45 + w * 0.9 * Math.min(1, x * 2), -h * 0.45 + h * 0.9 * Math.min(1, x * 2)); if (x > 0.5) { g.moveTo(w * 0.45, -h * 0.45); g.lineTo(w * 0.45 - w * 0.9 * (x - 0.5) * 2, -h * 0.45 + h * 0.9 * (x - 0.5) * 2); } g.stroke(); g.restore();
    const gy = k.Y(0.72); floor(k, gy, "#f6e9d6", "#eadbc3"); shadow(k, k.X(0.78), gy, 240 * k.u); pixel(k, { x: k.X(0.78), y: gy - (k.t > 0.8 ? Math.abs(Math.sin((k.t - 0.8) * 7)) * 30 * k.u : 0), s: 280, label: "WEBP", color: P.green, mood: "proud", arms: "up" });
    if (k.t > 0.8) confetti(k, 30, 0.5, 0.8);
  },
  // 18b — "No uploads. Just your device."
  "no-upload": (k) => {
    pastel(k); const g = k.g, cx = k.X(0.5), cy = k.Y(0.22);
    cloud(k, { x: cx, y: cy, s: 640, color: "#c3c9e6" }); const e = clamp01((k.t - 0.1) / 0.45);
    g.strokeStyle = P.red; g.lineWidth = 50 * k.u; g.lineCap = "round"; g.beginPath(); g.moveTo(cx - 210 * k.u, cy - 150 * k.u); g.lineTo(cx - 210 * k.u + 420 * k.u * Math.min(1, e * 2), cy - 150 * k.u + 300 * k.u * Math.min(1, e * 2)); if (e > 0.5) { g.moveTo(cx + 210 * k.u, cy - 150 * k.u); g.lineTo(cx + 210 * k.u - 420 * k.u * (e - 0.5) * 2, cy - 150 * k.u + 300 * k.u * (e - 0.5) * 2); } g.stroke();
    const sc = laptop(k, { x: cx, y: k.Y(0.52), w: 560, bg: "#fff8ec" }); g.save(); g.beginPath(); g.rect(sc.x, sc.y, sc.w, sc.h); g.clip(); pixel(k, { x: sc.x + sc.w / 2, y: sc.y + sc.h * 0.95, s: 200, label: "WEBP", color: P.green, mood: "proud", arms: "wave" }); g.restore();
    lock(k, { x: cx + 330 * k.u, y: k.Y(0.5), s: 140, color: P.indigo, shackle: "#9aa6ff" }); [0, 1, 2].forEach((i) => sparkle(k, k.X(0.15 + i * 0.35), k.Y(0.4 + (i % 2) * 0.12) + Math.sin(k.t * 3 + i) * 8 * k.u, 26 * k.u, i % 2 ? P.yellow : "#fff", k.t));
  },
  // 19 — "Forma. A fresh start for your files."
  "end-card": (k) => {
    k.sky({ stops: ["#3448ed", "#5667ff", "#8d9bff"] }); glowSpot(k, k.X(0.5), k.Y(0.36), 900 * k.u, "#ffffff", 0.2); const g = k.g, t = k.t;
    const a1 = ease(t * 3), a2 = ease(t * 3 - 0.9), a3 = ease(t * 3 - 1.8), a4 = ease(t * 2 - 1.6);
    mark(k, { x: k.X(0.5), y: k.Y(0.27) + (1 - a1) * 40 * k.u, s: 340, colors: ["#ffffff", "#dfe4ff", "#b8c0ff"], grow: a1 });
    g.globalAlpha = a2; txt(g, "forma.", k.X(0.5), k.Y(0.45), 230 * k.u, "#fff", 800); txt(g, "A fresh start for your files", k.X(0.5), k.Y(0.535), 56 * k.u, "#e6e9ff", 600); g.globalAlpha = a3;
    rr(g, k.X(0.18), k.Y(0.59), k.X(0.64), 124 * k.u, 62 * k.u, "rgba(255,255,255,0.16)", "rgba(255,255,255,0.75)", 5 * k.u); txt(g, "forma.thezavino.com", k.X(0.5), k.Y(0.59) + 62 * k.u, 56 * k.u, "#fff", 700); g.globalAlpha = 1;
    const gy = k.Y(0.84); shadow(k, k.X(0.5), gy, 260 * k.u); pixel(k, { x: k.X(0.5), y: gy - Math.abs(Math.sin(t * 3.5)) * 24 * k.u * a4, s: 250, label: "WEBP", color: P.green, mood: "proud", arms: "wave" });
    g.globalAlpha = ease((t - 0.9) * 1.6);
    { const parts = [["a ", 38, 500, "rgba(255,255,255,0.8)"], ["zavino.", 56, 800, "#fff"], [" labs product", 38, 500, "rgba(255,255,255,0.8)"]]; let tw = 0; parts.forEach((p) => { g.font = `${p[2]} ${p[1] * k.u}px ${FONT}`; p.w = g.measureText(p[0]).width; tw += p.w; });
      let xx = k.X(0.5) - tw / 2; parts.forEach((p) => { txt(g, p[0], xx, k.Y(0.935), p[1] * k.u, p[3], p[2], "left"); xx += p.w; }); }
    g.globalAlpha = 1;
    if (t < 1.6) confetti(k, 50, 0.55, 0.2);
  },
};

function fmtPair(k, pair, bgs, cols) {
  k.sky({ stops: [bgs[0], bgs[1]] }); const g = k.g, gy = k.Y(0.72); floor(k, gy, "rgba(255,255,255,0.5)", "rgba(255,255,255,0.8)"); blobs(k, [cols[0], cols[1], "#ffffff"]);
  pair.forEach(([l, c], i) => { const a = outBack((k.t - i * 0.18) / 0.35), x = k.X(i ? 0.7 : 0.3), y = gy - Math.abs(Math.sin(k.t * 5 + i * 2)) * 30 * k.u * clamp01((k.t - 0.4) * 2);
    if (a <= 0) return; shadow(k, x, gy, 300 * k.u * a); g.save(); g.translate(x, gy); g.scale(a, a); g.translate(-x, -gy); buddy(k, { x, y, s: 380, label: l, color: c, mood: i ? "wow" : "happy", arms: i ? "up" : "wave", look: [i ? -0.3 : 0.3, -0.1] }); g.restore();
    sparkle(k, x + (i ? 190 : -190) * k.u, gy - 600 * k.u, 30 * k.u * a, P.yellow, k.t * 2); });
}
