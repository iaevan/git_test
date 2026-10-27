#!/usr/bin/env python3
"""Verify a rendered film: container facts, audio level, and picture<->sound sync of the wheel ticks.

  python3 tools/verify.py renders/forma-launch-landscape.mp4 [landscape|reel]

Sync method: the picture's change energy inside the format wheel (frame differences of the region where the wheel
sits, 30 fps) is correlated with the audio onsets of the app's tick in the rendered file's own soundtrack.
"""
import json, subprocess, sys, os
import numpy as np

path = sys.argv[1]; kind = sys.argv[2] if len(sys.argv) > 2 else 'landscape'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def probe():
    j = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'stream=codec_type,codec_name,width,height,r_frame_rate,sample_rate,channels,duration,bit_rate:format=duration,size', '-of', 'json', path]))
    return j
j = probe()
v = next(s for s in j['streams'] if s['codec_type'] == 'video'); a = next((s for s in j['streams'] if s['codec_type'] == 'audio'), None)
print(f"container : {v['codec_name']} {v['width']}x{v['height']} @ {v['r_frame_rate']} | audio {a['codec_name'] if a else None} {a['sample_rate'] if a else ''} Hz x{a['channels'] if a else ''}")
print(f"duration  : {float(j['format']['duration']):.3f} s  ({int(j['format']['size'])/1e6:.1f} MB)  -> {'OK (< 80 s)' if float(j['format']['duration']) < 80 else 'TOO LONG'}")

# audio level
meas = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', path, '-vn', '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
lufs = float(meas.split('I:')[-1].split('LUFS')[0]); tp = float(meas.split('Peak:')[-1].split('dBFS')[0])
print(f"audio     : {lufs:.1f} LUFS integrated, true peak {tp:.1f} dBTP")

# sync: wheel region in frame px (landscape: window 1560x878 at (180,158); wheel camera z=1.55 @ (640,322))
cues = json.load(open(os.path.join(ROOT, 'data', 'cues.json')))['cues']
S = json.load(open(os.path.join(ROOT, 'data', 'cues.json')))
wheel_ticks = [c['t'] for c in cues if c['name'] == 'tick' and c.get('gain') == -3]   # the app's own ticks in the wheel scene
t0, t1 = min(wheel_ticks) - 0.4, max(wheel_ticks) + 0.5
if kind == 'landscape': crop = 'crop=520:480:1080:540'
else: crop = 'crop=560:520:420:700'
cmd = ['ffmpeg', '-v', 'error', '-ss', str(t0), '-t', str(t1 - t0), '-i', path, '-an', '-vf', f'{crop},scale=130:120,format=gray', '-f', 'rawvideo', '-']
raw = subprocess.run(cmd, capture_output=True).stdout
frames = np.frombuffer(raw, dtype=np.uint8).reshape(-1, 120, 130).astype(float)
motion = np.abs(np.diff(frames, axis=0)).mean(axis=(1, 2))           # change between consecutive frames
n = len(motion); times = t0 + (np.arange(n) + 1) / 30.0
imp = np.zeros(n)
for t in wheel_ticks:
    i = int(round((t - t0) * 30)) - 1
    if 0 <= i < n: imp[i] = 1
best = None
for lag in range(-8, 9):       # lag > 0: sound arrives *after* the picture moved
    sh = np.roll(imp, lag); sh[:max(lag, 0)] = 0
    m = motion - motion.mean(); k = sh - sh.mean()
    c = float((m * k).sum() / (np.linalg.norm(m) * np.linalg.norm(k) + 1e-9))
    if best is None or c > best[1]: best = (lag, c)
print(f"wheel sync: {len(wheel_ticks)} ticks in the picture window; best alignment of motion vs sound = {best[0]:+d} frames ({best[0]/30*1000:+.0f} ms), r={best[1]:.2f}")
print('            (0 = sound lands on the frame the wheel moves; +1 = one frame after, the target)')

# the rendered soundtrack must equal assets/sfx/mix.wav placed at t=0 (no drift / offset from the renderer)
SR = 16000
def pcm(p, extra=()):
    return np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', *extra, '-i', p, '-vn', '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True).stdout, dtype=np.int16).astype(float)
r = pcm(path); m = pcm(os.path.join(ROOT, 'assets', 'sfx', 'mix.wav'))
L = min(len(r), len(m), SR * 48)
er = np.abs(r[:L]); em = np.abs(m[:L])
k = SR // 100; er = np.convolve(er, np.ones(k) / k, 'same')[::k]; em = np.convolve(em, np.ones(k) / k, 'same')[::k]   # 10 ms envelope
best = max(range(-30, 31), key=lambda lag: float(np.dot(np.roll(er, lag), em)))
print(f"soundtrack: rendered audio vs mix.wav envelope offset = {best * 10:+d} ms (expected 0), length {len(r)/SR:.2f}s vs {len(m)/SR:.2f}s")
