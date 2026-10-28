# Forma — "No upload. One input." (painted short)

A second Forma film, made with the **Shorts Animator** skill: a narrated, hand-painted-looking vertical short whose every shot is drawn in code and painted by the skill's brush pass (flat storybook gouache in Forma's indigo / cream palette, with red + yellow for the pain).

**Story (≈54 s, 9:16, 26 shots)** — free converter sites: ads, pop-ups, sign-ups and, worst of all, you upload your file to their servers → *that's not very private* → **Forma converts on your own device** (nothing is sent anywhere — computer or phone) → second pain point: converters are hard to find (a WebP converter, a PNG converter, a different tool per format) → **Forma has one input**: drop in any file → less searching, less friction.

| file | what |
|---|---|
| `forma-no-upload-one-input.mp4` | the film: 1080×1920, 54 s, 24 fps (each painting held two frames), −14.6 LUFS, 51 MB (the 136 MB master is `renders/v1.mp4`, not committed) |
| `qa/sheet.jpg` | one frame per shot, taken from the real file |
| `short.json` | script (16 lines), shot list, look, voice, music, captions |
| `scenes.js` | the 26 drawings — a small prop library (laptop, phone, browser, pop-up ads, sign-up modal, server racks, cloud, padlock, file cards, the Forma mark) + one function per shot |
| `voice/clips.json`, `tools/voice.py` | the Higgsfield narration (Eleven v4, preset voice *Bella*, stability 0.35): ids, and the download/trim script → `voice/NN.wav` |
| `skill/` | a working copy of Shorts Animator with two small patches (below) |

## Rebuild

```bash
python3 tools/voice.py                       # download + trim the 16 narration clips
export CHROME=/path/to/chrome-headless-shell SHORTS_GL=swiftshader   # CPU painting in a container
node skill/scripts/animate.mjs frames .      # one painted frame per shot → frames/sheet.jpg
node skill/scripts/animate.mjs render .      # the MP4 (≈45 min on 4 CPU cores; seconds with a GPU)
```

## Patches to the skill (in `skill/`)

* `scripts/lib/chrome.mjs` — `--no-sandbox --disable-dev-shm-usage --enable-unsafe-swiftshader` so headless Chrome runs as root in a container, painting in software.
* `scripts/animate.mjs` — `voice.clips`: one pre-trimmed audio file per line (e.g. from a cloud TTS) instead of transcribing a single recording; captions and cuts are timed from each clip's real length.

The look is the shipped `gouache` look with `layers: 1, brush: 7` (one paint layer is ~2× faster and looks nearly the same), `boil 0.38` for a lively shimmer.
