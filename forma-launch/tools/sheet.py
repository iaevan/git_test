#!/usr/bin/env python3
"""Contact sheet with timestamp labels.  Usage: sheet.py <dir> <out.png> <cols> <tileWidth>"""
import sys, glob, os
from PIL import Image, ImageDraw, ImageFont
d, out, cols, tw = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
files = sorted(glob.glob(os.path.join(d, '*.png')))
ims = []
for f in files:
    im = Image.open(f).convert('RGB')
    th = round(im.height * tw / im.width)
    ims.append((os.path.basename(f)[1:-4].lstrip('0') or '0', im.resize((tw, th), Image.LANCZOS)))
th = ims[0][1].height
rows = (len(ims) + cols - 1) // cols
pad = 6
sheet = Image.new('RGB', (cols * (tw + pad) + pad, rows * (th + pad) + pad), (120, 120, 126))
dr = ImageDraw.Draw(sheet)
try: font = ImageFont.truetype('/usr/share/fonts/opentype/inter/Inter-Bold.otf', max(14, tw // 22))
except Exception: font = ImageFont.load_default()
for i, (name, im) in enumerate(ims):
    x = pad + (i % cols) * (tw + pad); y = pad + (i // cols) * (th + pad)
    sheet.paste(im, (x, y))
    dr.rectangle([x + 4, y + 4, x + 4 + len(name) * (tw // 28) + 14, y + 8 + max(14, tw // 22) + 6], fill=(255, 255, 255))
    dr.text((x + 10, y + 6), name + 's', fill=(20, 20, 30), font=font)
sheet.save(out)
print(out, sheet.size)
