#!/usr/bin/env python3
"""Writes short.json: the narration lines (a story: a café that forgot its customers → "growing shouldn't mean forgetting"
→ regular.), one scene per caption chunk, and sound cues keyed by scene name."""
import json, os, re
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
L = [  # say (what is spoken, plain), caption (one chunk per "/"), scenes (one per chunk, or fewer), camera
 ("When Nila opened Café 27, she knew everyone. Every name. Every order.", "When Nila opened Café 27, / she knew everyone. / Every name. Every order.", ["open-sign", "early-names", "early-orders"], "push"),
 ("Then it got busy. And somewhere in the rush, she stopped knowing them.", "Then it got busy. / And somewhere in the rush, / she stopped knowing them.", ["crowd-count", "lineup", "nila-blank"], "push"),
 ("So when a coffee came out cold, nobody noticed. No complaint. They just left.", "So when a coffee came out cold, / nobody noticed. / No complaint. They just left.", ["unhappy-sip", "quiet-exit", "door-close"], "push"),
 ("A week later, one star told her what nobody had.", "A week later, / one star told her / what nobody had.", ["one-star"], "still"),
 ("Growing shouldn't mean forgetting.", "Growing shouldn't mean forgetting.", ["nila-closing"], "push"),
 ("So at Zavino Labs, we're building a way for cafés to remember.", "So at Zavino Labs, / we're building a way / for cafés to remember.", ["labs-brand", "labs-build"], "still"),
 ("A QR on every table. Rafi scans, checks in, picks his order.", "A QR on every table. / Rafi scans, / checks in, / picks his order.", ["table-qr", "rafi-scan", "otp", "menu-pick"], "still"),
 ("One code. One bill. And Rafi isn't a stranger anymore.", "One code. / One bill. / And Rafi isn't a stranger anymore.", ["code-show", "bill-entry", "verified"], "push"),
 ("An hour later, how was it?", "An hour later: / how was it?", ["hour-later", "chat-ask"], "still"),
 ("Happy? Tell Google. Not happy? Nila hears about it first, in time to make it right.", "Happy? Tell Google. / Not happy? Nila hears about it first — / in time to make it right.", ["five-star", "low-alert", "make-it-right"], "still"),
 ("Visit by visit, Rafi becomes a regular.", "Visit by visit, / Rafi becomes a regular.", ["visit-stamps", "regular-badge"], "still"),
 ("And one morning… The usual, Rafi? Oh! You remembered!", "And one morning… / The usual, Rafi? / Oh! You remembered!", ["morning-door", "usual", "remembered"], "push"),
 ("Now she sees who's coming back, and who's slipping away.", "Now she sees who's coming back, / and who's slipping away.", ["regulars", "gone-quiet"], "still"),
 ("She can reach out for Eid, for Pohela Boishakh, whenever she chooses.", "She can reach out for Eid, / for Pohela Boishakh — / whenever she chooses.", ["campaign-eid", "campaign-boishakh", "approve"], "still"),
 ("Regular. Every customer, remembered. Coming soon from Zavino Labs.", "regular. Every customer, remembered. / Coming soon from Zavino Labs.", ["end-name", "end-card"], "still"),
]
CUES = [  # scene, offset (s into the shot), sound, gain — few and soft; scenes listed in src/auth.json are stretched to the real shot length, so their offsets are scaled to match
 ("open-sign", .15, "bell", .35), ("open-sign", .9, "tap", .35), ("early-names", .25, "pop", .3), ("early-names", .55, "pop", .3), ("early-names", .85, "pop", .3), ("early-orders", .2, "pop", .25), ("early-orders", .5, "pop", .25), ("early-orders", .8, "pop", .25),
 ("quiet-exit", .95, "bell", .4), ("door-close", .45, "land-light", .35), ("one-star", .45, "drop", .5), ("one-star", .95, "error-soft", .35),
 ("nila-closing", .4, "chime", .25), ("labs-brand", .2, "chime", .45), ("labs-build", 0, "riser-air", .3), ("labs-build", 1.35, "sparkle", .45),
 ("table-qr", .1, "pop", .35), ("table-qr", .38, "pop", .35), ("table-qr", .66, "pop", .35),
 ("rafi-scan", .8, "click-ui", .45), ("rafi-scan", 1.05, "confirm", .45),
 ("otp", .38, "click-ui", .4), ("otp", .75, "chime", .35), ("otp", 1.0, "tick", .3), ("otp", 1.16, "tick", .3), ("otp", 1.32, "tick", .3), ("otp", 1.48, "tick", .3), ("otp", 1.7, "confirm", .5),
 ("menu-pick", .55, "select", .4), ("menu-pick", 1.0, "select", .4), ("menu-pick", 1.68, "click-ui", .4), ("code-show", .25, "whoosh-short", .35),
 ("bill-entry", .3, "key-press", .4), ("bill-entry", .65, "key-press", .4), ("bill-entry", 1.0, "key-press", .4), ("bill-entry", 1.4, "click-ui", .45), ("bill-entry", 1.5, "chime", .6), ("bill-entry", 1.55, "sparkle", .4),
 ("verified", .35, "confirm", .35), ("verified", .6, "confirm", .35), ("verified", .85, "confirm", .35), ("verified", 1.1, "punch", .55), ("verified", 1.25, "sparkle", .4),
 ("hour-later", 0, "whoosh-long", .35), ("chat-ask", .15, "pop", .4), ("chat-ask", .6, "pop", .4), ("chat-ask", 1.25, "tap", .4),
 ("five-star", .1, "sparkle", .45), ("five-star", 1.0, "click-ui", .45), ("five-star", 1.12, "confirm", .45), ("low-alert", .3, "error-soft", .45), ("low-alert", .9, "pop", .35),
 ("make-it-right", .5, "pop", .35), ("make-it-right", 1.2, "chime", .45), ("make-it-right", 1.25, "sparkle", .4),
 ("visit-stamps", 0, "land-light", .4), ("visit-stamps", .2, "land-light", .4), ("visit-stamps", .5, "land-light", .4), ("visit-stamps", .8, "land-light", .4), ("visit-stamps", 1.1, "land-light", .4),
 ("regular-badge", .4, "punch", .55), ("regular-badge", .5, "sparkle", .4),
 ("morning-door", .3, "bell", .4), ("usual", .25, "pop", .35), ("remembered", .15, "sparkle", .5), ("remembered", .3, "chime", .5),
 ("regulars", 0, "swish", .35), ("gone-quiet", 0, "swish", .35), ("gone-quiet", 1.1, "pop", .35),
 ("campaign-eid", .02, "pop", .4), ("campaign-eid", .15, "sparkle", .35), ("campaign-boishakh", .02, "pop", .4),
 ("approve", 1.2, "click-ui", .5), ("approve", 1.3, "chime", .45),
 ("end-name", .1, "land", .5), ("end-name", .3, "sparkle", .4), ("end-card", .35, "chime", .5), ("end-card", .4, "sparkle", .4),
]
AUTH = json.load(open('src/auth.json'))
REAL = {}
if os.path.exists('build/index.html'):
    h = open('build/index.html').read(); mm = re.search(r'window.SHORT=(\{.*?\});window.IMAGES', h, re.S)
    if mm: REAL = {b['scene']: b['dur'] for b in json.loads(mm.group(1))['beats']}
def scaled(n, o): return round(o * REAL[n] / AUTH[n], 3) if n in AUTH and n in REAL else o
order = [s for l in L for s in l[2]]
PAUSE = {4: 0.9, 5: 0.5, 6: 0.8, 8: 0.8, 9: 0.3, 11: 0.5, 13: 0.5}   # by line index (0-based): the quiet beats get room to land
S = {"title": "regular. - a Zavino Labs teaser",
 "brief": "Upcoming zavino. labs product (not built yet): smart review + customer tracking for restaurants and cafes. Story: Nila's Cafe 27 used to know every customer; busy-ness made her forget them; a cold coffee, a silent exit and a one-star review show the cost. Growing shouldn't mean forgetting: regular. is a way for a cafe to remember (QR on the table, verified check-in, order, one code and bill, after-meal question, low-rating alert, regulars, AI campaigns the owner approves). Payoff: 'The usual, Rafi?'",
 "format": "9:16", "look": {"mode": "clean"}, "fps": 30, "twos": 1, "pause": 0.35, "tail": 0.8,
 "voice": {"clips": ["voice/%02d.wav" % i for i in range(1, len(L) + 1)], "marks": "voice/marks.json"}, "music": {"mood": "hopeful"},
 "captions": {"style": "box", "size": 50, "weight": 700, "y": 0.79, "radius": 0.5, "box": "rgba(13,34,23,0.84)", "color": "#f5f2e7", "font": "\"Manrope\",\"Inter\",\"Helvetica Neue\",Arial,sans-serif"},
 "lines": [dict({"say": a, "caption": b, "scene": c if len(c) > 1 else c[0], "move": m}, **({"pause": PAUSE[i]} if i in PAUSE else {})) for i, (a, b, c, m) in enumerate(L)],
 "cues": [{"shot": order.index(n) + 1, "offset": scaled(n, o), "name": s, "gain": g} for n, o, s, g in CUES if n in order]}
json.dump(S, open('short.json', 'w'), indent=1, ensure_ascii=False)
print(len(order), 'shots,', len(S['cues']), 'cues')
