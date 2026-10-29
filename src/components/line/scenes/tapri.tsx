"use client";

import type { CSSProperties, ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { offTheClock } from "@/lib/content";

/*
 * Tapri at night: a roadside chai counter under one bare bulb, six drinks in a
 * row with chalk labels on the counter's blackboard front.
 *
 * Framing: viewBox 1200x1000 rendered with "slice". A 16:10 card shows roughly
 * y 125..875 and a 4:5 phone card shows roughly x 200..1000, so the drinks,
 * labels and MENU board all live inside x 220..980 / y 140..860.
 *
 * Light: one bulb at (BULB_X, BULB_Y), top left. Every highlight sits on the
 * left of an object and every shadow falls to the right, growing with distance
 * from the bulb, so the scene reads as lit by a single source.
 *
 * Motion: CSS keyframes injected by a local <style> (Tailwind v4 can strip
 * unlayered keyframes from globals.css, and this file is the only owner).
 * Animations only attach while `active` and motion is allowed; otherwise the
 * still frame shows steam at rest and the bulb steady.
 */

const BULB_X = 300;
const BULB_Y = 196;
const BASE_Y = 720; // where the drinks touch the counter
const XS = [250, 390, 530, 670, 810, 950]; // centred on 600 so a 4:5 crop (x 200..1000) keeps all six
const DRINK_SCALE = 1.3; // drinks are drawn at a base size, then scaled up so they own the frame

// Seeded PRNG so SSR and client draw identical condensation and bokeh.
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

// Rounded so the SSR string and the client string of every attribute match exactly.
const q = (n: number) => Math.round(n * 100) / 100;
const r = rng(1907);
const LABEL_TILT = XS.map(() => q((r() - 0.5) * 5));
const CONDENSATION = Array.from({ length: 16 }, () => ({ x: q(-26 + r() * 50), y: q(-140 + r() * 128), s: q(0.8 + r() * 1.6) }));
const FLECKS = Array.from({ length: 9 }, () => ({ x: q(-20 + r() * 40), y: q(-1.8 + r() * 3.6), a: q(r() * 180) }));
const BOKEH = Array.from({ length: 22 }, () => ({
  x: q(r() * 1200),
  y: q(380 + r() * 200),
  rad: q(10 + r() * 34),
  warm: r() > 0.3,
  o: q(0.12 + r() * 0.28),
}));

const CSS = `
@keyframes tp-steam {
  0% { transform: translateY(8px) scale(0.85, 0.7); opacity: 0; }
  30% { opacity: 0.6; }
  100% { transform: translateY(-38px) scale(1.2, 1.05); opacity: 0; }
}
@keyframes tp-flicker {
  0%, 41%, 46%, 80%, 100% { opacity: 1; }
  42% { opacity: 0.78; } 43% { opacity: 0.96; } 44% { opacity: 0.84; }
  78% { opacity: 0.95; } 79% { opacity: 0.88; }
}
@keyframes tp-taxi {
  0% { transform: translateX(760px); }
  45%, 100% { transform: translateX(-1000px); }
}
.tp-on .tp-steam { animation: tp-steam 3.8s ease-out infinite; }
.tp-on .tp-flicker { animation: tp-flicker 6.5s linear infinite; }
/* that negative delay is where the 0..45% sweep crosses translateX(0), so switching on continues from the still frame */
.tp-on .tp-taxi { animation: tp-taxi 13s linear -2.53s infinite; }
`;

const fromBase: CSSProperties = { transformBox: "fill-box", transformOrigin: "50% 100%" };

export function TapriScene({ active }: { active: boolean }) {
  const reduce = useReducedMotion();
  const on = active && !reduce;
  const menu = offTheClock.scenes.tapri.menu;

  return (
    <div className="absolute inset-0 bg-night" aria-hidden>
      <style>{CSS}</style>
      <svg
        viewBox="0 0 1200 1000"
        preserveAspectRatio="xMidYMid slice"
        className={"h-full w-full" + (on ? " tp-on" : "")}
      >
        <Defs />

        {/* ---------- far: the street beyond the stall, out of focus ---------- */}
        <rect width="1200" height="720" fill="url(#tp-street)" />
        <g filter="url(#tp-blur-far)" opacity="0.9">
          {/* building masses across the road, cool and low contrast because they are far */}
          <path d="M-20 470 V250 h150 v-40 h120 v90 h140 V180 h110 v120 h160 v-70 h150 v160 h140 V210 h120 v260 Z" fill="#141c30" />
          {[
            [70, 300], [210, 270], [250, 330], [430, 230], [470, 300], [640, 340], [690, 290], [880, 360], [1010, 260], [1050, 330],
          ].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width="22" height="16" fill={i % 3 ? "#f4a640" : "#ffcf7a"} opacity={0.18 + (i % 4) * 0.06} />
          ))}
          <rect x="-20" y="470" width="1240" height="140" fill="#0c1222" />
        </g>
        {/* street lights and shopfronts as bokeh discs: gradients, no filter, cheap */}
        {BOKEH.map((b, i) => (
          <circle key={i} cx={b.x} cy={b.y} r={b.rad} fill={b.warm ? "url(#tp-bokeh-warm)" : "url(#tp-bokeh-cool)"} opacity={b.o} />
        ))}

        {/* passing kaali-peeli taxi, blurred by distance, parked mid-frame in the still, crossing right to left now and then when active */}
        <g className="tp-taxi">
          <g transform="translate(560 0)" filter="url(#tp-blur-taxi)">
            <path d="M0 560 q4 -26 30 -30 l40 -4 q14 -26 46 -28 h70 q30 2 44 28 l30 4 q22 4 24 30 v14 H0 Z" fill="#0b0d12" />
            <path d="M74 526 q14 -24 42 -26 h66 q28 2 40 26 Z" fill="#f3c623" opacity="0.85" />
            <rect x="120" y="491" width="40" height="8" rx="2" fill="#f3c623" />
            <circle cx="10" cy="556" r="9" fill="#fff1c9" />
            <circle cx="236" cy="556" r="8" fill="#ff3b2e" />
          </g>
          <ellipse cx="540" cy="560" rx="70" ry="20" fill="url(#tp-bokeh-warm)" opacity="0.7" />
        </g>

        {/* ---------- stall frame: tin awning edge and a wooden post ---------- */}
        <path d={awning(false)} fill="#0d1220" />
        <path d={awning(true)} fill="none" stroke="#ffcf7a" strokeOpacity="0.22" strokeWidth="2" />
        <rect x="70" y="40" width="34" height="710" fill="url(#tp-post)" />

        {/* ---------- MENU board, tin-framed chalkboard hung right of the bulb ---------- */}
        <MenuBoard />

        {/* ---------- counter top ---------- */}
        <path d="M-20 642 H1220 V742 H-20 Z" fill="url(#tp-wood)" />
        {/* grain: a few long strokes */}
        {[658, 676, 693, 711, 729].map((y, i) => (
          <path key={y} d={`M-20 ${y} C 300 ${y - 4 + i}, 700 ${y + 5}, 1220 ${y - 2}`} fill="none" stroke="#000" strokeOpacity="0.22" strokeWidth="1.4" />
        ))}
        <rect x="-20" y="642" width="1240" height="100" fill="url(#tp-pool)" />
        {/* back edge in shade, front steel lip catching light */}
        <rect x="-20" y="638" width="1240" height="6" fill="#06080e" opacity="0.7" />
        <rect x="-20" y="736" width="1240" height="12" fill="url(#tp-lip)" />

        {/* ---------- shadows: fall right, longer the further from the bulb (blurred once, static) ---------- */}
        <g filter="url(#tp-blur-shadow)" fill="#030409">
          {XS.map((x, i) => {
            const dx = (x - BULB_X) * 0.09;
            const w = [26, 34, 50, 34, 30, 32][i] * DRINK_SCALE;
            const len = [30, 60, 34, 22, 40, 56][i] * DRINK_SCALE;
            return <ellipse key={i} cx={x + dx + len * 0.5} cy={BASE_Y + 4} rx={w + len * 0.5} ry={7} opacity={0.55} />;
          })}
        </g>

        {/* ---------- the six drinks, same order as the menu ---------- */}
        <g transform={`translate(${XS[0]} ${BASE_Y}) scale(${DRINK_SCALE})`}>
          <CuttingChai />
          <Steam on={on} y={-82} delays={[0, 1.3, 2.5]} />
        </g>
        <g transform={`translate(${XS[1]} ${BASE_Y}) scale(${DRINK_SCALE})`}>
          <ColdCoffee />
        </g>
        <g transform={`translate(${XS[2]} ${BASE_Y}) scale(${DRINK_SCALE})`}>
          <Latte />
          <Steam on={on} y={-78} delays={[0.6, 1.9, 3.1]} />
        </g>
        <g transform={`translate(${XS[3]} ${BASE_Y}) scale(${DRINK_SCALE})`}>
          <Espresso />
          <Steam on={on} y={-44} delays={[0.3, 2.1]} small />
        </g>
        <g transform={`translate(${XS[4]} ${BASE_Y}) scale(${DRINK_SCALE})`}>
          <Chaas />
        </g>
        <g transform={`translate(${XS[5]} ${BASE_Y}) scale(${DRINK_SCALE})`}>
          <Lassi />
        </g>

        {/* ---------- counter front: blackboard strip with chalk labels ---------- */}
        <rect x="-20" y="748" width="1240" height="300" fill="url(#tp-slate)" />
        <g filter="url(#tp-chalk)" fill="#efe8d8" style={{ fontFamily: "var(--font-sans), system-ui, sans-serif" }}>
          {menu.map((label, i) => (
            <g key={label} transform={`translate(${XS[i]} 804) rotate(${LABEL_TILT[i]})`}>
              <text textAnchor="middle" fontSize="19" fontWeight="600" letterSpacing="0.4" opacity="0.88">
                {label}
              </text>
              <path d="M-30 12 q15 -4 30 0 t30 0" fill="none" stroke="#efe8d8" strokeWidth="1.6" strokeLinecap="round" opacity="0.45" />
            </g>
          ))}
        </g>
        <rect x="-20" y="748" width="1240" height="300" fill="url(#tp-pool-front)" />

        {/* ---------- the bulb ---------- */}
        <Bulb />

        {/* vignette last so it darkens everything, including the glow edges */}
        <rect width="1200" height="1000" fill="url(#tp-vignette)" />
      </svg>
    </div>
  );
}

/* Corrugated tin edge of the stall roof, as a zigzag. `edge` returns only the lit lower lip on the bulb side. */
function awning(edge: boolean) {
  const pts: string[] = [];
  for (let x = -20, i = 0; x <= (edge ? 520 : 1220); x += 30, i++) pts.push(`${x} ${i % 2 ? 66 : 58}`);
  return edge ? `M${pts.join(" L")}` : `M-20 0 H1220 V58 L${pts.reverse().join(" L")} Z`;
}

function Defs() {
  return (
    <defs>
      <linearGradient id="tp-street" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#070b16" />
        <stop offset="0.55" stopColor="#111a30" />
        <stop offset="1" stopColor="#1a1c26" />
      </linearGradient>
      <radialGradient id="tp-bokeh-warm">
        <stop offset="0" stopColor="#ffcf7a" stopOpacity="0.9" />
        <stop offset="0.6" stopColor="#f4a640" stopOpacity="0.45" />
        <stop offset="1" stopColor="#f4a640" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="tp-bokeh-cool">
        <stop offset="0" stopColor="#c9d4ee" stopOpacity="0.7" />
        <stop offset="0.6" stopColor="#8d93a6" stopOpacity="0.3" />
        <stop offset="1" stopColor="#8d93a6" stopOpacity="0" />
      </radialGradient>
      <filter id="tp-blur-far" x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur stdDeviation="7" />
      </filter>
      <filter id="tp-blur-taxi" x="-20%" y="-60%" width="140%" height="220%">
        <feGaussianBlur stdDeviation="5 3" />
      </filter>
      <filter id="tp-blur-shadow" x="-30%" y="-200%" width="160%" height="500%">
        <feGaussianBlur stdDeviation="5" />
      </filter>
      {/* chalk: wobble the edge and eat holes into the fill so it reads hand-written on slate */}
      <filter id="tp-chalk" x="-5%" y="-30%" width="110%" height="160%">
        <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="7" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="3" xChannelSelector="R" yChannelSelector="G" result="d" />
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -1.8 1.45" result="grain" />
        <feComposite in="d" in2="grain" operator="in" />
      </filter>
      <linearGradient id="tp-post" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#1b130d" />
        <stop offset="0.7" stopColor="#5a3b22" />
        <stop offset="1" stopColor="#2a1c12" />
      </linearGradient>
      <linearGradient id="tp-wood" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2a1a10" />
        <stop offset="1" stopColor="#4a2e19" />
      </linearGradient>
      {/* the bulb's pool on the counter: warm under it, gone by the right edge */}
      <radialGradient
        id="tp-pool"
        cx="340"
        cy="660"
        r="760"
        gradientUnits="userSpaceOnUse"
        gradientTransform="translate(340 690) scale(1 0.32) translate(-340 -690)"
      >
        <stop offset="0" stopColor="#ffcf7a" stopOpacity="0.5" />
        <stop offset="0.5" stopColor="#f4a640" stopOpacity="0.16" />
        <stop offset="1" stopColor="#f4a640" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="tp-lip" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#9a8c78" />
        <stop offset="0.25" stopColor="#efe8d8" />
        <stop offset="0.6" stopColor="#6d6658" />
        <stop offset="1" stopColor="#2a2a2e" />
      </linearGradient>
      <linearGradient id="tp-slate" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#151c1c" />
        <stop offset="1" stopColor="#0a0f12" />
      </linearGradient>
      <radialGradient id="tp-pool-front" cx="320" cy="750" r="700" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#ffcf7a" stopOpacity="0.12" />
        <stop offset="1" stopColor="#ffcf7a" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="tp-vignette" cx="560" cy="560" r="760" gradientUnits="userSpaceOnUse">
        <stop offset="0.45" stopColor="#070b16" stopOpacity="0" />
        <stop offset="1" stopColor="#070b16" stopOpacity="0.88" />
      </radialGradient>
      <radialGradient id="tp-glow" cx={BULB_X} cy={BULB_Y} r="520" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#ffcf7a" stopOpacity="0.45" />
        <stop offset="0.25" stopColor="#f4a640" stopOpacity="0.16" />
        <stop offset="1" stopColor="#f4a640" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="tp-bulb" cx="0.42" cy="0.4" r="0.6">
        <stop offset="0" stopColor="#fffaf0" />
        <stop offset="0.45" stopColor="#ffe3a8" />
        <stop offset="1" stopColor="#f4a640" />
      </radialGradient>
      <linearGradient id="tp-board" x1="0" y1="0" x2="1" y2="0.3">
        <stop offset="0" stopColor="#1f2a26" />
        <stop offset="1" stopColor="#101614" />
      </linearGradient>
      <linearGradient id="tp-tin" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#a08463" />
        <stop offset="0.4" stopColor="#6b5640" />
        <stop offset="1" stopColor="#2e261d" />
      </linearGradient>

      {/* drinks: left side always lit, right side always in shade */}
      <linearGradient id="tp-chai" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#d69a5c" />
        <stop offset="0.35" stopColor="#b0703a" />
        <stop offset="1" stopColor="#5e3417" />
      </linearGradient>
      <linearGradient id="tp-glass" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0.16" />
        <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.04" />
        <stop offset="1" stopColor="#ffffff" stopOpacity="0.1" />
      </linearGradient>
      <linearGradient id="tp-coldcoffee" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#c99a6c" />
        <stop offset="0.35" stopColor="#9b6a42" />
        <stop offset="1" stopColor="#5a3519" />
      </linearGradient>
      <linearGradient id="tp-side-shade" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#fff2d8" stopOpacity="0.22" />
        <stop offset="0.4" stopColor="#000" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity="0.45" />
      </linearGradient>
      <linearGradient id="tp-ceramic" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#fbf4e6" />
        <stop offset="0.4" stopColor="#e3d8c2" />
        <stop offset="0.85" stopColor="#8f8470" />
        <stop offset="1" stopColor="#5c5446" />
      </linearGradient>
      <radialGradient id="tp-crema" cx="0.4" cy="0.4" r="0.7">
        <stop offset="0" stopColor="#d49a5e" />
        <stop offset="0.7" stopColor="#a8682f" />
        <stop offset="1" stopColor="#6e3d17" />
      </radialGradient>
      <radialGradient id="tp-espresso" cx="0.4" cy="0.4" r="0.7">
        <stop offset="0" stopColor="#b8733a" />
        <stop offset="0.6" stopColor="#6e3a15" />
        <stop offset="1" stopColor="#2a1407" />
      </radialGradient>
      {/* steel: hot vertical streak where the bulb reflects, warm bounce on the far edge */}
      <linearGradient id="tp-steel" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#4a4f5c" />
        <stop offset="0.18" stopColor="#e9ecf2" />
        <stop offset="0.32" stopColor="#9aa0ad" />
        <stop offset="0.6" stopColor="#4b5160" />
        <stop offset="0.82" stopColor="#2b2f3a" />
        <stop offset="0.94" stopColor="#a38660" />
        <stop offset="1" stopColor="#3a3a40" />
      </linearGradient>
      <linearGradient id="tp-lassi" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#fbf3df" />
        <stop offset="0.5" stopColor="#ecdcb6" />
        <stop offset="1" stopColor="#a8936a" />
      </linearGradient>
      <linearGradient id="tp-steam-g" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stopColor="#efe8d8" stopOpacity="0.9" />
        <stop offset="1" stopColor="#efe8d8" stopOpacity="0" />
      </linearGradient>
    </defs>
  );
}

function MenuBoard() {
  return (
    <g transform="translate(700 150) rotate(1.5)">
      {/* hanging wires to the awning */}
      <path d="M30 -100 L40 0 M240 -100 L230 0" stroke="#2a2e38" strokeWidth="2" />
      <rect x="-8" y="-8" width="286" height="196" rx="4" fill="url(#tp-tin)" />
      {/* rust bloom at the bottom corner where rain sits */}
      <ellipse cx="250" cy="178" rx="40" ry="12" fill="#5a2c14" opacity="0.6" />
      <rect x="6" y="6" width="258" height="168" rx="2" fill="url(#tp-board)" />
      <g filter="url(#tp-chalk)" fill="#efe8d8">
        <text
          x="135"
          y="62"
          textAnchor="middle"
          fontSize="46"
          fontWeight="700"
          letterSpacing="6"
          opacity="0.92"
          style={{ fontFamily: "var(--font-display), system-ui, sans-serif" }}
        >
          MENU
        </text>
        <path d="M60 78 q75 -8 150 0" fill="none" stroke="#efe8d8" strokeWidth="2" opacity="0.55" />
        {/* scribbles stand in for item lines and prices: decoration, not copy */}
        {[100, 122, 144].map((y, i) => (
          <g key={y} opacity={0.32 - i * 0.05} stroke="#efe8d8" strokeWidth="2.4" strokeLinecap="round" fill="none">
            <path d={`M34 ${y} q20 -4 40 0 t40 0 t30 -2`} />
            <path d={`M190 ${y} h36`} />
          </g>
        ))}
      </g>
      {/* bulb light rakes the left of the board */}
      <rect x="6" y="6" width="258" height="168" fill="url(#tp-side-shade)" opacity="0.7" />
    </g>
  );
}

function Bulb() {
  const x = BULB_X;
  const y = BULB_Y;
  return (
    <g>
      <path d={`M${x} 0 V${y - 34}`} stroke="#0a0c12" strokeWidth="3" />
      {/* glow + filament flicker together, opacity only */}
      <g className="tp-flicker">
        <rect width="1200" height="1000" fill="url(#tp-glow)" />
        <circle cx={x} cy={y + 10} r="96" fill="url(#tp-bokeh-warm)" opacity="0.9" />
        {/* glass drawn at a base size and scaled from the socket so it hangs from the same point */}
        <g transform={`translate(${x} ${y - 18}) scale(1.45) translate(${-x} ${-(y - 18)})`}>
          <path
            d={`M${x - 9} ${y - 18} C${x - 26} ${y - 4} ${x - 22} ${y + 26} ${x} ${y + 28} C${x + 22} ${y + 26} ${x + 26} ${y - 4} ${x + 9} ${y - 18} Z`}
            fill="url(#tp-bulb)"
          />
          <path d={`M${x - 5} ${y + 8} q5 -12 10 0`} fill="none" stroke="#fff" strokeWidth="1.6" opacity="0.9" />
        </g>
      </g>
      <rect x={x - 12} y={y - 44} width="24" height="27" rx="3" fill="#1a1d24" />
      <rect x={x - 12} y={y - 44} width="7" height="27" rx="2" fill="#ffcf7a" opacity="0.25" />
    </g>
  );
}

/* Steam: two strokes per wisp (soft wide + thin core) instead of a blur filter,
   so the animated element never forces a filter re-render. */
function Steam({ on, y, delays, small }: { on: boolean; y: number; delays: number[]; small?: boolean }) {
  return (
    <g transform={`translate(0 ${y}) scale(${small ? 0.65 : 1})`}>
      {delays.map((d, i) => {
        const dx = (i - (delays.length - 1) / 2) * 12;
        const path = `M${dx} 0 C${dx - 10} -16 ${dx + 10} -30 ${dx} -46 C${dx - 10} -62 ${dx + 8} -74 ${dx + 2} -90`;
        return (
          <g
            key={i}
            className="tp-steam"
            // still frame keeps a visible wisp; when running, start hidden so the delay doesn't pop
            style={{ ...fromBase, animationDelay: `${d}s`, opacity: on ? 0 : 0.4 - i * 0.08 }}
          >
            <path d={path} fill="none" stroke="url(#tp-steam-g)" strokeWidth="10" strokeLinecap="round" opacity="0.18" />
            <path d={path} fill="none" stroke="url(#tp-steam-g)" strokeWidth="2.4" strokeLinecap="round" opacity="0.6" />
          </g>
        );
      })}
    </g>
  );
}

function GlassShell({ d, rimY, rimRx, children }: { d: string; rimY: number; rimRx: number; children?: ReactNode }) {
  return (
    <>
      {children}
      <path d={d} fill="url(#tp-glass)" stroke="#efe8d8" strokeOpacity="0.28" strokeWidth="1.4" />
      <ellipse cx="0" cy={rimY} rx={rimRx} ry={rimRx * 0.18} fill="none" stroke="#fff6e2" strokeOpacity="0.55" strokeWidth="1.6" />
    </>
  );
}

/* The ribbed cutting glass: short, flared, filled most of the way the way a tapri pours it. */
function CuttingChai() {
  const ribs = Array.from({ length: 9 }, (_, i) => -22 + i * 5.5);
  return (
    <g>
      <GlassShell d="M-20 0 L-27 -78 H27 L20 0 Z" rimY={-78} rimRx={27}>
        <path d="M-20.6 -8 L-25.4 -62 H25.4 L20.6 -8 Z" fill="url(#tp-chai)" />
        <ellipse cx="0" cy="-62" rx="25.4" ry="4.8" fill="#dcae78" />
        <ellipse cx="-4" cy="-62.5" rx="15" ry="2.4" fill="#ecc896" opacity="0.7" />
        <rect x="-20" y="-9" width="40" height="9" fill="#efe8d8" opacity="0.12" />
      </GlassShell>
      {ribs.map((x) => (
        <path key={x} d={`M${x} -76 L${q(x * 0.76)} -2`} stroke="#fff" strokeOpacity={x < 0 ? 0.2 : 0.08} strokeWidth="1.2" />
      ))}
      <path d="M-22 -6 L-26 -72 H-20 L-16.5 -6 Z" fill="#fff8e8" opacity="0.28" />
    </g>
  );
}

/* Tall cold coffee: ice riding high, cream layer on top, condensation beads. */
function ColdCoffee() {
  return (
    <g>
      {/* straw sits behind the near glass wall */}
      <path d="M8 -150 L30 -244" stroke="#f4a640" strokeWidth="7" strokeLinecap="round" />
      <path d="M6 -150 L28 -244" stroke="#ffe3a8" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <GlassShell d="M-27 0 L-34 -190 H34 L27 0 Z" rimY={-190} rimRx={34}>
        <path d="M-27.6 -8 L-33 -160 H33 L27.6 -8 Z" fill="url(#tp-coldcoffee)" />
        {/* milk swirl sinking through the coffee */}
        <path d="M-24 -120 C-6 -110 10 -126 26 -108 C10 -96 -10 -104 -22 -86" fill="none" stroke="#e6c49c" strokeWidth="6" opacity="0.35" strokeLinecap="round" />
        <path d="M-33 -160 H33 L32.4 -146 H-32.4 Z" fill="#e8cfa9" />
        <ellipse cx="0" cy="-160" rx="33" ry="5.6" fill="#f2dfbf" />
        {/* ice: translucent blocks with lit top-left edges */}
        {[
          [-18, -156, -12],
          [6, -150, 14],
          [-6, -128, 6],
        ].map(([x, y, a], i) => (
          <g key={i} transform={`translate(${x} ${y}) rotate(${a})`}>
            <rect x="-11" y="-11" width="22" height="20" rx="4" fill="#fff" fillOpacity="0.16" stroke="#fff" strokeOpacity="0.45" strokeWidth="1.2" />
            <path d="M-8 -8 h10" stroke="#fff" strokeOpacity="0.7" strokeWidth="1.6" strokeLinecap="round" />
          </g>
        ))}
        <path d="M-27.6 -8 L-33 -160 H33 L27.6 -8 Z" fill="url(#tp-side-shade)" />
      </GlassShell>
      {CONDENSATION.map((c, i) => (
        <circle key={i} cx={q(c.x * (1 + c.y / 1400))} cy={c.y} r={c.s} fill="#fff" opacity={c.x < 0 ? 0.45 : 0.2} />
      ))}
      <path d="M-29 -6 L-34 -182 H-27 L-22.5 -6 Z" fill="#fff8e8" opacity="0.22" />
    </g>
  );
}

/* Latte: seen from just above so the heart reads; heart drawn flat then squashed into the cup's ellipse. */
function Latte() {
  return (
    <g>
      <ellipse cx="2" cy="-4" rx="54" ry="11" fill="url(#tp-ceramic)" />
      <ellipse cx="2" cy="-6" rx="40" ry="7" fill="#000" opacity="0.18" />
      <path d="M38 -52 C62 -54 62 -22 32 -22" fill="none" stroke="url(#tp-ceramic)" strokeWidth="8" strokeLinecap="round" />
      <path d="M-40 -62 C-40 -22 -28 -8 0 -8 C28 -8 40 -22 40 -62 Z" fill="url(#tp-ceramic)" />
      <ellipse cx="0" cy="-62" rx="40" ry="11.5" fill="#efe6d2" />
      <ellipse cx="0" cy="-61.5" rx="35.5" ry="9.2" fill="url(#tp-crema)" />
      <ellipse cx="0" cy="-61.5" rx="35.5" ry="9.2" fill="none" stroke="#f0dcb8" strokeWidth="2.2" opacity="0.7" />
      <g transform="translate(0 -61.5) scale(1 0.3)">
        <path d="M0 22 C-26 4 -26 -22 -11 -22 C-4 -22 0 -16 0 -11 C0 -16 4 -22 11 -22 C26 -22 26 4 0 22 Z" fill="#f6ead3" />
        <path d="M0 22 L0 30" stroke="#f6ead3" strokeWidth="3" strokeLinecap="round" />
      </g>
      <path d="M-36 -56 C-34 -30 -26 -16 -12 -11" fill="none" stroke="#fff" strokeWidth="3" opacity="0.5" strokeLinecap="round" />
    </g>
  );
}

/* Espresso: tiny cup, dark crema, a spoon resting on the saucer. */
function Espresso() {
  return (
    <g>
      <ellipse cx="2" cy="-3" rx="38" ry="8" fill="url(#tp-ceramic)" />
      <path d="M-34 -6 L-10 -10" stroke="#c9cdd6" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="-36" cy="-5.6" rx="5" ry="2.6" fill="#d9dde4" />
      <path d="M19 -30 C32 -30 32 -14 16 -14" fill="none" stroke="url(#tp-ceramic)" strokeWidth="5" strokeLinecap="round" />
      <path d="M-21 -36 C-21 -14 -13 -6 0 -6 C13 -6 21 -14 21 -36 Z" fill="url(#tp-ceramic)" />
      <ellipse cx="0" cy="-36" rx="21" ry="6" fill="#efe6d2" />
      <ellipse cx="0" cy="-35.6" rx="18" ry="4.6" fill="url(#tp-espresso)" />
      <ellipse cx="-4" cy="-36.4" rx="6" ry="1.4" fill="#e3a568" opacity="0.6" />
      <path d="M-18 -31 C-17 -18 -12 -11 -5 -9" fill="none" stroke="#fff" strokeWidth="2" opacity="0.5" strokeLinecap="round" />
    </g>
  );
}

/* Chaas in a steel tumbler: the steel carries the bulb as a hot vertical streak. */
function Chaas() {
  return (
    <g>
      <path d="M-24 0 L-29 -104 H29 L24 0 Z" fill="url(#tp-steel)" />
      {/* pressed rings, as on every tapri tumbler */}
      {[-16, -92].map((y) => {
        const half = q(24 + (-y / 104) * 5);
        return (
          <g key={y}>
            <path d={`M${-half} ${y} H${half}`} stroke="#000" strokeOpacity="0.35" strokeWidth="2" />
            <path d={`M${-half} ${y + 2} H${half}`} stroke="#fff" strokeOpacity="0.2" strokeWidth="1" />
          </g>
        );
      })}
      <ellipse cx="0" cy="-104" rx="29" ry="5.8" fill="#c7ccd6" />
      <ellipse cx="0" cy="-103.4" rx="26.4" ry="4.6" fill="#e9e6d2" />
      <ellipse cx="4" cy="-103" rx="18" ry="2.6" fill="#d5dcc0" opacity="0.6" />
      {FLECKS.map((f, i) => {
        const fy = q(-103.4 + f.y);
        return <rect key={i} x={q(f.x - 1.4)} y={q(fy - 0.6)} width="2.8" height="1.2" rx="0.6" fill="#4f8a3c" transform={`rotate(${f.a} ${f.x} ${fy})`} />;
      })}
      {/* a single coriander leaf floating */}
      <path d="M-6 -104 c4 -4 10 -3 12 0 c-4 3 -9 3 -12 0 Z" fill="#5f9a3e" />
      <path d="M-6 -104 h12" stroke="#2f5a22" strokeWidth="0.6" />
      <circle cx="9" cy="-102.6" r="1" fill="#6b4a2a" />
      <circle cx="-14" cy="-103.8" r="0.9" fill="#6b4a2a" />
    </g>
  );
}

/* Lassi: tall glass, thick malai heaped over the rim, saffron and pista on top. */
function Lassi() {
  return (
    <g>
      <GlassShell d="M-25 0 L-32 -176 H32 L25 0 Z" rimY={-176} rimRx={32}>
        <path d="M-25.6 -8 L-31.6 -170 H31.6 L25.6 -8 Z" fill="url(#tp-lassi)" />
        <path d="M-25.6 -8 L-31.6 -170 H31.6 L25.6 -8 Z" fill="url(#tp-side-shade)" opacity="0.6" />
      </GlassShell>
      {/* malai: lumpy cap, lit from the top left, shaded beneath */}
      <path
        d="M-34 -172 C-38 -182 -30 -192 -20 -190 C-16 -202 -2 -204 4 -196 C10 -206 26 -202 26 -192 C36 -192 40 -180 33 -172 C20 -166 -20 -166 -34 -172 Z"
        fill="#fbf3df"
      />
      <path d="M-34 -172 C-20 -166 20 -166 33 -172 C24 -168 -22 -168 -34 -172 Z" fill="#c9b48a" opacity="0.8" />
      <path d="M-28 -184 C-22 -192 -12 -194 -6 -192" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" opacity="0.8" />
      <path d="M16 -186 C24 -186 30 -180 28 -174" fill="none" stroke="#d6c39b" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      {/* saffron strands */}
      {[
        [-12, -192, 20],
        [6, -196, -30],
        [16, -186, 60],
      ].map(([x, y, a], i) => (
        <rect key={i} x={x - 4} y={y} width="8" height="1.3" rx="0.6" fill="#e08a2a" transform={`rotate(${a} ${x} ${y})`} />
      ))}
      {/* pista crumbs */}
      {[
        [-4, -188],
        [10, -190],
        [-18, -182],
        [22, -180],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.8" fill="#9bb85a" />
      ))}
      <path d="M-27 -6 L-32 -168 H-25.5 L-21 -6 Z" fill="#fff8e8" opacity="0.2" />
    </g>
  );
}
