"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "@/lib/hooks";
import { useReplay, type Sleep } from "./useReplay";
import s from "./VeloType.module.css";

// Every size is designed on a 440px wide canvas and scales with the container width.
const u = (px: number) => `${+(px / 4.4).toFixed(3)}cqw`;

const ACCENT = "#8b5cf6";
const TEXT = "#d1d0e0";
const MUTED = "rgba(255,255,255,0.3)";
const ERROR = "#f87171";
const CARD = "#16161d";

const WORDS =
  "student take any start busy them suppose world party example heavy there bring introduce morning round poet within brain strip black this ring college sheet stream machine".split(
    " ",
  );
// What actually gets typed. "~" is a backspace: the ghost hits r in "them", deletes it and carries on.
const KEYS = "student take any start busy thr~em suppose world party example heavy there bring introduce morning round".split("");
// Live wpm shown on the counter, one value per half second.
const LIVE_WPM = [0, 84, 96, 103, 107, 110, 112, 111, 113, 115, 114, 114, 115, 114, 114];
const RAW_WPM = [104, 118, 112, 122, 125, 118, 120, 128, 124, 118, 126, 121, 116, 124, 118];
const WPM = [98, 112, 104, 118, 121, 109, 116, 124, 119, 113, 122, 117, 110, 120, 114];

type Phase = "idle" | "run" | "done";
type State = { phase: Phase; n: number; t: number; wpm: number };
const IDLE: State = { phase: "idle", n: 0, t: 15, wpm: 0 };
const DONE: State = { ...IDLE, phase: "done" };

const point = (v: number[], i: number) => [(i / (v.length - 1)) * 140, 100 - (v[i] / 150) * 100];
function curve(v: number[]) {
  let d = `M${point(v, 0)}`;
  for (let i = 1; i < v.length; i++) {
    const [x0, y0] = point(v, i - 1);
    const [x1, y1] = point(v, i);
    const mx = (x0 + x1) / 2;
    d += `C${mx},${y0} ${mx},${y1} ${x1},${y1}`;
  }
  return d;
}
const WPM_PATH = curve(WPM);
const RAW_PATH = curve(RAW_WPM);

// Replays the keys (with backspaces) into the list of typed words; the last entry is the word in progress.
function typedWords(n: number) {
  const out = [""];
  for (const k of KEYS.slice(0, n)) {
    if (k === " ") out.push("");
    else if (k === "~") out[out.length - 1] = out[out.length - 1].slice(0, -1);
    else out[out.length - 1] += k;
  }
  return out;
}

async function play(sleep: Sleep, set: (v: State | ((p: State) => State)) => void) {
  set(IDLE);
  await sleep(1500);
  // A 15s test, played at double speed: the counter ticks every 500ms and the run stops at 7.5s.
  let elapsed = 0;
  for (let n = 1; n <= KEYS.length; n++) {
    if (elapsed >= 7500) break;
    const r = Math.floor(elapsed / 500);
    set({ phase: "run", n, t: 15 - r, wpm: LIVE_WPM[r] });
    const next = KEYS[n];
    const ms =
      next === "~"
        ? 460
        : KEYS[n - 1] === "~"
          ? 170
          : next === " "
            ? 95 + 60 * Math.random()
            : 52 + 60 * Math.random();
    await sleep(ms);
    elapsed += ms;
  }
  set((p) => ({ ...p, phase: "done" }));
  await sleep(4800);
}

const show = (on: boolean, transform = ""): CSSProperties => ({
  opacity: on ? 1 : 0,
  transform,
  transition: "opacity 250ms ease, transform 300ms ease",
});

export function VeloTypeMedia({ active }: { active: boolean }) {
  const reduced = useReducedMotion();
  const [state, setState] = useState<State>(IDLE);
  const [rev, setRev] = useState(0);
  useReplay(active, !reduced, (sleep) => play(sleep, setState));

  const view = reduced ? DONE : state;
  const typed = typedWords(view.n);
  const cur = typed.length - 1;
  const running = view.phase === "run";
  const done = view.phase === "done";

  const flow = useRef<HTMLDivElement>(null);
  const caret = useRef<HTMLDivElement>(null);
  const wordEls = useRef<(HTMLSpanElement | null)[]>([]);
  const letterEls = useRef<(HTMLSpanElement | null)[]>([]);
  const track = useRef({ y: -1, line: 0 });

  // Re-measure when the box resizes or the font arrives.
  useEffect(() => {
    const bump = () => setRev((r) => r + 1);
    const ro = new ResizeObserver(bump);
    if (flow.current) ro.observe(flow.current);
    document.fonts?.ready.then(bump);
    return () => ro.disconnect();
  }, []);

  // Caret follows the last typed letter; the paragraph scrolls up a line at a time, never back down.
  useLayoutEffect(() => {
    const word = wordEls.current[cur];
    const box = flow.current;
    const c = caret.current;
    if (!word || !box || !c) return;
    const len = typed[cur].length;
    const last = letterEls.current[len - 1];
    const x = len !== 0 && last ? last.offsetLeft + last.offsetWidth : word.offsetLeft;
    const h = word.offsetHeight;
    const tr = track.current;
    tr.line = view.phase === "idle" ? 0 : Math.max(tr.line, Math.round(word.offsetTop / h));
    box.style.transition = running ? "transform 200ms cubic-bezier(0.25,0.1,0.25,1)" : "none";
    box.style.transform = `translateY(${-tr.line * h}px)`;
    c.style.transition =
      word.offsetTop !== tr.y || view.n === 0 ? "none" : "transform 100ms cubic-bezier(0.17,0.67,0.5,1)";
    c.style.transform = `translate3d(${x}px,${word.offsetTop}px,0)`;
    tr.y = word.offsetTop;
  });

  // Idle caret breathes while waiting for the first key.
  useEffect(() => {
    if (!active || reduced || view.phase !== "idle" || !caret.current) return;
    const a = caret.current.animate([{ opacity: 1 }, { opacity: 0.2 }, { opacity: 1 }], {
      duration: 1000,
      iterations: Infinity,
      easing: "ease-in-out",
    });
    return () => a.cancel();
  }, [active, reduced, view.phase]);

  return (
    <div
      className={s.root}
      style={{ background: "linear-gradient(180deg,#0f0f14,#13131c 50%,#0f0f14)", color: TEXT }}
      data-rev={rev}
      role="img"
      aria-label="VeloType: a 15 second typing test finishing at 114 wpm with 98% accuracy"
    >
      <div className={s.col} style={{ padding: `${u(12)} ${u(28)} 0` }}>
        <div className={s.head} style={show(!running)}>
          <pre
            aria-hidden
            className={s.logo}
            style={{
              fontSize: u(3.6),
              lineHeight: 1.15,
              backgroundImage: "linear-gradient(90deg,#8b5cf6,#c084fc,#818cf8,#a78bfa)",
            }}
          >
            {LOGO}
          </pre>
          <nav
            className={s.nav}
            style={{
              marginTop: u(8),
              padding: `${u(2)} ${u(8)}`,
              gap: u(1),
              borderRadius: u(11),
              background: "rgba(0,0,0,0.5)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: MUTED,
            }}
          >
            {["Mode", "Options", "Settings"].map((label) => (
              <span
                key={label}
                className={s.navItem}
                style={{ fontSize: u(11), fontWeight: 500, padding: `${u(4)} ${u(7)}`, gap: u(3) }}
              >
                {label}
                <Icon d="M9 6l6 6-6 6" size={7} />
              </span>
            ))}
            <Divider />
            <Icon d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0118.8-4.3M22 12.5a10 10 0 01-18.8 4.2" />
            <Icon d="M11 5L6 9H2v6h4l5 4zM15.5 8.5a5 5 0 010 7" />
            <Divider />
            <Icon d="M12 2a10 10 0 100 20 10 10 0 000-20zM12 6v6l4 2" />
            <Icon d="M12 7a5 5 0 100 10 5 5 0 000-10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
          </nav>
          <div style={{ marginTop: u(7), fontSize: u(10.5), letterSpacing: "0.05em", color: MUTED }}>
            <span style={{ color: ACCENT }}>time</span>
            {["15s", "english", "medium"].map((m) => (
              <span key={m}>
                <span style={{ margin: `0 ${u(6)}`, opacity: 0.3 }}>/</span>
                {m}
              </span>
            ))}
          </div>
        </div>

        <div className={s.rel} style={{ marginTop: u(10), height: u(170) }}>
          <div className={s.fill} style={show(!done)}>
            <div className={s.stats} style={{ height: u(26), gap: u(12), ...show(running) }}>
              <span style={{ fontSize: u(19), fontWeight: 600, color: ACCENT, lineHeight: 1 }}>{view.t}</span>
              <span style={{ fontSize: u(11), color: MUTED, opacity: view.wpm ? 1 : 0 }}>{view.wpm} wpm</span>
            </div>
            <div className={s.clip} style={{ fontSize: u(15.5), height: `${2.07 * 3}em` }}>
              <div ref={flow} className={s.flow} style={{ lineHeight: 2.07, columnGap: "0.5em" }}>
                <div
                  ref={caret}
                  className={s.caret}
                  style={{
                    width: u(2.3),
                    height: "1.3em",
                    marginTop: `${(2.07 - 1.3) / 2}em`,
                    borderRadius: 2,
                    background: ACCENT,
                    boxShadow: `0 0 ${u(7)} ${ACCENT}`,
                  }}
                />
                {WORDS.map((word, wi) =>
                  wi === cur ? (
                    <span key={wi} ref={(el) => void (wordEls.current[wi] = el)}>
                      {word.split("").map((ch, ci) => {
                        const got = typed[cur][ci];
                        return (
                          <span
                            key={ci}
                            ref={(el) => void (letterEls.current[ci] = el)}
                            style={{ color: got === undefined ? MUTED : got === ch ? TEXT : ERROR }}
                          >
                            {ch}
                          </span>
                        );
                      })}
                    </span>
                  ) : (
                    <span
                      key={wi}
                      ref={(el) => void (wordEls.current[wi] = el)}
                      style={{ color: wi < cur ? TEXT : MUTED }}
                    >
                      {word}
                    </span>
                  ),
                )}
              </div>
            </div>
            <div
              className={s.center}
              style={{
                marginTop: u(12),
                fontSize: u(10),
                letterSpacing: "0.05em",
                color: "rgba(255,255,255,0.25)",
                ...show(!running),
              }}
            >
              <kbd
                style={{
                  padding: `${u(1)} ${u(5)}`,
                  borderRadius: u(3),
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                esc
              </kbd>
              <span style={{ marginLeft: u(6) }}>- restart test</span>
            </div>
          </div>
          <div className={s.top} style={show(done, done ? "none" : `translateY(${u(8)})`)}>
            <Result play={done} still={reduced} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Result({ play, still }: { play: boolean; still: boolean }) {
  const grad = useId();
  const label: CSSProperties = {
    fontSize: u(10),
    lineHeight: 1,
    letterSpacing: "0.18em",
    color: MUTED,
    textTransform: "uppercase",
  };
  const big: CSSProperties = { fontSize: u(25), fontWeight: 700, lineHeight: 1, color: ACCENT };
  const card: CSSProperties = { background: CARD, border: "1px solid rgba(255,255,255,0.06)", borderRadius: u(10) };

  return (
    <>
      <div className={s.card} style={{ ...card, padding: `${u(10)} ${u(12)}`, gap: u(12) }}>
        <div className={s.bigs} style={{ gap: u(10), width: u(72) }}>
          {[
            ["wpm", "114"],
            ["acc", "98%"],
          ].map(([k, v]) => (
            <div key={k}>
              <div style={{ ...label, marginBottom: u(5) }}>{k}</div>
              <div style={big}>{v}</div>
            </div>
          ))}
        </div>
        <div className={s.plot} style={{ height: u(76), gap: u(5) }}>
          <div className={s.axis} style={{ fontSize: u(10), color: MUTED, lineHeight: 1, margin: `${u(-4)} 0` }}>
            {[150, 100, 50, 0].map((v) => (
              <span key={v}>{v}</span>
            ))}
          </div>
          <div className={s.chart}>
            <svg viewBox="0 0 140 100" preserveAspectRatio="none" className={s.svg}>
              <defs>
                <linearGradient id={grad} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ACCENT} stopOpacity={0.18} />
                  <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
                </linearGradient>
              </defs>
              <path
                d="M0 0H140M0 33.3H140M0 66.7H140M0 100H140"
                stroke="rgba(255,255,255,0.05)"
                vectorEffect="non-scaling-stroke"
              />
              <path d={`${WPM_PATH}L140,100L0,100Z`} fill={`url(#${grad})`} />
              <path
                d={RAW_PATH}
                fill="none"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth={1.2}
                strokeDasharray="3 3"
                vectorEffect="non-scaling-stroke"
              />
              <path d={WPM_PATH} fill="none" stroke={ACCENT} strokeWidth={1.8} vectorEffect="non-scaling-stroke" />
            </svg>
            <span
              className={s.miss}
              style={{ left: `${(4 / 14) * 100}%`, top: u(-7), fontSize: u(11), color: ERROR }}
            >
              x
            </span>
            {/* A card-coloured cover that wipes away to draw the chart left to right. */}
            <div
              className={s.wipe}
              style={{
                inset: `${u(-8)} ${u(-2)} ${u(-2)} ${u(-2)}`,
                background: CARD,
                transform: `scaleX(${play ? 0 : 1})`,
                transition: play && !still ? "transform 1100ms cubic-bezier(0.3,0.6,0.3,1) 250ms" : "none",
              }}
            />
          </div>
        </div>
      </div>
      <div className={s.grid} style={{ marginTop: u(8), gap: u(8) }}>
        {[
          ["test type", "time 15s"],
          ["raw wpm", "118"],
          ["consistency", "92%"],
          ["time", "15s"],
        ].map(([k, v]) => (
          <div key={k} style={{ ...card, padding: `${u(6)} ${u(4)}`, lineHeight: 1.25 }}>
            <div style={{ ...label, fontSize: u(9.5), letterSpacing: "0.1em", fontWeight: 600, whiteSpace: "nowrap" }}>
              {k}
            </div>
            <div style={{ marginTop: u(2), fontSize: u(13), fontWeight: 600, color: k === "test type" ? ACCENT : TEXT }}>
              {v}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function Icon({ d, size = 12 }: { d: string; size?: number }) {
  const big = size > 10;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: u(size), height: u(size), margin: big ? `0 ${u(5)}` : undefined, opacity: big ? 1 : 0.4 }}
    >
      <path d={d} />
    </svg>
  );
}

function Divider() {
  return <span style={{ width: 1, height: u(14), margin: `0 ${u(3)}`, background: "rgba(255,255,255,0.08)" }} />;
}

const LOGO = [
  "██╗   ██╗███████╗██╗      ██████╗ ████████╗██╗   ██╗██████╗ ███████╗",
  "██║   ██║██╔════╝██║     ██╔═══██╗╚══██╔══╝╚██╗ ██╔╝██╔══██╗██╔════╝",
  "██║   ██║█████╗  ██║     ██║   ██║   ██║    ╚████╔╝ ██████╔╝█████╗",
  "╚██╗ ██╔╝██╔══╝  ██║     ██║   ██║   ██║     ╚██╔╝  ██╔═══╝ ██╔══╝",
  " ╚████╔╝ ███████╗███████╗╚██████╔╝   ██║      ██║   ██║     ███████╗",
  "  ╚═══╝  ╚══════╝╚══════╝ ╚═════╝    ╚═╝      ╚═╝   ╚═╝     ╚══════╝",
].join("\n");
