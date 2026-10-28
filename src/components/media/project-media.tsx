"use client";

import { useEffect, useRef, useState } from "react";
import type { Media } from "./types";
import { IllustrationTag } from "./illustrations/tag";
import { LazyIllustration } from "./illustrations";

/** Renders a project's visual. `active` starts playback (video, terminal). */
export function ProjectMedia({ media, active }: { media: Media; active: boolean }) {
  switch (media.kind) {
    case "video":
      return <Clip src={media.src} poster={media.poster} alt={media.alt} active={active} />;
    case "terminal":
      return <TerminalReplay active={active} />;
    case "illustration":
      return <LazyIllustration name={media.name} active={active} />;
  }
}

function Clip({ src, poster, alt, active }: { src: string; poster: string; alt: string; active: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (!active) {
      v.pause();
      return;
    }
    // start (or restart) the download if nothing has arrived yet, then play;
    // if the network stalls, reload once instead of sitting on the poster
    if (v.readyState === 0) v.load();
    const play = () => void v.play().catch(() => {});
    play();
    const retry = setTimeout(() => {
      if (v.readyState < 2) {
        v.load();
        play();
      }
    }, 3000);
    return () => clearTimeout(retry);
  }, [active]);
  return (
    // framed like the illustrations: a capture window with a title bar, so real
    // footage reads as a deliberate panel rather than a bare video
    <div className="absolute inset-0 flex flex-col bg-[#0b0d0c]">
      <div className="flex shrink-0 items-center gap-2 border-b border-white/5 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[#8a8f8b]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#ff4d4d]" />
        Meta Quest · Space Shuttle VR
      </div>
      <div className="relative m-2 mt-2 min-h-0 flex-1 overflow-hidden rounded-[3px] bg-black">
        <video
          ref={ref}
          src={src}
          poster={poster}
          aria-label={alt}
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
      <IllustrationTag label="Live video" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Cache Karo terminal replay                                         */
/*  Replays a real session: output, sizes and colours were captured    */
/*  from `cachekaro analyze` and `cachekaro clean --dry-run` (v2.3.4,  */
/*  macOS). Colours are the CLI's own xterm-256 palette.               */
/* ------------------------------------------------------------------ */
const C = {
  white: "#eeeeee",
  gray: "#8a8a8a",
  purple: "#af87ff",
  yellow: "#ffd75f",
  green: "#87d787",
  red: "#ff6b6b",
  cyan: "#87d7d7",
};

type Seg = [text: string, color?: string, bold?: boolean];
type Step =
  | { kind: "cmd"; text: string }
  | { kind: "out"; segs: Seg[]; pause?: number }
  | { kind: "banner" }
  | { kind: "progress"; names: string[] }
  | { kind: "counter"; total: number; sizes: number[] };

const BANNER = [
  "░█████╗░░█████╗░░█████╗░██╗░░██╗███████╗██╗░░██╗░█████╗░██████╗░░█████╗░",
  "██╔══██╗██╔══██╗██╔══██╗██║░░██║██╔════╝██║░██╔╝██╔══██╗██╔══██╗██╔══██╗",
  "██║░░╚═╝███████║██║░░╚═╝███████║█████╗░░█████═╝░███████║██████╔╝██║░░██║",
  "██║░░██╗██╔══██║██║░░██╗██╔══██║██╔══╝░░██╔═██╗░██╔══██║██╔══██╗██║░░██║",
  "╚█████╔╝██║░░██║╚█████╔╝██║░░██║███████╗██║░╚██╗██║░░██║██║░░██║╚█████╔╝",
  "░╚════╝░╚═╝░░╚═╝░╚════╝░╚═╝░░╚═╝╚══════╝╚═╝░░╚═╝╚═╝░░╚═╝╚═╝░░╚═╝░╚════╝░",
];

const SCRIPT: Step[] = [
  { kind: "cmd", text: "pip install cachekaro" },
  { kind: "out", segs: [["Collecting cachekaro", C.gray]] },
  { kind: "out", segs: [["Successfully installed cachekaro-2.3.4", C.gray]], pause: 500 },
  { kind: "cmd", text: "cachekaro analyze" },
  { kind: "banner" },
  { kind: "out", segs: [["Platform: ", C.white], ["macOS", C.purple]] },
  {
    kind: "progress",
    names: ["Chrome Cache", "Deno Cache", "Python Cache", "Go Cache", "Spotify Cache", "npm Cache", "uv Cache", "Homebrew Cache"],
  },
  { kind: "out", segs: [["Total Cache Size: "], ["4.40 GB", C.red]] },
  { kind: "out", segs: [["Cleanable (Safe): "], ["4.20 GB", C.green]] },
  { kind: "out", segs: [["  1. Chrome Cache      "], ["1.14 GB", C.red], [" [SAFE]", C.green]] },
  { kind: "out", segs: [["  2. uv Cache          "], ["1.01 GB", C.red], [" [SAFE]", C.green]] },
  { kind: "out", segs: [["  3. npm Cache       "], ["929.46 MB", C.red], [" [SAFE]", C.green]] },
  { kind: "out", segs: [["  4. Spotify Cache   "], ["324.99 MB", C.red], [" [SAFE]", C.green]], pause: 700 },
  { kind: "cmd", text: "cachekaro clean --dry-run" },
  { kind: "out", segs: [["Mode: ", C.white], ["Dry Run", C.yellow], [" (no files will be deleted)", C.gray]] },
  { kind: "out", segs: [["Found 101 items to clean", C.white]] },
  { kind: "counter", total: 101, sizes: [1.14, 2.15, 3.06, 3.37, 3.56, 3.73, 3.84, 3.94, 4.04, 4.1, 4.15, 4.18, 4.19, 4.2] },
  { kind: "out", segs: [["[DRY RUN]", C.yellow], [" Would have freed: "], ["4.20 GB", C.green, true]] },
];

type Line = { key: number; node: React.ReactNode };

function Prompt() {
  return (
    <span className="select-none">
      <span style={{ color: "#6fd6a8" }}>mohit@macbook</span>
      <span style={{ color: C.gray }}> ~ % </span>
    </span>
  );
}

function Segs({ segs }: { segs: Seg[] }) {
  return (
    <>
      {segs.map(([t, color, bold], i) => (
        <span key={i} style={{ color: color ?? "#c8c8c8", fontWeight: bold ? 700 : undefined }}>
          {t}
        </span>
      ))}
    </>
  );
}

function TerminalReplay({ active }: { active: boolean }) {
  const [lines, setLines] = useState<Line[]>([]);
  const [typing, setTyping] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, typing]);

  useEffect(() => {
    if (!active) {
      setLines([]);
      setTyping(null);
      return;
    }
    let cancelled = false;
    let key = 0;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const push = (node: React.ReactNode) => setLines((l) => [...l, { key: key++, node }]);
    const replaceLast = (node: React.ReactNode) =>
      setLines((l) => [...l.slice(0, -1), { key: l[l.length - 1].key, node }]);

    (async () => {
      while (!cancelled) {
        setLines([]);
        key = 0;
        for (const step of SCRIPT) {
          if (cancelled) return;
          if (step.kind === "cmd") {
            push(<div className="h-2" />); // breathing room before each command
            for (let i = 0; i <= step.text.length && !cancelled; i++) {
              setTyping(step.text.slice(0, i));
              await wait(i === 0 ? 350 : 45 + Math.random() * 45);
            }
            await wait(280);
            setTyping(null);
            push(
              <div>
                <Prompt />
                <span className="font-semibold text-white">{step.text}</span>
              </div>
            );
          } else if (step.kind === "out") {
            push(
              <div>
                <Segs segs={step.segs} />
              </div>
            );
            await wait(step.pause ?? 110);
          } else if (step.kind === "banner") {
            push(
              <pre className="my-1 text-[4.6px] font-bold leading-[1.05] md:text-[5.2px]" style={{ color: C.purple }}>
                {BANNER.join("\n")}
              </pre>
            );
            await wait(260);
          } else if (step.kind === "progress") {
            push(null);
            for (let p = 0; p <= 100 && !cancelled; p += 4) {
              const filled = Math.round((p / 100) * 20);
              const name = step.names[Math.min(step.names.length - 1, Math.floor((p / 100) * step.names.length))];
              replaceLast(
                <div className="whitespace-pre">
                  <span style={{ color: C.purple }}>[{"█".repeat(filled)}{"░".repeat(20 - filled)}]</span>
                  <span style={{ color: C.white }}> {String(p.toFixed(1)).padStart(5)}%</span>
                  <span style={{ color: C.gray }}> {p < 100 ? `Scanning: ${name}` : "Done"}</span>
                </div>
              );
              await wait(55);
            }
            await wait(200);
          } else if (step.kind === "counter") {
            push(null);
            const n = step.sizes.length;
            for (let i = 0; i < n && !cancelled; i++) {
              const done = Math.round(((i + 1) / n) * step.total);
              replaceLast(
                <div className="whitespace-pre">
                  <span style={{ color: C.purple }}>
                    [{done}/{step.total}]
                  </span>
                  <span style={{ color: C.green }}> Cleaned: {step.sizes[i].toFixed(2).padStart(6)} GB</span>
                </div>
              );
              await wait(90);
            }
            await wait(200);
          }
        }
        setTyping(""); // idle prompt, like a finished session
        await wait(3200);
        setTyping(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [active]);

  return (
    <div className="absolute inset-0 flex flex-col bg-[#0b0d0c] font-mono text-[10.5px] leading-[1.6] md:text-[11px]">
      <IllustrationTag />
      <div className="flex shrink-0 items-center gap-1.5 border-b border-white/5 px-3 py-2">
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <span key={c} className="h-2 w-2 rounded-full" style={{ background: c }} />
        ))}
        <span className="ml-2 text-[10px] uppercase tracking-[0.1em] text-[#5d625f]">zsh · real output</span>
      </div>
      {/* starts at the top like a real terminal, then follows the newest line */}
      <div ref={scroller} className="min-h-0 flex-1 overflow-hidden px-3 pb-2.5 pt-1.5">
        {lines.map((l) => (
          <div key={l.key}>{l.node}</div>
        ))}
        {active && typing !== null && (
          <div className="whitespace-pre">
            <Prompt />
            <span className="font-semibold text-white">{typing ?? ""}</span>
            <span className="ml-px inline-block h-[1.1em] w-[0.55em] translate-y-[2px] bg-[#eeeeee] [animation:blink_1s_steps(1)_infinite]" />
          </div>
        )}
      </div>
    </div>
  );
}
