"use client";

import { CONTACT, PERSON, mailto } from "@/lib/content";
import { useMumbaiTime, useNarrow } from "@/lib/hooks";
import { Paint, useLive } from "./parts";
import s from "./Temple.module.css";

/*
 * The footer: Siddhivinayak after dark. This is where Mohit resets, so the scene holds still: the
 * gilded domes catch the lamplight, the diyas burn on the steps, the flag on the top moves a little
 * in the breeze off the sea. Nothing else happens here. The page ends with an invitation.
 */

const CX = 1100; // the central dome's axis
const BASE = 820;

function Dome({ x, y, r, main }: { x: number; y: number; r: number; main?: boolean }) {
  // an onion-shaped dome, lit gold on the side facing the last of the sky
  const h = r * 1.35;
  return (
    <g>
      <path
        d={`M${x - r} ${y} C${x - r * 1.12} ${y - h * 0.55} ${x - r * 0.25} ${y - h * 0.75} ${x} ${y - h} C${x + r * 0.25} ${y - h * 0.75} ${x + r * 1.12} ${y - h * 0.55} ${x + r} ${y} Z`}
        fill="url(#tp-gold)"
      />
      <path
        d={`M${x - r} ${y} C${x - r * 1.12} ${y - h * 0.55} ${x - r * 0.25} ${y - h * 0.75} ${x} ${y - h} C${x - r * 0.1} ${y - h * 0.7} ${x - r * 0.45} ${y - h * 0.5} ${x - r * 0.3} ${y} Z`}
        fill="#fff1c4"
        opacity={0.28}
      />
      <rect x={x - r - 4} y={y} width={r * 2 + 8} height={main ? 10 : 6} fill="#c79a3c" />
      {/* the kalash */}
      <rect x={x - 1.5} y={y - h - (main ? 34 : 18)} width={3} height={main ? 34 : 18} fill="#e2b653" />
      <circle cx={x} cy={y - h - (main ? 12 : 7)} r={main ? 7 : 4} fill="#e9c065" />
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

      <Paint viewBox={narrow ? "640 160 900 840" : "0 0 1600 1000"} className="scene-art" label="Siddhivinayak temple after dark, its gold domes lit, the street lamps on">
        <defs>
          <linearGradient id="tp-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#101d33" />
            <stop offset="0.55" stopColor="#2c3d63" />
            <stop offset="0.85" stopColor="#7a6a86" />
            <stop offset="1" stopColor="#c99a8a" />
          </linearGradient>
          <linearGradient id="tp-gold" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#f1cd6a" />
            <stop offset="0.5" stopColor="#d4a03e" />
            <stop offset="1" stopColor="#8f6424" />
          </linearGradient>
          <linearGradient id="tp-wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#c9b7a6" />
            <stop offset="1" stopColor="#e9c99a" />
          </linearGradient>
          <radialGradient id="tp-lamp">
            <stop offset="0" stopColor="#f2a145" stopOpacity="0.55" />
            <stop offset="1" stopColor="#f2a145" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="tp-glow" cx={CX} cy={BASE - 120} r="560" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#f2a145" stopOpacity="0.32" />
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
        ].map(([x, y]) => (
          <circle key={x} cx={x} cy={y} r={1.4} fill="#f3ecdf" opacity={0.7} />
        ))}

        {/* Prabhadevi around it, already dark */}
        {[
          [0, 560, 200],
          [190, 610, 180],
          [380, 540, 150],
          [1450, 520, 170],
          [1560, 590, 120],
        ].map(([x, y, w]) => (
          <rect key={x} x={x} y={y} width={w} height={BASE + 100 - y} fill="#1d2840" />
        ))}

        <rect width={1600} height={1000} fill="url(#tp-glow)" />

        {/* the temple: the hall, the tiers, the domes */}
        <rect x={CX - 330} y={BASE - 150} width={660} height={160} fill="url(#tp-wall)" />
        {Array.from({ length: 9 }, (_, i) => (
          <path key={i} d={`M${CX - 300 + i * 70} ${BASE} L${CX - 300 + i * 70} ${BASE - 90} Q${CX - 278 + i * 70} ${BASE - 118} ${CX - 256 + i * 70} ${BASE - 90} L${CX - 256 + i * 70} ${BASE} Z`} fill="#6b4f3c" opacity={0.6} />
        ))}
        <rect x={CX - 344} y={BASE - 160} width={688} height={12} fill="#b9a089" />
        <rect x={CX - 230} y={BASE - 250} width={460} height={92} fill="url(#tp-wall)" />
        <rect x={CX - 242} y={BASE - 258} width={484} height={10} fill="#b9a089" />
        <rect x={CX - 130} y={BASE - 320} width={260} height={64} fill="url(#tp-wall)" />
        <Dome x={CX - 300} y={BASE - 160} r={26} />
        <Dome x={CX + 300} y={BASE - 160} r={26} />
        <Dome x={CX - 190} y={BASE - 258} r={34} />
        <Dome x={CX + 190} y={BASE - 258} r={34} />
        <Dome x={CX} y={BASE - 320} r={96} main />
        {/* the flag on the top, moving a little */}
        <g transform={`translate(${CX} ${BASE - 320 - 96 * 1.35 - 34})`}>
          <rect x={-1} y={-46} width={2} height={46} fill="#e2b653" />
          <path className={s.flag} d="M1 -46 L34 -38 L1 -28 Z" fill="#e86f2c" />
        </g>

        {/* the road in front, the lamps along it */}
        <rect y={BASE} width={1600} height={200} fill="#151d2c" />
        <rect y={BASE} width={1600} height={6} fill="#3a3a44" />
        <ellipse cx={CX} cy={BASE + 40} rx={420} ry={50} fill="url(#tp-lamp)" opacity={0.6} />
        <Lamp x={640} y={BASE - 170} />
        <Lamp x={1500} y={BASE - 170} />
        {/* diyas on the steps */}
        {Array.from({ length: 11 }, (_, i) => (
          <g key={i}>
            <circle cx={CX - 250 + i * 50} cy={BASE + 2} r={12} fill="url(#tp-lamp)" />
            <ellipse cx={CX - 250 + i * 50} cy={BASE + 3} rx={4} ry={2} fill="#ffcf7a" />
          </g>
        ))}
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
            Back to Bhayandar ↑
          </a>
        </nav>
        <p className={s.copy}>© 2026 Mohit Bagri</p>
      </div>
    </footer>
  );
}
