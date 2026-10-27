#!/usr/bin/env python3
import subprocess, sys, os, glob, numpy as np
SR = 48000
def load(path):
    raw = subprocess.run(['ffmpeg','-v','error','-i',path,'-f','s16le','-ac','1','-ar',str(SR),'-'], capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.int16).astype(np.float64) / 32768
rows = []
for p in sorted(glob.glob(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'assets/sfx/*.*'))):
    if p.endswith(('.md','.json')): continue
    x = load(p); 
    if len(x) == 0: continue
    env = np.abs(x); win = int(SR*0.005); e = np.convolve(env, np.ones(win)/win, mode='same')
    pk = e.max(); ipk = int(e.argmax()); 
    on = int(np.argmax(e > pk*0.1))
    after = e[ipk:]; dec = int(np.argmax(after < pk*0.1)) if (after < pk*0.1).any() else len(after)
    seg = x[max(0, ipk-int(SR*0.05)): ipk+int(SR*0.25)]
    sp = np.abs(np.fft.rfft(seg*np.hanning(len(seg)))); fr = np.fft.rfftfreq(len(seg), 1/SR)
    cen = (sp*fr).sum()/max(sp.sum(),1e-9)
    rms = 20*np.log10(np.sqrt((x**2).mean())+1e-9)
    rows.append((os.path.basename(p), len(x)/SR, 20*np.log10(np.abs(x).max()+1e-9), on/SR, ipk/SR, dec/SR, cen, rms))
print(f"{'file':20s} {'dur':>5s} {'peak':>6s} {'onset':>6s} {'peakT':>6s} {'decay':>6s} {'centroid':>8s} {'rms':>6s}")
for r in rows: print(f"{r[0]:20s} {r[1]:5.2f} {r[2]:6.1f} {r[3]:6.3f} {r[4]:6.3f} {r[5]:6.3f} {r[6]:8.0f} {r[7]:6.1f}")
