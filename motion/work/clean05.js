// Advances/closes ONLY Table 05 orders and requests (never touches other tables)
const {chromium}=require('playwright');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await chromium.launch();
 const ctx=await b.newContext({viewport:{width:1180,height:820},storageState:'state_staff.json',locale:'en-US'});
 const p=await ctx.newPage();
 await p.goto('https://tablekind.thezavino.workers.dev/workspace',{waitUntil:'networkidle'}); await sleep(2000);
 await p.getByPlaceholder(/Table or order/).fill('05'); await sleep(1200);
 for(let round=0;round<12;round++){
   const cards=p.locator('div').filter({has:p.getByText('Table 05',{exact:true})}).filter({has:p.getByRole('button',{name:/Details/})});
   const n=await cards.count(); let acted=false;
   // consider only innermost card elements: iterate from last
   for(let i=n-1;i>=0;i--){
     const c=cards.nth(i);
     for(const lab of ['Accept order','Food is ready','Mark as served']){
       const bt=c.getByRole('button',{name:lab,exact:true});
       if(await bt.count()){ await bt.first().click(); acted=true; await sleep(3500); break; }
     }
     if(acted) break;
   }
   if(!acted) break;
 }
 // close Table 05 requests
 for(let r=0;r<4;r++){
   const req=p.locator('div').filter({has:p.getByText('Table 05',{exact:true})}).filter({has:p.getByRole('button',{name:/On my way|Request done/})}).last();
   if(!(await req.count())) break;
   const a=req.getByRole('button',{name:'On my way',exact:true}); const d=req.getByRole('button',{name:'Request done',exact:true});
   if(await a.count()){await a.click();await sleep(2500);} else if(await d.count()){await d.click();await sleep(2500);} else break;
 }
 const txt=(await p.evaluate(()=>document.body.innerText)).replace(/\n+/g,' | ');
 console.log(txt.match(/Guest requests \| [^|]*/)?.[0], '||', txt.match(/\d+ orders shown/)?.[0]||'(no orders shown text)', '||', (txt.match(/Table 05/g)||[]).length,'Table 05 mentions');
 await b.close();
})();
