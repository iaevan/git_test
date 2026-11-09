import sys,glob
from PIL import Image,ImageDraw
SP='/tmp/claude-0/-home-user-git-test/be241b3a-fa23-585d-b0f5-b0088e158aa8/scratchpad/test'
files=sys.argv[2:]; cols=int(sys.argv[1]); tw=360
ims=[]
for f in files:
    im=Image.open(f'{SP}/{f}'); r=tw/im.width; im=im.resize((tw,int(im.height*r))); d=ImageDraw.Draw(im); d.rectangle((0,0,60,16),fill=(0,0,0)); d.text((3,2),f.replace('t_','').replace('.jpg',''),fill=(255,255,0)); ims.append(im)
rows=(len(ims)+cols-1)//cols; h=ims[0].height
S=Image.new('RGB',(cols*tw,rows*h),(255,255,255))
for k,im in enumerate(ims): S.paste(im,((k%cols)*tw,(k//cols)*h))
S.save(f'{SP}/sheet.png'); print(S.size)
