"use client";

import type { CSSProperties } from "react";
import { WORK, type Media, type Project } from "@/lib/content";
import { useMumbaiTime, useNarrow, useOnScreen } from "@/lib/hooks";
import { AuctionXIMedia } from "@/components/media/AuctionXI";
import { TexAgentMedia } from "@/components/media/TexAgent";
import { TerminalMedia } from "@/components/media/Terminal";
import { AetherMedia } from "@/components/media/Aether";
import { FlowLedgerMedia } from "@/components/media/FlowLedger";
import { VideoMedia } from "@/components/media/VideoMedia";
import { VeloTypeMedia } from "@/components/media/VeloType";
import { WindmillMedia } from "@/components/media/Windmill";
import { Paint, useLive } from "./parts";
import s from "./Station.module.css";

/*
 * Churchgate, late morning. The concourse first: the departure board lists everything Mohit has
 * built, and each row takes you to its platform. Then the platforms, one project on each, the work
 * shown on the platform's lit hoarding.
 */

function ProjectMedia({ media, active }: { media: Media; active: boolean }) {
  switch (media.kind) {
    case "auctionxi":
      return <AuctionXIMedia active={active} />;
    case "texagent":
      return <TexAgentMedia active={active} />;
    case "terminal":
      return <TerminalMedia active={active} />;
    case "aether":
      return <AetherMedia active={active} />;
    case "flowledger":
      return <FlowLedgerMedia active={active} />;
    case "video":
      return <VideoMedia src={media.src} poster={media.poster} alt={media.alt} active={active} />;
    case "velotype":
      return <VeloTypeMedia active={active} />;
    case "windmill":
      return <WindmillMedia active={active} />;
  }
}

function Board() {
  const time = useMumbaiTime();
  return (
    <div className={s.board}>
      <div className={s.boardHead} aria-hidden="true">
        <span>Churchgate</span>
        <span>{time ? time.label : " "}</span>
      </div>
      <ol className={s.rows}>
        {WORK.projects.map((p, i) => (
          <li key={p.slug}>
            <a href={`#${p.slug}`} className={s.row} style={{ "--i": i } as CSSProperties}>
              <span className={s.time} aria-hidden="true">
                {p.board.time}
              </span>
              <span className={s.dest}>{p.title}</span>
              <span className={s.fast} aria-hidden="true">
                {p.board.fast ? "F" : "S"}
              </span>
              <span className={s.cars} aria-hidden="true">
                {p.board.cars}
              </span>
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}

// People crossing the concourse. They walk in from one side and out of the other, off frame.
const WALKERS = [
  { y: 905, dur: 34, delay: 0, dir: 1, shirt: "#3d6fa3", h: 1 },
  { y: 930, dur: 41, delay: 12, dir: -1, shirt: "#c46a3d", h: 1.08 },
  { y: 915, dur: 38, delay: 25, dir: 1, shirt: "#e9e2d0", h: 0.96 },
  { y: 945, dur: 46, delay: 6, dir: -1, shirt: "#6a7f4f", h: 1.04 },
  { y: 925, dur: 36, delay: 19, dir: 1, shirt: "#7b2a33", h: 1 },
];

function Walker({ shirt, h }: { shirt: string; h: number }) {
  return (
    <g transform={`scale(${h})`}>
      <ellipse cx={0} cy={2} rx={16} ry={3.5} fill="#000" opacity={0.12} />
      <rect className={s.legA} x={-6} y={-46} width={5} height={46} rx={2} fill="#2c2f36" />
      <rect className={s.legB} x={1} y={-46} width={5} height={46} rx={2} fill="#2c2f36" />
      <rect x={-9} y={-88} width={18} height={46} rx={7} fill={shirt} />
      <circle cx={0} cy={-98} r={9} fill="#6b4a36" />
      <rect x={8} y={-80} width={10} height={14} rx={2} fill="#4a3b30" />
    </g>
  );
}

function Concourse({ live }: { live: boolean }) {
  const narrow = useNarrow();
  return (
    <Paint viewBox={narrow ? "200 600 1000 400" : "0 0 1600 1000"} className="scene-art" label="Churchgate station concourse, light falling through the roof">
      <defs>
        <linearGradient id="cc-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cfc4ad" />
          <stop offset="1" stopColor="#e6dcc7" />
        </linearGradient>
        <linearGradient id="cc-shaft" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff4d8" stopOpacity="0.4" />
          <stop offset="1" stopColor="#fff4d8" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="cc-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a39a87" />
          <stop offset="1" stopColor="#d6ccb6" />
        </linearGradient>
      </defs>
      <rect width={1600} height={1000} fill="url(#cc-wall)" />
      {/* the roof: trusses in shade, a strip of sky between each */}
      <rect width={1600} height={150} fill="#5e625d" />
      {Array.from({ length: 9 }, (_, i) => (
        <g key={i}>
          <rect x={i * 200 + 60} y={0} width={70} height={150} fill="#efe6cf" opacity={0.9} />
          <path d={`M${i * 200} 150 L${i * 200 + 100} 40 L${i * 200 + 200} 150`} stroke="#3e423f" strokeWidth={6} fill="none" />
          <path d={`M${i * 200 + 50} 95 L${i * 200 + 100} 150 L${i * 200 + 150} 95`} stroke="#3e423f" strokeWidth={3} fill="none" />
        </g>
      ))}
      <rect y={148} width={1600} height={10} fill="#3e423f" />
      {/* light through the roof, falling on the floor */}
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} d={`M${i * 200 + 60} 158 L${i * 200 + 130} 158 L${i * 200 + 330} 1000 L${i * 200 + 190} 1000 Z`} fill="url(#cc-shaft)" />
      ))}
      {/* the far wall's arches */}
      {Array.from({ length: 8 }, (_, i) => (
        <path key={i} d={`M${i * 210 + 30} 820 L${i * 210 + 30} 560 Q${i * 210 + 110} 470 ${i * 210 + 190} 560 L${i * 210 + 190} 820 Z`} fill="#8c8473" opacity={0.55} />
      ))}
      <rect y={820} width={1600} height={180} fill="url(#cc-floor)" />
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} d={`M${i * 200 + 230} 820 L${i * 200 + 300} 820 L${i * 200 + 340} 1000 L${i * 200 + 250} 1000 Z`} fill="#fff8e4" opacity={0.22} />
      ))}
      {/* columns, the board hangs between two of them */}
      {[690, 1530].map((x) => (
        <g key={x}>
          <rect x={x} y={158} width={30} height={662} fill="#4a6d5f" />
          <rect x={x + 20} y={158} width={10} height={662} fill="#2f4a40" />
        </g>
      ))}
      {/* the board's hangers */}
      <rect x={905} y={158} width={4} height={92} fill="#3e423f" />
      <rect x={1435} y={158} width={4} height={92} fill="#3e423f" />
      <g data-live={live ? "" : undefined}>
        {WALKERS.map((w, i) => (
          <g
            key={i}
            className={s.walker}
            style={
              {
                "--dur": `${w.dur}s`,
                "--delay": `${-w.delay}s`,
                "--from": w.dir > 0 ? "-80px" : "1680px",
                "--to": w.dir > 0 ? "1680px" : "-80px",
              } as CSSProperties
            }
          >
            <g transform={`translate(0 ${w.y}) scale(${w.dir} 1)`}>
              <Walker shirt={w.shirt} h={w.h} />
            </g>
          </g>
        ))}
      </g>
    </Paint>
  );
}

function Platform({ p }: { p: Project }) {
  const [ref, on] = useOnScreen<HTMLElement>("-15% 0px");
  const links = [
    p.live && { label: "Live", href: p.live },
    p.pypi && { label: "PyPI", href: p.pypi },
    p.github && { label: "Source", href: p.github },
    p.video && { label: "Demo video", href: p.video },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <article ref={ref} id={p.slug} className={s.platform} aria-labelledby={`${p.slug}-name`}>
      <div className={s.roof} aria-hidden="true">
        <span className={s.fan} />
      </div>
      <div className={s.text}>
        <div className={s.sign}>
          <h3 id={`${p.slug}-name`} className={s.signName}>
            {p.title}
          </h3>
        </div>
        <p className={s.kind}>
          {p.kind}, {p.year}
        </p>
        <p className={`h-voice ${s.headline}`}>{p.headline}</p>
        <p className="line">{p.line}</p>
        <ul className={s.facts}>
          {p.facts.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
        <p className={s.tech}>{p.tech.join(", ")}</p>
        {links.length > 0 && (
          <p className={s.links}>
            {links.map((l) => (
              <a key={l.label} className="tlink" href={l.href} target="_blank" rel="noreferrer">
                {l.label} <span aria-hidden="true">↗</span>
              </a>
            ))}
          </p>
        )}
        {p.liveNote && <p className={s.note}>{p.liveNote}</p>}
        {p.note && <p className={s.note}>{p.note}</p>}
      </div>
      <figure className={s.hoarding}>
        <div className={s.screen}>
          <ProjectMedia media={p.media} active={on} />
        </div>
      </figure>
      <div className={s.edge} aria-hidden="true" />
    </article>
  );
}

export function Station() {
  const [ref, live] = useLive<HTMLDivElement>();
  return (
    <section id="work" aria-label="Work">
      <div ref={ref} className={`scene ${s.concourse}`}>
        <div className="zone">
          <h2 className="h-voice">{WORK.title}</h2>
          <p className="line">{WORK.line}</p>
        </div>
        <Concourse live={live} />
        <Board />
      </div>
      {WORK.projects.map((p) => (
        <Platform key={p.slug} p={p} />
      ))}
    </section>
  );
}
