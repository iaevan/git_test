import json,os,shutil
from PIL import Image
SP='/tmp/claude-0/-home-user-git-test/be241b3a-fa23-585d-b0f5-b0088e158aa8/scratchpad'
FPS=30
def load(clip):
    m=json.load(open(f'{SP}/raw/{clip}/meta.json')); return m['frames'],m['events']
def build(name,clip,edl):
    fr,ev=load(clip); t0=fr[0]['ts']
    rel=[f['ts']-t0 for f in fr]
    out=f'{SP}/seq/{name}'; shutil.rmtree(out,ignore_errors=True); os.makedirs(out)
    n=0; taps=[]; j=0; marks=[]
    for (a,b,sp) in edl:
        cnt=max(1,round((b-a)/sp*FPS)); seg_t0=n/FPS
        for k in range(cnt):
            t=a+k*sp/FPS
            while j+1<len(fr) and rel[j+1]<=t: j+=1
            while j>0 and rel[j]>t: j-=1
            os.symlink(f"{SP}/raw/{clip}/{fr[j]['file']}",f"{out}/{n:05d}.jpg"); n+=1
        for e in ev:
            te=e['t']-t0
            if a<=te<b:
                d={'t':seg_t0+(te-a)/sp,'label':e.get('label','')}
                if e['type']=='tap': d.update(x=e['x'],y=e['y']); taps.append(d)
                else: marks.append(d)
    w,h=Image.open(f"{out}/00000.jpg").size
    return {'segs':[round((x[1]-x[0])/x[2],4) for x in edl],'dir':f'seq/{name}','n':n,'w':w,'h':h,'taps':taps,'marks':marks,'dur':n/FPS}
M={}
M['g_open']=build('g_open','g_order',[(0.5,1.0,1),(4.8,5.9,1)])
M['g_menu']=build('g_menu','g_order',[(6.1,16.4,1.7)])
M['g_add']=build('g_add','g_order',[(17.6,24.3,1.7),(27.75,29.05,1)])
M['t_order']=build('t_order','t_order',[(21.5,22.0,1),(28.0,29.0,1),(32.9,33.8,1),(36.0,36.6,1),(37.5,38.1,1),(40.7,41.2,1),(41.9,44.1,1.35),(44.4,44.9,1),(45.6,46.1,1),(48.6,49.4,1)])
M['g_rewards']=build('g_rewards','g_rewards',[(0.9,1.8,1),(2.9,5.2,2.2),(5.2,6.8,2.4),(6.9,7.6,1),(8.6,9.3,1),(10.4,11.7,1)])
M['g_help_a']=build('g_help_a','g_help',[(1.2,5.0,1.4),(8.4,8.9,1)])
M['g_help_b']=build('g_help_b','g_help',[(13.0,14.2,1)])
M['t_request']=build('t_request','t_request',[(7.9,8.4,1),(8.6,10.2,1.8),(10.3,10.9,1),(13.1,13.8,1)])
M['t_tables']=build('t_tables','t_tables',[(0.6,1.9,1),(2.2,3.1,1),(3.0,5.2,1.2)])
# owner PNG sequences already at 30fps frames; register
import glob
for nm in ['o_dishes','o_busy','o_service']:
    fs=sorted(glob.glob(f'{SP}/seq/{nm}/*.png')); im=Image.open(fs[0]); M[nm]={'dir':f'seq/{nm}','n':len(fs),'w':im.width,'h':im.height,'taps':[],'marks':[],'dur':len(fs)/FPS,'ext':'png'}
json.dump(M,open(f'{SP}/clips.json','w'),indent=0)
for k,v in M.items(): print(k,v['n'],'frames %.1fs'%v['dur'],v['w'],v['h'],'taps',[(round(t['t'],2),t['label']) for t in v['taps']][:8])
# order card crop for fly-in (clean 'New order' card before Accept tap)
fr,ev=load('t_order'); t0=fr[0]['ts']
def frame_at(t):
    j=0
    while j+1<len(fr) and fr[j+1]['ts']-t0<=t: j+=1
    return Image.open(f"{SP}/raw/t_order/{fr[j]['file']}").convert('RGB')
im=frame_at(33.0); im.save(f'{SP}/t_order_card_frame.png')
