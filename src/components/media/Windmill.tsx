"use client";

import { useEffect, useId, useRef } from "react";
import { useReducedMotion } from "@/lib/hooks";
import s from "./Windmill.module.css";

// One breath round: each phase holds for its count plus a 0.6s cross-fade.
const PHASES = [
  { name: "Inhale", secs: 3 },
  { name: "Hold", secs: 2 },
  { name: "Exhale", secs: 4 },
  { name: "Relax", secs: 2 },
];
const DUR = PHASES.map((p) => p.secs + 0.6);
const CYCLE = DUR.reduce((a, b) => a + b, 0);
const EXHALE_AT = DUR[0] + DUR[1];
const RELAX_AT = EXHALE_AT + DUR[2];
// Where the loop starts, and the still frame shown when paused: just into the inhale.
const START = DUR[0] + 0.3;
const ROUNDS = 4;

const HUB = { x: 146, y: 84 };

// Progress bar: four segments, 58 wide in total, with 2-unit gaps.
const SEG_W = DUR.map((d) => (d / CYCLE) * 58);
const SEG_X = SEG_W.map((_, i) => SEG_W.slice(0, i).reduce((a, w) => a + w + 2, 0));

type Refs = {
  rotor: SVGGElement | null;
  cue: SVGGElement | null;
  far: SVGGElement | null;
  near: SVGGElement | null;
  phase: SVGTextElement | null;
  count: SVGTextElement | null;
  round: SVGTextElement | null;
  fills: (SVGRectElement | null)[];
};

const setText = (el: SVGTextElement | null, text: string) => {
  if (el && el.textContent !== text) el.textContent = text;
};

// Rotor angle within one cycle: still through inhale and hold, spins up on the exhale
// (accelerating for 2s, then steady), then coasts to a stop over the relax. 920 degrees a cycle.
function spin(t: number) {
  if (t < EXHALE_AT) return 0;
  if (t < RELAX_AT) {
    const e = t - EXHALE_AT;
    return e < 2 ? (100 * e * e) / 2 : 200 + 200 * (e - 2);
  }
  const e = Math.min(t - RELAX_AT, 2);
  return 720 + 200 * e - (100 * e * e) / 2;
}

function draw(r: Refs, time: number) {
  const n = Math.floor(time / CYCLE);
  const t = time - n * CYCLE;
  let i = 0;
  let local = t;
  while (i < 3 && local >= DUR[i]) local -= DUR[i++];
  const { name, secs } = PHASES[i];
  const fade = local < 0.3 ? local / 0.3 : local > DUR[i] - 0.3 ? (DUR[i] - local) / 0.3 : 1;
  const left = local < 0.3 ? secs : Math.max(1, secs - Math.floor(local - 0.3));
  const angle = ((920 * n + spin(t)) % 360) + 18;
  // Slow head sway; the cockpit HUD drifts about twice as far as the landscape.
  const sx = Math.sin((time / 17) * Math.PI * 2);
  const sy = Math.sin((time / 23) * Math.PI * 2);

  r.rotor?.setAttribute("transform", `translate(${HUB.x} ${HUB.y}) rotate(${angle.toFixed(2)})`);
  r.far?.setAttribute("transform", `translate(${(6 * sx).toFixed(2)} ${(3 * sy).toFixed(2)})`);
  r.near?.setAttribute("transform", `translate(${(11 * sx).toFixed(2)} ${(5.5 * sy).toFixed(2)})`);
  r.cue?.setAttribute("opacity", Math.max(0, Math.min(1, fade)).toFixed(3));
  setText(r.phase, name);
  setText(r.count, `for ${left} second${left === 1 ? "" : "s"}`);
  setText(r.round, `Round: ${(n % ROUNDS) + 1}/${ROUNDS}`);
  r.fills.forEach((el, k) => {
    const p = k < i ? 1 : k > i ? 0 : local / DUR[i];
    el?.setAttribute("transform", `translate(${SEG_X[k].toFixed(2)} 0) scale(${p.toFixed(4)} 1)`);
  });
}

// A Quest Touch controller, seen from above the grip.
function Controller({ x, y, rot }: { x: number; y: number; rot: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d="M-8.5 40L-7.5-3c0-9 15-9 15 0L8.5 40z" fill="#b9bcbd" />
      <path d="M-8.5 40L-7.5-3c0-4 3-6.5 7.5-7L0 40z" fill="#8d9195" />
      <circle cy="-1" r="3" fill="#2a2e33" stroke="#e6e7e4" strokeWidth=".7" />
      <ellipse cy="-11" rx="13" ry="6.5" fill="none" stroke="#c9cbca" strokeWidth="3.4" />
      <ellipse cy="-9.6" rx="13" ry="6.5" fill="none" stroke="#6f7479" strokeWidth=".7" />
      <ellipse cy="-12.4" rx="13" ry="6.5" fill="none" stroke="#f2f2ee" strokeWidth=".6" />
    </g>
  );
}

export function WindmillMedia({ active }: { active: boolean }) {
  const reduced = useReducedMotion();
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const id = (name: string) => `wm${uid}${name}`;
  const refs = useRef<Refs>({
    rotor: null,
    cue: null,
    far: null,
    near: null,
    phase: null,
    count: null,
    round: null,
    fills: [],
  });

  useEffect(() => {
    const r = refs.current;
    draw(r, START);
    if (!active || reduced) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      draw(r, START + (now - t0) / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, reduced]);

  return (
    <div
      className={s.root}
      aria-label="Windmill VR seen through a Meta Quest headset: the turbine turns on each exhale"
    >
      <svg viewBox="0 0 440 294" preserveAspectRatio="xMidYMid meet" className={s.scene} aria-hidden>
        <defs>
          <linearGradient id={id("sky")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2c4a73" />
            <stop offset=".62" stopColor="#7f9dbf" />
            <stop offset="1" stopColor="#d4d9d7" />
          </linearGradient>
          <linearGradient id={id("ground")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8b8c7b" />
            <stop offset=".16" stopColor="#5f604e" />
            <stop offset="1" stopColor="#1f211a" />
          </linearGradient>
          <linearGradient id={id("haze")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#eef0ea" stopOpacity="0" />
            <stop offset=".55" stopColor="#eef0ea" stopOpacity=".42" />
            <stop offset="1" stopColor="#eef0ea" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={id("pole")} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#8f98a3" />
            <stop offset=".55" stopColor="#f3f0e8" />
            <stop offset="1" stopColor="#d9d5cb" />
          </linearGradient>
          <linearGradient id={id("panel")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#10161f" stopOpacity=".62" />
            <stop offset="1" stopColor="#0b1017" stopOpacity=".5" />
          </linearGradient>
          <linearGradient id={id("ray")} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#dfe9f5" stopOpacity="0" />
            <stop offset="1" stopColor="#dfe9f5" stopOpacity=".75" />
          </linearGradient>
          <radialGradient id={id("lens")} cx=".5" cy=".48" r=".72">
            <stop offset=".58" stopColor="#06080b" stopOpacity="0" />
            <stop offset=".88" stopColor="#06080b" stopOpacity=".5" />
            <stop offset="1" stopColor="#06080b" stopOpacity=".92" />
          </radialGradient>

          {/* The world: sky, hills, ground and the turbine. */}
          <g id={id("far")}>
            <g
              ref={(el) => {
                refs.current.far = el;
              }}
            >
              <rect x="-140" y="-20" width="500" height="172" fill={`url(#${id("sky")})`} />
              <path
                d="M-140 152c40-12 80-12 120-8s52-14 80-10 50-8 78-6 44 6 64 10 50-10 90-6 40 6 68 8v10h-500z"
                fill="#8a97a0"
                opacity=".45"
              />
              <rect x="-140" y="148" width="500" height="130" fill={`url(#${id("ground")})`} />
              <rect x="-140" y="134" width="500" height="28" fill={`url(#${id("haze")})`} />
              <ellipse cx="141" cy="200" rx="24" ry="3.6" fill="#15170f" opacity=".32" />
              <rect x={HUB.x - 1.5} y={HUB.y} width="3" height="116" fill={`url(#${id("pole")})`} />
              <ellipse cx={HUB.x} cy="200" rx="8.5" ry="2" fill="#cfccc3" />
              <g
                ref={(el) => {
                  refs.current.rotor = el;
                }}
                transform={`translate(${HUB.x} ${HUB.y}) rotate(18)`}
              >
                {[0, 120, 240].map((a) => (
                  <g key={a} transform={`rotate(${a})`}>
                    <rect x="-.55" y="-5.5" width="1.1" height="4" fill="#c9c7c0" />
                    <rect x="-1.5" y="-46" width="3" height="41" rx=".4" fill="#f1eee7" />
                    <rect x="-1.5" y="-46" width=".8" height="41" fill="#a9b0b8" opacity=".55" />
                  </g>
                ))}
                <circle r="3.1" fill="#e9e6de" stroke="#8f98a3" strokeOpacity=".5" strokeWidth=".5" />
              </g>
            </g>
          </g>

          {/* The cockpit: the floating breath panel, the pointer ray and both controllers. */}
          <g id={id("near")}>
            <g
              ref={(el) => {
                refs.current.near = el;
              }}
            >
              <g transform="translate(14 66) skewY(5)">
                <rect
                  width="86"
                  height="74"
                  rx="9"
                  fill={`url(#${id("panel")})`}
                  stroke="#e8eef5"
                  strokeOpacity=".22"
                  strokeWidth=".7"
                />
                <text
                  ref={(el) => {
                    refs.current.round = el;
                  }}
                  x="10"
                  y="17"
                  className={s.mono}
                  fontSize="9.6"
                  letterSpacing=".6"
                  fill="#e8eef5"
                  fillOpacity=".62"
                />
                <g
                  ref={(el) => {
                    refs.current.cue = el;
                  }}
                >
                  <text
                    ref={(el) => {
                      refs.current.phase = el;
                    }}
                    x="9.5"
                    y="42"
                    className={s.sans}
                    fontSize="20"
                    fontWeight="500"
                    letterSpacing="-.4"
                    fill="#f4f1ea"
                  />
                  <text
                    ref={(el) => {
                      refs.current.count = el;
                    }}
                    x="10"
                    y="55"
                    className={s.sans}
                    fontSize="10"
                    fill="#f4f1ea"
                    fillOpacity=".72"
                  />
                </g>
                <g transform="translate(10 63)">
                  {SEG_W.map((w, k) => (
                    <g key={k}>
                      <rect x={SEG_X[k]} width={w} height="1.6" rx=".8" fill="#e8eef5" fillOpacity=".2" />
                      <rect
                        ref={(el) => {
                          refs.current.fills[k] = el;
                        }}
                        width={w}
                        height="1.6"
                        rx=".8"
                        fill={k === 2 ? "#2fbf8a" : "#e8eef5"}
                        fillOpacity={k === 2 ? 1 : 0.8}
                        transform={`translate(${SEG_X[k]} 0) scale(0 1)`}
                      />
                    </g>
                  ))}
                </g>
              </g>
              <path d="M157 222L94 141" stroke={`url(#${id("ray")})`} strokeWidth="1.2" strokeLinecap="round" />
              <circle cx="94" cy="141" r="3.2" fill="none" stroke="#eef3f9" strokeOpacity=".85" strokeWidth=".9" />
              <circle cx="94" cy="141" r="1" fill="#eef3f9" />
              <Controller x={40} y={240} rot={14} />
              <Controller x={168} y={236} rot={-38} />
            </g>
          </g>
        </defs>

        <g transform="translate(64 -40) scale(1.5)">
          <use href={`#${id("far")}`} />
          <use href={`#${id("near")}`} />
        </g>
        <rect width="440" height="294" fill={`url(#${id("lens")})`} />
        <circle cx="16" cy="16" r="2.4" fill="#2fbf8a" />
        <text x="24" y="19.4" className={s.mono} fontSize="9.8" letterSpacing="1.1" fill="#e8eef5" fillOpacity=".62">
          META QUEST · WINDMILL VR
        </text>
      </svg>
    </div>
  );
}
