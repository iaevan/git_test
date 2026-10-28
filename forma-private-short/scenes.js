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
  g.save(); g.translate(o.x, o.y); g.rotate(o.rot || 0);
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
function lock(k, o) { // padlock. (x,y) centre of body; s = body width px
  const g = k.g, s = o.s * k.u, col = o.color || P.red;
  g.save(); g.translate(o.x, o.y);
  g.lineWidth = s * 0.17; g.lineCap = "round"; g.strokeStyle = o.shackle || "#c3c8d8";
  g.beginPath();
  if (o.open) { g.arc(s * 0.18, -s * 0.5, s * 0.3, Math.PI, 0); g.lineTo(s * 0.48, -s * 0.5 + s * 0.12); }
  else { g.arc(0, -s * 0.5, s * 0.3, Math.PI, 0); g.lineTo(s * 0.3, -s * 0.42); }
  g.moveTo(-s * 0.3, -s * 0.5); g.lineTo(-s * 0.3, -s * 0.28); g.stroke();
  rr(g, -s / 2, -s * 0.3, s, s * 0.8, s * 0.12, col);
  circle(g, 0, s * 0.06, s * 0.09, P.ink); rr(g, -s * 0.035, s * 0.08, s * 0.07, s * 0.2, s * 0.03, P.ink);
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
const bgRoom = (k, top, bottom, deskY, desk) => { k.sky({ stops: [top, bottom] }); k.g.fillStyle = desk; k.g.fillRect(0, k.Y(deskY), k.W, k.H - k.Y(deskY)); k.g.fillStyle = "rgba(0,0,0,0.12)"; k.g.fillRect(0, k.Y(deskY), k.W, 10 * k.u); };
/** over-the-shoulder: a back-view head and shoulders at the bottom of the frame */
const overShoulder = (k, o) => k.person({ x: o.x ?? 0.5, y: o.y ?? 1.86, h: o.h ?? 1.0, facing: "back", pose: "stand", hair: o.hair || "long", top: o.top || P.indigo, hairColor: o.hairColor || "#2a1d16", skin: "#b9825a", silhouette: o.silhouette || null, rim: o.rim || null });

window.SCENES = {
  // ───────────── 1 · "Need a quick file conversion?" ─────────────
  "desk-need": (k) => {
    bgRoom(k, "#f7ead2", "#efd9b4", 0.66, P.wood);
    // window with soft sky
    rr(k.g, k.X(0.08), k.Y(0.06), k.X(0.28), k.Y(0.2), 18 * k.u, "#cfe3ff"); rr(k.g, k.X(0.08), k.Y(0.06), k.X(0.28), k.Y(0.2), 18 * k.u, null, "#fff", 12 * k.u);
    const s = laptop(k, { x: k.X(0.5), y: k.Y(0.43), w: 800, bg: P.paper });
    const f = bob(k, 10, 2.2);
    fileCard(k, { x: s.x + s.w * 0.3, y: s.y + s.h * 0.5 + f, s: 240, label: "PNG", photo: true, rot: -0.06 });
    txt(k.g, "→", s.x + s.w * 0.55, s.y + s.h * 0.5, 120 * k.u, P.indigo, 800);
    circle(k.g, s.x + s.w * 0.78, s.y + s.h * 0.5 + f, 92 * k.u, P.mist); txt(k.g, "?", s.x + s.w * 0.78, s.y + s.h * 0.52 + f, 130 * k.u, P.indigo, 800);
    overShoulder(k, { top: P.indigo });
  },
  // ───────────── 2 · "So you open a free converter website." ─────────────
  "search-page": (k) => {
    k.sky({ stops: ["#e9edf7", "#d7dcec"] });
    const b = browser(k, { x: k.X(0.5), y: k.Y(0.42), w: 940, h: 1250, url: "free file converter" });
    const g = k.g, n = Math.floor(clamp01(k.p * 1.6) * 19);
    rr(g, b.x + b.w * 0.07, b.y + b.h * 0.05, b.w * 0.86, 100 * k.u, 50 * k.u, "#eef0f8", P.indigo2, 6 * k.u);
    txt(g, "free file converter".slice(0, n) + (Math.floor(k.t * 3) % 2 ? "|" : ""), b.x + b.w * 0.12, b.y + b.h * 0.05 + 50 * k.u, 46 * k.u, P.ink, 600, "left");
    for (let i = 0; i < 4; i++) {
      const yy = b.y + b.h * (0.23 + i * 0.18);
      circle(g, b.x + b.w * 0.11, yy, 26 * k.u, [P.orange, P.green, P.indigo2, P.red][i]);
      rr(g, b.x + b.w * 0.19, yy - 34 * k.u, b.w * (0.5 - i * 0.04), 26 * k.u, 13 * k.u, P.indigo);
      rr(g, b.x + b.w * 0.19, yy + 4 * k.u, b.w * 0.7, 18 * k.u, 9 * k.u, P.greyLight); rr(g, b.x + b.w * 0.19, yy + 34 * k.u, b.w * 0.55, 18 * k.u, 9 * k.u, P.greyLight);
    }
    magnifier(k, { x: k.X(0.86), y: k.Y(0.72) + bob(k, 8, 2), s: 230, color: P.ink });
  },
  "converter-site": (k) => {
    k.sky({ stops: ["#e9edf7", "#d7dcec"] });
    const b = browser(k, { x: k.X(0.5), y: k.Y(0.42), w: 940, h: 1250, url: "free-converter.biz" });
    const g = k.g;
    rr(g, b.x, b.y, b.w, b.h * 0.1, 0, P.orange); txt(g, "FREE FILE CONVERTER", b.x + b.w / 2, b.y + b.h * 0.05, 52 * k.u, "#fff", 800);
    rr(g, b.x + b.w * 0.1, b.y + b.h * 0.2, b.w * 0.8, b.h * 0.42, 30 * k.u, "#fff7ea", P.orange, 8 * k.u);
    fileCard(k, { x: b.x + b.w / 2, y: b.y + b.h * 0.37 + bob(k, 8, 2), s: 190, label: "PNG", photo: true });
    rr(g, b.x + b.w * 0.22, b.y + b.h * 0.7, b.w * 0.56, 120 * k.u, 60 * k.u, P.orange); txt(g, "UPLOAD", b.x + b.w / 2, b.y + b.h * 0.7 + 60 * k.u, 54 * k.u, "#fff", 800);
    cursor(k, b.x + b.w * (0.62 - 0.1 * ease(k.p)), b.y + b.h * (0.86 - 0.12 * ease(k.p)), 80);
    ad(k, { x: b.x + b.w * 0.82, y: b.y + b.h * 0.9, w: 330, h: 220, color: P.yellow, text: "WIN!", rot: 0.08 });
  },
  // ───────────── 3 · "Ads. Pop-ups. Ads on top of ads." ─────────────
  "ads-1": (k) => {
    k.sky({ stops: ["#e9edf7", "#d7dcec"] });
    const b = browser(k, { x: k.X(0.5), y: k.Y(0.42), w: 940, h: 1250, url: "free-converter.biz" });
    rr(k.g, b.x, b.y, b.w, b.h * 0.1, 0, P.orange); txt(k.g, "FREE FILE CONVERTER", b.x + b.w / 2, b.y + b.h * 0.05, 52 * k.u, "#fff", 800);
    const sh = (i) => Math.sin(k.t * 9 + i) * 5 * k.u;
    const a = ease(k.p * 2.2);
    ad(k, { x: b.x + b.w * 0.28, y: b.y + b.h * 0.28 + sh(1), w: 470, h: 340, color: P.yellow, text: "FREE!!", rot: -0.08 });
    if (k.p > 0.18) ad(k, { x: b.x + b.w * 0.7, y: b.y + b.h * 0.42 + sh(2), w: 480, h: 350, color: "#ff8fb1", text: "WIN $$$", cta: "CLAIM", rot: 0.07 });
    if (k.p > 0.4) ad(k, { x: b.x + b.w * 0.34, y: b.y + b.h * 0.62 + sh(3), w: 500, h: 360, color: "#8ee0c2", text: "HOT!", cta: "OPEN", rot: -0.04 });
    if (k.p > 0.62) ad(k, { x: b.x + b.w * 0.72, y: b.y + b.h * 0.8 + sh(4), w: 420, h: 300, color: "#b9a8ff", text: "SALE", rot: 0.1 });
    rr(k.g, b.x, b.y + b.h - 90 * k.u, b.w, 90 * k.u, 0, (Math.floor(k.t * 4) % 2) ? P.red : P.yellow);
    txt(k.g, "★ CLICK HERE ★", b.x + b.w / 2, b.y + b.h - 45 * k.u, 46 * k.u, P.ink, 800);
  },
  "ads-2": (k) => {
    k.sky({ stops: ["#e9edf7", "#d7dcec"] });
    const b = browser(k, { x: k.X(0.5), y: k.Y(0.42), w: 940, h: 1250, url: "free-converter.biz", bg: "#fff3d6" });
    const cols = [P.yellow, "#ff8fb1", "#8ee0c2", "#b9a8ff", P.orange, "#7fc4ff", P.red], txts = ["FREE!!", "WIN $$$", "HOT!", "SALE", "NEW!", "100%", "BONUS"];
    for (let i = 0; i < 7; i++) {
      const row = Math.floor(i / 2), col = i % 2, sh = Math.sin(k.t * (7 + i) + i) * 6 * k.u;
      ad(k, { x: b.x + b.w * (col ? 0.68 : 0.32) + (row % 2 ? 40 * k.u : -30 * k.u) + sh, y: b.y + b.h * (0.12 + row * 0.2) + sh * 0.6, w: 520, h: 380, color: cols[i], text: txts[i], rot: (i % 2 ? 1 : -1) * (0.05 + i * 0.012), size: 0.28 });
    }
  },
  // ───────────── 4 · "Sometimes they even want you to sign up." ─────────────
  "signup-modal": (k) => {
    k.sky({ stops: ["#c9cde0", "#aeb4cc"] });
    const b = browser(k, { x: k.X(0.5), y: k.Y(0.42), w: 940, h: 1250, url: "free-converter.biz", bg: "#e6e8f2", barColor: "#c4c8da" });
    k.g.fillStyle = "rgba(20,24,50,0.5)"; k.g.fillRect(b.x, b.y, b.w, b.h);
    const s = 0.82 + 0.18 * ease(k.p * 3), g = k.g, cx = k.X(0.5), cy = k.Y(0.43);
    g.save(); g.translate(cx, cy); g.scale(s, s); g.translate(-cx, -cy);
    const w = 760 * k.u, h = 760 * k.u; g.shadowColor = "rgba(0,0,0,0.4)"; g.shadowBlur = 40 * k.u; rr(g, cx - w / 2, cy - h / 2, w, h, 40 * k.u, P.white); g.shadowColor = "transparent";
    txt(g, "Sign up", cx, cy - h * 0.34, 84 * k.u, P.ink, 800); txt(g, "to continue", cx, cy - h * 0.2, 54 * k.u, P.grey, 600);
    rr(g, cx - w * 0.38, cy - h * 0.07, w * 0.76, 98 * k.u, 22 * k.u, "#eef0f8", P.greyLight, 5 * k.u); txt(g, "Email", cx - w * 0.33, cy - h * 0.07 + 49 * k.u, 42 * k.u, P.grey, 500, "left");
    rr(g, cx - w * 0.38, cy + h * 0.1, w * 0.76, 98 * k.u, 22 * k.u, "#eef0f8", P.greyLight, 5 * k.u); txt(g, "Password", cx - w * 0.33, cy + h * 0.1 + 49 * k.u, 42 * k.u, P.grey, 500, "left");
    rr(g, cx - w * 0.38, cy + h * 0.27, w * 0.76, 116 * k.u, 30 * k.u, P.orange); txt(g, "Sign up", cx, cy + h * 0.27 + 58 * k.u, 54 * k.u, "#fff", 800);
    g.restore();
  },
  // ───────────── 5 · "But here's the real catch." ─────────────
  "pause-dark": (k) => {
    k.sky({ stops: ["#0f1230", "#1b1f44"] });
    const s = laptop(k, { x: k.X(0.5), y: k.Y(0.42), w: 700, bg: "#1d2250", glow: "rgba(120,140,255,0.5)" });
    const g = k.g;
    rr(g, s.x + s.w * 0.2, s.y + s.h * 0.62, s.w * 0.6, s.h * 0.2, s.h * 0.1, P.orange); txt(g, "UPLOAD", s.x + s.w / 2, s.y + s.h * 0.72, s.h * 0.1, "#fff", 800);
    fileCard(k, { x: s.x + s.w / 2, y: s.y + s.h * 0.3, s: 150, label: "PNG", photo: true });
    const e = ease(k.p); cursor(k, s.x + s.w * (0.85 - 0.28 * e), s.y + s.h * (1.0 - 0.28 * e), 70);
    overShoulder(k, { top: "#4a56c9", rim: "#7c8cff" });
  },
  // ───────────── 6 · "They make you upload your file to their servers." ─────────────
  "upload-beam": (k) => {
    k.sky({ stops: ["#0f1230", "#2a2f6a"] }); k.stars({ n: 70, y1: 0.55, size: 3 });
    const g = k.g, L = { x: k.X(0.3), y: k.Y(0.68) }, S = { x: k.X(0.72), y: k.Y(0.2) };
    cloud(k, { x: S.x, y: S.y, s: 760, color: "#4a54ab" });
    server(k, { x: S.x, y: S.y + 10 * k.u, w: 230, h: 300, units: 4, led: P.red, led2: P.yellow, body: "#1f2656" });
    // beam: a dashed arc with files riding it
    const pt = (t) => { const a = L, b = S, cx = (a.x + b.x) / 2 - 140 * k.u, cy = Math.min(a.y, b.y) - 380 * k.u; const x = (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * cx + t * t * b.x, y = (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * cy + t * t * b.y; return { x, y }; };
    g.save(); g.setLineDash([26 * k.u, 22 * k.u]); g.lineDashOffset = -k.t * 120 * k.u; g.strokeStyle = "rgba(170,185,255,0.8)"; g.lineWidth = 12 * k.u; g.lineCap = "round"; g.beginPath(); for (let i = 0; i <= 40; i++) { const p = pt(i / 40); i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y); } g.stroke(); g.restore();
    [0, 0.33, 0.66].forEach((o, i) => { const t = (k.p * 1.4 + o) % 1, p = pt(t); fileCard(k, { x: p.x, y: p.y, s: 120 * (1 - t * 0.35), label: ["PNG", "PDF", "MP4"][i], rot: t * 1.5 - 0.4, photo: i === 0 }); });
    const ls = laptop(k, { x: L.x, y: L.y - 60 * k.u, w: 460, bg: "#3a47a8", glow: "rgba(140,160,255,0.55)" });
    fileCard(k, { x: ls.x + ls.w / 2, y: ls.y + ls.h / 2, s: 130, label: "PNG", photo: true });
    txt(g, "?", S.x, S.y - 220 * k.u, 170 * k.u, P.yellow, 800);
  },
  "server-hall": (k) => {
    k.sky({ stops: ["#0c0f26", "#1a1f4a"] });
    [0.2, 0.5, 0.8].forEach((x, i) => server(k, { x: k.X(x), y: k.Y(0.45), w: 300, h: 760, units: 7, ph: i * 2, led: i === 1 ? P.red : P.green }));
    const t = ease(k.p * 1.6); fileCard(k, { x: k.X(-0.05 + 0.55 * t), y: k.Y(0.35) + bob(k, 6, 3), s: 220, label: "PNG", photo: true, rot: -0.1 + t * 0.2 });
    k.g.fillStyle = "rgba(0,0,0,0.25)"; k.g.fillRect(0, k.Y(0.82), k.W, k.H);
  },
  // ───────────── 7 · "Your photos. Your documents. On a stranger's computer." ─────────────
  "server-files": (k) => {
    k.sky({ stops: ["#0c0f26", "#1a1f4a"] });
    const g = k.g, w = 880 * k.u, h = 1180 * k.u, x = k.X(0.5) - w / 2, y = k.Y(0.4) - h / 2;
    rr(g, x, y, w, h, 40 * k.u, "#262d5c");
    for (let r = 0; r < 4; r++) {
      const yy = y + 50 * k.u + r * (h - 100 * k.u) / 4;
      rr(g, x + 40 * k.u, yy, w - 80 * k.u, (h - 100 * k.u) / 4 - 24 * k.u, 24 * k.u, "#353d78");
      for (let c = 0; c < 4; c++) fileCard(k, { x: x + 150 * k.u + c * 195 * k.u, y: yy + ((h - 100 * k.u) / 4 - 24 * k.u) / 2 + Math.sin(k.t * 2 + r + c) * 5 * k.u, s: 105, label: ["PNG", "PDF", "DOCX", "JPG"][(r + c) % 4], photo: (r + c) % 2 === 0 });
      circle(g, x + w - 70 * k.u, yy + 40 * k.u, 12 * k.u, Math.sin(k.t * 4 + r) > 0 ? P.red : "#5a6590");
    }
  },
  "stranger": (k) => {
    k.sky({ stops: ["#0c0f26", "#1a1f4a"] });
    [0.12, 0.88].forEach((x, i) => server(k, { x: k.X(x), y: k.Y(0.4), w: 260, h: 700, units: 6, ph: i * 3 }));
    const s = laptop(k, { x: k.X(0.5), y: k.Y(0.34), w: 520, bg: "#202658", glow: "rgba(255,90,100,0.35)" });
    [0, 1, 2].forEach((i) => fileCard(k, { x: s.x + s.w * (0.22 + i * 0.28), y: s.y + s.h * 0.5, s: 130, label: ["PNG", "PDF", "DOCX"][i], photo: i === 0 }));
    k.person({ x: 0.5, y: 1.62, h: 0.95, facing: "back", pose: "stand", hair: "hood", top: "#1a1d33", silhouette: "#0a0c20", rim: "#ff5a64" });
    glowSpot(k, k.X(0.5), k.Y(0.36), 520 * k.u, P.red, 0.12);
  },
  // ───────────── 8 · "That's not very private." ─────────────
  "lock-open": (k) => {
    k.sky({ stops: ["#1a0d1c", "#3a1230"] });
    glowSpot(k, k.X(0.5), k.Y(0.4), 700 * k.u, P.red, 0.35);
    const g = k.g;
    [0, 1, 2, 3, 4].forEach((i) => { const t = (k.t * 0.25 + i * 0.2) % 1; fileCard(k, { x: k.X(0.2 + i * 0.15), y: k.Y(0.18 + t * 0.55), s: 110, label: ["PNG", "PDF", "JPG", "DOCX", "PNG"][i], rot: Math.sin(i + k.t) * 0.4, photo: i % 2 === 0 }); });
    lock(k, { x: k.X(0.5), y: k.Y(0.42) + bob(k, 8, 2), s: 520, open: true, color: P.red });
    // eye
    const ex = k.X(0.5), ey = k.Y(0.12);
    g.save(); g.fillStyle = "#fff"; g.beginPath(); g.moveTo(ex - 150 * k.u, ey); g.quadraticCurveTo(ex, ey - 130 * k.u, ex + 150 * k.u, ey); g.quadraticCurveTo(ex, ey + 130 * k.u, ex - 150 * k.u, ey); g.fill(); circle(g, ex + Math.sin(k.t * 1.5) * 26 * k.u, ey, 52 * k.u, P.redDeep); circle(g, ex + Math.sin(k.t * 1.5) * 26 * k.u, ey, 22 * k.u, P.ink); g.restore();
  },
  // ───────────── 9 · "That's why we built Forma." ─────────────
  "dawn-logo": (k) => {
    k.sky({ stops: ["#2230c9", "#3d4fee", "#7f8dff", "#ffc9a0", "#ffe9c9"], y0: 0, y1: 0.78 });
    k.sun({ x: 0.5, y: 0.74 - 0.05 * ease(k.p), r: 170, color: "#fff4d6", glow: "#ffd9b0", glowSize: 5, glowAlpha: 0.7 });
    k.rays({ x: 0.5, y: 0.74, angle: 270, spread: 70, n: 6, a: 0.14, width: 90 });
    k.ridge({ y: 0.8, amp: 0.03, freq: 3, color: "#1d2677", shape: "soft" });
    mark(k, { x: k.X(0.5), y: k.Y(0.25), s: 400, colors: ["#ffffff", "#e3e7ff", "#c2c9ff"], grow: clamp01(k.p * 2.2) });
    const a = clamp01((k.p - 0.25) * 3); k.g.globalAlpha = a; txt(k.g, "forma.", k.X(0.5), k.Y(0.45), 210 * k.u, "#fff", 800); k.g.globalAlpha = 1;
  },
  // ───────────── 10 · "A web app that converts files right on your own device." ─────────────
  "laptop-forma": (k) => {
    bgRoom(k, "#dfe8ff", "#f1f4ff", 0.7, "#e9d7bd");
    const s = laptop(k, { x: k.X(0.5), y: k.Y(0.44), w: 720, bg: "#f7f8ff", glow: "rgba(52,72,237,0.2)" }), g = k.g;
    mark(k, { x: s.x + s.w * 0.1, y: s.y + s.h * 0.1, s: 56 }); txt(g, "forma.", s.x + s.w * 0.22, s.y + s.h * 0.105, 48 * k.u, P.ink, 800, "left");
    fileCard(k, { x: s.x + s.w * 0.27, y: s.y + s.h * 0.56, s: 170, label: "PNG", photo: true });
    txt(g, "→", s.x + s.w * 0.5, s.y + s.h * 0.56, 100 * k.u, P.indigo, 800);
    const done = ease((k.p - 0.25) * 3); fileCard(k, { x: s.x + s.w * 0.73, y: s.y + s.h * 0.56, s: 170, label: "WEBP", photo: true, scale: 0.85 + 0.15 * done });
    circle(g, s.x + s.w * 0.88, s.y + s.h * 0.34, 34 * k.u * done, P.green); if (done > 0.3) { g.strokeStyle = "#fff"; g.lineWidth = 8 * k.u; g.lineCap = "round"; g.beginPath(); g.moveTo(s.x + s.w * 0.86, s.y + s.h * 0.345); g.lineTo(s.x + s.w * 0.875, s.y + s.h * 0.375); g.lineTo(s.x + s.w * 0.905, s.y + s.h * 0.32); g.stroke(); }
    rr(g, s.x + s.w * 0.3, s.y + s.h * 0.82, s.w * 0.4, s.h * 0.12, s.h * 0.06, P.indigo); txt(g, "Convert", s.x + s.w / 2, s.y + s.h * 0.88, s.h * 0.075, "#fff", 800);
    overShoulder(k, { top: "#6b7afa", hair: "bun" });
  },
  "phone-forma": (k) => {
    k.sky({ stops: ["#e9ecff", "#cdd5ff"] });
    const g = k.g, s = phone(k, { x: k.X(0.5), y: k.Y(0.42) + bob(k, 8, 1.6), h: 1100, bg: "#f7f8ff" });
    mark(k, { x: s.x + s.w * 0.12, y: s.y + s.h * 0.07, s: 54 }); txt(g, "forma.", s.x + s.w * 0.26, s.y + s.h * 0.073, 46 * k.u, P.ink, 800, "left");
    const t = clamp01(k.p * 1.4);
    fileCard(k, { x: s.x + s.w / 2, y: s.y + s.h * 0.33, s: 210, label: t > 0.85 ? "WEBP" : "PNG", photo: true });
    rr(g, s.x + s.w * 0.15, s.y + s.h * 0.56, s.w * 0.7, 36 * k.u, 18 * k.u, P.greyLight); rr(g, s.x + s.w * 0.15, s.y + s.h * 0.56, s.w * 0.7 * t, 36 * k.u, 18 * k.u, P.indigo);
    if (t > 0.85) { circle(g, s.x + s.w / 2, s.y + s.h * 0.72, 54 * k.u, P.green); g.strokeStyle = "#fff"; g.lineWidth = 10 * k.u; g.lineCap = "round"; g.beginPath(); g.moveTo(s.x + s.w / 2 - 22 * k.u, s.y + s.h * 0.72); g.lineTo(s.x + s.w / 2 - 6 * k.u, s.y + s.h * 0.72 + 18 * k.u); g.lineTo(s.x + s.w / 2 + 26 * k.u, s.y + s.h * 0.72 - 20 * k.u); g.stroke(); }
    rr(g, s.x + s.w * 0.2, s.y + s.h * 0.86, s.w * 0.6, s.h * 0.07, s.h * 0.035, P.indigo); txt(g, "Download", s.x + s.w / 2, s.y + s.h * 0.895, s.h * 0.04, "#fff", 800);
  },
  // ───────────── 11 · "Nothing gets sent anywhere. It all happens inside your computer, or your phone." ─────────────
  "bubble-laptop": (k) => {
    k.sky({ stops: ["#dfe8ff", "#f4f1ff"] });
    const g = k.g, cx = k.X(0.5), cy = k.Y(0.4), R = 470 * k.u;
    const gr = g.createRadialGradient(cx, cy, R * 0.2, cx, cy, R); gr.addColorStop(0, "rgba(255,255,255,0.0)"); gr.addColorStop(1, "rgba(52,72,237,0.32)");
    g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill(); g.strokeStyle = P.indigo; g.lineWidth = 12 * k.u; g.stroke();
    const s = laptop(k, { x: cx, y: cy + 20 * k.u, w: 440, bg: "#f7f8ff" });
    fileCard(k, { x: s.x + s.w * 0.3, y: s.y + s.h * 0.5, s: 120, label: "PNG", photo: true }); txt(k.g, "→", s.x + s.w * 0.52, s.y + s.h * 0.5, 70 * k.u, P.indigo, 800); fileCard(k, { x: s.x + s.w * 0.74, y: s.y + s.h * 0.5, s: 120, label: "WEBP", photo: true });
    for (let i = 0; i < 4; i++) { const a = k.t * 1.1 + i * Math.PI / 2; fileCard(k, { x: cx + Math.cos(a) * R * 0.72, y: cy + Math.sin(a) * R * 0.72, s: 105, label: ["PNG", "PDF", "MP4", "WEBP"][i], rot: a * 0.3, photo: i % 2 === 0 }); }
    lock(k, { x: cx, y: cy - R - 10 * k.u, s: 150, color: P.indigo, shackle: "#9aa6ff" });
  },
  "no-cloud": (k) => {
    k.sky({ stops: ["#dfe8ff", "#f4f1ff"] });
    const g = k.g, cx = k.X(0.5), cy = k.Y(0.26);
    cloud(k, { x: cx, y: cy, s: 700, color: "#c3c9e6" });
    g.save(); g.strokeStyle = P.red; g.lineWidth = 56 * k.u; g.lineCap = "round"; const e = ease(k.p * 2.4);
    g.beginPath(); g.moveTo(cx - 230 * k.u, cy - 170 * k.u); g.lineTo(cx - 230 * k.u + 460 * k.u * e, cy - 170 * k.u + 340 * k.u * e); g.stroke();
    if (e > 0.99) { const e2 = ease(k.p * 2.4 - 1.0); g.beginPath(); g.moveTo(cx + 230 * k.u, cy - 170 * k.u); g.lineTo(cx + 230 * k.u - 460 * k.u * e2, cy - 170 * k.u + 340 * k.u * e2); g.stroke(); }
    g.restore();
    // the file stays home
    const s = laptop(k, { x: cx, y: k.Y(0.58), w: 520, bg: "#f7f8ff" });
    fileCard(k, { x: s.x + s.w / 2, y: s.y + s.h / 2 + bob(k, 6, 2), s: 170, label: "PNG", photo: true });
    g.save(); g.setLineDash([22 * k.u, 22 * k.u]); g.strokeStyle = P.greyLight; g.lineWidth = 10 * k.u; g.beginPath(); g.moveTo(cx, k.Y(0.45)); g.lineTo(cx, k.Y(0.36)); g.stroke(); g.restore();
  },
  "bubble-phone": (k) => {
    k.sky({ stops: ["#dfe8ff", "#f4f1ff"] });
    const g = k.g, cx = k.X(0.5), cy = k.Y(0.4), R = 470 * k.u;
    const gr = g.createRadialGradient(cx, cy, R * 0.2, cx, cy, R); gr.addColorStop(0, "rgba(255,255,255,0.0)"); gr.addColorStop(1, "rgba(52,72,237,0.32)");
    g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill(); g.strokeStyle = P.indigo; g.lineWidth = 12 * k.u; g.stroke();
    phone(k, { x: cx, y: cy + 10 * k.u, h: 640, bg: "#f7f8ff" });
    fileCard(k, { x: cx, y: cy + bob(k, 8, 2), s: 140, label: "WEBP", photo: true });
    for (let i = 0; i < 4; i++) { const a = -k.t * 1.1 + i * Math.PI / 2; fileCard(k, { x: cx + Math.cos(a) * R * 0.75, y: cy + Math.sin(a) * R * 0.75, s: 95, label: ["PNG", "GIF", "MP3", "PDF"][i], rot: a * 0.3 }); }
    lock(k, { x: cx, y: cy - R - 10 * k.u, s: 150, color: P.indigo, shackle: "#9aa6ff" });
  },
  // ───────────── 12 · "And converters are hard to find, too." ─────────────
  "search-many": (k) => {
    k.sky({ stops: ["#e9edf7", "#d7dcec"] });
    const b = browser(k, { x: k.X(0.5), y: k.Y(0.42), w: 940, h: 1250, url: "file converter" }), g = k.g;
    const names = ["WebP converter", "PNG converter", "JPG to PDF", "HEIC to JPG", "MP4 to GIF", "WAV to MP3"], cs = [P.green, P.indigo, P.red, P.orange, "#a05be0", "#1ba5b8"];
    names.forEach((n, i) => {
      const yy = b.y + b.h * (0.09 + i * 0.15), a = ease(k.p * 3 - i * 0.25);
      g.globalAlpha = a; rr(g, b.x + b.w * 0.06, yy - 50 * k.u, b.w * 0.88, 110 * k.u, 26 * k.u, "#f3f5fc");
      circle(g, b.x + b.w * 0.14, yy + 5 * k.u, 30 * k.u, cs[i]); txt(g, n, b.x + b.w * 0.22, yy + 5 * k.u, 50 * k.u, P.indigo, 700, "left"); g.globalAlpha = 1;
    });
    ["?", "?", "?"].forEach((q, i) => txt(g, q, k.X(0.1 + i * 0.4), k.Y(0.76 + 0.02 * Math.sin(k.t * 3 + i)), 150 * k.u, P.red, 800));
  },
  // ───────────── 13 · "A WebP converter. A PNG converter. A different tool for every format." ─────────────
  "tool-webp": (k) => toolPage(k, "WEBP", "WebP converter", P.green, "#e8f8ee"),
  "tool-png": (k) => toolPage(k, "PNG", "PNG converter", P.indigo, "#eaedff"),
  "tool-grid": (k) => {
    k.sky({ stops: ["#f1f3fb", "#dde1f2"] });
    const g = k.g, fm = ["WEBP", "PNG", "JPG", "PDF", "GIF", "MP4", "MP3", "HEIC", "SVG", "TIFF", "AVIF", "DOCX"];
    fm.forEach((f, i) => {
      const c = i % 3, r = Math.floor(i / 3), a = ease(k.p * 4 - i * 0.18), x = k.X(0.2 + c * 0.3), y = k.Y(0.13 + r * 0.14) - (1 - a) * 40 * k.u;
      g.globalAlpha = a; const w = 270 * k.u, h = 200 * k.u; g.shadowColor = "rgba(30,36,70,0.2)"; g.shadowBlur = 18 * k.u; rr(g, x - w / 2, y - h / 2, w, h, 26 * k.u, P.white); g.shadowColor = "transparent";
      rr(g, x - w / 2, y - h / 2, w, 58 * k.u, 26 * k.u, ext[f]); txt(g, f, x, y - h / 2 + 30 * k.u, 38 * k.u, "#fff", 800); txt(g, "converter", x, y + 32 * k.u, 34 * k.u, P.steel, 600); rr(g, x - w * 0.3, y + h * 0.3, w * 0.6, 24 * k.u, 12 * k.u, P.greyLight); g.globalAlpha = 1;
    });
  },
  // ───────────── 14 · "Forma has just one input. Drop in any file." ─────────────
  "one-input": (k) => {
    k.sky({ stops: ["#e9ecff", "#cfd6ff"]});
    glowSpot(k, k.X(0.5), k.Y(0.38), 800 * k.u, P.indigo2, 0.28);
    dropCard(k, { x: k.X(0.5), y: k.Y(0.38) + bob(k, 8, 1.6), w: 860 });
    mark(k, { x: k.X(0.5), y: k.Y(0.1), s: 110 });
  },
  "files-fall": (k) => {
    k.sky({ stops: ["#e9ecff", "#cfd6ff"] });
    glowSpot(k, k.X(0.5), k.Y(0.5), 800 * k.u, P.indigo2, 0.28);
    const c = dropCard(k, { x: k.X(0.5), y: k.Y(0.5), w: 860, noPlus: true, noText: true });
    const kinds = ["PNG", "MP4", "PDF", "MP3", "DOCX", "GIF", "JPG"];
    kinds.forEach((f, i) => {
      const t = ((k.t * 0.55 + i * 0.143) % 1), x = k.X(0.2 + ((i * 0.37) % 0.6)), y = k.Y(-0.1 + t * 0.66);
      const sc = 1 - ease((t - 0.7) / 0.3) * 0.6; fileCard(k, { x, y, s: 160, label: f, rot: Math.sin(i * 2 + t * 4) * 0.35, photo: f === "PNG" || f === "JPG", scale: sc });
    });
    txt(k.g, "Drop something in", k.X(0.5), k.Y(0.585), 74 * k.u, P.ink, 700);
  },
  // ───────────── 15 · "Less searching. Less friction." ─────────────
  "happy-person": (k) => {
    k.sky({ stops: ["#8fb4f5", "#cfe4ff", "#fff1dc"] });
    k.sun({ x: 0.78, y: 0.16, r: 90, color: "#fff4d6", glow: "#ffe9a8", glowAlpha: 0.5 });
    k.clouds({ y: 0.08, band: 0.22, n: 14, size: 1.3, drift: 8 });
    k.ridge({ y: 0.58, amp: 0.05, freq: 2.2, color: "#8fcf9a", shape: "soft" });
    k.ground({ y: 0.66, color: "#59b36b", far: "#9ed68b", stripes: 10, flowers: 40 });
    const g = k.g; [0, 1, 2].forEach((i) => fileCard(k, { x: k.X(0.2 + i * 0.3), y: k.Y(0.34 + 0.02 * Math.sin(k.t * 2 + i)), s: 120, label: ["WEBP", "PNG", "MP4"][i], rot: [-0.2, 0.1, 0.2][i], photo: i === 0 }));
    k.person({ x: 0.5, y: 0.9, h: 0.34, pose: "cheer", facing: "front", hair: "long", top: P.indigo, bottom: "#2b3052", skin: "#b9825a" });
    mark(k, { x: k.X(0.5), y: k.Y(0.13), s: 150 });
  },
  // ───────────── 16 · "Forma. Convert files on your own device." ─────────────
  "end-card": (k) => {
    k.sky({ stops: ["#3448ed", "#5667ff", "#8d9bff"] });
    k.stars({ n: 40, y1: 0.4, size: 3 }); glowSpot(k, k.X(0.5), k.Y(0.36), 800 * k.u, "#ffffff", 0.18);
    mark(k, { x: k.X(0.5), y: k.Y(0.28), s: 360, colors: ["#ffffff", "#dfe4ff", "#b8c0ff"] });
    txt(k.g, "forma.", k.X(0.5), k.Y(0.45), 220 * k.u, "#fff", 800);
    txt(k.g, "Convert files on your own device", k.X(0.5), k.Y(0.54), 60 * k.u, "#e6e9ff", 600);
    rr(k.g, k.X(0.2), k.Y(0.6), k.X(0.6), 120 * k.u, 60 * k.u, "rgba(255,255,255,0.18)", "rgba(255,255,255,0.7)", 5 * k.u);
    txt(k.g, "forma.thezavino.com", k.X(0.5), k.Y(0.6) + 60 * k.u, 54 * k.u, "#fff", 700);
  },
};

/** a single-purpose converter page (the "one tool per format" problem) */
function toolPage(k, label, title, color, soft) {
  k.sky({ stops: ["#e9edf7", "#d7dcec"] });
  const b = browser(k, { x: k.X(0.5), y: k.Y(0.42), w: 940, h: 1250, url: title.toLowerCase().replace(" ", "-") + ".com" }), g = k.g;
  rr(g, b.x, b.y, b.w, b.h * 0.12, 0, color); txt(g, title.toUpperCase(), b.x + b.w / 2, b.y + b.h * 0.06, 58 * k.u, "#fff", 800);
  rr(g, b.x + b.w * 0.1, b.y + b.h * 0.22, b.w * 0.8, b.h * 0.46, 30 * k.u, soft, color, 8 * k.u);
  fileCard(k, { x: b.x + b.w / 2, y: b.y + b.h * 0.44 + bob(k, 8, 2), s: 200, label, photo: label !== "PDF" });
  rr(g, b.x + b.w * 0.22, b.y + b.h * 0.76, b.w * 0.56, 120 * k.u, 60 * k.u, color); txt(g, "Choose file", b.x + b.w / 2, b.y + b.h * 0.76 + 60 * k.u, 52 * k.u, "#fff", 800);
}
