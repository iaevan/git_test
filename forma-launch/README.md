# Forma — launch film

A 52-second SaaS launch film for [forma.thezavino.com](https://forma.thezavino.com/), in two cuts:

| file | size | use |
|---|---|---|
| `dist/forma-launch-reel-1080x1920.mp4` | 1080×1920, 60 fps | Reels / TikTok / Shorts |
| `dist/forma-launch-landscape-1920x1080.mp4` | 1920×1080, 60 fps | YouTube / X / LinkedIn / site hero |

No voice-over. A synthesised 120 BPM score plus frame-locked UI sound effects — including the app's own wheel tick.

Everything is **built in code**: the Forma UI (logo, file cards, format wheel, workspace, details sheet, price card…) is remade as HTML/CSS and animated with one deterministic GSAP timeline. Design tokens, copy and artwork were lifted from the live site/app.

## Storyboard (identical timing in both cuts)

| time | beat |
|---|---|
| 0:00 | **Hook** — "Wrong format." A PNG gets rejected |
| 0:02 | The usual routine: upload · wait · make an account (struck through) |
| 0:04 | "There's an easier way." — the word *easier* is selected and floods the screen indigo |
| 0:06 | **Logo hit** + "Convert files. On your own device." (downbeat = the drop) |
| 0:08 | Iris closes onto the header logo → the app (match-cut) |
| 0:09 | **01 Drop something in** — drag a PNG into the drop zone |
| 0:12 | **02 Give it a direction** — the format wheel spins (the app's real tick, the app's real copy) |
| 0:18 | **03 And it's yours to go** — convert → a calm "97% smaller" call-out (765.1 KiB → 23.2 KiB, the app's real result) → download |
| 0:25 | Dark flood out of the Download button — **"Your files stay on your device."** No uploads · no server copies · nothing to delete |
| 0:30 | **53 formats. One little wheel.** |
| 0:34 | **A little more control** — the real details sheet (resize / quality) |
| 0:37 | **Free to use. No account needed.** |
| 0:41 | **Convert your first file.** → *Open Forma* → floods back to indigo |
| 0:46 | **End card**: forma. — *Convert files on your own device.* — forma.thezavino.com |

## Craft notes

* **Continuity** — selection box → colour flood → logo; iris closes *onto* the header logo; the Download button spawns the dark flood; the CTA button spawns the end-card flood.
* **Motion** — the product's own `cubic-bezier(.16,1,.3,1)` ease, springy overshoot on UI objects, blur-in/deblur kinetic type, 3-D-tilted format wall, rotating/dollying camera on the app, whip-pans.
* **True motion blur** — every frame is the average of 3 (8–10 on whip-pans) sub-frame renders, plus triangular dither so the soft gradients don't band in 8-bit H.264.
* **Sound (v2 — soft and sparse)** — only ~65 cues in 52 s (≈1.3/s), each tied to a real interaction or a transition: a soft *swoosh* for whip-pans/floods, a felt *tap* for clicks and drops, a wooden *pop* for a few UI arrivals, a two-note *toggle*, a low *thump* on the two logo hits and a warm *chime* for "done". Word reveals, counters and list items are silent. The wheel uses **Forma's own tick** (reproduced from the app's source, only softened), thinned to a gentle texture. Cue list: `src/js/sound.js`.
* **Music** — a warm 120 BPM half-time score in A major: soft FM electric piano, kalimba, round sine bass, sine pad and quiet kick/snap/shaker, arranged to the picture (neutral open fifths for the problem → the major third arrives with the logo → drum-free breakdown for privacy → gentle second section → one-breath build → soft end-card chord). Mastered to −14 LUFS, true-peak ≈ −2 dB.
* **Stems** — `dist/audio/` has the full mix, **music-only** and **SFX-only** so the balance can be changed (or SFX dropped) in any editor.

## Rebuild

```bash
npm install                       # gsap + sharp
pip install numpy scipy soundfile matplotlib pillow
./build.sh                        # cues → score+SFX → render both cuts → mux   (~35–45 min / 4 cores)
```

Pieces:

* `src/` — the film. `css/base.css` tokens + components · `js/engine.js` timeline engine · `js/app.js` the workspace remake · `js/scenes_*.js` the storyboard (every `sfx(t, …)` cue sits next to the animation it belongs to).
* `tools/render.cjs` — deterministic frame renderer (parallel Chromium, temporal supersampling → x264).
* `tools/preview.cjs` + `tools/sheet.py` — render stills at timestamps / contact sheets for review.
* `tools/determinism.cjs` — proves frames are a pure function of time (parallel rendering is safe).
* `audio/` — `dsp.py`, `sfx.py` (soft SFX incl. the app tick), `music.py` (score), `mix.py` (placement, reverb sends, ducking), `analyze.py` (spectrogram QA). `tools/loudnorm.py` masters to −14 LUFS.

Requires the **Inter** font installed (the site's UI face on non-Apple systems), Chromium via Playwright, ffmpeg.

## Swapping the music

`out/forma-soundtrack.wav` is the audio track (one mix serves both layouts). To use licensed music instead, drop in your own 52 s WAV and run `tools/mux.sh out/forma-*-silent.mp4 your.wav dist/…mp4`. Cuts land on a 120 BPM grid (0.5 s beats), so a 120 BPM track will line up with the drops at 0:06 and 0:46.
