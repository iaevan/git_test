const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({args:['--force-color-profile=srgb','--disable-lcd-text','--font-render-hinting=none']});
  const p = await (await b.newContext({viewport:{width:1080,height:1920}, deviceScaleFactor:1})).newPage();
  await p.setContent(`<style>body{margin:0;background:#f7f8fa;overflow:hidden;font-family:Inter}
   .c{position:absolute;width:600px;height:760px;border-radius:60px;background:linear-gradient(145deg,#fff,#fafbfe);box-shadow:0 60px 90px -40px #58658b66,0 10px 24px -10px #5968872a;left:240px;top:300px;transform:perspective(1800px) rotateY(-18deg) rotate(-6deg)}
   .b{position:absolute;inset:0;background:radial-gradient(60% 40% at 30% 20%,#b8c0ff 0,transparent 70%),radial-gradient(50% 40% at 80% 70%,#f4caad 0,transparent 70%);filter:blur(40px)}
   h1{position:absolute;top:1300px;left:60px;font:600 150px Inter;letter-spacing:-8px;filter:blur(6px)}</style><div class=b></div><div class=c></div><h1>Convert files.</h1>`);
  const cdp = await p.context().newCDPSession(p);
  for (const fmt of ['png','jpeg']) {
    const t0=Date.now(); let n=20;
    for (let i=0;i<n;i++){ await p.evaluate(i=>{document.querySelector('.c').style.transform=`perspective(1800px) rotateY(${-18+i}deg) rotate(-6deg)`},i);
      const r = await cdp.send('Page.captureScreenshot', fmt==='png'?{format:'png',optimizeForSpeed:true}:{format:'jpeg',quality:95}); }
    console.log(fmt, ((Date.now()-t0)/n).toFixed(0)+' ms/frame');
  }
  await b.close();
})();
