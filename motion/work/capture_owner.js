// Scene 10: real owner-dashboard cards; bars/rows animate by driving the real DOM styles (data untouched)
const {chromium}=require('playwright');
const fs=require('fs');
const SP='/tmp/claude-0/-home-user-git-test/be241b3a-fa23-585d-b0f5-b0088e158aa8/scratchpad/seq';
const ease=t=>1-Math.pow(1-Math.min(1,Math.max(0,t)),3);
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
(async()=>{
 const b=await chromium.launch();
 const ctx=await b.newContext({viewport:{width:1280,height:900},deviceScaleFactor:2,locale:'en-US',storageState:'state_owner.json'});
 const p=await ctx.newPage();
 await p.goto('https://tablekind.thezavino.workers.dev/owner',{waitUntil:'networkidle'}); await p.waitForTimeout(3500);
 await p.addStyleTag({content:'html,body,main{background:transparent!important}'});
 const panel=(h)=>p.locator('section.owner-panel').filter({has:p.getByRole('heading',{name:h,exact:true})}).first();
 const shoot=async(name,h,n,step)=>{
   const dir=`${SP}/${name}`; fs.rmSync(dir,{recursive:true,force:true}); fs.mkdirSync(dir,{recursive:true});
   const el=panel(h); await el.scrollIntoViewIfNeeded();
   for(let i=0;i<n;i++){ await step(i/(n-1)); await el.screenshot({path:`${dir}/${String(i).padStart(4,'0')}.png`,omitBackground:true}); }
   console.log(name,n,'frames');
 };
 // 1) dishes
 const dishInfo=await p.evaluate(()=>[...document.querySelectorAll('.owner-dishes li')].map(li=>({w:parseFloat(li.querySelector('.owner-bar-track > span').style.width),n:parseInt(li.querySelector('b').textContent)})));
 await shoot('o_dishes','What diners order most',60,async(t)=>{
   await p.evaluate(({t,dishInfo})=>{[...document.querySelectorAll('.owner-dishes li')].forEach((li,k)=>{
     const pk=Math.min(1,Math.max(0,t*1.7-k*0.22)); const e=1-Math.pow(1-pk,3);
     li.style.opacity=String(Math.min(1,pk*3)); li.style.transform=`translateY(${(1-e)*14}px)`;
     li.querySelector('.owner-bar-track > span').style.width=(dishInfo[k].w*e)+'%';
     const bb=li.querySelector('b'); bb.firstChild.nodeValue=Math.round(dishInfo[k].n*e)+' ';
   })},{t,dishInfo});
 });
 await p.evaluate(()=>{[...document.querySelectorAll('.owner-dishes li')].forEach(li=>{li.style.opacity='';li.style.transform='';})});
 // 2) busy hours
 const hrs=await p.evaluate(()=>[...document.querySelectorAll('.owner-hour-chart > div > span')].map(s=>parseFloat(s.style.height)));
 await shoot('o_busy','When your tables get busy',54,async(t)=>{
   await p.evaluate(({t,hrs})=>{[...document.querySelectorAll('.owner-hour-chart > div > span')].forEach((s,i)=>{
     const pk=Math.min(1,Math.max(0,t*1.6-i*0.025)); const e=1-Math.pow(1-pk,3)*(1+0.0*pk);
     s.style.height=(hrs[i]*e)+'%'; s.style.transition='none';
   })},{t,hrs});
 });
 // 3) service: first stat counts up
 const SVC="section.owner-panel:has(h2)";
 const avg=await p.evaluate(()=>{const sec=[...document.querySelectorAll('section.owner-panel')].find(s=>s.querySelector('h2')&&s.querySelector('h2').textContent.trim()==='Service & feedback');const dd=sec.querySelector('dl.owner-stat-list.large dd');return {txt:dd.textContent,val:parseFloat(dd.textContent)}});
 console.log('avg',avg);
 await shoot('o_service','Service & feedback',48,async(t)=>{
   await p.evaluate(({t,avg})=>{const sec=[...document.querySelectorAll('section.owner-panel')].find(s=>s.querySelector('h2')&&s.querySelector('h2').textContent.trim()==='Service & feedback');const row=sec.querySelector('dl.owner-stat-list.large > div');const dd=row.querySelector('dd');
     const e=1-Math.pow(1-Math.min(1,t*1.5),3); dd.textContent=(avg.val*e).toFixed(1)+' min';
     row.style.background=`rgba(18,104,94,${0.10*Math.min(1,t*3)})`; row.style.borderRadius='10px'; row.style.transition='none';
   },{t,avg});
 });
 // static hero crop of the page top (no sidebar -> no email)
 await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(300);
 await p.screenshot({path:`${SP}/o_top.png`,clip:{x:236,y:72,width:1044,height:430},omitBackground:false});
 await b.close();
})();
