# Round 2: ten styles × five sections

Read BRIEF.md first: the principles, the copy (verbatim, invent nothing), the Mumbai specifics, the section
contents and the file-format/interactivity rules all still apply. What changes is the LOOK.

The client said round 1 looked like soft painterly "Ghibli" illustration. Round 2 explores TEN OTHER visual
languages. You own ONE style and build all five sections in it, so the site reads as one designed thing:

- `StyleNN-Opening.html`   Churchgate, the AC local; scroll reveals Mohit at the window, chin on fist, pondering; then the note.
- `StyleNN-Promenade.html` Marine Drive: who I am.
- `StyleNN-Work.html`      The eight projects, AuctionXI featured, real media from `media/<slug>.png`.
- `StyleNN-Dusk.html`      Every detour was part of the path: pinned, scroll steps through the 7 stops, then the roles.
- `StyleNN-Footer.html`    Siddhivinayak (must read unmistakably as the temple: see BRIEF.md footer notes), the invitation and all footer copy.

Each file starts with `<!-- Direction NN: <Style name> — <one sentence on this section in this style> -->`.
Interactive and alive as in BRIEF.md (scroll-earned motion, ambient loops, hover). Vanilla HTML/CSS/JS. Exception:
style 03 may load three.js from `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`.

## The character: Mohit (this matters most)
The client wants the character of himself to look GOOD. Open `assets/portrait.jpg` and study it. Facts:
- Young man, early twenties, slim build, warm medium-brown skin.
- Thick, glossy black hair, short at the sides, with volume on top swept up and back (a soft quiff).
- Glasses: thin rectangular frames, dark top rim, light grey/clear lower rim, slightly oversized.
- Light moustache, clean jaw, a wide easy smile that shows teeth; in the opening he is pensive instead (closed mouth, eyes looking out, chin on his fist).
- White shirt with very fine lavender pinstripes, collar open, sleeves rolled to the forearm.
Design him ONCE for your style before building any section: draw him as a reusable piece (inline SVG symbol,
sprite, canvas routine or 3D group), screenshot him LARGE on his own and iterate until he is genuinely appealing,
proportioned and recognisably this person (glasses, hair, smile, shirt). Then reuse that exact character in every
section where he appears (at least Opening; also Promenade and Dusk where natural). A beautiful, well-proportioned,
stylised likeness beats a crude literal one. No uncanny faces, no stiff mannequin limbs, no mitten hands: if hands
are hard in your style, compose so they read simply (fist under chin as one clean shape).
Style 02 (collage) uses the REAL `assets/portrait.jpg` (cut out / masked / treated), not a drawing.

## The ten styles (yours is named in your task)
01 Swiss editorial: strict grid, large serif and sans type doing most of the work, thin rules used sparingly, flat
   colour fields, precise line diagrams instead of scenes; Mohit as a clean single-weight line portrait.
02 Photo collage: his real portrait cut out, halftone and paper scraps, Mumbai ephemera made in CSS/SVG (an AC local
   ticket, a chai ring stain, a torn newspaper strip, a station board fragment), tape, registration marks.
03 Low-poly 3D: a real-time three.js world (faceted, flat-shaded, soft pastel light): the rake, the bay, the temple;
   Mohit as a charming low-poly figure. Keep it smooth and light.
04 Ink line: black pen-and-brush line on warm paper, cross-hatching, one sodium-orange accent; editorial cartoon
   elegance (think New Yorker spot illustrations).
05 Pixel art: crisp 16-bit pixel scenes (image-rendering: pixelated, integer scaling), a lovingly animated sprite of
   Mohit, Mumbai rendered in a tight palette.
06 Bollywood hand-painted poster: retro Indian cinema-poster and matchbox-print energy, painted lettering, bold flat
   colours, dramatic framing, Mohit as the poster's hero in a painted-portrait style.
07 Deco geometric: pure geometry (circles, arcs, stepped forms, sunbursts) in the language of Bombay Art Deco;
   Mohit built from geometric shapes, elegant and graphic.
08 Dark cinematic minimal: near-black, film-still compositions, precise light (sodium, moon), letterboxing, sparse
   type, real media given room; Mohit as a rim-lit figure with a clear, flattering profile.
09 Blueprint: technical drawings in light lines on deep blue, dimension lines, section cuts and callouts, plans of
   Churchgate, the coach, the bay and the temple; Mohit as a fine technical figure drawing.
10 Kinetic typography: type is the scene (words form the train, the sea, the lamps, the temple's spires); Mohit as a
   typographic or line portrait that still reads as him; motion on scroll is the story.

## Verify
Mocks are served at http://127.0.0.1:4000/. From the scratchpad folder run
`node mockshot.mjs StyleNN-<Section>.html 0 0.5 1` and `W=390 H=844 node mockshot.mjs …`, Read the PNGs, fix
what is crude or broken. Check the character up close. Write only your own `StyleNN-*.html` files (and screenshots).
