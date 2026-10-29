"use client";

import { useReducedMotion } from "framer-motion";
import { offTheClock } from "@/lib/content";

/*
 * Dalal Street at night: standing in the road, looking up the street at the BSE
 * tower (Phiroze Jeejeebhoy Towers) where it closes the view.
 *
 * Everything is placed in metres in a tiny 3D world and run through one pinhole
 * camera tilted up 14 degrees (`P` below). That single choice is what makes it
 * read as "looking up": the tower's sides converge toward the sky, the old
 * buildings' cornices race to one vanishing point and the parked taxis sit on
 * the same ground plane. Hand-placed 2D shapes never quite agree with each other.
 *
 * Light: a moon high on the left (cool rim on left-facing edges, right-hand
 * facades a touch brighter) and sodium street lamps low in the street (warm
 * pools, warm uplight on the tower's podium). Distance = more blue haze.
 *
 * Motion: the LED ticker scrolls and the aviation light on the mast blinks, both
 * CSS animations on transform/opacity, paused unless `active`, removed entirely
 * for reduced motion. Two animated nodes.
 *
 * Phone crop (4:5 of a 1600x1000 viewBox) keeps x 400 to 1200: the tower, the
 * ticker and the nearest taxi all sit inside it.
 */

/* ---------- camera ---------- */

const F = 900; // focal length in viewBox px
const PX = 800;
const PY = 560;
const PITCH = (14 * Math.PI) / 180;
const COS = Math.cos(PITCH);
const SIN = Math.sin(PITCH);
const EYE = 1.6; // standing in the road

type V = [number, number];
const r1 = (n: number) => Math.round(n * 10) / 10;

/** world (X right, Y up from the ground, Z away from us) in metres -> viewBox px */
function P(X: number, Y: number, Z: number): V {
  const y = Y - EYE;
  const yc = y * COS - Z * SIN;
  const zc = y * SIN + Z * COS;
  return [r1(PX + (F * X) / zc), r1(PY - (F * yc) / zc)];
}
const pts = (...p: V[]) => p.map((q) => `${q[0]},${q[1]}`).join(" ");
/** quad on a wall of constant X */
const wallX = (X: number, y0: number, y1: number, z0: number, z1: number) =>
  pts(P(X, y0, z0), P(X, y1, z0), P(X, y1, z1), P(X, y0, z1));
/** quad on a face of constant Z (faces looking at us) */
const wallZ = (Z: number, x0: number, x1: number, y0: number, y1: number) =>
  pts(P(x0, y0, Z), P(x0, y1, Z), P(x1, y1, Z), P(x1, y0, Z));
/** quad on a horizontal plane */
const flat = (Y: number, x0: number, x1: number, z0: number, z1: number) =>
  pts(P(x0, Y, z0), P(x1, Y, z0), P(x1, Y, z1), P(x0, Y, z1));

// mulberry32: seeded, so SSR and the client draw the same lit windows
function rng(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const HORIZON = r1(PY + F * Math.tan(PITCH));

/* ---------- the tower ---------- */

const TZ = 140; // tower face depth
const TW = 17; // half width of the shaft: slender, like the real thing
const COLS = 14;
const BAY = (TW * 2) / COLS;
const SHAFT_TOP = 106;
const CROWN = { y0: 106, y1: 124, w: 22, z: 138.5 };
const PODIUM = { w: 25, h: 15, z: 137 };
const TICKER = { y0: 7.6, y1: 14.2 };

const FINS = Array.from({ length: COLS + 1 }, (_, i) => {
  const x = -TW + i * BAY;
  return { a: P(x, PODIUM.h, TZ), b: P(x, SHAFT_TOP, TZ) };
});
const FLOORS = Array.from({ length: 26 }, (_, i) => PODIUM.h + 1.5 + i * 3.5).filter((y) => y < SHAFT_TOP - 1);
const TOWER_WINDOWS = (() => {
  const rand = rng(5);
  const out: { p: string; c: string; o: number }[] = [];
  for (const y of FLOORS) {
    // whole floors working late read better than salt-and-pepper noise
    const busy = rand() < 0.3;
    for (let i = 0; i < COLS; i++) {
      const roll = rand();
      // mostly dark: it's after hours on the exchange
      if (roll > (busy ? 0.5 : 0.07)) continue;
      const x = -TW + i * BAY;
      out.push({
        p: wallZ(TZ, x + 0.35, x + BAY - 0.35, y + 0.5, y + 2.9),
        c: rand() < 0.35 ? "#f4a640" : "#dfe6f2",
        o: r1(0.35 + rand() * 0.45),
      });
    }
  }
  return out;
})();

/* ---------- the street ---------- */

type Bldg = { side: -1 | 1; z0: number; z1: number; h: number; seed: number };
const STREET = 11; // facades stand 11 m either side of the road centre
const CURB = 8.4;
const BUILDINGS: Bldg[] = [
  { side: -1, z0: 30, z1: 55, h: 25, seed: 21 },
  { side: -1, z0: 2.5, z1: 30, h: 19, seed: 22 },
  { side: 1, z0: 24, z1: 55, h: 18, seed: 23 },
  { side: 1, z0: 2.5, z1: 24, h: 23, seed: 24 },
];

function facade(b: Bldg) {
  const X = b.side * STREET;
  const rand = rng(b.seed);
  const windows: { p: string; lit: boolean; o: number }[] = [];
  for (let y = 4.6; y + 2.6 < b.h - 1.4; y += 3.7) {
    for (let z = b.z0 + 1; z + 1.6 < b.z1 - 0.6; z += 3.4) {
      const lit = rand() < 0.2;
      windows.push({ p: wallX(X, y + 0.5, y + 2.7, z, z + 1.5), lit, o: r1(0.45 + rand() * 0.4) });
    }
  }
  const courses = [4.2, ...Array.from({ length: 6 }, (_, k) => 4.2 + (k + 1) * 3.7)].filter((y) => y < b.h - 1);
  const bays: string[] = [];
  for (let z = b.z0 + 0.6; z + 2.8 < b.z1; z += 3.4) bays.push(wallX(X, 0.2, 3.4, z, z + 2.8));
  return {
    wall: wallX(X, 0, b.h, b.z0, b.z1),
    cornice: wallX(X, b.h - 1.1, b.h, b.z0, b.z1),
    ledge: [P(X, b.h - 1.1, b.z0), P(X, b.h - 1.1, b.z1)] as const,
    courses: courses.map((y) => [P(X, y, b.z0), P(X, y, b.z1)] as const),
    windows,
    bays,
  };
}
const FACADES = BUILDINGS.map(facade);
// the taller far building on the left shows its end wall above its shorter neighbour
const END_WALL = wallZ(30, -24, -STREET, 0, 25);

/* Sodium lamps on the pavements: [side, depth]. Far ones first so near ones paint over. */
const LAMPS = ([
  [1, 46],
  [-1, 34],
  [1, 22],
  [-1, 13],
] as const).map(([side, z]) => {
  const pole = side * 9.7;
  const head = side * 7.7;
  const c = P(head, 7.05, z);
  const depth = (7.05 - EYE) * SIN + z * COS;
  const g = P(head, 0, z);
  const gl = P(head - 4.5, 0, z);
  const gr = P(head + 4.5, 0, z);
  const gn = P(head, 0, z - 4.5);
  const gf = P(head, 0, z + 4.5);
  return {
    pole: [P(pole, 0, z), P(pole, 7.3, z)] as const,
    arm: [P(pole, 7.3, z), P(head, 7.3, z)] as const,
    head: c,
    glow: r1((F * 3.2) / depth),
    pool: { cx: g[0], cy: r1((gn[1] + gf[1]) / 2), rx: r1((gr[0] - gl[0]) / 2), ry: r1((gn[1] - gf[1]) / 2) },
    w: r1(Math.max(1.2, (F * 0.16) / depth)),
  };
});

/*
 * Kaali-peeli taxis (Premier Padmini proportions), built from boxes so they sit
 * in the same perspective as the street. We only draw the faces the camera can
 * see: the end facing us, the flank facing the road centre, and tops below eye level.
 */
type Face = { p: string; fill: string; o?: number };
function taxi(xc: number, z0: number, facingUs: boolean): Face[] {
  const L = 3.8;
  const hw = 0.78;
  const x0 = xc - hw;
  const x1 = xc + hw;
  const sx = xc < 0 ? x1 : x0; // flank facing the road centre
  const cx0 = x0 + 0.1;
  const cx1 = x1 - 0.1;
  const csx = xc < 0 ? cx1 : cx0;
  // cabin sits nearer the boot end; the long bonnet points away when the car faces away
  const c0 = facingUs ? z0 + 1.2 : z0 + 0.8;
  const c1 = facingUs ? z0 + 3.0 : z0 + 2.6;
  const belt = 0.95;
  const roof = 1.45;
  const faces: Face[] = [
    { p: flat(belt, x0, x1, z0, z0 + L), fill: "#16161b" },
    { p: wallX(sx, 0.25, belt, z0, z0 + L), fill: "#0d0d11" },
    // sodium catching the shoulder line
    { p: wallX(sx, belt - 0.07, belt, z0, z0 + L), fill: "#f4a640", o: 0.45 },
    { p: wallZ(z0, x0, x1, 0.25, belt), fill: "#0a0a0d" },
    { p: wallX(csx, belt, roof, c0, c1), fill: "#0b1020" },
    { p: wallX(csx, belt + 0.05, roof - 0.14, c0 + 0.15, (c0 + c1) / 2 - 0.05), fill: "#1b2538" },
    { p: wallX(csx, belt + 0.05, roof - 0.14, (c0 + c1) / 2 + 0.05, c1 - 0.15), fill: "#1b2538" },
    { p: wallZ(c0, cx0, cx1, belt, roof), fill: "#0b1020" },
    { p: wallZ(c0, cx0 + 0.1, cx1 - 0.1, belt + 0.05, roof - 0.14), fill: "#202c44" },
    // the yellow: roof and a band round its edge
    { p: wallX(csx, roof - 0.13, roof, c0, c1), fill: "#d9ab1f" },
    { p: wallZ(c0, cx0, cx1, roof - 0.13, roof), fill: "#e8b922" },
    { p: flat(roof, cx0, cx1, c0, c1), fill: "#f3c623" },
  ];
  if (facingUs) {
    faces.push(
      { p: wallZ(z0, x0 + 0.12, x0 + 0.36, 0.55, 0.78), fill: "#efe8d8", o: 0.5 },
      { p: wallZ(z0, x1 - 0.36, x1 - 0.12, 0.55, 0.78), fill: "#efe8d8", o: 0.5 },
      { p: wallZ(z0, xc - 0.3, xc + 0.3, 0.5, 0.8), fill: "#2a2a30" },
    );
  } else {
    faces.push(
      { p: wallZ(z0, x0 + 0.08, x0 + 0.3, 0.6, 0.82), fill: "#e0443a", o: 0.85 },
      { p: wallZ(z0, x1 - 0.3, x1 - 0.08, 0.6, 0.82), fill: "#e0443a", o: 0.85 },
      { p: wallZ(z0, xc - 0.25, xc + 0.25, 0.38, 0.52), fill: "#f3c623", o: 0.8 },
    );
  }
  // wheels: circles on the flank plane, projected point by point
  for (const wz of [z0 + 0.7, z0 + L - 0.7]) {
    const ring: V[] = [];
    for (let k = 0; k < 14; k++) {
      const a = (k / 14) * Math.PI * 2;
      ring.push(P(sx, 0.31 + 0.31 * Math.sin(a), wz + 0.31 * Math.cos(a)));
    }
    faces.push({ p: pts(...ring), fill: "#050507" });
  }
  return faces;
}
const TAXIS = [taxi(7.3, 30, true), taxi(-7.3, 25, false), taxi(-7.3, 15.5, false)];

/* ---------- distance ---------- */

const SKYLINE = (() => {
  const rand = rng(41);
  const out: { x: number; w: number; top: number }[] = [];
  for (let x = 380; x < 1240; ) {
    const w = 18 + rand() * 46;
    out.push({ x: r1(x), w: r1(w), top: r1(HORIZON - 30 - rand() * 90) });
    x += w + rand() * 6;
  }
  return out;
})();
const STARS = (() => {
  const rand = rng(9);
  return Array.from({ length: 40 }, () => ({ x: r1(rand() * 1600), y: r1(rand() * 420), r: r1(0.5 + rand()), o: r1(0.2 + rand() * 0.5) }));
})();

/* ---------- ticker ---------- */

const TICK = (() => {
  const tl = P(-PODIUM.w, TICKER.y1, PODIUM.z);
  const br = P(PODIUM.w, TICKER.y0, PODIUM.z);
  const h = br[1] - tl[1];
  const fs = r1(h * 0.58);
  const cw = fs * 0.62; // fixed advance per glyph, enforced with textLength below
  const rand = rng(77);
  const items: { x: number; word: string; num: string; up: boolean; ww: number; nw: number }[] = [];
  let x = 0;
  for (const word of offTheClock.scenes.bse.ticker) {
    const up = rand() < 0.65;
    const pct = (0.2 + rand() * 2.6).toFixed(2);
    const val = (800 + rand() * 72000).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const num = `${val} ${up ? "+" : "-"}${pct}%`;
    const ww = r1(word.length * cw);
    const nw = r1(num.length * cw);
    items.push({ x: r1(x), word, num, up, ww, nw });
    x += ww + fs * 1.6 + nw + fs * 2.4;
  }
  return { items, x0: tl[0], y0: tl[1], w: r1(br[0] - tl[0]), h: r1(h), fs, copy: r1(x), base: r1(tl[1] + h * 0.72) };
})();
const COPIES = Math.ceil(TICK.w / TICK.copy) + 1;

const MONO = { fontFamily: "var(--font-mono), ui-monospace, monospace", fontWeight: 600 } as const;

/* CSS keyframes in a <style> tag because Tailwind v4 strips unlayered @keyframes from globals.css. */
const CSS = `
@keyframes bse-tick { to { transform: translateX(-${TICK.copy}px); } }
@keyframes bse-blink { 0%, 62%, 100% { opacity: 0.15; } 70%, 82% { opacity: 1; } }
.bse-tick { animation: bse-tick ${r1(TICK.copy / 55)}s linear infinite; }
.bse-blink { animation: bse-blink 2.2s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .bse-tick, .bse-blink { animation: none; } }
`;

export function BseScene({ active }: { active: boolean }) {
  const reduce = useReducedMotion();
  const play = { animationPlayState: active && !reduce ? "running" : "paused" } as const;

  const shaftL = P(-TW, PODIUM.h, TZ);
  const shaftTL = P(-TW, SHAFT_TOP, TZ);
  const crownTL = P(-CROWN.w, CROWN.y1, CROWN.z);
  const crownBR = P(CROWN.w, CROWN.y0, CROWN.z);
  const crownBL = P(-CROWN.w, CROWN.y0, CROWN.z);
  const mastTop = P(0, 141, TZ);
  const towerBase = P(0, 0, PODIUM.z);

  return (
    <div className="absolute inset-0 overflow-hidden bg-night">
      <style>{CSS}</style>
      <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" className="h-full w-full" role="img" aria-label="The BSE tower on Dalal Street at night">
        <defs>
          <linearGradient id="bse-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#03050c" />
            <stop offset="0.6" stopColor="#0b1228" />
            <stop offset="1" stopColor="#1d2240" />
          </linearGradient>
          <radialGradient id="bse-moon" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#dfe6ff" stopOpacity="0.28" />
            <stop offset="1" stopColor="#dfe6ff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="bse-city" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#f4a640" stopOpacity="0.4" />
            <stop offset="1" stopColor="#f4a640" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="bse-lamp" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#ffd08a" stopOpacity="0.9" />
            <stop offset="0.12" stopColor="#f4a640" stopOpacity="0.45" />
            <stop offset="1" stopColor="#f4a640" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="bse-pool" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#f4a640" stopOpacity="0.38" />
            <stop offset="1" stopColor="#f4a640" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="bse-sign" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#8fb0ff" stopOpacity="0.35" />
            <stop offset="1" stopColor="#8fb0ff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="bse-shaft" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#2a3350" />
            <stop offset="0.12" stopColor="#1b2238" />
            <stop offset="1" stopColor="#141a2c" />
          </linearGradient>
          {/* street lamps wash the bottom of the tower amber, fading up the shaft */}
          <linearGradient id="bse-uplight" gradientUnits="userSpaceOnUse" x1="0" y1={towerBase[1]} x2="0" y2={P(0, 55, TZ)[1]}>
            <stop offset="0" stopColor="#f4a640" stopOpacity="0.32" />
            <stop offset="1" stopColor="#f4a640" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="bse-haze" gradientUnits="userSpaceOnUse" x1="0" y1={HORIZON - 260} x2="0" y2={HORIZON}>
            <stop offset="0" stopColor="#7d8db8" stopOpacity="0" />
            <stop offset="1" stopColor="#7d8db8" stopOpacity="0.22" />
          </linearGradient>
          <linearGradient id="bse-ground" gradientUnits="userSpaceOnUse" x1="0" y1={HORIZON} x2="0" y2="1000">
            <stop offset="0" stopColor="#161a2a" />
            <stop offset="1" stopColor="#07090f" />
          </linearGradient>
          <linearGradient id="bse-wall-l" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0c1120" />
            <stop offset="1" stopColor="#141621" />
          </linearGradient>
          {/* right-hand facades face the moon, so they sit a step lighter and cooler */}
          <linearGradient id="bse-wall-r" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1a2238" />
            <stop offset="1" stopColor="#1a1a24" />
          </linearGradient>
          <clipPath id="bse-ticker-clip">
            <rect x={TICK.x0} y={TICK.y0} width={TICK.w} height={TICK.h} />
          </clipPath>
          <pattern id="bse-dots" width="3" height="3" patternUnits="userSpaceOnUse">
            <rect width="3" height="3" fill="none" stroke="#020306" strokeWidth="0.9" />
          </pattern>
        </defs>

        {/* sky */}
        <rect width="1600" height="1000" fill="url(#bse-sky)" />
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#efe8d8" opacity={s.o} />
        ))}
        {/* moon high on the left, in the slot of sky between the roofs */}
        <circle cx="585" cy="96" r="110" fill="url(#bse-moon)" />
        <circle cx="585" cy="96" r="15" fill="#e9ecf5" />
        <circle cx="590" cy="93" r="13" fill="#d5dbea" opacity="0.5" />
        <ellipse cx="800" cy={HORIZON} rx="700" ry="220" fill="url(#bse-city)" />

        {/* far city, low and blue */}
        <g fill="#1a2140" opacity="0.85">
          {SKYLINE.map((b, i) => (
            <rect key={i} x={b.x} y={b.top} width={b.w} height={r1(HORIZON - b.top + 4)} />
          ))}
        </g>
        {/* mid-distance neighbours of the tower */}
        <polygon points={wallZ(160, -62, -26, 0, 38)} fill="#171e36" />
        <polygon points={wallZ(155, 26, 58, 0, 30)} fill="#1a2139" />

        {/* ---- the tower ---- */}
        <polygon points={wallZ(TZ, -TW, TW, PODIUM.h, SHAFT_TOP)} fill="url(#bse-shaft)" />
        {TOWER_WINDOWS.map((w, i) => (
          <polygon key={i} points={w.p} fill={w.c} opacity={w.o} />
        ))}
        <g stroke="#2e3858" strokeWidth="2.2">
          {FINS.map((f, i) => (
            <line key={i} x1={f.a[0]} y1={f.a[1]} x2={f.b[0]} y2={f.b[1]} />
          ))}
        </g>
        {/* moonlit left arris */}
        <line x1={shaftL[0]} y1={shaftL[1]} x2={shaftTL[0]} y2={shaftTL[1]} stroke="#c9d6ff" strokeOpacity="0.45" strokeWidth="2" />
        <polygon points={wallZ(TZ, -TW, TW, PODIUM.h, SHAFT_TOP)} fill="url(#bse-uplight)" />

        {/* crown: the wider head of the tower, its underside lit from the street */}
        <polygon points={flat(CROWN.y0, -CROWN.w, CROWN.w, CROWN.z, TZ)} fill="#6a5434" />
        <polygon points={wallZ(CROWN.z, -CROWN.w, CROWN.w, CROWN.y0, CROWN.y1)} fill="#121a30" />
        <polygon points={wallZ(CROWN.z, -CROWN.w, CROWN.w, CROWN.y0, CROWN.y0 + 1.2)} fill="#f4a640" opacity="0.35" />
        <polygon points={wallZ(CROWN.z, -CROWN.w, CROWN.w, CROWN.y1 - 1, CROWN.y1)} fill="#232c48" />
        <line x1={crownTL[0]} y1={crownTL[1]} x2={crownBL[0]} y2={crownBL[1]} stroke="#c9d6ff" strokeOpacity="0.4" strokeWidth="2" />
        <ellipse cx={(crownTL[0] + crownBR[0]) / 2} cy={(crownTL[1] + crownBR[1]) / 2} rx="120" ry="60" fill="url(#bse-sign)" />
        <text
          x={(crownTL[0] + crownBR[0]) / 2}
          y={r1(crownBR[1] - (crownBR[1] - crownTL[1]) * 0.26)}
          textAnchor="middle"
          fontSize={r1((crownBR[1] - crownTL[1]) * 0.58)}
          fill="#eef2ff"
          textLength={r1((crownBR[0] - crownTL[0]) * 0.5)}
          lengthAdjust="spacingAndGlyphs"
          style={{ fontFamily: "var(--font-display), system-ui, sans-serif", fontWeight: 800, letterSpacing: "0.04em" }}
        >
          BSE
        </text>
        <polygon points={wallZ(TZ, -CROWN.w + 3, CROWN.w - 3, CROWN.y1, CROWN.y1 + 3)} fill="#0e1427" />
        <line x1={P(0, CROWN.y1 + 3, TZ)[0]} y1={P(0, CROWN.y1 + 3, TZ)[1]} x2={mastTop[0]} y2={mastTop[1]} stroke="#2a3352" strokeWidth="2.5" />
        <circle cx={mastTop[0]} cy={mastTop[1]} r="10" fill="#ff4a3d" opacity="0.25" className="bse-blink" style={play} />
        <circle cx={mastTop[0]} cy={mastTop[1]} r="2.6" fill="#ff5a4e" />

        {/* podium: lit lobby, then the LED ticker band */}
        <polygon points={wallZ(PODIUM.z, -PODIUM.w, PODIUM.w, 0, PODIUM.h)} fill="#151b2e" />
        <polygon points={wallZ(PODIUM.z, -PODIUM.w + 2, PODIUM.w - 2, 0, 6.2)} fill="#f4a640" opacity="0.38" />
        <g stroke="#151b2e" strokeWidth="5">
          {Array.from({ length: 9 }, (_, i) => {
            const x = -PODIUM.w + 2 + i * ((PODIUM.w * 2 - 4) / 8);
            const a = P(x, 0, PODIUM.z);
            const b = P(x, 6.2, PODIUM.z);
            return <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />;
          })}
        </g>
        <polygon points={wallZ(PODIUM.z, -PODIUM.w, PODIUM.w, 0, PODIUM.h)} fill="url(#bse-uplight)" />
        <rect x={TICK.x0 - 4} y={TICK.y0 - 4} width={TICK.w + 8} height={TICK.h + 8} fill="#020306" />
        <g clipPath="url(#bse-ticker-clip)">
          <g className="bse-tick" style={{ ...play, ...MONO }}>
            {Array.from({ length: COPIES }, (_, c) => tickerCopy(c * TICK.copy))}
          </g>
          <rect x={TICK.x0} y={TICK.y0} width={TICK.w} height={TICK.h} fill="url(#bse-dots)" />
        </g>

        {/* air between us and the tower */}
        <rect x="0" y={HORIZON - 260} width="1600" height="262" fill="url(#bse-haze)" />

        {/* ---- the street ---- */}
        <rect x="0" y={HORIZON} width="1600" height={1000 - HORIZON} fill="url(#bse-ground)" />
        <polygon points={flat(0, -STREET, -CURB, 2.5, 60)} fill="#1b1e2b" />
        <polygon points={flat(0, CURB, STREET, 2.5, 60)} fill="#1d202d" />
        <g stroke="#efe8d8" strokeOpacity="0.14" strokeWidth="1.5">
          <line x1={P(-CURB, 0, 2.5)[0]} y1={P(-CURB, 0, 2.5)[1]} x2={P(-CURB, 0, 60)[0]} y2={P(-CURB, 0, 60)[1]} />
          <line x1={P(CURB, 0, 2.5)[0]} y1={P(CURB, 0, 2.5)[1]} x2={P(CURB, 0, 60)[0]} y2={P(CURB, 0, 60)[1]} />
        </g>
        {/* centre dashes, foreshortening toward the tower */}
        <g fill="#efe8d8" opacity="0.16">
          {[4, 10, 16, 22, 28, 34, 40, 46].map((z) => (
            <polygon key={z} points={flat(0, -0.08, 0.08, z, z + 2.6)} />
          ))}
        </g>
        {LAMPS.map((l, i) => (
          <ellipse key={i} cx={l.pool.cx} cy={l.pool.cy} rx={l.pool.rx} ry={l.pool.ry} fill="url(#bse-pool)" />
        ))}

        {/* old stone buildings in shadow */}
        <polygon points={END_WALL} fill="#10162a" />
        {BUILDINGS.map((b, i) => {
          const f = FACADES[i];
          return (
            <g key={i}>
              <polygon points={f.wall} fill={b.side < 0 ? "url(#bse-wall-l)" : "url(#bse-wall-r)"} />
              {f.windows.map((w, k) => (
                <polygon key={k} points={w.p} fill={w.lit ? "#f4a640" : "#05070e"} opacity={w.lit ? w.o : 0.75} />
              ))}
              {f.bays.map((p, k) => (
                <polygon key={k} points={p} fill="#07090f" opacity="0.8" />
              ))}
              <g stroke="#efe8d8" strokeOpacity="0.06" strokeWidth="1.5">
                {f.courses.map(([a, c], k) => (
                  <line key={k} x1={a[0]} y1={a[1]} x2={c[0]} y2={c[1]} />
                ))}
              </g>
              <polygon points={f.cornice} fill="#222a40" />
              <line x1={f.ledge[0][0]} y1={f.ledge[0][1]} x2={f.ledge[1][0]} y2={f.ledge[1][1]} stroke="#9aa8cc" strokeOpacity="0.3" strokeWidth="2" />
            </g>
          );
        })}

        {/* taxis, far to near */}
        {TAXIS.map((faces, i) => (
          <g key={i}>
            {faces.map((f, k) => (
              <polygon key={k} points={f.p} fill={f.fill} opacity={f.o} />
            ))}
          </g>
        ))}

        {/* lamps */}
        {LAMPS.map((l, i) => (
          <g key={i}>
            <line x1={l.pole[0][0]} y1={l.pole[0][1]} x2={l.pole[1][0]} y2={l.pole[1][1]} stroke="#07090f" strokeWidth={l.w * 2} />
            <line x1={l.arm[0][0]} y1={l.arm[0][1]} x2={l.arm[1][0]} y2={l.arm[1][1]} stroke="#07090f" strokeWidth={l.w * 1.4} />
            <circle cx={l.head[0]} cy={l.head[1]} r={l.glow} fill="url(#bse-lamp)" />
            <ellipse cx={l.head[0]} cy={l.head[1]} rx={r1(l.w * 3.2)} ry={r1(l.w * 1.4)} fill="#ffe2b0" />
          </g>
        ))}
      </svg>
    </div>
  );
}

/* One copy of the tape, offset by `dx`, so the loop can butt copies together seamlessly. */
function tickerCopy(dx: number) {
  return (
    <g key={dx} transform={`translate(${r1(TICK.x0 + 10 + dx)} 0)`}>
      {TICK.items.map((it) => {
        const ax = r1(it.x + it.ww + TICK.fs * 0.8);
        const ay = r1(TICK.base - TICK.fs * 0.36);
        const s = TICK.fs * 0.32;
        const col = it.up ? "#3ddc84" : "#ff5a4e";
        return (
          <g key={it.word}>
            <text x={it.x} y={TICK.base} fontSize={TICK.fs} fill="#f4a640" textLength={it.ww} lengthAdjust="spacingAndGlyphs">
              {it.word}
            </text>
            <path
              d={it.up ? `M${ax - s} ${r1(ay + s * 0.7)} L${ax + s} ${r1(ay + s * 0.7)} L${ax} ${r1(ay - s * 0.8)} Z` : `M${ax - s} ${r1(ay - s * 0.7)} L${ax + s} ${r1(ay - s * 0.7)} L${ax} ${r1(ay + s * 0.8)} Z`}
              fill={col}
            />
            <text x={r1(it.x + it.ww + TICK.fs * 1.6)} y={TICK.base} fontSize={TICK.fs} fill={col} textLength={it.nw} lengthAdjust="spacingAndGlyphs">
              {it.num}
            </text>
          </g>
        );
      })}
    </g>
  );
}
