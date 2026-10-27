# Forma — launch film

A launch film for [forma.thezavino.com](https://forma.thezavino.com/), made with [HyperFrames](https://hyperframes.heygen.com) (HTML → video).
No voice-over, no music: only sound effects, plus Forma's own wheel tick.

| File | Format | Length |
| --- | --- | --- |
| `renders/forma-launch-landscape.mp4` | 1920 × 1080, 16:9, 30 fps | 49.15 s |
| `renders/forma-launch-reel.mp4` | 1080 × 1920, 9:16, 30 fps | 49.15 s |

Both are well under the 1 min 20 s limit and share one timeline and one sound mix; the reel is recomposed for
vertical (bigger type, taller window, everything inside the platform-safe band), not cropped.

## The story

`Wrong format.` → `Upload it somewhere.` → `Wait.` → `Hope nobody looks.` → **forma.** reveal → hero → click →
`01 Drop something in.` → `02 Give it a direction.` (the wheel) → `A little more control.` → `03 And it's yours to go.`
(**98.2% smaller**) → `Not just images.` → `53 formats.` → `Your files never leave your device.` → `A little change. A world of possibility.` → CTA click → end card.

The captions are Forma's own words (its "How it works" steps, hero and footer copy).

## What is real

- **All product footage is a real screen recording of the live app**, recorded in a real browser (Chromium on Xvfb, captured at
  2560×1440 with ffmpeg `x11grab`). Every conversion in the film really ran in the browser: the 765.1 KiB → 13.7 KiB / "98.2% smaller" result
  is the app's own output, with the *Resize 800 px* setting that is shown being typed.
- The pointer is scripted (smooth, slightly arced paths) and drawn as an overlay from the recorded coordinates; the dragged file in the
  drop scenes is a small ghost injected into the page while a genuine HTML5 `dragenter → dragover → drop` carries the real file.
- Recording-only tweaks, which never change the app's UI: analytics requests were blocked (no stats pollution), the returning-user flag
  `forma:signup-prompt-seen` was set (the app's own signup popup stays out of frame), and the browser's own download bubble / URL status bubble
  were kept out of the capture.
- The "No file uploads. Ever." card in the privacy scene is the real card from the landing hero, lifted out of the recording.
- The hook's `IMG_4021.HEIC` chip is an illustration (not product UI).

## Sound

`assets/sfx/mix.wav` is built by `tools/mix.py` from `data/cues.json` (134 cues, each tied to a visible event):

- **Forma's own tick** (`assets/sfx/forma-tick.wav`): regenerated sample-for-sample from the app's source (`tools/make_tick.py`, the
  `Hv()` generator in its bundle). In the wheel scene all 12 ticks are the *actual* moments the app played them during the recording (WebP → AVIF → GIF → BMP → TIFF → ICO → PDF and back, only through formats a PNG can really become)
  (captured by hooking `AudioBufferSourceNode.start`). The same tick is reused as the film's recurring motif (text arriving, the result count-up).
- Clicks, pops, whooshes, sparkle, chime, riser and impact: the HyperFrames bundled library (Pixabay licence, no attribution needed — see
  `assets/sfx/CREDITS.md`), trimmed, pitch-varied and levelled by `tools/mix.py`.
- Mix peak −2.0 dBTP (−21.1 LUFS gated; sparse effects have a high crest factor, so the mix is peak-normalised).

## Rebuild

```bash
# 1. (optional) re-record the app: needs Xvfb, ffmpeg, Playwright's Chromium
(cd tools/recorder && ./rec.sh landing drop wheel flow montage2 formats2)   # → tools/recorder/out/takes/*.mkv + *.json
python3 tools/prep_clips.py tools/recorder/out/takes                        # → assets/clips/*.mp4 + data/*.json

# 2. regenerate compositions + the cue sheet, then the sound mix
node tools/build.mjs
python3 tools/make_tick.py && python3 tools/mix.py

# 3. check, look, render
tools/check.sh .  &&  tools/check.sh reel
npx hyperframes snapshot --at 5,15,30
npx hyperframes render --quality delivery --video-frame-format png --output renders/forma-launch-landscape.mp4
(cd reel && npx hyperframes render --quality delivery --video-frame-format png --output ../renders/forma-launch-reel.mp4)
```

`reel/` is a sibling HyperFrames project (a project allows one root `index.html`) that shares `assets/` and `lib/` through symlinks.
GSAP 3.14.2 is vendored in `lib/` so renders never fetch from the network.

## Credits

Inter (SIL OFL) · GSAP (GreenSock) · HyperFrames (HeyGen, Apache-2.0) · sound effects from Pixabay (Pixabay Content License).
