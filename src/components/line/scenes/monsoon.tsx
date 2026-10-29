"use client";

import type { CSSProperties } from "react";
import { useReducedMotion } from "framer-motion";

/*
 * Monsoon night: heavy rain over a Mumbai street, an electric BEST
 * double-decker crossing, wet road throwing every light back as a long streak.
 *
 * Framing: viewBox 1200x1000 with "slice". 16:10 cards see about y 125..875,
 * 4:5 phone cards see about x 200..1000, so the bus (x 380..820 at rest), the
 * umbrellas and the balcony all sit inside that overlap.
 *
 * Depth: far skyline and tower are low contrast and blue in the haze; the old
 * building, lamps and shops are mid; bus and near rain are full contrast.
 * Light comes from two sodium lamps plus shopfronts, so reflections sit
 * directly below each of them.
 *
 * Motion budget: three rain layers (each ONE <g> whose pattern-filled rect
 * slides by exactly one tile height so the loop is seamless), a handful of
 * ripples, the bus group and one aviation light. That's it. Everything is
 * transform/opacity CSS keyframes, attached only while `active` and motion
 * is allowed; otherwise the still frame shows the bus parked mid-street.
 */

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
// Rounded so SSR and client serialise identical attribute strings.
const q = (n: number) => Math.round(n * 100) / 100;

type Layer = { id: string; w: number; h: number; n: number; len: [number, number]; width: number; opacity: number; seed: number };
// far -> near: shorter, thinner, dimmer streaks far away; long bright ones close
const LAYERS: Layer[] = [
  { id: "far", w: 90, h: 140, n: 7, len: [10, 18], width: 1, opacity: 0.28, seed: 11 },
  { id: "mid", w: 140, h: 220, n: 7, len: [22, 36], width: 1.4, opacity: 0.4, seed: 23 },
  { id: "near", w: 240, h: 360, n: 5, len: [50, 80], width: 2.2, opacity: 0.5, seed: 37 },
];
const STREAKS = LAYERS.map((l) => {
  const r = rng(l.seed);
  return Array.from({ length: l.n }, () => {
    const len = l.len[0] + r() * (l.len[1] - l.len[0]);
    return { x: q(4 + r() * (l.w - 8)), y: q(r() * (l.h - len)), len: q(len), o: q(0.5 + r() * 0.5) };
  });
});

const rr = rng(4242);
const RIPPLES = Array.from({ length: 9 }, (_, i) => ({
  x: q(230 + rr() * 740),
  y: q(830 + rr() * 140),
  d: q(i * 0.37 + rr() * 0.3),
  s: q(0.7 + rr() * 0.6),
}));
// lit windows on the far tower: seeded so the pattern looks lived-in, not a grid
const TOWER_WINDOWS = (() => {
  const r = rng(77);
  const out: { x: number; y: number }[] = [];
  for (let row = 0; row < 26; row++) for (let col = 0; col < 4; col++) if (r() > 0.68) out.push({ x: 712 + col * 12, y: 170 + row * 15 });
  return out;
})();

const CSS = `
@keyframes ms-rain-far { to { transform: translateY(140px); } }
@keyframes ms-rain-mid { to { transform: translateY(220px); } }
@keyframes ms-rain-near { to { transform: translateY(360px); } }
@keyframes ms-ripple {
  0% { transform: scale(0.15); opacity: 0; }
  10% { opacity: 0.7; }
  60%, 100% { transform: scale(1); opacity: 0; }
}
@keyframes ms-bus {
  0% { transform: translateX(-1050px); }
  100% { transform: translateX(1050px); }
}
@keyframes ms-blink { 0%, 60%, 100% { opacity: 0.15; } 70%, 85% { opacity: 1; } }
.ms-on .ms-rain-far { animation: ms-rain-far 1.15s linear infinite; }
.ms-on .ms-rain-mid { animation: ms-rain-mid 0.8s linear infinite; }
.ms-on .ms-rain-near { animation: ms-rain-near 0.55s linear infinite; }
.ms-on .ms-ripple { animation: ms-ripple 1.6s ease-out infinite; }
/* negative delay = start at the halfway point, so turning on picks up from the still frame (bus mid-street) */
.ms-on .ms-bus { animation: ms-bus 22s linear -11s infinite; }
.ms-on .ms-blink { animation: ms-blink 2.4s linear infinite; }
`;

const centred: CSSProperties = { transformBox: "fill-box", transformOrigin: "center" };

export function MonsoonScene({ active }: { active: boolean }) {
  const reduce = useReducedMotion();
  const on = active && !reduce;

  return (
    <div className="absolute inset-0 bg-night" aria-hidden>
      <style>{CSS}</style>
      <svg viewBox="0 0 1200 1000" preserveAspectRatio="xMidYMid slice" className={"h-full w-full" + (on ? " ms-on" : "")}>
        <Defs />

        {/* ---------- sky: low monsoon cloud lit orange from below by the city ---------- */}
        <rect width="1200" height="700" fill="url(#ms-sky)" />

        {/* ---------- far skyline, deep in haze ---------- */}
        <path
          d="M-20 560 V440 h70 v-50 h60 v80 h90 v-120 h50 v130 h110 V400 h80 v-60 h40 v200 h120 V380 h70 v-40 h60 v170 h90 v-140 h80 v120 h90 V420 h70 v140 Z"
          fill="#1b2440"
          opacity="0.75"
        />
        {/* the tower: the one tall thing on the skyline, aviation light on top */}
        <g opacity="0.5">
          <path d="M700 560 V170 l14 -22 h32 l14 22 V560 Z" fill="#2a3350" />
          <path d="M700 170 V560 h10 V170 Z" fill="#2c3858" />
          {TOWER_WINDOWS.map((w, i) => (
            <rect key={i} x={w.x} y={w.y} width="7" height="6" fill="#f4a640" opacity="0.35" />
          ))}
          <path d="M730 148 V112" stroke="#222c4a" strokeWidth="3" />
          <circle className="ms-blink" style={centred} cx="730" cy="110" r="4" fill="#ff4a3a" opacity="0.8" />
          <circle cx="730" cy="110" r="16" fill="url(#ms-red-glow)" opacity="0.6" />
        </g>
        {/* haze band swallowing the skyline base */}
        <rect y="380" width="1200" height="260" fill="url(#ms-haze)" />

        {/* ---------- old building, left: arches, a balcony, one lit home ---------- */}
        <OldBuilding />

        {/* ---------- right: shopfronts under a blue tarpaulin ---------- */}
        <Shops />

        {/* ---------- sodium lamps and their cones ---------- */}
        <Lamp x={300} />
        <Lamp x={960} />

        {/* ---------- footpath and kerb ---------- */}
        <rect x="-20" y="660" width="1240" height="34" fill="#151a26" />
        <rect x="-20" y="660" width="1240" height="34" fill="url(#ms-foot-sheen)" />
        <rect x="-20" y="692" width="1240" height="8" fill="#2a2f3c" />

        {/* umbrellas on the footpath: dark silhouettes, rim-lit from the nearest lamp */}
        <Umbrella x={330} c="#1a1f2c" rim />
        <Umbrella x={420} c="#2a1a24" s={0.9} />
        <Umbrella x={880} c="#13202a" rim flip />
        <Umbrella x={1000} c="#1d1d28" s={0.85} />

        {/* ---------- wet road ---------- */}
        <rect x="-20" y="700" width="1240" height="320" fill="url(#ms-road)" />
        {/* reflections: every light source drops a long vertical streak straight down */}
        <g filter="url(#ms-smear)">
          <rect x="282" y="700" width="36" height="300" fill="url(#ms-refl-sodium)" />
          <rect x="942" y="700" width="36" height="300" fill="url(#ms-refl-sodium)" />
          <rect x="1040" y="700" width="70" height="220" fill="url(#ms-refl-shop)" />
          <rect x="890" y="700" width="40" height="160" fill="url(#ms-refl-shop)" opacity="0.6" />
          <rect x="190" y="700" width="20" height="150" fill="url(#ms-refl-sodium)" opacity="0.5" />
          <rect x="720" y="700" width="12" height="120" fill="url(#ms-refl-sodium)" opacity="0.3" />
        </g>
        {/* lane paint, broken and glossy */}
        {[60, 260, 460, 660, 860, 1060].map((x) => (
          <rect key={x} x={x} y="902" width="110" height="7" fill="#efe8d8" opacity="0.18" />
        ))}

        {/* ---------- the bus ---------- */}
        <g className="ms-bus" style={{ transformBox: "view-box" }}>
          <Bus />
        </g>

        {/* ---------- ripples: a few rings popping on the road ---------- */}
        <g fill="none" stroke="#c9d4ee">
          {RIPPLES.map((p, i) => (
            <ellipse
              key={i}
              className="ms-ripple"
              cx={p.x}
              cy={p.y}
              rx={q(14 * p.s)}
              ry={q(3.4 * p.s)}
              strokeWidth="1.2"
              style={{ ...centred, animationDelay: `${p.d}s`, opacity: on ? 0 : 0.35 }}
            />
          ))}
        </g>

        {/* ---------- rain, three depths ---------- */}
        {LAYERS.map((l) => (
          <g key={l.id} transform="rotate(12 600 500)" opacity={l.opacity}>
            <g className={`ms-rain-${l.id}`}>
              {/* oversized so the rotated, sliding rect never shows an edge */}
              <rect x="-500" y={-400 - l.h} width="2200" height={1800 + l.h} fill={`url(#ms-rain-${l.id})`} />
            </g>
          </g>
        ))}

        {/* mist kicked up off the road, and a vignette to hold the eye centre */}
        <rect y="640" width="1200" height="200" fill="url(#ms-spray)" />
        <rect width="1200" height="1000" fill="url(#ms-vignette)" />
      </svg>
    </div>
  );
}

function Defs() {
  return (
    <defs>
      <linearGradient id="ms-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#070b16" />
        <stop offset="0.45" stopColor="#111a30" />
        <stop offset="0.8" stopColor="#3a3240" />
        <stop offset="1" stopColor="#5a4038" />
      </linearGradient>
      <linearGradient id="ms-haze" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3a3a4a" stopOpacity="0" />
        <stop offset="0.6" stopColor="#4a4048" stopOpacity="0.55" />
        <stop offset="1" stopColor="#2a2a36" stopOpacity="0.2" />
      </linearGradient>
      <filter id="ms-cone-blur" x="-20%" y="-10%" width="140%" height="120%">
        <feGaussianBlur stdDeviation="14" />
      </filter>
      <radialGradient id="ms-red-glow">
        <stop offset="0" stopColor="#ff4a3a" stopOpacity="0.8" />
        <stop offset="1" stopColor="#ff4a3a" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="ms-lamp-glow">
        <stop offset="0" stopColor="#ffe3a8" stopOpacity="0.95" />
        <stop offset="0.2" stopColor="#f4a640" stopOpacity="0.5" />
        <stop offset="1" stopColor="#f4a640" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="ms-cone" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f4a640" stopOpacity="0.45" />
        <stop offset="1" stopColor="#f4a640" stopOpacity="0.02" />
      </linearGradient>
      <linearGradient id="ms-road" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#1a1c26" />
        <stop offset="0.4" stopColor="#0f131e" />
        <stop offset="1" stopColor="#070b16" />
      </linearGradient>
      <linearGradient id="ms-foot-sheen" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#f4a640" stopOpacity="0" />
        <stop offset="0.25" stopColor="#f4a640" stopOpacity="0.22" />
        <stop offset="0.45" stopColor="#f4a640" stopOpacity="0" />
        <stop offset="0.8" stopColor="#f4a640" stopOpacity="0.2" />
        <stop offset="1" stopColor="#f4a640" stopOpacity="0.05" />
      </linearGradient>
      <linearGradient id="ms-refl-sodium" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffcf7a" stopOpacity="0.85" />
        <stop offset="0.5" stopColor="#f4a640" stopOpacity="0.35" />
        <stop offset="1" stopColor="#f4a640" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="ms-refl-shop" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#efe8d8" stopOpacity="0.55" />
        <stop offset="1" stopColor="#efe8d8" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="ms-refl-red" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#c0262c" stopOpacity="0.55" />
        <stop offset="1" stopColor="#c0262c" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="ms-refl-win" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffe3a8" stopOpacity="0.5" />
        <stop offset="1" stopColor="#ffe3a8" stopOpacity="0" />
      </linearGradient>
      {/* reflections smear sideways a little and a lot vertically, like on real wet tar */}
      <filter id="ms-smear" x="-50%" y="-10%" width="200%" height="120%">
        <feGaussianBlur stdDeviation="5 10" />
      </filter>
      <linearGradient id="ms-bus-body" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#d23a33" />
        <stop offset="0.5" stopColor="#b3242a" />
        <stop offset="1" stopColor="#6e1418" />
      </linearGradient>
      <linearGradient id="ms-glass" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffe3a8" stopOpacity="0.85" />
        <stop offset="1" stopColor="#f4a640" stopOpacity="0.55" />
      </linearGradient>
      <linearGradient id="ms-beam" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#fff4d6" stopOpacity="0.45" />
        <stop offset="1" stopColor="#fff4d6" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="ms-wall" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#1c2232" />
        <stop offset="1" stopColor="#262a36" />
      </linearGradient>
      <linearGradient id="ms-stain" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#000" stopOpacity="0.35" />
        <stop offset="1" stopColor="#000" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="ms-spray" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#8d93a6" stopOpacity="0" />
        <stop offset="0.5" stopColor="#8d93a6" stopOpacity="0.1" />
        <stop offset="1" stopColor="#8d93a6" stopOpacity="0" />
      </linearGradient>
      <radialGradient id="ms-vignette" cx="600" cy="560" r="760" gradientUnits="userSpaceOnUse">
        <stop offset="0.5" stopColor="#070b16" stopOpacity="0" />
        <stop offset="1" stopColor="#070b16" stopOpacity="0.85" />
      </radialGradient>
      {/* rain tiles: drawn once, repeated by the pattern engine instead of hundreds of nodes */}
      {LAYERS.map((l, li) => (
        <pattern key={l.id} id={`ms-rain-${l.id}`} width={l.w} height={l.h} patternUnits="userSpaceOnUse">
          {STREAKS[li].map((s, i) => (
            <line key={i} x1={s.x} y1={s.y} x2={s.x} y2={q(s.y + s.len)} stroke="#c9d4ee" strokeWidth={l.width} strokeLinecap="round" opacity={s.o} />
          ))}
        </pattern>
      ))}
    </defs>
  );
}

function OldBuilding() {
  const floors = [250, 390, 530];
  const cols = [190, 280, 370];
  return (
    <g>
      <path d="M100 660 V230 L110 210 H470 L480 230 V660 Z" fill="url(#ms-wall)" />
      {/* cornices: the light from the lamp catches their top lips */}
      {[210, 360, 500].map((y) => (
        <g key={y}>
          <rect x="94" y={y} width="392" height="12" fill="#2c3244" />
          <rect x="94" y={y} width="392" height="2" fill="#f4a640" opacity="0.22" />
        </g>
      ))}
      {/* monsoon stains running down from every ledge */}
      {[120, 210, 330, 430].map((x, i) => (
        <rect key={x} x={x} y={222 + (i % 2) * 150} width={24 + (i % 3) * 8} height="130" fill="url(#ms-stain)" />
      ))}
      {/* tall arched windows; one home is awake */}
      {floors.map((y, fi) =>
        cols.map((x, ci) => {
          const lit = fi === 1 && ci === 1;
          const dim = fi === 0 && ci === 2;
          return (
            <g key={`${x}-${y}`}>
              <path d={`M${x} ${y + 90} V${y + 22} a26 22 0 0 1 52 0 V${y + 90} Z`} fill={lit ? "url(#ms-glass)" : dim ? "#3a2e2a" : "#0b0f1a"} />
              <path d={`M${x + 26} ${y} V${y + 90} M${x} ${y + 44} H${x + 52}`} stroke="#1a1f2c" strokeWidth="3" />
              <path d={`M${x - 4} ${y + 92} H${x + 56}`} stroke="#2c3244" strokeWidth="5" />
            </g>
          );
        }),
      )}
      {/* glow spilling from the lit window onto the wall */}
      <ellipse cx="306" cy="430" rx="70" ry="60" fill="url(#ms-lamp-glow)" opacity="0.35" />
      {/* balcony on the lit floor: slab, cast-iron railing, a couple of plant pots */}
      <g>
        <rect x="250" y="478" width="132" height="10" fill="#2e3446" />
        <rect x="250" y="478" width="132" height="2" fill="#f4a640" opacity="0.35" />
        <path d="M254 478 V442 H378 V478" fill="none" stroke="#0a0d16" strokeWidth="3" />
        {Array.from({ length: 11 }, (_, i) => (
          <path key={i} d={`M${264 + i * 10.5} 444 V478`} stroke="#0a0d16" strokeWidth="2" />
        ))}
        <path d="M262 460 q10 -10 20 0 t20 0 t20 0 t20 0 t20 0 t20 0" fill="none" stroke="#0a0d16" strokeWidth="1.6" />
        <path d="M268 442 h14 l-2 -12 h-10 Z M352 442 h12 l-2 -10 h-8 Z" fill="#0a0d16" />
        <path d="M270 430 q2 -16 8 -20 M276 430 q4 -12 -4 -22 M356 432 q2 -12 8 -14" stroke="#0a0d16" strokeWidth="2.4" fill="none" />
      </g>
      {/* ground floor: a closed shutter */}
      <rect x="150" y="590" width="200" height="70" fill="#1d212c" />
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} d={`M150 ${596 + i * 7.5} H350`} stroke="#000" strokeOpacity="0.35" strokeWidth="1.2" />
      ))}
    </g>
  );
}

function Shops() {
  return (
    <g>
      {/* mid-rise block behind the shops, a few windows */}
      <path d="M800 660 V300 H1220 V660 Z" fill="#171c2a" />
      {[
        [840, 340], [900, 340], [1080, 340], [960, 400], [1140, 400], [840, 460], [1020, 460],
      ].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="34" height="28" fill={i % 3 === 0 ? "#f4a640" : "#0b0f1a"} opacity={i % 3 === 0 ? 0.45 : 1} />
      ))}
      {/* lit shop: warm interior, tarpaulin awning dripping */}
      <rect x="860" y="560" width="300" height="100" fill="#3a2c22" />
      <rect x="872" y="570" width="276" height="90" fill="url(#ms-glass)" opacity="0.55" />
      {/* shelves and a shopkeeper silhouette */}
      <path d="M872 600 H1148 M872 630 H1148" stroke="#3a2516" strokeWidth="3" opacity="0.7" />
      <path d="M1052 660 v-40 q0 -14 12 -14 q12 0 12 14 v40 Z M1064 600 m-8 0 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0" fill="#1a120c" />
      {/* shop sign board above the awning: glowing, unreadable from here */}
      <rect x="870" y="508" width="280" height="30" fill="#efe8d8" opacity="0.14" />
      <rect x="884" y="518" width="150" height="10" fill="#f3c623" opacity="0.45" />
      {/* the blue tarpaulin every Mumbai shop strings up in June */}
      <path d="M846 548 L1176 548 L1190 580 L832 580 Z" fill="#24527a" opacity="0.9" />
      <path d="M832 580 L1190 580" stroke="#7fa8ff" strokeOpacity="0.4" strokeWidth="2" />
      {Array.from({ length: 8 }, (_, i) => (
        <path key={i} d={`M${850 + i * 44} 582 v${10 + (i % 3) * 6}`} stroke="#c9d4ee" strokeOpacity="0.5" strokeWidth="1.4" strokeLinecap="round" />
      ))}
    </g>
  );
}

function Lamp({ x }: { x: number }) {
  return (
    <g>
      {/* cone softened once (static filter): hard edges read as a spotlight, not sodium in rain */}
      <path d={`M${x - 50} 370 L${x - 2} 370 L${x + 110} 690 L${x - 162} 690 Z`} fill="url(#ms-cone)" filter="url(#ms-cone-blur)" />
      <path d={`M${x + 4} 694 V380 q0 -24 -24 -26 h-14`} fill="none" stroke="#0b0e16" strokeWidth="7" />
      <path d={`M${x - 46} 352 h40 l-6 10 h-28 Z`} fill="#0b0e16" />
      <circle cx={x - 26} cy="364" r="90" fill="url(#ms-lamp-glow)" />
      <ellipse cx={x - 26} cy="363" rx="14" ry="4" fill="#fff4d6" />
    </g>
  );
}

function Umbrella({ x, c, s = 1, rim, flip }: { x: number; c: string; s?: number; rim?: boolean; flip?: boolean }) {
  return (
    <g transform={`translate(${x} 692) scale(${flip ? -s : s} ${s})`}>
      {/* body under the umbrella */}
      <path d="M-10 0 V-46 q0 -10 10 -10 q10 0 10 10 V0 Z" fill="#0a0d16" />
      <path d="M0 -60 V-76" stroke="#0a0d16" strokeWidth="2" />
      <path d="M-36 -74 Q0 -112 36 -74 q-6 -4 -12 0 q-6 -4 -12 0 q-6 -4 -12 0 q-6 -4 -12 0 q-6 -4 -12 0 q-6 -4 -12 0 Z" fill={c} />
      {rim && <path d="M-36 -74 Q-22 -96 0 -98" fill="none" stroke="#f4a640" strokeOpacity="0.55" strokeWidth="2" />}
      <path d="M0 -98 V-104" stroke={c} strokeWidth="2" />
    </g>
  );
}

/* Electric BEST double-decker, side-on, heading right. Local origin = left end at road level. */
function Bus() {
  const upper = [24, 86, 148, 210, 272, 334];
  const lower = [120, 180, 240, 300];
  return (
    <g transform="translate(380 812)">
      {/* headlight beam on the road ahead and its reflection */}
      <path d="M444 -54 L700 -26 L700 6 L444 -40 Z" fill="url(#ms-beam)" opacity="0.5" />
      <ellipse cx="560" cy="-2" rx="150" ry="16" fill="url(#ms-lamp-glow)" opacity="0.45" />
      {/* reflection in the wet road: bus body and lit windows smeared downward */}
      <g filter="url(#ms-smear)" opacity="0.8">
        <rect x="10" y="4" width="420" height="120" fill="url(#ms-refl-red)" />
        {upper.slice(1).map((x) => (
          <rect key={x} x={x + 10} y="70" width="40" height="80" fill="url(#ms-refl-win)" opacity="0.5" />
        ))}
        <rect x="430" y="2" width="20" height="150" fill="url(#ms-refl-sodium)" />
      </g>

      {/* body: boxy, near-flat roof, tight corners like the new electric deckers */}
      <path d="M8 -218 H418 q22 0 24 22 V-34 q0 -6 -6 -6 H6 q-6 0 -6 -6 V-210 q0 -8 8 -8 Z" fill="url(#ms-bus-body)" />
      {/* roof line catching the lamps */}
      <path d="M10 -217 H420" stroke="#ffcf7a" strokeOpacity="0.45" strokeWidth="2" />

      {/* upper deck: one long dark glass band, warm cabin lights inside */}
      <rect x="14" y="-204" width="424" height="58" rx="5" fill="#0b0d14" />
      {upper.map((x) => (
        <rect key={x} x={x} y="-198" width="56" height="46" rx="2" fill="url(#ms-glass)" opacity="0.75" />
      ))}
      {/* front wraparound windscreen */}
      <path d="M402 -198 H430 q6 0 6 6 V-152 H402 Z" fill="url(#ms-glass)" opacity="0.55" />
      {/* passenger heads in the windows */}
      {[52, 118, 236, 300].map((x) => (
        <circle key={x} cx={x} cy="-160" r="8" fill="#3a1d10" opacity="0.65" />
      ))}

      {/* deck band with destination LED */}
      <rect x="320" y="-140" width="96" height="14" rx="2" fill="#0b0d14" />
      <text x="368" y="-129.5" textAnchor="middle" fontSize="11" fill="#f4a640" letterSpacing="1.5" style={{ fontFamily: "var(--font-mono), monospace" }}>
        CHURCHGATE
      </text>

      {/* lower deck windows */}
      <rect x="110" y="-118" width="250" height="50" rx="4" fill="#0b0d14" />
      {lower.map((x) => (
        <rect key={x} x={x} y="-113" width="54" height="40" rx="2" fill="url(#ms-glass)" opacity="0.6" />
      ))}
      <rect x="14" y="-118" width="80" height="50" rx="4" fill="#0b0d14" />
      <rect x="20" y="-113" width="68" height="40" rx="2" fill="url(#ms-glass)" opacity="0.45" />
      {/* front door, lit, and lower windscreen */}
      <rect x="370" y="-122" width="50" height="78" rx="3" fill="#0b0d14" />
      <rect x="374" y="-118" width="20" height="70" fill="url(#ms-glass)" opacity="0.7" />
      <rect x="396" y="-118" width="20" height="70" fill="url(#ms-glass)" opacity="0.7" />
      <path d="M424 -122 H436 q4 0 4 4 V-60 H424 Z" fill="url(#ms-glass)" opacity="0.45" />

      {/* BEST lettering and a thin cream stripe: the livery, kept minimal */}
      <rect x="6" y="-62" width="360" height="3" fill="#efe8d8" opacity="0.5" />
      <text x="40" y="-140" fontSize="15" fontWeight="800" fill="#efe8d8" opacity="0.85" letterSpacing="2" style={{ fontFamily: "var(--font-display), sans-serif" }}>
        BEST
      </text>

      {/* wheel arches and wheels */}
      {[86, 352].map((x) => (
        <g key={x}>
          <path d={`M${x - 36} -34 a36 36 0 0 1 72 0 Z`} fill="#160609" />
          <circle cx={x} cy="-20" r="22" fill="#0a0b10" />
          <circle cx={x} cy="-20" r="10" fill="#3a3d48" />
          <circle cx={x - 3} cy="-23" r="4" fill="#8d93a6" opacity="0.6" />
        </g>
      ))}

      {/* lights: head (white, front/right), tail (red, back/left) */}
      <rect x="434" y="-58" width="8" height="12" rx="2" fill="#fff4d6" />
      <circle cx="440" cy="-52" r="34" fill="url(#ms-lamp-glow)" />
      <rect x="0" y="-62" width="5" height="16" rx="1.5" fill="#ff3b2e" />
      <circle cx="2" cy="-54" r="20" fill="url(#ms-red-glow)" />
      {/* rain sheen running down the side */}
      <path d="M8 -216 H200 L120 -40 H8 Z" fill="#fff" opacity="0.035" />
    </g>
  );
}
