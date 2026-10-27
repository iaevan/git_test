#!/usr/bin/env python3
"""Cut the raw screen recordings into constant-30fps clips and write each clip's cursor / click / tick data
in *clip time* (seconds from the clip's first frame).

  python3 tools/prep_clips.py <takes_dir>
"""
import json, subprocess, sys, os

TAKES = sys.argv[1] if len(sys.argv) > 1 else 'out/takes'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# clip name: (take, start_in_take_s, duration_s)
CLIPS = {
    'landing': ('landing', 0.85, 6.25),
    'drop':    ('drop', 1.80, 4.40),
    'wheel':   ('wheel-1', 1.95, 5.10),
    'details': ('flow-2', 1.30, 7.90),
    'convert': ('flow-2', 9.20, 7.20),
    'montage': ('montage2-1', 1.40, 5.60),
    'formats': ('formats2', 1.90, 4.10),
}

for name, (take, a, d) in CLIPS.items():
    src = os.path.join(TAKES, take + '.mkv')
    out = os.path.join(ROOT, 'assets', 'clips', name + '.mp4')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{a}', '-t', f'{d}', '-i', src,
                    '-vf', 'fps=30', '-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-pix_fmt', 'yuv420p',
                    '-g', '30', '-an', '-movflags', '+faststart', out], check=True)
    j = json.load(open(os.path.join(TAKES, take + '.json')))
    v = j['videoStartEpoch']
    rel = lambda ms: round(ms / 1000 - v - a, 4)
    inside = lambda t: -0.2 <= t <= d + 0.2
    cursor = [[rel(t), x, y] for t, x, y in j['cursor'] if inside(rel(t))]
    ev = [dict(e, t=rel(e['t'])) for e in j['events'] if inside(rel(e['t']))]
    ticks = [rel(t) for t in j['ticks'] if inside(rel(t))]
    json.dump({'clip': name, 'take': take, 'take_start': a, 'duration': d, 'viewport': [j['W'], j['H']],
               'cursor': cursor, 'events': ev, 'ticks': ticks},
              open(os.path.join(ROOT, 'data', name + '.json'), 'w'), separators=(',', ':'))
    size = os.path.getsize(out) / 1e6
    print(f'{name:8s} <- {take:11s} [{a:.2f}+{d:.2f}s]  {size:5.1f} MB  cursor={len(cursor)} events={len(ev)} ticks={len(ticks)}')
