/* TableMate – "What is TableMate?" motion stage. Deterministic: window.render(t) draws frame at time t (seconds). */
(function(){
const W=1080,H=1920,FPS=30;
const CLIPS=window.CLIPS, VO=window.VO, SEQ=window.SEQ_BASE||'';
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const prog=(t,a,b)=>clamp((t-a)/(b-a));
const eo3=p=>1-Math.pow(1-clamp(p),3), eio=p=>{p=clamp(p);return p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2};
const eback=(p,s=1.9)=>{p=clamp(p);return 1+(s+1)*Math.pow(p-1,3)+s*Math.pow(p-1,2)};
const lerp=(a,b,p)=>a+(b-a)*p;
const layer=document.getElementById('layer');
function mk(parent,html,css,cls){const d=document.createElement('div');if(cls)d.className=cls;if(css)d.style.cssText=css;if(html!=null)d.innerHTML=html;parent.appendChild(d);return d}
// element placed by centre (cx,cy). e._w/_h must be set.
function put(e,cx,cy,{s=1,sx,sy,r=0,o=1}={}){e.style.transform=`translate(${cx-e._w/2}px,${cy-e._h/2}px) rotate(${r}deg) scale(${sx??s},${sy??s})`;e.style.opacity=o;e.style.display=o<=0.002?'none':(e._disp||'block')}
function box(parent,w,h,html,css,cls){const d=mk(parent,html,`position:absolute;left:0;top:0;width:${w}px;height:${h}px;${css||''}`,cls);d._w=w;d._h=h;return d}

/* ---------- icons ---------- */
const IC={
hand:'<path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>',
pointer:'<path d="M22 14a8 8 0 0 1-8 8"/><path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1"/><path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>',
user:'<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
check:'<path d="M20 6 9 17l-5-5"/>',
coffee:'<path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/>',
tag:'<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".6" fill="currentColor"/>',
sliders:'<line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/>',
star:'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
ban:'<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
receipt:'<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/>',
lang:'<path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/>',
live:'<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>',
users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
grid:'<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
phone:'<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>',
tablet:'<rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><line x1="12" x2="12.01" y1="18" y2="18"/>',
chart:'<line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/>',
arrow:'<path d="M7 7l10 10"/><path d="M17 8v9H8"/>',
crossed:'<path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8"/><path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7"/><path d="m2.1 21.8 6.4-6.3"/><path d="m19 5-7 7"/>'
};
const svg=(p,extra='')=>`<svg viewBox="0 0 24 24" ${extra}>${IC[p]}</svg>`;

/* ---------- schedule ---------- */
const DUR=VO.scenes; const ST=[];let acc=0;DUR.forEach(d=>{ST.push(acc);acc+=d});const TOTAL=acc;
const sc=i=>ST[i-1], se=i=>ST[i-1]+DUR[i-1];
window.TOTAL=TOTAL;

/* ---------- background (gradient glows change by scene) ---------- */
const bgEl=document.getElementById('bg');
const COL={peach:[255,222,200],mint:[205,232,216],butter:[255,238,196],blush:[255,226,216],sage:[222,240,228]};
const PAL=[ // per scene: 4 blobs [x,y,r,colour,alpha]
 [[950,260,720,'peach',.9],[120,1500,820,'mint',.85],[540,900,640,'butter',.55],[900,1700,500,'sage',.5]],
 [[150,300,700,'mint',.9],[980,1300,800,'peach',.8],[500,1750,600,'butter',.6],[950,300,420,'sage',.5]],
 [[920,380,700,'mint',.85],[100,1100,760,'peach',.75],[600,1800,600,'sage',.6],[200,200,420,'butter',.6]],
 [[100,420,720,'peach',.85],[960,1500,820,'mint',.9],[540,1000,560,'butter',.5],[900,300,420,'sage',.5]],
 [[980,260,700,'butter',.9],[80,1400,820,'mint',.85],[600,1000,500,'peach',.5],[900,1800,520,'sage',.5]],
 [[100,300,740,'mint',.9],[1000,1200,780,'peach',.8],[560,1800,600,'butter',.6],[960,200,420,'sage',.5]],
 [[960,300,720,'peach',.9],[100,1300,820,'butter',.8],[600,1800,520,'mint',.8],[200,250,420,'sage',.5]],
 [[120,300,720,'mint',.9],[980,1400,800,'peach',.85],[560,900,520,'butter',.5],[950,250,420,'blush',.6]],
 [[900,300,720,'butter',.9],[100,1500,820,'mint',.9],[600,900,520,'peach',.5],[960,1800,420,'sage',.6]],
 [[160,320,720,'peach',.85],[960,1200,820,'mint',.85],[520,1800,620,'butter',.6],[900,300,420,'sage',.5]],
 [[940,300,720,'mint',.9],[100,1500,800,'peach',.85],[600,900,560,'butter',.55],[150,250,420,'sage',.5]],
 [[540,500,900,'mint',.9],[100,1700,700,'peach',.8],[980,1700,700,'butter',.7],[540,1500,500,'sage',.5]],
 [[100,320,720,'butter',.9],[980,1000,800,'mint',.9],[560,1800,600,'peach',.7],[900,260,420,'sage',.5]],
 [[540,600,900,'peach',.85],[100,1600,760,'mint',.9],[980,1500,700,'butter',.7],[900,200,420,'sage',.5]]
];
const blobs=[0,1,2,3].map(()=>{const b=mk(bgEl,'','',"blob");return b});
function bg(t){
 let i=0;for(let k=0;k<ST.length;k++)if(t>=ST[k])i=k;
 const lt=t-ST[i],p=i>0?eio(prog(lt,0,0.9)):1;
 const A=PAL[i],B=PAL[Math.max(0,i-1)];
 blobs.forEach((b,k)=>{
  const a=A[k],o=B[k];
  const x=lerp(o[0],a[0],p),y=lerp(o[1],a[1],p),r=lerp(o[2],a[2],p),al=lerp(o[4],a[4],p);
  const c1=COL[o[3]],c2=COL[a[3]],c=c1.map((v,j)=>Math.round(lerp(v,c2[j],p)));
  b.style.width=b.style.height=(r*2)+'px';b.style.transform=`translate(${x-r}px,${y-r}px)`;
  b.style.background=`radial-gradient(closest-side,rgba(${c[0]},${c[1]},${c[2]},${al}) 0%,rgba(${c[0]},${c[1]},${c[2]},${al*0.55}) 45%,rgba(${c[0]},${c[1]},${c[2]},0) 100%)`;
 });
}

/* ---------- headlines ---------- */
const HL=[
 ['The problem',['Your team can’t be at','every table, [every] minute.']],
 ['The turn',['But your','[menu] can be.']],
 ['Scan',['Scan the [QR].','That’s it.']],
 ['The menu',['The full [menu],','on their phone.']],
 ['Order',['One tap.','Order [sent].']],
 ['Your team',['Your team sees it.','[Live.]']],
 ['Rewards',['Waiting? Start a','[stamp card].']],
 ['Service',['Need the bill?','[One tap.]']],
 ['The floor',['Every table,','[at a glance].']],
 ['The owner',['And you finally','see your [numbers].']],
 ['Easy start',['No big switch.','[Just start.]']],
 null,
 ['One system',['One system for your','[whole floor].']],
 null
];
const heads=HL.map((h,i)=>{
 if(!h) return null;
 const k=mk(layer,`<span><i></i>${h[0]}</span>`,'top:92px','kick');
 const el=mk(layer,'','top:158px','hl');
 const words=[];
 h[1].forEach(line=>{
  const ln=mk(el,'','','ln');
  let inG=false;
  line.split(' ').forEach((wd,j,arr)=>{
   let html='';
   const open=wd.startsWith('['),close=wd.includes(']');
   if(open)inG=true;
   const clean=wd.replace('[','');
   if(inG){const idx=clean.indexOf(']');const inner=idx>=0?clean.slice(0,idx):clean;const tail=idx>=0?clean.slice(idx+1):'';html=`<span class="g">${inner}</span>${tail}`}
   else html=clean;
   if(close)inG=false;
   const w=mk(ln,html+(j<arr.length-1?'&nbsp;':''),'','w');words.push(w);
  });
 });
 return {k,el,words};
});
function fitHeads(){heads.forEach(h=>{if(!h)return;h.el.style.fontSize='72px';let mx=0;h.el.querySelectorAll('.ln').forEach(l=>{const r=document.createRange();r.selectNodeContents(l);mx=Math.max(mx,r.getBoundingClientRect().width)});if(mx>960)h.el.style.fontSize=(72*960/mx)+'px'})}
function headsRender(t){
 heads.forEach((h,i)=>{
  if(!h)return;const a=ST[i],b=ST[i]+DUR[i],lt=t-a;
  const vis=t>=a+0.05&&t<b+0.05;
  h.k.style.display=h.el.style.display=vis?'block':'none';
  if(!vis)return;
  const out=1-prog(t,b-0.35,b);
  h.k.style.opacity=eo3(prog(lt,0.05,0.35))*out;
  h.k.style.transform=`translateY(${(1-eo3(prog(lt,0.05,0.35)))*-14}px)`;
  h.words.forEach((w,j)=>{const p=eo3(prog(lt,0.12+j*0.07,0.5+j*0.07));w.style.opacity=p*out;w.style.transform=`translateY(${(1-p)*38}px)`});
 });
}

/* ---------- subtitles ---------- */
const subEl=document.getElementById('sub'),subT=document.getElementById('subt');
const CUES=VO.cues.map(c=>({a:sc(c.s)+c.off,b:sc(c.s)+c.off+c.dur+0.35,text:c.text}));
let lastCue=-1;
function subRender(t){
 let k=-1;CUES.forEach((c,i)=>{if(t>=c.a&&t<c.b)k=i});
 if(k!==lastCue){lastCue=k;if(k>=0)subT.textContent=CUES[k].text}
 if(k<0){subEl.style.display='none';return}
 const c=CUES[k];const p=eo3(prog(t,c.a,c.a+0.25))*(1-prog(t,c.b-0.2,c.b));
 subEl.style.display='flex';subEl.style.opacity=p;subEl.style.transform=`translateY(${(1-p)*24}px)`;
 subEl.style.top=(1810-subT.getBoundingClientRect().height/2-8)+'px';
}

/* ---------- frame sequences ---------- */
const pad=(i,n)=>String(i).padStart(n,'0');
function frameUrl(name,lt){const c=CLIPS[name];const i=clamp(Math.floor(lt*FPS+1e-6),0,c.n-1);return SEQ+c.dir+'/'+(c.ext==='png'?pad(i,4)+'.png':pad(i,5)+'.jpg')}
const pending=new Set();
function setImg(img,url){if(img._u===url)return;img._u=url;img.src=url;const p=img.decode().catch(()=>{});pending.add(p);p.finally(()=>pending.delete(p))}

/* ---------- finger overlay ---------- */
const finger=mk(layer,`<div class="rip"></div>${svg('pointer','fill="#fff" stroke="#233730" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"')}`,'', 'fing');finger._w=90;finger._h=90;
let fingerCand=null;const offer=f=>{if(f&&!fingerCand)fingerCand=f};
function fingerPlan(taps,lt,toStage,keep=0.35){
 // returns {x,y,o,press} in stage coords (or null)
 let k=taps.findIndex(tp=>lt<tp.t+keep);if(k<0)return null;
 const tp=taps[k],prev=taps[k-1];
 const near=prev&&(tp.t-prev.t)<1.5;
 const start=near?prev.t+keep*0.6:tp.t-0.55;
 if(lt<start-0.2)return null;
 let x,y;const tgt=toStage(tp.x,tp.y);
 if(near){const from=toStage(prev.x,prev.y);const p=eio(prog(lt,start,tp.t-0.08));x=lerp(from[0],tgt[0],p);y=lerp(from[1],tgt[1],p)}
 else{const p=eo3(prog(lt,tp.t-0.55,tp.t-0.06));x=tgt[0]+(1-p)*70;y=tgt[1]+(1-p)*110}
 const press=prog(lt,tp.t,tp.t+0.4);
 const nextFar=!taps[k+1]||taps[k+1].t-tp.t>=1.5;
 const o=(near?1:eo3(prog(lt,tp.t-0.75,tp.t-0.45)))*(nextFar?1-prog(lt,tp.t+0.15,tp.t+keep):1);
 return{x,y,o,press,sc:1-0.12*Math.sin(Math.min(1,press)*Math.PI)};
}
function fingerRender(f){
 if(!f){finger.style.display='none';return}
 finger.style.display='block';finger.style.opacity=f.o;
 finger.style.transform=`translate(${f.x-18}px,${f.y-14}px) scale(${f.sc})`;
 const r=finger.firstChild;const p=f.press;r.style.opacity=p>0&&p<1?(1-p)*1:0;r.style.transform=`scale(${0.6+p*1.5})`;
}

/* ---------- device builders ---------- */
function phoneEl(){
 const d=box(layer,487,1017,'<div class="frame"></div><div class="scr"><img/><div class="ov"></div></div><div class="isl"></div>','','phone');
 const img=d.querySelector('img'),ov=d.querySelector('.ov');ov.style.cssText='position:absolute;inset:0;';
 return {el:d,img,ov,scr:d.querySelector('.scr')};
}
function tabletEl(){
 const d=box(layer,968,968,'<div class="frame"></div><div class="scr"><img/></div>','','tab');
 return {el:d,img:d.querySelector('img')};
}
const PS=455/390,TS=940/1180;
const toPhone=(cx,cy,s)=>(x,y)=>[cx+s*(-243.5+16+x*PS),cy+s*(-508.5+16+y*PS)];
const toTab=(cx,cy,s)=>(x,y)=>[cx+s*(-484+14+x*TS),cy+s*(-484+14+y*TS)];

/* ---------- chips ---------- */
function chip(label,ic,{mint=true}={}){
 const d=mk(layer,`<div class="ic">${svg(ic)}</div><span>${label}</span>`,'','chip');
 d._w=0;d._h=0;d.style.visibility='hidden';
 return d;
}
function chipFix(d){d.style.display='block';d._w=d.offsetWidth;d._h=d.offsetHeight;d.style.visibility='visible';d.style.display='none'}
function chipRender(d,t,t0,cx,cy,{bob=1,tilt=0,out=null}={}){
 if(t<t0||(out!=null&&t>out+0.32)){d.style.display='none';return}
 let p=eback(prog(t,t0,t0+0.5),2.2),o=prog(t,t0,t0+0.15);
 if(out!=null){o*=1-prog(t,out,out+0.3);p*=1-0.2*prog(t,out,out+0.3)}
 const b=Math.sin((t-t0)*2.1+cx*0.01)*6*bob;
 put(d,cx,cy+b,{s:Math.max(0.01,p),r:tilt*(1-Math.exp(-(t-t0)*3)),o});
}
function tag(text){const d=mk(layer,text,'','tag');d._w=100;d._h=40;d.style.display='none';return d}

/* ================= SCENES 1–2: floor plan -> zoom to a table ================= */
const floorW=box(layer,1080,1150,'','top:430px;left:0;transform-origin:540px 430px');floorW.style.top='0';
const FL={w:1080,h:1150};
(function(){
 const cols=[200,540,880],rows=[170,430,690,950];
 let s='<svg width="1080" height="1150" viewBox="0 0 1080 1150" xmlns="http://www.w3.org/2000/svg">';
 s+='<rect id="panel" x="40" y="0" width="1000" height="1130" rx="52" fill="#fff" fill-opacity=".7" stroke="#DCE5DE" stroke-width="2.5"/>';
 for(let i=0;i<12;i++){const cx=cols[i%3],cy=rows[Math.floor(i/3)];
  s+=`<g id="tb${i+1}"><rect x="${cx-70}" y="${cy-50}" width="140" height="100" rx="26" fill="#EAF4EF" stroke="#CFE7DA" stroke-width="3"/>`
   +`<rect x="${cx-34}" y="${cy-68}" width="68" height="14" rx="7" fill="#D5E8DC"/><rect x="${cx-34}" y="${cy+54}" width="68" height="14" rx="7" fill="#D5E8DC"/>`
   +(i%3!==1?`<rect x="${cx-88}" y="${cy-26}" width="14" height="52" rx="7" fill="#D5E8DC"/><rect x="${cx+74}" y="${cy-26}" width="14" height="52" rx="7" fill="#D5E8DC"/>`:'')
   +`<text x="${cx}" y="${cy+13}" text-anchor="middle" font-family="DM Sans" font-weight="800" font-size="36" fill="#12685e">T${i+1}</text></g>`}
 s+='</svg>';floorW.innerHTML=s;
})();
const floorSvg=floorW.firstChild;
const tbl=i=>floorSvg.querySelector('#tb'+i);
const HANDS=[[3,0.8],[8,1.7],[10,2.6],[5,3.3],[12,3.9]]; // [table, pop time]
const handEls=HANDS.map(([tb])=>{const d=box(layer,118,118,`<svg viewBox="0 0 24 24" style="width:66px;height:66px;stroke:#fff;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round">${IC.hand}</svg>`,'border-radius:50%;background:#e8913a;display:grid;place-items:center;box-shadow:0 10px 24px rgba(168,107,33,.35);z-index:30');return d});
const serverEl=box(layer,104,104,`<svg viewBox="0 0 24 24" style="width:56px;height:56px;stroke:#fff;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round">${IC.user}</svg>`,'border-radius:50%;background:#12685e;display:grid;place-items:center;box-shadow:0 14px 30px rgba(18,104,94,.4);z-index:31;border:5px solid #fff');
const tblXY=i=>[[200,540,880][(i-1)%3],[170,430,690,950][Math.floor((i-1)/3)]];
const PATH=[[540,60,0],[200,300,0.9],[880,300,1.7],[540,560,2.5],[200,820,3.3],[880,820,4.1],[540,1060,4.9]]; // x,y(svg),time
function serverAt(lt){
 let k=0;while(k<PATH.length-2&&lt>PATH[k+1][2])k++;
 const a=PATH[k],b=PATH[k+1],p=eio(prog(lt,a[2],b[2]));return[lerp(a[0],b[0],p),lerp(a[1],b[1],p)+Math.sin(lt*9)*5];
}
// QR card + zoomed table content
const qrCard=box(layer,300,372,`<img src="../assets/qr_table5.svg" style="position:absolute;left:34px;top:34px;width:232px;height:232px;border-radius:12px"><div style="position:absolute;left:0;right:0;top:288px;text-align:center;font:800 30px Manrope;color:#233730;letter-spacing:-.5px">Scan to order</div><div style="position:absolute;left:0;right:0;top:326px;text-align:center;font:500 22px 'DM Sans';color:#516158">Juniper Café · Table 05</div>`,'background:#fff;border-radius:34px;border:2px solid #DCE5DE;box-shadow:0 30px 60px rgba(35,55,48,.25);z-index:35');

function scene12(t){
 const lt=t-0;
 const on=t<sc(3)+0.6;
 floorW.style.display=on?'block':'none';
 [...handEls,serverEl,qrCard].forEach(e=>{if(!on)e.style.display='none'});
 if(!on)return;
 const z=eio(prog(t,sc(2),sc(2)+1.0)), S=lerp(1,3.15,z);
 floorW.style.transform=`translateY(430px) scale(${S})`;
 floorW.style.transformOrigin='540px 430px';
 const pe=floorSvg.querySelector('#panel');pe.style.opacity=1-eio(prog(t,sc(2),sc(2)+0.6));
 for(let i=1;i<=12;i++){const g=tbl(i);const inP=eo3(prog(t,0.05+i*0.03,0.45+i*0.03));g.style.opacity=(i===5?1:1-eio(prog(t,sc(2),sc(2)+0.7)))*inP;}
 const out=1-eio(prog(t,sc(3),sc(3)+0.6));floorW.style.opacity=out;
 // hands + server (scene 1 only)
 const s1=t<sc(2)+0.3;
 const sv=serverAt(Math.min(t,5));
 const toStage=(x,y)=>[x,y+430];
 if(s1){const q=toStage(sv[0],sv[1]);put(serverEl,q[0],q[1],{s:eback(prog(t,0.2,0.7))*(1-prog(t,sc(2)-0.2,sc(2)+0.2)),o:prog(t,0.2,0.4)*(1-prog(t,sc(2)-0.2,sc(2)+0.25))})}else serverEl.style.display='none';
 HANDS.forEach(([tb,t0],i)=>{
  const e=handEls[i];const [x,y]=tblXY(tb);
  const life=prog(t,t0,t0+0.4)*(1-prog(t,t0+1.5,t0+1.9));
  if(!s1){e.style.display='none';return}
  put(e,x+30,y+430-84,{s:eback(prog(t,t0,t0+0.45))*(0.9+0.1*Math.sin(t*14+i)),r:Math.sin((t-t0)*11)*13,o:life});
 });
 // QR card stands on table 5
 const q0=sc(2)+1.25,qp=eback(prog(t,q0,q0+0.55),2.4);
 put(qrCard,540,845,{sx:Math.max(0.01,qp)*0.95,sy:Math.max(0.01,qp)*0.95,o:prog(t,q0,q0+0.1)*out});
}

/* ================= PHONE A (S2 rise, S3 scan, S4 menu, S5 order) ================= */
const PA=phoneEl();
// camera UI overlay
const cam=PA.ov;
cam.innerHTML=`<div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 40%,#2a3a34 0%,#141a18 70%)"></div>
<img id="camqr" src="../assets/qr_table5.svg" style="position:absolute;left:92px;top:340px;width:270px;height:270px;border-radius:18px;box-shadow:0 20px 60px rgba(0,0,0,.45)">
<div id="brk" style="position:absolute;left:62px;top:310px;width:330px;height:330px"></div>
<div id="scanline" style="position:absolute;left:78px;top:330px;width:298px;height:5px;border-radius:3px;background:linear-gradient(90deg,transparent,#7be3b7,transparent);box-shadow:0 0 18px #7be3b7"></div>
<div id="tick" style="position:absolute;left:177px;top:410px;width:100px;height:100px;border-radius:50%;background:#1fb57a;display:grid;place-items:center;box-shadow:0 0 0 12px rgba(31,181,122,.25)"><svg viewBox="0 0 24 24" style="width:58px;height:58px;stroke:#fff;fill:none;stroke-width:3;stroke-linecap:round;stroke-linejoin:round">${IC.check}</svg></div>
<div style="position:absolute;left:0;right:0;top:790px;text-align:center;font:600 24px 'DM Sans';color:rgba(255,255,255,.8)">Point your camera at the QR</div>
<div style="position:absolute;left:177px;top:850px;width:100px;height:100px;border-radius:50%;border:6px solid #fff;display:grid;place-items:center"><div style="width:76px;height:76px;border-radius:50%;background:#fff"></div></div>`;
const brk=cam.querySelector('#brk');
const camParts={qr:cam.querySelector('#camqr'),line:cam.querySelector('#scanline'),tick:cam.querySelector('#tick'),brk};
(function(){let h='';[[0,0,'top','left'],[1,0,'top','right'],[0,1,'bottom','left'],[1,1,'bottom','right']].forEach(([x,y,v,hh])=>{h+=`<div class="bc" style="position:absolute;${v}:0;${hh}:0;width:64px;height:64px;border:8px solid #fff;border-${v==='top'?'bottom':'top'}:none;border-${hh==='left'?'right':'left'}:none;border-radius:${v==='top'&&hh==='left'?'26px 0 0 0':v==='top'?'0 26px 0 0':hh==='left'?'0 0 0 26px':'0 0 26px 0'}"></div>`});brk.innerHTML=h})();
const PA_cam=cam;
const chA=[chip('Prices','tag'),chip('Options','sliders'),chip('Guest favourites','star'),chip('Sold-out updates','ban')];
const chB=[chip('Live orders','live'),chip('Bangla or English','lang')];
const P0={x:540,y:1030};
function phoneA(t){
 const a=sc(2)+2.2,b=sc(3),c=sc(5)+4.25,d=se(5)+0.75;
 let cx=540,cy,s=1,r=0,o=1;
 if(t<a-0.01){PA.el.style.display='none';return}
 if(t<b){const p=eo3(prog(t,a,a+1.2));cy=lerp(2350,1300,p);r=lerp(-5,0,p)}
 else if(t<c){const p=eio(prog(t,b,b+0.7));cy=lerp(1300,P0.y,p)}
 else{const p=eio(prog(t,c,d));cy=P0.y+p*120;cx=540-p*150;s=1-p*0.18;o=1-prog(t,c+0.3,d);r=-p*4}
 if(t>=d){PA.el.style.display='none';return}
 put(PA.el,cx,cy,{s,r,o});
 // content
 const cs=sc(3);const tOpen0=cs+2.0;let camOn=t<tOpen0+0.16;
 const tScan=t-cs;
 PA_cam.style.display=camOn?'block':'none';
 PA.img.style.display=(t>=tOpen0-0.001)?'block':'none';
 if(camOn){
  const hand=Math.sin(t*3.1)*5,hand2=Math.cos(t*2.3)*4;
  const idle=t<cs;const zoomIn=eio(prog(t,cs+0.1,cs+1.2));
  camParts.qr.style.transform=`translate(${hand}px,${hand2}px) scale(${lerp(0.55,1,zoomIn)})`;camParts.qr.style.opacity=idle?0.0:eo3(prog(t,cs,cs+0.5));
  camParts.brk.style.opacity=idle?0:1;camParts.brk.style.transform=`scale(${lerp(1.25,1,zoomIn)})`;
  const ok=prog(tScan,1.55,1.75);camParts.brk.querySelectorAll('.bc').forEach(e=>e.style.borderColor=ok>0?'#4be39d':'#fff');
  camParts.line.style.opacity=(tScan>0.5&&tScan<1.7)?1:0;camParts.line.style.top=(330+((tScan*1.6)%1)*290)+'px';
  camParts.tick.style.transform=`scale(${eback(prog(tScan,1.7,2.05),2.6)})`;camParts.tick.style.opacity=prog(tScan,1.7,1.75);
  cam.style.opacity=1-prog(tScan,2.0,2.1);
 }else cam.style.opacity=1;
 // screen frames
 const tOpen=cs+2.0,tMenu=tOpen+1.6,tAdd=sc(5);
 if(t>=tOpen0-0.001){
  if(t<tMenu)setImg(PA.img,frameUrl('g_open',t-tOpen));
  else if(t<tAdd-0.0)setImg(PA.img,frameUrl('g_menu',t-tMenu));
  else setImg(PA.img,frameUrl('g_add',t-tAdd));
  PA.img.style.opacity=eo3(prog(t,tOpen,tOpen+0.12));
 }
 // finger for menu + add
 let f=null;const map=toPhone(cx,cy,s);
 if(t>=tMenu&&t<tAdd)f=fingerPlan(CLIPS.g_menu.taps,t-tMenu,map);
 else if(t>=tAdd)f=fingerPlan(CLIPS.g_add.taps,t-tAdd,map);
 if(f)f.o*=o;offer(f);
}

/* ================= TABLET A (S5 end -> S6) ================= */
const TA=tabletEl();
const cardFly=box(layer,520,226,'<img src="../assets/card_new.png" style="width:520px;height:226px;display:block;border-radius:20px">','z-index:40;border-radius:20px;box-shadow:0 30px 60px rgba(35,55,48,.28)');
const T_A={cx:540,cy:1060};
function tabletA(t){
 const a=sc(5)+4.25,b=sc(6)+DUR[5]-0.5,e0=se(6);
 if(t<a||t>=e0){TA.el.style.display='none';cardFly.style.display='none';return}
 const pin=eio(prog(t,a,a+1.0)),pout=eio(prog(t,b,e0));
 const cy=lerp(2250,T_A.cy,pin)+pout*900;
 put(TA.el,T_A.cx,cy,{s:1,o:1});
 const tStart=sc(6)+0.4; // t_order starts here (empty list 0.5s then arrival)
 setImg(TA.img,frameUrl('t_order',Math.max(0,t-tStart)));
 // flying order card: lifts off phone, lands where the real card appears
 const land=toTab(T_A.cx,T_A.cy,1)(270+439,746+191); // centre of card in screen
 const f0=sc(5)+3.55,f1=tStart+0.5;
 const p=prog(t,f0,f1);
 if(p<=0||t>f1+0.15){cardFly.style.display='none'}
 else{
  const e=eio(p);const sx=lerp(540,land[0],e),sy=lerp(1170,land[1],e);
  const ss=lerp(0.36,TS*(878/520),e);
  const lift=Math.sin(Math.min(1,p*1.6)*Math.PI/2)*-60*(1-e);
  put(cardFly,sx,sy+lift,{s:ss,o:prog(t,f0,f0+0.15)*(1-prog(t,f1,f1+0.12)),r:lerp(-6,0,e)});
 }
 // finger taps on tablet
 const tl=t-tStart;const f2=fingerPlan(CLIPS.t_order.taps,tl,toTab(T_A.cx,cy,1),0.35);
 offer(t>=tStart&&t<e0-0.4?f2:null);
}

/* ================= PHONE B (S7 rewards, S8 call server) + TABLET B (S8) ================= */
const PB=phoneEl();
const TB=tabletEl();PB.el.style.zIndex=34;
const stampBurst=[0,1,2].map(()=>box(layer,120,120,'','border-radius:50%;border:6px solid #f7c948;z-index:62'));
const coffeePop=box(layer,560,120,`<div style="display:flex;align-items:center;gap:16px;padding:0 34px;height:120px;border-radius:60px;background:#12685e;color:#fff;font:800 38px Manrope;letter-spacing:-1px;box-shadow:0 20px 44px rgba(18,104,94,.4)"><svg viewBox="0 0 24 24" style="width:50px;height:50px;stroke:#fff;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round">${IC.coffee}</svg>Coffee on the house</div>`,'z-index:64');
const chC=[chip('Rewards','star'),chip('Regulars','users')];
const demo7=tag('DEMO DATA'),demo10=tag('DEMO DATA');
const chD=[chip('Requests','bell'),chip('Bills','receipt'),chip('Table status','grid')];
function phoneB(t){
 const s7=sc(7),s8=sc(8),e8=se(8);
 // S7: rise, rewards clip. S8: help flow, then shrink away
 if(t<s7-0.01||t>=e8){PB.el.style.display='none';return}
 let cx=540,cy=P0.y,s=1,o=1,r=0;
 if(t<s7+0.9){const p=eo3(prog(t,s7,s7+0.9));cy=lerp(2300,P0.y,p);r=lerp(4,0,p)}
 const sh=s8+3.25;
 if(t>=sh){const p=eio(prog(t,sh,sh+0.8));cx=lerp(540,250,p);cy=lerp(P0.y,1360,p);s=lerp(1,0.56,p)}
 if(t>=se(8)-0.4){o=1-prog(t,se(8)-0.4,se(8))}
 put(PB.el,cx,cy,{s,o,r});
 const rLocal=t-(s7+0.5);
 const inS8=t>=s8;
 if(!inS8){setImg(PB.img,frameUrl('g_rewards',Math.max(0,rLocal)));PB.img.style.opacity=1}
 else{
  const hb=s8+5.1;
  if(t<hb)setImg(PB.img,frameUrl('g_help_a',t-(s8+0.3)));else setImg(PB.img,frameUrl('g_help_b',t-hb));
  PB.img.style.opacity=eo3(prog(t,s8,s8+0.3));
 }
 const map=toPhone(cx,cy,s);let f=null;
 if(!inS8)f=fingerPlan(CLIPS.g_rewards.taps,rLocal,map);else if(t<sh)f=fingerPlan(CLIPS.g_help_a.taps,t-(s8+0.3),map);
 if(f)f.o*=o;offer(f);
 // stamp bursts + coffee pop (staged progress, clip-time: 4 @2.98?)
 const marks={4:0,5:0,6:0};
}
function stampFx(t){
 // stamp row positions in phone screen coords (enrolled state)
 const s7=sc(7),rl=t-(s7+0.5);
 const T4=CLIPS.g_rewards.marks;
 // output-time of states: computed from segment layout (see build_seq): 4 at A, 5 at B, 6 at C
 const A=window.STAMP_T[0],B=window.STAMP_T[1],Cc=window.STAMP_T[2];
 const pos=n=>toPhone(540,P0.y,1)(59+(n-1)*45.8,383);
 [[A,4],[B,5],[Cc,6]].forEach(([tt,n],i)=>{
  const e=stampBurst[i];const p=prog(rl,tt,tt+0.7);
  if(t<s7||t>=se(7)||p<=0||p>=1){e.style.display='none';return}
  const [x,y]=pos(n);put(e,x,y,{s:lerp(0.5,1.9,eo3(p)),o:(1-p)*0.9});
 });
 const p=eback(prog(rl,Cc+0.25,Cc+0.75),2.2);
 put(coffeePop,540,1655,{s:Math.max(0.01,p)*0.9,o:(t>=s7&&t<se(7)+0.0)?prog(rl,Cc+0.25,Cc+0.35)*(1-prog(t,se(7)-0.4,se(7))):0});
}
const T_B={cx:540,cy:880,s:0.9};
function tabletB(t){
 const s8=sc(8),a=s8+3.1,e8=se(8);
 if(t<a||t>=e8){TB.el.style.display='none';return}
 const pin=eio(prog(t,a,a+0.8));const cy=lerp(2250,T_B.cy,pin)+eio(prog(t,e8-0.5,e8))*1000;
 put(TB.el,T_B.cx,cy,{s:T_B.s});
 const tl=t-(s8+3.5);setImg(TB.img,frameUrl('t_request',Math.max(0,tl)));
 const f=fingerPlan(CLIPS.t_request.taps,tl,toTab(T_B.cx,cy,T_B.s),0.35);offer(t<e8-0.5?f:null);
}
/* ================= TABLET C (S9) ================= */
const TC=tabletEl();
function tabletC(t){
 const s9=sc(9),e9=se(9);
 if(t<s9-0.01||t>=e9){TC.el.style.display='none';return}
 const pin=eo3(prog(t,s9,s9+0.9)),pout=eio(prog(t,e9-0.5,e9));
 put(TC.el,540,lerp(2250,1010,pin)+pout*1000,{s:0.96});
 setImg(TC.img,frameUrl('t_tables',Math.max(0,t-(s9+0.45))));
 const f=fingerPlan(CLIPS.t_tables.taps,t-(s9+0.45),toTab(540,lerp(2250,1010,pin),0.96),0.35);offer(f);
}

/* ================= SCENE 10: owner cards ================= */
const OC=[['o_dishes',690,564,0.35],['o_busy',512,564,2.2],['o_service',450,564,4.0]];
const oEls=OC.map(([n,w,h])=>{const d=box(layer,w,h,'<img style="width:100%;height:100%;display:block;border-radius:26px">','z-index:40;border-radius:26px;box-shadow:0 22px 50px rgba(35,55,48,.16);overflow:hidden');return d});
const OPOS=[[540,745],[292,1345],[792,1345]];
function owner(t){
 const s=sc(10),e=se(10);
 OC.forEach(([n,w,h,t0],i)=>{
  const el=oEls[i];const lt=t-s-t0;
  if(t<s||t>=e||lt<0){el.style.display='none';return}
  const p=eback(prog(lt,0,0.55),1.6);
  const out=1-prog(t,e-0.4,e);
  put(el,OPOS[i][0],OPOS[i][1]+(1-eo3(prog(lt,0,0.5)))*60,{s:Math.max(0.01,p),o:prog(lt,0,0.2)*out,r:[-1.2,1.2,-1][i]*(1-eo3(prog(lt,0,0.6)))});
  setImg(el.firstChild,frameUrl(n,Math.max(0,lt-0.3)));
 });
 const tt=t>=s+0.3&&t<e;put(demo10,900,445,{o:tt?eo3(prog(t,s+0.3,s+0.7))*(1-prog(t,e-0.4,e)):0});
}

/* ================= SCENE 11: easy start ================= */
const TICKS=[['Works alongside your POS','Staff still enter orders in your POS — TableMate runs beside it.','crossed'],['Payments stay with you','Payments are recorded here; collected by your restaurant.','receipt'],['Print once, update anytime','Same permanent table link — the menu updates without changing it.','grid']];
const tickEls=TICKS.map(([a,b,ic])=>box(layer,920,214,`<div style="position:absolute;left:36px;top:36px;width:84px;height:84px;border-radius:50%;background:#12685e;display:grid;place-items:center"><svg viewBox="0 0 24 24" style="width:48px;height:48px;stroke:#fff;fill:none;stroke-width:3;stroke-linecap:round;stroke-linejoin:round">${IC.check}</svg></div><div style="position:absolute;left:150px;top:30px;right:34px;font:800 46px/1.1 Manrope;letter-spacing:-1.2px;color:#233730">${a}</div><div style="position:absolute;left:150px;top:100px;right:40px;font:500 29px/1.3 'DM Sans';color:#516158">${b}</div>`,'z-index:40;background:#fff;border-radius:38px;border:2px solid #DCE5DE;box-shadow:0 20px 46px rgba(35,55,48,.14)'));
function easy(t){
 const s=sc(11),e=se(11),beat=[0.5,1.9,3.3];
 tickEls.forEach((el,i)=>{
  const lt=t-s-beat[i];if(t<s||t>=e||lt<0){el.style.display='none';return}
  const p=eback(prog(lt,0,0.45),3.0);const out=1-prog(t,e-0.4,e);
  put(el,540,640+i*270,{s:lerp(1.25,1,eo3(prog(lt,0,0.3)))*Math.max(0.2,p>1?1:p)/ (p>1?1:1),o:prog(lt,0,0.1)*out,r:lerp(-3,0,eo3(prog(lt,0,0.4)))});
 });
}

/* ================= SCENE 12: logo reveal (everything collapses into the QR) ================= */
const DOTS=Array.from({length:16},(_,i)=>{const a=i/16*Math.PI*2;return{a,d:box(layer,26,26,'','border-radius:50%;background:'+(i%3===0?'#12685e':i%3===1?'#e8913a':'#9fd2bd')+';z-index:44')}});
const qrBig=box(layer,420,420,'<img src="../assets/qr_table5.svg" style="width:420px;height:420px;border-radius:34px;box-shadow:0 30px 70px rgba(35,55,48,.22)">','z-index:45');
const brandEl=box(layer,860,160,`<div class="brand"><span class="bi">${svg('crossed')}</span><span id="bw">TableMate<span class="d">.</span></span></div>`,'z-index:46;display:flex;align-items:center;justify-content:center');
brandEl.style.width='960px';brandEl._w=960;brandEl._disp='flex';
const bw=brandEl.querySelector('#bw'),bi=brandEl.querySelector('.bi');
const built=box(layer,700,70,'Built by <b style="font-weight:800;color:#12685e">Zavino</b>',"z-index:46;text-align:center;font:600 44px 'DM Sans';color:#516158");
function logo(t){
 const s=sc(12),e=se(12),lt=t-s;
 const vis=t>=s-0.01&&t<e;
 DOTS.forEach(({a,d},i)=>{
  if(!vis||lt>1.05){d.style.display='none';return}
  const p=eio(prog(lt,0.05+i*0.01,0.85));const R=lerp(700,0,p);
  put(d,540+Math.cos(a+lt*2)*R,860+Math.sin(a+lt*2)*R,{s:1+0.5*(1-p),o:prog(lt,0,0.15)*(1-prog(lt,0.8,1.05))});
 });
 const qin=eback(prog(lt,0.7,1.2),1.6),qout=eio(prog(lt,1.55,2.1));
 put(qrBig,540,860,{s:Math.max(0.01,qin)*(1-qout*0.55),o:vis?prog(lt,0.7,0.85)*(1-prog(lt,1.8,2.15)):0});
 const bin=eio(prog(lt,1.7,2.4));
 put(brandEl,540,860,{s:lerp(0.9,1,bin),o:vis?bin:0});
 const clipR=100-eio(prog(lt,1.9,2.7))*100;bw.style.clipPath=`inset(0 ${clipR}% 0 0)`;bw.style.display='block';
 bi.style.transform=`scale(${eback(prog(lt,1.7,2.2),2)})`;
 put(built,540,1010,{o:vis?eo3(prog(lt,2.6,3.1))*(1-prog(t,e-0.3,e)):0,s:1});
 if(vis)brandEl.style.opacity=eio(prog(lt,1.7,2.3))*(1-prog(t,e-0.3,e));
}

/* ================= SCENE 13: checklist ================= */
const CK=[['Guests','scan, order, call staff','phone'],['Team','live orders, requests, bills','tablet'],['Owner','sales, top dishes, regulars','chart']];
const ckEls=CK.map(([a,b,ic])=>box(layer,920,240,`<div style="position:absolute;left:40px;top:50px;width:140px;height:140px;border-radius:44px;background:#EAF4EF;display:grid;place-items:center"><svg viewBox="0 0 24 24" style="width:78px;height:78px;stroke:#12685e;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round">${IC[ic]}</svg></div><div style="position:absolute;left:222px;top:44px;font:800 56px Manrope;letter-spacing:-1.5px;color:#233730">${a}</div><div style="position:absolute;left:222px;top:122px;font:500 36px 'DM Sans';color:#516158">${b}</div><div class="tk" style="position:absolute;right:40px;top:78px;width:84px;height:84px;border-radius:50%;background:#12685e;display:grid;place-items:center"><svg viewBox="0 0 24 24" style="width:48px;height:48px;stroke:#fff;fill:none;stroke-width:3;stroke-linecap:round;stroke-linejoin:round">${IC.check}</svg></div>`,'z-index:40;background:#fff;border-radius:44px;border:2px solid #DCE5DE;box-shadow:0 20px 46px rgba(35,55,48,.14)'));
function checklist(t){
 const s=sc(13),e=se(13);
 ckEls.forEach((el,i)=>{
  const lt=t-s-0.5-i*0.85;if(t<s||t>=e||lt<-0.4){el.style.display='none';return}
  const pin=eo3(prog(t-s,0.3+i*0.2,0.8+i*0.2));const out=1-prog(t,e-0.4,e);
  put(el,540,700+i*300+(1-pin)*50,{o:pin*out});
  const tk=el.querySelector('.tk');tk.style.transform=`scale(${eback(prog(lt,0,0.4),2.6)})`;tk.style.opacity=lt>=0?1:0;
 });
}

/* ================= SCENE 14: CTA ================= */
const ctaBrand=box(layer,700,120,`<div class="brand" style="font-size:64px;letter-spacing:-3px;gap:14px"><span class="bi" style="width:76px;height:76px;border-radius:22px"><svg viewBox="0 0 24 24" style="width:44px;height:44px;stroke:#fff;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round">${IC.crossed}</svg></span><span>TableMate<span class="d">.</span></span></div>`,'z-index:46;display:flex;justify-content:center;align-items:center');
ctaBrand._w=700;ctaBrand._disp='flex';
const ctaBtn=box(layer,880,170,`<div style="display:flex;align-items:center;justify-content:center;gap:22px;width:880px;height:170px;border-radius:85px;background:#12685e;color:#fff;font:800 58px Manrope;letter-spacing:-1.5px;box-shadow:0 26px 60px rgba(18,104,94,.4),0 10px 0 #0c4f47">Book a free demo<svg viewBox="0 0 24 24" style="width:64px;height:64px;stroke:#fff;fill:none;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round">${IC.arrow}</svg></div>`,'z-index:46');
const ctaDm=box(layer,900,80,'DM us to get started','z-index:46;text-align:center;font:700 46px \'DM Sans\';color:#233730');
const ctaFoot=box(layer,900,60,'TableMate · A Zavino product','z-index:46;text-align:center;font:600 34px \'DM Sans\';color:#516158');
function cta(t){
 const s=sc(14),e=se(14),lt=t-s;const vis=t>=s-0.01&&t<=e+0.5;
 const o1=vis?eo3(prog(lt,0.05,0.5)):0;
 put(ctaBrand,540,700,{o:o1,s:lerp(0.9,1,eo3(prog(lt,0,0.5)))});
 const pulse=1+0.025*Math.sin(lt*6);
 put(ctaBtn,540,980,{s:eback(prog(lt,0.35,0.9),2)*pulse,o:vis?prog(lt,0.35,0.5):0});
 put(ctaDm,540,1160,{o:vis?eo3(prog(lt,0.8,1.3)):0});
 put(ctaFoot,540,1560,{o:vis?eo3(prog(lt,1.0,1.5)):0});
}

/* ---------- chips for S4 + S9, tags ---------- */
let chipsFixed=false;
function fixChips(){[...chA,...chB,...chC,...chD,demo7,demo10].forEach(chipFix);chipsFixed=true}
function chipsRender(t){
 const s4=sc(4),e4=se(4);
 [[ 'Prices',130,760,1.2,-4],['Options',930,880,2.2,4],['Guest favourites',205,1230,3.2,3],['Sold-out updates',860,1360,4.2,-3]].forEach(([_,x,y,off,tilt],i)=>chipRender(chA[i],t,s4+off,x,y,{tilt,out:e4-0.45}));
 chipRender(chB[0],t,sc(6)+1.6,300,1620,{tilt:-3,out:se(6)-0.5});chipRender(chB[1],t,sc(6)+3.9,790,1655,{tilt:3,out:se(6)-0.5});
 // S7
 const s7=sc(7);chipRender(chC[0],t,s7+1.6,160,1580,{tilt:-3,out:se(7)-0.4});chipRender(chC[1],t,s7+2.6,880,1590,{tilt:3,out:se(7)-0.4});
 put(demo7,900,445,{o:(t>=s7+0.4&&t<se(7))?eo3(prog(t,s7+0.4,s7+0.8))*(1-prog(t,se(7)-0.4,se(7))):0});
 // S9
 const s9=sc(9),e9=se(9);
 chipRender(chD[0],t,s9+1.4,210,1590,{tilt:-3,out:e9-0.4});chipRender(chD[1],t,s9+2.3,560,1650,{tilt:2,out:e9-0.4});chipRender(chD[2],t,s9+3.2,880,1590,{tilt:3,out:e9-0.4});
}

/* ---------- master render ---------- */
window.STAMP_T=[0,0,0];
// derive output times at which stamp state changes in the g_rewards sequence (from the EDL lengths)
(function(){const m=CLIPS.g_rewards;const segs=m.segs||[1.1,1.15,0.73,0.9,0.9,1.8];let a=segs[0]+segs[1]+segs[2];window.STAMP_T=[a,a+segs[3],a+segs[3]+segs[4]];})();
function render(t){
 if(!chipsFixed)fixChips();
 bg(t);
 document.getElementById('prog').style.width=(t/TOTAL*W)+'px';
 fingerCand=null;
 scene12(t);
 phoneA(t);tabletA(t);phoneB(t);tabletB(t);tabletC(t);
 stampFx(t);chipsRender(t);owner(t);easy(t);logo(t);checklist(t);cta(t);
 headsRender(t);subRender(t);fingerRender(fingerCand);
}
window.render=render;
window.settle=async()=>{await Promise.all([...pending]);};
window.READY=(async()=>{
 await Promise.all(['800 72px Manrope','700 30px "DM Sans"','500 30px "DM Sans"','600 30px "DM Sans"'].map(f=>document.fonts.load(f)));
 await document.fonts.ready;fitHeads();fixChips();return true;
})();
})();
