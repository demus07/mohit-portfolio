"use client";

import { ABOUT } from "@/lib/content";
import { useNarrow } from "@/lib/hooks";
import { Gull, Paint, q, rng, useLive } from "./parts";
import s from "./Promenade.module.css";

/*
 * Marine Drive, mid afternoon. Out of the station and across the road to the sea wall. The sun is
 * high over the water on the left and lays a path of light across it; the bay curves away to the
 * right, a line of Art Deco fronts running along it to Malabar Hill. On the parapet, a cutting chai.
 * Nothing is pinned here. The water glints, a boat crosses slowly, two gulls turn.
 */

const HZ = 540; // the horizon
const WALL = 876; // the top of the parapet

const SUN = { x: 820, y: 190 };

// The fronts along the bay, near and big on the right, small and pale where they meet the hill.
const FRONTS = (() => {
  const r = rng(7);
  const tints = ["#f1e4c9", "#ecdcb4", "#ead3c3", "#dfe1d6", "#f3e9d6"];
  const out: { x: number; y: number; w: number; h: number; tint: string; haze: number; floors: number; round: boolean }[] = [];
  for (let i = 0; i < 18; i++) {
    const t = i / 17; // 0 is far, 1 is near
    const e = Math.pow(t, 1.7);
    const x = 880 + (1640 - 880) * Math.pow(t, 0.9);
    const y = HZ + 6 + 120 * e;
    const w = 14 + 150 * e + r() * 10 * t;
    const h = 10 + 190 * e + r() * 24 * t;
    out.push({ x: q(x - w), y: q(y), w: q(w), h: q(h), tint: tints[Math.floor(r() * tints.length)], haze: q(0.55 * (1 - t)), floors: Math.max(2, Math.round(h / 18)), round: r() < 0.5 });
  }
  return out;
})();

function Bay() {
  return (
    <g>
      {/* Malabar Hill, blue with distance, a few towers on it */}
      <path d={`M700 ${HZ + 4} C760 ${HZ - 30} 840 ${HZ - 44} 920 ${HZ - 30} C960 ${HZ - 22} 990 ${HZ - 8} 1010 ${HZ + 4} Z`} fill="#b8c2c2" />
      {[
        [760, 46],
        [790, 64],
        [826, 52],
        [868, 70],
        [902, 40],
      ].map(([x, h]) => (
        <rect key={x} x={x} y={HZ - 26 - h} width={12} height={h + 20} fill="#b2bcbd" />
      ))}
      {/* the fronts, far to near */}
      {FRONTS.map((f, i) => (
        <g key={i}>
          <rect x={f.x} y={f.y - f.h} width={f.w} height={f.h} rx={f.round ? Math.min(f.w * 0.12, 14) : 0} fill={f.tint} />
          {/* the sun is over the sea, on their left */}
          <rect x={f.x} y={f.y - f.h} width={Math.max(1, f.w * 0.08)} height={f.h} fill="#fff8e8" opacity={0.6} />
          {f.w > 40 &&
            Array.from({ length: f.floors - 1 }, (_, k) => (
              <rect key={k} x={f.x + f.w * 0.06} y={f.y - f.h + 8 + k * (f.h / f.floors)} width={f.w * 0.88} height={Math.max(1, f.h / f.floors / 5)} fill="#a8957a" opacity={0.45} />
            ))}
          {f.w > 70 && <rect x={f.x + f.w * 0.42} y={f.y - f.h - 10} width={f.w * 0.16} height={12} fill={f.tint} />}
          <rect x={f.x} y={f.y - f.h} width={f.w} height={f.h} fill="#d9dfe0" opacity={f.haze} />
        </g>
      ))}
      {/* the road and the sea wall along the bay, the tetrapods at its foot */}
      <path d={`M880 ${HZ + 8} Q1200 ${HZ + 40} 1640 ${HZ + 140} L1640 ${HZ + 156} Q1200 ${HZ + 52} 880 ${HZ + 12} Z`} fill="#c9c3b6" />
      <path d={`M880 ${HZ + 12} Q1200 ${HZ + 52} 1640 ${HZ + 156} L1640 ${HZ + 166} Q1200 ${HZ + 60} 880 ${HZ + 14} Z`} fill="#8c8c86" />
    </g>
  );
}

function Sea() {
  const r = rng(3);
  const glints = Array.from({ length: 70 }, () => {
    const d = r(); // 0 at the horizon, 1 at the wall
    const y = HZ + 6 + Math.pow(d, 1.6) * (WALL - HZ - 10);
    const spread = 20 + d * 260;
    return { x: q(SUN.x + (r() - 0.5) * spread * 2), y: q(y), w: q(6 + d * 46 * r()), o: q(0.35 + r() * 0.5), delay: q(r() * 4) };
  });
  return (
    <g>
      <rect y={HZ} width={1600} height={WALL - HZ} fill="url(#pr-sea)" />
      {/* swell, faint lines that widen as they come in */}
      {Array.from({ length: 12 }, (_, i) => {
        const d = i / 11;
        const y = HZ + 10 + Math.pow(d, 1.7) * (WALL - HZ - 20);
        return <rect key={i} x={-20} y={q(y)} width={1660} height={q(1 + d * 2.5)} fill="#1d4f68" opacity={0.08} />;
      })}
      <g className={s.glints}>
        {glints.map((g, i) => (
          <rect key={i} x={g.x} y={g.y} width={g.w} height={1.6} fill="#fff6e0" opacity={g.o} style={{ animationDelay: `${-g.delay}s` }} />
        ))}
      </g>
    </g>
  );
}

// A fishing boat crossing far out, slow enough that it is hard to see it move.
function Boat() {
  return (
    <g className={s.boat}>
      <g transform={`translate(0 ${HZ + 14})`}>
        <path d="M-26 0 L26 0 L20 7 L-20 7 Z" fill="#5d4d3f" />
        <rect x={-2} y={-26} width={2} height={26} fill="#5d4d3f" />
        <path d="M0 -26 L16 -4 L0 -4 Z" fill="#e9dfcf" />
      </g>
    </g>
  );
}

// The parapet we lean on, with a cutting chai on it. The glass is half full and still warm.
function Parapet() {
  return (
    <g>
      <rect y={WALL} width={1600} height={1000 - WALL} fill="#c8bfae" />
      <rect y={WALL} width={1600} height={10} fill="#e3dbcb" />
      <rect y={WALL + 10} width={1600} height={20} fill="#000" opacity={0.06} />
      {/* the chai */}
      <g transform={`translate(1250 ${WALL + 4})`}>
        <ellipse cx={0} cy={0} rx={30} ry={5} fill="#000" opacity={0.08} />
        <path d="M-20 -78 L20 -78 L15 0 L-15 0 Z" fill="#f4efe4" opacity={0.55} />
        <path d="M-17.5 -46 L17.5 -46 L15 0 L-15 0 Z" fill="#b8763f" />
        <path d="M-17.5 -46 L17.5 -46 L17 -40 L-17 -40 Z" fill="#d79a62" />
        {/* the glass is fluted: thin lit ridges */}
        {[-14, -7, 0, 7, 14].map((x) => (
          <path key={x} d={`M${x} -78 L${x * 0.76} 0`} stroke="#fff" strokeWidth={1.2} opacity={0.35} />
        ))}
        <path d="M-20 -78 L20 -78" stroke="#fff" strokeWidth={1.6} opacity={0.6} />
        {/* steam */}
        <g className={s.steam} fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round">
          <path d="M-5 -88 C-12 -100 2 -108 -4 -122" />
          <path d="M6 -90 C0 -104 12 -110 6 -128" />
        </g>
      </g>
    </g>
  );
}

export function Promenade() {
  const narrow = useNarrow();
  const [ref] = useLive<HTMLElement>();
  return (
    <section ref={ref} id="about" className={`scene ${s.promenade}`} aria-labelledby="about-title">
      <div className="zone">
        <h2 id="about-title" className="h-voice" data-reveal>
          {ABOUT.title}
        </h2>
        <p className="line" data-reveal style={{ "--d": 1 } as React.CSSProperties}>
          {ABOUT.line}
        </p>
        <p className="aside" data-reveal style={{ "--d": 2 } as React.CSSProperties}>
          {ABOUT.aside}
        </p>
      </div>
      <Paint viewBox={narrow ? "720 420 880 580" : "0 0 1600 1000"} className="scene-art" label="Marine Drive in the afternoon: the sea, the bay curving away to Malabar Hill, a cutting chai on the parapet">
        <defs>
          <linearGradient id="pr-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#a9c3cf" />
            <stop offset="0.6" stopColor="#e6e0cf" />
            <stop offset="1" stopColor="#efe5cf" />
          </linearGradient>
          <radialGradient id="pr-sun" cx={SUN.x} cy={SUN.y} r="560" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#fffaf0" stopOpacity="0.95" />
            <stop offset="0.12" stopColor="#fff2d6" stopOpacity="0.6" />
            <stop offset="1" stopColor="#fff2d6" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="pr-sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8fb0b8" />
            <stop offset="1" stopColor="#2c6d8c" />
          </linearGradient>
          <radialGradient id="pr-path" cx={SUN.x} cy={HZ + 160} r="380" gradientUnits="userSpaceOnUse" gradientTransform={`translate(${SUN.x} ${HZ + 160}) scale(0.7 1) translate(${-SUN.x} ${-HZ - 160})`}>
            <stop offset="0" stopColor="#fff4dc" stopOpacity="0.55" />
            <stop offset="1" stopColor="#fff4dc" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width={1600} height={HZ + 2} fill="url(#pr-sky)" />
        <rect width={1600} height={HZ + 2} fill="url(#pr-sun)" />
        <circle cx={SUN.x} cy={SUN.y} r={22} fill="#fffaf0" />
        <g className={s.gulls}>
          <Gull x={1010} y={250} size={1.1} color="#5b5f60" beat={1.7} />
          <Gull x={1060} y={232} size={0.8} color="#5b5f60" beat={2.1} />
        </g>
        <Sea />
        <rect y={HZ} width={1600} height={WALL - HZ} fill="url(#pr-path)" />
        <Boat />
        <Bay />
        <Parapet />
      </Paint>
    </section>
  );
}
