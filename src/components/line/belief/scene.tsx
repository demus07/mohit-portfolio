import { motion, type MotionValue } from "framer-motion";

/*
 * Siddhivinayak at first light (docs/mumbai-local.md, section 5).
 * One viewBox, anchored to the bottom (xMidYMax slice) so the temple and the diyas
 * always sit on the ground line; wide screens crop the sky, phones crop the sides.
 * Everything that matters lives in the middle ~380 units so a 390px phone keeps
 * the whole temple and five diyas.
 * Light story: the glow is low behind the temple (dawn), the gold dome catches it,
 * the foreground is lit only by the diyas. No figure, no deity: the building and the
 * lamps carry the feeling.
 */

const W = 1440;
const H = 900;
const GROUND = 760;
const LEDGE = 846;

/** mulberry32: deterministic so server and client render the same skyline */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Block = { x: number; w: number; h: number };
type Win = { x: number; y: number };

/* Two city layers: the far one is hazy and bluer (atmospheric depth), the near one
   stays clear of the temple so the temple reads as the subject. */
const far: Block[] = [];
const near: Block[] = [];
const windows: Win[] = [];
{
  const r = rng(11);
  for (let x = -20; x < W + 20; ) {
    const w = 24 + r() * 50;
    let h = 30 + r() * 95;
    if (x > 560 && x < 880) h *= 0.55;
    far.push({ x, w, h });
    x += w + r() * 6;
  }
  const r2 = rng(29);
  for (let x = -20; x < W + 20; ) {
    const w = 30 + r2() * 56;
    // buildings shrink as they approach the temple so it keeps the skyline to itself
    const toCentre = Math.min(1, Math.abs(x + w / 2 - 720) / 520);
    const h = (18 + r2() * 90) * (0.35 + 0.65 * toCentre);
    if (x + w < 520 || x > 920) {
      near.push({ x, w, h });
      // a city waking up: only a handful of lit windows
      for (let wy = GROUND - h + 8; wy < GROUND - 8; wy += 11) {
        for (let wx = x + 5; wx < x + w - 6; wx += 9) {
          if (r2() < 0.05) windows.push({ x: wx, y: wy });
        }
      }
    }
    x += w + r2() * 4;
  }
}

/** A Siddhivinayak-style dome: a slightly bulbous shikhara rising to a point. */
function domePath(cx: number, base: number, w: number, h: number) {
  const l = cx - w / 2;
  const r = cx + w / 2;
  const top = base - h;
  return [
    `M${l} ${base}`,
    `C${l - w * 0.08} ${base - h * 0.45} ${cx - w * 0.3} ${base - h * 0.8} ${cx} ${top}`,
    `C${cx + w * 0.3} ${base - h * 0.8} ${r + w * 0.08} ${base - h * 0.45} ${r} ${base}`,
    "Z",
  ].join(" ");
}

type DomeSpec = { cx: number; base: number; w: number; h: number; glow: number };

/* Back to front: corner domes, the paired domes, then the main golden dome. */
const domes: DomeSpec[] = [
  { cx: 566, base: 646, w: 20, h: 26, glow: 0.5 },
  { cx: 874, base: 646, w: 20, h: 26, glow: 0.5 },
  { cx: 598, base: 600, w: 24, h: 32, glow: 0.6 },
  { cx: 842, base: 600, w: 24, h: 32, glow: 0.6 },
  { cx: 630, base: 600, w: 50, h: 62, glow: 0.75 },
  { cx: 810, base: 600, w: 50, h: 62, glow: 0.75 },
  { cx: 720, base: 572, w: 112, h: 122, glow: 1 },
];

function Dome({ d, gold }: { d: DomeSpec; gold: MotionValue<number> | number }) {
  const k = d.w / 112;
  const top = d.base - d.h;
  const path = domePath(d.cx, d.base, d.w, d.h);
  return (
    <g>
      {/* collar ring the dome sits on */}
      <rect x={d.cx - d.w * 0.56} y={d.base - 4 * k - 2} width={d.w * 1.12} height={6 * k + 3} fill="#1a1a2a" />
      <path d={path} fill="#0d1226" />
      {/* the gold is a separate layer so scroll can warm it without touching the silhouette */}
      <motion.path d={path} fill="url(#bl-gold)" style={{ opacity: gold }} fillOpacity={d.glow} />
      {/* ribs: nested dome curves meeting at the tip read as a shikhara, not an onion dome */}
      {d.w > 40 && (
        <g fill="none" stroke="#6b3a10" strokeOpacity={0.55} strokeWidth={Math.max(0.8, 1.4 * k)}>
          {[0.34, 0.68].map((f) => (
            <path key={f} d={domePath(d.cx, d.base, d.w * f, d.h)} />
          ))}
          <line x1={d.cx} y1={d.base} x2={d.cx} y2={top + 2} />
        </g>
      )}
      {/* kalash: pot, bulb and spike */}
      <motion.g style={{ opacity: gold }} fill="url(#bl-gold-v)">
        <ellipse cx={d.cx} cy={top - 3 * k} rx={9 * k + 1} ry={3 * k + 0.8} />
        <circle cx={d.cx} cy={top - 11 * k} r={6.5 * k + 0.8} />
        <ellipse cx={d.cx} cy={top - 18 * k} rx={4 * k + 0.6} ry={2 * k + 0.5} />
        <rect x={d.cx - 1.1 * k - 0.4} y={top - 34 * k} width={2.2 * k + 0.8} height={16 * k} />
        <circle cx={d.cx} cy={top - 35 * k} r={1.8 * k + 0.5} />
      </motion.g>
    </g>
  );
}

/* Arched openings in the plinth: lamps burn inside the temple before dawn. */
const arches = [
  { x: 586, w: 26, h: 52 },
  { x: 636, w: 26, h: 52 },
  { x: 700, w: 40, h: 74 },
  { x: 778, w: 26, h: 52 },
  { x: 828, w: 26, h: 52 },
];

function archPath(x: number, w: number, h: number) {
  const r = w / 2;
  return `M${x} ${GROUND} V${GROUND - h + r} A${r} ${r} 0 0 1 ${x + w} ${GROUND - h + r} V${GROUND} Z`;
}

/* Diyas sit on the ledge, centred so the middle five survive a phone crop. */
const diyas = Array.from({ length: 9 }, (_, i) => ({
  x: 720 + (i - 4) * 78,
  // uneven timing so the row never pulses in unison
  dur: [2.1, 2.6, 1.9, 2.4, 2.8, 2.2, 2.5, 2.0, 2.7][i],
  delay: -i * 0.37,
}));

const flameCss = `
@keyframes bl-flame {
  0%, 100% { transform: scale(1, 1); opacity: 1; }
  30% { transform: scale(0.93, 1.07); opacity: 0.88; }
  55% { transform: scale(1.05, 0.94); opacity: 1; }
  80% { transform: scale(0.97, 1.04); opacity: 0.84; }
}
@keyframes bl-glow {
  0%, 100% { opacity: 0.55; }
  50% { opacity: 0.8; }
}
.bl-flame { transform-box: fill-box; transform-origin: 50% 100%; animation: bl-flame 2.4s ease-in-out infinite; }
.bl-glow { animation: bl-glow 3.2s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .bl-flame, .bl-glow { animation: none; } }
`;

export function BeliefScene({
  warm,
  gold,
  running,
}: {
  /** 0 = deep blue pre-dawn, 1 = first warm light; driven by scroll */
  warm: MotionValue<number> | number;
  /** how strongly the domes catch the light */
  gold: MotionValue<number> | number;
  /** flames only animate while the section is on screen */
  running: boolean;
}) {
  const play = running ? "running" : "paused";
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMax slice"
      aria-hidden
    >
      {/* keyframes injected here because Tailwind v4 strips unlayered @keyframes from globals */}
      <style>{flameCss}</style>
      <defs>
        <linearGradient id="bl-sky-cool" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#03060f" />
          <stop offset="0.45" stopColor="#081231" />
          <stop offset="0.74" stopColor="#13234f" />
          <stop offset="0.845" stopColor="#223466" />
          <stop offset="1" stopColor="#0b1226" />
        </linearGradient>
        <linearGradient id="bl-sky-warm" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#050a1a" />
          <stop offset="0.4" stopColor="#111d47" />
          <stop offset="0.62" stopColor="#363869" />
          <stop offset="0.74" stopColor="#80566e" />
          <stop offset="0.8" stopColor="#c9835e" />
          <stop offset="0.845" stopColor="#f0ab68" />
          <stop offset="1" stopColor="#1a1426" />
        </linearGradient>
        <radialGradient id="bl-dawn" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffcf7a" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#f4a640" stopOpacity="0.16" />
          <stop offset="1" stopColor="#f4a640" stopOpacity="0" />
        </radialGradient>
        {/* light comes from low-left, so the dome is bright on that shoulder */}
        <linearGradient id="bl-gold" x1="0" y1="0.2" x2="1" y2="0.8">
          <stop offset="0" stopColor="#ffe6a6" />
          <stop offset="0.32" stopColor="#f1b64a" />
          <stop offset="0.7" stopColor="#a7631b" />
          <stop offset="1" stopColor="#432510" />
        </linearGradient>
        <linearGradient id="bl-gold-v" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffe08f" />
          <stop offset="1" stopColor="#b8741f" />
        </linearGradient>
        <linearGradient id="bl-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0c1124" />
          <stop offset="1" stopColor="#05070f" />
        </linearGradient>
        <linearGradient id="bl-temple" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#141a33" />
          <stop offset="1" stopColor="#0a0e1e" />
        </linearGradient>
        {/* lamplight inside the arches pools near the floor */}
        <linearGradient id="bl-arch" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4a640" stopOpacity="0.12" />
          <stop offset="1" stopColor="#ffcf7a" stopOpacity="0.5" />
        </linearGradient>
        <radialGradient id="bl-flame-fill" cx="0.5" cy="0.85" r="0.75">
          <stop offset="0" stopColor="#fffbe8" />
          <stop offset="0.35" stopColor="#ffcf7a" />
          <stop offset="1" stopColor="#f4a640" stopOpacity="0.2" />
        </radialGradient>
        <radialGradient id="bl-diya-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffcf7a" stopOpacity="0.55" />
          <stop offset="0.45" stopColor="#f4a640" stopOpacity="0.16" />
          <stop offset="1" stopColor="#f4a640" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* sky: two gradients crossfaded by scroll, opacity only */}
      <rect width={W} height={H} fill="url(#bl-sky-cool)" />
      <motion.g style={{ opacity: warm }}>
        <rect width={W} height={H} fill="url(#bl-sky-warm)" />
        <ellipse cx={720} cy={GROUND} rx={760} ry={230} fill="url(#bl-dawn)" />
      </motion.g>

      {/* far city, hazy and blue */}
      <g fill="#1a2448" opacity={0.75}>
        {far.map((b, i) => (
          <rect key={i} x={b.x} y={GROUND - b.h} width={b.w} height={b.h} />
        ))}
      </g>
      {/* near city, darker */}
      <g fill="#0d1328">
        {near.map((b, i) => (
          <rect key={i} x={b.x} y={GROUND - b.h} width={b.w} height={b.h} />
        ))}
      </g>
      <g fill="#ffcf7a" opacity={0.55}>
        {windows.map((w, i) => (
          <rect key={i} x={w.x} y={w.y} width={3} height={4} />
        ))}
      </g>

      {/* temple body */}
      <g fill="url(#bl-temple)">
        <rect x={556} y={650} width={328} height={GROUND - 650} />
        <rect x={548} y={642} width={344} height={10} />
        <rect x={586} y={606} width={268} height={36} />
        <rect x={578} y={598} width={284} height={9} />
        <rect x={664} y={574} width={112} height={26} />
      </g>
      {/* rim light along the cornices, from the dawn behind */}
      <motion.g style={{ opacity: gold }} stroke="#f1b64a" strokeWidth={1.2} strokeOpacity={0.5}>
        <line x1={548} y1={642.5} x2={892} y2={642.5} />
        <line x1={578} y1={598.5} x2={862} y2={598.5} />
        <line x1={664} y1={574.5} x2={776} y2={574.5} />
      </motion.g>
      {/* small upper-storey windows */}
      <g fill="#ffcf7a" opacity={0.22}>
        {[606, 640, 674, 752, 786, 820].map((x) => (
          <rect key={x} x={x} y={616} width={12} height={16} rx={6} />
        ))}
      </g>
      {/* arches glow from the lamps inside */}
      <g fill="url(#bl-arch)">
        {arches.map((a) => (
          <path key={a.x} d={archPath(a.x, a.w, a.h)} opacity={a.w > 30 ? 1 : 0.7} />
        ))}
      </g>
      {domes.map((d) => (
        <Dome key={`${d.cx}-${d.base}`} d={d} gold={gold} />
      ))}

      {/* courtyard and the ledge the diyas rest on */}
      <rect y={GROUND} width={W} height={H - GROUND} fill="url(#bl-ground)" />
      <rect y={LEDGE} width={W} height={H - LEDGE} fill="#0a0e1d" />
      <line x1={0} y1={LEDGE + 0.5} x2={W} y2={LEDGE + 0.5} stroke="#ffcf7a" strokeOpacity={0.16} />

      {diyas.map((d) => (
        <g key={d.x} transform={`translate(${d.x} ${LEDGE})`}>
          <circle
            className="bl-glow"
            cx={14}
            cy={-26}
            r={44}
            fill="url(#bl-diya-glow)"
            style={{ animationDuration: `${d.dur + 1}s`, animationDelay: `${d.delay}s`, animationPlayState: play }}
          />
          {/* the warm pool the flame throws on the ledge */}
          <ellipse cx={8} cy={3} rx={30} ry={4} fill="#ffcf7a" opacity={0.14} />
          {/* clay bowl with a pinched spout on the right */}
          <path d="M-18 -10 C-15 3 13 3 18 -10 L24 -13 L17 -12 Z" fill="#4a2817" />
          <path d="M-18 -10 C-6 -7 8 -7 18 -10" fill="none" stroke="#c7803f" strokeOpacity={0.7} strokeWidth={1.4} />
          <path
            className="bl-flame"
            d="M18 -42 C23 -32 25 -24 18 -14 C11 -24 13 -32 18 -42 Z"
            fill="url(#bl-flame-fill)"
            style={{ animationDuration: `${d.dur}s`, animationDelay: `${d.delay}s`, animationPlayState: play }}
          />
        </g>
      ))}
    </svg>
  );
}
