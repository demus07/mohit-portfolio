"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { DALAL } from "@/lib/content";
import { useNarrow } from "@/lib/hooks";
import { Paint, rng, useLive } from "./parts";
import s from "./Dalal.module.css";

/*
 * Dalal Street at noon. The exchange tower goes straight up out of frame, the sun almost overhead,
 * shadows short. At its foot the ticker runs the real numbers from Mohit's work, a kaali-peeli
 * waits at the kerb and a vada pav stall steams. Below the painting, the record itself.
 */

const TOWER = { x: 930, w: 360, top: -40, base: 820 };

const WINDOWS = (() => {
  const r = rng(5);
  const out: { x: number; y: number; lit: boolean }[] = [];
  for (let y = TOWER.top + 90; y < TOWER.base - 230; y += 34) {
    for (let c = 0; c < 9; c++) out.push({ x: TOWER.x + 30 + c * 36, y, lit: r() < 0.12 });
  }
  return out;
})();

const STEAM = [0, 1, 2];

function Taxi({ x, y }: { x: number; y: number }) {
  // a Premier Padmini in black and yellow, as Mumbai's taxis were for decades
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={95} cy={4} rx={108} ry={8} fill="#000" opacity={0.18} />
      <path d="M0 -26 Q0 -44 22 -46 L46 -48 L70 -78 Q76 -84 90 -84 L138 -84 Q150 -84 156 -76 L176 -48 L188 -46 Q196 -44 196 -30 L196 -10 L0 -10 Z" fill="#f2c230" />
      <path d="M0 -26 L196 -26 L196 -10 L0 -10 Z" fill="#141414" />
      <path d="M76 -76 Q80 -80 90 -80 L112 -80 L112 -50 L56 -50 Z" fill="#2d3a40" />
      <path d="M118 -80 L138 -80 Q148 -80 152 -74 L168 -50 L118 -50 Z" fill="#2d3a40" />
      <rect x={96} y={-94} width={30} height={10} rx={2} fill="#141414" />
      <circle cx={44} cy={-8} r={17} fill="#1d1d1d" />
      <circle cx={44} cy={-8} r={7} fill="#9a9a95" />
      <circle cx={156} cy={-8} r={17} fill="#1d1d1d" />
      <circle cx={156} cy={-8} r={7} fill="#9a9a95" />
      <rect x={0} y={-62} width={196} height={3} fill="#fff7d6" opacity={0.35} />
    </g>
  );
}

function Stall({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={90} cy={4} rx={110} ry={9} fill="#000" opacity={0.16} />
      {/* the cart, a striped awning, the kadhai */}
      <rect x={0} y={-90} width={180} height={86} fill="#7a5a3c" />
      <rect x={0} y={-90} width={180} height={10} fill="#5f452d" />
      <rect x={6} y={-74} width={168} height={56} fill="#9c7650" />
      <circle cx={30} cy={2} r={10} fill="#2a2a2a" />
      <circle cx={150} cy={2} r={10} fill="#2a2a2a" />
      <rect x={-10} y={-210} width={6} height={124} fill="#4a3b2c" />
      <rect x={184} y={-210} width={6} height={124} fill="#4a3b2c" />
      {Array.from({ length: 8 }, (_, i) => (
        <path key={i} d={`M${-18 + i * 26} -214 L${8 + i * 26} -214 L${8 + i * 26} -186 Q${-5 + i * 26} -178 ${-18 + i * 26} -186 Z`} fill={i % 2 ? "#e9e2d0" : "#c8463a"} />
      ))}
      <ellipse cx={120} cy={-92} rx={36} ry={9} fill="#2b2b2b" />
      <ellipse cx={120} cy={-95} rx={30} ry={5} fill="#c79a3c" />
      {/* vada pav, stacked */}
      {[0, 1, 2, 3].map((i) => (
        <ellipse key={i} cx={36 + (i % 2) * 22} cy={-96 - Math.floor(i / 2) * 9} rx={11} ry={6} fill="#d8a456" />
      ))}
      {STEAM.map((i) => (
        <path
          key={i}
          className={s.steam}
          style={{ animationDelay: `${-i * 1.4}s` }}
          d={`M${110 + i * 9} -104 q-8 -14 0 -28 q8 -14 0 -28`}
          stroke="#fff"
          strokeWidth={4}
          strokeLinecap="round"
          fill="none"
          opacity={0.5}
        />
      ))}
    </g>
  );
}

function Ticker() {
  const items = DALAL.ticker;
  const first = useRef<SVGTextElement>(null);
  // one run's length, measured, so the second run picks up exactly where the first leaves off
  const [run, setRun] = useState(3000);
  useEffect(() => {
    const el = first.current;
    if (el) setRun(Math.ceil(el.getComputedTextLength()));
  }, []);
  return (
    <g>
      <rect x={TOWER.x - 130} y={TOWER.base - 196} width={TOWER.w + 260} height={58} fill="#0b0c0d" />
      <clipPath id="dl-tick">
        <rect x={TOWER.x - 124} y={TOWER.base - 190} width={TOWER.w + 248} height={46} />
      </clipPath>
      <g clipPath="url(#dl-tick)">
        <g className={s.tick} style={{ "--run": `${-run}px`, "--dur": `${run / 50}s` } as CSSProperties}>
          {[0, 1].map((r) => (
            <text key={r} ref={r === 0 ? first : undefined} x={TOWER.x - 120 + r * run} y={TOWER.base - 158} className={s.tickText}>
              {items.map((t, i) => (
                <tspan key={i} fill={i % 2 ? "#7fe0a0" : "#f2a145"}>
                  {t}
                  {"   ▲   "}
                </tspan>
              ))}
            </text>
          ))}
        </g>
      </g>
    </g>
  );
}

function Street() {
  const narrow = useNarrow();
  return (
    <Paint viewBox={narrow ? "620 120 900 880" : "0 0 1600 1000"} className="scene-art" label="The Bombay Stock Exchange tower on Dalal Street at noon, a ticker at its base">
      <defs>
        <linearGradient id="dl-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9fc3d6" />
          <stop offset="0.7" stopColor="#e7e4d6" />
        </linearGradient>
        <linearGradient id="dl-face" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#efe5cf" />
          <stop offset="1" stopColor="#d9ccb0" />
        </linearGradient>
      </defs>
      <rect width={1600} height={1000} fill="url(#dl-sky)" />
      {/* the old Fort buildings either side, Art Deco and stone */}
      <g>
        <rect x={0} y={520} width={420} height={300} fill="#d9c9a6" />
        <rect x={0} y={510} width={420} height={14} fill="#c4b38d" />
        {Array.from({ length: 6 }, (_, i) => (
          <g key={i}>
            <rect x={24 + i * 66} y={560} width={34} height={60} rx={17} fill="#8a7b62" opacity={0.7} />
            <rect x={24 + i * 66} y={660} width={34} height={60} fill="#8a7b62" opacity={0.7} />
          </g>
        ))}
        <rect x={420} y={590} width={260} height={230} fill="#cdbf9f" />
        <path d="M420 590 L550 548 L680 590 Z" fill="#bfae89" />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={448 + i * 76} y={630} width={44} height={120} fill="#7d705a" opacity={0.65} />
        ))}
        <rect x={1360} y={480} width={240} height={340} fill="#d6c8a8" />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={1380} y={510 + i * 72} width={200} height={10} fill="#bba985" />
        ))}
      </g>
      {/* the tower: the lit face, the shade of its fins, its windows */}
      <rect x={TOWER.x - 40} y={TOWER.top} width={TOWER.w + 80} height={TOWER.base - TOWER.top} fill="#bfb396" />
      <rect x={TOWER.x} y={TOWER.top} width={TOWER.w} height={TOWER.base - TOWER.top} fill="url(#dl-face)" />
      {WINDOWS.map((w, i) => (
        <rect key={i} x={w.x} y={w.y} width={24} height={20} fill={w.lit ? "#e9d8a8" : "#5d6a70"} opacity={w.lit ? 0.9 : 0.75} />
      ))}
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={TOWER.x + 22 + i * 36} y={TOWER.top} width={6} height={TOWER.base - TOWER.top - 200} fill="#c9bc9e" />
      ))}
      <rect x={TOWER.x - 40} y={TOWER.base - 230} width={TOWER.w + 80} height={34} fill="#a99d82" />
      <text x={TOWER.x + TOWER.w / 2} y={TOWER.base - 205} textAnchor="middle" className={s.bse}>
        BSE
      </text>
      <Ticker />
      {/* the entrance, in shade */}
      <rect x={TOWER.x + 40} y={TOWER.base - 130} width={TOWER.w - 80} height={130} fill="#4d4a42" />
      <rect x={TOWER.x + 40} y={TOWER.base - 136} width={TOWER.w - 80} height={6} fill="#efe5cf" />
      {/* the street, bright at noon */}
      <rect y={820} width={1600} height={180} fill="#b9b1a0" />
      <rect y={820} width={1600} height={28} fill="#d8cfbd" />
      <rect y={848} width={1600} height={4} fill="#8f8778" />
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={i * 180 + 40} y={928} width={90} height={6} fill="#efe8d8" opacity={0.8} />
      ))}
      <Stall x={1380} y={846} />
      <Taxi x={640} y={912} />
    </Paint>
  );
}

export function Dalal() {
  const [ref] = useLive<HTMLDivElement>();
  const [lead, ...rest] = DALAL.roles;
  return (
    <section id="experience" className={s.dalal} aria-labelledby="dalal-title">
      <div ref={ref} className={`scene ${s.scene}`}>
        <div className="zone">
          <h2 id="dalal-title" className="h-voice">
            {DALAL.title}
          </h2>
          <p className="line">{DALAL.line}</p>
        </div>
        <Street />
      </div>

      <div className={s.record}>
        <div className={s.lead} data-reveal>
          <h3 className={s.company}>
            <a className={s.companyLink} href={lead.href} target="_blank" rel="noreferrer">
              {lead.company} <span aria-hidden="true">↗</span>
            </a>
          </h3>
          <p className={s.role}>
            {lead.role}, {lead.period}
          </p>
          <ul className={s.points}>
            {lead.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
        <ul className={s.rest} data-reveal style={{ "--d": 1 } as CSSProperties}>
          {rest.map((r) => (
            <li key={r.company}>
              <span className={s.restName}>
                {r.href ? (
                  <a className="tlink" href={r.href} target="_blank" rel="noreferrer">
                    {r.company}
                  </a>
                ) : (
                  r.company
                )}
              </span>
              <span className={s.restRole}>{r.role}</span>
              <span className={s.restWhen}>{r.period}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

