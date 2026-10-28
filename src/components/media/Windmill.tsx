"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/hooks";
import s from "./Windmill.module.css";

const PHASES = ["Breathe in", "Hold", "Breathe out", "Hold"] as const;
const PHASE_MS = 4000;
const CYCLE_MS = PHASE_MS * PHASES.length;

// Blade speed in degrees per second: a slow idle when empty, a gentle push when full.
const IDLE = 5;
const FULL = 30;

const HUB = { x: 200, y: 168 };

const smooth = (p: number) => 0.5 - 0.5 * Math.cos(Math.PI * p);

// How full the breath is at time t: rises on the inhale, rests, falls on the exhale, rests.
function fullness(t: number) {
  const c = t % CYCLE_MS;
  const phase = Math.floor(c / PHASE_MS);
  const p = (c % PHASE_MS) / PHASE_MS;
  const level = phase === 0 ? smooth(p) : phase === 1 ? 1 : phase === 2 ? 1 - smooth(p) : 0;
  return { phase, level };
}

function Sail({ turn }: { turn: number }) {
  return (
    <g transform={`rotate(${turn})`}>
      <line x1="0" y1="-6" x2="0" y2="-74" className={s.spar} />
      <rect x="2" y="-72" width="15" height="54" className={s.sail} />
      {[-62, -51, -40, -29].map((y) => (
        <line key={y} x1="2" x2="17" y1={y} y2={y} className={s.lattice} />
      ))}
      <line x1="9.5" x2="9.5" y1="-72" y2="-18" className={s.lattice} />
    </g>
  );
}

function Rotor({ refFn }: { refFn: (el: SVGGElement | null) => void }) {
  return (
    <g ref={refFn} transform="rotate(18)">
      {[0, 90, 180, 270].map((t) => (
        <Sail key={t} turn={t} />
      ))}
      <circle r="6" className={s.hub} />
      <circle r="2.2" className={s.hubCap} />
    </g>
  );
}

export function WindmillMedia({ active }: { active: boolean }) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState(0);
  const rotor = useRef<SVGGElement | null>(null);
  const far = useRef<SVGGElement | null>(null);
  const ring = useRef<SVGCircleElement>(null);
  const dot = useRef<HTMLSpanElement>(null);
  const glow = useRef<SVGCircleElement>(null);
  const clock = useRef({ t: 0, angle: 18, phase: 0 });

  useEffect(() => {
    if (!active || reduced) return;
    let raf = 0;
    let last: number | null = null;
    const c = clock.current;
    const tick = (now: number) => {
      const dt = last === null ? 0 : Math.min(50, now - last);
      last = now;
      c.t += dt;
      const { phase: ph, level } = fullness(c.t);
      c.angle = (c.angle + ((IDLE + (FULL - IDLE) * level) * dt) / 1000) % 360;
      rotor.current?.setAttribute("transform", `rotate(${c.angle.toFixed(2)})`);
      far.current?.setAttribute("transform", `rotate(${(c.angle * 0.8 + 40).toFixed(2)})`);
      ring.current?.style.setProperty("stroke-dashoffset", (1 - level).toFixed(4));
      dot.current?.style.setProperty("transform", `scale(${(0.5 + 0.5 * level).toFixed(3)})`);
      glow.current?.setAttribute("opacity", (0.35 + 0.35 * level).toFixed(3));
      if (ph !== c.phase) {
        c.phase = ph;
        setPhase(ph);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, reduced]);

  return (
    <div
      className={`${s.root} ${reduced ? s.still : ""} ${active ? "" : s.paused}`}
      role="img"
      aria-label="A windmill on a dusk landscape whose blades follow a breathing cycle: breathe in, hold, breathe out, hold"
    >
      <svg className={s.scene} viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="wm-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#211f3d" />
            <stop offset="0.38" stopColor="#433a66" />
            <stop offset="0.58" stopColor="#9a6b88" />
            <stop offset="0.7" stopColor="#e6a585" />
          </linearGradient>
          <radialGradient id="wm-glow">
            <stop offset="0" stopColor="#ffd8a6" stopOpacity="0.9" />
            <stop offset="1" stopColor="#ffd8a6" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="wm-lit" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#e4d3bd" />
            <stop offset="1" stopColor="#f6e6cf" />
          </linearGradient>
        </defs>

        <rect width="400" height="400" fill="url(#wm-sky)" />
        {[
          [70, 92, 0.9],
          [128, 70, 0.6],
          [312, 84, 0.8],
          [252, 58, 0.5],
          [352, 120, 0.6],
          [40, 140, 0.5],
          [176, 104, 0.4],
        ].map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} className={s.star} style={{ animationDelay: `${i * 1.3}s` }} />
        ))}

        <circle ref={glow} cx="276" cy="262" r="86" fill="url(#wm-glow)" opacity="0.5" />
        <circle cx="276" cy="262" r="20" fill="#ffe1b8" opacity="0.95" />

        <path d="M0 266 C60 246 120 256 180 251 S300 236 400 254 V400 H0Z" fill="#6c5a80" />

        {/* a far windmill, small and hazy */}
        <g transform="translate(96 241) scale(0.3)" opacity="0.55">
          <path d="M-14 0 L14 0 L8 -78 L-8 -78Z" fill="#4c4063" />
          <g transform="translate(0 -84)">
            <g ref={far} transform="rotate(40)">
              {[0, 90, 180, 270].map((t) => (
                <rect key={t} x="2" y="-70" width="13" height="52" fill="#4c4063" transform={`rotate(${t})`} />
              ))}
            </g>
          </g>
        </g>

        <path d="M0 290 C80 268 160 279 230 274 S340 264 400 278 V400 H0Z" fill="#4a3d63" />

        {/* the windmill: a tapered tower lit from the sunset side */}
        <ellipse cx="212" cy="287" rx="46" ry="5" fill="#2b2440" opacity="0.7" />
        <path d="M172 286 L200 288 L200 180 L186 182 Z" fill="#a6927f" />
        <path d="M200 288 L228 286 L214 182 L200 180 Z" fill="url(#wm-lit)" />
        <path d="M193 288 L193 270 Q197 264 201 270 L201 288 Z" fill="#5b4a4a" />
        <rect x="205" y="226" width="6" height="8" rx="1" fill="#6b5655" />
        <rect x="190" y="212" width="5" height="7" rx="1" fill="#5b4a4a" />
        <path d="M181 184 L219 184 L214 170 Q200 158 186 170 Z" fill="#8a5d58" />
        <path d="M200 160 Q209 162 214 170 L219 184 L200 184 Z" fill="#a46f66" />

        <g transform={`translate(${HUB.x} ${HUB.y})`}>
          <Rotor refFn={(el) => void (rotor.current = el)} />
        </g>

        <path d="M0 318 C90 299 200 307 262 303 S360 297 400 306 V400 H0Z" fill="#2e2742" />
        <path d="M0 352 C110 336 250 344 400 334 V400 H0Z" fill="#241f36" />
      </svg>

      <div className={s.cue} aria-hidden="true">
        <span className={s.ringWrap}>
          <svg className={s.ring} viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="18" className={s.track} />
            <circle
              ref={ring}
              cx="20"
              cy="20"
              r="18"
              pathLength={1}
              className={s.progress}
              style={{ strokeDashoffset: reduced ? 0 : 1 }}
            />
          </svg>
          <span ref={dot} className={s.dot} style={{ transform: reduced ? "scale(1)" : "scale(0.5)" }} />
        </span>
        <span className={s.words}>
          {PHASES.map((p, i) => (
            <span key={i} className={`${s.word} ${i === phase ? s.on : ""}`}>
              {p}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}
