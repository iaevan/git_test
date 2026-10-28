#!/usr/bin/env node
/* Frame-accurate renderer.
 *   node tools/render.cjs <reel|land> <out.mp4> [--fps 60] [--from 0] [--to 54] [--workers 3] [--sub 3] [--crf 15]
 *
 * Every frame is rendered from the deterministic timeline at several sub-frame times and averaged
 * (temporal supersampling = real motion blur; whip transitions request more samples + a wider shutter).
 * Frames stream straight into x264 (BT.709). Nothing is written to disk but the final video.
 */
const { chromium } = require('playwright');
const sharp = require('sharp');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const argv = process.argv.slice(2);
const fmt = argv[0], outPath = argv[1];
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? +argv[i + 1] : d; };
const FPS = opt('fps', 60), T0 = opt('from', 0), WORKERS = opt('workers', 3), SUB = opt('sub', 3), CRF = opt('crf', 15);
const W = fmt === 'reel' ? 1080 : 1920, H = fmt === 'reel' ? 1920 : 1080;

(async () => {
  const browser = await chromium.launch({ args: ['--force-color-profile=srgb', '--font-render-hinting=none', '--allow-file-access-from-files', '--disable-lcd-text'] });
  const url = 'file://' + path.resolve(__dirname, '../src/index.html') + '?fmt=' + fmt + (process.env.INTRO ? '&intro=' + process.env.INTRO : '');
  const pages = [];
  for (let i = 0; i < WORKERS; i++) {
    const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => console.log('[pageerror]', e.message));
    await page.goto(url);
    await page.waitForFunction('window.__ready === true', null, { timeout: 60000 });
    pages.push({ page, cdp: await ctx.newCDPSession(page) });
  }
  const DUR = await pages[0].page.evaluate('window.DURATION');
  const blurs = await pages[0].page.evaluate('BLURS');
  const T1 = opt('to', DUR);
  const nFrames = Math.round((T1 - T0) * FPS);
  console.log(`render ${fmt} ${W}x${H} @${FPS}fps  ${T0}s→${T1}s  ${nFrames} frames  workers=${WORKERS}  blur windows=${blurs.length}`);

  // sub-frame plan for a frame centred on time tc
  const plan = (tc) => {
    let n = SUB, shutter = .5;
    for (const b of blurs) if (tc >= b.t0 && tc <= b.t1) { n = Math.max(n, b.n); shutter = Math.max(shutter, b.shutter); }
    const dt = 1 / FPS, ts = [];
    for (let k = 0; k < n; k++) ts.push(tc + dt * shutter * ((k + .5) / n - .5));
    return ts;
  };

  // triangular dither table (kills banding in the soft gradients before 8-bit/x264)
  const DN = W * H * 3 + 8192, dither = new Float32Array(DN);
  let seed = 12345; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  for (let i = 0; i < DN; i++) dither[i] = rnd() - rnd();

  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-',
    '-vf', 'scale=out_color_matrix=bt709:out_range=tv:flags=accurate_rnd+full_chroma_int,format=yuv420p',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', String(CRF), '-tune', 'animation', '-profile:v', 'high', '-threads', '2',
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-movflags', '+faststart', outPath], { stdio: ['pipe', 'inherit', 'inherit'] });

  const results = new Array(nFrames), waiters = new Array(nFrames);
  let nextJob = 0, written = 0;
  const LOOKAHEAD = WORKERS * 3;

  async function renderFrame(w, f) {
    const tc = T0 + f / FPS;
    const ts = plan(tc);
    const acc = new Float32Array(W * H * 3);
    for (const t of ts) {
      await w.page.evaluate((t) => window.__seek(t), t);
      const r = await w.cdp.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true });
      const { data } = await sharp(Buffer.from(r.data, 'base64')).removeAlpha().raw().toBuffer({ resolveWithObject: true });
      for (let i = 0; i < acc.length; i++) acc[i] += data[i];
    }
    const out = Buffer.allocUnsafe(acc.length);
    const inv = 1 / ts.length, off = (f * 7919) % 8192;
    for (let i = 0; i < acc.length; i++) {
      const v = acc[i] * inv + dither[off + i] * .75;
      out[i] = v < 0 ? 0 : v > 255 ? 255 : (v + .5) | 0;
    }
    return out;
  }

  const t0 = Date.now();
  const workerLoop = async (w) => {
    for (;;) {
      while (nextJob - written > LOOKAHEAD) await new Promise((r) => setTimeout(r, 15));
      const f = nextJob++;
      if (f >= nFrames) return;
      const buf = await renderFrame(w, f);
      results[f] = buf;
      if (waiters[f]) waiters[f]();
    }
  };
  const workers = pages.map(workerLoop);

  for (let f = 0; f < nFrames; f++) {
    if (!results[f]) await new Promise((r) => { waiters[f] = r; if (results[f]) r(); });
    const buf = results[f]; results[f] = null;
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    written = f + 1;
    if (f % 60 === 0 || f === nFrames - 1) {
      const el = (Date.now() - t0) / 1000, rate = (f + 1) / el;
      process.stdout.write(`\r  frame ${f + 1}/${nFrames}  ${rate.toFixed(2)} fps  eta ${((nFrames - f - 1) / rate / 60).toFixed(1)} min   `);
    }
  }
  await Promise.all(workers);
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  await browser.close();
  console.log(`\ndone in ${((Date.now() - t0) / 60000).toFixed(1)} min → ${outPath}`);
})();
