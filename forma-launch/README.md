# Forma — launch film

A 52-second SaaS launch film for [forma.thezavino.com](https://forma.thezavino.com/), in two cuts:

| file | size | use |
|---|---|---|
| `dist/forma-launch-reel-1080x1920.mp4` | 1080×1920, 60 fps, 52 s | Reels / TikTok / Shorts — no voice |
| `dist/forma-launch-landscape-1920x1080.mp4` | 1920×1080, 60 fps, 52 s | YouTube / X / LinkedIn / site hero — no voice |
| `dist/forma-launch-reel-1080x1920-voiceover.mp4` | 1080×1920, 52 s | narrated, original timing ("Here's Forma" at 0:06) |
| `dist/forma-launch-landscape-1920x1080-voiceover.mp4` | 1920×1080, 52 s | narrated, original timing |
| `dist/forma-launch-reel-1080x1920-voiceover-long-intro.mp4` | 1080×1920, 58 s | narrated, **extended pain intro** ("Here's Forma" at 0:12) |
| `dist/forma-launch-landscape-1920x1080-voiceover-long-intro.mp4` | 1920×1080, 58 s | narrated, extended pain intro |

The first two have no voice: a synthesised 120 BPM score plus frame-locked UI sound effects — including the app's own wheel tick. The `-voiceover` cuts add a calm narration on top of exactly the same picture and bed; the `-long-intro` cuts give the problem six more seconds (three bars) before the logo hit and are otherwise identical from "Here's Forma" on.

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

## Voice-over

Generated with **Higgsfield** (Eleven v4 via `generate_audio`, preset voice *Bella*, stability 0.35 for a lively, natural read). Bella was picked by measurement from 15 young-sounding female presets as the best mix of *energetic* and *smooth*: pitch ≈ 235 Hz (a young woman's range), the most intonation movement of the set (≈6 semitones), the quickest pace (≈3.1 words/s), a clean, un-harsh tone. (An earlier take used the calmer *Nora*; it read as too mellow.) No tone-shaping EQ is applied — just a high-pass, a light compressor and a touch of room.

It is written as a short story rather than captions for the screen: the pain with converter sites (they want your file uploaded, or a sign-up first — just to hand over your files), the answer, the proof, the extras. Two scripts share one library of clips (`audio/vo/manifest.json`):

**Extended intro (`long`, 58 s)** — the pain gets room: the routine is slowed down and an "Uploading to their server…" card fills while the voice explains.

| time | line | on screen |
|---|---|---|
| 0:00 | Remember converting a file? | "Wrong format." |
| 0:02 | Every site wants you to upload it. | "Upload your file." + upload card |
| 0:05 | Or sign up first. | "Make an account." |
| 0:07 | Just to hand over your files. | rows struck through |
| 0:10 | There has to be an easier way. | "There's an easier way." |
| 0:12 | Here's Forma. It converts your files right on your device. | logo hit → tagline |

**Original timing (`short`, 52 s)** — the same pain squeezed into six seconds:

| time | line |
|---|---|
| 0:00 | Remember converting a file? |
| 0:02 | Every site wants you to upload it, or sign up first. |
| 0:06 | Here's Forma. It converts your files right on your device. |

From "Here's Forma" on the script is identical in both (the long cut is the same plus 6 s):

| time (short) | line | on screen |
|---|---|---|
| 0:10 | Just drop in an image, a video, anything. | the file is dropped in |
| 0:14 | Fifty-three formats to pick from. | the wheel spins |
| 0:18 | One click, and it's done. | Convert → ready |
| 0:21 | That's ninety-seven percent smaller. | the "97%" counter |
| 0:25 | No more uploads. Everything stays on your device. | privacy |
| 0:34 | Want it resized? Compressed? You get more control, when you need it. | the details sheet |
| 0:38 | And it's free. No account needed. | free card |
| 0:41 | So next time, skip the upload. Open Forma. | call to action |
| 0:46 | Forma. Convert files on your own device. | end card |

`audio/vo_fetch.py` downloads the clips; `audio/mix_vo.py <short|long> …` trims each clip to its speech, levels it, applies a light compressor (and an optional warm EQ, off for Bella) and a small room, fits it to its window with a pitch-preserving tempo change (natural pace; at most ×1.12 — with Bella every line fits untouched), places the first word on its beat and ducks the score (−5 dB) and SFX (−3 dB) underneath, with the voice about 10 dB over the bed. Mastered to −14 LUFS. QA: a speech recogniser run over each finished mix (music and SFX included) hears every scripted line at its beat and nothing else.

### The extended intro

`?intro=6` (or `INTRO=6` for the tools) inserts 6 s — exactly three bars at 120 BPM, so the beat grid is untouched — before the logo hit. `engine.js` keeps a time map: scenes authored before `ripple()` use new coordinates, everything after keeps its original times and every timeline call, sound cue, motion-blur window and `measure()` is shifted through the map. `audio/music.py` takes `FORMA_SHIFT=6` and lengthens the opening section by repeating its own three-bar motif. `tools/shiftcheck.cjs` proves the claim: the default timeline is pixel-identical to the previous build, and the extended one equals the default shifted by 6 s from "There's an easier way" onward.

## Rebuild

```bash
npm install                       # gsap + sharp
pip install numpy scipy soundfile matplotlib pillow
./build.sh                        # cues → score+SFX → render both cuts → mux   (~35–45 min / 4 cores)
./build.sh voice                  # narrated cuts at the original timing (needs the renders + score stems from a previous build)
./build.sh long                   # extended-intro cut: score, both renders, narration (~35 min)
```

Pieces:

* `src/` — the film. `css/base.css` tokens + components · `js/engine.js` timeline engine · `js/app.js` the workspace remake · `js/scenes_*.js` the storyboard (every `sfx(t, …)` cue sits next to the animation it belongs to).
* `tools/render.cjs` — deterministic frame renderer (parallel Chromium, temporal supersampling → x264).
* `tools/preview.cjs` + `tools/sheet.py` — render stills at timestamps / contact sheets for review.
* `tools/determinism.cjs` — proves frames are a pure function of time (parallel rendering is safe). `tools/shiftcheck.cjs` — proves the extended intro is a pure time shift.
* **Artifact audits** (run before every render, `node tools/<name>.cjs <reel|land>`):
  * `leaks.cjs` — elements that are drawn while their scene is hidden (CSS `visibility` is inherited, not cumulative: a child with an explicit `visibility:visible` still draws inside a hidden scene — use `inherit`).
  * `stuck.cjs` — elements still visible after their exit animation has finished, and elements visible before their own entrance.
  * `audit.cjs` — tweens fighting over one element/property where the earlier-created tween finishes last (it re-asserts its end value after the exit and leaves the element on screen).
  * `vislog.cjs` — per-element visibility log across the timeline, for tracing a specific stray element.
* `audio/` — `dsp.py`, `sfx.py` (soft SFX incl. the app tick), `music.py` (score), `mix.py` (placement, reverb sends, ducking), `analyze.py` (spectrogram QA). `tools/loudnorm.py` masters to −14 LUFS.

Requires the **Inter** font installed (the site's UI face on non-Apple systems), Chromium via Playwright, ffmpeg.

## Swapping the music

`out/forma-soundtrack.wav` is the audio track (one mix serves both layouts). To use licensed music instead, drop in your own 52 s WAV and run `tools/mux.sh out/forma-*-silent.mp4 your.wav dist/…mp4`. Cuts land on a 120 BPM grid (0.5 s beats), so a 120 BPM track will line up with the drops at 0:06 and 0:46.
