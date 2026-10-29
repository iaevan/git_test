# Forma — "Meet Pixel" (clean animated short)

A third Forma film, made with the **Shorts Animator** skill in the same **clean** look as *No upload. One input.* — crisp vector shapes, no brush filter, no paper or grain — but this time with a story written from scratch and a recurring character.

**Story (≈59 s, 9:16, 31 shots)** — *Pixel* is a PNG with a to-do list: become a WebP. Pixel does what everyone does and Googles it → ad explosion, pop-ups, a sign-up wall, a cruise to "win" → then the scary part: *upload your file to our servers. Somewhere.* → Pixel panics, runs, and ducks through the nearest door, **Forma**. Forma converts on your own device, so Pixel never has to leave home → one drop, one click → Pixel is a WebP, 97% smaller ("never felt lighter", floating off on balloons) → everyone else lines up at the door (PDF, MP3, MP4, ZIP, fonts) → *one door for all of them* → no sign-ups, no uploads, just your device → "Forma. A fresh start for your files."

Everything in the story comes from the two sites: [forma.thezavino.com](https://forma.thezavino.com) (private, on-device conversion, one input for every format, 97 % smaller) and [thezavino.com](https://thezavino.com) (the "zavino. labs" brand line on the end card).

| file | what |
|---|---|
| `forma-meet-pixel.mp4` | the film: 1080×1920, 59 s, 30 fps, −14 LUFS |
| `qa/sheet.jpg` | one frame per shot, taken from the real file |
| `short.json` | script (19 lines), shot list, look, voice, music, captions, sound cues |
| `helpers_base.js` | prop library (laptop, phone, browser, pop-up ads, server racks, cloud, padlock, file cards, the Forma mark, …) |
| `pixel_scenes.js` | the character system (`pixel`, `buddy`, `doorway`, speech/thought bubbles, confetti) and one drawing per shot |
| `scenes.js` | generated: `cat helpers_base.js pixel_scenes.js > scenes.js` |
| `voice/clips.json`, `tools/voice.py` | the Higgsfield narration (Eleven v4, preset voice *Bella*, stability 0.3): ids, and the download / trim / tempo script → `voice/NN.wav` |
| `skill/` | a working copy of Shorts Animator with small patches (below) |

## Rebuild

```bash
python3 tools/voice.py                       # download + trim the 19 narration clips
cat helpers_base.js pixel_scenes.js > scenes.js
export CHROME=/path/to/chrome-headless-shell SHORTS_GL=swiftshader   # CPU painting in a container
node skill/scripts/animate.mjs frames .      # one frame per shot → frames/sheet.jpg
node skill/scripts/animate.mjs render .      # the MP4 (~15 min on 4 CPU cores in clean mode)
```

## Patches to the skill (in `skill/`)

* `scripts/lib/chrome.mjs` — `--no-sandbox --disable-dev-shm-usage --enable-unsafe-swiftshader` so headless Chrome runs as root in a container, painting in software.
* `scripts/runtime/stage.js` — `look.mode: "clean"` skips the brush pass; captions are rounded pills.
* `scripts/animate.mjs` — `voice.clips` (one pre-trimmed audio file per line, shots cut to each clip's real length) and `cues` (sound effects placed by shot: `{"shot":6,"offset":0,"name":"swish","gain":0.8}`).
