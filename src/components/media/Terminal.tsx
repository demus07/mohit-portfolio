"use client";

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { useReducedMotion } from "@/lib/hooks";
import { useReplay, type Sleep } from "./useReplay";
import s from "./Terminal.module.css";

type Tone = "fg" | "dim" | "purple" | "yellow" | "green" | "red";
type Seg = [text: string, tone?: Tone, bold?: boolean];

type Line =
  | { k: "cmd"; text: string; live: boolean }
  | { k: "out"; segs: Seg[] }
  | { k: "banner" }
  | { k: "scan"; at: number; done: boolean }
  | { k: "count"; n: number; done: boolean };

type Step =
  | { cmd: string }
  | { out: Seg[]; wait?: number }
  | { banner: true }
  | { scan: true }
  | { count: true };

const CACHES = [
  "Chrome Cache",
  "Deno Cache",
  "Python Cache",
  "Go Cache",
  "Spotify Cache",
  "npm Cache",
  "uv Cache",
  "Homebrew Cache",
];
const ITEMS = 101;
const FREED = 4.2;

const SCRIPT: Step[] = [
  { cmd: "pip install cachekaro" },
  { out: [["Collecting cachekaro", "dim"]], wait: 420 },
  { out: [["Successfully installed cachekaro-2.3.4", "dim"]], wait: 650 },
  { cmd: "cachekaro analyze" },
  { banner: true },
  { out: [["Platform: "], ["macOS", "purple"]], wait: 400 },
  { scan: true },
  { out: [["Total Cache Size: "], ["4.40 GB", "red", true]], wait: 260 },
  { out: [["Cleanable (Safe): "], ["4.20 GB", "green", true]], wait: 420 },
  { out: [["  1. Chrome Cache    "], ["  1.14 GB", "red"], [" [SAFE]", "green"]], wait: 170 },
  { out: [["  2. uv Cache        "], ["  1.01 GB", "red"], [" [SAFE]", "green"]], wait: 170 },
  { out: [["  3. npm Cache       "], ["929.46 MB", "red"], [" [SAFE]", "green"]], wait: 170 },
  { out: [["  4. Spotify Cache   "], ["324.99 MB", "red"], [" [SAFE]", "green"]], wait: 900 },
  { cmd: "cachekaro clean --dry-run" },
  { out: [["Mode: "], ["Dry Run", "yellow"], [" (no files will be deleted)", "dim"]], wait: 380 },
  { out: [["Found 101 items to clean"]], wait: 420 },
  { count: true },
  { out: [["[DRY RUN]", "yellow", true], [" Would have freed: "], ["4.20 GB", "green", true]], wait: 300 },
];

// A small block-letter face, drawn on a 4×5 grid and folded into half-block characters.
const GLYPHS: Record<string, string[]> = {
  C: [".###", "#...", "#...", "#...", ".###"],
  A: [".##.", "#..#", "####", "#..#", "#..#"],
  H: ["#..#", "#..#", "####", "#..#", "#..#"],
  E: ["####", "#...", "###.", "#...", "####"],
  K: ["#..#", "#.#.", "##..", "#.#.", "#..#"],
  R: ["###.", "#..#", "###.", "#.#.", "#..#"],
  O: [".##.", "#..#", "#..#", "#..#", ".##."],
};

function blockWord(word: string): string[] {
  return [0, 2, 4].map((r) =>
    [...word]
      .map((ch) => {
        const g = GLYPHS[ch];
        const top = g[r];
        const bot = g[r + 1] ?? "....";
        return [...top]
          .map((c, i) => {
            const a = c === "#";
            const b = bot[i] === "#";
            return a && b ? "█" : a ? "▀" : b ? "▄" : " ";
          })
          .join("");
      })
      .join(" "),
  );
}

const BANNER = blockWord("CACHEKARO");

const ease = (x: number) => 1 - Math.pow(1 - x, 3);
const jitter = (i: number) => 38 + ((i * 37) % 7) * 11;

function finalLines(): Line[] {
  const out: Line[] = [];
  for (const st of SCRIPT) {
    if ("cmd" in st) out.push({ k: "cmd", text: st.cmd, live: false });
    else if ("out" in st) out.push({ k: "out", segs: st.out });
    else if ("banner" in st) out.push({ k: "banner" });
    else if ("scan" in st) out.push({ k: "scan", at: CACHES.length, done: true });
    else out.push({ k: "count", n: ITEMS, done: true });
  }
  out.push({ k: "cmd", text: "", live: true });
  return out;
}

async function play(sleep: Sleep, setLines: Dispatch<SetStateAction<Line[]>>, setFade: (v: boolean) => void) {
  const push = (l: Line) => setLines((ls) => [...ls, l]);
  const patch = (l: Line) => setLines((ls) => [...ls.slice(0, -1), l]);

  await sleep(500);
  for (const st of SCRIPT) {
    if ("cmd" in st) {
      push({ k: "cmd", text: "", live: true });
      await sleep(620);
      for (let i = 1; i <= st.cmd.length; i++) {
        patch({ k: "cmd", text: st.cmd.slice(0, i), live: true });
        await sleep(jitter(i));
      }
      await sleep(380);
      patch({ k: "cmd", text: st.cmd, live: false });
      await sleep(260);
    } else if ("out" in st) {
      push({ k: "out", segs: st.out });
      await sleep(st.wait ?? 240);
    } else if ("banner" in st) {
      push({ k: "banner" });
      await sleep(700);
    } else if ("scan" in st) {
      push({ k: "scan", at: 0, done: false });
      for (let h = 1; h <= CACHES.length * 2; h++) {
        await sleep(150);
        patch({ k: "scan", at: h / 2, done: false });
      }
      await sleep(260);
      patch({ k: "scan", at: CACHES.length, done: true });
      await sleep(380);
    } else {
      push({ k: "count", n: 0, done: false });
      const frames = 24;
      for (let f = 1; f <= frames; f++) {
        await sleep(70);
        patch({ k: "count", n: Math.round(ITEMS * ease(f / frames)), done: false });
      }
      await sleep(240);
      patch({ k: "count", n: ITEMS, done: true });
      await sleep(300);
    }
  }
  push({ k: "cmd", text: "", live: true });
  await sleep(3200);
  setFade(true);
  await sleep(800);
  setLines([]);
  await sleep(650);
  setFade(false);
}

function bar(fill: number, width = 16) {
  const n = Math.round(fill * width);
  return "█".repeat(n) + "░".repeat(width - n);
}

function Row({ line }: { line: Line }) {
  switch (line.k) {
    case "cmd":
      return (
        <div className={s.line}>
          <span className={s.user}>mohit@macbook</span>
          <span className={s.dim}> ~ % </span>
          <span className={s.fg}>{line.text}</span>
          {line.live && <span className={s.caret} />}
        </div>
      );
    case "out":
      return (
        <div className={s.line}>
          {line.segs.map(([text, tone = "fg", bold], i) => (
            <span key={i} className={`${s[tone]} ${bold ? s.bold : ""}`}>
              {text}
            </span>
          ))}
        </div>
      );
    case "banner":
      return (
        <div className={`${s.line} ${s.bannerWrap}`}>
          <div className={s.banner}>
            {BANNER.map((row, i) => (
              <div key={i} className={s.bannerRow}>
                {row}
              </div>
            ))}
          </div>
          <div className={s.dim}>clear what is safe to clear · v2.3.4</div>
        </div>
      );
    case "scan": {
      const name = CACHES[Math.min(CACHES.length - 1, Math.floor(line.at))];
      return line.done ? (
        <div className={s.line}>
          <span className={s.green}>✓ </span>
          <span className={s.fg}>Scanned {CACHES.length} locations</span>
          <span className={s.dim}> in 2.6s</span>
        </div>
      ) : (
        <div className={s.line}>
          <span className={s.dim}>Scanning </span>
          <span className={s.purple}>{bar(line.at / CACHES.length)}</span>
          <span className={s.dim}> {String(Math.round((line.at / CACHES.length) * 100)).padStart(3)}% </span>
          <span className={s.fg}>{name}</span>
        </div>
      );
    }
    case "count": {
      const freed = (FREED * (line.n / ITEMS)).toFixed(2);
      return (
        <div className={s.line}>
          <span className={line.done ? s.green : s.yellow}>{line.done ? "✓ " : "› "}</span>
          <span className={s.dim}>Cleaning </span>
          <span className={s.fg}>
            [{String(line.n).padStart(3)}/{ITEMS}]
          </span>
          <span className={s.dim}> freed </span>
          <span className={s.green}>{freed} GB</span>
        </div>
      );
    }
  }
}

export function TerminalMedia({ active }: { active: boolean }) {
  const reduced = useReducedMotion();
  const [lines, setLines] = useState<Line[]>([]);
  const [fade, setFade] = useState(false);
  const screen = useRef<HTMLDivElement>(null);
  const buffer = useRef<HTMLDivElement>(null);

  useReplay(active, !reduced, (sleep) => play(sleep, setLines, setFade));

  // Keep the newest line on screen by gliding the whole buffer up, never jumping.
  useEffect(() => {
    const sc = screen.current;
    const buf = buffer.current;
    if (!sc || !buf) return;
    const fit = () => {
      const off = Math.max(0, buf.offsetHeight - sc.clientHeight);
      buf.style.transform = `translate3d(0, ${-off}px, 0)`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(sc);
    ro.observe(buf);
    return () => ro.disconnect();
  }, []);

  const shown = reduced ? finalLines() : lines;

  return (
    <div
      className={`${s.root} ${reduced ? s.still : ""} ${active ? "" : s.paused}`}
      role="img"
      aria-label="Terminal replay: installing Cache Karo, analysing 4.40 GB of caches on macOS and a dry-run clean that would free 4.20 GB"
    >
      <div className={s.window} aria-hidden="true">
        <div className={s.bar}>
          <span className={s.dots}>
            <i />
            <i />
            <i />
          </span>
          <span className={s.title}>mohit — zsh — cachekaro</span>
        </div>
        <div ref={screen} className={s.screen}>
          <div ref={buffer} className={s.buffer} style={{ opacity: fade ? 0 : 1 }}>
            {shown.map((line, i) => (
              <Row key={i} line={line} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
