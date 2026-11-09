const {chromium}=require('playwright');
const {startRec,sleep}=require('./reclib');
let S,b;
(async()=>{
 b=await chromium.launch();
 const sctx=await b.newContext({viewport:{width:1180,height:1180},deviceScaleFactor:1.25,storageState:'state_staff.json',locale:'en-US'});
 const sp=await sctx.newPage();
 await sp.goto('https://tablekind.thezavino.workers.dev/workspace',{waitUntil:'networkidle'});
 await sp.getByRole('button',{name:'English'}).click().catch(()=>{}); await sleep(1500);
 // Bills page peek (debug)
 await sp.getByText('Bills',{exact:true}).first().click(); await sleep(2500);
 await sp.screenshot({path:'dry/s_bills.png'});
 console.log('BILLS:',(await sp.evaluate(()=>document.body.innerText)).replace(/\n+/g,' | ').slice(150,700));
 await sp.getByText('Orders & service',{exact:true}).first().click(); await sleep(1500);
 S=await startRec(sp,'t_tables',{quality:90,maxW:1475,maxH:1475});
 S.ev('mark',{label:'rec_start'}); await sleep(700);
 await S.tap(sp.getByText('Tables & QR',{exact:true}).first(),'nav_tables',{touch:false}); await sp.getByText('Tables 12 tables').first().waitFor().catch(()=>{});
 await sleep(2000); S.ev('mark',{label:'grid_visible'});
 await sp.evaluate(()=>window.scrollTo({top:520,behavior:'smooth'})); await sleep(2000); S.ev('mark',{label:'scrolled'});
 await sp.evaluate(()=>window.scrollTo({top:0,behavior:'smooth'})); await sleep(1500);
 const a=await S.stop(); console.log('frames',a);
 await b.close();
})().catch(async e=>{console.error('ERR',e.message);try{if(S)await S.stop();}catch(_){ }try{await b.close()}catch(_){ }process.exit(1)});
