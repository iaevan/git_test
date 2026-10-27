// One entry per beat. Each take starts from a clean page; `run` performs the real interaction while recording.
const W = 1280, H = 720;
const ramp = (n, a, b) => Array.from({ length: n }, (_, i) => Math.round(a + (b - a) * (n === 1 ? 1 : i / (n - 1))));
// accelerate -> cruise -> settle, in ms between wheel events (the app throttles its tick to >= 55 ms)
const spin = (n) => [...ramp(Math.ceil(n * 0.38), 190, 66), ...ramp(Math.max(1, n - Math.ceil(n * 0.38) - Math.ceil(n * 0.34)), 64, 62), ...ramp(Math.ceil(n * 0.34), 70, 230)];

module.exports = {
  // Landing hero -> click the CTA -> the empty workspace opens on the same beat.
  landing: {
    url: '/',
    setup: async r => { await r.sleep(1200); },
    run: async r => {
      await r.sleep(2400);
      await r.moveToSel('a[href="/app"]:has-text("convert something")', { ms: 1250, arc: 0.1 });
      await r.sleep(380); await r.click();
      await r.page.waitForURL('**/app'); r.mark('route', { to: '/app' });
      await r.sleep(2200);
    },
  },

  // Drag a real file onto the empty workspace.
  drop: {
    url: '/app',
    attempts: 1,
    run: async r => {
      await r.sleep(1300);
      await r.dragIn('png', { from: { x: W + 40, y: H - 70 }, ms: 1000, hover: 650 });
      await r.sleep(2400);
    },
  },

  // The signature gesture, kept to formats a PNG can really become: WebP -> AVIF -> GIF -> BMP -> TIFF -> ICO -> PDF and back.
  // A two-format wheel gesture hops over HEIC and SVG (which a PNG cannot become), as a quick real scroll does.
  wheel: {
    url: '/app?sample=1',
    attempts: 4,
    run: async r => {
      await r.sleep(900);
      await r.moveToSel('.format-wheel-track', { ms: 900, ox: 0.5, oy: 0.55, arc: 0.1 });
      await r.sleep(550);
      await r.wheelSeq([[240, 175], [480, 135], [240, 100], [240, 88], [240, 96], [480, 560]]);   // AVIF GIF BMP TIFF ICO PDF
      await r.wheelSeq([[-480, 170], [-240, 125], [-240, 98], [-240, 92], [-480, 112], [-240, 1700]]); // ICO TIFF BMP GIF AVIF WebP
      r.mark('selected', { label: await r.page.evaluate(() => document.querySelector('.format-file.is-selected')?.getAttribute('aria-label')) });
    },
  },

  // "A little more control": resize + quality.
  details: {
    url: '/app?sample=1',
    run: async r => {
      await r.sleep(900);
      await r.moveToSel('.details-trigger', { ms: 1000 }); await r.sleep(300); await r.click(); await r.sleep(900);
      await r.moveToSel('dialog[open] [aria-label="Resize image"]', { ms: 700 }); await r.sleep(180); await r.click(); await r.sleep(650);
      await r.moveToSel('dialog[open] input[inputmode="numeric"], dialog[open] input[type="number"], dialog[open] input[type="text"]', { ms: 650 });
      await r.click(); await r.page.keyboard.press('Control+A'); await r.sleep(150);
      for (const ch of '800') { await r.page.keyboard.press(ch); r.mark('key', { ch }); await r.sleep(135); }
      await r.sleep(450);
      await r.moveToSel('dialog[open] [aria-label="Adjust quality"]', { ms: 700 }); await r.sleep(160); await r.click(); await r.sleep(800);
      await r.moveToSel('dialog[open] .button-dark.sheet-done', { ms: 800 }); await r.sleep(300); await r.click(); await r.sleep(1500);
    },
  },

  // Convert for real: confirm, convert on-device, the result.
  convert: {
    url: '/app?sample=1',
    run: async r => {
      await r.sleep(800);
      await r.moveToSel('.stage-primary', { ms: 1000 }); await r.sleep(350); await r.click(); await r.sleep(950);
      const label = r.page.locator('.consent-check').last(); const b = await label.boundingBox();
      await r.move(b.x + 14, b.y + b.height / 2, { ms: 750 }); await r.sleep(200); await r.click(); await r.sleep(650);
      await r.moveToSel('.button-primary.sheet-done', { ms: 650 }); await r.sleep(260); await r.click(); r.mark('convert');
      await r.waitText(/Your WebP is ready/); r.mark('ready');
      await r.sleep(2600);
      await r.moveToSel('.stage-primary', { ms: 800 }); await r.sleep(500); await r.click(); r.mark('download');
      await r.sleep(1600);
    },
  },

  // "Drop a file. Watch its possibilities light up." -- six real drops back to back.
  montage: {
    url: '/app',
    run: async r => {
      await r.sleep(800);
      const seq = [['png', { x: W + 40, y: 120 }], ['csv', { x: -40, y: 560 }], ['wav', { x: W + 40, y: 640 }], ['mp4', { x: -40, y: 140 }], ['pdf', { x: W / 2, y: H + 40 }], ['ttf', { x: W + 40, y: 380 }]];
      for (const [spec, from] of seq) { await r.dragIn(spec, { from, ms: 560, hover: 140 }); await r.sleep(820); }
      await r.sleep(500);
    },
  },

  // "All 53 formats".
  formats: {
    url: '/app?sample=1',
    run: async r => {
      await r.sleep(800);
      await r.moveToSel('.browse-formats', { ms: 950 }); await r.sleep(300); await r.click(); await r.sleep(1100);
      const list = await r.box('.format-browser-list'); await r.move(list.x + list.width * 0.5, list.y + list.height * 0.45, { ms: 500 });
      for (let i = 0; i < 26; i++) { await r.page.mouse.wheel(0, 70); r.mark('scroll'); await r.sleep(46); }
      await r.sleep(900);
      for (let i = 0; i < 26; i++) { await r.page.mouse.wheel(0, -70); await r.sleep(30); }
      await r.sleep(700);
    },
  },

  // One continuous real flow: details (resize + quality) -> close -> convert -> confirm -> result.
  flow: {
    url: '/app?sample=1',
    attempts: 2,
    run: async r => {
      await r.sleep(600);
      await r.moveToSel('.details-trigger', { ms: 760 }); await r.sleep(180); await r.click(); await r.sleep(720);
      await r.moveToSel('dialog[open] [aria-label="Resize image"]', { ms: 480 }); await r.sleep(100); await r.click(); await r.sleep(480);
      await r.moveToSel('dialog[open] input[type="number"], dialog[open] input[inputmode="numeric"], dialog[open] input[type="text"]', { ms: 380 });
      await r.click(); await r.page.keyboard.press('Control+A'); await r.sleep(80);
      for (const ch of '800') { await r.page.keyboard.press(ch); r.mark('key', { ch }); await r.sleep(105); }
      await r.sleep(260);
      await r.moveToSel('dialog[open] [aria-label="Adjust quality"]', { ms: 420 }); await r.sleep(90); await r.click(); await r.sleep(720);
      await r.moveToSel('dialog[open] .dialog-close', { ms: 520 }); await r.sleep(150); await r.click(); r.mark('details-closed'); await r.sleep(650);
      await r.moveToSel('.stage-primary', { ms: 650 }); await r.sleep(200); await r.click(); await r.sleep(780);
      const label = r.page.locator('.consent-check').last(); const b = await label.boundingBox();
      await r.move(b.x + 14, b.y + b.height / 2, { ms: 440 }); await r.sleep(120); await r.click(); await r.sleep(520);
      await r.moveToSel('.button-primary.sheet-done', { ms: 400 }); await r.sleep(160); await r.click(); r.mark('convert');
      await r.waitText(/Your WebP is ready/); r.mark('ready');
      r.mark('result', { text: await r.page.evaluate(() => (document.body.innerText.match(/Before[\s\S]{0,60}smaller/) || [''])[0].replace(/\n+/g, ' | ') ) });
      await r.sleep(2300);
      await r.moveToSel('.stage-primary', { ms: 700 }); await r.sleep(380); await r.click(); r.mark('download');
      await r.sleep(1300);
    },
  },

  // Five quick real drops of different file types onto a loaded workspace.
  montage2: {
    url: '/app?sample=1',
    attempts: 2,
    run: async r => {
      await r.sleep(700);
      const seq = [['csv', { x: -40, y: 560 }], ['wav', { x: W + 40, y: 600 }], ['mp4', { x: -40, y: 150 }], ['pdf', { x: W / 2 + 120, y: H + 40 }], ['ttf', { x: W + 40, y: 300 }]];
      for (const [spec, from] of seq) { await r.dragIn(spec, { from, ms: 470, hover: 70 }); await r.sleep(690); }
      await r.sleep(400);
    },
  },

  // The format browser, opened and scrolled quickly.
  formats2: {
    url: '/app?sample=1',
    run: async r => {
      await r.sleep(600);
      await r.moveToSel('.browse-formats', { ms: 800 }); await r.sleep(200); await r.click(); await r.sleep(800);
      const list = await r.box('.format-browser-list'); await r.move(list.x + list.width * 0.5, list.y + list.height * 0.5, { ms: 420 });
      for (let i = 0; i < 9; i++) { await r.page.mouse.wheel(0, 160); r.mark('scroll'); await r.sleep(60); }
      await r.sleep(500);
    },
  },
};
