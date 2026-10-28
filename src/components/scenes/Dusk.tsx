"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { ROLES, ROUTE } from "@/lib/content";
import { useNarrow } from "@/lib/hooks";
import { Paint, q, rng, useLive } from "./parts";
import s from "./Dusk.module.css";

/*
 * Dusk on the promenade, looking up the bay. The sun has gone and the sky is going from rose to navy.
 * Scrolling is the evening coming on: the street lamps along the curve light one by one, near to
 * far, until the whole Queen's Necklace is lit, and the windows behind come on with them. Each detour
 * in the story gets its stretch of lamps. The traffic keeps moving the whole time.
 */

const HZ = 552;
const STOPS = ROUTE.stops.length;
const LAMPS = 42;

// The curve of the bay: near and low on the right, far at the foot of Malabar Hill on the left.
const P0 = { x: 1720, y: 940 };
const P1 = { x: 980, y: 600 };
const P2 = { x: 420, y: HZ + 2 };
const at = (t: number) => ({
  x: (1 - t) * (1 - t) * P0.x + 2 * (1 - t) * t * P1.x + t * t * P2.x,
  y: (1 - t) * (1 - t) * P0.y + 2 * (1 - t) * t * P1.y + t * t * P2.y,
});
const size = (t: number) => 0.035 + 0.965 * Math.pow(1 - t, 1.9);
const CURVE = `M${P0.x} ${P0.y} Q${P1.x} ${P1.y} ${P2.x} ${P2.y}`;

// The road beside the wall, as a band that narrows with distance.
const ROAD = (() => {
  const top: string[] = [];
  const bot: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const p = at(t);
    const k = size(t);
    top.push(`${q(p.x)} ${q(p.y)}`);
    bot.push(`${q(p.x + 40 * k)} ${q(p.y + 150 * k)}`);
  }
  return `M${top.join(" L")} L${bot.reverse().join(" L")} Z`;
})();

const LAMP_AT = Array.from({ length: LAMPS }, (_, i) => {
  const t = Math.pow(i / (LAMPS - 1), 0.82) * 0.985;
  const p = at(t);
  return { x: q(p.x), y: q(p.y), k: size(t) };
});

// The fronts along the bay, and their windows; each window has its own moment to come on.
const FRONTS = (() => {
  const r = rng(17);
  const out: { x: number; y: number; w: number; h: number; wins: { x: number; y: number; w: number; h: number; on: number }[] }[] = [];
  for (let i = 0; i < 26; i++) {
    const t = Math.pow(i / 25, 0.9) * 0.98;
    const p = at(t);
    const k = size(t);
    const w = q(120 * k + 6);
    const h = q((150 + r() * 120) * k + 6);
    const x = q(p.x + 46 * k);
    const y = q(p.y + 150 * k - 2);
    const wins: { x: number; y: number; w: number; h: number; on: number }[] = [];
    if (k > 0.08) {
      const rows = Math.max(2, Math.floor(h / (22 * k + 4)));
      const cols = Math.max(2, Math.floor(w / (18 * k + 4)));
      for (let a = 0; a < rows; a++)
        for (let b = 0; b < cols; b++)
          if (r() < 0.55) wins.push({ x: q(x + 4 * k + b * (w / cols)), y: q(y - h + 6 * k + a * (h / rows)), w: q(Math.max(1, w / cols - 6 * k)), h: q(Math.max(1, h / rows - 9 * k)), on: r() });
    }
    out.push({ x, y, w, h, wins });
  }
  return out.reverse(); // far first, so near ones cover them
})();

function Lamp({ x, y, k, lit }: { x: number; y: number; k: number; lit: boolean }) {
  const h = 210 * k;
  return (
    <g className={s.lamp} data-lit={lit ? "" : undefined}>
      {/* its light on the water, a broken column below the wall */}
      <rect className={s.glow} x={x - 3 * k - 1} y={y + 4} width={6 * k + 2} height={70 * k + 14} fill="url(#dk-streak)" />
      <rect x={x - 2 * k} y={y - h} width={Math.max(0.8, 4 * k)} height={h} fill="#1a2234" />
      <path d={`M${x} ${y - h} q${18 * k} ${-6 * k} ${26 * k} ${2 * k}`} stroke="#1a2234" strokeWidth={Math.max(0.6, 3 * k)} fill="none" />
      <circle className={s.glow} cx={x + 26 * k} cy={y - h + 4 * k} r={34 * k + 5} fill="url(#dk-halo)" />
      <circle className={s.bulb} cx={x + 26 * k} cy={y - h + 4 * k} r={Math.max(0.9, 5 * k)} />
    </g>
  );
}

export function Dusk() {
  const narrow = useNarrow();
  const ref = useRef<HTMLElement>(null);
  const [stage, live] = useLive<HTMLDivElement>();
  const art = useRef<SVGSVGElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [lit, setLit] = useState(0);
  const [active, setActive] = useState(0);
  const night = useTransform(scrollYProgress, [0, 1], [0, 0.85]);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setLit(Math.round(Math.min(Math.max(p * 1.08, 0), 1) * LAMPS));
    setActive(Math.min(STOPS - 1, Math.max(0, Math.floor(p * STOPS))));
  });

  // the traffic is SMIL; hold it while the scene is off screen
  useEffect(() => {
    const svg = art.current;
    if (!svg) return;
    if (live) svg.unpauseAnimations();
    else svg.pauseAnimations();
  }, [live]);

  const share = lit / LAMPS;

  return (
    <section ref={ref} id="experience" className={s.dusk} aria-labelledby="dusk-title">
      <div className={s.track} style={{ height: `${STOPS * 70 + 60}vh` }}>
        <div ref={stage} className={`scene ${s.stage}`}>
          <div className="zone">
            <h2 id="dusk-title" className="h-voice">
              {ROUTE.title}
            </h2>
            <div className={s.stops} aria-live="polite">
              {ROUTE.stops.map((stop, i) => (
                <div key={stop.station} className={s.stop} data-on={i === active ? "" : undefined} aria-hidden={i !== active}>
                  <p className={s.where}>
                    {stop.station}
                    {stop.year && `, ${stop.year}`}
                  </p>
                  <p className="line">{stop.line}</p>
                </div>
              ))}
            </div>
          </div>

          <Paint ref={art} viewBox={narrow ? "560 380 1040 620" : "0 0 1600 1000"} className="scene-art" label="Marine Drive at dusk, the street lamps along the bay coming on one by one">
            <defs>
              <linearGradient id="dk-sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#27345a" />
                <stop offset="0.5" stopColor="#6d5f86" />
                <stop offset="0.85" stopColor="#d48a78" />
                <stop offset="1" stopColor="#f0b07a" />
              </linearGradient>
              <linearGradient id="dk-night" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#0d1a2b" />
                <stop offset="0.8" stopColor="#1b2a48" />
                <stop offset="1" stopColor="#3b3550" />
              </linearGradient>
              <radialGradient id="dk-last" cx="240" cy={HZ} r="700" gradientUnits="userSpaceOnUse" gradientTransform={`translate(240 ${HZ}) scale(1 0.32) translate(-240 ${-HZ})`}>
                <stop offset="0" stopColor="#f6c08a" stopOpacity="0.6" />
                <stop offset="1" stopColor="#f6c08a" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="dk-sea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#5b5a78" />
                <stop offset="1" stopColor="#131d31" />
              </linearGradient>
              <radialGradient id="dk-halo">
                <stop offset="0" stopColor="#f2a145" stopOpacity="0.55" />
                <stop offset="1" stopColor="#f2a145" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="dk-streak" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#f2a145" stopOpacity="0.6" />
                <stop offset="1" stopColor="#f2a145" stopOpacity="0" />
              </linearGradient>
            </defs>

            <rect width={1600} height={HZ + 2} fill="url(#dk-sky)" />
            <motion.rect width={1600} height={HZ + 2} fill="url(#dk-night)" style={{ opacity: night }} />
            {/* the last of the light, low over the sea */}
            <rect width={1600} height={HZ + 2} fill="url(#dk-last)" opacity={q(1 - share)} />

            <rect y={HZ} width={1600} height={1000 - HZ} fill="url(#dk-sea)" />
            <motion.rect y={HZ} width={1600} height={1000 - HZ} fill="#0b1424" style={{ opacity: night }} />
            {/* the sea moving, slow bands of light */}
            <g className={s.swell}>
              {Array.from({ length: 10 }, (_, i) => {
                const d = i / 9;
                return <rect key={i} x={-40} y={q(HZ + 8 + Math.pow(d, 1.7) * 420)} width={1700} height={q(1 + d * 2)} fill="#e9c7a6" opacity={q(0.07 * (1 - share * 0.6))} />;
              })}
            </g>

            {/* Malabar Hill, already dark, its towers lighting */}
            <path d={`M180 ${HZ + 4} C240 ${HZ - 40} 330 ${HZ - 62} 430 ${HZ - 44} C500 ${HZ - 30} 540 ${HZ - 12} 580 ${HZ + 4} Z`} fill="#202a40" />
            {[
              [250, 54],
              [290, 80],
              [338, 64],
              [380, 96],
              [430, 70],
              [476, 52],
            ].map(([x, h], i) => (
              <g key={x}>
                <rect x={x} y={HZ - 30 - h} width={16} height={h + 26} fill="#1d2639" />
                {Array.from({ length: Math.floor(h / 10) }, (_, f) => (
                  <rect key={f} x={x + 4} y={HZ - 24 - h + f * 10} width={8} height={2} fill="#f2c27a" opacity={(f + i) % 3 === 0 && share > 0.2 + f * 0.04 ? 0.85 : 0} className={s.win} />
                ))}
              </g>
            ))}

            {/* the fronts behind the road, windows coming on with the lamps */}
            {FRONTS.map((f, i) => (
              <g key={i}>
                <rect x={f.x} y={f.y - f.h} width={f.w} height={f.h} fill="#2a3045" />
                <rect x={f.x} y={f.y - f.h} width={Math.max(0.6, f.w * 0.06)} height={f.h} fill="#d99c84" opacity={q(0.35 * (1 - share))} />
                {f.wins.map((w, j) => (
                  <rect key={j} className={s.win} x={w.x} y={w.y} width={w.w} height={w.h} fill="#f4c27c" opacity={w.on < share * 0.8 ? 0.9 : 0} />
                ))}
              </g>
            ))}

            {/* the road, and the traffic on it */}
            <path d={ROAD} fill="#161c2b" />
            <path d={CURVE} stroke="#b9ae9c" strokeWidth={3} fill="none" opacity={0.7} />
            <g>
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <g key={i}>
                  <circle r={2.2} fill={i % 2 ? "#ff6a4a" : "#fff1d0"}>
                    <animateMotion dur={`${26 + i * 3}s`} begin={`${-i * 4.5}s`} repeatCount="indefinite" keyPoints={i % 2 ? "0;1" : "1;0"} keyTimes="0;1" calcMode="linear" path={`M${P0.x - 6} ${P0.y + 60} Q${P1.x + 10} ${P1.y + 26} ${P2.x + 6} ${P2.y + 4}`} />
                  </circle>
                </g>
              ))}
            </g>

            {/* the lamps, far to near so the near ones stand in front */}
            {LAMP_AT.map((l, i) => ({ ...l, i }))
              .reverse()
              .map((l) => (
                <Lamp key={l.i} x={l.x} y={l.y} k={l.k} lit={l.i < lit} />
              ))}
          </Paint>
        </div>
      </div>

      {/* where he has worked, plainly, under the lamps */}
      <div className={s.roles}>
        <h3 className={s.rolesHead}>Where I&apos;ve worked</h3>
        <ol className={s.list}>
          {ROLES.map((r) => (
            <li key={r.company} className={s.role} data-reveal>
              <p className={s.period}>{r.period}</p>
              <div>
                <p className={s.company}>
                  {r.href ? (
                    <a className="tlink" href={r.href} target="_blank" rel="noreferrer">
                      {r.company}
                    </a>
                  ) : (
                    r.company
                  )}
                </p>
                <p className={s.title}>{r.role}</p>
                {r.points.length > 0 && (
                  <ul className={s.points}>
                    {r.points.map((pt) => (
                      <li key={pt}>{pt}</li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
