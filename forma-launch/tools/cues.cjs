// dumps the SFX cue list + motion-blur windows authored in the scenes
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const fmt = process.argv[2] || 'reel';
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const p = await (await b.newContext({ viewport: { width: fmt === 'reel' ? 1080 : 1920, height: fmt === 'reel' ? 1920 : 1080 } })).newPage();
  p.on('pageerror', e => console.log('[pageerror]', e.message));
  await p.goto('file://' + path.resolve(__dirname, '../src/index.html') + '?fmt=' + fmt);
  await p.waitForFunction('window.__ready === true');
  const cues = await p.evaluate('CUES'), blurs = await p.evaluate('BLURS'), dur = await p.evaluate('DURATION');
  cues.sort((a, c) => a.t - c.t);
  fs.mkdirSync(path.resolve(__dirname, '../out'), { recursive: true });
  fs.writeFileSync(path.resolve(__dirname, '../out/cues_' + fmt + '.json'), JSON.stringify(cues, null, 1));
  fs.writeFileSync(path.resolve(__dirname, '../out/blurs_' + fmt + '.json'), JSON.stringify(blurs));
  console.log('cues', cues.length, 'blur windows', blurs.length, 'duration', dur);
  const byName = {}; cues.forEach(c => byName[c.name] = (byName[c.name] || 0) + 1); console.log(JSON.stringify(byName));
  await b.close();
})();
