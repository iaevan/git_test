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
- `out/` – `tablemate_silent.mp4` (captions only) and `tablemate_partial_vo.mp4` (captions + voiceover lines generated so far).

## Real vs staged screens
Real recordings: guest menu/ordering/help sheet, staff orders + requests + Bangla toggle + Tables grid, owner dashboard cards
(bars/counts are driven by the real DOM; values are the demo data in the app).
Staged (clearly tagged "Demo data" in the video): the stamp card at 4→5→6 – the real Rewards UI fed demo data via a
network mock, so no guest account or SMS was created.

## Finishing the voiceover
Voice: ElevenLabs "Noah – Confident Canadian Narrator" (`9hb1f7xQcMLB90qbYSY3`), model `eleven_v4`.
Done: scene 9, 10, 12, 13. Still to generate (save as the file names in `stage/vo.json`):
| file | text |
|---|---|
| v01_team_cant.mp3 | Your team can't be at every table, every minute. |
| v02_menu_can.mp3 | But your menu can be. |
| v03_scan_menu.mp3 | Guests scan the QR on their table… and see your full menu, with prices, options and your guest favourites. |
| v04_order_live.mp3 | They order in a few taps… and it lands live on your team's screen, in Bangla or English. |
| v05_stamp.mp3 | While they wait, guests can join your stamp card. Every served order earns a stamp. |
| v08_call.mp3 | Need a server, or the bill? One tap, and your team gets the request. |
| v11_easy_start.mp3 | It works alongside your POS, payments stay with you, and you print your QR codes once. |
| v14_dm_us.mp3 | DM us to book a demo. |

Then: update the `dur` / `off` of each cue in `stage/vo.json` from the real clip lengths (for the two-part clips 3 and 4, set
the second cue's `off` to where the "…" pause ends), re-run `render.js` if scene lengths change, then
`python3 build_audio.py && ffmpeg -i out/tablemate_silent.mp4 -i audio/vo_track.wav -c:v copy -c:a aac -b:a 192k -shortest out/tablemate_final.mp4`.

## Notes
- Staff recordings cut the app's 2–4 s server spinners and speed up dead time; taps are overlaid from the logged click events.
- CTA shows "DM us" only – add WhatsApp / email / page to `ctaDm` in `stage/stage.js` when you have them.
- Print-once claim: fix the final domain before publishing (the demo runs on a workers.dev URL).
