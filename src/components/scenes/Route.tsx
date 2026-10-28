"use client";

import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { ROUTE } from "@/lib/content";
import { useNarrow } from "@/lib/hooks";
import { Paint, q, rng } from "./parts";
import s from "./Route.module.css";

/*
 * The ride in, late morning, on a Western line local. Every detour is a station. Scrolling moves the
 * train; it pulls in, waits at each platform while that part of the story is told, then pulls out.
 * The train holds still on screen and the city slides past it, nearer things faster.
 */

const STEP = 1500; // world units between stations
const STOPS = ROUTE.stops.length;
const SPAN = (STOPS - 1) * STEP;
const BOARD_X = 330; // where a station's board sits on screen while the train waits
const RAIL = 862;

// The camera's travel for a scroll progress: dwell at each stop, ease between them.
function travel(p: number) {
  const u = Math.min(Math.max(p, 0), 1) * (STOPS - 1);
  const i = Math.min(Math.floor(u), STOPS - 2);
  const f = u - i;
  const t = Math.min(Math.max((f - 0.28) / 0.5, 0), 1);
  const e = t * t * (3 - 2 * t);
  return (i + e) * STEP;
}

function layer(c: MotionValue<number>, k: number) {
  return (v: number) => v * k;
}

// The city behind the line, far and near. Laid out once.
const CITY = (() => {
  const r = rng(41);
  const far: { x: number; w: number; h: number; tone: number }[] = [];
  for (let x = -SPAN * 0.3 - 400; x < 2000; ) {
    const w = 30 + r() * 60;
    far.push({ x: q(x), w: q(w), h: q(60 + r() * (r() < 0.2 ? 260 : 120)), tone: r() });
    x += w + r() * 10;
  }
  const mid: { x: number; w: number; h: number; tank: boolean; tone: number; floors: number }[] = [];
  for (let x = -SPAN * 0.62 - 400; x < 2000; ) {
    const w = 90 + r() * 120;
    const floors = 2 + Math.floor(r() * 4);
    mid.push({ x: q(x), w: q(w), h: floors * 34 + 10, tank: r() < 0.6, tone: r(), floors });
    x += w + 8 + r() * 30;
  }
  const masts: number[] = [];
  for (let x = -SPAN - 400; x < 2000; x += 260) masts.push(x);
  const trees: { x: number; r: number }[] = [];
  for (let x = -SPAN * 0.62 - 400; x < 2000; x += 180 + r() * 260) trees.push({ x: q(x), r: q(26 + r() * 22) });
  return { far, mid, masts, trees };
})();

function City() {
  const ground = RAIL - 120;
  return (
    <>
      <g data-layer="far">
        {CITY.far.map((b, i) => (
          <rect key={i} x={b.x} y={ground - 40 - b.h} width={b.w} height={b.h + 40} fill={b.tone > 0.5 ? "#c4c7bd" : "#b9beb6"} />
        ))}
      </g>
    </>
  );
}

function Mid() {
  const ground = RAIL - 70;
  return (
    <>
      {CITY.trees.map((t, i) => (
        <g key={`t${i}`}>
          <rect x={t.x - 3} y={ground - t.r} width={6} height={t.r} fill="#5a4a3a" />
          <circle cx={t.x} cy={ground - t.r * 1.5} r={t.r} fill="#6f8a55" />
          <circle cx={t.x + t.r * 0.35} cy={ground - t.r * 1.75} r={t.r * 0.6} fill="#8fa66a" />
        </g>
      ))}
      {CITY.mid.map((b, i) => {
        const top = ground - b.h;
        const wall = b.tone < 0.33 ? "#e2d3b5" : b.tone < 0.66 ? "#d9c6a3" : "#cbd0c4";
        return (
          <g key={i}>
            <rect x={b.x} y={top} width={b.w} height={b.h} fill={wall} />
            {/* the sun is high and to the right: a lit edge, a shaded side */}
            <rect x={b.x + b.w - 8} y={top} width={8} height={b.h} fill="#000" opacity={0.08} />
            <rect x={b.x} y={top} width={b.w} height={4} fill="#fff" opacity={0.25} />
            {Array.from({ length: b.floors }, (_, f) => (
              <g key={f}>
                <rect x={b.x + 6} y={top + 12 + f * 34} width={b.w - 12} height={14} fill="#5b6266" opacity={0.55} />
                <rect x={b.x + 6} y={top + 26 + f * 34} width={b.w - 12} height={3} fill="#9b8f78" />
              </g>
            ))}
            {b.tank && (
              <g>
                <rect x={b.x + b.w * 0.6} y={top - 18} width={16} height={18} rx={3} fill="#2a2c2e" />
                <rect x={b.x + b.w * 0.6} y={top - 18} width={16} height={3} rx={1.5} fill="#55595c" />
              </g>
            )}
          </g>
        );
      })}
    </>
  );
}

function Near() {
  return (
    <>
      {/* catenary masts; the wires themselves run unbroken across the frame */}
      {CITY.masts.map((x) => (
        <g key={x}>
          <rect x={x} y={RAIL - 270} width={7} height={270} fill="#5f6a6e" />
          <rect x={x - 40} y={RAIL - 262} width={60} height={5} fill="#5f6a6e" />
        </g>
      ))}
      {/* a platform at every stop, with its roof and its board */}
      {ROUTE.stops.map((stop, i) => {
        const x = BOARD_X - i * -STEP; // stations sit further back the further in we go
        const px = -i * STEP + BOARD_X;
        return (
          <g key={stop.station} data-x={x}>
            <rect x={px - 520} y={RAIL - 30} width={1500} height={34} fill="#cfc6b3" />
            <rect x={px - 520} y={RAIL - 30} width={1500} height={5} fill="#f0d24a" />
            {/* the roof on its columns */}
            {[0, 1, 2, 3, 4, 5].map((c) => (
              <rect key={c} x={px - 480 + c * 280} y={RAIL - 250} width={9} height={220} fill="#3f6b5c" />
            ))}
            <path d={`M${px - 540} ${RAIL - 250} L${px + 1000} ${RAIL - 250} L${px + 1000} ${RAIL - 268} L${px - 540} ${RAIL - 284} Z`} fill="#8a8f8a" />
            <rect x={px - 540} y={RAIL - 252} width={1540} height={4} fill="#5d625e" />
            {/* the board: yellow, black letters, hung from the roof */}
            <g transform={`translate(${px} ${RAIL - 230})`}>
              <rect x={-3} y={-18} width={3} height={22} fill="#3a3a3a" />
              <rect x={237} y={-18} width={3} height={22} fill="#3a3a3a" />
              <rect x={-30} y={0} width={300} height={74} fill="#f5c518" />
              <rect x={-30} y={70} width={300} height={4} fill="#c99e0c" />
              <text x={120} y={stop.year ? 40 : 48} textAnchor="middle" className={s.boardName}>
                {stop.station}
              </text>
              {stop.year && (
                <text x={120} y={62} textAnchor="middle" className={s.boardYear}>
                  {stop.year}
                </text>
              )}
            </g>
          </g>
        );
      })}
    </>
  );
}

function Coach({ x, cab }: { x: number; cab?: boolean }) {
  const top = RAIL - 150;
  const w = 380;
  return (
    <g transform={`translate(${x} 0)`}>
      {/* bogies */}
      {[46, w - 86].map((b) => (
        <g key={b}>
          <rect x={b} y={RAIL - 26} width={44} height={14} fill="#2b2d2f" />
          <circle cx={b + 8} cy={RAIL - 8} r={9} fill="#232526" />
          <circle cx={b + 36} cy={RAIL - 8} r={9} fill="#232526" />
        </g>
      ))}
      <path
        d={
          cab
            ? `M26 ${top + 4} Q4 ${top + 8} 0 ${top + 46} L0 ${RAIL - 24} L${w} ${RAIL - 24} L${w} ${top} L40 ${top} Z`
            : `M0 ${top} L${w} ${top} L${w} ${RAIL - 24} L0 ${RAIL - 24} Z`
        }
        fill="#ece4d1"
      />
      {/* the roof catches the sun */}
      <rect x={cab ? 30 : 0} y={top - 8} width={cab ? w - 30 : w} height={10} rx={4} fill="#a9aca8" />
      <rect x={0} y={RAIL - 66} width={w} height={42} fill="#7b2a33" />
      <rect x={0} y={RAIL - 70} width={w} height={4} fill="#d8b04a" />
      {/* barred windows */}
      {[78, 128, 236, 286].map((wx) => (
        <g key={wx}>
          <rect x={wx} y={top + 26} width={38} height={34} rx={3} fill="#2f3539" />
          {[0, 1, 2, 3].map((b) => (
            <rect key={b} x={wx + 4 + b * 9} y={top + 26} width={2} height={34} fill="#9aa0a0" />
          ))}
        </g>
      ))}
      {/* doors, open, as always, with someone in each */}
      {[176, 334].map((d) => (
        <g key={d}>
          <rect x={d} y={top + 14} width={44} height={RAIL - 24 - top - 14} fill="#22272b" />
          <rect x={d + 20} y={top + 14} width={3} height={RAIL - 38 - top - 14} fill="#b7b9b4" />
          <g transform={`translate(${d + 22} ${RAIL - 30})`}>
            <rect x={-9} y={-70} width={18} height={44} rx={7} fill={d === 176 ? "#3d6fa3" : "#d8d2c4"} />
            <circle cx={0} cy={-80} r={8} fill="#6b4a36" />
            <rect x={-7} y={-28} width={6} height={28} fill="#2c2f36" />
            <rect x={1} y={-28} width={6} height={28} fill="#2c2f36" />
            <rect x={5} y={-74} width={4} height={26} rx={2} fill="#6b4a36" transform="rotate(-28 5 -74)" />
          </g>
        </g>
      ))}
      {cab && (
        <g>
          <path d={`M6 ${top + 18} Q10 ${top + 12} 30 ${top + 12} L48 ${top + 12} L48 ${top + 50} L4 ${top + 50} Z`} fill="#2f3539" />
          <circle cx={14} cy={RAIL - 44} r={6} fill="#fff6d8" />
          <rect x={22} y={top - 1} width={84} height={13} fill="#1a1c1e" />
          <text x={64} y={top + 9} textAnchor="middle" className={s.cabBoard}>
            CHURCHGATE
          </text>
        </g>
      )}
      {/* a pantograph on the second coach */}
      {!cab && x < 1300 && (
        <path d={`M150 ${top - 8} L190 ${top - 40} L230 ${top - 8} M170 ${top - 40} L210 ${top - 40}`} stroke="#4a4f52" strokeWidth={3} fill="none" />
      )}
    </g>
  );
}

function World({ c }: { c: MotionValue<number> }) {
  const far = useTransform(c, layer(c, 0.3));
  const mid = useTransform(c, layer(c, 0.62));
  const near = useTransform(c, layer(c, 1));
  // the sleepers run under the train at full speed
  const sleepers = useTransform(c, (v) => `translate(${(v % 40).toFixed(1)} 0)`);
  return (
    <>
      <motion.g style={{ x: far }}>
        <City />
      </motion.g>
      <rect x={0} y={RAIL - 72} width={1600} height={80} fill="#b4ab94" />
      <motion.g style={{ x: mid }}>
        <Mid />
      </motion.g>
      {/* the wires: still, because they are continuous */}
      <path d={`M0 ${RAIL - 254} L1600 ${RAIL - 254} M0 ${RAIL - 236} L1600 ${RAIL - 236}`} stroke="#4f5559" strokeWidth={1.3} />
      <motion.g style={{ x: near }}>
        <Near />
      </motion.g>
      {/* the trackbed */}
      <rect x={0} y={RAIL + 4} width={1600} height={240} fill="#8b8273" />
      <motion.g transform={sleepers}>
        {Array.from({ length: 44 }, (_, i) => (
          <rect key={i} x={i * 40 - 40} y={RAIL + 4} width={22} height={9} fill="#5c554c" />
        ))}
      </motion.g>
      <rect x={0} y={RAIL} width={1600} height={4} fill="#c9c6bf" />
      <rect x={0} y={RAIL + 34} width={1600} height={210} fill="#7a7264" />
      <rect x={0} y={RAIL + 30} width={1600} height={4} fill="#b9b5ad" />
    </>
  );
}

export function Route() {
  const narrow = useNarrow();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const c = useTransform(scrollYProgress, travel);
  const [active, setActive] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const u = p * (STOPS - 1);
    const i = Math.min(Math.floor(u), STOPS - 1);
    const next = u - i > 0.52 ? Math.min(i + 1, STOPS - 1) : i;
    setActive(next);
  });

  return (
    <section ref={ref} className={s.route} style={{ height: `${STOPS * 80 + 40}vh` }} aria-label="How I got here">
      <div className={`scene ${s.stage}`}>
        <div className="zone">
          <h2 className="h-voice">{ROUTE.title}</h2>
          <div className={s.stops} aria-live="polite">
            {ROUTE.stops.map((stop, i) => (
              <p key={stop.station} className={`line ${s.stop}`} data-on={i === active ? "" : undefined} aria-hidden={i !== active}>
                {stop.line}
              </p>
            ))}
          </div>
        </div>

        <Paint viewBox={narrow ? "280 560 470 440" : "0 0 1600 1000"} className="scene-art" label="A Western line local train waiting at a station">
          <defs>
            <linearGradient id="rt-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#bcd3dc" />
              <stop offset="0.6" stopColor="#e9e3d3" />
              <stop offset="1" stopColor="#efe2c6" />
            </linearGradient>
          </defs>
          <rect width={1600} height={1000} fill="url(#rt-sky)" />
          <World c={c} />
          {/* on a phone the train pulls further up the platform, so its cab and the board share the frame */}
          <g transform={narrow ? "translate(-250 0)" : undefined}>
            <Coach x={760} cab />
            <Coach x={1144} />
            <Coach x={1528} />
          </g>
        </Paint>
      </div>
    </section>
  );
}
