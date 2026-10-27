// Shared helpers for driving the real Forma app.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'https://forma.thezavino.com';

// Runs before any page script: returning-user flag (no signup popup) and a
// tap on the app's own tick so every real sound it would make is timestamped.
const INIT = () => {
  try { localStorage.setItem('forma:signup-prompt-seen', '1'); } catch {}
  window.__ticks = [];
  const orig = AudioBufferSourceNode.prototype.start;
  AudioBufferSourceNode.prototype.start = function (...a) {
    window.__ticks.push(performance.timeOrigin + performance.now());
    return orig.apply(this, a);
  };
};

async function launch({ width = 1920, height = 1080, dsf = 1, mobile = false, args = [], headless = true } = {}) {
  const browser = await chromium.launch({ headless, args });
  const ctx = await browser.newContext({
    viewport: { width, height }, deviceScaleFactor: dsf, hasTouch: mobile, isMobile: mobile, acceptDownloads: true,
  });
  // Don't pollute the site's analytics with recording sessions.
  await ctx.route(/google-analytics|googletagmanager|cloudflareinsights|\/analytics|\/metrics\//, r => r.abort());
  await ctx.addInitScript(INIT);
  const page = await ctx.newPage();
  return { browser, ctx, page };
}

// A real HTML5 file drop: dragenter -> dragover -> drop, carrying real bytes.
async function dropFile(page, filePath, targetSel = '.conversion-stage', { stepsMs = 0 } = {}) {
  const b64 = fs.readFileSync(filePath).toString('base64');
  const name = path.basename(filePath);
  const ext = name.split('.').pop().toLowerCase();
  const mime = { png: 'image/png', csv: 'text/csv', wav: 'audio/wav', mp4: 'video/mp4', pdf: 'application/pdf', ttf: 'font/ttf', zip: 'application/zip' }[ext] || 'application/octet-stream';
  const dt = await page.evaluateHandle(({ b64, name, mime }) => {
    const bin = atob(b64); const u8 = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    const d = new DataTransfer(); d.items.add(new File([u8], name, { type: mime })); return d;
  }, { b64, name, mime });
  const fire = t => page.dispatchEvent(targetSel, t, { dataTransfer: dt });
  return { enter: () => fire('dragenter'), over: () => fire('dragover'), drop: () => fire('drop'), leave: () => fire('dragleave') };
}

module.exports = { BASE, launch, dropFile, INIT };
