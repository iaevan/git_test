#!/usr/bin/env python3
"""Writes variants/<cut>-<format>/short.json for the 60 s film and the 30 s cut, each at 16:9, 1:1 and 9:16.
Every line is one beat drawn by the same continuous "flight" (scenes.js); sound cues are placed from the voice marks."""
import json, os, shutil, soundfile as sf
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
clips = {c['key']: c for c in json.load(open('voice/clips.json'))['clips']}
MARKS = json.load(open('voice/marks.json'))
dur = {k: sf.info('voice/%s.wav' % k).duration for k in clips}
CUTS = {
  "60": [("s1", 1.6), ("s2", 0), ("s3", 0), ("s4", 0), ("s5", 0), ("s6", 0), ("s7", 0.9), ("s8", 0), ("s9", 0)],
  "30": [("s1", 0.9), ("c3", 0), ("c4", 0), ("c5", 0), ("s7", 0.6), ("c9", 0)],
}
FORMATS = {"16x9": "16:9", "1x1": "1:1", "9x16": "9:16"}
TIMING = {"60": (0.25, 2.2), "30": (0.2, 2.0)}   # pause between lines, hold after the last line
LEAD = 0.35
def cues_for(key, ev, d):
    base = key[1:]; c = []
    if base == "1": c += [(0.7, "tap", .2), (1.9, "whoosh-up", .3)]
    if base == "2": c += [(ev(0) + .25, "tap", .22), (ev(1) + .05, "tap", .22), (ev(1) + .85, "tap", .22), (ev(2) + .1, "tap", .22), (ev(2) + .55, "swish", .25), (max(ev(2) + 1.45, d - 1.25), "whoosh-up", .25)]
    if base == "3": c += [(.35, "tap", .22), (max(1.05, ev(1, .4) - .2), "tap", .2), (ev(2, .6), "typing", .14), (ev(2, .6) + 1.0, "confirm", .3), (ev(3, .78), "tap", .2), (ev(3, .78) + .9, "click-soft", .2)]
    if base == "4": c += [(.35, "pop", .22), (max(.95, ev(1, .35) - .2), "tap", .2), (ev(2, .55), "tap", .16), (ev(3, .7), "tap", .16), (ev(4, .85) + .55, "click-ui", .3), (ev(4, .85) + .62, "confirm", .3)]
    if base == "5": c += [(.35, "tap", .22), (max(2.2, ev(2, .45) + .2) - .25, "swish", .2), (max(3.4, ev(3, .72)) - .25, "swish", .2)]
    if base == "6": c += [(.35, "tap", .22), (max(1.2, ev(1, .4) - .1), "swish", .22), (ev(2, .75), "confirm", .26), (ev(2, .75) + .35, "confirm", .26)]
    if base == "7": tS = max(1.0, ev(0) + min(2.3, d * .42)); c += [(.3, "tap", .16), (.69, "tap", .16), (tS, "land", .45)]
    if base == "8": c += [(ev(i + 1, .2 + i * .2), "tick", .22) for i in range(4)]
    if base == "9": tW = ev(3, .62) - .15; c += [(ev(1, .2), "tap", .25), (tW - 1.2, "riser-air", .28), (tW + .45, "chime", .42), (tW + .5, "sparkle", .3)]
    return c
for cut, lines in CUTS.items():
    order = [k for k, _ in lines]; PAUSE, TAIL = TIMING[cut]
    for fn, fmt in FORMATS.items():
        vd = 'variants/%s-%s' % (cut, fn); os.makedirs(vd, exist_ok=True)
        if not os.path.islink(vd + '/assets'):
            if os.path.exists(vd + '/assets'): shutil.rmtree(vd + '/assets')
            os.symlink('../../assets', vd + '/assets')
        cues = []
        for i, (key, hold) in enumerate(lines):
            lead = LEAD if i == 0 else .05
            d = (LEAD if i == 0 else 0) + dur[key] + PAUSE + hold + (TAIL if i == len(lines) - 1 else 0)
            mk = MARKS[key]; ev = lambda j, frac=0, mk=mk, lead=lead, d=d: (lead + mk[j]) if j < len(mk) else frac * d
            cues += [{"shot": i + 1, "offset": round(o, 3), "name": n, "gain": gn} for o, n, gn in cues_for(key, ev, d)]
            if i > 0: cues.append({"shot": i + 1, "offset": -0.32, "name": "whoosh", "gain": .22})
        S = {"title": "Zavino services - %s s %s" % (cut, fmt), "format": fmt, "look": {"mode": "clean"}, "fps": 30, "twos": 1, "lead": LEAD, "pause": PAUSE, "tail": TAIL,
             "voice": {"clips": ["../../voice/%s.wav" % k for k in order]}, "music": {"mood": "story"}, "captions": {"style": "none"},
             "lines": [dict({"say": clips[k]['chunks'].replace(' / ', ' '), "scene": k, "move": "still"}, **({"hold": h} if h else {})) for k, h in lines], "cues": cues}
        json.dump(S, open(vd + '/short.json', 'w'), indent=1, ensure_ascii=False)
        print(vd, 'lines', len(lines), 'cues', len(cues))
