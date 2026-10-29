#!/usr/bin/env python3
"""Writes short.json: the 16 narration lines, one scene per caption chunk, and sound cues keyed by scene name."""
import json, os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
L = [  # say, caption (one chunk per "/"), scenes, camera
 ("Every week, hundreds of people walk into your café.", "Every week, hundreds of people / walk into your café.", ["crowd-count", "door-stream"], "push"),
 ("And you don't know a single one.", "And you don't know / a single one.", ["nila-blank", "ghost-lineup"], "push"),
 ("Who's a regular? Who spends the most?", "Who's a regular? / Who spends the most?", ["who-regular", "who-spender"], "push"),
 ("And when someone's unhappy, they don't tell you.", "And when someone's unhappy, / they don't tell you.", ["unhappy-sip", "quiet-exit"], "push"),
 ("They just leave. Then post one star.", "They just leave. / Then post one star.", ["door-close", "one-star"], "push"),
 ("So we're building something at Zavino Labs.", "So we're building something / at Zavino Labs.", ["labs-build", "labs-brand"], "still"),
 ("A QR code on every table. An offer worth scanning.", "A QR code on every table. / An offer worth scanning.", ["table-qr", "offer-card"], "push"),
 ("Rafi scans, verifies, picks his order.", "Rafi scans, / verifies, / picks his order.", ["rafi-scan", "otp", "menu-pick"], "still"),
 ("One code. One bill. A real, paying customer.", "One code. / One bill. / A real, paying customer.", ["code-show", "bill-entry", "verified"], "push"),
 ("An hour later: how was it?", "An hour later: / how was it?", ["hour-later", "chat-ask"], "still"),
 ("Loved it? Off to Google. Unhappy? You hear it first.", "Loved it? Off to Google. / Unhappy? You hear it first.", ["five-star", "low-alert"], "still"),
 ("Four visits later, Rafi's a regular.", "Four visits later, / Rafi's a regular.", ["visit-stamps", "regular-badge"], "still"),
 ("Now she knows her regulars, her big spenders, who's gone quiet.", "Now she knows her regulars, / her big spenders, / who's gone quiet.", ["usual", "spenders", "gone-quiet"], "still"),
 ("New burger? Eid? Pohela Boishakh? AI writes. You approve.", "New burger? / Eid? / Pohela Boishakh? / AI writes. You approve.", ["campaign-burger", "campaign-eid", "campaign-boishakh", "approve"], "still"),
 ("Every offer, measured. Every month, one report.", "Every offer, measured. / Every month, one report.", ["offer-result", "monthly-report"], "still"),
 ("Regular. Coming soon, from Zavino Labs.", "regular. / Coming soon from Zavino Labs.", ["end-name", "end-card"], "still"),
]
CUES = [  # scene, offset (s into the shot), sound, gain  — few, soft, never on top of a word's attack for long
 ("door-stream", .15, "bell", .5), ("quiet-exit", .95, "bell", .45), ("door-close", .45, "land-light", .4), ("one-star", .45, "drop", .6), ("one-star", .95, "error-soft", .4),
 ("labs-build", 0, "riser-air", .35), ("labs-build", 1.35, "sparkle", .5), ("labs-brand", .2, "chime", .5),
 ("table-qr", .1, "pop", .4), ("table-qr", .38, "pop", .4), ("table-qr", .66, "pop", .4), ("offer-card", .1, "sparkle", .4),
 ("rafi-scan", .4, "click-ui", .5), ("rafi-scan", .6, "confirm", .5),
 ("otp", .1, "tick", .35), ("otp", .25, "tick", .35), ("otp", .4, "tick", .35), ("otp", .55, "tick", .35), ("otp", .68, "confirm", .6),
 ("menu-pick", .3, "select", .5), ("menu-pick", .75, "select", .5), ("code-show", .1, "whoosh-short", .4),
 ("bill-entry", .1, "key-press", .45), ("bill-entry", .3, "key-press", .45), ("bill-entry", .5, "key-press", .45), ("bill-entry", .75, "chime", .7), ("bill-entry", .8, "sparkle", .5),
 ("verified", .35, "confirm", .4), ("verified", .6, "confirm", .4), ("verified", .85, "confirm", .4), ("verified", 1.1, "punch", .7), ("verified", 1.25, "sparkle", .5),
 ("hour-later", 0, "whoosh-long", .4), ("chat-ask", .1, "pop", .45), ("chat-ask", .3, "pop", .45), ("chat-ask", .55, "tap", .45),
 ("five-star", .1, "sparkle", .5), ("five-star", 1.0, "click-ui", .5), ("five-star", 1.12, "confirm", .5), ("low-alert", .3, "error-soft", .5), ("low-alert", .9, "pop", .4),
 ("visit-stamps", 0, "land-light", .5), ("visit-stamps", .2, "land-light", .5), ("visit-stamps", .5, "land-light", .5), ("visit-stamps", .8, "land-light", .5), ("visit-stamps", 1.1, "land-light", .5),
 ("regular-badge", .4, "punch", .7), ("regular-badge", .5, "sparkle", .5), ("usual", .1, "bell", .4), ("usual", .55, "pop", .4),
 ("spenders", 0, "swish", .4), ("gone-quiet", 0, "swish", .4), ("gone-quiet", 1.1, "pop", .4),
 ("campaign-burger", .02, "pop", .5), ("campaign-eid", .02, "pop", .5), ("campaign-boishakh", .02, "pop", .5), ("campaign-eid", .15, "sparkle", .4),
 ("approve", 1.2, "click-ui", .6), ("approve", 1.3, "chime", .5), ("offer-result", 0, "swish", .4), ("offer-result", 1.3, "sparkle", .4), ("monthly-report", 0, "swish", .4), ("monthly-report", 1.2, "chime", .4),
 ("end-name", .1, "land", .6), ("end-name", .3, "sparkle", .5), ("end-card", .35, "chime", .6), ("end-card", .4, "sparkle", .5),
]
order = [s for l in L for s in l[2]]
S = {"title": "regular. - a Zavino Labs teaser",
 "brief": "Upcoming zavino. labs product (not built yet): smart review + customer tracking for restaurants and cafes. A QR on each table earns a verified phone number, an order and a bill; then reviews, low-rating alerts, regulars, AI campaigns (the owner approves) and monthly reports. Story: owner Nila, customer Rafi, Cafe 27 in Dhanmondi.",
 "format": "9:16", "look": {"mode": "clean"}, "fps": 30, "twos": 1, "pause": 0.2, "tail": 0.8,
 "voice": {"clips": ["voice/%02d.wav" % i for i in range(1, 17)]}, "music": {"mood": "story"},
 "captions": {"style": "box", "size": 50, "weight": 700, "y": 0.79, "radius": 0.5, "box": "rgba(13,34,23,0.84)", "color": "#f5f2e7", "font": "\"Manrope\",\"Inter\",\"Helvetica Neue\",Arial,sans-serif"},
 "lines": [{"say": a, "caption": b, "scene": c if len(c) > 1 else c[0], "move": m} for a, b, c, m in L],
 "cues": [{"shot": order.index(n) + 1, "offset": o, "name": s, "gain": g} for n, o, s, g in CUES]}
json.dump(S, open('short.json', 'w'), indent=1, ensure_ascii=False)
print(len(order), 'shots,', len(CUES), 'cues')
