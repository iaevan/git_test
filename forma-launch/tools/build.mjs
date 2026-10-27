#!/usr/bin/env node
// Generates the HyperFrames compositions (landscape index.html + reel.html and their scenes) from the recorded
// clips' data/*.json, and writes data/cues.json (every sound cue, in film time) for tools/mix.py.
//
//   node tools/build.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const J = f => JSON.parse(fs.readFileSync(path.join(ROOT, 'data', f + '.json'), 'utf8'));
const clips = Object.fromEntries(['landing', 'drop', 'wheel', 'details', 'convert', 'montage', 'formats'].map(n => [n, J(n)]));
const r3 = x => Math.round(x * 1000) / 1000;

// ───────────────────────────────────────────── brand
const C = { ground: '#f7f8fa', ink: '#18202b', muted: '#6d7480', blue: '#3448ed', blue2: '#6b7afa', blue3: '#b8c0ff', line: '#e7e9ed', coral: '#e2604d' };

// ───────────────────────────────────────────── layouts (frame px). The app is captured at 1280x720 CSS px.
const LAYOUT = {
  L: { name: 'landscape', W: 1920, H: 1080, win: { x: 180, y: 158, w: 1560, h: 878, r: 26 },
       cap: { x: 180, y: 30, w: 1560, h: 120, size: 86 }, zs: 1560 / 1280, big: 1, root: 'index.html' },
  P: { name: 'reel', W: 1080, H: 1920, win: { x: 40, y: 440, w: 1000, h: 890, r: 34 },
       cap: { x: 60, y: 176, w: 960, h: 236, size: 116 }, zs: 1000 / 1280, big: 0.62, root: 'reel/index.html' },
};

// ───────────────────────────────────────────── film plan: scene slots (s). Each scene overlaps the previous by OV.
const OV = 0.2;
const PLAN = [
  ['hook', 4.75, 0], ['reveal', 4.4, 0.3], ['landing', 4.7], ['drop', 4.2], ['wheel', 4.0], ['details', 5.3],
  ['convert', 6.2], ['montage', 4.6], ['formats', 3.0], ['privacy', 3.2], ['end', 6.9],
];
const S = {}; { let t = 0; PLAN.forEach(([id, dur, ov], i) => { const start = i === 0 ? 0 : t - (ov ?? OV); S[id] = { id, dur, start: r3(start) }; t = start + dur; }); }
const FILM = r3(Math.max(...Object.values(S).map(s => s.start + s.dur)));

// ───────────────────────────────────────────── per-scene clip windows (clip seconds -> scene-local seconds = clip - ms)
const MS = { landing: 1.3, drop: 0.1, wheel: 0.5, details: 0.3, convert: 0.3, montage: 0.0, formats: 0.35, privacy: 0.0 };

// ───────────────────────────────────────────── helpers
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const words = (txt, accentRe, cls = 'w') => txt.split(' ').map(w => `<span class="${cls}${accentRe && accentRe.test(w) ? ' acc' : ''}">${esc(w)}</span>`).join(' ');

const FONTS = `
@font-face{font-family:'Forma Inter';src:url('assets/fonts/Inter-Medium.otf');font-weight:500}
@font-face{font-family:'Forma Inter';src:url('assets/fonts/Inter-SemiBold.otf');font-weight:600}
@font-face{font-family:'Forma Display';src:url('assets/fonts/InterDisplay-SemiBold.otf');font-weight:600}
@font-face{font-family:'Forma Display';src:url('assets/fonts/InterDisplay-Bold.otf');font-weight:700}`;

const BASE_CSS = L => `
${FONTS}
#root{position:absolute;inset:0;overflow:hidden;font-family:'Forma Inter',sans-serif;color:${C.ink}}
.win{position:absolute;left:${L.win.x}px;top:${L.win.y}px;width:${L.win.w}px;height:${L.win.h}px;border-radius:${L.win.r}px;overflow:hidden;background:#fff;
  box-shadow:0 0 0 1px rgba(24,32,43,.06),0 34px 80px -28px rgba(24,32,43,.34),0 10px 28px -12px rgba(24,32,43,.18)}
.cam{position:absolute;left:0;top:0;width:1280px;height:720px;transform-origin:0 0}
.cam video{position:absolute;left:0;top:0;width:1280px;height:720px;display:block}
.cur{position:absolute;left:0;top:0;width:0;height:0;opacity:0}
.cur svg{position:absolute;left:-3px;top:-2px;width:${r3(30 * (L.name === 'reel' ? 1.1 : 1))}px;height:${r3(34 * (L.name === 'reel' ? 1.1 : 1))}px;overflow:visible;filter:drop-shadow(0 3px 5px rgba(24,32,43,.35))}
.cap{position:absolute;left:${L.cap.x}px;top:${L.cap.y}px;width:${L.cap.w}px;height:${L.cap.h}px;display:flex;align-items:${L.name === 'reel' ? 'flex-end' : 'center'};gap:${L.name === 'reel' ? 0 : 26}px;flex-wrap:${L.name === 'reel' ? 'wrap' : 'nowrap'};align-content:flex-end}
.cap .step{font:600 ${L.name === 'reel' ? 40 : 30}px 'Forma Inter',sans-serif;letter-spacing:.04em;color:${C.blue};background:rgba(52,72,237,.09);border-radius:999px;padding:${L.name === 'reel' ? '8px 24px' : '6px 20px'};white-space:nowrap}
.cap .step:empty{display:none}
.cap .t{font:700 ${L.cap.size}px/1.02 'Forma Display',sans-serif;letter-spacing:-.045em;white-space:${L.name === 'reel' ? 'normal' : 'nowrap'};color:${C.ink}}
.cap .t .w{display:inline-block}
.acc{color:${C.blue}}.mut{color:${C.muted}}`;

const CURSOR_SVG = `<svg viewBox="0 0 30 34"><path d="M3 2v26.4l6.9-6.4 4.5 10 4.7-2.1-4.5-9.9H24Z" fill="#fff" stroke="${C.ink}" stroke-width="2.1" stroke-linejoin="round"/></svg>`;

// camera: s = frame px per CSS px, (cx,cy) the CSS point at the window centre; clamped to stay inside the capture.
function camXY(L, cx, cy, z) {
  const s = L.name === 'reel' ? z : L.zs * z;   // landscape: z is relative to 'whole app fills the window'; reel: z is an absolute scale
  let x = L.win.w / 2 - cx * s, y = L.win.h / 2 - cy * s;
  x = Math.min(0, Math.max(L.win.w - 1280 * s, x)); y = Math.min(0, Math.max(L.win.h - 720 * s, y));
  return { x: r3(x), y: r3(y), scale: r3(s) };
}
function cameraJS(L, keys) {
  // keys: [t, cx, cy, z, dur, ease] ; first key is the initial state
  const out = []; const first = camXY(L, keys[0][1], keys[0][2], keys[0][3]);
  out.push(`tl.set('#cam',{x:${first.x},y:${first.y},scale:${first.scale},transformOrigin:'0 0'},0);`);
  for (let i = 1; i < keys.length; i++) {
    const [t, cx, cy, z, d = 0.7, e = 'power2.inOut'] = keys[i]; const k = camXY(L, cx, cy, z);
    out.push(`tl.to('#cam',{x:${k.x},y:${k.y},scale:${k.scale},duration:${d},ease:'${e}'},${t});`);
  }
  return out.join('\n');
}
// cursor overlay from the recorded pointer path (30 Hz resample), with a press squeeze on every recorded click
function cursorJS(clip, ms, dur, { sel = '#cur', until = dur, hideAt = null } = {}) {
  const pts = clip.cursor.map(([t, x, y]) => [t - ms, x, y]);
  const at = t => { let i = 0; while (i < pts.length - 1 && pts[i + 1][0] <= t) i++; const a = pts[i], b = pts[Math.min(i + 1, pts.length - 1)]; if (t <= a[0]) return [a[1], a[2]]; if (t >= b[0]) return [b[1], b[2]]; const u = (t - a[0]) / (b[0] - a[0]); return [a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u]; };
  const t0 = Math.max(0, pts[0][0]); const [x0, y0] = at(t0);
  const out = [`tl.set('${sel}',{x:${r3(x0)},y:${r3(y0)},opacity:1},${r3(t0)});`];
  const lastT = Math.min(until, pts[pts.length - 1][0]); const dt = 1 / 30;
  for (let t = t0; t < lastT - 1e-6; t += dt) { const [x, y] = at(Math.min(lastT, t + dt)); out.push(`tl.to('${sel}',{x:${r3(x)},y:${r3(y)},duration:${r3(Math.min(dt, lastT - t))},ease:'none'},${r3(t)});`); }
  clip.events.filter(e => e.type === 'down').forEach(e => { const t = e.t - ms; if (t > 0 && t < dur) { out.push(`tl.to('${sel} svg',{scale:.82,transformOrigin:'3px 2px',duration:.07,ease:'power2.out'},${r3(t)});`); out.push(`tl.to('${sel} svg',{scale:1,duration:.2,ease:'power3.out'},${r3(t + 0.1)});`); } });
  if (hideAt != null) out.push(`tl.to('${sel}',{opacity:0,duration:.18,ease:'power1.in'},${r3(hideAt)});`);
  return out.join('\n');
}
const capJS = (t, step = true) => `
${step ? `tl.fromTo('#cap .step',{opacity:0,scale:.8},{opacity:1,scale:1,duration:.4,ease:'back.out(1.8)'},${r3(t)});` : ''}
tl.fromTo('#cap .w',{opacity:0,filter:'blur(10px)',y:20},{opacity:1,filter:'blur(0px)',y:0,duration:.42,ease:'power3.out',stagger:.075},${r3(t + 0.04)});`;
const exitJS = dur => `
tl.to('#cap,#stat,#chips',{opacity:0,filter:'blur(8px)',duration:.2,ease:'power2.in'},${r3(dur - 0.22)});
tl.to('#win',{opacity:0,scale:.985,duration:.22,ease:'power2.in'},${r3(dur - 0.22)});`;
const enterWinJS = `tl.fromTo('#win',{opacity:0,y:40,scale:.975},{opacity:1,y:0,scale:1,duration:.55,ease:'expo.out'},0);`;

function sceneHTML(L, id, { body, js, css = '' }) {
  return `<template>
  <style>${BASE_CSS(L)}${css}</style>
  <div id="root" data-composition-id="${id}" data-width="${L.W}" data-height="${L.H}">
${body}
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
${js}
    window.__timelines = window.__timelines || {};
    window.__timelines["${id}"] = tl;
  </script>
</template>
`;
}

// A product scene: window (rounded) -> camera -> clip video -> cursor; caption above.
function productScene(L, id, { clip, cam, step, caption, accent, dur, extraBody = '', extraJS = '', extraCSS = '', cursorUntil, noEnter = false }) {
  const ms = MS[clip]; const data = clips[clip];
  const body = `
    <div class="cap" id="cap" data-layout-allow-overflow><span class="step">${step}</span><span class="t">${words(caption, accent)}</span></div>
    <div class="win" id="win" data-layout-allow-overflow>
      <div class="cam" id="cam" data-layout-allow-overflow>
        <video id="vid" class="clip" src="assets/clips/${clip}.mp4" data-start="0" data-duration="${dur}" data-media-start="${ms}" muted playsinline></video>
        <div class="cur" id="cur">${CURSOR_SVG}</div>
      </div>
    </div>${extraBody}`;
  const js = `${noEnter ? '' : enterWinJS}
${capJS(0.25)}
${cameraJS(L, cam)}
${cursorJS(data, ms, dur, { until: cursorUntil ?? dur })}
${extraJS}
${exitJS(dur)}`;
  return sceneHTML(L, id, { body, js, css: extraCSS });
}

// ───────────────────────────────────────────── sound cues (film time of the *moment the sound must land*)
const cues = [];
const cue = (t, name, o = {}) => cues.push({ t: r3(t), name, ...o });
const T = (scene, clipT) => S[scene].start + (clipT - MS[scene]);   // film time of a clip event in a product scene

// ───────────────────────────────────────────── scenes
const scenes = { L: {}, P: {} };

for (const k of ['L', 'P']) {
  const L = LAYOUT[k]; const reel = k === 'P'; const sc = (a, b) => (reel ? b : a); const pre = k.toLowerCase() + '-';

  // ── hook: kinetic type on the ground, no product
  {
    const fs = reel ? { A: 250, B: 166, C: 400, D: 232 } : { A: 214, B: 150, C: 300, D: 142 };
    const body = `
    <div class="hk" id="hkA"><div class="hkl" style="font-size:${r3(fs.A)}px">${reel ? `<span class="w">Wrong</span><br><span class="w">format.</span>` : words('Wrong format.')}</div></div>
    <div class="chip" id="chip" data-layout-ignore><div class="ico"><i></i></div><div class="ct"><b>IMG_4021.HEIC</b><span>Can’t open this file</span></div><div class="x">✕</div></div>
    <div class="hk" id="hkB"><div class="hkl" style="font-size:${r3(fs.B)}px">${reel ? `<span class="w">Upload</span> <span class="w">it</span><br><span class="w mut">somewhere.</span>` : `<span class="w">Upload</span> <span class="w">it</span> <span class="w mut">somewhere.</span>`}</div></div>
    <div class="hk" id="hkC"><div class="hkl" style="font-size:${r3(fs.C)}px"><span class="w">Wait.</span></div></div>
    <div class="hk" id="hkD"><div class="hkl" style="font-size:${r3(fs.D)}px">${reel ? `<span class="w">Hope</span><br><span class="w mut">nobody</span><br><span class="w">looks.</span>` : `<span class="w">Hope</span> <span class="w mut">nobody</span> <span class="w">looks.</span>`}</div></div>`;
    const css = `
.hk{position:absolute;inset:0;${reel ? 'bottom:430px;' : ''}display:flex;align-items:center;justify-content:center;text-align:center}
.hkl{font-family:'Forma Display',sans-serif;font-weight:700;letter-spacing:-.05em;line-height:.98;color:${C.ink};white-space:nowrap}
.hkl .w{display:inline-block}.hkl .mut{color:#a3a9b3}
#hkB,#hkC,#hkD{opacity:0}
.chip{position:absolute;left:${sc(1280, 560)}px;top:${sc(228, 360)}px;display:flex;align-items:center;gap:${sc(16, 14)}px;background:#fff;border-radius:${sc(22, 20)}px;padding:${sc(18, 14)}px ${sc(26, 20)}px ${sc(18, 14)}px ${sc(18, 14)}px;box-shadow:0 0 0 1px rgba(24,32,43,.06),0 26px 56px -20px rgba(24,32,43,.35);opacity:0}
.chip .ico{width:${sc(56, 46)}px;height:${sc(68, 56)}px;border-radius:10px;background:#efeaff;position:relative}.chip .ico i{position:absolute;right:0;top:0;width:40%;height:34%;background:#d9d0fb;border-bottom-left-radius:10px}
.chip .ct{display:flex;flex-direction:column;gap:4px}.chip b{font:600 ${sc(30, 24)}px 'Forma Inter';letter-spacing:-.01em}.chip span{font:500 ${sc(28, 28)}px 'Forma Inter';color:${C.muted}}
.chip .x{width:${sc(40, 34)}px;height:${sc(40, 34)}px;border-radius:50%;background:${C.coral};color:#fff;display:flex;align-items:center;justify-content:center;font:700 ${sc(22, 18)}px 'Forma Inter'}`;
    const js = `
tl.fromTo('#hkA .hkl',{scale:1.04},{scale:1,duration:.7,ease:'expo.out'},0);
tl.fromTo('#chip',{opacity:0,scale:.5,rotation:-18,y:30},{opacity:1,scale:1,rotation:${sc(7, 6)},y:0,duration:.55,ease:'back.out(2)'},.5);
tl.to('#hkA .hkl',{opacity:0,filter:'blur(12px)',scale:1.03,duration:.2,ease:'power2.in'},1.28);
tl.to('#chip',{opacity:0,y:-20,scale:.9,duration:.2,ease:'power2.in'},1.28);
tl.set('#hkB',{opacity:1},1.34);
tl.fromTo('#hkB .w',{opacity:0,filter:'blur(10px)',y:16},{opacity:1,filter:'blur(0px)',y:0,duration:.34,ease:'power3.out',stagger:.09},1.36);
tl.to('#hkB',{opacity:0,filter:'blur(12px)',duration:.18,ease:'power2.in'},2.52);
tl.set('#hkC',{opacity:1},2.6);
tl.fromTo('#hkC .w',{opacity:0,scale:.8,filter:'blur(12px)'},{opacity:1,scale:1,filter:'blur(0px)',duration:.4,ease:'expo.out'},2.62);
tl.to('#hkC',{opacity:0,filter:'blur(12px)',duration:.16,ease:'power2.in'},3.22);
tl.set('#hkD',{opacity:1},3.28);
tl.fromTo('#hkD .w',{opacity:0,filter:'blur(10px)',y:16},{opacity:1,filter:'blur(0px)',y:0,duration:.36,ease:'power3.out',stagger:.14},3.3);
tl.to('#hkD',{opacity:0,filter:'blur(14px)',scale:1.03,duration:.3,ease:'power2.in'},4.42);`;
    scenes[k].hook = sceneHTML(L, pre + 'hook', { body, js, css });
  }

  // ── reveal: the mark performs, wordmark, tagline
  {
    const fsz = sc(236, 222);
    const body = `
    <div class="lock" id="lock" style="font-size:${fsz}px"><div class="mk" id="mk"><i class="b1"></i><i class="b2"></i><i class="b3"></i></div><div class="wm" id="wm">${'forma'.split('').map(c => `<span class="lt">${c}</span>`).join('')}<span class="dot" id="dot">.</span></div></div>
    <div class="tag" id="tag" style="font-size:${sc(66, 84)}px">${reel ? `<span class="w">A</span> <span class="w acc">fresh</span> <span class="w acc">start</span><br><span class="w">for</span> <span class="w">your</span> <span class="w">files.</span>` : words('A fresh start for your files.', /^(fresh|start)$/)}</div>`;
    const css = `
.lock{position:absolute;left:0;right:0;top:${sc(330, 560)}px;display:flex;align-items:center;justify-content:center;gap:.32em;line-height:1}
.mk{position:relative;width:1em;height:1.036em;margin-right:-.04em}
.mk i{position:absolute;display:block;width:.393em;border-radius:.143em;transform-origin:50% 100%}
.b1{background:${C.blue};height:.821em;top:.179em;left:.071em}.b2{background:${C.blue2};height:.643em;top:.071em;left:.357em}.b3{background:${C.blue3};height:.393em;top:0;left:.643em}
.wm{font-family:'Forma Display',sans-serif;font-weight:700;letter-spacing:-.046em;display:flex;align-items:baseline;color:${C.ink};line-height:1}
.wm .lt{display:inline-block}.dot{display:inline-block;color:${C.blue}}
.tag{position:absolute;left:0;right:0;top:${sc(640, 860)}px;text-align:center;font-family:'Forma Display',sans-serif;font-weight:600;letter-spacing:-.035em;line-height:1.08}
.tag .w{display:inline-block}`;
    const js = `
tl.fromTo('#mk',{rotation:-34},{rotation:-10,duration:.9,ease:'power4.out'},.0);
tl.fromTo('#mk i',{scaleY:0},{scaleY:1,duration:.6,ease:'back.out(1.6)',stagger:.09},.0);
tl.fromTo('#wm .lt',{opacity:0,filter:'blur(14px)',y:30},{opacity:1,filter:'blur(0px)',y:0,duration:.4,ease:'power3.out',stagger:.075},.42);
tl.fromTo('#dot',{opacity:0,scale:0.2,y:-40},{opacity:1,scale:1,y:0,duration:.55,ease:'back.out(3)'},.85);
tl.fromTo('#tag .w',{opacity:0,filter:'blur(10px)',y:18},{opacity:1,filter:'blur(0px)',y:0,duration:.42,ease:'power3.out',stagger:.08},1.45);
tl.to('#lock',{y:${sc(-64, -90)},duration:.7,ease:'power3.out'},1.35);
tl.to('#lock, #tag',{opacity:0,filter:'blur(14px)',duration:.3,ease:'power2.in'},${r3(S.reveal.dur - 0.55)});`;
    scenes[k].reveal = sceneHTML(L, pre + 'reveal', { body, js, css });
  }

  // ── landing: hero -> cursor -> click -> workspace
  scenes[k].landing = productScene(L, pre + 'landing', {
    clip: 'landing', step: '', caption: 'Meet Forma.', accent: /Forma/, dur: S.landing.dur,
    cam: sc([[0, 640, 360, 1.0], [0.9, 380, 430, 1.32, 1.3, 'power2.inOut'], [2.55, 640, 380, 1.12, 0.35, 'power2.in'], [2.9, 640, 360, 1.0, 0.8, 'power3.out']],
            [[0, 335, 440, 1.6], [0.9, 315, 470, 1.78, 1.3, 'power2.inOut'], [2.55, 650, 380, 1.3, 0.35, 'power2.in'], [2.9, 665, 360, 1.5, 0.8, 'power3.out']]),
    extraCSS: `.cap .step{display:none}`,
  });
  // ── drop
  scenes[k].drop = productScene(L, pre + 'drop', {
    clip: 'drop', step: '01', caption: 'Drop something in.', accent: /something/, dur: S.drop.dur,
    cam: sc([[0, 640, 360, 1.0], [2.25, 610, 340, 1.3, 0.9, 'power3.out']], [[0, 640, 360, 1.3], [0.5, 640, 380, 1.45, 1.0, 'power2.inOut'], [2.25, 665, 390, 1.52, 0.9, 'power3.out']]),
  });
  // ── wheel
  scenes[k].wheel = productScene(L, pre + 'wheel', {
    clip: 'wheel', step: '02', caption: 'Give it a direction.', accent: /direction/, dur: S.wheel.dur,
    cam: sc([[0, 640, 330, 1.2], [0.2, 640, 322, 1.55, 1.0, 'power2.inOut']], [[0, 665, 365, 1.45], [0.2, 668, 352, 1.58, 1.0, 'power2.inOut']]),
  });
  // ── details
  scenes[k].details = productScene(L, pre + 'details', {
    clip: 'details', step: '', caption: 'A little more control.', accent: /control/, dur: S.details.dur,
    cam: sc([[0, 640, 360, 1.0], [0.55, 640, 312, 1.62, 1.0, 'power2.inOut']], [[0, 640, 330, 1.4], [0.55, 640, 330, 1.7, 1.0, 'power2.inOut']]),
  });
  // ── convert (+ stat callout)
  scenes[k].convert = productScene(L, pre + 'convert', {
    clip: 'convert', step: '03', caption: 'And it’s yours to go.', accent: /yours/, dur: S.convert.dur,
    cam: sc([[0, 640, 400, 1.2], [0.9, 640, 360, 1.55, 0.8, 'power2.inOut'], [2.35, 640, 190, 2.1, 0.8, 'power2.inOut'], [5.2, 640, 330, 1.18, 0.9, 'power2.inOut']],
            [[0, 640, 400, 1.45], [0.9, 640, 360, 1.8, 0.8, 'power2.inOut'], [2.35, 640, 170, 1.3, 0.8, 'power2.inOut'], [5.2, 640, 330, 1.3, 0.9, 'power2.inOut']]),
    extraCSS: `.stat{position:absolute;left:${L.cap.x}px;top:${L.cap.y}px;width:${L.cap.w}px;height:${L.cap.h}px;display:flex;align-items:${reel ? 'flex-end' : 'center'};opacity:0;font:700 ${L.cap.size * 1.12}px/1 'Forma Display',sans-serif;letter-spacing:-.05em;white-space:nowrap}
.stat .sv{color:${C.blue}}.stat small{font:inherit}.stat .sl{margin-left:.26em;color:${C.ink}}`,
    extraBody: `<div class="stat" id="stat"><span class="sv"><span id="statnum">0.0</span><small>%</small></span><span class="sl">smaller.</span></div>`,
    extraJS: (() => { const res = clips.convert.events.find(e => e.type === 'result'); const m = /([\d.]+)% smaller/.exec(res.text); const rd = clips.convert.events.find(e => e.type === 'ready'); const tr = r3(rd.t - MS.convert + 0.1);
      return `const sc1={v:0};
tl.to('#cap',{opacity:0,filter:'blur(8px)',duration:.18,ease:'power2.in'},${r3(tr - 0.05)});
tl.fromTo('#stat',{opacity:0,y:24,filter:'blur(10px)'},{opacity:1,y:0,filter:'blur(0px)',duration:.4,ease:'power3.out'},${r3(tr + 0.1)});
tl.to(sc1,{v:${m[1]},duration:.85,ease:'power2.out',onUpdate(){document.getElementById('statnum').textContent=sc1.v.toFixed(1);}},${r3(tr + 0.08)});`; })(),
  });
  // ── montage
  scenes[k].montage = productScene(L, pre + 'montage', {
    clip: 'montage', step: '', caption: 'Not just images.', accent: /images/, dur: S.montage.dur,
    cam: sc([[0, 640, 350, 1.28]], [[0, 640, 360, 1.4]]),
    extraCSS: `#chips{position:absolute;${reel ? `left:0;right:0;justify-content:center;top:${L.win.y - 86}px;gap:14px` : `right:${LAYOUT.L.win.x}px;top:46px;gap:18px`};display:flex}
.fc{display:flex;align-items:center;gap:12px;font:600 ${reel ? 38 : 36}px 'Forma Inter';letter-spacing:-.01em;padding:${reel ? '12px 24px' : '12px 26px'};border-radius:999px;background:#fff;box-shadow:0 0 0 1px rgba(24,32,43,.07),0 14px 30px -14px rgba(24,32,43,.28);opacity:0}
.fc i{width:16px;height:16px;border-radius:50%}${reel ? `.cap{top:${L.cap.y - 84}px}` : ''}`,
    extraBody: `<div id="chips">${[['Data', '#6fbf9b'], ['Audio', '#d77aa0'], ['Video', '#e0955b']].map(([n, c], i) => `<div class="fc" id="fc${i}"><i style="background:${c}"></i>${n}</div>`).join('')}</div>`,
    extraJS: clips.montage.events.filter(e => e.type === 'drop').slice(0, 3).map((e, i) => `tl.fromTo('#fc${i}',{opacity:0,scale:.6,y:16},{opacity:1,scale:1,y:0,duration:.42,ease:'back.out(2.2)'},${r3(e.t - MS.montage + 0.12)});`).join('\n'),
  });
  // ── formats
  scenes[k].formats = productScene(L, pre + 'formats', {
    clip: 'formats', step: '', caption: '53 formats.', accent: /53/, dur: S.formats.dur,
    cam: sc([[0, 640, 360, 1.0], [0.4, 640, 350, 1.2, 0.9, 'power2.inOut']], [[0, 640, 360, 1.4], [0.4, 640, 360, 1.55, 0.9, 'power2.inOut']]),
  });
}


// ───────────────────────────────────────────── privacy + end card (not window scenes)
for (const k of ['L', 'P']) {
  const L = LAYOUT[k]; const reel = k === 'P'; const sc = (a, b) => (reel ? b : a); const pre = k.toLowerCase() + '-';

  // privacy: the real "No file uploads. Ever." card, lifted out of the landing hero and enlarged
  {
    const ls = sc(4.1, 3.9); const card = { x: 951, y: 202, w: 215, h: 53 };   // CSS px of .floating-note.note-private in the hero capture
    const cw = card.w * ls, ch = card.h * ls; const ccx = L.W / 2, ccy = sc(660, 920);
    const body = `
    <div class="ph" id="ph"><span class="w">${reel ? 'Your files<br>never leave<br>your device.' : ''}</span>${reel ? '' : words('Your files never leave', /never|leave/) + '<br>' + words('your device.', /device/)}</div>
    <div class="lift" id="lift" data-layout-allow-overflow><div class="lcam" id="lcam" data-layout-allow-overflow><video id="vid" class="clip" src="assets/clips/landing.mp4" data-start="0" data-duration="${S.privacy.dur}" data-media-start="${MS.privacy}" muted playsinline></video></div></div>
    <div class="pc" id="pc">${['No uploads.', 'No server copies.', 'No account.'].map((t, i) => `<div class="pill" id="pl${i}"><i></i>${t}</div>`).join('')}</div>`;
    const css = `
.ph{position:absolute;left:0;right:0;top:${sc(150, 200)}px;text-align:center;font:700 ${sc(124, 116)}px/1.0 'Forma Display',sans-serif;letter-spacing:-.05em;color:${C.ink}}
.ph .w{display:inline-block}${reel ? '.ph .w{display:block}' : ''}
.lift{position:absolute;left:${r3(ccx - cw / 2)}px;top:${r3(ccy - ch / 2)}px;width:${r3(cw)}px;height:${r3(ch)}px;border-radius:${r3(14 * ls)}px;overflow:hidden;background:#fff;box-shadow:0 0 0 1px rgba(24,32,43,.06),0 50px 100px -30px rgba(24,32,43,.42),0 14px 34px -12px rgba(24,32,43,.2)}
.lcam{position:absolute;left:0;top:0;width:1280px;height:720px;transform-origin:0 0}
.lcam video{position:absolute;left:0;top:0;width:1280px;height:720px;display:block}
.pc{position:absolute;left:0;right:0;top:${sc(870, 1190)}px;display:flex;justify-content:center;gap:${sc(24, 14)}px;${reel ? 'flex-wrap:wrap;padding:0 40px' : ''}}
.pill{display:flex;align-items:center;gap:12px;font:600 ${sc(40, 40)}px 'Forma Inter';letter-spacing:-.01em;padding:${sc('14px 30px', '12px 26px')};border-radius:999px;background:#fff;box-shadow:0 0 0 1px rgba(24,32,43,.07),0 14px 30px -14px rgba(24,32,43,.28);opacity:0}
.pill i{width:18px;height:18px;border-radius:50%;background:${C.blue}}`;
    const js = `
tl.set('#lcam',{x:${r3(-card.x * ls)},y:${r3(-card.y * ls)},scale:${ls},transformOrigin:'0 0'},0);
tl.fromTo('#ph .w',{opacity:0,filter:'blur(10px)',y:20},{opacity:1,filter:'blur(0px)',y:0,duration:.46,ease:'power3.out',stagger:.07},.15);
tl.fromTo('#lift',{opacity:0,scale:.78,y:50},{opacity:1,scale:1,y:0,duration:.7,ease:'expo.out'},.55);
tl.fromTo('#pl0',{opacity:0,scale:.6,y:18},{opacity:1,scale:1,y:0,duration:.42,ease:'back.out(2.2)'},1.35);
tl.fromTo('#pl1',{opacity:0,scale:.6,y:18},{opacity:1,scale:1,y:0,duration:.42,ease:'back.out(2.2)'},1.7);
tl.fromTo('#pl2',{opacity:0,scale:.6,y:18},{opacity:1,scale:1,y:0,duration:.42,ease:'back.out(2.2)'},2.05);
tl.to('#ph,#lift,#pc',{opacity:0,filter:'blur(10px)',duration:.22,ease:'power2.in'},${r3(S.privacy.dur - 0.24)});`;
    scenes[k].privacy = sceneHTML(L, pre + 'privacy', { body, js, css });
  }

  // end card: tagline -> real CTA -> click -> blue floods the frame -> white lockup + URL
  {
    const ccx = L.W / 2, ccy = sc(670, 800); const fs = sc(150, 136);
    const pw = sc(640, 700), ph = sc(150, 160);
    const body = `
    <div class="tl2" id="tl2" style="font-size:${fs}px">${reel ? `<div class="ln">${words('A little')}</div><div class="ln">${words('change.')}</div><div class="ln">${words('A world of')}</div><div class="ln">${words('possibility.', /possibility/)}</div>` : `<div class="ln">${words('A little change.')}</div><div class="ln">${words('A world of possibility.', /possibility/)}</div>`}</div>
    <div class="cta" id="cta"><span>Let’s convert something</span><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M8 7h9v9"/></svg></div>
    <div class="flood" id="flood"></div>
    <div class="lock lockw" id="lock2" style="font-size:${sc(250, 226)}px"><div class="mk" id="mk2"><i class="b1"></i><i class="b2"></i><i class="b3"></i></div><div class="wm" id="wm2">${'forma'.split('').map(c => `<span class="lt">${c}</span>`).join('')}<span class="dot" id="dot2">.</span></div></div>
    <div class="url" id="url"><div class="u1">forma.thezavino.com</div><div class="u2">Free to use <b>·</b> No account needed</div></div>
    <div class="cur ecur" id="ecur">${CURSOR_SVG}</div>`;
    const css = `
.tl2{position:absolute;left:0;right:0;top:${sc(300, 330)}px;text-align:center;font-family:'Forma Display',sans-serif;font-weight:700;letter-spacing:-.05em;line-height:1.02}
.tl2 .ln{display:block}.tl2 .w{display:inline-block}
.cta{position:absolute;left:${ccx - pw / 2}px;top:${ccy - ph / 2}px;width:${pw}px;height:${ph}px;border-radius:${sc(38, 40)}px;background:${C.blue};color:#fff;display:flex;align-items:center;justify-content:center;gap:22px;font:600 ${sc(50, 52)}px 'Forma Inter';letter-spacing:-.02em;opacity:0;box-shadow:0 30px 60px -22px rgba(52,72,237,.65),inset 0 2px 0 rgba(255,255,255,.18)}
.cta svg{width:${sc(54, 56)}px;height:${sc(54, 56)}px}
.flood{position:absolute;inset:0;background:${C.blue};clip-path:circle(0px at ${ccx}px ${ccy}px)}
.lock{position:absolute;left:0;right:0;top:${sc(330, 520)}px;display:flex;align-items:center;justify-content:center;gap:.32em;line-height:1;opacity:0}
.mk{position:relative;width:1em;height:1.036em;margin-right:-.04em}
.mk i{position:absolute;display:block;width:.393em;border-radius:.143em;transform-origin:50% 100%}
.lockw .b1{background:#fff;height:.821em;top:.179em;left:.071em}.lockw .b2{background:rgba(255,255,255,.72);height:.643em;top:.071em;left:.357em}.lockw .b3{background:rgba(255,255,255,.45);height:.393em;top:0;left:.643em}
.wm{font-family:'Forma Display',sans-serif;font-weight:700;letter-spacing:-.046em;display:flex;align-items:baseline;color:#fff;line-height:1}
.wm .lt{display:inline-block}.lockw .dot{display:inline-block;color:${C.blue3}}
.url{position:absolute;left:0;right:0;top:${sc(690, 860)}px;text-align:center;opacity:0}
.url .u1{font:600 ${sc(84, 76)}px/1.1 'Forma Display',sans-serif;letter-spacing:-.035em;color:#fff}
.url .u2{margin-top:${sc(22, 20)}px;font:500 ${sc(40, 38)}px 'Forma Inter';color:rgba(255,255,255,.78);letter-spacing:-.005em}.url .u2 b{margin:0 .35em;color:rgba(255,255,255,.5)}
.ecur{opacity:0}.ecur svg{width:${sc(64, 62)}px;height:${sc(72, 70)}px;left:-6px;top:-4px}`;
    const E = { words: 0.15, out: 2.0, cta: 2.24, curIn: 2.15, hover: 2.9, click: 3.1, flood: 3.16, lock: 3.72, letters: 4.1, dot: 4.46, rise: 4.74, url: 4.82 };
    const tClick = E.click;
    const js = `
tl.fromTo('#tl2 .w',{opacity:0,filter:'blur(10px)',y:22},{opacity:1,filter:'blur(0px)',y:0,duration:.46,ease:'power3.out',stagger:.085},${E.words});
tl.to('#tl2',{opacity:0,filter:'blur(12px)',duration:.24,ease:'power2.in'},${E.out});
tl.fromTo('#cta',{opacity:0,scale:.7,y:30},{opacity:1,scale:1,y:0,duration:.5,ease:'back.out(1.8)'},${E.cta});
tl.set('#ecur',{x:${sc(1480, 900)},y:${sc(960, 1280)},opacity:1},${E.curIn});
tl.to('#ecur',{x:${ccx + sc(120, 150)},y:${ccy + sc(30, 36)},duration:.85,ease:'power3.out'},${E.curIn});
tl.to('#cta',{scale:1.035,duration:.18,ease:'power2.out'},${E.hover});
tl.to('#ecur svg',{scale:.8,transformOrigin:'3px 2px',duration:.07,ease:'power2.out'},${tClick});
tl.to('#ecur svg',{scale:1,duration:.2,ease:'power3.out'},${tClick + 0.1});
tl.to('#cta',{scale:.96,duration:.08,ease:'power2.out'},${tClick});
tl.to('#flood',{clipPath:'circle(${sc(2300, 2600)}px at ${ccx}px ${ccy}px)',duration:.74,ease:'power3.in'},${E.flood});
tl.to('#cta',{opacity:0,duration:.2,ease:'power1.in'},${tClick + 0.3});
tl.to('#ecur',{opacity:0,duration:.2,ease:'power1.in'},${tClick + 0.35});
tl.set('#lock2',{opacity:1},${E.lock});
tl.fromTo('#mk2',{rotation:-34},{rotation:-10,duration:.9,ease:'power4.out'},${E.lock});
tl.fromTo('#mk2 i',{scaleY:0},{scaleY:1,duration:.6,ease:'back.out(1.6)',stagger:.09},${E.lock});
tl.fromTo('#wm2 .lt',{opacity:0,filter:'blur(14px)',y:30},{opacity:1,filter:'blur(0px)',y:0,duration:.4,ease:'power3.out',stagger:.075},${E.letters});
tl.fromTo('#dot2',{opacity:0,scale:0.2,y:-40},{opacity:1,scale:1,y:0,duration:.55,ease:'back.out(3)'},${E.dot});
tl.to('#lock2',{y:${sc(-70, -100)},duration:.7,ease:'power3.out'},${E.rise});
tl.fromTo('#url',{opacity:0,y:34,filter:'blur(10px)'},{opacity:1,y:0,filter:'blur(0px)',duration:.6,ease:'power3.out'},${E.url});`;
    scenes[k].end = sceneHTML(L, pre + 'end', { body, js, css });
    scenes[k].endTimes = E;
  }
}

// ───────────────────────────────────────────── cue sheet (film time at which each sound's hit must land)
const evs = (clip, type) => clips[clip].events.filter(e => e.type === type).map(e => e.t);
const start = id => S[id].start;
// hook
cue(0.12, 'whoosh', { gain: -17 });
cue(0.62, 'pop', { gain: -7, pitch: -3 });                        // file chip lands
[1.38, 1.47, 1.56].forEach((t, i) => cue(t, 'tick', { gain: -10 - i, pitch: i }));   // "Upload it somewhere."
cue(1.32, 'whoosh-short', { gain: -17 });
cue(2.66, 'pop', { gain: -6, pitch: -6 }); cue(2.6, 'whoosh-short', { gain: -17 });
[3.34, 3.48, 3.62].forEach((t, i) => cue(t, 'tick', { gain: -10, pitch: -2 + i * 2 }));  // "Hope nobody looks."
cue(start('reveal') + 0.05 - 2.55, 'riser', { gain: -9 });          // build lands exactly on the impact below
cue(start('reveal') + 0.05, 'impact', { gain: -10 });
cue(start('reveal') + 0.08, 'whoosh', { gain: -13 });
[0.15, 0.24, 0.33].forEach((d, i) => cue(start('reveal') + d + 0.04, 'pop', { gain: -12, pitch: -2 + i * 3 }));
for (let i = 0; i < 5; i++) cue(start('reveal') + 0.42 + i * 0.075 + 0.05, 'tick', { gain: -11 + i * 0.5, pitch: 3 + i * 1.2 });
cue(start('reveal') + 0.85 + 0.12, 'pop', { gain: -6, pitch: 4 }); cue(start('reveal') + 0.97, 'sparkle', { gain: -10 });
cue(start('reveal') + 1.45, 'whoosh-short', { gain: -18 });
// landing
cue(start('landing') + 0.05, 'whoosh-short', { gain: -19 });
cue(start('landing') + 0.95, 'whoosh-short', { gain: -17 });   // camera pushes toward the CTA
cue(start('landing') + 2.58, 'whoosh-short', { gain: -18 });  // and settles into the workspace
evs('landing', 'down').forEach(t => cue(start('landing') + t - MS.landing, 'click', { gain: -7 }));
cue(start('landing') + evs('landing', 'route')[0] - MS.landing + 0.02, 'whoosh', { gain: -17 });
// drop
cue(start('drop') + 0.05, 'whoosh-short', { gain: -19 });
cue(T('drop', evs('drop', 'ghost')[0]) + 0.05, 'whoosh-short', { gain: -16 });
cue(T('drop', evs('drop', 'dragenter')[0]) + 0.08, 'pop', { gain: -12, pitch: 3 });
cue(T('drop', evs('drop', 'drop')[0]) + 0.03, 'click', { gain: -8 }); cue(T('drop', evs('drop', 'drop')[0]) + 0.03, 'pop', { gain: -7, pitch: -4 });
cue(T('drop', evs('drop', 'drop')[0]) + 0.16, 'sparkle', { gain: -17 });
// wheel: every tick the app itself played, at the moment it played it
cue(start('wheel') + 0.05, 'whoosh-short', { gain: -19 });
clips.wheel.ticks.forEach(t => cue(T('wheel', t) + 0.033, 'tick', { gain: -3 }));
{ const last = clips.wheel.ticks.at(-1); cue(T('wheel', last) + 0.26, 'click-soft', { gain: -13, pitch: 2 }); }
// details
cue(start('details') + 0.05, 'whoosh-short', { gain: -19 });
evs('details', 'down').filter(t => t - MS.details < S.details.dur - 0.05).forEach((t, i) => {
  cue(start('details') + t - MS.details, i === 0 ? 'click' : 'click-soft', { gain: i === 0 ? -7 : -9, pitch: i === 0 ? 0 : 2 + i });
  if (i === 1 || i === 3) cue(start('details') + t - MS.details + 0.05, 'pop', { gain: -14, pitch: 5 });
});
cue(T('details', evs('details', 'down')[0]) + 0.1, 'whoosh-short', { gain: -17 });
evs('details', 'key').forEach((t, i) => cue(T('details', t) + 0.01, 'key', { gain: -5, pitch: i }));
// convert
cue(start('convert') + 0.05, 'whoosh-short', { gain: -19 });
{ const d = evs('convert', 'down'); d.forEach((t, i) => { cue(T('convert', t), i === 1 ? 'click-soft' : 'click', { gain: -7 }); });
  cue(T('convert', d[0]) + 0.1, 'whoosh-short', { gain: -17 });
  cue(T('convert', d[1]) + 0.04, 'pop', { gain: -9, pitch: 6 });
  cue(T('convert', d[2]) + 0.15, 'whoosh', { gain: -16 });
  const ready = T('convert', evs('convert', 'ready')[0]);
  cue(ready + 0.14, 'chime', { gain: -9 }); cue(ready + 0.15, 'sparkle', { gain: -14 });
  const n = 14; for (let i = 0; i < n; i++) { const u = i / (n - 1); cue(ready + 0.2 + 0.85 * (1 - (1 - u) * (1 - u)), 'tick', { gain: -10 + u * 3, pitch: 3 + u * 9 }); }
  cue(ready + 1.1, 'pop', { gain: -9, pitch: 8 }); }
// montage
cue(start('montage') + 0.05, 'whoosh-short', { gain: -19 });
evs('montage', 'ghost').slice(0, 3).forEach((t, i) => cue(T('montage', t) + 0.04, 'whoosh-short', { gain: -17 }));
evs('montage', 'drop').slice(0, 3).forEach((t, i) => { cue(T('montage', t) + 0.02, 'click-soft', { gain: -8, pitch: i * 2 }); cue(T('montage', t) + 0.12, 'pop', { gain: -8, pitch: i * 3 + 1 }); });
// formats
cue(start('formats') + 0.05, 'whoosh-short', { gain: -19 });
evs('formats', 'down').forEach(t => cue(T('formats', t), 'click', { gain: -7 }));
cue(T('formats', evs('formats', 'down')[0]) + 0.1, 'whoosh-short', { gain: -17 });
evs('formats', 'scroll').forEach((t, i) => cue(T('formats', t) + 0.04, 'tick', { gain: -9, pitch: -3 + i * 0.6 }));
// privacy
cue(start('privacy') + 0.55 + 0.12, 'whoosh', { gain: -15 }); cue(start('privacy') + 0.55 + 0.4, 'pop', { gain: -8, pitch: -2 });
[1.35, 1.7, 2.05].forEach((t, i) => cue(start('privacy') + t + 0.1, 'pop', { gain: -9, pitch: i * 3 }));
// end
{ const e0 = start('end'); const E = scenes.L.endTimes;
  [0, 1, 2].forEach(i => cue(e0 + E.words + i * 0.085 + 0.06, 'tick', { gain: -11, pitch: -2 + i * 2 }));
  [3, 4, 5, 6].forEach((j, i) => cue(e0 + E.words + j * 0.085 + 0.06, 'tick', { gain: -11, pitch: 3 + i * 1.6 }));
  cue(e0 + E.out - 0.02, 'whoosh-short', { gain: -18 });
  cue(e0 + E.cta + 0.2, 'pop', { gain: -6, pitch: 2 });
  cue(e0 + E.curIn + 0.1, 'whoosh', { gain: -20 });
  cue(e0 + E.click, 'click', { gain: -6 });
  cue(e0 + E.flood + 0.55, 'whoosh-cinematic', { gain: -12, seg: [1.55, 2.8] });
  cue(e0 + E.lock + 0.05, 'impact', { gain: -13 }); cue(e0 + E.lock + 0.1, 'sparkle', { gain: -9 });
  for (let i = 0; i < 5; i++) cue(e0 + E.letters + i * 0.075 + 0.05, 'tick', { gain: -12 + i * 0.5, pitch: 3 + i * 1.2 });
  cue(e0 + E.dot + 0.12, 'pop', { gain: -7, pitch: 4 }); cue(e0 + E.dot + 0.16, 'sparkle', { gain: -8 });
  cue(e0 + E.url + 0.2, 'chime', { gain: -12 }); }
cues.sort((a, b) => a.t - b.t);

// ───────────────────────────────────────────── root documents
function rootHTML(k) {
  const L = LAYOUT[k]; const reel = k === 'P'; const pre = k.toLowerCase() + '-';
  const order = ['hook', 'reveal', 'landing', 'drop', 'wheel', 'details', 'convert', 'montage', 'formats', 'privacy', 'end'];
  const hosts = order.map((id, i) => `    <div id="${pre}${id}" data-composition-id="${pre}${id}" data-composition-src="compositions/${pre}${id}.html" data-start="${S[id].start}" data-duration="${S[id].dur}" data-track-index="${i + 1}" data-track-kind="graphics" data-width="${L.W}" data-height="${L.H}"></div>`).join('\n');
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${L.W}, height=${L.H}" />
    <title>Forma — launch film (${L.name})</title>
    <script src="lib/gsap.min.js"></script>
    <style>
      :root { --ground: ${C.ground}; --ink: ${C.ink}; --blue: ${C.blue}; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: ${L.W}px; height: ${L.H}px; overflow: hidden; background: var(--ground); }
      #ground { position: absolute; inset: 0; background: var(--ground); overflow: hidden; }
      .glow { position: absolute; border-radius: 50%; }
      .g1 { width: ${reel ? 1500 : 1300}px; height: ${reel ? 1500 : 1300}px; left: ${reel ? -700 : -420}px; top: ${reel ? -500 : -520}px; background: radial-gradient(closest-side, rgba(184,192,255,.62), rgba(184,192,255,0)); }
      .g2 { width: ${reel ? 1700 : 1500}px; height: ${reel ? 1700 : 1500}px; left: ${reel ? 100 : 980}px; top: ${reel ? 1100 : 380}px; background: radial-gradient(closest-side, rgba(52,72,237,.17), rgba(52,72,237,0)); }
      .g3 { width: 900px; height: 900px; left: ${reel ? 500 : 1100}px; top: ${reel ? 200 : -380}px; background: radial-gradient(closest-side, rgba(255,214,196,.42), rgba(255,214,196,0)); }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${FILM}" data-width="${L.W}" data-height="${L.H}" data-motion-blur="off">
      <div id="ground" data-layout-ignore><div class="glow g1"></div><div class="glow g2"></div><div class="glow g3"></div></div>
${hosts}
      <audio id="sfx-mix" class="clip" src="assets/sfx/mix.wav" data-start="0" data-duration="${FILM}" data-track-index="20" data-volume="1"></audio>
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
      tl.fromTo('.g1', { x: 0, y: 0 }, { x: ${reel ? 120 : 220}, y: ${reel ? 140 : 90}, duration: ${FILM}, ease: 'sine.inOut' }, 0);
      tl.fromTo('.g2', { x: 0, y: 0 }, { x: ${reel ? -140 : -260}, y: ${reel ? -120 : -70}, duration: ${FILM}, ease: 'sine.inOut' }, 0);
      tl.fromTo('.g3', { x: 0, y: 0 }, { x: ${reel ? -120 : -180}, y: ${reel ? 160 : 120}, duration: ${FILM}, ease: 'sine.inOut' }, 0);
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;
}

// landscape lives at the project root; the reel is a sibling project in reel/ that shares assets/ and lib/ by symlink
const outDir = k => (k === 'L' ? ROOT : path.join(ROOT, 'reel'));
if (fs.existsSync(path.join(ROOT, 'reel.html'))) fs.unlinkSync(path.join(ROOT, 'reel.html'));
for (const k of ['L', 'P']) {
  const dir = outDir(k); const pre = k.toLowerCase() + '-';
  fs.mkdirSync(path.join(dir, 'compositions'), { recursive: true });
  for (const f of fs.readdirSync(path.join(dir, 'compositions'))) if (/^[lp]-.*\.html$/.test(f)) fs.unlinkSync(path.join(dir, 'compositions', f));
  for (const [id, html] of Object.entries(scenes[k])) if (typeof html === 'string') fs.writeFileSync(path.join(dir, 'compositions', `${pre}${id}.html`), html);
  fs.writeFileSync(path.join(dir, 'index.html'), rootHTML(k));
}
{ const rd = path.join(ROOT, 'reel');
  for (const f of ['hyperframes.json', 'package.json', 'meta.json']) { let t = fs.readFileSync(path.join(ROOT, f), 'utf8'); if (f !== 'hyperframes.json') t = t.replace(/forma-launch/g, 'forma-launch-reel'); fs.writeFileSync(path.join(rd, f), t); }
  for (const l of ['assets', 'lib']) { const lp = path.join(rd, l); if (!fs.existsSync(lp)) fs.symlinkSync(path.join('..', l), lp); } }
fs.writeFileSync(path.join(ROOT, 'data', 'cues.json'), JSON.stringify({ film: FILM, cues }, null, 1));
console.log(`film ${FILM}s · ${Object.keys(scenes.L).length} scenes per layout · ${cues.length} sound cues`);
for (const [id, s] of Object.entries(S)) console.log(`  ${id.padEnd(8)} ${String(s.start).padStart(6)} → ${String(r3(s.start + s.dur)).padStart(6)}`);
