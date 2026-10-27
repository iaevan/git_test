// Real-time screen recorder for the live Forma app.
//   Xvfb (:99, W*DSF x (H+CHROME)*DSF)  ->  headed Chromium  ->  ffmpeg x11grab (cropped to the page)
// Every take writes <name>.mkv (wall-clock timestamps) and <name>.json (cursor path, clicks, drops, app ticks).
const { chromium } = require('playwright');
const { spawn, execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { INIT, BASE, dropFile } = require('./lib');

const W = 1280, H = 720, DSF = 2, CHROME = 87;
const OUT = path.resolve(process.env.OUT || 'out/takes');
const MEDIA = path.resolve(process.env.MEDIA || './media');
fs.mkdirSync(OUT, { recursive: true });


// Recording-only page tweaks: the app's UI is untouched; only Chrome's own popups are kept out of frame.
const REC_INIT = () => {
  window.__downloads = [];
  const oc = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () { if (this.hasAttribute('download')) { window.__downloads.push(Date.now()); return; } return oc.apply(this, arguments); };
  document.addEventListener('click', e => { const a = e.target.closest && e.target.closest('a[download]'); if (a) { e.preventDefault(); window.__downloads.push(Date.now()); } }, true);
  const strip = a => { const h = a.getAttribute('href'); if (h !== null) { a.dataset.fh = h; a.removeAttribute('href'); } };
  const restore = a => { if (a.dataset.fh !== undefined && !a.hasAttribute('href')) { a.setAttribute('href', a.dataset.fh); delete a.dataset.fh; } };
  document.addEventListener('mouseover', e => { const a = e.target.closest && e.target.closest('a[href]'); if (a) strip(a); }, true);
  document.addEventListener('mouseout', e => { const a = e.target.closest && e.target.closest('a'); if (a) restore(a); }, true);
};

const sleep = ms => new Promise(r => setTimeout(r, ms));
const easeInOut = p => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const easeOut = p => 1 - Math.pow(1 - p, 3.2);

const FILES = {
  png: { file: 'somewhere-nice.png', kind: 'image' },
  csv: { file: 'q3-revenue.csv', kind: 'csv', color: '#6fbf9b' },
  wav: { file: 'voice-note.wav', kind: 'wav', color: '#d77aa0' },
  mp4: { file: 'product-demo.mp4', kind: 'mp4', color: '#e0955b' },
  pdf: { file: 'launch-brief.pdf', kind: 'pdf', color: '#d9806a' },
  ttf: { file: 'brand-font.ttf', kind: 'ttf', color: '#8f7fd8' },
};

class Rec {
  constructor(page) {
    this.page = page; this.events = []; this.cursor = []; this.pos = { x: W + 60, y: H * 0.85 }; this.recording = false;
  }
  t() { return Date.now(); }
  mark(type, data = {}) { this.events.push({ t: this.t(), type, ...data }); }
  sleep(ms) { return sleep(ms); }
  // Smooth, slightly arced pointer travel; every sample is logged for the cursor overlay.
  async move(x, y, { ms = 700, arc = 0.12, ease = easeInOut } = {}) {
    const { x: x0, y: y0 } = this.pos; const dx = x - x0, dy = y - y0; const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len; const bend = len * arc;
    const start = performance.now();
    for (;;) {
      const p = Math.min(1, (performance.now() - start) / ms); const e = ease(p);
      const off = Math.sin(Math.PI * e) * bend;
      const cx = x0 + dx * e + nx * off, cy = y0 + dy * e + ny * off;
      await this.page.mouse.move(cx, cy); this.pos = { x: cx, y: cy };
      this.cursor.push([this.t(), +cx.toFixed(2), +cy.toFixed(2)]);
      if (p >= 1) break; await sleep(6);
    }
  }
  async box(sel) { const b = await this.page.locator(sel).first().boundingBox(); if (!b) throw new Error('no box ' + sel); return b; }
  async moveToSel(sel, { ox = 0.5, oy = 0.5, ...o } = {}) { const b = await this.box(sel); await this.move(b.x + b.width * ox, b.y + b.height * oy, o); return b; }
  async click({ hold = 70 } = {}) {
    await this.page.mouse.down(); this.mark('down', { x: this.pos.x, y: this.pos.y }); await sleep(hold);
    await this.page.mouse.up(); this.mark('up', { x: this.pos.x, y: this.pos.y });
  }
  // One wheel event per gap; 240px of deltaY moves the app's format wheel by exactly one format.
  async wheel(gaps, dir = 1) {
    for (const g of gaps) { await this.page.mouse.wheel(0, 240 * dir); this.mark('wheel', { dir }); await sleep(g); }
  }
  // [deltaY, ms to wait after]; 240 moves the app's wheel one format, 480 moves two (skipping a format that can't be a target).
  async wheelSeq(seq) {
    for (const [dy, gap] of seq) {
      await this.page.mouse.wheel(0, dy);
      const label = await this.page.evaluate(() => document.querySelector('.format-file.is-selected')?.getAttribute('aria-label'));
      this.mark('wheel', { dy, label }); await sleep(gap);
    }
  }
  async ghostShow(spec) {
    const f = FILES[spec]; const thumb = f.kind === 'image' ? 'data:image/png;base64,' + fs.readFileSync(path.join(MEDIA, f.file)).toString('base64') : '';
    await this.page.evaluate(({ f, thumb }) => {
      let g = document.getElementById('__ghost');
      if (!g) {
        g = document.createElement('div'); g.id = '__ghost';
        g.style.cssText = 'position:fixed;left:0;top:0;z-index:99999;pointer-events:none;will-change:transform;opacity:0;transform:translate(-300px,-300px)';
        document.body.appendChild(g);
        window.addEventListener('mousemove', e => { g.style.transform = `translate(${e.clientX + 16}px,${e.clientY + 12}px) rotate(-3deg)`; }, true);
      }
      const ext = f.file.split('.').pop().toUpperCase();
      const tile = thumb
        ? `<div style="width:112px;height:84px;border-radius:9px;background:#fff url(${thumb}) center/cover;border:4px solid #fff;box-shadow:0 14px 34px rgba(24,32,43,.28),0 2px 6px rgba(24,32,43,.18)"></div>`
        : `<div style="width:76px;height:96px;border-radius:10px;background:#fff;border:1px solid #e2e5ea;box-shadow:0 14px 34px rgba(24,32,43,.26),0 2px 6px rgba(24,32,43,.16);position:relative"><div style="position:absolute;left:10px;right:10px;top:16px;height:8px;border-radius:4px;background:${f.color}33"></div><div style="position:absolute;left:10px;right:26px;top:32px;height:8px;border-radius:4px;background:#e9ebef"></div><div style="position:absolute;left:10px;bottom:12px;padding:3px 7px;border-radius:6px;background:${f.color};color:#fff;font:700 11px/1 Inter,system-ui;letter-spacing:.04em">${ext}</div></div>`;
      g.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;gap:7px">${tile}<div style="padding:3px 9px;border-radius:7px;background:#18202b;color:#fff;font:500 12px/1.3 Inter,system-ui;white-space:nowrap">${f.file}</div></div>`;
      g.style.opacity = '1';
    }, { f, thumb });
  }
  async ghostHide() { await this.page.evaluate(() => { const g = document.getElementById('__ghost'); if (g) g.style.opacity = '0'; }); }
  // A real HTML5 drag-and-drop of one of the demo files onto the stage; the cursor carries the ghost in.
  async dragIn(spec, { from, toSel = '.converter-source-file', ms = 900, hover = 450, dropHold = 0 } = {}) {
    const dz = await dropFile(this.page, path.join(MEDIA, FILES[spec].file), '.conversion-stage');
    this.pos = { ...from }; await this.page.mouse.move(from.x, from.y); this.cursor.push([this.t(), from.x, from.y]);
    await this.ghostShow(spec); this.mark('ghost', { spec });
    const stage = await this.box('.conversion-stage'); const tgt = await this.box(toSel);
    const inside = (x, y) => x > stage.x && x < stage.x + stage.width && y > stage.y && y < stage.y + stage.height;
    let entered = false; const tx = tgt.x + tgt.width / 2, ty = tgt.y + tgt.height * 0.55;
    const start = performance.now();
    const { x: x0, y: y0 } = this.pos; const dx = tx - x0, dy = ty - y0; const len = Math.hypot(dx, dy) || 1; const nx = -dy / len, ny = dx / len;
    for (;;) {
      const p = Math.min(1, (performance.now() - start) / ms); const e = easeOut(p); const off = Math.sin(Math.PI * e) * len * 0.1;
      const cx = x0 + dx * e + nx * off, cy = y0 + dy * e + ny * off;
      await this.page.mouse.move(cx, cy); this.pos = { x: cx, y: cy }; this.cursor.push([this.t(), +cx.toFixed(2), +cy.toFixed(2)]);
      if (!entered && inside(cx, cy)) { entered = true; await dz.enter(); this.mark('dragenter'); }
      if (entered) await dz.over();
      if (p >= 1) break; await sleep(6);
    }
    if (!entered) { await dz.enter(); this.mark('dragenter'); }
    const end = performance.now() + hover; while (performance.now() < end) { await dz.over(); await sleep(50); }
    await dz.drop(); this.mark('drop', { spec }); await this.ghostHide(); if (dropHold) await sleep(dropHold);
  }
  async waitText(re, timeout = 15000) {
    await this.page.waitForFunction(r => new RegExp(r).test(document.body.innerText), re.source, { timeout }); this.mark('text', { re: re.source });
  }
  async ticks() { return this.page.evaluate(() => window.__ticks.slice()); }
}

function startFfmpeg(out) {
  const args = ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'x11grab', '-draw_mouse', '0', '-framerate', '30',
    '-video_size', `${W * DSF}x${H * DSF}`, '-use_wallclock_as_timestamps', '1', '-i', `:99+0,${CHROME * DSF}`,
    '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '12', '-pix_fmt', 'yuv420p', '-vsync', 'passthrough', '-copyts', out];
  const p = spawn('ffmpeg', args, { stdio: ['pipe', 'inherit', 'inherit'] });
  return p;
}
const stopFfmpeg = p => new Promise(res => { p.on('exit', res); p.stdin.write('q'); p.stdin.end(); });

async function main() {
  const takes = require('./takes');
  const want = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(takes);
  const browser = await chromium.launch({
    headless: false, args: [`--window-position=0,0`, `--window-size=${W},${H + CHROME}`, `--force-device-scale-factor=${DSF}`,
      '--hide-scrollbars', '--disable-infobars', '--no-first-run', '--no-default-browser-check', '--autoplay-policy=no-user-gesture-required',
      '--disable-features=Translate,TranslateUI', '--disable-notifications', '--disable-popup-blocking'],
  });
  const ctx = await browser.newContext({ viewport: null, acceptDownloads: true });
  await ctx.route(/google-analytics|googletagmanager|cloudflareinsights|\/analytics|\/metrics\//, r => r.abort());
  await ctx.addInitScript(INIT);
  await ctx.addInitScript(REC_INIT);
  const page = ctx.pages()[0] || (await ctx.newPage());
  await page.goto('about:blank');
  const dims = await page.evaluate(() => [innerWidth, innerHeight, devicePixelRatio].join('x'));
  console.log('viewport', dims, '(expect', `${W}x${H}x${DSF})`);
  if (dims !== `${W}x${H}x${DSF}`) throw new Error('viewport mismatch ' + dims + ' -> adjust CHROME');

  for (const name of want) {
    const take = takes[name]; if (!take) { console.log('skip unknown', name); continue; }
    const attempts = take.attempts || 1;
    for (let a = 1; a <= attempts; a++) {
      const rec = new Rec(page); const base = path.join(OUT, attempts > 1 ? `${name}-${a}` : name);
      await page.goto(BASE + (take.url || '/app'), { waitUntil: 'networkidle' });
      await page.evaluate(() => { window.__ticks.length = 0; });
      await page.mouse.move(W + 60, H * 0.85);
      if (take.setup) await take.setup(rec);
      await sleep(900);
      const ff = startFfmpeg(base + '.mkv'); await sleep(900); rec.mark('start');
      try { await take.run(rec); } catch (e) { console.error('take failed', name, e.message); }
      rec.mark('end'); await sleep(350); await stopFfmpeg(ff);
      const ticks = await rec.ticks(); const downloads = await page.evaluate(() => window.__downloads.length);
      const start = parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=start_time', '-of', 'csv=p=0', base + '.mkv']).toString());
      const dur = parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', base + '.mkv']).toString());
      fs.writeFileSync(base + '.json', JSON.stringify({ name, W, H, DSF, videoStartEpoch: start, videoEndEpoch: dur, events: rec.events, cursor: rec.cursor, ticks }, null, 1));
      console.log(`${name}${attempts > 1 ? '-' + a : ''}: ${(dur - start).toFixed(2)}s, ${downloads} suppressed downloads, ${rec.cursor.length} cursor samples, ${ticks.length} app ticks, ${rec.events.length} events`);
    }
  }
  await browser.close();
}
main().catch(e => { console.error(e); process.exit(1); });
