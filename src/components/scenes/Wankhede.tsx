"use client";

import type { CSSProperties } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { WANKHEDE } from "@/lib/content";
import { useNarrow } from "@/lib/hooks";
import { Paint, q, rng, useLive } from "./parts";
import s from "./Wankhede.module.css";

/*
 * Wankhede at dusk, from high in the stands. As you scroll in, the sky goes from orange to navy and
 * the floodlights on the roof come on one bank at a time, until the field is lit like a night game.
 * The crowd is in blue and gold; flags move, phone lights blink.
 */

// floodlights on the far roof, all to the right of the words
const BANKS = [
  { x: 660, y: 236 },
  { x: 940, y: 226 },
  { x: 1220, y: 236 },
  { x: 1490, y: 256 },
];

const CROWD = (() => {
  const r = rng(77);
  const dots: { x: number; y: number; c: string; blink: number }[] = [];
  for (let row = 0; row < 9; row++) {
    const y = 318 + row * 15;
    for (let x = -10; x < 1620; x += 7 + r() * 5) {
      const pick = r();
      const c = pick < 0.5 ? "#2e5fa8" : pick < 0.68 ? "#d7a83a" : pick < 0.82 ? "#e7e2d6" : "#1b2a44";
      dots.push({ x: q(x), y: q(y + Math.sin(x / 260) * 6 + r() * 3), c, blink: x > 700 && r() < 0.035 ? q(1 + r() * 4) : 0 });
    }
  }
  return dots;
})();

const NEAR_ROWS = Array.from({ length: 6 }, (_, i) => i);

function Bank({ x, y, i, progress }: { x: number; y: number; i: number; progress: MotionValue<number> }) {
  // each bank comes on a moment after the one before it
  const on = useTransform(progress, [0.45 + i * 0.1, 0.5 + i * 0.1], [0, 1]);
  return (
    <g>
      <rect x={x - 6} y={y} width={12} height={70} fill="#2a3040" />
      <rect x={x - 58} y={y - 46} width={116} height={50} rx={3} fill="#2a3040" />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={x - 52 + (i % 6) * 18} y={y - 40 + Math.floor(i / 6) * 22} width={14} height={16} rx={2} fill="#3c4456" />
      ))}
      <motion.g style={{ opacity: on }}>
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={x - 52 + (i % 6) * 18} y={y - 40 + Math.floor(i / 6) * 22} width={14} height={16} rx={2} fill="#fffbe8" />
        ))}
        <circle cx={x} cy={y - 20} r={120} fill="url(#wk-flare)" />
      </motion.g>
    </g>
  );
}

export function Wankhede() {
  const narrow = useNarrow();
  const [ref] = useLive<HTMLElement>();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const night = useTransform(scrollYProgress, [0.25, 1], [0, 1]);
  const field = useTransform(scrollYProgress, [0.45, 0.95], [0, 1]);

  return (
    <section ref={ref} className={`scene ${s.wankhede}`} aria-labelledby="wk-title">
      <div className={`zone ${s.zone}`}>
        <h2 id="wk-title" className="h-voice">
          {WANKHEDE.title}
        </h2>
        <p className="line">{WANKHEDE.line}</p>
        <p className="aside">{WANKHEDE.aside}</p>
      </div>

      <Paint viewBox={narrow ? "380 150 860 850" : "0 0 1600 1000"} className="scene-art" label="Wankhede Stadium at dusk, the floodlights coming on over the field">
        <defs>
          <linearGradient id="wk-dusk" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4a5a86" />
            <stop offset="0.55" stopColor="#d98a5b" />
            <stop offset="1" stopColor="#f2c48a" />
          </linearGradient>
          <linearGradient id="wk-night" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0d1a2b" />
            <stop offset="0.7" stopColor="#1f2f4d" />
            <stop offset="1" stopColor="#3b4466" />
          </linearGradient>
          <radialGradient id="wk-flare">
            <stop offset="0" stopColor="#fff7dc" stopOpacity="0.55" />
            <stop offset="1" stopColor="#fff7dc" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="wk-grass" cx="0.5" cy="0.35" r="0.75">
            <stop offset="0" stopColor="#5e8b45" />
            <stop offset="1" stopColor="#3c6331" />
          </radialGradient>
          <radialGradient id="wk-lit" cx="0.5" cy="0.4" r="0.7">
            <stop offset="0" stopColor="#c9f0a0" stopOpacity="0.55" />
            <stop offset="1" stopColor="#c9f0a0" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width={1600} height={1000} fill="url(#wk-dusk)" />
        <motion.rect width={1600} height={1000} fill="url(#wk-night)" style={{ opacity: night }} />

        {/* Marine Drive's towers beyond the far stand */}
        {[1180, 1270, 1360, 1450, 1540].map((x, i) => (
          <rect key={x} x={x} y={150 + (i % 3) * 24} width={70} height={140} fill="#1c2640" opacity={0.6} />
        ))}

        {/* the stadium sits low, so the sky above it is clear for the words */}
        <g transform="translate(0 190) scale(1 0.82)">
        {/* the far stand, the crowd in it, the roof over it */}
        <path d="M-20 300 Q800 250 1620 300 L1620 470 Q800 430 -20 470 Z" fill="#26324d" />
        <g className={s.crowd}>
          {CROWD.map((d, i) => (
            <rect
              key={i}
              x={d.x}
              y={d.y}
              width={4}
              height={5}
              fill={d.c}
              className={d.blink ? s.blink : undefined}
              style={d.blink ? ({ "--b": `${d.blink}s` } as CSSProperties) : undefined}
            />
          ))}
        </g>
        <path d="M-20 286 Q800 236 1620 286 L1620 300 Q800 250 -20 300 Z" fill="#1a2236" />
        {BANKS.map((b, i) => (
          <Bank key={i} x={b.x} y={b.y} i={i} progress={scrollYProgress} />
        ))}
        {/* flags in blue and gold along the fence */}
        {[180, 420, 700, 980, 1260, 1480].map((x, i) => (
          <g key={x} transform={`translate(${x} ${448 + Math.sin(x / 300) * 4})`}>
            <rect x={0} y={-34} width={2} height={34} fill="#d8d2c4" />
            <path className={s.flag} style={{ animationDelay: `${-i * 0.6}s` }} d="M2 -34 L32 -29 L2 -22 Z" fill={i % 2 ? "#d7a83a" : "#2e5fa8"} />
          </g>
        ))}

        {/* the field, the square, the pitch */}
        <ellipse cx={800} cy={760} rx={1020} ry={330} fill="url(#wk-grass)" />
        {Array.from({ length: 9 }, (_, i) => (
          <ellipse key={i} cx={800} cy={760} rx={1020 - i * 110} ry={330 - i * 36} fill="none" stroke="#6f9a52" strokeWidth={22} opacity={0.25} />
        ))}
        <motion.ellipse cx={800} cy={760} rx={1020} ry={330} fill="url(#wk-lit)" style={{ opacity: field }} />
        <ellipse cx={800} cy={720} rx={320} ry={90} fill="none" stroke="#e8eadf" strokeWidth={2} opacity={0.6} />
        <path d="M776 640 L824 640 L838 800 L762 800 Z" fill="#cdb98c" />
        <rect x={770} y={652} width={60} height={2} fill="#f4f1e6" />
        <rect x={758} y={786} width={84} height={2} fill="#f4f1e6" />
        {/* players: two at the crease, the bowler walking back, the field set */}
        {[
          [800, 652, 0.7],
          [800, 790, 1],
          [812, 820, 1],
          [560, 690, 0.8],
          [1080, 700, 0.8],
          [430, 800, 1.05],
          [1180, 820, 1.05],
          [900, 600, 0.65],
          [660, 590, 0.65],
        ].map(([x, y, k], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${k})`}>
            <ellipse cx={0} cy={1} rx={7} ry={2} fill="#000" opacity={0.2} />
            <rect x={-3} y={-22} width={6} height={22} rx={2} fill={i < 2 ? "#f2efe6" : "#2e5fa8"} />
            <circle cx={0} cy={-26} r={3.4} fill="#6b4a36" />
          </g>
        ))}

        </g>

        {/* the stand we are in: rows of seats running out of the bottom of the frame */}
        {NEAR_ROWS.map((r) => {
          const y = 920 + r * 26;
          return (
            <g key={r}>
              <path d={`M-20 ${y} Q800 ${y - 70} 1620 ${y} L1620 ${y + 26} Q800 ${y - 44} -20 ${y + 26} Z`} fill={r % 2 ? "#23447a" : "#2a5190"} />
              <path d={`M-20 ${y} Q800 ${y - 70} 1620 ${y}`} stroke="#14223d" strokeWidth={3} fill="none" />
            </g>
          );
        })}
      </Paint>
    </section>
  );
}
