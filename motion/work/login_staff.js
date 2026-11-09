const {chromium}=require('playwright');const fs=require('fs');
const C=JSON.parse(fs.readFileSync('creds.local.json'));
(async()=>{
 const b=await chromium.launch();
 const ctx=await b.newContext({viewport:{width:1180,height:820},deviceScaleFactor:1});
 const p=await ctx.newPage();
 await p.goto('https://tablekind.thezavino.workers.dev/workspace',{waitUntil:'networkidle'});
 await p.getByRole('button',{name:'English'}).click();
 await p.waitForTimeout(400);
 await p.locator('input:not([type=password])').first().fill(C.code);
 await p.locator('input[type=password]').fill(C.staff);
 await p.locator('input[type=password]').press('Enter');
 await p.waitForTimeout(3500);
 console.log('URL',p.url());
 await p.screenshot({path:'staff_home.png'});
 const info=await p.evaluate(()=>({
   h:[...document.querySelectorAll('h1,h2,h3')].map(e=>e.innerText.trim()).slice(0,20),
   nav:[...document.querySelectorAll('nav a,nav button,[role=tab],aside a,aside button')].map(e=>(e.innerText||'').trim()+'|'+(e.getAttribute('href')||'')).slice(0,40),
   links:[...document.querySelectorAll('a')].map(e=>(e.innerText||'').trim()+'|'+(e.getAttribute('href')||'')).slice(0,60)
 }));
 console.log(JSON.stringify(info,null,1));
 await ctx.storageState({path:'state_staff.json'});
 await b.close();
})();
