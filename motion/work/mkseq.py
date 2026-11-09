import json,os,sys,math
from PIL import Image,ImageDraw
SP='/tmp/claude-0/-home-user-git-test/be241b3a-fa23-585d-b0f5-b0088e158aa8/scratchpad'
def load(clip):
    m=json.load(open(f'{SP}/raw/{clip}/meta.json')); return m['frames'],m['events']
def timeline(clip):
    fr,ev=load(clip); t0=fr[0]['ts']
    print(clip,'frames',len(fr),'dur %.1fs'%(fr[-1]['ts']-t0),'size',fr[0]['w'],fr[0]['h'])
    for e in ev:
        if e['type'] in('mark','tap'): print('  %6.2fs %s %s'%(e['t']-t0,e['type'],e.get('label','')))
def sheet(clip,step=0.5,cols=10,tw=150,t_from=0,t_to=None):
    fr,ev=load(clip); t0=fr[0]['ts']; T=fr[-1]['ts']-t0
    t_to=T if t_to is None else t_to
    times=[t_from+i*step for i in range(int((t_to-t_from)/step)+1)]
    ims=[]
    j=0
    for t in times:
        while j+1<len(fr) and fr[j+1]['ts']-t0<=t: j+=1
        im=Image.open(f"{SP}/raw/{clip}/{fr[j]['file']}"); r=tw/im.width; im=im.resize((tw,int(im.height*r)))
        d=ImageDraw.Draw(im); d.rectangle((0,0,44,14),fill=(0,0,0)); d.text((2,1),'%.1f'%t,fill=(255,255,0)); ims.append(im)
    rows=math.ceil(len(ims)/cols); h=max(i.height for i in ims)
    S=Image.new('RGB',(cols*tw,rows*h),(255,255,255))
    for k,im in enumerate(ims): S.paste(im,((k%cols)*tw,(k//cols)*h))
    out=f'{SP}/sheet_{clip}_{int(t_from)}.png'; S.save(out); print(out,S.size)
if __name__=='__main__':
    c=sys.argv[1]; timeline(c)
    if len(sys.argv)>2: sheet(c,float(sys.argv[2]),int(sys.argv[3]),int(sys.argv[4]),float(sys.argv[5]) if len(sys.argv)>5 else 0,float(sys.argv[6]) if len(sys.argv)>6 else None)
