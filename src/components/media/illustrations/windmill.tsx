"use client";

import { useEffect, useId, useRef } from "react";
import { IllustrationTag } from "./tag";

/* ------------------------------------------------------------------ */
/*  Windmill VR, seen from inside the headset: one immersive view that  */
/*  drifts as the head looks around, near things moving more than far. */
/*  Mirrors Mohit-Bagri/windmill-vr (Unity): BreathControl.cs runs     */
/*  Inhale 3s, Hold 2s, Exhale 4s, Relax 2s, each wrapped in a 0.3s    */
/*  TextFader fade in/out, for 4 rounds, on a world-space text panel.  */
/*  Windmill.cs spins the rotor only from the exhale: +100 deg/s^2 up  */
/*  to 200 deg/s, then eases back to rest over 2s once it ends.        */
/*  The scene is drawn once and <use>d per eye with a small stereo     */
/*  offset (near layer shifts more than far), so one rAF drives both.  */
/* ------------------------------------------------------------------ */
const FADE = 0.3;
const PHASES = [
  { name: "Inhale", secs: 3 },
  { name: "Hold", secs: 2 },
  { name: "Exhale", secs: 4 },
  { name: "Relax", secs: 2 },
] as const;
const LEN = PHASES.map((p) => p.secs + 2 * FADE); // 3.6, 2.6, 4.6, 2.6
const CYCLE = LEN.reduce((a, b) => a + b, 0); // 13.4s
const EXHALE_AT = LEN[0] + LEN[1];
const RELAX_AT = EXHALE_AT + LEN[2];
const ROUNDS = 4;
const MAX = 200; // deg/s
const ACC = MAX / 2; // reaches max speed in 2s
const PER_CYCLE = 920; // total degrees turned in one breath
const START = LEN[0] + FADE; // open on "Hold", fully faded in: blades start within ~3s
const BASE_ANGLE = 18;

/* Turbine hub (scene units) and the phase bar inside the panel. */
const HUB = { x: 146, y: 84 };
const BAR_W = 64;
const GAP = 2;
const SEG = LEN.map((l) => (l / CYCLE) * (BAR_W - 3 * GAP));
const SEG_X = SEG.map((_, j) => SEG.slice(0, j).reduce((a, b) => a + b + GAP, 0));

/** Rotor angle within one cycle, integrated from Windmill.cs's speed ramp. */
function rotorAngle(tc: number) {
  if (tc < EXHALE_AT) return 0;
  if (tc < RELAX_AT) {
    const t = tc - EXHALE_AT;
    return t < 2 ? (ACC * t * t) / 2 : 200 + MAX * (t - 2);
  }
  const t = Math.min(tc - RELAX_AT, 2);
  return 720 + MAX * t - (ACC * t * t) / 2;
}

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

const setText = (el: SVGTextElement | null, s: string) => {
  if (el && el.textContent !== s) el.textContent = s;
};

/** Writes one moment of the session (transforms, opacity, text) to the shared scene. */
function paint(r: Refs, t: number) {
  const c = Math.floor(t / CYCLE);
  const tc = t - c * CYCLE;
  let i = 0;
  let tau = tc;
  while (i < 3 && tau >= LEN[i]) tau -= LEN[i++];
  const { name, secs } = PHASES[i];
  const op = tau < FADE ? tau / FADE : tau > LEN[i] - FADE ? (LEN[i] - tau) / FADE : 1;
  const n = tau < FADE ? secs : Math.max(1, secs - Math.floor(tau - FADE));
  const deg = ((c * PER_CYCLE + rotorAngle(tc)) % 360) + BASE_ANGLE;
  // Slow head sway: the far world drifts less than the near panel and hands.
  const sx = Math.sin((t / 17) * Math.PI * 2);
  const sy = Math.sin((t / 23) * Math.PI * 2);

  r.rotor?.setAttribute("transform", `translate(${HUB.x} ${HUB.y}) rotate(${deg.toFixed(2)})`);
  r.far?.setAttribute("transform", `translate(${(sx * 6).toFixed(2)} ${(sy * 3).toFixed(2)})`);
  r.near?.setAttribute("transform", `translate(${(sx * 11).toFixed(2)} ${(sy * 5.5).toFixed(2)})`);
  r.cue?.setAttribute("opacity", Math.max(0, Math.min(1, op)).toFixed(3));
  setText(r.phase, name);
  setText(r.count, `for ${n} second${n === 1 ? "" : "s"}`);
  setText(r.round, `Round: ${(c % ROUNDS) + 1}/${ROUNDS}`);
  r.fills.forEach((f, j) => {
    const s = j < i ? 1 : j > i ? 0 : tau / LEN[i];
    f?.setAttribute("transform", `translate(${SEG_X[j].toFixed(2)} 0) scale(${s.toFixed(4)} 1)`);
  });
}

/** A Touch controller seen from behind: grip, face with thumbstick, tracking ring. */
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

export function WindmillIllustration({ active }: { active: boolean }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const u = (k: string) => `wm${id}${k}`;
  const refs = useRef<Refs>({ rotor: null, cue: null, far: null, near: null, phase: null, count: null, round: null, fills: [] });

  useEffect(() => {
    const r = refs.current;
    paint(r, START);
    if (!active) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      paint(r, START + (now - t0) / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#06080b]" aria-label="Windmill VR seen through a Meta Quest headset: the turbine turns on each exhale">
      <svg viewBox="0 0 440 294" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id={u("sky")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2c4a73" />
            <stop offset=".62" stopColor="#7f9dbf" />
            <stop offset="1" stopColor="#d4d9d7" />
          </linearGradient>
          <linearGradient id={u("ground")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8b8c7b" />
            <stop offset=".16" stopColor="#5f604e" />
            <stop offset="1" stopColor="#1f211a" />
          </linearGradient>
          <linearGradient id={u("haze")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#eef0ea" stopOpacity="0" />
            <stop offset=".55" stopColor="#eef0ea" stopOpacity=".42" />
            <stop offset="1" stopColor="#eef0ea" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={u("pole")} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#8f98a3" />
            <stop offset=".55" stopColor="#f3f0e8" />
            <stop offset="1" stopColor="#d9d5cb" />
          </linearGradient>
          <linearGradient id={u("panel")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#10161f" stopOpacity=".62" />
            <stop offset="1" stopColor="#0b1017" stopOpacity=".5" />
          </linearGradient>
          <linearGradient id={u("ray")} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#dfe9f5" stopOpacity="0" />
            <stop offset="1" stopColor="#dfe9f5" stopOpacity=".75" />
          </linearGradient>
          {/* headset lens: the view softly darkens towards the edges */}
          <radialGradient id={u("lens")} cx=".5" cy=".48" r=".72">
            <stop offset=".58" stopColor="#06080b" stopOpacity="0" />
            <stop offset=".88" stopColor="#06080b" stopOpacity=".5" />
            <stop offset="1" stopColor="#06080b" stopOpacity=".92" />
          </radialGradient>

          {/* Far layer: sky, hills, ground and the turbine. */}
          <g id={u("far")}>
            <g ref={(el) => void (refs.current.far = el)}>
              <rect x="-140" y="-20" width="500" height="172" fill={`url(#${u("sky")})`} />
              <path d="M-140 152c40-12 80-12 120-8s52-14 80-10 50-8 78-6 44 6 64 10 50-10 90-6 40 6 68 8v10h-500z" fill="#8a97a0" opacity=".45" />
              <rect x="-140" y="148" width="500" height="130" fill={`url(#${u("ground")})`} />
              <rect x="-140" y="134" width="500" height="28" fill={`url(#${u("haze")})`} />
              <ellipse cx="141" cy="200" rx="24" ry="3.6" fill="#15170f" opacity=".32" />
              <rect x={HUB.x - 1.5} y={HUB.y} width="3" height="116" fill={`url(#${u("pole")})`} />
              <ellipse cx={HUB.x} cy="200" rx="8.5" ry="2" fill="#cfccc3" />
              <g ref={(el) => void (refs.current.rotor = el)} transform={`translate(${HUB.x} ${HUB.y}) rotate(${BASE_ANGLE})`}>
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

          {/* Near layer: the world-space breathing panel, pointer ray, controllers. */}
          <g id={u("near")}>
            <g ref={(el) => void (refs.current.near = el)}>
              <g transform="translate(14 66) skewY(5)">
                <rect width="86" height="74" rx="9" fill={`url(#${u("panel")})`} stroke="#e8eef5" strokeOpacity=".22" strokeWidth=".7" />
                <text ref={(el) => void (refs.current.round = el)} x="10" y="17" className="font-mono" fontSize="9.6" letterSpacing=".6" fill="#e8eef5" fillOpacity=".62" />
                <g ref={(el) => void (refs.current.cue = el)}>
                  <text ref={(el) => void (refs.current.phase = el)} x="9.5" y="42" className="font-sans" fontSize="20" fontWeight="500" letterSpacing="-.4" fill="#f4f1ea" />
                  <text ref={(el) => void (refs.current.count = el)} x="10" y="55" className="font-sans" fontSize="10" fill="#f4f1ea" fillOpacity=".72" />
                </g>
                <g transform="translate(10 63)">
                  {SEG.map((w, j) => (
                    <g key={j}>
                      <rect x={SEG_X[j]} width={w} height="1.6" rx=".8" fill="#e8eef5" fillOpacity=".2" />
                      <rect
                        ref={(el) => void (refs.current.fills[j] = el)}
                        width={w}
                        height="1.6"
                        rx=".8"
                        fill={j === 2 ? "#2fbf8a" : "#e8eef5"}
                        fillOpacity={j === 2 ? 1 : 0.8}
                        transform={`translate(${SEG_X[j]} 0) scale(0 1)`}
                      />
                    </g>
                  ))}
                </g>
              </g>
              <path d="M157 222L94 141" stroke={`url(#${u("ray")})`} strokeWidth="1.2" strokeLinecap="round" />
              <circle cx="94" cy="141" r="3.2" fill="none" stroke="#eef3f9" strokeOpacity=".85" strokeWidth=".9" />
              <circle cx="94" cy="141" r="1" fill="#eef3f9" />
              <Controller x={40} y={240} rot={14} />
              <Controller x={168} y={236} rot={-38} />
            </g>
          </g>
        </defs>


        {/* one wide immersive view: scene scaled up and framed on the turbine */}
        <g transform="translate(64 -40) scale(1.5)">
          <use href={`#${u("far")}`} />
          <use href={`#${u("near")}`} />
        </g>
        <rect width="440" height="294" fill={`url(#${u("lens")})`} />
        {/* HUD strip, as on a cast/recording of the headset. */}
        <circle cx="16" cy="16" r="2.4" fill="#2fbf8a" />
        <text x="24" y="19.4" className="font-mono" fontSize="9.8" letterSpacing="1.1" fill="#e8eef5" fillOpacity=".62">
          META QUEST · WINDMILL VR
        </text>
      </svg>

      <IllustrationTag />
    </div>
  );
}
