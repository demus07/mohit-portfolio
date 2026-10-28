"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/hooks";
import { useReplay, type Sleep } from "./useReplay";
import s from "./Terminal.module.css";

const C = {
  white: "#eeeeee",
  gray: "#8a8a8a",
  purple: "#af87ff",
  yellow: "#ffd75f",
  green: "#87d787",
  red: "#ff6b6b",
};

const BANNER = [
  "░█████╗░░█████╗░░█████╗░██╗░░██╗███████╗██╗░░██╗░█████╗░██████╗░░█████╗░",
  "██╔══██╗██╔══██╗██╔══██╗██║░░██║██╔════╝██║░██╔╝██╔══██╗██╔══██╗██╔══██╗",
  "██║░░╚═╝███████║██║░░╚═╝███████║█████╗░░█████═╝░███████║██████╔╝██║░░██║",
  "██║░░██╗██╔══██║██║░░██╗██╔══██║██╔══╝░░██╔═██╗░██╔══██║██╔══██╗██║░░██║",
  "╚█████╔╝██║░░██║╚█████╔╝██║░░██║███████╗██║░╚██╗██║░░██║██║░░██║╚█████╔╝",
  "░╚════╝░╚═╝░░╚═╝░╚════╝░╚═╝░░╚═╝╚══════╝╚═╝░░╚═╝╚═╝░░╚═╝╚═╝░░╚═╝░╚════╝░",
].join("\n");

type Seg = [text: string, color?: string, bold?: boolean];

type Step =
  | { kind: "cmd"; text: string }
  | { kind: "out"; segs: Seg[]; pause?: number }
  | { kind: "banner" }
  | { kind: "progress"; names: string[] }
  | { kind: "counter"; total: number; sizes: number[] };

// A real `cachekaro` session, replayed.
const SCRIPT: Step[] = [
  { kind: "cmd", text: "pip install cachekaro" },
  { kind: "out", segs: [["Collecting cachekaro", C.gray]] },
  { kind: "out", segs: [["Successfully installed cachekaro-2.3.4", C.gray]], pause: 500 },
  { kind: "cmd", text: "cachekaro analyze" },
  { kind: "banner" },
  { kind: "out", segs: [["Platform: ", C.white], ["macOS", C.purple]] },
  {
    kind: "progress",
    names: [
      "Chrome Cache",
      "Deno Cache",
      "Python Cache",
      "Go Cache",
      "Spotify Cache",
      "npm Cache",
      "uv Cache",
      "Homebrew Cache",
    ],
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
  {
    kind: "counter",
    total: 101,
    sizes: [1.14, 2.15, 3.06, 3.37, 3.56, 3.73, 3.84, 3.94, 4.04, 4.1, 4.15, 4.18, 4.19, 4.2],
  },
  { kind: "out", segs: [["[DRY RUN]", C.yellow], [" Would have freed: "], ["4.20 GB", C.green, true]] },
];

type Row =
  | { kind: "gap" }
  | { kind: "empty" }
  | { kind: "cmd"; text: string }
  | { kind: "out"; segs: Seg[] }
  | { kind: "banner" }
  | { kind: "progress"; pct: number; name: string }
  | { kind: "counter"; done: number; total: number; size: number };
type Line = { key: number; row: Row };

const progressRow = (pct: number, names: string[]): Row => ({
  kind: "progress",
  pct,
  name: names[Math.min(names.length - 1, Math.floor((pct / 100) * names.length))],
});
const counterRow = (i: number, total: number, sizes: number[]): Row => ({
  kind: "counter",
  done: Math.round(((i + 1) / sizes.length) * total),
  total,
  size: sizes[i],
});

// The finished session, for the reduced-motion still.
const FINAL: Line[] = SCRIPT.flatMap((st): Row[] => {
  if (st.kind === "cmd") return [{ kind: "gap" }, { kind: "cmd", text: st.text }];
  if (st.kind === "out") return [{ kind: "out", segs: st.segs }];
  if (st.kind === "banner") return [{ kind: "banner" }];
  if (st.kind === "progress") return [progressRow(100, st.names)];
  return [counterRow(st.sizes.length - 1, st.total, st.sizes)];
}).map((row, key) => ({ key, row }));

type Setter<T> = (v: T | ((p: T) => T)) => void;

async function play(sleep: Sleep, setLines: Setter<Line[]>, setTyped: Setter<string | null>) {
  let key = 0;
  const push = (row: Row) => setLines((l) => [...l, { key: key++, row }]);
  const replace = (row: Row) => setLines((l) => [...l.slice(0, -1), { key: l[l.length - 1].key, row }]);

  setLines([]);
  for (const st of SCRIPT) {
    if (st.kind === "cmd") {
      push({ kind: "gap" });
      for (let i = 0; i <= st.text.length; i++) {
        setTyped(st.text.slice(0, i));
        await sleep(i === 0 ? 350 : 45 + 45 * Math.random());
      }
      await sleep(280);
      setTyped(null);
      push({ kind: "cmd", text: st.text });
    } else if (st.kind === "out") {
      push({ kind: "out", segs: st.segs });
      await sleep(st.pause ?? 110);
    } else if (st.kind === "banner") {
      push({ kind: "banner" });
      await sleep(260);
    } else if (st.kind === "progress") {
      push({ kind: "empty" });
      for (let pct = 0; pct <= 100; pct += 4) {
        replace(progressRow(pct, st.names));
        await sleep(55);
      }
      await sleep(200);
    } else {
      push({ kind: "empty" });
      for (let i = 0; i < st.sizes.length; i++) {
        replace(counterRow(i, st.total, st.sizes));
        await sleep(90);
      }
      await sleep(200);
    }
  }
  setTyped("");
  await sleep(3200);
  setTyped(null);
}

function Prompt() {
  return (
    <span className={s.noselect}>
      <span style={{ color: "#6fd6a8" }}>mohit@macbook</span>
      <span style={{ color: C.gray }}> ~ % </span>
    </span>
  );
}

function Segs({ segs }: { segs: Seg[] }) {
  return (
    <>
      {segs.map(([text, color, bold], i) => (
        <span key={i} style={{ color: color ?? "#c8c8c8", fontWeight: bold ? 700 : undefined }}>
          {text}
        </span>
      ))}
    </>
  );
}

function RowView({ row }: { row: Row }) {
  switch (row.kind) {
    case "gap":
      return <div className={s.gap} />;
    case "empty":
      return null;
    case "cmd":
      return (
        <div>
          <Prompt />
          <span className={s.typed}>{row.text}</span>
        </div>
      );
    case "out":
      return (
        <div>
          <Segs segs={row.segs} />
        </div>
      );
    case "banner":
      return (
        <pre className={s.banner} style={{ color: C.purple }}>
          {BANNER}
        </pre>
      );
    case "progress": {
      const filled = Math.round((row.pct / 100) * 20);
      return (
        <div className={s.pre}>
          <span style={{ color: C.purple }}>
            {"["}
            {"█".repeat(filled)}
            {"░".repeat(20 - filled)}
            {"]"}
          </span>
          <span style={{ color: C.white }}>
            {" "}
            {String(row.pct.toFixed(1)).padStart(5)}%
          </span>
          <span style={{ color: C.gray }}> {row.pct < 100 ? `Scanning: ${row.name}` : "Done"}</span>
        </div>
      );
    }
    case "counter":
      return (
        <div className={s.pre}>
          <span style={{ color: C.purple }}>
            [{row.done}/{row.total}]
          </span>
          <span style={{ color: C.green }}> Cleaned: {row.size.toFixed(2).padStart(6)} GB</span>
        </div>
      );
  }
}

export function TerminalMedia({ active }: { active: boolean }) {
  const reduced = useReducedMotion();
  const [lines, setLines] = useState<Line[]>([]);
  const [typed, setTyped] = useState<string | null>(null);
  const body = useRef<HTMLDivElement>(null);

  useReplay(active, !reduced, (sleep) => play(sleep, setLines, setTyped));

  const shown = reduced ? FINAL : lines;
  const prompt = reduced ? "" : typed;

  // Always pinned to the newest line.
  useEffect(() => {
    const el = body.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [shown, prompt]);

  return (
    <div
      className={`${s.root} ${active && !reduced ? "" : s.still}`}
      role="img"
      aria-label="Terminal replay: installing cachekaro, analysing 4.40 GB of caches and a dry-run clean that would free 4.20 GB"
    >
      <div className={s.bar} aria-hidden>
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <span key={c} className={s.dot} style={{ background: c }} />
        ))}
      </div>
      <div ref={body} className={s.body} aria-hidden>
        {shown.map((l) => (
          <div key={l.key}>
            <RowView row={l.row} />
          </div>
        ))}
        {prompt !== null && (
          <div className={s.pre}>
            <Prompt />
            <span className={s.typed}>{prompt}</span>
            <span className={s.cursor} />
          </div>
        )}
      </div>
    </div>
  );
}
