// Scenes 3-6: guest phone (menu open, categories, add+extra, place order) + staff tablet (live arrival, status steps, Bangla flip)
const {chromium}=require('playwright');
const {startRec,sleep}=require('./reclib');
const URL='https://tablekind.thezavino.workers.dev/t/ce2c02c4dad75b3f3e4972da90d60b38';
let S,G,b;
(async()=>{
 b=await chromium.launch();
 const sctx=await b.newContext({viewport:{width:1180,height:1180},deviceScaleFactor:1.25,storageState:'state_staff.json',locale:'en-US'});
 const gctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:'en-US'});
 const sp=await sctx.newPage(), gp=await gctx.newPage();
 // ---- staff prepares (not recorded) then recording starts
 await sp.goto('https://tablekind.thezavino.workers.dev/workspace',{waitUntil:'networkidle'});
 await sp.getByRole('button',{name:'English'}).click().catch(()=>{});
 await sp.getByPlaceholder(/Table or order/).fill('05'); await sleep(1200);
 S=await startRec(sp,'t_order',{quality:90,maxW:1475,maxH:1475});
 G=await startRec(gp,'g_order',{quality:90,maxW:780,maxH:1688});
 S.ev('mark',{label:'staff_rec_start'}); G.ev('mark',{label:'guest_rec_start'});
 // ---- guest
 await gp.goto(URL,{waitUntil:'domcontentloaded'});
 await gp.getByText('What looks good?').waitFor(); G.ev('mark',{label:'loaded'}); await sleep(1400);
 for(const name of ['All-day breakfast','Mains','Coffee & drinks','Something sweet']){
   await G.tap(gp.getByText(name,{exact:true}).first(),'chip:'+name); await sleep(900);
   await gp.evaluate(()=>window.scrollBy({top:300,behavior:'smooth'})); await sleep(1100);
 }
 await G.tap(gp.getByText('All',{exact:true}).first(),'chip:All').catch(()=>{}); await sleep(600);
 await gp.evaluate(()=>window.scrollTo({top:0,behavior:'smooth'})); await sleep(1200);
 G.ev('mark',{label:'scene5_start'});
 await G.tap(gp.getByText('Add',{exact:true}).first(),'add_avocado'); await sleep(1300);
 await G.tap(gp.getByText('Extra poached egg'),'extra_egg'); await sleep(900);
 await G.tap(gp.getByText(/Add to basket/),'add_to_basket'); await sleep(1400);
 await G.tap(gp.getByText('Review order'),'review_order'); await sleep(1500);
 G.ev('mark',{label:'place_tap'}); S.ev('mark',{label:'guest_placing'});
 await G.tap(gp.getByText(/Place order/),'place_order');
 // staff: wait for live arrival
 const card=()=>sp.locator('div').filter({has:sp.getByText(/#[0-9A-F]{8}/)}).filter({has:sp.getByRole('button',{name:/Details/})}).last();
 await card().waitFor({timeout:30000}); S.ev('mark',{label:'order_arrived'});
 await sp.getByText(/New order · Table 05/).first().waitFor({state:'hidden',timeout:20000}).catch(()=>{}); S.ev('mark',{label:'toast_gone'}); await sleep(900);
 await S.tapv(card().getByRole('button',{name:'Accept order'}),'accept',{touch:false}); S.ev('mark',{label:'accept_tap'});
 await card().getByRole('button',{name:'Food is ready'}).waitFor({timeout:30000}); S.ev('mark',{label:'preparing_visible'}); await sleep(1500);
 await S.tapv(card().getByRole('button',{name:'Food is ready'}),'ready',{touch:false}); S.ev('mark',{label:'ready_tap'});
 await card().getByRole('button',{name:'Mark as served'}).waitFor({timeout:30000}); S.ev('mark',{label:'ready_visible'}); await sleep(1300);
 // Bangla flip while the card is visible
 await S.tapv(sp.getByRole('button',{name:'বাংলা'}).first(),'bn',{touch:false}); S.ev('mark',{label:'bn_tap'}); await sleep(2300);
 await S.tapv(sp.getByRole('button',{name:'English'}).first(),'en',{touch:false}); S.ev('mark',{label:'en_tap'}); await sleep(1100);
 await S.tapv(card().getByRole('button',{name:'Mark as served'}),'serve',{touch:false}); S.ev('mark',{label:'serve_tap'});
 await sp.getByRole('button',{name:'Mark as served'}).waitFor({state:'hidden',timeout:25000}).catch(()=>{}); S.ev('mark',{label:'served_done'}); await sleep(1200);
 await S.tapv(sp.getByRole('button',{name:/^Served/}).first(),'tab_served',{touch:false}); S.ev('mark',{label:'tab_served_tap'}); await sleep(2600);
 // guest: finish
 await sleep(500); G.ev('mark',{label:'end'});
 const a=await S.stop(), c=await G.stop(); console.log('frames staff',a,'guest',c);
 await b.close();
})().catch(async e=>{console.error('ERR',e.message);try{if(S)await S.stop();if(G)await G.stop();}catch(_){ }try{await b.close()}catch(_){ }process.exit(1)});
