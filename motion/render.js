// usage: node render.js test <t...>   |   node render.js full <outDir> <fromFrame> <toFrame> <workers>
const {chromium}=require('playwright'); const fs=require('fs'); const path=require('path');
const SP='/tmp/claude-0/-home-user-git-test/be241b3a-fa23-585d-b0f5-b0088e158aa8/scratchpad';
const clips=JSON.parse(fs.readFileSync(__dirname+'/stage/clips.json')); const vo=JSON.parse(fs.readFileSync(__dirname+'/stage/vo.json'));
const URL='file://'+__dirname+'/stage/stage.html'; const FPS=30;
async function open(b){
  const ctx=await b.newContext({viewport:{width:1080,height:1920},deviceScaleFactor:1});
  const p=await ctx.newPage();
  p.on('pageerror',e=>console.error('PAGEERR',e.message)); p.on('console',m=>{if(m.type()==='error')console.error('CONSOLE',m.text())});
  await p.addInitScript(`window.CLIPS=${JSON.stringify(clips)};window.VO=${JSON.stringify(vo)};window.SEQ_BASE='file://${SP}/';`);
  await p.goto(URL); await p.evaluate(()=>window.READY); return p;
}
async function shot(p,t,file,q=92){
  await p.evaluate(t=>window.render(t),t); await p.evaluate(()=>window.settle()); await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  await p.screenshot({path:file,type:'jpeg',quality:q});
}
(async()=>{
  const mode=process.argv[2]; const b=await chromium.launch();
  if(mode==='test'){
    const p=await open(b); fs.mkdirSync(SP+'/test',{recursive:true});
    for(const t of process.argv.slice(3).map(Number)){ await shot(p,t,`${SP}/test/t_${t.toFixed(1)}.jpg`); }
    console.log('TOTAL',await p.evaluate(()=>window.TOTAL));
  } else if(mode==='full'){
    const out=process.argv[3], from=+process.argv[4], to=+process.argv[5], W=+process.argv[6]||3; fs.mkdirSync(out,{recursive:true});
    const pages=await Promise.all(Array.from({length:W},()=>open(b)));
    let next=from, done=0; const t0=Date.now();
    await Promise.all(pages.map(async p=>{ while(true){ const i=next++; if(i>=to)break; await shot(p,i/FPS,`${out}/${String(i).padStart(5,'0')}.jpg`); done++; if(done%100===0)console.log(done,'/',to-from,((Date.now()-t0)/1000).toFixed(0)+'s'); } }));
  }
  await b.close();
})().catch(e=>{console.error('ERR',e);process.exit(1)});
