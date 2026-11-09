const fs=require('fs');
const SP='/tmp/claude-0/-home-user-git-test/be241b3a-fa23-585d-b0f5-b0088e158aa8/scratchpad/raw';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function startRec(page,name,{quality=88,maxW,maxH}={}){
  const dir=`${SP}/${name}`; fs.rmSync(dir,{recursive:true,force:true}); fs.mkdirSync(dir,{recursive:true});
  const cdp=await page.context().newCDPSession(page);
  const frames=[],events=[]; let n=0;
  cdp.on('Page.screencastFrame',ev=>{
    const file=`f${String(n++).padStart(6,'0')}.jpg`;
    fs.writeFileSync(`${dir}/${file}`,Buffer.from(ev.data,'base64'));
    frames.push({file,ts:ev.metadata.timestamp,w:ev.metadata.deviceWidth,h:ev.metadata.deviceHeight});
    cdp.send('Page.screencastFrameAck',{sessionId:ev.sessionId}).catch(()=>{});
  });
  await cdp.send('Page.startScreencast',{format:'jpeg',quality,maxWidth:maxW,maxHeight:maxH,everyNthFrame:1});
  const rec={page,dir,frames,events,
    ev(type,data={}){events.push({type,t:Date.now()/1000,...data});},
    async stop(){await cdp.send('Page.stopScreencast').catch(()=>{});await sleep(300);fs.writeFileSync(`${dir}/meta.json`,JSON.stringify({frames,events},null,0));return frames.length;},
    async tapv(loc,label,o){await loc.scrollIntoViewIfNeeded();return this.tap(loc,label,o);},
    async tap(loc,label,{touch=true}={}){
      if(touch){await loc.tap({trial:true});}else{await loc.click({trial:true});}
      const bb=await loc.boundingBox();const x=bb.x+bb.width/2,y=bb.y+bb.height/2;this.ev('tap',{x,y,label});
      if(touch)await loc.tap();else await loc.click();}
  };
  return rec;
}
module.exports={startRec,sleep,SP};
