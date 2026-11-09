# "What is TableMate?" – 9:16 explainer (≈75 s)

Everything on screen is TableMate's own UI, recorded from the live demo (Juniper Café), plus illustration/motion built here.

## Layout
- `stage/` – the animated 1080×1920 stage (`stage.html`, `stage.js`). Deterministic: `render(t)` draws any frame.
  - `vo.json` – scene durations + voiceover cues (text, which audio file, offset inside the scene).
  - `clips.json` – frame-sequence manifest for the real screen recordings (rebuilt by `work/build_seq.py`).
- `render.js` – Playwright renderer (`node render.js full <frames-dir> 0 2256 3`, or `test <t…>` for single frames).
- `build_audio.py` – places each `audio/*.mp3` at its scene time and mixes `audio/vo_track.wav`. Missing clips are skipped.
- `work/` – capture scripts (Playwright + CDP screencast) used to record the real guest phone, staff tablet and owner cards.
  Credentials are read from `work/creds.local.json` (git-ignored; never commit it).
- `assets/` – real fonts (Manrope, DM Sans, Noto Sans Bengali), real Table 05 QR, logo glyph, order-card crop.
- `out/` – `tablemate_final.mp4` (captions + voiceover) and `tablemate_silent.mp4` (captions only).

## Real vs staged screens
Real recordings: guest menu/ordering/help sheet, staff orders + requests + Bangla toggle + Tables grid, owner dashboard cards
(bars/counts are driven by the real DOM; values are the demo data in the app).
Staged (clearly tagged "Demo data" in the video): the stamp card at 4→5→6 – the real Rewards UI fed demo data via a
network mock, so no guest account or SMS was created.

## Voiceover (complete)
Voice: ElevenLabs "Noah – Confident Canadian Narrator" (`9hb1f7xQcMLB90qbYSY3`), model `eleven_v4`, one take per line.
All 12 lines are in `audio/` (`v04` is split at its "…" pause into `v04a`/`v04b` so "Bangla or English" lands on the Bangla flip).
`stage/vo.json` holds each cue's text, audio file, offset inside its scene and duration; the caption pill follows it.
To re-mix after any change: `python3 build_audio.py` (loudness-normalised to about -16 LUFS), then
`ffmpeg -i out/tablemate_silent.mp4 -i audio/vo_track.wav -c:v copy -c:a aac -b:a 192k -shortest out/tablemate_final.mp4`.
To re-render the picture after changing `stage/`: `node render.js full <frames-dir> 0 2256 3`, then
`ffmpeg -framerate 30 -i <frames-dir>/%05d.jpg -c:v libx264 -preset medium -crf 19 -pix_fmt yuv420p -movflags +faststart out/tablemate_silent.mp4`.
(`render.js` reads the screen-recording frame sequences from the scratchpad path at the top of the file; those sequences are rebuilt
by `work/build_seq.py` from the raw captures made by the `work/capture_*.js` scripts.)

## Notes
- Staff recordings cut the app's 2–4 s server spinners and speed up dead time; taps are overlaid from the logged click events.
- CTA shows "DM us" only – add WhatsApp / email / page to `ctaDm` in `stage/stage.js` when you have them.
- Print-once claim: fix the final domain before publishing (the demo runs on a workers.dev URL).
