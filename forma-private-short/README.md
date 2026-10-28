# Forma — "No upload. One input." (clean animated short)

A second Forma film, made with the **Shorts Animator** skill: a narrated vertical short whose every shot is drawn in code. Rendered in a **clean** look — crisp vector-style shapes, no brush filter, no paper or grain — in Forma's indigo / cream palette, with red + yellow for the pain scenes. (A first version used the skill's painterly gouache pass; it was too heavy, so the look is now `clean`.)

**Story (≈54 s, 9:16, 26 shots)** — free converter sites: ads, pop-ups, sign-ups and, worst of all, you upload your file to their servers → *that's not very private* → **Forma converts on your own device** (nothing is sent anywhere — computer or phone) → second pain point: converters are hard to find (a WebP converter, a PNG converter, a different tool per format) → **Forma has one input**: drop in any file → less searching, less friction.

| file | what |
|---|---|
| `forma-no-upload-one-input.mp4` | the film: 1080×1920, 54 s, 30 fps, −14 LUFS, ~18 MB |
| `qa/sheet.jpg` | one frame per shot, taken from the real file |
| `short.json` | script (16 lines), shot list, look, voice, music, captions |
| `scenes.js` | the 26 drawings — a small prop library (laptop, phone, browser, pop-up ads, sign-up modal, server racks, cloud, padlock, file cards, the Forma mark) + one function per shot |
| `voice/clips.json`, `tools/voice.py` | the Higgsfield narration (Eleven v4, preset voice *Bella*, stability 0.35): ids, and the download/trim script → `voice/NN.wav` |
| `skill/` | a working copy of Shorts Animator with small patches (below) |

## Rebuild

```bash
python3 tools/voice.py                       # download + trim the 16 narration clips
export CHROME=/path/to/chrome-headless-shell SHORTS_GL=swiftshader   # CPU painting in a container
node skill/scripts/animate.mjs frames .      # one frame per shot → frames/sheet.jpg
node skill/scripts/animate.mjs render .      # the MP4 (~11 min on 4 CPU cores in clean mode)
```

## Patches to the skill (in `skill/`)


* `scripts/lib/chrome.mjs` — `--no-sandbox --disable-dev-shm-usage --enable-unsafe-swiftshader` so headless Chrome runs as root in a container, painting in software.
* `scripts/runtime/stage.js` — `look.mode: "clean"` skips the brush pass (crisp frames, ~15× faster); captions are rounded pills.
* `scripts/animate.mjs` — `cues`: a few quiet sound effects placed by shot (`{"shot":8,"offset":0.1,"name":"whoosh"}`), mixed under the score. And `voice.clips`: one pre-trimmed audio file per line (e.g. from a cloud TTS) instead of transcribing a single recording; captions and cuts are timed from each clip's real length.


