# Original site: design notes

Source: https://mohitbagri.vercel.app/ (Next.js App Router + Tailwind v4, deployed on Vercel). Scraped 2026-10-27.
All copy, links and project data are in `content.json`. Assets are in `assets/`.

## Tokens
| Token | Value |
|---|---|
| bg | `#050706` (near-black, green tint) |
| bg-2 | `#0a0f0d` |
| text | `#ebe7dc` (warm off-white) |
| muted | `#7c857f` |
| line | `#ebe7dc17` (text at ~9% alpha) |
| accent (emerald) | `#2fbf8a` |
| emerald-deep | `#0c3526` |
| ease | `cubic-bezier(.16,1,.3,1)` (out-expo) |
| container | max-w 1320px, px 16 / 40 (md) |

Fonts: **Schibsted Grotesk** (sans, headings at weight 900, uppercase, tracking -0.05em, leading 0.9) and **Geist Mono** (labels: 11px, uppercase, tracking 0.1em).

## Structure and behaviour
1. **Header**: wordmark "Mohit Bagri ." + anchor nav + "Available for work" pill + mobile menu.
2. **Hero**: name split letter by letter, role, "Mumbai, IN · HH:MM IST" live clock, scroll cue.
3. **(01) About**: portrait plus copy that reveals word by word on scroll; Resume and Get in touch CTAs.
4. **(02) Selected work**: 8 numbered projects with huge uppercase titles (clamp 38–80px) that shift on hover and turn emerald. Each has a media panel: custom illustrations, an animated terminal replay (Cache Karo) and a looping video (Space Shuttle VR). Sticky media swaps as you scroll.
5. **(03) Experience**: timeline of 5 roles.
6. **(04) Stack**: two infinite marquee rows of Simple Icons logos (the second runs in reverse), edges fade out, pause on hover.
7. **(05) Contact**: big headline, email with a copy button.
8. **Footer**: statement, section links, "Say hello" column, social icons (GitHub, LinkedIn, Instagram, LeetCode, Resume), copyright, back to top, giant "MOHIT" wordmark.

Also: a custom cursor with labels ("Open", "View", "Resume") and section headers in the form `( 0N ) label`.

## Assets
- `portrait.jpg`: 800×1000
- `shuttle-vr.mp4` + `shuttle-vr.jpg`: VR demo loop and poster (720×720)
- `icon.png`: 64×64 favicon
- `opengraph-image.jpg`: 1200×630
- Project illustrations (AuctionXI, TexAgent, Aether, FlowLedger, VeloType, Windmill) are inline React/SVG components, not image files, so they have to be redrawn.
