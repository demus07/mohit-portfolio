# Mohit Bagri portfolio: section mocks brief

We are exploring 10 directions for EACH of 5 sections of a personal portfolio for Mohit Bagri, a software
engineer in Mumbai. The current build "looks fine but communicates no emotion or taste". Each mock must make a
viewer FEEL the place and the person. Think editorial illustration, film stills, travel posters, great motion
sites. Not templates.

## Deliverable format (strict)
- One standalone file per mock: `<Section>-NN.html` (NN = 01..10) in this folder. Plain HTML + CSS + vanilla JS.
  No frameworks, no build, no external JS. Google Fonts `<link>` allowed. Nothing else external.
- Local assets you may use by relative path: `assets/portrait.jpg` (Mohit, 800x1000: back three-quarter view on a
  rooftop, turning to smile over his shoulder, glasses, short black hair swept up, white shirt with fine lavender
  pinstripes, sleeves rolled), `assets/logo.webp` + `assets/silhouette.webp` (AuctionXI), `assets/shuttle-vr.jpg`,
  `media/<slug>.png` (REAL screenshots of each project's media panel at 2x, 16:10: auctionxi, texagent,
  cachekaro, aether, flowledger, shuttle, velotype, windmill), `assets/siddhivinayak-reference.png`.
- INTERACTIVE and alive: every mock is a full-viewport page (fluid, designed at 1440x900, must hold up from
  1280 to 1920 wide and reflow sensibly at 390 wide). Each mock is a tall scrolling page for its section where the
  scene is earned: use scroll-driven motion where the direction calls for it (requestAnimationFrame + scroll
  progress, sticky stage), ambient loops (slow, continuous, wrap off-frame), hover states on links. Respect
  prefers-reduced-motion. Keep it smooth: transform/opacity only on scroll, no layout thrash.
- Put a tiny fixed label bottom-right in the page only as `<!-- direction: ... -->` HTML COMMENT, never visible.
  The top of each file has a `<!-- Direction NN: name — one sentence -->` comment.
- Backgrounds are hand-built: inline SVG illustration (paths, gradients used as LIGHT, SVG filters like
  feTurbulence for grain/paper/water) and/or CSS. Make the illustration GOOD: considered silhouettes, atmospheric
  perspective, painted light, restraint. Accurate Mumbai specifics. No clip-art, no emoji, no generic blobs.

## Principles (the client's, follow them)
1. One world: every section is a place on one real walk along Marine Drive (Churchgate station → Marine Drive →
   dusk on the promenade), ending at Siddhivinayak (Prabhadevi) as the place he goes to reset.
2. Show it before you say it. One headline and one line at most per section; the scene carries the meaning.
3. Real proof: real recording, real screenshots, real numbers. Invent nothing. Use only the copy below.
4. Specific beats generic: cutting chai, the local train, Art Deco blocks, tetrapods read as a person. Gradient
   washes and glassmorphism read as a template.
5. One focal point per screen. Text in one fixed zone (usually top-left), the subject in another; moving things
   never cross the text.
6. Pin a scene only when scrolling changes something visible.
7. Plan the phone separately (subject centred, text above).
8. Two type families, two jobs: a serif for voice, a sans for facts. No tiny uppercase labels, no numbering, mono
   only for code. (You may choose the pair per mock from Google Fonts; default Newsreader + Hanken Grotesk.)
9. Headlines at most two lines, balanced. Body ~40 characters per line.
10. Few colours, taken from the light. Day: warm paper #efe8da and sea blue #2c6d8c. Night: navy #0d1a2b and
    sodium orange #f2a145. The scene's light (sun, moon, lamps) sets its colours.
11. No resting shadows, borders or glass. Depth from painted light and grain.
12. Motion is ambient (slow, continuous) or earned (tied to scroll, tells the story).
13. Nothing pops or teleports; things enter/leave out of frame or fade at the far end.
14. Physically correct layering: nearer occludes further.
15. Performance is taste: no jank.
16. Short declaratives, his voice, no superlatives.

## Copy (use verbatim, nothing else)
Name: Mohit Bagri
Opening line: Software engineer at Sypha AI and founder of AuctionXI. I build things and learn how they work.
Opening note (revealed after the scene, his thought): That's me. Can't wait to get home and fix what blocked production.
CTA: Write to me → (mailto:mailmohitbagri@gmail.com)

About title: One year in, here's what I shipped
About line: An LLM gateway that replaced OpenRouter. A terminal tool 500+ developers open daily. A live auction SaaS I built alone.
About aside: 9.45 CGPA taught me less than shipping did. Still early. Still building.

Work title: Things I've built and shipped
Work line: Products I run, client work, web and mobile apps, AI, VR and command-line tools.
Projects (title / kind, year / headline / line / links):
- AuctionXI / My own product, 2026 / Live player auctions for any sport / Real-time bidding, broadcast graphics and YouTube overlays, with no production team. / Live https://auction-xi.com
  facts: Every bid lands on every screen at once, and the money always adds up. · Twenty broadcast scenes for the projector and the stream. · Auction-ready in under 20 minutes. · tech: Next.js, TypeScript, Postgres, Drizzle, Pusher, NextAuth
- TexAgent / Client work, 2026 / A bahi-khata for textile brokers / Bills, brokerage and follow-ups in one place, instead of a paper book. / (private client project)
- Cache Karo / Command-line tool, 2026 / Find the cache hogs, get the space back / Disk analysis and safe cleanup on macOS, Linux and Windows. One line to install. / PyPI https://pypi.org/project/cachekaro/ · Source https://github.com/Mohit-Bagri/cachekaro
- Aether / AI web app, 2025 / News, YouTube and Reddit in one conversation / An assistant with 17+ tones, and an NLP pipeline that scores every article first. / Source https://github.com/Mohit-Bagri/aether-news-trends
- FlowLedger / Mobile app, 2026 / Every rupee in, every rupee out / A local-first finance app in Flutter that scans receipts and catches money leaks. / Source https://github.com/Mohit-Bagri/flowledger
- Space Shuttle VR / VR game, 2024 / Fix the shuttle, then fly it out / A room-scale game for Meta Quest: hands-on tasks aboard, then pilot it to the final portal. / Source https://github.com/Mohit-Bagri/spaceshuttletasks-vr-game
- VeloType / Web app, 2026 / A typing test built for feel / Themes, modes and live words per minute, with a caret that keeps up. / Live https://velo-type.vercel.app
- Windmill VR / VR app, 2025 / Breathe with the windmill / A calm VR app for Meta Quest, paced to a four-part breath. / Source https://github.com/Mohit-Bagri/windmill-vr

Dusk title: Every detour was part of the path
Stops (station, year: line):
- Ramrao Adik, 2021: My first real code was a blog that tracked patch notes for games I played. It got taken down over copyright. First lesson in building.
- NFTs: The worst call I've made. I listened to the hype instead of the people calling it out.
- Everything else: Blogging, Google Ads and SEO, Meta Ads, an agency, dropshipping. For about a year I stopped coding and turned into a finance guy.
- MK Exim, 2025: One person led hundreds across warehouse, finance, e-commerce and media, and walked me through how it all connected. The biggest room for growth was in tech.
- Graduated, 2025: Computer Engineering, 9.45 CGPA. Grades taught me less than shipping did.
- Sypha AI, 2025: So I came back to engineering for good. An LLM gateway, an AI CLI 500+ developers use, and days of finance work turned into one upload.
- AuctionXI, 2026: My own product, and the thing I'm proudest of. It taught me what code alone can't: getting users, keeping them, taking the friction out of every step.
Roles: Sypha AI, Software Engineer, Dec 2025 – now (Built Sypha Gateway. It replaced OpenRouter across every Sypha product and cut its 5% markup. / Built an AI CLI that 500+ developers use daily, across 20+ providers and self-hosted models. / Turned trackers, MIS reports and PDFs into a 21-sheet P&L workbook. Days of reconciliation, one upload. / Unblocked a Kotlin plugin stuck in production for two months by tracing 21 cascading issues.) · AuctionXI, Founder, Apr 2026 – now · TexAgent, Freelance developer, Sep 2026 – now · MK Exim India, E-commerce, Amazon, TataCliQ and Sephora, Mar – Sep 2025 · Brahmani Gems, Web developer intern, Shopify, Jul – Aug 2024

Footer title: Got something to build?
Footer line: I'm open to full-time roles, freelance work and the occasional wild idea.
Belief (quote): If you believe you can make it, you will. The rest is trusting God and doing the work.
Reset: Siddhivinayak, where I go when I feel low or high. It's where I reset.
Live clock line: It's {h:mm am/pm} in Mumbai. (compute Asia/Kolkata time in JS)
Links: GitHub https://github.com/Mohit-Bagri · LinkedIn https://www.linkedin.com/in/mohit-bagri-1a2099354/ · LeetCode https://leetcode.com/u/mailmohitbagri/ · Instagram https://www.instagram.com/mohit_.bagri/ · Resume https://drive.google.com/file/d/1tvUUDXIiEy1aDDjIlC_ISVji06-NrZrF/view?usp=sharing · Email mailmohitbagri@gmail.com · © 2026 Mohit Bagri

## Mumbai specifics to get right
- Western Railway AC local (EMU): white/off-white body, sealed tinted windows (no bars), blue band under the windows
  with a thin red line, navy skirt, automatic sliding doors (closed), low AC units along the roof, pantograph,
  raked cab front with large windscreen, LED destination board in amber. Churchgate is the southern terminus:
  long platform canopies on green steel columns, yellow platform edge, Marathi + English yellow station boards
  (चर्चगेट / CHURCHGATE), the Western Railway HQ (Gothic stone, domed central tower) and Eros cinema (cream Art
  Deco with stepped tower) nearby. Platform indicators are black boards with amber/red LED text.
- Marine Drive: 3.6 km C-shaped sea-front from Nariman Point to Girgaon Chowpatty, with Malabar Hill at the far end;
  a wide promenade and low concrete parapet; tetrapods (four-legged concrete armour) piled at the foot of the sea
  wall; a row of 1930s Art Deco apartment blocks in cream, pale yellow, pink, with curved corners, eyebrow sunshades,
  ribbon balconies; at night the street lamps make the "Queen's Necklace". Cutting chai in small fluted glasses.
  Wankhede stadium floodlights are visible near Churchgate. Rain trees. Black-and-yellow Premier Padmini taxis.
- Siddhivinayak (Prabhadevi): see Footer brief.

## Section directions
Each section gets EXACTLY these 10 directions; make each one meaningfully different in composition, light,
rendering and type, and push each to its best version.

### Opening (Churchgate, the AC local, Mohit at the window). Scroll must reveal him: the scene starts wide,
then scrolling closes in on (or reveals) Mohit seated at a window, chin on his fist, pondering; the note appears.
01 Golden hour panorama: wide low frame, long white rake across the lower third, vast warm sky, one window glowing; scroll dollies in to him.
02 Window reflection: tight on one sealed window from outside; the city and sky reflected over him in the glass; scroll pulls the reflection away and he resolves.
03 Inside the coach: we sit opposite him; his profile silhouetted against the window, Churchgate platform soft beyond, grab straps swaying; scroll racks focus from straps to him.
04 Departure board: the black LED indicator board is the hero typography (amber dot-matrix: CHURCHGATE … his name as a train line); scroll flips the board and the train behind is revealed with him at the window.
05 Two-colour linocut: navy and saffron ink on paper, carved texture; railway-poster drama; scroll pans along the carved train to his window.
06 Monsoon evening: rain streaks and drops on glass, blurred sodium lights; he ponders inside; scroll wipes condensation away to reveal him.
07 Wires and sky: looking up from the platform, catenary wires and the roof edge with pantograph across a pink sky; scroll tilts the camera down to the train and him.
08 Isometric terminus: the whole Churchgate terminus as a calm isometric diorama, trains in the bays; scroll zooms into one coach and one window.
09 1930s travel poster: Art Deco Bombay poster, the AC local head-on with headlamp rays, Eros geometry; scroll turns the poster into the scene beside him.
10 Night ride: late, near-empty coach, cool fluorescent interior, the city's lights streaking past, navy and sodium; he leans on the glass.

### Promenade (Marine Drive, afternoon: who I am)
01 Cutting chai close-up on the parapet, steam rising, the sea and the bay soft beyond.
02 Tetrapods: sculptural concrete tetrapods in the foreground, spray, the horizon; one wave breaks on scroll.
03 The Queen's Necklace from Malabar Hill at golden hour, the whole C-curve; scroll lowers the sun.
04 Art Deco elevations: a frontal row of Marine Drive facades as precise architectural drawings, washed in pastel; scroll walks along them.
05 Mohit on the parapet, seen from behind (after the portrait), looking out at the sea; wind in his shirt.
06 Monsoon high tide: a wave rising over the sea wall, spray hanging; scroll drives the wave.
07 Early run: dawn, joggers along the promenade, long shadows (he runs and lifts; metaphor from his life).
08 Risograph print: three-ink riso (sea blue, fluoro pink, yellow), misregistration, halftone sea.
09 Pure horizon: almost nothing, sea, sky and the thin line of the wall; type leads; light shifts with scroll.
10 Chai stall at the wall: the chaiwala's cart, the kettle, glasses, a black-and-yellow taxi passing behind.

### Work (show AuctionXI featured in full and the other seven as a list or row; use the real media PNGs)
01 Editorial index: project names large in serif as an index; the hovered one shows its real media; one open by default.
02 Hoardings at dusk: each project's media on an Art Deco hoarding along Marine Drive, lit by a lamp; scroll walks past them.
03 Sticky split: media full-bleed right, text left, crossfades per project on scroll.
04 Gallery wall: works hung on a warm plaster wall with pools of spot light; captions as museum labels in sans.
05 Chalk menu board of a chai stall listing the projects (handwritten chalk), the media propped beside it.
06 Passing train: each project in a window of an AC rake that slides by on scroll.
07 Broadsheet: a Bombay newspaper front page; projects are stories, the media are the photographs.
08 Cinema marquee: Eros-style marquee "now showing" the project, the media on the screen inside.
09 Contact sheet: all real media as a contact sheet, one frame circled in grease pencil and enlarged.
10 Ledger: a red cloth bahi-khata ledger, projects entered as lines in ink, the media pasted in like receipts.

### Dusk (Every detour was part of the path; pinned, scroll steps through the 7 stops, then the roles list)
01 Queen's Necklace lighting: the curve of lamps lights near to far as you scroll, windows come on.
02 Lamp posts frontal: a row of posts on the promenade, each stop a post; the lit ones are the past.
03 Sunset steps: the sun sinks into the sea, one notch per stop, the sky deepening.
04 Strip map: a Western-line style strip map where every detour is a station, a train dot travelling it.
05 Walking figure: Mohit's silhouette walking the promenade at dusk, passing benches that are the stops.
06 Chowpatty sand: footprints along Girgaon Chowpatty's sand at dusk, each stop a set of prints, the tide behind.
07 Rajabai clock tower at dusk, the clock hands moving through the years.
08 Constellation: stops become stars over the sea, joined as he moves.
09 Typographic: huge years in sodium orange on navy, the line beneath, the city a thin strip of lights.
10 Taxi window: from the back seat of a kaali-peeli taxi on Marine Drive, lamps sliding past; each stop is a lamp.

### Footer (Siddhivinayak, after dark or at dawn: the invitation)
THE TEMPLE MUST READ AS SIDDHIVINAYAK. Study `assets/siddhivinayak-reference.png` (open it). Shree Siddhivinayak
Temple, Prabhadevi: a multi-storey shrine whose crown is a dense CLUSTER of tall, narrow, cylindrical/faceted
spires (shikharas) of different heights, each banded horizontally in cream, tan and brown stone with dark
recessed bands, each topped with a small stepped cap and a GOLD kalash finial; at the centre a larger stepped
pyramidal shikhara made of horizontal tiers narrowing upward, crowned with a large gold kalash and a saffron
(bhagwa) triangular flag on a pole; a dark shadowed band under its eaves with a row of small spire tips; in front,
lower down, a small ORANGE stepped dome over the entrance with its own gold finial. The real temple's central dome
and kalash are gold-plated and it is floodlit gold at night; the stone is cream/pinkish. Around it: Prabhadevi's
dense blocks. Details that carry emotion: marigold garlands, modak boxes and flower stalls outside, devotees'
queue, diyas, the bell, incense smoke, the mooshak (mouse) statue, Marathi "श्री सिद्धिविनायक". Silhouette accuracy
matters more than detail.
01 Faithful elevation at night: the reference composition, floodlit gold, navy sky, saffron flag moving.
02 The crown alone: close on the gold kalash and the flag against the night, nothing else.
03 Dawn queue: blue hour, the temple lit, a quiet line of devotees, marigold.
04 One diya: a single diya in cupped hands in the foreground, the temple soft behind.
05 Flower stall: marigold and rose garlands, modak boxes, the temple rising behind the stall's lamp.
06 Gold ink drawing: the temple as an architectural line drawing in gold ink on navy, drawn on scroll.
07 Rain at night: wet road reflecting the lit temple and the flag, umbrellas, sodium light.
08 Golden morning: warm sun on the spires, pigeons lifting, the city waking.
09 Devanagari: "श्री सिद्धिविनायक" large and luminous, the temple small, the invitation clear.
10 Incense and bells: smoke drifting across a dim gold interior glow seen through the entrance arch.
Every footer mock must include: footer title, line, the "Write to me →" action and the email, the belief quote with the reset line, the live Mumbai clock line, the links, © 2026 Mohit Bagri.
