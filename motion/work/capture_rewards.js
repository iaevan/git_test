// Scene 7: real Rewards tab; stamp progress staged by feeding the page demo data (no account created, no SMS)
const {chromium}=require('playwright');
const {startRec,sleep}=require('./reclib');
const TOKEN='ce2c02c4dad75b3f3e4972da90d60b38';
const URL='https://tablekind.thezavino.workers.dev/t/'+TOKEN;
const STATE={enrolled:0,stamps:0,name:'Nadia'};
let G,b;
(async()=>{
 b=await chromium.launch();
 const gctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:'en-US'});
 const gp=await gctx.newPage();
 await gp.route('**/api/guest/'+TOKEN,async route=>{
   if(route.request().method()!=='GET') return route.continue();
   const resp=await route.fetch(); const j=await resp.json();
   if(STATE.enrolled){j.guest.enrolled=1;j.guest.name=STATE.name;}
   j.stamps=STATE.stamps; await route.fulfill({response:resp,json:j});
 });
 await gp.goto(URL,{waitUntil:'networkidle'}); await sleep(900);
 G=await startRec(gp,'g_rewards',{quality:90,maxW:780,maxH:1688});
 G.ev('mark',{label:'rec_start'}); await sleep(900);
 await G.tap(gp.getByText('Rewards',{exact:true}).last(),'tab_rewards'); await sleep(1800);
 G.ev('mark',{label:'rewards_open'});
 await gp.evaluate(()=>window.scrollTo({top:420,behavior:'smooth'})); await sleep(1800); G.ev('mark',{label:'join_form'});
 await gp.screenshot({path:'dry/g_join_form.png'});
 await gp.evaluate(()=>window.scrollTo({top:0,behavior:'smooth'})); await sleep(1300);
 // staged: joined with 4 stamps
 for(const n of [4,5,6]){
   STATE.enrolled=1; STATE.stamps=n;
   await gp.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
   await sleep(n===6?2800:1800); G.ev('mark',{label:'stamps_'+n});
 }
 await gp.screenshot({path:'dry/g_stamps6.png'});
 const a=await G.stop(); console.log('frames guest',a);
 await b.close();
})().catch(async e=>{console.error('ERR',e.message);try{if(G)await G.stop();}catch(_){ }try{await b.close()}catch(_){ }process.exit(1)});
