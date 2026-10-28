"use client";

import { useRef, type CSSProperties } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { HERO, mailto } from "@/lib/content";
import { useNarrow } from "@/lib/hooks";
import { Gull, Paint, q, useLive } from "./parts";
import s from "./Churchgate.module.css";

/*
 * The opening. Churchgate, late afternoon: the sun low over the sea behind the station, the Art Deco
 * of Eros and the Gothic of the railway headquarters gone soft in the haze. Scrolling brings the AC
 * local in; it brakes and stops, then the view closes in on one window, where Mohit sits with his
 * chin on his fist, thinking about something else.
 */

const HZ = 616; // where the city meets the ground behind the platforms
const RAIL = 872;
const TOP = RAIL - 300; // the coach roof
const CAB_X = 470; // where the cab's nose comes to rest
const COACH = 660;
const SUN = { x: 1250, y: 290 };

/* ───────── The city behind the station ─────────
 * Far things are pale and warm with haze; the sun is behind them on the right, so their faces are
 * in shade and only the edges catch it.
 */

const HAZE = "#dcc7a8";
const HAZE_LIT = "#efdcbc";

// Eros: a cream Art Deco block with a stepped tower over the corner and fins up its face.
function Eros({ x }: { x: number }) {
  return (
    <g>
      <rect x={x} y={HZ - 120} width={320} height={120} fill={HAZE} />
      <path d={`M${x + 110} ${HZ - 120} L${x + 110} ${HZ - 168} L${x + 126} ${HZ - 168} L${x + 126} ${HZ - 196} L${x + 146} ${HZ - 196} L${x + 146} ${HZ - 222} L${x + 174} ${HZ - 222} L${x + 174} ${HZ - 196} L${x + 194} ${HZ - 196} L${x + 194} ${HZ - 168} L${x + 210} ${HZ - 168} L${x + 210} ${HZ - 120} Z`} fill={HAZE} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={x + 132 + i * 13} y={HZ - 190} width={3} height={90} fill="#cfb796" />
      ))}
      {[0, 1, 2, 3].map((f) => (
        <rect key={f} x={x + 14} y={HZ - 104 + f * 24} width={292} height={4} fill="#cfb796" />
      ))}
      <rect x={x + 316} y={HZ - 120} width={4} height={120} fill={HAZE_LIT} />
      <rect x={x + 206} y={HZ - 168} width={4} height={48} fill={HAZE_LIT} />
    </g>
  );
}

// The Western Railway headquarters: a long Gothic front with a domed tower over the middle.
function Headquarters({ x }: { x: number }) {
  const cx = x + 190;
  return (
    <g fill="#e2cfb2">
      <rect x={x} y={HZ - 104} width={380} height={104} />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <path key={i} d={`M${x + 12 + i * 54} ${HZ - 104} l12 -18 l12 18 Z`} />
      ))}
      <rect x={cx - 38} y={HZ - 190} width={76} height={90} />
      <path d={`M${cx - 44} ${HZ - 190} Q${cx} ${HZ - 262} ${cx + 44} ${HZ - 190} Z`} />
      <rect x={cx - 2} y={HZ - 290} width={4} height={36} />
      <circle cx={cx} cy={HZ - 248} r={8} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={x + 24 + i * 60} y={HZ - 80} width={14} height={30} rx={7} fill="#d3bd9c" />
      ))}
      <rect x={cx + 34} y={HZ - 190} width={4} height={90} fill={HAZE_LIT} />
    </g>
  );
}

function City() {
  return (
    <g>
      {/* the furthest blocks, almost sky */}
      {[
        [-20, 150, 90],
        [470, 120, 130],
        [700, 160, 70],
        [1340, 140, 110],
        [1480, 180, 80],
      ].map(([x, w, h]) => (
        <rect key={x} x={x} y={HZ - h} width={w} height={h} fill="#e7d6bb" />
      ))}
      <Eros x={120} />
      <Headquarters x={860} />
      {/* rain trees along the road, a soft dark band */}
      <path
        d={`M-20 ${HZ} Q20 ${HZ - 40} 70 ${HZ - 30} Q110 ${HZ - 52} 160 ${HZ - 34} Q210 ${HZ - 48} 260 ${HZ - 26} L260 ${HZ} Z M600 ${HZ} Q640 ${HZ - 44} 700 ${HZ - 36} Q760 ${HZ - 56} 820 ${HZ - 30} L840 ${HZ} Z M1260 ${HZ} Q1300 ${HZ - 50} 1360 ${HZ - 38} Q1420 ${HZ - 54} 1480 ${HZ - 32} Q1560 ${HZ - 46} 1640 ${HZ - 30} L1640 ${HZ} Z`}
        fill="#a59a78"
        opacity={0.8}
      />
      <rect x={-20} y={HZ} width={1660} height={260} fill="#cdbb9d" />
      {/* a rake standing at the far platform, its flank in shade, the low sun along its roof */}
      <g opacity={0.9}>
        <rect x={-20} y={HZ + 52} width={1660} height={150} fill="#d2c9b8" />
        <rect x={-20} y={HZ + 52} width={1660} height={5} fill="#f4e6c8" />
        <rect x={-20} y={HZ + 128} width={1660} height={8} fill="#8fa0bf" />
        <rect x={-20} y={HZ + 176} width={1660} height={26} fill="#9a9aa2" />
        {Array.from({ length: 24 }, (_, i) => (
          <rect key={i} x={i * 70 - 4} y={HZ + 76} width={i % 5 === 2 ? 30 : 44} height={i % 5 === 2 ? 100 : 40} rx={5} fill="#7d8790" />
        ))}
      </g>
      <rect x={-20} y={HZ + 202} width={1660} height={10} fill="#b3a68f" />
    </g>
  );
}

/* ───────── The station ───────── */

const WAITING = [
  { x: 330, shirt: "#c46a3d", h: 1 },
  { x: 384, shirt: "#e9e2d0", h: 0.94 },
  { x: 1240, shirt: "#6a7f4f", h: 1.05 },
  { x: 1530, shirt: "#7b2a33", h: 0.98 },
];

function Station() {
  const floor = RAIL - 44;
  return (
    <g>
      {/* the far platform, its roof starting halfway along so the sky stays open over the words */}
      <rect x={-20} y={floor} width={1660} height={30} fill="#cfc4ae" />
      <rect x={-20} y={floor} width={1660} height={5} fill="#efd24a" />
      {[760, 1010, 1260, 1510].map((x) => (
        <g key={x}>
          <rect x={x} y={410} width={10} height={floor - 410} fill="#3f6b5c" />
          <rect x={x + 7} y={410} width={3} height={floor - 410} fill="#d8b98a" opacity={0.5} />
        </g>
      ))}
      <path d={`M700 410 L1640 410 L1640 388 L700 398 Z`} fill="#8f918a" />
      <rect x={700} y={408} width={940} height={6} fill="#5d625e" />
      {/* the board: Marathi above, English below, black on yellow */}
      <g transform="translate(1110 430)">
        <rect x={40} y={-20} width={3} height={22} fill="#3a3a3a" />
        <rect x={276} y={-20} width={3} height={22} fill="#3a3a3a" />
        <rect x={0} y={0} width={320} height={104} fill="#f5c518" />
        <rect x={0} y={100} width={320} height={4} fill="#c99e0c" />
        <rect x={312} y={0} width={8} height={104} fill="#ffe27a" opacity={0.5} />
        <text x={160} y={44} textAnchor="middle" className={s.boardDeva} lang="mr">
          चर्चगेट
        </text>
        <text x={160} y={86} textAnchor="middle" className={s.boardName}>
          CHURCHGATE
        </text>
      </g>
      {WAITING.map((w, i) => (
        <g key={i} transform={`translate(${w.x} ${floor}) scale(${w.h})`}>
          <rect x={-7} y={-52} width={6} height={52} fill="#2c2f36" />
          <rect x={1} y={-52} width={6} height={52} fill="#2c2f36" />
          <rect x={-11} y={-102} width={22} height={54} rx={8} fill={w.shirt} />
          <rect x={6} y={-102} width={5} height={54} rx={2} fill="#fff1cf" opacity={0.35} />
          <circle cx={0} cy={-114} r={10} fill="#6b4a36" />
        </g>
      ))}
    </g>
  );
}

function Wires() {
  return (
    <g>
      {[110, 690].map((x) => (
        <g key={x}>
          <rect x={x} y={492} width={8} height={RAIL - 492} fill="#5f6a6e" />
          <rect x={x - 46} y={498} width={70} height={6} fill="#5f6a6e" />
        </g>
      ))}
      <path d={`M-20 506 L1640 506 M-20 524 Q800 540 1640 524`} stroke="#4f5559" strokeWidth={1.4} fill="none" />
    </g>
  );
}

/* ───────── The train, and Mohit at the window ─────────
 * A Western line AC rake: white body, sealed tinted windows, the blue band and the thin red line under
 * them, sliding doors shut, the AC units along the roof.
 */

const WIN = { x: 260, y: TOP + 40, w: 120, h: 74 }; // Mohit's window on the first coach
const FOCUS = { x: CAB_X + WIN.x + WIN.w / 2, y: WIN.y + WIN.h / 2 };

const SHIRT = "#f1eff6";
const SKIN = "#c18c66";
const SKIN_SHADE = "#a5714f";
const HAIR = "#1c1917";

// Inside the coach, drawn on a 600 x 370 card and scaled into the window. Cool AC light inside, the
// sunset through the far windows, and Mohit by the glass, chin on his fist, somewhere else entirely.
function Inside() {
  return (
    <g>
      <defs>
        <linearGradient id="in-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#eef2f3" />
          <stop offset="1" stopColor="#c9d3d8" />
        </linearGradient>
        <linearGradient id="in-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6d7a6" />
          <stop offset="1" stopColor="#f2b77c" />
        </linearGradient>
        <pattern id="in-stripe" width="9" height="9" patternUnits="userSpaceOnUse">
          <rect width="9" height="9" fill={SHIRT} />
          <rect width="9" height="1.4" fill="#c9c3dc" />
        </pattern>
      </defs>
      <rect width={600} height={370} fill="url(#in-wall)" />
      {/* the light strip along the ceiling */}
      <rect width={600} height={16} fill="#fbfdfd" />
      <rect y={16} width={600} height={4} fill="#b9c4ca" />
      {/* the far side's windows: the sun going down over the pans */}
      {[20, 250, 480].map((x) => (
        <g key={x}>
          <rect x={x} y={70} width={190} height={118} rx={14} fill="url(#in-far)" />
          <path d={`M${x} 188 L${x} 150 L${x + 40} 150 L${x + 40} 128 L${x + 70} 128 L${x + 70} 142 L${x + 120} 142 L${x + 120} 120 L${x + 150} 120 L${x + 150} 146 L${x + 190} 146 L${x + 190} 188 Z`} fill="#c99a6e" opacity={0.6} />
          <rect x={x} y={70} width={190} height={118} rx={14} fill="none" stroke="#7f8b92" strokeWidth={6} />
        </g>
      ))}
      {/* the rail and its straps, swaying a little */}
      <rect y={36} width={600} height={5} rx={2.5} fill="#9aa5ab" />
      {[90, 170, 430, 520].map((x, i) => (
        <g key={x} transform={`translate(${x} 40)`}>
          <g className={s.strap} style={{ "--d": `${-i * 0.7}s` } as CSSProperties}>
            <rect x={-3} y={0} width={6} height={26} fill="#4f6b8f" />
            <circle cx={0} cy={36} r={10} fill="none" stroke="#e7ecef" strokeWidth={4.5} />
          </g>
        </g>
      ))}
      {/* his seat */}
      <rect x={372} y={118} width={120} height={270} rx={22} fill="#3f5f86" />
      <rect x={372} y={118} width={120} height={18} rx={9} fill="#567aa3" />
      <rect x={468} y={130} width={24} height={250} fill="#2e4766" opacity={0.6} />

      {/* Mohit */}
      <g>
        {/* the far arm, resting */}
        <path d="M352 262 Q386 300 380 370" stroke="#dcd8e6" strokeWidth={36} strokeLinecap="round" fill="none" />
        {/* body */}
        <path d="M278 226 C300 214 340 220 366 236 C404 258 424 306 428 380 L240 380 C246 320 258 256 278 226 Z" fill="url(#in-stripe)" />
        <path d="M398 262 C414 290 424 330 428 380 L404 380 C402 330 396 296 386 270 Z" fill="#cfcadb" opacity={0.7} />
        {/* neck and collar */}
        <path d="M288 188 L322 188 L326 232 L292 236 Z" fill={SKIN_SHADE} />
        <path d="M282 228 L298 212 L312 236 Z M322 214 L340 230 L318 238 Z" fill="#e3dfeb" />
        {/* head */}
        <path
          d="M262 96 C254 110 254 126 257 136 C250 144 243 153 239 160 C237 165 243 168 250 168 C248 173 252 176 250 180 C249 185 254 187 254 190 C252 196 258 203 270 205 C290 208 310 200 324 190 C345 178 352 150 345 125 C336 98 300 86 262 96 Z"
          fill={SKIN}
        />
        <path d="M324 190 C345 178 352 150 345 125 C340 150 330 172 300 196 Z" fill={SKIN_SHADE} opacity={0.6} />
        {/* ear */}
        <ellipse cx={322} cy={150} rx={9} ry={14} fill={SKIN_SHADE} />
        <path d="M320 142 Q326 150 320 158" stroke="#8a5b3d" strokeWidth={2.4} fill="none" />
        {/* hair, a little lifted on top */}
        <path d="M256 114 C244 98 248 72 274 62 C300 52 340 60 354 86 C362 104 358 132 344 158 C340 146 338 134 330 126 C316 116 300 108 284 104 C272 102 262 106 256 114 Z" fill={HAIR} />
        <path d="M252 100 C248 84 260 66 282 60 C272 70 266 84 266 98 Z" fill="#2c2724" />
        <path d="M330 126 C334 138 334 148 330 156 L338 160 C342 148 340 136 334 126 Z" fill={HAIR} />
        {/* brow, eye, the glasses */}
        <path d="M252 125 Q262 119 274 123" stroke={HAIR} strokeWidth={3.4} strokeLinecap="round" fill="none" />
        <ellipse className={s.blink} cx={262} cy={139} rx={3.2} ry={2.8} fill="#1d1714" />
        <rect x={248} y={127} width={26} height={22} rx={6} fill="#cfe2ea" fillOpacity={0.28} stroke="#3a3533" strokeWidth={2.6} />
        <path d="M274 134 L320 141" stroke="#3a3533" strokeWidth={2.6} />
        <path d="M252 130 L258 130" stroke="#fff" strokeWidth={2} strokeLinecap="round" opacity={0.7} />
        <path d="M247 172 Q253 169 259 172" stroke={HAIR} strokeWidth={2.4} strokeLinecap="round" fill="none" opacity={0.65} />
        {/* the near arm: elbow on the sill, chin on the fist */}
        <path d="M350 250 C330 290 300 324 270 346" stroke="#cfc9dc" strokeWidth={50} strokeLinecap="round" fill="none" />
        <path d="M350 250 C330 290 300 324 270 346" stroke="url(#in-stripe)" strokeWidth={44} strokeLinecap="round" fill="none" />
        <path d="M290 326 L262 360" stroke="#e6e2ee" strokeWidth={44} />
        <path d="M290 326 L262 360" stroke="#cfc9dc" strokeWidth={44} strokeDasharray="3 12" />
        <path d="M252 356 C248 310 248 262 252 226" stroke={SKIN} strokeWidth={30} strokeLinecap="round" fill="none" />
        <path d="M262 356 C260 310 260 262 262 228" stroke={SKIN_SHADE} strokeWidth={8} strokeLinecap="round" fill="none" opacity={0.5} />
        <ellipse cx={252} cy={212} rx={19} ry={16} fill={SKIN} />
        <path d="M236 206 Q246 200 256 204 M236 214 Q246 208 258 212 M238 222 Q248 216 258 220" stroke={SKIN_SHADE} strokeWidth={2} fill="none" />
      </g>
      {/* the thought, rising */}
      <g className={s.think} fill="#fff" stroke="#c9d3d8" strokeWidth={1.5}>
        <circle cx={226} cy={92} r={6} style={{ "--d": "0s" } as CSSProperties} />
        <circle cx={206} cy={64} r={9} style={{ "--d": "0.5s" } as CSSProperties} />
        <circle cx={180} cy={30} r={13} style={{ "--d": "1s" } as CSSProperties} />
      </g>
    </g>
  );
}

// A sealed window from outside: tinted glass, the sky caught in it, sometimes someone behind it.
function Glass({ x, y, w, h, who }: { x: number; y: number; w: number; h: number; who?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={9} fill="url(#ac-glass)" />
      {who && (
        <g opacity={0.55}>
          <circle cx={x + w * 0.55} cy={y + h * 0.42} r={9} fill="#1c2630" />
          <rect x={x + w * 0.55 - 15} y={y + h * 0.58} width={30} height={h * 0.42} rx={10} fill={who} />
        </g>
      )}
      <path d={`M${x + w * 0.2} ${y} L${x + w * 0.38} ${y} L${x + w * 0.14} ${y + h} L${x - 0} ${y + h} Z`} fill="#fff" opacity={0.08} />
      
    </g>
  );
}

function Door({ x }: { x: number }) {
  const top = TOP + 22;
  const h = RAIL - 36 - top;
  return (
    <g>
      <rect x={x - 2} y={top - 2} width={100} height={h + 2} rx={3} fill="#5d666c" />
      {[0, 50].map((o) => (
        <g key={o}>
          <rect x={x + o} y={top} width={46} height={h} rx={2} fill="#d5d8da" />
          <rect x={x + o + 36} y={top} width={10} height={h} fill="#b9bdc0" />
          <rect x={x + o + 8} y={top + 18} width={30} height={84} rx={6} fill="url(#ac-glass)" />
        </g>
      ))}
      <rect x={x + 46} y={top} width={4} height={h} fill="#5d666c" />
      <rect x={x} y={RAIL - 52} width={96} height={6} fill="#f2c230" />
    </g>
  );
}

function Coach({ x, cab, me }: { x: number; cab?: boolean; me?: boolean }) {
  const w = COACH;
  const bottom = RAIL - 32;
  const windows = cab ? [WIN.x, 520] : [30, 296, 560];
  const doors = cab ? [400] : [176, 440];
  return (
    <g transform={`translate(${x} 0)`}>
      {/* bogies */}
      {[70, w - 140].map((b) => (
        <g key={b}>
          <rect x={b} y={RAIL - 34} width={74} height={20} fill="#2b2d2f" />
          <circle cx={b + 14} cy={RAIL - 10} r={13} fill="#232526" />
          <circle cx={b + 60} cy={RAIL - 10} r={13} fill="#232526" />
        </g>
      ))}
      {/* the body, with the cab's raked nose */}
      <path
        d={
          cab
            ? `M0 ${bottom} L0 ${TOP + 132} C0 ${TOP + 70} 26 ${TOP + 14} 92 ${TOP} L${w} ${TOP} L${w} ${bottom} Z`
            : `M0 ${TOP + 6} Q0 ${TOP} 6 ${TOP} L${w - 6} ${TOP} Q${w} ${TOP} ${w} ${TOP + 6} L${w} ${bottom} L0 ${bottom} Z`
        }
        fill="url(#ac-body)"
      />
      {/* the stripes: blue under the windows, a thin red line, the navy skirt */}
      <rect x={0} y={TOP + 130} width={w} height={16} fill="#24539e" />
      <rect x={0} y={TOP + 150} width={w} height={4} fill="#c73a3f" />
      <rect x={0} y={bottom - 30} width={w} height={30} fill="#1e2a4a" />
      {/* the roof line and the AC units on it */}
      <rect x={cab ? 92 : 0} y={TOP - 6} width={cab ? w - 92 : w} height={8} fill="#c9cbc8" />
      {[cab ? 150 : 80, 380].map((u) => (
        <g key={u}>
          <rect x={u} y={TOP - 26} width={190} height={22} rx={8} fill="#dcddd9" />
          <rect x={u} y={TOP - 10} width={190} height={6} fill="#aeb1ae" />
          {[0, 1, 2, 3, 4].map((g) => (
            <rect key={g} x={u + 24 + g * 30} y={TOP - 20} width={18} height={4} rx={2} fill="#9ea19e" />
          ))}
        </g>
      ))}
      {!cab && <path d={`M300 ${TOP - 26} L340 ${TOP - 72} L380 ${TOP - 26} M318 ${TOP - 72} L362 ${TOP - 72}`} stroke="#4a4f52" strokeWidth={4} fill="none" />}
      {/* the low sun along its flank */}
      <rect x={cab ? 60 : 0} y={TOP + 8} width={cab ? w - 60 : w} height={5} fill="#ffe9c4" opacity={0.7} />
      {windows.map((wx, i) =>
        me && wx === WIN.x ? null : (
          <Glass key={wx} x={wx} y={WIN.y} w={wx === 560 || wx === 520 ? (cab ? 120 : 84) : 120} h={WIN.h} who={i % 2 ? "#5b4a6e" : undefined} />
        ),
      )}
      {doors.map((d) => (
        <Door key={d} x={d} />
      ))}
      {cab && (
        <g>
          {/* windscreen, crew door, the destination board and the headlamps */}
          <path d={`M6 ${TOP + 116} C8 ${TOP + 70} 30 ${TOP + 26} 86 ${TOP + 14} L96 ${TOP + 14} L96 ${TOP + 116} Z`} fill="url(#ac-glass)" />
          <path d={`M40 ${TOP + 40} L60 ${TOP + 22} L40 ${TOP + 110} L24 ${TOP + 110} Z`} fill="#fff" opacity={0.1} />
          <rect x={112} y={TOP + 24} width={40} height={RAIL - 72 - TOP - 24} rx={3} fill="#d5d8da" />
          <rect x={120} y={TOP + 40} width={24} height={46} rx={4} fill="url(#ac-glass)" />
          <rect x={156} y={TOP + 78} width={100} height={18} rx={2} fill="#111315" />
          <text x={206} y={TOP + 91} textAnchor="middle" className={s.cabBoard} textLength={86} lengthAdjust="spacingAndGlyphs">
            CHURCHGATE
          </text>
          <text x={206} y={TOP + 124} textAnchor="middle" className={s.acMark}>
            AC
          </text>
          <ellipse cx={14} cy={TOP + 176} rx={7} ry={10} fill="#fff6d8" />
          <ellipse cx={10} cy={TOP + 176} rx={30} ry={22} fill="#fff6d8" opacity={0.18} />
        </g>
      )}
      {me && (
        <g>
          <clipPath id="me-win">
            <rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} rx={9} />
          </clipPath>
          <g clipPath="url(#me-win)">
            <g transform={`translate(${WIN.x} ${WIN.y}) scale(0.2)`}>
              <Inside />
            </g>
            {/* the glass in front of him, a little tint and a slant of reflection */}
            <rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} fill="#9fc0d6" opacity={0.1} />
            <path d={`M${WIN.x + 84} ${WIN.y} L${WIN.x + 100} ${WIN.y} L${WIN.x + 78} ${WIN.y + WIN.h} L${WIN.x + 62} ${WIN.y + WIN.h} Z`} fill="#fff" opacity={0.12} />
          </g>
          <rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} rx={9} fill="none" stroke="#3a4650" strokeWidth={1.5} />
          <rect x={WIN.x - 2} y={WIN.y + WIN.h - 1} width={WIN.w + 4} height={3} fill="#9aa1a5" />
        </g>
      )}
    </g>
  );
}

function Train({ x }: { x: MotionValue<number> }) {
  return (
    <motion.g style={{ x }}>
      <Coach x={CAB_X} cab me />
      <Coach x={CAB_X + COACH + 8} />
      <Coach x={CAB_X + (COACH + 8) * 2} />
      <Coach x={CAB_X + (COACH + 8) * 3} />
    </motion.g>
  );
}

/* ───────── The opening ───────── */

export function Churchgate() {
  const narrow = useNarrow();
  const ref = useRef<HTMLElement>(null);
  const [stage, live] = useLive<HTMLDivElement>();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // the train comes in fast and brakes to a stand by 40% of the way
  const trainX = useTransform(scrollYProgress, (p) => {
    const t = Math.min(Math.max(p / 0.4, 0), 1);
    return 2300 * Math.pow(1 - t, 2.4);
  });
  // then the view closes in on his window, which settles right of centre so the words keep the left
  const zoom = useTransform(scrollYProgress, (p) => {
    const t = Math.min(Math.max((p - 0.46) / 0.34, 0), 1);
    const e = t * t * (3 - 2 * t);
    const end = narrow ? { x: 760, y: 640, k: 5 } : { x: 1080, y: 520, k: 6.4 };
    const k = Math.pow(end.k, e);
    const sx = FOCUS.x + (end.x - FOCUS.x) * e;
    const sy = FOCUS.y + (end.y - FOCUS.y) * e;
    return `translate(${q(sx - k * FOCUS.x)} ${q(sy - k * FOCUS.y)}) scale(${Math.round(k * 1000) / 1000})`;
  });
  // written straight onto the group, so it scales in the painting's own units
  const lens = useRef<SVGGElement>(null);
  useMotionValueEvent(zoom, "change", (v) => lens.current?.setAttribute("transform", v));
  const titleOpacity = useTransform(scrollYProgress, [0.3, 0.44], [1, 0]);
  const titleY = useTransform(scrollYProgress, [0.3, 0.44], [0, -24]);
  const noteOpacity = useTransform(scrollYProgress, [0.8, 0.9], [0, 1]);
  const noteY = useTransform(scrollYProgress, [0.8, 0.9], [14, 0]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.06], [1, 0]);

  return (
    <header ref={ref} className={s.opening} id="top">
      <div ref={stage} className={`scene ${s.stage}`} data-live={live ? "" : undefined}>
        <div className={`zone ${s.zone}`}>
          <motion.div className={s.card} style={{ opacity: titleOpacity, y: titleY }}>
            <h1 className={`h-voice ${s.title} open-in`}>{HERO.title}</h1>
            <p className="line open-in" style={{ "--d": 1 } as CSSProperties}>
              {HERO.line}
            </p>
            <a className={`${s.btn} open-in`} href={mailto("Hello Mohit")} style={{ "--d": 2 } as CSSProperties}>
              Write to me <span aria-hidden="true">→</span>
            </a>
          </motion.div>
          <motion.p className={s.note} style={{ opacity: noteOpacity, y: noteY }}>
            {HERO.note}
          </motion.p>
        </div>

        <Paint viewBox={narrow ? "380 250 760 750" : "0 0 1600 1000"} className="scene-art" label="An AC local pulling into Churchgate in the late afternoon, Mohit at a window, chin on his fist">
          <defs>
            <linearGradient id="bh-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#a9c6d3" />
              <stop offset="0.45" stopColor="#ece0c8" />
              <stop offset="1" stopColor="#f4c993" />
            </linearGradient>
            <radialGradient id="bh-sun" cx={SUN.x} cy={SUN.y} r="640" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#fff2d4" stopOpacity="1" />
              <stop offset="0.1" stopColor="#ffe2b0" stopOpacity="0.85" />
              <stop offset="1" stopColor="#ffe2b0" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="ac-body" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f6f5f1" />
              <stop offset="1" stopColor="#e2e1dc" />
            </linearGradient>
            <linearGradient id="ac-glass" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#4d6273" />
              <stop offset="0.5" stopColor="#2a3945" />
              <stop offset="1" stopColor="#1f2a33" />
            </linearGradient>
          </defs>
          <g ref={lens}>
            <rect width={1600} height={HZ + 4} fill="url(#bh-sky)" />
            <rect width={1600} height={HZ + 4} fill="url(#bh-sun)" />
            <circle cx={SUN.x} cy={SUN.y} r={26} fill="#fff7e6" />
            <g className={s.gulls}>
              <Gull x={1040} y={300} size={1} color="#5b5550" beat={1.5} />
              <Gull x={1086} y={282} size={0.75} color="#5b5550" beat={1.9} />
            </g>
            <City />
            <Station />
            <Wires />
            <rect x={-20} y={RAIL - 14} width={1660} height={20} fill="#8b8273" />
            <Train x={trainX} />
            {/* our side: the trackbed and the edge of the platform we stand on */}
            <rect x={-20} y={RAIL} width={1660} height={6} fill="#cbc7bf" />
            <rect x={-20} y={RAIL + 6} width={1660} height={60} fill="#8b8273" />
            <rect x={-20} y={RAIL + 40} width={1660} height={5} fill="#cbc7bf" />
            <rect x={-20} y={RAIL + 66} width={1660} height={8} fill="#efd24a" />
            <rect x={-20} y={RAIL + 74} width={1660} height={60} fill="#d6ccb6" />
          </g>
        </Paint>

        <motion.p className={`${s.hint} open-in`} style={{ opacity: hintOpacity, "--d": 3 } as never}>
          <span className={s.hintLine} />
          {HERO.hint}
        </motion.p>
      </div>
    </header>
  );
}
