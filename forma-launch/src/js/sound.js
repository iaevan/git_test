/* Sound design v2 — one curated, sparse cue sheet.
   A cue exists only where something is really tapped, dropped, finished or moved across the screen.
   Word reveals, counters, list items and decorative sparkles stay silent — the music carries the rhythm.
   (The wheel's tick cues are generated next to the wheel animation in scenes_b.js.) */
(function () {
  const c = sfx;

  // 0:00 — hook
  c(.55, 'swoosh', { d: .45, dir: 1, g: .7 });             // card slides in
  c(1.0, 'thump', { g: .5 });                              // …and lands
  c(1.06, 'nope', { g: .8 });                              // gentle "that didn't work"
  c(1.85, 'swoosh', { d: .5, dir: -1, g: .9 });            // whip to the next beat

  // 0:02 — the usual routine
  [2.1, 2.6, 3.1].forEach((t, i) => c(t, 'pop', { n: ['A4', 'B4', 'C#5'][i], g: .6 }));
  c(3.5, 'swoosh', { d: .3, dir: 1, g: .5 });              // the three lines struck through
  c(3.9, 'swoosh', { d: .5, dir: 1, g: .9 });

  // 0:04 — "There's an easier way."
  c(5.0, 'tap', { g: .7 });                                // the word is selected
  c(5.55, 'swoosh', { d: .45, dir: 1, g: .6 });            // …and fills the screen

  // 0:06 — logo
  c(6.0, 'thump', { g: 1 });
  c(6.06, 'chime', { n: 'A5', g: .6 });
  c(8.3, 'swoosh', { d: .6, dir: -1, g: .8 });             // iris closes onto the header

  // 0:09 — the app
  c(11.0, 'drop', { g: .9 });                              // file dropped in
  c(11.45, 'pop', { n: 'A4', g: .55 });                    // Convert button appears
  c(18.0, 'tap', { g: .8 });                               // wheel settles on WebP
  c(19.4, 'tap', { g: .9 });                               // Convert
  c(20.05, 'chime', { n: 'A5', g: .7 });                   // ready
  c(23.95, 'tap', { g: .9 });                              // Download
  c(24.1, 'pop', { n: 'E5', g: .5 });
  c(24.45, 'swoosh', { d: .4, dir: -1, g: .6 });           // file leaves

  // 0:25 — privacy
  c(24.74, 'swoosh', { d: .66, dir: 1, g: .7 });
  c(25.4, 'thump', { g: .6 });
  c(25.5, 'pop', { n: 'A4', g: .5 });
  [27.5, 27.92, 28.34].forEach((t) => c(t, 'tap', { g: .5 }));
  c(30.0, 'swoosh', { d: .55, dir: 1, g: .9 });

  // 0:30 — 53 formats
  c(30.55, 'swoosh', { d: .8, dir: 1, g: .5 });
  c(31.05, 'pop', { n: 'E5', g: .5 });
  c(33.7, 'swoosh', { d: .55, dir: -1, g: .9 });

  // 0:34 — details sheet
  c(33.98, 'swoosh', { d: .45, dir: 1, g: .5 });
  c(34.73, 'toggle', { on: 1, g: .8 });
  c(35.73, 'toggle', { on: 1, g: .8 });
  c(36.55, 'pop', { n: 'A4', g: .5 });
  c(37.0, 'tap', { g: .8 });
  c(37.3, 'swoosh', { d: .55, dir: 1, g: .9 });

  // 0:37 — free
  c(37.68, 'swoosh', { d: .45, dir: 1, g: .5 });
  [0, 1, 2, 3, 4].forEach((i) => c(38.45 + i * .2, 'tap', { g: .3 }));
  c(40.55, 'swoosh', { d: .55, dir: -1, g: .9 });

  // 0:41 — call to action
  c(41.35, 'swoosh', { d: .6, dir: 1, g: .5 });
  c(42.35, 'pop', { n: 'A4', g: .55 });
  c(45.3, 'tap', { g: .9 });
  c(45.4, 'swoosh', { d: .6, dir: 1, g: .55 });

  // 0:46 — end card
  c(46.0, 'thump', { g: 1 });
  c(46.06, 'chime', { n: 'A5', g: .7 });
  c(48.3, 'pop', { n: 'E5', g: .5 });
})();
