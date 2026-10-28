"use client";

import { CONTACT, PERSON, mailto } from "@/lib/content";
import { useMumbaiTime, useNarrow } from "@/lib/hooks";
import { Paint, useLive } from "./parts";
import s from "./Temple.module.css";

/*
 * The footer: Siddhivinayak after dark. This is where Mohit resets, so the scene holds still: the
 * temple floodlit against the night, its cluster of banded spires each crowned in gold, the stepped
 * tower over the sanctum with the saffron flag moving a little in the breeze off the sea.
 * The page ends with an invitation.
 */

const BASE = 820;
// the temple was drawn on a reference grid: x from 200 to 610, the ground line at 630
const X = (x: number) => 800 + (x - 200) * 1.46;
const Y = (y: number) => BASE - (630 - y) * 1.46;

const INK = "#3a2416";
const GOLD = "#f2c447";
const GOLD_SHADE = "#c8901f";

// A spire: a faceted column in cream and tan, banded in brown, with a stepped cap and a gold finial.
function Spire({ cx, w, top, cap = true }: { cx: number; w: number; top: number; cap?: boolean }) {
  const x = cx - w / 2;
  const h = BASE - top;
  const seg = Math.max(w * 1.15, 26);
  const bands: number[] = [];
  for (let y = top + seg * 0.55; y < BASE - 6; y += seg) bands.push(y);
  const capH = w * 1.05;
  return (
    <g>
      <rect x={x} y={top} width={w} height={h} fill="#f3d9a4" />
      <rect x={x} y={top} width={w * 0.2} height={h} fill="#fdeccb" />
      <rect x={x + w * 0.62} y={top} width={w * 0.38} height={h} fill="#d8ad6f" />
      {bands.map((y) => (
        <g key={y}>
          <rect x={x} y={y - seg * 0.42} width={w} height={seg * 0.26} fill="#b98450" opacity={0.75} />
          <rect x={x} y={y} width={w} height={5} fill="#6b4224" />
          <rect x={x} y={y + 5} width={w} height={2} fill="#fff1d2" opacity={0.7} />
        </g>
      ))}
      <rect x={x} y={top} width={w} height={h} fill="none" stroke={INK} strokeWidth={1.6} />
      {cap && (
        <g>
          <rect x={x - 3} y={top - 5} width={w + 6} height={6} fill="#6b4224" stroke={INK} strokeWidth={1.2} />
          <path d={`M${x - 1} ${top - 5} L${cx} ${top - 5 - capH} L${x + w + 1} ${top - 5} Z`} fill="#e7c086" stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
          <path d={`M${cx} ${top - 5 - capH} L${x + w + 1} ${top - 5} L${cx} ${top - 5} Z`} fill="#b98450" />
          <path d={`M${x + w * 0.2} ${top - 5 - capH * 0.38} L${x + w * 0.8} ${top - 5 - capH * 0.38}`} stroke={INK} strokeWidth={1.2} />
          <ellipse cx={cx} cy={top - 8 - capH} rx={w * 0.16} ry={w * 0.11} fill={GOLD} stroke={GOLD_SHADE} strokeWidth={1} />
          <path d={`M${cx - w * 0.12} ${top - 10 - capH} Q${cx} ${top - 14 - capH - w * 0.5} ${cx + w * 0.12} ${top - 10 - capH} Z`} fill={GOLD} stroke={GOLD_SHADE} strokeWidth={1} />
        </g>
      )}
    </g>
  );
}

// The spires as they stand, back row first. [x, width, top] on the reference grid.
const BACK: [number, number, number][] = [
  [210, 16, 430],
  [232, 20, 385],
  [254, 22, 338],
  [280, 20, 362],
  [304, 20, 382],
  [332, 26, 362],
  [362, 28, 318],
  [522, 26, 342],
  [550, 22, 368],
  [576, 22, 394],
  [602, 18, 432],
];
const BODY = [392, 414, 436, 458, 480, 502];
const CROWN = [396, 420, 444, 468, 492, 516];

// The tower over the sanctum: stepped tiers narrowing to the gold kalash.
function Tower() {
  const steps = 9;
  const bottom = Y(322);
  const peak = Y(212);
  const half0 = (X(548) - X(376)) / 2;
  const cx = X(462);
  const tiers = Array.from({ length: steps }, (_, i) => {
    const t0 = i / steps;
    const t1 = (i + 1) / steps;
    const y0 = bottom - (bottom - peak) * t0;
    const y1 = bottom - (bottom - peak) * t1;
    const hw0 = half0 * (1 - t0 * 0.78);
    const hw1 = half0 * (1 - t1 * 0.78);
    return { y0, y1, hw0, hw1, i };
  });
  return (
    <g>
      {/* the dark under the eaves */}
      <path d={`M${X(380)} ${Y(312)} L${X(544)} ${Y(312)} L${X(536)} ${Y(345)} L${X(388)} ${Y(345)} Z`} fill="#3b2416" />
      {tiers.map(({ y0, y1, hw0, hw1, i }) => (
        <g key={i}>
          <path d={`M${cx - hw0} ${y0} L${cx + hw0} ${y0} L${cx + hw1} ${y1} L${cx - hw1} ${y1} Z`} fill={i % 2 ? "#e9c792" : "#d2a466"} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
          <path d={`M${cx + hw0 * 0.35} ${y0} L${cx + hw0} ${y0} L${cx + hw1} ${y1} L${cx + hw1 * 0.35} ${y1} Z`} fill="#000" opacity={0.12} />
        </g>
      ))}
      {/* the kalash and the flag */}
      <ellipse cx={cx} cy={peak - 4} rx={26} ry={6} fill={GOLD} stroke={GOLD_SHADE} strokeWidth={1.2} />
      <ellipse cx={cx} cy={peak - 16} rx={14} ry={12} fill={GOLD} stroke={GOLD_SHADE} strokeWidth={1.2} />
      <path d={`M${cx - 10} ${peak - 24} Q${cx} ${peak - 66} ${cx + 10} ${peak - 24} Z`} fill={GOLD} stroke={GOLD_SHADE} strokeWidth={1.2} />
      <path d={`M${cx - 6} ${peak - 36} Q${cx} ${peak - 50} ${cx + 4} ${peak - 36}`} stroke="#fff3c4" strokeWidth={2} fill="none" opacity={0.8} />
      <g transform={`translate(${cx + 46} ${peak - 8})`}>
        <rect x={-1.5} y={-80} width={3} height={80} fill="#4a3420" />
        <path className={s.flag} d="M1.5 -80 L48 -72 L34 -64 L48 -56 L1.5 -52 Z" fill="#ef6b2a" />
      </g>
    </g>
  );
}

// The little orange shikhara over the entrance, in front of everything.
function Gate() {
  const cx = X(432);
  const bottom = BASE;
  const top = Y(482);
  const half = (X(490) - X(375)) / 2;
  const steps = 7;
  return (
    <g>
      <rect x={cx - half * 0.86} y={Y(560)} width={half * 1.72} height={BASE - Y(560)} fill="#a8432a" stroke={INK} strokeWidth={1.4} />
      <rect x={cx - 18} y={Y(586)} width={36} height={BASE - Y(586)} rx={4} fill="#3b2416" />
      {Array.from({ length: steps }, (_, i) => {
        const y0 = Y(560) - ((Y(560) - top) * i) / steps;
        const y1 = Y(560) - ((Y(560) - top) * (i + 1)) / steps;
        const hw0 = half * (1 - (i / steps) * 0.85);
        const hw1 = half * (1 - ((i + 1) / steps) * 0.85);
        return (
          <path key={i} d={`M${cx - hw0} ${y0} L${cx + hw0} ${y0} L${cx + hw1} ${y1} L${cx - hw1} ${y1} Z`} fill={i % 2 ? "#f39a4a" : "#e2702e"} stroke={INK} strokeWidth={1.3} strokeLinejoin="round" />
        );
      })}
      <ellipse cx={cx} cy={top - 5} rx={12} ry={5} fill={GOLD} stroke={GOLD_SHADE} />
      <path d={`M${cx - 8} ${top - 8} Q${cx} ${top - 44} ${cx + 8} ${top - 8} Z`} fill={GOLD} stroke={GOLD_SHADE} />
      <rect x={cx - half} y={bottom - 4} width={half * 2} height={4} fill={INK} />
      <rect x={cx - half * 0.86} y={Y(560) - 2} width={half * 1.72} height={4} fill={INK} />
    </g>
  );
}

function Lamp({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x + 26} cy={y + 4} r={70} fill="url(#tp-lamp)" />
      <rect x={x - 2} y={y} width={4} height={BASE + 100 - y} fill="#1a2233" />
      <path d={`M${x} ${y} Q${x + 10} ${y - 10} ${x + 26} ${y}`} stroke="#1a2233" strokeWidth={3} fill="none" />
      <rect x={x + 20} y={y} width={12} height={6} rx={2} fill="#ffd08a" />
    </g>
  );
}

// Prabhadevi around it: flat blocks, a few windows still lit.
const BLOCKS: [number, number, number][] = [
  [0, 520, 210],
  [230, 600, 150],
  [420, 560, 140],
  [1460, 470, 160],
  [640, 640, 120],
];

export function Temple() {
  const narrow = useNarrow();
  const [ref] = useLive<HTMLElement>();
  const time = useMumbaiTime();
  return (
    <footer ref={ref} id="contact" className={`scene ${s.temple}`}>
      <div className={`zone ${s.zone}`}>
        <p className={s.time}>{time ? `It's ${time.label} in Mumbai.` : "Mumbai runs on IST."}</p>
        <h2 className="h-voice">{CONTACT.title}</h2>
        <p className="line">{CONTACT.line}</p>
        <div className={s.actions}>
          <a className={s.btn} href={mailto("Hello Mohit")}>
            Write to me <span aria-hidden="true">→</span>
          </a>
          <a className="tlink" href={`mailto:${PERSON.email}`}>
            {PERSON.email}
          </a>
        </div>
      </div>

      <Paint viewBox={narrow ? "770 70 640 900" : "0 0 1600 1000"} className="scene-art" label="Siddhivinayak temple after dark, floodlit, its spires crowned in gold, the saffron flag on top">
        <defs>
          <linearGradient id="tp-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#101d33" />
            <stop offset="0.55" stopColor="#2c3d63" />
            <stop offset="0.85" stopColor="#7a6a86" />
            <stop offset="1" stopColor="#c99a8a" />
          </linearGradient>
          <radialGradient id="tp-lamp">
            <stop offset="0" stopColor="#f2a145" stopOpacity="0.55" />
            <stop offset="1" stopColor="#f2a145" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="tp-glow" cx={X(450)} cy={BASE - 220} r="620" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#f2a145" stopOpacity="0.38" />
            <stop offset="1" stopColor="#f2a145" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width={1600} height={1000} fill="url(#tp-sky)" />
        {/* the first stars, few and faint */}
        {[
          [1240, 90],
          [1420, 160],
          [980, 70],
          [1530, 60],
          [860, 150],
          [700, 210],
        ].map(([x, y]) => (
          <circle key={x} cx={x} cy={y} r={1.4} fill="#f3ecdf" opacity={0.7} />
        ))}

        {BLOCKS.map(([x, y, w]) => (
          <g key={x}>
            <rect x={x} y={y} width={w} height={BASE + 100 - y} fill="#1c2942" />
            {Array.from({ length: Math.floor((BASE - y - 30) / 44) }, (_, r) =>
              Array.from({ length: Math.floor((w - 20) / 34) }, (_, c) => (
                <rect
                  key={`${r}-${c}`}
                  x={x + 18 + c * 34}
                  y={y + 22 + r * 44}
                  width={14}
                  height={16}
                  fill={(r * 7 + c * 3 + x) % 11 === 0 ? "#f2b766" : "#26375a"}
                  opacity={(r * 7 + c * 3 + x) % 11 === 0 ? 0.85 : 1}
                />
              )),
            )}
          </g>
        ))}

        <rect width={1600} height={1000} fill="url(#tp-glow)" />

        {/* the temple */}
        {BACK.map(([x, w, t]) => (
          <Spire key={x} cx={X(x)} w={w * 1.46} top={Y(t)} />
        ))}
        {BODY.map((x) => (
          <Spire key={x} cx={X(x)} w={22 * 1.46} top={Y(330)} cap={false} />
        ))}
        <Tower />
        {CROWN.map((x) => (
          <Spire key={x} cx={X(x)} w={13 * 1.46} top={Y(352)} />
        ))}
        <Gate />

        {/* the compound wall, running down towards the sea, and the road in front */}
        <path d={`M600 ${BASE - 46} L1600 ${BASE - 8} L1600 ${BASE + 200} L600 ${BASE + 200} Z`} fill="#4a3628" />
        <path d={`M600 ${BASE - 46} L1600 ${BASE - 8}`} stroke="#8b6a4c" strokeWidth={6} />
        <rect y={BASE} width={1600} height={200} fill="#151d2c" />
        <path d={`M0 ${BASE} L600 ${BASE} L600 ${BASE - 46} L560 ${BASE - 46} L560 ${BASE} `} fill="#151d2c" />
        <rect y={BASE} width={1600} height={5} fill="#3a3a44" />
        <ellipse cx={X(432)} cy={BASE + 40} rx={420} ry={50} fill="url(#tp-lamp)" opacity={0.6} />
        <Lamp x={640} y={BASE - 210} />
        <Lamp x={1500} y={BASE - 210} />
      </Paint>

      <div className={s.foot}>
        <figure className={s.belief}>
          <blockquote>{CONTACT.belief}</blockquote>
          <figcaption>{CONTACT.reset}</figcaption>
        </figure>
        <nav className={s.links} aria-label="Elsewhere">
          <a className="tlink" href={PERSON.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a className="tlink" href={PERSON.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a className="tlink" href={PERSON.leetcode} target="_blank" rel="noreferrer">
            LeetCode
          </a>
          <a className="tlink" href={PERSON.instagram} target="_blank" rel="noreferrer">
            Instagram
          </a>
          <a className="tlink" href={PERSON.resume} target="_blank" rel="noreferrer">
            Resume
          </a>
          <a className="tlink" href="#top">
            Back to Churchgate ↑
          </a>
        </nav>
        <p className={s.copy}>© 2026 Mohit Bagri</p>
      </div>
    </footer>
  );
}
