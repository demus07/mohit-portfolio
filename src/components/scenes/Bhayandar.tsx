"use client";

import { useRef, type CSSProperties } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { HERO, mailto } from "@/lib/content";
import { useNarrow } from "@/lib/hooks";
import { Gull, Paint, q, rng, useLive } from "./parts";
import s from "./Bhayandar.module.css";

/*
 * The opening. Bhayandar, a little before sunset: the salt pans and mangroves behind the station,
 * the low hills of Gorai beyond, the platform waiting. Scrolling brings the evening local in from
 * the right; it brakes, and stops with Mohit hanging out of the first door, nearly home.
 * The sun is low on the right and everything is lit from there.
 */

const HZ = 616; // the horizon, where the salt pans meet the mangroves
const RAIL = 872;
const TOP = RAIL - 300; // the coach roof
const CAB_X = 470; // where the cab's nose comes to rest
const COACH = 660;
const SUN = { x: 1400, y: 470 };

/* ───────── The land behind the station ───────── */

const PANS = (() => {
  // salt pans in rows, squeezed together as they run away to the mangroves
  const r = rng(13);
  const rows: { y: number; h: number; cells: { x: number; w: number; tint: string }[] }[] = [];
  let y = HZ + 6;
  for (let i = 0; i < 7; i++) {
    const h = 6 + i * i * 2.2;
    const cells: { x: number; w: number; tint: string }[] = [];
    for (let x = -40; x < 1640; ) {
      const w = (140 + r() * 220) * (1 + i * 0.25);
      const t = r();
      cells.push({ x: q(x), w: q(w), tint: t < 0.4 ? "#efe2d2" : t < 0.75 ? "#ead4c6" : "#dfd8cc" });
      x += w + 4 + i * 1.5;
    }
    rows.push({ y: q(y), h: q(h), cells });
    y += h + 2 + i * 0.8;
  }
  return rows;
})();

const MANGROVE = (() => {
  const r = rng(29);
  let d = `M-20 ${HZ + 4}`;
  for (let x = -20; x <= 1640; x += 18) d += ` L${x} ${q(HZ - 6 - r() * 16 - (Math.sin(x / 140) + 1) * 5)}`;
  return d + ` L1640 ${HZ + 4} Z`;
})();

const EGRETS = [
  { x: 260, y: HZ + 30, k: 0.6 },
  { x: 318, y: HZ + 44, k: 0.75 },
  { x: 1090, y: HZ + 26, k: 0.55 },
];

function Egret({ x, y, k }: { x: number; y: number; k: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      <path d="M0 0 L0 -8 M4 0 L3 -8" stroke="#5b5148" strokeWidth={1.4} />
      <ellipse cx={2} cy={-13} rx={8} ry={5} fill="#fbf8f1" />
      <path d="M7 -15 Q10 -24 6 -28" stroke="#fbf8f1" strokeWidth={2.4} fill="none" strokeLinecap="round" />
      <path d="M6 -28 L12 -27" stroke="#d9a63a" strokeWidth={1.4} />
    </g>
  );
}

function Land() {
  return (
    <g>
      {/* the hills at Gorai, blue with distance */}
      <path d={`M-20 ${HZ - 10} C120 ${HZ - 70} 260 ${HZ - 96} 420 ${HZ - 52} C520 ${HZ - 28} 600 ${HZ - 40} 700 ${HZ - 18} L700 ${HZ} L-20 ${HZ} Z`} fill="#b7b4b6" opacity={0.75} />
      <path d={`M980 ${HZ - 8} C1100 ${HZ - 60} 1220 ${HZ - 74} 1330 ${HZ - 40} C1420 ${HZ - 14} 1520 ${HZ - 50} 1640 ${HZ - 30} L1640 ${HZ} L980 ${HZ} Z`} fill="#c2b5ad" opacity={0.7} />
      <path d={MANGROVE} fill="#4f5e3f" />
      <rect x={-20} y={HZ} width={1660} height={120} fill="#a89275" />
      {PANS.map((row, i) => (
        <g key={i}>
          {row.cells.map((c, j) => (
            <rect key={j} x={c.x} y={row.y} width={c.w} height={row.h} fill={c.tint} />
          ))}
        </g>
      ))}
      {/* the sun laid across the wet pans */}
      <g className={s.glint}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={SUN.x - 30 - i * 14} y={HZ + 8 + i * i * 3.4} width={60 + i * 28} height={2 + i * 0.6} fill="#fff1cf" opacity={0.85 - i * 0.1} />
        ))}
      </g>
      {EGRETS.map((e, i) => (
        <Egret key={i} {...e} />
      ))}
      {/* a few low blocks of Bhayandar West, catching the light */}
      {[
        [560, 56, 70],
        [640, 40, 50],
        [880, 64, 90],
        [960, 44, 60],
      ].map(([x, w, h]) => (
        <g key={x}>
          <rect x={x} y={HZ - h} width={w} height={h} fill="#d9c7ad" />
          <rect x={x + w - 10} y={HZ - h} width={10} height={h} fill="#f2dcb6" />
          {[0, 1, 2].map((f) => (
            <rect key={f} x={x + 6} y={HZ - h + 10 + f * 20} width={w - 18} height={6} fill="#8e7d68" opacity={0.6} />
          ))}
        </g>
      ))}
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
          भाईंदर
        </text>
        <text x={160} y={86} textAnchor="middle" className={s.boardName}>
          BHAYANDAR
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

/* ───────── The train, and Mohit at the door ───────── */

function Mohit() {
  // standing on the sill, one hand on the door pole, leaning out into the wind, bag on his back
  return (
    <g>
      {/* the arm back to the pole */}
      <path d="M8 -150 Q34 -168 54 -176" stroke="#8a5a3c" strokeWidth={9} strokeLinecap="round" fill="none" />
      <g className={s.lean}>
        {/* legs: one on the sill, one easy */}
        <path d="M6 -84 L14 -2" stroke="#2c3442" strokeWidth={15} strokeLinecap="round" />
        <path d="M-6 -84 Q-20 -46 -30 -14" stroke="#2c3442" strokeWidth={15} strokeLinecap="round" fill="none" />
        <rect x={6} y={-6} width={22} height={8} rx={3} fill="#e9e2d0" />
        <rect x={-42} y={-18} width={22} height={8} rx={3} fill="#e9e2d0" transform="rotate(-14 -31 -14)" />
        {/* the bag */}
        <rect x={10} y={-160} width={26} height={60} rx={9} fill="#3a3f45" />
        <rect x={30} y={-158} width={6} height={56} rx={3} fill="#e8b97a" opacity={0.5} />
        {/* the shirt, moving a little in the wind */}
        <path className={s.shirt} d="M-20 -168 Q0 -176 18 -166 L22 -86 Q0 -78 -22 -86 Z" fill="#3d6fa3" />
        <path d="M12 -166 L22 -86 L14 -86 L8 -164 Z" fill="#f2c48a" opacity={0.45} />
        {/* the free arm, easy at his side */}
        <path d="M-16 -158 Q-28 -126 -22 -98" stroke="#3d6fa3" strokeWidth={12} strokeLinecap="round" fill="none" />
        <circle cx={-22} cy={-94} r={6} fill="#8a5a3c" />
        {/* head turned up the line, towards home */}
        <rect x={-6} y={-184} width={10} height={14} fill="#7a4e33" />
        <circle cx={-4} cy={-198} r={16} fill="#8a5a3c" />
        <path d="M2 -212 Q14 -200 10 -186" stroke="#f2c48a" strokeWidth={3} fill="none" opacity={0.6} />
        <path className={s.hair} d="M-20 -204 Q-18 -220 -2 -218 Q12 -218 16 -206 Q8 -212 -2 -210 Q-12 -210 -20 -204 Z" fill="#1c1a19" />
      </g>
    </g>
  );
}

function Coach({ x, cab, me }: { x: number; cab?: boolean; me?: boolean }) {
  const w = COACH;
  const doors = [250, 560];
  const windows = [96, 168, 360, 432];
  return (
    <g transform={`translate(${x} 0)`}>
      {[70, w - 140].map((b) => (
        <g key={b}>
          <rect x={b} y={RAIL - 34} width={74} height={20} fill="#2b2d2f" />
          <circle cx={b + 14} cy={RAIL - 10} r={13} fill="#232526" />
          <circle cx={b + 60} cy={RAIL - 10} r={13} fill="#232526" />
        </g>
      ))}
      <path
        d={cab ? `M44 ${TOP + 6} Q6 ${TOP + 12} 0 ${TOP + 80} L0 ${RAIL - 32} L${w} ${RAIL - 32} L${w} ${TOP} L64 ${TOP} Z` : `M0 ${TOP} L${w} ${TOP} L${w} ${RAIL - 32} L0 ${RAIL - 32} Z`}
        fill="#ede5d2"
      />
      {/* the low sun along its flank */}
      <rect x={0} y={TOP + 10} width={w} height={6} fill="#ffe9c4" opacity={0.6} />
      <rect x={cab ? 50 : 0} y={TOP - 12} width={cab ? w - 50 : w} height={16} rx={6} fill="#a9aca8" />
      <rect x={0} y={RAIL - 104} width={w} height={72} fill="#7b2a33" />
      <rect x={0} y={RAIL - 110} width={w} height={6} fill="#d8b04a" />
      {windows.map((wx) => (
        <g key={wx}>
          <rect x={wx} y={TOP + 46} width={60} height={58} rx={5} fill="#2f3539" />
          {[0, 1, 2, 3, 4].map((b) => (
            <rect key={b} x={wx + 6 + b * 11} y={TOP + 46} width={3} height={58} fill="#9aa0a0" />
          ))}
          <rect x={wx} y={TOP + 46} width={60} height={10} fill="#f2c48a" opacity={0.2} />
        </g>
      ))}
      {doors.map((d, i) => (
        <g key={d}>
          <rect x={d} y={TOP + 24} width={76} height={RAIL - 32 - TOP - 24} fill="#20252a" />
          <rect x={d + 36} y={TOP + 24} width={4} height={RAIL - 52 - TOP - 24} fill="#b7b9b4" />
          {/* someone further in, a shape in the dark */}
          {!(me && i === 0) && <rect x={d + 46} y={TOP + 80} width={20} height={70} rx={8} fill="#3a4250" />}
        </g>
      ))}
      {me && (
        <g transform={`translate(${doors[0] - 10} ${RAIL - 32})`}>
          <Mohit />
        </g>
      )}
      {cab && (
        <g>
          <path d={`M10 ${TOP + 30} Q16 ${TOP + 22} 46 ${TOP + 22} L74 ${TOP + 22} L74 ${TOP + 90} L6 ${TOP + 90} Z`} fill="#2f3539" />
          <path d={`M54 ${TOP + 24} L70 ${TOP + 24} L50 ${TOP + 88} L34 ${TOP + 88} Z`} fill="#fff1cf" opacity={0.18} />
          <circle cx={20} cy={RAIL - 70} r={9} fill="#fff6d8" />
          <rect x={86} y={TOP + 2} width={130} height={20} fill="#1a1c1e" />
          <text x={151} y={TOP + 17} textAnchor="middle" className={s.cabBoard}>
            BHAYANDAR
          </text>
        </g>
      )}
      {!cab && <path d={`M250 ${TOP - 12} L310 ${TOP - 60} L370 ${TOP - 12} M280 ${TOP - 60} L340 ${TOP - 60}`} stroke="#4a4f52" strokeWidth={4} fill="none" />}
    </g>
  );
}

function Train({ x }: { x: MotionValue<number> }) {
  return (
    <motion.g style={{ x }}>
      <Coach x={CAB_X} cab me />
      <Coach x={CAB_X + COACH + 6} />
      <Coach x={CAB_X + (COACH + 6) * 2} />
      <Coach x={CAB_X + (COACH + 6) * 3} />
    </motion.g>
  );
}

/* ───────── The opening ───────── */

export function Bhayandar() {
  const narrow = useNarrow();
  const ref = useRef<HTMLElement>(null);
  const [stage, live] = useLive<HTMLDivElement>();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // the train comes in fast and brakes to a stand; it is fully stopped by 70% of the way
  const trainX = useTransform(scrollYProgress, (p) => {
    const t = Math.min(Math.max(p / 0.7, 0), 1);
    return 2300 * Math.pow(1 - t, 2.4);
  });
  const titleOpacity = useTransform(scrollYProgress, [0.36, 0.56], [1, 0]);
  const titleY = useTransform(scrollYProgress, [0.36, 0.56], [0, -24]);
  const noteOpacity = useTransform(scrollYProgress, [0.68, 0.82], [0, 1]);
  const notePen = useTransform(scrollYProgress, [0.72, 0.9], [1, 0]);
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
          <motion.p className={s.note} style={{ opacity: noteOpacity }}>
            {HERO.note}
          </motion.p>
        </div>

        <Paint viewBox={narrow ? "380 250 760 750" : "0 0 1600 1000"} className="scene-art" label="An evening local pulling into Bhayandar station, Mohit hanging out of the door">
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
          </defs>
          <rect width={1600} height={HZ + 4} fill="url(#bh-sky)" />
          <rect width={1600} height={HZ + 4} fill="url(#bh-sun)" />
          <circle cx={SUN.x} cy={SUN.y} r={30} fill="#fff7e6" />
          <g className={s.gulls}>
            <Gull x={1040} y={300} size={1} color="#5b5550" beat={1.5} />
            <Gull x={1086} y={282} size={0.75} color="#5b5550" beat={1.9} />
          </g>
          <Land />
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
          {/* the pen line from the note down to him, drawn once the train has stopped */}
          {!narrow && (
            <motion.path
              d="M470 392 C 570 400, 650 470, 672 604"
              pathLength={1}
              strokeDasharray="1 1"
              style={{ strokeDashoffset: notePen, opacity: noteOpacity }}
              stroke="#2b2b2b"
              strokeWidth={2}
              strokeLinecap="round"
              fill="none"
            />
          )}
        </Paint>

        <motion.p className={`${s.hint} open-in`} style={{ opacity: hintOpacity, "--d": 3 } as never}>
          <span className={s.hintLine} />
          {HERO.hint}
        </motion.p>
      </div>
    </header>
  );
}
